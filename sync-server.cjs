/**
 * ConfirmPro - Google Sheets Sync + API Server
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ============================================================
// ✏️  إعدادات Sheet ديالك
// ============================================================
const PRODUCTS = [
  {
    name: 'NutriSlim',
    sheetId: '1ushwVuzIDhfKzPVOUr_rfZOCd4n7MmH0X26Ukh-viFU',
    sheetName: 'Sheet1',
    range: 'A2:K',
    productId: 'p1',
    teamType: 'whatsapp',
    columnMap: {
      orderTime: 0,    // A: Order Time
      name: 1,         // B: Client Name
      phone: 2,        // C: Phone Number
      city: 3,         // D: City
      address: 4,      // E: Address
      pack: 5,         // F: Pack
      wtsStatus: 6,    // G: Order WTS Statut
      finalStatus: 7,  // H: Order Final Statut
      product: 8,      // I: Product
      source: 9,       // J: Source
      price: 10,       // K: Price
    }
  },
];

const AGENTS = {
  whatsapp: ['wa1', 'wa2', 'wa3'],
  appel: ['ap1', 'ap2'],
};

const SYNC_INTERVAL = 5 * 60 * 1000;
const PORT = 3001;

// ============================================================
// تحت هاد السطر لا تعدل والو
// ============================================================

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PROCESSED_FILE = path.join(DATA_DIR, 'processed.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let rrWA = 0, rrAP = 0;
const rrData = loadJSON(SETTINGS_FILE, { rrWA: 0, rrAP: 0 });
rrWA = rrData.rrWA || 0;
rrAP = rrData.rrAP || 0;

function assignAgent(teamType) {
  if (teamType === 'appel') {
    const agent = AGENTS.appel[rrAP % AGENTS.appel.length];
    rrAP++;
    saveJSON(SETTINGS_FILE, { rrWA, rrAP });
    return { assignedTo: agent, teamType: 'appel' };
  } else {
    const agent = AGENTS.whatsapp[rrWA % AGENTS.whatsapp.length];
    rrWA++;
    saveJSON(SETTINGS_FILE, { rrWA, rrAP });
    return { assignedTo: agent, teamType: 'whatsapp' };
  }
}

// ===== Google Auth (طريقة جديدة بخط المباشر) =====
async function getSheetsClient() {
  const credPath = path.join(__dirname, 'credentials.json');
  
  if (!fs.existsSync(credPath)) {
    console.error('');
    console.error('❌ مالقيتش credentials.json!');
    console.error('   راه محطو في: ' + credPath);
    console.error('');
    return null;
  }

  try {
    console.log(`  📂 Reading: ${credPath}`);

    // أبسط طريقة: نعطيو المسار ديال الملف مباشرة
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    console.log(`  🔑 Project: ${projectId}`);

    return google.sheets({ version: 'v4', auth: client });
  } catch (e) {
    console.error('  ❌ خطأ في Auth:', e.message);
    return null;
  }
}

function mapSheetStatus(wtsStatus, finalStatus) {
  const s = (finalStatus || wtsStatus || '').toLowerCase().trim();
  if (s === 'confirmed' || s === 'confirmé') return 'confirmé';
  if (s === 'cancelled' || s === 'annulé') return 'annulé';
  if (s === 'pending') return 'pending';
  if (s === 'suivi' || s === 'follow up') return 'suivi';
  if (s === 'livré' || s === 'delivered') return 'livré';
  if (s === 'pas intéressé' || s === 'not interested') return 'pas_intéressé';
  return 'pending';
}

// ===== Sync =====
async function sync() {
  const now = new Date().toLocaleString('fr-FR');
  console.log(`\n🔄 Sync في ${now}`);
  console.log('─'.repeat(50));

  const processed = loadJSON(PROCESSED_FILE, []);
  const processedSet = new Set(processed);
  let orders = loadJSON(ORDERS_FILE, []);
  let newCount = 0;
  let skipCount = 0;

  const sheets = await getSheetsClient();
  if (!sheets) {
    console.log('  ⛔ ما قدرنش نربط مع Google Sheets');
    return;
  }

  for (const product of PRODUCTS) {
    try {
      const fullRange = `'${product.sheetName}'!${product.range}`;
      console.log(`  📄 جاري قراءة: ${fullRange}`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: product.sheetId,
        range: fullRange,
      });
      
      const rows = response.data.values || [];
      console.log(`  📄 ${product.name}: ${rows.length} صف(وف) في Sheet`);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 3) { skipCount++; continue; }

        const clientName = (row[product.columnMap.name] || '').trim();
        const clientPhone = String(row[product.columnMap.phone] || '').trim();

        if (!clientName && !clientPhone) { skipCount++; continue; }
        if (clientPhone.length < 8) { skipCount++; continue; }

        const rowId = `${product.sheetId}_row${i + 2}`;
        if (processedSet.has(rowId)) continue;

        const cityName = (row[product.columnMap.city] || '').trim();
        const addressName = (row[product.columnMap.address] || '').trim();
        const packName = (row[product.columnMap.pack] || '').trim();
        const wtsStatus = (row[product.columnMap.wtsStatus] || '').trim();
        const finalStatus = (row[product.columnMap.finalStatus] || '').trim();
        const orderTime = (row[product.columnMap.orderTime] || '').trim();
        const price = (row[product.columnMap.price] || '').trim();
        const source = (row[product.columnMap.source] || '').trim();

        const { assignedTo, teamType } = assignAgent(product.teamType);
        const orderNum = 1000 + orders.length;
        const status = mapSheetStatus(wtsStatus, finalStatus);

        const newOrder = {
          id: `ORD-${String(orderNum).padStart(4, '0')}`,
          clientName: clientName || 'Client',
          clientPhone,
          city: cityName || 'Non spécifiée',
          address: addressName || cityName || '',
          productId: product.productId,
          packName,
          status,
          assignedTo,
          teamType,
          createdAt: orderTime ? new Date(orderTime).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: [],
          isBlacklisted: false,
          isRecurringClient: false,
          source: source || 'google_sheet',
          sheetRowId: rowId,
          price: price ? Number(price) : undefined,
          productName: product.name,
        };

        orders.unshift(newOrder);
        processedSet.add(rowId);
        newCount++;

        console.log(`  ✅ ${newOrder.id}: ${clientName} | ${clientPhone} | ${cityName} | ${packName || '-'} → ${assignedTo}`);
      }
    } catch (err) {
      console.error(`  ❌ خطأ: ${err.message}`);
      if (err.message.includes('403') || err.message.includes('permission')) {
        console.error('');
        console.error('  💡 حل:');
        console.error('  شاركي Sheet مع هاد الإيميل:');
        console.error('  confirmpro-sync@confirmation-498417.iam.gserviceaccount.com');
        console.error('');
      }
      if (err.message.includes('Unable to parse range')) {
        console.error(`  💡 إسم التبويب مخالف! إفتح Sheet وشوف السمية تحت اليسار`);
        console.error(`  وبدلها في sync-server.cjs في sheetName`);
      }
    }
  }

  saveJSON(ORDERS_FILE, orders);
  saveJSON(PROCESSED_FILE, [...processedSet]);

  console.log('');
  if (newCount > 0) console.log(`  🎉 ${newCount} طلب(ات) جداد!`);
  else console.log('  ℹ️  لا شيء جديد');
  if (skipCount > 0) console.log(`  ⏭️  ${skipCount} صف تخطيين (فارغين)`);
  console.log(`  📊 المجموع: ${orders.length} طلب`);
  console.log('─'.repeat(50));
}

// ===== API SERVER =====
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/orders' && req.method === 'GET') {
    const orders = loadJSON(ORDERS_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders));
    return;
  }

  const statusMatch = url.pathname.match(/^\/api\/orders\/(.+)\/status$/);
  if (statusMatch && req.method === 'PATCH') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { status, note } = JSON.parse(body);
        const orderId = statusMatch[1];
        const orders = loadJSON(ORDERS_FILE, []);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx >= 0) {
          orders[idx].status = status;
          orders[idx].updatedAt = new Date().toISOString();
          if (note) orders[idx].notes.push({ id: `n${Date.now()}`, text: note, addedBy: 'api', addedAt: new Date().toISOString() });
          saveJSON(ORDERS_FILE, orders);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, order: orders[idx] }));
        } else { res.writeHead(404); res.end(JSON.stringify({ error: 'Order not found' })); }
      } catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
    });
    return;
  }

  if (url.pathname === '/api/sync' && req.method === 'POST') {
    sync().then(() => {
      const orders = loadJSON(ORDERS_FILE, []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, total: orders.length }));
    });
    return;
  }

  if (url.pathname === '/api/status' && req.method === 'GET') {
    const orders = loadJSON(ORDERS_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      products: PRODUCTS.length,
      totalOrders: orders.length,
      lastSync: new Date().toISOString(),
    }));
    return;
  }

  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(htmlPath) && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(htmlPath));
  } else if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>🚀 ConfirmPro</h1><p>شغّل <code>npm run build</code></p><p><a href="/api/orders">Orders API</a></p>');
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

// ===== START =====
async function start() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🚀 ConfirmPro - Sync + API Server              ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  📦 المنتج: NutriSlim`);
  console.log(`  ⏱️  Sync كل ${SYNC_INTERVAL / 60000} دقايق`);
  console.log('');

  await sync();
  setInterval(sync, SYNC_INTERVAL);

  server.listen(PORT, () => {
    console.log(`  ✅ السيرفر خدّام: http://localhost:${PORT}`);
    console.log('');
  });
}

start();

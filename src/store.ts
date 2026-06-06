import { create } from 'zustand';
import {
  User, Product, Order, Client, Commission, OrderHistoryEntry,
  WhatsAppTemplate, CallScript, Objection, Notification, BlacklistEntry,
  AppSettings, OrderStatus, AutoCommandHistoryEntry, OrderNote
} from './types';

function generateId() { return Math.random().toString(36).substring(2, 10); }
function daysAgo(d: number) { return new Date(Date.now() - d * 86400000).toISOString(); }
function hoursAgo(h: number) { return new Date(Date.now() - h * 3600000).toISOString(); }

const mockUsers: User[] = [
  { id: 'admin1', name: 'Youssef Admin', email: 'admin@confirmpro.ma', role: 'admin', isActive: true, dailyGoal: 0, streakDays: 0, lastActiveDate: new Date().toISOString(), performanceScore: 0, totalCommissionEarned: 0, totalCommissionPaid: 0, bonusThreshold: 0, bonusAmount: 0, workingHoursStart: '09:00', workingHoursEnd: '18:00' },
  { id: 'wa1', name: 'Fatima Zahra', email: 'fatima@confirmpro.ma', role: 'confirmatrice_whatsapp', isActive: true, dailyGoal: 30, streakDays: 5, lastActiveDate: new Date().toISOString(), performanceScore: 87, totalCommissionEarned: 2400, totalCommissionPaid: 1800, bonusThreshold: 50, bonusAmount: 200, workingHoursStart: '09:00', workingHoursEnd: '17:00' },
  { id: 'wa2', name: 'Khadija B.', email: 'khadija@confirmpro.ma', role: 'confirmatrice_whatsapp', isActive: true, dailyGoal: 30, streakDays: 3, lastActiveDate: daysAgo(0), performanceScore: 72, totalCommissionEarned: 1800, totalCommissionPaid: 1200, bonusThreshold: 50, bonusAmount: 200, workingHoursStart: '09:00', workingHoursEnd: '17:00' },
  { id: 'wa3', name: 'Salma R.', email: 'salma@confirmpro.ma', role: 'confirmatrice_whatsapp', isActive: true, dailyGoal: 25, streakDays: 7, lastActiveDate: daysAgo(0), performanceScore: 95, totalCommissionEarned: 3200, totalCommissionPaid: 2600, bonusThreshold: 50, bonusAmount: 200, workingHoursStart: '10:00', workingHoursEnd: '18:00' },
  { id: 'ap1', name: 'Amina K.', email: 'amina@confirmpro.ma', role: 'confirmatrice_appel', isActive: true, dailyGoal: 25, streakDays: 4, lastActiveDate: daysAgo(0), performanceScore: 81, totalCommissionEarned: 2100, totalCommissionPaid: 1500, bonusThreshold: 40, bonusAmount: 150, workingHoursStart: '09:00', workingHoursEnd: '17:00' },
  { id: 'ap2', name: 'Nadia M.', email: 'nadia@confirmpro.ma', role: 'confirmatrice_appel', isActive: true, dailyGoal: 25, streakDays: 2, lastActiveDate: daysAgo(0), performanceScore: 65, totalCommissionEarned: 1400, totalCommissionPaid: 900, bonusThreshold: 40, bonusAmount: 150, workingHoursStart: '09:00', workingHoursEnd: '17:00' },
];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Crème Anti-Âge', price: 299, baseCommission: 25, googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example1', teamType: 'whatsapp', assignedAgents: ['wa1', 'wa2', 'wa3'], isActive: true, createdAt: daysAgo(30), variants: [
    { id: 'v1', productId: 'p1', name: 'Crème seule', price: 299, commission: 25, description: 'Un pot de crème anti-âge' },
    { id: 'v2', productId: 'p1', name: 'Pack Crème + Sérum', price: 449, commission: 40, description: 'Crème anti-âge + Sérum vitaminé' },
    { id: 'v3', productId: 'p1', name: 'Pack Complet', price: 599, commission: 55, description: 'Crème + Sérum + Contour des yeux' },
  ]},
  { id: 'p2', name: 'Sérum Vitamine C', price: 199, baseCommission: 18, googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example2', teamType: 'appel', assignedAgents: ['ap1', 'ap2'], isActive: true, createdAt: daysAgo(25), variants: [
    { id: 'v4', productId: 'p2', name: 'Sérum 30ml', price: 199, commission: 18, description: 'Sérum vitamine C 30ml' },
    { id: 'v5', productId: 'p2', name: 'Sérum 50ml', price: 279, commission: 25, description: 'Sérum vitamine C 50ml' },
  ]},
  { id: 'p3', name: 'Kit Minceur', price: 399, baseCommission: 35, googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example3', teamType: 'both', assignedAgents: ['wa1', 'wa2', 'ap1', 'ap2'], isActive: true, createdAt: daysAgo(20), variants: [
    { id: 'v6', productId: 'p3', name: 'Kit Basic', price: 399, commission: 35, description: 'Ceinture + Gel minceur' },
    { id: 'v7', productId: 'p3', name: 'Kit Premium', price: 599, commission: 50, description: 'Ceinture + Gel + Compléments' },
  ]},
  { id: 'p4', name: 'Huile d\'Argan Bio', price: 149, baseCommission: 15, googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example4', teamType: 'whatsapp', assignedAgents: ['wa1', 'wa2', 'wa3'], isActive: true, createdAt: daysAgo(15), variants: [
    { id: 'v8', productId: 'p4', name: '50ml', price: 149, commission: 15, description: 'Huile d\'argan pure 50ml' },
    { id: 'v9', productId: 'p4', name: '100ml', price: 249, commission: 22, description: 'Huile d\'argan pure 100ml' },
  ]},
];

const firstNames = ['Ahmed', 'Mohammed', 'Fatima', 'Khadija', 'Youssef', 'Amina', 'Omar', 'Salma', 'Hassan', 'Nadia', 'Rachid', 'Laila', 'Karim', 'Zineb', 'Mehdi', 'Sara', 'Anas', 'Imane', 'Hamza', 'Nisrine'];
const lastNames = ['Bennani', 'El Amrani', 'Tazi', 'Chraibi', 'Alaoui', 'Berrada', 'Fassi', 'Idrissi', 'Kettani', 'Lahlou', 'Mansouri', 'Naciri', 'Oukacha', 'Rahmouni', 'Senhaji'];
const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida', 'Nador', 'Béni Mellal'];
const statusesWA: OrderStatus[] = ['pending', 'confirmé', 'pas_intéressé', 'suivi', 'livré'];
const statusesAP: OrderStatus[] = ['pending', 'confirmé', 'annulé', 'pas_de_réponse_1', 'pas_de_réponse_2', 'faux_commande', 'pas_intéressé', 'suivi', 'livré'];

function generateOrders(): Order[] {
  const orders: Order[] = [];
  const waGirls = ['wa1', 'wa2', 'wa3'];
  const apGirls = ['ap1', 'ap2'];
  for (let i = 0; i < 85; i++) {
    const isWA = Math.random() > 0.45;
    const team: 'whatsapp' | 'appel' = isWA ? 'whatsapp' : 'appel';
    const assignedTo = isWA ? waGirls[i % 3] : apGirls[i % 2];
    const product = mockProducts[i % mockProducts.length];
    const variant = product.variants[i % product.variants.length];
    const status = isWA ? statusesWA[Math.floor(Math.random() * statusesWA.length)] : statusesAP[Math.floor(Math.random() * statusesAP.length)];
    const dayOffset = Math.floor(Math.random() * 14);
    const hourOffset = Math.floor(Math.random() * 24);
    orders.push({
      id: `ORD-${String(1000 + i).padStart(4, '0')}`,
      clientName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      clientPhone: `06${String(Math.floor(10000000 + Math.random() * 90000000)).substring(0, 8)}`,
      productId: product.id,
      variantId: variant.id,
      address: `${Math.floor(Math.random() * 200) + 1}, Rue ${['Mohammed V', 'Hassan II', 'Al Massira', 'Ibn Sina', 'Al Amal'][i % 5]}`,
      city: cities[i % cities.length],
      status,
      assignedTo,
      teamType: team,
      createdAt: new Date(Date.now() - (dayOffset * 86400000 + hourOffset * 3600000)).toISOString(),
      updatedAt: new Date(Date.now() - (dayOffset * 86400000 + (hourOffset - 2) * 3600000)).toISOString(),
      notes: [],
      isBlacklisted: false,
      isRecurringClient: Math.random() > 0.85,
      source: Math.random() > 0.7 ? 'auto_command' : (Math.random() > 0.5 ? 'google_sheet' : 'manual'),
    });
  }
  return orders;
}

const mockOrders = generateOrders();

const mockClients: Client[] = Array.from({ length: 40 }, (_, i) => ({
  id: `cl${i + 1}`,
  phone: `06${String(Math.floor(10000000 + Math.random() * 90000000)).substring(0, 8)}`,
  name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  totalOrders: Math.floor(Math.random() * 5) + 1,
  lastOrderDate: daysAgo(Math.floor(Math.random() * 30)),
  notes: '',
  isBlacklisted: i === 3 || i === 7,
  blacklistReason: i === 3 ? 'Retour frauduleux' : i === 7 ? 'Comportement abusif' : undefined,
}));

const mockCommissions: Commission[] = mockOrders
  .filter(o => o.status === 'livré')
  .map((o, i) => ({
    id: `com${i + 1}`,
    userId: o.assignedTo,
    orderId: o.id,
    amount: mockProducts.find(p => p.id === o.productId)?.baseCommission ?? 20,
    status: Math.random() > 0.5 ? 'paid' as const : 'pending' as const,
    paidAt: Math.random() > 0.5 ? daysAgo(Math.floor(Math.random() * 10)) : undefined,
    paidBy: 'admin1',
    createdAt: o.updatedAt,
  }));

const mockTemplates: WhatsAppTemplate[] = [
  { id: 't1', name: 'Confirmation initiale', content: 'Bonjour {{nom}} ! 🌟 Merci pour votre commande de {{produit}}. Nous allons confirmer votre livraison à {{ville}}. Confirmez-vous ?', category: 'confirmation', createdBy: 'admin1' },
  { id: 't2', name: 'Rappel commande', content: 'Salut {{nom}} 👋 Un petit rappel pour votre commande {{produit}} à {{ville}}. On vous attend !', category: 'rappel', createdBy: 'admin1' },
  { id: 't3', name: 'Suivi livraison', content: '{{nom}}, votre commande {{produit}} est en route vers {{ville}} ! 📦', category: 'suivi', createdBy: 'admin1' },
];

const mockObjections: Objection[] = [
  { id: 'ob1', question: 'C\'est trop cher', response: 'Je comprends ! Mais vu la qualité des ingrédients et les résultats, c\'est un investissement pour votre peau. Et avec la livraison gratuite...', copyText: 'Je comprends ! Mais vu la qualité des ingrédients et les résultats...', order: 1, createdBy: 'admin1' },
  { id: 'ob2', question: 'Je vais réfléchir', response: 'Bien sûr ! Mais l\'offre est limitée. Si vous commandez aujourd\'hui, vous bénéficiez de -20%. Je peux vous réserver la promotion ?', copyText: 'Bien sûr ! Mais l\'offre est limitée. Si vous commandez aujourd\'hui...', order: 2, createdBy: 'admin1' },
  { id: 'ob3', question: 'J\'ai déjà essayé et ça marche pas', response: 'Désolé d\'entendre ça ! Notre nouveau formula est différent, 97% de nos clientes voient des résultats en 2 semaines. On offre garantie satisfait ou remboursé.', copyText: 'Notre nouveau formula est différent, 97% de nos clientes...', order: 3, createdBy: 'admin1' },
  { id: 'ob4', question: 'Je préfère payer à la livraison', response: 'Absolument ! C\'est paiement à la livraison, vous ne payez qu\'en recevant le produit. Zéro risque !', copyText: 'C\'est paiement à la livraison, vous ne payez qu\'en recevant...', order: 4, createdBy: 'admin1' },
  { id: 'ob5', question: 'C\'est une arnaque ?', response: 'Je comprends votre hésitation ! Nous sommes une entreprise enregistrée au Maroc avec +10,000 clientes satisfaites. Livraison partout au Maroc.', copyText: 'Nous sommes une entreprise enregistrée au Maroc avec +10,000 clientes...', order: 5, createdBy: 'admin1' },
];

const mockCallScripts: CallScript[] = [
  { id: 'cs1', userId: 'base', content: `# Script d'Appel - ConfirmPro\n\n## 1. Introduction\nBonjour, c'est [votre nom] de [Nom du produit]. Vous avez passé une commande récemment?\n\n## 2. Confirmation\nJe vous appelle pour confirmer votre commande de [produit] à [ville].\n\n## 3. Vérification adresse\nPouvez-vous me confirmer votre adresse complète ?\n\n## 4. Prix & Paiement\nLe montant total est de [prix] DH, payable à la livraison.\n\n## 5. Délai de livraison\nLa livraison se fera dans 24-48h.\n\n## 6. Fermeture\nMerci beaucoup ! Vous recevrez un SMS de confirmation.`, isPersonalized: false, updatedAt: daysAgo(10) },
  { id: 'cs2', userId: 'ap1', content: `# Mon Script - Amina\n\n## Salut !\nSalam, c'est Amina de [produit]. Comment ça va ?\n\n## Commande\nVous avez commandé [produit] - je confirme les détails ?\n\n## Adresse\nDonnez-moi votre adresse complète svp\n\n## Prix\n[prix] DH à la livraison\n\n## Livraison\nDans 1-2 jours inchallah !`, isPersonalized: true, baseScriptId: 'cs1', updatedAt: daysAgo(2) },
];

const mockBlacklist: BlacklistEntry[] = [
  { id: 'bl1', phone: '0612345678', reason: 'Retour frauduleux', addedBy: 'admin1', addedAt: daysAgo(20) },
  { id: 'bl2', phone: '0698765432', reason: 'Comportement abusif', addedBy: 'admin1', addedAt: daysAgo(15) },
  { id: 'bl3', phone: '0655443322', reason: 'Fausse commande répétée', addedBy: 'admin1', addedAt: daysAgo(5) },
];

const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'admin1', type: 'warning', message: 'Khadija B. n\'a pas traité 8 commandes depuis ce matin', isRead: false, createdAt: hoursAgo(3) },
  { id: 'n2', userId: 'admin1', type: 'warning', message: 'ORD-1005 en attente depuis +4h sans changement', isRead: false, createdAt: hoursAgo(1) },
  { id: 'n3', userId: 'wa1', type: 'info', message: 'Nouvelle commande assignée: ORD-1042', isRead: false, createdAt: hoursAgo(0.5) },
  { id: 'n4', userId: 'wa1', type: 'success', message: '🔥 Streak de 5 jours ! Continuez comme ça !', isRead: true, createdAt: daysAgo(1) },
  { id: 'n5', userId: 'admin1', type: 'info', message: 'Daily Report: 45 commandes traitées, 32 confirmées, 8 annulées', isRead: false, createdAt: hoursAgo(8) },
];

interface AppState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  clients: Client[];
  commissions: Commission[];
  orderHistory: OrderHistoryEntry[];
  templates: WhatsAppTemplate[];
  callScripts: CallScript[];
  objections: Objection[];
  notifications: Notification[];
  blacklist: BlacklistEntry[];
  settings: AppSettings;
  autoCommandHistory: AutoCommandHistoryEntry[];
  currentPage: string;
  language: 'fr' | 'ar';

  login: (email: string) => void;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  setLanguage: (lang: 'fr' | 'ar') => void;

  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  addOrderNote: (orderId: string, text: string) => void;
  snoozeOrder: (orderId: string, duration: string) => void;
  addOrder: (order: Partial<Order>) => void;

  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addUser: (user: Partial<User>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  toggleUserActive: (id: string) => void;

  payCommission: (commissionId: string) => void;

  addTemplate: (template: Partial<WhatsAppTemplate>) => void;
  updateTemplate: (id: string, data: Partial<WhatsAppTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addObjection: (objection: Partial<Objection>) => void;
  updateObjection: (id: string, data: Partial<Objection>) => void;
  deleteObjection: (id: string) => void;

  updateCallScript: (userId: string, content: string) => void;

  addBlacklistEntry: (phone: string, reason: string) => void;
  removeBlacklistEntry: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateSettings: (settings: Partial<AppSettings>) => void;

  executeAutoCommand: (input: string) => { success: boolean; message: string };

  apiConnected: boolean;
  apiUrl: string;
  syncFromApi: () => Promise<void>;
  triggerServerSync: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: mockUsers,
  products: mockProducts,
  orders: [],
  clients: mockClients,
  commissions: mockCommissions,
  orderHistory: [],
  templates: mockTemplates,
  callScripts: mockCallScripts,
  objections: mockObjections,
  notifications: mockNotifications,
  blacklist: mockBlacklist,
  settings: {
    googleSyncInterval: 5,
    alertDelayHours: 4,
    dailyReportEnabled: true,
    roundRobinIndexWhatsapp: 2,
    roundRobinIndexAppel: 1,
    autoCommandEnabled: true,
    commandPrefix: '>',
    autoParseEnabled: true,
  },
  autoCommandHistory: [],
  currentPage: 'dashboard',
  language: 'fr',

  login: (email: string) => {
    const user = get().users.find(u => u.email === email);
    if (user) set({ currentUser: user });
  },

  logout: () => set({ currentUser: null, currentPage: 'dashboard' }),

  setCurrentPage: (page: string) => set({ currentPage: page }),
  setLanguage: (lang) => set({ language: lang }),

  updateOrderStatus: (orderId, newStatus, note) => set(state => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return state;
    const oldStatus = order.status;
    const updatedOrders = state.orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString(), lastContactedAt: new Date().toISOString() } : o
    );
    const historyEntry: OrderHistoryEntry = {
      id: generateId(), orderId, changedBy: state.currentUser?.id ?? 'system', oldStatus, newStatus,
      changedAt: new Date().toISOString(), note
    };

    let updatedCommissions = state.commissions;
    if (newStatus === 'livré') {
      const product = state.products.find(p => p.id === order.productId);
      const variant = product?.variants.find(v => v.id === order.variantId);
      const commissionAmount = variant?.commission ?? product?.baseCommission ?? 0;
      if (commissionAmount > 0) {
        updatedCommissions = [...updatedCommissions, {
          id: generateId(), userId: order.assignedTo, orderId, amount: commissionAmount,
          status: 'pending' as const, createdAt: new Date().toISOString()
        }];
      }
    }

    return { orders: updatedOrders, orderHistory: [...state.orderHistory, historyEntry], commissions: updatedCommissions };
  }),

  addOrderNote: (orderId, text) => set(state => {
    const note: OrderNote = { id: generateId(), text, addedBy: state.currentUser?.id ?? 'system', addedAt: new Date().toISOString() };
    return { orders: state.orders.map(o => o.id === orderId ? { ...o, notes: [...o.notes, note], updatedAt: new Date().toISOString() } : o) };
  }),

  snoozeOrder: (orderId, duration) => set(state => {
    const ms = duration.endsWith('h') ? parseInt(duration) * 3600000 : duration.endsWith('m') ? parseInt(duration) * 60000 : 86400000;
    const snoozedUntil = new Date(Date.now() + ms).toISOString();
    return { orders: state.orders.map(o => o.id === orderId ? { ...o, snoozedUntil, updatedAt: new Date().toISOString() } : o) };
  }),

  addOrder: (orderData) => set(state => {
    const products = state.products;
    const productId = orderData.productId || products[0]?.id;
    const product = products.find(p => p.id === productId);
    const teamType = product?.teamType === 'both' ? (Math.random() > 0.5 ? 'whatsapp' : 'appel') : (product?.teamType === 'appel' ? 'appel' : 'whatsapp');
    const isBlacklisted = state.blacklist.some(b => b.phone === orderData.clientPhone);
    const isRecurring = state.clients.some(c => c.phone === orderData.clientPhone && c.totalOrders > 1);

    const relevantAgents = state.users.filter(u =>
      u.isActive && (
        (teamType === 'whatsapp' && u.role === 'confirmatrice_whatsapp') ||
        (teamType === 'appel' && u.role === 'confirmatrice_appel')
      ) && (product?.assignedAgents.includes(u.id) ?? true)
    );

    const settings = state.settings;
    let assignedTo = relevantAgents[0]?.id ?? '';
    if (teamType === 'whatsapp' && relevantAgents.length > 0) {
      assignedTo = relevantAgents[settings.roundRobinIndexWhatsapp % relevantAgents.length].id;
    } else if (relevantAgents.length > 0) {
      assignedTo = relevantAgents[settings.roundRobinIndexAppel % relevantAgents.length].id;
    }

    const newOrder: Order = {
      id: `ORD-${String(1000 + state.orders.length).padStart(4, '0')}`,
      clientName: orderData.clientName ?? 'Client',
      clientPhone: orderData.clientPhone ?? '',
      productId,
      variantId: orderData.variantId,
      address: orderData.address ?? '',
      city: orderData.city ?? '',
      status: 'pending',
      assignedTo,
      teamType: teamType as 'whatsapp' | 'appel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      isBlacklisted,
      isRecurringClient: isRecurring,
      source: orderData.source ?? 'manual',
    };

    return { orders: [newOrder, ...state.orders] };
  }),

  addProduct: (data) => set(state => ({
    products: [...state.products, { id: generateId(), name: data.name ?? '', price: data.price ?? 0, baseCommission: data.baseCommission ?? 0, googleSheetUrl: data.googleSheetUrl ?? '', teamType: data.teamType ?? 'whatsapp', assignedAgents: data.assignedAgents ?? [], isActive: true, createdAt: new Date().toISOString(), variants: data.variants ?? [] } as Product]
  })),

  updateProduct: (id, data) => set(state => ({
    products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
  })),

  deleteProduct: (id) => set(state => ({
    products: state.products.filter(p => p.id !== id)
  })),

  addUser: (data) => set(state => ({
    users: [...state.users, { id: generateId(), name: data.name ?? '', email: data.email ?? '', role: data.role ?? 'confirmatrice_whatsapp', isActive: true, dailyGoal: data.dailyGoal ?? 25, streakDays: 0, lastActiveDate: new Date().toISOString(), performanceScore: 0, totalCommissionEarned: 0, totalCommissionPaid: 0, bonusThreshold: data.bonusThreshold ?? 50, bonusAmount: data.bonusAmount ?? 200, workingHoursStart: data.workingHoursStart ?? '09:00', workingHoursEnd: data.workingHoursEnd ?? '17:00' } as User]
  })),

  updateUser: (id, data) => set(state => ({
    users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
  })),

  toggleUserActive: (id) => set(state => ({
    users: state.users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u)
  })),

  payCommission: (commissionId) => set(state => ({
    commissions: state.commissions.map(c => c.id === commissionId ? { ...c, status: 'paid' as const, paidAt: new Date().toISOString(), paidBy: state.currentUser?.id } : c)
  })),

  addTemplate: (data) => set(state => ({
    templates: [...state.templates, { id: generateId(), name: data.name ?? '', content: data.content ?? '', category: data.category ?? 'confirmation', createdBy: state.currentUser?.id ?? 'admin1' } as WhatsAppTemplate]
  })),

  updateTemplate: (id, data) => set(state => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...data } : t)
  })),

  deleteTemplate: (id) => set(state => ({
    templates: state.templates.filter(t => t.id !== id)
  })),

  addObjection: (data) => set(state => ({
    objections: [...state.objections, { id: generateId(), question: data.question ?? '', response: data.response ?? '', copyText: data.copyText ?? '', order: state.objections.length + 1, createdBy: state.currentUser?.id ?? 'admin1' } as Objection]
  })),

  updateObjection: (id, data) => set(state => ({
    objections: state.objections.map(o => o.id === id ? { ...o, ...data } : o)
  })),

  deleteObjection: (id) => set(state => ({
    objections: state.objections.filter(o => o.id !== id)
  })),

  updateCallScript: (userId, content) => set(state => ({
    callScripts: state.callScripts.map(s => s.userId === userId ? { ...s, content, updatedAt: new Date().toISOString() } : s).concat(
      state.callScripts.some(s => s.userId === userId) ? [] : [{ id: generateId(), userId, content, isPersonalized: true, baseScriptId: 'cs1', updatedAt: new Date().toISOString() }]
    )
  })),

  addBlacklistEntry: (phone, reason) => set(state => ({
    blacklist: [...state.blacklist, { id: generateId(), phone, reason, addedBy: state.currentUser?.id ?? 'admin1', addedAt: new Date().toISOString() }]
  })),

  removeBlacklistEntry: (id) => set(state => ({
    blacklist: state.blacklist.filter(b => b.id !== id)
  })),

  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),

  markAllNotificationsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),

  updateSettings: (settings) => set(state => ({
    settings: { ...state.settings, ...settings }
  })),

  executeAutoCommand: (input: string) => {
    const state = get();
    const prefix = state.settings.commandPrefix;
    const trimmed = input.trim();

    if (trimmed.startsWith('!')) {
      const parts = trimmed.substring(1).split(/\s+/);
      const cmd = parts[0]?.toLowerCase();
      const arg1 = parts[1];
      const rest = parts.slice(2).join(' ');

      switch (cmd) {
        case 'confirm': {
          const order = state.orders.find(o => o.id === arg1 || o.id === `ORD-${arg1}`);
          if (order) {
            get().updateOrderStatus(order.id, 'confirmé');
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `✅ ${order.id} → Confirmé`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `✅ Commande ${order.id} confirmée !` };
          }
          return { success: false, message: `❌ Commande ${arg1} introuvable` };
        }
        case 'suivi': {
          const order = state.orders.find(o => o.id === arg1 || o.id === `ORD-${arg1}`);
          if (order) {
            get().updateOrderStatus(order.id, 'suivi');
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `🔄 ${order.id} → Suivi`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `🔄 Commande ${order.id} → Suivi` };
          }
          return { success: false, message: `❌ Commande ${arg1} introuvable` };
        }
        case 'annuler': {
          const order = state.orders.find(o => o.id === arg1 || o.id === `ORD-${arg1}`);
          if (order) {
            get().updateOrderStatus(order.id, 'annulé');
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `❌ ${order.id} → Annulé`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `❌ Commande ${order.id} annulée` };
          }
          return { success: false, message: `❌ Commande ${arg1} introuvable` };
        }
        case 'snooze': {
          const order = state.orders.find(o => o.id === arg1 || o.id === `ORD-${arg1}`);
          const duration = rest || '1h';
          if (order) {
            get().snoozeOrder(order.id, duration);
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `⏰ ${order.id} snoozé ${duration}`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `⏰ Commande ${order.id} snoozée pour ${duration}` };
          }
          return { success: false, message: `❌ Commande ${arg1} introuvable` };
        }
        case 'note': {
          const order = state.orders.find(o => o.id === arg1 || o.id === `ORD-${arg1}`);
          if (order && rest) {
            get().addOrderNote(order.id, rest);
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `📝 Note ajoutée à ${order.id}`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `📝 Note ajoutée à ${order.id}` };
          }
          return { success: false, message: `❌ Commande ${arg1} introuvable ou texte manquant` };
        }
        case 'blacklist': {
          const phone = arg1;
          const reason = rest || 'Pas de raison';
          if (phone) {
            get().addBlacklistEntry(phone, reason);
            const entry: AutoCommandHistoryEntry = { command: trimmed, result: `🚫 ${phone} → Blacklist`, timestamp: new Date().toISOString() };
            set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
            return { success: true, message: `🚫 ${phone} ajouté à la Blacklist` };
          }
          return { success: false, message: `❌ Numéro manquant` };
        }
        case 'search': {
          const query = parts.slice(1).join(' ');
          const results = state.orders.filter(o =>
            o.clientName.toLowerCase().includes(query.toLowerCase()) ||
            o.clientPhone.includes(query) ||
            o.city.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toLowerCase().includes(query.toLowerCase())
          );
          const entry: AutoCommandHistoryEntry = { command: trimmed, result: `🔍 ${results.length} résultat(s) pour "${query}"`, timestamp: new Date().toISOString() };
          set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
          return { success: true, message: `🔍 ${results.length} résultat(s) pour "${query}"` };
        }
        default:
          return { success: false, message: `❌ Commande inconnue: !${cmd}` };
      }
    } else if (trimmed.startsWith(prefix) || trimmed.split(/\s+/).length >= 3) {
      const text = trimmed.startsWith(prefix) ? trimmed.substring(1).trim() : trimmed;
      const parts = text.split(/\s+/);
      if (parts.length >= 3) {
        const name = parts[0];
        const phone = parts[1];
        const productName = parts.slice(2).join(' ');
        const product = state.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
        get().addOrder({
          clientName: name,
          clientPhone: phone,
          productId: product?.id,
          city: parts[4] || 'Casablanca',
          source: 'auto_command',
        });
        const entry: AutoCommandHistoryEntry = { command: trimmed, result: `📦 Nouvelle commande: ${name}`, timestamp: new Date().toISOString() };
        set(s => ({ autoCommandHistory: [entry, ...s.autoCommandHistory].slice(0, 10) }));
        return { success: true, message: `📦 Commande créée pour ${name}` };
      }
    }

    return { success: false, message: `❓ Commande non reconnue. Tapez !help pour l'aide.` };
  },

  apiConnected: false,
  apiUrl: '',

  syncFromApi: async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const apiOrders = await res.json();
        // دائماً نبدّل mock data بالبيانات الحقيقية من API
        set({ orders: apiOrders, apiConnected: true });
      }
    } catch {
      // API ما يمكنش، نخليو mock data
    }
  },

  triggerServerSync: async () => {
    try {
      // اولاً خلّي السيرفر يسحب من Google Sheet
      await fetch('/api/sync', { method: 'POST' });
      // من بعد اقرا les orders
      await get().syncFromApi();
    } catch {
      // ignore
    }
  },
}));

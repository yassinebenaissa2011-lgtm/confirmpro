import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { STATUS_COLORS, STATUS_LABELS, WHATSAPP_STATUSES, APPEL_STATUSES, OrderStatus } from '../types';
import {
  Search, Filter, MessageSquare, Star,
  Copy, Check, Ban, RefreshCw
} from 'lucide-react';

export default function OrdersPage() {
  const { currentUser, orders, products, users, updateOrderStatus, addOrderNote, snoozeOrder, templates, objections } = useAppStore();
  const isAdmin = currentUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const myOrders = useMemo(() => {
    // Admin يشوف كلشي، Agent تشوف les orders ديالها فقط
    let filtered = isAdmin 
      ? orders 
      : orders.filter(o => {
          // نشوفو الطلب marcá ليهاد Agent (بـ ID ولا بـ الاسم)
          const userId = currentUser?.id || '';
          const userName = currentUser?.name || '';
          return o.assignedTo === userId || o.assignedTo === userName;
        });
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(o =>
        o.clientName.toLowerCase().includes(q) ||
        o.clientPhone.includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    if (productFilter !== 'all') filtered = filtered.filter(o => o.productId === productFilter);
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, isAdmin, currentUser, search, statusFilter, productFilter]);

  const availableStatuses: OrderStatus[] = isAdmin
    ? [...WHATSAPP_STATUSES, 'annulé', 'pas_de_réponse_1', 'pas_de_réponse_2', 'pas_de_réponse_3', 'pas_de_réponse_4', 'faux_commande'] as OrderStatus[]
    : currentUser?.role === 'confirmatrice_whatsapp'
      ? WHATSAPP_STATUSES.filter(s => s !== 'livré')
      : APPEL_STATUSES.filter(s => s !== 'livré');

  const getWhatsAppLink = (order: typeof orders[0]) => {
    const product = products.find(p => p.id === order.productId);
    const template = templates[0];
    if (!template) return '#';
    const text = template.content
      .replace('{{nom}}', order.clientName.split(' ')[0])
      .replace('{{produit}}', product?.name ?? '')
      .replace('{{ville}}', order.city);
    return `https://wa.me/${order.clientPhone.replace(/^0/, '212')}?text=${encodeURIComponent(text)}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Il y a moins d\'1h';
    if (diffH < 24) return `Il y a ${diffH}h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, ville..."
              className="w-full bg-[#1E293B] border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <button
            onClick={() => useAppStore.getState().triggerServerSync()}
            className="p-2.5 rounded-xl border bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all"
            title="Synchroniser Google Sheets"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-[#6C63FF]/10 border-[#6C63FF]/30 text-[#6C63FF]' : 'bg-[#1E293B] border-slate-700/50 text-slate-400 hover:text-white'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-3 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#6C63FF]"
            >
              <option value="all">Tous les statuts</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#6C63FF]"
            >
              <option value="all">Tous les produits</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500 self-center">{myOrders.length} résultat(s)</span>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {myOrders.slice(0, 30).map(order => {
          const product = products.find(p => p.id === order.productId);
          const variant = product?.variants.find(v => v.id === order.variantId);
          const agent = users.find(u => u.id === order.assignedTo);
          const isSelected = selectedOrder === order.id;

          return (
            <div key={order.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Order Card */}
              <div
                className="p-3 cursor-pointer hover:bg-slate-800/50 transition-all"
                onClick={() => setSelectedOrder(isSelected ? null : order.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{order.id}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.status]}20`,
                          color: STATUS_COLORS[order.status]
                        }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      {order.isRecurringClient && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <Star size={10} /> Client récurrent
                        </span>
                      )}
                      {order.isBlacklisted && (
                        <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                          <Ban size={10} /> Blacklisté
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold truncate">{order.clientName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{order.clientPhone}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span>{product?.name}{variant ? ` (${variant.name})` : ''}</span>
                      <span>•</span>
                      <span>{order.city}</span>
                      <span>•</span>
                      <span>{formatTime(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {variant ? (
                      <span className="text-sm font-bold text-[#6C63FF]">{variant.price} DH</span>
                    ) : product ? (
                      <span className="text-sm font-bold text-[#6C63FF]">{product.price} DH</span>
                    ) : null}
                    {isAdmin && agent && (
                      <span className="text-[10px] text-slate-500">{agent.name}</span>
                    )}
                    <span className="text-[10px] text-slate-600">
                      {order.teamType === 'whatsapp' ? '💬' : '📞'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {isSelected && (
                <div className="border-t border-slate-700/50 p-3 space-y-3">
                  {/* Client Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Adresse:</span>
                      <p className="text-slate-300 mt-0.5">{order.address || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Source:</span>
                      <p className="text-slate-300 mt-0.5 capitalize">{order.source?.replace('_', ' ') ?? 'manual'}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Actions rapides</p>

                    {/* Status Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {availableStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={order.status === status}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            order.status === status
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:opacity-90'
                          }`}
                          style={{
                            backgroundColor: `${STATUS_COLORS[status]}15`,
                            borderColor: `${STATUS_COLORS[status]}30`,
                            color: STATUS_COLORS[status]
                          }}
                        >
                          {STATUS_LABELS[status] ?? status}
                        </button>
                      ))}
                    </div>

                    {/* WhatsApp Button */}
                    {(order.teamType === 'whatsapp' || currentUser?.role === 'confirmatrice_whatsapp') && (
                      <a
                        href={getWhatsAppLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all"
                      >
                        <MessageSquare size={18} />
                        Ouvrir WhatsApp
                      </a>
                    )}

                    {/* Snooze Buttons */}
                    <div className="flex gap-1.5">
                      {['30m', '1h', '2h', 'Demain'].map(dur => (
                        <button
                          key={dur}
                          onClick={() => snoozeOrder(order.id, dur === 'Demain' ? '1j' : dur)}
                          className="flex-1 text-[11px] px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50 transition-all"
                        >
                          ⏰ {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objections (for Appel team) */}
                  {(order.teamType === 'appel' || currentUser?.role === 'confirmatrice_appel') && objections.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Objections courantes</p>
                      {objections.map(ob => (
                        <div key={ob.id} className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-xs text-slate-300 font-medium">"{ob.question}"</p>
                          <div className="flex items-start gap-2 mt-1">
                            <p className="text-[11px] text-slate-400 flex-1">{ob.response.slice(0, 100)}...</p>
                            <button
                              onClick={() => copyToClipboard(ob.copyText, ob.id)}
                              className="p-1 rounded text-slate-500 hover:text-[#6C63FF] transition-all flex-shrink-0"
                            >
                              {copiedId === ob.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      Notes ({order.notes.length})
                    </p>
                    {order.notes.length > 0 && (
                      <div className="space-y-1">
                        {order.notes.map(note => (
                          <div key={note.id} className="bg-slate-800/30 rounded-lg p-2 text-xs text-slate-300">
                            <p>{note.text}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{formatTime(note.addedAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && noteText.trim()) {
                            addOrderNote(order.id, noteText.trim());
                            setNoteText('');
                          }
                        }}
                        placeholder="Ajouter une note..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C63FF]"
                      />
                      <button
                        onClick={() => {
                          if (noteText.trim()) {
                            addOrderNote(order.id, noteText.trim());
                            setNoteText('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white text-xs font-medium hover:bg-[#5B54E6] transition-all"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {myOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">Aucune commande trouvée</p>
            <p className="text-sm text-slate-500 mt-1">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
}

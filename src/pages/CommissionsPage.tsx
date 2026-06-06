import { useState } from 'react';
import { useAppStore } from '../store';
import { DollarSign, CheckCircle, Clock, User, CreditCard, TrendingUp } from 'lucide-react';

export default function CommissionsPage() {
  const { currentUser, users, commissions, orders, products, payCommission } = useAppStore();
  const isAdmin = currentUser?.role === 'admin';
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const relevantCommissions = isAdmin
    ? commissions
    : commissions.filter(c => c.userId === currentUser?.id);

  const filtered = filter === 'all' ? relevantCommissions : relevantCommissions.filter(c => c.status === filter);

  const totalPending = relevantCommissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
  const totalPaid = relevantCommissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  // Group by user for admin view
  const byUser = isAdmin ? users.filter(u => u.role !== 'admin').map(user => {
    const userComms = commissions.filter(c => c.userId === user.id);
    const pending = userComms.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
    const paid = userComms.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
    return { user, pending, paid, total: pending + paid, commissions: userComms };
  }) : [];

  if (isAdmin) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Gestion des Commissions</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-emerald-400" />
              <span className="text-xs text-slate-400">Total En Attente</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totalPending.toLocaleString()} DH</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-xs text-slate-400">Total Payé</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{totalPaid.toLocaleString()} DH</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} className="text-blue-400" />
              <span className="text-xs text-slate-400">Nb. Commissions</span>
            </div>
            <p className="text-2xl font-bold">{relevantCommissions.length}</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-[#6C63FF]" />
              <span className="text-xs text-slate-400">Agents</span>
            </div>
            <p className="text-2xl font-bold">{byUser.length}</p>
          </div>
        </div>

        {/* Per User Summary */}
        <div className="space-y-3">
          {byUser.map(({ user, pending, paid, total, commissions: userComms }) => (
            <div key={user.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6C63FF]/20 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#6C63FF]">{total} DH</p>
                  <p className="text-[10px] text-slate-400">Total cumulé</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-amber-400">{pending} DH</p>
                  <p className="text-[10px] text-slate-400">En attente</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-emerald-400">{paid} DH</p>
                  <p className="text-[10px] text-slate-400">Payé</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold">{userComms.length}</p>
                  <p className="text-[10px] text-slate-400">Transactions</p>
                </div>
              </div>

              {/* Pending commissions for this user */}
              {pending > 0 && (
                <div className="space-y-1">
                  {userComms.filter(c => c.status === 'pending').slice(0, 5).map(comm => {
                    const order = orders.find(o => o.id === comm.orderId);
                    return (
                      <div key={comm.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-amber-400" />
                          <span className="text-xs text-slate-300">{comm.orderId}</span>
                          <span className="text-[10px] text-slate-500">{order?.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-amber-400">{comm.amount} DH</span>
                          <button
                            onClick={() => payCommission(comm.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-medium hover:bg-emerald-500 transition-all"
                          >
                            Payé ✓
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bonus info */}
              {user.bonusThreshold > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Bonus: {user.bonusAmount} DH si {user.bonusThreshold} livraisons/mois</span>
                  <span className="text-[10px] text-slate-500">
                    {orders.filter(o => o.assignedTo === user.id && o.status === 'livré').length}/{user.bonusThreshold} livrés ce mois
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Confirmatrice view
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mes Gains</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 text-center">
          <p className="text-xl font-bold text-amber-400">{totalPending} DH</p>
          <p className="text-[10px] text-slate-400 mt-1">En attente</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 text-center">
          <p className="text-xl font-bold text-emerald-400">{totalPaid} DH</p>
          <p className="text-[10px] text-slate-400 mt-1">Payé</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 text-center">
          <p className="text-xl font-bold text-[#6C63FF]">{totalPending + totalPaid} DH</p>
          <p className="text-[10px] text-slate-400 mt-1">Total</p>
        </div>
      </div>

      {/* Bonus Info */}
      {currentUser?.bonusThreshold && (
        <div className="bg-[#6C63FF]/10 rounded-xl border border-[#6C63FF]/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold flex items-center gap-1"><TrendingUp size={14} className="text-[#6C63FF]" /> Bonus de Performance</p>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.bonusAmount} DH si {currentUser.bonusThreshold} livraisons ce mois</p>
            </div>
            <span className="text-sm font-bold text-[#6C63FF]">
              {orders.filter(o => o.assignedTo === currentUser.id && o.status === 'livré').length}/{currentUser.bonusThreshold}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div className="h-2 rounded-full bg-[#6C63FF]" style={{ width: `${Math.min(100, (orders.filter(o => o.assignedTo === currentUser.id && o.status === 'livré').length / (currentUser.bonusThreshold || 1)) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Payé'}
          </button>
        ))}
      </div>

      {/* Commission List */}
      <div className="space-y-2">
        {filtered.map(comm => {
          const order = orders.find(o => o.id === comm.orderId);
          const product = order ? products.find(p => p.id === order.productId) : null;
          return (
            <div key={comm.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{comm.orderId}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    comm.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {comm.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{order?.clientName} • {product?.name} • {order?.city}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {comm.status === 'paid' && comm.paidAt ? `Payé le ${new Date(comm.paidAt).toLocaleDateString('fr-FR')}` : `Créé le ${new Date(comm.createdAt).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              <span className="text-lg font-bold text-emerald-400">{comm.amount} DH</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">Aucune commission trouvée</div>
        )}
      </div>
    </div>
  );
}

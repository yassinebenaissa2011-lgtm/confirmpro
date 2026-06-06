import { useAppStore } from '../store';
import {
  ShoppingCart, TrendingUp, Users, DollarSign, CheckCircle2,
  Clock, AlertTriangle, Flame, Target, ArrowUpRight, ArrowDownRight,
  Package, MessageSquare, Phone
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const STATUS_COLORS_MAP: Record<string, string> = {
  pending: '#8B5CF6',
  confirmé: '#10B981',
  livré: '#3B82F6',
  suivi: '#F59E0B',
  annulé: '#EF4444',
  pas_intéressé: '#F87171',
  pas_de_réponse_1: '#6B7280',
  pas_de_réponse_2: '#6B7280',
  pas_de_réponse_3: '#6B7280',
  pas_de_réponse_4: '#6B7280',
  faux_commande: '#F87171',
};

export default function DashboardPage() {
  const { currentUser, orders, users, commissions, products, currentPage } = useAppStore();
  const isAdmin = currentUser?.role === 'admin';

  const myOrders = isAdmin
    ? orders
    : orders.filter(o => o.assignedTo === currentUser?.id);

  const today = new Date().toDateString();
  const todayOrders = myOrders.filter(o => new Date(o.createdAt).toDateString() === today);
  const confirmedToday = todayOrders.filter(o => o.status === 'confirmé' || o.status === 'livré');
  const pendingOrders = myOrders.filter(o => o.status === 'pending');
  const confirmedTotal = myOrders.filter(o => o.status === 'confirmé').length;
  const livréTotal = myOrders.filter(o => o.status === 'livré').length;
  const totalRevenue = myOrders.filter(o => o.status === 'livré').reduce((sum, o) => {
    const product = products.find(p => p.id === o.productId);
    const variant = product?.variants.find(v => v.id === o.variantId);
    return sum + (variant?.price ?? product?.price ?? 0);
  }, 0);

  const myCommissions = isAdmin
    ? commissions
    : commissions.filter(c => c.userId === currentUser?.id);
  const pendingComm = myCommissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
  const paidComm = myCommissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  // Status distribution for pie chart
  const statusCounts: Record<string, number> = {};
  myOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Daily chart data (last 7 days)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const dayOrders = myOrders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
    return {
      name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      total: dayOrders.length,
      confirmé: dayOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length,
    };
  });

  // Hourly data
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i * 2;
    const count = myOrders.filter(o => {
      const h = new Date(o.createdAt).getHours();
      return h >= hour && h < hour + 2;
    }).filter(o => o.status === 'confirmé' || o.status === 'livré').length;
    return { name: `${hour}h`, count };
  });

  const completionRate = myOrders.length > 0
    ? Math.round(((confirmedTotal + livréTotal) / myOrders.length) * 100)
    : 0;

  const dailyGoal = currentUser?.dailyGoal ?? 25;
  const goalProgress = Math.min(100, Math.round((confirmedToday.length / dailyGoal) * 100));
  const streak = currentUser?.streakDays ?? 0;

  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Admin Overview */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-400">Vue d'ensemble de votre activité</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <KPICard icon={ShoppingCart} label="Commandes Aujourd'hui" value={String(todayOrders.length)} color="#6C63FF" trend="+12%" up />
          <KPICard icon={CheckCircle2} label="Confirmées" value={String(confirmedToday.length)} color="#10B981" trend="+8%" up />
          <KPICard icon={Clock} label="En Attente" value={String(pendingOrders.length)} color="#F59E0B" />
          <KPICard icon={DollarSign} label="Revenus (Livré)" value={`${totalRevenue.toLocaleString()} DH`} color="#3B82F6" trend="+15%" up />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <KPICard icon={Users} label="Équipe Active" value={String(users.filter(u => u.isActive && u.role !== 'admin').length)} color="#6C63FF" />
          <KPICard icon={Package} label="Produits Actifs" value={String(products.filter(p => p.isActive).length)} color="#10B981" />
          <KPICard icon={TrendingUp} label="Taux de Confirmation" value={`${completionRate}%`} color="#F59E0B" />
          <KPICard icon={DollarSign} label="Commissions En Attente" value={`${pendingComm} DH`} color="#EF4444" />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold mb-4">Commandes (7 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="total" fill="#6C63FF" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="confirmé" fill="#10B981" radius={[4, 4, 0, 0]} name="Confirmé" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold mb-4">Répartition par Statut</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ percent }) => percent != null ? `${Math.round(percent * 100)}%` : ''}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS_MAP[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {pieData.slice(0, 6).map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS_MAP[entry.name] }} />
                  <span className="text-[10px] text-slate-400">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meilleure Heure Chart */}
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-4">Meilleure Heure de Confirmation</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 3 }} name="Confirmations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance Quick View */}
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-3">Performance Équipe</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {users.filter(u => u.role !== 'admin').map(user => {
              const userOrders = orders.filter(o => o.assignedTo === user.id);
              const userConfirmed = userOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;
              const rate = userOrders.length > 0 ? Math.round((userConfirmed / userOrders.length) * 100) : 0;
              return (
                <div key={user.id} className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#6C63FF]/20 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {user.role === 'confirmatrice_whatsapp' ? <MessageSquare size={10} className="text-emerald-400" /> : <Phone size={10} className="text-amber-400" />}
                    <span className="text-[10px] text-slate-400">{rate}% confirmé</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#6C63FF]" style={{ width: `${rate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{userConfirmed}/{userOrders.length} commandes</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" /> Alertes Récentes
          </h3>
          <div className="space-y-2">
            {[
              { msg: 'Khadija B. n\'a pas traité 8 commandes depuis ce matin', type: 'warning', time: 'Il y a 3h' },
              { msg: 'ORD-1005 en attente depuis +4h sans changement', type: 'warning', time: 'Il y a 1h' },
              { msg: 'Daily Report: 45 commandes traitées, 32 confirmées', type: 'info', time: 'Il y a 8h' },
              { msg: 'Salma R. a atteint son objectif journalier 🎉', type: 'success', time: 'Il y a 2h' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-amber-400' : alert.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-xs">{alert.msg}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Confirmatrice Dashboard
  const roleLabel = currentUser?.role === 'confirmatrice_whatsapp' ? 'WhatsApp' : 'Appel';
  const RoleIcon = currentUser?.role === 'confirmatrice_whatsapp' ? MessageSquare : Phone;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bonjour {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <RoleIcon size={14} /> Équipe {roleLabel}
          </p>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#6C63FF]" />
            <span className="text-sm font-semibold">Objectif du jour</span>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={14} /> {streak} jours
              </span>
            )}
            <span className="text-sm font-bold text-[#6C63FF]">{confirmedToday.length}/{dailyGoal}</span>
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${goalProgress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF]'}`}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {goalProgress >= 100 ? '🎉 Objectif atteint ! Excellent travail !' : `Encore ${dailyGoal - confirmedToday.length} confirmation(s) pour atteindre votre objectif`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Aujourd'hui" value={todayOrders.length} icon={ShoppingCart} color="#6C63FF" />
        <MiniStat label="Confirmées" value={confirmedToday.length} icon={CheckCircle2} color="#10B981" />
        <MiniStat label="En attente" value={pendingOrders.length} icon={Clock} color="#F59E0B" />
        <MiniStat label="Mon Score" value={currentUser?.performanceScore ?? 0} icon={TrendingUp} color="#3B82F6" />
      </div>

      {/* Commission Summary */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-emerald-400" /> Mes Commissions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{pendingComm} DH</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{paidComm} DH</p>
            <p className="text-[10px] text-slate-400">Payé</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#6C63FF]">{pendingComm + paidComm} DH</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-3">Mon activité (7 jours)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Bar dataKey="total" fill="#6C63FF" radius={[4, 4, 0, 0]} name="Total" />
            <Bar dataKey="confirmé" fill="#10B981" radius={[4, 4, 0, 0]} name="Confirmé" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard Position */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-3">🏆 Leaderboard</h3>
        <div className="space-y-2">
          {users.filter(u => u.role === currentUser?.role && u.isActive)
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .map((user, i) => (
              <div key={user.id} className={`flex items-center gap-3 p-2 rounded-lg ${user.id === currentUser?.id ? 'bg-[#6C63FF]/10 border border-[#6C63FF]/30' : 'bg-slate-800/30'}`}>
                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium flex-1">{user.name}</span>
                <span className="text-sm font-bold text-[#6C63FF]">{user.performanceScore} pts</span>
                {user.streakDays > 0 && (
                  <span className="text-xs text-orange-400 flex items-center gap-0.5">
                    <Flame size={12} />{user.streakDays}j
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color, trend, up }: { icon: any; label: string; value: string; color: string; trend?: string; up?: boolean }) {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xl font-bold mt-3">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

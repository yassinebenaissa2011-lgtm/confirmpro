import { useAppStore } from '../store';
import { STATUS_COLORS, STATUS_LABELS } from '../types';
import { MapPin, Clock, TrendingUp, Trophy, Package, Users, MessageSquare, Phone } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Casablanca': { lat: 33.57, lng: -7.59 }, 'Rabat': { lat: 34.02, lng: -6.83 }, 'Marrakech': { lat: 31.63, lng: -8.00 },
  'Fès': { lat: 34.03, lng: -5.00 }, 'Tanger': { lat: 35.77, lng: -5.80 }, 'Agadir': { lat: 30.43, lng: -9.60 },
  'Meknès': { lat: 33.87, lng: -5.55 }, 'Oujda': { lat: 34.68, lng: -1.90 }, 'Kénitra': { lat: 34.26, lng: -6.58 },
  'Tétouan': { lat: 35.57, lng: -5.37 }, 'Safi': { lat: 32.30, lng: -9.24 }, 'El Jadida': { lat: 33.25, lng: -8.50 },
  'Nador': { lat: 35.17, lng: -2.93 }, 'Béni Mellal': { lat: 32.34, lng: -6.35 },
};

export default function AnalyticsPage() {
  const { orders, products, users, commissions } = useAppStore();

  // City distribution
  const cityCounts: Record<string, number> = {};
  orders.forEach(o => { cityCounts[o.city] = (cityCounts[o.city] || 0) + 1; });
  const cityData = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, value]) => ({ name, value }));

  // Hourly distribution
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i * 2;
    const hourOrders = orders.filter(o => new Date(o.createdAt).getHours() >= hour && new Date(o.createdAt).getHours() < hour + 2);
    const confirmed = hourOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;
    return { name: `${hour}h`, total: hourOrders.length, confirmed, rate: hourOrders.length > 0 ? Math.round((confirmed / hourOrders.length) * 100) : 0 };
  });

  // Product stats
  const productStats = products.map(p => {
    const pOrders = orders.filter(o => o.productId === p.id);
    const confirmed = pOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;
    const cancelled = pOrders.filter(o => o.status === 'annulé' || o.status === 'pas_intéressé').length;
    return { name: p.name, total: pOrders.length, confirmed, cancelled, rate: pOrders.length > 0 ? Math.round((confirmed / pOrders.length) * 100) : 0 };
  });

  // Agent comparison
  const agents = users.filter(u => u.role !== 'admin');
  const agentStats = agents.map(a => {
    const aOrders = orders.filter(o => o.assignedTo === a.id);
    const confirmed = aOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;
    const avgTime = aOrders.length > 0 ? Math.round(aOrders.reduce((s, o) => s + (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()), 0) / aOrders.length / 3600000) : 0;
    return { name: a.name.split(' ')[0], total: aOrders.length, confirmed, rate: aOrders.length > 0 ? Math.round((confirmed / aOrders.length) * 100) : 0, score: a.performanceScore, avgTime, role: a.role };
  });

  // Status distribution
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: STATUS_LABELS[name] ?? name, value }));

  // Weekly trend
  const weeklyData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dateStr = date.toDateString();
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
    return {
      name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      total: dayOrders.length,
      confirmed: dayOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-[#6C63FF]" />
            <span className="text-xs text-slate-400">Total Commandes</span>
          </div>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Taux Confirmation</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{orders.length > 0 ? Math.round((orders.filter(o => o.status === 'confirmé' || o.status === 'livré').length / orders.length) * 100) : 0}%</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400">Villes Couvertes</span>
          </div>
          <p className="text-2xl font-bold">{Object.keys(cityCounts).length}</p>
        </div>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400">Meilleur Agent</span>
          </div>
          <p className="text-lg font-bold">{agents.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.name.split(' ')[0] ?? '-'}</p>
        </div>
      </div>

      {/* Morocco Map - City Distribution */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><MapPin size={16} className="text-amber-400" /> Distribution par Ville</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {cityData.map((city, i) => (
            <div key={city.name} className="bg-slate-800/50 rounded-lg p-3 text-center relative">
              <div className="absolute top-1 right-1 text-[9px] text-slate-600">#{i + 1}</div>
              <p className="text-sm font-bold">{city.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{city.name}</p>
              <div className="mt-1.5 w-full bg-slate-700 rounded-full h-1">
                <div className="h-1 rounded-full bg-[#6C63FF]" style={{ width: `${(city.value / cityData[0].value) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Best Confirmation Hour */}
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock size={16} className="text-blue-400" /> Meilleure Heure de Confirmation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="confirmed" fill="#10B981" radius={[4, 4, 0, 0]} name="Confirmé" />
              <Bar dataKey="total" fill="#6C63FF30" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold mb-4">Répartition des Statuts</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value">
                {statusData.map((entry, i) => {
                  const key = Object.entries(STATUS_LABELS).find(([k, v]) => v === entry.name)?.[0] ?? '';
                  return <Cell key={i} fill={STATUS_COLORS[key] || '#6B7280'} />;
                })}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {statusData.map((entry, i) => {
              const key = Object.entries(STATUS_LABELS).find(([k, v]) => v === entry.name)?.[0] ?? '';
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] || '#6B7280' }} />
                  <span className="text-[10px] text-slate-400">{entry.name} ({entry.value})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-4">Tendance sur 14 jours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="total" stroke="#6C63FF" strokeWidth={2} dot={{ r: 2 }} name="Total" />
            <Line type="monotone" dataKey="confirmed" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} name="Confirmé" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Package size={16} className="text-[#6C63FF]" /> Top Produits</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={productStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Bar dataKey="confirmed" fill="#10B981" radius={[0, 4, 4, 0]} name="Confirmé" stackId="a" />
            <Bar dataKey="cancelled" fill="#EF4444" radius={[0, 4, 4, 0]} name="Annulé" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Comparison */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-[#6C63FF]" /> Comparaison des Agents</h3>
        <div className="space-y-3">
          {agentStats.sort((a, b) => b.score - a.score).map((agent, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
              <span className="text-lg font-bold w-6">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="w-10 h-10 rounded-full bg-[#6C63FF]/20 flex items-center justify-center font-bold">
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{agent.name}</span>
                  {agent.role === 'confirmatrice_whatsapp' ? (
                    <MessageSquare size={12} className="text-emerald-400" />
                  ) : (
                    <Phone size={12} className="text-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span>{agent.total} commandes</span>
                  <span>•</span>
                  <span>{agent.confirmed} confirmées</span>
                  <span>•</span>
                  <span className="text-emerald-400">{agent.rate}% taux</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#6C63FF]">{agent.score}</p>
                <p className="text-[10px] text-slate-500">pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

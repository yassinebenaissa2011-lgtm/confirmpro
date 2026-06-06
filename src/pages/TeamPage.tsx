import { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Edit2, UserCheck, UserX, MessageSquare, Phone, Shield, Clock, Flame, Target, X } from 'lucide-react';

export default function TeamPage() {
  const { users, addUser, updateUser, toggleUserActive, orders, products } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'confirmatrice_whatsapp' as 'confirmatrice_whatsapp' | 'confirmatrice_appel', dailyGoal: 25, workingHoursStart: '09:00', workingHoursEnd: '17:00', bonusThreshold: 50, bonusAmount: 200 });

  const agents = users.filter(u => u.role !== 'admin');
  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addUser(form);
    setShowForm(false);
    setForm({ name: '', email: '', role: 'confirmatrice_whatsapp', dailyGoal: 25, workingHoursStart: '09:00', workingHoursEnd: '17:00', bonusThreshold: 50, bonusAmount: 200 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion d'Équipe</h2>
          <p className="text-sm text-slate-400">{agents.length} membres</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium hover:bg-[#5B54E6] transition-all">
          <Plus size={16} /> Nouveau Membre
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Ajouter un membre</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom complet" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]">
              <option value="confirmatrice_whatsapp">WhatsApp</option>
              <option value="confirmatrice_appel">Appel</option>
            </select>
            <input type="number" value={form.dailyGoal} onChange={e => setForm({ ...form, dailyGoal: +e.target.value })} placeholder="Objectif journalier" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          </div>
          <button onClick={handleAdd} className="w-full py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium hover:bg-[#5B54E6] transition-all">
            Ajouter le Membre
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {agents.map(agent => {
          const agentOrders = orders.filter(o => o.assignedTo === agent.id);
          const confirmed = agentOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;
          const rate = agentOrders.length > 0 ? Math.round((confirmed / agentOrders.length) * 100) : 0;
          const todayOrders = agentOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
          const todayConfirmed = todayOrders.filter(o => o.status === 'confirmé' || o.status === 'livré').length;

          return (
            <div key={agent.id} className={`bg-[#1E293B] rounded-xl border p-4 transition-all ${agent.isActive ? 'border-slate-700/50' : 'border-red-500/30 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center text-lg font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${agent.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {agent.isActive ? 'ACTIF' : 'ARRÊTÉ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {agent.role === 'confirmatrice_whatsapp' ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1"><MessageSquare size={10} /> WhatsApp</span>
                      ) : (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1"><Phone size={10} /> Appel</span>
                      )}
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {agent.workingHoursStart} - {agent.workingHoursEnd}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button onClick={() => toggleUserActive(agent.id)} className={`p-2 rounded-lg transition-all ${agent.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {agent.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-700/30">
                <div className="text-center">
                  <p className="text-lg font-bold">{agentOrders.length}</p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">{confirmed}</p>
                  <p className="text-[10px] text-slate-500">Confirmé</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#6C63FF]">{rate}%</p>
                  <p className="text-[10px] text-slate-500">Taux</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-lg font-bold">{todayConfirmed}</p>
                    <span className="text-[10px] text-slate-500">/ {agent.dailyGoal}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Aujourd'hui</p>
                </div>
              </div>

              {/* Performance indicators */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs">
                  <Target size={12} className="text-[#6C63FF]" />
                  <span className="text-slate-400">Score: <span className="text-white font-semibold">{agent.performanceScore}</span></span>
                </div>
                {agent.streakDays > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame size={12} /> {agent.streakDays} jours
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400">Commission: <span className="text-emerald-400 font-semibold">{agent.totalCommissionEarned} DH</span></span>
                </div>
              </div>

              {/* Daily Goal Progress */}
              <div className="mt-3">
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${todayConfirmed >= agent.dailyGoal ? 'bg-emerald-500' : 'bg-[#6C63FF]'}`} style={{ width: `${Math.min(100, (todayConfirmed / agent.dailyGoal) * 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

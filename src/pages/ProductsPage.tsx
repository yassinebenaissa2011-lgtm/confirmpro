import { useState } from 'react';
import { useAppStore } from '../store';
import { STATUS_COLORS } from '../types';
import {
  Plus, Edit2, Trash2, Package, Link2, DollarSign,
  Users, Check, X, ChevronDown, ExternalLink
} from 'lucide-react';

export default function ProductsPage() {
  const { products, users, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', price: 0, baseCommission: 0, googleSheetUrl: '', teamType: 'whatsapp' as 'whatsapp' | 'appel' | 'both',
    assignedAgents: [] as string[], variantName: '', variantPrice: 0, variantCommission: 0,
  });

  const resetForm = () => setForm({ name: '', price: 0, baseCommission: 0, googleSheetUrl: '', teamType: 'whatsapp', assignedAgents: [], variantName: '', variantPrice: 0, variantCommission: 0 });

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) {
      updateProduct(editingId, { name: form.name, price: form.price, baseCommission: form.baseCommission, googleSheetUrl: form.googleSheetUrl, teamType: form.teamType, assignedAgents: form.assignedAgents });
    } else {
      addProduct({ name: form.name, price: form.price, baseCommission: form.baseCommission, googleSheetUrl: form.googleSheetUrl, teamType: form.teamType, assignedAgents: form.assignedAgents });
    }
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const activeAgents = users.filter(u => u.role !== 'admin' && u.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Catalogue des Produits</h2>
          <p className="text-sm text-slate-400">{products.length} produits</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium hover:bg-[#5B54E6] transition-all"
        >
          <Plus size={16} /> Nouveau Produit
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{editingId ? 'Modifier' : 'Nouveau'} Produit</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nom du produit</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" placeholder="Ex: Crème Anti-Âge" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Prix (DH)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Commission (DH)</label>
                <input type="number" value={form.baseCommission} onChange={e => setForm({ ...form, baseCommission: +e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Lien Google Sheet</label>
              <input type="url" value={form.googleSheetUrl} onChange={e => setForm({ ...form, googleSheetUrl: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" placeholder="https://docs.google.com/spreadsheets/..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Équipe assignée</label>
              <select value={form.teamType} onChange={e => setForm({ ...form, teamType: e.target.value as any })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]">
                <option value="whatsapp">WhatsApp</option>
                <option value="appel">Appel</option>
                <option value="both">Les deux</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Agents assignés</label>
            <div className="flex flex-wrap gap-2">
              {activeAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setForm({
                    ...form,
                    assignedAgents: form.assignedAgents.includes(agent.id)
                      ? form.assignedAgents.filter(a => a !== agent.id)
                      : [...form.assignedAgents, agent.id]
                  })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    form.assignedAgents.includes(agent.id)
                      ? 'bg-[#6C63FF]/20 border-[#6C63FF]/30 text-[#6C63FF]'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium hover:bg-[#5B54E6] transition-all">
              {editingId ? 'Sauvegarder' : 'Créer le Produit'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm hover:text-white transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-3">
        {products.map(product => (
          <div key={product.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {product.isActive ? 'ACTIF' : 'INACTIF'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold uppercase">
                    {product.teamType}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500">Prix</span>
                    <p className="font-semibold text-sm mt-0.5">{product.price} DH</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Commission</span>
                    <p className="font-semibold text-sm mt-0.5 text-emerald-400">{product.baseCommission} DH</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Variantes</span>
                    <p className="font-semibold text-sm mt-0.5">{product.variants.length}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Agents</span>
                    <p className="font-semibold text-sm mt-0.5">{product.assignedAgents.length}</p>
                  </div>
                </div>

                {/* Variants */}
                {product.variants.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <p className="text-[10px] text-slate-500 font-semibold mb-2 uppercase">Variantes / Packs</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => (
                        <div key={v.id} className="bg-slate-800/50 rounded-lg px-3 py-2 text-xs">
                          <span className="font-medium">{v.name}</span>
                          <span className="text-slate-500 ml-2">{v.price} DH</span>
                          <span className="text-emerald-400 ml-1">({v.commission} DH com.)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Sheet */}
                {product.googleSheetUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <a href={product.googleSheetUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#6C63FF] hover:underline flex items-center gap-1">
                      <Link2 size={12} /> Ouvrir Google Sheet
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setForm({
                      name: product.name, price: product.price, baseCommission: product.baseCommission,
                      googleSheetUrl: product.googleSheetUrl, teamType: product.teamType,
                      assignedAgents: product.assignedAgents, variantName: '', variantPrice: 0, variantCommission: 0,
                    });
                    setEditingId(product.id);
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

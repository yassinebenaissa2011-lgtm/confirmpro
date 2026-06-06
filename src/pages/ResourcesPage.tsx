import { useState } from 'react';
import { useAppStore } from '../store';
import { MessageSquare, FileText, AlertCircle, Ban, Settings as SettingsIcon, Plus, Trash2, Edit2, Copy, Check, X, Save, Terminal } from 'lucide-react';

const tabs = [
  { id: 'templates', label: 'Templates WA', icon: MessageSquare },
  { id: 'scripts', label: 'Scripts', icon: FileText },
  { id: 'objections', label: 'Objections', icon: AlertCircle },
  { id: 'blacklist', label: 'Blacklist', icon: Ban },
  { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
];

export default function ResourcesPage() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'confirmatrice_appel' ? 'scripts' : 'templates');

  // Determine which tabs to show
  const visibleTabs = currentUser?.role === 'admin' ? tabs : currentUser?.role === 'confirmatrice_appel'
    ? tabs.filter(t => ['scripts', 'objections'].includes(t.id))
    : tabs.filter(t => ['templates'].includes(t.id));

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'scripts' && <ScriptsTab />}
      {activeTab === 'objections' && <ObjectionsTab />}
      {activeTab === 'blacklist' && <BlacklistTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}

function TemplatesTab() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', content: '', category: 'confirmation' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.name || !form.content) return;
    if (editId) {
      updateTemplate(editId, form);
    } else {
      addTemplate(form);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', content: '', category: 'confirmation' });
  };

  const copyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Templates WhatsApp</h3>
        <button onClick={() => { setForm({ name: '', content: '', category: 'confirmation' }); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white text-xs font-medium hover:bg-[#5B54E6]">
          <Plus size={14} /> Nouveau
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{editId ? 'Modifier' : 'Nouveau'} Template</h4>
            <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={16} className="text-slate-400" /></button>
          </div>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom du template" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Contenu (utilisez {{nom}}, {{produit}}, {{ville}})" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF] h-24 resize-none" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]">
            <option value="confirmation">Confirmation</option>
            <option value="rappel">Rappel</option>
            <option value="suivi">Suivi</option>
            <option value="promotion">Promotion</option>
          </select>
          <button onClick={handleSave} className="w-full py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium">{editId ? 'Sauvegarder' : 'Créer'}</button>
        </div>
      )}

      {templates.map(t => (
        <div key={t.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{t.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{t.category}</span>
              </div>
              <p className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded-lg mt-2 font-mono">{t.content}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => copyTemplate(t.content, t.id)} className="p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-slate-800">
                {copiedId === t.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <button onClick={() => { setForm({ name: t.name, content: t.content, category: t.category }); setEditId(t.id); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <Edit2 size={14} />
              </button>
              <button onClick={() => deleteTemplate(t.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScriptsTab() {
  const { callScripts, updateCallScript, currentUser } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const myScript = callScripts.find(s => s.userId === currentUser?.id);
  const baseScript = callScripts.find(s => s.userId === 'base');
  const displayScript = myScript || baseScript;

  const handleSave = () => {
    if (currentUser) {
      updateCallScript(currentUser.id, content);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Script d'Appel</h3>
          <p className="text-xs text-slate-400">{myScript?.isPersonalized ? 'Script personnalisé' : 'Script par défaut'}</p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={() => { setContent(displayScript?.content ?? ''); setEditing(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white text-xs font-medium">
              <Edit2 size={14} /> Personnaliser
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs">Annuler</button>
              <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium">
                <Save size={14} /> {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full bg-[#1E293B] border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 font-mono h-80 resize-none focus:outline-none focus:border-[#6C63FF]"
        />
      ) : (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {(displayScript?.content ?? '').split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>;
              if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-semibold text-[#6C63FF] mt-3 mb-1">{line.slice(3)}</h3>;
              return line ? <p key={i} className="text-sm text-slate-300 my-1">{line}</p> : <br key={i} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ObjectionsTab() {
  const { objections, addObjection, deleteObjection, currentUser } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', response: '', copyText: '' });
  const isAdmin = currentUser?.role === 'admin';

  const handleAdd = () => {
    if (!form.question || !form.response) return;
    addObjection({ ...form, copyText: form.copyText || form.response });
    setShowForm(false);
    setForm({ question: '', response: '', copyText: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Objections Courantes</h3>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white text-xs font-medium">
            <Plus size={14} /> Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-2">
          <input type="text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="L'objection (ex: C'est trop cher)" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          <textarea value={form.response} onChange={e => setForm({ ...form, response: e.target.value })} placeholder="La réponse" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF] h-20 resize-none" />
          <input type="text" value={form.copyText} onChange={e => setForm({ ...form, copyText: e.target.value })} placeholder="Texte à copier (optionnel)" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-[#6C63FF] text-white text-sm font-medium">Ajouter</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm">Annuler</button>
          </div>
        </div>
      )}

      {objections.map(ob => (
        <div key={ob.id} className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">!</span>
                <h4 className="font-medium text-sm text-red-300">"{ob.question}"</h4>
              </div>
              <p className="text-xs text-slate-300 pl-8">{ob.response}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ob.copyText || ob.response);
                  setCopiedId(ob.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className={`p-2 rounded-lg transition-all ${copiedId === ob.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-[#6C63FF] hover:bg-slate-800'}`}
              >
                {copiedId === ob.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {isAdmin && (
                <button onClick={() => deleteObjection(ob.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlacklistTab() {
  const { blacklist, addBlacklistEntry, removeBlacklistEntry, currentUser } = useAppStore();
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');

  const handleAdd = () => {
    if (!phone) return;
    addBlacklistEntry(phone, reason || 'Pas de raison');
    setPhone('');
    setReason('');
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Liste Noire</h3>

      {/* Add Form */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4">
        <p className="text-xs text-slate-400 mb-3">Les numéros blacklistés seront automatiquement bloqués à la réception de commande.</p>
        <div className="flex gap-2">
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Numéro de téléphone" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Raison" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]" />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-all">
            <Ban size={16} />
          </button>
        </div>
      </div>

      {/* Blacklist entries */}
      {blacklist.map(entry => (
        <div key={entry.id} className="bg-[#1E293B] rounded-xl border border-red-500/20 p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Ban size={14} className="text-red-400" />
              <span className="font-mono text-sm font-semibold">{entry.phone}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{entry.reason}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Ajouté le {new Date(entry.addedAt).toLocaleDateString('fr-FR')}</p>
          </div>
          <button onClick={() => removeBlacklistEntry(entry.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Paramètres</h3>

      {/* Auto-Command Settings */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#6C63FF]" />
          <h4 className="font-semibold text-sm">Auto-Command</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Activer Auto-Command</p>
              <p className="text-[10px] text-slate-500">Interface de saisie rapide par commandes</p>
            </div>
            <button
              onClick={() => updateSettings({ autoCommandEnabled: !settings.autoCommandEnabled })}
              className={`w-12 h-6 rounded-full transition-all ${settings.autoCommandEnabled ? 'bg-[#6C63FF]' : 'bg-slate-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.autoCommandEnabled ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Préfixe de commande</label>
            <div className="flex gap-2">
              {['>', '!', '/'].map(p => (
                <button
                  key={p}
                  onClick={() => updateSettings({ commandPrefix: p })}
                  className={`w-12 h-10 rounded-lg font-mono font-bold text-lg transition-all ${
                    settings.commandPrefix === p ? 'bg-[#6C63FF] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Analyse automatique</p>
              <p className="text-[10px] text-slate-500">Parser les lignes sans préfixe comme des commandes</p>
            </div>
            <button
              onClick={() => updateSettings({ autoParseEnabled: !settings.autoParseEnabled })}
              className={`w-12 h-6 rounded-full transition-all ${settings.autoParseEnabled ? 'bg-[#6C63FF]' : 'bg-slate-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.autoParseEnabled ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-4">
        <h4 className="font-semibold text-sm">Synchronisation Google Sheets</h4>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Intervalle de synchronisation (minutes)</label>
          <select
            value={settings.googleSyncInterval}
            onChange={e => updateSettings({ googleSyncInterval: +e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]"
          >
            <option value={1}>1 minute</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 p-4 space-y-4">
        <h4 className="font-semibold text-sm">Alertes & Notifications</h4>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Délai alerte commande en attente (heures)</label>
          <input
            type="number"
            value={settings.alertDelayHours}
            onChange={e => updateSettings({ alertDelayHours: +e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF] w-24"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Rapport journalier automatique</p>
            <p className="text-[10px] text-slate-500">Envoyé chaque matin à 8h00</p>
          </div>
          <button
            onClick={() => updateSettings({ dailyReportEnabled: !settings.dailyReportEnabled })}
            className={`w-12 h-6 rounded-full transition-all ${settings.dailyReportEnabled ? 'bg-[#6C63FF]' : 'bg-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.dailyReportEnabled ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Terminal, Send, History, X, ChevronUp, Sparkles } from 'lucide-react';

const COMMAND_SUGGESTIONS = [
  { cmd: '> [nom] [téléphone] [produit]', desc: 'Créer une nouvelle commande' },
  { cmd: '!confirm [ORD-XXXX]', desc: 'Confirmer une commande' },
  { cmd: '!suivi [ORD-XXXX]', desc: 'Mettre en suivi' },
  { cmd: '!annuler [ORD-XXXX]', desc: 'Annuler une commande' },
  { cmd: '!snooze [ORD-XXXX] [durée]', desc: 'Reporter (ex: 1h, 2h, 1j)' },
  { cmd: '!note [ORD-XXXX] [texte]', desc: 'Ajouter une note' },
  { cmd: '!search [terme]', desc: 'Rechercher' },
  { cmd: '!blacklist [numéro] [raison]', desc: 'Ajouter à la Blacklist' },
];

export default function AutoCommand() {
  const { settings, executeAutoCommand, autoCommandHistory } = useAppStore();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result) {
      const t = setTimeout(() => setResult(null), 4000);
      return () => clearTimeout(t);
    }
  }, [result]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const res = executeAutoCommand(input);
    setResult(res);
    setInput('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = input.trim()
    ? COMMAND_SUGGESTIONS.filter(s =>
        s.cmd.toLowerCase().includes(input.toLowerCase().split(' ')[0]) ||
        s.desc.toLowerCase().includes(input.toLowerCase())
      )
    : COMMAND_SUGGESTIONS;

  if (!settings.autoCommandEnabled) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-0 lg:left-64 right-0 z-30 px-3 lg:px-6">
      {/* Result Toast */}
      {result && (
        <div className={`mx-auto max-w-2xl mb-2 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in ${
          result.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {result.message}
        </div>
      )}

      {/* History Panel */}
      {showHistory && autoCommandHistory.length > 0 && (
        <div className="mx-auto max-w-2xl mb-2 bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <History size={12} /> Historique
            </span>
            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {autoCommandHistory.map((entry, i) => (
              <div key={i} className="px-3 py-1.5 border-b border-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{entry.command}</span>
                <span className="text-xs text-slate-300">{entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <div className="mx-auto max-w-2xl mb-1 bg-[#1E293B] rounded-t-xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-2">
            <p className="text-[10px] text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <Sparkles size={10} /> COMMANDES DISPONIBLES
            </p>
            {filteredSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s.cmd.split(' ')[0] + ' '); setShowSuggestions(false); inputRef.current?.focus(); }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800/50 flex items-center justify-between transition-all"
              >
                <span className="text-xs font-mono text-[#6C63FF]">{s.cmd}</span>
                <span className="text-[10px] text-slate-500">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="mx-auto max-w-2xl bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Terminal size={16} />
            <span className="text-xs font-mono font-bold text-[#6C63FF]">{settings.commandPrefix}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tapez une commande..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none font-mono"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ChevronUp size={14} className={showSuggestions ? 'rotate-180' : ''} />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg transition-all ${showHistory ? 'text-[#6C63FF] bg-[#6C63FF]/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            >
              <History size={14} />
            </button>
            <button
              onClick={handleSubmit}
              className="p-1.5 rounded-lg bg-[#6C63FF] text-white hover:bg-[#5B54E6] transition-all"
            >
              <Send size={14} />
            </button>
          </div>
          <span className="text-[9px] text-emerald-500/70 hidden sm:block whitespace-nowrap">⚡ Auto-Command actif</span>
        </div>
      </div>
    </div>
  );
}

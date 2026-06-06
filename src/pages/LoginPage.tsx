import { useState } from 'react';
import { useAppStore } from '../store';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAppStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!login(phone, password)) {
      setError('Numero ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#6C63FF] flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-lg shadow-[#6C63FF]/25">CP</div>
          <h1 className="text-2xl font-bold">ConfirmPro</h1>
          <p className="text-slate-400 text-sm">Confirmation des commandes</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold mb-4">Connexion</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Numero de telephone</label>
              <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} placeholder="06XXXXXXXX" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6C63FF]" autoFocus />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Mot de passe</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} placeholder="........" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6C63FF]" />
                <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
            <button onClick={handleLogin} disabled={!phone || !password} className="w-full py-3 rounded-xl bg-[#6C63FF] text-white font-medium text-sm hover:bg-[#5B54E6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><LogIn size={16} /> Se connecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAppStore } from '../store';
import { MessageSquare, Phone, Shield, Eye, EyeOff } from 'lucide-react';

const accounts = [
  { email: 'admin@confirmpro.ma', role: 'admin', name: 'Youssef Admin', icon: Shield, color: '#6C63FF' },
  { email: 'fatima@confirmpro.ma', role: 'whatsapp', name: 'Fatima Zahra', icon: MessageSquare, color: '#10B981' },
  { email: 'amina@confirmpro.ma', role: 'appel', name: 'Amina K.', icon: Phone, color: '#F59E0B' },
];

export default function LoginPage() {
  const { login } = useAppStore();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#6C63FF] flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-lg shadow-[#6C63FF]/25">
            CP
          </div>
          <h1 className="text-3xl font-bold mb-1">ConfirmPro</h1>
          <p className="text-slate-400">نظام تأكيد الطلبات</p>
        </div>

        {/* Demo Accounts */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold mb-1">Connexion</h2>
          <p className="text-sm text-slate-400 mb-5">Choisissez un compte de démonstration</p>

          <div className="space-y-3">
            {accounts.map(account => {
              const Icon = account.icon;
              return (
                <button
                  key={account.email}
                  onClick={() => {
                    setSelectedAccount(account.email);
                    setTimeout(() => login(account.email), 300);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedAccount === account.email
                      ? 'border-[#6C63FF]/50 bg-[#6C63FF]/10 scale-[0.98]'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon size={22} style={{ color: account.color }} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-slate-400">{account.email}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${account.color}20`,
                      color: account.color
                    }}
                  >
                    {account.role.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-600 text-center">
              🔒 Mode démonstration — Toutes les données sont simulées
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ConfirmPro v1.0 — Order Confirmation Management System
        </p>
      </div>
    </div>
  );
}

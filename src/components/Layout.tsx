import React, { useState } from 'react';
import { useAppStore } from '../store';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3, DollarSign,
  Settings, Bell, LogOut, Globe, Menu, X, MessageSquare, Phone,
  Shield, FileText, Ban, ChevronDown, Check
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'commissions', label: 'Commissions', icon: DollarSign },
  { id: 'templates', label: 'Templates', icon: MessageSquare },
  { id: 'scripts', label: 'Scripts', icon: FileText },
  { id: 'blacklist', label: 'Blacklist', icon: Ban },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const whatsappNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'templates', label: 'Templates', icon: MessageSquare },
  { id: 'commissions', label: 'Mes Gains', icon: DollarSign },
];

const appelNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'scripts', label: 'Mon Script', icon: FileText },
  { id: 'commissions', label: 'Mes Gains', icon: DollarSign },
];

export default function Layout({ children }: LayoutProps) {
  const { currentUser, currentPage, setCurrentPage, logout, notifications, markNotificationRead, markAllNotificationsRead, language, setLanguage } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = currentUser?.role === 'admin' ? adminNavItems
    : currentUser?.role === 'confirmatrice_whatsapp' ? whatsappNavItems
    : appelNavItems;

  const unreadNotifs = notifications.filter(n =>
    currentUser && (n.userId === currentUser.id || currentUser.role === 'admin')
  ).filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E293B] border-r border-slate-700/50 min-h-screen fixed left-0 top-0 z-30">
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF] flex items-center justify-center font-bold text-lg">
              CP
            </div>
            <div>
              <h1 className="font-bold text-base">ConfirmPro</h1>
              <p className="text-xs text-slate-400">نظام تأكيد الطلبات</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all mb-1"
          >
            <Globe size={18} />
            {language === 'fr' ? 'العربية' : 'Français'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Overlay Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1E293B] shadow-2xl">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C63FF] flex items-center justify-center font-bold">CP</div>
                <span className="font-bold">ConfirmPro</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 border-b border-slate-700/50">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-[#6C63FF]/30 flex items-center justify-center text-xs font-bold">
                  {currentUser?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    {currentUser?.role === 'admin' ? <Shield size={10} /> : currentUser?.role === 'confirmatrice_whatsapp' ? <MessageSquare size={10} /> : <Phone size={10} />}
                    {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'confirmatrice_whatsapp' ? 'WhatsApp' : 'Appel'}
                  </p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-[#6C63FF]/20 text-[#6C63FF]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                <Menu size={22} />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center font-bold text-sm">CP</div>
                <span className="font-bold text-sm">ConfirmPro</span>
              </div>
              <h2 className="hidden lg:block text-lg font-semibold">
                {navItems.find(n => n.id === currentPage)?.label ?? 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium"
              >
                {language === 'fr' ? 'عر' : 'FR'}
              </button>

              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all relative"
                >
                  <Bell size={20} />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
                      <span className="text-sm font-semibold">Notifications</span>
                      <button onClick={markAllNotificationsRead} className="text-xs text-[#6C63FF] hover:underline flex items-center gap-1">
                        <Check size={12} /> Tout lire
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.filter(n => currentUser && (n.userId === currentUser.id || currentUser.role === 'admin')).slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 border-b border-slate-700/30 cursor-pointer hover:bg-slate-800/50 transition-all ${!n.isRead ? 'bg-slate-800/30' : ''}`}
                        >
                          <p className="text-sm">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-[#6C63FF]/30 flex items-center justify-center text-sm font-bold">
                  {currentUser?.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden md:block">{currentUser?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-slate-700/50 z-30 safe-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'text-[#6C63FF]'
                  : 'text-slate-500'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label.slice(0, 8)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

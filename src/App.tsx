import { useEffect, useState } from 'react';
import { useAppStore } from './store';
import Layout from './components/Layout';
import AutoCommand from './components/AutoCommand';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CommissionsPage from './pages/CommissionsPage';
import ResourcesPage from './pages/ResourcesPage';

function AppContent() {
  const { currentUser, currentPage, syncFromApi, apiConnected, orders, triggerServerSync } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // أول حمل: جيب les commandes من API
    syncFromApi().finally(() => setLoading(false));
    // كل 30 ثانية حدّث
    const interval = setInterval(syncFromApi, 30000);
    return () => clearInterval(interval);
  }, [syncFromApi]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'orders': return <OrdersPage />;
      case 'products': return <ProductsPage />;
      case 'team': return <TeamPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'commissions': return <CommissionsPage />;
      case 'templates': case 'scripts': case 'blacklist': case 'settings': return <ResourcesPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {/* API Status */}
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
          apiConnected 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className={`text-xs ${apiConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {apiConnected 
              ? `🔗 مربوط مع Google Sheets — ${orders.length} طلب` 
              : '⏳ قاري من البيانات المحلية...'}
          </span>
        </div>
        <button
          onClick={triggerServerSync}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-all"
        >
          🔄 Sync Now
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      ) : renderPage()}

      {currentUser && <AutoCommand />}
    </Layout>
  );
}

export default function App() {
  const { currentUser, syncFromApi } = useAppStore();

  useEffect(() => {
    if (currentUser) syncFromApi();
  }, [currentUser, syncFromApi]);

  if (!currentUser) return <LoginPage />;
  return <AppContent />;
}

import { useEffect } from 'react';
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
  const { currentUser, currentPage, syncFromApi, apiConnected } = useAppStore();

  useEffect(() => {
    // حاول تسync مع API كل 30 ثانية
    syncFromApi();
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
      {/* API Status Indicator */}
      {apiConnected && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">🔗 مربوط مع Google Sheets - ت_sync أوتوماتيكياً</span>
        </div>
      )}
      {renderPage()}
      {currentUser && <AutoCommand />}
    </Layout>
  );
}

export default function App() {
  const { currentUser, syncFromApi } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      syncFromApi();
    }
  }, [currentUser, syncFromApi]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return <AppContent />;
}

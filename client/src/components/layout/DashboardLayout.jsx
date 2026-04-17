import { useState } from "react";
import { useAuth }      from "../../context/AuthContext.jsx";
import Sidebar          from "./Sidebar.jsx";
import DashboardNav     from "./DashboardNav.jsx";
import DashboardPage    from "../../pages/DashboardPage.jsx";
import YogaPage         from "../../pages/YogaPage.jsx";
import MeditationPage   from "../../pages/MeditationPage.jsx";
import StorePage        from "../../pages/StorePage.jsx";
import AnalyticsPage    from "../../pages/AnalyticsPage.jsx";
import SubscriptionPage from "../../pages/SubscriptionPage.jsx";
import ProfilePage      from "../../pages/ProfilePage.jsx";
import HelpPage         from "../../pages/HelpPage.jsx";
import ContactPage      from "../../pages/ContactPage.jsx";
import ShopDashboard    from "../../pages/ShopDashboard.jsx";

const USER_PAGES = {
  dashboard:    (p) => <DashboardPage    {...p} />,
  yoga:         (p) => <YogaPage         {...p} />,
  meditation:   ()  => <MeditationPage   />,
  store:        (p) => <StorePage        {...p} />,
  analytics:    ()  => <AnalyticsPage    />,
  subscription: ()  => <SubscriptionPage />,
  profile:      (p) => <ProfilePage      {...p} />,
  help:         ()  => <HelpPage         />,
  contact:      ()  => <ContactPage      />,
};
const SHOP_PAGES = {
  "shop-dashboard": () => <ShopDashboard />,
  "shop-products":  () => <ShopDashboard />,
  "shop-orders":    () => <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">📋</div><p>Order management coming soon</p></div>,
  analytics:        () => <AnalyticsPage />,
  profile:         (p) => <ProfilePage {...p} />,
};

export default function DashboardLayout() {
  const { user, coins, addCoins, logout } = useAuth();
  const defaultPage = user?.role === "shop" ? "shop-dashboard" : "dashboard";
  const [page,        setPage]        = useState(defaultPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMap = user?.role === "shop" ? SHOP_PAGES : USER_PAGES;
  const render  = pageMap[page] ?? pageMap[Object.keys(pageMap)[0]];
  const props   = { user, coins, addCoins, setPage };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar active={page} setActive={setPage} role={user?.role} sidebarOpen={sidebarOpen} />
      <div className="lg:ml-64">
        <DashboardNav user={user} coins={coins} setPage={setPage} setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} onLogout={logout} />
        <main className="pt-16 min-h-screen">
          <div className="p-6 max-w-7xl mx-auto">{render(props)}</div>
        </main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
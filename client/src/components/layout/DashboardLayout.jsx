import { useState, useEffect } from "react";
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
  profile:      ()  => <ProfilePage      />,
  help:         ()  => <HelpPage         />,
  contact:      ()  => <ContactPage      />,
};

const SHOP_PAGES = {
  "shop-dashboard": () => <ShopDashboard />,
  "shop-products":  () => <ShopDashboard />,
  "shop-orders":    () => (
    <div className="text-center py-20 text-gray-400">
      <div className="text-5xl mb-4">📋</div>
      <p>Order management coming soon</p>
    </div>
  ),
  analytics: ()  => <AnalyticsPage />,
  profile:   ()  => <ProfilePage  />,
};

export default function DashboardLayout() {
  const { user, coins, addCoins, refreshCoins, logout } = useAuth();

  const defaultPage = user?.role === "shop" ? "shop-dashboard" : "dashboard";
  const [page,    setPage]    = useState(defaultPage);
  const [isOpen,  setIsOpen]  = useState(true); // sidebar visible by default

  // Add/remove "sidebar-collapsed" on the root #app-shell element.
  // index.css reads this class to drive ALL the transitions — sidebar,
  // content margin, and nav left — in perfect sync, no JS delay.
  useEffect(() => {
    const shell = document.getElementById("app-shell");
    if (!shell) return;
    if (isOpen) shell.classList.remove("sidebar-collapsed");
    else        shell.classList.add("sidebar-collapsed");
  }, [isOpen]);

  const toggle = () => setIsOpen(o => !o);

  const pageMap = user?.role === "shop" ? SHOP_PAGES : USER_PAGES;
  const render  = pageMap[page] ?? pageMap[Object.keys(pageMap)[0]];
  const props   = { user, coins, addCoins, refreshCoins, setPage };

  return (
    <div id="app-shell" className="min-h-screen bg-gray-50/50">

      <Sidebar
        active={page}
        setActive={setPage}
        role={user?.role}
        isOpen={isOpen}
        toggle={toggle}
      />

      {/* Content area — margin-left driven by CSS class on #app-shell */}
      <div className="layout-content">
        <DashboardNav
          user={user}
          coins={coins}
          setPage={setPage}
          toggle={toggle}
          isOpen={isOpen}
          onLogout={logout}
        />
        <main style={{ paddingTop: 64, minHeight: "100vh" }}>
          <div className="p-6 max-w-7xl mx-auto">
            {render(props)}
          </div>
        </main>
      </div>

    </div>
  );
}
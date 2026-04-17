import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import PublicLanding   from "./pages/PublicLanding.jsx";
import AuthModal       from "./components/layout/AuthModal.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

function AppRouter() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧘</div>
          <p className="text-emerald-700 font-semibold text-sm">Loading YogaAI…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <PublicLanding onLogin={() => setShowAuth(true)} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return <DashboardLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
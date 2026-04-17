import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardNav({ user, coins, setPage, setSidebarOpen, sidebarOpen, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 flex items-center px-4 gap-4">
      {/* hamburger for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-600 text-xl">{sidebarOpen ? "✕" : "☰"}</span>
      </button>

      {/* brand (mobile only) */}
      <div className="lg:hidden font-bold text-emerald-700 text-lg flex-1">YogaAI</div>

      <div className="hidden lg:block flex-1" />

      {/* coins */}
      <button
        onClick={() => setPage("store")}
        className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
      >
        <span className="text-base">🪙</span>
        <span className="text-sm font-bold text-amber-700">{coins}</span>
      </button>

      {/* notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3">
            <p className="font-semibold text-gray-800 text-sm">Notifications</p>
            {[
              { icon: "🔥", text: "7-day streak! Keep it up.", time: "now" },
              { icon: "🪙", text: "You earned 10 coins from your last session.", time: "2h ago" },
              { icon: "⭐", text: "New pose unlocked: Natarajasana", time: "yesterday" },
            ].map((n, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">{n.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-700">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* avatar + logout */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user?.name}
        </span>
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-rose-500 transition-colors ml-1"
          title="Logout"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
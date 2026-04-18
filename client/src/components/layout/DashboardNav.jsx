import { useState, useEffect, useRef } from "react";
import { sessionApi } from "../../utils/api.js";

// ─── Notification builder ────────────────────────────────────────────────────
// Derives real notifications from the user's actual session history.
// No hardcoded strings — every message comes from real data.

function buildNotifications(sessions, streak, coins) {
  if (!sessions?.length) return [];

  const notifs = [];
  const now    = Date.now();

  // Helper: human-readable relative time
  const relTime = (isoDate) => {
    const diff = now - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2)   return "just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs  < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };

  const last = sessions[0]; // most recent session (sorted desc by server)

  // 1. Coins earned from last session
  if (last?.coins > 0) {
    notifs.push({
      id:   "coins_last",
      icon: "🪙",
      text: `You earned ${last.coins} coin${last.coins !== 1 ? "s" : ""} from your ${last.poseName} session.`,
      time: relTime(last.createdAt),
      ts:   new Date(last.createdAt).getTime(),
    });
  }

  // 2. Streak milestone
  if (streak >= 3) {
    notifs.push({
      id:   "streak",
      icon: "🔥",
      text: streak >= 7
        ? `${streak}-day streak! You're on fire 🔥 Keep it up!`
        : `${streak}-day streak! Great consistency.`,
      time: "today",
      ts:   now - 1000, // just after the last session
    });
  }

  // 3. Best score achievement (score ≥ 90 in last 3 sessions)
  const recentBest = sessions.slice(0, 3).find((s) => s.score >= 90);
  if (recentBest) {
    notifs.push({
      id:   "best_score",
      icon: "🏆",
      text: `Excellent! You scored ${recentBest.score}% on ${recentBest.poseName}.`,
      time: relTime(recentBest.createdAt),
      ts:   new Date(recentBest.createdAt).getTime(),
    });
  }

  // 4. First session ever
  if (sessions.length === 1) {
    notifs.push({
      id:   "first_session",
      icon: "🌟",
      text: "Welcome to YogaAI! You've completed your first session.",
      time: relTime(last.createdAt),
      ts:   new Date(last.createdAt).getTime(),
    });
  }

  // 5. Session count milestones (5, 10, 25, 50…)
  const milestones = [5, 10, 25, 50, 100];
  const hit = milestones.find((m) => sessions.length === m);
  if (hit) {
    notifs.push({
      id:   `milestone_${hit}`,
      icon: "🎯",
      text: `You've completed ${hit} sessions! Amazing dedication.`,
      time: relTime(last.createdAt),
      ts:   new Date(last.createdAt).getTime() - 500,
    });
  }

  // 6. Coin balance milestone
  const coinMilestones = [50, 100, 250, 500];
  const coinHit = coinMilestones.slice().reverse().find((m) => coins >= m);
  if (coinHit) {
    notifs.push({
      id:   `coins_${coinHit}`,
      icon: "💰",
      text: `You've collected over ${coinHit} Yoga Coins! Visit the store to redeem them.`,
      time: "today",
      ts:   now - 2000,
    });
  }

  // Sort by timestamp descending, take top 5
  return notifs
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);
}

// ─── Streak calculator (mirrors DashboardPage logic) ──────────────────────────
function computeStreak(sessions) {
  const toKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const dateSet = new Set((sessions || []).map((s) => s.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    if (dateSet.has(toKey(d))) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardNav({
  user, coins, setPage, setSidebarOpen, sidebarOpen, onLogout,
}) {
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifs,     setNotifs]     = useState([]);
  const [unreadCount,setUnreadCount]= useState(0);
  const [lastSeenTs, setLastSeenTs] = useState(() => {
    // Persist the last time the user opened notifications
    return parseInt(localStorage.getItem("yogaai_notif_seen") || "0", 10);
  });
  const dropdownRef = useRef(null);

  // Fetch sessions and build real notifications
  useEffect(() => {
    sessionApi.getAll()
      .then(({ sessions }) => {
        const streak = computeStreak(sessions);
        const built  = buildNotifications(sessions, streak, coins);
        setNotifs(built);
        // Unread = notifications newer than last seen timestamp
        setUnreadCount(built.filter((n) => n.ts > lastSeenTs).length);
      })
      .catch(() => {}); // silently fail — notifications are non-critical
  }, [coins]); // re-run when coins change (means a new session just finished)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotifications = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen) {
      // Mark all as read
      const ts = Date.now();
      setLastSeenTs(ts);
      setUnreadCount(0);
      localStorage.setItem("yogaai_notif_seen", String(ts));
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 flex items-center px-4 gap-4">

      {/* Hamburger — mobile only */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-600 text-xl">{sidebarOpen ? "✕" : "☰"}</span>
      </button>

      {/* Brand — mobile only */}
      <div className="lg:hidden font-bold text-emerald-700 text-lg flex-1">YogaAI</div>

      <div className="hidden lg:block flex-1" />

      {/* ── Coin balance (live from AuthContext) ── */}
      <button
        onClick={() => setPage("store")}
        className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
      >
        <span className="text-base">🪙</span>
        <span className="text-sm font-bold text-amber-700">{coins}</span>
      </button>

      {/* ── Notifications ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={openNotifications}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🔔</span>
          {/* Red dot only shown when there are unread notifications */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">Notifications</p>
              {notifs.length > 0 && (
                <span className="text-xs text-gray-400">{notifs.length} recent</span>
              )}
            </div>

            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🧘</div>
                <p className="text-sm text-gray-400">No notifications yet.</p>
                <p className="text-xs text-gray-300 mt-1">Complete a session to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifs.map((n) => (
                  <div key={n.id} className="flex gap-3 items-start px-4 py-3 hover:bg-gray-50 transition-colors">
                    <span className="text-lg mt-0.5 flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-2.5 border-t border-gray-50">
              <button
                onClick={() => { setPage("analytics"); setNotifOpen(false); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                View full analytics →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User avatar + logout ── */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
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
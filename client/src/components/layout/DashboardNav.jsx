import { useState, useEffect, useRef } from "react";
import { sessionApi } from "../../utils/api.js";

function buildNotifications(sessions, coins) {
  if (!sessions?.length) return [];
  const now = Date.now();
  const relTime = (iso) => {
    const diff = now - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 2)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return h < 48 ? "yesterday" : `${Math.floor(h / 24)}d ago`;
  };
  const notifs = [];
  const last   = sessions[0];
  if (last?.coins > 0)
    notifs.push({ id: "coins", icon: "🪙", text: `You earned ${last.coins} coins from your ${last.poseName} session.`, time: relTime(last.createdAt), ts: new Date(last.createdAt).getTime() });
  const streak = (() => {
    const set = new Set(sessions.map(s => s.date));
    let s = 0; const d = new Date();
    const key = dt => dt.toISOString().split("T")[0];
    while (set.has(key(d))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();
  if (streak >= 3)
    notifs.push({ id: "streak", icon: "🔥", text: `${streak}-day streak! ${streak >= 7 ? "You're on fire 🔥" : "Great consistency."}`, time: "today", ts: now - 500 });
  const best = sessions.slice(0, 3).find(s => s.score >= 90);
  if (best)
    notifs.push({ id: "best", icon: "🏆", text: `Excellent! You scored ${best.score}% on ${best.poseName}.`, time: relTime(best.createdAt), ts: new Date(best.createdAt).getTime() });
  if (sessions.length === 1)
    notifs.push({ id: "first", icon: "🌟", text: "Welcome! You've completed your first YogaAI session.", time: relTime(last.createdAt), ts: new Date(last.createdAt).getTime() - 200 });
  const coinMilestone = [500, 250, 100, 50].find(m => coins >= m);
  if (coinMilestone)
    notifs.push({ id: `cm_${coinMilestone}`, icon: "💰", text: `You've collected over ${coinMilestone} Yoga Coins! Visit the store.`, time: "today", ts: now - 1000 });
  return notifs.sort((a, b) => b.ts - a.ts).slice(0, 5);
}

export default function DashboardNav({ user, coins, setPage, toggle, isOpen, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [unread,    setUnread]    = useState(0);
  const [lastSeen,  setLastSeen]  = useState(() => parseInt(localStorage.getItem("yogaai_notif_seen") || "0", 10));
  const dropRef = useRef(null);

  useEffect(() => {
    sessionApi.getAll()
      .then(({ sessions }) => {
        const built = buildNotifications(sessions, coins);
        setNotifs(built);
        setUnread(built.filter(n => n.ts > lastSeen).length);
      })
      .catch(() => {});
  }, [coins]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openNotif = () => {
    setNotifOpen(o => !o);
    if (!notifOpen) {
      const ts = Date.now();
      setLastSeen(ts); setUnread(0);
      localStorage.setItem("yogaai_notif_seen", String(ts));
    }
  };

  return (
    /* layout-nav class in index.css handles left/transition — driven by #app-shell class */
    <header className="layout-nav">

      {/* Hamburger — always visible, same action as sidebar tab */}
      <button
        onClick={toggle}
        style={{
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 10, border: "none", background: "transparent",
          cursor: "pointer", fontSize: 18, color: "#6b7280",
          flexShrink: 0, transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        aria-label="Toggle sidebar"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div style={{ flex: 1 }} />

      {/* Coins */}
      <button
        onClick={() => setPage("store")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 999, padding: "6px 12px", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
        onMouseLeave={e => e.currentTarget.style.background = "#fffbeb"}
      >
        <span style={{ fontSize: 16 }}>🪙</span>
        <span style={{ fontSize: 14, fontWeight: "bold", color: "#92400e" }}>{coins}</span>
      </button>

      {/* Notifications */}
      <div style={{ position: "relative" }} ref={dropRef}>
        <button
          onClick={openNotif}
          style={{
            position: "relative", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 10, border: "none", background: "transparent",
            cursor: "pointer", fontSize: 20,
          }}
        >
          🔔
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              minWidth: 16, height: 16,
              background: "#ef4444", borderRadius: 999,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 9, fontWeight: "bold", padding: "0 3px",
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <div style={{
            position: "absolute", right: 0, top: 48,
            width: 320, background: "white", borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)", border: "1px solid #f3f4f6",
            zIndex: 999, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>Notifications</span>
              {notifs.length > 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>{notifs.length} recent</span>}
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🧘</div>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>No notifications yet.</p>
                <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>Complete a session to get started!</p>
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifs.map(n => (
                  <div key={n.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderBottom: "1px solid #f9fafb" }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.text}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: "10px 16px", borderTop: "1px solid #f9fafb" }}>
              <button onClick={() => { setPage("analytics"); setNotifOpen(false); }}
                style={{ fontSize: 12, color: "#10b981", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                View full analytics →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar + name + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32,
          background: "linear-gradient(135deg,#10b981,#14b8a6)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 13, fontWeight: "bold", flexShrink: 0,
        }}>
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#374151", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name}
        </span>
        <button onClick={onLogout}
          style={{ fontSize: 13, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}
          title="Logout">⏻</button>
      </div>
    </header>
  );
}
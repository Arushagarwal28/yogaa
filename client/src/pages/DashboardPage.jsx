import { useState, useEffect } from "react";
import GlassCard        from "../components/ui/GlassCard.jsx";
import StatCard         from "../components/ui/StatCard.jsx";
import Badge            from "../components/ui/Badge.jsx";
import Btn              from "../components/ui/Btn.jsx";
import { YOGA_POSES }   from "../data/poses.js";
import { sessionApi }   from "../utils/api.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Build this-week array (Mon → Sun) from a sessions list
function buildWeekData(sessions) {
  const sessionMap = {};
  sessions.forEach(({ date, score }) => {
    if (!sessionMap[date]) sessionMap[date] = { scores: [] };
    sessionMap[date].scores.push(score);
  });

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    // Start from Monday of current week
    const day = new Date();
    const dayOfWeek = day.getDay(); // 0=Sun
    const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    day.setDate(day.getDate() + diffToMon + i);

    const key    = toDateKey(day);
    const label  = day.toLocaleDateString("en-US", { weekday: "short" });
    const entry  = sessionMap[key];
    const done   = !!entry;
    const score  = done
      ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length)
      : 0;
    return { day: label, done, score, isFuture: key > toDateKey(new Date()) };
  });
}

// Compute streak: consecutive days with at least one session up to today
function computeStreak(sessions) {
  const dateSet = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = toDateKey(d);
    if (dateSet.has(key)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// Total minutes practiced this calendar month
function monthMinutes(sessions) {
  const prefix = toDateKey(new Date()).slice(0, 7); // "YYYY-MM"
  return Math.floor(
    sessions
      .filter((s) => s.date?.startsWith(prefix))
      .reduce((acc, s) => acc + (s.duration ?? 0), 0) / 60
  );
}

// Average score across all sessions
function avgScore(sessions) {
  if (!sessions.length) return 0;
  return Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage({ user, coins, setPage }) {
  const [sessions, setSessions] = useState(null); // null = loading
  const [error,    setError]    = useState(false);

  useEffect(() => {
    sessionApi.getAll()
      .then(({ sessions: s }) => setSessions(s ?? []))
      .catch(() => { setSessions([]); setError(true); });
  }, []);

  const loading = sessions === null;

  // Derived values — fall back to 0/empty while loading
  const streak      = sessions ? computeStreak(sessions)   : 0;
  const totalMins   = sessions ? monthMinutes(sessions)    : 0;
  const accuracy    = sessions ? avgScore(sessions)        : 0;
  const weekData    = sessions ? buildWeekData(sessions)   : Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), done: false, score: 0, isFuture: false };
  });

  const stats = [
    { icon: "🔥", label: "Daily Streak",   value: loading ? "…" : `${streak} day${streak !== 1 ? "s" : ""}`, sub: "Keep it up!",             color: "#f59e0b" },
    { icon: "⏱️", label: "This Month",     value: loading ? "…" : `${totalMins} min`,                        sub: "Total practice time",     color: "#3b82f6" },
    { icon: "🎯", label: "Avg Accuracy",   value: loading ? "…" : `${accuracy}%`,                            sub: "Across all sessions",     color: "#8b5cf6" },
    { icon: "🪙", label: "Yoga Coins",     value: `${coins}`,                                                 sub: "Redeemable in store",     color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-6 top-4 text-8xl opacity-20 select-none">🧘</div>
        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-2">{user?.name} 🌿</h1>
          <p className="text-emerald-100 text-sm mb-5">
            {streak > 0
              ? `🔥 ${streak}-day streak! Keep going!`
              : "Ready for today's yoga session? Your body thanks you!"}
          </p>
          <Btn onClick={() => setPage("yoga")} className="bg-white !text-emerald-700 hover:bg-emerald-50 !shadow-none font-bold">
            Start AI Yoga Session →
          </Btn>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Week grid + quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="font-bold text-gray-800 mb-5">📅 This Week's Practice</h3>
          {loading ? (
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-xl bg-gray-100 animate-pulse" />
                  <div className="w-6 h-2 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                {weekData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                      ${d.done
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg"
                        : d.isFuture
                        ? "bg-gray-50 text-gray-200 border-2 border-dashed border-gray-200"
                        : "bg-gray-100 text-gray-300"}`}>
                      {d.done ? "✓" : ""}
                    </div>
                    <span className="text-xs text-gray-500">{d.day}</span>
                    {d.score > 0 && (
                      <span className="text-xs font-semibold text-emerald-600">{d.score}%</span>
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <p className="text-xs text-amber-500 mt-3">⚠️ Could not load session data — showing empty state.</p>
              )}
              {!error && sessions?.length === 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">No sessions yet this week. Start your first session! 🧘</p>
              )}
            </>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">🏆 Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: "🧘", label: "Start Yoga",     page: "yoga"       },
              { icon: "🌸", label: "Meditate",        page: "meditation" },
              { icon: "🛍️", label: "Visit Store",    page: "store"      },
              { icon: "📊", label: "View Analytics", page: "analytics"  },
            ].map((a) => (
              <button key={a.label} onClick={() => setPage(a.page)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  {a.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{a.label}</span>
                <span className="ml-auto text-gray-300 group-hover:text-gray-500">→</span>
              </button>
            ))}
          </div>

          {/* Recent session highlight */}
          {sessions?.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Last Session</p>
              <p className="text-sm font-bold text-gray-800">{sessions[0].poseName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Score: <strong className="text-emerald-600">{sessions[0].score}%</strong>
                {" · "}
                {Math.floor((sessions[0].duration ?? 0) / 60)}m {(sessions[0].duration ?? 0) % 60}s
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recommended poses */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">🧘 Recommended Poses</h3>
          <Btn variant="ghost" onClick={() => setPage("yoga")} className="text-emerald-600">View All →</Btn>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {YOGA_POSES.slice(0, 4).map((pose) => (
            <div key={pose.id} onClick={() => setPage("yoga")}
              className="p-4 rounded-2xl cursor-pointer hover:scale-105 transition-all"
              style={{ background: `linear-gradient(135deg,${pose.color}15,${pose.color}30)`, border: `1px solid ${pose.color}40` }}>
              <div className="text-2xl mb-2">🧘</div>
              <div className="font-semibold text-gray-800 text-sm">{pose.name}</div>
              <div className="text-xs text-gray-500 mt-1 mb-2">{pose.sanskrit}</div>
              <Badge color={pose.difficulty === "Beginner" ? "green" : pose.difficulty === "Intermediate" ? "blue" : "purple"}>
                {pose.difficulty}
              </Badge>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
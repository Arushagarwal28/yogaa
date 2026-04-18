import { useState, useEffect } from "react";
import GlassCard    from "../components/ui/GlassCard.jsx";
import StatCard     from "../components/ui/StatCard.jsx";
import { sessionApi } from "../utils/api.js";

// ─── Fallback shown when the API call fails (e.g. no sessions yet) ────────────
const FALLBACK = {
  summary:        { totalSessions: 0, totalMinutes: 0, avgScore: 0, bestScore: 0, streak: 0 },
  weekly:         Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), accuracy: 0, duration: 0, sessions: 0 };
  }),
  posePerformance: [],
  weakestJoints:   [],
  calendarDates:   {},
};

// ─── Calendar helpers ─────────────────────────────────────────────────────────

// Returns "YYYY-MM-DD" for a Date object using LOCAL date (not UTC shift)
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Build a full calendar grid for a given year+month.
// Returns array of { dateKey, dayNum, status, score } with leading nulls for grid alignment.
function buildCalendarGrid(year, month, calendarDates) {
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey    = toDateKey(new Date());

  const cells = [];

  // leading empty cells so day 1 falls on the right weekday column
  for (let i = 0; i < firstDay; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const entry   = calendarDates[dateKey];
    let status;
    if (dateKey > todayKey)       status = "future";
    else if (entry?.done)         status = "done";
    else                          status = "missed";

    cells.push({ dateKey, dayNum: d, status, score: entry?.avgScore ?? null });
  }

  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Calendar navigation state
  const today  = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    sessionApi.getAnalytics()
      .then((res) => {
        // Build calendarDates map from session list if API returns sessions
        // The server's getFullAnalytics returns { summary, weekly, posePerformance, weakestJoints }
        // We also need per-day session presence — derive it from sessions endpoint
        setData(res);
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  // Also fetch raw sessions to build the calendar map
  const [calendarDates, setCalendarDates] = useState({});
  useEffect(() => {
    sessionApi.getAll()
      .then(({ sessions }) => {
        // Build { "YYYY-MM-DD": { done: true, avgScore: number, count: number } }
        const map = {};
        (sessions || []).forEach(({ date, score }) => {
          if (!map[date]) map[date] = { done: true, totalScore: 0, count: 0 };
          map[date].totalScore += score;
          map[date].count      += 1;
        });
        // Compute avgScore per date
        Object.keys(map).forEach((k) => {
          map[k].avgScore = Math.round(map[k].totalScore / map[k].count);
        });
        setCalendarDates(map);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p className="text-gray-500 text-sm">Loading your analytics…</p>
        </div>
      </div>
    );
  }

  const { summary, weekly, posePerformance, weakestJoints } = data;

  // Calendar grid for current viewed month
  const calGrid   = buildCalendarGrid(calYear, calMonth, calendarDates);
  const monthName = new Date(calYear, calMonth, 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    // Don't go past current month
    if (calYear === now.getFullYear() && calMonth === now.getMonth()) return;
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  // Count practice days in viewed month
  const monthKey      = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const practiceDays  = Object.keys(calendarDates).filter((k) => k.startsWith(monthKey)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p className="text-gray-500 text-sm">Track your yoga journey progress</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Current Streak"      value={`${summary.streak} days`}      color="#f59e0b" />
        <StatCard icon="⏱️" label="Total Practice"      value={`${summary.totalMinutes} min`}  color="#3b82f6" />
        <StatCard icon="🎯" label="Best Accuracy"       value={`${summary.bestScore}%`}        color="#10b981" />
        <StatCard icon="📅" label="Sessions This Month" value={`${summary.totalSessions}`}     color="#8b5cf6" />
      </div>

      {/* Weekly charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">📈 Accuracy Trend (This Week)</h3>
          {weekly.every((d) => d.accuracy === 0) ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No sessions this week yet</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {weekly.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-emerald-600">{d.accuracy > 0 ? `${d.accuracy}%` : ""}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${d.accuracy}%`, background: d.accuracy > 85 ? "linear-gradient(to top,#10b981,#34d399)" : d.accuracy > 0 ? "linear-gradient(to top,#60a5fa,#93c5fd)" : "#e5e7eb", minHeight: d.accuracy > 0 ? "8px" : "4px" }} />
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">🕒 Session Duration (min)</h3>
          {weekly.every((d) => d.duration === 0) ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No sessions this week yet</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {weekly.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-blue-600">{d.duration > 0 ? d.duration : ""}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${(d.duration / 60) * 100}%`, background: "linear-gradient(to top,#3b82f6,#93c5fd)", minHeight: d.duration > 0 ? "8px" : "4px" }} />
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Pose performance + Weakest joints */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">🧘 Pose Accuracy Breakdown</h3>
          {posePerformance.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">Complete some yoga sessions to see pose stats.</p>
          ) : (
            <div className="space-y-3">
              {posePerformance.map((p) => (
                <div key={p.pose} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{p.pose}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{p.sessionCount} sessions</span>
                      <span className="font-bold text-gray-800">{p.avgScore}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${p.avgScore}%`, background: p.avgScore > 85 ? "#10b981" : p.avgScore > 75 ? "#60a5fa" : "#f59e0b" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">⚠️ Weakest Joints (Most Errors)</h3>
          {weakestJoints.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No joint data yet. Complete a session first.</p>
          ) : (
            <>
              <div className="space-y-3">
                {weakestJoints.map((j, i) => (
                  <div key={j.joint} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-black text-red-600">{i + 1}</div>
                    <span className="text-sm font-semibold text-gray-700 flex-1 capitalize">{j.joint.replace(/_/g, " ")}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">{j.errorCount}</div>
                      <div className="text-xs text-gray-400">errors</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">Focus on these joints in your next sessions to improve your score.</p>
            </>
          )}
        </GlassCard>
      </div>

      {/* ── Real Practice Calendar ─────────────────────────────────────────── */}
      <GlassCard className="p-5">
        {/* Header row: nav + month title + practice count */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gray-800">📅 Practice Calendar</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {practiceDays} day{practiceDays !== 1 ? "s" : ""} practiced
            </span>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-500 font-bold">
                ‹
              </button>
              <span className="text-sm font-semibold text-gray-700 min-w-[130px] text-center">{monthName}</span>
              <button onClick={nextMonth}
                className={`w-7 h-7 rounded-lg transition-colors flex items-center justify-center font-bold
                  ${calYear === today.getFullYear() && calMonth === today.getMonth()
                    ? "text-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-500"}`}>
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1 max-w-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 max-w-sm">
          {calGrid.map((cell, i) => {
            if (!cell) {
              // leading empty cells
              return <div key={`empty-${i}`} />;
            }

            const isToday = cell.dateKey === toDateKey(today);

            const cellClass = [
              "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all relative",
              cell.status === "done"
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                : cell.status === "missed"
                ? "bg-red-50 text-red-400"
                : "bg-gray-50 text-gray-300",
              isToday ? "ring-2 ring-offset-1 ring-emerald-400" : "",
            ].join(" ");

            return (
              <div key={cell.dateKey} className={cellClass} title={cell.score != null ? `Avg score: ${cell.score}%` : ""}>
                <span>{cell.dayNum}</span>
                {cell.status === "done" && cell.score != null && (
                  <span className="text-[9px] opacity-80 leading-none mt-0.5">{cell.score}%</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { color: "bg-emerald-500",    label: "Practiced" },
            { color: "bg-red-50 border border-red-100", label: "Missed" },
            { color: "bg-gray-50 border border-gray-100", label: "Future" },
            { color: "bg-transparent ring-2 ring-emerald-400", label: "Today" },
          ].map((x) => (
            <div key={x.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${x.color}`} />
              <span className="text-xs text-gray-500">{x.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
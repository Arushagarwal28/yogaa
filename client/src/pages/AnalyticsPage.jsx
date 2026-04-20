import { useState, useEffect } from "react";
import GlassCard      from "../components/ui/GlassCard.jsx";
import StatCard       from "../components/ui/StatCard.jsx";
import { sessionApi } from "../utils/api.js";

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK = {
  summary:          { totalSessions: 0, totalMinutes: 0, avgScore: 0, bestScore: 0, streak: 0 },
  weekly:           Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), accuracy: 0, duration: 0, sessions: 0 };
  }),
  posePerformance:  [],
  weakestJoints:    [],
  improvementTrend: Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return {
      date:     d.toISOString().split("T")[0],
      label:    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      avgScore: null,
    };
  }),
};

// ─── Calendar helpers ─────────────────────────────────────────────────────────
function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarGrid(year, month, calendarDates) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey    = toDateKey(new Date());
  const cells       = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const entry   = calendarDates[dateKey];
    cells.push({
      dateKey, dayNum: d,
      status: dateKey > todayKey ? "future" : entry?.done ? "done" : "missed",
      score:  entry?.avgScore ?? null,
    });
  }
  return cells;
}

// ─── 14-day SVG trend line chart ──────────────────────────────────────────────
function TrendLineChart({ trend }) {
  const withData = trend.map((d, i) => ({ ...d, i })).filter((p) => p.avgScore !== null);

  if (withData.length < 2) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
        <div className="text-3xl">📈</div>
        <p className="text-sm">Practice on at least 2 different days to see your trend</p>
      </div>
    );
  }

  // Canvas dimensions (SVG viewBox units)
  const W = 560, H = 148;
  const PAD = { top: 20, right: 12, bottom: 30, left: 34 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;

  const scores   = withData.map((p) => p.avgScore);
  const minScore = Math.max(0,   Math.min(...scores) - 8);
  const maxScore = Math.min(100, Math.max(...scores) + 8);
  const range    = maxScore - minScore || 1;

  const sx = (i) => PAD.left + (i / (trend.length - 1)) * cW;
  const sy = (v) => PAD.top  + cH - ((v - minScore) / range) * cH;

  // Smooth bezier path through data points
  function smoothPath(pts) {
    if (pts.length < 2) return "";
    let d = `M ${sx(pts[0].i)} ${sy(pts[0].avgScore)}`;
    for (let k = 1; k < pts.length; k++) {
      const prev = pts[k - 1], curr = pts[k];
      const cpX  = (sx(prev.i) + sx(curr.i)) / 2;
      d += ` C ${cpX} ${sy(prev.avgScore)}, ${cpX} ${sy(curr.avgScore)}, ${sx(curr.i)} ${sy(curr.avgScore)}`;
    }
    return d;
  }

  const linePath = smoothPath(withData);

  // Area path — closed shape for gradient fill
  const areaPath = `${linePath} L ${sx(withData[withData.length - 1].i)} ${PAD.top + cH} L ${sx(withData[0].i)} ${PAD.top + cH} Z`;

  // Y-axis ticks — 3 evenly spaced
  const yTicks = [
    Math.round(minScore),
    Math.round((minScore + maxScore) / 2),
    Math.round(maxScore),
  ];

  // X-axis labels — every 3rd day to avoid crowding
  const xLabelIndices = trend.map((_, i) => i).filter((i) => i % 3 === 0 || i === trend.length - 1);

  // Colour of each dot by score
  const dotColor = (score) =>
    score >= 85 ? "#10b981" : score >= 70 ? "#60a5fa" : "#f59e0b";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      <defs>
        <linearGradient id="trendLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="trendArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left} y1={sy(tick)}
            x2={W - PAD.right} y2={sy(tick)}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3"
          />
          <text x={PAD.left - 5} y={sy(tick) + 3.5} textAnchor="end" fontSize="9.5" fill="#9ca3af">
            {tick}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#trendArea)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="url(#trendLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + score labels */}
      {withData.map((p) => (
        <g key={p.date}>
          {/* Glow circle */}
          <circle cx={sx(p.i)} cy={sy(p.avgScore)} r="7" fill={dotColor(p.avgScore)} fillOpacity="0.15" />
          {/* Main dot */}
          <circle cx={sx(p.i)} cy={sy(p.avgScore)} r="3.5" fill="white" stroke={dotColor(p.avgScore)} strokeWidth="2.5" />
          {/* Score label — only show if not too crowded (every 2nd point with data) */}
          {withData.indexOf(p) % 2 === 0 && (
            <text x={sx(p.i)} y={sy(p.avgScore) - 9} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="600">
              {p.avgScore}%
            </text>
          )}
        </g>
      ))}

      {/* X-axis day labels */}
      {xLabelIndices.map((i) => {
        const d = trend[i];
        // Format: "Fri 18" from full label like "Fri, Apr 18"
        const parts  = d.label.split(", ");
        const dayStr = parts[0]; // "Fri"
        const dateStr = (parts[1] || "").replace(/\D/g, ""); // "18"
        return (
          <text key={d.date} x={sx(i)} y={H - 5} textAnchor="middle" fontSize="9.5" fill="#9ca3af">
            {`${dayStr} ${dateStr}`}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [calendarDates, setCalendarDates] = useState({});

  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Fetch analytics (includes improvementTrend from server)
  useEffect(() => {
    sessionApi.getAnalytics()
      .then(setData)
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  // Fetch raw sessions for the calendar map
  useEffect(() => {
    sessionApi.getAll()
      .then(({ sessions }) => {
        const map = {};
        (sessions || []).forEach(({ date, score }) => {
          if (!map[date]) map[date] = { done: true, totalScore: 0, count: 0 };
          map[date].totalScore += score;
          map[date].count      += 1;
        });
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

  const {
    summary, weekly, posePerformance, weakestJoints,
    improvementTrend = FALLBACK.improvementTrend,
  } = data;

  // Calendar setup
  const calGrid      = buildCalendarGrid(calYear, calMonth, calendarDates);
  const monthName    = new Date(calYear, calMonth, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  const monthKey     = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const practiceDays = Object.keys(calendarDates).filter((k) => k.startsWith(monthKey)).length;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calYear === today.getFullYear() && calMonth === today.getMonth()) return;
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  // Active days in trend
  const trendActiveDays = improvementTrend.filter((d) => d.avgScore !== null).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p className="text-gray-500 text-sm">Track your yoga journey progress</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Current Streak"   value={`${summary.streak} days`}     color="#f59e0b" />
        <StatCard icon="⏱️" label="Total Practice"   value={`${summary.totalMinutes} min`} color="#3b82f6" />
        <StatCard icon="🎯" label="Best Accuracy"    value={`${summary.bestScore}%`}       color="#10b981" />
        <StatCard icon="📅" label="Total Sessions"   value={`${summary.totalSessions}`}    color="#8b5cf6" />
      </div>

      {/* ── 14-day trend line chart ─────────────────────────────────── */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h3 className="font-bold text-gray-800">📈 14-Day Accuracy Trend</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{trendActiveDays} active day{trendActiveDays !== 1 ? "s" : ""}</span>
            {/* Colour legend */}
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span>≥85%</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"  /><span>70–84%</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /><span>&lt;70%</span></div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">Daily average accuracy · last 14 days</p>
        <TrendLineChart trend={improvementTrend} />
      </GlassCard>

      {/* Weekly bar charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">📊 Accuracy This Week</h3>
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
          <h3 className="font-bold text-gray-800 mb-4">🕒 Duration This Week (min)</h3>
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
          {posePerformance.filter((p) => !p.pose.startsWith("Meditation:")).length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">Complete some yoga sessions to see pose stats.</p>
          ) : (
            <div className="space-y-3">
              {posePerformance
                .filter((p) => !p.pose.startsWith("Meditation:"))
                .map((p) => (
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
              <p className="text-xs text-gray-400 mt-4">Focus on these joints in your next sessions.</p>
            </>
          )}
        </GlassCard>
      </div>

      {/* Practice Calendar */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gray-800">📅 Practice Calendar</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {practiceDays} day{practiceDays !== 1 ? "s" : ""} practiced
            </span>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold">‹</button>
              <span className="text-sm font-semibold text-gray-700 min-w-[130px] text-center">{monthName}</span>
              <button onClick={nextMonth}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors ${
                  calYear === today.getFullYear() && calMonth === today.getMonth()
                    ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 text-gray-500"
                }`}>›</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1 max-w-sm">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 max-w-sm">
          {calGrid.map((cell, i) => {
            if (!cell) return <div key={`e-${i}`} />;
            const isToday = cell.dateKey === toDateKey(today);
            return (
              <div key={cell.dateKey}
                className={[
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all",
                  cell.status === "done"   ? "bg-emerald-500 text-white shadow-sm" :
                  cell.status === "missed" ? "bg-red-50 text-red-400"              : "bg-gray-50 text-gray-300",
                  isToday ? "ring-2 ring-offset-1 ring-emerald-400" : "",
                ].join(" ")}
                title={cell.score != null ? `Avg score: ${cell.score}%` : ""}
              >
                <span>{cell.dayNum}</span>
                {cell.status === "done" && cell.score != null && (
                  <span className="text-[9px] opacity-80 leading-none mt-0.5">{cell.score}%</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { color: "bg-emerald-500", label: "Practiced" },
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
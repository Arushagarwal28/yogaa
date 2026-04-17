import GlassCard from "../components/ui/GlassCard.jsx";
import StatCard   from "../components/ui/StatCard.jsx";
import Badge      from "../components/ui/Badge.jsx";
import Btn        from "../components/ui/Btn.jsx";
import { YOGA_POSES } from "../data/poses.js";

const WEEK_DATA = [
  { day: "Mon", done: true,  score: 85 },
  { day: "Tue", done: true,  score: 78 },
  { day: "Wed", done: false, score: 0  },
  { day: "Thu", done: true,  score: 91 },
  { day: "Fri", done: true,  score: 88 },
  { day: "Sat", done: true,  score: 76 },
  { day: "Sun", done: false, score: 0  },
];

export default function DashboardPage({ user, coins, setPage }) {
  const stats = [
    { icon: "🔥", label: "Daily Streak",   value: "7 days",  sub: "+2 from last week",  color: "#f59e0b" },
    { icon: "⏱️", label: "Total Practice", value: "4.2 hrs", sub: "This month",          color: "#3b82f6" },
    { icon: "🎯", label: "Avg Accuracy",   value: "82%",     sub: "↑ 5% improvement",    color: "#8b5cf6" },
    { icon: "🪙", label: "Yoga Coins",     value: `${coins}`,sub: "Redeemable in store", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-6 top-4 text-8xl opacity-20 select-none">🧘</div>
        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-2">{user?.name} 🌿</h1>
          <p className="text-emerald-100 text-sm mb-5">Ready for today's yoga session? Your body thanks you!</p>
          <Btn onClick={() => setPage("yoga")} className="bg-white !text-emerald-700 hover:bg-emerald-50 !shadow-none font-bold">
            Start AI Yoga Session →
          </Btn>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* week + quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="font-bold text-gray-800 mb-5">📅 This Week's Practice</h3>
          <div className="flex gap-2">
            {WEEK_DATA.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${d.done ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-300"}`}>
                  {d.done ? "✓" : ""}
                </div>
                <span className="text-xs text-gray-500">{d.day}</span>
                {d.score > 0 && <span className="text-xs font-semibold text-emerald-600">{d.score}%</span>}
              </div>
            ))}
          </div>
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
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base group-hover:scale-110 transition-transform">{a.icon}</div>
                <span className="text-sm font-medium text-gray-700">{a.label}</span>
                <span className="ml-auto text-gray-300 group-hover:text-gray-500">→</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* recommended poses */}
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
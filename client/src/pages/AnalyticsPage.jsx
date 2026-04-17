import { useState, useEffect } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import StatCard   from "../components/ui/StatCard.jsx";
import { sessionApi } from "../utils/api.js";

const FALLBACK = {
  summary: { totalSessions: 18, totalMinutes: 164, avgScore: 82, bestScore: 91, streak: 7 },
  weekly: [
    { day:"Mon", accuracy:78, duration:25 },{ day:"Tue", accuracy:82, duration:30 },
    { day:"Wed", accuracy:0,  duration:0  },{ day:"Thu", accuracy:88, duration:35 },
    { day:"Fri", accuracy:85, duration:28 },{ day:"Sat", accuracy:91, duration:45 },
    { day:"Sun", accuracy:0,  duration:0  },
  ],
  posePerformance: [
    { pose:"Tadasana",      avgScore:92, sessionCount:5 },{ pose:"Vrikshasana",   avgScore:85, sessionCount:4 },
    { pose:"Virabhadrasana",avgScore:88, sessionCount:3 },{ pose:"Bhujangasana",  avgScore:78, sessionCount:4 },
    { pose:"Trikonasana",   avgScore:71, sessionCount:2 },
  ],
  weakestJoints: [
    { joint:"spine", errorCount:8 },{ joint:"right_knee", errorCount:6 },
    { joint:"left_shoulder", errorCount:5 },{ joint:"torso", errorCount:4 },{ joint:"left_elbow", errorCount:2 },
  ],
};

const CAL_DAYS = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  status: i >= 28 ? "future" : [2,3,7,11,17,23].includes(i) ? "missed" : "done",
}));

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getAnalytics().then(setData).catch(() => setData(FALLBACK)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center"><div className="text-4xl mb-3 animate-pulse">📊</div><p className="text-gray-500 text-sm">Loading your analytics…</p></div>
      </div>
    );
  }

  const { summary, weekly, posePerformance, weakestJoints } = data;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2><p className="text-gray-500 text-sm">Track your yoga journey progress</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Current Streak"      value={`${summary.streak} days`}       color="#f59e0b" />
        <StatCard icon="⏱️" label="Total Practice"      value={`${summary.totalMinutes} min`}   color="#3b82f6" />
        <StatCard icon="🎯" label="Best Accuracy"       value={`${summary.bestScore}%`}         color="#10b981" />
        <StatCard icon="📅" label="Sessions This Month" value={`${summary.totalSessions}`}      color="#8b5cf6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">📈 Accuracy Trend (This Week)</h3>
          <div className="flex items-end gap-2 h-40">
            {weekly.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-emerald-600">{d.accuracy > 0 ? `${d.accuracy}%` : ""}</span>
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{ height:`${d.accuracy}%`, background: d.accuracy>85?"linear-gradient(to top,#10b981,#34d399)":d.accuracy>0?"linear-gradient(to top,#60a5fa,#93c5fd)":"#e5e7eb", minHeight:d.accuracy>0?"8px":"4px" }} />
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">🕒 Session Duration (min)</h3>
          <div className="flex items-end gap-2 h-40">
            {weekly.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-blue-600">{d.duration > 0 ? d.duration : ""}</span>
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{ height:`${(d.duration/60)*100}%`, background:"linear-gradient(to top,#3b82f6,#93c5fd)", minHeight:d.duration>0?"8px":"4px" }} />
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">🧘 Pose Accuracy Breakdown</h3>
          <div className="space-y-3">
            {posePerformance.map((p) => (
              <div key={p.pose} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{p.pose}</span>
                  <div className="flex items-center gap-2"><span className="text-xs text-gray-400">{p.sessionCount} sessions</span><span className="font-bold text-gray-800">{p.avgScore}%</span></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width:`${p.avgScore}%`, background:p.avgScore>85?"#10b981":p.avgScore>75?"#60a5fa":"#f59e0b" }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">⚠️ Weakest Joints (Most Errors)</h3>
          <div className="space-y-3">
            {weakestJoints.map((j, i) => (
              <div key={j.joint} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-black text-red-600">{i+1}</div>
                <span className="text-sm font-semibold text-gray-700 flex-1 capitalize">{j.joint.replace(/_/g," ")}</span>
                <div className="text-right"><div className="text-sm font-bold text-red-600">{j.errorCount}</div><div className="text-xs text-gray-400">errors</div></div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Focus on these joints in your next sessions to improve your score.</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="font-bold text-gray-800 mb-4">📅 Practice Calendar — 2026</h3>
        <div className="grid grid-cols-7 gap-1.5 max-w-sm">
          {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>)}
          {CAL_DAYS.map((d) => (
            <div key={d.day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${d.status==="done"?"bg-emerald-500 text-white":d.status==="missed"?"bg-red-100 text-red-600":"bg-gray-50 text-gray-300"}`}>{d.day}</div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {[{color:"bg-emerald-500",label:"Done"},{color:"bg-red-100",label:"Missed"},{color:"bg-gray-50",label:"Future"}].map((x) => (
            <div key={x.label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded ${x.color}`}/><span className="text-xs text-gray-500">{x.label}</span></div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
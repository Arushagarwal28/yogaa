import GlassCard from "../ui/GlassCard.jsx";

const STATUS_STYLE = {
  green:  { bg: "#f0fdf4", dot: "bg-green-500",  badge: "bg-green-100 text-green-700"   },
  yellow: { bg: "#fffbeb", dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700" },
  red:    { bg: "#fef2f2", dot: "bg-red-500",    badge: "bg-red-100 text-red-700"       },
};

export default function FeedbackPanel({ feedbackItems }) {
  return (
    <GlassCard className="p-5">
      <h4 className="font-bold text-gray-800 mb-4">⚡ Real-time Posture Feedback</h4>
      <div className="space-y-3">
        {feedbackItems.map((f, i) => {
          const s = STATUS_STYLE[f.status] || STATUS_STYLE.red;
          return (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: s.bg }}>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot}`} />
              <span className="font-semibold text-gray-700 text-sm w-36">{f.joint}</span>
              <span className="text-sm text-gray-600 flex-1">{f.message}</span>
              {f.angleDiff > 0 && <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badge}`}>{f.angleDiff}° off</span>}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
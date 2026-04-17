import GlassCard from "./GlassCard.jsx";

export default function StatCard({ icon, label, value, sub, color = "#16a34a" }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: color + "20" }}>{icon}</div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </GlassCard>
  );
}
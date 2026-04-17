import GlassCard from "../components/ui/GlassCard.jsx";
import Btn       from "../components/ui/Btn.jsx";
import Badge     from "../components/ui/Badge.jsx";
import { SUBSCRIPTION_PLANS, FEATURE_TABLE } from "../data/subscriptions.js";

const CHECK  = "✅";
const CROSS  = "❌";
const render = (v) => {
  if (v === true)  return <span className="text-emerald-500 text-base">{CHECK}</span>;
  if (v === false) return <span className="text-rose-400 text-base">{CROSS}</span>;
  return <span className="text-xs font-semibold text-gray-600">{v}</span>;
};

export default function SubscriptionPage() {
  return (
    <div className="space-y-8">
      {/* header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
        <p className="text-gray-500 text-sm mt-1">Upgrade to unlock the full YogaAI experience</p>
      </div>

      {/* plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <GlassCard
            key={plan.name}
            className={`relative p-6 flex flex-col ${plan.popular ? "ring-2 ring-emerald-400 shadow-xl shadow-emerald-100" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="green">⭐ Most Popular</Badge>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-3xl font-extrabold" style={{ color: plan.color }}>
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-gray-400 text-sm mb-1">/month</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{plan.label}</p>
            </div>

            <ul className="space-y-2 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
              {plan.missing?.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                  <span className="mt-0.5 flex-shrink-0">✗</span>
                  {f}
                </li>
              ))}
            </ul>

            <Btn
              className={`w-full justify-center ${plan.popular ? "" : "opacity-80"}`}
              style={plan.popular ? {} : { background: "linear-gradient(135deg, #94a3b8, #64748b)" }}
            >
              {plan.price === 0 ? "Current Plan" : `Upgrade to ${plan.name}`}
            </Btn>
          </GlassCard>
        ))}
      </div>

      {/* feature comparison table */}
      <GlassCard className="p-6 overflow-x-auto">
        <h3 className="font-bold text-gray-800 mb-5">📋 Full Feature Comparison</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 pr-4 text-gray-500 font-semibold w-1/2">Feature</th>
              {SUBSCRIPTION_PLANS.map((p) => (
                <th key={p.name} className="text-center py-3 px-2 font-bold" style={{ color: p.color }}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_TABLE.map((row, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                <td className="py-3 pr-4 text-gray-700">{row.f}</td>
                <td className="text-center py-3 px-2">{render(row.free)}</td>
                <td className="text-center py-3 px-2">{render(row.std)}</td>
                <td className="text-center py-3 px-2">{render(row.pre)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
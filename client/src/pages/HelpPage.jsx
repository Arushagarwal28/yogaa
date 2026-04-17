import { useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import { FAQ_DATA } from "../data/faq.js";

export default function HelpPage() {
  const [search,   setSearch]   = useState("");
  const [openIdx,  setOpenIdx]  = useState(null);

  const filtered = FAQ_DATA.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* header */}
      <div className="text-center py-4">
        <div className="text-5xl mb-3">❓</div>
        <h2 className="text-2xl font-bold text-gray-800">Help Centre</h2>
        <p className="text-gray-500 text-sm mt-1">Find answers to common questions</p>
      </div>

      {/* search */}
      <GlassCard className="p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your question…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </GlassCard>

      {/* accordion */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <GlassCard className="p-8 text-center text-gray-400 text-sm">
            No results found for "{search}"
          </GlassCard>
        )}
        {filtered.map((item, i) => (
          <GlassCard key={i} className="overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left gap-4"
            >
              <span className="font-semibold text-gray-800 text-sm">{item.q}</span>
              <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${openIdx === i ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {openIdx === i && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed mt-3">{item.a}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400">Was this helpful?</span>
                  <button className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    👍 {item.helpful}
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* contact CTA */}
      <GlassCard className="p-6 text-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <p className="text-gray-600 text-sm mb-3">Still need help? Reach out to our team.</p>
        <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          Contact Support
        </button>
      </GlassCard>
    </div>
  );
}
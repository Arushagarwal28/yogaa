import { useState } from "react";
import GlassCard              from "../components/ui/GlassCard.jsx";
import MeditationTimer        from "../components/meditation/MeditationTimer.jsx";
import SoundMixer             from "../components/meditation/SoundMixer.jsx";
import { useMeditationTimer } from "../hooks/useMeditationTimer.js";
import { MEDITATION_CATEGORIES } from "../data/meditation.js";

export default function MeditationPage() {
  const [selected, setSelected] = useState(null);
  const { running, phase }      = useMeditationTimer();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Meditation & Mindfulness</h2>
        <p className="text-gray-500 text-sm">Find your inner peace and calm</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {MEDITATION_CATEGORIES.map((cat) => (
          <GlassCard key={cat.id} onClick={() => setSelected(cat)}
            className={`p-5 cursor-pointer hover:scale-105 transition-all ${selected?.id === cat.id ? "ring-2 ring-emerald-400" : ""}`}>
            <div className="text-3xl mb-3">{cat.icon}</div>
            <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
            <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
          </GlassCard>
        ))}
      </div>

      {selected && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
          <div className="text-4xl">{selected.icon}</div>
          <div>
            <div className="font-bold text-gray-800">{selected.name}</div>
            <div className="text-sm text-gray-500">{selected.description}</div>
            <div className="flex gap-2 mt-2">
              {selected.durations.map((d) => (
                <span key={d} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-semibold">{d} min</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard><MeditationTimer /></GlassCard>
        <GlassCard><SoundMixer running={running} phase={phase} /></GlassCard>
      </div>
    </div>
  );
}
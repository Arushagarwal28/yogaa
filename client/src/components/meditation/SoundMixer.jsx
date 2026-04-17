import { useState } from "react";
import { AMBIENT_SOUNDS } from "../../data/meditation.js";

export default function SoundMixer({ running, phase }) {
  const [volumes, setVolumes] = useState({});

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-800 mb-4">🎵 Ambient Sound Mixer</h3>
      <div className="space-y-4">
        {AMBIENT_SOUNDS.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className="text-xl w-8">{s.icon}</div>
            <span className="text-sm font-medium text-gray-700 w-28">{s.name}</span>
            <input type="range" min={0} max={100} value={volumes[s.id] || 0}
              onChange={(e) => setVolumes((v) => ({ ...v, [s.id]: Number(e.target.value) }))}
              className="flex-1 accent-emerald-500" />
            <span className="text-xs text-gray-400 w-8 text-right">{volumes[s.id] || 0}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
        <div className={`flex items-center gap-3 transition-all ${running ? "opacity-100" : "opacity-50"}`}>
          <div className={`w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center ${running ? "animate-pulse" : ""}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-all duration-[4000ms] ${phase === "inhale" ? "scale-100" : "scale-50"}`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-800">
              {running ? (phase === "inhale" ? "Breathe In…" : "Breathe Out…") : "Visual breathing guide"}
            </div>
            <div className="text-xs text-emerald-600">4 second cycles</div>
          </div>
        </div>
      </div>
    </div>
  );
}
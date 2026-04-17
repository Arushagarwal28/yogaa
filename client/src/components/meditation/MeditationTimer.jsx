import { useState } from "react";
import { useMeditationTimer } from "../../hooks/useMeditationTimer.js";
import Btn from "../ui/Btn.jsx";

export default function MeditationTimer() {
  const [duration,   setDuration]   = useState(5);
  const [customMins, setCustomMins] = useState(10);
  const { running, timeLeft, phase, start, stop, fmt } = useMeditationTimer();

  const totalSecs     = (duration === "custom" ? customMins : duration) * 60;
  const progress      = running ? (timeLeft / totalSecs) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-800 mb-5">🧘 Meditation Timer</h3>
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#tg)" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
            <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">
              {running ? fmt(timeLeft) : `${duration === "custom" ? customMins : duration}:00`}
            </div>
            <div className={`text-sm font-medium mt-1 ${phase === "inhale" ? "text-emerald-500" : "text-blue-500"}`}>
              {running ? (phase === "inhale" ? "Inhale…" : "Exhale…") : "Ready"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {[5, 10, 15, "custom"].map((d) => (
          <button key={d} onClick={() => setDuration(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${duration === d ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {d === "custom" ? "Custom" : `${d} min`}
          </button>
        ))}
      </div>
      {duration === "custom" && (
        <input type="number" min={1} max={60} value={customMins} onChange={(e) => setCustomMins(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm mb-4 text-center font-semibold focus:outline-none focus:border-emerald-400" />
      )}
      <div className="flex gap-3 justify-center">
        {!running ? <Btn onClick={() => start(totalSecs)} className="px-8">▶ Begin Meditation</Btn>
                  : <Btn variant="danger" onClick={stop}>■ Stop</Btn>}
      </div>
    </div>
  );
}
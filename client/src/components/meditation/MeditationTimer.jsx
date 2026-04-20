import { useEffect } from "react";
import Btn from "../ui/Btn.jsx";

/**
 * MeditationTimer
 * Props:
 *   selectedCategory  – category object | null
 *   selectedDuration  – minutes (number) | null
 *   timerHook         – the useMeditationTimer() instance lifted from MeditationPage
 *   onSessionComplete – ({ duration, category }) => void
 */
export default function MeditationTimer({
  selectedCategory,
  selectedDuration,
  timerHook,
  onSessionComplete,
}) {
  const {
    running, completed, timeLeft, totalSecs, progress, phase,
    start, stop, reset, fmt,
  } = timerHook;

  const circumference = 2 * Math.PI * 54;

  // When category or duration changes and timer is not running, reset ring
  useEffect(() => {
    if (!running) reset();
  }, [selectedDuration, selectedCategory?.id]);

  // Fire onSessionComplete when timer finishes naturally
  useEffect(() => {
    if (completed && selectedCategory) {
      onSessionComplete?.({
        duration: selectedDuration * 60,
        category: selectedCategory.name,
      });
    }
  }, [completed]);

  const displayMins   = selectedDuration ?? 5;
  const totalDisplay  = `${String(displayMins).padStart(2, "0")}:00`;
  const accentColor   = selectedCategory?.color ?? "#10b981";

  // Breathing ring scale
  const breathScale = running ? (phase === "inhale" ? 1 : 0.65) : 0.8;

  const handleStart = () => start(displayMins * 60);

  return (
    <div className="p-6">
      <h3 className="font-bold text-gray-800 mb-1">🧘 Meditation Timer</h3>
      {selectedCategory ? (
        <p className="text-xs text-gray-500 mb-5">
          {selectedCategory.icon} {selectedCategory.name} · {displayMins} min
        </p>
      ) : (
        <p className="text-xs text-gray-400 mb-5">Select a category above to begin</p>
      )}

      {/* Circular ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="url(#meditGrad)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id="meditGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={accentColor} />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Breathing dot */}
            <div
              className="rounded-full mb-2 transition-all ease-in-out"
              style={{
                width:      38,
                height:     38,
                background: `radial-gradient(circle, ${accentColor}cc, ${accentColor}33)`,
                transform:  `scale(${breathScale})`,
                boxShadow:  running ? `0 0 16px ${accentColor}55` : "none",
                transitionDuration: "3500ms",
              }}
            />
            {/* Time */}
            <div className="text-2xl font-bold text-gray-800 leading-none">
              {running ? fmt(timeLeft) : totalDisplay}
            </div>
            {/* Phase label */}
            <div
              className="text-xs font-semibold mt-1 transition-colors duration-700"
              style={{ color: running ? accentColor : "#9ca3af" }}
            >
              {completed
                ? "✓ Done!"
                : running
                ? phase === "inhale" ? "Inhale…" : "Exhale…"
                : "Ready"}
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-3 justify-center">
        {completed ? (
          <Btn onClick={reset} className="px-8">Meditate Again</Btn>
        ) : !running ? (
          <Btn onClick={handleStart} disabled={!selectedCategory} className="px-8">
            ▶ Begin Meditation
          </Btn>
        ) : (
          <Btn variant="danger" onClick={stop}>■ Stop</Btn>
        )}
      </div>

      {completed && (
        <div className="mt-4 p-3 rounded-xl text-center text-sm font-semibold text-emerald-700 bg-emerald-50">
          🎉 Session complete! Your progress has been saved.
        </div>
      )}
    </div>
  );
}
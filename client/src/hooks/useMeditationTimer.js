import { useState, useEffect, useRef } from "react";

export function useMeditationTimer() {
  const [running,  setRunning]  = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase,    setPhase]    = useState("inhale");
  const timerRef  = useRef(null);
  const breathRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setRunning(false); clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    breathRef.current = setInterval(() => setPhase((p) => p === "inhale" ? "exhale" : "inhale"), 4000);
    return () => clearInterval(breathRef.current);
  }, []);

  const start = (totalSeconds) => { setTimeLeft(totalSeconds); setRunning(true); };
  const stop  = () => { clearInterval(timerRef.current); setRunning(false); };
  const fmt   = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return { running, timeLeft, phase, start, stop, fmt };
}
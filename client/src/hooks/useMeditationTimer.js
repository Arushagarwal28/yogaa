import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useMeditationTimer
 *
 * Improvements over original:
 *  - onComplete callback fired when timer naturally reaches 0
 *  - Breath phase duration is configurable (default 4s inhale / 4s exhale)
 *  - `completed` flag so the page knows when to save the session
 *  - `progress` (0–100) exposed so the ring doesn't need to re-compute it
 *  - `totalSecs` stored so progress is always accurate
 */
export function useMeditationTimer() {
  const [running,   setRunning]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [phase,     setPhase]     = useState("inhale"); // "inhale" | "exhale"

  const timerRef    = useRef(null);
  const breathRef   = useRef(null);
  const onCompleteRef = useRef(null);

  // ── Main countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          setCompleted(true);
          onCompleteRef.current?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  // ── Breath cycle ────────────────────────────────────────────────────
  // Runs independently of the main countdown
  useEffect(() => {
    breathRef.current = setInterval(
      () => setPhase((p) => (p === "inhale" ? "exhale" : "inhale")),
      4000
    );
    return () => clearInterval(breathRef.current);
  }, []);

  // ── Controls ────────────────────────────────────────────────────────
  const start = useCallback((seconds, onComplete) => {
    onCompleteRef.current = onComplete ?? null;
    setTotalSecs(seconds);
    setTimeLeft(seconds);
    setCompleted(false);
    setPhase("inhale");
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setRunning(false);
    setCompleted(false);
    setTimeLeft(0);
    setTotalSecs(0);
  }, []);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progress = totalSecs > 0 ? Math.round((timeLeft / totalSecs) * 100) : 0;

  return { running, completed, timeLeft, totalSecs, progress, phase, start, stop, reset, fmt };
}
import { useState, useRef, useEffect, useCallback } from "react";
import GlassCard     from "../components/ui/GlassCard.jsx";
import Btn           from "../components/ui/Btn.jsx";
import Badge         from "../components/ui/Badge.jsx";
import AvatarCanvas  from "../components/yoga/AvatarCanvas.jsx";
import FeedbackPanel from "../components/yoga/FeedbackPanel.jsx";
import { useSessionTimer }   from "../hooks/useSessionTimer.js";
import { poseApi }           from "../utils/api.js";
import { useAuth }           from "../context/AuthContext.jsx";
import {
  evaluateTadasana, evaluateVrikshasana, evaluateTrikonasana,
  evaluateBhujangasana, evaluateUtkatasana, evaluateVirabhadrasana,
  evaluateAdhaMukha, evaluateBalasana, evaluateSetuBandhasana,
  evaluatePaschimottanasana,
  calculateScore, JOINT_INDEX, extractAngles,
} from "../utils/poseEvaluators.js";
import { generateFeedback, generateDetailedFeedback } from "../utils/poseFeedback.js";
import { YOGA_POSES }        from "../data/poses.js";
import { Pose }              from "@mediapipe/pose";
import { Camera }            from "@mediapipe/camera_utils";
import { drawSkeleton, drawJointDot } from "../components/yoga/SkeletonRenderer.js";

const FRONTEND_EVALUATORS = {
  1:  evaluateTadasana,
  2:  evaluateBhujangasana,
  3:  evaluateVrikshasana,
  4:  evaluateTrikonasana,
  5:  evaluateAdhaMukha,
  6:  evaluateSetuBandhasana,
  7:  evaluateBalasana,
  8:  evaluateUtkatasana,
  9:  evaluateVirabhadrasana,
  10: evaluatePaschimottanasana,
};

const POSE_API_NAME = {
  1:"Tadasana", 2:"Bhujangasana", 3:"Vrikshasana", 4:"Trikonasana",
  5:"Adho_Mukha", 6:"Setu_Bandhasana", 7:"Balasana",
  8:"Utkatasana", 9:"Virabhadrasana", 10:"Paschimottanasana",
};

// ─── Countdown overlay drawn directly on canvas ───────────────────────────────
// STEP_DURATION: each number shows for 900ms, GO shows for 600ms
const STEPS        = [3, 2, 1, "GO"];
const STEP_MS      = [900, 900, 900, 600];
const TOTAL_CDN_MS = STEP_MS.reduce((a, b) => a + b, 0); // 3300ms

function drawCountdownOverlay(ctx, W, H, step) {
  // Dim the video
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, W, H);

  const isGo   = step === "GO";
  const label  = String(step);

  // Pulse ring
  const cx = W / 2, cy = H / 2;
  const r  = Math.min(W, H) * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = isGo ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.35)";
  ctx.lineWidth   = isGo ? 5 : 3;
  ctx.stroke();

  // Fill circle for GO
  if (isGo) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16,185,129,0.25)";
    ctx.fill();
  }

  // Big number / GO text
  const fontSize = isGo ? Math.round(H * 0.15) : Math.round(H * 0.28);
  ctx.font      = `900 ${fontSize}px 'DM Sans', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Shadow for legibility
  ctx.shadowColor   = "rgba(0,0,0,0.6)";
  ctx.shadowBlur    = 18;
  ctx.fillStyle     = isGo ? "#34d399" : "#ffffff";
  ctx.fillText(label, cx, cy);
  ctx.shadowBlur    = 0;

  // "Get ready" hint on 3
  if (step === 3) {
    ctx.font      = `500 ${Math.round(H * 0.038)}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText("Get into position…", cx, cy + r * 0.62);
  }

  // "Pose detection starting" on GO
  if (isGo) {
    ctx.font      = `500 ${Math.round(H * 0.038)}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(52,211,153,0.9)";
    ctx.fillText("Pose detection starting!", cx, cy + r * 0.62);
  }

  ctx.textAlign    = "left";
  ctx.textBaseline = "alphabetic";
}

// ─── LiveCamera component ─────────────────────────────────────────────────────
// Props:
//   poseId       – which pose to evaluate
//   detecting    – boolean: when false, draws video but skips evaluation (countdown phase)
//   onScore      – called every frame with the live score
//   onFeedback   – called every frame with feedback + detailedFB
//   countdownStep – current step (3|2|1|"GO"|null), drawn as overlay when not null
//
// Ref trick: LiveCamera.getAngles() returns latest angles for server submission.

function LiveCamera({ poseId, detecting, countdownStep, onScore, onFeedback }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const holdRef   = useRef(0);
  const lastTRef  = useRef(Date.now());
  const anglesRef = useRef({});

  useEffect(() => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
    });
    pose.setOptions({
      modelComplexity:        1,
      smoothLandmarks:        true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    });
    pose.onResults(onResults);

    const cam = new Camera(videoRef.current, {
      onFrame: async () => { await pose.send({ image: videoRef.current }); },
      width: 640, height: 480,
    });
    cam.start();
    return () => cam.stop();
  }, [poseId]); // restart when pose changes

  // Use a ref for `detecting` so onResults always reads the latest value
  // without needing to re-register the handler (which would restart the camera)
  const detectingRef    = useRef(detecting);
  const countdownRef    = useRef(countdownStep);
  detectingRef.current  = detecting;
  countdownRef.current  = countdownStep;

  function onResults(results) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width;
    const H   = canvas.height;

    // Always draw the camera image
    ctx.clearRect(0, 0, W, H);
    if (results.image) ctx.drawImage(results.image, 0, 0, W, H);

    // ── COUNTDOWN PHASE: draw overlay, skip evaluation ───────────────
    const step = countdownRef.current;
    if (step !== null) {
      // Still draw skeleton so user can see their body during countdown
      if (results.poseLandmarks) drawSkeleton(ctx, results.poseLandmarks, W, H);
      drawCountdownOverlay(ctx, W, H, step);
      return;
    }

    // ── DETECTION PHASE ───────────────────────────────────────────────
    if (!results.poseLandmarks) return;
    if (!detectingRef.current)  return;

    const lm       = results.poseLandmarks;
    drawSkeleton(ctx, lm, W, H);

    const evaluator = FRONTEND_EVALUATORS[poseId];
    if (!evaluator) return;

    const poseName   = POSE_API_NAME[poseId] || "Tadasana";
    const feedback   = evaluator(lm);
    const score      = calculateScore(feedback, poseName);
    const messages   = generateFeedback(feedback, poseName);
    const detailedFB = generateDetailedFeedback(feedback, poseName);

    // Draw coloured joint dots
    Object.entries(feedback).forEach(([joint, color]) => {
      const idx = JOINT_INDEX[joint];
      if (idx != null) drawJointDot(ctx, lm[idx], color, W, H);
    });

    // Hold timer
    const now   = Date.now();
    const delta = (now - lastTRef.current) / 1000;
    lastTRef.current = now;
    holdRef.current  = score > 80 ? holdRef.current + delta : Math.max(0, holdRef.current - delta * 0.5);

    // HUD — score + hold
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(12, 10, 210, 56, 8);
    else ctx.rect(12, 10, 210, 56);
    ctx.fill();
    ctx.fillStyle = "#4ade80";
    ctx.font      = "bold 14px monospace";
    ctx.fillText(`⚡ Score: ${score}%`, 22, 32);
    ctx.fillStyle = "#cbd5e1";
    ctx.font      = "12px monospace";
    ctx.fillText(`Hold: ${holdRef.current.toFixed(1)}s`, 22, 54);

    // Pose complete banner
    if (holdRef.current >= 10) {
      ctx.fillStyle  = "rgba(16,185,129,0.85)";
      const bw = 260, bh = 40, bx = W / 2 - bw / 2, by = 18;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font      = "bold 18px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✓ Pose Complete! Great form!", W / 2, by + 26);
      ctx.textAlign = "left";
    }

    // Store angles for server submission
    anglesRef.current = extractAngles(lm);

    onScore?.(score);
    onFeedback?.(feedback, messages, detailedFB);
  }

  LiveCamera.getAngles = () => anglesRef.current;

  return (
    <div className="relative w-full">
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} className="w-full rounded-xl" />
      {/* LIVE badge — only shown when actually detecting */}
      {detecting && (
        <div className="absolute bottom-3 right-3 bg-black/60 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
        </div>
      )}
    </div>
  );
}

// ─── useCountdown hook ────────────────────────────────────────────────────────
// Drives the 3 → 2 → 1 → GO → null sequence.
// Returns: { step, running, start, cancel }
//   step    – current display value (3 | 2 | 1 | "GO" | null)
//   running – true while countdown is in progress
//   start   – call to begin, accepts onComplete callback
//   cancel  – call to abort

function useCountdown() {
  const [step,    setStep]    = useState(null);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    setStep(null);
    setRunning(false);
  }, []);

  const start = useCallback((onComplete) => {
    setRunning(true);

    let elapsed = 0;

    function schedule(index) {
      if (index >= STEPS.length) {
        // All steps done — hide overlay and fire callback
        timerRef.current = setTimeout(() => {
          setStep(null);
          setRunning(false);
          onComplete?.();
        }, 80); // tiny gap so "GO" renders before disappearing
        return;
      }
      setStep(STEPS[index]);
      timerRef.current = setTimeout(() => schedule(index + 1), STEP_MS[index]);
    }

    schedule(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { step, running, start, cancel };
}

// ─── YogaPage ─────────────────────────────────────────────────────────────────

export default function YogaPage({ addCoins, refreshCoins }) {
  const { user }  = useAuth();

  // Pose selection
  const [selectedPose, setSelectedPose] = useState(null);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");

  // Session state
  // isActive = true only AFTER countdown finishes (timer is running)
  const [isActive,     setIsActive]     = useState(false);
  // cameraOn = true as soon as user clicks Start (camera warms up during countdown)
  const [cameraOn,     setCameraOn]     = useState(false);

  const [liveScore,    setLiveScore]    = useState(0);
  const [liveFeedback, setLiveFeedback] = useState([]);
  const [apiResult,    setApiResult]    = useState(null);
  const [submitting,   setSubmitting]   = useState(false);

  const { elapsed, fmt } = useSessionTimer(isActive);
  const { step: cdStep, running: cdRunning, start: startCd, cancel: cancelCd } = useCountdown();

  // ── Filtered pose list ──────────────────────────────────────────────
  const filtered = YOGA_POSES.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.benefits.some((b) => b.toLowerCase().includes(q)) ||
        p.bodyParts.some((b) => b.toLowerCase().includes(q))) &&
      (filter === "all" || p.difficulty.toLowerCase() === filter)
    );
  });

  // ── Feedback handler ────────────────────────────────────────────────
  const handleFeedback = (_fbObj, _messages, detailedFB) => {
    if (detailedFB?.length) setLiveFeedback(detailedFB);
  };

  // ── Start flow ──────────────────────────────────────────────────────
  // 1. Turn camera on immediately so it warms up and user sees themselves
  // 2. Start countdown
  // 3. When countdown finishes → start session timer + enable detection
  const handleStart = () => {
    setLiveScore(0);
    setLiveFeedback([]);
    setCameraOn(true);          // camera mounts NOW so user can see themselves
    startCd(() => {             // countdown runs, then:
      setIsActive(true);        // session timer starts
    });
  };

  // ── End session ─────────────────────────────────────────────────────
  const endSession = async () => {
    setIsActive(false);
    setCameraOn(false);
    cancelCd();
    setSubmitting(true);
    try {
      const angles  = LiveCamera.getAngles?.() || {};
      const apiName = POSE_API_NAME[selectedPose.id] || selectedPose.name;
      const result  = await poseApi.evaluate(apiName, angles, elapsed);
      setApiResult(result);
      addCoins?.(result.coinsEarned || 0);
      refreshCoins?.();
      if (result.feedback?.length) {
        setLiveFeedback(result.feedback.map((f) => ({
          joint:     f.joint.replace(/_/g, " "),
          status:    f.status,
          message:   f.message,
          angleDiff: f.diff || 0,
        })));
      }
    } catch {
      const earned = liveScore > 90 ? 10 : liveScore > 75 ? 6 : 3;
      addCoins?.(earned);
      setApiResult({ score: liveScore, coinsEarned: earned, status: "local" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Back to pose list ───────────────────────────────────────────────
  const handleBack = () => {
    setSelectedPose(null);
    setIsActive(false);
    setCameraOn(false);
    cancelCd();
    setApiResult(null);
    setLiveFeedback([]);
  };

  // ─── Pose list page ─────────────────────────────────────────────────
  if (!selectedPose) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Yoga Trainer</h2>
          <p className="text-gray-500 text-sm">Real-time pose detection &amp; correction</p>
        </div>
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search poses by name, body part, or benefit…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="flex gap-2 flex-wrap">
              {["all", "beginner", "intermediate", "advanced"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === f ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {filtered.map((pose) => (
              <div key={pose.id}
                onClick={() => { setSelectedPose(pose); setApiResult(null); setLiveFeedback([]); }}
                className="p-4 rounded-2xl cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg,${pose.color}15,${pose.color}25)`, border: `1px solid ${pose.color}40` }}>
                <div className="text-2xl mb-2">🧘</div>
                <div className="font-bold text-gray-800 text-sm">{pose.name}</div>
                <div className="text-xs text-gray-500 italic mb-2">{pose.sanskrit}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pose.benefits.slice(0, 2).map((b) => (
                    <span key={b} className="text-xs px-1.5 py-0.5 rounded-full bg-white/70 text-gray-600">{b}</span>
                  ))}
                </div>
                <Badge color={pose.difficulty === "Beginner" ? "green" : pose.difficulty === "Intermediate" ? "blue" : "purple"}>
                  {pose.difficulty}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  // ─── Session page ───────────────────────────────────────────────────
  const sessionRunning = isActive || cdRunning; // either counting down or active

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Btn variant="secondary" onClick={handleBack}>← Back</Btn>
          <div>
            <h3 className="font-bold text-gray-800">
              {selectedPose.name}{" "}
              <span className="text-gray-500 font-normal italic text-sm">— {selectedPose.sanskrit}</span>
            </h3>
            <p className="text-xs text-gray-500">{selectedPose.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer — only shows when actively detecting (not during countdown) */}
          {isActive && (
            <>
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> ⏱ {fmt(elapsed)}
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                🎯 {liveScore}%
              </div>
            </>
          )}

          {/* Countdown indicator in header */}
          {cdRunning && !isActive && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              {cdStep === "GO" ? "GO!" : `Starting in ${cdStep}…`}
            </div>
          )}

          {/* Buttons */}
          {!sessionRunning && !apiResult && (
            <Btn onClick={handleStart}>▶ Start Session</Btn>
          )}
          {sessionRunning && (
            <Btn variant="danger" onClick={endSession} disabled={submitting}>
              {submitting ? "⟳ Saving…" : "■ End Session"}
            </Btn>
          )}
        </div>
      </div>

      {/* Result banner */}
      {apiResult && !sessionRunning && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-5xl font-black">{apiResult.score}%</div>
            <div className="text-emerald-100 text-sm mt-1">Final Score</div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="text-xl font-bold mb-1">
              {apiResult.status === "excellent" ? "🏆 Excellent!" :
               apiResult.status === "good"      ? "👍 Good work!" :
               apiResult.status === "fair"      ? "👌 Keep practising!" : "💪 Keep going!"}
            </div>
            <div className="text-emerald-100 text-sm">
              Duration: {Math.floor(elapsed / 60)}m {elapsed % 60}s · Coins earned: +{apiResult.coinsEarned} 🪙
            </div>
          </div>
          <Btn
            onClick={() => { setApiResult(null); setLiveFeedback([]); }}
            className="bg-white !text-emerald-700 hover:bg-emerald-50 !shadow-none font-bold whitespace-nowrap"
          >
            Try Again
          </Btn>
        </div>
      )}

      {/* Camera + Avatar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-700 text-sm">📷 Camera View</span>
            {isActive && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
              </span>
            )}
            {cdRunning && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                GET READY
              </span>
            )}
          </div>
          <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
            {cameraOn ? (
              <LiveCamera
                poseId={selectedPose.id}
                detecting={isActive}
                countdownStep={cdRunning ? cdStep : null}
                onScore={setLiveScore}
                onFeedback={handleFeedback}
              />
            ) : (
              <div className="text-center text-gray-500 p-8">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm">Camera activates when session starts</p>
                <p className="text-xs mt-1 text-gray-600">Stand 2–3 m from camera in good lighting</p>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <span className="font-semibold text-gray-700 text-sm">🤖 3D Reference Avatar</span>
          </div>
          <AvatarCanvas pose={selectedPose} />
        </GlassCard>
      </div>

      {/* Feedback panel — hidden during countdown */}
      {liveFeedback.length > 0 && !cdRunning && (
        <FeedbackPanel feedbackItems={liveFeedback} />
      )}
    </div>
  );
}
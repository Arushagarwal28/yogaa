import { useState, useRef, useEffect } from "react";
import GlassCard     from "../components/ui/GlassCard.jsx";
import Btn           from "../components/ui/Btn.jsx";
import Badge         from "../components/ui/Badge.jsx";
import AvatarCanvas  from "../components/yoga/AvatarCanvas.jsx";
import FeedbackPanel from "../components/yoga/FeedbackPanel.jsx";
import { useSessionTimer }   from "../hooks/useSessionTimer.js";
import { poseApi }           from "../utils/api.js";
import { useAuth }           from "../context/AuthContext.jsx";
import { evaluateTadasana, evaluateVrikshasana, evaluateTrikonasana, calculateScore, JOINT_INDEX } from "../utils/poseEvaluators.js";
import { generateFeedback }  from "../utils/poseFeedback.js";
import { YOGA_POSES }        from "../data/poses.js";
import { Pose }              from "@mediapipe/pose";
import { Camera }            from "@mediapipe/camera_utils";
import { drawSkeleton, drawJointDot } from "../components/yoga/SkeletonRenderer.js";

const FRONTEND_EVALUATORS = { 1: evaluateTadasana, 3: evaluateVrikshasana, 4: evaluateTrikonasana };
const POSE_API_NAME = { 1:"Tadasana", 2:"Bhujangasana", 3:"Vrikshasana", 4:"Trikonasana", 5:"Adho_Mukha", 6:"Setu_Bandhasana", 7:"Balasana", 8:"Utkatasana", 9:"Virabhadrasana", 10:"Paschimottanasana" };

function calcAngleFromLM(lm, ai, bi, ci) {
  const [a, b, c] = [lm[ai], lm[bi], lm[ci]];
  if (!a || !b || !c) return undefined;
  const r = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((r * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

function LiveCamera({ poseId, onScore, onFeedback }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const holdRef   = useRef(0);
  const lastTRef  = useRef(Date.now());
  const anglesRef = useRef({});

  useEffect(() => {
    if (!videoRef.current) return;
    const pose = new Pose({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
    pose.setOptions({ modelComplexity:1, smoothLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5 });
    pose.onResults(onResults);
    const cam = new Camera(videoRef.current, { onFrame: async () => { await pose.send({ image: videoRef.current }); }, width:640, height:480 });
    cam.start();
    return () => cam.stop();
  }, [poseId]);

  function onResults(results) {
    const canvas = canvasRef.current;
    if (!canvas || !results.poseLandmarks) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H); ctx.drawImage(results.image,0,0,W,H);
    const lm = results.poseLandmarks;
    drawSkeleton(ctx, lm, W, H);
    const evaluator = FRONTEND_EVALUATORS[poseId];
    if (!evaluator) return;
    const feedback = evaluator(lm);
    const score    = calculateScore(feedback);
    const messages = generateFeedback(feedback);
    Object.entries(feedback).forEach(([joint, color]) => { const idx = JOINT_INDEX[joint]; if (idx != null) drawJointDot(ctx, lm[idx], color, W, H); });
    const now = Date.now(); const delta = (now - lastTRef.current) / 1000; lastTRef.current = now;
    holdRef.current = score > 80 ? holdRef.current + delta : 0;
    ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(12,10,200,52,8);else ctx.rect(12,10,200,52); ctx.fill();
    ctx.fillStyle="#4ade80"; ctx.font="bold 14px monospace"; ctx.fillText(`⚡ Score: ${score}%`,22,30);
    ctx.fillStyle="#cbd5e1"; ctx.font="12px monospace"; ctx.fillText(`Hold: ${holdRef.current.toFixed(1)}s`,22,52);
    if(holdRef.current>=10){ctx.fillStyle="#00FFAA";ctx.font="bold 20px Arial";ctx.fillText("✓ Pose Complete!",W/2-90,38);}
    anglesRef.current = { left_knee:calcAngleFromLM(lm,23,25,27), right_knee:calcAngleFromLM(lm,24,26,28), left_elbow:calcAngleFromLM(lm,11,13,15), right_elbow:calcAngleFromLM(lm,12,14,16), left_shoulder:calcAngleFromLM(lm,13,11,23), right_shoulder:calcAngleFromLM(lm,14,12,24), spine:calcAngleFromLM(lm,11,23,25) };
    onScore?.(score); onFeedback?.(feedback, messages);
  }
  LiveCamera.getAngles = () => anglesRef.current;
  return (
    <div className="relative w-full">
      <video ref={videoRef} style={{ display:"none" }} />
      <canvas ref={canvasRef} width={640} height={480} className="w-full rounded-xl" />
      <div className="absolute bottom-3 right-3 bg-black/60 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
      </div>
    </div>
  );
}

export default function YogaPage({ addCoins }) {
  const { user, refreshCoins }           = useAuth();
  const [selectedPose, setSelectedPose] = useState(null);
  const [isActive,     setIsActive]     = useState(false);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [liveScore,    setLiveScore]    = useState(0);
  const [liveFeedback, setLiveFeedback] = useState([]);
  const [apiResult,    setApiResult]    = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const { elapsed, fmt } = useSessionTimer(isActive);

  const filtered = YOGA_POSES.filter((p) => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.benefits.some((b) => b.toLowerCase().includes(q)) || p.bodyParts.some((b) => b.toLowerCase().includes(q)))
      && (filter === "all" || p.difficulty.toLowerCase() === filter);
  });

  const handleFeedback = (fbObj, messages) => {
    setLiveFeedback(Object.entries(fbObj).map(([joint, status]) => ({
      joint: joint.replace(/([A-Z])/g, " $1").trim(), status,
      message: messages.find((m) => m.toLowerCase().includes(joint.replace(/([A-Z])/g," $1").trim().toLowerCase())) || (status === "green" ? "Good position ✓" : "Needs adjustment"),
      angleDiff: 0,
    })));
  };

  const endSession = async () => {
    setIsActive(false); setSubmitting(true);
    try {
      const angles  = LiveCamera.getAngles?.() || {};
      const apiName = POSE_API_NAME[selectedPose.id] || selectedPose.name;
      const result  = await poseApi.evaluate(apiName, angles, elapsed);
      setApiResult(result); addCoins?.(result.coinsEarned || 0); refreshCoins?.();
      if (result.feedback?.length) setLiveFeedback(result.feedback.map((f) => ({ joint: f.joint.replace(/_/g," "), status: f.status, message: f.message, angleDiff: f.diff || 0 })));
    } catch {
      const earned = liveScore > 90 ? 10 : liveScore > 75 ? 6 : 3;
      addCoins?.(earned); setApiResult({ score: liveScore, coinsEarned: earned, status: "local" }); refreshCoins?.();
    } finally { setSubmitting(false); }
  };

  if (!selectedPose) {
    return (
      <div className="space-y-5">
        <div><h2 className="text-2xl font-bold text-gray-800">AI Yoga Trainer</h2><p className="text-gray-500 text-sm">Real-time pose detection &amp; correction</p></div>
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search poses by name, body part, or benefit…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            <div className="flex gap-2 flex-wrap">
              {["all","beginner","intermediate","advanced"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter===f ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {filtered.map((pose) => (
              <div key={pose.id} onClick={() => { setSelectedPose(pose); setApiResult(null); setLiveFeedback([]); }}
                className="p-4 rounded-2xl cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
                style={{ background:`linear-gradient(135deg,${pose.color}15,${pose.color}25)`, border:`1px solid ${pose.color}40` }}>
                <div className="text-2xl mb-2">🧘</div>
                <div className="font-bold text-gray-800 text-sm">{pose.name}</div>
                <div className="text-xs text-gray-500 italic mb-2">{pose.sanskrit}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pose.benefits.slice(0,2).map((b) => <span key={b} className="text-xs px-1.5 py-0.5 rounded-full bg-white/70 text-gray-600">{b}</span>)}
                </div>
                <Badge color={pose.difficulty==="Beginner"?"green":pose.difficulty==="Intermediate"?"blue":"purple"}>{pose.difficulty}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Btn variant="secondary" onClick={() => { setSelectedPose(null); setIsActive(false); }}>← Back</Btn>
          <div>
            <h3 className="font-bold text-gray-800">{selectedPose.name} <span className="text-gray-500 font-normal italic text-sm">— {selectedPose.sanskrit}</span></h3>
            <p className="text-xs text-gray-500">{selectedPose.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <>
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> ⏱ {fmt(elapsed)}
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold">🎯 {liveScore}%</div>
            </>
          )}
          {!isActive && !apiResult && <Btn onClick={() => { setIsActive(true); setLiveScore(0); }}>▶ Start Session</Btn>}
          {isActive && <Btn variant="danger" onClick={endSession} disabled={submitting}>{submitting ? "⟳ Saving…" : "■ End Session"}</Btn>}
        </div>
      </div>

      {apiResult && !isActive && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex items-center gap-6">
          <div className="text-center"><div className="text-5xl font-black">{apiResult.score}%</div><div className="text-emerald-100 text-sm mt-1">Final Score</div></div>
          <div className="flex-1">
            <div className="text-xl font-bold mb-1">{apiResult.status==="excellent"?"🏆 Excellent!":apiResult.status==="good"?"👍 Good work!":apiResult.status==="fair"?"👌 Keep practising!":"💪 Keep going!"}</div>
            <div className="text-emerald-100 text-sm">Duration: {Math.floor(elapsed/60)}m {elapsed%60}s · Coins earned: +{apiResult.coinsEarned} 🪙</div>
          </div>
          <Btn onClick={() => { setApiResult(null); setLiveFeedback([]); }} className="bg-white !text-emerald-700 hover:bg-emerald-50 !shadow-none font-bold whitespace-nowrap">Try Again</Btn>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-700 text-sm">📷 Camera View</span>
            {isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE</span>}
          </div>
          <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
            {isActive ? (
              <LiveCamera poseId={selectedPose.id} onScore={setLiveScore} onFeedback={handleFeedback} />
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
          <div className="p-4 border-b border-gray-100"><span className="font-semibold text-gray-700 text-sm">🤖 3D Reference Avatar</span></div>
          <AvatarCanvas pose={selectedPose} />
        </GlassCard>
      </div>

      {liveFeedback.length > 0 && <FeedbackPanel feedbackItems={liveFeedback} />}
    </div>
  );
}
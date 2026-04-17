import { useEffect, useRef, useState } from "react";
import { Pose }   from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawSkeleton, drawJointDot } from "./SkeletonRenderer.js";
import { evaluateTadasana, evaluateVrikshasana, evaluateTrikonasana, calculateScore, JOINT_INDEX } from "../../utils/poseEvaluators.js";
import { generateFeedback } from "../../utils/poseFeedback.js";

const EVALUATORS = { 1: evaluateTadasana, 2: evaluateTadasana, 3: evaluateVrikshasana, 4: evaluateTrikonasana };

export default function PoseCamera({ poseId, onScore, onFeedback }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const holdRef   = useRef(0);
  const lastTRef  = useRef(Date.now());
  const [score, setScore] = useState(0);

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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H); ctx.drawImage(results.image,0,0,W,H);
    if (!results.poseLandmarks) return;
    const lm = results.poseLandmarks;
    drawSkeleton(ctx, lm, W, H);
    const evaluator = EVALUATORS[poseId];
    if (!evaluator) return;
    const feedback = evaluator(lm);
    const s        = calculateScore(feedback);
    const messages = generateFeedback(feedback);
    Object.entries(feedback).forEach(([joint, color]) => { const idx = JOINT_INDEX[joint]; if (idx != null) drawJointDot(ctx, lm[idx], color, W, H); });
    const now = Date.now(); const delta = (now - lastTRef.current) / 1000; lastTRef.current = now;
    holdRef.current = s > 80 ? holdRef.current + delta : 0;
    ctx.fillStyle="rgba(0,0,0,0.45)"; if(ctx.roundRect)ctx.roundRect(12,10,200,48,8);else ctx.rect(12,10,200,48); ctx.fill();
    ctx.fillStyle="#4ade80"; ctx.font="bold 14px monospace"; ctx.fillText(`⚡ Score: ${s}%`,22,30);
    ctx.fillStyle="#cbd5e1"; ctx.font="12px monospace"; ctx.fillText(`Hold: ${holdRef.current.toFixed(1)}s`,22,50);
    if(holdRef.current>=10){ctx.fillStyle="#00FFAA";ctx.font="bold 20px Arial";ctx.fillText("✓ Pose Complete!",W/2-80,40);}
    setScore(s); onScore?.(s); onFeedback?.(feedback, messages);
  }

  return (
    <div className="relative w-full" style={{ maxWidth: 640 }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} className="w-full rounded-xl" />
      <div className="absolute bottom-3 right-3 bg-black/50 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">🟢 LIVE · {score}%</div>
    </div>
  );
}
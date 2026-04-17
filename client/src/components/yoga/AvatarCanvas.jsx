import { useRef, useEffect } from "react";

// Joint connections for a humanoid stick figure
const CONNECTIONS = [
  // torso
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  // arms
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  // legs
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

// Base T-pose keypoints (normalized 0-1)
const BASE_POSE = {
  head:            { x: 0.50, y: 0.08 },
  left_shoulder:   { x: 0.35, y: 0.25 },
  right_shoulder:  { x: 0.65, y: 0.25 },
  left_elbow:      { x: 0.20, y: 0.40 },
  right_elbow:     { x: 0.80, y: 0.40 },
  left_wrist:      { x: 0.10, y: 0.55 },
  right_wrist:     { x: 0.90, y: 0.55 },
  left_hip:        { x: 0.40, y: 0.55 },
  right_hip:       { x: 0.60, y: 0.55 },
  left_knee:       { x: 0.38, y: 0.73 },
  right_knee:      { x: 0.62, y: 0.73 },
  left_ankle:      { x: 0.37, y: 0.92 },
  right_ankle:     { x: 0.63, y: 0.92 },
};

// Per-pose overrides (normalized coords)
const POSE_OVERRIDES = {
  Tadasana: {
    left_elbow:  { x: 0.38, y: 0.42 },
    right_elbow: { x: 0.62, y: 0.42 },
    left_wrist:  { x: 0.37, y: 0.58 },
    right_wrist: { x: 0.63, y: 0.58 },
  },
  Vrikshasana: {
    left_knee:  { x: 0.38, y: 0.62 },
    left_ankle: { x: 0.48, y: 0.72 },
    left_elbow: { x: 0.42, y: 0.18 },
    right_elbow:{ x: 0.58, y: 0.18 },
    left_wrist: { x: 0.50, y: 0.10 },
    right_wrist:{ x: 0.50, y: 0.10 },
  },
  Trikonasana: {
    left_shoulder:  { x: 0.30, y: 0.32 },
    right_shoulder: { x: 0.70, y: 0.32 },
    left_elbow:     { x: 0.12, y: 0.32 },
    right_elbow:    { x: 0.88, y: 0.32 },
    left_wrist:     { x: 0.03, y: 0.32 },
    right_wrist:    { x: 0.97, y: 0.32 },
    left_hip:       { x: 0.36, y: 0.60 },
    right_hip:      { x: 0.64, y: 0.60 },
    left_knee:      { x: 0.25, y: 0.76 },
    right_knee:     { x: 0.75, y: 0.76 },
    left_ankle:     { x: 0.18, y: 0.93 },
    right_ankle:    { x: 0.82, y: 0.93 },
  },
};

function getKeypoints(poseName) {
  const overrides = POSE_OVERRIDES[poseName] ?? {};
  const pts = {};
  for (const [k, v] of Object.entries(BASE_POSE)) {
    pts[k] = overrides[k] ? { ...v, ...overrides[k] } : { ...v };
  }
  return pts;
}

export default function AvatarCanvas({ poseName = "Tadasana", width = 180, height = 260 }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(0);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pts  = getKeypoints(poseName);

    function draw() {
      tRef.current += 0.025;
      const breathe = Math.sin(tRef.current) * 2; // subtle breathing sway

      ctx.clearRect(0, 0, width, height);

      // background glow
      const grd = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.7);
      grd.addColorStop(0, "rgba(52,211,153,0.12)");
      grd.addColorStop(1, "rgba(52,211,153,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // map normalized coords → canvas, apply breathe offset on y
      const px = (k) => pts[k].x * width;
      const py = (k) => pts[k].y * height + breathe;

      // draw bones
      ctx.strokeStyle = "rgba(52,211,153,0.9)";
      ctx.lineWidth   = 3;
      ctx.lineCap     = "round";
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(px(a), py(a));
        ctx.lineTo(px(b), py(b));
        ctx.stroke();
      }

      // draw joints
      for (const key of Object.keys(pts)) {
        if (key === "head") continue;
        ctx.beginPath();
        ctx.arc(px(key), py(key), 4, 0, Math.PI * 2);
        ctx.fillStyle = "#6ee7b7";
        ctx.fill();
      }

      // head circle
      ctx.beginPath();
      ctx.arc(px("head"), py("head") - 2, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52,211,153,0.9)";
      ctx.lineWidth   = 3;
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [poseName, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-2xl"
      style={{ background: "rgba(0,0,0,0.35)" }}
    />
  );
}
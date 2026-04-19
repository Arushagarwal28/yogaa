import { useRef, useEffect } from "react";

// ─── Skeleton connections ─────────────────────────────────────────────────────
const CONNECTIONS = [
  // Head to neck/shoulders
  ["head", "neck"],
  ["neck", "left_shoulder"],
  ["neck", "right_shoulder"],
  // Torso
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  // Arms
  ["left_shoulder", "left_elbow"],
  ["left_elbow",    "left_wrist"],
  ["right_shoulder","right_elbow"],
  ["right_elbow",   "right_wrist"],
  // Legs
  ["left_hip",  "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee","right_ankle"],
  // Feet
  ["left_ankle",  "left_foot"],
  ["right_ankle", "right_foot"],
];

// ─── Full pose keypoint definitions ──────────────────────────────────────────
// All coordinates are normalized 0-1 (x=left→right, y=top→bottom)
// Designed to fill the canvas naturally at 200×300px
const POSES = {

  // ── 1. Tadasana — Mountain Pose ──────────────────────────────────
  // Stand tall, feet hip-width, arms at sides, chin parallel to floor
  Tadasana: {
    head:          { x:0.50, y:0.06 },
    neck:          { x:0.50, y:0.16 },
    left_shoulder: { x:0.38, y:0.22 },
    right_shoulder:{ x:0.62, y:0.22 },
    left_elbow:    { x:0.32, y:0.38 },
    right_elbow:   { x:0.68, y:0.38 },
    left_wrist:    { x:0.30, y:0.53 },
    right_wrist:   { x:0.70, y:0.53 },
    left_hip:      { x:0.42, y:0.52 },
    right_hip:     { x:0.58, y:0.52 },
    left_knee:     { x:0.42, y:0.70 },
    right_knee:    { x:0.58, y:0.70 },
    left_ankle:    { x:0.42, y:0.88 },
    right_ankle:   { x:0.58, y:0.88 },
    left_foot:     { x:0.40, y:0.95 },
    right_foot:    { x:0.60, y:0.95 },
  },

  // ── 2. Bhujangasana — Cobra Pose ─────────────────────────────────
  // Prone on mat, chest lifted by slightly bent arms, hips on ground
  // Viewed from the side — torso arches up-left, legs extend right
  Bhujangasana: {
    head:          { x:0.18, y:0.22 },
    neck:          { x:0.26, y:0.30 },
    left_shoulder: { x:0.35, y:0.38 },
    right_shoulder:{ x:0.42, y:0.44 },
    left_elbow:    { x:0.30, y:0.52 },
    right_elbow:   { x:0.38, y:0.58 },
    left_wrist:    { x:0.26, y:0.62 },
    right_wrist:   { x:0.34, y:0.66 },
    left_hip:      { x:0.55, y:0.60 },
    right_hip:     { x:0.62, y:0.64 },
    left_knee:     { x:0.72, y:0.68 },
    right_knee:    { x:0.78, y:0.72 },
    left_ankle:    { x:0.86, y:0.72 },
    right_ankle:   { x:0.90, y:0.76 },
    left_foot:     { x:0.93, y:0.74 },
    right_foot:    { x:0.95, y:0.78 },
  },

  // ── 3. Vrikshasana — Tree Pose ────────────────────────────────────
  // Balance on left leg, right foot on inner left thigh, arms overhead joined
  Vrikshasana: {
    head:          { x:0.50, y:0.04 },
    neck:          { x:0.50, y:0.13 },
    left_shoulder: { x:0.40, y:0.20 },
    right_shoulder:{ x:0.60, y:0.20 },
    left_elbow:    { x:0.44, y:0.11 },
    right_elbow:   { x:0.56, y:0.11 },
    left_wrist:    { x:0.48, y:0.04 },
    right_wrist:   { x:0.52, y:0.04 },
    left_hip:      { x:0.44, y:0.50 },
    right_hip:     { x:0.56, y:0.50 },
    // Standing leg (left) — straight down
    left_knee:     { x:0.44, y:0.67 },
    left_ankle:    { x:0.44, y:0.86 },
    left_foot:     { x:0.43, y:0.93 },
    // Raised leg (right) — knee out to side, foot near left thigh
    right_knee:    { x:0.66, y:0.62 },
    right_ankle:   { x:0.53, y:0.66 },
    right_foot:    { x:0.52, y:0.70 },
  },

  // ── 4. Trikonasana — Triangle Pose ───────────────────────────────
  // Wide stance, torso tilts left, left hand to ankle, right arm up
  Trikonasana: {
    head:          { x:0.20, y:0.34 },
    neck:          { x:0.27, y:0.38 },
    left_shoulder: { x:0.30, y:0.44 },
    right_shoulder:{ x:0.42, y:0.36 },
    // Right arm reaches straight up
    right_elbow:   { x:0.50, y:0.22 },
    right_wrist:   { x:0.54, y:0.08 },
    right_foot:    { x:0.55, y:0.05 },
    // Left arm reaches down to ankle
    left_elbow:    { x:0.20, y:0.56 },
    left_wrist:    { x:0.14, y:0.72 },
    left_foot:     { x:0.12, y:0.76 },
    // Hips — wide stance tilted
    left_hip:      { x:0.34, y:0.56 },
    right_hip:     { x:0.50, y:0.52 },
    // Front leg (left) — straight
    left_knee:     { x:0.24, y:0.72 },
    left_ankle:    { x:0.16, y:0.88 },
    // Back leg (right) — straight, wider
    right_knee:    { x:0.64, y:0.70 },
    right_ankle:   { x:0.76, y:0.88 },
  },

  // ── 5. Adho Mukha — Downward Dog ─────────────────────────────────
  // Inverted-V: hips high, arms and legs straight, heels toward mat
  "Adho Mukha": {
    head:          { x:0.36, y:0.42 },
    neck:          { x:0.38, y:0.36 },
    left_shoulder: { x:0.32, y:0.28 },
    right_shoulder:{ x:0.44, y:0.28 },
    left_elbow:    { x:0.22, y:0.36 },
    right_elbow:   { x:0.16, y:0.44 },
    left_wrist:    { x:0.14, y:0.50 },
    right_wrist:   { x:0.08, y:0.58 },
    left_foot:     { x:0.13, y:0.55 },
    right_foot:    { x:0.07, y:0.63 },
    // Hips at apex
    left_hip:      { x:0.50, y:0.18 },
    right_hip:     { x:0.58, y:0.20 },
    // Legs extend down-right
    left_knee:     { x:0.60, y:0.42 },
    right_knee:    { x:0.66, y:0.46 },
    left_ankle:    { x:0.68, y:0.66 },
    right_ankle:   { x:0.74, y:0.70 },
  },

  // ── 6. Setu Bandhasana — Bridge Pose ─────────────────────────────
  // Supine, feet flat, hips lifted, shoulders on mat, arms by sides
  Setu_Bandhasana: {
    // Head on mat (left side)
    head:          { x:0.10, y:0.72 },
    neck:          { x:0.18, y:0.68 },
    left_shoulder: { x:0.22, y:0.62 },
    right_shoulder:{ x:0.30, y:0.62 },
    // Arms flat on mat
    left_elbow:    { x:0.22, y:0.75 },
    right_elbow:   { x:0.30, y:0.75 },
    left_wrist:    { x:0.22, y:0.86 },
    right_wrist:   { x:0.30, y:0.86 },
    left_foot:     { x:0.22, y:0.93 },
    right_foot:    { x:0.30, y:0.93 },
    // Hips lifted at apex
    left_hip:      { x:0.46, y:0.38 },
    right_hip:     { x:0.56, y:0.38 },
    // Knees bent, feet flat
    left_knee:     { x:0.56, y:0.56 },
    right_knee:    { x:0.64, y:0.56 },
    left_ankle:    { x:0.62, y:0.76 },
    right_ankle:   { x:0.70, y:0.76 },
  },

  // ── 7. Balasana — Child's Pose ────────────────────────────────────
  // Kneel, sit back on heels, torso folded forward, arms extended
  Balasana: {
    // Head resting on mat (right)
    head:          { x:0.84, y:0.60 },
    neck:          { x:0.76, y:0.56 },
    left_shoulder: { x:0.64, y:0.52 },
    right_shoulder:{ x:0.72, y:0.52 },
    // Arms stretched forward on mat
    left_elbow:    { x:0.78, y:0.48 },
    right_elbow:   { x:0.86, y:0.46 },
    left_wrist:    { x:0.90, y:0.44 },
    right_wrist:   { x:0.94, y:0.42 },
    left_foot:     { x:0.92, y:0.45 },
    right_foot:    { x:0.96, y:0.43 },
    // Hips back toward heels
    left_hip:      { x:0.50, y:0.60 },
    right_hip:     { x:0.58, y:0.62 },
    // Knees bent sharply under body
    left_knee:     { x:0.40, y:0.70 },
    right_knee:    { x:0.46, y:0.74 },
    // Ankles/feet under hips
    left_ankle:    { x:0.32, y:0.76 },
    right_ankle:   { x:0.38, y:0.80 },
  },

  // ── 8. Utkatasana — Chair Pose ────────────────────────────────────
  // Knees bent ~90°, arms raised overhead, slight forward lean
  Utkatasana: {
    head:          { x:0.50, y:0.05 },
    neck:          { x:0.50, y:0.14 },
    left_shoulder: { x:0.38, y:0.22 },
    right_shoulder:{ x:0.62, y:0.22 },
    // Arms raised overhead
    left_elbow:    { x:0.34, y:0.12 },
    right_elbow:   { x:0.66, y:0.12 },
    left_wrist:    { x:0.32, y:0.03 },
    right_wrist:   { x:0.68, y:0.03 },
    left_foot:     { x:0.31, y:0.02 },
    right_foot:    { x:0.69, y:0.02 },
    // Hips dropped back and down
    left_hip:      { x:0.40, y:0.52 },
    right_hip:     { x:0.60, y:0.52 },
    // Knees bent to ~90°
    left_knee:     { x:0.36, y:0.70 },
    right_knee:    { x:0.64, y:0.70 },
    // Ankles — feet flat
    left_ankle:    { x:0.36, y:0.88 },
    right_ankle:   { x:0.64, y:0.88 },
  },

  // ── 9. Virabhadrasana — Warrior I ────────────────────────────────
  // Front left knee bent 90°, back right leg straight, arms overhead
  Virabhadrasana: {
    head:          { x:0.46, y:0.04 },
    neck:          { x:0.46, y:0.13 },
    left_shoulder: { x:0.36, y:0.21 },
    right_shoulder:{ x:0.56, y:0.21 },
    // Arms raised overhead
    left_elbow:    { x:0.32, y:0.12 },
    right_elbow:   { x:0.60, y:0.12 },
    left_wrist:    { x:0.30, y:0.03 },
    right_wrist:   { x:0.62, y:0.03 },
    left_foot:     { x:0.29, y:0.02 },
    right_foot:    { x:0.63, y:0.02 },
    // Torso upright
    left_hip:      { x:0.38, y:0.50 },
    right_hip:     { x:0.54, y:0.52 },
    // Front leg (left) — bent 90°
    left_knee:     { x:0.30, y:0.68 },
    left_ankle:    { x:0.22, y:0.86 },
    // Back leg (right) — straight and extended back
    right_knee:    { x:0.64, y:0.66 },
    right_ankle:   { x:0.76, y:0.84 },
  },

  // ── 10. Paschimottanasana — Seated Forward Bend ───────────────────
  // Seated, legs extended forward, torso folded deeply over legs
  Paschimottanasana: {
    // Head reaches toward feet (right side)
    head:          { x:0.82, y:0.50 },
    neck:          { x:0.74, y:0.48 },
    left_shoulder: { x:0.62, y:0.44 },
    right_shoulder:{ x:0.70, y:0.46 },
    // Arms reaching forward to feet
    left_elbow:    { x:0.76, y:0.50 },
    right_elbow:   { x:0.84, y:0.52 },
    left_wrist:    { x:0.88, y:0.54 },
    right_wrist:   { x:0.92, y:0.56 },
    left_foot:     { x:0.93, y:0.57 },
    right_foot:    { x:0.95, y:0.59 },
    // Hips on mat (seated, left side of canvas)
    left_hip:      { x:0.26, y:0.56 },
    right_hip:     { x:0.34, y:0.58 },
    // Legs extended straight to the right
    left_knee:     { x:0.52, y:0.60 },
    right_knee:    { x:0.58, y:0.62 },
    left_ankle:    { x:0.78, y:0.64 },
    right_ankle:   { x:0.84, y:0.66 },
  },
};

// Alias lookup — maps pose names as they come from the pose object
function getPoseKeypoints(poseName) {
  // Try exact match first
  if (POSES[poseName]) return POSES[poseName];
  // Try common aliases
  const aliases = {
    "Adho Mukha Svanasana": "Adho Mukha",
    "Setu Bandhasana":       "Setu_Bandhasana",
    "Adho_Mukha":            "Adho Mukha",
  };
  const key = aliases[poseName] || poseName;
  return POSES[key] || POSES["Tadasana"];
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────

function drawGlow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, color.replace("1)", "0.35)"));
  g.addColorStop(1, color.replace("1)", "0)"));
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AvatarCanvas({ pose, poseName: poseNameProp, width = 220, height = 300 }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(0);
  const tRef      = useRef(0);

  // Accept either a pose object (from YogaPage) or a poseName string
  const resolvedName = pose?.name || poseNameProp || "Tadasana";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const pts  = getPoseKeypoints(resolvedName);
    // Pre-compute pixel positions
    const px   = (k) => (pts[k]?.x ?? 0.5) * width;
    const py   = (k) => (pts[k]?.y ?? 0.5) * height;

    // Accent colour from pose data or default emerald
    const accent = pose?.color || "#10b981";
    const accentRgb = hexToRgb(accent) || { r:16, g:185, b:129 };
    const accentFull = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},1)`;
    const accentMid  = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.7)`;
    const accentDim  = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.25)`;

    function draw() {
      tRef.current += 0.018;
      const breathe = Math.sin(tRef.current) * 1.5;

      ctx.clearRect(0, 0, width, height);

      // Background radial gradient
      const bg = ctx.createRadialGradient(width/2, height/2, 5, width/2, height/2, width * 0.8);
      bg.addColorStop(0, `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.10)`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const bx = (k) => px(k);
      const by = (k) => py(k) + breathe;

      // Draw bones
      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      for (const [a, b] of CONNECTIONS) {
        if (!pts[a] || !pts[b]) continue;
        // Glow pass
        ctx.beginPath();
        ctx.moveTo(bx(a), by(a));
        ctx.lineTo(bx(b), by(b));
        ctx.strokeStyle = accentDim;
        ctx.lineWidth   = 8;
        ctx.stroke();
        // Main bone
        ctx.beginPath();
        ctx.moveTo(bx(a), by(a));
        ctx.lineTo(bx(b), by(b));
        ctx.strokeStyle = accentMid;
        ctx.lineWidth   = 2.5;
        ctx.stroke();
      }

      // Draw joint dots (skip head — drawn separately)
      for (const key of Object.keys(pts)) {
        if (key === "head" || key === "left_foot" || key === "right_foot") continue;
        const x = bx(key), y = by(key);
        // Glow
        drawGlow(ctx, x, y, 5, accentFull);
        // Dot
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle   = accentFull;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      // Head circle
      if (pts.head) {
        const hx = bx("head"), hy = by("head");
        drawGlow(ctx, hx, hy, 11, accentFull);
        ctx.beginPath();
        ctx.arc(hx, hy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = accentFull;
        ctx.lineWidth   = 2.5;
        ctx.stroke();
        // Face fill
        ctx.beginPath();
        ctx.arc(hx, hy, 9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.15)`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [resolvedName, width, height, pose?.color]);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-2xl"
        style={{ background: "rgba(0,0,0,0.30)" }}
      />
      {pose && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:1 }}>
            Reference
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", marginTop:2 }}>
            {pose.name}
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontStyle:"italic" }}>
            {pose.sanskrit}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper — convert hex colour to RGB
function hexToRgb(hex) {
  if (!hex) return null;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  if (isNaN(r)) return null;
  return { r, g, b };
}
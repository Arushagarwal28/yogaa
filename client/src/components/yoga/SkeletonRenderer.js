/**
 * SkeletonRenderer.js
 *
 * Draws the MediaPipe skeleton on a canvas with:
 *  - 16 body point connections (full body including hands, feet)
 *  - Visibility-based opacity so off-screen joints fade out
 *  - Colour-coded joint dots (green/yellow/red/hidden)
 *  - Angle labels next to important joints
 *  - Clean anti-aliased lines with glow effect
 */

import { calculateAngle } from "../../utils/poseEvaluators.js";

// All bone connections to draw (MediaPipe landmark indices)
const CONNECTIONS = [
  // Face
  [0, 7], [0, 8],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

const MIN_VIS = 0.40; // lower threshold for drawing vs evaluating

function lmVis(lm, i) {
  return lm[i] && (lm[i].visibility ?? 1) >= MIN_VIS;
}

function opacity(lm, ...indices) {
  const v = Math.min(...indices.map(i => lm[i]?.visibility ?? 1));
  return Math.max(0.15, Math.min(1, v));
}

export function drawSkeleton(ctx, lm, W = 640, H = 480) {
  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  CONNECTIONS.forEach(([s, e]) => {
    if (!lmVis(lm, s) || !lmVis(lm, e)) return;
    const alpha = opacity(lm, s, e);
    ctx.beginPath();
    ctx.moveTo(lm[s].x * W, lm[s].y * H);
    ctx.lineTo(lm[e].x * W, lm[e].y * H);
    // Glow layer
    ctx.strokeStyle = `rgba(0,255,200,${(alpha * 0.25).toFixed(2)})`;
    ctx.lineWidth   = 7;
    ctx.stroke();
    // Main line
    ctx.strokeStyle = `rgba(0,220,180,${(alpha * 0.9).toFixed(2)})`;
    ctx.lineWidth   = 2.5;
    ctx.stroke();
  });
}

// Draw a single joint dot with grade colour
export function drawJointDot(ctx, landmark, grade, W = 640, H = 480) {
  if (!landmark || grade === "hidden") return;
  const vis = landmark.visibility ?? 1;
  if (vis < MIN_VIS) return;

  const x = landmark.x * W;
  const y = landmark.y * H;
  const alpha = Math.max(0.3, vis);

  const colorMap = {
    green:  { fill: `rgba(0,220,100,${alpha})`,  stroke: `rgba(255,255,255,${alpha})` },
    yellow: { fill: `rgba(255,210,0,${alpha})`,  stroke: `rgba(255,255,255,${alpha})` },
    red:    { fill: `rgba(255,60,60,${alpha})`,  stroke: `rgba(255,255,255,${alpha})` },
  };
  const c = colorMap[grade] ?? colorMap.red;

  // Outer glow
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, 2 * Math.PI);
  ctx.fillStyle = grade === "green"
    ? `rgba(0,220,100,${(alpha * 0.2).toFixed(2)})`
    : grade === "yellow"
    ? `rgba(255,210,0,${(alpha * 0.2).toFixed(2)})`
    : `rgba(255,60,60,${(alpha * 0.2).toFixed(2)})`;
  ctx.fill();

  // Main dot
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI);
  ctx.fillStyle   = c.fill;
  ctx.fill();
  ctx.strokeStyle = c.stroke;
  ctx.lineWidth   = 2;
  ctx.stroke();
}

// Draw angle value label next to a joint (optional enhancement)
export function drawAngleLabel(ctx, landmark, angle, W = 640, H = 480) {
  if (!landmark || !angle) return;
  const x = landmark.x * W + 12;
  const y = landmark.y * H - 8;
  ctx.font      = "bold 11px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  // Small background
  const text  = `${Math.round(angle)}°`;
  const tw    = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - 2, y - 12, tw + 6, 16, 4);
  else ctx.rect(x - 2, y - 12, tw + 6, 16);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,200,0.95)";
  ctx.fillText(text, x, y);
}
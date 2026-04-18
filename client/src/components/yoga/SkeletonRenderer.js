// Connections between MediaPipe landmark indices
const CONNECTIONS = [
  [11, 13], [13, 15],  // left arm
  [12, 14], [14, 16],  // right arm
  [11, 12],            // shoulders
  [11, 23], [12, 24],  // torso sides
  [23, 24],            // hips
  [23, 25], [25, 27],  // left leg
  [24, 26], [26, 28],  // right leg
];

const MIN_VIS = 0.4; // lower than evaluator threshold so skeleton still partially draws

function vis(lm, idx) {
  return (lm[idx]?.visibility ?? 1) >= MIN_VIS;
}

export function drawSkeleton(ctx, landmarks, W = 640, H = 480) {
  ctx.lineCap = "round";

  CONNECTIONS.forEach(([s, e]) => {
    if (!vis(landmarks, s) || !vis(landmarks, e)) return;
    const opacity = Math.min(landmarks[s].visibility ?? 1, landmarks[e].visibility ?? 1);
    ctx.strokeStyle = `rgba(0,255,255,${(opacity * 0.85).toFixed(2)})`;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(landmarks[s].x * W, landmarks[s].y * H);
    ctx.lineTo(landmarks[e].x * W, landmarks[e].y * H);
    ctx.stroke();
  });
}

export function drawJointDot(ctx, landmark, color, W = 640, H = 480) {
  // If the joint grade is "hidden" PoseCamera passes color="hidden" — skip drawing
  if (!landmark || color === "hidden") return;
  const visibility = landmark.visibility ?? 1;
  if (visibility < MIN_VIS) return;

  const x = landmark.x * W;
  const y = landmark.y * H;
  const colorMap = {
    green:  "#00FF00",
    yellow: "#FFD700",
    red:    "#FF3B3B",
  };

  ctx.beginPath();
  ctx.arc(x, y, 9, 0, 2 * Math.PI);
  ctx.fillStyle   = colorMap[color] ?? "#888";
  ctx.globalAlpha = Math.max(0.4, visibility);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "white";
  ctx.lineWidth   = 2;
  ctx.stroke();
}
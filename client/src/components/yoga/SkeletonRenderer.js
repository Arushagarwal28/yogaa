const CONNECTIONS = [[11,13],[13,15],[12,14],[14,16],[11,12],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];

export function drawSkeleton(ctx, landmarks, W = 640, H = 480) {
  ctx.strokeStyle = "#00FFFF"; ctx.lineWidth = 3; ctx.lineCap = "round";
  CONNECTIONS.forEach(([s, e]) => {
    ctx.beginPath();
    ctx.moveTo(landmarks[s].x * W, landmarks[s].y * H);
    ctx.lineTo(landmarks[e].x * W, landmarks[e].y * H);
    ctx.stroke();
  });
}

export function drawJointDot(ctx, landmark, color, W = 640, H = 480) {
  const x = landmark.x * W, y = landmark.y * H;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, 2 * Math.PI);
  ctx.fillStyle = color === "green" ? "#00FF00" : color === "yellow" ? "#FFD700" : "#FF3B3B";
  ctx.fill();
  ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
}
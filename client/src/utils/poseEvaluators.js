// ─── Angle calculation ────────────────────────────────────────────────────────

export function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// ─── Visibility gate ──────────────────────────────────────────────────────────
// MediaPipe returns visibility (0–1) per landmark.
// If ANY of the three points that form a joint angle are not clearly visible,
// we must not grade that joint — it would produce a bogus angle from off-screen
// or interpolated coordinates and falsely appear green.

const MIN_VISIBILITY = 0.55; // tuned: 0.5 misses partial occlusion, 0.65 too strict

function isVisible(...pts) {
  return pts.every((p) => p && (p.visibility ?? 1) >= MIN_VISIBILITY);
}

// ─── Smoothing buffer ─────────────────────────────────────────────────────────
// Grade changes caused by a single frame (lighting flicker, model jitter) are
// filtered out by a short rolling-majority window per joint per pose.

const BUFFER_SIZE = 6; // frames — ~200 ms at 30 fps
const smoothBuffers = {}; // { "pose_joint": ["green","green","yellow",...] }

function smoothGrade(poseKey, jointKey, grade) {
  const key = `${poseKey}_${jointKey}`;
  if (!smoothBuffers[key]) smoothBuffers[key] = [];
  const buf = smoothBuffers[key];
  buf.push(grade);
  if (buf.length > BUFFER_SIZE) buf.shift();

  // Return the majority vote across the buffer
  const counts = { green: 0, yellow: 0, red: 0, hidden: 0 };
  buf.forEach((g) => counts[g]++);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function clearSmoothBuffers() {
  Object.keys(smoothBuffers).forEach((k) => delete smoothBuffers[k]);
}

// ─── Grade helpers ────────────────────────────────────────────────────────────

// Grade a joint that should be straight (ideal ≈ 180°)
function gradeStraight(pts, tolerance = 15) {
  if (!isVisible(...pts)) return "hidden";
  const angle = calculateAngle(...pts);
  const diff  = Math.abs(180 - angle);
  if (diff <= tolerance)         return "green";
  if (diff <= tolerance * 1.8)   return "yellow";
  return "red";
}

// Grade a joint with an arbitrary ideal angle
function gradeAngle(pts, ideal, tolerance = 15) {
  if (!isVisible(...pts)) return "hidden";
  const angle = calculateAngle(...pts);
  const diff  = Math.abs(ideal - angle);
  if (diff <= tolerance)         return "green";
  if (diff <= tolerance * 1.8)   return "yellow";
  return "red";
}

// ─── MediaPipe landmark indices (for reference) ───────────────────────────────
// 11 left_shoulder  12 right_shoulder
// 13 left_elbow     14 right_elbow
// 15 left_wrist     16 right_wrist
// 23 left_hip       24 right_hip
// 25 left_knee      26 right_knee
// 27 left_ankle     28 right_ankle

// ─── Pose evaluators ──────────────────────────────────────────────────────────

export function evaluateTadasana(lm) {
  const raw = {
    leftKnee:      gradeStraight([lm[23], lm[25], lm[27]], 12),
    rightKnee:     gradeStraight([lm[24], lm[26], lm[28]], 12),
    leftElbow:     gradeStraight([lm[11], lm[13], lm[15]], 15),
    rightElbow:    gradeStraight([lm[12], lm[14], lm[16]], 15),
    leftShoulder:  gradeStraight([lm[13], lm[11], lm[23]], 15),
    rightShoulder: gradeStraight([lm[14], lm[12], lm[24]], 15),
    spine:         gradeStraight([lm[11], lm[23], lm[25]], 10),
  };
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, smoothGrade("tadasana", k, v)])
  );
}

export function evaluateVrikshasana(lm) {
  // Determine which leg is the standing leg (straighter one)
  const lKnee = isVisible(lm[23], lm[25], lm[27])
    ? calculateAngle(lm[23], lm[25], lm[27]) : null;
  const rKnee = isVisible(lm[24], lm[26], lm[28])
    ? calculateAngle(lm[24], lm[26], lm[28]) : null;

  const gradeStanding = (a) => {
    if (a === null) return "hidden";
    const diff = Math.abs(180 - a);
    if (diff <= 12) return "green";
    if (diff <= 22) return "yellow";
    return "red";
  };

  const gradeBent = (a) => {
    if (a === null) return "hidden";
    // foot placed on inner thigh: knee angle ~60–100°
    if (a >= 55 && a <= 105) return "green";
    if (a >= 35 && a <= 125) return "yellow";
    return "red";
  };

  const raw = {
    standingLeg: gradeStanding(lKnee),
    raisedLeg:   gradeBent(rKnee),
    leftArm:     gradeStraight([lm[11], lm[13], lm[15]], 15),
    rightArm:    gradeStraight([lm[12], lm[14], lm[16]], 15),
    spine:       gradeStraight([lm[11], lm[23], lm[25]], 10),
  };
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, smoothGrade("vrikshasana", k, v)])
  );
}

export function evaluateTrikonasana(lm) {
  const raw = {
    leftLeg:  gradeStraight([lm[23], lm[25], lm[27]], 12),
    rightLeg: gradeStraight([lm[24], lm[26], lm[28]], 12),
    leftArm:  gradeStraight([lm[11], lm[13], lm[15]], 15),
    rightArm: gradeStraight([lm[12], lm[14], lm[16]], 15),
    // Torso should be tilted ~90° sideways
    torso:    gradeAngle([lm[11], lm[23], lm[25]], 90, 15),
  };
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, smoothGrade("trikonasana", k, v)])
  );
}

export function evaluateBhujangasana(lm) {
  const raw = {
    leftElbow:  gradeAngle([lm[11], lm[13], lm[15]], 145, 18),
    rightElbow: gradeAngle([lm[12], lm[14], lm[16]], 145, 18),
    // Spine arching — shoulder-hip-knee angle opens up
    spine:      gradeAngle([lm[11], lm[23], lm[25]], 145, 18),
    leftLeg:    gradeStraight([lm[23], lm[25], lm[27]], 12),
    rightLeg:   gradeStraight([lm[24], lm[26], lm[28]], 12),
  };
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, smoothGrade("bhujangasana", k, v)])
  );
}

// ─── Score calculation ────────────────────────────────────────────────────────
// "hidden" joints are excluded from the score entirely — they must not count as
// correct OR incorrect since we simply cannot see them.

export function calculateScore(feedback) {
  const values = Object.values(feedback).filter((v) => v !== "hidden");
  if (values.length === 0) return 0;
  const sum = values.reduce(
    (acc, v) => acc + (v === "green" ? 1 : v === "yellow" ? 0.5 : 0),
    0
  );
  return Math.round((sum / values.length) * 100);
}

// ─── Joint → landmark index map ──────────────────────────────────────────────
// Used by PoseCamera to know which dot to colour on the canvas.
export const JOINT_INDEX = {
  // Tadasana / shared
  leftKnee:      25,
  rightKnee:     26,
  leftElbow:     13,
  rightElbow:    14,
  leftShoulder:  11,
  rightShoulder: 12,
  spine:         23,
  // Vrikshasana
  standingLeg:   25,
  raisedLeg:     26,
  leftArm:       13,
  rightArm:      14,
  // Trikonasana / Bhujangasana
  leftLeg:       25,
  rightLeg:      26,
  torso:         23,
};
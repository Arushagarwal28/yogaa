export function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;

  return angle;
}

// ✅ NEW: visibility check
function isVisible(...points) {
  return points.every((p) => p && (p.visibility ?? p.score ?? 0) > 0.5);
}

// grading
function grade(angle, ideal = 180) {
  const diff = Math.abs(ideal - angle);
  if (diff < 10) return "green";
  if (diff < 25) return "yellow";
  return "red";
}

// ✅ NEW: safe evaluator
function safeGrade(a, b, c, ideal = 180) {
  if (!isVisible(a, b, c)) {
    return "not_detected"; // 👈 important
  }
  return grade(calculateAngle(a, b, c), ideal);
}

export function evaluateTadasana(landmarks) {
  return {
    leftKnee: safeGrade(landmarks[23], landmarks[25], landmarks[27]),
    rightKnee: safeGrade(landmarks[24], landmarks[26], landmarks[28]),
    leftElbow: safeGrade(landmarks[11], landmarks[13], landmarks[15]),
    rightElbow: safeGrade(landmarks[12], landmarks[14], landmarks[16]),
    leftShoulder: safeGrade(landmarks[13], landmarks[11], landmarks[23]),
    rightShoulder: safeGrade(landmarks[14], landmarks[12], landmarks[24]),
    spine: safeGrade(landmarks[11], landmarks[23], landmarks[25]),
  };
}

export function evaluateVrikshasana(landmarks) {
  const gradeBent = (angle) => {
    if (angle > 40 && angle < 110) return "green";
    if (angle > 25 && angle < 140) return "yellow";
    return "red";
  };

  const safeBent = (a, b, c) => {
    if (!isVisible(a, b, c)) return "not_detected";
    return gradeBent(calculateAngle(a, b, c));
  };

  return {
    standingLeg: safeGrade(landmarks[23], landmarks[25], landmarks[27]),
    raisedLeg: safeBent(landmarks[24], landmarks[26], landmarks[28]),
    leftArm: safeGrade(landmarks[11], landmarks[13], landmarks[15]),
    rightArm: safeGrade(landmarks[12], landmarks[14], landmarks[16]),
  };
}
// ✅ Joint index mapping (MediaPipe)
export const JOINT_INDEX = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

// ✅ Score calculator
export function calculateScore(results) {
  let score = 0;
  let total = 0;

  Object.values(results).forEach((val) => {
    if (val === "not_detected") return;

    total++;
    if (val === "green") score += 1;
    else if (val === "yellow") score += 0.5;
  });

  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

// ✅ Placeholder for Trikonasana (so app doesn't crash)
export function evaluateTrikonasana(landmarks) {
  return {
    leftLeg: "not_detected",
    rightLeg: "not_detected",
    leftArm: "not_detected",
    rightArm: "not_detected",
    torso: "not_detected",
  };
}
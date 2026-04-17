export function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function grade(angle, ideal = 180) {
  const diff = Math.abs(ideal - angle);
  if (diff < 10) return "green";
  if (diff < 25) return "yellow";
  return "red";
}

export function evaluateTadasana(landmarks) {
  return {
    leftKnee:      grade(calculateAngle(landmarks[23], landmarks[25], landmarks[27])),
    rightKnee:     grade(calculateAngle(landmarks[24], landmarks[26], landmarks[28])),
    leftElbow:     grade(calculateAngle(landmarks[11], landmarks[13], landmarks[15])),
    rightElbow:    grade(calculateAngle(landmarks[12], landmarks[14], landmarks[16])),
    leftShoulder:  grade(calculateAngle(landmarks[13], landmarks[11], landmarks[23])),
    rightShoulder: grade(calculateAngle(landmarks[14], landmarks[12], landmarks[24])),
    spine:         grade(calculateAngle(landmarks[11], landmarks[23], landmarks[25])),
  };
}

export function evaluateVrikshasana(landmarks) {
  const lKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
  const rKnee = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
  const gradeBent = (a) => (a > 40 && a < 110) ? "green" : (a > 25 && a < 140) ? "yellow" : "red";
  return {
    standingLeg: grade(lKnee),
    raisedLeg:   gradeBent(rKnee),
    leftArm:     grade(calculateAngle(landmarks[11], landmarks[13], landmarks[15])),
    rightArm:    grade(calculateAngle(landmarks[12], landmarks[14], landmarks[16])),
    spine:       grade(calculateAngle(landmarks[11], landmarks[23], landmarks[25])),
  };
}

export function evaluateTrikonasana(landmarks) {
  return {
    leftLeg:  grade(calculateAngle(landmarks[23], landmarks[25], landmarks[27])),
    rightLeg: grade(calculateAngle(landmarks[24], landmarks[26], landmarks[28])),
    leftArm:  grade(calculateAngle(landmarks[11], landmarks[13], landmarks[15])),
    rightArm: grade(calculateAngle(landmarks[12], landmarks[14], landmarks[16])),
    torso:    grade(calculateAngle(landmarks[11], landmarks[23], landmarks[25])),
  };
}

export function calculateScore(feedback) {
  const values = Object.values(feedback);
  const score  = values.reduce((acc, v) => acc + (v === "green" ? 1 : v === "yellow" ? 0.5 : 0), 0);
  return Math.round((score / values.length) * 100);
}

export const JOINT_INDEX = {
  leftKnee: 25, rightKnee: 26, leftElbow: 13, rightElbow: 14,
  leftShoulder: 11, rightShoulder: 12, spine: 23,
  standingLeg: 25, raisedLeg: 26, leftArm: 13, rightArm: 14, torso: 23,
};
const STANDARD_POSES = require("../data/standardPoses.js");

function evaluatePose(poseName, userAngles) {
  const standard = STANDARD_POSES[poseName];
  if (!standard) throw new Error(`Pose "${poseName}" not found in standard angles database`);

  const joints = Object.keys(standard);
  let weightedScore = 0;
  let totalWeight   = 0;
  const jointResults = {};
  const feedback     = [];

  joints.forEach((joint) => {
    const { ideal, tolerance, weight, hint } = standard[joint];
    const userAngle = userAngles[joint];
    if (userAngle == null) return;

    const diff       = Math.abs(userAngle - ideal);
    const jointScore = diff <= tolerance ? 100 : Math.max(0, 100 - (diff - tolerance) * 2);
    const status     = diff <= tolerance ? "green" : diff <= tolerance * 2.5 ? "yellow" : "red";

    weightedScore += jointScore * weight;
    totalWeight   += weight;

    jointResults[joint] = { userAngle, ideal, diff: Math.round(diff), score: Math.round(jointScore), status };

    if (status !== "green") feedback.push({ joint, status, message: hint, diff: Math.round(diff) });
  });

  const finalScore    = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  const overallStatus = finalScore >= 85 ? "excellent" : finalScore >= 70 ? "good" : finalScore >= 50 ? "fair" : "needs_work";
  const coinsEarned   = finalScore >= 90 ? 10 : finalScore >= 75 ? 6 : finalScore >= 50 ? 3 : 1;

  return { score: finalScore, status: overallStatus, jointResults, feedback, coinsEarned };
}

function getPoseList() {
  return Object.keys(STANDARD_POSES).map((name) => ({ name, joints: Object.keys(STANDARD_POSES[name]) }));
}

function getStandardAngles(poseName) {
  const standard = STANDARD_POSES[poseName];
  if (!standard) throw new Error(`Pose "${poseName}" not found`);
  return standard;
}

module.exports = { evaluatePose, getPoseList, getStandardAngles };
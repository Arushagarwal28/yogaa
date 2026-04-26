const STANDARD_POSES = require("../data/standardPoses.js");

/**
 * evaluatePose
 *
 * Scores a yoga pose against standard joint angles.
 *
 * INVISIBLE JOINT POLICY:
 * If a joint angle is missing (null/undefined) — meaning MediaPipe
 * could not detect that body part — we do NOT skip it. Instead we
 * treat it as maximally wrong: score=0, status="red", diff=180.
 * This prevents a user from gaining a high score by hiding limbs.
 * The feedback will tell them the body part wasn't visible.
 */
function evaluatePose(poseName, userAngles) {
  const standard = STANDARD_POSES[poseName];
  if (!standard) throw new Error(`Pose "${poseName}" not found in standard angles database`);

  const joints        = Object.keys(standard);
  let weightedScore   = 0;
  let totalWeight     = 0;
  const jointResults  = {};
  const feedback      = [];
  const missingJoints = [];

  joints.forEach((joint) => {
    const { ideal, tolerance, weight, hint } = standard[joint];
    const userAngle = userAngles[joint];

    // ── Missing / invisible joint ──────────────────────────────────────
    if (userAngle == null) {
      // Penalise fully — treat as worst possible deviation
      weightedScore += 0 * weight;   // 0 score contribution
      totalWeight   += weight;       // weight still counts

      missingJoints.push(joint);

      jointResults[joint] = {
        userAngle: null,
        ideal,
        diff:   180,
        score:  0,
        status: "red",
        missing: true,
      };

      feedback.push({
        joint,
        status:  "red",
        message: `${joint.replace(/_/g, " ")} not visible — make sure your full body is in frame`,
        diff:    180,
        missing: true,
      });
      return;
    }

    // ── Visible joint — normal scoring ─────────────────────────────────
    const diff       = Math.abs(userAngle - ideal);
    const jointScore = diff <= tolerance ? 100 : Math.max(0, 100 - (diff - tolerance) * 2);
    const status     = diff <= tolerance ? "green" : diff <= tolerance * 2.5 ? "yellow" : "red";

    weightedScore += jointScore * weight;
    totalWeight   += weight;

    jointResults[joint] = {
      userAngle,
      ideal,
      diff:  Math.round(diff),
      score: Math.round(jointScore),
      status,
    };

    if (status !== "green") {
      feedback.push({ joint, status, message: hint, diff: Math.round(diff) });
    }
  });

  const finalScore    = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  const overallStatus = finalScore >= 85 ? "excellent" : finalScore >= 70 ? "good" : finalScore >= 50 ? "fair" : "needs_work";
  const coinsEarned   = finalScore >= 90 ? 10 : finalScore >= 75 ? 6 : finalScore >= 50 ? 3 : 1;

  return {
    score: finalScore,
    status: overallStatus,
    jointResults,
    feedback,
    coinsEarned,
    missingJoints,   // passed to Gemini so it can mention visibility issue
  };
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
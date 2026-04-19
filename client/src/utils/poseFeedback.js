import { getHints } from "./poseEvaluators.js";

/**
 * generateFeedback(feedback, poseName)
 *
 * Returns an array of feedback message strings for the FeedbackPanel.
 * Uses the hint messages from POSE_DEFS so every pose gets specific,
 * accurate cues instead of generic messages.
 */
export function generateFeedback(feedback, poseName) {
  const hints = getHints(feedback, poseName);
  // Return just the hint strings (for backward compatibility with existing callers)
  return hints.map(h => h.hint);
}

/**
 * generateDetailedFeedback(feedback, poseName)
 *
 * Returns structured feedback objects for FeedbackPanel with joint name,
 * status, message, and grade — used by the live camera overlay.
 */
export function generateDetailedFeedback(feedback, poseName) {
  const hints = getHints(feedback, poseName);
  return hints.map(({ joint, grade, hint }) => ({
    joint:    joint.replace(/([A-Z])/g, " $1").trim(),
    status:   grade,
    message:  hint,
    angleDiff: 0,
  }));
}
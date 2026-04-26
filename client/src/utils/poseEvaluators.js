/**
 * poseEvaluators.js
 *
 * Evaluates yoga poses against standard biomechanical angles using
 * MediaPipe's 33-landmark skeleton.
 *
 * Key improvements over original:
 *  1. 16 body points tracked (was 5-7)
 *  2. Visibility gate — joints not in frame return "hidden", never false-green
 *  3. Weighted scoring — critical joints (spine, load-bearing knees) count more
 *  4. Smoothing buffer — 8-frame majority vote eliminates single-frame flicker
 *  5. All 10 poses covered with standard biomechanical angles
 *  6. Hip angles added for better posture detection
 *  7. Ankle angles added for balance poses
 *  8. Shoulder abduction tracked separately from elbow
 *
 * MediaPipe landmark indices used:
 *  0=nose  7=left_ear  8=right_ear
 *  11=L_shoulder  12=R_shoulder
 *  13=L_elbow     14=R_elbow
 *  15=L_wrist     16=R_wrist
 *  19=L_index     20=R_index
 *  23=L_hip       24=R_hip
 *  25=L_knee      26=R_knee
 *  27=L_ankle     28=R_ankle
 *  29=L_heel      30=R_heel
 *  31=L_foot_idx  32=R_foot_idx
 */

// ─── Core angle calculator ────────────────────────────────────────────────────
// Returns the interior angle at point B formed by rays B→A and B→C (degrees)
export function calculateAngle(A, B, C) {
  const radians =
    Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// ─── Visibility gate ──────────────────────────────────────────────────────────
// MediaPipe returns visibility 0-1 per landmark. Off-screen landmarks have very
// low visibility but still return plausible coordinates, causing false greens.
// We require ALL three points forming a joint to be clearly visible.
const MIN_VIS = 0.50; // slightly relaxed to 0.50 so partial frames still score

function vis(...pts) {
  return pts.every(p => p && (p.visibility ?? 1) >= MIN_VIS);
}

// ─── Joint definition map ─────────────────────────────────────────────────────
// Defines every measurable joint as [A, B, C] landmark indices.
// The angle is measured at B.
const JOINTS = {
  // Knees
  leftKnee:         [23, 25, 27],
  rightKnee:        [24, 26, 28],
  // Hips (trunk-to-leg angle)
  leftHip:          [11, 23, 25],
  rightHip:         [12, 24, 26],
  // Hip abduction (stance width / leg spread)
  leftHipAbduct:    [25, 23, 24],
  rightHipAbduct:   [26, 24, 23],
  // Elbows
  leftElbow:        [11, 13, 15],
  rightElbow:       [12, 14, 16],
  // Shoulder abduction (how far arm is raised from torso)
  leftShoulder:     [13, 11, 23],
  rightShoulder:    [14, 12, 24],
  // Wrists (hand alignment)
  leftWrist:        [13, 15, 19],
  rightWrist:       [14, 16, 20],
  // Ankles (dorsi/plantar flexion)
  leftAnkle:        [25, 27, 31],
  rightAnkle:       [26, 28, 32],
  // Spine proxy: shoulder → hip → knee alignment
  spineLeft:        [11, 23, 25],
  spineRight:       [12, 24, 26],
  // Neck: ear → shoulder → hip (lateral head tilt)
  neckLeft:         [7,  11, 23],
  neckRight:        [8,  12, 24],
};

// ─── Smoothing buffer ─────────────────────────────────────────────────────────
// 8-frame majority vote per pose+joint key. Prevents flicker from model jitter.
const SMOOTH_BUF  = {};
const SMOOTH_SIZE = 8;

function smooth(poseKey, jointKey, grade) {
  const k   = `${poseKey}|${jointKey}`;
  const buf = SMOOTH_BUF[k] || (SMOOTH_BUF[k] = []);
  buf.push(grade);
  if (buf.length > SMOOTH_SIZE) buf.shift();
  const counts = { green: 0, yellow: 0, red: 0, hidden: 0 };
  buf.forEach(g => counts[g]++);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function clearSmoothBuffers() {
  Object.keys(SMOOTH_BUF).forEach(k => delete SMOOTH_BUF[k]);
}

// ─── Grade a joint ────────────────────────────────────────────────────────────
// Returns green/yellow/red/hidden based on how close the measured angle is
// to the ideal, with separate tolerance bands for yellow and red.
function gradeJoint(lm, indices, ideal, greenTol, yellowTol) {
  const [ai, bi, ci] = indices;
  if (!vis(lm[ai], lm[bi], lm[ci])) return "hidden";
  const angle = calculateAngle(lm[ai], lm[bi], lm[ci]);
  const diff  = Math.abs(ideal - angle);
  if (diff <= greenTol)  return "green";
  if (diff <= yellowTol) return "yellow";
  return "red";
}

// ─── Pose definitions ─────────────────────────────────────────────────────────
// Each pose maps joint names to:
//   indices  – [A,B,C] landmark indices (angle measured at B)
//   ideal    – target angle in degrees (from biomechanics research)
//   green    – ± tolerance for green (perfect)
//   yellow   – ± tolerance for yellow (acceptable)
//   weight   – scoring multiplier (2 = load-bearing/critical, 1 = normal)
//   hint     – correction cue shown to user

const POSE_DEFS = {

  // ── Tadasana (Mountain Pose) ─────────────────────────────────────
  // Stand tall, feet together, arms relaxed at sides, gaze forward
  Tadasana: {
    leftKnee:      { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your left knee fully" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your right knee fully" },
    leftHip:       { indices:[11,23,25], ideal:180, green:10, yellow:20, weight:2, hint:"Align your left hip — stand tall" },
    rightHip:      { indices:[12,24,26], ideal:180, green:10, yellow:20, weight:2, hint:"Align your right hip — stand tall" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:25, weight:1, hint:"Keep your left arm relaxed and straight" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:25, weight:1, hint:"Keep your right arm relaxed and straight" },
    leftShoulder:  { indices:[13,11,23], ideal:175, green:12, yellow:25, weight:1, hint:"Relax your left shoulder down" },
    rightShoulder: { indices:[14,12,24], ideal:175, green:12, yellow:25, weight:1, hint:"Relax your right shoulder down" },
    leftAnkle:     { indices:[25,27,31], ideal:90,  green:12, yellow:22, weight:1, hint:"Keep your left foot flat, weight even" },
    rightAnkle:    { indices:[26,28,32], ideal:90,  green:12, yellow:22, weight:1, hint:"Keep your right foot flat, weight even" },
    neckLeft:      { indices:[7,11,23],  ideal:165, green:15, yellow:28, weight:1, hint:"Keep your head upright and centred" },
    spine:         { indices:[11,23,25], ideal:180, green:8,  yellow:16, weight:2, hint:"Stand perfectly tall — elongate your spine" },
  },

  // ── Vrikshasana (Tree Pose) ──────────────────────────────────────
  // Balance on left leg, right foot on inner left thigh, arms overhead
  Vrikshasana: {
    standingKnee:  { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:2, hint:"Lock your standing (left) knee straight" },
    raisedKnee:    { indices:[24,26,28], ideal:70,  green:15, yellow:28, weight:2, hint:"Raise your right foot higher onto the inner thigh" },
    standingHip:   { indices:[11,23,25], ideal:180, green:10, yellow:20, weight:2, hint:"Keep your standing hip directly over your ankle" },
    leftShoulder:  { indices:[13,11,23], ideal:170, green:12, yellow:25, weight:1, hint:"Raise your left arm fully overhead" },
    rightShoulder: { indices:[14,12,24], ideal:170, green:12, yellow:25, weight:1, hint:"Raise your right arm fully overhead" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your left arm overhead" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your right arm overhead" },
    spine:         { indices:[11,23,25], ideal:180, green:8,  yellow:16, weight:2, hint:"Keep your torso upright — do not lean sideways" },
    neckLeft:      { indices:[7,11,23],  ideal:165, green:15, yellow:28, weight:1, hint:"Gaze forward, keep head centred" },
  },

  // ── Trikonasana (Triangle Pose) ──────────────────────────────────
  // Feet wide, front leg straight, torso lateral tilt, arms spread wide
  Trikonasana: {
    leftKnee:      { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your front (left) leg completely" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your back (right) leg completely" },
    leftHipAbduct: { indices:[25,23,24], ideal:55,  green:15, yellow:28, weight:1, hint:"Widen your stance further apart" },
    leftShoulder:  { indices:[13,11,23], ideal:90,  green:15, yellow:28, weight:2, hint:"Reach your top arm directly up toward the ceiling" },
    rightShoulder: { indices:[14,12,24], ideal:90,  green:15, yellow:28, weight:2, hint:"Extend your lower arm down toward the ankle" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Keep your top (left) arm fully extended" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Keep your lower (right) arm fully extended" },
    torso:         { indices:[11,23,25], ideal:90,  green:15, yellow:25, weight:2, hint:"Tilt your torso sideways — open chest to the side wall" },
    leftAnkle:     { indices:[25,27,31], ideal:90,  green:12, yellow:22, weight:1, hint:"Ground your front foot firmly" },
  },

  // ── Bhujangasana (Cobra Pose) ────────────────────────────────────
  // Lie prone, lift chest with elbows slightly bent, legs flat
  Bhujangasana: {
    leftElbow:     { indices:[11,13,15], ideal:150, green:15, yellow:28, weight:2, hint:"Soften your left elbow — do not lock it straight" },
    rightElbow:    { indices:[12,14,16], ideal:150, green:15, yellow:28, weight:2, hint:"Soften your right elbow — do not lock it straight" },
    leftShoulder:  { indices:[13,11,23], ideal:50,  green:15, yellow:28, weight:2, hint:"Draw your left shoulder back and down" },
    rightShoulder: { indices:[14,12,24], ideal:50,  green:15, yellow:28, weight:2, hint:"Draw your right shoulder back and down" },
    leftKnee:      { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:1, hint:"Keep your left leg flat on the mat" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:1, hint:"Keep your right leg flat on the mat" },
    leftHip:       { indices:[11,23,25], ideal:175, green:10, yellow:20, weight:1, hint:"Press your left hip into the mat" },
    rightHip:      { indices:[12,24,26], ideal:175, green:10, yellow:20, weight:1, hint:"Press your right hip into the mat" },
    spine:         { indices:[11,23,25], ideal:145, green:15, yellow:28, weight:2, hint:"Arch your back more — lift your chest higher" },
  },

  // ── Utkatasana (Chair Pose) ──────────────────────────────────────
  // Knees bent to ~90°, arms raised, slight forward lean
  Utkatasana: {
    leftKnee:      { indices:[23,25,27], ideal:90,  green:12, yellow:22, weight:2, hint:"Bend your left knee deeper — sit lower" },
    rightKnee:     { indices:[24,26,28], ideal:90,  green:12, yellow:22, weight:2, hint:"Bend your right knee deeper — sit lower" },
    leftHip:       { indices:[11,23,25], ideal:55,  green:15, yellow:28, weight:2, hint:"Sit further back — push hips behind your heels" },
    rightHip:      { indices:[12,24,26], ideal:55,  green:15, yellow:28, weight:2, hint:"Sit further back — push hips behind your heels" },
    leftShoulder:  { indices:[13,11,23], ideal:160, green:15, yellow:28, weight:1, hint:"Raise your left arm higher alongside your ear" },
    rightShoulder: { indices:[14,12,24], ideal:160, green:15, yellow:28, weight:1, hint:"Raise your right arm higher alongside your ear" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your left arm fully overhead" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your right arm fully overhead" },
    spine:         { indices:[11,23,25], ideal:170, green:10, yellow:20, weight:2, hint:"Lengthen your spine — avoid rounding forward" },
    leftAnkle:     { indices:[25,27,31], ideal:70,  green:12, yellow:22, weight:1, hint:"Keep your left heel firmly on the mat" },
    rightAnkle:    { indices:[26,28,32], ideal:70,  green:12, yellow:22, weight:1, hint:"Keep your right heel firmly on the mat" },
  },

  // ── Virabhadrasana (Warrior I) ───────────────────────────────────
  // Front knee 90°, back leg straight, arms overhead
  Virabhadrasana: {
    leftKnee:      { indices:[23,25,27], ideal:90,  green:12, yellow:22, weight:2, hint:"Bend your front (left) knee to 90°" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your back (right) leg completely" },
    leftHip:       { indices:[11,23,25], ideal:90,  green:12, yellow:22, weight:2, hint:"Square your left hip forward over your front foot" },
    rightHip:      { indices:[12,24,26], ideal:170, green:12, yellow:22, weight:1, hint:"Press your right hip forward — square the pelvis" },
    leftShoulder:  { indices:[13,11,23], ideal:170, green:12, yellow:25, weight:1, hint:"Raise your left arm fully overhead" },
    rightShoulder: { indices:[14,12,24], ideal:170, green:12, yellow:25, weight:1, hint:"Raise your right arm fully overhead" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your left arm fully" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Straighten your right arm fully" },
    spine:         { indices:[11,23,25], ideal:180, green:10, yellow:20, weight:2, hint:"Keep your torso upright over the front knee" },
    leftAnkle:     { indices:[25,27,31], ideal:70,  green:12, yellow:22, weight:1, hint:"Ground your front foot — knee over ankle" },
  },

  // ── Adho_Mukha (Downward Dog) ────────────────────────────────────
  // Inverted V — hips high, arms and legs straight, heels toward mat
  Adho_Mukha: {
    leftKnee:      { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your left leg — press heel toward mat" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:2, hint:"Straighten your right leg — press heel toward mat" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:10, yellow:20, weight:2, hint:"Lock your left arm straight, press through palm" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:10, yellow:20, weight:2, hint:"Lock your right arm straight, press through palm" },
    leftShoulder:  { indices:[13,11,23], ideal:165, green:12, yellow:25, weight:2, hint:"Rotate your left shoulder outward — broaden the back" },
    rightShoulder: { indices:[14,12,24], ideal:165, green:12, yellow:25, weight:2, hint:"Rotate your right shoulder outward — broaden the back" },
    leftHip:       { indices:[11,23,25], ideal:60,  green:12, yellow:22, weight:2, hint:"Push your left hip higher toward the ceiling" },
    rightHip:      { indices:[12,24,26], ideal:60,  green:12, yellow:22, weight:2, hint:"Push your right hip higher toward the ceiling" },
    leftAnkle:     { indices:[25,27,31], ideal:65,  green:15, yellow:28, weight:1, hint:"Press your left heel toward the floor" },
    rightAnkle:    { indices:[26,28,32], ideal:65,  green:15, yellow:28, weight:1, hint:"Press your right heel toward the floor" },
    spine:         { indices:[11,23,25], ideal:60,  green:12, yellow:22, weight:2, hint:"Lengthen spine — push hips up and back" },
  },

  // ── Balasana (Child's Pose) ──────────────────────────────────────
  // Kneel and fold forward, forehead to mat, arms extended
  Balasana: {
    leftKnee:      { indices:[23,25,27], ideal:40,  green:15, yellow:28, weight:2, hint:"Fold your left knee more — sit back onto your heels" },
    rightKnee:     { indices:[24,26,28], ideal:40,  green:15, yellow:28, weight:2, hint:"Fold your right knee more — sit back onto your heels" },
    leftHip:       { indices:[11,23,25], ideal:35,  green:15, yellow:28, weight:2, hint:"Sink your left hip further back toward your heel" },
    rightHip:      { indices:[12,24,26], ideal:35,  green:15, yellow:28, weight:2, hint:"Sink your right hip further back toward your heel" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Extend your left arm fully forward on the mat" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Extend your right arm fully forward on the mat" },
    leftShoulder:  { indices:[13,11,23], ideal:155, green:15, yellow:28, weight:1, hint:"Relax your left shoulder — let it melt toward the mat" },
    rightShoulder: { indices:[14,12,24], ideal:155, green:15, yellow:28, weight:1, hint:"Relax your right shoulder — let it melt toward the mat" },
    spine:         { indices:[11,23,25], ideal:45,  green:15, yellow:28, weight:2, hint:"Round your spine — lower chest closer to the mat" },
  },

  // ── Setu_Bandhasana (Bridge Pose) ────────────────────────────────
  // Lie supine, lift hips, knees at 90°, arms flat by sides
  Setu_Bandhasana: {
    leftKnee:      { indices:[23,25,27], ideal:90,  green:12, yellow:22, weight:2, hint:"Keep your left knee at 90° — foot flat on the mat" },
    rightKnee:     { indices:[24,26,28], ideal:90,  green:12, yellow:22, weight:2, hint:"Keep your right knee at 90° — foot flat on the mat" },
    leftHip:       { indices:[11,23,25], ideal:135, green:15, yellow:28, weight:2, hint:"Lift your left hip higher — squeeze glutes" },
    rightHip:      { indices:[12,24,26], ideal:135, green:15, yellow:28, weight:2, hint:"Lift your right hip higher — squeeze glutes" },
    leftElbow:     { indices:[11,13,15], ideal:180, green:12, yellow:22, weight:1, hint:"Keep your left arm flat and straight on the mat" },
    rightElbow:    { indices:[12,14,16], ideal:180, green:12, yellow:22, weight:1, hint:"Keep your right arm flat and straight on the mat" },
    leftShoulder:  { indices:[13,11,23], ideal:175, green:12, yellow:22, weight:1, hint:"Press your left shoulder blade into the mat" },
    rightShoulder: { indices:[14,12,24], ideal:175, green:12, yellow:22, weight:1, hint:"Press your right shoulder blade into the mat" },
    leftAnkle:     { indices:[25,27,31], ideal:90,  green:12, yellow:22, weight:1, hint:"Keep your left foot flat, parallel to body" },
    rightAnkle:    { indices:[26,28,32], ideal:90,  green:12, yellow:22, weight:1, hint:"Keep your right foot flat, parallel to body" },
    spine:         { indices:[11,23,25], ideal:138, green:15, yellow:28, weight:2, hint:"Lift hips higher — straight line shoulder to knee" },
  },

  // ── Paschimottanasana (Seated Forward Bend) ───────────────────────
  // Seated, legs extended, fold forward reaching toward feet
  Paschimottanasana: {
    leftKnee:      { indices:[23,25,27], ideal:180, green:10, yellow:20, weight:2, hint:"Fully extend your left leg — do not bend the knee" },
    rightKnee:     { indices:[24,26,28], ideal:180, green:10, yellow:20, weight:2, hint:"Fully extend your right leg — do not bend the knee" },
    leftHip:       { indices:[11,23,25], ideal:55,  green:15, yellow:28, weight:2, hint:"Fold deeper from your left hip — hinge forward" },
    rightHip:      { indices:[12,24,26], ideal:55,  green:15, yellow:28, weight:2, hint:"Fold deeper from your right hip — hinge forward" },
    leftElbow:     { indices:[11,13,15], ideal:170, green:15, yellow:28, weight:1, hint:"Reach your left arm further toward your feet" },
    rightElbow:    { indices:[12,14,16], ideal:170, green:15, yellow:28, weight:1, hint:"Reach your right arm further toward your feet" },
    leftShoulder:  { indices:[13,11,23], ideal:145, green:15, yellow:28, weight:1, hint:"Extend your left shoulder forward in the fold" },
    rightShoulder: { indices:[14,12,24], ideal:145, green:15, yellow:28, weight:1, hint:"Extend your right shoulder forward in the fold" },
    leftAnkle:     { indices:[25,27,31], ideal:80,  green:12, yellow:22, weight:1, hint:"Flex your left foot — pull toes toward you" },
    rightAnkle:    { indices:[26,28,32], ideal:80,  green:12, yellow:22, weight:1, hint:"Flex your right foot — pull toes toward you" },
    spine:         { indices:[11,23,25], ideal:55,  green:15, yellow:28, weight:2, hint:"Fold deeper — bring your chest closer to your thighs" },
  },
};

// ─── Generic evaluator ────────────────────────────────────────────────────────
function evaluate(poseName, lm) {
  const def = POSE_DEFS[poseName];
  if (!def) return {};
  const result = {};
  for (const [jointName, spec] of Object.entries(def)) {
    const raw = gradeJoint(lm, spec.indices, spec.ideal, spec.green, spec.yellow);
    result[jointName] = smooth(poseName, jointName, raw);
  }
  return result;
}

// ─── Named exports (used by YogaPage FRONTEND_EVALUATORS map) ────────────────
export const evaluateTadasana         = lm => evaluate("Tadasana",         lm);
export const evaluateVrikshasana      = lm => evaluate("Vrikshasana",      lm);
export const evaluateTrikonasana      = lm => evaluate("Trikonasana",      lm);
export const evaluateBhujangasana     = lm => evaluate("Bhujangasana",     lm);
export const evaluateUtkatasana       = lm => evaluate("Utkatasana",       lm);
export const evaluateVirabhadrasana   = lm => evaluate("Virabhadrasana",   lm);
export const evaluateAdhaMukha        = lm => evaluate("Adho_Mukha",       lm);
export const evaluateBalasana         = lm => evaluate("Balasana",         lm);
export const evaluateSetuBandhasana   = lm => evaluate("Setu_Bandhasana",  lm);
export const evaluatePaschimottanasana= lm => evaluate("Paschimottanasana",lm);

// ─── Weighted score ───────────────────────────────────────────────────────────
// Hidden joints are excluded. Critical joints (weight=2) count double.
export function calculateScore(feedback, poseName) {
  const def = poseName ? POSE_DEFS[poseName] : null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const [key, grade] of Object.entries(feedback)) {
    if (grade === "hidden") continue;
    const weight = def?.[key]?.weight ?? 1;
    const pts    = grade === "green" ? 1 : grade === "yellow" ? 0.5 : 0;
    weightedSum += pts * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}

// ─── Hint messages from POSE_DEFS ────────────────────────────────────────────
// Returns correction hints only for joints that are red or yellow
export function getHints(feedback, poseName) {
  const def = POSE_DEFS[poseName];
  if (!def) return ["Hold the pose steady."];
  const hints = [];
  for (const [key, grade] of Object.entries(feedback)) {
    if ((grade === "red" || grade === "yellow") && def[key]?.hint) {
      hints.push({ grade, hint: def[key].hint, joint: key });
    }
  }
  if (hints.length === 0) return [{ grade: "green", hint: "Perfect! Hold this position.", joint: "all" }];
  // Sort: red first, then yellow
  return hints.sort((a, b) => (a.grade === "red" ? -1 : 1));
}

// ─── JOINT_INDEX map (for canvas dot drawing) ─────────────────────────────────
// Maps joint name → the landmark index of the VERTEX (middle point B).
export const JOINT_INDEX = {
  // Knees
  leftKnee:         25,
  rightKnee:        26,
  standingKnee:     25,
  raisedKnee:       26,
  // Hips
  leftHip:          23,
  rightHip:         24,
  standingHip:      23,
  leftHipAbduct:    23,
  rightHipAbduct:   24,
  // Elbows
  leftElbow:        13,
  rightElbow:       14,
  // Shoulders
  leftShoulder:     11,
  rightShoulder:    12,
  // Wrists
  leftWrist:        15,
  rightWrist:       16,
  // Ankles
  leftAnkle:        27,
  rightAnkle:       28,
  // Spine (use hip midpoint approximation → left hip)
  spine:            23,
  torso:            23,
  // Neck
  neckLeft:         11,
  neckRight:        12,
};

// ─── Angle extraction for server-side scoring ─────────────────────────────────
// Returns all measurable angles from a landmark array as key:degrees map
export function extractAngles(lm) {
  const out = {};
  for (const [name, [ai, bi, ci]] of Object.entries(JOINTS)) {
    if (vis(lm[ai], lm[bi], lm[ci])) {
      out[name] = Math.round(calculateAngle(lm[ai], lm[bi], lm[ci]));
    } else {
      // Explicitly mark as null so server can apply the missing-joint penalty.
      // Never omit the key — absence vs null must be distinguishable.
      out[name] = null;
    }
  }
  return out;
}
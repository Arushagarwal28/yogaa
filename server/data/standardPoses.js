/**
 * Standard joint angles for each yoga pose — server-side scoring engine.
 *
 * Joint names match the keys produced by extractAngles() in poseEvaluators.js.
 * ideal     – target angle in degrees (biomechanics research)
 * tolerance – ± margin before score starts dropping
 * weight    – importance multiplier (2 = critical/load-bearing, 1 = normal)
 * hint      – correction cue shown to user
 */

const STANDARD_POSES = {

  Tadasana: {
    leftKnee:      { ideal:180, tolerance:10, weight:2, hint:"Straighten your left knee fully" },
    rightKnee:     { ideal:180, tolerance:10, weight:2, hint:"Straighten your right knee fully" },
    leftHip:       { ideal:180, tolerance:10, weight:2, hint:"Align your left hip — stand tall" },
    rightHip:      { ideal:180, tolerance:10, weight:2, hint:"Align your right hip — stand tall" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Keep your left arm relaxed and straight" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Keep your right arm relaxed and straight" },
    leftShoulder:  { ideal:175, tolerance:12, weight:1, hint:"Relax your left shoulder down" },
    rightShoulder: { ideal:175, tolerance:12, weight:1, hint:"Relax your right shoulder down" },
    leftAnkle:     { ideal:90,  tolerance:12, weight:1, hint:"Keep your left foot flat, weight even" },
    rightAnkle:    { ideal:90,  tolerance:12, weight:1, hint:"Keep your right foot flat, weight even" },
    spineLeft:     { ideal:180, tolerance:8,  weight:2, hint:"Stand perfectly tall — elongate your spine" },
    spineRight:    { ideal:180, tolerance:8,  weight:2, hint:"Stand perfectly tall — elongate your spine" },
  },

  Vrikshasana: {
    standingKnee:  { ideal:180, tolerance:10, weight:2, hint:"Lock your standing knee straight" },
    raisedKnee:    { ideal:70,  tolerance:15, weight:2, hint:"Raise your foot higher onto the inner thigh" },
    standingHip:   { ideal:180, tolerance:10, weight:2, hint:"Keep your standing hip over your ankle" },
    leftShoulder:  { ideal:170, tolerance:12, weight:1, hint:"Raise your left arm fully overhead" },
    rightShoulder: { ideal:170, tolerance:12, weight:1, hint:"Raise your right arm fully overhead" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Straighten your left arm overhead" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Straighten your right arm overhead" },
    spineLeft:     { ideal:180, tolerance:8,  weight:2, hint:"Keep your torso upright — do not lean sideways" },
  },

  Trikonasana: {
    leftKnee:      { ideal:180, tolerance:10, weight:2, hint:"Straighten your front leg completely" },
    rightKnee:     { ideal:180, tolerance:10, weight:2, hint:"Straighten your back leg completely" },
    leftShoulder:  { ideal:90,  tolerance:15, weight:2, hint:"Reach your top arm directly up" },
    rightShoulder: { ideal:90,  tolerance:15, weight:2, hint:"Extend your lower arm toward the ankle" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Keep your top arm fully extended" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Keep your lower arm fully extended" },
    spineLeft:     { ideal:90,  tolerance:15, weight:2, hint:"Tilt your torso sideways — open chest to the wall" },
    leftAnkle:     { ideal:90,  tolerance:12, weight:1, hint:"Ground your front foot firmly" },
  },

  Bhujangasana: {
    leftElbow:     { ideal:150, tolerance:15, weight:2, hint:"Soften your left elbow — do not lock it" },
    rightElbow:    { ideal:150, tolerance:15, weight:2, hint:"Soften your right elbow — do not lock it" },
    leftShoulder:  { ideal:50,  tolerance:15, weight:2, hint:"Draw your left shoulder back and down" },
    rightShoulder: { ideal:50,  tolerance:15, weight:2, hint:"Draw your right shoulder back and down" },
    leftKnee:      { ideal:180, tolerance:10, weight:1, hint:"Keep your left leg flat on the mat" },
    rightKnee:     { ideal:180, tolerance:10, weight:1, hint:"Keep your right leg flat on the mat" },
    leftHip:       { ideal:175, tolerance:10, weight:1, hint:"Press your left hip into the mat" },
    rightHip:      { ideal:175, tolerance:10, weight:1, hint:"Press your right hip into the mat" },
    spineLeft:     { ideal:145, tolerance:15, weight:2, hint:"Arch your back more — lift your chest higher" },
  },

  Utkatasana: {
    leftKnee:      { ideal:90,  tolerance:12, weight:2, hint:"Bend your left knee deeper — sit lower" },
    rightKnee:     { ideal:90,  tolerance:12, weight:2, hint:"Bend your right knee deeper — sit lower" },
    leftHip:       { ideal:55,  tolerance:15, weight:2, hint:"Sit further back — push hips behind your heels" },
    rightHip:      { ideal:55,  tolerance:15, weight:2, hint:"Sit further back — push hips behind your heels" },
    leftShoulder:  { ideal:160, tolerance:15, weight:1, hint:"Raise your left arm higher alongside your ear" },
    rightShoulder: { ideal:160, tolerance:15, weight:1, hint:"Raise your right arm higher alongside your ear" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Straighten your left arm fully overhead" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Straighten your right arm fully overhead" },
    spineLeft:     { ideal:170, tolerance:10, weight:2, hint:"Lengthen spine — avoid rounding forward" },
    leftAnkle:     { ideal:70,  tolerance:12, weight:1, hint:"Keep your left heel firmly on the mat" },
    rightAnkle:    { ideal:70,  tolerance:12, weight:1, hint:"Keep your right heel firmly on the mat" },
  },

  Virabhadrasana: {
    leftKnee:      { ideal:90,  tolerance:12, weight:2, hint:"Bend your front knee to 90°" },
    rightKnee:     { ideal:180, tolerance:10, weight:2, hint:"Straighten your back leg completely" },
    leftHip:       { ideal:90,  tolerance:12, weight:2, hint:"Square your left hip forward over your front foot" },
    rightHip:      { ideal:170, tolerance:12, weight:1, hint:"Press your right hip forward — square the pelvis" },
    leftShoulder:  { ideal:170, tolerance:12, weight:1, hint:"Raise your left arm fully overhead" },
    rightShoulder: { ideal:170, tolerance:12, weight:1, hint:"Raise your right arm fully overhead" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Straighten your left arm fully" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Straighten your right arm fully" },
    spineLeft:     { ideal:180, tolerance:10, weight:2, hint:"Keep your torso upright over the front knee" },
    leftAnkle:     { ideal:70,  tolerance:12, weight:1, hint:"Ground your front foot — knee over ankle" },
  },

  Adho_Mukha: {
    leftKnee:      { ideal:180, tolerance:10, weight:2, hint:"Straighten your left leg — press heel toward mat" },
    rightKnee:     { ideal:180, tolerance:10, weight:2, hint:"Straighten your right leg — press heel toward mat" },
    leftElbow:     { ideal:180, tolerance:10, weight:2, hint:"Lock your left arm straight, press through palm" },
    rightElbow:    { ideal:180, tolerance:10, weight:2, hint:"Lock your right arm straight, press through palm" },
    leftShoulder:  { ideal:165, tolerance:12, weight:2, hint:"Rotate left shoulder outward — broaden your back" },
    rightShoulder: { ideal:165, tolerance:12, weight:2, hint:"Rotate right shoulder outward — broaden your back" },
    leftHip:       { ideal:60,  tolerance:12, weight:2, hint:"Push your left hip higher toward the ceiling" },
    rightHip:      { ideal:60,  tolerance:12, weight:2, hint:"Push your right hip higher toward the ceiling" },
    leftAnkle:     { ideal:65,  tolerance:15, weight:1, hint:"Press your left heel toward the floor" },
    rightAnkle:    { ideal:65,  tolerance:15, weight:1, hint:"Press your right heel toward the floor" },
    spineLeft:     { ideal:60,  tolerance:12, weight:2, hint:"Lengthen spine — push hips up and back" },
  },

  Balasana: {
    leftKnee:      { ideal:40,  tolerance:15, weight:2, hint:"Fold your left knee more — sit back onto your heels" },
    rightKnee:     { ideal:40,  tolerance:15, weight:2, hint:"Fold your right knee more — sit back onto your heels" },
    leftHip:       { ideal:35,  tolerance:15, weight:2, hint:"Sink your left hip further back toward your heel" },
    rightHip:      { ideal:35,  tolerance:15, weight:2, hint:"Sink your right hip further back toward your heel" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Extend your left arm fully forward on the mat" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Extend your right arm fully forward on the mat" },
    leftShoulder:  { ideal:155, tolerance:15, weight:1, hint:"Relax your left shoulder — let it melt toward the mat" },
    rightShoulder: { ideal:155, tolerance:15, weight:1, hint:"Relax your right shoulder — let it melt toward the mat" },
    spineLeft:     { ideal:45,  tolerance:15, weight:2, hint:"Round your spine — lower chest closer to the mat" },
  },

  Setu_Bandhasana: {
    leftKnee:      { ideal:90,  tolerance:12, weight:2, hint:"Keep your left knee at 90° — foot flat on mat" },
    rightKnee:     { ideal:90,  tolerance:12, weight:2, hint:"Keep your right knee at 90° — foot flat on mat" },
    leftHip:       { ideal:135, tolerance:15, weight:2, hint:"Lift your left hip higher — squeeze glutes" },
    rightHip:      { ideal:135, tolerance:15, weight:2, hint:"Lift your right hip higher — squeeze glutes" },
    leftElbow:     { ideal:180, tolerance:12, weight:1, hint:"Keep your left arm flat and straight on the mat" },
    rightElbow:    { ideal:180, tolerance:12, weight:1, hint:"Keep your right arm flat and straight on the mat" },
    leftShoulder:  { ideal:175, tolerance:12, weight:1, hint:"Press your left shoulder blade into the mat" },
    rightShoulder: { ideal:175, tolerance:12, weight:1, hint:"Press your right shoulder blade into the mat" },
    leftAnkle:     { ideal:90,  tolerance:12, weight:1, hint:"Keep your left foot flat, parallel to body" },
    rightAnkle:    { ideal:90,  tolerance:12, weight:1, hint:"Keep your right foot flat, parallel to body" },
    spineLeft:     { ideal:138, tolerance:15, weight:2, hint:"Lift hips higher — straight line shoulder to knee" },
  },

  Paschimottanasana: {
    leftKnee:      { ideal:180, tolerance:10, weight:2, hint:"Fully extend your left leg — do not bend the knee" },
    rightKnee:     { ideal:180, tolerance:10, weight:2, hint:"Fully extend your right leg — do not bend the knee" },
    leftHip:       { ideal:55,  tolerance:15, weight:2, hint:"Fold deeper from your left hip — hinge forward" },
    rightHip:      { ideal:55,  tolerance:15, weight:2, hint:"Fold deeper from your right hip — hinge forward" },
    leftElbow:     { ideal:170, tolerance:15, weight:1, hint:"Reach your left arm further toward your feet" },
    rightElbow:    { ideal:170, tolerance:15, weight:1, hint:"Reach your right arm further toward your feet" },
    leftShoulder:  { ideal:145, tolerance:15, weight:1, hint:"Extend your left shoulder forward in the fold" },
    rightShoulder: { ideal:145, tolerance:15, weight:1, hint:"Extend your right shoulder forward in the fold" },
    leftAnkle:     { ideal:80,  tolerance:12, weight:1, hint:"Flex your left foot — pull toes toward you" },
    rightAnkle:    { ideal:80,  tolerance:12, weight:1, hint:"Flex your right foot — pull toes toward you" },
    spineLeft:     { ideal:55,  tolerance:15, weight:2, hint:"Fold deeper — bring chest closer to your thighs" },
  },
};

module.exports = STANDARD_POSES;
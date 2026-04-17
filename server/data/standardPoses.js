/**
 * Standard joint angles for each yoga pose.
 * ideal     – target angle in degrees
 * tolerance – ± margin before score drops
 * weight    – importance multiplier (1=normal, 2=critical)
 * hint      – correction message shown to user
 */

const STANDARD_POSES = {
  Tadasana: {
    left_knee:      { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your left knee fully" },
    right_knee:     { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your right knee fully" },
    left_elbow:     { ideal: 180, tolerance: 12, weight: 1, hint: "Keep your left arm straight by your side" },
    right_elbow:    { ideal: 180, tolerance: 12, weight: 1, hint: "Keep your right arm straight by your side" },
    left_shoulder:  { ideal: 180, tolerance: 12, weight: 1, hint: "Relax your left shoulder downward" },
    right_shoulder: { ideal: 180, tolerance: 12, weight: 1, hint: "Relax your right shoulder downward" },
    spine:          { ideal: 180, tolerance: 8,  weight: 2, hint: "Stand tall — keep your spine perfectly straight" },
  },
  Vrikshasana: {
    standing_knee: { ideal: 180, tolerance: 10, weight: 2, hint: "Lock your standing knee straight" },
    raised_knee:   { ideal: 75,  tolerance: 15, weight: 2, hint: "Place your raised foot higher on the inner thigh" },
    left_elbow:    { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your left arm fully overhead" },
    right_elbow:   { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your right arm fully overhead" },
    spine:         { ideal: 180, tolerance: 8,  weight: 2, hint: "Keep your torso upright — do not lean sideways" },
  },
  Trikonasana: {
    left_knee:   { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your front (left) leg completely" },
    right_knee:  { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your back (right) leg completely" },
    left_elbow:  { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your lower left arm toward the ankle" },
    right_elbow: { ideal: 180, tolerance: 12, weight: 1, hint: "Reach your right arm straight toward the ceiling" },
    torso:       { ideal: 90,  tolerance: 12, weight: 2, hint: "Tilt your torso sideways to 90° — don't twist forward" },
  },
  Bhujangasana: {
    left_elbow:  { ideal: 150, tolerance: 15, weight: 2, hint: "Bend your elbows softly — do not lock them" },
    right_elbow: { ideal: 150, tolerance: 15, weight: 2, hint: "Bend your elbows softly — do not lock them" },
    spine:       { ideal: 140, tolerance: 15, weight: 2, hint: "Arch your back more — lift the chest higher" },
    left_knee:   { ideal: 180, tolerance: 10, weight: 1, hint: "Keep your left leg flat on the mat" },
    right_knee:  { ideal: 180, tolerance: 10, weight: 1, hint: "Keep your right leg flat on the mat" },
  },
  Utkatasana: {
    left_knee:   { ideal: 90,  tolerance: 12, weight: 2, hint: "Bend your left knee to 90° — sit lower" },
    right_knee:  { ideal: 90,  tolerance: 12, weight: 2, hint: "Bend your right knee to 90° — sit lower" },
    left_elbow:  { ideal: 180, tolerance: 12, weight: 1, hint: "Raise your left arm straight up" },
    right_elbow: { ideal: 180, tolerance: 12, weight: 1, hint: "Raise your right arm straight up" },
    spine:       { ideal: 170, tolerance: 10, weight: 2, hint: "Keep your back upright — do not lean too far forward" },
  },
  Virabhadrasana: {
    left_knee:   { ideal: 90,  tolerance: 12, weight: 2, hint: "Bend your front (left) knee to 90°" },
    right_knee:  { ideal: 180, tolerance: 10, weight: 2, hint: "Keep your back (right) leg completely straight" },
    left_elbow:  { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your left arm fully forward" },
    right_elbow: { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your right arm fully back" },
    spine:       { ideal: 180, tolerance: 10, weight: 2, hint: "Keep your torso upright over the front knee" },
  },
  Adho_Mukha: {
    left_knee:   { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your left leg — press heel toward mat" },
    right_knee:  { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your right leg — press heel toward mat" },
    left_elbow:  { ideal: 180, tolerance: 10, weight: 2, hint: "Keep your left arm straight, press through the palm" },
    right_elbow: { ideal: 180, tolerance: 10, weight: 2, hint: "Keep your right arm straight, press through the palm" },
    spine:       { ideal: 60,  tolerance: 12, weight: 2, hint: "Lengthen your spine — push hips higher toward the ceiling" },
  },
  Balasana: {
    left_knee:   { ideal: 45,  tolerance: 15, weight: 2, hint: "Fold your knees in further — sit back on your heels" },
    right_knee:  { ideal: 45,  tolerance: 15, weight: 2, hint: "Fold your knees in further — sit back on your heels" },
    left_elbow:  { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your left arm fully forward on the mat" },
    right_elbow: { ideal: 180, tolerance: 12, weight: 1, hint: "Extend your right arm fully forward on the mat" },
    spine:       { ideal: 50,  tolerance: 15, weight: 2, hint: "Round your spine and lower your chest toward the mat" },
  },
  Setu_Bandhasana: {
    left_knee:   { ideal: 90,  tolerance: 12, weight: 2, hint: "Keep your left knee at 90° — feet flat on the mat" },
    right_knee:  { ideal: 90,  tolerance: 12, weight: 2, hint: "Keep your right knee at 90° — feet flat on the mat" },
    left_elbow:  { ideal: 180, tolerance: 12, weight: 1, hint: "Keep your left arm flat by your side on the mat" },
    right_elbow: { ideal: 180, tolerance: 12, weight: 1, hint: "Keep your right arm flat by your side on the mat" },
    spine:       { ideal: 140, tolerance: 15, weight: 2, hint: "Lift your hips higher — straight line from shoulders to knees" },
  },
  Paschimottanasana: {
    left_knee:   { ideal: 180, tolerance: 10, weight: 2, hint: "Fully extend your left leg — do not bend the knee" },
    right_knee:  { ideal: 180, tolerance: 10, weight: 2, hint: "Fully extend your right leg — do not bend the knee" },
    left_elbow:  { ideal: 170, tolerance: 15, weight: 1, hint: "Reach your left arm forward toward your feet" },
    right_elbow: { ideal: 170, tolerance: 15, weight: 1, hint: "Reach your right arm forward toward your feet" },
    spine:       { ideal: 50,  tolerance: 15, weight: 2, hint: "Fold deeper — bring your chest closer to your thighs" },
  },
};

module.exports = STANDARD_POSES;
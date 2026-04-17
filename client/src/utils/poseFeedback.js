export function generateFeedback(feedback) {
  const messages = [];
  const checks = {
    leftKnee:      ["red",    "Straighten your left leg"],
    rightKnee:     ["red",    "Straighten your right leg"],
    leftElbow:     ["red",    "Keep your left arm straight"],
    rightElbow:    ["red",    "Keep your right arm straight"],
    leftShoulder:  ["red",    "Align your left shoulder"],
    rightShoulder: ["red",    "Align your right shoulder"],
    spine:         ["red",    "Keep your back straight"],
    standingLeg:   ["red",    "Lock your standing knee"],
    raisedLeg:     ["red",    "Raise your foot higher on the thigh"],
    leftArm:       ["yellow", "Extend your left arm fully"],
    rightArm:      ["yellow", "Extend your right arm fully"],
    torso:         ["red",    "Tilt your torso more to the side"],
  };
  Object.entries(checks).forEach(([joint, [threshold, msg]]) => {
    if (feedback[joint] === threshold) messages.push(msg);
  });
  if (messages.length === 0) messages.push("Perfect posture! Hold this position.");
  return messages;
}
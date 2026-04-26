const { evaluatePose, getPoseList, getStandardAngles } = require("../services/poseService.js");
const { generateAIFeedback }                           = require("../services/geminiService.js");
const Session = require("../models/Session.js");
const User    = require("../models/User.js");

/**
 * POST /api/pose/evaluate
 *
 * 1. Score the pose with the weighted joint-angle engine (synchronous, fast)
 * 2. Save session to MongoDB
 * 3. Award coins to user
 * 4. Call Gemini for a personalised coaching paragraph (non-blocking on failure)
 * 5. Return everything — including aiFeedback — in one response
 *
 * The Gemini call is awaited but wrapped so it NEVER fails the whole request.
 * If Gemini is slow/down, aiFeedback is simply null in the response.
 */
exports.evaluate = async (req, res, next) => {
  try {
    const { poseName, angles, duration = 0 } = req.body;
    if (!poseName || !angles)
      return res.status(400).json({ message: "poseName and angles are required" });

    // Step 1: score the pose
    const result = evaluatePose(poseName, angles);

    // Step 2: persist session
    const date    = new Date().toISOString().split("T")[0];
    const session = await Session.create({
      user: req.user._id, poseName, duration,
      score:         result.score,
      coins:         result.coinsEarned,
      date,
      angles,
      feedback:      result.feedback,
      overallStatus: result.status,
    });

    // Step 3: award coins
    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: result.coinsEarned } });

    // Step 4: Gemini AI coaching (non-blocking failure)
    // Fired AFTER saving session so a Gemini timeout never affects the session.
    const aiFeedback = await generateAIFeedback({
      poseName,
      score:         result.score,
      overallStatus: result.status,
      duration:      Number(duration),
      feedback:      result.feedback,
      coinsEarned:   result.coinsEarned,
      missingJoints: result.missingJoints || [],
    }).catch((err) => {
      console.error("[poseController] Gemini unexpected throw:", err.message);
      return null;
    });

    // Step 5: respond
    res.status(201).json({
      ...result,
      sessionId:  session._id,
      aiFeedback,    // string | null
    });
  } catch (err) { next(err); }
};

exports.listPoses   = (_req, res, next) => {
  try { res.json({ poses: getPoseList() }); }
  catch (err) { next(err); }
};

exports.getStandard = (req, res, next) => {
  try {
    res.json({
      poseName: req.params.poseName,
      standard: getStandardAngles(req.params.poseName),
    });
  } catch (err) { next(err); }
};
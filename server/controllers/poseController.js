const { evaluatePose, getPoseList, getStandardAngles } = require("../services/poseService.js");
const Session = require("../models/Session.js");
const User    = require("../models/User.js");

exports.evaluate = async (req, res, next) => {
  try {
    const { poseName, angles, duration = 0 } = req.body;
    if (!poseName || !angles)
      return res.status(400).json({ message: "poseName and angles are required" });

    const result  = evaluatePose(poseName, angles);
    const date    = new Date().toISOString().split("T")[0];
    const session = await Session.create({
      user: req.user._id, poseName, duration,
      score: result.score, coins: result.coinsEarned, date,
      angles, feedback: result.feedback, overallStatus: result.status,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: result.coinsEarned } });
    res.status(201).json({ ...result, sessionId: session._id });
  } catch (err) { next(err); }
};

exports.listPoses  = (_req, res, next) => { try { res.json({ poses: getPoseList() }); } catch (err) { next(err); } };
exports.getStandard = (req, res, next) => { try { res.json({ poseName: req.params.poseName, standard: getStandardAngles(req.params.poseName) }); } catch (err) { next(err); } };
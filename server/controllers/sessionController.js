const Session          = require("../models/Session.js");
const analyticsService = require("../services/analyticsService.js");

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ sessions });
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try { res.json(await analyticsService.getFullAnalytics(req.user._id)); }
  catch (err) { next(err); }
};

exports.getWeekly = async (req, res, next) => {
  try { res.json({ weekly: await analyticsService.getWeeklyData(req.user._id) }); }
  catch (err) { next(err); }
};

/**
 * POST /api/sessions/meditation
 * Body: { category: string, duration: number (seconds) }
 *
 * Saves a meditation session as a Session document so it:
 *  1. Counts toward the daily streak
 *  2. Shows up on the practice calendar
 *  3. Adds minutes to the "Total Practice" stat
 *
 * We use poseName = "Meditation:{category}" so it's distinct from yoga
 * poses but still queryable. Score is fixed at 100 (meditation has no
 * accuracy scoring — completion is the goal).
 */
exports.saveMeditation = async (req, res, next) => {
  try {
    const { category, duration } = req.body;

    // Basic range validation
    const durationNum = Number(duration);
    if (!durationNum || durationNum < 10 || durationNum > 7200) {
      return res.status(400).json({ message: "duration must be between 10 and 7200 seconds" });
    }

    const date    = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const session = await Session.create({
      user:          req.user._id,
      poseName:      `Meditation:${category}`,
      duration:      durationNum,
      score:         100,          // completion = perfect for meditation
      coins:         0,            // no coin reward for meditation (no cheating)
      date,
      angles:        {},
      feedback:      [],
      overallStatus: "excellent",
    });

    res.status(201).json({ session });
  } catch (err) { next(err); }
};
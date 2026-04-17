const Session          = require("../models/Session.js");
const analyticsService = require("../services/analyticsService.js");

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
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
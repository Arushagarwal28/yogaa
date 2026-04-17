const Session = require("../models/Session.js");

async function getWeeklyData(userId) {
  const sessions = await Session.find({ user: userId }).lean();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const key  = day.toISOString().split("T")[0];
    const name = day.toLocaleDateString("en-US", { weekday: "short" });
    const daySessions = sessions.filter((s) => s.date === key);
    const accuracy = daySessions.length ? Math.round(daySessions.reduce((a, s) => a + s.score, 0) / daySessions.length) : 0;
    const duration = daySessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);
    return { day: name, accuracy, duration, sessions: daySessions.length };
  });
}

async function computeStreak(userId) {
  const sessions = await Session.find({ user: userId }).select("date").lean();
  const dateSet  = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (dateSet.has(key)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

async function getPosePerformance(userId) {
  const sessions = await Session.find({ user: userId }).lean();
  const map = {};
  sessions.forEach(({ poseName, score }) => {
    if (!map[poseName]) map[poseName] = { total: 0, count: 0 };
    map[poseName].total += score;
    map[poseName].count += 1;
  });
  return Object.entries(map)
    .map(([pose, { total, count }]) => ({ pose, avgScore: Math.round(total / count), sessionCount: count }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

async function getWeakestJoints(userId) {
  const sessions = await Session.find({ user: userId }).select("feedback").lean();
  const jointErrors = {};
  sessions.forEach(({ feedback }) => {
    (feedback || []).forEach(({ joint }) => { jointErrors[joint] = (jointErrors[joint] || 0) + 1; });
  });
  return Object.entries(jointErrors)
    .map(([joint, count]) => ({ joint, errorCount: count }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5);
}

async function getImprovementTrend(userId) {
  const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean();
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (13 - i));
    const key  = day.toISOString().split("T")[0];
    const name = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const daySessions = sessions.filter((s) => s.date === key);
    const avgScore = daySessions.length ? Math.round(daySessions.reduce((a, s) => a + s.score, 0) / daySessions.length) : null;
    return { date: key, label: name, avgScore };
  });
}

async function getFullAnalytics(userId) {
  const [sessions, weekly, streak, posePerf, weakJoints, trend] = await Promise.all([
    Session.find({ user: userId }).lean(),
    getWeeklyData(userId), computeStreak(userId),
    getPosePerformance(userId), getWeakestJoints(userId), getImprovementTrend(userId),
  ]);
  const totalSessions = sessions.length;
  const totalMinutes  = Math.floor(sessions.reduce((a, s) => a + s.duration, 0) / 60);
  const avgScore      = totalSessions ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / totalSessions) : 0;
  const bestScore     = totalSessions ? Math.max(...sessions.map((s) => s.score)) : 0;
  return { summary: { totalSessions, totalMinutes, avgScore, bestScore, streak }, weekly, posePerformance: posePerf, weakestJoints: weakJoints, improvementTrend: trend };
}

module.exports = { getWeeklyData, computeStreak, getPosePerformance, getWeakestJoints, getImprovementTrend, getFullAnalytics };
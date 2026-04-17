const KEY = "yoga_sessions";

export function saveSession({ poseName, duration, score }) {
  const today  = new Date().toISOString().split("T")[0];
  const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (!stored[today]) stored[today] = { totalTime: 0, sessions: [] };
  stored[today].totalTime += duration;
  stored[today].sessions.push({ pose: poseName, duration, score, ts: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(stored));
}

export const getAllSessions = () => JSON.parse(localStorage.getItem(KEY) || "{}");

export function getTodayStats() {
  const today = new Date().toISOString().split("T")[0];
  return getAllSessions()[today] || { totalTime: 0, sessions: [] };
}

export function computeStreak() {
  const stored = getAllSessions();
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (stored[key]?.sessions?.length) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}
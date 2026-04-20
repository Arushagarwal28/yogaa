const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(method, path, body = null) {
  const token = localStorage.getItem("yogaai_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.message || `HTTP ${res.status}`); err.status = res.status; throw err; }
  return data;
}

const get  = (path)       => request("GET",  path);
const post = (path, body) => request("POST", path, body);

export const authApi = {
  register: (name, email, password, role) => post("/auth/register", { name, email, password, role }),
  login:    (email, password)             => post("/auth/login",    { email, password }),
  me:       ()                            => get("/auth/me"),
};

export const poseApi = {
  evaluate: (poseName, angles, duration = 0) => post("/pose/evaluate", { poseName, angles, duration }),
  list:     ()         => get("/pose/list"),
  standard: (poseName) => get(`/pose/standard/${encodeURIComponent(poseName)}`),
};

export const sessionApi = {
  getAll:       () => get("/sessions"),
  getWeekly:    () => get("/sessions/weekly"),
  getAnalytics: () => get("/sessions/analytics"),
};

// Saves a completed meditation session so it contributes to streak + analytics
export const meditationApi = {
  save: ({ category, duration }) =>
    post("/sessions/meditation", { category, duration }),
};

export const saveToken  = (t) => localStorage.setItem("yogaai_token", t);
export const clearToken = ()  => localStorage.removeItem("yogaai_token");
export const getToken   = ()  => localStorage.getItem("yogaai_token");
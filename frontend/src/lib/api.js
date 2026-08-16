/**
 * api.js — thin fetch client for the StudyAI backend.
 *
 * Drop this into `src/lib/api.js` in the Vite frontend project.
 * Reads the API base URL from Vite's env (falls back to localhost:5000).
 *
 *   // .env (frontend project root)
 *   VITE_API_URL=http://localhost:5000/api
 *
 * Auth token is kept in memory + mirrored to sessionStorage so a page
 * refresh during local development doesn't force a re-login. Swap
 * `tokenStore` for your own storage strategy if you need something else
 * (e.g. httpOnly cookies issued by the backend instead of Bearer tokens).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const tokenStore = {
  get: () => sessionStorage.getItem("studyai_token"),
  set: (token) => sessionStorage.setItem("studyai_token", token),
  clear: () => sessionStorage.removeItem("studyai_token"),
};

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = { success: false, message: "Invalid server response" };
  }

  if (!res.ok || !json.success) {
    const err = new Error(json.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = json.details;
    throw err;
  }

  return json.data;
}

/* ---------------- Auth ---------------- */
export const authApi = {
  register: (name, email, password) => request("/auth/register", { method: "POST", body: { name, email, password } }),
  login: (email, password, remember) => request("/auth/login", { method: "POST", body: { email, password, remember } }),
  me: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) => request(`/auth/reset-password/${token}`, { method: "POST", body: { password } }),
  setToken: tokenStore.set,
  clearToken: tokenStore.clear,
  getToken: tokenStore.get,
};

/* ---------------- Notes ---------------- */
export const notesApi = {
  list: () => request("/notes"),
  get: (id) => request(`/notes/${id}`),
  upload: (file, onProgress) => {
    // Using XHR instead of fetch here so we get real upload progress events.
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/notes`);
      const token = tokenStore.get();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json.success) resolve(json.data);
          else reject(new Error(json.message || "Upload failed"));
        } catch {
          reject(new Error("Invalid server response"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    });
  },
  remove: (id) => request(`/notes/${id}`, { method: "DELETE" }),
};

/* ---------------- AI Summary ---------------- */
export const summaryApi = {
  generate: (noteId) => request(`/summaries/${noteId}`, { method: "POST" }),
  get: (noteId) => request(`/summaries/${noteId}`),
};

/* ---------------- Quiz ---------------- */
export const quizApi = {
  generate: (noteId, count) => request(`/quizzes/${noteId}`, { method: "POST", body: { count } }),
  list: () => request("/quizzes"),
  get: (id) => request(`/quizzes/${id}`),
  submit: (id, answers, durationSeconds) => request(`/quizzes/${id}/attempts`, { method: "POST", body: { answers, durationSeconds } }),
  history: () => request("/quizzes/attempts/history"),
};

/* ---------------- Flashcards ---------------- */
export const flashcardApi = {
  generate: (noteId, count) => request(`/flashcards/${noteId}`, { method: "POST", body: { count } }),
  list: () => request("/flashcards"),
  get: (id) => request(`/flashcards/${id}`),
  remove: (id) => request(`/flashcards/${id}`, { method: "DELETE" }),
};

/* ---------------- Study Planner ---------------- */
export const plannerApi = {
  list: (month, year) => request(`/planner/tasks${month && year ? `?month=${month}&year=${year}` : ""}`),
  create: (title, date) => request("/planner/tasks", { method: "POST", body: { title, date } }),
  update: (id, updates) => request(`/planner/tasks/${id}`, { method: "PATCH", body: updates }),
  remove: (id) => request(`/planner/tasks/${id}`, { method: "DELETE" }),
};

/* ---------------- Analytics ---------------- */
export const analyticsApi = {
  overview: () => request("/analytics/overview"),
  logSession: (hours) => request("/analytics/study-session", { method: "POST", body: { hours } }),
};

/* ---------------- Profile ---------------- */
export const profileApi = {
  update: (updates) => request("/profile", { method: "PATCH", body: updates }),
  changePassword: (currentPassword, newPassword) => request("/profile/password", { method: "PATCH", body: { currentPassword, newPassword } }),
};

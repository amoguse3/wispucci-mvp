// ===========================================================================
// WISPUCCI — Backend API Client
// Talks to the FastAPI backend. Gracefully degrades to offline mode
// (static curriculum.js content) when the backend isn't reachable.
// ===========================================================================

const API_BASE = (() => {
  // Local dev: frontend on :8000, backend on :8801
  if (location.port && location.port !== '8801') {
    return `${location.protocol}//${location.hostname}:8801`;
  }
  // Override via window.WISPUCCI_API for prod deployments
  return window.WISPUCCI_API || location.origin;
})();

const Auth = {
  TOKEN: 'wispucci.token',
  NAME: 'wispucci.name',
  get token() { return localStorage.getItem(this.TOKEN) || ''; },
  set token(v) { v ? localStorage.setItem(this.TOKEN, v) : localStorage.removeItem(this.TOKEN); },
  get name() { return localStorage.getItem(this.NAME) || ''; },
  set name(v) { v ? localStorage.setItem(this.NAME, v) : localStorage.removeItem(this.NAME); },
  get isLoggedIn() { return !!this.token; },
  clear() { this.token = null; this.name = null; },
};

let _backendOnline = null; // null=unknown, true/false once checked

async function apiHealth() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2500) });
    _backendOnline = r.ok;
    return r.ok;
  } catch (_) {
    _backendOnline = false;
    return false;
  }
}

async function apiFetch(path, opts = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (Auth.token) headers['Authorization'] = `Bearer ${Auth.token}`;
  const resp = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (resp.status === 401) Auth.clear();
  let data = null;
  try { data = await resp.json(); } catch (_) {}
  if (!resp.ok) {
    const msg = (data && (data.detail || data.message)) || `eroare ${resp.status}`;
    throw new Error(typeof msg === 'string' ? msg : 'eroare server');
  }
  return data;
}

const API = {
  online: () => _backendOnline,
  health: apiHealth,

  signup: (email, display_name, password) =>
    apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, display_name, password }) }),

  login: async (email, password) => {
    // OAuth2 form format
    const body = new URLSearchParams({ username: email, password });
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.detail || 'login eșuat'); }
    return r.json();
  },

  me: () => apiFetch('/api/auth/me'),
  generateLesson: (subject, topic_title, level) =>
    apiFetch('/api/tutor/lesson', { method: 'POST', body: JSON.stringify({ subject, topic_title, level }) }),
  reexplain: (topic_title, section, prior_attempt = '') =>
    apiFetch('/api/tutor/reexplain', { method: 'POST', body: JSON.stringify({ topic_title, section, prior_attempt }) }),
  ask: (topic_title, lesson_context, question) =>
    apiFetch('/api/tutor/ask', { method: 'POST', body: JSON.stringify({ topic_title, lesson_context, question }) }),
  generateExam: (subject, topics, num_questions = 10) =>
    apiFetch('/api/tutor/exam', { method: 'POST', body: JSON.stringify({ subject, topics, num_questions }) }),
  mnemonic: (fact) =>
    apiFetch('/api/tutor/mnemonic', { method: 'POST', body: JSON.stringify({ fact }) }),
  completeTopic: (topic_id, correct, total) =>
    apiFetch('/api/progress/complete', { method: 'POST', body: JSON.stringify({ topic_id, correct, total }) }),
  dueReviews: () => apiFetch('/api/progress/due'),
  stats: () => apiFetch('/api/progress/stats'),
};

// Check backend on load
apiHealth();

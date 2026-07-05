// ===========================================================================
// WISPUCCI — API client
// Talks to the FastAPI backend. Falls back gracefully to offline/demo mode
// when the backend is unreachable or no AI key is configured.
// ===========================================================================

const API = (() => {
  // Resolve backend base URL.
  // Override in production via: window.WISPUCCI_API_BASE = 'https://your-backend'
  function resolveBase() {
    if (typeof window !== 'undefined' && window.WISPUCCI_API_BASE) {
      return window.WISPUCCI_API_BASE.replace(/\/+$/, '');
    }
    // Local dev: frontend on any port, backend on 8801
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return `${location.protocol}//${location.hostname}:8801`;
    }
    // Static prod without an explicit backend: stay offline.
    return '';
  }

  const BASE = resolveBase();
  let _online = null; // null = unknown, true/false after first probe

  async function _post(path, body) {
    if (!BASE) throw new Error('offline');
    const resp = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`http_${resp.status}`);
    return resp.json();
  }

  async function health() {
    if (!BASE) { _online = false; return { status: 'offline', llm: false }; }
    try {
      const resp = await fetch(`${BASE}/api/health`);
      const data = await resp.json();
      _online = true;
      return data;
    } catch (_) {
      _online = false;
      return { status: 'offline', llm: false };
    }
  }

  return {
    BASE,
    isOnline: () => _online,
    health,

    ask: (payload) => _post('/api/tutor/ask', payload),
    explain: (payload) => _post('/api/tutor/explain', payload),
    generateLesson: (payload) => _post('/api/tutor/lesson/generate', payload),
    warmup: (payload) => _post('/api/tutor/warmup', payload),
    simulateExam: (payload) => _post('/api/exam/simulate', payload),
    gradeAnswer: (payload) => _post('/api/exam/grade', payload),
  };
})();

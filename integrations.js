// ===========================================================================
// WISPUCCI — Integrations wiring
// Auth modal, exam simulation button, backend-aware UI.
// Loads last. Depends on api.js, app.js, features.js.
// ===========================================================================

(function () {
  // ---- AUTH MODAL ----
  const overlay = document.getElementById('authOverlay');
  const title = document.getElementById('authTitle');
  const nameWrap = document.getElementById('authNameWrap');
  const nameInput = document.getElementById('authName');
  const emailInput = document.getElementById('authEmail');
  const passInput = document.getElementById('authPassword');
  const errorEl = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmit');
  const toggle = document.getElementById('authToggle');
  const showBtn = document.getElementById('showAuthBtn');
  const closeBtn = document.getElementById('authClose');

  let mode = 'signup'; // or 'login'

  function openAuth() { overlay.classList.add('open'); errorEl.textContent = ''; }
  function closeAuth() { overlay.classList.remove('open'); }

  function setMode(m) {
    mode = m;
    if (m === 'signup') {
      title.textContent = 'Creează cont';
      nameWrap.style.display = 'block';
      submitBtn.textContent = 'Salvează contul';
      toggle.textContent = 'Ai deja cont? Intră';
    } else {
      title.textContent = 'Bun revenit';
      nameWrap.style.display = 'none';
      submitBtn.textContent = 'Intră';
      toggle.textContent = 'Nu ai cont? Înscrie-te';
    }
  }

  if (showBtn) showBtn.addEventListener('click', () => { setMode('signup'); openAuth(); });
  if (closeBtn) closeBtn.addEventListener('click', closeAuth);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAuth(); });
  if (toggle) toggle.addEventListener('click', () => setMode(mode === 'signup' ? 'login' : 'signup'));

  if (submitBtn) submitBtn.addEventListener('click', async () => {
    errorEl.textContent = '';
    const email = emailInput.value.trim();
    const pass = passInput.value;
    if (!email || !pass) { errorEl.textContent = 'Completează email și parolă.'; return; }
    if (!(window.API && API.online())) {
      errorEl.textContent = 'Backend-ul nu rulează. Pornește-l pentru conturi (vezi README).';
      return;
    }
    submitBtn.textContent = '...';
    try {
      let res;
      if (mode === 'signup') {
        const name = nameInput.value.trim() || 'Elev';
        res = await API.signup(email, name, pass);
      } else {
        res = await API.login(email, pass);
      }
      Auth.token = res.access_token;
      Auth.name = res.display_name;
      closeAuth();
      if (window.showView) showView('subjects');
    } catch (err) {
      errorEl.textContent = err.message || 'Ceva n-a mers.';
    } finally {
      submitBtn.textContent = mode === 'signup' ? 'Salvează contul' : 'Intră';
    }
  });

  // ---- EXAM SIMULATION BUTTON ----
  const examBtn = document.getElementById('examSimBtn');
  if (examBtn) examBtn.addEventListener('click', () => {
    if (window.WispucciFeatures && window.selectedSubject) {
      WispucciFeatures.startExamSimulation(window.selectedSubject);
    }
  });

  const examBack = document.getElementById('examBackBtn');
  if (examBack) examBack.addEventListener('click', () => { if (window.showView) showView('topics'); });

  // ---- Backend status hint ----
  API.health().then(online => {
    if (!online) console.info('[Wispucci] Backend offline — rulez în mod static (conținut din curriculum.js).');
    else console.info('[Wispucci] Backend online.');
  });
})();

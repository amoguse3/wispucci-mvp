// ===========================================================================
// WISPUCCI MVP — Main Application Logic (integrated with backend + features)
// ===========================================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ===== LOCAL STORAGE (offline mirror; backend is source of truth when logged in) =====
const STORE_KEY = 'wispucci.progress.v1';
function loadProgress() {
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : def(); }
  catch (_) { return def(); }
  function def() {
    return { completedTopics: [], streak: { current: 0, lastDate: null },
      totalLessons: 0, totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0,
      reviewQueue: [], _pendingReviews: [] };
  }
}
function saveProgress(p) { try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (_) {} }
let progress = loadProgress();
window.progress = progress; // expose for features.js

// ===== CLOCK =====
function tickClock() {
  const n = new Date();
  $('#clock').textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}
tickClock(); setInterval(tickClock, 30000);

// ===== EMBERS =====
(function initEmbers() {
  const c = $('#embers'); const ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2); let W, H, particles = [];
  function resize() { W = innerWidth; H = innerHeight; c.width = W*dpr; c.height = H*dpr; c.style.width = W+'px'; c.style.height = H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
  resize(); addEventListener('resize', resize);
  const N = Math.round(30 * (innerWidth / 1400));
  for (let i=0;i<N;i++) particles.push(mk(true));
  function mk(init){ return { x:Math.random()*innerWidth, y:init?Math.random()*innerHeight:innerHeight+Math.random()*60, r:.4+Math.random()*1.1, vy:-(0.08+Math.random()*.25), vx:(Math.random()-.5)*.1, a:.12+Math.random()*.45, f:Math.random()*Math.PI*2 }; }
  function draw(){ ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='lighter';
    for(let i=0;i<particles.length;i++){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.f+=.035;
      const a=(Math.sin(p.f)*.2+.7)*p.a*.45; ctx.fillStyle=`rgba(239,221,141,${a})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      if(p.y<-10) particles[i]=mk(false); }
    ctx.globalCompositeOperation='source-over'; requestAnimationFrame(draw); }
  draw();
})();

// ===== ORB =====
const theOrb = $('#theOrb');
const STATES = ['idle','happy','thinking','confused','sad','celebrating'];
function setOrbState(state) {
  STATES.forEach(s => theOrb.classList.toggle(`is-${s}`, s === state));
  const label = $('#aiBarState');
  if (label) { const L = { idle:'gata', happy:'bucuros', thinking:'gândește...', confused:'confuz', sad:'trist', celebrating:'🎉' }; label.textContent = L[state] || state; }
}
window.setOrbState = setOrbState;
(function blink(){ setTimeout(()=>{ const e=theOrb.querySelector('.face-eyes'); if(!e) return blink();
  e.style.transform='scaleY(0.05)'; e.style.transition='transform 80ms ease-in';
  setTimeout(()=>{ e.style.transform=''; e.style.transition='transform .35s cubic-bezier(0.16,1,0.3,1)'; blink(); },100);
}, 2500+Math.random()*3500); })();

// ===== NAVIGATION =====
const views = $$('.view');
const bottomNav = $('#bottomNav');
function showView(name) {
  views.forEach(v => v.classList.toggle('is-active', v.dataset.view === name));
  bottomNav.style.display = (name === 'welcome') ? 'none' : 'flex';
  $$('.bnav-item').forEach(b => b.classList.toggle('is-on', b.dataset.go === name));
  const moods = { welcome:'idle', subjects:'happy', topics:'idle', lesson:'thinking', stats:'happy', review:'thinking', exam:'thinking' };
  if (moods[name]) setOrbState(moods[name]);
  if (name === 'subjects') renderSubjects();
  if (name === 'stats') renderStats();
  if (name === 'review') renderReview();
}
window.showView = showView;
$$('.bnav-item').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.go)));
$('#startBtn').addEventListener('click', () => showView('subjects'));

// ===== SUBJECTS =====
let selectedSubject = null;
let selectedTopic = null;
function renderSubjects() {
  const grid = $('#subjectGrid');
  grid.innerHTML = CURRICULUM.subjects.map(subj => {
    const total = subj.chapters.reduce((s,ch)=>s+ch.topics.length,0);
    const done = subj.chapters.reduce((s,ch)=>s+ch.topics.filter(t=>progress.completedTopics.includes(t.id)).length,0);
    const pct = total ? Math.round(done/total*100) : 0;
    return `<button class="subject-card" data-subject="${subj.id}"><span class="subject-card-icon">${subj.icon}</span><div class="subject-card-info"><p class="subject-card-name">${subj.name}</p><p class="subject-card-desc">${subj.description}</p></div><span class="subject-card-progress">${pct}%</span></button>`;
  }).join('');
  $$('.subject-card', grid).forEach(card => card.addEventListener('click', () => {
    selectedSubject = CURRICULUM.subjects.find(s => s.id === card.dataset.subject);
    window.selectedSubject = selectedSubject;
    showView('topics'); renderTopics();
  }));
}

// ===== TOPICS =====
function renderTopics() {
  if (!selectedSubject) return;
  $('#topicsTitle').textContent = selectedSubject.name;
  $('#topicsSubtitle').textContent = 'Capitolele din programa de examen.';
  const list = $('#topicsList'); let html = ''; let num = 0;
  selectedSubject.chapters.forEach(ch => {
    html += `<p style="font-size:13px;font-weight:600;color:var(--accent);margin:20px 0 8px;text-transform:uppercase;letter-spacing:.04em;">${ch.name}</p>`;
    ch.topics.forEach(topic => {
      num++;
      const isDone = progress.completedTopics.includes(topic.id);
      const needsReview = progress.reviewQueue.includes(topic.id);
      let sc='', st='';
      if (isDone && needsReview) { sc='review'; st='repetă'; }
      else if (isDone) { sc='done'; st='✓'; }
      html += `<button class="topic-card" data-topic-id="${topic.id}"><span class="topic-card-num">${String(num).padStart(2,'0')}</span><span class="topic-card-name">${topic.title}</span>${st?`<span class="topic-card-status ${sc}">${st}</span>`:''}</button>`;
    });
  });
  list.innerHTML = html;
  $$('.topic-card', list).forEach(card => card.addEventListener('click', () => {
    const id = card.dataset.topicId;
    for (const ch of selectedSubject.chapters) { const f = ch.topics.find(t=>t.id===id); if (f) { selectedTopic = f; break; } }
    if (selectedTopic) { showView('lesson'); renderLesson(); }
  }));
}
$('#backToSubjects').addEventListener('click', () => showView('subjects'));

// ===== LESSON (with interleaving warm-up) =====
let _reexplainInit = false;
function renderLesson() {
  if (!selectedTopic) return;
  $('#lessonTopTitle').textContent = selectedTopic.title;
  const all = selectedSubject.chapters.flatMap(ch => ch.topics);
  const idx = all.findIndex(t => t.id === selectedTopic.id);
  $('#lessonTopProgress').textContent = `${idx+1} / ${all.length}`;
  $('#lessonProgressFill').style.width = (((idx+1)/all.length)*100) + '%';

  let html = '';
  // Interleaving warm-up from a prior completed topic
  let warmup = null;
  if (window.WispucciFeatures) {
    warmup = WispucciFeatures.buildWarmup(selectedSubject, selectedTopic.id);
    if (warmup) html += WispucciFeatures.renderWarmup(warmup);
  }

  const lesson = selectedTopic.lesson;
  html += lesson.content;
  if (lesson.quiz && lesson.quiz.length) {
    lesson.quiz.forEach((q, qi) => {
      html += `<div class="quiz-block" data-quiz-idx="${qi}"><p class="quiz-q">${q.q}</p><div class="quiz-opts">${q.opts.map((opt,oi)=>`<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}" data-correct="${oi===q.correct?'1':'0'}">${opt}</button>`).join('')}</div><div class="quiz-feedback" data-fb="${qi}"></div></div>`;
    });
  }
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="lessonNextBtn">Următoarea temă →</button></div>`;
  $('#lessonBody').innerHTML = html;
  $('#lessonScroll').scrollTop = 0;
  setTimeout(() => setOrbState('idle'), 1500);

  if (warmup && window.WispucciFeatures) WispucciFeatures.wireWarmup($('#lessonBody'));
  $$('.quiz-opt:not([data-warmup])', $('#lessonBody')).forEach(btn => btn.addEventListener('click', () => handleQuizAnswer(btn)));
  const nb = $('#lessonNextBtn'); if (nb) nb.addEventListener('click', () => completeAndNext());

  if (!_reexplainInit && window.WispucciFeatures) { WispucciFeatures.initReexplain(); _reexplainInit = true; }
}

let _lessonScore = { correct: 0, total: 0 };
function handleQuizAnswer(btn) {
  const qi = parseInt(btn.dataset.qi);
  const ok = btn.dataset.correct === '1';
  const block = btn.closest('.quiz-block');
  const fb = block.querySelector(`.quiz-feedback[data-fb="${qi}"]`);
  const quiz = selectedTopic.lesson.quiz[qi];
  $$('.quiz-opt', block).forEach(o => { o.disabled = true; if (o.dataset.correct === '1') o.classList.add('correct'); });
  if (ok) { setOrbState('happy'); fb.className='quiz-feedback show correct'; fb.textContent='✓ Corect! '+(quiz.explanation||''); progress.totalCorrect++; _lessonScore.correct++; }
  else { btn.classList.add('wrong'); setOrbState('confused'); fb.className='quiz-feedback show wrong'; fb.textContent='✗ '+(quiz.explanation||'Încearcă din nou.'); }
  progress.totalQuestions++; progress.totalQuizzes++; _lessonScore.total++;
  saveProgress(progress);
  setTimeout(() => setOrbState('idle'), 2500);
}

async function completeAndNext() {
  if (!selectedTopic || !selectedSubject) return;
  if (!progress.completedTopics.includes(selectedTopic.id)) {
    progress.completedTopics.push(selectedTopic.id);
    progress.totalLessons++;
    scheduleReview(selectedTopic.id);
  }
  updateStreak();
  saveProgress(progress);
  // Sync to backend if logged in
  if (window.API && API.online() && Auth.isLoggedIn) {
    try { await API.completeTopic(selectedTopic.id, _lessonScore.correct, _lessonScore.total); } catch (_) {}
  }
  _lessonScore = { correct: 0, total: 0 };

  const all = selectedSubject.chapters.flatMap(ch => ch.topics);
  const idx = all.findIndex(t => t.id === selectedTopic.id);
  if (idx < all.length - 1) { selectedTopic = all[idx+1]; renderLesson(); setOrbState('thinking'); }
  else { setOrbState('celebrating'); showView('stats'); }
}

// ===== SPACED REPETITION (offline mirror) =====
function scheduleReview(topicId) {
  const after = progress.completedTopics.length + 2;
  if (!progress._pendingReviews) progress._pendingReviews = [];
  progress._pendingReviews.push({ topicId, triggerAt: after });
  checkPendingReviews();
}
function checkPendingReviews() {
  if (!progress._pendingReviews) return;
  const cur = progress.completedTopics.length;
  progress._pendingReviews = progress._pendingReviews.filter(pr => {
    if (cur >= pr.triggerAt) { if (!progress.reviewQueue.includes(pr.topicId)) progress.reviewQueue.push(pr.topicId); return false; }
    return true;
  });
}

// ===== REVIEW =====
async function renderReview() {
  // Prefer backend due-reviews when logged in
  if (window.API && API.online() && Auth.isLoggedIn) {
    try { const d = await API.dueReviews(); progress.reviewQueue = d.due || progress.reviewQueue; } catch (_) {}
  }
  checkPendingReviews();
  const body = $('#reviewBody');
  if (!progress.reviewQueue.length) {
    body.innerHTML = `<div class="note" style="text-align:center;margin-top:24px;"><p>Nicio temă de repetat momentan. Continuă cu lecțiile noi!</p><button class="btn btn-primary" style="margin-top:16px;" onclick="showView('subjects')">La materii →</button></div>`;
    return;
  }
  let html = '';
  progress.reviewQueue.forEach(id => {
    let ti=null, sn='';
    for (const s of CURRICULUM.subjects) for (const ch of s.chapters) { const f=ch.topics.find(t=>t.id===id); if(f){ti=f;sn=s.name;break;} }
    if (!ti) return;
    html += `<div class="review-card"><p class="review-card-title">${ti.title}</p><p class="review-card-subject">${sn}</p><button class="btn btn-primary btn-sm" data-review-topic="${id}">Repetă acum</button></div>`;
  });
  body.innerHTML = html;
  $$('[data-review-topic]', body).forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.reviewTopic;
    for (const s of CURRICULUM.subjects) for (const ch of s.chapters) { const f=ch.topics.find(t=>t.id===id); if(f){ selectedSubject=s; window.selectedSubject=s; selectedTopic=f; progress.reviewQueue=progress.reviewQueue.filter(x=>x!==id); saveProgress(progress); showView('lesson'); renderLesson(); return; } }
  }));
}

// ===== STATS =====
async function renderStats() {
  if (window.API && API.online() && Auth.isLoggedIn) {
    try { const s = await API.stats();
      progress.totalLessons = s.lessons; progress.totalQuizzes = s.quizzes;
      progress.completedTopics = s.completed_topics || progress.completedTopics;
      progress.streak.current = s.streak;
      saveProgress(progress);
    } catch (_) {}
  }
  $('#statLessons').textContent = progress.totalLessons;
  $('#statQuizzes').textContent = progress.totalQuizzes;
  $('#statAccuracy').textContent = progress.totalQuestions>0 ? Math.round(progress.totalCorrect/progress.totalQuestions*100)+'%' : '—';
  const days=['L','M','M','J','V','S','D']; const today=new Date().getDay(); const mi=today===0?6:today-1;
  let sh=''; for(let i=0;i<7;i++){ const it=i===mi; const dn=i<progress.streak.current; sh+=`<span class="streak-day ${dn?'done':''} ${it?'today':''}">${days[i]}</span>`; }
  $('#streakRow').innerHTML = sh;
  let ph=''; CURRICULUM.subjects.forEach(subj => {
    const total=subj.chapters.reduce((s,ch)=>s+ch.topics.length,0);
    const done=subj.chapters.reduce((s,ch)=>s+ch.topics.filter(t=>progress.completedTopics.includes(t.id)).length,0);
    ph += `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:var(--r-md);background:var(--bg-card);border:1px solid var(--line);margin-bottom:8px;"><span style="font-size:14px;font-weight:500;">${subj.icon} ${subj.name}</span><span style="font-size:12px;color:${done===total&&total>0?'var(--success)':'var(--text-3)'};">${done}/${total}</span></div>`;
  });
  $('#subjectProgress').innerHTML = ph;
}

// ===== STREAK (flexible) =====
function updateStreak() {
  const today = new Date().toISOString().slice(0,10);
  if (progress.streak.lastDate === today) return;
  const y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if (progress.streak.lastDate === y) progress.streak.current++;
  else progress.streak.current = 1;
  progress.streak.lastDate = today;
}

// ===== LESSON BACK =====
$('#lessonBackBtn').addEventListener('click', () => { showView('topics'); renderTopics(); });

// ===== AI ASK (backend when online) =====
$('#aiSend').addEventListener('click', handleAsk);
$('#aiInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleAsk(); });
async function handleAsk() {
  const input = $('#aiInput'); const q = input.value.trim(); if (!q) return;
  setOrbState('thinking'); input.value = '';
  let answer;
  if (window.API && API.online() && Auth.isLoggedIn) {
    const ctx = $('#lessonBody')?.textContent?.slice(0, 1500) || '';
    try { answer = (await API.ask(selectedTopic?.title || '', ctx, q)).text; }
    catch (_) { answer = 'Nu am putut răspunde acum. Încearcă din nou.'; }
  } else {
    answer = 'Conectează-te și pornește backend-ul AI pentru răspunsuri personalizate. Deocamdată, recitește secțiunea sau încearcă quiz-ul.';
  }
  setOrbState('happy');
  const note = document.createElement('div'); note.className = 'note';
  note.innerHTML = `<strong>Wispucci:</strong> ${answer}`;
  $('#lessonBody').appendChild(note);
  const sc = $('#lessonScroll'); sc.scrollTop = sc.scrollHeight;
  setTimeout(() => setOrbState('idle'), 2000);
}

// ===== INIT =====
setOrbState('idle');

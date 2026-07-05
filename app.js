// ===========================================================================
// WISPUCCI MVP — Main Application Logic (v2)
// Features: adaptive AI Q&A, explain-differently, interleaved warmup,
// exam simulation + grading, flexible streak, spaced repetition.
// ===========================================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ===== LOCAL STORAGE =====
const STORE_KEY = 'wispucci.progress.v2';

function getDefaultProgress() {
  return {
    completedTopics: [], quizResults: [],
    streak: { current: 0, lastDate: null, activeDays: [] }, // activeDays: ISO date strings
    totalLessons: 0, totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0,
    reviewQueue: [], _pendingReviews: [],
    examResults: [],
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return getDefaultProgress();
    return Object.assign(getDefaultProgress(), JSON.parse(raw));
  } catch (_) { return getDefaultProgress(); }
}

function saveProgress(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (_) {}
}

let progress = loadProgress();

// ===== CLOCK =====
function tickClock() {
  const now = new Date();
  $('#clock').textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
}
tickClock();
setInterval(tickClock, 30000);

// ===== EMBERS BACKGROUND =====
(function initEmbers() {
  const canvas = $('#embers');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2);
  let W, H, particles = [];
  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); addEventListener('resize', resize);
  const N = Math.round(30 * (innerWidth / 1400));
  for (let i = 0; i < N; i++) particles.push(mk(true));
  function mk(init) {
    return {
      x: Math.random() * innerWidth,
      y: init ? Math.random() * innerHeight : innerHeight + Math.random() * 60,
      r: .4 + Math.random() * 1.1,
      vy: -(0.08 + Math.random() * .25),
      vx: (Math.random() - .5) * .1,
      a: .12 + Math.random() * .45,
      f: Math.random() * Math.PI * 2,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.f += .035;
      const alpha = (Math.sin(p.f) * .2 + .7) * p.a * .45;
      ctx.fillStyle = `rgba(239,221,141,${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      if (p.y < -10) particles[i] = mk(false);
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== ORB =====
const theOrb = $('#theOrb');
const STATES = ['idle', 'happy', 'thinking', 'confused', 'sad', 'celebrating'];
function setOrbState(state) {
  STATES.forEach(s => theOrb.classList.toggle(`is-${s}`, s === state));
  const label = $('#aiBarState');
  if (label) {
    const labels = { idle: 'gata', happy: 'bucuros', thinking: 'gândește...', confused: 'confuz', sad: 'trist', celebrating: '🎉' };
    label.textContent = labels[state] || state;
  }
}
function scheduleBlink() {
  setTimeout(() => {
    const eyes = theOrb.querySelector('.face-eyes');
    if (!eyes) return scheduleBlink();
    eyes.style.transform = 'scaleY(0.05)';
    eyes.style.transition = 'transform 80ms ease-in';
    setTimeout(() => {
      eyes.style.transform = '';
      eyes.style.transition = 'transform .35s cubic-bezier(0.16, 1, 0.3, 1)';
      scheduleBlink();
    }, 100);
  }, 2500 + Math.random() * 3500);
}
scheduleBlink();

// ===== NAVIGATION =====
const views = $$('.view');
const bottomNav = $('#bottomNav');
function showView(name) {
  views.forEach(v => v.classList.toggle('is-active', v.dataset.view === name));
  bottomNav.style.display = (name === 'welcome') ? 'none' : 'flex';
  $$('.bnav-item').forEach(b => b.classList.toggle('is-on', b.dataset.go === name));
  if (name === 'welcome') setOrbState('idle');
  if (name === 'subjects') { setOrbState('happy'); renderSubjects(); }
  if (name === 'topics') setOrbState('idle');
  if (name === 'lesson') setOrbState('thinking');
  if (name === 'stats') { setOrbState('happy'); renderStats(); }
  if (name === 'review') { setOrbState('thinking'); renderReview(); }
}
$$('.bnav-item').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.go)));
$('#startBtn').addEventListener('click', () => showView('subjects'));

// ===== SUBJECTS =====
let selectedSubject = null;
let selectedTopic = null;

function renderSubjects() {
  const grid = $('#subjectGrid');
  grid.innerHTML = CURRICULUM.subjects.map(subj => {
    const total = subj.chapters.reduce((s, ch) => s + ch.topics.length, 0);
    const done = subj.chapters.reduce((s, ch) => s + ch.topics.filter(t => progress.completedTopics.includes(t.id)).length, 0);
    const pct = total ? Math.round(done / total * 100) : 0;
    return `<button class="subject-card" data-subject="${subj.id}">
        <span class="subject-card-icon">${subj.icon}</span>
        <div class="subject-card-info"><p class="subject-card-name">${subj.name}</p><p class="subject-card-desc">${subj.description}</p></div>
        <span class="subject-card-progress">${pct}%</span></button>`;
  }).join('');
  $$('.subject-card', grid).forEach(card => {
    card.addEventListener('click', () => {
      selectedSubject = CURRICULUM.subjects.find(s => s.id === card.dataset.subject);
      showView('topics'); renderTopics();
    });
  });
}

// ===== TOPICS =====
function renderTopics() {
  if (!selectedSubject) return;
  $('#topicsTitle').textContent = selectedSubject.name;
  const list = $('#topicsList');
  let html = '', num = 0;
  selectedSubject.chapters.forEach(ch => {
    html += `<p class="chapter-label">${ch.name}</p>`;
    ch.topics.forEach(topic => {
      num++;
      const isDone = progress.completedTopics.includes(topic.id);
      const needsReview = progress.reviewQueue.includes(topic.id);
      let cls = '', txt = '';
      if (isDone && needsReview) { cls = 'review'; txt = 'repetă'; }
      else if (isDone) { cls = 'done'; txt = '✓'; }
      html += `<button class="topic-card" data-topic-id="${topic.id}">
          <span class="topic-card-num">${String(num).padStart(2, '0')}</span>
          <span class="topic-card-name">${topic.title}</span>
          ${txt ? `<span class="topic-card-status ${cls}">${txt}</span>` : ''}</button>`;
    });
  });
  list.innerHTML = html;
  $$('.topic-card', list).forEach(card => {
    card.addEventListener('click', () => {
      const topicId = card.dataset.topicId;
      for (const ch of selectedSubject.chapters) {
        const found = ch.topics.find(t => t.id === topicId);
        if (found) { selectedTopic = found; break; }
      }
      if (selectedTopic) startLessonFlow();
    });
  });
}
$('#backToSubjects').addEventListener('click', () => showView('subjects'));

// ===== LESSON FLOW (with interleaved warmup) =====
async function startLessonFlow() {
  showView('lesson');
  // Interleaving: if the student has prior completed topics in this subject,
  // show a quick warmup before the new lesson (retrieval practice).
  const priorInSubject = selectedSubject.chapters
    .flatMap(ch => ch.topics)
    .filter(t => progress.completedTopics.includes(t.id) && t.id !== selectedTopic.id);

  if (priorInSubject.length >= 2 && API.isOnline()) {
    await renderWarmup(priorInSubject.slice(-3).map(t => t.title));
  } else {
    renderLesson();
  }
}

async function renderWarmup(priorTitles) {
  $('#lessonTopTitle').textContent = 'Recapitulare rapidă';
  $('#lessonTopProgress').textContent = 'warm-up';
  $('#lessonProgressFill').style.width = '5%';
  setOrbState('thinking');
  $('#lessonBody').innerHTML = `<div class="warmup-loading"><p class="muted">Wispucci pregătește 2 întrebări din temele anterioare...</p></div>`;
  $('#lessonScroll').scrollTop = 0;

  let questions = [];
  try {
    const res = await API.warmup({ prior_topics: priorTitles, subject: selectedSubject.name });
    questions = res.questions || [];
  } catch (_) { questions = []; }

  if (!questions.length) { renderLesson(); return; }

  setOrbState('idle');
  let html = `<div class="warmup-banner">🔄 Înainte de tema nouă, hai să reactivăm ce ai învățat</div>`;
  questions.forEach((q, qi) => {
    html += buildQuizHtml(q, 'w' + qi);
  });
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="warmupDoneBtn">Continuă la lecție →</button></div>`;
  $('#lessonBody').innerHTML = html;
  wireQuizzes($('#lessonBody'), questions, 'w');
  $('#warmupDoneBtn').addEventListener('click', () => renderLesson());
}

function buildQuizHtml(q, key) {
  return `<div class="quiz-block" data-quiz-key="${key}">
      <p class="quiz-q">${q.q}</p>
      <div class="quiz-opts">
        ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-key="${key}" data-oi="${oi}" data-correct="${oi === q.correct ? '1' : '0'}">${opt}</button>`).join('')}
      </div>
      <div class="quiz-feedback" data-fb="${key}"></div>
    </div>`;
}

function wireQuizzes(ctx, questions, prefix) {
  $$('.quiz-opt', ctx).forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const block = btn.closest('.quiz-block');
      const feedback = block.querySelector(`.quiz-feedback[data-fb="${key}"]`);
      const idx = parseInt(key.replace(/^[a-z]+/, ''));
      const q = questions[idx];
      const isCorrect = btn.dataset.correct === '1';
      $$('.quiz-opt', block).forEach(o => { o.disabled = true; if (o.dataset.correct === '1') o.classList.add('correct'); });
      if (isCorrect) {
        setOrbState('happy');
        feedback.className = 'quiz-feedback show correct';
        feedback.textContent = '✓ Corect! ' + (q.explanation || '');
        progress.totalCorrect++;
      } else {
        btn.classList.add('wrong');
        setOrbState('confused');
        feedback.className = 'quiz-feedback show wrong';
        feedback.textContent = '✗ ' + (q.explanation || '');
      }
      progress.totalQuestions++;
      progress.totalQuizzes++;
      saveProgress(progress);
      setTimeout(() => setOrbState('idle'), 2500);
    });
  });
}

function renderLesson() {
  if (!selectedTopic) return;
  $('#lessonTopTitle').textContent = selectedTopic.title;
  const allTopics = selectedSubject.chapters.flatMap(ch => ch.topics);
  const idx = allTopics.findIndex(t => t.id === selectedTopic.id);
  $('#lessonTopProgress').textContent = `${idx + 1} / ${allTopics.length}`;
  $('#lessonProgressFill').style.width = (((idx + 1) / allTopics.length) * 100) + '%';
  const lesson = selectedTopic.lesson;
  let html = lesson.content;
  const quizzes = lesson.quiz || [];
  quizzes.forEach((q, qi) => { html += buildQuizHtml(q, 'q' + qi); });
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="lessonNextBtn">Următoarea temă →</button></div>`;
  $('#lessonBody').innerHTML = html;
  $('#lessonScroll').scrollTop = 0;
  setTimeout(() => setOrbState('idle'), 1200);
  wireQuizzes($('#lessonBody'), quizzes, 'q');
  const nextBtn = $('#lessonNextBtn');
  if (nextBtn) nextBtn.addEventListener('click', () => completeAndNext());
}

function completeAndNext() {
  if (!selectedTopic || !selectedSubject) return;
  if (!progress.completedTopics.includes(selectedTopic.id)) {
    progress.completedTopics.push(selectedTopic.id);
    progress.totalLessons++;
    scheduleReview(selectedTopic.id);
  }
  updateStreak();
  saveProgress(progress);
  const allTopics = selectedSubject.chapters.flatMap(ch => ch.topics);
  const idx = allTopics.findIndex(t => t.id === selectedTopic.id);
  if (idx < allTopics.length - 1) {
    selectedTopic = allTopics[idx + 1];
    startLessonFlow();
  } else {
    setOrbState('celebrating');
    showView('stats');
  }
}

// ===== SPACED REPETITION =====
function scheduleReview(topicId) {
  const reviewAfter = progress.completedTopics.length + 2;
  if (!progress._pendingReviews) progress._pendingReviews = [];
  progress._pendingReviews.push({ topicId, triggerAt: reviewAfter });
  checkPendingReviews();
}
function checkPendingReviews() {
  if (!progress._pendingReviews) return;
  const current = progress.completedTopics.length;
  progress._pendingReviews = progress._pendingReviews.filter(pr => {
    if (current >= pr.triggerAt) {
      if (!progress.reviewQueue.includes(pr.topicId)) progress.reviewQueue.push(pr.topicId);
      return false;
    }
    return true;
  });
}

// ===== REVIEW =====
function renderReview() {
  checkPendingReviews();
  const body = $('#reviewBody');
  if (!progress.reviewQueue.length) {
    body.innerHTML = `<div class="note" style="text-align:center;margin-top:24px;"><p>Nicio temă de repetat momentan. Continuă cu lecțiile noi!</p><button class="btn btn-primary" style="margin-top:16px;" onclick="showView('subjects')">La materii →</button></div>`;
    return;
  }
  let html = '';
  progress.reviewQueue.forEach(topicId => {
    let ti = null, sn = '';
    for (const subj of CURRICULUM.subjects) {
      for (const ch of subj.chapters) {
        const f = ch.topics.find(t => t.id === topicId);
        if (f) { ti = f; sn = subj.name; break; }
      }
      if (ti) break;
    }
    if (!ti) return;
    html += `<div class="review-card"><p class="review-card-title">${ti.title}</p><p class="review-card-subject">${sn}</p><button class="btn btn-primary btn-sm" data-review-topic="${topicId}">Repetă acum</button></div>`;
  });
  body.innerHTML = html;
  $$('[data-review-topic]', body).forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.reviewTopic;
      for (const subj of CURRICULUM.subjects) {
        for (const ch of subj.chapters) {
          const f = ch.topics.find(t => t.id === topicId);
          if (f) {
            selectedSubject = subj; selectedTopic = f;
            progress.reviewQueue = progress.reviewQueue.filter(id => id !== topicId);
            saveProgress(progress);
            showView('lesson'); renderLesson();
            return;
          }
        }
      }
    });
  });
}

// ===== EXAM SIMULATION =====
$('#startExamBtn').addEventListener('click', () => startExam());
$('#examBackBtn').addEventListener('click', () => { showView('topics'); renderTopics(); });

async function startExam() {
  if (!selectedSubject) return;
  showView('exam');
  $('#examSubtitle').textContent = `${selectedSubject.name} · format ANCE`;
  const body = $('#examBody');
  setOrbState('thinking');

  const topicTitles = selectedSubject.chapters.flatMap(ch => ch.topics).map(t => t.title);

  if (!API.isOnline()) {
    body.innerHTML = `<div class="note" style="text-align:center;"><p>Simularea de examen necesită backend-ul AI activ. Pornește serverul local sau configurează <code>WISPUCCI_API_BASE</code>.</p></div>`;
    setOrbState('idle');
    return;
  }

  body.innerHTML = `<div class="warmup-loading"><p class="muted">Wispucci generează o simulare de examen...</p></div>`;
  try {
    const res = await API.simulateExam({ subject: selectedSubject.name, topics: topicTitles, num_items: 8 });
    if (!res.exam || !res.exam.items) throw new Error('empty');
    renderExam(res.exam.items);
  } catch (_) {
    body.innerHTML = `<div class="note" style="text-align:center;"><p>Nu am putut genera examenul acum. Încearcă din nou.</p></div>`;
  }
  setOrbState('idle');
}

function renderExam(items) {
  const body = $('#examBody');
  let html = '';
  items.forEach((item, i) => {
    html += `<div class="exam-item" data-exam-idx="${i}">
      <div class="exam-item-head"><span class="exam-item-num">Item ${i + 1}</span><span class="exam-item-points">${item.points || 1} p</span></div>
      <p class="exam-q">${item.q}</p>`;
    if (item.type === 'multiple' && item.opts) {
      html += `<div class="quiz-opts">${item.opts.map((o, oi) => `<button class="quiz-opt" data-exam="${i}" data-oi="${oi}" data-correct="${oi === item.correct ? '1' : '0'}">${o}</button>`).join('')}</div>`;
    } else {
      html += `<textarea class="exam-open" data-exam-open="${i}" placeholder="Scrie răspunsul tău..."></textarea>
      <button class="btn-ghost btn-sm exam-grade-btn" data-grade="${i}">Trimite pentru evaluare</button>
      <div class="quiz-feedback" data-exam-fb="${i}"></div>`;
    }
    html += `</div>`;
  });
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="examFinishBtn">Termină examenul</button></div>`;
  body.innerHTML = html;

  // Multiple choice
  $$('.quiz-opt[data-exam]', body).forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.exam-item');
      $$('.quiz-opt', block).forEach(o => { o.disabled = true; if (o.dataset.correct === '1') o.classList.add('correct'); });
      if (btn.dataset.correct !== '1') { btn.classList.add('wrong'); setOrbState('confused'); }
      else setOrbState('happy');
      setTimeout(() => setOrbState('idle'), 2000);
    });
  });

  // Open answer grading
  $$('.exam-grade-btn', body).forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = btn.dataset.grade;
      const ta = body.querySelector(`[data-exam-open="${i}"]`);
      const fb = body.querySelector(`[data-exam-fb="${i}"]`);
      const answer = (ta.value || '').trim();
      if (!answer) { ta.focus(); return; }
      const item = items[i];
      btn.disabled = true; btn.textContent = 'Se evaluează...';
      setOrbState('thinking');
      try {
        const res = await API.gradeAnswer({ subject: selectedSubject.name, question: item.q, rubric: item.rubric || '', student_answer: answer });
        const r = res.result || {};
        fb.className = 'quiz-feedback show ' + (r.score >= 5 ? 'correct' : 'wrong');
        fb.textContent = (r.score != null ? `Scor: ${r.score}/10. ` : '') + (r.feedback || '');
        setOrbState(r.score >= 5 ? 'happy' : 'confused');
      } catch (_) {
        fb.className = 'quiz-feedback show wrong';
        fb.textContent = 'Nu am putut evalua răspunsul acum.';
      }
      btn.textContent = 'Evaluat';
      setTimeout(() => setOrbState('idle'), 2500);
    });
  });

  $('#examFinishBtn').addEventListener('click', () => {
    updateStreak();
    progress.examResults.push({ subject: selectedSubject.id, date: new Date().toISOString() });
    saveProgress(progress);
    setOrbState('celebrating');
    showView('stats');
  });
}

// ===== STATS =====
function renderStats() {
  $('#statLessons').textContent = progress.totalLessons;
  $('#statQuizzes').textContent = progress.totalQuizzes;
  $('#statAccuracy').textContent = progress.totalQuestions > 0 ? Math.round(progress.totalCorrect / progress.totalQuestions * 100) + '%' : '—';

  // Flexible streak: show last 7 calendar days, highlight active ones.
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const active = new Set(progress.streak.activeDays || []);
  const today = new Date();
  const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  let html = '';
  // Build Monday..Sunday of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const isDone = active.has(iso);
    const isToday = i === todayDow;
    html += `<span class="streak-day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">${days[i]}</span>`;
  }
  $('#streakRow').innerHTML = html;
  const info = $('#streakInfo');
  if (info) info.textContent = progress.streak.current > 0 ? `· ${progress.streak.current} zile` : '';

  const progDiv = $('#subjectProgress');
  let sh = '';
  CURRICULUM.subjects.forEach(subj => {
    const total = subj.chapters.reduce((s, ch) => s + ch.topics.length, 0);
    const done = subj.chapters.reduce((s, ch) => s + ch.topics.filter(t => progress.completedTopics.includes(t.id)).length, 0);
    sh += `<div class="subj-progress-row"><span>${subj.icon} ${subj.name}</span><span style="color:${done === total && total > 0 ? 'var(--success)' : 'var(--text-3)'};">${done}/${total}</span></div>`;
  });
  progDiv.innerHTML = sh;
}

// ===== FLEXIBLE STREAK =====
// No punishment for missed days. Streak = consecutive days ending today/yesterday.
// activeDays records every day the student did something.
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (!progress.streak.activeDays) progress.streak.activeDays = [];
  if (!progress.streak.activeDays.includes(today)) progress.streak.activeDays.push(today);
  // keep last 60 days only
  progress.streak.activeDays = progress.streak.activeDays.slice(-60);
  // recompute current consecutive streak ending today
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (progress.streak.activeDays.includes(iso)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  progress.streak.current = streak;
  progress.streak.lastDate = today;
}

// ===== LESSON BACK =====
$('#lessonBackBtn').addEventListener('click', () => { showView('topics'); renderTopics(); });

// ===== AI ASK (real backend) =====
$('#aiSend').addEventListener('click', handleAiQuestion);
$('#aiInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAiQuestion(); });

async function handleAiQuestion() {
  const input = $('#aiInput');
  const question = input.value.trim();
  if (!question) return;
  setOrbState('thinking');
  input.value = '';
  const lessonText = ($('#lessonBody').innerText || '').slice(0, 2000);
  let answer;
  try {
    const res = await API.ask({
      question,
      topic_title: selectedTopic ? selectedTopic.title : '',
      subject: selectedSubject ? selectedSubject.name : '',
      lesson_context: lessonText,
    });
    answer = res.answer;
  } catch (_) {
    answer = '(Mod offline) Pornește backend-ul ca Wispucci să răspundă. Între timp: recitește secțiunea și identifică pasul neclar.';
  }
  const bubble = document.createElement('div');
  bubble.className = 'ai-response';
  bubble.innerHTML = `<span class="ai-response-q">${question}</span><span class="ai-response-a">${answer}</span>`;
  $('#lessonBody').appendChild(bubble);
  const scroll = $('#lessonScroll');
  scroll.scrollTop = scroll.scrollHeight;
  setOrbState('happy');
  setTimeout(() => setOrbState('idle'), 2000);
}

// ===== EXPLAIN-DIFFERENTLY (text selection) =====
const explainPopover = $('#explainPopover');
const explainBtn = $('#explainBtn');
let lastSelection = '';

document.addEventListener('mouseup', (e) => {
  if (explainPopover.contains(e.target)) return;
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : '';
  const inLesson = $('.view[data-view="lesson"]').classList.contains('is-active');
  if (text.length > 8 && inLesson) {
    lastSelection = text;
    const range = sel.getRangeAt(0).getBoundingClientRect();
    explainPopover.style.top = (range.top + window.scrollY - 44) + 'px';
    explainPopover.style.left = (range.left + range.width / 2) + 'px';
    explainPopover.classList.add('show');
  } else {
    explainPopover.classList.remove('show');
  }
});

explainBtn.addEventListener('click', async () => {
  explainPopover.classList.remove('show');
  if (!lastSelection) return;
  setOrbState('thinking');
  let explanation;
  try {
    const res = await API.explain({ passage: lastSelection, topic_title: selectedTopic ? selectedTopic.title : '', style: 'simpler' });
    explanation = res.explanation;
  } catch (_) {
    explanation = '(Mod offline) Pornește backend-ul ca Wispucci să reformuleze acest pasaj.';
  }
  const bubble = document.createElement('div');
  bubble.className = 'ai-response';
  bubble.innerHTML = `<span class="ai-response-q">✨ "${lastSelection.slice(0, 80)}${lastSelection.length > 80 ? '...' : ''}"</span><span class="ai-response-a">${explanation}</span>`;
  $('#lessonBody').appendChild(bubble);
  const scroll = $('#lessonScroll');
  scroll.scrollTop = scroll.scrollHeight;
  setOrbState('happy');
  setTimeout(() => setOrbState('idle'), 2000);
});

// ===== INIT =====
setOrbState('idle');
API.health(); // probe backend availability early

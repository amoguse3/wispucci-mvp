// ===========================================================================
// WISPUCCI MVP — Main Application Logic
// ===========================================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ===== LOCAL STORAGE =====
const STORE_KEY = 'wispucci.progress.v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : getDefaultProgress();
  } catch (_) { return getDefaultProgress(); }
}

function getDefaultProgress() {
  return {
    completedTopics: [], quizResults: [],
    streak: { current: 0, lastDate: null },
    totalLessons: 0, totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0,
    reviewQueue: [], _pendingReviews: [],
  };
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
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (p.y < -10) particles[i] = mk(false);
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== ORB STATE MACHINE =====
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
  if (name === 'subjects') setOrbState('happy');
  if (name === 'topics') setOrbState('idle');
  if (name === 'lesson') setOrbState('thinking');
  if (name === 'stats') setOrbState('happy');
  if (name === 'review') setOrbState('thinking');
  if (name === 'subjects') renderSubjects();
  if (name === 'stats') renderStats();
  if (name === 'review') renderReview();
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
    return `
      <button class="subject-card" data-subject="${subj.id}">
        <span class="subject-card-icon">${subj.icon}</span>
        <div class="subject-card-info">
          <p class="subject-card-name">${subj.name}</p>
          <p class="subject-card-desc">${subj.description}</p>
        </div>
        <span class="subject-card-progress">${pct}%</span>
      </button>`;
  }).join('');
  $$('.subject-card', grid).forEach(card => {
    card.addEventListener('click', () => {
      selectedSubject = CURRICULUM.subjects.find(s => s.id === card.dataset.subject);
      showView('topics');
      renderTopics();
    });
  });
}

// ===== TOPICS =====
function renderTopics() {
  if (!selectedSubject) return;
  $('#topicsTitle').textContent = selectedSubject.name;
  $('#topicsSubtitle').textContent = 'Capitolele din programa de examen.';
  const list = $('#topicsList');
  let html = '';
  let num = 0;
  selectedSubject.chapters.forEach(ch => {
    html += `<p style="font-size:13px;font-weight:600;color:var(--accent);margin:20px 0 8px;text-transform:uppercase;letter-spacing:.04em;">${ch.name}</p>`;
    ch.topics.forEach(topic => {
      num++;
      const isDone = progress.completedTopics.includes(topic.id);
      const needsReview = progress.reviewQueue.includes(topic.id);
      let statusClass = '', statusText = '';
      if (isDone && needsReview) { statusClass = 'review'; statusText = 'repetă'; }
      else if (isDone) { statusClass = 'done'; statusText = '✓'; }
      html += `
        <button class="topic-card" data-topic-id="${topic.id}">
          <span class="topic-card-num">${String(num).padStart(2, '0')}</span>
          <span class="topic-card-name">${topic.title}</span>
          ${statusText ? `<span class="topic-card-status ${statusClass}">${statusText}</span>` : ''}
        </button>`;
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
      if (selectedTopic) { showView('lesson'); renderLesson(); }
    });
  });
}

$('#backToSubjects').addEventListener('click', () => showView('subjects'));

// ===== LESSON =====
function renderLesson() {
  if (!selectedTopic) return;
  $('#lessonTopTitle').textContent = selectedTopic.title;
  const allTopics = selectedSubject.chapters.flatMap(ch => ch.topics);
  const idx = allTopics.findIndex(t => t.id === selectedTopic.id);
  $('#lessonTopProgress').textContent = `${idx + 1} / ${allTopics.length}`;
  $('#lessonProgressFill').style.width = (((idx + 1) / allTopics.length) * 100) + '%';
  const lesson = selectedTopic.lesson;
  let html = lesson.content;
  if (lesson.quiz && lesson.quiz.length) {
    lesson.quiz.forEach((q, qi) => {
      html += `
        <div class="quiz-block" data-quiz-idx="${qi}">
          <p class="quiz-q">${q.q}</p>
          <div class="quiz-opts">
            ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}" data-correct="${oi === q.correct ? '1' : '0'}">${opt}</button>`).join('')}
          </div>
          <div class="quiz-feedback" data-fb="${qi}"></div>
        </div>`;
    });
  }
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="lessonNextBtn">Următoarea temă →</button></div>`;
  $('#lessonBody').innerHTML = html;
  $('#lessonScroll').scrollTop = 0;
  setTimeout(() => setOrbState('idle'), 1500);
  $$('.quiz-opt', $('#lessonBody')).forEach(btn => btn.addEventListener('click', () => handleQuizAnswer(btn)));
  const nextBtn = $('#lessonNextBtn');
  if (nextBtn) nextBtn.addEventListener('click', () => completeAndNext());
}

function handleQuizAnswer(btn) {
  const qi = parseInt(btn.dataset.qi);
  const isCorrect = btn.dataset.correct === '1';
  const block = btn.closest('.quiz-block');
  const feedback = block.querySelector(`.quiz-feedback[data-fb="${qi}"]`);
  const quiz = selectedTopic.lesson.quiz[qi];
  $$('.quiz-opt', block).forEach(o => {
    o.disabled = true;
    if (o.dataset.correct === '1') o.classList.add('correct');
  });
  if (isCorrect) {
    setOrbState('happy');
    feedback.className = 'quiz-feedback show correct';
    feedback.textContent = '✓ Corect! ' + (quiz.explanation || '');
    progress.totalCorrect++;
  } else {
    btn.classList.add('wrong');
    setOrbState('confused');
    feedback.className = 'quiz-feedback show wrong';
    feedback.textContent = '✗ ' + (quiz.explanation || 'Încearcă din nou.');
  }
  progress.totalQuestions++;
  progress.totalQuizzes++;
  saveProgress(progress);
  setTimeout(() => setOrbState('idle'), 2500);
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
    renderLesson();
    setOrbState('thinking');
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
    let topicInfo = null, subjectName = '';
    for (const subj of CURRICULUM.subjects) {
      for (const ch of subj.chapters) {
        const found = ch.topics.find(t => t.id === topicId);
        if (found) { topicInfo = found; subjectName = subj.name; break; }
      }
      if (topicInfo) break;
    }
    if (!topicInfo) return;
    html += `<div class="review-card"><p class="review-card-title">${topicInfo.title}</p><p class="review-card-subject">${subjectName}</p><button class="btn btn-primary btn-sm" data-review-topic="${topicId}">Repetă acum</button></div>`;
  });
  body.innerHTML = html;
  $$('[data-review-topic]', body).forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.reviewTopic;
      for (const subj of CURRICULUM.subjects) {
        for (const ch of subj.chapters) {
          const found = ch.topics.find(t => t.id === topicId);
          if (found) {
            selectedSubject = subj; selectedTopic = found;
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

// ===== STATS =====
function renderStats() {
  $('#statLessons').textContent = progress.totalLessons;
  $('#statQuizzes').textContent = progress.totalQuizzes;
  $('#statAccuracy').textContent = progress.totalQuestions > 0 ? Math.round(progress.totalCorrect / progress.totalQuestions * 100) + '%' : '—';
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay();
  const mondayIdx = today === 0 ? 6 : today - 1;
  let streakHtml = '';
  for (let i = 0; i < 7; i++) {
    const isToday = i === mondayIdx;
    const isDone = i < progress.streak.current;
    streakHtml += `<span class="streak-day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">${days[i]}</span>`;
  }
  $('#streakRow').innerHTML = streakHtml;
  const progDiv = $('#subjectProgress');
  let html = '';
  CURRICULUM.subjects.forEach(subj => {
    const total = subj.chapters.reduce((s, ch) => s + ch.topics.length, 0);
    const done = subj.chapters.reduce((s, ch) => s + ch.topics.filter(t => progress.completedTopics.includes(t.id)).length, 0);
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:var(--r-md);background:var(--bg-card);border:1px solid var(--line);margin-bottom:8px;"><span style="font-size:14px;font-weight:500;">${subj.icon} ${subj.name}</span><span style="font-size:12px;color:${done === total && total > 0 ? 'var(--success)' : 'var(--text-3)'};">${done}/${total}</span></div>`;
  });
  progDiv.innerHTML = html;
}

// ===== STREAK =====
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.streak.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (progress.streak.lastDate === yesterday) progress.streak.current++;
  else progress.streak.current = 1;
  progress.streak.lastDate = today;
}

// ===== LESSON BACK =====
$('#lessonBackBtn').addEventListener('click', () => { showView('topics'); renderTopics(); });

// ===== AI INPUT (ready for backend) =====
$('#aiSend').addEventListener('click', handleAiQuestion);
$('#aiInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAiQuestion(); });

function handleAiQuestion() {
  const input = $('#aiInput');
  const question = input.value.trim();
  if (!question) return;
  setOrbState('thinking');
  input.value = '';
  setTimeout(() => {
    setOrbState('happy');
    const response = document.createElement('div');
    response.className = 'note';
    response.innerHTML = `<strong>Wispucci:</strong> Bună întrebare! Într-o versiune viitoare voi răspunde personalizat (backend AI). Deocamdată, recitește secțiunea sau încearcă quiz-ul.`;
    $('#lessonBody').appendChild(response);
    const scroll = $('#lessonScroll');
    scroll.scrollTop = scroll.scrollHeight;
    setTimeout(() => setOrbState('idle'), 2000);
  }, 1500);
}

// ===== INIT =====
setOrbState('idle');

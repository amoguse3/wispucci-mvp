// ===========================================================================
// WISPUCCI — Enhanced Features (differentiation layer)
// - Interleaving warm-up (retrieval of prior topics before a new one)
// - Adaptive re-explain ("explain differently" on selected text)
// - Exam simulation (full ANCE-format test from covered topics)
// - AI mnemonics for hard facts
// These use the backend when online, and degrade gracefully otherwise.
// Depends on: api.js, curriculum.js, app.js (setOrbState, $, $$, showView)
// ===========================================================================

// ---- Collect all topics flat, with subject context ----
function allTopicsFlat() {
  const out = [];
  CURRICULUM.subjects.forEach(subj => {
    subj.chapters.forEach(ch => {
      ch.topics.forEach(t => out.push({ ...t, subjectId: subj.id, subjectName: subj.name }));
    });
  });
  return out;
}

// ---- INTERLEAVING WARM-UP ----------------------------------------------
// Before a new lesson, pull 1 quick question from a previously completed
// topic in the same subject. Retrieval practice + interleaving.
function buildWarmup(subject, currentTopicId) {
  const done = (window.progress?.completedTopics) || [];
  if (done.length === 0) return null;
  const candidates = subject.chapters
    .flatMap(ch => ch.topics)
    .filter(t => t.id !== currentTopicId && done.includes(t.id) && t.lesson.quiz?.length);
  if (!candidates.length) return null;
  const topic = candidates[Math.floor(Math.random() * candidates.length)];
  const q = topic.lesson.quiz[Math.floor(Math.random() * topic.lesson.quiz.length)];
  return { topicTitle: topic.title, question: q };
}

function renderWarmup(warmup) {
  if (!warmup) return '';
  const q = warmup.question;
  return `
    <div class="quiz-block warmup-block" style="border-color:rgba(242,201,76,.3);">
      <p style="font-size:11px;font-weight:600;color:var(--warn);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">🔄 Recapitulare rapidă — ${warmup.topicTitle}</p>
      <p class="quiz-q">${q.q}</p>
      <div class="quiz-opts">
        ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-warmup="1" data-correct="${oi === q.correct ? '1' : '0'}">${opt}</button>`).join('')}
      </div>
      <div class="quiz-feedback" data-warmup-fb="1"></div>
    </div>`;
}

function wireWarmup(root) {
  root.querySelectorAll('[data-warmup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.warmup-block');
      const fb = block.querySelector('[data-warmup-fb]');
      block.querySelectorAll('.quiz-opt').forEach(o => {
        o.disabled = true;
        if (o.dataset.correct === '1') o.classList.add('correct');
      });
      if (btn.dataset.correct === '1') {
        fb.className = 'quiz-feedback show correct';
        fb.textContent = '✓ Ții minte! Hai la tema nouă.';
        if (window.setOrbState) setOrbState('happy');
      } else {
        btn.classList.add('wrong');
        fb.className = 'quiz-feedback show wrong';
        fb.textContent = 'Merită să revii la această temă mai târziu.';
        if (window.setOrbState) setOrbState('confused');
      }
      setTimeout(() => window.setOrbState && setOrbState('idle'), 2000);
    });
  });
}

// ---- ADAPTIVE RE-EXPLAIN (select text -> explain differently) ----------
function initReexplain() {
  const scroll = document.getElementById('lessonScroll');
  if (!scroll) return;
  let popover = null;

  scroll.addEventListener('mouseup', async () => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    removePopover();
    if (text.length < 8) return;
    const range = sel.getRangeAt(0).getBoundingClientRect();
    popover = document.createElement('button');
    popover.className = 'reexplain-pop';
    popover.textContent = '💡 Explică-mi altfel';
    popover.style.cssText = `position:fixed;top:${range.top - 44}px;left:${range.left}px;z-index:200;
      padding:8px 14px;border-radius:999px;background:var(--accent);color:var(--bg-base);
      font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(239,221,141,.3);`;
    document.body.appendChild(popover);
    popover.addEventListener('click', async (e) => {
      e.stopPropagation();
      const title = document.getElementById('lessonTopTitle')?.textContent || '';
      popover.textContent = 'Wispucci gândește...';
      if (window.setOrbState) setOrbState('thinking');
      let answer;
      if (API.online() && Auth.isLoggedIn) {
        try { answer = (await API.reexplain(title, text)).text; }
        catch (_) { answer = 'Nu am putut genera acum. Încearcă din nou.'; }
      } else {
        answer = 'Conectează-te și pornește backend-ul AI pentru explicații personalizate.';
      }
      removePopover();
      const note = document.createElement('div');
      note.className = 'note';
      note.innerHTML = `<strong>💡 Altfel spus:</strong> ${answer}`;
      const body = document.getElementById('lessonBody');
      body.appendChild(note);
      note.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.setOrbState) { setOrbState('happy'); setTimeout(() => setOrbState('idle'), 2000); }
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (popover && e.target !== popover) removePopover();
  });

  function removePopover() { if (popover) { popover.remove(); popover = null; } }
}

// ---- EXAM SIMULATION ----------------------------------------------------
async function startExamSimulation(subject) {
  const done = (window.progress?.completedTopics) || [];
  const topics = subject.chapters.flatMap(ch => ch.topics)
    .filter(t => done.includes(t.id)).map(t => t.title);

  if (topics.length < 2) {
    alert('Termină cel puțin 2 teme înainte de simularea examenului.');
    return;
  }

  const view = document.getElementById('examView');
  const body = document.getElementById('examBody');
  body.innerHTML = '<p class="lead" style="text-align:center;padding:40px;">Wispucci pregătește examenul...</p>';
  showView('exam');
  if (window.setOrbState) setOrbState('thinking');

  let examData;
  if (API.online() && Auth.isLoggedIn) {
    try { examData = await API.generateExam(subject.name, topics, 10); }
    catch (_) { examData = buildLocalExam(subject, done); }
  } else {
    examData = buildLocalExam(subject, done);
  }
  renderExam(examData, subject);
}

function buildLocalExam(subject, doneIds) {
  // Fallback: pull all quiz questions from completed topics
  const questions = [];
  subject.chapters.flatMap(ch => ch.topics)
    .filter(t => doneIds.includes(t.id))
    .forEach(t => (t.lesson.quiz || []).forEach(q =>
      questions.push({ ...q, points: 1, topic: t.title })));
  // shuffle + cap at 10
  questions.sort(() => Math.random() - 0.5);
  return { questions: questions.slice(0, 10) };
}

function renderExam(examData, subject) {
  const body = document.getElementById('examBody');
  const questions = examData.questions || [];
  if (!questions.length) {
    body.innerHTML = '<p class="lead">Nu am putut genera întrebări. Termină mai multe teme.</p>';
    return;
  }
  let html = `<div class="exam-header"><h2 class="h1">Simulare examen · ${subject.name}</h2>
    <p class="lead">${questions.length} întrebări · format ANCE</p></div>`;
  questions.forEach((q, i) => {
    html += `
      <div class="quiz-block" data-exam-q="${i}">
        <p class="quiz-q">${i + 1}. ${q.q} <span style="color:var(--text-3);font-size:12px;">(${q.points || 1}p)</span></p>
        <div class="quiz-opts">
          ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-exam-opt data-qi="${i}" data-correct="${oi === q.correct ? '1' : '0'}">${opt}</button>`).join('')}
        </div>
      </div>`;
  });
  html += `<div class="lesson-next-wrap"><button class="btn btn-primary" id="examSubmit">Termină examenul</button>
    <div id="examResult" style="margin-top:20px;"></div></div>`;
  body.innerHTML = html;
  if (window.setOrbState) setOrbState('idle');

  const answers = {};
  body.querySelectorAll('[data-exam-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qi = btn.dataset.qi;
      const block = btn.closest('.quiz-block');
      block.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected-answer'));
      btn.classList.add('selected-answer');
      btn.style.borderColor = 'var(--accent)';
      answers[qi] = btn.dataset.correct === '1';
    });
  });

  document.getElementById('examSubmit').addEventListener('click', () => {
    const total = questions.reduce((s, q) => s + (q.points || 1), 0);
    let earned = 0;
    questions.forEach((q, i) => {
      const block = body.querySelector(`[data-exam-q="${i}"]`);
      block.querySelectorAll('.quiz-opt').forEach(o => {
        o.disabled = true;
        if (o.dataset.correct === '1') o.classList.add('correct');
        else if (o.classList.contains('selected-answer')) o.classList.add('wrong');
      });
      if (answers[i]) earned += (q.points || 1);
    });
    const grade = Math.round((earned / total) * 100) / 10; // 0-10 scale
    const result = document.getElementById('examResult');
    result.innerHTML = `<div class="note" style="text-align:center;">
      <p style="font-size:2rem;font-weight:700;color:var(--accent);">${grade.toFixed(1)} / 10</p>
      <p>${earned} din ${total} puncte</p></div>`;
    if (window.setOrbState) setOrbState(grade >= 5 ? 'celebrating' : 'sad');
    result.scrollIntoView({ behavior: 'smooth' });
  });
}

// Expose
window.WispucciFeatures = { buildWarmup, renderWarmup, wireWarmup, initReexplain, startExamSimulation, allTopicsFlat };

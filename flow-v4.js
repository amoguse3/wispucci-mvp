// Wispucci v4 — входной флоу: уровень → предмет → тема → урок.
// Гость: тизер (зацепить). После регистрации: диагностика скилла + адаптив (модель ученика).
// Опирается на ctree-v4.js (дерево), реюзает движок урока v3 для gimnaziu, backend для BAC.
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const FS='wispucci.v4';
function fdef(){return{level:null,signedUp:false,profile:null,diagnostic:null,mastery:{}};}
function fload(){try{return JSON.parse(localStorage.getItem(FS))||fdef();}catch(_){return fdef();}}
function fsave(){localStorage.setItem(FS,JSON.stringify(F));}
let F=fload();
let selLevel=null,selSubject=null,selTopic=null;
const hasAPI=typeof window.API!=='undefined';
const loggedIn=()=>hasAPI&&typeof Auth!=='undefined'&&Auth.isLoggedIn;

// ---- Экран 1: выбор уровня (Examen / BAC) ----
function renderLevels(){
  const el=$('#levelGrid');if(!el)return;
  el.innerHTML=LEVELS.map(l=>`<button class="level-card" data-level="${l.id}"><span class="level-short">${l.short}</span><span class="level-name">${l.name}</span><span class="level-blurb">${l.blurb}</span><span class="level-go">Alege →</span></button>`).join('');
  $$('.level-card').forEach(c=>c.addEventListener('click',()=>chooseLevel(c.dataset.level)));
}
function chooseLevel(id){selLevel=LEVELS.find(l=>l.id===id);F.level=id;fsave();renderSubjects();gov('subjects');}

// ---- Экран 2: предметы уровня ----
function renderSubjects(){
  const el=$('#subjectGrid');if(!el||!selLevel)return;
  $('#subjectsTitle').textContent=selLevel.name;
  el.innerHTML=selLevel.subjects.map(s=>`<button class="subj-card" data-sub="${s.id}"><span class="subj-sym">${s.symbol}</span><span class="subj-name">${s.name}</span>${s.profiles?'<span class="subj-tag">real / umanist</span>':''}${s.atlas?'<span class="subj-tag">atlas permis</span>':''}</button>`).join('');
  $$('.subj-card').forEach(c=>c.addEventListener('click',()=>chooseSubject(c.dataset.sub)));
}
function chooseSubject(id){selSubject=selLevel.subjects.find(s=>s.id===id);
  if(selSubject.profiles&&!F.profile){renderProfilePick();gov('profile');return;}
  renderTopics();gov('topics');}

// ---- Экран 2.5: выбор профиля (только где есть real/uman) ----
function renderProfilePick(){
  $('#profileStage').innerHTML=`<div class="prof-wrap"><h2>Ce profil ai?</h2><p>Contează: la real și umanist se dau examene diferite.</p><div class="prof-opts"><button class="prof-opt" data-prof="real"><b>Real</b><span>Matematică, științe exacte</span></button><button class="prof-opt" data-prof="uman"><b>Umanist</b><span>Litere, științe umane</span></button></div></div>`;
  $$('.prof-opt').forEach(b=>b.addEventListener('click',()=>{F.profile=b.dataset.prof;fsave();renderTopics();gov('topics');}));
}

// ---- Экран 3: темы предмета (из узлов графа) ----
function visibleTopics(){
  let t=selSubject.topics;
  if(selSubject.profiles&&F.profile){t=t.filter(x=>!x.profile||x.profile==='both'||x.profile===F.profile);}
  return t;
}
function renderTopics(){
  $('#topicsTitle').textContent=selSubject.name+(F.profile&&selSubject.profiles?` · ${F.profile}`:'');
  const mastery=F.mastery||{};
  $('#topicList').innerHTML=visibleTopics().map(t=>{
    const m=mastery[t.id];const badge=loggedIn()&&m!=null?`<span class="topic-mastery" style="--m:${Math.round(m*100)}">${Math.round(m*100)}%</span>`:'';
    return `<button class="topic-row" data-topic="${t.id}"><span class="topic-title">${t.title}</span>${badge}<span class="topic-go">→</span></button>`;}).join('');
  $$('.topic-row').forEach(r=>r.addEventListener('click',()=>chooseTopic(r.dataset.topic)));
}
function chooseTopic(id){selTopic=visibleTopics().find(t=>t.id===id);startLearning();}

// ---- Обучение: gimnaziu → готовый v3-урок; BAC → тизер (гость) / backend (залогиненный) ----
function startLearning(){
  // Готовый пошаговый урок из v3 (только gimnaziu, где есть v3-id)
  if(selLevel.id==='gimnaziu'&&selTopic.v3&&typeof window.startV3Topic==='function'){
    window.startV3Topic(selSubject.v3,selTopic.v3);return;
  }
  // BAC или тема без готового урока
  if(!loggedIn()){renderTeaser();gov('teaser');return;}
  renderBackendLesson();
}

// Гость: тизер, чтобы зацепить, потом CTA на регистрацию
function renderTeaser(){
  $('#teaserStage').innerHTML=`<div class="teaser"><span class="teaser-kicker">${selSubject.name}${F.profile?' · '+F.profile:''}</span><h2>${selTopic.title}</h2><p class="teaser-body">Aici începe de la bază: înțelegi conceptul, ghicești, apoi Wispucci îți arată de ce. După ce te înscrii, îți măsoară nivelul printr-un test scurt și îți construiește un plan doar pentru tine.</p><div class="teaser-preview">🔒 Lecția completă și planul personalizat se deblochează după înscriere (gratis).</div><button id="teaserSignup" class="btn-primary">Deblochează și află-ți nivelul</button></div>`;
  const b=$('#teaserSignup');if(b)b.addEventListener('click',()=>{if(typeof window.openSignup==='function'){window._afterSignupV4=afterSignupV4;window.openSignup();}});
}

// После регистрации: диагностика → план → урок
async function afterSignupV4(){F.signedUp=true;fsave();await runDiagnostic();}

// ---- Диагностика скилла (только после регистрации) ----
async function runDiagnostic(){
  gov('diag');
  const stage=$('#diagStage');
  stage.innerHTML=`<div class="diag-intro"><h2>Hai să văd unde ești</h2><p>Câteva întrebări scurte la ${selSubject.name}. Nu-i test cu notă — doar ca să-ți construiesc planul potrivit. Răspunde cinstit; dacă nu știi, spune.</p><button id="diagStart" class="btn-primary">Încep</button></div>`;
  $('#diagStart').addEventListener('click',startDiagItems);
}
async function startDiagItems(){
  const stage=$('#diagStage');
  let items=null;
  if(loggedIn()&&API.diagnosticStart){try{const r=await API.diagnosticStart(selSubject.id,F.profile);items=r&&r.items;}catch(_){}}
  if(!items){ // локальный fallback: пробные вопросы по темам предмета
    items=visibleTopics().slice(0,6).map(t=>({skill_id:t.id,title:t.title}));
  }
  let i=0;const answers=[];
  function showItem(){
    if(i>=items.length){finishDiag(answers);return;}
    const it=items[i];
    stage.innerHTML=`<div class="diag-item"><span class="diag-count">${i+1} / ${items.length}</span><h3>${it.title}</h3><p class="diag-q">Cât de sigur te simți la această temă?</p><div class="diag-scale"><button data-v="0">Habar n-am</button><button data-v="0.4">Am auzit</button><button data-v="0.7">Cam știu</button><button data-v="0.95">O stăpânesc</button></div></div>`;
    $$('.diag-scale button').forEach(b=>b.addEventListener('click',()=>{answers.push({skill_id:it.skill_id,confidence:+b.dataset.v});i++;showItem();}));
  }
  showItem();
}
async function finishDiag(answers){
  const mastery={};answers.forEach(a=>mastery[a.skill_id]=a.confidence);
  F.mastery=Object.assign(F.mastery||{},mastery);F.diagnostic={at:Date.now(),answers};fsave();
  if(loggedIn()&&API.diagnosticSubmit){try{await API.diagnosticSubmit(selSubject.id,F.profile,answers);}catch(_){}}
  // Слабейшие темы вперёд
  const weak=[...answers].sort((a,b)=>a.confidence-b.confidence).slice(0,3);
  const stage=$('#diagStage');
  stage.innerHTML=`<div class="diag-done"><h2>Gata. Am planul tău.</h2><p>Începem cu ce te clatină cel mai tare, apoi urcăm treptat.</p><ol class="diag-plan">${weak.map(w=>{const t=visibleTopics().find(x=>x.id===w.skill_id);return `<li>${t?t.title:w.skill_id}</li>`;}).join('')}</ol><button id="diagGo" class="btn-primary">Începe primul subiect</button></div>`;
  $('#diagGo').addEventListener('click',()=>{const first=weak[0];selTopic=visibleTopics().find(x=>x.id===first.skill_id)||selTopic;renderBackendLesson();});
}

// Залогиненный: урок с backend (заземлён на KB), адаптив по модели ученика
async function renderBackendLesson(){
  gov('blesson');
  const stage=$('#bLessonStage');
  stage.innerHTML=`<div class="bl-load">Pregătesc lecția pentru <b>${selTopic.title}</b>...</div>`;
  const level=(F.mastery&&F.mastery[selTopic.id]!=null)?F.mastery[selTopic.id]:0.3;
  let lesson=null;
  if(loggedIn()&&API.generateLesson){try{lesson=await API.generateLesson(selSubject.id,selTopic.title,level);}catch(_){}}
  if(lesson&&lesson.sections){
    stage.innerHTML=`<div class="bl"><span class="bl-kicker">${selSubject.name}${F.profile?' · '+F.profile:''}</span><h2>${selTopic.title}</h2>${lesson.sections.map(s=>`<div class="bl-sec"><h3>${s.title||''}</h3><div>${s.body||''}</div></div>`).join('')}<button id="blBack" class="btn-ghost">← Altă temă</button></div>`;
  }else{
    stage.innerHTML=`<div class="bl"><span class="bl-kicker">${selSubject.name}${F.profile?' · '+F.profile:''}</span><h2>${selTopic.title}</h2><p class="bl-fallback">Lecția interactivă pentru această temă se generează pe server (pornește backend-ul). Conținutul e deja în baza de cunoștințe, verificat pe baremele ANCE.</p><button id="blBack" class="btn-ghost">← Altă temă</button></div>`;
  }
  const b=$('#blBack');if(b)b.addEventListener('click',()=>{renderTopics();gov('topics');});
}

// ---- Навигация между v4-экранами ----
function gov(screen){$$('.v4-screen').forEach(s=>s.classList.toggle('is-active',s.dataset.v4===screen));}
$$('[data-v4back]').forEach(b=>b.addEventListener('click',()=>{const to=b.getAttribute('data-v4back');gov(to);if(to==='subjects')renderSubjects();if(to==='levels')renderLevels();if(to==='topics')renderTopics();}));

// Хук: если v3-signup завершён, дёрнуть v4-диагностику
window.v4AfterSignup=function(){if(window._afterSignupV4){const f=window._afterSignupV4;window._afterSignupV4=null;f();}};

// ---- INIT ----
renderLevels();gov('levels');

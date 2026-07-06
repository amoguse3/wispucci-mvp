// Wispucci v4 — добавление диагностики к API-клиенту (модель ученика на backend).
// Подключать ПОСЛЕ api.js. Расширяет глобальный API новыми методами.
(function(){
  if(typeof window.API==='undefined')return;
  function af(path,opts){return (typeof apiFetch!=='undefined')?apiFetch(path,opts):fetch(path,opts).then(r=>r.json());}
  // Старт диагностики: backend отдаёт адаптивный набор итемов по графу предмета
  window.API.diagnosticStart=(subject,profile)=>af('/api/diagnostic/start',{method:'POST',body:JSON.stringify({subject,profile})});
  // Отправка ответов: backend обновляет StudentModel (BKT) и возвращает карту мастерства
  window.API.diagnosticSubmit=(subject,profile,answers)=>af('/api/diagnostic/submit',{method:'POST',body:JSON.stringify({subject,profile,answers})});
  // Карта мастерства ученика по предмету
  window.API.mastery=(subject)=>af('/api/diagnostic/mastery?subject='+encodeURIComponent(subject));
})();

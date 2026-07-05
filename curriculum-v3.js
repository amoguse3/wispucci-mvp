// Wispucci v3 curriculum. Step types encode learning science (see docs/PEDAGOGY.md):
// pretest | concept | worked | completion | quiz | elaborate
const CURRICULUM=[
 {id:'math',name:'Matematică',symbol:'M',meta:'120 min · 4 domenii',preview:'Numere · Algebră · Funcții · Geometrie',topics:[
  {id:'m1',title:'Numere reale și radicali',steps:[
   {type:'pretest',title:'Ghici întâi',q:'Cât crezi că e √72 în forma cea mai simplă?',opts:['8,4...','6√2','72√','36√2'],correct:1,exp:'Nu-i nimic dacă n-ai nimerit. Acum că ai încercat, hai să vezi de ce e 6√2.'},
   {type:'concept',kicker:'Concept',title:'Ce sunt radicalii',body:'<p>Un radical <span class="hl">√a</span> întreabă: ce număr ridicat la pătrat dă a? Trei reguli îți rezolvă aproape tot:</p><span class="step-formula">√(a·b) = √a · √b<br>√(a²) = |a|<br>(√a)² = a</span>',speak:'Prima regulă e vedeta: spargi radicalul în bucăți ca să scoți pătratele perfecte.'},
   {type:'worked',kicker:'Exemplu rezolvat',title:'Cum simplifici √72',body:'<p>Urmărește pas cu pas, nu trebuie să faci nimic încă:</p><span class="step-formula">√72 = √(36 × 2)   ← cauți pătrat perfect<br>= √36 × √2       ← spargi<br>= 6√2            ← √36 = 6 iese</span>',speak:'Vezi? Găsești cel mai mare pătrat perfect ascuns înăuntru. Aici 36.'},
   {type:'completion',kicker:'Completează',title:'Acum cu ajutor',body:'<p>Simplifică <span class="hl">√50</span>. Ți-am lăsat pașii, tu pui numerele:</p><span class="step-formula">√50 = √(<input class="fill-input" data-ans="25"> × 2) = <input class="fill-input" data-ans="5">√2</span>',hint:'Ce pătrat perfect se ascunde în 50? (25...)',speak:'Gândește: care pătrat perfect intră în 50?'},
   {type:'quiz',kicker:'Singur acum',title:'Fără ajutor',q:'Simplifică √48',opts:['4√3','6√2','2√12','3√4'],correct:0,exp:'√48 = √(16 × 3) = 4√3. 16 e cel mai mare pătrat perfect din 48.'},
   {type:'elaborate',title:'De ce funcționează?',q:'De ce scoatem doar pătrate perfecte de sub radical, nu orice număr?',reveal:'Pentru că √(a²) = a exact. Doar pătratele perfecte "ies întregi". Un număr care nu e pătrat perfect rămâne sub radical fiindcă rădăcina lui nu e un întreg.',speak:'Întrebarea "de ce" îți leagă cunoștințele. Gândește-te, apoi verifică.'}
  ]},
  {id:'m2',title:'Ecuații de gradul II',steps:[
   {type:'pretest',title:'Ghici întâi',q:'Câte soluții reale crezi că are x² + 2x + 5 = 0?',opts:['2','1','0','3'],correct:2,exp:'Surprinzător, zero. Acum hai să vezi ce e discriminantul.'},
   {type:'concept',kicker:'Concept',title:'Discriminantul',body:'<p>Orice <span class="hl">ax² + bx + c = 0</span> se rezolvă cu discriminantul, care îți spune câte soluții ai ÎNAINTE să calculezi:</p><span class="step-formula">Δ = b² − 4ac</span>',speak:'Discriminantul e ca un far: îți arată din start dacă merită să calculezi.'},
   {type:'worked',kicker:'Exemplu rezolvat',title:'De ce x²+2x+5 n-are soluții',body:'<span class="step-formula">a=1, b=2, c=5<br>Δ = 2² − 4·1·5 = 4 − 20 = −16<br>Δ < 0 → nicio soluție reală</span>',speak:'Δ negativ înseamnă că parabola nu atinge deloc axa.'},
   {type:'quiz',kicker:'Singur acum',title:'Verifică',q:'Câte soluții are x² − 6x + 9 = 0?',opts:['0','1 (dublă)','2','Infinit'],correct:1,exp:'Δ = 36 − 36 = 0. Când Δ=0, ai o soluție dublă (x=3).'}
  ]},
  {id:'m3',title:'Funcția pătratică',steps:[
   {type:'concept',kicker:'Concept',title:'Parabola și vârful',body:'<p>Graficul lui <span class="hl">f(x) = ax² + bx + c</span> e o parabolă. Vârful e punctul cheie:</p><span class="step-formula">xᵥ = −b / 2a</span>',speak:'Dacă a e pozitiv, parabola zâmbește (minim jos). Dacă e negativ, e tristă (maxim sus).'},
   {type:'quiz',kicker:'Verifică',title:'Vârful',q:'Vârful parabolei y = x² − 4x + 3 are abscisa:',opts:['2','−2','4','3'],correct:0,exp:'xᵥ = −(−4)/(2·1) = 2.'}
  ]},
  {id:'m4',title:'Teorema lui Pitagora',steps:[
   {type:'concept',kicker:'Concept',title:'Relația din triunghiul dreptunghic',body:'<p>În orice triunghi dreptunghic:</p><span class="step-formula">a² + b² = c²</span><p><span class="hl">c</span> e ipotenuza, opusă unghiului drept, mereu cea mai lungă.</p>',speak:'Ipotenuza e mereu cea mai lungă. Nu o confunda cu catetele.'},
   {type:'quiz',kicker:'Verifică',title:'Calcul',q:'Catetele 6 și 8. Ipotenuza:',opts:['10','14','12','√48'],correct:0,exp:'6² + 8² = 100, √100 = 10.'}
  ]}
 ]},
 {id:'hist',name:'Istoria românilor',symbol:'H',meta:'120 min · Antichitate → azi',preview:'Formare · Evul Mediu · Sec. XX',topics:[
  {id:'h1',title:'Formarea poporului român',steps:[
   {type:'pretest',title:'Ghici întâi',q:'În ce an crezi că a cucerit Traian Dacia?',opts:['106 d.Hr.','271 d.Hr.','86 î.Hr.','330 d.Hr.'],correct:0,exp:'Exact 106 d.Hr. Hai să vezi ce a urmat.'},
   {type:'concept',kicker:'Context',title:'Romanizarea Daciei',body:'<p>Poporul român s-a format prin <span class="hl">romanizarea dacilor</span> după cucerirea romană din <span class="hl">106 d.Hr.</span></p>',speak:'106 d.Hr. e o dată de aur. Traian cucerește Dacia.'},
   {type:'elaborate',title:'De ce contează?',q:'De ce e româna singura limbă latină din estul Europei?',reveal:'Pentru că romanizarea Daciei a lăsat un fond latin puternic (80% din vocabular), care a supraviețuit chiar înconjurat de popoare slave.',speak:'Gândește-te la vecinii Moldovei. Toți slavi. Doar noi latini. De ce oare?'}
  ]},
  {id:'h2',title:'Unirea Principatelor (1859)',steps:[
   {type:'pretest',title:'Ghici întâi',q:'Cum crezi că s-a realizat Unirea din 1859?',opts:['Prin război','Aceeași persoană aleasă domn de două ori','Prin referendum','Decret regal'],correct:1,exp:'Da, un truc genial: Cuza ales în ambele principate.'},
   {type:'concept',kicker:'Eveniment',title:'Dubla alegere a lui Cuza',body:'<p>La <span class="hl">24 ianuarie 1859</span>, Alexandru Ioan Cuza a fost ales domn în ambele principate.</p>',speak:'Trucul: același om ales de două ori. Deștept, nu?'},
   {type:'quiz',kicker:'Verifică',title:'Data',q:'Unirea Principatelor s-a realizat la:',opts:['24 ianuarie 1859','1 decembrie 1918','9 mai 1877','27 martie 1918'],correct:0,exp:'24 ianuarie 1859, dubla alegere a lui Cuza.'}
  ]},
  {id:'h3',title:'Independența R. Moldova',steps:[
   {type:'concept',kicker:'Eveniment',title:'27 august 1991',body:'<p>Pe fondul destrămării URSS, Republica Moldova își proclamă <span class="hl">independența la 27 august 1991</span>.</p>',speak:'27 august 1991. E sărbătoare națională azi.'},
   {type:'quiz',kicker:'Verifică',title:'Data',q:'Când a fost proclamată independența R. Moldova?',opts:['27 august 1991','23 iunie 1990','25 decembrie 1991','1 ianuarie 1992'],correct:0,exp:'27 august 1991.'}
  ]}
 ]},
 {id:'rom',name:'Limba română',symbol:'A',meta:'120 min · Gramatică & literatură',preview:'Fonetică · Morfologie · Sintaxă',topics:[
  {id:'r1',title:'Diftong, triftong, hiat',steps:[
   {type:'concept',kicker:'Concept',title:'Vocalele în silabe',body:'<p><span class="hl">Diftong</span>: două vocale, aceeași silabă. <span class="hl">Triftong</span>: trei. <span class="hl">Hiat</span>: vocale alăturate, dar în silabe diferite.</p>',speak:'Hiatul e capcana clasică: vocalele stau lângă, dar se despart. Ex: po-e-zi-e.'},
   {type:'quiz',kicker:'Verifică',title:'Numără silabele',q:'Câte silabe are "extraordinar"?',opts:['5','6','4','7'],correct:0,exp:'ex-tra-or-di-nar = 5 silabe.'}
  ]},
  {id:'r2',title:'Părțile de propoziție',steps:[
   {type:'concept',kicker:'Concept',title:'Principale și secundare',body:'<p><span class="hl">Subiectul</span> (cine?) și <span class="hl">predicatul</span> (ce face?) sunt principale. Complementul și atributul sunt secundare.</p>',speak:'Găsești mereu predicatul primul, apoi întrebi de la el cine face acțiunea.'},
   {type:'quiz',kicker:'Verifică',title:'Analiză',q:'În "Maria citește o carte", "o carte" este:',opts:['complement direct','subiect','atribut','complement indirect'],correct:0,exp:'Citește ce? o carte, deci complement direct.'}
  ]}
 ]}
];

// Wispucci — единое дерево данных: уровень → предмет → тема, выведено из графов знаний.
// gimnaziu-темы мат/ист/ром имеют готовые пошаговые уроки (steps). BAC-темы — узлы графа,
// урок генерит backend по KB; гость видит тизер. profile: real/uman/both.
const STEP_LESSONS = {
  m1:[
    {type:'pretest',title:'Ghici întâi',q:'Cât crezi că e √72 în forma cea mai simplă?',opts:['8,4...','6√2','72√','36√2'],correct:1,exp:'Nu-i nimic dacă n-ai nimerit. Acum hai să vezi de ce e 6√2.'},
    {type:'concept',kicker:'Concept',title:'Ce sunt radicalii',body:'Un radical √a întreabă: ce număr ridicat la pătrat dă a? Trei reguli îți rezolvă aproape tot: √(a·b)=√a·√b, √(a²)=|a|, (√a)²=a.',speak:'Prima regulă e vedeta: spargi radicalul în bucăți ca să scoți pătratele perfecte.'},
    {type:'worked',kicker:'Exemplu rezolvat',title:'Cum simplifici √72',body:'√72 = √(36×2) = √36·√2 = 6√2. Cauți cel mai mare pătrat perfect ascuns înăuntru — aici 36.',speak:'Vezi? Găsești cel mai mare pătrat perfect ascuns înăuntru.'},
    {type:'completion',kicker:'Completează',title:'Acum cu ajutor',body:'Simplifică √50 = √(__×2) = __√2',blanks:['25','5'],hint:'Ce pătrat perfect se ascunde în 50?',speak:'Gândește: care pătrat perfect intră în 50?'},
    {type:'quiz',kicker:'Singur acum',title:'Fără ajutor',q:'Simplifică √48',opts:['4√3','6√2','2√12','3√4'],correct:0,exp:'√48=√(16×3)=4√3. 16 e cel mai mare pătrat perfect din 48.'},
    {type:'elaborate',title:'De ce funcționează?',q:'De ce scoatem doar pătrate perfecte de sub radical?',reveal:'Pentru că √(a²)=a exact. Doar pătratele perfecte "ies întregi".',speak:'Întrebarea "de ce" îți leagă cunoștințele.'}
  ],
  m2:[
    {type:'pretest',title:'Ghici întâi',q:'Câte soluții reale are x²+2x+5=0?',opts:['2','1','0','3'],correct:2,exp:'Surprinzător, zero. Hai să vezi ce e discriminantul.'},
    {type:'concept',kicker:'Concept',title:'Discriminantul',body:'Orice ax²+bx+c=0 se rezolvă cu Δ=b²−4ac, care îți spune câte soluții ai ÎNAINTE să calculezi.',speak:'Discriminantul e ca un far: îți arată din start dacă merită să calculezi.'},
    {type:'worked',kicker:'Exemplu rezolvat',title:'De ce x²+2x+5 n-are soluții',body:'a=1,b=2,c=5 → Δ=4−20=−16. Δ<0 → nicio soluție reală.',speak:'Δ negativ înseamnă că parabola nu atinge deloc axa.'},
    {type:'quiz',kicker:'Singur acum',title:'Verifică',q:'Câte soluții are x²−6x+9=0?',opts:['0','1 (dublă)','2','Infinit'],correct:1,exp:'Δ=36−36=0. Când Δ=0, o soluție dublă (x=3).'}
  ],
  m3:[
    {type:'concept',kicker:'Concept',title:'Parabola și vârful',body:'Graficul lui f(x)=ax²+bx+c e o parabolă. Vârful: xᵥ=−b/2a.',speak:'a pozitiv → parabola zâmbește (minim). a negativ → e tristă (maxim).'},
    {type:'quiz',kicker:'Verifică',title:'Vârful',q:'Vârful parabolei y=x²−4x+3 are abscisa:',opts:['2','−2','4','3'],correct:0,exp:'xᵥ=−(−4)/(2·1)=2.'}
  ],
  m4:[
    {type:'concept',kicker:'Concept',title:'Teorema lui Pitagora',body:'În orice triunghi dreptunghic: a²+b²=c². c e ipotenuza, mereu cea mai lungă.',speak:'Ipotenuza e mereu cea mai lungă. Nu o confunda cu catetele.'},
    {type:'quiz',kicker:'Verifică',title:'Calcul',q:'Catetele 6 și 8. Ipotenuza:',opts:['10','14','12','√48'],correct:0,exp:'6²+8²=100, √100=10.'}
  ],
  h1:[
    {type:'pretest',title:'Ghici întâi',q:'În ce an a cucerit Traian Dacia?',opts:['106 d.Hr.','271 d.Hr.','86 î.Hr.','330 d.Hr.'],correct:0,exp:'Exact 106 d.Hr. Hai să vezi ce a urmat.'},
    {type:'concept',kicker:'Context',title:'Romanizarea Daciei',body:'Poporul român s-a format prin romanizarea dacilor după cucerirea romană din 106 d.Hr.',speak:'106 d.Hr. e o dată de aur. Traian cucerește Dacia.'},
    {type:'elaborate',title:'De ce contează?',q:'De ce e româna singura limbă latină din estul Europei?',reveal:'Romanizarea Daciei a lăsat un fond latin puternic (80% din vocabular), care a supraviețuit înconjurat de popoare slave.',speak:'Gândește-te la vecini. Toți slavi. Doar noi latini.'}
  ],
  h2:[
    {type:'pretest',title:'Ghici întâi',q:'Cum s-a realizat Unirea din 1859?',opts:['Prin război','Aceeași persoană aleasă domn de două ori','Prin referendum','Decret regal'],correct:1,exp:'Da, un truc genial: Cuza ales în ambele principate.'},
    {type:'concept',kicker:'Eveniment',title:'Dubla alegere a lui Cuza',body:'La 24 ianuarie 1859, Alexandru Ioan Cuza a fost ales domn în ambele principate.',speak:'Trucul: același om ales de două ori.'},
    {type:'quiz',kicker:'Verifică',title:'Data',q:'Unirea Principatelor s-a realizat la:',opts:['24 ianuarie 1859','1 decembrie 1918','9 mai 1877','27 martie 1918'],correct:0,exp:'24 ianuarie 1859, dubla alegere a lui Cuza.'}
  ],
  h3:[
    {type:'concept',kicker:'Eveniment',title:'27 august 1991',body:'Pe fondul destrămării URSS, Republica Moldova își proclamă independența la 27 august 1991.',speak:'27 august 1991. E sărbătoare națională azi.'},
    {type:'quiz',kicker:'Verifică',title:'Data',q:'Când a fost proclamată independența R. Moldova?',opts:['27 august 1991','23 iunie 1990','25 decembrie 1991','1 ianuarie 1992'],correct:0,exp:'27 august 1991.'}
  ],
  r1:[
    {type:'concept',kicker:'Concept',title:'Vocalele în silabe',body:'Diftong: două vocale, aceeași silabă. Triftong: trei. Hiat: vocale alăturate, dar în silabe diferite.',speak:'Hiatul e capcana: vocalele stau lângă, dar se despart. Ex: po-e-zi-e.'},
    {type:'quiz',kicker:'Verifică',title:'Numără silabele',q:'Câte silabe are "extraordinar"?',opts:['5','6','4','7'],correct:0,exp:'ex-tra-or-di-nar = 5 silabe.'}
  ],
  r2:[
    {type:'concept',kicker:'Concept',title:'Părți principale și secundare',body:'Subiectul (cine?) și predicatul (ce face?) sunt principale. Complementul și atributul sunt secundare.',speak:'Găsești mereu predicatul primul, apoi întrebi cine face acțiunea.'},
    {type:'quiz',kicker:'Verifică',title:'Analiză',q:'În "Maria citește o carte", "o carte" este:',opts:['complement direct','subiect','atribut','complement indirect'],correct:0,exp:'Citește ce? o carte → complement direct.'}
  ]
};

const LEVELS = [
  {
    id:'gimnaziu', name:'Examenul de gimnaziu', short:'Examen · clasa 9',
    blurb:'Matematică, Istorie, Limba română — conform programei ANCE.',
    subjects:[
      {id:'math',name:'Matematică',symbol:'M',profiles:false,topics:[
        {id:'m1',title:'Numere reale și radicali'},{id:'m2',title:'Ecuații de gradul II'},
        {id:'m3',title:'Funcția pătratică'},{id:'m4',title:'Teorema lui Pitagora'}]},
      {id:'hist',name:'Istoria românilor',symbol:'H',profiles:false,topics:[
        {id:'h1',title:'Formarea poporului român'},{id:'h2',title:'Unirea Principatelor (1859)'},
        {id:'h3',title:'Independența R. Moldova'}]},
      {id:'rom',name:'Limba română',symbol:'A',profiles:false,topics:[
        {id:'r1',title:'Diftong, triftong, hiat'},{id:'r2',title:'Părțile de propoziție'}]}
    ]
  },
  {
    id:'bac', name:'Bacalaureat', short:'BAC · clasele 10-12',
    blurb:'Toate materiile BAC. Alege profilul (real / umanist) unde contează.',
    subjects:[
      {id:'math',name:'Matematică',symbol:'M',profiles:true,backend:true,topics:[
        {id:'logaritmi',title:'Logaritmi',profile:'both'},{id:'numere_complexe',title:'Numere complexe',profile:'both'},
        {id:'trigonometrie',title:'Trigonometrie',profile:'real'},{id:'derivate',title:'Derivate și extreme',profile:'real'},
        {id:'integrale',title:'Integrale (Newton-Leibniz)',profile:'real'},{id:'statistica_mediana',title:'Statistică și mediană',profile:'uman'},
        {id:'geometrie_spatiala_liceu',title:'Corpuri geometrice — volume',profile:'both'}]},
      {id:'istorie',name:'Istoria',symbol:'H',profiles:true,backend:true,topics:[
        {id:'marea_unire_1918_bac',title:'Marea Unire 1918',profile:'both'},{id:'unirea_1859',title:'Unirea Principatelor 1859',profile:'both'},
        {id:'regimuri_totalitare_bac',title:'Regimuri totalitare',profile:'both'},{id:'independenta_rm_bac',title:'Independența RM 1991',profile:'both'},
        {id:'eseu_istoric',title:'Eseul istoric (35p)',profile:'both'}]},
      {id:'bio',name:'Biologie',symbol:'B',profiles:true,backend:true,topics:[
        {id:'sisteme_organe_om',title:'Sistemele de organe',profile:'both'},{id:'genetica_probleme',title:'Probleme de genetică',profile:'both'},
        {id:'molecular_adn',title:'Bazele moleculare (ADN)',profile:'real'},{id:'ecologie',title:'Ecologie',profile:'both'}]},
      {id:'chimie',name:'Chimie',symbol:'C',profiles:true,backend:true,topics:[
        {id:'calcule_stoechiometrie',title:'Calcule stoechiometrice',profile:'both'},{id:'identificare_ioni',title:'Identificarea ionilor',profile:'both'},
        {id:'ovr_bilant',title:'Redox — bilanț electronic',profile:'real'},{id:'organica_reactii',title:'Organică — reacții',profile:'both'}]},
      {id:'fizica',name:'Fizică',symbol:'F',profiles:true,backend:true,topics:[
        {id:'mecanica_cinematica',title:'Mecanică',profile:'both'},{id:'termodinamica',title:'Termodinamică',profile:'both'},
        {id:'curent_ohm',title:'Curent continuu',profile:'both'},{id:'efect_fotoelectric',title:'Efect fotoelectric',profile:'both'}]},
      {id:'geografie',name:'Geografie',symbol:'G',profiles:false,backend:true,atlas:true,topics:[
        {id:'calcule_geografice',title:'Calcule — întindere, fuse orare',profile:'both'},{id:'demografie',title:'Demografie — bilanț natural',profile:'both'},
        {id:'lucru_cu_atlasul',title:'Lucru cu atlasul',profile:'both'}]},
      {id:'informatica',name:'Informatică (C++)',symbol:'I',profiles:true,backend:true,topics:[
        {id:'sisteme_numeratie',title:'Sisteme de numerație',profile:'both'},{id:'trasare_cod',title:'Trasarea programelor',profile:'both'},
        {id:'tablouri',title:'Tablouri și matrici',profile:'both'},{id:'metode_numerice',title:'Metode numerice',profile:'real'}]},
      {id:'limbi_straine',name:'Limba străină',symbol:'L',profiles:false,backend:true,topics:[
        {id:'comprehensiune_l2',title:'Comprehensiunea textului',profile:'both'},{id:'eseu_l2',title:'Eseul (180-200 cuvinte)',profile:'both'}]},
      {id:'romana',name:'Limba română',symbol:'A',profiles:true,backend:true,topics:[
        {id:'figuri_de_stil',title:'Figuri de stil',profile:'both'},{id:'motiv_literar_comparat',title:'Motiv literar comparat',profile:'both'},
        {id:'eseu_argumentativ',title:'Eseul (24p)',profile:'both'},{id:'redactare',title:'Redactarea (20p)',profile:'both'}]}
    ]
  }
];

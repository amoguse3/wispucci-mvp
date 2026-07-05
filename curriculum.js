// Wispucci v2 curriculum — learning-science structure
// Each topic has: hook, worked example, faded practice, retrieval quizzes at 3 difficulty tiers.
// Tier is used by spaced repetition: first pass = easy, returns get harder (desirable difficulties).
// Tone: conversational friend (personalization effect, Mayer 2004).

const CURRICULUM = [
  {
    id:'math', name:'Matematica', symbol:'M', meta:'120 min - 4 domenii',
    preview:'Numere - Algebra - Functii - Geometrie',
    topics:[
      { id:'m1', title:'Numere reale si radicali',
        hook:'Radicalii sperie multa lume, dar sunt doar puteri intoarse pe dos. Iti arat trucul si gata.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Ce sunt numerele reale', body:'<p>Multimea <span class="hl">R</span> le contine pe toate: rationale (fractii) si <span class="hl">irationale</span> ca radical din 2 sau pi. La examen te vei intalni mai ales cu radicali.</p>', speak:'Nu invata pe de rost. Intelege ca radicalul e opusul ridicarii la patrat.'},
          {type:'example', kicker:'Exemplu rezolvat', title:'Cum scoti de sub radical', body:'<p>Hai sa vedem impreuna. Vrei radical din 72. Cauti un patrat perfect ascuns inauntru:</p><span class="step-formula">radical(72) = radical(36 x 2) = 6 x radical(2)</span><p>36 e patrat perfect (6 la patrat), deci iese ca 6. Radical din 2 ramane inauntru. Simplu, nu?</p>', speak:'Urmareste fiecare pas. Nu trece mai departe pana nu vezi de ce 36 iese ca 6.'},
          {type:'faded', kicker:'Acum tu, cu ajutor', title:'Simplifica radical(50)', body:'<p>Fa la fel ca in exemplu. Ce patrat perfect se ascunde in 50?</p><p class="step-hint">Indiciu: 50 = 25 x 2, iar 25 = 5 la patrat.</p>', q:'Cat este radical(50)?', opts:['5 x radical(2)','25 x radical(2)','2 x radical(5)','radical(25)'], correct:0, exp:'radical(50) = radical(25 x 2) = 5 x radical(2). Ai prins tiparul.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor acum', q:'Simplifica radical(48)', opts:['4 x radical(3)','6 x radical(2)','2 x radical(12)','3 x radical(4)'], correct:0, exp:'radical(48) = radical(16 x 3) = 4 x radical(3).'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Combina doi radicali', q:'radical(8) + radical(18) = ?', opts:['5 x radical(2)','radical(26)','2 x radical(13)','7 x radical(2)'], correct:0, exp:'radical(8)=2rad2, radical(18)=3rad2, deci 2rad2+3rad2 = 5 x radical(2).'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Rationalizare', q:'Adu la forma simpla: 6 / radical(2)', opts:['3 x radical(2)','6 x radical(2)','3','radical(6)'], correct:0, exp:'6/rad2 = 6 x rad2 / 2 = 3 x radical(2). Inmultesti sus si jos cu rad2.'}
        ]},
      { id:'m2', title:'Ecuatii de gradul II',
        hook:'O ecuatie cu x la patrat pare grea, dar ai o singura formula magica: discriminantul. Iti spune tot.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Discriminantul decide totul', body:'<p>Orice ecuatie <span class="hl">ax patrat + bx + c = 0</span> se rezolva pornind de la:</p><span class="step-formula">delta = b patrat - 4ac</span><p>Delta iti spune cate solutii ai <span class="hl">inainte</span> sa calculezi ceva. Genial pentru economie de timp.</p>', speak:'Calculeaza mereu delta primul. Iti arata daca merita sa continui.'},
          {type:'example', kicker:'Exemplu rezolvat', title:'Cele trei cazuri', body:'<p>Uite regula, pe scurt:</p><p>Daca <span class="hl">delta > 0</span>: doua solutii. Daca <span class="hl">delta = 0</span>: una singura (dubla). Daca <span class="hl">delta < 0</span>: niciuna reala.</p><span class="step-formula">x patrat - 5x + 6 = 0<br>delta = 25 - 24 = 1 > 0<br>doua solutii: x = 2 si x = 3</span>', speak:'Semnul lui delta e tot ce conteaza pentru numarul de solutii.'},
          {type:'faded', kicker:'Acum tu, cu ajutor', title:'Cate solutii?', body:'<p>Calculeaza delta pentru x patrat + 2x + 5 = 0.</p><p class="step-hint">Indiciu: a=1, b=2, c=5. delta = 4 - 20.</p>', q:'Cate solutii reale are?', opts:['0','1','2','infinit'], correct:0, exp:'delta = 4 - 20 = -16 < 0, deci nicio solutie reala.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Suma solutiilor', q:'Pentru x patrat - 5x + 6 = 0, suma solutiilor este:', opts:['5','6','-5','11'], correct:0, exp:'Viete: x1 + x2 = -b/a = 5.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Produsul solutiilor', q:'Pentru x patrat - 7x + 10 = 0, produsul solutiilor este:', opts:['10','7','-10','17'], correct:0, exp:'Viete: x1 x x2 = c/a = 10.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Parametru', q:'Pentru ce m are x patrat + mx + 9 = 0 o solutie dubla (m>0)?', opts:['6','9','3','18'], correct:0, exp:'Solutie dubla: delta=0. m patrat - 36 = 0, deci m = 6 (pozitiv).'}
        ]},
      { id:'m3', title:'Functia patratica',
        hook:'Parabola e doar un zambet sau o incruntare. Iti arat cum sa citesti varful ei dintr-o privire.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Varful parabolei', body:'<p>Graficul lui <span class="hl">f(x) = ax patrat + bx + c</span> e o parabola. Punctul cheie e varful:</p><span class="step-formula">x_varf = -b / 2a</span>', speak:'Daca a e pozitiv, parabola zambeste, varful e jos (minim). Daca a e negativ, e trista, varful e sus.'},
          {type:'example', kicker:'Exemplu rezolvat', title:'Gasesti varful', body:'<p>Pentru y = x patrat - 4x + 3: a=1, b=-4.</p><span class="step-formula">x_varf = -(-4) / 2 = 2</span><p>Deci varful e la x = 2. Il inlocuiesti si afli si y.</p>', speak:'Formula e mereu aceeasi. Doar identifica corect a si b.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'Varful parabolei y = x patrat - 6x + 5 are abscisa:', opts:['3','-3','6','5'], correct:0, exp:'x_varf = -(-6)/2 = 3.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Cu a diferit de 1', q:'Varful parabolei y = 2x patrat - 8x + 1 are abscisa:', opts:['2','4','-2','8'], correct:0, exp:'x_varf = -(-8)/(2x2) = 8/4 = 2.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Minim sau maxim?', q:'Functia y = -x patrat + 4x are un:', opts:['maxim la x=2','minim la x=2','maxim la x=4','minim la x=0'], correct:0, exp:'a=-1 (negativ) deci parabola e trista, are maxim. x_varf = -4/-2 = 2.'}
        ]},
      { id:'m4', title:'Teorema lui Pitagora',
        hook:'Cea mai faimoasa formula din matematica. O stii deja, hai sa o folosim ca la examen.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Relatia din triunghiul dreptunghic', body:'<p>In orice triunghi dreptunghic:</p><span class="step-formula">a patrat + b patrat = c patrat</span><p><span class="hl">c</span> e ipotenuza, latura cea mai lunga, opusa unghiului drept.</p>', speak:'Ipotenuza e mereu cea mai lunga. Nu o confunda cu catetele.'},
          {type:'example', kicker:'Exemplu rezolvat', title:'Afli ipotenuza', body:'<p>Catetele 3 si 4:</p><span class="step-formula">c patrat = 9 + 16 = 25<br>c = radical(25) = 5</span>', speak:'Triunghiul 3-4-5 e clasic. Merita sa il tii minte.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'Catetele 6 si 8. Ipotenuza:', opts:['10','14','12','radical(48)'], correct:0, exp:'36 + 64 = 100, radical(100) = 10.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Afli cateta', q:'Ipotenuza 13, o cateta 5. Cealalta cateta:', opts:['12','8','9','radical(18)'], correct:0, exp:'169 - 25 = 144, radical(144) = 12.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Aplicat', q:'Diagonala unui patrat cu latura 4 este:', opts:['4 x radical(2)','8','4','16'], correct:0, exp:'Diagonala = radical(16+16) = radical(32) = 4 x radical(2).'}
        ]}
    ]},
  {
    id:'hist', name:'Istoria romanilor', symbol:'H', meta:'120 min - Antichitate pana azi',
    preview:'Formare - Ev Mediu - Sec. XX',
    topics:[
      { id:'h1', title:'Formarea poporului roman',
        hook:'De ce vorbim o limba latina aici, in est? Povestea incepe cu o cucerire romana. Hai sa o derulam.',
        steps:[
          {type:'theory', kicker:'Context', title:'Romanizarea Daciei', body:'<p>Poporul roman s-a format prin <span class="hl">romanizarea dacilor</span> dupa cucerirea romana din <span class="hl">106 d.Hr.</span> Limba, obiceiurile, structura sociala, toate au devenit latine.</p>', speak:'106 d.Hr. e o data pe care trebuie sa o stii pe de rost. Traian cucereste Dacia.'},
          {type:'example', kicker:'Reper', title:'Cronologia pe scurt', body:'<p><span class="hl">106</span>: Traian cucereste Dacia. <span class="hl">271</span>: retragerea aureliana (armata pleaca, oamenii raman). Sinteza daco-romana continua secole.</p>', speak:'Retine cele doua date: 106 intrarea, 271 iesirea romanilor.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'In ce an a cucerit Traian Dacia?', opts:['106 d.Hr.','271 d.Hr.','86 i.Hr.','330 d.Hr.'], correct:0, exp:'Razboaiele dacice s-au incheiat in 106 d.Hr.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Retragerea', q:'In ce an a avut loc retragerea aureliana?', opts:['271','106','313','395'], correct:0, exp:'Imparatul Aurelian retrage administratia si armata in 271.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Argumentare', q:'Care e dovada principala a romanizarii?', opts:['limba romana, de origine latina','moneda de aur','religia greaca','alfabetul chirilic'], correct:0, exp:'Limba romana are fond latin, cea mai puternica dovada a romanizarii.'}
        ]},
      { id:'h2', title:'Unirea Principatelor (1859)',
        hook:'Cum unesti doua tari fara razboi? Cu un truc politic destept. Iti povestesc.',
        steps:[
          {type:'theory', kicker:'Eveniment', title:'Dubla alegere a lui Cuza', body:'<p>La <span class="hl">24 ianuarie 1859</span>, Alexandru Ioan Cuza a fost ales domn in ambele principate, Moldova si Tara Romaneasca. Asa s-a realizat Unirea.</p>', speak:'Trucul: acelasi om ales de doua ori. Simplu si genial.'},
          {type:'example', kicker:'Reforme', title:'Ce a schimbat Cuza', body:'<p>Dupa unire: <span class="hl">reforma agrara (1864)</span>, secularizarea averilor manastiresti (1863), invatamant gratuit si obligatoriu.</p>', speak:'Reformele lui Cuza au modernizat statul. Retine 1864 pentru reforma agrara.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'Unirea Principatelor s-a realizat la:', opts:['24 ianuarie 1859','1 decembrie 1918','9 mai 1877','27 martie 1918'], correct:0, exp:'24 ianuarie 1859, dubla alegere a lui Cuza.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Reforma', q:'In ce an a fost reforma agrara a lui Cuza?', opts:['1864','1859','1877','1848'], correct:0, exp:'Reforma agrara: 1864.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Context', q:'Ce eveniment a permis dubla alegere?', opts:['Congresul de la Paris (1856)','Marea Unire','razboiul de independenta','revolutia din 1848'], correct:0, exp:'Dupa Razboiul Crimeei, Congresul de la Paris a permis principatelor sa-si aleaga domnii.'}
        ]},
      { id:'h3', title:'Independenta R. Moldova',
        hook:'Cum a aparut tara in care traiesti? Pe fondul prabusirii unui imperiu urias. Hai sa vedem.',
        steps:[
          {type:'theory', kicker:'Eveniment', title:'27 august 1991', body:'<p>Pe fondul destramarii URSS, Republica Moldova isi proclama <span class="hl">independenta la 27 august 1991</span>.</p>', speak:'27 august 1991. Ziua Independentei, sarbatoare nationala azi.'},
          {type:'example', kicker:'Etape', title:'Drumul spre independenta', body:'<p><span class="hl">1989</span>: limba romana devine limba de stat, alfabet latin. <span class="hl">1990</span>: declaratia de suveranitate. <span class="hl">1991</span>: independenta.</p>', speak:'Trei pasi: 1989 limba, 1990 suveranitate, 1991 independenta.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'Cand a fost proclamata independenta R. Moldova?', opts:['27 august 1991','23 iunie 1990','25 decembrie 1991','1 ianuarie 1992'], correct:0, exp:'27 august 1991.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Limba', q:'In ce an a devenit romana limba de stat?', opts:['1989','1991','1990','1994'], correct:0, exp:'In 1989, cu revenirea la alfabetul latin.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Context', q:'Ce proces international a facilitat independenta?', opts:['destramarea URSS','caderea Zidului Berlinului','aderarea la UE','Razboiul Rece inceput'], correct:0, exp:'Destramarea URSS (1991) a permis independenta fostelor republici sovietice.'}
        ]}
    ]},
  {
    id:'rom', name:'Limba romana', symbol:'A', meta:'120 min - Gramatica si literatura',
    preview:'Fonetica - Morfologie - Sintaxa',
    topics:[
      { id:'r1', title:'Diftong, triftong, hiat',
        hook:'Trei cuvinte care suna a stiinta, dar sunt doar despre cum stau vocalele impreuna. Usor.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Vocalele in silabe', body:'<p><span class="hl">Diftong</span>: doua vocale, aceeasi silaba. <span class="hl">Triftong</span>: trei. <span class="hl">Hiat</span>: doua vocale alaturate, dar in silabe diferite.</p>', speak:'Hiatul e capcana: vocalele stau lipite dar se despart. Ex: po-e-zi-e.'},
          {type:'example', kicker:'Exemplu', title:'Le recunosti', body:'<p><span class="hl">seara</span>: diftong (ea intr-o silaba). <span class="hl">leoaica</span>: triftong (eoa). <span class="hl">alee</span>: hiat (a-le-e, e-urile se despart).</p>', speak:'Numara silabele cu voce tare. Asa vezi imediat unde se despart vocalele.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'Cate silabe are "extraordinar"?', opts:['5','6','4','7'], correct:0, exp:'ex-tra-or-di-nar = 5 silabe.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Identifica', q:'Cuvantul "poezie" contine:', opts:['un hiat','un diftong','un triftong','nimic special'], correct:0, exp:'po-e-zi-e: e-urile in silabe diferite, deci hiat.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Triftong', q:'Care cuvant contine triftong?', opts:['leoaica','seara','carte','masa'], correct:0, exp:'leoaica: le-oai-ca, grupul eoa e triftong.'}
        ]},
      { id:'r2', title:'Partile de propozitie',
        hook:'Ca sa analizezi orice propozitie, ai nevoie de o singura strategie: gaseste verbul primul. Iti arat.',
        steps:[
          {type:'theory', kicker:'Ideea', title:'Principale si secundare', body:'<p><span class="hl">Subiectul</span> (cine? ce?) si <span class="hl">predicatul</span> (ce face?) sunt principale. Complementul si atributul sunt secundare.</p>', speak:'Gasesti mereu predicatul primul, apoi intrebi de la el cine face actiunea.'},
          {type:'example', kicker:'Exemplu rezolvat', title:'Analiza pas cu pas', body:'<p>"Maria citeste o carte."</p><p>Predicat: <span class="hl">citeste</span>. Subiect: cine citeste? <span class="hl">Maria</span>. Citeste ce? <span class="hl">o carte</span> = complement direct.</p>', speak:'Intreaba de la verb. Cine? subiect. Ce/pe cine? complement direct.'},
          {type:'quiz', tier:1, kicker:'Verifica', title:'Fara ajutor', q:'In "Copilul deseneaza un soare", "un soare" este:', opts:['complement direct','subiect','atribut','predicat'], correct:0, exp:'Deseneaza ce? un soare, deci complement direct.'},
          {type:'quiz', tier:2, kicker:'Mai greu', title:'Atribut', q:'In "Cartea rosie e a mea", "rosie" este:', opts:['atribut','complement','subiect','predicat'], correct:0, exp:'Rosie determina substantivul carte (care carte?), deci atribut.'},
          {type:'quiz', tier:3, kicker:'Nivel examen', title:'Complement indirect', q:'In "I-am dat Mariei o carte", "Mariei" este:', opts:['complement indirect','complement direct','subiect','atribut'], correct:0, exp:'Am dat cui? Mariei, deci complement indirect.'}
        ]}
    ]}
];

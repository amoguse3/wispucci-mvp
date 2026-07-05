// ===========================================================================
// WISPUCCI MVP — Curriculum Data
// Based on Moldova National Exam Program (ANCE) for Grade 9
// Subjects: Matematica, Istoria romanilor si universala, Limba romana
// ===========================================================================

const CURRICULUM = {
  subjects: [
    {
      id: 'math',
      name: 'Matematică',
      icon: '∑',
      description: '120 min · Numere, Algebră, Geometrie, Funcții',
      chapters: [
        {
          id: 'math-1',
          name: 'Mulțimi numerice',
          topics: [
            {
              id: 'math-1-1',
              title: 'Numere naturale și operații',
              lesson: {
                content: `
                  <h2>Numere naturale: fundația matematicii</h2>
                  <p>Numerele naturale (ℕ = {0, 1, 2, 3, ...}) sunt primele numere pe care le-ai învățat. La examen, trebuie să știi să lucrezi rapid cu ele.</p>
                  <h3>Ce trebuie să știi</h3>
                  <p>Ordinea operațiilor: mai întâi parantezele, apoi puterile, înmulțirea/împărțirea, și la final adunarea/scăderea.</p>
                  <span class="formula">2 + 3 × 4² = 2 + 3 × 16 = 2 + 48 = 50</span>
                  <h3>Divizibilitate</h3>
                  <div class="note">
                    <strong>Cu 2:</strong> ultima cifră e pară<br>
                    <strong>Cu 3:</strong> suma cifrelor se divide cu 3<br>
                    <strong>Cu 5:</strong> ultima cifră e 0 sau 5<br>
                    <strong>Cu 9:</strong> suma cifrelor se divide cu 9<br>
                    <strong>Cu 10:</strong> ultima cifră e 0
                  </div>
                  <h3>C.M.M.D.C. și C.M.M.M.C.</h3>
                  <span class="formula">12 = 2² × 3 ; 18 = 2 × 3²<br>C.M.M.D.C.(12, 18) = 2 × 3 = 6<br>C.M.M.M.C.(12, 18) = 2² × 3² = 36</span>
                `,
                quiz: [
                  { q: 'Care este C.M.M.D.C.(24, 36)?', opts: ['6', '12', '4', '8'], correct: 1, explanation: '24 = 2³ × 3, 36 = 2² × 3². Factori comuni la puterea minimă: 2² × 3 = 12.' },
                  { q: 'Suma cifrelor numărului 7254 este:', opts: ['18', '16', '17', '19'], correct: 0, explanation: '7 + 2 + 5 + 4 = 18. Deci 7254 se divide cu 9.' }
                ]
              }
            },
            {
              id: 'math-1-2',
              title: 'Numere întregi (ℤ)',
              lesson: {
                content: `
                  <h2>Numere întregi: pozitive și negative</h2>
                  <p>Mulțimea ℤ include numerele negative, zero și numerele pozitive.</p>
                  <h3>Modulul</h3>
                  <span class="formula">|−7| = 7 ; |3| = 3 ; |0| = 0</span>
                  <h3>Reguli de semne</h3>
                  <div class="note">(+) × (+) = (+)<br>(−) × (−) = (+)<br>(+) × (−) = (−)<br>(−) × (+) = (−)</div>
                  <h3>Puteri cu exponent natural</h3>
                  <span class="formula">(−2)⁴ = 16 (exponent par → pozitiv)<br>(−2)³ = −8 (exponent impar → negativ)</span>
                `,
                quiz: [
                  { q: 'Cât este (−3)² + |−5|?', opts: ['14', '4', '−4', '−14'], correct: 0, explanation: '(−3)² = 9, |−5| = 5. Deci 9 + 5 = 14.' },
                  { q: 'Care afirmație e adevărată?', opts: ['(−2)⁵ = 32', '(−2)⁵ = −32', '(−2)⁵ = −10', '(−2)⁵ = 10'], correct: 1, explanation: 'Exponent impar pe bază negativă → rezultat negativ. 2⁵ = 32, deci (−2)⁵ = −32.' }
                ]
              }
            },
            {
              id: 'math-1-3',
              title: 'Numere raționale (ℚ)',
              lesson: {
                content: `
                  <h2>Numere raționale: fracții și zecimale</h2>
                  <p>Orice număr care poate fi scris ca fracție p/q (q≠0) e rațional.</p>
                  <h3>Operații cu fracții</h3>
                  <span class="formula">a/b + c/d = (a·d + b·c) / (b·d)<br>a/b × c/d = (a·c) / (b·d)<br>a/b ÷ c/d = (a·d) / (b·c)</span>
                  <h3>Transformări</h3>
                  <span class="formula">0,375 = 375/1000 = 3/8</span>
                `,
                quiz: [
                  { q: 'Cât este 2/3 + 1/4?', opts: ['3/7', '11/12', '5/6', '8/12'], correct: 1, explanation: '2/3 + 1/4 = 8/12 + 3/12 = 11/12.' },
                  { q: 'Transformă 0,6(6) în fracție:', opts: ['6/10', '2/3', '3/5', '66/100'], correct: 1, explanation: '0,666... = 2/3.' }
                ]
              }
            },
            {
              id: 'math-1-4',
              title: 'Numere reale (ℝ) și radicali',
              lesson: {
                content: `
                  <h2>Numere reale și radicali</h2>
                  <p>Mulțimea ℝ completează ℚ cu numerele iraționale (√2, π, etc.).</p>
                  <h3>Proprietăți ale radicalilor</h3>
                  <span class="formula">√(a·b) = √a · √b<br>√(a/b) = √a / √b<br>(√a)² = a<br>√(a²) = |a|</span>
                  <h3>Scoaterea de sub radical</h3>
                  <span class="formula">√72 = √(36 × 2) = 6√2<br>√50 = √(25 × 2) = 5√2</span>
                `,
                quiz: [
                  { q: 'Simplifică √48:', opts: ['4√3', '6√2', '2√12', '3√4'], correct: 0, explanation: '√48 = √(16 × 3) = 4√3.' },
                  { q: 'Raționalizează 6/√2:', opts: ['3', '3√2', '6√2', '2√3'], correct: 1, explanation: '6/√2 = 6√2/2 = 3√2.' }
                ]
              }
            }
          ]
        },
        {
          id: 'math-2',
          name: 'Algebră',
          topics: [
            {
              id: 'math-2-1',
              title: 'Ecuații de gradul I',
              lesson: {
                content: `
                  <h2>Ecuații de gradul I</h2>
                  <p>Forma generală: ax + b = 0, unde a ≠ 0. Soluția: x = −b/a.</p>
                  <span class="formula">3(x − 2) + 4 = 2x + 5<br>3x − 6 + 4 = 2x + 5<br>x = 7</span>
                  <div class="note"><strong>0·x = 0:</strong> infinit de soluții<br><strong>0·x = c (c≠0):</strong> nicio soluție</div>
                `,
                quiz: [ { q: 'Rezolvă: 5x − 3 = 2x + 9', opts: ['x = 4', 'x = 2', 'x = 6', 'x = 3'], correct: 0, explanation: '5x − 2x = 9 + 3 → 3x = 12 → x = 4.' } ]
              }
            },
            {
              id: 'math-2-2',
              title: 'Ecuații de gradul II',
              lesson: {
                content: `
                  <h2>Ecuații de gradul II</h2>
                  <p>Forma: ax² + bx + c = 0 (a ≠ 0). Instrumentul principal: discriminantul.</p>
                  <span class="formula">Δ = b² − 4ac</span>
                  <div class="note"><strong>Δ > 0:</strong> două soluții: x₁,₂ = (−b ± √Δ) / 2a<br><strong>Δ = 0:</strong> o soluție dublă: x = −b / 2a<br><strong>Δ < 0:</strong> nicio soluție reală</div>
                  <h3>Relațiile lui Viète</h3>
                  <span class="formula">x₁ + x₂ = −b/a<br>x₁ · x₂ = c/a</span>
                `,
                quiz: [
                  { q: 'Câte soluții reale are x² + 2x + 5 = 0?', opts: ['0', '1', '2', 'Infinit'], correct: 0, explanation: 'Δ = 4 − 20 = −16 < 0. Nicio soluție reală.' },
                  { q: 'Suma soluțiilor ecuației x² − 5x + 6 = 0 este:', opts: ['5', '6', '−5', '11'], correct: 0, explanation: 'Viète: x₁ + x₂ = −(−5)/1 = 5.' }
                ]
              }
            },
            {
              id: 'math-2-3',
              title: 'Sisteme de ecuații',
              lesson: {
                content: `
                  <h2>Sisteme de ecuații liniare</h2>
                  <p>Două ecuații, două necunoscute. Metode: substituție, reducere, grafic.</p>
                  <span class="formula">2x + y = 7<br>x − y = 2<br>Adunăm: 3x = 9 → x = 3 → y = 1</span>
                  <div class="note"><strong>O soluție:</strong> dreptele se intersectează<br><strong>Nicio soluție:</strong> paralele<br><strong>Infinit:</strong> se suprapun</div>
                `,
                quiz: [ { q: 'Rezolvă: x + y = 5 și x − y = 1. Cât e x?', opts: ['3', '2', '4', '1'], correct: 0, explanation: 'Adunăm: 2x = 6 → x = 3.' } ]
              }
            },
            {
              id: 'math-2-4',
              title: 'Inecuații',
              lesson: {
                content: `
                  <h2>Inecuații</h2>
                  <p>Ca ecuațiile, dar cu >, <, ≥, ≤. Regula de aur: la înmulțire/împărțire cu număr negativ, schimbi sensul!</p>
                  <span class="formula">−2x > 6 → x < −3</span>
                `,
                quiz: [ { q: 'Rezolvă: −3x + 6 ≤ 0', opts: ['x ≤ 2', 'x ≥ 2', 'x ≤ −2', 'x ≥ −2'], correct: 1, explanation: '−3x ≤ −6 → x ≥ 2 (schimbat semnul).' } ]
              }
            }
          ]
        },
        {
          id: 'math-3',
          name: 'Funcții',
          topics: [
            {
              id: 'math-3-1',
              title: 'Funcția liniară',
              lesson: {
                content: `
                  <h2>Funcția liniară</h2>
                  <p>Graficul e o dreaptă. f(x) = ax + b.</p>
                  <div class="note"><strong>a > 0:</strong> crește<br><strong>a < 0:</strong> descrește<br><strong>b:</strong> unde taie axa Oy</div>
                  <p>Zeroul funcției: f(x) = 0 → x = −b/a</p>
                `,
                quiz: [ { q: 'Funcția f(x) = −2x + 6 are zeroul:', opts: ['x = 3', 'x = −3', 'x = 6', 'x = −6'], correct: 0, explanation: '−2x + 6 = 0 → x = 3.' } ]
              }
            },
            {
              id: 'math-3-2',
              title: 'Funcția pătratică (parabola)',
              lesson: {
                content: `
                  <h2>Funcția pătratică</h2>
                  <p>Graficul e o parabolă. Vârful e punctul cel mai important.</p>
                  <span class="formula">xᵥ = −b / 2a<br>yᵥ = −Δ / 4a</span>
                  <div class="note"><strong>a > 0:</strong> brațele în sus (minim)<br><strong>a < 0:</strong> brațele în jos (maxim)</div>
                `,
                quiz: [ { q: 'Vârful parabolei y = x² − 4x + 3 are abscisa:', opts: ['2', '−2', '4', '3'], correct: 0, explanation: 'xᵥ = −(−4) / 2 = 2.' } ]
              }
            }
          ]
        },
        {
          id: 'math-4',
          name: 'Geometrie',
          topics: [
            {
              id: 'math-4-1',
              title: 'Triunghiuri',
              lesson: {
                content: `
                  <h2>Triunghiuri</h2>
                  <p>Suma unghiurilor = 180°.</p>
                  <h3>Teorema lui Pitagora</h3>
                  <span class="formula">a² + b² = c² (c = ipotenuza)</span>
                  <h3>Aria</h3>
                  <span class="formula">S = (baza × înălțimea) / 2</span>
                `,
                quiz: [ { q: 'Catetele 6 și 8. Ipotenuza =', opts: ['10', '14', '12', '√48'], correct: 0, explanation: '6² + 8² = 100. √100 = 10.' } ]
              }
            },
            {
              id: 'math-4-2',
              title: 'Patrulatere',
              lesson: {
                content: `
                  <h2>Patrulatere</h2>
                  <p>Suma unghiurilor = 360°.</p>
                  <span class="formula">Aria trapez = (B + b) × h / 2</span>
                `,
                quiz: [ { q: 'Aria trapez cu bazele 6 și 10, înălțimea 4:', opts: ['32', '24', '40', '16'], correct: 0, explanation: '(6 + 10) × 4 / 2 = 32.' } ]
              }
            },
            {
              id: 'math-4-3',
              title: 'Cercul',
              lesson: {
                content: `
                  <h2>Cercul</h2>
                  <span class="formula">Lungimea: L = 2πr<br>Aria: S = πr²</span>
                  <div class="note"><strong>Unghi înscris în semicerc:</strong> = 90°</div>
                `,
                quiz: [ { q: 'Cerc cu raza 7. Aria discului:', opts: ['153,86', '43,96', '49π', '14π'], correct: 2, explanation: 'S = πr² = 49π.' } ]
              }
            }
          ]
        }
      ]
    },
    {
      id: 'history',
      name: 'Istoria românilor și universală',
      icon: '📜',
      description: '120 min · Din antichitate până în contemporaneitate',
      chapters: [
        {
          id: 'hist-1',
          name: 'Lumea antică și medievală',
          topics: [
            {
              id: 'hist-1-1',
              title: 'Formarea poporului român',
              lesson: {
                content: `
                  <h2>Formarea poporului român</h2>
                  <p>Prin romanizarea dacilor, după cucerirea Daciei de Imperiul Roman (106 d.Hr.).</p>
                  <div class="note"><strong>106 d.Hr.:</strong> Traian cucerește Dacia<br><strong>271:</strong> Retragerea aureliană<br><strong>Sec. III-VII:</strong> Sinteza daco-romană</div>
                `,
                quiz: [ { q: 'În ce an a cucerit Traian Dacia?', opts: ['106 d.Hr.', '271 d.Hr.', '86 î.Hr.', '330 d.Hr.'], correct: 0, explanation: 'Războaiele dacice s-au terminat în 106 d.Hr.' } ]
              }
            },
            {
              id: 'hist-1-2',
              title: 'Țările Române în Evul Mediu',
              lesson: {
                content: `
                  <h2>Formarea statelor medievale</h2>
                  <div class="note"><strong>Țara Românească (~1310):</strong> Basarab I<br><strong>Moldova (~1359):</strong> Bogdan I<br><strong>Transilvania:</strong> sub coroana maghiară</div>
                  <p>Domnitori: Mircea cel Bătrân, Ștefan cel Mare (1457-1504).</p>
                `,
                quiz: [ { q: 'Cine a câștigat bătălia de la Posada (1330)?', opts: ['Basarab I', 'Bogdan I', 'Mircea cel Bătrân', 'Ștefan cel Mare'], correct: 0, explanation: 'Basarab I a învins pe Carol Robert de Anjou.' } ]
              }
            }
          ]
        },
        {
          id: 'hist-2',
          name: 'Epoca modernă',
          topics: [
            {
              id: 'hist-2-1',
              title: 'Revoluția de la 1848',
              lesson: {
                content: `
                  <h2>Revoluția de la 1848</h2>
                  <p>Parte din Primăvara popoarelor. Obiective: drepturi civile, reformă agrară, unire.</p>
                  <div class="note"><strong>Islaz (1848):</strong> 22 de puncte<br><strong>Blaj:</strong> Câmpia Libertății</div>
                `,
                quiz: [ { q: 'Proclamația de la Islaz a avut loc în:', opts: ['1848', '1859', '1878', '1918'], correct: 0, explanation: 'Islaz (11 iunie 1848).' } ]
              }
            },
            {
              id: 'hist-2-2',
              title: 'Unirea Principatelor (1859)',
              lesson: {
                content: `
                  <h2>Unirea Principatelor (1859)</h2>
                  <p>La 24 ianuarie 1859, Alexandru Ioan Cuza ales domn în ambele principate.</p>
                  <div class="note"><strong>Reforma agrară (1864)</strong><br><strong>Secularizarea (1863)</strong><br><strong>Legea instrucțiunii (1864)</strong></div>
                `,
                quiz: [ { q: 'Unirea Principatelor s-a realizat la:', opts: ['24 ianuarie 1859', '1 decembrie 1918', '9 mai 1877', '27 martie 1918'], correct: 0, explanation: '24 ianuarie 1859 — dubla alegere a lui Cuza.' } ]
              }
            }
          ]
        },
        {
          id: 'hist-3',
          name: 'Secolul XX',
          topics: [
            {
              id: 'hist-3-1',
              title: 'Marea Unire (1918)',
              lesson: {
                content: `
                  <h2>Marea Unire de la 1918</h2>
                  <div class="note"><strong>27 martie 1918:</strong> Basarabia<br><strong>28 noiembrie 1918:</strong> Bucovina<br><strong>1 decembrie 1918:</strong> Transilvania (Alba Iulia)</div>
                `,
                quiz: [ { q: 'Basarabia s-a unit cu România la:', opts: ['27 martie 1918', '1 decembrie 1918', '28 noiembrie 1918', '24 ianuarie 1859'], correct: 0, explanation: 'Sfatul Țării a votat la 27 martie 1918.' } ]
              }
            },
            {
              id: 'hist-3-2',
              title: 'Al Doilea Război Mondial',
              lesson: {
                content: `
                  <h2>Al Doilea Război Mondial (1939-1945)</h2>
                  <p>România: pierde Basarabia (1940), intră în război cu Axa (1941), trece la Aliați (23 august 1944).</p>
                  <div class="note"><strong>Teheran (1943), Ialta (1945), Potsdam (1945)</strong></div>
                `,
                quiz: [ { q: 'Când a trecut România de partea Aliaților?', opts: ['23 august 1944', '22 iunie 1941', '1 septembrie 1939', '9 mai 1945'], correct: 0, explanation: '23 august 1944.' } ]
              }
            },
            {
              id: 'hist-3-3',
              title: 'Independența R. Moldova (1991)',
              lesson: {
                content: `
                  <h2>Independența Republicii Moldova</h2>
                  <div class="note"><strong>1989:</strong> Limba română, alfabet latin<br><strong>23 iunie 1990:</strong> Suveranitatea<br><strong>27 august 1991:</strong> Independența</div>
                `,
                quiz: [ { q: 'Când a fost proclamată independența R. Moldova?', opts: ['27 august 1991', '23 iunie 1990', '25 decembrie 1991', '1 ianuarie 1992'], correct: 0, explanation: '27 august 1991.' } ]
              }
            }
          ]
        }
      ]
    },
    {
      id: 'romana',
      name: 'Limba și literatura română',
      icon: 'Aa',
      description: '120 min · Gramatică, Literatură, Compoziție',
      chapters: [
        {
          id: 'rom-1',
          name: 'Fonetică și vocabular',
          topics: [
            {
              id: 'rom-1-1',
              title: 'Sunete, silabe, accent',
              lesson: {
                content: `
                  <h2>Fonetică</h2>
                  <p>31 de litere. Vocale: a, ă, â/î, e, i, o, u.</p>
                  <div class="note"><strong>Diftong:</strong> două vocale în aceeași silabă<br><strong>Triftong:</strong> trei vocale<br><strong>Hiat:</strong> vocale în silabe diferite</div>
                `,
                quiz: [ { q: 'Câte silabe are "extraordinar"?', opts: ['5', '6', '4', '7'], correct: 0, explanation: 'ex-tra-or-di-nar = 5 silabe.' } ]
              }
            },
            {
              id: 'rom-1-2',
              title: 'Vocabular',
              lesson: {
                content: `
                  <h2>Vocabular</h2>
                  <div class="note"><strong>Sinonime:</strong> sens asemănător<br><strong>Antonime:</strong> sens opus<br><strong>Omonime:</strong> aceeași formă, sens diferit<br><strong>Paronime:</strong> formă asemănătoare</div>
                `,
                quiz: [ { q: 'Care sunt paronime?', opts: ['eminent / iminent', 'bun / rău', 'frumos / urât', 'broască / broască'], correct: 0, explanation: 'Eminent și iminent — formă apropiată, sens diferit.' } ]
              }
            }
          ]
        },
        {
          id: 'rom-2',
          name: 'Morfologie',
          topics: [
            {
              id: 'rom-2-1',
              title: 'Părți de vorbire flexibile',
              lesson: {
                content: `
                  <h2>Părți de vorbire flexibile</h2>
                  <p>Substantiv, adjectiv, pronume, numeral, verb.</p>
                  <div class="note"><strong>Moduri personale:</strong> indicativ, conjunctiv, condițional, imperativ<br><strong>Nepersonale:</strong> infinitiv, gerunziu, participiu, supin</div>
                `,
                quiz: [ { q: 'Gerunziul este un mod:', opts: ['nepersonal', 'personal', 'temporal', 'cazual'], correct: 0, explanation: 'Modurile nepersonale: infinitiv, gerunziu, participiu, supin.' } ]
              }
            },
            {
              id: 'rom-2-2',
              title: 'Părți de vorbire neflexibile',
              lesson: {
                content: `
                  <h2>Părți de vorbire neflexibile</h2>
                  <p>Adverb, prepoziție, conjuncție, interjecție.</p>
                  <div class="note"><strong>Coordonatoare:</strong> și, dar, iar, sau<br><strong>Subordonatoare:</strong> că, dacă, deși, fiindcă</div>
                `,
                quiz: [ { q: '"Deși" este o conjuncție:', opts: ['subordonatoare', 'coordonatoare', 'copulativă', 'adversativă'], correct: 0, explanation: 'Introduce o subordonată concesivă.' } ]
              }
            }
          ]
        },
        {
          id: 'rom-3',
          name: 'Sintaxă',
          topics: [
            {
              id: 'rom-3-1',
              title: 'Părțile de propoziție',
              lesson: {
                content: `
                  <h2>Părțile de propoziție</h2>
                  <div class="note"><strong>Subiectul:</strong> cine? ce?<br><strong>Predicatul:</strong> ce face?<br><strong>Atributul:</strong> care? ce fel de?<br><strong>Complement direct:</strong> pe cine? ce?</div>
                `,
                quiz: [ { q: 'În "Maria citește o carte", "o carte" este:', opts: ['complement direct', 'subiect', 'atribut', 'complement indirect'], correct: 0, explanation: 'Citește — ce? — o carte → complement direct.' } ]
              }
            }
          ]
        }
      ]
    }
  ]
};

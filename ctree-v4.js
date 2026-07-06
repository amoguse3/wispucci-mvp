// Wispucci v4 — дерево уровень → предмет → тема, выведенное из графов знаний (backend/knowledge_base/*_graph_*.json).
// Темы = узлы графа. Для gimnaziu есть готовые пошаговые уроки (curriculum-v3). Для BAC гость видит тизер,
// залогиненный тянет урок с backend (generateLesson, заземлён на KB). profile: real/uman/both.
const LEVELS = [
  {
    id: 'gimnaziu', name: 'Examenul de absolvire a gimnaziului', short: 'Examen · clasa 9',
    blurb: 'Matematică, Istorie, Limba română — conform programei ANCE.',
    subjects: [
      { id: 'math', name: 'Matematică', symbol: 'M', v3: 'math', profiles: false,
        topics: [
          { id: 'm1', title: 'Numere reale și radicali', v3: 'm1' },
          { id: 'm2', title: 'Ecuații de gradul II', v3: 'm2' },
          { id: 'm3', title: 'Funcția pătratică', v3: 'm3' },
          { id: 'm4', title: 'Teorema lui Pitagora', v3: 'm4' }
        ] },
      { id: 'hist', name: 'Istoria românilor', symbol: 'H', v3: 'hist', profiles: false,
        topics: [
          { id: 'h1', title: 'Formarea poporului român', v3: 'h1' },
          { id: 'h2', title: 'Unirea Principatelor (1859)', v3: 'h2' },
          { id: 'h3', title: 'Independența R. Moldova', v3: 'h3' },
          { id: 'h_wwi', title: 'Primul Război Mondial', v3: null },
          { id: 'h_reforme', title: 'Reformele interbelice', v3: null },
          { id: 'h_totalitare', title: 'Regimuri totalitare', v3: null }
        ] },
      { id: 'rom', name: 'Limba română', symbol: 'A', v3: 'rom', profiles: false,
        topics: [
          { id: 'r1', title: 'Diftong, triftong, hiat', v3: 'r1' },
          { id: 'r2', title: 'Părțile de propoziție', v3: 'r2' },
          { id: 'r_figuri', title: 'Figuri de stil și specii literare', v3: null },
          { id: 'r_text', title: 'Texte funcționale (anunț/cerere/mesaj)', v3: null }
        ] }
    ]
  },
  {
    id: 'bac', name: 'Bacalaureat', short: 'BAC · clasele 10-12',
    blurb: 'Toate materiile BAC. Alege profilul (real / umanist) unde contează.',
    subjects: [
      { id: 'math', name: 'Matematică', symbol: 'M', profiles: true, backend: true,
        topics: [
          { id: 'logaritmi', title: 'Logaritmi', profile: 'both' },
          { id: 'numere_complexe', title: 'Numere complexe', profile: 'both' },
          { id: 'trigonometrie', title: 'Trigonometrie', profile: 'real' },
          { id: 'derivate', title: 'Derivate și extreme', profile: 'real' },
          { id: 'integrale', title: 'Integrale (Newton-Leibniz)', profile: 'real' },
          { id: 'statistica_mediana', title: 'Statistică și mediană', profile: 'uman' },
          { id: 'geometrie_spatiala_liceu', title: 'Corpuri geometrice — volume', profile: 'both' }
        ] },
      { id: 'istorie', name: 'Istoria românilor și universală', symbol: 'H', profiles: true, backend: true,
        topics: [
          { id: 'marea_unire_1918_bac', title: 'Marea Unire 1918', profile: 'both' },
          { id: 'unirea_1859', title: 'Unirea Principatelor 1859', profile: 'both' },
          { id: 'regimuri_totalitare_bac', title: 'Regimuri totalitare', profile: 'both' },
          { id: 'independenta_rm_bac', title: 'Independența RM 1991', profile: 'both' },
          { id: 'eseu_istoric', title: 'Eseul istoric (35p)', profile: 'both' }
        ] },
      { id: 'bio', name: 'Biologie', symbol: 'B', profiles: true, backend: true,
        topics: [
          { id: 'sisteme_organe_om', title: 'Sistemele de organe', profile: 'both' },
          { id: 'genetica_probleme', title: 'Probleme de genetică', profile: 'both' },
          { id: 'molecular_adn', title: 'Bazele moleculare (ADN)', profile: 'real' },
          { id: 'ecologie', title: 'Ecologie', profile: 'both' }
        ] },
      { id: 'chimie', name: 'Chimie', symbol: 'C', profiles: true, backend: true,
        topics: [
          { id: 'calcule_stoechiometrie', title: 'Calcule stoechiometrice', profile: 'both' },
          { id: 'identificare_ioni', title: 'Identificarea ionilor', profile: 'both' },
          { id: 'ovr_bilant', title: 'Redox — bilanț electronic', profile: 'real' },
          { id: 'organica_reactii', title: 'Organică — reacții', profile: 'both' }
        ] },
      { id: 'fizica', name: 'Fizică', symbol: 'F', profiles: true, backend: true,
        topics: [
          { id: 'mecanica_cinematica', title: 'Mecanică', profile: 'both' },
          { id: 'termodinamica', title: 'Termodinamică', profile: 'both' },
          { id: 'curent_ohm', title: 'Curent continuu', profile: 'both' },
          { id: 'efect_fotoelectric', title: 'Efect fotoelectric', profile: 'both' }
        ] },
      { id: 'geografie', name: 'Geografie', symbol: 'G', profiles: false, backend: true, atlas: true,
        topics: [
          { id: 'calcule_geografice', title: 'Calcule — întindere, fuse orare', profile: 'both' },
          { id: 'demografie', title: 'Demografie — bilanț natural', profile: 'both' },
          { id: 'lucru_cu_atlasul', title: 'Lucru cu atlasul', profile: 'both' }
        ] },
      { id: 'informatica', name: 'Informatică (C++)', symbol: 'I', profiles: true, backend: true,
        topics: [
          { id: 'sisteme_numeratie', title: 'Sisteme de numerație', profile: 'both' },
          { id: 'trasare_cod', title: 'Trasarea programelor', profile: 'both' },
          { id: 'tablouri', title: 'Tablouri și matrici', profile: 'both' },
          { id: 'metode_numerice', title: 'Metode numerice', profile: 'real' }
        ] },
      { id: 'limbi_straine', name: 'Limba străină', symbol: 'L', profiles: false, backend: true,
        topics: [
          { id: 'comprehensiune_l2', title: 'Comprehensiunea textului', profile: 'both' },
          { id: 'eseu_l2', title: 'Eseul (180-200 cuvinte)', profile: 'both' }
        ] },
      { id: 'romana', name: 'Limba și literatura română', symbol: 'A', profiles: true, backend: true,
        topics: [
          { id: 'figuri_de_stil', title: 'Figuri de stil', profile: 'both' },
          { id: 'motiv_literar_comparat', title: 'Motiv literar comparat', profile: 'both' },
          { id: 'eseu_argumentativ', title: 'Eseul (24p)', profile: 'both' },
          { id: 'redactare', title: 'Redactarea (20p)', profile: 'both' }
        ] }
    ]
  }
];

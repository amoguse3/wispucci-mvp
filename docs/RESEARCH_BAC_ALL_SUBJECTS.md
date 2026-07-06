# BAC (Clasa 12) — All Subjects Research

> Coverage of every BAC discipline requested: Limba română, Limba engleză, Limba franceză, Istoria, Biologie, Chimie, Fizică, Geografie, Informatică. Grounded in official ANCE exam programs (programe de examen) which define the authoritative topic list, plus real tests/baremes where parsed. Time per exam: **180 min**. All programs approved 2021, Ordin MEC 1499.

## Subject status matrix (who takes what)

| Subject | Status | Profiles | Notes |
|---|---|---|---|
| Limba și literatura română | **Obligatoriu** | real + uman | Common exam, profile-tagged variants |
| Matematică | Obligatoriu (real) / by track | real vs uman | Already built (see RESEARCH_BAC_CLASA12) |
| Istoria românilor și universală | Obligatoriu / profil | real vs uman | Already staged (history12_bac.json) |
| Limba străină (engleză/franceză/germană/it/es) | **Obligatoriu ambele profiluri** | real + uman | Level **B1** (CEFR), common barem |
| Biologie | La solicitare (obligatoriu sport) | real + uman programs differ | Full program parsed |
| Chimie | La solicitare | real + uman | Program located |
| Fizică | La solicitare | real + uman | Program located |
| Geografie | La solicitare | single program | Full program parsed |
| Informatică | La solicitare | real + uman | Program located |

## Cross-cutting insight
Most BAC science/humanities exams (bio, chi, fiz, geo, ist) share the ANCE architecture: **competence-based items → source/data interpretation → structured problem or essay**, graded **per step** with published baremes. Chemistry baremes (pr25 umanist) confirm the pattern: points for balancing each reaction equation, for each correct calculation stage, for units. This means the same barem-literacy teaching layer (see BAREM_GUIDE) generalizes across subjects.

---

## LIMBA STRĂINĂ (engleză + franceză + germană/it/es) — level B1
Obligatoriu for both profiles. 180 min written. Three subjects:
- **Subiectul I:** reading comprehension of an unknown non-literary/functional text, **400-450 words**.
- **Subiectul II:** structured essay, **180-200 words**, on a current theme from the Mediums (personal, familial, school, natural, social, informational).
- **Subiectul III:** cultural text (press article / personal letter), **90-100 words**, on the culture of the target-language country.
Competences: linguistic, sociolinguistic, pragmatic (Comunicare) + (pluri/inter)cultural (Cultură). Same common barem across all languages; only the linguistic content differs per language. **Teach:** reading strategies, structured-essay templates to the word count, functional/cultural text formats, register and politeness norms.

## BIOLOGIE — 4 domains (real program parsed in full)
La solicitare (obligatoriu doar sport). Real and umanist programs differ in depth. Four content domains:
- **I. Diversity & evolution of life:** systematics (regn/filum/clasă), viruses, Monera/Protiste/Fungi/Plante/Animale taxonomy; evolution (natural selection, aromorfoză, idioadaptare, degenerare), evidence from comparative anatomy/embryology/paleontology/molecular biology, human evolution.
- **II. Systems & vital processes:** cell (pro/eukaryote, chemical composition), tissues, human organ systems (nervous, sensory, endocrine, locomotor, cardiovascular, respiratory, digestive, excretory, reproductive), their anatomy/physiology, diseases + hygiene.
- **III. Genetics & organism improvement:** heredity, variability, laws.
- **IV. Ecology & environmental protection:** biodiversity, conservation.
**Teach:** define terms precisely, structure-function correlation, disease→symptom matching, interpret experimental/graphical data.

## GEOGRAFIE — physical + human (program parsed in full)
La solicitare. Single program, 180 min. Two big blocks:
- **Geografia fizică generală:** Earth (shape, rotation/revolution, cartography, time zones), litosfera (structure, endogenous/exogenous processes, relief, hazards: quakes/volcanoes/landslides), atmosfera (temperature, pressure, winds, precipitation, climate zones, climograms), hidrosfera (ocean, rivers, lakes), biosfera & soil, geographic mediums (equatorial→polar).
- **Geografia umană a lumii:** political map, natural conditions & resources, population & settlements (demographic indicators, migration, urbanization), world economy (agriculture, industry, GDP, trade, integration).
**Teach:** map/climogram/statistical interpretation, coordinate & local-time & distance calculations, cause-effect reasoning, X-grade geographic objects are mandatory learning outcomes.

## CHIMIE — (program located; barem pattern confirmed)
La solicitare, real + uman. Barem (pr25 umanist) shows the scoring shape: fill-in-blanks (1p each), completing tables, **writing correct chemical reaction equations** (2p each), stoichiometry problems scored per stage (analyzing conditions, coefficients, molar mass M, amount ν, proportion). **Teach:** balancing equations, mole/stoichiometry step-by-step, organic vs inorganic, reaction types. Deep KB deferred to ingest agent (program PDF to be parsed per-domain).

## FIZICĂ — (program located)
La solicitare, real + uman. Liceu physics spans mechanics, molecular physics & thermodynamics, electricity & magnetism, optics, atomic/nuclear. Real profile goes deeper (more derivations/problems). **Teach:** formula selection, unit analysis, multi-step problem solving with per-stage credit. Deep KB deferred to ingest agent.

## INFORMATICĂ — (program located)
La solicitare, real + uman. Covers algorithms, data types, programming (Pascal/C++ historically in MD curriculum), information theory, databases. Real profile heavier on algorithmics/coding. **Teach:** algorithm tracing, code reading/writing, complexity basics. Deep KB deferred to ingest agent.

## LIMBA ROMÂNĂ (BAC) — deeper than gimnaziu
Obligatoriu. Literary text analysis, argumentative essay on a literary theme, character/genre/current analysis, plus language correctness scored across the paper. Profile-tagged. Deep KB is the immediate next authoring target.

---

## Honesty on coverage
- Programs pulled in full and grounded: **biologie, geografie, limba străină**. Programs located (structure known, full per-domain parse pending): **chimie, fizică, informatică, limba română BAC**. Chemistry barem pattern confirmed from pr25.
- The subject KB files staged here are **skeletons with the authoritative domain/topic spine** from the official programs. Per-topic facts/formulas/worked-examples for chi/fiz/info must be filled by the ingest agent from textbooks + more baremes, then human-verified. This is deliberate: staging a truthful skeleton beats inventing details.

// ---------------------------------------------------------------------------
// Contenu ANGLAIS des facs curées (highlights / notes), + helper de
// localisation. Permet de basculer toute l'appli en anglais sans toucher aux
// composants : on remplace les champs FR par leur version EN au moment de
// l'affichage. Les fiches annuaire (curated:false) ont des notes templatées.
// ---------------------------------------------------------------------------

const TYPE_EN = { Publique: 'Public', Privée: 'Private' }
const SIZE_EN = { 'Très grande': 'Very large', Grande: 'Large', Moyenne: 'Medium', Petite: 'Small' }

export const UNI_EN = {
  indiana: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'The most decorated program in NCAA history (8 national titles).', highlights: ['The gold standard of NCAA soccer', 'Unique soccer culture', 'Big Ten campus'] },
  maryland: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'National powerhouse (multiple titles), 2025 Big Ten champions.', highlights: ['National titles', 'Pipeline to the pros', 'Near Washington D.C.'] },
  wakeforest: { scholarshipNote: 'Athletic scholarships + strong merit aid', soccerNote: 'Perennial ACC national contender, 2007 champions.', highlights: ['ACC powerhouse', 'Strong academics', 'Small private campus'] },
  stanford: { scholarshipNote: 'Huge aid if admitted, but extremely selective', soccerNote: 'Three straight NCAA titles (2015-2017) — very ambitious target.', highlights: ['World elite', 'Three titles in a row', 'Extremely selective'] },
  ucla: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'Four NCAA titles, huge athletic department in Los Angeles.', highlights: ['Los Angeles', 'Four NCAA titles', 'Sports powerhouse'] },
  georgetown: { scholarshipNote: 'Athletic scholarships + merit aid possible', soccerNote: '2019 national champions, a Big East benchmark.', highlights: ['2019 champions', 'Washington D.C.', 'Highly regarded degree'] },
  clemson: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'Three NCAA titles (incl. 2021 and 2023), big ACC sports culture.', highlights: ['Recent titles (2021, 2023)', 'ACC atmosphere', 'Very athletic campus'] },
  notredame: { scholarshipNote: 'Athletic scholarships + generous aid (strong record)', soccerNote: '2013 champions, two recent College Cups, elite setting.', highlights: ['Academic prestige', '2013 champions', 'Outstanding support'] },
  virginia: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'Seven NCAA titles, 2025 ACC regular-season champions.', highlights: ['Seven NCAA titles', 'Elite public university', 'Huge tradition'] },
  unc: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2011 NCAA champions, 2025 finalists, big athletic department.', highlights: ['2025 finalists', 'Well-regarded public', 'Chapel Hill'] },
  duke: { scholarshipNote: 'Athletic scholarships + generous aid (strong record)', soccerNote: 'Regular NCAA tournament side in an elite academic setting.', highlights: ['Elite academics', 'ACC', 'Generous aid'] },
  creighton: { scholarshipNote: 'Athletic scholarships + merit aid possible', soccerNote: 'Big crowds and regular College Cup runs in the Big East.', highlights: ['Record attendance', 'Big East', 'Well-supported private'] },
  smu: { scholarshipNote: 'Athletic scholarships + strong merit aid', soccerNote: 'Long tradition, 2025 ACC regular-season champions.', highlights: ['2025 ACC champions', 'Sunny Dallas', 'Polished private campus'] },
  pittsburgh: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: 'Recent ACC powerhouse (2020-2022 College Cups).', highlights: ['On the rise', 'Recent College Cups', 'Big city'] },
  washington: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2025 national champions (first title in program history).', highlights: ['2025 champions', 'Big Ten', 'Seattle'] },
  akron: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2010 champions, an elite mid-major now in the Big East.', highlights: ['2010 champions', 'Pro factory', 'Contained cost'] },
  marshall: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2020 national champions, regular conference contender.', highlights: ['2020 champions', 'Sun Belt', 'Affordable cost'] },
  kentucky: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2025 Sun Belt regular-season champions, big SEC department.', highlights: ['2025 Sun Belt champions', 'SEC atmosphere', 'Rising program'] },
  vermont: { scholarshipNote: 'Athletic scholarships possible', soccerNote: '2024 national champions (first title in program history).', highlights: ['2024 champions', 'America East', 'Outdoorsy setting'] },
  denver: { scholarshipNote: 'Athletic scholarships + merit aid possible', soccerNote: '2016 NCAA semifinalists, now in the West Coast Conference.', highlights: ['2016 College Cup', 'Mile-high Denver', 'Private campus'] },
  ucsb: { scholarshipNote: 'Athletic scholarships possible', soccerNote: '2006 NCAA champions, big crowds by the beach.', highlights: ['2006 champions', 'Beach + sun', 'Big crowds'] },
  oregonstate: { scholarshipNote: 'Athletic scholarships possible', soccerNote: 'Favorites in the rebuilt Pac-12, a rising West Coast program.', highlights: ['Pac-12 favorites', 'West Coast', 'Rising program'] },
  saintlouis: { scholarshipNote: 'Athletic scholarships + merit aid possible', soccerNote: 'The winningest D1 program (10 titles), back in the 2025 College Cup.', highlights: ['10 national titles', 'Cradle of US soccer', '2025 College Cup'] },
  michiganstate: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', soccerNote: '2018 national champions, a solid Big Ten regular.', highlights: ['2018 champions', 'Big Ten', 'Large campus'] },
  lynn: { scholarshipNote: 'D2 athletic scholarships, very welcoming to international athletes', soccerNote: 'Reigning D2 champions (2024), three national titles in all.', highlights: ['2024 D2 champions', 'Very international', 'Sunny Boca Raton'] },
  barry: { scholarshipNote: 'D2 athletic scholarships (often partial)', soccerNote: 'Solid, very international D2 program in Miami.', highlights: ['Competitive D2', 'Miami', 'International roster'] },
  tampa: { scholarshipNote: 'D2 athletic scholarships (often partial)', soccerNote: 'One of the best D2 programs, regularly ranked No. 1.', highlights: ['Top D2', 'Florida + beaches', 'Well-regarded private campus'] },
  messiah: { scholarshipNote: 'No athletic scholarship (D3), merit aid possible', soccerNote: 'The most decorated D3 program, a near-unbroken dynasty.', highlights: ['D3 dynasty', 'Small campus', 'Top-tier coaching'] },
  tufts: { scholarshipNote: 'No athletic scholarship (D3) but strong merit/need-based aid', soccerNote: 'Reigning D3 champions (2025), five national titles in all.', highlights: ['2025 D3 champions', 'Elite academics', 'Near Boston'] },
  chicago: { scholarshipNote: 'No athletic scholarship (D3) but strong merit/need-based aid', soccerNote: '2022 D3 champions, at a world-class university.', highlights: ['2022 champions', 'Elite university', 'Big city'] },
  amherst: { scholarshipNote: 'No athletic scholarship (D3) but strong merit/need-based aid', soccerNote: 'Two-time D3 champions (2015 and 2024), elite liberal-arts college.', highlights: ['Two-time D3 champs', 'Elite liberal arts', 'Generous aid'] },
}

// Renvoie une copie de la fac avec les champs traduits si lang === 'en'.
export function localizeUni(u, lang) {
  if (lang !== 'en') return u
  const out = { ...u }
  if (TYPE_EN[u.type]) out.type = TYPE_EN[u.type]
  if (SIZE_EN[u.sizeLabel]) out.sizeLabel = SIZE_EN[u.sizeLabel]
  const en = UNI_EN[u.id]
  if (en) {
    out.highlights = en.highlights
    out.soccerNote = en.soccerNote
    out.scholarshipNote = en.scholarshipNote
  } else if (u.curated === false) {
    out.scholarshipNote =
      u.division === 'D3' ? 'No athletic scholarship (D3); merit aid possible' : 'Athletic scholarships possible (to be confirmed)'
    out.soccerNote = 'Directory entry — basic info, verify via the links (staff, site).'
  }
  return out
}

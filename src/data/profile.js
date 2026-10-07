// Profil du joueur. Tout est MODIFIABLE dans l'app (onglets « Profil », « Ma
// fiche », « Mes stats ») — ces valeurs ne sont que des points de départ.
// Nicolas pourra tout remplir lui-même ; rien ici n'est figé dans le code.

export const profile = {
  name: 'Nicolas',
  sport: 'Football',
  sportEn: 'Soccer',

  // Poste(s) — éditable (onglet « Ma fiche »).
  positions: [], // ex : ['Milieu central', 'Ailier droit']
  specialty: 'À préciser',
  specialtyEn: 'TBD',

  nationality: 'Belge',
  nationalityEn: 'Belgian',
  birthDate: '', // éditable — ex '2009-05-14'
  currentGrade: '5e secondaire (Belgique)',
  currentGradeEn: '5th year, Belgian secondary',
  usEntryYear: 2028, // classe de recrutement : entrée fac automne 2028
  major: '', // filière d'études — éditable
  majorEn: '',
  homeClub: '', // club actuel — éditable
  coach: '', // coach actuel — éditable
  englishTest: 'À préciser',
  englishTestEn: 'TBD',
  gpaNote: 'À préciser (bulletin à venir)',

  // Niveau auto-évalué (1 = développement … 5 = élite D1). Pas de « chrono » au
  // foot : ce curseur (éditable, onglet « Profil ») situe Réaliste/Objectif/
  // Ambitieux dans le classement. 3 = bon niveau régional / national jeunes.
  level: 3,

  // Marge de progression (~2 ans avant la rentrée) : +1 palier, utilisé
  // UNIQUEMENT pour la catégorie de recrutement, pas pour le niveau affiché.
  recruitHorizonBonus: 1,

  // Pondération du score de match. Trois critères pour l'instant
  // (foot · ambiance · coût) — on en ajoutera d'autres plus tard.
  weights: {
    sport: 0.6, // niveau du programme de foot + division
    lifestyle: 0.25, // ambiance / culture sportive du campus
    cost: 0.15, // coût / potentiel de bourse
  },

  // Profil physique (éditable) — repères utiles aux coachs.
  physical: {
    heightCm: '', // ex 178
    weightKg: '', // ex 70
    foot: '', // 'Droit' | 'Gauche' | 'Ambidextre'
  },

  // Préférences lifestyle (1 = peu important, 5 = très important) — éditable.
  prefs: {
    athleticsCulture: 4, // ambiance / département sportif fort
    sunshine: 3,
  },
}

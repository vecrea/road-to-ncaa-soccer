// ---------------------------------------------------------------------------
// Niveau du joueur (1..5) et paliers de recrutement NCAA — équivalent foot du
// module de conversion natation. Il n'y a pas de « chrono » au football : le
// niveau est AUTO-ÉVALUÉ (profil, éditable) et sert à situer le joueur
// (Réaliste / Objectif / Ambitieux) face à la force de chaque programme.
// ---------------------------------------------------------------------------

export const LEVELS = {
  5: { key: 5, short: 'Élite D1', shortEn: 'Elite D1', label: 'Élite D1 (titulaire potentiel)', labelEn: 'Elite D1 (starter potential)', color: '#7c3aed' },
  4: { key: 4, short: 'Solide D1', shortEn: 'Solid D1', label: 'Solide Division 1', labelEn: 'Solid Division 1', color: '#0284c7' },
  3: { key: 3, short: 'Bas D1 / D2', shortEn: 'Low D1 / D2', label: 'Bas D1 / Haut D2', labelEn: 'Low D1 / High D2', color: '#0ea5e9' },
  2: { key: 2, short: 'D2 / D3', shortEn: 'D2 / D3', label: 'D2 / Haut D3', labelEn: 'D2 / High D3', color: '#16a34a' },
  1: { key: 1, short: 'Développement', shortEn: 'Developing', label: 'Développement / D3', labelEn: 'Developing / D3', color: '#64748b' },
}

// Repères indicatifs pour aider à choisir son niveau (1..5).
export const LEVEL_HINTS = {
  5: { fr: 'International jeunes / académie d’un club pro (élite)', en: 'Youth international / pro-club academy (elite)' },
  4: { fr: 'Académie pro ou meilleur niveau national jeunes', en: 'Pro academy or top national youth level' },
  3: { fr: 'Bon niveau national / régional jeunes', en: 'Strong national / regional youth level' },
  2: { fr: 'Niveau régional en progression', en: 'Developing regional level' },
  1: { fr: 'Niveau provincial / loisir compétitif', en: 'Provincial / competitive recreational' },
}

// Niveau global du joueur = la valeur auto-évaluée du profil (1..5).
export function athleteLevel(profile) {
  const lvl = Math.max(1, Math.min(5, Math.round(profile?.level ?? 3)))
  return { level: lvl }
}

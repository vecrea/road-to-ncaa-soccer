// ---------------------------------------------------------------------------
// Moteur de compatibilité : pour chaque université, un score de match 0-100
// pondéré selon les priorités. Trois critères pour l'instant :
//   sport     = niveau du programme de foot + ambition de division
//   lifestyle = ambiance / culture sportive du campus
//   cost      = coût (plus c'est abordable, mieux c'est)
// + une catégorie de recrutement Réaliste / Objectif / Ambitieux.
// (On ajoutera d'autres critères plus tard — académique, etc.)
// ---------------------------------------------------------------------------

import { athleteLevel } from './level.js'

const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

const divisionAmbition = { D1: 1, D2: 0.8, D3: 0.62 }

const FIT = {
  safety: { key: 'safety', label: 'Réaliste', labelEn: 'Safety', color: '#16a34a', emoji: '' },
  target: { key: 'target', label: 'Objectif', labelEn: 'Target', color: '#0ea5e9', emoji: '' },
  reach: { key: 'reach', label: 'Ambitieux', labelEn: 'Reach', color: '#f59e0b', emoji: '' },
}

function fitCategory(programLevel, athLevel) {
  const gap = programLevel - athLevel
  if (gap <= 0) return FIT.safety
  if (gap === 1) return FIT.target
  return FIT.reach
}

export function scoreUniversity(u, profile, fitLevel) {
  const w = profile.weights

  const sport = 0.6 * (u.soccer / 5) + 0.4 * (divisionAmbition[u.division] ?? 0.7)
  const lifestyle = (u.athletics ?? 3) / 5
  const cost = clamp((95000 - u.costUSD) / (95000 - 33000), 0, 1)

  const total = w.sport * sport + w.lifestyle * lifestyle + w.cost * cost
  const match = Math.round(clamp(total, 0, 1) * 100)

  return {
    match,
    fit: fitCategory(u.soccer, fitLevel),
    breakdown: {
      sport: Math.round(sport * 100),
      lifestyle: Math.round(lifestyle * 100),
      cost: Math.round(cost * 100),
    },
  }
}

// Calcule et trie toutes les universités pour un profil donné.
export function computeMatches(profile, universities) {
  const { level: athLevel } = athleteLevel(profile)
  // Niveau utilisé pour le classement recrutement = niveau actuel + marge de progression.
  const fitLevel = clamp(athLevel + (profile.recruitHorizonBonus || 0), 1, 5)
  return universities
    .map((u) => ({ ...u, ...scoreUniversity(u, profile, fitLevel) }))
    .sort((a, b) => b.match - a.match)
}

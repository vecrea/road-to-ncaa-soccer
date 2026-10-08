// Persistance locale (dans le navigateur) — pas de serveur, 100% chez toi.
// Tout est stocké sous le préfixe « rtncaa-soccer. » (cf. backup.js).

const KEY = 'rtncaa-soccer.favorites.v1'

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveFavorites(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    /* stockage indisponible : on ignore silencieusement */
  }
}

// --- Champs éditables de la fiche athlète (email, poste, physique, bio...) ---
const EXTRAS_KEY = 'rtncaa-soccer.profileExtras.v1'

export function loadProfileExtras() {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProfileExtras(obj) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}

// --- Carnet de contacts coachs ---
const COACHES_KEY = 'rtncaa-soccer.coaches.v1'

export function loadCoaches() {
  try {
    const raw = localStorage.getItem(COACHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCoaches(arr) {
  try {
    localStorage.setItem(COACHES_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- Stats par saison (club, division, matchs, buts, passes) ---
// Entrée : { id, season:'2024-25', club, league, apps, goals, assists, note }
const SEASONS_KEY = 'rtncaa-soccer.seasons.v1'

export function loadSeasons() {
  try {
    const raw = localStorage.getItem(SEASONS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveSeasons(arr) {
  try {
    localStorage.setItem(SEASONS_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- Palmarès & sélections (titres, équipe nationale jeunes, tournois) ---
// Entrée : { id, year:'2025', text }
const PALMARES_KEY = 'rtncaa-soccer.palmares.v1'

export function loadPalmares() {
  try {
    const raw = localStorage.getItem(PALMARES_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function savePalmares(arr) {
  try {
    localStorage.setItem(PALMARES_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- Bulletin (matières & notes) pour le calcul du GPA ---
const GPA_KEY = 'rtncaa-soccer.gpa.v1'

export function loadGpaSubjects() {
  try {
    const raw = localStorage.getItem(GPA_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGpaSubjects(arr) {
  try {
    localStorage.setItem(GPA_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

const GPA_SCALE_KEY = 'rtncaa-soccer.gpascale.v1'
export function loadGpaScale() {
  try {
    // Défaut % (échelle courante en Belgique) ; '20' seulement si explicitement choisi.
    return localStorage.getItem(GPA_SCALE_KEY) === '20' ? '20' : '100'
  } catch {
    return '100'
  }
}
export function saveGpaScale(scale) {
  try {
    localStorage.setItem(GPA_SCALE_KEY, scale)
  } catch {
    /* ignore */
  }
}

// --- « Ma présentation » (à propos + instagram + contact) pour les coachs ---
const ABOUT_KEY = 'rtncaa-soccer.about.v1'

export function loadAbout() {
  try {
    const raw = localStorage.getItem(ABOUT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveAbout(obj) {
  try {
    localStorage.setItem(ABOUT_KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}

// --- Thème clair / sombre ---
const THEME_KEY = 'rtncaa-soccer.theme.v1'

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    // Premier chargement : on respecte la préférence système.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

// --- Checklist des démarches (cases cochées) ---
const CHECKLIST_KEY = 'rtncaa-soccer.checklist.v1'

export function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveChecklist(set) {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

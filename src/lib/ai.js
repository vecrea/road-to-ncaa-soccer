// ---------------------------------------------------------------------------
// Couche IA : appelle l'API Claude (côté navigateur, avec TA clé stockée
// localement). Sert à : (1) expliquer pourquoi une fac te correspond,
// (2) générer un email de recrutement à un coach.
// La clé reste dans ton navigateur (localStorage) — rien n'est envoyé ailleurs
// qu'à l'API Claude au moment où tu cliques.
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk'
import { athleteLevel, LEVELS } from './level.js'
import { loadSeasons } from './storage.js'

const KEY_STORE = 'rtncaa-soccer.ai.key.v1'
const MODEL_STORE = 'rtncaa-soccer.ai.model.v1'
const WHY_STORE = 'rtncaa-soccer.ai.why.v1'

export const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — le moins cher', cost: '~1–2 ¢ / usage' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — recommandé', cost: '~5 ¢ / usage' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — le plus fort', cost: '~10 ¢ / usage' },
]
const DEFAULT_MODEL = 'claude-sonnet-4-6'

const safeGet = (k) => {
  try {
    return localStorage.getItem(k) || ''
  } catch {
    return ''
  }
}

export const getApiKey = () => safeGet(KEY_STORE)
export const setApiKey = (k) => {
  try {
    k ? localStorage.setItem(KEY_STORE, k.trim()) : localStorage.removeItem(KEY_STORE)
  } catch {
    /* ignore */
  }
}
export const hasApiKey = () => !!getApiKey()

export const getModel = () => safeGet(MODEL_STORE) || DEFAULT_MODEL
export const setModel = (m) => {
  try {
    localStorage.setItem(MODEL_STORE, m)
  } catch {
    /* ignore */
  }
}

// Cache des explications "Pourquoi cette fac" (par id de fac) pour ne pas re-payer.
export function loadWhyCache() {
  try {
    return JSON.parse(localStorage.getItem(WHY_STORE) || '{}')
  } catch {
    return {}
  }
}
export function saveWhy(id, text) {
  try {
    const c = loadWhyCache()
    c[id] = text
    localStorage.setItem(WHY_STORE, JSON.stringify(c))
  } catch {
    /* ignore */
  }
}

// Niveau du joueur (FR ou EN) à partir du profil auto-évalué.
function levelLabel(profile, lang) {
  const lvl = LEVELS[athleteLevel(profile).level]
  return (lang === 'en' ? lvl.labelEn : lvl.label) || ''
}

// Poste(s) du joueur, en texte (ou repli si non renseigné).
function positionsText(profile, lang) {
  const list = Array.isArray(profile.positions) ? profile.positions.filter(Boolean) : []
  if (list.length) return list.join(', ')
  return lang === 'en' ? 'position to be specified' : 'poste à préciser'
}

// Résumé des dernières saisons (FR ou EN) à partir des stats enregistrées.
// Ex : « 2024-25 · RSCA U19 · 22 matchs, 9 buts, 6 passes ».
function seasonsSummary(lang) {
  const en = lang === 'en'
  return loadSeasons()
    .filter((s) => s && (s.season || s.club || s.league || s.apps || s.goals || s.assists))
    .slice(0, 3)
    .map((s) => {
      const head = [s.season, s.club, s.league].filter(Boolean).join(' · ')
      const stat = [
        s.apps ? `${s.apps} ${en ? 'apps' : 'matchs'}` : null,
        s.goals ? `${s.goals} ${en ? 'goals' : 'buts'}` : null,
        s.assists ? `${s.assists} ${en ? 'assists' : 'passes'}` : null,
      ]
        .filter(Boolean)
        .join(', ')
      return [head, stat].filter(Boolean).join(' · ')
    })
    .filter(Boolean)
    .join(' ; ')
}

// --- Appel générique ---
export async function callClaude({ system, prompt, maxTokens = 700 }) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_KEY')
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const resp = await client.messages.create({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })
  return resp.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

// --- (1) Pourquoi cette fac me correspond (français) ---
export function explainFit(profile, u) {
  const system =
    "Tu es un conseiller en recrutement universitaire américain (NCAA), spécialiste du football (soccer) masculin. Tu réponds en FRANÇAIS, en 3 à 4 phrases, de façon concrète, honnête et motivante. Tu ne survends pas : tu tiens compte du niveau réel du joueur et de la catégorie (Réaliste/Objectif/Ambitieux). Termine par un conseil actionnable."
  const prompt = `Profil du joueur :
- Joueur de football belge, entrée fac visée automne ${profile.usEntryYear}. Poste(s) : ${positionsText(profile, 'fr')}.
- Niveau actuel : ${levelLabel(profile, 'fr')}.
- Stats récentes : ${seasonsSummary('fr') || 'à compléter'}.
- Objectif d'études : ${profile.major || 'à préciser'}.

Université à évaluer : ${u.name} (${u.shortName}) — Division ${u.division}, conférence ${u.conference}, ${u.city} (${u.state}).
Notes /5 : force du programme de foot ${u.soccer}, ambiance sportive ${u.athletics}. Coût ~${Math.round(u.costUSD / 1000)}k$/an. Score de compatibilité : ${u.match}/100. Catégorie de recrutement : ${u.fit?.label}.

Explique pourquoi cette fac correspond (ou pas) à ${profile.name}, et donne un conseil.`
  return callClaude({ system, prompt, maxTokens: 500 })
}

// --- (2) Email de recrutement à un coach (anglais) ---
export function draftCoachEmail(profile, contact) {
  const system =
    "You help a Belgian men's soccer player write a recruiting email to a US college men's soccer coach. Write in ENGLISH, ~150-180 words, authentic and specific (not generic). Be polite and confident. Include: a short intro (who he is, Belgian, grad/entry year), his position(s), his playing level, his key recent season stats, his academic interest (major), a mention of his highlight video (ask the coach to watch it), and a clear ask (interest + how to proceed / questionnaire). Output a SUBJECT line then the email body. Keep it ready to send."
  const coach = contact.coachName ? `Coach ${contact.coachName}` : 'the coaching staff'
  const prompt = `Player:
- Name: ${profile.name}. Nationality: Belgian. Target US enrollment: Fall ${profile.usEntryYear}.
- Position(s): ${positionsText(profile, 'en')}. Playing level: ${levelLabel(profile, 'en')}.
- Plays for ${profile.homeClub || 'his current club'}${profile.coach ? ` (coach ${profile.coach})` : ''}.
- Recent season stats: ${seasonsSummary('en') || '(to be added)'}.
- Intended major: ${profile.majorEn || profile.major || 'to be confirmed'}.
- Has a highlight video to share.

Write the email TO ${coach} at ${contact.school || 'the university'}.`
  return callClaude({ system, prompt, maxTokens: 700 })
}

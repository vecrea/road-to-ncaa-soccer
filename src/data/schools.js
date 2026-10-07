// ---------------------------------------------------------------------------
// Liste complète des facs = facs CURÉES (notes détaillées, coachs vérifiés)
// + un ANNUAIRE (directory.json) de programmes de FOOT MASCULIN NCAA D1/D2/D3.
// Les fiches annuaire ont des notes de base (niveau foot déduit de la division)
// — clairement marquées curated:false.
// ---------------------------------------------------------------------------

import { universities as CURATED } from './universities.js'
import directory from './directory.json'

// Niveau de foot indicatif par division (fiches annuaire, à vérifier).
const SOCCER_BY_DIV = { D1: 4, D2: 3, D3: 2 }
const ATHLETICS_DEFAULT = 3

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const curatedKeys = new Set(CURATED.flatMap((c) => [norm(c.name), norm(c.shortName)]))

function normalize(d) {
  const div = d.division || 'D1'
  return {
    id: 'dir-' + slug(d.shortName || d.name),
    name: d.name,
    shortName: d.shortName || d.name,
    city: d.city || '',
    state: d.state || '',
    division: div,
    conference: d.conference || '—',
    type: d.type || '',
    enrollment: 0,
    sizeLabel: '',
    soccer: SOCCER_BY_DIV[div] ?? 3,
    athletics: ATHLETICS_DEFAULT,
    costUSD: d.type === 'Privée' ? 70000 : 45000,
    scholarshipNote:
      div === 'D3' ? 'Pas de bourse sportive (D3) ; aides au mérite possibles' : 'Bourses sportives possibles (à vérifier)',
    soccerNote: 'Fiche annuaire — infos de base, à vérifier via les liens (staff, site).',
    highlights: [],
    curated: false,
  }
}

const seen = new Set()
const dirNormalized = []
for (const d of directory) {
  const key = norm(d.name)
  if (!key || curatedKeys.has(key) || curatedKeys.has(norm(d.shortName)) || seen.has(key)) continue
  seen.add(key)
  dirNormalized.push(normalize(d))
}

export const universities = [...CURATED.map((u) => ({ ...u, curated: true })), ...dirNormalized]
export const DIRECTORY_COUNT = dirNormalized.length
export const CURATED_COUNT = CURATED.length

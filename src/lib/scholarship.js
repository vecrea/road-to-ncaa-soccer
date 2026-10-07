// ---------------------------------------------------------------------------
// Potentiel de bourse « complète » par université (football masculin).
//
// Rappel : le foot masculin est un sport « à équivalence » (~9,9 bourses en D1,
// ~9 en D2, partagées sur tout l'effectif). Une bourse complète est donc RARE
// et réservée aux profils vraiment recrutés. D3 & Ivy = pas de bourse sportive
// (mais le mérite / l'aide au besoin peuvent couvrir beaucoup dans les facs cotées).
//
// On DÉDUIT le potentiel des données (division, force du programme / du
// département sportif, prestige académique) pour rester honnête.
// ---------------------------------------------------------------------------

// Majuscule sur la 1re lettre uniquement (évite « Complète Possible » du CSS capitalize).
export const capFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const HIGH = { key: 'high', color: '#16a34a' }
const PARTIAL = { key: 'partial', color: '#f59e0b' }
const MERIT = { key: 'merit', color: '#94a3b8' }

export function scholarshipPotential(u) {
  const conf = (u.conference || '').toLowerCase()
  const isIvy = conf.includes('ivy')
  const isService = /army|navy|air force/i.test(u.shortName || '')

  // ---- Académie militaire : scolarité couverte, mais engagement de service ----
  if (isService) {
    return {
      ...HIGH,
      label: 'scolarité couverte',
      labelEn: 'tuition covered',
      note: 'Académie militaire : pas de frais de scolarité, mais engagement de service après le diplôme. Cas très particulier.',
      noteEn: 'Service academy: no tuition fees, but a service commitment after graduation. Very specific case.',
    }
  }

  // ---- Ivy League : aucune bourse sportive, uniquement de l'aide au besoin ----
  if (isIvy) {
    return {
      ...MERIT,
      label: 'aide au besoin (Ivy)',
      labelEn: 'need-based (Ivy)',
      note: 'Les facs Ivy n’offrent pas de bourse sportive : seulement de l’aide financière selon les revenus familiaux (need-based).',
      noteEn: 'Ivy schools offer no athletic scholarship: only need-based financial aid tied to family income.',
    }
  }

  // ---- Division 3 : pas de bourse sportive, tout passe par le mérite ----
  if (u.division === 'D3') {
    if (u.strongAid) {
      return {
        ...HIGH,
        label: 'quasi complète (mérite)',
        labelEn: 'near-full (merit)',
        note: 'Pas de bourse sportive (D3), mais de fortes aides au mérite/besoin : un excellent dossier scolaire peut couvrir l’essentiel du coût.',
        noteEn: 'No athletic scholarship (D3), but strong merit/need-based aid: an excellent academic record can cover most of the cost.',
      }
    }
    return {
      ...MERIT,
      label: 'mérite uniquement',
      labelEn: 'merit aid only',
      note: 'Pas de bourse sportive (D3) : le financement passe uniquement par les aides au mérite (souvent partielles pour un international).',
      noteEn: 'No athletic scholarship (D3): funding comes only from merit aid (often partial for an international).',
    }
  }

  // ---- Division 1 : gros programme financé → bourse complète atteignable ----
  if (u.division === 'D1' && (u.athletics >= 4 || u.soccer >= 5)) {
    return {
      ...HIGH,
      label: 'complète possible',
      labelEn: 'full ride possible',
      note: 'Programme D1 financé : une bourse complète est atteignable pour un profil vraiment recruté (le plus souvent partielle sinon), et cumulable avec des aides au mérite.',
      noteEn: 'Funded D1 program: a full ride is reachable for a genuinely recruited profile (otherwise usually partial), and can be stacked with merit aid.',
    }
  }

  // ---- Reste (D1 mid-major, D2, fiches annuaire) : surtout partiel ----
  return {
    ...PARTIAL,
    label: 'partielle probable',
    labelEn: 'usually partial',
    note: 'Foot = sport à équivalence (~9,9 bourses en D1 partagées sur l’effectif) : les offres sont surtout partielles, le complet étant réservé aux profils d’élite. Un bon dossier scolaire aide à compléter.',
    noteEn: 'Soccer is an equivalency sport (~9.9 D1 scholarships shared across the roster): offers are mostly partial, with full rides reserved for elite profiles. A strong academic record helps top it up.',
  }
}

import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Filters from './components/Filters.jsx'
import UniversityCard from './components/UniversityCard.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import Compare from './components/Compare.jsx'
import Budget from './components/Budget.jsx'
import AthleteSheet from './components/AthleteSheet.jsx'
import Gpa from './components/Gpa.jsx'
import Dashboard from './components/Dashboard.jsx'
import StatsTracker from './components/StatsTracker.jsx'
import Coaches from './components/Coaches.jsx'
import Steps from './components/Steps.jsx'
import Ia from './components/Ia.jsx'
import AboutMe from './components/AboutMe.jsx'
import { profile } from './data/profile.js'
import { universities } from './data/schools.js'
import { computeMatches } from './lib/score.js'
import { loadFavorites, saveFavorites, loadTheme, saveTheme, loadProfileExtras } from './lib/storage.js'
import { useLang } from './lib/i18n.jsx'
import { localizeUni } from './data/uni-en.js'

export default function App() {
  const { t, lang } = useLang()
  const [tab, setTab] = useState('home')
  const [theme, setTheme] = useState(() => loadTheme())
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [filters, setFilters] = useState({
    search: '',
    division: 'all',
    type: 'all',
    fit: 'all',
    sort: 'match',
    curatedOnly: false,
  })

  useEffect(() => saveFavorites(favorites), [favorites])

  // Applique le thème sur <html> (data-theme) et le mémorise.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  // Profil effectif = profil de base + réglages éditables de Nicolas (niveau,
  // priorités, identité…) sauvegardés en local. Pris en compte au chargement.
  const effProfile = useMemo(() => {
    const x = loadProfileExtras()
    const p = { ...profile, physical: { ...profile.physical } }
    if (x.level != null && x.level !== '') p.level = Number(x.level)
    if (x.weights && typeof x.weights === 'object') {
      const w = { sport: Number(x.weights.sport) || 0, lifestyle: Number(x.weights.lifestyle) || 0, cost: Number(x.weights.cost) || 0 }
      const sum = w.sport + w.lifestyle + w.cost
      if (sum > 0) p.weights = { sport: w.sport / sum, lifestyle: w.lifestyle / sum, cost: w.cost / sum }
    }
    if (x.positions) p.positions = String(x.positions).split(',').map((s) => s.trim()).filter(Boolean)
    if (x.major) p.major = x.major
    if (x.homeClub) p.homeClub = x.homeClub
    if (x.coach) p.coach = x.coach
    if (x.birthDate) p.birthDate = x.birthDate
    if (x.heightCm) p.physical.heightCm = x.heightCm
    if (x.weightKg) p.physical.weightKg = x.weightKg
    if (x.foot) p.physical.foot = x.foot
    return p
  }, [])

  const matches = useMemo(() => computeMatches(effProfile, universities), [effProfile])

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    let list = matches.filter((u) => {
      if (filters.division !== 'all' && u.division !== filters.division) return false
      if (filters.type !== 'all' && u.type !== filters.type) return false
      if (filters.fit !== 'all' && u.fit.key !== filters.fit) return false
      if (filters.curatedOnly && !u.curated) return false
      if (q) {
        const hay = `${u.name} ${u.shortName} ${u.city} ${u.state} ${u.conference}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    if (filters.sort === 'cost') list = [...list].sort((a, b) => a.costUSD - b.costUSD)
    else if (filters.sort === 'soccer') list = [...list].sort((a, b) => b.soccer - a.soccer || b.match - a.match)
    return list
  }, [matches, filters])

  const favUnis = useMemo(() => matches.filter((u) => favorites.has(u.id)), [matches, favorites])

  // Versions localisées (FR/EN) pour l'affichage — le scoring/filtre reste neutre.
  const filteredLoc = useMemo(() => filtered.map((u) => localizeUni(u, lang)), [filtered, lang])
  const favLoc = useMemo(() => favUnis.map((u) => localizeUni(u, lang)), [favUnis, lang])
  const matchesLoc = useMemo(() => matches.map((u) => localizeUni(u, lang)), [matches, lang])

  const topMatch = matches[0]
  const counts = useMemo(
    () => ({
      safety: matches.filter((u) => u.fit.key === 'safety').length,
      target: matches.filter((u) => u.fit.key === 'target').length,
      reach: matches.filter((u) => u.fit.key === 'reach').length,
    }),
    [matches],
  )

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <div className="space-y-4">
            <Dashboard profile={effProfile} matches={matchesLoc} favCount={favorites.size} setTab={setTab} />
            <AboutMe profile={effProfile} />
          </div>
        )
      case 'ranking':
        return (
          <section className="panel overflow-hidden">
            {/* Bandeau de stats — cellules séparées par des filets, pas des cartes */}
            <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: 'var(--border)' }}>
              <StatCell label={t('Meilleur match', 'Best match')} value={`${topMatch.match}`} sub={topMatch.shortName} accent="#16a34a" />
              <StatCell label={t('Réalistes', 'Safety')} value={counts.safety} sub={t('dans tes cordes', 'in your range')} accent="#16a34a" />
              <StatCell label={t('Objectifs', 'Targets')} value={counts.target} sub={t('à ta portée', 'within reach')} accent="#0ea5e9" />
              <StatCell label={t('Ambitieux', 'Reach')} value={counts.reach} sub={t('la Road to D1', 'the Road to D1')} accent="#f59e0b" />
            </div>

            {/* Filtres */}
            <div className="border-t border-hair p-4 sm:p-5">
              <Filters filters={filters} setFilters={setFilters} count={filtered.length} />
            </div>

            {/* Liste des universités — lignes séparées par un filet */}
            {filtered.length === 0 ? (
              <p className="border-t border-hair p-10 text-center text-secondary">
                {t('Aucune université ne correspond à ces filtres.', 'No university matches these filters.')}
              </p>
            ) : (
              <div className="row-list">
                {filteredLoc.map((u) => (
                  <UniversityCard key={u.id} u={u} profile={effProfile} isFav={favorites.has(u.id)} onToggleFav={toggleFav} />
                ))}
              </div>
            )}
          </section>
        )
      case 'favorites':
        return (
          <section className="panel overflow-hidden">
            {favUnis.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-heading">{t('Pas encore de favoris', 'No favorites yet')}</p>
                <p className="mt-1 text-sm text-secondary">
                  {t("Clique sur l'étoile d'une fac dans le classement pour la sauvegarder ici.", 'Click a school’s star in the rankings to save it here.')}
                </p>
              </div>
            ) : (
              <div className="row-list">
                {favLoc.map((u) => (
                  <UniversityCard key={u.id} u={u} profile={effProfile} isFav onToggleFav={toggleFav} />
                ))}
              </div>
            )}
          </section>
        )
      case 'compare':
        return <Compare unis={favLoc} onToggleFav={toggleFav} />
      case 'budget':
        return <Budget schools={matchesLoc} favorites={favorites} />
      case 'sheet':
        return <AthleteSheet profile={effProfile} />
      case 'gpa':
        return <Gpa />
      case 'stats':
        return <StatsTracker profile={effProfile} />
      case 'coaches':
        return <Coaches unis={matchesLoc} favorites={favorites} profile={effProfile} />
      case 'steps':
        return <Steps />
      case 'ia':
        return <Ia />
      case 'profile':
        return <ProfileCard profile={effProfile} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Header tab={tab} setTab={setTab} favCount={favorites.size} theme={theme} setTheme={setTheme} />

      <main className="mx-auto px-5 lg:px-8 xl:px-12 py-6">
        {/* key={tab} : le contenu se remonte à chaque onglet → l'animation se rejoue */}
        <div key={tab} className="animate-tab">
          {renderTab()}
        </div>
      </main>

      <footer className="no-print mx-auto px-5 lg:px-8 xl:px-12 pb-10">
        <div className="px-1 text-xs text-secondary">
          {t(
            "Données indicatives (MVP). La sélection d'universités, les coûts et la force des programmes de foot sont une première base à vérifier sur les rosters/sites officiels avant tout contact. Prochaine étape : enrichissement des critères + suivi des démarches et IA.",
            'Indicative data (MVP). The university selection, costs and soccer-program strength are a first basis to verify against official rosters/sites before any contact. Next step: richer criteria + steps tracking and AI.',
          )}
        </div>
        <p className="mt-3 text-center text-xs text-tertiary">
          Road to NCAA · {t('fait pour', 'made for')} {effProfile.name}
        </p>
      </footer>
    </div>
  )
}

// Cellule de stat (dans le bandeau du classement) — pas de carte, juste du contenu.
function StatCell({ label, value, sub, accent }) {
  return (
    <div className="surface p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{label}</div>
      <div className="mt-1 font-display text-3xl font-black" style={{ color: accent }}>{value}</div>
      <div className="truncate text-xs text-secondary">{sub}</div>
    </div>
  )
}

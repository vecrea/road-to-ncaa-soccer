import { useState } from 'react'
import { loadProfileExtras, saveProfileExtras, loadSeasons, saveSeasons, loadPalmares, savePalmares } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const rid = () => 'r' + Date.now() + Math.random().toString(36).slice(2, 6)
const num = (x) => {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

// Pied fort : valeur canonique stockée (bilingue à l'affichage).
const FOOT = [
  { v: 'right', fr: 'Droit', en: 'Right' },
  { v: 'left', fr: 'Gauche', en: 'Left' },
  { v: 'both', fr: 'Ambidextre', en: 'Both' },
]

// Tri des saisons (ex. « 2024-25 ») — numérique, du plus récent au plus ancien.
const bySeasonDesc = (a, b) => String(b.season).localeCompare(String(a.season), undefined, { numeric: true })

// Petite métrique chiffrée (buts / passes mis en avant).
function Metric({ label, value, color, big }) {
  return (
    <div className="text-center">
      <div
        className={(big ? 'text-xl' : 'text-lg') + ' font-display font-black leading-none' + (color ? '' : ' text-heading')}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">{label}</div>
    </div>
  )
}

export default function StatsTracker() {
  const { t } = useLang()

  // --- Section 1 : profil joueur (stocké dans profileExtras, sauvegarde immédiate) ---
  const [extras, setExtras] = useState(() => loadProfileExtras())
  const setField = (k, v) =>
    setExtras((e) => {
      const next = { ...e, [k]: v }
      saveProfileExtras(next)
      return next
    })

  // --- Section 2 : stats par saison ---
  const EMPTY_SEASON = { season: '', club: '', league: '', apps: '', goals: '', assists: '', note: '' }
  const [seasons, setSeasons] = useState(() => loadSeasons())
  const [sForm, setSForm] = useState(EMPTY_SEASON)
  const setS = (patch) => setSForm((f) => ({ ...f, ...patch }))
  const addSeason = () => {
    if (!sForm.season.trim()) return
    const entry = {
      id: rid(),
      season: sForm.season.trim(),
      club: sForm.club.trim(),
      league: sForm.league.trim(),
      apps: sForm.apps,
      goals: sForm.goals,
      assists: sForm.assists,
      note: sForm.note.trim(),
    }
    const next = [...seasons, entry]
    setSeasons(next)
    saveSeasons(next)
    setSForm(EMPTY_SEASON)
  }
  const removeSeason = (id) => {
    const next = seasons.filter((s) => s.id !== id)
    setSeasons(next)
    saveSeasons(next)
  }

  // --- Section 3 : palmarès & sélections ---
  const [palmares, setPalmares] = useState(() => loadPalmares())
  const [pForm, setPForm] = useState({ year: '', text: '' })
  const addPalmares = () => {
    if (!pForm.text.trim()) return
    const next = [...palmares, { id: rid(), year: pForm.year.trim(), text: pForm.text.trim() }]
    setPalmares(next)
    savePalmares(next)
    setPForm({ year: '', text: '' })
  }
  const removePalmares = (id) => {
    const next = palmares.filter((p) => p.id !== id)
    setPalmares(next)
    savePalmares(next)
  }

  const seasonsSorted = [...seasons].sort(bySeasonDesc)
  const palmaresSorted = [...palmares].sort((a, b) => String(b.year).localeCompare(String(a.year), undefined, { numeric: true }))
  const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-tertiary'

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Intro */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Mes stats', 'My stats')}</h2>
          <p className="text-sm text-secondary">
            {t(
              'Ton profil joueur, tes statistiques par saison et ton palmarès — la base que les coachs regardent en premier.',
              'Your player profile, season-by-season stats and honours — the first things coaches look at.',
            )}
          </p>
        </div>

        {/* 1 · Profil joueur */}
        <div className="border-t border-hair p-5 sm:p-6">
          <h3 className="font-display text-lg font-extrabold text-heading">{t('Mon profil joueur', 'Player profile')}</h3>
          <p className="mt-1 text-sm text-secondary">{t('Modifié en direct, sauvegardé automatiquement.', 'Edited live, saved automatically.')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block sm:col-span-2 lg:col-span-1">
              <span className={labelCls}>{t('Poste(s)', 'Position(s)')}</span>
              <input
                value={extras.positions ?? ''}
                onChange={(e) => setField('positions', e.target.value)}
                placeholder={t('ex. Milieu central, Ailier droit', 'e.g. Central midfield, Right wing')}
                className="field"
              />
            </label>
            <label className="block">
              <span className={labelCls}>{t('Pied fort', 'Strong foot')}</span>
              <select value={extras.foot ?? ''} onChange={(e) => setField('foot', e.target.value)} className="field">
                <option value="">{t('À préciser', 'TBD')}</option>
                {FOOT.map((f) => (
                  <option key={f.v} value={f.v}>{t(f.fr, f.en)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>{t('Taille (cm)', 'Height (cm)')}</span>
              <input type="number" inputMode="numeric" min="100" max="230" value={extras.heightCm ?? ''} onChange={(e) => setField('heightCm', e.target.value)} placeholder="178" className="field" />
            </label>
            <label className="block">
              <span className={labelCls}>{t('Poids (kg)', 'Weight (kg)')}</span>
              <input type="number" inputMode="numeric" min="30" max="150" value={extras.weightKg ?? ''} onChange={(e) => setField('weightKg', e.target.value)} placeholder="70" className="field" />
            </label>
          </div>
        </div>

        {/* 2 · Stats par saison */}
        <div className="border-t border-hair p-5 sm:p-6">
          <h3 className="font-display text-lg font-extrabold text-heading">{t('Stats par saison', 'Season stats')}</h3>
          <p className="mt-1 text-sm text-secondary">{t('Club, division, matchs joués, buts et passes décisives.', 'Club, division, games played, goals and assists.')}</p>

          {/* Formulaire d'ajout */}
          <div className="mt-4 rounded-2xl surface-2 border border-hair p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className={labelCls}>{t('Saison', 'Season')}</span>
                <input value={sForm.season} onChange={(e) => setS({ season: e.target.value })} placeholder="2024-25" className="field" />
              </label>
              <label className="block">
                <span className={labelCls}>{t('Club', 'Club')}</span>
                <input value={sForm.club} onChange={(e) => setS({ club: e.target.value })} placeholder={t('ex. RSC Anderlecht U17', 'e.g. RSC Anderlecht U17')} className="field" />
              </label>
              <label className="block">
                <span className={labelCls}>{t('Division / ligue', 'League / division')}</span>
                <input value={sForm.league} onChange={(e) => setS({ league: e.target.value })} placeholder={t('ex. U17 Élite', 'e.g. U17 Elite')} className="field" />
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className={labelCls}>{t('Matchs', 'Games played')}</span>
                <input type="number" inputMode="numeric" min="0" value={sForm.apps} onChange={(e) => setS({ apps: e.target.value })} placeholder="0" className="field" />
              </label>
              <label className="block">
                <span className={labelCls}>{t('Buts', 'Goals')}</span>
                <input type="number" inputMode="numeric" min="0" value={sForm.goals} onChange={(e) => setS({ goals: e.target.value })} placeholder="0" className="field" />
              </label>
              <label className="block">
                <span className={labelCls}>{t('Passes décisives', 'Assists')}</span>
                <input type="number" inputMode="numeric" min="0" value={sForm.assists} onChange={(e) => setS({ assists: e.target.value })} placeholder="0" className="field" />
              </label>
            </div>
            <label className="mt-3 block">
              <span className={labelCls}>{t('Note (optionnel)', 'Note (optional)')}</span>
              <input value={sForm.note} onChange={(e) => setS({ note: e.target.value })} placeholder={t('ex. capitaine, meilleur buteur…', 'e.g. captain, top scorer…')} className="field" />
            </label>
            <div className="mt-3">
              <button
                onClick={addSeason}
                disabled={!sForm.season.trim()}
                className="rounded-full bg-pool-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pool-600 disabled:opacity-50"
              >
                {t('+ Ajouter la saison', '+ Add season')}
              </button>
            </div>
          </div>

          {/* Liste des saisons (plus récentes en premier) */}
          {seasons.length === 0 ? (
            <p className="mt-4 rounded-xl surface-2 border border-hair p-4 text-center text-sm text-tertiary">
              {t('Aucune saison enregistrée pour l’instant.', 'No seasons logged yet.')}
            </p>
          ) : (
            <div className="row-list mt-4 overflow-hidden rounded-2xl border border-hair">
              {seasonsSorted.map((s) => (
                <div key={s.id} className="flex items-center gap-3 surface p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-base font-black text-heading">{s.season}</span>
                      {s.club && <span className="truncate text-sm font-semibold text-primary">{s.club}</span>}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-secondary">
                      {[s.league, s.note].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <Metric label={t('M', 'GP')} value={num(s.apps)} />
                    <Metric label={t('Buts', 'Goals')} value={num(s.goals)} color="#0e88d3" big />
                    <Metric label={t('Passes', 'Assists')} value={num(s.assists)} color="#d1971f" big />
                  </div>
                  <button onClick={() => removeSeason(s.id)} className="shrink-0 text-tertiary transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3 · Palmarès & sélections */}
        <div className="border-t border-hair p-5 sm:p-6">
          <h3 className="font-display text-lg font-extrabold text-heading">{t('Palmarès & sélections', 'Honours & call-ups')}</h3>
          <p className="mt-1 text-sm text-secondary">{t('Titres, trophées, sélections en équipe nationale jeunes, tournois…', 'Titles, trophies, youth national-team call-ups, tournaments…')}</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block sm:w-28">
              <span className={labelCls}>{t('Année', 'Year')}</span>
              <input value={pForm.year} onChange={(e) => setPForm((f) => ({ ...f, year: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addPalmares() }} placeholder="2025" className="field" />
            </label>
            <label className="block flex-1">
              <span className={labelCls}>{t('Distinction', 'Honour')}</span>
              <input
                value={pForm.text}
                onChange={(e) => setPForm((f) => ({ ...f, text: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') addPalmares() }}
                placeholder={t('ex. Champion provincial U16, sélection Diables Rouges U15…', 'e.g. Provincial U16 champion, Belgium U15 call-up…')}
                className="field"
              />
            </label>
            <button
              onClick={addPalmares}
              disabled={!pForm.text.trim()}
              className="rounded-full bg-pool-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pool-600 disabled:opacity-50 sm:shrink-0"
            >
              {t('Ajouter', 'Add')}
            </button>
          </div>

          {palmares.length === 0 ? (
            <p className="mt-4 rounded-xl surface-2 border border-hair p-4 text-center text-sm text-tertiary">
              {t('Aucune distinction enregistrée pour l’instant.', 'No honours logged yet.')}
            </p>
          ) : (
            <ul className="row-list mt-4 overflow-hidden rounded-2xl border border-hair">
              {palmaresSorted.map((p) => (
                <li key={p.id} className="flex items-center gap-3 surface p-3 sm:px-4">
                  {p.year && <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 font-display text-xs font-black text-accent">{p.year}</span>}
                  <span className="min-w-0 flex-1 text-sm font-medium text-primary">{p.text}</span>
                  <button onClick={() => removePalmares(p.id)} className="shrink-0 text-tertiary transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Ces informations alimentent ton tableau de bord et ta « présentation » (le lien que tu envoies aux coachs). Tout reste sur cet appareil.',
          'This data feeds your dashboard and your “About me” page (the link you send to coaches). Everything stays on this device.',
        )}
      </p>
    </div>
  )
}

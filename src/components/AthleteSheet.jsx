import { useEffect, useState } from 'react'
import { loadProfileExtras, saveProfileExtras, loadSeasons } from '../lib/storage.js'
import { LEVELS } from '../lib/level.js'
import { useLang } from '../lib/i18n.jsx'

const L = {
  en: {
    classOf: 'Class of', player: 'Soccer player', from: 'from',
    academics: 'Academics', school: 'School', major: 'Intended major',
    gpa: 'GPA / average', sat: 'SAT / ACT', english: 'English test', about: 'About me',
    soccer: 'Soccer', positions: 'Position(s)', foot: 'Strong foot',
    height: 'Height', weight: 'Weight', club: 'Club', coach: 'Coach', level: 'Level',
    seasonStats: 'Season stats', season: 'Season', apps: 'Apps', goals: 'Goals', assists: 'Assists',
    seasonsTodo: 'Season stats: to complete in “My stats”.',
    video: 'Video', footer: 'Recruiting profile', notSet: '—',
  },
  fr: {
    classOf: 'Promo', player: 'Footballeur', from: 'de',
    academics: 'Académique', school: 'Établissement', major: 'Filière visée',
    gpa: 'Moyenne / GPA', sat: 'SAT / ACT', english: "Test d'anglais", about: 'À propos',
    soccer: 'Football', positions: 'Poste(s)', foot: 'Pied fort',
    height: 'Taille', weight: 'Poids', club: 'Club', coach: 'Coach', level: 'Niveau',
    seasonStats: 'Stats par saison', season: 'Saison', apps: 'Matchs', goals: 'Buts', assists: 'Passes',
    seasonsTodo: 'Stats par saison : à compléter dans « Mes stats ».',
    video: 'Vidéo', footer: 'Fiche de recrutement', notSet: '—',
  },
}

const DEFAULT_BIO_EN =
  "Belgian footballer aiming to join a US university (NCAA) in Fall 2028. My goal is to combine a strong academic path with high-level soccer in the United States — motivated, coachable and determined to keep improving on the pitch and in the classroom."

const DEFAULT_BIO_FR =
  "Footballeur belge, je vise une université américaine (NCAA) à la rentrée 2028. Mon objectif : allier des études supérieures solides et le football au plus haut niveau aux États-Unis — motivé, à l'écoute et déterminé à progresser sur le terrain comme en cours."

const FOOT = { right: { fr: 'Droit', en: 'Right' }, left: { fr: 'Gauche', en: 'Left' }, both: { fr: 'Ambidextre', en: 'Both' } }

const FIELDS = [
  { key: 'email', label: { fr: 'Email', en: 'Email' }, ph: { fr: 'nicolas@email.com', en: 'nicolas@email.com' } },
  { key: 'phone', label: { fr: 'Téléphone', en: 'Phone' }, ph: { fr: '+32 ...', en: '+32 ...' } },
  { key: 'city', label: { fr: 'Ville (Belgique)', en: 'City (Belgium)' }, ph: { fr: 'Bruxelles', en: 'Brussels' } },
  { key: 'positions', label: { fr: 'Poste(s)', en: 'Position(s)' }, ph: { fr: 'ex. Milieu central', en: 'e.g. Central midfielder' } },
  { key: 'homeClub', label: { fr: 'Club', en: 'Club' }, ph: { fr: 'Ton club actuel', en: 'Your current club' } },
  { key: 'coachName', label: { fr: 'Coach', en: 'Coach' }, ph: { fr: 'Nom du coach', en: 'Coach name' } },
  { key: 'heightCm', label: { fr: 'Taille (cm)', en: 'Height (cm)' }, ph: { fr: 'ex. 178', en: 'e.g. 178' } },
  { key: 'weightKg', label: { fr: 'Poids (kg)', en: 'Weight (kg)' }, ph: { fr: 'ex. 70', en: 'e.g. 70' } },
  { key: 'average', label: { fr: 'Moyenne / GPA', en: 'GPA / average' }, ph: { fr: 'ex. 15/20', en: 'e.g. 15/20' } },
  { key: 'sat', label: { fr: 'SAT / ACT', en: 'SAT / ACT' }, ph: { fr: 'à venir', en: 'coming soon' } },
  { key: 'english', label: { fr: "Test d'anglais", en: 'English test' }, ph: { fr: 'TOEFL / Duolingo à venir', en: 'TOEFL / Duolingo coming' } },
  { key: 'videoUrl', label: { fr: 'Vidéo (lien)', en: 'Video (link)' }, ph: { fr: 'https://youtube.com/...', en: 'https://youtube.com/...' } },
]

export default function AthleteSheet({ profile }) {
  const { lang, t: tr } = useLang()
  const [extras, setExtras] = useState(() => {
    const s = loadProfileExtras()
    return {
      email: '', phone: '', city: '', positions: '', homeClub: '', coachName: '',
      heightCm: '', weightKg: '', foot: '', average: '', sat: '', english: '', videoUrl: '',
      ...s,
      // Message « à propos » distinct par langue (migration de l'ancien champ `bio` -> version anglaise).
      bioFr: s.bioFr ?? DEFAULT_BIO_FR,
      bioEn: s.bioEn ?? s.bio ?? DEFAULT_BIO_EN,
    }
  })
  // Stats par saison (saisies dans l'onglet « Mes stats ») — instantané pour la fiche.
  const [seasons] = useState(() => loadSeasons())

  useEffect(() => saveProfileExtras(extras), [extras])
  const set = (k, v) => setExtras((e) => ({ ...e, [k]: v }))
  const t = L[lang]
  const v = (x) => (x && String(x).trim() ? x : t.notSet)
  const num = (x) => (x != null && String(x).trim() !== '' ? x : '—')
  const withUnit = (x, unit) => (x && String(x).trim() ? `${x} ${unit}` : t.notSet)
  const lvl = LEVELS[profile.level] ?? LEVELS[3]

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden print-sheet mx-auto max-w-3xl">
        {/* Barre d'actions (non imprimee) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-heading">{tr('Ta fiche athlète', 'Your athlete sheet')}</h2>
            <p className="text-sm text-secondary">
              {tr(
                'À envoyer aux coachs US. Remplis les champs, puis exporte en PDF. (Suit la langue du site — passe en EN pour les coachs.)',
                'To send to US coaches. Fill in the fields, then export to PDF. (Follows the site language — switch to EN for coaches.)',
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-flag-600"
            >
              {tr('Exporter / Imprimer (PDF)', 'Export / Print (PDF)')}
            </button>
          </div>
        </div>

        {/* Panneau d'edition (non imprime) */}
        <div className="no-print border-t border-hair p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tertiary">{tr('Compléter ta fiche', 'Complete your sheet')}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="text-xs font-medium text-secondary">{f.label[lang]}</span>
                <input
                  value={extras[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.ph[lang]}
                  className="field mt-1"
                />
              </label>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-medium text-secondary">{t.about} — {tr('version française', 'English version')}</span>
            <textarea
              value={lang === 'en' ? extras.bioEn : extras.bioFr}
              onChange={(e) => set(lang === 'en' ? 'bioEn' : 'bioFr', e.target.value)}
              rows={3}
              className="field mt-1"
            />
          </label>
        </div>

        {/* ---------- LA FICHE (bandeau navy imprimable) ---------- */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white print:bg-navy-900">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-black leading-none">{profile.name}</h1>
              <p className="mt-1 text-white">
                {t.classOf} {profile.usEntryYear} · {t.player} · {t.from} {v(extras.city)}, Belgium
              </p>
            </div>
            <div className="text-right text-sm text-white">
              <div>{v(extras.email)}</div>
              <div>{v(extras.phone)}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Académique + à propos */}
          <section>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-flag-600">{t.academics}</h3>
            <dl className="space-y-1 text-sm">
              <Row k={t.school} val={lang === 'en' ? profile.currentGradeEn : profile.currentGrade} />
              <Row k={t.major} val={v(lang === 'en' ? profile.majorEn : profile.major)} />
              <Row k={t.gpa} val={v(extras.average)} />
              <Row k={t.sat} val={v(extras.sat)} />
              <Row k={t.english} val={extras.english?.trim() ? extras.english : lang === 'en' ? profile.englishTestEn : profile.englishTest} />
            </dl>

            <h3 className="mb-2 mt-5 font-display text-sm font-extrabold uppercase tracking-wide text-flag-600">{t.about}</h3>
            <p className="text-sm leading-relaxed text-primary">{lang === 'en' ? extras.bioEn : extras.bioFr}</p>
          </section>

          {/* Football */}
          <section>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-accent">{t.soccer}</h3>
            <dl className="space-y-1 text-sm">
              <Row k={t.positions} val={v(extras.positions)} />
              <Row k={t.foot} val={extras.foot && FOOT[extras.foot] ? FOOT[extras.foot][lang] : t.notSet} />
              <Row k={t.height} val={withUnit(extras.heightCm, 'cm')} />
              <Row k={t.weight} val={withUnit(extras.weightKg, 'kg')} />
              <Row k={t.club} val={v(extras.homeClub)} />
              <Row k={t.coach} val={v(extras.coachName)} />
              <Row
                k={t.level}
                val={
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: lvl.color }}>
                    {lang === 'en' ? lvl.shortEn : lvl.short}
                  </span>
                }
              />
            </dl>

            <h3 className="mb-2 mt-5 font-display text-sm font-extrabold uppercase tracking-wide text-accent">{t.seasonStats}</h3>
            {seasons.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-tertiary">
                    <th className="py-1 font-semibold">{t.season}</th>
                    <th className="py-1 font-semibold">{t.club}</th>
                    <th className="py-1 font-semibold" title={t.apps}>M</th>
                    <th className="py-1 font-semibold" title={t.goals}>B</th>
                    <th className="py-1 font-semibold" title={t.assists}>P</th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((s, i) => (
                    <tr key={s.id ?? `${s.season}-${i}`} className="border-t border-hair">
                      <td className="py-1 font-semibold text-heading">{v(s.season)}</td>
                      <td className="py-1 text-primary">{v(s.club)}</td>
                      <td className="py-1 tabular-nums text-secondary">{num(s.apps)}</td>
                      <td className="py-1 tabular-nums text-secondary">{num(s.goals)}</td>
                      <td className="py-1 tabular-nums text-secondary">{num(s.assists)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[13px] text-tertiary">{t.seasonsTodo}</p>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-hair px-6 py-3 text-xs text-tertiary">
          <span>{t.video}: {v(extras.videoUrl)}</span>
          <span>Road to NCAA · {t.footer}</span>
        </div>
      </div>

      <p className="no-print text-center text-xs text-tertiary">
        {tr(
          "Astuce : « Exporter » ouvre l'impression — choisis « Enregistrer en PDF » comme destination.",
          'Tip: “Export” opens the print dialog — choose “Save as PDF” as the destination.',
        )}
      </p>
    </div>
  )
}

function Row({ k, val }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-tertiary">{k}</dt>
      <dd className="text-right font-medium text-heading">{val}</dd>
    </div>
  )
}

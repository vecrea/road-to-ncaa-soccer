import { useMemo, useState } from 'react'
import { loadAbout, saveAbout, loadSeasons, loadPalmares, loadProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const BUT = '#0e88d3' // pool-500 — buts
const PASS = '#eab54b' // spark-400 — passes (barres)
const PASS_INK = '#d1971f' // spark-500 — passes (texte, meilleur contraste)

// Pied fort : valeur canonique stockée par l'onglet « Mes stats », affichée bilingue.
const FOOT = { right: { fr: 'Droit', en: 'Right' }, left: { fr: 'Gauche', en: 'Left' }, both: { fr: 'Ambidextre', en: 'Both' } }

const num = (x) => {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}
// Tri des saisons (ex. « 2024-25 ») — numérique, du plus ancien au plus récent.
const bySeasonAsc = (a, b) => String(a.season).localeCompare(String(b.season), undefined, { numeric: true })

// Lecture d'une éventuelle « vue coach » encodée dans l'URL (#coach=...).
function parseCoachHash() {
  try {
    const m = (window.location.hash || '').match(/coach=([^&]+)/)
    if (!m) return null
    return JSON.parse(decodeURIComponent(atob(m[1])))
  } catch {
    return null
  }
}

function ageFrom(birthDate) {
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a >= 0 && a < 120 ? a : null
}

// Histogramme SVG : buts + passes par saison (barres groupées), avec infobulle au survol/tap.
function SeasonBars({ data, t }) {
  const [hover, setHover] = useState(null)
  const W = 600, H = 212, padX = 16, padT = 26, padB = 34
  const plotW = W - padX * 2
  const plotH = H - padT - padB
  const baseY = padT + plotH
  const N = data.length
  const groupW = plotW / N
  const barW = Math.max(8, Math.min(30, groupW * 0.26))
  const innerGap = Math.min(10, barW * 0.5)
  const vmax = Math.max(1, ...data.flatMap((d) => [num(d.goals), num(d.assists)]))
  const showLabels = barW >= 15
  const groupCenter = (i) => padX + groupW * (i + 0.5)
  const barH = (v) => (num(v) / vmax) * plotH
  const hd = hover != null ? data[hover] : null

  return (
    <div>
      {/* Légende */}
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUT }} /> {t('Buts', 'Goals')}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PASS }} /> {t('Passes décisives', 'Assists')}
        </span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('Buts et passes par saison', 'Goals and assists per season')}>
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={padX} x2={W - padX} y1={padT + f * plotH} y2={padT + f * plotH} stroke="var(--border)" strokeWidth="1" />
          ))}
          {data.map((d, i) => {
            const gc = groupCenter(i)
            const gH = barH(d.goals)
            const aH = barH(d.assists)
            const gX = gc - innerGap / 2 - barW
            const aX = gc + innerGap / 2
            const on = hover === i
            const dim = hover != null && !on ? 0.4 : 1
            return (
              <g key={d.id ?? i}>
                <rect x={gX} y={baseY - gH} width={barW} height={gH} rx="4" fill={BUT} opacity={dim} style={{ transition: 'opacity 0.15s ease' }} />
                <rect x={aX} y={baseY - aH} width={barW} height={aH} rx="4" fill={PASS} opacity={dim} style={{ transition: 'opacity 0.15s ease' }} />
                {showLabels && (
                  <>
                    <text x={gX + barW / 2} y={baseY - gH - 5} textAnchor="middle" className="font-display" fontSize="10" fontWeight="800" fill="var(--text-2)" opacity={dim}>{num(d.goals)}</text>
                    <text x={aX + barW / 2} y={baseY - aH - 5} textAnchor="middle" className="font-display" fontSize="10" fontWeight="800" fill="var(--text-2)" opacity={dim}>{num(d.assists)}</text>
                  </>
                )}
                <text x={gc} y={H - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill={on ? 'var(--heading)' : 'var(--text-3)'}>{d.season}</text>
                <rect
                  x={padX + groupW * i} y={padT} width={groupW} height={plotH + 18} fill="transparent" pointerEvents="all" className="cursor-pointer"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onClick={() => setHover((h) => (h === i ? null : i))}
                />
              </g>
            )
          })}
          <line x1={padX} x2={W - padX} y1={baseY} y2={baseY} stroke="var(--border-strong)" strokeWidth="1.5" />
        </svg>

        {hd && (() => {
          const topY = baseY - Math.max(barH(hd.goals), barH(hd.assists))
          const below = topY < H * 0.3
          return (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg surface border border-hair px-2.5 py-1.5 text-center shadow-card"
              style={{
                left: `${Math.max(14, Math.min(86, (groupCenter(hover) / W) * 100))}%`,
                top: `${(topY / H) * 100}%`,
                transform: below ? 'translate(-50%, 10px)' : 'translate(-50%, calc(-100% - 10px))',
              }}
            >
              <div className="font-display text-sm font-black text-heading">{hd.season}{hd.club ? ` · ${hd.club}` : ''}</div>
              <div className="text-[11px] text-tertiary">
                {num(hd.apps)} {t('matchs', 'games')} · <span className="font-bold" style={{ color: BUT }}>{num(hd.goals)}</span> {t('buts', 'goals')} · <span className="font-bold" style={{ color: PASS_INK }}>{num(hd.assists)}</span> {t('passes', 'assists')}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// Ligne d'une petite liste de définitions (profil joueur).
function ProfileRow({ k, v }) {
  const has = v != null && String(v).trim() !== ''
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-tertiary">{k}</dt>
      <dd className={'text-right font-semibold ' + (has ? 'text-heading' : 'text-tertiary')}>{has ? v : '—'}</dd>
    </div>
  )
}

export default function AboutMe({ profile }) {
  const { t, lang } = useLang()
  const coach = useMemo(() => parseCoachHash(), [])
  const isCoach = !!coach

  const [about, setAbout] = useState(() => loadAbout())
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  // Source des données : la vue coach lit l'URL ; sinon le stockage local.
  const A = isCoach ? coach.about || {} : about
  const extras = useMemo(() => (isCoach ? coach.extras || {} : loadProfileExtras()), [isCoach, coach])
  const seasons = useMemo(() => [...(isCoach ? coach.seasons || [] : loadSeasons())].sort(bySeasonAsc), [isCoach, coach])
  const palmares = useMemo(
    () => [...(isCoach ? coach.palmares || [] : loadPalmares())].sort((a, b) => String(b.year).localeCompare(String(a.year), undefined, { numeric: true })),
    [isCoach, coach],
  )

  const age = profile.birthDate ? ageFrom(profile.birthDate) : null
  const defaultMsg = t(
    `Je m'appelle ${profile.name}, footballeur belge${age ? ` de ${age} ans` : ''}. Mon objectif : rejoindre un programme universitaire NCAA à la rentrée ${profile.usEntryYear} et combiner mes études avec le football au plus haut niveau aux États-Unis. Motivé, à l'écoute et prêt à tout donner, sur le terrain comme en classe.`,
    `My name is ${profile.name}, a${age ? ` ${age}-year-old` : ''} Belgian footballer. My goal: join an NCAA college soccer program in fall ${profile.usEntryYear} and combine my studies with high-level soccer in the US. Motivated, coachable and ready to give everything, on the pitch and in the classroom.`,
  )
  const message = (lang === 'en' ? A.messageEn : A.messageFr) || defaultMsg

  const set = (patch) => {
    const next = { ...about, ...patch }
    setAbout(next)
    saveAbout(next)
  }

  const shareLink = () => {
    try {
      const ex = loadProfileExtras()
      const payload = {
        about: loadAbout(),
        seasons: loadSeasons(),
        palmares: loadPalmares(),
        extras: { positions: ex.positions, foot: ex.foot, heightCm: ex.heightCm, weightKg: ex.weightKg },
      }
      const enc = btoa(encodeURIComponent(JSON.stringify(payload)))
      const url = `${window.location.origin}${window.location.pathname}#coach=${enc}`
      navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* ignore */
    }
  }

  const igUrl = A.instagram ? `https://instagram.com/${String(A.instagram).replace(/^@/, '')}` : null
  const footLabel = extras.foot && FOOT[extras.foot] ? t(FOOT[extras.foot].fr, FOOT[extras.foot].en) : ''
  const hasProfile = !!((extras.positions && String(extras.positions).trim()) || footLabel || extras.heightCm || extras.weightKg)

  const contactField = 'field'

  return (
    <div className="panel overflow-hidden">
      {/* En-tête + outils (masqués en vue coach) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair p-5">
        <div>
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Ma présentation', 'About me')}</h2>
          <p className="text-sm text-secondary">{t('Pour mieux me connaître', 'Get to know me')}</p>
        </div>
        {!isCoach && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-full surface-2 border border-hair px-4 py-1.5 text-sm font-semibold text-primary transition hover:surface-3"
            >
              {editing ? t('Terminer', 'Done') : t('Éditer', 'Edit')}
            </button>
            <button
              onClick={shareLink}
              className="rounded-full bg-pool-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-pool-600"
              title={t('Copie un lien qui contient tes infos, à envoyer aux coachs', 'Copies a link containing your info, to send to coaches')}
            >
              {copied ? t('Lien copié ✓', 'Link copied ✓') : t('Lien pour un coach', 'Coach link')}
            </button>
          </div>
        )}
      </div>

      {/* 1 · À propos de moi */}
      <div className="p-5 sm:p-6">
        {editing && !isCoach ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tertiary">
              {t('Message — version française', 'Message — English version')}
            </span>
            <textarea
              value={(lang === 'en' ? about.messageEn : about.messageFr) ?? ''}
              onChange={(e) => set(lang === 'en' ? { messageEn: e.target.value } : { messageFr: e.target.value })}
              placeholder={defaultMsg}
              rows={4}
              className={contactField + ' leading-relaxed'}
            />
            <span className="mt-1 block text-[11px] text-tertiary">
              {t('Bascule en EN (en haut) pour écrire la version anglaise, affichée aux coachs anglophones.', 'Switch to FR (top) to write the French version shown when the page is in French.')}
            </span>
          </label>
        ) : (
          <p className="max-w-3xl whitespace-pre-line leading-relaxed text-primary">{message}</p>
        )}

        {/* Instagram */}
        <div className="mt-4">
          {editing && !isCoach ? (
            <label className="block max-w-xs">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Instagram</span>
              <input value={about.instagram ?? ''} onChange={(e) => set({ instagram: e.target.value })} placeholder={t('@ton_pseudo', '@your_handle')} className={contactField + ' mt-1'} />
            </label>
          ) : igUrl ? (
            <a href={igUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
              <InstagramIcon />
              @{String(A.instagram).replace(/^@/, '')}
            </a>
          ) : (
            !isCoach && <p className="text-sm text-tertiary">{t('Ajoute ton Instagram via « Éditer ».', 'Add your Instagram via “Edit”.')}</p>
          )}
        </div>
      </div>

      {/* 2 · Profil & stats : profil + palmarès à gauche, graphe + tableau à droite */}
      <div className="border-t border-hair p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg font-extrabold text-heading">{t('Mon profil & mes stats', 'My profile & stats')}</h3>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Gauche : profil joueur + palmarès */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl surface-2 border border-hair p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Profil joueur', 'Player profile')}</h4>
              <dl className="mt-3 space-y-2 text-sm">
                <ProfileRow k={t('Poste(s)', 'Position(s)')} v={extras.positions} />
                <ProfileRow k={t('Pied fort', 'Strong foot')} v={footLabel} />
                <ProfileRow k={t('Taille', 'Height')} v={extras.heightCm ? `${extras.heightCm} cm` : ''} />
                <ProfileRow k={t('Poids', 'Weight')} v={extras.weightKg ? `${extras.weightKg} kg` : ''} />
              </dl>
              {!isCoach && !hasProfile && (
                <p className="mt-3 text-[11px] text-tertiary">{t('Complète ton profil dans l’onglet « Mes stats ».', 'Complete your profile in the “My stats” tab.')}</p>
              )}
            </div>

            <div className="rounded-2xl surface-2 border border-hair p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Palmarès & sélections', 'Honours & call-ups')}</h4>
              {palmares.length === 0 ? (
                <p className="mt-2 text-sm text-tertiary">
                  {isCoach ? '—' : t('À compléter dans l’onglet « Mes stats ».', 'To complete in the “My stats” tab.')}
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {palmares.map((p) => (
                    <li key={p.id} className="flex items-baseline gap-2.5 text-sm">
                      {p.year && <span className="shrink-0 font-display text-xs font-black text-accent">{p.year}</span>}
                      <span className="text-primary">{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Droite : graphe buts/passes + tableau par saison */}
          <div className="min-w-0">
            {seasons.length === 0 ? (
              <div className="flex h-full min-h-52 flex-col items-center justify-center rounded-2xl surface-2 border border-hair p-6 text-center">
                <p className="text-sm font-semibold text-heading">{t('Pas encore de stats de saison', 'No season stats yet')}</p>
                <p className="mt-1 text-sm text-secondary">
                  {isCoach
                    ? t('Le joueur n’a pas encore renseigné ses statistiques.', 'The player hasn’t filled in their stats yet.')
                    : t('Ajoute tes saisons (matchs, buts, passes) dans l’onglet « Mes stats » pour les afficher ici.', 'Add your seasons (games, goals, assists) in the “My stats” tab to show them here.')}
                </p>
              </div>
            ) : (
              <>
                <SeasonBars data={seasons} t={t} />
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-tertiary">
                        <th className="py-1.5 pr-2 font-semibold">{t('Saison', 'Season')}</th>
                        <th className="py-1.5 pr-2 font-semibold">{t('Club', 'Club')}</th>
                        <th className="py-1.5 px-2 text-center font-semibold" title={t('Matchs', 'Games played')}>{t('M', 'GP')}</th>
                        <th className="py-1.5 px-2 text-center font-semibold" title={t('Buts', 'Goals')}>{t('B', 'G')}</th>
                        <th className="py-1.5 pl-2 text-center font-semibold" title={t('Passes décisives', 'Assists')}>{t('P', 'A')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...seasons].reverse().map((s) => (
                        <tr key={s.id} className="border-t border-hair">
                          <td className="py-1.5 pr-2 font-semibold text-heading">{s.season}</td>
                          <td className="py-1.5 pr-2 text-secondary">{s.club || '—'}</td>
                          <td className="py-1.5 px-2 text-center tabular-nums text-primary">{num(s.apps)}</td>
                          <td className="py-1.5 px-2 text-center font-bold tabular-nums" style={{ color: BUT }}>{num(s.goals)}</td>
                          <td className="py-1.5 pl-2 text-center font-bold tabular-nums" style={{ color: PASS_INK }}>{num(s.assists)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3 · Contact */}
      <div className="border-t border-hair p-5 sm:p-6">
        {editing && !isCoach ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Email</span>
              <input value={about.email ?? ''} onChange={(e) => set({ email: e.target.value })} placeholder="nicolas@email.com" className={contactField + ' mt-1'} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Téléphone', 'Phone')}</span>
              <input value={about.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} placeholder="+32 ..." className={contactField + ' mt-1'} />
            </label>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setContactOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 dark:bg-pool-500 dark:hover:bg-pool-600"
            >
              {t('Contacter-moi', 'Contact me')}
              <span className={'transition ' + (contactOpen ? 'rotate-180' : '')}>⌄</span>
            </button>

            {contactOpen && (
              <div className="mt-3 flex flex-wrap gap-2">
                {igUrl && (
                  <a href={igUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <InstagramIcon /> Instagram
                  </a>
                )}
                {A.phone && (
                  <a href={`tel:${A.phone}`} className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <PhoneIcon /> {t('Appeler', 'Call')}
                  </a>
                )}
                {A.email && (
                  <a href={`mailto:${A.email}`} className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <MailIcon /> Email
                  </a>
                )}
                {!igUrl && !A.phone && !A.email && (
                  <p className="text-sm text-tertiary">{isCoach ? '' : t('Ajoute tes coordonnées via « Éditer ».', 'Add your contact details via “Edit”.')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7L22 6" />
    </svg>
  )
}

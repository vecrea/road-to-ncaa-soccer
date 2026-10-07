import { useEffect, useState } from 'react'
import { LEVELS, LEVEL_HINTS } from '../lib/level.js'
import { loadProfileExtras, saveProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

// Priorités -> positions de curseurs (0..100, somme ~100) à partir des fractions stockées.
function toRaw(frac) {
  const sport = Number(frac?.sport) || 0
  const lifestyle = Number(frac?.lifestyle) || 0
  const cost = Number(frac?.cost) || 0
  const s = sport + lifestyle + cost
  if (s <= 0) return { sport: 60, lifestyle: 25, cost: 15 }
  return {
    sport: Math.round((sport / s) * 100),
    lifestyle: Math.round((lifestyle / s) * 100),
    cost: Math.round((cost / s) * 100),
  }
}

// Positions de curseurs -> fractions sommant ~1 (format stocké + utilisé par le score).
function toFrac(raw) {
  const s = raw.sport + raw.lifestyle + raw.cost
  if (s <= 0) return { sport: 0, lifestyle: 0, cost: 0 }
  return { sport: raw.sport / s, lifestyle: raw.lifestyle / s, cost: raw.cost / s }
}

export default function ProfileCard({ profile }) {
  const { t } = useLang()

  // État éditable = réglages stockés en local, défaut = valeurs du profil.
  // On conserve toutes les clés déjà présentes (y compris celles de la fiche athlète).
  const [extras, setExtras] = useState(() => {
    const s = loadProfileExtras()
    return {
      ...s,
      positions: s.positions ?? (Array.isArray(profile.positions) ? profile.positions.join(', ') : profile.positions ?? ''),
      birthDate: s.birthDate ?? profile.birthDate ?? '',
      homeClub: s.homeClub ?? profile.homeClub ?? '',
      coach: s.coach ?? profile.coach ?? '',
      major: s.major ?? profile.major ?? '',
      heightCm: s.heightCm ?? profile.physical?.heightCm ?? '',
      weightKg: s.weightKg ?? profile.physical?.weightKg ?? '',
      foot: s.foot ?? profile.physical?.foot ?? '',
      level: Number(s.level ?? profile.level ?? 3),
      weights: toFrac(toRaw(s.weights ?? profile.weights)),
    }
  })

  // Positions brutes des curseurs de priorités (évite que le pouce « saute » après normalisation).
  const [w, setW] = useState(() => {
    const s = loadProfileExtras()
    return toRaw(s.weights ?? profile.weights)
  })

  useEffect(() => saveProfileExtras(extras), [extras])

  const set = (k, val) => setExtras((e) => ({ ...e, [k]: val }))
  const onWeight = (key, val) => {
    const next = { ...w, [key]: Number(val) }
    setW(next)
    set('weights', toFrac(next))
  }

  const level = Math.max(1, Math.min(5, Number(extras.level) || 3))
  const lvl = LEVELS[level] ?? LEVELS[3]
  const hint = LEVEL_HINTS[level] ?? LEVEL_HINTS[3]
  const sumW = w.sport + w.lifestyle + w.cost
  const pct = (k) => (sumW > 0 ? Math.round((w[k] / sumW) * 100) : 0)

  const PRIORITIES = [
    { key: 'sport', label: t('Football', 'Soccer'), help: t('Niveau du programme de foot + division', 'Soccer-program level + division') },
    { key: 'lifestyle', label: t('Ambiance', 'Lifestyle'), help: t('Culture sportive / vie de campus', 'Sports culture / campus life') },
    { key: 'cost', label: t('Coût', 'Cost'), help: t('Coût / potentiel de bourse', 'Cost / scholarship potential') },
  ]

  return (
    <div className="panel overflow-hidden">
      {/* En-tête — identité (lecture seule, depuis le profil) */}
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-black text-heading">{profile.name}</h2>
            <p className="text-sm text-secondary">{t(profile.sport, profile.sportEn)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Info label={t('Nationalité', 'Nationality')} value={t(profile.nationality, profile.nationalityEn)} />
            <Info label={t('Classe', 'Grade')} value={t(profile.currentGrade, profile.currentGradeEn)} />
          </div>
        </div>
        <p className="mt-3 text-sm text-secondary">
          {t(
            'Réglages de ton profil. Ils sont sauvegardés sur cet appareil.',
            'Your profile settings. They are saved on this device.',
          )}
        </p>
      </div>

      {/* 1 — Identité (éditable) */}
      <section className="border-t border-hair p-5">
        <SectionTitle>{t('Identité', 'Identity')}</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={t('Poste(s)', 'Position(s)')}>
            <input
              className="field mt-1"
              value={extras.positions}
              onChange={(e) => set('positions', e.target.value)}
              placeholder={t('ex. Milieu central, Ailier droit', 'e.g. Central midfielder, Right winger')}
            />
          </Field>
          <Field label={t('Date de naissance', 'Date of birth')}>
            <input type="date" className="field mt-1" value={extras.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </Field>
          <Field label={t('Club', 'Club')}>
            <input className="field mt-1" value={extras.homeClub} onChange={(e) => set('homeClub', e.target.value)} placeholder={t('Ton club actuel', 'Your current club')} />
          </Field>
          <Field label={t('Coach', 'Coach')}>
            <input className="field mt-1" value={extras.coach} onChange={(e) => set('coach', e.target.value)} placeholder={t('Nom du coach', 'Coach name')} />
          </Field>
          <Field label={t('Filière visée', 'Intended major')}>
            <input className="field mt-1" value={extras.major} onChange={(e) => set('major', e.target.value)} placeholder={t('ex. Économie', 'e.g. Economics')} />
          </Field>
        </div>
      </section>

      {/* 2 — Mon niveau */}
      <section className="border-t border-hair p-5">
        <SectionTitle>{t('Mon niveau', 'My level')}</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-block rounded-full px-3 py-1 font-display text-sm font-extrabold text-white" style={{ background: lvl.color }}>
            {t(lvl.label, lvl.labelEn)}
          </span>
          <span className="text-sm text-secondary">{t(hint.fr, hint.en)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={level}
          onChange={(e) => set('level', Number(e.target.value))}
          className="mt-4 w-full"
          style={{ accentColor: 'var(--accent)' }}
          aria-label={t('Mon niveau', 'My level')}
        />
        <div className="mt-1 flex justify-between text-[11px] text-tertiary">
          <span>1 · {t(LEVELS[1].short, LEVELS[1].shortEn)}</span>
          <span>5 · {t(LEVELS[5].short, LEVELS[5].shortEn)}</span>
        </div>
      </section>

      {/* 3 — Mes priorités */}
      <section className="border-t border-hair p-5">
        <SectionTitle>{t('Mes priorités', 'My priorities')}</SectionTitle>
        <p className="mt-1 text-sm text-secondary">
          {t(
            'Ces curseurs pondèrent le score de compatibilité de chaque université.',
            'These sliders weight each university’s match score.',
          )}
        </p>
        <div className="mt-4 space-y-4">
          {PRIORITIES.map((p) => (
            <div key={p.key}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-heading">{p.label}</span>
                <span className="tabular-nums text-sm font-bold text-accent">{pct(p.key)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={w[p.key]}
                onChange={(e) => onWeight(p.key, e.target.value)}
                className="mt-1 w-full"
                style={{ accentColor: 'var(--accent)' }}
                aria-label={p.label}
              />
              <p className="text-[11px] text-tertiary">{p.help}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — Physique */}
      <section className="border-t border-hair p-5">
        <SectionTitle>{t('Physique', 'Physical')}</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label={t('Taille (cm)', 'Height (cm)')}>
            <input type="number" inputMode="numeric" className="field mt-1" value={extras.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="178" />
          </Field>
          <Field label={t('Poids (kg)', 'Weight (kg)')}>
            <input type="number" inputMode="numeric" className="field mt-1" value={extras.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="70" />
          </Field>
          <Field label={t('Pied fort', 'Strong foot')}>
            <select className="field mt-1" value={extras.foot} onChange={(e) => set('foot', e.target.value)}>
              <option value="">{t('— à préciser', '— TBD')}</option>
              <option value="right">{t('Droit', 'Right')}</option>
              <option value="left">{t('Gauche', 'Left')}</option>
              <option value="both">{t('Ambidextre', 'Both')}</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Note — prise en compte au rechargement */}
      <div className="border-t border-hair p-4">
        <p className="text-xs text-tertiary">
          {t(
            'Le niveau et les priorités sont pris en compte au rechargement de la page.',
            'Level and priorities apply after reloading the page.',
          )}
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 className="font-display text-lg font-extrabold text-heading">{children}</h3>
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-secondary">{label}</span>
      {children}
    </label>
  )
}

function Info({ label, value }) {
  return (
    <div className="surface-2 border border-hair rounded-lg px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-heading">{value}</div>
    </div>
  )
}

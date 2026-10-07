// ---------------------------------------------------------------------------
// Générateur d'email d'introduction coach SANS clé API (modèle pré-rempli).
// L'email est en ANGLAIS (les coachs sont américains) ; il pioche dans le
// profil + la fiche athlète (loadProfileExtras) + les stats de saison + le
// contact coach. Renvoie { subject, body } — à relire/personnaliser avant envoi.
// ---------------------------------------------------------------------------
import { loadSeasons } from './storage.js'
import { athleteLevel, LEVELS } from './level.js'

function ageFrom(birthDate) {
  try {
    const b = new Date(birthDate)
    const now = new Date()
    let a = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
    return a
  } catch {
    return null
  }
}

export function buildCoachEmail(profile, contact = {}, extras = {}) {
  const school = (contact.school || '').trim() || 'your program'
  const coachName = (contact.coachName || '').trim()
  const greet = coachName ? `Coach ${coachName.split(/\s+/).slice(-1)[0]}` : 'Coach'
  const age = ageFrom(profile.birthDate)
  const nationality =
    profile.nationality === 'Belge' ? 'Belgian' : profile.nationalityEn || profile.nationality || 'international'
  const positions = (Array.isArray(profile.positions) ? profile.positions.filter(Boolean) : []).join(', ')
  const major = profile.majorEn || profile.major || 'Business'
  const level = LEVELS[athleteLevel(profile).level].labelEn

  const stats = loadSeasons()
    .filter((s) => s && (s.season || s.club || s.league || s.apps || s.goals || s.assists))
    .slice(0, 3)
    .map((s) => {
      const head = [s.season, s.club, s.league].filter(Boolean).join(' · ')
      const line = [
        s.apps ? `${s.apps} apps` : null,
        s.goals ? `${s.goals} goals` : null,
        s.assists ? `${s.assists} assists` : null,
      ]
        .filter(Boolean)
        .join(', ')
      return '  • ' + [head, line].filter(Boolean).join(' — ')
    })
    .join('\n')

  const gpa = (extras.average || '').trim()
  const video = (extras.videoUrl || '').trim()
  const contactLine = [(extras.email || '').trim(), (extras.phone || '').trim()].filter(Boolean).join(' · ')

  const subject = `Prospective international recruit — ${profile.name}, Class of ${profile.usEntryYear}${positions ? ` (${positions})` : ''}`

  const body = `Dear ${greet},

My name is ${profile.name}, a${age ? ` ${age}-year-old` : 'n'} ${nationality} soccer player${positions ? ` (${positions})` : ''}. I am very interested in ${school} for Fall ${profile.usEntryYear}, where I plan to major in ${major}.

I currently play for ${profile.homeClub || 'my club'}${profile.coach ? ` (coach ${profile.coach})` : ''}, and I would describe my level as ${level}. My recent season stats are:
${stats || '  • (season stats to be added)'}

I am committed to combining academic and athletic excellence in the US and would love to learn more about your program.${gpa ? ` My current school average is ${gpa}.` : ''}${video ? `\n\nHighlight video: ${video}` : ''}

Could you let me know whether you are recruiting my position for my class year, and what the next steps would be? I would be glad to share my full player profile${video ? '' : ' and a highlight video'}.

Thank you very much for your time and consideration.

Best regards,
${profile.name}${contactLine ? `\n${contactLine}` : ''}
Belgium`

  return { subject, body }
}

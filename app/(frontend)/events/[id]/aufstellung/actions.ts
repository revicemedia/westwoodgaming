'use server'

import config from '@payload-config'
import { refresh } from 'next/cache'
import { getPayload } from 'payload'
import { getDiscordUser } from '@/lib/discordAuth'
import { fit } from '@/lib/assignment'
import { formationKeys, roleKeys, type Role } from '@/lib/formations'
import {
  getLineupEvent,
  getLineupSlots,
  getPlayerProfile,
  getProposals,
  getSignups,
  hasStarted,
  isAdmin,
  isAfterDeadline,
} from '@/lib/lineup'

export type LineupResult = { error?: string }

// --- Spieler ---

export async function savePositions(main: string, secondary: string[]): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const isRole = (value: string): value is Role => (roleKeys as string[]).includes(value)
  const others = [...new Set(secondary)].filter(isRole).filter((role) => role !== main)
  if (!isRole(main)) return { error: 'Bitte wähle eine Hauptposition.' }
  if (others.length === 0) return { error: 'Bitte wähle mindestens eine Nebenposition.' }

  const payload = await getPayload({ config })
  const data = {
    discordName: user.name,
    discordAvatar: user.avatar,
    mainPosition: main,
    secondaryPositions: others,
  }
  const { docs } = await payload.find({
    collection: 'players',
    where: { discordId: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0]) {
    await payload.update({ collection: 'players', id: docs[0].id, data, overrideAccess: true })
  } else {
    await payload.create({ collection: 'players', data: { ...data, discordId: user.id }, overrideAccess: true })
  }

  refresh()
  return {}
}

export async function signUp(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Anmelden können sich nur Mitglieder unseres Discord-Servers.' }
  if (!(await getPlayerProfile(user.id))) return { error: 'Bitte wähle zuerst deine Positionen.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup) return { error: 'Für dieses Event gibt es keine Anmeldung.' }
  if (hasStarted(lineup.event)) return { error: 'Das Event hat schon begonnen.' }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const afterDeadline = isAfterDeadline(lineup.event)

  const { docs } = await payload.find({
    collection: 'lineup-signups',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0]?.status === 'active') return {}

  // Wer nach einer Absage doch kommt, wird neu angemeldet; die kurzfristige Absage entfällt damit
  const data = {
    discordName: user.name,
    discordAvatar: user.avatar,
    status: 'active' as const,
    afterDeadline,
    cancelledLate: false,
  }
  try {
    if (docs[0]) {
      await payload.update({ collection: 'lineup-signups', id: docs[0].id, data, overrideAccess: true })
    } else {
      await payload.create({
        collection: 'lineup-signups',
        data: { ...data, event, discordId: user.id },
        overrideAccess: true,
      })
    }
  } catch {
    // Eindeutiger Index: doppelter Klick
  }

  refresh()
  return {}
}

export async function cancelSignup(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup) return { error: 'Für dieses Event gibt es keine Anmeldung.' }
  if (hasStarted(lineup.event)) return { error: 'Das Event hat schon begonnen. Sag bitte im Discord Bescheid.' }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const { docs } = await payload.find({
    collection: 'lineup-signups',
    where: { event: { equals: event }, discordId: { equals: user.id }, status: { equals: 'active' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const signup = docs[0]
  if (!signup) return {}

  const { docs: slots } = await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  if (!isAfterDeadline(lineup.event)) {
    // Rechtzeitige Absage: ohne Folgen für die Zuverlässigkeit
    await payload.delete({ collection: 'lineup-signups', id: signup.id, overrideAccess: true })
  } else {
    await payload.update({
      collection: 'lineup-signups',
      id: signup.id,
      // Wer erst auf der Warteliste stand, hat niemandem den Platz weggenommen
      data: { status: 'cancelled', cancelledLate: !signup.afterDeadline },
      overrideAccess: true,
    })
  }

  // In der freigegebenen Aufstellung rückt jemand von der Warteliste nach
  if (lineup.event.lineupPublished && slots[0]) await promoteFromWaitlist(event, slots[0].position)

  refresh()
  return {}
}

// Erster Wartender, der die Position als Haupt-, sonst als Nebenposition hat, sonst der erste überhaupt.
// Pünktlich Angemeldete ohne Platz stehen vor Nachzüglern, sonst gilt die Anmeldereihenfolge.
async function promoteFromWaitlist(eventId: number, positionKey: string) {
  const lineup = await getLineupEvent(String(eventId))
  const position = lineup?.formation?.find((entry) => entry.key === positionKey)
  if (!position) return

  const [signups, slots] = await Promise.all([getSignups(eventId), getLineupSlots(eventId)])
  if (slots.some((slot) => slot.position === positionKey)) return
  const waiting = signups
    .filter((signup) => signup.status === 'active' && !slots.some((slot) => slot.discordId === signup.discordId))
    .sort((a, b) => Number(a.afterDeadline) - Number(b.afterDeadline))
  const rank = (signup: (typeof waiting)[number]) =>
    signup.main ? { main: 0, secondary: 1, other: 2 }[fit({ main: signup.main, secondary: signup.secondary }, position.role)] : 2
  const next = [...waiting].sort((a, b) => rank(a) - rank(b))[0]
  if (!next) return

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'lineup-slots',
      data: {
        event: eventId,
        position: positionKey,
        discordId: next.discordId,
        discordName: next.discordName,
        discordAvatar: next.discordAvatar,
      },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: inzwischen anders vergeben
  }
}

// --- Admin ---

async function adminEvent(eventId: string) {
  if (!(await isAdmin())) return { error: 'Nur für Admins. Bitte unter /admin anmelden.' }
  const lineup = await getLineupEvent(eventId)
  if (!lineup) return { error: 'Für dieses Event gibt es keine Anmeldung.' }
  return { lineup }
}

// Vorschlag für eine Formation übernehmen: ersetzt die bisherige Aufstellung, die Freigabe wird zurückgenommen
export async function applyProposal(eventId: string, formation: string): Promise<LineupResult> {
  const { lineup, error } = await adminEvent(eventId)
  if (!lineup) return { error }
  if (!(formationKeys as string[]).includes(formation)) return { error: 'Unbekannte Formation.' }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const signups = await getSignups(event)
  const proposal = getProposals(signups).find((entry) => entry.formation === formation)
  if (!proposal) return { error: 'Unbekannte Formation.' }

  await payload.update({
    collection: 'events',
    id: event,
    data: { formation: proposal.formation, lineupPublished: false },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'lineup-slots', where: { event: { equals: event } }, overrideAccess: true })
  for (const [position, discordId] of Object.entries(proposal.assignment.slots)) {
    const signup = signups.find((entry) => entry.discordId === discordId)
    if (!signup) continue
    await payload.create({
      collection: 'lineup-slots',
      data: {
        event,
        position,
        discordId,
        discordName: signup.discordName,
        discordAvatar: signup.discordAvatar,
      },
      overrideAccess: true,
    })
  }

  refresh()
  return {}
}

// Spieler auf eine Position setzen. Ist sie belegt, wird getauscht bzw. der bisherige Spieler kommt auf die Warteliste.
export async function moveToPosition(eventId: string, discordId: string, positionKey: string): Promise<LineupResult> {
  const { lineup, error } = await adminEvent(eventId)
  if (!lineup) return { error }
  if (!lineup.formation?.some((position) => position.key === positionKey)) {
    return { error: 'Diese Position gibt es in der Formation nicht.' }
  }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const { docs: slots } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: event } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const own = slots.find((slot) => slot.discordId === discordId)
  const target = slots.find((slot) => slot.position === positionKey)
  if (own && own.id === target?.id) return {}

  if (own && target) {
    // Tauschen; der Zwischenschritt hält die eindeutigen Indizes ein
    await payload.update({ collection: 'lineup-slots', id: own.id, data: { position: `tmp-${own.id}` }, overrideAccess: true })
    await payload.update({ collection: 'lineup-slots', id: target.id, data: { position: own.position }, overrideAccess: true })
    await payload.update({ collection: 'lineup-slots', id: own.id, data: { position: positionKey }, overrideAccess: true })
  } else if (own) {
    await payload.update({ collection: 'lineup-slots', id: own.id, data: { position: positionKey }, overrideAccess: true })
  } else {
    const signup = (await getSignups(event)).find((entry) => entry.discordId === discordId && entry.status === 'active')
    if (!signup) return { error: 'Dieser Spieler ist nicht angemeldet.' }
    if (target) await payload.delete({ collection: 'lineup-slots', id: target.id, overrideAccess: true })
    await payload.create({
      collection: 'lineup-slots',
      data: {
        event,
        position: positionKey,
        discordId,
        discordName: signup.discordName,
        discordAvatar: signup.discordAvatar,
      },
      overrideAccess: true,
    })
  }

  refresh()
  return {}
}

export async function removeFromLineup(eventId: string, discordId: string): Promise<LineupResult> {
  const { lineup, error } = await adminEvent(eventId)
  if (!lineup) return { error }

  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: lineup.event.id }, discordId: { equals: discordId } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

export async function setPublished(eventId: string, published: boolean): Promise<LineupResult> {
  const { lineup, error } = await adminEvent(eventId)
  if (!lineup) return { error }
  if (published && !lineup.formation) return { error: 'Bitte zuerst einen Vorschlag übernehmen.' }

  const payload = await getPayload({ config })
  await payload.update({
    collection: 'events',
    id: lineup.event.id,
    data: { lineupPublished: published },
    overrideAccess: true,
  })

  refresh()
  return {}
}

export async function setAttendance(
  eventId: string,
  discordId: string,
  attendance: 'present' | 'late' | 'no_show' | null,
): Promise<LineupResult> {
  const { lineup, error } = await adminEvent(eventId)
  if (!lineup) return { error }

  const payload = await getPayload({ config })
  await payload.update({
    collection: 'lineup-signups',
    where: { event: { equals: lineup.event.id }, discordId: { equals: discordId }, status: { equals: 'active' } },
    data: { attendance },
    overrideAccess: true,
  })

  refresh()
  return {}
}

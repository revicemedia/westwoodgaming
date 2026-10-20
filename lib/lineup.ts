import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { assign, type Assignment, type Candidate } from '@/lib/assignment'
import { formationKeys, formations, getFormation, type FormationKey, type Role } from '@/lib/formations'
import { computeReliability, reliabilityOf, type Reliability } from '@/lib/reliability'
import type { Event } from '@/payload-types'

export type LineupSlot = { position: string; discordId: string; discordName: string; discordAvatar: string | null }

export type Signup = {
  discordId: string
  discordName: string
  discordAvatar: string | null
  status: 'active' | 'cancelled'
  afterDeadline: boolean
  cancelledLate: boolean
  attendance: 'present' | 'late' | 'no_show' | null
  main: Role | null
  secondary: Role[]
  reliability: Reliability
}

export type PlayerProfile = { main: Role; secondary: Role[] }

// Ohne eigenen Anmeldeschluss endet die Anmeldung so lange vor dem Termin
const DEFAULT_DEADLINE = 2 * 60 * 60 * 1000

export function signupDeadline(event: Pick<Event, 'date' | 'signupDeadline'>): Date | null {
  if (event.signupDeadline) return new Date(event.signupDeadline)
  return event.date ? new Date(new Date(event.date).getTime() - DEFAULT_DEADLINE) : null
}

// Nach Anmeldeschluss oder Freigabe kommen neue Anmeldungen auf die Warteliste, Absagen gelten als kurzfristig
export function isAfterDeadline(event: Pick<Event, 'date' | 'signupDeadline' | 'lineupPublished'>, now = Date.now()) {
  const deadline = signupDeadline(event)
  return Boolean(event.lineupPublished) || (deadline !== null && now > deadline.getTime())
}

// Ab Beginn des Events ist keine Anmeldung oder Absage mehr möglich
export function hasStarted(event: Pick<Event, 'date'>, now = Date.now()) {
  return event.date !== null && event.date !== undefined && now >= new Date(event.date).getTime()
}

// Event mit Anmeldung laden; null, wenn es keins gibt oder die Anmeldung nicht aktiviert ist
export async function getLineupEvent(id: string) {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })

  try {
    const event = await payload.findByID({ collection: 'events', id: Number(id), depth: 0 })
    return event.lineupEnabled ? { event, formation: getFormation(event.formation) } : null
  } catch {
    return null
  }
}

// Ist im selben Browser ein Payload-Admin angemeldet?
export async function isAdmin() {
  const payload = await getPayload({ config })
  try {
    const { user } = await payload.auth({ headers: await headers() })
    return Boolean(user)
  } catch {
    return false
  }
}

export async function getPlayerProfile(discordId: string): Promise<PlayerProfile | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'players',
    where: { discordId: { equals: discordId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ? { main: docs[0].mainPosition, secondary: docs[0].secondaryPositions } : null
}

export async function getReliability(discordIds: string[]) {
  if (discordIds.length === 0) return new Map<string, Reliability>()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lineup-signups',
    where: { discordId: { in: discordIds } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    select: { discordId: true, status: true, cancelledLate: true, attendance: true, updatedAt: true },
  })
  return computeReliability(docs)
}

export async function getLineupSlots(eventId: number): Promise<LineupSlot[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: eventId } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  return docs.map((slot) => ({
    position: slot.position,
    discordId: slot.discordId,
    discordName: slot.discordName,
    discordAvatar: slot.discordAvatar ?? null,
  }))
}

// Alle Anmeldungen des Events in Anmeldereihenfolge, mit Wunschpositionen und Zuverlässigkeit
export async function getSignups(eventId: number): Promise<Signup[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lineup-signups',
    where: { event: { equals: eventId } },
    sort: 'createdAt',
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const ids = docs.map((signup) => signup.discordId)
  const [{ docs: players }, reliability] = await Promise.all([
    payload.find({
      collection: 'players',
      where: { discordId: { in: ids } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    getReliability(ids),
  ])

  return docs.map((signup) => {
    const player = players.find((entry) => entry.discordId === signup.discordId)
    return {
      discordId: signup.discordId,
      discordName: signup.discordName,
      discordAvatar: signup.discordAvatar ?? null,
      status: signup.status,
      afterDeadline: Boolean(signup.afterDeadline),
      cancelledLate: Boolean(signup.cancelledLate),
      attendance: signup.attendance ?? null,
      main: player?.mainPosition ?? null,
      secondary: player?.secondaryPositions ?? [],
      reliability: reliabilityOf(reliability, signup.discordId),
    }
  })
}

export type Proposal = { formation: FormationKey; assignment: Assignment }

// Vorschlag je Formation, der beste zuerst
export function getProposals(signups: Signup[]): Proposal[] {
  const candidates: Candidate[] = signups
    .filter((signup) => signup.status === 'active')
    .map((signup, order) => ({
      id: signup.discordId,
      // ohne Profil (z. B. im Admin von Hand angelegt) zählt jede Position gleich
      main: signup.main ?? ('' as Role),
      secondary: signup.secondary,
      reliability: signup.reliability.percent,
      late: signup.afterDeadline,
      order,
    }))

  return formationKeys
    .map((formation) => ({ formation, assignment: assign(formations[formation], candidates) }))
    .sort((a, b) => b.assignment.score - a.assignment.score)
}

// IDs aller Events mit Anmeldung, zum Vorbereiten der Seiten beim Build
export async function getLineupEventIds(): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events',
      where: { lineupEnabled: { equals: true } },
      pagination: false,
      depth: 0,
      select: {},
    })
    return docs.map((event) => String(event.id))
  } catch {
    return []
  }
}

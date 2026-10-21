'use server'

import config from '@payload-config'
import { refresh } from 'next/cache'
import { getPayload } from 'payload'
import { getDiscordUser } from '@/lib/discordAuth'
import { getLineupEvent, isAdmin } from '@/lib/lineup'

export type LineupResult = { error?: string }

const isBlocked = (event: { blockedPositions?: string[] | null }, position: string) =>
  Boolean(event.blockedPositions?.includes(position))

// Auf eine Position eintragen; ein bestehender eigener Platz oder Wartelisten-Eintrag wird dabei freigegeben
export async function claimPosition(eventId: string, position: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }
  if (isBlocked(lineup.event, position)) return { error: 'Diese Position ist vom Admin reserviert.' }

  const payload = await getPayload({ config })
  const event = lineup.event.id

  const { docs } = await payload.find({
    collection: 'lineup-slots',
    where: { event: { equals: event }, position: { equals: position } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0] && docs[0].discordId !== user.id) return { error: 'Diese Position ist schon vergeben.' }
  if (docs[0]) return {}

  // Der alte Platz wird frei; der Hook an lineup-slots lässt dort jemanden von der Warteliste nachrücken
  await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  try {
    await payload.create({
      collection: 'lineup-slots',
      data: { event, position, discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
      overrideAccess: true,
    })
  } catch {
    // Eindeutiger Index: jemand war schneller
    refresh()
    return { error: 'Diese Position wurde gerade vergeben.' }
  }

  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

export async function leavePosition(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup) return { error: 'Dieses Event hat keine Aufstellung.' }

  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'lineup-slots',
    where: { event: { equals: lineup.event.id }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Auf die Warteliste für eine vergebene oder gesperrte Position; ein bestehender Eintrag behält seinen Rang
export async function joinWaitlist(eventId: string, position: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
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
  if (slots.some((slot) => slot.discordId === user.id)) {
    return { error: 'Du stehst schon in der Aufstellung. Gib erst deinen Platz frei, um auf die Warteliste zu gehen.' }
  }
  // Inzwischen frei geworden: direkt eintragen statt warten
  if (!isBlocked(lineup.event, position) && !slots.some((slot) => slot.position === position)) {
    return claimPosition(eventId, position)
  }

  const { docs } = await payload.find({
    collection: 'lineup-waitlist',
    where: { event: { equals: event }, discordId: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  try {
    if (docs[0]) {
      await payload.update({ collection: 'lineup-waitlist', id: docs[0].id, data: { position }, overrideAccess: true })
    } else {
      await payload.create({
        collection: 'lineup-waitlist',
        data: { event, position, discordId: user.id, discordName: user.name, discordAvatar: user.avatar },
        overrideAccess: true,
      })
    }
  } catch {
    // Eindeutiger Index: doppelter Klick
  }

  refresh()
  return {}
}

export async function leaveWaitlist(eventId: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup) return { error: 'Dieses Event hat keine Aufstellung.' }

  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'lineup-waitlist',
    where: { event: { equals: lineup.event.id }, discordId: { equals: user.id } },
    overrideAccess: true,
  })

  refresh()
  return {}
}

// Admin (Discord-ID mit lineupAdmin in lib/admins.ts): freie Position für die Session sperren oder wieder freigeben.
// Beim Freigeben rückt über den Hook an events der Erste von der Warteliste nach.
export async function toggleBlocked(eventId: string, position: string): Promise<LineupResult> {
  if (!(await isAdmin())) return { error: 'Nur für Admins.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }

  const payload = await getPayload({ config })
  const event = lineup.event.id
  const blocked = lineup.event.blockedPositions ?? []

  if (!blocked.includes(position as (typeof blocked)[number])) {
    const { totalDocs } = await payload.count({
      collection: 'lineup-slots',
      where: { event: { equals: event }, position: { equals: position } },
      overrideAccess: true,
    })
    if (totalDocs > 0) return { error: 'Auf dieser Position steht schon jemand. Erst austragen, dann sperren.' }
  }

  await payload.update({
    collection: 'events',
    id: event,
    data: {
      blockedPositions: blocked.includes(position as (typeof blocked)[number])
        ? blocked.filter((key) => key !== position)
        : [...blocked, position as (typeof blocked)[number]],
    },
    overrideAccess: true,
  })

  refresh()
  return {}
}

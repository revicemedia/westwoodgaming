'use server'

import config from '@payload-config'
import { refresh } from 'next/cache'
import { getPayload } from 'payload'
import { getDiscordUser } from '@/lib/discordAuth'
import { getLineupEvent } from '@/lib/lineup'

export type LineupResult = { error?: string }

// Auf eine Position eintragen; ein bestehender eigener Platz wird dabei freigegeben
export async function claimPosition(eventId: string, position: string): Promise<LineupResult> {
  const user = await getDiscordUser()
  if (!user) return { error: 'Bitte melde dich zuerst mit Discord an.' }
  if (!user.member) return { error: 'Eintragen können nur Mitglieder unseres Discord-Servers.' }

  const lineup = await getLineupEvent(eventId)
  if (!lineup || !lineup.formation.some((slot) => slot.key === position)) {
    return { error: 'Diese Position gibt es in der Aufstellung nicht.' }
  }

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

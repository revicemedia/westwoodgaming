import type { Payload, PayloadRequest } from 'payload'

import { getFormation } from './formations'

// Lässt den am längsten Wartenden mit diesem Wunsch auf die Position nachrücken,
// sofern sie zur Formation gehört, nicht gesperrt und noch frei ist.
// Ohne Import der Payload-Config, damit auch Collection-Hooks sie nutzen können.
export async function promoteFromWaitlist(payload: Payload, eventId: number, position: string, req?: PayloadRequest) {
  const event = await payload.findByID({ collection: 'events', id: eventId, depth: 0, req, disableErrors: true })
  if (!event || !getFormation(event.formation)?.some((entry) => entry.key === position)) return
  if (event.blockedPositions?.some((key) => key === position)) return

  const [{ docs: candidates }, { docs: slots }] = await Promise.all([
    payload.find({
      collection: 'lineup-waitlist',
      where: { event: { equals: eventId }, position: { equals: position } },
      sort: 'createdAt',
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'lineup-slots',
      where: { event: { equals: eventId } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
    }),
  ])
  if (slots.some((slot) => slot.position === position)) return

  // Wer schon anderswo spielt (z. B. von Hand im Admin eingetragen), wird übersprungen
  const next = candidates.find((entry) => !slots.some((slot) => slot.discordId === entry.discordId))
  if (!next) return

  try {
    await payload.create({
      collection: 'lineup-slots',
      data: {
        event: eventId,
        position,
        discordId: next.discordId,
        discordName: next.discordName,
        discordAvatar: next.discordAvatar,
      },
      overrideAccess: true,
      req,
    })
    await payload.delete({ collection: 'lineup-waitlist', id: next.id, overrideAccess: true, req })
  } catch (cause) {
    payload.logger.error({ err: cause }, 'Nachrücken von der Warteliste fehlgeschlagen.')
  }
}

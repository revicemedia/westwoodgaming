import config from '@payload-config'
import { getPayload } from 'payload'
import { getFormation } from '@/lib/formations'

export type LineupSlot = { position: string; discordId: string; discordName: string; discordAvatar: string | null }

// Event mit Aufstellung laden; null, wenn es keins gibt oder keine Aufstellung gewählt ist
export async function getLineupEvent(id: string) {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })

  try {
    const event = await payload.findByID({ collection: 'events', id: Number(id), depth: 0 })
    const formation = getFormation(event.formation)
    return formation ? { event, formation } : null
  } catch {
    return null
  }
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

// IDs aller Events mit Aufstellung, zum Vorbereiten der Seiten beim Build
export async function getLineupEventIds(): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events',
      where: { formation: { exists: true } },
      pagination: false,
      depth: 0,
      select: {},
    })
    return docs.map((event) => String(event.id))
  } catch {
    return []
  }
}

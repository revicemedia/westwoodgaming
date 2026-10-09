import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { EVENTS_TAG } from '@/collections/Events'

export type GameEvent = {
  id: number
  game: string
  title: string
  date: string | null
  description: string
}

// Ohne Endzeit gilt ein Event so lange nach Beginn noch als laufend
const DURATION = 3 * 60 * 60 * 1000

const isPast = (event: GameEvent, now: number) =>
  event.date !== null && new Date(event.date).getTime() + DURATION < now

// Filtert zur Laufzeit, damit abgelaufene Events sofort verschwinden
export async function getUpcomingEvents(game?: string) {
  await connection()
  const now = Date.now()
  const events = await getEvents()

  return events.filter((event) => (!game || event.game === game) && !isPast(event, now))
}

// Neueste zuerst
export async function getPastEvents() {
  await connection()
  const now = Date.now()
  const events = await getEvents()

  return events.filter((event) => isPast(event, now)).reverse()
}

async function getEvents(): Promise<GameEvent[]> {
  'use cache'
  cacheTag(EVENTS_TAG)
  cacheLife('max')

  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'events', pagination: false })

  // feste Termine zuerst, offene danach
  return docs
    .sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9'))
    .map((event) => ({
      id: event.id,
      game: event.game,
      title: event.title,
      date: event.date ?? null,
      description: event.description,
    }))
}

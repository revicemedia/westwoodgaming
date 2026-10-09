import type { Payload } from 'payload'

import type { Event } from '../payload-types'
import { formatEventDate } from './eventDate'
import { getGame } from './games'

// Ein Webhook pro Spiel, z. B. DISCORD_EVENTS_WEBHOOK_EA_FC_27
export function eventWebhookEnv(game: string) {
  return `DISCORD_EVENTS_WEBHOOK_${game.toUpperCase().replace(/-/g, '_')}`
}

export async function announceEvent(event: Event, logger: Payload['logger']) {
  const env = eventWebhookEnv(event.game)
  const webhookUrl = process.env[env]
  if (!webhookUrl) {
    logger.warn(`${env} ist nicht gesetzt, das Event wird nicht im Discord angekündigt.`)
    return
  }

  const game = getGame(event.game)
  const date = formatEventDate(event.date)

  // Die Ankündigung ist die Event Card als Bild. Klappt das Zeichnen nicht, geht sie als Text raus.
  let card: Blob | undefined
  if (game) {
    try {
      const { renderEventCard } = await import('./eventCardImage')
      card = await renderEventCard({
        image: game.image,
        game: game.name,
        date,
        title: event.title,
        description: event.description,
      })
    } catch (cause) {
      logger.warn({ err: cause }, 'Event Card konnte nicht gezeichnet werden, das Event wird als Text angekündigt.')
    }
  }

  const announcement = card
    ? { attachments: [{ id: 0, description: `${event.title}, ${date}. ${event.description}`.slice(0, 1024) }] }
    : {
        embeds: [
          {
            title: event.title,
            description: event.description,
            fields: [
              { name: 'Spiel', value: game?.name ?? event.game, inline: true },
              { name: 'Termin', value: date, inline: true },
            ],
          },
        ],
      }

  // Abstimmung, nur im Discord
  const poll = {
    poll: {
      question: { text: `${event.title.slice(0, 240)}: ${date}. Bist du dabei?` },
      answers: [
        { poll_media: { text: 'Dabei', emoji: { name: '👍' } } },
        { poll_media: { text: 'Nicht dabei', emoji: { name: '👎' } } },
      ],
      duration: pollDuration(event.date),
      allow_multiselect: false,
    },
  }

  const send = (message: object, file?: Blob) => {
    const body = new FormData()
    body.append('payload_json', JSON.stringify({ username: 'Events', allowed_mentions: { parse: [] }, ...message }))
    if (file) body.append('files[0]', file, 'event.png')

    return fetch(webhookUrl, { method: 'POST', signal: AbortSignal.timeout(8000), body })
  }

  try {
    let response = await send({ ...announcement, ...poll }, card)

    // Lehnt Discord Bild und Abstimmung in einer Nachricht ab, gehen sie getrennt raus
    if (response.status === 400) {
      response = await send(announcement, card)
      if (response.ok) response = await send(poll)
    }

    if (!response.ok) logger.error(`Discord-Webhook ${env} antwortet mit ${response.status}.`)
  } catch (cause) {
    logger.error({ err: cause }, `Discord-Webhook ${env} nicht erreichbar.`)
  }
}

// Laufzeit in Stunden: bis zum Termin, ohne Termin eine Woche (Discord erlaubt 1 bis 768)
function pollDuration(date?: string | null) {
  if (!date) return 168

  const hours = Math.ceil((new Date(date).getTime() - Date.now()) / (60 * 60 * 1000))
  return Math.min(Math.max(hours, 1), 768)
}

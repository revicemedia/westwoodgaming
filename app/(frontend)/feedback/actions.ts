'use server'

// Feedback der Mitglieder, standardmäßig anonym. Die Seite ist nirgends verlinkt, der Link wird im Discord geteilt.
// Ohne E-Mail oder Discord-Login; an Discord gehen Betreff, Text und nur auf Wunsch ein Name.

import { feedbackCategories, feedbackColors, isFeedbackCategory } from '@/lib/feedback'

export type FeedbackState = {
  status: 'idle' | 'success' | 'error'
  message: string
  values: { name: string; category: string; other: string; message: string }
}

const emptyValues = { name: '', category: feedbackCategories[0], other: '', message: '' }

export async function sendFeedback(_prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const field = (name: string) => String(formData.get(name) ?? '').trim()
  const values = { name: field('name'), category: field('category'), other: field('other'), message: field('message') }
  const success: FeedbackState = { status: 'success', message: 'Danke für dein Feedback!', values: emptyValues }

  // Honeypot: Menschen sehen das Feld nicht, Bots füllen es aus.
  if (field('website')) return success

  const error = (message: string): FeedbackState => ({ status: 'error', message, values })

  if (!isFeedbackCategory(values.category)) return error('Bitte wähle einen Betreff aus.')
  // Bei „Sonstiges“ ergänzt das Mitglied den Betreff selbst
  const other = values.category === 'Sonstiges' ? values.other : ''
  if (values.category === 'Sonstiges' && !other) return error('Bitte ergänze, worum es geht.')
  if (other.length > 80) return error('Der Betreff ist zu lang (höchstens 80 Zeichen).')
  if (values.name.length > 80) return error('Der Name ist zu lang (höchstens 80 Zeichen).')
  if (values.message.length < 10) return error('Bitte schreib uns etwas mehr (mindestens 10 Zeichen).')
  if (values.message.length > 2000) return error('Dein Feedback ist zu lang (höchstens 2000 Zeichen).')

  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('DISCORD_FEEDBACK_WEBHOOK_URL ist nicht gesetzt.')
    return error('Das Feedback-Formular ist gerade nicht erreichbar. Bitte versuch es später noch einmal.')
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        username: values.name ? 'Feedback' : 'Anonymes Feedback',
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: other ? `Sonstiges: ${other}` : values.category,
            description: values.message,
            // Name nur, wenn das Mitglied ihn freiwillig angegeben hat
            ...(values.name ? { author: { name: `Von: ${values.name}` } } : {}),
            color: feedbackColors[values.category],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error(`Feedback-Webhook antwortet mit ${response.status}.`)
      return error('Dein Feedback konnte nicht gesendet werden. Bitte versuch es später noch einmal.')
    }
  } catch (cause) {
    console.error('Feedback-Webhook nicht erreichbar.', cause)
    return error('Dein Feedback konnte nicht gesendet werden. Bitte versuch es später noch einmal.')
  }

  return success
}

'use server'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message: string
  values: { name: string; email: string; phone: string; category: string; subject: string; message: string }
}

const categories = ['Allgemeine Frage', 'Mitmachen', 'Event', 'Problem melden']

const emptyValues = { name: '', email: '', phone: '', category: categories[0], subject: '', message: '' }

export async function sendContactMessage(_prevState: ContactState, formData: FormData): Promise<ContactState> {
  const field = (name: string) => String(formData.get(name) ?? '').trim()

  const values = {
    name: field('name'),
    email: field('email'),
    phone: field('phone'),
    category: field('category'),
    subject: field('subject'),
    message: field('message'),
  }

  // Honeypot: Menschen sehen das Feld nicht, Bots füllen es aus.
  if (field('website')) {
    return { status: 'success', message: 'Danke! Deine Nachricht ist bei uns angekommen.', values: emptyValues }
  }

  const error = (message: string): ContactState => ({ status: 'error', message, values })

  if (!values.name || !values.email || !values.subject || !values.message) {
    return error('Bitte fülle alle Pflichtfelder aus.')
  }
  if (
    values.name.length > 80 ||
    values.email.length > 120 ||
    values.phone.length > 30 ||
    values.subject.length > 120 ||
    values.message.length > 1500
  ) {
    return error('Eine deiner Eingaben ist zu lang.')
  }
  if (!categories.includes(values.category)) {
    return error('Bitte wähle eine Kategorie aus.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return error('Bitte gib eine gültige E-Mail-Adresse an.')
  }
  if (values.phone && !/^[0-9+()\/\s-]{5,}$/.test(values.phone)) {
    return error('Bitte gib eine gültige Telefonnummer an.')
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL ist nicht gesetzt.')
    return error('Das Kontaktformular ist gerade nicht erreichbar. Schreib uns bitte direkt im Discord.')
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        username: 'Kontaktformular',
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: `Neue Nachricht: ${values.subject}`,
            description: values.message,
            fields: [
              { name: 'Kategorie', value: values.category },
              { name: 'Name', value: values.name, inline: true },
              { name: 'E-Mail', value: values.email, inline: true },
              { name: 'Telefon', value: values.phone || '–', inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error(`Discord-Webhook antwortet mit ${response.status}.`)
      return error('Deine Nachricht konnte nicht gesendet werden. Bitte versuch es später noch einmal.')
    }
  } catch (cause) {
    console.error('Discord-Webhook nicht erreichbar.', cause)
    return error('Deine Nachricht konnte nicht gesendet werden. Bitte versuch es später noch einmal.')
  }

  return { status: 'success', message: 'Danke! Deine Nachricht ist bei uns angekommen.', values: emptyValues }
}

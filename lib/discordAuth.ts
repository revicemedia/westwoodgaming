import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// Login für Besucher über Discord (nicht der Payload-Admin).
// Die Sitzung liegt als signiertes Cookie im Browser, ohne Datenbank.

// member: ist der Spieler auf unserem Discord-Server (beim Login geprüft)
export type DiscordUser = { id: string; name: string; avatar: string; member?: boolean }

export const SESSION_COOKIE = 'wg_session'
export const STATE_COOKIE = 'wg_oauth'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30

function sign(value: string) {
  return createHmac('sha256', process.env.PAYLOAD_SECRET || '').update(value).digest('base64url')
}

export function encodeSession(user: DiscordUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function decodeSession(value: string | undefined): DiscordUser | null {
  if (!value || !process.env.PAYLOAD_SECRET) return null
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null

  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

export async function getDiscordUser() {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value)
}

// Nur Pfade innerhalb der Seite als Rücksprungziel erlauben
export function safeReturnTo(value: string | null | undefined) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function discordAvatar(id: string, avatar: string | null) {
  if (avatar) return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`
  return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> BigInt(22)) % BigInt(6))}.png`
}

export function redirectUri(requestUrl: string) {
  return `${new URL(requestUrl).origin}/api/auth/discord/callback`
}

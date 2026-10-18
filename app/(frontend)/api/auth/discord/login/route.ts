import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { redirectUri, safeReturnTo, STATE_COOKIE } from '@/lib/discordAuth'

export async function GET(request: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId || !process.env.DISCORD_CLIENT_SECRET) {
    return new Response('Discord-Login ist noch nicht eingerichtet.', { status: 503 })
  }

  const state = randomBytes(16).toString('hex')
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get('returnTo'))

  ;(await cookies()).set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  const url = new URL('https://discord.com/oauth2/authorize')
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri(request.url),
    // guilds: um zu prüfen, ob der Spieler auf unserem Server ist
    scope: 'identify guilds',
    state,
    prompt: 'none',
  }).toString()

  return Response.redirect(url, 302)
}

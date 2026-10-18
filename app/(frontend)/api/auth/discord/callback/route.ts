import { cookies } from 'next/headers'
import {
  discordAvatar,
  encodeSession,
  redirectUri,
  safeReturnTo,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
} from '@/lib/discordAuth'
import { GUILD_ID } from '@/lib/discord'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const store = await cookies()
  const saved = store.get(STATE_COOKIE)?.value
  store.delete(STATE_COOKIE)

  let returnTo = '/'
  let state: string | undefined
  try {
    ;({ state, returnTo } = JSON.parse(saved ?? ''))
  } catch {}
  returnTo = safeReturnTo(returnTo)

  const code = url.searchParams.get('code')
  // Abgebrochen oder fremder Aufruf: zurück ohne Login
  if (!code || !state || url.searchParams.get('state') !== state) {
    return Response.redirect(new URL(returnTo, url.origin), 302)
  }

  try {
    const token = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID ?? '',
        client_secret: process.env.DISCORD_CLIENT_SECRET ?? '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(request.url),
      }),
      signal: AbortSignal.timeout(8000),
    }).then((response) => (response.ok ? response.json() : Promise.reject(response.status)))

    const user = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(8000),
    }).then((response) => (response.ok ? response.json() : Promise.reject(response.status)))

    const guilds: { id: string }[] = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(8000),
    }).then((response) => (response.ok ? response.json() : []))

    store.set(
      SESSION_COOKIE,
      encodeSession({
        id: user.id,
        name: user.global_name || user.username,
        avatar: discordAvatar(user.id, user.avatar),
        member: Array.isArray(guilds) && guilds.some((guild) => guild.id === GUILD_ID),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      },
    )
  } catch (cause) {
    console.error('Discord-Login fehlgeschlagen.', cause)
  }

  return Response.redirect(new URL(returnTo, url.origin), 302)
}

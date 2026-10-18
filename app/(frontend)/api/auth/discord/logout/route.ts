import { cookies } from 'next/headers'
import { safeReturnTo, SESSION_COOKIE } from '@/lib/discordAuth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  ;(await cookies()).delete(SESSION_COOKIE)
  return Response.redirect(new URL(safeReturnTo(url.searchParams.get('returnTo')), url.origin), 302)
}

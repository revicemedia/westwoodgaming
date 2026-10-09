import { getDiscordStatus } from '@/lib/discord'

export async function GET() {
  const status = await getDiscordStatus()

  if (!status) {
    return Response.json({ error: 'Discord ist gerade nicht erreichbar.' }, { status: 502 })
  }

  return Response.json(status)
}

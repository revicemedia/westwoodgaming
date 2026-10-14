import { cacheLife } from 'next/cache'
import { games } from '@/lib/games'

const WIDGET_URL = 'https://discord.com/api/guilds/1557388100534149130/widget.json'
const BOTS = ['Westwood Carl']

export type DiscordStatus = {
  online: number
  games: Record<string, number>
  // bis zu 4 zufällige Avatare von Mitgliedern, die gerade online sind
  avatars: string[]
}

type Widget = {
  presence_count: number
  members: { username: string; avatar_url?: string; game?: { name: string } }[]
}

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function getDiscordStatus(): Promise<DiscordStatus | null> {
  'use cache'
  cacheLife({ stale: 30, revalidate: 30, expire: 300 })

  let widget: Widget
  try {
    const response = await fetch(WIDGET_URL, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null
    widget = await response.json()
  } catch {
    return null
  }

  // Antwortet Discord unerwartet (z. B. Widget deaktiviert), gibt es keinen Status statt eines Fehlers
  if (!Array.isArray(widget?.members) || typeof widget.presence_count !== 'number') return null

  const counts: Record<string, number> = Object.fromEntries(games.map((game) => [game.slug, 0]))
  for (const member of widget.members) {
    if (!member.game) continue
    const playing = normalize(member.game.name)
    const game = games.find((game) => game.discordNames.some((name) => playing.includes(name)))
    if (game) counts[game.slug]++
  }

  const bots = widget.members.filter((member) => BOTS.includes(member.username)).length

  const avatars = widget.members
    .filter((member) => member.avatar_url && !BOTS.includes(member.username))
    .map((member) => member.avatar_url as string)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  return { online: Math.max(widget.presence_count - bots, 0), games: counts, avatars }
}

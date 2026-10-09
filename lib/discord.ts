import { cacheLife } from 'next/cache'
import { games } from '@/lib/games'

const WIDGET_URL = 'https://discord.com/api/guilds/1557388100534149130/widget.json'
const BOTS = ['Westwood Carl']

export type DiscordStatus = {
  online: number
  games: Record<string, number>
}

type Widget = {
  presence_count: number
  members: { username: string; game?: { name: string } }[]
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
    const response = await fetch(WIDGET_URL)
    if (!response.ok) return null
    widget = await response.json()
  } catch {
    return null
  }

  const counts: Record<string, number> = Object.fromEntries(games.map((game) => [game.slug, 0]))
  for (const member of widget.members) {
    if (!member.game) continue
    const playing = normalize(member.game.name)
    const game = games.find((game) => game.discordNames.some((name) => playing.includes(name)))
    if (game) counts[game.slug]++
  }

  const bots = widget.members.filter((member) => BOTS.includes(member.username)).length

  return { online: widget.presence_count - bots, games: counts }
}

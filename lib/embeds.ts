// Einbettungen im Artikeltext. Gespeichert wird, was im Admin eingefügt wurde (Link oder kompletter
// iframe-Code); angezeigt wird nur ein selbst gebauter Player bekannter Anbieter, nie fremdes HTML.

export type Embed = {
  provider: 'spotify' | 'youtube'
  src: string
  title: string
  // feste Höhe in Pixeln; ohne Angabe im Seitenverhältnis 16:9
  height?: number
}

const spotifyTypes = ['album', 'track', 'playlist', 'episode', 'show', 'artist']

export function parseEmbed(input: string): Embed | null {
  // Aus iframe-Code nur die Adresse übernehmen
  const raw = input.match(/src=["']([^"']+)["']/)?.[1] ?? input.trim()

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null

  const parts = url.pathname.split('/').filter(Boolean)

  if (url.hostname === 'open.spotify.com') {
    // /album/ID, /embed/album/ID und /intl-de/album/ID
    const typeIndex = parts.findIndex((part) => spotifyTypes.includes(part))
    const type = parts[typeIndex]
    const id = parts[typeIndex + 1]
    if (typeIndex < 0 || !id || !/^[A-Za-z0-9]+$/.test(id)) return null
    return {
      provider: 'spotify',
      src: `https://open.spotify.com/embed/${type}/${id}`,
      title: 'Spotify',
      height: type === 'track' || type === 'episode' ? 152 : 352,
    }
  }

  const youtubeId =
    url.hostname === 'youtu.be'
      ? parts[0]
      : ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)
        ? parts[0] === 'watch'
          ? url.searchParams.get('v')
          : ['embed', 'shorts', 'live'].includes(parts[0])
            ? parts[1]
            : null
        : null
  if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
    return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${youtubeId}`, title: 'YouTube' }
  }

  return null
}

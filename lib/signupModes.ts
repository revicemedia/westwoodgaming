// Anmeldetypen für Spiele ohne Formation. EA FC nutzt weiterhin die Formation (lib/formations.ts).
// Die Anmeldungen liegen wie die Aufstellung in lineup-slots; der Platz-Schlüssel kodiert Squad bzw. Spieler.
export const signupModes = {
  squads: { label: 'Squads (4er)', games: ['battlefield-6'] },
  'cod-custom': { label: 'Custom Match', games: ['call-of-duty'] },
  'cod-lobby': { label: 'Open Lobby', games: ['call-of-duty'] },
} as const

export type SignupModeKey = keyof typeof signupModes

export const signupModeKeys = Object.keys(signupModes) as SignupModeKey[]

// Spiele, für die ein Anmeldetyp gewählt werden kann
export const SIGNUP_GAMES: string[] = [...new Set(signupModeKeys.flatMap((key) => [...signupModes[key].games]))]

export function getSignupMode(game: string, mode: string | null | undefined): SignupModeKey | null {
  if (!mode || !(mode in signupModes)) return null
  const key = mode as SignupModeKey
  return (signupModes[key].games as readonly string[]).includes(game) ? key : null
}

export const SQUAD_SIZE = 4

export const squadKey = (squad: number, slot: number) => `squad-${squad}-${slot}`

export function parseSquadKey(key: string) {
  const match = /^squad-(\d+)-(\d+)$/.exec(key)
  return match ? { squad: Number(match[1]), slot: Number(match[2]) } : null
}

export const playerKey = (discordId: string) => `player-${discordId}`

export type Squad<T> = { number: number; members: T[]; reserved: string[]; free: string[] }

// Squads 1 bis zur höchsten belegten oder reservierten Nummer, Mitglieder in Eintragsreihenfolge
// (der Erste ist Squad-Leader). Ein leerer Squad mittendrin bleibt sichtbar, damit dort wieder jemand einsteigen kann.
export function groupSquads<T extends { position: string; createdAt: string }>(slots: T[], reserved: string[] = []): Squad<T>[] {
  const parsed = slots.flatMap((slot) => {
    const key = parseSquadKey(slot.position)
    return key ? [{ slot, squad: key.squad }] : []
  })
  const reservedKeys = reserved.filter((key) => parseSquadKey(key))
  const count = Math.max(0, ...parsed.map((entry) => entry.squad), ...reservedKeys.map((key) => parseSquadKey(key)!.squad))
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    const members = parsed
      .filter((entry) => entry.squad === number)
      .map((entry) => entry.slot)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const keys = Array.from({ length: SQUAD_SIZE }, (_, slot) => squadKey(number, slot + 1))
    const taken = members.map((member) => member.position)
    const squadReserved = keys.filter((key) => reservedKeys.includes(key) && !taken.includes(key))
    return { number, members, reserved: squadReserved, free: keys.filter((key) => !taken.includes(key) && !squadReserved.includes(key)) }
  })
}

// Darf ein neuer Squad eröffnet werden? Nur wenn alle bestehenden voll (inkl. reservierter Plätze) sind und die Obergrenze es zulässt.
export function canOpenSquad<T>(squads: Squad<T>[], maxSquads: number | null | undefined) {
  return squads.every((squad) => squad.free.length === 0) && (!maxSquads || squads.length < maxSquads)
}

// Nächster freier Platz für jemanden von der Warteliste: erst Lücken in bestehenden Squads, sonst ein neuer Squad
export function nextSquadSlot<T>(squads: Squad<T>[], maxSquads: number | null | undefined): string | null {
  const open = squads.find((squad) => squad.free.length > 0)
  if (open) return open.free[0]
  return canOpenSquad(squads, maxSquads) ? squadKey(squads.length + 1, 1) : null
}

// Teilnehmerliste: reservierte Plätze heißen spot-1, spot-2, …
export const spotKey = (index: number) => `spot-${index}`

// Freie Plätze der Teilnehmerliste; null = unbegrenzt
export function listCapacity(maxPlayers: number | null | undefined, reserved: string[], players: number) {
  if (!maxPlayers) return null
  return Math.max(0, maxPlayers - reserved.filter((key) => key.startsWith('spot-')).length - players)
}

// Custom Match: zufällig gemischte Teams, gespeichert am Event (Feld teams)
export type Teams = { a: string[]; b: string[]; round: number; at: string }

export function parseTeams(value: unknown): Teams | null {
  if (!value || typeof value !== 'object') return null
  const teams = value as Partial<Teams>
  return Array.isArray(teams.a) && Array.isArray(teams.b) && typeof teams.round === 'number' && typeof teams.at === 'string'
    ? (teams as Teams)
    : null
}

// Teilt die Spieler zufällig auf zwei Teams (bei ungerader Zahl hat Team A einen mehr).
// random liefert eine Zahl in [0, 1); die neue Aufteilung soll sich von der vorherigen unterscheiden, wenn möglich.
export function shuffleTeams(players: string[], previous: Teams | null, random: () => number = Math.random): Pick<Teams, 'a' | 'b'> {
  const split = () => {
    const list = [...players]
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
    const size = Math.ceil(list.length / 2)
    return { a: list.slice(0, size), b: list.slice(size) }
  }
  // gleiche Aufteilung = gleiche Spieler zusammen, egal ob als Team A oder B
  const key = (team: string[]) => [...team].sort().join(',')
  const same = (next: Pick<Teams, 'a' | 'b'>) =>
    previous !== null &&
    [key(next.a), key(next.b)].sort().join('|') === [key(previous.a), key(previous.b)].sort().join('|')

  let next = split()
  for (let attempt = 0; attempt < 20 && same(next); attempt++) next = split()
  return next
}

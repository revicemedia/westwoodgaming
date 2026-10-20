import type { LineupSignup } from '@/payload-types'

// Wert pro bewerteter Anmeldung: pünktlich 1, zu spät 0,5, kurzfristig abgesagt 0,3, nicht erschienen 0
const VALUES = { present: 1, late: 0.5, cancelledLate: 0.3, no_show: 0 }
// Die letzten 10 bewerteten Events zählen, jedes ältere etwas weniger
const LIMIT = 10
const DECAY = 0.85
// Neue Spieler starten bei 80 %; zählt wie zwei Events, damit ein einzelner Ausrutscher nicht alles kippt
const PRIOR = 0.8
const PRIOR_WEIGHT = 2

export type Reliability = { percent: number; rated: number }

type Rated = Pick<LineupSignup, 'discordId' | 'status' | 'cancelledLate' | 'attendance' | 'updatedAt'>

function value(signup: Rated): number | null {
  if (signup.status === 'cancelled') return signup.cancelledLate ? VALUES.cancelledLate : null
  return signup.attendance ? VALUES[signup.attendance] : null
}

// Zuverlässigkeit je Discord-ID aus allen Anmeldungen dieser Spieler
export function computeReliability(signups: Rated[]): Map<string, Reliability> {
  const byPlayer = new Map<string, number[]>()
  // Neueste zuerst; die Bewertung kommt nach dem Event, updatedAt folgt also der Event-Reihenfolge
  for (const signup of [...signups].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    const v = value(signup)
    if (v === null) continue
    const list = byPlayer.get(signup.discordId) ?? []
    if (list.length < LIMIT) list.push(v)
    byPlayer.set(signup.discordId, list)
  }

  const result = new Map<string, Reliability>()
  for (const [id, list] of byPlayer) {
    let sum = PRIOR * PRIOR_WEIGHT
    let weights = PRIOR_WEIGHT
    list.forEach((v, index) => {
      const w = DECAY ** index
      sum += v * w
      weights += w
    })
    result.set(id, { percent: Math.round((sum / weights) * 100), rated: list.length })
  }
  return result
}

export function reliabilityOf(map: Map<string, Reliability>, discordId: string): Reliability {
  return map.get(discordId) ?? { percent: Math.round(PRIOR * 100), rated: 0 }
}

import type { FormationPosition, Role } from '@/lib/formations'

export type Candidate = {
  id: string
  main: Role
  secondary: Role[]
  // Zuverlässigkeit 0–100
  reliability: number
  // nach Anmeldeschluss angemeldet: bekommt nur Plätze, die die anderen übrig lassen
  late: boolean
  // Rang der Anmeldung, 0 = zuerst angemeldet; entscheidet nur bei völligem Gleichstand
  order: number
}

export type Fit = 'main' | 'secondary' | 'other'

export type Assignment = {
  slots: Record<string, string>
  // angemeldet, aber ohne Platz (mehr Spieler als Positionen)
  unassigned: string[]
  stats: Record<Fit, number> & { empty: number }
  score: number
}

const wishPoints = { main: 3, secondary: 2, other: 0 } as const

export function fit(candidate: Pick<Candidate, 'main' | 'secondary'>, role: Role): Fit {
  if (candidate.main === role) return 'main'
  return candidate.secondary.includes(role) ? 'secondary' : 'other'
}

// Gewichte in Stufen, jede Stufe übertrifft alle darunter zusammen:
// 1. pünktlich Angemeldete spielen, 2. Nachzügler füllen Restplätze,
// 3. möglichst viele Wünsche der Pünktlichen erfüllen,
// 4. bei Konflikten bekommt der Zuverlässigere seinen Wunsch,
// 5. Wünsche der Nachzügler, 6. Anmeldereihenfolge.
function weight(candidate: Candidate, position: FormationPosition, total: number) {
  const wish = wishPoints[fit(candidate, position.role)]
  const earlier = 1 - candidate.order / Math.max(total, 1)
  if (candidate.late) return 1e10 + wish * 10 + wish * earlier * 0.1
  return 1e12 + wish * 1e7 + wish * candidate.reliability * 1e3 + wish * earlier
}

// Verteilt die Spieler so auf die Positionen, dass die Summe der Gewichte maximal ist
export function assign(formation: FormationPosition[], candidates: Candidate[]): Assignment {
  const n = Math.max(formation.length, candidates.length)
  const weights = candidates.map((candidate) =>
    formation.map((position) => weight(candidate, position, candidates.length)),
  )
  // Quadratische Kostenmatrix; fehlende Spieler oder Positionen kosten nichts
  const max = Math.max(0, ...weights.flat())
  const cost = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row < candidates.length && col < formation.length ? max - weights[row][col] : max)),
  )

  const colOf = hungarian(cost)
  const slots: Record<string, string> = {}
  const unassigned: string[] = []
  const stats = { main: 0, secondary: 0, other: 0, empty: formation.length }
  let score = 0

  candidates.forEach((candidate, row) => {
    const col = colOf[row]
    if (col >= formation.length) return unassigned.push(candidate.id)
    const position = formation[col]
    slots[position.key] = candidate.id
    stats[fit(candidate, position.role)]++
    stats.empty--
    score += weights[row][col]
  })

  return { slots, unassigned, stats, score }
}

// Ungarische Methode für eine quadratische Kostenmatrix (Minimum), liefert zu jeder Zeile die Spalte
function hungarian(cost: number[][]): number[] {
  const n = cost.length
  const u = new Array(n + 1).fill(0)
  const v = new Array(n + 1).fill(0)
  const p = new Array(n + 1).fill(0)
  const way = new Array(n + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(n + 1).fill(Infinity)
    const used = new Array(n + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) {
          minv[j] = cur
          way[j] = j0
        }
        if (minv[j] < delta) {
          delta = minv[j]
          j1 = j
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta
          v[j] -= delta
        } else {
          minv[j] -= delta
        }
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }

  const colOf = new Array(n).fill(-1)
  for (let j = 1; j <= n; j++) if (p[j]) colOf[p[j] - 1] = j - 1
  return colOf
}

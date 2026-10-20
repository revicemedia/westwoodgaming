// Aufstellungen für EA FC. x/y sind Prozentwerte auf dem Spielfeld (Angriff nach oben).
// role verbindet den Platz mit den Wunschpositionen der Spieler, die in allen Formationen gleich sind.
export const roles = {
  TW: 'Torwart',
  LV: 'Linksverteidiger',
  IV: 'Innenverteidiger',
  RV: 'Rechtsverteidiger',
  ZDM: 'Defensives Mittelfeld',
  ZM: 'Zentrales Mittelfeld',
  LM: 'Linkes Mittelfeld',
  RM: 'Rechtes Mittelfeld',
  ZOM: 'Offensives Mittelfeld',
  ST: 'Sturm',
} as const

export type Role = keyof typeof roles

export const roleKeys = Object.keys(roles) as Role[]

export type FormationPosition = { key: string; label: string; role: Role; x: number; y: number }

export const formations = {
  '4-2-3-1': [
    { key: 'ST', label: 'ST', role: 'ST', x: 50, y: 12 },
    { key: 'LM', label: 'LOM', role: 'LM', x: 16, y: 32 },
    { key: 'ZOM', label: 'ZOM', role: 'ZOM', x: 50, y: 34 },
    { key: 'RM', label: 'ROM', role: 'RM', x: 84, y: 32 },
    { key: 'LZDM', label: 'LDM', role: 'ZDM', x: 34, y: 53 },
    { key: 'RZDM', label: 'RDM', role: 'ZDM', x: 66, y: 53 },
    { key: 'LV', label: 'LV', role: 'LV', x: 13, y: 70 },
    { key: 'LIV', label: 'IV', role: 'IV', x: 37, y: 74 },
    { key: 'RIV', label: 'IV', role: 'IV', x: 63, y: 74 },
    { key: 'RV', label: 'RV', role: 'RV', x: 87, y: 70 },
    { key: 'TW', label: 'TW', role: 'TW', x: 50, y: 90 },
  ],
  '3-5-2': [
    { key: 'LS', label: 'LS', role: 'ST', x: 36, y: 12 },
    { key: 'RS', label: 'RS', role: 'ST', x: 64, y: 12 },
    { key: 'ZOM', label: 'ZOM', role: 'ZOM', x: 50, y: 31 },
    { key: 'LM', label: 'LM', role: 'LM', x: 12, y: 42 },
    { key: 'RM', label: 'RM', role: 'RM', x: 88, y: 42 },
    { key: 'LZDM', label: 'ZDM', role: 'ZDM', x: 34, y: 53 },
    { key: 'RZDM', label: 'ZDM', role: 'ZDM', x: 66, y: 53 },
    { key: 'LIV', label: 'IV', role: 'IV', x: 24, y: 73 },
    { key: 'IV', label: 'IV', role: 'IV', x: 50, y: 75 },
    { key: 'RIV', label: 'IV', role: 'IV', x: 76, y: 73 },
    { key: 'TW', label: 'TW', role: 'TW', x: 50, y: 90 },
  ],
  '4-1-2-1-2': [
    { key: 'LS', label: 'LS', role: 'ST', x: 36, y: 12 },
    { key: 'RS', label: 'RS', role: 'ST', x: 64, y: 12 },
    { key: 'ZOM', label: 'ZOM', role: 'ZOM', x: 50, y: 29 },
    // enge Raute: zentrale Mittelfeldspieler, keine Flügel
    { key: 'LZM', label: 'ZM', role: 'ZM', x: 14, y: 42 },
    { key: 'RZM', label: 'ZM', role: 'ZM', x: 86, y: 42 },
    { key: 'ZDM', label: 'ZDM', role: 'ZDM', x: 50, y: 57 },
    { key: 'LV', label: 'LV', role: 'LV', x: 13, y: 70 },
    { key: 'LIV', label: 'IV', role: 'IV', x: 37, y: 74 },
    { key: 'RIV', label: 'IV', role: 'IV', x: 63, y: 74 },
    { key: 'RV', label: 'RV', role: 'RV', x: 87, y: 70 },
    { key: 'TW', label: 'TW', role: 'TW', x: 50, y: 90 },
  ],
} satisfies Record<string, FormationPosition[]>

export type FormationKey = keyof typeof formations

export const formationKeys = Object.keys(formations) as FormationKey[]

// Spiele, für die eine Aufstellung gewählt werden kann
export const LINEUP_GAMES = ['ea-fc-27']

export function getFormation(key: string | null | undefined): FormationPosition[] | null {
  return key && key in formations ? formations[key as FormationKey] : null
}

// Aufstellungen für EA FC. x/y sind Prozentwerte auf dem Spielfeld (Angriff nach oben).
export type FormationPosition = { key: string; label: string; x: number; y: number }

export const formations = {
  '4-2-3-1': [
    { key: 'ST', label: 'ST', x: 50, y: 12 },
    { key: 'LM', label: 'LOM', x: 16, y: 32 },
    { key: 'ZOM', label: 'ZOM', x: 50, y: 34 },
    { key: 'RM', label: 'ROM', x: 84, y: 32 },
    { key: 'LZDM', label: 'LDM', x: 34, y: 53 },
    { key: 'RZDM', label: 'RDM', x: 66, y: 53 },
    { key: 'LV', label: 'LV', x: 13, y: 70 },
    { key: 'LIV', label: 'IV', x: 37, y: 74 },
    { key: 'RIV', label: 'IV', x: 63, y: 74 },
    { key: 'RV', label: 'RV', x: 87, y: 70 },
    { key: 'TW', label: 'TW', x: 50, y: 90 },
  ],
  '3-5-2': [
    { key: 'LS', label: 'LS', x: 36, y: 12 },
    { key: 'RS', label: 'RS', x: 64, y: 12 },
    { key: 'ZOM', label: 'ZOM', x: 50, y: 31 },
    { key: 'LM', label: 'LM', x: 12, y: 42 },
    { key: 'RM', label: 'RM', x: 88, y: 42 },
    { key: 'LZDM', label: 'ZDM', x: 34, y: 53 },
    { key: 'RZDM', label: 'ZDM', x: 66, y: 53 },
    { key: 'LIV', label: 'IV', x: 24, y: 73 },
    { key: 'IV', label: 'IV', x: 50, y: 75 },
    { key: 'RIV', label: 'IV', x: 76, y: 73 },
    { key: 'TW', label: 'TW', x: 50, y: 90 },
  ],
  '4-1-2-1-2': [
    { key: 'LS', label: 'LS', x: 36, y: 12 },
    { key: 'RS', label: 'RS', x: 64, y: 12 },
    { key: 'ZOM', label: 'ZOM', x: 50, y: 29 },
    { key: 'LZM', label: 'LM', x: 14, y: 42 },
    { key: 'RZM', label: 'RM', x: 86, y: 42 },
    { key: 'ZDM', label: 'ZDM', x: 50, y: 57 },
    { key: 'LV', label: 'LV', x: 13, y: 70 },
    { key: 'LIV', label: 'IV', x: 37, y: 74 },
    { key: 'RIV', label: 'IV', x: 63, y: 74 },
    { key: 'RV', label: 'RV', x: 87, y: 70 },
    { key: 'TW', label: 'TW', x: 50, y: 90 },
  ],
} satisfies Record<string, FormationPosition[]>

export type FormationKey = keyof typeof formations

export const formationKeys = Object.keys(formations) as FormationKey[]

// Spiele, für die eine Aufstellung gewählt werden kann
export const LINEUP_GAMES = ['ea-fc-27']

export function getFormation(key: string | null | undefined): FormationPosition[] | null {
  return key && key in formations ? formations[key as FormationKey] : null
}

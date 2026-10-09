export type Game = {
  slug: string
  name: string
  image: string
  category: string
  discordNames: string[]
  online: number
  teaser: string
  description: string[]
  highlights: string[]
}

export const games: Game[] = [
  {
    slug: 'ea-fc-27',
    name: 'EA FC 27',
    image: '/EAFC.jpg',
    category: 'Community Game',
    discordNames: ['ea sports fc 27', 'ea fc 27'],
    online: 8,
    teaser:
      'Clubs, Ultimate Team oder der schnelle Feierabend-Kick: Bei uns findest du jederzeit Mitspieler für die nächste Partie.',
    description: [
      'EA FC ist bei uns das Spiel für den gemeinsamen Feierabend. Ob eingespieltes Clubs-Team oder lockere Runde zu zweit – im Discord findest du schnell Leute, die gerade Lust auf eine Partie haben.',
      'Wir spielen ohne Leistungsdruck, aber mit Ehrgeiz. Neue Spieler sind jederzeit willkommen, egal auf welchem Niveau.',
    ],
    highlights: ['Clubs mit festem Community-Team', 'Ultimate Team und Koop-Partien', 'Interne Turniere', 'Voice-Chat im Discord'],
  },
  {
    slug: 'gta-vi',
    name: 'GTA VI',
    image: '/GTAVI.jpg',
    category: 'Community Game',
    discordNames: ['grand theft auto vi', 'gta vi', 'gta 6'],
    online: 6,
    teaser: 'Heists, Rennen und Chaos in Leonida – mit der Crew macht die offene Welt erst richtig Spaß.',
    description: [
      'In GTA VI sind wir als Crew unterwegs: Heists planen, Rennen fahren oder einfach gemeinsam durch Vice City und Leonida ziehen.',
      'Wer mitmachen will, kommt in den Discord und schließt sich der nächsten Session an.',
    ],
    highlights: ['Heists in voller Besetzung', 'Rennen und Stunt-Strecken', 'Gemeinsame Freeroam-Sessions', 'Voice-Chat im Discord'],
  },
  {
    slug: 'battlefield-6',
    name: 'Battlefield 6',
    image: '/BF6.jpg',
    category: 'Community Game',
    discordNames: ['battlefield 6'],
    online: 1,
    teaser: 'Squad auffüllen, Fahrzeuge besetzen, Punkte halten: Wir spielen im Team und mit Voice.',
    description: [
      'Battlefield lebt vom Zusammenspiel. Bei uns füllst du den Squad mit Leuten, die im Voice sind, Fahrzeuge besetzen und gemeinsam Punkte halten.',
      'Egal ob Infanterie, Panzer oder Heli – jede Rolle wird gebraucht.',
    ],
    highlights: ['Feste Squads mit Voice', 'Große Schlachten mit Fahrzeugen', 'Gemeinsame Spielabende', 'Einsteiger willkommen'],
  },
  {
    slug: 'call-of-duty',
    name: 'Call of Duty',
    image: '/COD.jpg',
    category: 'Community Game',
    discordNames: ['call of duty', 'warzone'],
    online: 4,
    teaser: 'Multiplayer, Warzone oder Zombies – such dir deinen Modus aus und spring in unseren Squad.',
    description: [
      'In Call of Duty ist für jeden etwas dabei: schnelle Multiplayer-Runden, Warzone im Squad oder entspannte Zombies-Abende.',
      'Schau im Discord vorbei und häng dich an die nächste Lobby.',
    ],
    highlights: ['Multiplayer in voller Lobby', 'Warzone im Squad', 'Zombies-Abende', 'Voice-Chat im Discord'],
  },
]

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug)
}

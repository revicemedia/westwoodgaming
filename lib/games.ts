export type GameEvent = {
  title: string
  date: string
  description: string
}

export type Game = {
  slug: string
  name: string
  image: string
  category: string
  online: number
  teaser: string
  description: string[]
  highlights: string[]
  events: GameEvent[]
}

export const games: Game[] = [
  {
    slug: 'ea-fc-27',
    name: 'EA FC 27',
    image: '/EAFC.jpg',
    category: 'Community Game',
    online: 8,
    teaser:
      'Clubs, Ultimate Team oder der schnelle Feierabend-Kick: Bei uns findest du jederzeit Mitspieler für die nächste Partie.',
    description: [
      'EA FC ist bei uns das Spiel für den gemeinsamen Feierabend. Ob eingespieltes Clubs-Team oder lockere Runde zu zweit – im Discord findest du schnell Leute, die gerade Lust auf eine Partie haben.',
      'Wir spielen ohne Leistungsdruck, aber mit Ehrgeiz. Neue Spieler sind jederzeit willkommen, egal auf welchem Niveau.',
    ],
    highlights: ['Clubs mit festem Community-Team', 'Ultimate Team und Koop-Partien', 'Interne Turniere', 'Voice-Chat im Discord'],
    events: [
      { title: 'Clubs-Abend', date: 'Termin folgt', description: 'Gemeinsame Clubs-Runde mit dem Community-Team.' },
      { title: 'Internes Turnier', date: 'Termin folgt', description: 'Eins gegen eins im K.-o.-Modus, Anmeldung über Discord.' },
    ],
  },
  {
    slug: 'gta-v',
    name: 'GTA V',
    image: '/GTAVI.jpg',
    category: 'Community Game',
    online: 6,
    teaser: 'Heists, Rennen und Chaos in Los Santos – mit der Crew macht die offene Welt erst richtig Spaß.',
    description: [
      'In GTA Online sind wir als Crew unterwegs: Heists planen, Rennen fahren oder einfach gemeinsam durch Los Santos ziehen.',
      'Wer mitmachen will, kommt in den Discord und schließt sich der nächsten Session an.',
    ],
    highlights: ['Heists in voller Besetzung', 'Rennen und Stunt-Strecken', 'Gemeinsame Freeroam-Sessions', 'Voice-Chat im Discord'],
    events: [
      { title: 'Heist-Abend', date: 'Termin folgt', description: 'Wir spielen die großen Heists gemeinsam durch.' },
      { title: 'Rennserie', date: 'Termin folgt', description: 'Mehrere Strecken, eine Gesamtwertung.' },
    ],
  },
  {
    slug: 'battlefield-6',
    name: 'Battlefield 6',
    image: '/BF6.jpg',
    category: 'Community Game',
    online: 1,
    teaser: 'Squad auffüllen, Fahrzeuge besetzen, Punkte halten: Wir spielen im Team und mit Voice.',
    description: [
      'Battlefield lebt vom Zusammenspiel. Bei uns füllst du den Squad mit Leuten, die im Voice sind, Fahrzeuge besetzen und gemeinsam Punkte halten.',
      'Egal ob Infanterie, Panzer oder Heli – jede Rolle wird gebraucht.',
    ],
    highlights: ['Feste Squads mit Voice', 'Große Schlachten mit Fahrzeugen', 'Gemeinsame Spielabende', 'Einsteiger willkommen'],
    events: [
      { title: 'Squad-Abend', date: 'Termin folgt', description: 'Mehrere volle Squads auf einem Server.' },
      { title: 'Fahrzeug-Training', date: 'Termin folgt', description: 'Panzer, Heli und Jet in Ruhe üben.' },
    ],
  },
  {
    slug: 'call-of-duty',
    name: 'Call of Duty',
    image: '/COD.jpg',
    category: 'Community Game',
    online: 4,
    teaser: 'Multiplayer, Warzone oder Zombies – such dir deinen Modus aus und spring in unseren Squad.',
    description: [
      'In Call of Duty ist für jeden etwas dabei: schnelle Multiplayer-Runden, Warzone im Squad oder entspannte Zombies-Abende.',
      'Schau im Discord vorbei und häng dich an die nächste Lobby.',
    ],
    highlights: ['Multiplayer in voller Lobby', 'Warzone im Squad', 'Zombies-Abende', 'Voice-Chat im Discord'],
    events: [
      { title: 'Warzone-Abend', date: 'Termin folgt', description: 'Mehrere Squads, eine gemeinsame Wertung.' },
      { title: 'Zombies-Nacht', date: 'Termin folgt', description: 'Wie viele Runden schaffen wir zusammen?' },
    ],
  },
]

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug)
}

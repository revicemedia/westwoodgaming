// Die Admins der Community. Bilder im 4:5-Format liegen in public/.
export type Admin = {
  gamertag: string
  role: string
  // ohne Bild zeigt die Kachel eine dunkle Fläche mit dem Gamertag
  image?: string
}

export const admins: Admin[] = [
  { gamertag: 'mfgFaith', role: 'Admin', image: '/Fabian.jpg' },
  { gamertag: 'Big_LouDE', role: 'Admin', image: '/Luca.jpg' },
  { gamertag: 'derBrudi420', role: 'Admin', image: '/Brudinho.jpeg' },
  { gamertag: 'ck87one', role: 'Admin', image: '/CK.jpeg' },
]

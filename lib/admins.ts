// Die Admins der Community. Bilder im 4:5-Format liegen in public/.
export type Admin = {
  gamertag: string
  role: string
  // ohne Bild zeigt die Kachel eine dunkle Fläche mit dem Gamertag
  image?: string
  // Discord-Benutzer-ID (Rechtsklick aufs Profil → „Benutzer-ID kopieren“); zeigt das Icon mit Link zum Profil
  discordId?: string
}

export const admins: Admin[] = [
  { gamertag: 'mfgFaith', role: 'Founder', image: '/Fabian.jpg', discordId: '580511567179808808' },
  { gamertag: 'Big_LouDE', role: 'Founder', image: '/Luca.jpg', discordId: '365595969259044864' },
  { gamertag: 'derBrudi420', role: 'Admin', image: '/Brudinho.jpeg', discordId: '517716493580894248' },
  { gamertag: 'ck87one', role: 'Admin', image: '/CK.jpeg', discordId: '1311812077937102949' },
  { gamertag: 'Vater_Theresa', role: 'Admin', image: '/VaterTheresa.jpg', discordId: '748222437782585364' },
]

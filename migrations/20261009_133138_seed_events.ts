import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Übernimmt die Events, die vorher fest in lib/games.ts standen
const events = [
  { game: 'ea-fc-27', title: 'Clubs-Abend', description: 'Gemeinsame Clubs-Runde mit dem Community-Team.' },
  { game: 'ea-fc-27', title: 'Internes Turnier', description: 'Eins gegen eins im K.-o.-Modus, Anmeldung über Discord.' },
  { game: 'gta-v', title: 'Heist-Abend', description: 'Wir spielen die großen Heists gemeinsam durch.' },
  { game: 'gta-v', title: 'Rennserie', description: 'Mehrere Strecken, eine Gesamtwertung.' },
  { game: 'battlefield-6', title: 'Squad-Abend', description: 'Mehrere volle Squads auf einem Server.' },
  { game: 'battlefield-6', title: 'Fahrzeug-Training', description: 'Panzer, Heli und Jet in Ruhe üben.' },
  { game: 'call-of-duty', title: 'Warzone-Abend', description: 'Mehrere Squads, eine gemeinsame Wertung.' },
  { game: 'call-of-duty', title: 'Zombies-Nacht', description: 'Wie viele Runden schaffen wir zusammen?' },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const event of events) {
    await db.run(
      sql`INSERT INTO \`events\` (\`title\`, \`game\`, \`description\`) VALUES (${event.title}, ${event.game}, ${event.description});`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const event of events) {
    await db.run(sql`DELETE FROM \`events\` WHERE \`title\` = ${event.title} AND \`game\` = ${event.game};`)
  }
}

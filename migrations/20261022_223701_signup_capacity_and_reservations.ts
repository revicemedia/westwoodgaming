import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`events_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`events_texts_order_parent\` ON \`events_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`max_squads\` numeric;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`max_players\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`events_texts\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`max_squads\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`max_players\`;`)
}

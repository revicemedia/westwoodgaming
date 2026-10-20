import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Indexnamen sind in SQLite global: den alten Namen erst freigeben, bevor lineup_signups ihn bekommt
  await db.run(sql`DROP INDEX \`event_discordId_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`event_discordId_1_idx\` ON \`lineup_slots\` (\`event_id\`,\`discord_id\`);`)
  await db.run(sql`CREATE TABLE \`lineup_signups\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`event_id\` integer NOT NULL,
  	\`discord_name\` text NOT NULL,
  	\`discord_id\` text NOT NULL,
  	\`discord_avatar\` text,
  	\`status\` text DEFAULT 'active' NOT NULL,
  	\`after_deadline\` integer DEFAULT false,
  	\`cancelled_late\` integer DEFAULT false,
  	\`attendance\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`lineup_signups_event_idx\` ON \`lineup_signups\` (\`event_id\`);`)
  await db.run(sql`CREATE INDEX \`lineup_signups_discord_id_idx\` ON \`lineup_signups\` (\`discord_id\`);`)
  await db.run(sql`CREATE INDEX \`lineup_signups_updated_at_idx\` ON \`lineup_signups\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`lineup_signups_created_at_idx\` ON \`lineup_signups\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`event_discordId_idx\` ON \`lineup_signups\` (\`event_id\`,\`discord_id\`);`)
  await db.run(sql`CREATE TABLE \`players_secondary_positions\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`players\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`players_secondary_positions_order_idx\` ON \`players_secondary_positions\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`players_secondary_positions_parent_idx\` ON \`players_secondary_positions\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`players\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`discord_id\` text NOT NULL,
  	\`discord_name\` text NOT NULL,
  	\`discord_avatar\` text,
  	\`main_position\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`players_discord_id_idx\` ON \`players\` (\`discord_id\`);`)
  await db.run(sql`CREATE INDEX \`players_updated_at_idx\` ON \`players\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`players_created_at_idx\` ON \`players\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`lineup_enabled\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`signup_deadline\` text;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`lineup_published\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`lineup_signups_id\` integer REFERENCES lineup_signups(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`players_id\` integer REFERENCES players(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_lineup_signups_id_idx\` ON \`payload_locked_documents_rels\` (\`lineup_signups_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_players_id_idx\` ON \`payload_locked_documents_rels\` (\`players_id\`);`)

  // Bestehende Aufstellungen bleiben sichtbar: als freigegeben übernehmen, Eingetragene gelten als angemeldet
  await db.run(sql`UPDATE \`events\` SET \`lineup_enabled\` = 1, \`lineup_published\` = 1 WHERE \`formation\` IS NOT NULL;`)
  await db.run(sql`INSERT INTO \`lineup_signups\` (\`event_id\`, \`discord_name\`, \`discord_id\`, \`discord_avatar\`, \`status\`, \`created_at\`, \`updated_at\`)
    SELECT \`event_id\`, \`discord_name\`, \`discord_id\`, \`discord_avatar\`, 'active', \`created_at\`, \`created_at\` FROM \`lineup_slots\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`lineup_signups\`;`)
  await db.run(sql`DROP TABLE \`players_secondary_positions\`;`)
  await db.run(sql`DROP TABLE \`players\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`events_id\` integer,
  	\`lineup_slots_id\` integer,
  	\`news_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`lineup_slots_id\`) REFERENCES \`lineup_slots\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "events_id", "lineup_slots_id", "news_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "events_id", "lineup_slots_id", "news_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_lineup_slots_id_idx\` ON \`payload_locked_documents_rels\` (\`lineup_slots_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`DROP INDEX \`event_discordId_1_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`event_discordId_idx\` ON \`lineup_slots\` (\`event_id\`,\`discord_id\`);`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`lineup_enabled\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`signup_deadline\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`lineup_published\`;`)
}

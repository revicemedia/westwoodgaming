import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`lineup_slots\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`event_id\` integer NOT NULL,
  	\`position\` text NOT NULL,
  	\`discord_name\` text NOT NULL,
  	\`discord_id\` text NOT NULL,
  	\`discord_avatar\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`lineup_slots_event_idx\` ON \`lineup_slots\` (\`event_id\`);`)
  await db.run(sql`CREATE INDEX \`lineup_slots_updated_at_idx\` ON \`lineup_slots\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`lineup_slots_created_at_idx\` ON \`lineup_slots\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`event_position_idx\` ON \`lineup_slots\` (\`event_id\`,\`position\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`event_discordId_idx\` ON \`lineup_slots\` (\`event_id\`,\`discord_id\`);`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`formation\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`lineup_slots_id\` integer REFERENCES lineup_slots(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_lineup_slots_id_idx\` ON \`payload_locked_documents_rels\` (\`lineup_slots_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`lineup_slots\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`events_id\` integer,
  	\`news_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "events_id", "news_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "events_id", "news_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`formation\`;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`events\` SET \`game\` = 'gta-vi' WHERE \`game\` = 'gta-v';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`events\` SET \`game\` = 'gta-v' WHERE \`game\` = 'gta-vi';`)
}

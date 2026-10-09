import path from 'path'
import { fileURLToPath } from 'url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { de } from '@payloadcms/translations/languages/de'
import { buildConfig } from 'payload'

import { Events } from './collections/Events'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
    },
    meta: {
      titleSuffix: '| Westwood Gaming',
    },
  },
  collections: [Events, Users],
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: 'de',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      // TURSO_* setzt die Turso-Integration von Vercel automatisch
      url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Schema-Änderungen laufen ausschließlich über Migrationen
    push: false,
    // In Produktion spielt Payload offene Migrationen beim Start selbst ein
    prodMigrations: migrations,
  }),
})

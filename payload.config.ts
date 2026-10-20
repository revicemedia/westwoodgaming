import path from 'path'
import { fileURLToPath } from 'url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { de } from '@payloadcms/translations/languages/de'
import { buildConfig } from 'payload'

import { Events } from './collections/Events'
import { LineupSignups } from './collections/LineupSignups'
import { LineupSlots } from './collections/LineupSlots'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { Players } from './collections/Players'
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
  collections: [Events, LineupSignups, LineupSlots, Players, News, Media, Users],
  editor: lexicalEditor({
    features: [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      // nur externe Links, keine Verweise auf Admin-Einträge
      LinkFeature({ enabledCollections: [] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),
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
  plugins: [
    // Auf Vercel liegen hochgeladene Bilder im Blob-Speicher, lokal im Ordner media/
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
      // Felder des Plugins auch lokal (ohne Token) anlegen, damit Migrationen lokal und live gleich sind
      alwaysInsertFields: true,
    }),
  ],
})

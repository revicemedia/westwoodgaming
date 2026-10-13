import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Bild',
    plural: 'Bilder',
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      label: 'Bildbeschreibung',
      type: 'text',
      admin: {
        description: 'Kurze Beschreibung des Bildes für Screenreader.',
      },
    },
  ],
}

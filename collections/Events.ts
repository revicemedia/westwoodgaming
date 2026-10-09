import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

import { announceEvent } from '../lib/eventWebhook'
import { games } from '../lib/games'

export const EVENTS_TAG = 'events'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'game', 'date'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ context }) => {
        if (!context.disableRevalidate) revalidateTag(EVENTS_TAG, { expire: 0 })
      },
      async ({ doc, operation, req }) => {
        if (operation === 'create') await announceEvent(doc, req.payload.logger)
      },
    ],
    afterDelete: [
      ({ context }) => {
        if (!context.disableRevalidate) revalidateTag(EVENTS_TAG, { expire: 0 })
      },
    ],
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
    },
    {
      name: 'game',
      label: 'Spiel',
      type: 'select',
      required: true,
      options: games.map((game) => ({ label: game.name, value: game.slug })),
    },
    {
      name: 'date',
      label: 'Termin',
      type: 'date',
      admin: {
        description: 'Leer lassen, wenn der Termin noch nicht feststeht.',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
          timeFormat: 'HH:mm',
        },
      },
    },
    {
      name: 'description',
      label: 'Beschreibung',
      type: 'textarea',
      required: true,
    },
  ],
}

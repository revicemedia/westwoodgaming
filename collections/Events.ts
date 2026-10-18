import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

import { announceEvent } from '../lib/eventWebhook'
import { formationKeys, getFormation, LINEUP_GAMES } from '../lib/formations'
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
      // Wechselt die Aufstellung, fliegen Einträge auf Positionen raus, die es nicht mehr gibt
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.formation === previousDoc?.formation) return
        const keys = getFormation(doc.formation)?.map((position) => position.key) ?? []
        await req.payload.delete({
          collection: 'lineup-slots',
          where: { and: [{ event: { equals: doc.id } }, { position: { not_in: keys } }] },
          req,
        })
      },
    ],
    beforeDelete: [
      // Aufstellung des Events mit entfernen
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'lineup-slots', where: { event: { equals: id } }, req })
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
    {
      name: 'formation',
      label: 'Aufstellung',
      type: 'select',
      options: formationKeys.map((key) => ({ label: key, value: key })),
      admin: {
        description: 'Optional. Spieler können sich dann über den Aufstellungs-Link mit Discord auf eine Position eintragen.',
        condition: (data) => LINEUP_GAMES.includes(data?.game),
      },
    },
    {
      name: 'lineup',
      label: 'Eingetragene Spieler',
      type: 'join',
      collection: 'lineup-slots',
      on: 'event',
      admin: {
        description: 'Zum Austragen einen Eintrag öffnen und löschen.',
        defaultColumns: ['discordName', 'position'],
        condition: (data) => Boolean(data?.formation),
      },
    },
  ],
}

import { revalidateTag } from 'next/cache'
import type { CollectionConfig, Where } from 'payload'

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
      // Wechselt die Formation, fliegen Einträge auf Positionen raus, die es nicht mehr gibt
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.formation === previousDoc?.formation) return
        const keys = getFormation(doc.formation)?.map((position) => position.key) ?? []
        const where: Where = { and: [{ event: { equals: doc.id } }, { position: { not_in: keys } }] }
        await req.payload.delete({ collection: 'lineup-slots', where, req })
      },
    ],
    beforeDelete: [
      // Anmeldungen und Aufstellung des Events mit entfernen
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'lineup-slots', where: { event: { equals: id } }, req })
        await req.payload.delete({ collection: 'lineup-signups', where: { event: { equals: id } }, req })
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
      name: 'lineupEnabled',
      label: 'Anmeldung mit Aufstellung',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Spieler melden sich über den Aufstellungs-Link mit Discord an. Nach dem Anmeldeschluss schlägt die Seite Formation und Aufstellung vor, ein Admin gibt sie frei.',
        condition: (data) => LINEUP_GAMES.includes(data?.game),
      },
    },
    {
      name: 'signupDeadline',
      label: 'Anmeldeschluss',
      type: 'date',
      admin: {
        description: 'Leer lassen für 2 Stunden vor dem Termin. Wer sich danach anmeldet, landet auf der Warteliste.',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
          timeFormat: 'HH:mm',
        },
        condition: (data) => Boolean(data?.lineupEnabled),
      },
    },
    {
      name: 'formation',
      label: 'Formation',
      type: 'select',
      options: formationKeys.map((key) => ({ label: key, value: key })),
      admin: {
        description: 'Wird beim Übernehmen eines Vorschlags auf der Aufstellungsseite gesetzt.',
        condition: (data) => Boolean(data?.lineupEnabled),
      },
    },
    {
      name: 'lineupPublished',
      label: 'Aufstellung freigegeben',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Erst nach der Freigabe sehen Spieler die Aufstellung.',
        condition: (data) => Boolean(data?.lineupEnabled),
      },
    },
    {
      name: 'signups',
      label: 'Anmeldungen',
      type: 'join',
      collection: 'lineup-signups',
      on: 'event',
      defaultSort: 'createdAt',
      admin: {
        defaultColumns: ['discordName', 'status', 'afterDeadline', 'attendance'],
        condition: (data) => Boolean(data?.lineupEnabled),
      },
    },
    {
      name: 'lineup',
      label: 'Aufstellung',
      type: 'join',
      collection: 'lineup-slots',
      on: 'event',
      admin: {
        description: 'Bearbeiten geht am einfachsten auf der Aufstellungsseite des Events.',
        defaultColumns: ['discordName', 'position'],
        condition: (data) => Boolean(data?.lineupEnabled),
      },
    },
  ],
}

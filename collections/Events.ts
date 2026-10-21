import { revalidateTag } from 'next/cache'
import type { CollectionConfig, Where } from 'payload'

import { announceEvent } from '../lib/eventWebhook'
import { formationKeys, getFormation, LINEUP_GAMES } from '../lib/formations'
import { games } from '../lib/games'
import { promoteFromWaitlist } from '../lib/waitlist'

// Alle Positionsschlüssel aus allen Formationen; das Sperr-Feld zeigt nur die der gewählten Formation
const allPositionKeys = [...new Set(formationKeys.flatMap((key) => getFormation(key)!.map((position) => position.key)))]

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
    beforeChange: [
      // Gesperrt werden kann nur, was es in der Formation gibt
      ({ data, originalDoc }) => {
        if (!data.blockedPositions) return data
        const formation = 'formation' in data ? data.formation : originalDoc?.formation
        const keys = getFormation(formation)?.map((position) => position.key) ?? []
        return { ...data, blockedPositions: data.blockedPositions.filter((key: string) => keys.includes(key)) }
      },
    ],
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
        const where: Where = { and: [{ event: { equals: doc.id } }, { position: { not_in: keys } }] }
        await req.payload.delete({ collection: 'lineup-slots', where, req, context: { skipPromotion: true } })
        await req.payload.delete({ collection: 'lineup-waitlist', where, req })
      },
      // Freigegebene Positionen gehen an den Ersten auf der Warteliste
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return
        const released = (previousDoc?.blockedPositions ?? []).filter(
          (key: string) => !(doc.blockedPositions ?? []).includes(key),
        )
        for (const position of released) await promoteFromWaitlist(req.payload, doc.id, position, req)
      },
    ],
    beforeDelete: [
      // Aufstellung und Warteliste des Events mit entfernen, ohne nachrücken zu lassen
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'lineup-waitlist', where: { event: { equals: id } }, req })
        await req.payload.delete({
          collection: 'lineup-slots',
          where: { event: { equals: id } },
          req,
          context: { skipPromotion: true },
        })
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
      name: 'blockedPositions',
      label: 'Gesperrte Positionen',
      type: 'select',
      hasMany: true,
      options: allPositionKeys.map((key) => ({ label: key, value: key })),
      filterOptions: ({ data, options }) => {
        const keys = getFormation(data?.formation)?.map((position) => position.key) ?? []
        return options.filter((option) => keys.includes(typeof option === 'string' ? option : option.value))
      },
      admin: {
        description:
          'Für die Session reserviert, niemand kann sich darauf eintragen. Zum Freigeben entfernen; dann rückt der Erste von der Warteliste nach. Geht auch per Schloss auf der Aufstellungsseite.',
        condition: (data) => Boolean(data?.formation),
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
    {
      name: 'waitlist',
      label: 'Warteliste',
      type: 'join',
      collection: 'lineup-waitlist',
      on: 'event',
      defaultSort: 'createdAt',
      admin: {
        description: 'Wird eine Wunschposition frei, rückt der Erste mit diesem Wunsch automatisch nach.',
        defaultColumns: ['discordName', 'position', 'createdAt'],
        condition: (data) => Boolean(data?.formation),
      },
    },
  ],
}

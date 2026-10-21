import type { CollectionConfig } from 'payload'

// Warteliste eines Events: Spieler, deren Wunschposition vergeben oder vom Admin gesperrt ist.
// Wird die Position frei, rückt der Erste mit diesem Wunsch nach (lib/waitlist.ts).
export const LineupWaitlist: CollectionConfig = {
  slug: 'lineup-waitlist',
  labels: {
    singular: 'Wartelisten-Eintrag',
    plural: 'Warteliste',
  },
  admin: {
    useAsTitle: 'discordName',
    defaultColumns: ['discordName', 'position', 'event', 'createdAt'],
  },
  defaultSort: 'createdAt',
  access: {
    // Nur Admins über den Admin-Bereich; die Website nutzt die Local API
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  // Pro Event steht jeder Spieler nur einmal auf der Warteliste
  indexes: [{ fields: ['event', 'discordId'], unique: true }],
  fields: [
    {
      name: 'event',
      label: 'Event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
    },
    {
      name: 'position',
      label: 'Wunschposition',
      type: 'text',
      required: true,
    },
    {
      name: 'discordName',
      label: 'Spieler',
      type: 'text',
      required: true,
    },
    {
      name: 'discordId',
      label: 'Discord-ID',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'discordAvatar',
      label: 'Avatar',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}

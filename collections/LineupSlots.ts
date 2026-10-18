import type { CollectionConfig } from 'payload'

// Ein belegter Platz in der Aufstellung eines Events.
// Die Website schreibt hier nur serverseitig nach Prüfung des Discord-Logins.
export const LineupSlots: CollectionConfig = {
  slug: 'lineup-slots',
  labels: {
    singular: 'Aufstellungsplatz',
    plural: 'Aufstellungsplätze',
  },
  admin: {
    useAsTitle: 'discordName',
    defaultColumns: ['discordName', 'position', 'event', 'createdAt'],
  },
  access: {
    // Nur Admins über den Admin-Bereich; die Website nutzt die Local API
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  // Pro Event ist jede Position nur einmal vergeben und jeder Spieler nur einmal eingetragen
  indexes: [
    { fields: ['event', 'position'], unique: true },
    { fields: ['event', 'discordId'], unique: true },
  ],
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
      label: 'Position',
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

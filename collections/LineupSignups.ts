import type { CollectionConfig } from 'payload'

// Anmeldung eines Spielers zu einem Event mit Aufstellung.
// Aus kurzfristigen Absagen und der Anwesenheit ergibt sich die Zuverlässigkeit (lib/reliability.ts).
export const LineupSignups: CollectionConfig = {
  slug: 'lineup-signups',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  admin: {
    useAsTitle: 'discordName',
    defaultColumns: ['discordName', 'event', 'status', 'attendance', 'createdAt'],
  },
  defaultSort: 'createdAt',
  access: {
    // Nur Admins über den Admin-Bereich; die Website nutzt die Local API
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  // Pro Event ist jeder Spieler nur einmal angemeldet
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
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'discordAvatar',
      label: 'Avatar',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Angemeldet', value: 'active' },
        { label: 'Abgesagt', value: 'cancelled' },
      ],
    },
    {
      name: 'afterDeadline',
      label: 'Nach Anmeldeschluss angemeldet (Warteliste)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'cancelledLate',
      label: 'Kurzfristig abgesagt',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Nach Anmeldeschluss abgesagt. Senkt die Zuverlässigkeit.' },
    },
    {
      name: 'attendance',
      label: 'Anwesenheit',
      type: 'select',
      options: [
        { label: 'Pünktlich da', value: 'present' },
        { label: 'Zu spät', value: 'late' },
        { label: 'Nicht erschienen', value: 'no_show' },
      ],
      admin: { description: 'Nach dem Event vom Admin gesetzt. Fließt in die Zuverlässigkeit ein.' },
    },
  ],
}

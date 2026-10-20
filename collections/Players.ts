import type { CollectionConfig } from 'payload'

import { roleKeys, roles } from '../lib/formations'

const roleOptions = roleKeys.map((key) => ({ label: `${key} – ${roles[key]}`, value: key }))

// Spielerprofil zum Discord-Login: Wunschpositionen für alle Events.
// Die Website schreibt hier nur serverseitig nach Prüfung des Discord-Logins.
export const Players: CollectionConfig = {
  slug: 'players',
  labels: {
    singular: 'Spieler',
    plural: 'Spieler',
  },
  admin: {
    useAsTitle: 'discordName',
    defaultColumns: ['discordName', 'mainPosition', 'secondaryPositions', 'updatedAt'],
  },
  access: {
    // Nur Admins über den Admin-Bereich; die Website nutzt die Local API
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'discordId',
      label: 'Discord-ID',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: 'discordName',
      label: 'Spieler',
      type: 'text',
      required: true,
    },
    {
      name: 'discordAvatar',
      label: 'Avatar',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'mainPosition',
      label: 'Hauptposition',
      type: 'select',
      required: true,
      options: roleOptions,
    },
    {
      name: 'secondaryPositions',
      label: 'Nebenpositionen',
      type: 'select',
      hasMany: true,
      required: true,
      options: roleOptions,
      validate: (value: unknown, { siblingData }: { siblingData: { mainPosition?: string } }) => {
        const list = Array.isArray(value) ? value : []
        if (list.length === 0) return 'Mindestens eine Nebenposition wählen.'
        if (list.includes(siblingData.mainPosition)) return 'Die Hauptposition kann nicht zugleich Nebenposition sein.'
        return true
      },
    },
  ],
}

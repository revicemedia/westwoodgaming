import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

import { newsCategories } from '../lib/newsCategories'

export const NEWS_TAG = 'news'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: 'News',
    plural: 'News',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'publishedAt'],
  },
  defaultSort: '-publishedAt',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ context }) => {
        if (!context.disableRevalidate) revalidateTag(NEWS_TAG, { expire: 0 })
      },
    ],
    afterDelete: [
      ({ context }) => {
        if (!context.disableRevalidate) revalidateTag(NEWS_TAG, { expire: 0 })
      },
    ],
  },
  fields: [
    {
      name: 'title',
      label: 'Headline',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'URL-Name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Wird aus der Headline erzeugt, wenn das Feld leer bleibt.',
      },
      hooks: {
        beforeValidate: [({ value, data }) => slugify(value || data?.title || '')],
      },
    },
    {
      name: 'category',
      label: 'Kategorie',
      type: 'select',
      required: true,
      defaultValue: newsCategories[0].value,
      options: newsCategories.map(({ label, value }) => ({ label, value })),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      label: 'Autor',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      label: 'Datum',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'image',
      label: 'Bild',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Ohne Bild wird das Bild der Kategorie verwendet.',
      },
    },
    {
      name: 'preview',
      label: 'Preview',
      type: 'textarea',
      required: true,
      maxLength: 240,
      admin: {
        description: 'Kurzer Anreißer für die Kachel, höchstens 240 Zeichen.',
      },
    },
    {
      name: 'content',
      label: 'Inhalt',
      type: 'richText',
      required: true,
    },
  ],
}

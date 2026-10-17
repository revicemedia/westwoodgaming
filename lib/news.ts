import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import { NEWS_TAG } from '@/collections/News'
import { getNewsCategory } from '@/lib/newsCategories'
import type { News } from '@/payload-types'

export type NewsItem = {
  id: number
  slug: string
  title: string
  category: string
  author: string
  date: string
  // für das Datums-Badge auf der Kachel
  day: string
  month: string
  publishedAt: string
  image: string
  imageAlt: string
  preview: string
}

export type NewsArticle = NewsItem & { content: News['content'] }

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Europe/Berlin',
})
const dayFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', timeZone: 'Europe/Berlin' })
const monthFormat = new Intl.DateTimeFormat('de-DE', { month: 'short', timeZone: 'Europe/Berlin' })

function toItem(doc: News): NewsItem {
  const category = getNewsCategory(doc.category)
  const image = typeof doc.image === 'object' ? doc.image : null

  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    category: category.label,
    author: doc.author,
    date: dateFormat.format(new Date(doc.publishedAt)),
    day: dayFormat.format(new Date(doc.publishedAt)).replace('.', ''),
    month: monthFormat.format(new Date(doc.publishedAt)).replace('.', ''),
    publishedAt: doc.publishedAt,
    // ohne eigenes Bild steht das Bild der Kategorie
    image: image?.url ?? category.image,
    imageAlt: image?.alt ?? '',
    preview: doc.preview,
  }
}

// Ist die Datenbank nicht erreichbar, bleibt die Seite ohne News benutzbar
export async function getNews(): Promise<NewsItem[]> {
  try {
    return await findNews()
  } catch (cause) {
    console.error('News konnten nicht geladen werden.', cause)
    return []
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  try {
    return await findNewsArticle(slug)
  } catch (cause) {
    console.error('News-Artikel konnte nicht geladen werden.', cause)
    return null
  }
}

// Remote-Cache: die Datenbank wird nur nach Änderungen im Admin gefragt
async function findNews(): Promise<NewsItem[]> {
  'use cache: remote'
  cacheTag(NEWS_TAG)
  cacheLife('max')

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    sort: '-publishedAt',
    depth: 1,
    pagination: false,
    select: { content: false },
  })

  return docs.map((doc) => toItem(doc as News))
}

async function findNewsArticle(slug: string): Promise<NewsArticle | null> {
  'use cache: remote'
  cacheTag(NEWS_TAG)
  cacheLife('max')

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  return docs[0] ? { ...toItem(docs[0]), content: docs[0].content } : null
}

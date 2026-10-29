import Image from 'next/image'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '@/payload-types'

// Bilder im Artikeltext laufen über next/image statt über das rohe <img> von Payload
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const media = node.value as Media | number
    if (typeof media !== 'object' || !media.url || !media.width || !media.height) return null

    return (
      <figure>
        <Image
          src={media.url}
          alt={media.alt ?? ''}
          width={media.width}
          height={media.height}
          sizes="(min-width: 768px) 48rem, 100vw"
          className="h-auto w-full rounded-md"
        />
        {(media.alt || media.source) && (
          <figcaption>
            {media.alt}
            {media.source && <span className="block text-xs text-gray-400">Bild: {media.source}</span>}
          </figcaption>
        )}
      </figure>
    )
  },
})

export default function NewsContent({ data, className }: { data: SerializedEditorState; className?: string }) {
  return <RichText data={data} converters={converters} className={className} />
}

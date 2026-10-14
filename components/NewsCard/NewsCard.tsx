import Image from 'next/image'
import Link from 'next/link'
import type { NewsItem } from '@/lib/news'

export default function NewsCard({ news }: { news: NewsItem }) {
  return (
    <Link href={`/news/${news.slug}`} className="block w-full h-full rounded-md overflow-hidden bg-white shadow-sm transition-all hover:opacity-90">
        <div className="relative aspect-video">
            <Image
              src={news.image}
              alt={news.imageAlt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-white mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        </div>
        <div className="relative -mt-px bg-white px-4 pt-px pb-4 flex flex-col gap-2">
            <p className="text-xs font-extralight border rounded-sm w-fit px-1 text-purple border-purple">{news.category}</p>
            <div>
                <p className="text-lg font-semibold tracking-normal text-black">{news.title}</p>
                <p className="text-sm text-gray-900">{news.author} · {news.date}</p>
            </div>
            <p className="text-sm/6 text-gray-900">{news.preview}</p>
        </div>
    </Link>
  )
}

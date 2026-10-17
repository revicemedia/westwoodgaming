import Image from 'next/image'
import type { Head } from '@/lib/heads'

export default function HeadCard({ head }: { head: Head }) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-md bg-gray-900">
        <Image
          src={head.image}
          alt={head.gamertag}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-black mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
            <p className="text-xs font-extralight border rounded-sm w-fit px-1 text-white border-white">{head.role}</p>
            <p className="text-2xl font-semibold tracking-normal text-white">{head.gamertag}</p>
        </div>
    </div>
  )
}

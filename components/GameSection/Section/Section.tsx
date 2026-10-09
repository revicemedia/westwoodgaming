import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/lib/games'

export default function Section({game}: {game: Game}) {
  return (
    <Link href={`/spiele/${game.slug}`} className="block w-full h-auto rounded-md overflow-hidden bg-black transition-all hover:opacity-90">
        <div className="relative">
            <Image
              src={game.image}
              alt={game.name}
              width={1920}
              height={1080}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="block h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-black mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        </div>
        <div className="relative -mt-px bg-black px-4 pt-px pb-4 flex flex-col gap-2">
            <div className="flex justify-between">
                <h2 className="text-xs font-extralight border rounded-sm w-fit px-1 text-white border-white">{game.category}</h2>
                <div className="flex gap-1 items-center justify-center">
                    <div className="rounded-full w-1.5 h-1.5 bg-green-400 animate-pulse"></div>
                    <p className="text-green-400 text-xs">{game.online + " online"}</p>
                </div>
            </div>
            <p className="text-lg font-semibold tracking-normal text-white">{game.name}</p>
        </div>
    </Link>
  )
}
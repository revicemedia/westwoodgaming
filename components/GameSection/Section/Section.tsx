import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { Game } from '@/lib/games'

export default function Section({game}: {game: Game}) {
  return (
    <Link href={`/spiele/${game.slug}`} className="group block w-full h-auto rounded-md overflow-hidden bg-black ring-purple transition-all hover:ring-1">
        <div className="relative overflow-hidden">
            <Image
              src={game.image}
              alt={game.name}
              width={1920}
              height={1080}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="block h-auto w-full transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-black mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        </div>
        <div className="relative -mt-px bg-black px-4 pt-px pb-4 flex flex-col gap-2">
            <h2 className="text-xs font-extralight border rounded-sm w-fit px-1 text-white border-white">{game.category}</h2>
            <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold tracking-normal text-white">{game.name}</p>
                {/* Pfeil zeigt, dass die Kachel zur Spielseite führt */}
                <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-sm bg-white/10 text-white transition-colors group-hover:bg-purple">
                    <ArrowRightIcon className="size-4" />
                </span>
            </div>
        </div>
    </Link>
  )
}

import Image from 'next/image'
import { formatEventDate } from '@/lib/eventDate'
import type { GameEvent } from '@/lib/events'

export default function EventCard({ event, image, game }: { event: GameEvent; image: string; game: string }) {
  return (
    <div className="block w-full h-auto rounded-md overflow-hidden bg-black">
        <div className="relative">
            <Image
              src={image}
              alt=""
              width={1920}
              height={1080}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="block h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-black mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        </div>
        <div className="relative -mt-px bg-black px-4 pt-px pb-4 flex flex-col gap-2">
            <p className="text-xs font-extralight border rounded-sm w-fit px-1 text-white border-white">{game}</p>
            <div>
                <p className="text-lg font-semibold tracking-normal text-white">{event.title}</p>
                <p className="text-sm text-white">{formatEventDate(event.date)}</p>
            </div>
            <p className="text-sm/6 text-gray-300">{event.description}</p>
        </div>
    </div>
  )
}

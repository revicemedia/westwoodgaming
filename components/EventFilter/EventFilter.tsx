'use client'

import { useState } from 'react'
import EventCard from '@/components/EventCard/EventCard'
import type { GameEvent } from '@/lib/events'
import { games } from '@/lib/games'

function EventGrid({ events }: { events: GameEvent[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const game = games.find((game) => game.slug === event.game)

        return (
          <li key={event.id}>
            <EventCard event={event} image={game?.image ?? '/WG-Logo.jpg'} game={game?.name ?? event.game} />
          </li>
        )
      })}
    </ul>
  )
}

export default function EventFilter({ upcoming, past }: { upcoming: GameEvent[]; past: GameEvent[] }) {
  const [active, setActive] = useState<string | null>(null)

  const filters = [{ slug: null, name: 'Alle' }, ...games.map((game) => ({ slug: game.slug as string | null, name: game.name }))]
  const matches = (event: GameEvent) => !active || event.game === active
  const visibleUpcoming = upcoming.filter(matches)
  const visiblePast = past.filter(matches)

  return (
    <>
      <div role="group" aria-label="Nach Spiel filtern" className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.name}
            type="button"
            onClick={() => setActive(filter.slug)}
            aria-pressed={active === filter.slug}
            className={`rounded-md border border-black px-4 py-2 text-sm font-semibold transition-all ${
              active === filter.slug ? 'bg-black text-white' : 'text-black hover:bg-stone-100'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {visibleUpcoming.length > 0 ? (
          <EventGrid events={visibleUpcoming} />
        ) : (
          <p className="text-base/7 text-gray-600">Aktuell sind hier keine Events geplant.</p>
        )}
      </div>

      {visiblePast.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-4 text-2xl font-semibold text-black">/ Vergangene Events</h2>
          <EventGrid events={visiblePast} />
        </div>
      )}
    </>
  )
}

'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import type { LineupSlot } from '@/lib/lineup'

type Props = {
  entries: LineupSlot[]
  userId: string | null
  pending: boolean
  onLeave: () => void
  hint: string
}

// Warteliste für Squads und Teilnehmerliste, in Wartereihenfolge
export default function WaitlistList({ entries, userId, pending, onLeave, hint }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-900">Warteliste ({entries.length})</h3>
      <p className="mt-1 text-sm text-gray-600">{hint}</p>
      <ol className="mt-3 divide-y divide-gray-100">
        {entries.map((entry, index) => (
          <li key={entry.discordId} className="flex items-center gap-3 py-2">
            <span className="w-5 text-right text-xs font-semibold text-gray-500">{index + 1}.</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.discordAvatar ?? ''} alt="" className="size-8 rounded-full bg-gray-200" />
            <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
              {entry.discordName}
              {entry.discordId === userId && <span className="text-gray-500"> (du)</span>}
            </span>
            {entry.discordId === userId && (
              <button
                type="button"
                disabled={pending}
                onClick={onLeave}
                aria-label="Warteliste verlassen"
                title="Warteliste verlassen"
                className="flex size-6 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black disabled:opacity-60"
              >
                <XMarkIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

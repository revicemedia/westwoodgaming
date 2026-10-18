'use client'

import { useState, useTransition } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { claimPosition, leavePosition } from '@/app/(frontend)/events/[id]/aufstellung/actions'
import type { FormationPosition } from '@/lib/formations'
import type { LineupSlot } from '@/lib/lineup'

type Props = {
  eventId: string
  formation: FormationPosition[]
  slots: LineupSlot[]
  userId: string | null
  // angemeldet, aber nicht auf unserem Server: ansehen ja, eintragen nein
  canJoin: boolean
  loginUrl: string
}

export default function LineupPitch({ eventId, formation, slots, userId, canJoin, loginUrl }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
    })
  }

  const select = (position: FormationPosition, slot: LineupSlot | undefined) => {
    if (!userId) return window.location.assign(loginUrl)
    if (!canJoin) return setError('Eintragen können nur Mitglieder unseres Discord-Servers.')
    if (!slot) run(() => claimPosition(eventId, position.key))
  }

  return (
    <div>
      {/* Spielfeld */}
      <div className="relative mx-auto aspect-3/4 w-full max-w-xl overflow-hidden rounded-md bg-gray-900">
        <div aria-hidden="true" className="absolute inset-4 rounded-sm border border-white/15">
          <div className="absolute inset-x-0 top-1/2 border-t border-white/15" />
          <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
          <div className="absolute top-0 left-1/2 h-[16%] w-1/2 -translate-x-1/2 border-x border-b border-white/15" />
          <div className="absolute bottom-0 left-1/2 h-[16%] w-1/2 -translate-x-1/2 border-x border-t border-white/15" />
        </div>

        {formation.map((position) => {
          const slot = slots.find((entry) => entry.position === position.key)
          const mine = slot?.discordId === userId && userId !== null
          const taken = slot && !mine

          return (
            <div
              key={position.key}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <div className="relative">
                <button
                  type="button"
                  // belegte Plätze (auch der eigene) sind nicht anklickbar; freigeben geht über das X
                  disabled={pending || Boolean(slot)}
                  onClick={() => select(position, slot)}
                  title={taken ? `${slot.discordName} spielt hier` : mine ? 'Deine Position' : 'Auf diese Position eintragen'}
                  className={`group flex size-12 items-center justify-center overflow-hidden rounded-full text-xs font-semibold transition-all disabled:cursor-default sm:size-14 ${
                    mine
                      ? 'ring-3 ring-lime'
                      : taken
                        ? 'ring-2 ring-white/40'
                        : 'border-2 border-dashed border-white/50 text-white hover:border-lime hover:bg-lime hover:text-black'
                  }`}
                >
                  {slot?.discordAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.discordAvatar} alt="" className="size-full object-cover" />
                  ) : (
                    position.label
                  )}
                </button>
                {mine && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => leavePosition(eventId))}
                    aria-label="Platz freigeben"
                    title="Platz freigeben"
                    className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-sm ring-2 ring-gray-900 transition-colors hover:bg-lime disabled:opacity-60"
                  >
                    <XMarkIcon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              {/* freie Plätze tragen die Position schon im Kreis */}
              {slot && (
                <span className="max-w-full truncate rounded-sm bg-black/70 px-1.5 text-[0.6875rem] font-semibold text-white">
                  {slot.discordName}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="mt-4 min-h-6 text-center text-sm text-gray-600">
        {error ? <span className="font-semibold text-red-600">{error}</span> : pending ? 'Wird gespeichert …' : null}
      </p>
    </div>
  )
}

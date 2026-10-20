'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import type { FormationPosition } from '@/lib/formations'
import type { LineupSlot } from '@/lib/lineup'

type Props = {
  formation: FormationPosition[]
  slots: LineupSlot[]
  // eigener Platz wird hervorgehoben
  userId: string | null
  // Admin-Bearbeitung: ausgewählter Spieler und Klick auf eine Position
  selectedId?: string | null
  onPositionClick?: (position: FormationPosition, slot: LineupSlot | undefined) => void
  onRemove?: (slot: LineupSlot) => void
  disabled?: boolean
}

export default function LineupPitch({ formation, slots, userId, selectedId, onPositionClick, onRemove, disabled }: Props) {
  const editable = Boolean(onPositionClick)

  return (
    <div className="relative mx-auto aspect-3/4 w-full max-w-xl overflow-hidden rounded-md bg-gray-900">
      <div aria-hidden="true" className="absolute inset-4 rounded-sm border border-white/15">
        <div className="absolute inset-x-0 top-1/2 border-t border-white/15" />
        <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute top-0 left-1/2 h-[16%] w-1/2 -translate-x-1/2 border-x border-b border-white/15" />
        <div className="absolute bottom-0 left-1/2 h-[16%] w-1/2 -translate-x-1/2 border-x border-t border-white/15" />
      </div>

      {formation.map((position) => {
        const slot = slots.find((entry) => entry.position === position.key)
        const mine = userId !== null && slot?.discordId === userId
        const selected = Boolean(slot && selectedId === slot.discordId)

        return (
          <div
            key={position.key}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          >
            <div className="relative">
              <button
                type="button"
                disabled={!editable || disabled}
                onClick={() => onPositionClick?.(position, slot)}
                title={slot ? `${slot.discordName} (${position.label})` : `${position.label}: frei, spielt die KI`}
                className={`flex size-12 items-center justify-center overflow-hidden rounded-full text-xs font-semibold transition-all disabled:cursor-default sm:size-14 ${
                  selected
                    ? 'ring-3 ring-purple'
                    : mine
                      ? 'ring-3 ring-lime'
                      : slot
                        ? `ring-2 ring-white/40 ${editable ? 'hover:ring-lime' : ''}`
                        : `border-2 border-dashed border-white/50 text-white ${editable ? 'hover:border-lime hover:bg-lime hover:text-black' : ''}`
                }`}
              >
                {slot?.discordAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.discordAvatar} alt="" className="size-full object-cover" />
                ) : (
                  position.label
                )}
              </button>
              {slot && onRemove && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemove(slot)}
                  aria-label={`${slot.discordName} aus der Aufstellung nehmen`}
                  title="Aus der Aufstellung nehmen"
                  className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-sm ring-2 ring-gray-900 transition-colors hover:bg-lime disabled:opacity-60"
                >
                  <XMarkIcon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>
            {slot && (
              <span className="max-w-full truncate rounded-sm bg-black/70 px-1.5 text-[0.6875rem] font-semibold text-white">
                {slot.discordAvatar ? `${position.label} · ` : ''}
                {slot.discordName}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

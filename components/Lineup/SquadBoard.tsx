'use client'

import { useState, useTransition } from 'react'
import { ArrowDownTrayIcon, LockClosedIcon, PlusIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  joinSignupWaitlist,
  joinSquad,
  leavePosition,
  leaveWaitlist,
  toggleReserved,
} from '@/app/(frontend)/events/[id]/aufstellung/actions'
import WaitlistList from '@/components/Lineup/WaitlistList'
import type { LineupSlot } from '@/lib/lineup'
import { SQUAD_SIZE, type Squad } from '@/lib/signupModes'

type Props = {
  eventId: string
  squads: Squad<LineupSlot>[]
  // darf ein neuer Squad eröffnet werden (alle voll und unter „Max. Squads“)?
  canOpen: boolean
  maxSquads: number | null
  waitlist: LineupSlot[]
  userId: string | null
  // angemeldet, aber nicht auf unserem Server: ansehen ja, eintragen nein
  canJoin: boolean
  // per Discord-ID freigeschalteter Admin: darf Plätze reservieren und freigeben
  isAdmin: boolean
  loginUrl: string
  // Anmeldung als Bild (PNG)
  exportUrl: string
}

// Battlefield: Squads zu viert. Der Erste im Squad ist Squad-Leader; ein neuer Squad öffnet erst, wenn alle voll sind.
export default function SquadBoard({ eventId, squads, canOpen, maxSquads, waitlist, userId, canJoin, isAdmin, loginUrl, exportUrl }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
    })
  }

  const guard = (action: () => Promise<{ error?: string }>) => {
    if (!userId) return window.location.assign(loginUrl)
    if (!canJoin) return setError('Eintragen können nur Mitglieder unseres Discord-Servers.')
    run(action)
  }

  const inSquad = squads.some((squad) => squad.members.some((member) => member.discordId === userId))
  const waiting = userId !== null && waitlist.some((entry) => entry.discordId === userId)
  const full = !canOpen && squads.every((squad) => squad.free.length === 0)
  const next = squads.length + 1

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {squads.map((squad) => {
          const mine = squad.members.some((member) => member.discordId === userId)
          const taken = squad.members.length + squad.reserved.length
          return (
            <li key={squad.number} className={`rounded-md bg-gray-900 p-5 ${mine ? 'ring-3 ring-lime' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Squad {squad.number}</h3>
                <span className={`rounded-sm px-1.5 text-xs font-semibold ${taken >= SQUAD_SIZE ? 'bg-lime text-black' : 'bg-white/10 text-white'}`}>
                  {taken}/{SQUAD_SIZE}
                </span>
              </div>
              <ol className="mt-4 space-y-2">
                {squad.members.map((member, index) => {
                  const self = member.discordId === userId
                  return (
                    <li key={member.discordId} className="flex h-10 items-center gap-3 rounded-sm bg-white/5 px-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.discordAvatar ?? ''} alt="" className="size-7 rounded-full bg-white/10" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                        {member.discordName}
                        {self && <span className="font-normal text-white/60"> (du)</span>}
                      </span>
                      {index === 0 && (
                        <span className="flex items-center gap-1 rounded-sm bg-purple px-1.5 text-xs font-semibold text-white" title="Squad-Leader: hat sich zuerst eingetragen">
                          <StarIcon aria-hidden="true" className="size-3" strokeWidth={2.5} />
                          Leader
                        </span>
                      )}
                      {self && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => leavePosition(eventId))}
                          aria-label="Aus dem Squad austragen"
                          title="Austragen"
                          className="flex size-6 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
                        >
                          <XMarkIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
                        </button>
                      )}
                    </li>
                  )
                })}
                {squad.reserved.map((key) => (
                  <li key={key} className="flex h-10 items-center gap-3 rounded-sm bg-purple/25 px-3 text-sm text-white/70">
                    <LockClosedIcon aria-hidden="true" className="size-4 text-white" strokeWidth={2} />
                    <span className="flex-1">Reserviert</span>
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => toggleReserved(eventId, key))}
                        className="rounded-sm px-2 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-lime hover:text-black disabled:opacity-60"
                      >
                        Freigeben
                      </button>
                    )}
                  </li>
                ))}
                {squad.free.map((key) => (
                  <li key={key} className="flex h-10 items-center rounded-sm border border-dashed border-white/25 px-3 text-sm text-white/50">
                    <span className="flex-1">Freier Platz</span>
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => toggleReserved(eventId, key))}
                        aria-label="Platz reservieren"
                        title="Admin: Platz reservieren"
                        className="flex size-6 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-purple hover:text-white disabled:opacity-60"
                      >
                        <LockClosedIcon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                      </button>
                    )}
                  </li>
                ))}
              </ol>
              {!mine && squad.free.length > 0 && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => guard(() => joinSquad(eventId, squad.number))}
                  className="mt-4 w-full rounded-md bg-lime px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {inSquad ? `In Squad ${squad.number} wechseln` : `Squad ${squad.number} beitreten`}
                </button>
              )}
            </li>
          )
        })}

        {canOpen && (
          <li>
            <button
              type="button"
              disabled={pending}
              onClick={() => guard(() => joinSquad(eventId, next))}
              className="flex size-full min-h-40 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 p-5 text-gray-600 transition-colors hover:border-purple hover:text-purple disabled:opacity-60"
            >
              <PlusIcon aria-hidden="true" className="size-6" />
              <span className="text-sm font-semibold">{next === 1 ? 'Ersten Squad eröffnen' : `Squad ${next} eröffnen`}</span>
              <span className="text-xs">Du wirst Squad-Leader.</span>
            </button>
          </li>
        )}

        {full && !inSquad && (
          <li className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-gray-300 p-5 text-center">
            <span className="text-sm font-semibold text-gray-900">
              {maxSquads ? `Alle ${maxSquads} Squads sind voll.` : 'Alle Squads sind voll.'}
            </span>
            {waiting ? (
              <span className="text-sm text-gray-600">Du stehst auf der Warteliste und rückst nach, sobald ein Platz frei wird.</span>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => guard(() => joinSignupWaitlist(eventId))}
                className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Auf die Warteliste
              </button>
            )}
          </li>
        )}
      </ul>

      <div className="mt-3 flex">
        <a
          href={exportUrl}
          download={`anmeldung-${eventId}.png`}
          title="Als Bild exportieren"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          <ArrowDownTrayIcon aria-hidden="true" className="size-4" strokeWidth={2} />
          Export
        </a>
      </div>

      <p aria-live="polite" className="mt-4 min-h-6 text-center text-sm text-gray-600">
        {error ? <span className="font-semibold text-red-600">{error}</span> : pending ? 'Wird gespeichert …' : null}
      </p>

      <WaitlistList
        entries={waitlist}
        userId={userId}
        pending={pending}
        onLeave={() => run(() => leaveWaitlist(eventId))}
        hint="Wird ein Platz frei, rückt der Erste automatisch nach."
      />
    </div>
  )
}

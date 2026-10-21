'use client'

import { useState, useTransition } from 'react'
import { ArrowDownTrayIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  claimPosition,
  joinWaitlist,
  leavePosition,
  leaveWaitlist,
  toggleBlocked,
} from '@/app/(frontend)/events/[id]/aufstellung/actions'
import type { FormationPosition } from '@/lib/formations'
import type { LineupSlot } from '@/lib/lineup'

type Props = {
  eventId: string
  formation: FormationPosition[]
  slots: LineupSlot[]
  // Warteliste in Wartereihenfolge, position ist die Wunschposition
  waitlist: LineupSlot[]
  // vom Admin für die Session gesperrte Positionen
  blocked: string[]
  userId: string | null
  // angemeldet, aber nicht auf unserem Server: ansehen ja, eintragen nein
  canJoin: boolean
  // per Discord-ID freigeschalteter Admin (lineupAdmin in lib/admins.ts): darf Positionen sperren und freigeben
  isAdmin: boolean
  loginUrl: string
  // Aufstellung als Bild (PNG)
  exportUrl: string
}

export default function LineupPitch({ eventId, formation, slots, waitlist, blocked, userId, canJoin, isAdmin, loginUrl, exportUrl }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // vergebene oder gesperrte Position, für die gerade die Warteliste angeboten wird
  const [offer, setOffer] = useState<FormationPosition | null>(null)
  // Admin hat eine freie Position angeklickt: selbst eintragen oder sperren
  const [adminChoice, setAdminChoice] = useState<FormationPosition | null>(null)

  const hasSlot = userId !== null && slots.some((slot) => slot.discordId === userId)
  const myWait = userId !== null ? waitlist.find((entry) => entry.discordId === userId) : undefined
  const label = (key: string) => formation.find((position) => position.key === key)?.label ?? key

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(null)
    setOffer(null)
    setAdminChoice(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
    })
  }

  const select = (position: FormationPosition, slot: LineupSlot | undefined, locked: boolean) => {
    if (isAdmin && !slot && !locked) {
      setError(null)
      setOffer(null)
      return setAdminChoice(position)
    }
    if (!userId) return window.location.assign(loginUrl)
    if (!canJoin) return setError('Eintragen können nur Mitglieder unseres Discord-Servers.')
    if (!slot && !locked) return run(() => claimPosition(eventId, position.key))
    if (hasSlot) return setError('Du stehst schon in der Aufstellung. Gib erst deinen Platz frei, um auf die Warteliste zu gehen.')
    if (myWait?.position === position.key) return setError(`Du wartest schon auf ${position.label}.`)
    setError(null)
    setAdminChoice(null)
    setOffer(position)
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
          const locked = !slot && blocked.includes(position.key)

          return (
            <div
              key={position.key}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <div className="relative">
                <button
                  type="button"
                  // der eigene Platz ist nicht anklickbar (freigeben geht über das X), vergebene und gesperrte bieten die Warteliste an
                  disabled={pending || mine}
                  onClick={() => select(position, slot, locked)}
                  title={
                    taken
                      ? `${slot.discordName} spielt hier – klicken für die Warteliste`
                      : locked
                        ? `${position.label} ist vom Admin reserviert – klicken für die Warteliste`
                        : mine
                          ? 'Deine Position'
                          : 'Auf diese Position eintragen'
                  }
                  className={`group flex size-12 items-center justify-center overflow-hidden rounded-full text-xs font-semibold transition-all disabled:cursor-default sm:size-14 ${
                    mine
                      ? 'ring-3 ring-lime'
                      : taken
                        ? 'ring-2 ring-white/40 hover:ring-lime'
                        : locked
                          ? 'bg-white/10 text-white/60 ring-2 ring-white/20 hover:ring-lime'
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
                {/* Gesperrt: Schloss für alle, für Admins zugleich der Knopf zum Freigeben */}
                {locked &&
                  (isAdmin ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => toggleBlocked(eventId, position.key))}
                      aria-label={`${position.label} freigeben`}
                      title="Admin: Position freigeben"
                      className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-purple text-white shadow-sm ring-2 ring-gray-900 transition-colors hover:bg-lime hover:text-black disabled:opacity-60"
                    >
                      <LockClosedIcon aria-hidden="true" className="size-3" strokeWidth={2.5} />
                    </button>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-purple text-white shadow-sm ring-2 ring-gray-900"
                    >
                      <LockClosedIcon className="size-3" strokeWidth={2.5} />
                    </span>
                  ))}
              </div>
              {/* freie Plätze tragen die Position schon im Kreis */}
              {(slot || locked) && (
                <span className="max-w-full truncate rounded-sm bg-black/70 px-1.5 text-[0.6875rem] font-semibold text-white">
                  {slot ? slot.discordName : `${position.label} · reserviert`}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mx-auto mt-3 flex max-w-xl">
        <a
          href={exportUrl}
          download={`aufstellung-${eventId}.png`}
          title="Aufstellung als Bild exportieren"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          <ArrowDownTrayIcon aria-hidden="true" className="size-4" strokeWidth={2} />
          Export
        </a>
      </div>

      {adminChoice && (
        <div className="mx-auto mt-4 max-w-xl rounded-md bg-gray-100 p-4">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{adminChoice.label}</span> ist frei. Als Admin kannst du die Position für die
            Session sperren; freigeben geht später über das Schloss.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => toggleBlocked(eventId, adminChoice.key))}
              className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Für die Session sperren
            </button>
            {userId && canJoin && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => claimPosition(eventId, adminChoice.key))}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                {hasSlot ? 'Hierher wechseln' : 'Selbst eintragen'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setAdminChoice(null)}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {offer && (
        <div className="mx-auto mt-4 max-w-xl rounded-md bg-gray-100 p-4">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{offer.label}</span>{' '}
            {blocked.includes(offer.key) && !slots.some((slot) => slot.position === offer.key)
              ? 'ist vom Admin reserviert.'
              : 'ist schon vergeben.'}{' '}
            Setz dich auf die Warteliste: Wird die Position frei, rückst du automatisch nach.
            {myWait && ` Dein bisheriger Wunsch ${label(myWait.position)} wird ersetzt, dein Platz in der Reihe bleibt.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => joinWaitlist(eventId, offer.key))}
              className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Auf die Warteliste (Wunsch: {offer.label})
            </button>
            <button
              type="button"
              onClick={() => setOffer(null)}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <p aria-live="polite" className="mt-4 min-h-6 text-center text-sm text-gray-600">
        {error ? <span className="font-semibold text-red-600">{error}</span> : pending ? 'Wird gespeichert …' : null}
      </p>

      {waitlist.length > 0 && (
        <div className="mx-auto mt-4 max-w-xl">
          <h3 className="text-sm font-semibold text-gray-900">Warteliste ({waitlist.length})</h3>
          <p className="mt-1 text-sm text-gray-600">Wird eine Wunschposition frei, rückt der Erste mit diesem Wunsch nach.</p>
          <ol className="mt-3 divide-y divide-gray-100">
            {waitlist.map((entry, index) => (
              <li key={entry.discordId} className="flex items-center gap-3 py-2">
                <span className="w-5 text-right text-xs font-semibold text-gray-500">{index + 1}.</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.discordAvatar ?? ''} alt="" className="size-8 rounded-full bg-gray-200" />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
                  {entry.discordName}
                  {entry.discordId === userId && <span className="text-gray-500"> (du)</span>}
                </span>
                <span className="rounded-sm border border-gray-400 px-1 text-xs font-semibold text-gray-600">
                  Wunsch: {label(entry.position)}
                </span>
                {entry.discordId === userId && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => leaveWaitlist(eventId))}
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
      )}
    </div>
  )
}

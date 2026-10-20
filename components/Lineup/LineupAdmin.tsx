'use client'

import { useState, useTransition } from 'react'
import {
  applyProposal,
  moveToPosition,
  removeFromLineup,
  setAttendance,
  setPublished,
} from '@/app/(frontend)/events/[id]/aufstellung/actions'
import LineupPitch from '@/components/LineupPitch/LineupPitch'
import { fit, type Fit } from '@/lib/assignment'
import type { FormationPosition } from '@/lib/formations'
import type { LineupSlot, Proposal, Signup } from '@/lib/lineup'

type Props = {
  eventId: string
  formationKey: string | null
  formation: FormationPosition[] | null
  slots: LineupSlot[]
  signups: Signup[]
  proposals: Proposal[]
  published: boolean
}

const fitLabel: Record<Fit, string> = { main: 'Hauptposition', secondary: 'Nebenposition', other: 'Sonstige' }
const fitClass: Record<Fit, string> = {
  main: 'bg-lime text-black',
  secondary: 'border border-purple text-purple',
  other: 'border border-gray-400 text-gray-600',
}

const attendanceOptions = [
  { value: 'present', label: 'Pünktlich' },
  { value: 'late', label: 'Zu spät' },
  { value: 'no_show', label: 'Nicht da' },
] as const

export default function LineupAdmin({ eventId, formationKey, formation, slots, signups, proposals, published }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(null)
    setSelectedId(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
    })
  }

  const active = signups.filter((signup) => signup.status === 'active')
  const signupOf = (discordId: string) => signups.find((signup) => signup.discordId === discordId)
  const waiting = active
    .filter((signup) => !slots.some((slot) => slot.discordId === signup.discordId))
    .sort((a, b) => Number(a.afterDeadline) - Number(b.afterDeadline))
  const fitOf = (signup: Signup | undefined, position: FormationPosition): Fit =>
    signup?.main ? fit({ main: signup.main, secondary: signup.secondary }, position.role) : 'other'

  const onPositionClick = (position: FormationPosition, slot: LineupSlot | undefined) => {
    if (selectedId) {
      if (slot?.discordId === selectedId) return setSelectedId(null)
      const id = selectedId
      return run(() => moveToPosition(eventId, id, position.key))
    }
    if (slot) setSelectedId(slot.discordId)
  }

  const apply = (key: string) => {
    if (slots.length > 0 && !window.confirm(`Vorschlag ${key} übernehmen? Die aktuelle Aufstellung wird ersetzt.`)) return
    run(() => applyProposal(eventId, key))
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-semibold text-black">Admin: Vorschläge</h2>
        <p className="mt-1 text-sm text-gray-600">
          Berechnet aus {active.length} Anmeldungen: möglichst viele auf Haupt- oder Nebenposition, bei Konflikten
          entscheidet die Zuverlässigkeit. Nachzügler bekommen nur Restplätze.
        </p>
        {active.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">Noch keine Anmeldungen.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {proposals.map(({ formation: key, assignment }, index) => (
              <li key={key} className={`rounded-md border p-4 ${index === 0 ? 'border-purple' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-black">{key}</p>
                  {index === 0 && <span className="rounded-sm bg-purple px-1.5 text-xs font-semibold text-white">Empfohlen</span>}
                </div>
                <dl className="mt-2 space-y-0.5 text-sm text-gray-700">
                  <div className="flex justify-between"><dt>Hauptposition</dt><dd className="font-semibold">{assignment.stats.main}</dd></div>
                  <div className="flex justify-between"><dt>Nebenposition</dt><dd className="font-semibold">{assignment.stats.secondary}</dd></div>
                  <div className="flex justify-between"><dt>Sonstige</dt><dd className="font-semibold">{assignment.stats.other}</dd></div>
                  <div className="flex justify-between"><dt>KI</dt><dd className="font-semibold">{assignment.stats.empty}</dd></div>
                  {assignment.unassigned.length > 0 && (
                    <div className="flex justify-between"><dt>Ohne Platz</dt><dd className="font-semibold">{assignment.unassigned.length}</dd></div>
                  )}
                </dl>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => apply(key)}
                  className="mt-3 w-full rounded-md bg-purple px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {formationKey === key && slots.length > 0 ? 'Neu berechnen' : 'Übernehmen'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {formation && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-black">Aufstellung {formationKey}</h2>
            <span
              className={`rounded-sm px-1.5 text-xs font-semibold ${published ? 'bg-lime text-black' : 'bg-gray-200 text-gray-700'}`}
            >
              {published ? 'Freigegeben' : 'Entwurf, für Spieler unsichtbar'}
            </span>
          </div>
          <p className="mt-1 mb-4 text-sm text-gray-600">
            Spieler anklicken, dann die Zielposition. Belegte Position: Die beiden tauschen. Wer über das X rausfliegt, kommt
            auf die Warteliste.
          </p>

          <LineupPitch
            formation={formation}
            slots={slots}
            userId={null}
            selectedId={selectedId}
            onPositionClick={onPositionClick}
            onRemove={(slot) => run(() => removeFromLineup(eventId, slot.discordId))}
            disabled={pending}
          />

          <p aria-live="polite" className="mt-4 min-h-6 text-center text-sm text-gray-600">
            {error ? (
              <span className="font-semibold text-red-600">{error}</span>
            ) : pending ? (
              'Wird gespeichert …'
            ) : selectedId ? (
              `${signupOf(selectedId)?.discordName ?? 'Spieler'} ausgewählt: Zielposition anklicken`
            ) : null}
          </p>

          <ul className="mx-auto mt-2 max-w-xl divide-y divide-gray-100">
            {formation.map((position) => {
              const slot = slots.find((entry) => entry.position === position.key)
              const signup = slot ? signupOf(slot.discordId) : undefined
              const quality = fitOf(signup, position)
              return (
                <li key={position.key} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-10 font-semibold text-gray-900">{position.label}</span>
                  <span className="min-w-0 flex-1 truncate text-gray-900">{slot ? slot.discordName : <span className="text-gray-500">KI</span>}</span>
                  {slot && (
                    <>
                      <span className="text-xs text-gray-500">{signup?.reliability.percent ?? '–'} %</span>
                      <span className={`rounded-sm px-1 text-xs font-semibold ${fitClass[quality]}`}>{fitLabel[quality]}</span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mx-auto mt-6 max-w-xl">
            <h3 className="text-sm font-semibold text-gray-900">Ohne Platz / Warteliste ({waiting.length})</h3>
            {waiting.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Alle Angemeldeten stehen in der Aufstellung.</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {waiting.map((signup) => (
                  <li key={signup.discordId}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setSelectedId(selectedId === signup.discordId ? null : signup.discordId)}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1 text-sm transition-colors ${
                        selectedId === signup.discordId ? 'border-purple bg-purple/10' : 'border-gray-200 hover:border-purple'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={signup.discordAvatar ?? ''} alt="" className="size-6 rounded-full bg-gray-200" />
                      <span className="text-gray-900">{signup.discordName}</span>
                      <span className="text-xs text-gray-500">
                        {[signup.main, ...signup.secondary].filter(Boolean).join(' · ') || 'ohne Positionen'}
                        {signup.afterDeadline && ' · Nachzügler'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            {published ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setPublished(eventId, false))}
                className="w-full rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                Freigabe zurücknehmen
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setPublished(eventId, true))}
                className="w-full rounded-md bg-purple px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Formation und Aufstellung freigeben
              </button>
            )}
          </div>
        </section>
      )}

      {published && (
        <section>
          <h2 className="text-2xl font-semibold text-black">Admin: Anwesenheit</h2>
          <p className="mt-1 text-sm text-gray-600">
            Nach dem Event abhaken. Pünktlichkeit und Erscheinen fließen in die Zuverlässigkeit ein.
          </p>
          <ul className="mt-4 divide-y divide-gray-100">
            {active
              .filter((signup) => slots.some((slot) => slot.discordId === signup.discordId))
              .map((signup) => (
                <li key={signup.discordId} className="flex flex-wrap items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{signup.discordName}</span>
                  <div className="flex gap-1">
                    {attendanceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            setAttendance(eventId, signup.discordId, signup.attendance === option.value ? null : option.value),
                          )
                        }
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                          signup.attendance === option.value
                            ? option.value === 'present'
                              ? 'bg-lime text-black'
                              : option.value === 'late'
                                ? 'bg-amber-300 text-black'
                                : 'bg-red-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:border-purple'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            {signups
              .filter((signup) => signup.cancelledLate)
              .map((signup) => (
                <li key={signup.discordId} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{signup.discordName}</span>
                  <span className="rounded-sm bg-gray-200 px-1.5 text-xs font-semibold text-gray-700">Kurzfristig abgesagt</span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  )
}

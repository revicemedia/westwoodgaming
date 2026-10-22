'use client'

import { useState, useTransition } from 'react'
import { ArrowDownTrayIcon, ArrowPathIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  joinList,
  joinSignupWaitlist,
  leavePosition,
  leaveWaitlist,
  shuffleCustomTeams,
  toggleReserved,
} from '@/app/(frontend)/events/[id]/aufstellung/actions'
import WaitlistList from '@/components/Lineup/WaitlistList'
import type { LineupSlot } from '@/lib/lineup'
import type { Teams } from '@/lib/signupModes'

type Props = {
  eventId: string
  // Überschrift der Liste, z. B. "Custom Match" oder "Open Lobby"
  title: string
  players: LineupSlot[]
  // reservierte Plätze (spot-1, spot-2, …)
  reserved: string[]
  // „Max. Teilnehmer“; null = unbegrenzt
  maxPlayers: number | null
  // freie Plätze; null = unbegrenzt
  capacity: number | null
  waitlist: LineupSlot[]
  userId: string | null
  // angemeldet, aber nicht auf unserem Server: ansehen ja, eintragen nein
  canJoin: boolean
  // per Discord-ID freigeschalteter Admin: darf Plätze reservieren und freigeben
  isAdmin: boolean
  loginUrl: string
  // Anmeldung als Bild (PNG)
  exportUrl: string
  // Custom Match: Teams lassen sich mischen; nach dem Mischen zeigt die Ansicht Team A und B
  canShuffle: boolean
  teams: Teams | null
}

// Call of Duty: Teilnehmerliste in Eintragsreihenfolge; beim Custom Match nach dem Mischen in zwei Teams
export default function SignupList(props: Props) {
  const { eventId, title, players, reserved, maxPlayers, capacity, waitlist, userId, canJoin, isAdmin, loginUrl, exportUrl, canShuffle, teams } = props
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const signedUp = userId !== null && players.some((player) => player.discordId === userId)
  const waiting = userId !== null && waitlist.some((entry) => entry.discordId === userId)
  const full = capacity === 0
  // Teams nur mit noch angemeldeten Spielern; später Eingetragene sind noch nicht eingeteilt
  const teamView = canShuffle && teams !== null
  const byId = (id: string) => players.find((player) => player.discordId === id)
  const teamA = teamView ? teams.a.flatMap((id) => byId(id) ?? []) : []
  const teamB = teamView ? teams.b.flatMap((id) => byId(id) ?? []) : []
  const unassigned = teamView ? players.filter((player) => !teams.a.includes(player.discordId) && !teams.b.includes(player.discordId)) : []

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

  const playerRow = (player: LineupSlot, prefix: string) => {
    const self = player.discordId === userId
    return (
      <li key={player.discordId} className={`flex h-11 items-center gap-3 rounded-sm px-3 ${self ? 'bg-lime/15 ring-1 ring-lime' : 'bg-white/5'}`}>
        <span className="w-5 text-right text-xs font-semibold text-white/50">{prefix}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={player.discordAvatar ?? ''} alt="" className="size-7 rounded-full bg-white/10" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
          {player.discordName}
          {self && <span className="font-normal text-white/60"> (du)</span>}
        </span>
        {self && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => leavePosition(eventId))}
            aria-label="Absagen"
            title="Absagen"
            className="flex size-6 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <XMarkIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
          </button>
        )}
      </li>
    )
  }

  const primary = 'rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'
  const secondary = 'rounded-md bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60'

  return (
    <div>
      <div className="rounded-md bg-gray-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/60">
              {maxPlayers
                ? `${players.length + reserved.length} von ${maxPlayers} Plätzen belegt`
                : players.length === 0
                  ? 'Noch niemand dabei'
                  : `${players.length} Spieler dabei`}
              {reserved.length > 0 && `, davon ${reserved.length} reserviert`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && canShuffle && players.length >= 2 && (
              <button type="button" disabled={pending} onClick={() => run(() => shuffleCustomTeams(eventId))} className={`${secondary} flex items-center gap-2`}>
                <ArrowPathIcon aria-hidden="true" className="size-4" strokeWidth={2} />
                {teams ? 'Neu mischen' : 'Teams mischen'}
              </button>
            )}
            {isAdmin && !full && (
              <button type="button" disabled={pending} onClick={() => run(() => toggleReserved(eventId, 'new'))} className={`${secondary} flex items-center gap-2`}>
                <LockClosedIcon aria-hidden="true" className="size-4" strokeWidth={2} />
                Platz reservieren
              </button>
            )}
            {signedUp ? (
              <button type="button" disabled={pending} onClick={() => run(() => leavePosition(eventId))} className={secondary}>
                Absagen
              </button>
            ) : waiting ? (
              <button type="button" disabled={pending} onClick={() => run(() => leaveWaitlist(eventId))} className={secondary}>
                Warteliste verlassen
              </button>
            ) : full ? (
              <button type="button" disabled={pending} onClick={() => guard(() => joinSignupWaitlist(eventId))} className={`${primary} bg-purple text-white`}>
                Auf die Warteliste
              </button>
            ) : (
              <button type="button" disabled={pending} onClick={() => guard(() => joinList(eventId))} className={`${primary} bg-lime text-black`}>
                Bin dabei
              </button>
            )}
          </div>
        </div>

        {teamView && (
          <div className="mt-6">
            <p className="text-sm text-white/60">
              Runde {teams.round} · gemischt um{' '}
              {new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }).format(new Date(teams.at))} Uhr
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {[
                { name: 'Team A', members: teamA, accent: 'bg-lime text-black' },
                { name: 'Team B', members: teamB, accent: 'bg-purple text-white' },
              ].map((team) => (
                <div key={team.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-sm px-2 py-0.5 text-sm font-semibold ${team.accent}`}>{team.name}</span>
                    <span className="text-xs text-white/50">{team.members.length} Spieler</span>
                  </div>
                  <ol className="space-y-2">{team.members.map((player) => playerRow(player, ''))}</ol>
                </div>
              ))}
            </div>
            {unassigned.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-white/70">
                  Noch nicht eingeteilt ({unassigned.length}){isAdmin && ' – zum Einteilen neu mischen'}
                </p>
                <ol className="grid gap-2 sm:grid-cols-2">{unassigned.map((player) => playerRow(player, ''))}</ol>
              </div>
            )}
          </div>
        )}

        {((players.length > 0 && !teamView) || reserved.length > 0) && (
          <ol className="mt-6 grid gap-2 sm:grid-cols-2">
            {!teamView && players.map((player, index) => playerRow(player, `${index + 1}.`))}
            {reserved.map((key) => (
              <li key={key} className="flex h-11 items-center gap-3 rounded-sm bg-purple/25 px-3 text-sm text-white/70">
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
          </ol>
        )}

        <p aria-live="polite" className="mt-4 min-h-6 text-sm text-white/70">
          {error ? <span className="font-semibold text-red-400">{error}</span> : pending ? 'Wird gespeichert …' : null}
        </p>
      </div>

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

      <WaitlistList
        entries={waitlist}
        userId={userId}
        pending={pending}
        onLeave={() => run(() => leaveWaitlist(eventId))}
        hint="Sagt jemand ab oder wird ein reservierter Platz freigegeben, rückt der Erste automatisch nach."
      />
    </div>
  )
}

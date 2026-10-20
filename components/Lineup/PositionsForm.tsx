'use client'

import { useState, useTransition } from 'react'
import { savePositions } from '@/app/(frontend)/events/[id]/aufstellung/actions'
import { roleKeys, roles, type Role } from '@/lib/formations'
import type { PlayerProfile } from '@/lib/lineup'

type Props = {
  profile: PlayerProfile | null
}

// Wunschpositionen: genau eine Haupt- und mindestens eine Nebenposition
export default function PositionsForm({ profile }: Props) {
  const [editing, setEditing] = useState(!profile)
  const [main, setMain] = useState<Role | null>(profile?.main ?? null)
  const [secondary, setSecondary] = useState<Role[]>(profile?.secondary ?? [])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!editing && profile) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <p className="text-gray-600">Deine Positionen</p>
          <p className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-sm bg-purple px-1.5 text-xs font-semibold text-white" title="Hauptposition">
              {profile.main}
            </span>
            {profile.secondary.map((role) => (
              <span key={role} className="rounded-sm border border-purple px-1.5 text-xs font-semibold text-purple" title="Nebenposition">
                {role}
              </span>
            ))}
          </p>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="text-sm font-semibold text-purple">
          Ändern
        </button>
      </div>
    )
  }

  const chooseMain = (role: Role) => {
    setMain(role)
    setSecondary((list) => list.filter((entry) => entry !== role))
  }
  const toggleSecondary = (role: Role) =>
    setSecondary((list) => (list.includes(role) ? list.filter((entry) => entry !== role) : [...list, role]))

  const save = () => {
    setError(null)
    startTransition(async () => {
      const result = await savePositions(main ?? '', secondary)
      if (result.error) setError(result.error)
      else setEditing(false)
    })
  }

  const chip = (active: boolean, filled: boolean) =>
    `rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
      active
        ? filled
          ? 'bg-purple text-white'
          : 'border border-purple bg-purple/10 text-purple'
        : 'border border-gray-300 bg-white text-gray-700 hover:border-purple'
    }`

  return (
    <div>
      <p className="text-sm font-semibold text-gray-900">Hauptposition</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {roleKeys.map((role) => (
          <button key={role} type="button" title={roles[role]} onClick={() => chooseMain(role)} className={chip(main === role, true)}>
            {role}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-900">
        Nebenpositionen <span className="font-normal text-gray-600">(mindestens eine)</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {roleKeys.map((role) => (
          <button
            key={role}
            type="button"
            title={roles[role]}
            disabled={role === main}
            onClick={() => toggleSecondary(role)}
            className={chip(secondary.includes(role), false)}
          >
            {role}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={pending || !main || secondary.length === 0}
          onClick={save}
          className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Wird gespeichert …' : 'Positionen speichern'}
        </button>
        {profile && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  )
}

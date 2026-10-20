'use client'

import { useState, useTransition } from 'react'
import { cancelSignup, signUp } from '@/app/(frontend)/events/[id]/aufstellung/actions'

type Props = {
  eventId: string
  signedUp: boolean
  // nach Anmeldeschluss: Anmeldung landet auf der Warteliste, Absage ist kurzfristig
  afterDeadline: boolean
  // selbst erst auf der Warteliste angemeldet: Absage ohne Folgen
  onWaitlist: boolean
}

export default function SignupButton({ eventId, signedUp, afterDeadline, onWaitlist }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (action: () => Promise<{ error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
    })
  }

  const cancel = () => {
    const late = afterDeadline && !onWaitlist
    if (late && !window.confirm('Der Anmeldeschluss ist vorbei. Eine kurzfristige Absage senkt deine Zuverlässigkeit. Trotzdem absagen?')) {
      return
    }
    run(() => cancelSignup(eventId))
  }

  return (
    <div>
      {signedUp ? (
        <button
          type="button"
          disabled={pending}
          onClick={cancel}
          className="w-full rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          {pending ? 'Wird gespeichert …' : 'Absagen'}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => signUp(eventId))}
          className="w-full rounded-md bg-purple px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Wird gespeichert …' : afterDeadline ? 'Auf die Warteliste' : 'Bin dabei'}
        </button>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  )
}

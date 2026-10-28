'use client'

import { useActionState, useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { sendFeedback, type FeedbackState } from '@/app/(frontend)/feedback/actions'
import { feedbackCategories } from '@/lib/feedback'

const initialState: FeedbackState = {
  status: 'idle',
  message: '',
  values: { name: '', category: feedbackCategories[0], other: '', message: '' },
}

const inputClasses =
  'mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none'

const fieldClasses = `${inputClasses} h-11`

// Feedback, standardmäßig anonym: Betreff und Text, der Name ist freiwillig
export default function FeedbackForm() {
  const [state, formAction, pending] = useActionState(sendFeedback, initialState)
  // Bei „Sonstiges“ erscheint ein Feld, um den Betreff selbst zu ergänzen
  const [category, setCategory] = useState(state.values.category)
  const [name, setName] = useState(state.values.name)

  if (state.status === 'success') {
    return (
      <div role="status" className="flex items-center justify-center gap-3 rounded-md border border-dotted border-green-900 bg-green-100 p-6">
        <CheckCircleIcon aria-hidden="true" className="size-7 shrink-0 text-green-900" />
        <p className="text-sm/6 text-black">Danke für dein Feedback! Es ist bei unseren Admins angekommen.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-gray-900">
            Name <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={80}
            autoComplete="off"
            placeholder="Leer lassen, um anonym zu bleiben"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-semibold text-gray-900">
            Betreff
          </label>
          {/* grid verhindert, dass der Außenabstand des Selects aus dem Container herausfällt
              und das Icon dadurch zu tief sitzt */}
          <div className="relative grid">
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`${fieldClasses} appearance-none pr-10`}
            >
              {feedbackCategories.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-[calc(50%+0.25rem)] right-3 size-5 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
      </div>
      {category === 'Sonstiges' && (
        <div>
          <label htmlFor="other" className="text-sm font-semibold text-gray-900">
            Worum geht es?
          </label>
          <input
            id="other"
            name="other"
            type="text"
            required
            maxLength={80}
            placeholder="z. B. Discord-Server, Website, …"
            defaultValue={state.values.other}
            autoFocus
            className={fieldClasses}
          />
        </div>
      )}
      <div>
        <label htmlFor="message" className="text-sm font-semibold text-gray-900">
          Dein Feedback
        </label>
        <textarea
          id="message"
          name="message"
          rows={8}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Was läuft gut, was können wir besser machen?"
          defaultValue={state.values.message}
          className={inputClasses}
        />
        {!name.trim() && (
          <p className="mt-2 text-sm text-gray-500">
            Schreib bitte keine Namen oder Details hinein, an denen man dich erkennen kann, wenn du anonym bleiben möchtest.
          </p>
        )}
      </div>
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="flex cursor-pointer items-center justify-center rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Wird gesendet …' : name.trim() ? 'Absenden' : 'Anonym absenden'}
        </button>
        <p aria-live="polite" className="text-sm text-red-600">
          {state.status === 'error' ? state.message : ''}
        </p>
      </div>
    </form>
  )
}

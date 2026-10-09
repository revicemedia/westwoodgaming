'use client'

import { useActionState } from 'react'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { sendContactMessage, type ContactState } from '@/app/kontakt/actions'

const categories = ['Allgemeine Anfrage', 'Mitmachen', 'Event', 'Sponsoring', 'Problem melden', 'Sonstiges']

const initialState: ContactState = {
  status: 'idle',
  message: '',
  values: { name: '', email: '', phone: '', category: categories[0], subject: '', message: '' },
}

const inputClasses =
  'mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none'

const fieldClasses = `${inputClasses} h-11`

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState)

  if (state.status === 'success') {
    return (
      <div role="status" className="flex gap-3 rounded-md bg-green-100 border border-dotted border-green-900 p-6 justify-center items-center">
        <CheckCircleIcon aria-hidden="true" className="size-7 shrink-0 text-green-900" />
        <p className="text-sm/6 text-black">Deine Nachricht wurde erfolgreich verarbeitet & du wirst zügig eine Rückmeldung erhalten.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-gray-900">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Max Mustermann"
            defaultValue={state.values.name}
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-gray-900">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={120}
            autoComplete="email"
            placeholder="max@beispiel.de"
            defaultValue={state.values.email}
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-gray-900">
            Telefonnummer <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            placeholder="+49 151 23456789"
            defaultValue={state.values.phone}
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-semibold text-gray-900">
            Kategorie
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              defaultValue={state.values.category}
              className={`${fieldClasses} appearance-none pr-10`}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-[calc(50%+0.25rem)] right-3 size-5 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="text-sm font-semibold text-gray-900">
          Betreff
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={120}
          placeholder="Worum geht es?"
          defaultValue={state.values.subject}
          className={fieldClasses}
        />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-semibold text-gray-900">
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={1500}
          placeholder="Schreib uns dein Anliegen …"
          defaultValue={state.values.message}
          className={inputClasses}
        />
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
          {pending ? 'Wird gesendet …' : 'Nachricht senden'}
        </button>
        <p aria-live="polite" className="text-sm text-red-600">
          {state.status === 'error' ? state.message : ''}
        </p>
      </div>
    </form>
  )
}

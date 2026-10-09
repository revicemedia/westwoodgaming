'use client'

import { useSyncExternalStore } from 'react'
import type { DiscordStatus } from '@/lib/discord'

const INTERVAL = 30_000

let status: DiscordStatus | null = null
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

async function refresh() {
  if (document.hidden) return

  try {
    const response = await fetch('/api/discord')
    if (!response.ok) return
    status = await response.json()
    listeners.forEach((listener) => listener())
  } catch {
    // letzter bekannter Stand bleibt stehen
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  if (listeners.size === 1) {
    refresh()
    timer = setInterval(refresh, INTERVAL)
    document.addEventListener('visibilitychange', refresh)
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }
}

export function useDiscordStatus() {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => null,
  )
}

'use client'

import { useDiscordStatus } from '@/lib/useDiscordStatus'

export default function OnlineBanner() {
  const status = useDiscordStatus()

  return (
    <div className="bg-gray-200">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-6 lg:px-8">
        {status && (
          <p className="relative text-xs text-black">
            <span className="absolute top-1/2 -left-3.5 size-1.5 -translate-y-1/2 animate-pulse rounded-full bg-green-400"></span>
            {status.online} Mitglieder sind gerade online
          </p>
        )}
      </div>
    </div>
  )
}

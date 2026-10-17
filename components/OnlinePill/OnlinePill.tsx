'use client'

import Image from 'next/image'
import { useDiscordStatus } from '@/lib/useDiscordStatus'

// Avatare + Online-Zahl aus dem Discord. Ohne Daten wird nichts angezeigt.
// className setzt Hintergrund und Textfarbe, ringClassName trennt die überlappenden Avatare.
export default function OnlinePill({ className, ringClassName }: { className: string; ringClassName: string }) {
  const status = useDiscordStatus()
  if (!status) return null

  return (
    <p className={`flex items-center gap-2 rounded-sm text-xs font-normal ${className}`}>
      {status.avatars.length > 0 && (
        <span aria-hidden="true" className="mr-1 flex -space-x-1.5">
          {status.avatars.map((avatar) => (
            <Image
              key={avatar}
              src={avatar}
              alt=""
              width={20}
              height={20}
              unoptimized
              // lädt ein Avatar nicht, verschwindet er statt eines kaputten Bildes
              onError={(event) => (event.currentTarget.style.display = 'none')}
              className={`size-5 rounded-full bg-gray-800 ring-2 ${ringClassName}`}
            />
          ))}
        </span>
      )}
      <span className="size-1.5 animate-pulse rounded-full bg-green-400 motion-reduce:animate-none"></span>
      {status.online} Mitglieder sind gerade online
    </p>
  )
}

import Image from 'next/image'
import type { Admin } from '@/lib/admins'

export default function AdminCard({ admin }: { admin: Admin }) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-md bg-gray-900">
        {admin.image && (
          <Image
            src={admin.image}
            alt={admin.gamertag}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-black mask-[linear-gradient(to_top,black_0%,black_8%,rgb(0_0_0/0.97)_17%,rgb(0_0_0/0.9)_26%,rgb(0_0_0/0.78)_36%,rgb(0_0_0/0.65)_45%,rgb(0_0_0/0.5)_54%,rgb(0_0_0/0.35)_63%,rgb(0_0_0/0.22)_72%,rgb(0_0_0/0.1)_82%,rgb(0_0_0/0.03)_91%,transparent_100%)]"/>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div className="flex min-w-0 flex-col gap-2">
                <p className="text-xs font-extralight border rounded-sm w-fit px-1 text-white border-white">{admin.role}</p>
                <p className="truncate text-2xl font-semibold tracking-normal text-white">{admin.gamertag}</p>
            </div>
            {admin.discordId && (
                <a
                    href={`https://discord.com/users/${admin.discordId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${admin.gamertag} auf Discord`}
                    title="Discord-Profil öffnen"
                    className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-white/10 text-white transition-colors hover:bg-purple"
                >
                    <svg fill="currentColor" viewBox="0 0 126.644 96" aria-hidden="true" className="size-4">
                        <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />
                    </svg>
                </a>
            )}
        </div>
    </div>
  )
}

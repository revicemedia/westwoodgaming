'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// match: Pfad, unter dem der Punkt als aktiv gilt (Standard: href)
const navigation = [
  { name: 'START', href: '/' },
  { name: 'SPIELE', href: '/#spiele', match: '/spiele' },
  { name: 'NEWS', href: '/news' },
  { name: 'EVENTS', href: '/events' },
  { name: 'KONTAKT', href: '/kontakt' },
]

// Start nur exakt, alle anderen auch für Unterseiten (z. B. /news/artikel)
function isActive(pathname: string, item: { href: string; match?: string }) {
  const path = item.match ?? item.href
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header data-navbar className="sticky top-0 z-40 bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Westwood Gaming</span>
            <Image
              alt=""
              src="/WG-Logo.jpg"
              width={47}
              height={40}
              unoptimized
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              aria-current={isActive(pathname, item) ? 'page' : undefined}
              className="text-sm/6 font-semibold text-gray-900 transition-colors hover:text-purple aria-[current=page]:text-purple"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-6">
          <a href="https://discord.gg/shbJrNYQ6y" target='_blank' className="group relative text-gray-900">
            <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-sm bg-gray-900 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Discord
            </span>
            <svg fill="currentColor" viewBox="0 0 126.644 96" aria-hidden="true" className="size-6 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:text-purple motion-reduce:transition-colors motion-reduce:group-hover:translate-y-0">
              <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />
            </svg>
          </a>
          <a href="https://www.twitch.tv/mfgfaith" target='_blank' className="group relative text-gray-900">
            <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-sm bg-gray-900 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Twitch
            </span>
            <svg fill="currentColor" viewBox="0 0 2400 2800" aria-hidden="true" className="size-6 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:text-purple motion-reduce:transition-colors motion-reduce:group-hover:translate-y-0">
              <path d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600V1300z" />
              <rect x="1700" y="550" width="200" height="600" />
              <rect x="1150" y="550" width="200" height="600" />
            </svg>
          </a>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Westwood Gaming</span>
              <Image
                alt=""
                src="/WG-Logo.jpg"
                width={47}
                height={40}
                unoptimized
                className="h-12 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={isActive(pathname, item) ? 'page' : undefined}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 aria-[current=page]:bg-gray-50 aria-[current=page]:text-purple"
                  >
                    {item.name}
                  </a>
                ))}
                <a
                  href="/impressum"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  IMPRESSUM
                </a>
              </div>
              <div className="space-y-2 py-6">
                <a
                  href="https://discord.gg/shbJrNYQ6y"
                  target="_blank"
                  className="-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <Image alt="" src="/Discord-Symbol.svg" width={127} height={96} className="size-6 object-contain" />
                  Discord
                </a>
                <a
                  href="https://www.twitch.tv/mfgfaith"
                  target="_blank"
                  className="-mx-3 flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <Image alt="" src="/twitch-logo.svg" width={24} height={24} className="size-6 object-contain" />
                  Twitch
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { games } from '@/lib/games'

const slides = games

const INTERVAL = 6000

export default function HeroSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = (index: number) => setActive((index + slides.length) % slides.length)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Unsere Community Spiele"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={(event) => setPaused(event.target.matches(':focus-visible'))}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-black"
    >
      <div className="grid">
        {slides.map((slide, index) => (
          <div
            key={slide.name}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} von ${slides.length}: ${slide.name}`}
            inert={index !== active}
            className={`relative isolate col-start-1 row-start-1 transition-opacity duration-700 motion-reduce:transition-none ${
              index === active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              alt=""
              src={slide.image}
              fill
              sizes="(min-width: 1024px) 100vw, 1200px"
              preload={index === 0}
              className="-z-20 animate-[hero-zoom_1.4s_ease-out_both] object-cover object-top motion-reduce:animate-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/80 to-black/30 lg:bg-linear-to-r lg:via-black/70 lg:to-transparent"
            />

            <div className="mx-auto flex min-h-144 max-w-7xl items-center px-6 pt-24 pb-32 lg:min-h-[min(56.25vw,calc(100svh-5rem))] lg:px-8">
              <div className="max-w-xl">
                <p className="w-fit animate-[hero-rise_0.7s_ease-out_both] motion-reduce:animate-none rounded-sm border border-white px-1 text-xs font-extralight text-white [animation-delay:200ms]">
                  Community Game
                </p>
                <h2 className="mt-6 animate-[hero-rise_0.7s_ease-out_both] motion-reduce:animate-none text-pretty text-3xl font-semibold text-white [animation-delay:350ms] sm:text-4xl">
                    {slide.name}
                </h2>
                <p className="mt-6 animate-[hero-rise_0.7s_ease-out_both] motion-reduce:animate-none text-base/7 text-gray-300 [animation-delay:500ms] sm:text-lg/8">{slide.teaser}</p>
                <div className="mt-10 flex animate-[hero-rise_0.7s_ease-out_both] motion-reduce:animate-none flex-col gap-4 [animation-delay:650ms] sm:flex-row">
                  <a
                    href="https://discord.gg/shbJrNYQ6y"
                    target="_blank"
                    className="flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-stone-200"
                  >
                    <svg fill="currentColor" viewBox="0 0 126.644 96" aria-hidden="true" className="size-5">
                      <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />
                    </svg>
                    Discord beitreten
                  </a>
                  <a
                    href="https://www.twitch.tv/mfgfaith"
                    target="_blank"
                    className="flex items-center justify-center gap-2 rounded-md border border-white px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    <svg fill="currentColor" viewBox="0 0 2400 2800" aria-hidden="true" className="size-5">
                      <path d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600V1300z" />
                      <rect x="1700" y="550" width="200" height="600" />
                      <rect x="1150" y="550" width="200" height="600" />
                    </svg>
                    Live auf Twitch
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-8 animate-[hero-rise_0.7s_ease-out_both] motion-reduce:animate-none [animation-delay:800ms]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.name}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === active}
                className="group py-2"
              >
                <span className="sr-only">{slide.name} anzeigen</span>
                <span
                  className={`block h-1 overflow-hidden rounded-full bg-white/40 transition-all duration-300 ${
                    index === active ? 'w-10' : 'w-5 group-hover:bg-white/70'
                  }`}
                >
                  {index === active && (
                    <span
                      onAnimationEnd={() => goTo(active + 1)}
                      style={{ animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                      className="block h-full origin-left animate-[slide-progress_linear_forwards] bg-white motion-reduce:animate-none"
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="rounded-md border border-white/40 p-2 text-white transition-all hover:border-white hover:bg-white/10"
            >
              <span className="sr-only">Vorheriges Spiel</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="rounded-md border border-white/40 p-2 text-white transition-all hover:border-white hover:bg-white/10"
            >
              <span className="sr-only">Nächstes Spiel</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

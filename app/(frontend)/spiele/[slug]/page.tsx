import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import EventCard from "@/components/EventCard/EventCard";
import { getUpcomingEvents } from "@/lib/events";
import { games, getGame, type Game } from "@/lib/games";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};

  return {
    title: `${game.name} | Westwood Gaming`,
    description: game.teaser,
  };
}

export default function GamePage({ params }: Props) {
  return (
    <Suspense fallback={<GameFallback />}>
      <GameContent params={params} />
    </Suspense>
  );
}

function GameFallback() {
  return (
    <>
      <div className="min-h-96 bg-black sm:min-h-120 lg:min-h-[min(40vw,70svh)]" />
      <div className="min-h-96 bg-white" />
    </>
  );
}

async function GameContent({ params }: Props) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src={game.image}
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="-z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-96 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-120 lg:min-h-[min(40vw,70svh)] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">{game.category}</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></div>
                <p className="text-xs text-green-400">{game.online + " online"}</p>
              </div>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
              {game.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full bg-white py-20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-12 gap-y-16 px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-2xl font-semibold text-black">/ Über {game.name}</h2>
            <div className="flex flex-col gap-4 text-base/7 text-gray-600">
              {game.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-16 mb-4 text-2xl font-semibold text-black">/ Das erwartet dich</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {game.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-base/7 text-gray-900">
                  <CheckIcon aria-hidden="true" className="mt-1 size-5 flex-none" />
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-16 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://discord.gg/shbJrNYQ6y"
                target="_blank"
                className="flex items-center justify-center rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                Discord beitreten
              </a>
              <Link
                href="/"
                className="flex items-center justify-center rounded-md border border-black px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-stone-100"
              >
                Alle Spiele
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-black">/ Events</h2>
            <Suspense fallback={null}>
              <EventList game={game} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

async function EventList({ game }: { game: Game }) {
  const events = await getUpcomingEvents(game.slug);

  if (events.length === 0) {
    return <p className="text-base/7 text-gray-600">Aktuell sind keine Events geplant.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} image={game.image} game={game.name} />
        </li>
      ))}
    </ul>
  );
}

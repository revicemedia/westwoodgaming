import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import DiscordBreaker from "@/components/DiscordBreaker/DiscordBreaker";
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
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">
              {game.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full bg-gray-100">
        <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-6 py-3 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-black">
                Start
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-4" />
            </li>
            <li>
              <Link href="/#spiele" className="hover:text-black">
                Spiele
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-4" />
            </li>
            <li aria-current="page" className="font-semibold text-black">
              {game.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex w-full flex-col gap-20 bg-white pt-12 pb-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Über {game.name}</h2>
          <div className="flex flex-col gap-4 text-base/7 text-gray-600">
            {game.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2 className="mt-16 mb-4 text-2xl font-semibold text-black">Das erwartet dich</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {game.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-base/7 text-gray-900">
                <CheckIcon aria-hidden="true" className="mt-1 size-5 flex-none" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <DiscordBreaker />

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Events</h2>
          <Suspense fallback={null}>
            <EventList game={game} />
          </Suspense>
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
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} image={game.image} game={game.name} />
        </li>
      ))}
    </ul>
  );
}

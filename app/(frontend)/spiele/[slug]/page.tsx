import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckIcon, TrophyIcon, UserGroupIcon, UsersIcon } from "@heroicons/react/24/outline";
import DiscordBreaker from "@/components/DiscordBreaker/DiscordBreaker";
import EventCard from "@/components/EventCard/EventCard";
import { getUpcomingEvents } from "@/lib/events";
import { games, getGame, type Game } from "@/lib/games";

// Kacheln der Spielmodi reihum in den Markenfarben; badge = Icon-Fläche passend zur Kachel
const modeColors = [
  { tile: "bg-lime text-black", badge: "bg-black text-lime" },
  { tile: "bg-purple text-white", badge: "bg-white text-purple" },
  { tile: "bg-black text-white", badge: "bg-purple text-white" },
];

const modeIcons = { team: UserGroupIcon, trophy: TrophyIcon, duo: UsersIcon };

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

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "Spiele", href: "/#spiele" }, { name: game.name }]} />

      <div className="flex w-full flex-col gap-20 bg-white pt-12 pb-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Über {game.name}</h2>
          <div className="flex flex-col gap-4 text-base/7 text-gray-600">
            {game.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {game.modes && (
            <>
              <h2 className="mt-16 mb-4 text-2xl font-semibold text-black">Spielmodi</h2>
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {game.modes.map((mode, index) => {
                  const color = modeColors[index % modeColors.length];
                  const Icon = modeIcons[mode.icon];

                  return (
                    <li
                      key={mode.title}
                      className={`group relative isolate flex h-full min-h-64 flex-col overflow-hidden rounded-md p-6 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${color.tile}`}
                    >
                      {/* großes Icon als Wasserzeichen */}
                      <Icon
                        aria-hidden="true"
                        className="absolute -right-8 -bottom-8 -z-10 size-48 opacity-5 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className={`flex size-11 items-center justify-center rounded-md ${color.badge}`}>
                          <Icon aria-hidden="true" className="size-6" />
                        </span>
                        <span className="text-sm font-semibold tabular-nums opacity-60">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <p className="mt-auto pt-10 text-2xl font-semibold">{mode.title}</p>
                      <p className="mt-2 text-sm/6 opacity-80">{mode.text}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <h2 className="mt-16 mb-4 text-2xl font-semibold text-black">Das erwartet dich</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {game.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-base/7 text-gray-900">
                <CheckIcon aria-hidden="true" className="mt-1 size-5 flex-none text-purple" />
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

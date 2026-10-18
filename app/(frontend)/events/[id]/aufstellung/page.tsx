import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import LineupPitch from "@/components/LineupPitch/LineupPitch";
import { getDiscordUser } from "@/lib/discordAuth";
import { links } from "@/lib/links";
import { formatEventDate } from "@/lib/eventDate";
import { getGame } from "@/lib/games";
import { getLineupEvent, getLineupEventIds, getLineupSlots } from "@/lib/lineup";

type Props = {
  params: Promise<{ id: string }>;
};

// Cache Components verlangt mindestens einen Eintrag; der Platzhalter führt auf 404
export async function generateStaticParams() {
  const ids = await getLineupEventIds();
  return ids.length > 0 ? ids.map((id) => ({ id })) : [{ id: "__placeholder__" }];
}

export const metadata: Metadata = {
  title: "Aufstellung | Westwood Gaming",
  description: "Trag dich auf deine Position für das nächste Event ein.",
  // nur für die Community über Discord gedacht, nicht für Suchmaschinen
  robots: { index: false, follow: false },
};

export default function LineupPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LineupContent params={params} />
    </Suspense>
  );
}

async function LineupContent({ params }: Props) {
  const { id } = await params;
  // Seite hängt vom eingeloggten Spieler ab und wird immer zur Laufzeit gerendert
  await connection();
  const lineup = await getLineupEvent(id);
  if (!lineup) notFound();

  const { event, formation } = lineup;
  const game = getGame(event.game);
  const [user, slots] = await Promise.all([getDiscordUser(), getLineupSlots(event.id)]);
  const path = `/events/${event.id}/aufstellung`;
  const mySlot = user ? slots.find((slot) => slot.discordId === user.id) : undefined;
  // Eingetragene in der Reihenfolge der Aufstellung (Sturm zuerst, Torwart zuletzt)
  const players = formation.flatMap((position) => {
    const slot = slots.find((entry) => entry.position === position.key);
    return slot ? [{ position, slot }] : [];
  });
  const free = formation.filter((position) => !slots.some((slot) => slot.position === position.key)).length;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        {game && (
          <Image alt="" src={game.image} fill sizes="(min-width: 1024px) 100vw, 1200px" preload className="-z-20 object-cover object-top" />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">
              {game?.name}
            </p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">{event.title}</h1>
            <p className="mt-3 text-sm text-white">{formatEventDate(event.date)}</p>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "Events", href: "/events" }, { name: "Aufstellung" }]} />

      <div className="w-full bg-white pt-12 pb-20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:order-2">
            <h2 className="text-2xl font-semibold text-black">Aufstellung</h2>
            <p className="mt-1 mb-4 flex items-center gap-2 text-lg font-semibold text-purple">
              {/* Taktik-Icon aus public/tactics.svg, eingebettet damit es die Textfarbe übernimmt */}
              <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" className="size-6">
                <path d="m650.23-140-41.77-41.77 63-64-63-63 41.77-42.77 64 64 63-64L820-308.77l-64 63 64 64L777.23-140l-63-63-64 63Zm-364.81-74.58Q300-229.15 300-250t-14.58-35.42Q270.85-300 250-300t-35.42 14.58Q200-270.85 200-250t14.58 35.42Q229.15-200 250-200t35.42-14.58ZM250-140q-45.77 0-77.88-32.12Q140-204.23 140-250q0-45.77 32.12-77.88Q204.23-360 250-360q36.23 0 65.19 21.27t39.5 56.27q42.85-7.54 71-40.69 28.16-33.16 28.16-76.85v-154.23q0-78.77 55.61-134.38 55.62-55.62 134.39-55.62h60.61l-73-73L674.23-860 820-714.23 674.23-568.46l-42.77-41.77 72.62-74h-60.23q-54.23 0-92.12 37.88-37.88 37.89-37.88 92.12V-400q0 68-45.27 118.5t-112.66 59.65q-9.3 36.23-38.88 59.04Q287.46-140 250-140Zm-68.23-468.46L140-650.23l63-64-63-63L181.77-820l64 64 63-64 42.77 42.77-64 63 64 64-42.77 41.77-63-63-64 63Z" />
              </svg>
              {event.formation}
            </p>
            <p className="text-base/7 text-gray-600">
              Wähle eine freie Position und trag dich ein. Pro Spieler ist ein Platz möglich, über das X an deinem
              Platz gibst du ihn wieder frei.
            </p>
            <p className="mt-4 text-sm font-semibold text-gray-900">
              {free} von {formation.length} Positionen frei
            </p>

            <div className="mt-8 rounded-md bg-gray-100 p-5">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt="" className="size-10 rounded-full" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {mySlot
                          ? `Eingetragen als ${formation.find((position) => position.key === mySlot.position)?.label ?? mySlot.position}`
                          : "Noch nicht eingetragen"}
                      </p>
                    </div>
                  </div>
                  {!user.member && (
                    <p className="mt-4 text-sm text-gray-600">
                      Eintragen können nur Mitglieder unseres Discord-Servers.{" "}
                      <a href={links.discord} target="_blank" className="font-semibold text-purple">
                        Jetzt beitreten
                      </a>{" "}
                      und danach{" "}
                      <a
                        href={`/api/auth/discord/login?returnTo=${encodeURIComponent(path)}`}
                        className="font-semibold text-purple"
                      >
                        erneut anmelden
                      </a>
                      .
                    </p>
                  )}
                  <a
                    href={`/api/auth/discord/logout?returnTo=${encodeURIComponent(path)}`}
                    className="mt-4 inline-block text-sm font-semibold text-purple"
                  >
                    Abmelden
                  </a>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Melde dich mit Discord an, um dich auf eine Position einzutragen.</p>
                  <a
                    href={`/api/auth/discord/login?returnTo=${encodeURIComponent(path)}`}
                    className="mt-4 flex items-center justify-center gap-2 rounded-md bg-purple px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <svg fill="currentColor" viewBox="0 0 126.644 96" aria-hidden="true" className="size-5">
                      <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />
                    </svg>
                    Mit Discord anmelden
                  </a>
                </>
              )}
            </div>

            {players.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900">Eingetragen ({players.length})</h3>
                <ul className="mt-3 divide-y divide-gray-100">
                  {players.map(({ position, slot }) => (
                    <li key={position.key} className="flex items-center gap-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slot.discordAvatar ?? ""} alt="" className="size-8 rounded-full bg-gray-200" />
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
                        {slot.discordName}
                        {slot.discordId === user?.id && <span className="text-gray-500"> (du)</span>}
                      </span>
                      <span className="rounded-sm border border-purple px-1 text-xs font-semibold text-purple">{position.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:order-1 lg:col-span-2">
            <LineupPitch
              eventId={String(event.id)}
              formation={formation}
              slots={slots}
              userId={user?.id ?? null}
              canJoin={Boolean(user?.member)}
              loginUrl={`/api/auth/discord/login?returnTo=${encodeURIComponent(path)}`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

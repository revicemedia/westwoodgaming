import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import EventFilter from "@/components/EventFilter/EventFilter";
import { getPastEvents, getUpcomingEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events | Westwood Gaming",
  description: "Alle kommenden Events von Westwood Gaming.",
};

export default function EventsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src="/EAFC.jpg"
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="-z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:min-h-[min(30vw,55svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">Westwood Gaming</p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">
              Events
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Kommende Events</h2>
          <p className="max-w-3xl text-base/7 text-gray-600">
            Hier findest du alle anstehenden Events unserer Community. Filtere nach Spiel und melde dich im Discord an.
          </p>
          <div className="mt-10">
            <Suspense fallback={null}>
              <EventList />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

async function EventList() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return <EventFilter upcoming={upcoming} past={past} />;
}

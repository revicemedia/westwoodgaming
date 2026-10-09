import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt | Westwood Gaming",
  description: "Schreib den Admins von Westwood Gaming.",
};

export default function KontaktPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src="/BF6.jpg"
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="-z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:min-h-[min(30vw,55svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">Westwood Gaming</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
              Kontakt
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-black">/ Schreib uns</h2>
            <p className="max-w-3xl text-base/7 text-gray-600">
              Du hast eine Frage, möchtest mitmachen oder ein Problem melden? Schreib uns – deine Nachricht landet
              direkt bei unseren Admins. Am schnellsten erreichst du uns im{" "}
              <a href="https://discord.gg/shbJrNYQ6y" target="_blank" className="font-semibold text-black underline">
                Discord
              </a>
              .
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

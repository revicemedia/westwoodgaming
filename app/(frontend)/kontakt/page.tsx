import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ContactForm from "@/components/ContactForm/ContactForm";
import { links } from "@/lib/links";

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
          className="hero-scroll-zoom -z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:min-h-[min(30vw,55svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">Westwood Gaming</p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">
              Kontakt
            </h1>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "Kontakt" }]} />

      <div className="w-full bg-white pt-12 pb-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-black">Kontaktiere uns</h2>
            <p className="max-w-3xl text-base/7 text-gray-600">
              Du hast eine Frage, möchtest mitmachen oder ein Problem melden? Schreib uns – deine Nachricht landet
              direkt bei unseren{" "}
              <Link href="/admins" className="font-semibold text-black">
                Admins
              </Link>
              . Du kannst dich alternativ auch direkt via {" "}
              <a href={links.discord} target="_blank" className="font-semibold text-black">
                Discord 
              </a>
               {" "}bei uns melden.
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

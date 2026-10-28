import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import FeedbackForm from "@/components/FeedbackForm/FeedbackForm";

// Nirgends auf der Website verlinkt; der Link wird nur im Discord geteilt
export const metadata: Metadata = {
  title: "Feedback | Westwood Gaming",
  description: "Gib uns Feedback zur Community, gern auch anonym.",
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src="/COD.jpg"
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="hero-scroll-zoom -z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:min-h-[min(30vw,55svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">Westwood Gaming</p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">Feedback</h1>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "Feedback" }]} />

      <div className="w-full bg-white pt-12 pb-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Sag uns, was du denkst</h2>
          <p className="max-w-3xl text-base/7 text-gray-600">
            Lob, Kritik oder eine Idee für die Community? Dein Feedback landet direkt bei unseren Admins. Du musst dich
            nicht anmelden, und wenn du das Namensfeld leer lässt, bleibt dein Feedback komplett anonym.
          </p>
          <div className="mt-10">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </>
  );
}

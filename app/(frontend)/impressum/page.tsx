import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

export const metadata: Metadata = {
  title: "Impressum | Westwood Gaming",
  description: "Impressum und Anbieterkennzeichnung von Westwood Gaming.",
};

// TODO: Platzhalter in eckigen Klammern vor dem Veröffentlichen durch echte Angaben ersetzen
const provider = {
  name: "[Vorname Nachname]",
  street: "[Straße Hausnummer]",
  city: "[PLZ Ort]",
  country: "Deutschland",
  email: "[E-Mail-Adresse]",
  phone: "[Telefonnummer]",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold text-black">{title}</h2>
      <div className="flex flex-col gap-4 text-base/7 text-gray-600">{children}</div>
    </section>
  );
}

export default function ImpressumPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src="/GTAVI.jpg"
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="-z-20 object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-80 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-96 lg:min-h-[min(30vw,55svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">Westwood Gaming</p>
            <h1 className="mt-4 text-pretty text-3xl font-semibold text-white sm:text-4xl">Impressum</h1>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "Impressum" }]} />

      <div className="w-full bg-white pt-12 pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:px-8">
          <Section title="Angaben gemäß § 5 DDG">
            <address className="not-italic">
              {provider.name}
              <br />
              {provider.street}
              <br />
              {provider.city}
              <br />
              {provider.country}
            </address>
          </Section>

          <Section title="Kontakt">
            <p>
              Telefon: {provider.phone}
              <br />
              E-Mail: {provider.email}
            </p>
          </Section>

          <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
            <address className="not-italic">
              {provider.name}
              <br />
              {provider.street}
              <br />
              {provider.city}
            </address>
          </Section>

          <Section title="Haftung für Inhalte">
            <p>
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
              Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
              eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
              bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer
              konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese
              Inhalte umgehend entfernen.
            </p>
          </Section>

          <Section title="Haftung für Links">
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, etwa zu Discord und Twitch, auf deren Inhalte wir
              keinen Einfluss haben. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber der Seiten
              verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft; rechtswidrige Inhalte waren zu diesem Zeitpunkt nicht erkennbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </Section>

          <Section title="Urheberrecht">
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Spielnamen, Logos und Bildmaterial der vorgestellten Spiele sind Marken bzw. Werke der
              jeweiligen Rechteinhaber und werden hier nur zur Beschreibung der Community-Aktivitäten verwendet.
            </p>
            <p>
              Sollten Sie auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis.
              Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}

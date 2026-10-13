import type { Metadata } from "next";
import Image from "next/image";
import NewsCard from "@/components/NewsCard/NewsCard";
import { getNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "News | Westwood Gaming",
  description: "Neuigkeiten aus der Community von Westwood Gaming.",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt=""
          src="/COD.jpg"
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
              News
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-black">Aktuelles</h2>
          <p className="max-w-3xl text-base/7 text-gray-600">
            Neuigkeiten, Ankündigungen und Rückblicke aus unserer Community.
          </p>
          <div className="mt-10">
            {news.length > 0 ? (
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <li key={item.id}>
                    <NewsCard news={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base/7 text-gray-600">Aktuell gibt es keine News.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

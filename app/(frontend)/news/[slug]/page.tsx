import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { getNews, getNewsArticle } from "@/lib/news";

type Props = {
  params: Promise<{ slug: string }>;
};

// Bekannte Artikel werden beim Build fertig vorgerendert. Neue Artikel zeigen beim
// allerersten Aufruf kurz den Platzhalter und liegen danach ebenfalls fertig im Cache.
export async function generateStaticParams() {
  const news = await getNews();
  // Cache Components verlangt mindestens einen Eintrag; der Platzhalter führt auf 404
  return news.length > 0 ? news.map((item) => ({ slug: item.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return {};

  return {
    title: `${article.title} | Westwood Gaming`,
    description: article.preview,
  };
}

export default function NewsArticlePage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleFallback />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

function ArticleFallback() {
  return (
    <>
      <div className="min-h-96 bg-black sm:min-h-120 lg:min-h-[min(40vw,70svh)]" />
      <div className="min-h-96 bg-white" />
    </>
  );
}

async function ArticleContent({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          alt={article.imageAlt}
          src={article.image}
          fill
          sizes="(min-width: 1024px) 100vw, 1200px"
          preload
          className="hero-scroll-zoom -z-20 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />

        <div className="mx-auto flex min-h-96 max-w-7xl items-end px-6 pt-24 pb-10 sm:min-h-120 lg:min-h-[min(40vw,70svh)] lg:px-8">
          <div>
            <p className="w-fit rounded-sm border border-white px-1 text-xs font-extralight text-white">{article.category}</p>
            <h1 className="mt-4 max-w-4xl text-pretty text-3xl font-semibold text-white sm:text-4xl">{article.title}</h1>
            <p className="mt-3 text-sm text-white">
              {article.author} · {article.date}
            </p>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: "News", href: "/news" }, { name: article.title }]} />

      <div className="w-full bg-white pt-12 pb-20">
        <article className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <p className="max-w-3xl text-lg/8 text-black">{article.preview}</p>
          <RichText data={article.content as SerializedEditorState} className="news-content mt-8 max-w-3xl" />
        </article>
      </div>
    </>
  );
}

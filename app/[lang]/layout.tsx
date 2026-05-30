import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SpotlightSearch from "@/components/spotlight-search";
import "../globals.css";
import { getAllBlogPosts, type BlogLang } from "@/lib/blog";
import { getDictionary, getAvailableLocales } from "@/lib/dictionaries";
import GsapProvider from "@/components/gsap-provider";
import DebugDomErrors from "@/components/debug-dom-errors";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sunnit.it"),
  title: {
    default: "SUNNIT Template",
    template: "%s | SUNNIT"
  },
  description: "Template Next.js per sito SUNNIT con animazioni, card e hero dinamica."
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const availableLocales = getAvailableLocales();
  const articles = getAllBlogPosts(lang as BlogLang).map((post) => ({
    title: post.title,
    excerpt: post.excerpt,
    content: post.body,
    createdAtLabel: post.createdAtLabel,
    href: `/${lang}/blog/${post.slug}`,
    tags: post.tags,
  }));

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>
        <DebugDomErrors />
        <GsapProvider>
          <Header dict={dict} lang={lang} availableLocales={availableLocales} />
          <SpotlightSearch articles={articles} />
          <main>{children}</main>
          <Footer dict={dict} lang={lang} />
        </GsapProvider>
      </body>
    </html>
  );
}

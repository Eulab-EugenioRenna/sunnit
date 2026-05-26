import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SpotlightSearch from "@/components/spotlight-search";
import "../globals.css";
import { getDictionary, getAvailableLocales } from "@/lib/dictionaries";
import GsapProvider from "@/components/gsap-provider";
export const metadata: Metadata = {
  title: {
    default: "SUNNIT Bento Template",
    template: "%s | SUNNIT"
  },
  description: "Template Next.js bento per sito SUNNIT con animazioni, card e hero dinamica."
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

  return (
    <html lang={lang}>
      <body>
        <GsapProvider>
          <Header dict={dict} lang={lang} availableLocales={availableLocales} />
          <SpotlightSearch />
          <main>{children}</main>
          <Footer dict={dict} lang={lang} />
        </GsapProvider>
      </body>
    </html>
  );
}

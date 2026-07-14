import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SpotlightSearch from "@/components/spotlight-search";
import "../globals.css";
import { getAllBlogPosts, type BlogLang } from "@/lib/blog";
import { getAllPortfolioProjects, type PortfolioLang } from "@/lib/portfolio";
import { getAllJobs, type JobLang } from "@/lib/jobs";
import { getDictionary, getAvailableLocales } from "@/lib/dictionaries";
import GsapProvider from "@/components/gsap-provider";
import DebugDomErrors from "@/components/debug-dom-errors";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sunnit.it"),
  title: {
    default: "SUNNIT",
    template: "%s | SUNNIT"
  },
  description: "Sito Web di Sunnit SRL, specialista in soluzioni informatiche, cybersecurity e trasformazione digitale.",
  authors: [
    {
      name: "EULAB - RENNA EUGENIO",
      url: "https://eulab.cloud"
    }
  ],
  creator: "EULAB - RENNA EUGENIO",
  publisher: "EULAB - RENNA EUGENIO",
  keywords: ["SUNNIT", "Sunnit SRL", "Sunnit", " Cybersecurity", "Soluzioni Informatiche", "Trasformazione Digitale", "Consulenza", "AI", "Intelligenza Artificiale", "Cloud", "Data Analytics"],
  openGraph: {
    title: "SUNNIT",
    description: "Sito Web di Sunnit SRL, specialista in soluzioni informatiche, cybersecurity e trasformazione digitale.",
    url: "https://sunnit.it",
    siteName: "SUNNIT",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 1200,
        alt: "SUNNIT - Innovation & Security",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUNNIT",
    description: "Sito Web di Sunnit SRL, specialista in soluzioni informatiche, cybersecurity e trasformazione digitale.",
    images: ["/images/og-image.png"],
  },
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
  const [blogPosts, projects, jobPosts] = await Promise.all([
    getAllBlogPosts(lang as BlogLang),
    getAllPortfolioProjects(lang as PortfolioLang),
    getAllJobs(lang as JobLang),
  ]);
  const articles = blogPosts.map((post) => ({
    title: post.title,
    excerpt: post.excerpt,
    content: post.body,
    createdAtLabel: post.createdAtLabel,
    href: `/${lang}/blog/${post.slug}`,
    tags: post.tags,
  }));
  const portfolioProjects = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    excerpt: project.excerpt,
    content: project.body,
    tag: project.tag,
    href: `/${lang}#cases`,
  }));
  const jobs = jobPosts.map((job) => ({
    slug: job.slug,
    title: job.title,
    excerpt: job.excerpt,
    content: job.body,
    department: job.department,
    country: job.country,
    location: job.location,
    workMode: job.workMode,
    contract: job.contract,
    seniority: job.seniority,
    href: `/${lang}/jobs`,
  }));

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>
        <Script id="author-console-banner" strategy="afterInteractive">
          {`console.log(String.raw\`

  ______ _    _ _               ____  
 │  ____│ │  │ │ │        ╱╲   │  _ ╲ 
 │ │__  │ │  │ │ │       ╱  ╲  │ │_) │
 │  __│ │ │  │ │ │      ╱ ╱╲ ╲ │  _ < 
 │ │____│ │__│ │ │____ ╱ ____ ╲│ │_) │
 │______│╲____╱│______╱_╱    ╲_╲____╱ 
                                      
                                      
Sito Web Realizzato da: 
EULAB - RENNA EUGENIO
https://eulab.cloud
eulabconsult@gmail.com
\`);`}
        </Script>
        <Script
          src="https://embeds.iubenda.com/widgets/7ff98209-e356-4b43-a690-f7a9d626611f.js"
          strategy="afterInteractive"
        />
        <DebugDomErrors />
        <GsapProvider>
          <Header dict={dict} lang={lang} availableLocales={availableLocales} />
          <SpotlightSearch articles={articles} portfolioProjects={portfolioProjects} jobs={jobs} />
          <main>{children}</main>
          <Footer dict={dict} lang={lang} />
        </GsapProvider>
      </body>
    </html>
  );
}

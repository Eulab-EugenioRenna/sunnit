import { jsonLd, pageUrl } from "@/lib/seo";
import { itemListSchema } from "@/lib/structured-data";
import PortfolioExperience from "@/components/portfolio-experience";
import SectionTitle from "@/components/section-title";
import { getAllPortfolioProjects } from "@/lib/portfolio";

function getPortfolioLabels(lang: string) {
  if (lang === "it") {
    return {
      open: "Apri progetto",
      close: "Chiudi progetto",
      details: "Dettagli progetto",
    };
  }

  if (lang === "es") {
    return {
      open: "Abrir proyecto",
      close: "Cerrar proyecto",
      details: "Detalles del proyecto",
    };
  }

  return {
    open: "Open project",
    close: "Close project",
    details: "Project details",
  };
}

export default async function PortfolioSection({
  lang,
  eyebrow,
  title,
}: {
  lang: string;
  eyebrow: string;
  title: string;
}) {
  const projects = await getAllPortfolioProjects(lang);
  const labels = getPortfolioLabels(lang);

  return (
    <section id="cases" className="container home-anchor-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", ...itemListSchema(projects.map(project => ({
          "@type": "CreativeWork", "@id": `${pageUrl(lang, `portfolio/${project.slug}`)}#project`,
          name: project.title, description: project.excerpt, url: pageUrl(lang, `portfolio/${project.slug}`),
        }))), "@id": `${pageUrl(lang)}#cases`, name: title,
      }) }} />
      <SectionTitle eyebrow={eyebrow} title={title} align="center" />

      <PortfolioExperience
        lang={lang}
        projects={projects.map((project) => ({
          slug: project.slug,
          title: project.title,
          excerpt: project.excerpt,
          image: project.image,
          tag: project.tag,
          tone: project.tone,
          body: project.body,
        }))}
        openLabel={labels.open}
        closeLabel={labels.close}
        detailsLabel={labels.details}
      />
    </section>
  );
}

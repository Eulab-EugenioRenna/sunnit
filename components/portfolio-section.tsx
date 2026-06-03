import PortfolioExperience from "@/components/portfolio-experience";
import SectionTitle from "@/components/section-title";
import { getAllPortfolioProjects, getPortfolioProject } from "@/lib/portfolio";

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
  const projects = getAllPortfolioProjects(lang);
  const labels = getPortfolioLabels(lang);

  return (
    <section id="cases" className="container home-anchor-section">
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

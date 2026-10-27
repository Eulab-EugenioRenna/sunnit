import { staticPageMetadata } from "@/lib/seo-pages";
import JobsBoard from "@/components/jobs-board";
import PageHero from "@/components/page-hero";
import { getDictionary } from "@/lib/dictionaries";
import { getAllJobs, type JobLang } from "@/lib/jobs";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return staticPageMetadata((await params).lang, "jobs");
}

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { lang } = await params;
  const { job = "" } = await searchParams;
  const dict = await getDictionary(lang);
  const jobs = await getAllJobs(lang as JobLang);

  return (
    <>
      <PageHero title={dict.jobs.hero.title} crumb={dict.jobs.hero.crumb} text={dict.jobs.hero.text} />
      <section className="container jobs-section">
        <div className="jobs-section__intro">
          <span>{dict.jobs.intro.eyebrow}</span>
          <h2>{dict.jobs.intro.title}</h2>
          <p>{dict.jobs.intro.text}</p>
        </div>
        <JobsBoard jobs={jobs} copy={dict.jobs} lang={lang} initialJobSlug={job} />
      </section>
    </>
  );
}

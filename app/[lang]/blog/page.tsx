import type { Metadata } from "next";
import Link from "next/link";
import BlogSidebar from "@/components/blog-sidebar";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import { getAllBlogPosts, type BlogLang } from "@/lib/blog";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insight su software development, cloud, dati, AI e design."
};

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: 'en' | 'it' }>;
  searchParams: Promise<{ search?: string; page?: string; tag?: string }>;
}) {
  const { lang } = await params;
  const { search = "", page = "1", tag = "" } = await searchParams;
  const dict = await getDictionary(lang);
  const posts = getAllBlogPosts(lang as BlogLang);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some((item) => item.toLowerCase().includes(search.toLowerCase()));

    const matchesTag =
      tag === "" ||
      post.tags.some((item) => item.toLowerCase() === tag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const postsPerPage = 2;
  const currentPage = parseInt(page) || 1;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const getFilterUrl = (newTag?: string, newPage?: number, newSearch?: string) => {
    const params = new URLSearchParams();
    
    const activeTag = newTag !== undefined ? newTag : tag;
    if (activeTag) params.set("tag", activeTag);
    
    const activeSearch = newSearch !== undefined ? newSearch : search;
    if (activeSearch) params.set("search", activeSearch);
    
    const activePage = newPage !== undefined ? newPage : 1;
    if (activePage > 1) params.set("page", activePage.toString());

    const queryString = params.toString();
    return `/${lang}/blog${queryString ? `?${queryString}` : ""}`;
  };

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) =>
    left.localeCompare(right)
  );

  return (
    <>
      <PageHero title={dict.blog.hero.title} crumb={dict.blog.hero.crumb} />

      <section className="container blog-layout">
        <div className="article-list">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post, index) => (
              <GsapReveal className="article-preview" key={post.title} delay={index * 120}>
                <Link href={`/${lang}/blog/${post.slug}`} className="article-preview-link">
                  {post.image ? (
                    <div className="article-image">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </div>
                  ) : (
                    <div className="article-image" aria-hidden="true" />
                  )}
                  <small>
                    {post.createdAtLabel} by SUNNIT
                    {post.tags[0] ? ` / ${post.tags[0]}` : ""}
                  </small>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt} {dict.blog.list.suffix}</p>
                  <span className="article-preview-action">
                    {lang === "en" ? "Open article" : "Apri articolo"}
                  </span>
                </Link>
              </GsapReveal>
            ))
          ) : (
            <div className="blog-empty-state">
              <h3>{lang === "en" ? "No posts found" : "Nessun articolo trovato"}</h3>
              <p>{lang === "en" ? "Try adjusting your search query or filters." : "Prova a modificare i filtri di ricerca."}</p>
              <Link href={`/${lang}/blog`} className="outline-btn tiny" style={{ marginTop: "18px" }}>
                {lang === "en" ? "Reset all filters" : "Azzera tutti i filtri"}
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 ? (
                <Link href={getFilterUrl(undefined, currentPage - 1)} className="pagination-btn">
                  &larr; {lang === "en" ? "Prev" : "Prec"}
                </Link>
              ) : (
                <span className="pagination-btn disabled">&larr; {lang === "en" ? "Prev" : "Prec"}</span>
              )}

              <div className="pagination-pages">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={getFilterUrl(undefined, pageNum)}
                      className={`pagination-page-num ${isActive ? "active" : ""}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <Link href={getFilterUrl(undefined, currentPage + 1)} className="pagination-btn">
                  {lang === "en" ? "Next" : "Succ"} &rarr;
                </Link>
              ) : (
                <span className="pagination-btn disabled">{lang === "en" ? "Next" : "Succ"} &rarr;</span>
              )}
            </div>
          )}
        </div>

        <BlogSidebar lang={lang} posts={posts} allTags={allTags} activeTag={tag} search={search} />
      </section>
    </>
  );
}

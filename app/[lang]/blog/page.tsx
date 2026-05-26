import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import { posts } from "@/lib/data";
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
  searchParams: Promise<{ search?: string; page?: string; category?: string }>;
}) {
  const { lang } = await params;
  const { search = "", page = "1", category = "" } = await searchParams;
  const dict = await getDictionary(lang);

  // Filter posts dynamically
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.text.toLowerCase().includes(search.toLowerCase()) ||
      post.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "" ||
      post.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Pagination calculations (2 posts per page to show pagination)
  const postsPerPage = 2;
  const currentPage = parseInt(page) || 1;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // URL Helper to preserve other search parameters
  const getFilterUrl = (newCategory?: string, newPage?: number, newSearch?: string) => {
    const params = new URLSearchParams();
    
    // Category parameter
    const activeCat = newCategory !== undefined ? newCategory : category;
    if (activeCat) params.set("category", activeCat);
    
    // Search parameter
    const activeSearch = newSearch !== undefined ? newSearch : search;
    if (activeSearch) params.set("search", activeSearch);
    
    // Page parameter
    const activePage = newPage !== undefined ? newPage : 1;
    if (activePage > 1) params.set("page", activePage.toString());

    const queryString = params.toString();
    return `/${lang}/blog${queryString ? `?${queryString}` : ""}`;
  };

  // Get all unique categories dynamically
  const allCategories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <>
      <PageHero title={dict.blog.hero.title} crumb={dict.blog.hero.crumb} />

      <section className="container blog-layout">
        <div className="article-list">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post, index) => (
              <GsapReveal className="article-preview" key={post.title} delay={index * 120}>
                <div className="article-image" />
                <small>{post.date} by SUNNIT / {post.category}</small>
                <h2>{post.title}</h2>
                <p>{post.text} {dict.blog.list.suffix}</p>
                <Link href={getFilterUrl(post.category)} className="outline-btn tiny">{dict.blog.list.readMore}</Link>
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

        <aside className="sidebar">
          <div className="author-card">
            <div className="author-avatar" />
            <p>{dict.blog.sidebar.authorQuote}</p>
            <div className="filter-row" style={{ justifyContent: "flex-start", margin: 0 }}>
              <button className="active">X</button>
              <button>f</button>
              <button>in</button>
            </div>
          </div>

          <form action="" method="GET" className="blog-search-form">
            {category && <input type="hidden" name="category" value={category} />}
            <input 
              name="search" 
              defaultValue={search} 
              className="search-input" 
              placeholder={dict.blog.sidebar.searchPlaceholder} 
            />
          </form>

          <div className="sidebar-card">
            <h3>{dict.blog.sidebar.recentPosts}</h3>
            {posts.slice(0, 3).map((post) => (
              <Link 
                key={post.title} 
                href={getFilterUrl(post.category, 1, post.title)} 
                style={{ display: "block", margin: "14px 0", fontWeight: 900 }}
              >
                {post.title}
              </Link>
            ))}
          </div>

          <div className="sidebar-card">
            <h3>{dict.blog.sidebar.categories}</h3>
            <div className="category-list">
              <Link 
                href={getFilterUrl("")} 
                className={`category-item ${category === "" ? "active" : ""}`}
              >
                {lang === "en" ? "All Categories" : "Tutte le categorie"}
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat}
                  href={getFilterUrl(cat)}
                  className={`category-item ${category.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>{dict.blog.sidebar.tags}</h3>
            <div className="tag-cloud">
              {['branding', 'digital', 'marketing', 'planning', 'seo', 'web'].map((tag) => (
                <Link key={tag} href={getFilterUrl(undefined, 1, tag)}>
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

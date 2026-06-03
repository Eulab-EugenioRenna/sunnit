import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import BlogSidebar from "@/components/blog-sidebar";
import PageHero from "@/components/page-hero";
import TextLines from "@/components/text-lines";
import { getAllBlogPosts, getAllBlogSlugs, getBlogPost, type BlogLang } from "@/lib/blog";
import { useMDXComponents } from "@/mdx-components";

type BlogPostPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getBlogPost(lang as BlogLang, slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : [],
      locale: lang,
      type: "article",
    },
  };
}

async function getMdxContent(body: string) {
  const result = await evaluate(body, {
    ...runtime,
    useMDXComponents: () => useMDXComponents({}),
  });

  return result.default;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = await params;
  const post = getBlogPost(lang as BlogLang, slug);

  if (!post) {
    notFound();
  }

  const posts = getAllBlogPosts(lang as BlogLang);
  const allTags = Array.from(new Set(posts.flatMap((item) => item.tags))).sort((left, right) =>
    left.localeCompare(right)
  );
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sunnit.it";
  const shareUrl = new URL(`/${lang}/blog/${post.slug}`, baseUrl).toString();
  const Content = await getMdxContent(post.body);

  return (
    <>
      <PageHero title={post.title} crumb={lang === "en" ? "Blog" : "Blog"} text={post.excerpt} />

      <section className="container blog-layout blog-detail-layout">
        <div className="blog-post-main">
          <Link href={`/${lang}/blog`} className="outline-btn tiny blog-back-link">
            {lang === "en" ? "Back to blog" : "Torna al blog"}
          </Link>

          <article className="blog-post-card">
            <header className="blog-post-header">
              <small>
                {post.createdAtLabel} by SUNNIT
                {post.tags.length ? ` / ${post.tags.join(" / ")}` : ""}
              </small>
              <h1>{post.title}</h1>
              <TextLines text={post.excerpt} />
            </header>

            {post.image ? (
              <div className="blog-post-image-wrap">
                <img src={post.image} alt={post.title} className="blog-post-image" />
              </div>
            ) : null}

            <div className="blog-post-content">
              <Content />
            </div>
          </article>

          <nav className="post-switch-grid" aria-label={lang === "en" ? "Article navigation" : "Navigazione articoli"}>
            {previousPost ? (
              <Link href={`/${lang}/blog/${previousPost.slug}`} className="post-switch-card">
                <small>{lang === "en" ? "Previous article" : "Articolo precedente"}</small>
                <strong>{previousPost.title}</strong>
              </Link>
            ) : (
              <div className="post-switch-card is-empty" aria-hidden="true" />
            )}

            {nextPost ? (
              <Link href={`/${lang}/blog/${nextPost.slug}`} className="post-switch-card post-switch-card-next">
                <small>{lang === "en" ? "Next article" : "Articolo successivo"}</small>
                <strong>{nextPost.title}</strong>
              </Link>
            ) : (
              <div className="post-switch-card is-empty" aria-hidden="true" />
            )}
          </nav>
        </div>

        <BlogSidebar
          lang={lang}
          posts={posts}
          allTags={allTags}
          currentPost={post}
          currentShareUrl={shareUrl}
        />
      </section>
    </>
  );
}

import Link from "next/link";
import { Facebook, Linkedin, Mail, MessageCircle, Send, Twitter } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

type BlogSidebarProps = {
  lang: "it" | "en";
  posts: BlogPost[];
  allTags: string[];
  activeTag?: string;
  search?: string;
  currentPost?: BlogPost;
  currentShareUrl?: string;
};

function getShareItems(lang: "it" | "en", title: string, url: string) {
  const text = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      icon: <Twitter size={16} />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin size={16} />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook size={16} />,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <MessageCircle size={16} />,
    },
    {
      label: lang === "en" ? "Email" : "Email",
      href: `mailto:?subject=${text}&body=${encodeURIComponent(url)}`,
      icon: <Mail size={16} />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      icon: <Send size={16} />,
    },
  ];
}

export default function BlogSidebar({
  lang,
  posts,
  allTags,
  activeTag = "",
  search = "",
  currentPost,
  currentShareUrl,
}: BlogSidebarProps) {
  const getFilterUrl = (newTag?: string, newSearch?: string) => {
    const params = new URLSearchParams();

    const tag = newTag !== undefined ? newTag : activeTag;
    const query = newSearch !== undefined ? newSearch : search;

    if (tag) params.set("tag", tag);
    if (query) params.set("search", query);

    const queryString = params.toString();
    return `/${lang}/blog${queryString ? `?${queryString}` : ""}`;
  };

  const shareItems =
    currentPost && currentShareUrl
      ? getShareItems(lang, currentPost.title, currentShareUrl)
      : [];

  const recentPosts = currentPost
    ? posts.filter((post) => post.slug !== currentPost.slug).slice(0, 3)
    : posts.slice(0, 3);

  return (
    <aside className="sidebar">
      <div className="author-card">
        <div className="author-avatar" />
        <p>
          {lang === "en"
            ? "Practical articles on software delivery, cloud architecture, AI, and product quality."
            : "Articoli pratici su delivery software, architetture cloud, AI e qualita di prodotto."}
        </p>
        <div className="blog-mini-meta">
          <span>{posts.length} posts</span>
          <span>{allTags.length} tags</span>
        </div>
      </div>

      <form action={`/${lang}/blog`} method="GET" className="blog-search-form">
        {activeTag && <input type="hidden" name="tag" value={activeTag} />}
        <input
          name="search"
          defaultValue={search}
          className="search-input"
          placeholder={lang === "en" ? "Search articles" : "Cerca articoli"}
        />
      </form>

      {currentPost && shareItems.length ? (
        <div className="sidebar-card">
          <h3>{lang === "en" ? "Share article" : "Condividi articolo"}</h3>
          <div className="share-grid">
            {shareItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="share-pill"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="sidebar-card">
        <h3>{lang === "en" ? "Recent posts" : "Articoli recenti"}</h3>
        <div className="sidebar-post-list">
          {recentPosts.map((post) => (
            <Link key={post.slug} href={`/${lang}/blog/${post.slug}`} className="sidebar-post-link">
              {post.image ? (
                <img src={post.image} alt={post.title} className="sidebar-post-thumb" loading="lazy" />
              ) : (
                <div className="sidebar-post-thumb" aria-hidden="true" />
              )}
              <span>
                <strong>{post.title}</strong>
                <small>{post.createdAtLabel}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-card">
        <h3>{lang === "en" ? "Browse by tag" : "Esplora per tag"}</h3>
        <div className="category-list">
          <Link href={getFilterUrl("")} className={`category-item ${activeTag === "" ? "active" : ""}`}>
            {lang === "en" ? "All Tags" : "Tutti i tag"}
          </Link>
          {allTags.map((item) => (
            <Link
              key={item}
              href={getFilterUrl(item)}
              className={`category-item ${activeTag.toLowerCase() === item.toLowerCase() ? "active" : ""}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-card">
        <h3>{lang === "en" ? "Popular tags" : "Tag popolari"}</h3>
        <div className="tag-cloud">
          {allTags.map((item) => (
            <Link key={item} href={getFilterUrl(item)}>
              <span>{item}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

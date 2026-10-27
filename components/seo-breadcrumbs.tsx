import Link from "next/link";
import { jsonLd, pageUrl } from "@/lib/seo";
export default function SeoBreadcrumbs({ lang, items }: { lang: string; items: Array<{ name: string; path: string }> }) {
  const list = [{ name: "SUNNIT", path: "" }, ...items];
  return <>
    <nav aria-label="Breadcrumb" className="container"><ol>{list.map(item => <li key={item.path}><Link href={pageUrl(lang, item.path)}>{item.name}</Link></li>)}</ol></nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: list.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: pageUrl(lang, item.path) })) }) }} />
  </>;
}

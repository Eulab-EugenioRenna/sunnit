import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getCanonicalOriginForHostname } from "@/lib/i18n";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const origin = getCanonicalOriginForHostname(requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/studio/"] }, sitemap: `${origin}/sitemap.xml` };
}

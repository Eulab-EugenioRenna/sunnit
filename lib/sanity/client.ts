import "server-only";

import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, hasSanityConfig, projectId } from "@/sanity/env";

const client = hasSanityConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
      token: process.env.SANITY_API_READ_TOKEN,
      perspective: "published",
    })
  : null;

export async function sanityFetch<T>(query: string, params: QueryParams = {}, fallback: T): Promise<T> {
  if (!client) return fallback;

  return client.fetch<T>(query, params, {
    next: { revalidate: 60 },
  });
}

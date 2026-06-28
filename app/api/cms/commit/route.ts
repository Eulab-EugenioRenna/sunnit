import { NextRequest, NextResponse } from "next/server";
import { isCmsRequestAuthenticated } from "@/lib/cms-auth";
import { commitCmsBatch, type CmsContentType, type CmsEntry } from "@/lib/cms-content";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function isValidUpsert(value: unknown): value is CmsEntry {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      "lang" in value &&
      "slug" in value &&
      "frontmatter" in value &&
      "body" in value,
  );
}

function isValidDelete(value: unknown): value is { type: CmsContentType; lang: string; slug: string } {
  return Boolean(value && typeof value === "object" && "type" in value && "lang" in value && "slug" in value);
}

export async function POST(request: NextRequest) {
  if (!isCmsRequestAuthenticated(request)) return unauthorized();

  const body = await request.json();
  const upserts = Array.isArray(body.upserts) ? body.upserts.filter(isValidUpsert) : [];
  const deletes = Array.isArray(body.deletes) ? body.deletes.filter(isValidDelete) : [];

  const result = await commitCmsBatch(
    {
      upserts,
      deletes,
    },
    `cms: batch commit ${upserts.length} upserts ${deletes.length} deletes`,
  );

  return NextResponse.json({ ok: true, saved: result.saved, deleted: deletes.length });
}

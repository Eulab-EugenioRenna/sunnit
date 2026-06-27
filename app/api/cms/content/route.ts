import { NextRequest, NextResponse } from "next/server";
import { isCmsRequestAuthenticated } from "@/lib/cms-auth";
import { deleteCmsEntry, listCmsEntries, saveCmsEntry } from "@/lib/cms-content";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isCmsRequestAuthenticated(request)) return unauthorized();

  const type = request.nextUrl.searchParams.get("type") || "blog";
  const lang = request.nextUrl.searchParams.get("lang") || "it";
  const entries = await listCmsEntries(type, lang);

  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  if (!isCmsRequestAuthenticated(request)) return unauthorized();

  const entry = await request.json();
  const saved = await saveCmsEntry(entry);

  return NextResponse.json({ entry: saved });
}

export async function DELETE(request: NextRequest) {
  if (!isCmsRequestAuthenticated(request)) return unauthorized();

  const type = request.nextUrl.searchParams.get("type") || "";
  const lang = request.nextUrl.searchParams.get("lang") || "";
  const slug = request.nextUrl.searchParams.get("slug") || "";

  await deleteCmsEntry(type, lang, slug);

  return NextResponse.json({ ok: true });
}

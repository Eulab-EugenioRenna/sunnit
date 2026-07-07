import { NextRequest, NextResponse } from "next/server";
import { isCmsRequestAuthenticated } from "@/lib/cms-auth";
import { beautifyCmsEntry, translateCmsEntry, translateEmptyCmsEntries } from "@/lib/cms-ai";
import type { CmsEntry } from "@/lib/cms-content";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function POST(request: NextRequest) {
  if (!isCmsRequestAuthenticated(request)) return unauthorized();

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const entry = body.entry as CmsEntry;

    if (!entry || !entry.type || !entry.lang) {
      return NextResponse.json({ error: "Missing entry." }, { status: 400 });
    }

    if (action === "beautify") {
      const mode = body.mode === "excerpt-only" ? "excerpt-only" : "full";
      return NextResponse.json({ entry: await beautifyCmsEntry(entry, { mode }) });
    }

    if (action === "translate") {
      const targetLang = String(body.targetLang || "").trim();

      if (!targetLang) {
        const locales = Array.isArray(body.locales) ? body.locales.filter((locale: unknown): locale is string => typeof locale === "string") : [];
        return NextResponse.json(await translateEmptyCmsEntries({ entry, locales }));
      }

      if (!targetLang || targetLang === entry.lang) {
        return NextResponse.json({ error: "Invalid target language." }, { status: 400 });
      }

      return NextResponse.json({ entry: await translateCmsEntry({ entry, targetLang }) });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "AI backend unavailable. Configure OLLAMA_URL with a reachable server endpoint."
            : message,
      },
      { status: 500 },
    );
  }
}

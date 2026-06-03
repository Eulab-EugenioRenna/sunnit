import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const NEWSLETTER_FILE = path.join(process.cwd(), "data", "newsletter-signups.json");

type NewsletterSignup = {
  email: string;
  createdAt: string;
  date: string;
  time: string;
  ip: string;
  userAgent: string;
  referer: string;
  lang: string;
  source: string;
  host: string;
  forwardedFor: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readNewsletterSignups() {
  try {
    const content = await fs.readFile(NEWSLETTER_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const email = String(payload?.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const now = new Date();
  const signup: NewsletterSignup = {
    email,
    createdAt: now.toISOString(),
    date: now.toLocaleDateString("en-CA"),
    time: now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer") || "",
    lang: String(payload?.lang || ""),
    source: String(payload?.source || "newsletter"),
    host: request.headers.get("host") || "",
    forwardedFor: request.headers.get("x-forwarded-for") || "",
  };

  const signups = await readNewsletterSignups();
  signups.push(signup);

  await fs.mkdir(path.dirname(NEWSLETTER_FILE), { recursive: true });
  await fs.writeFile(NEWSLETTER_FILE, `${JSON.stringify(signups, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true });
}

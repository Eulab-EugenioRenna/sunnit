import { NextRequest, NextResponse } from "next/server";
import { createCmsSession, getCmsAuthConfig, setCmsCookie } from "@/lib/cms-auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json().catch(() => ({ username: "", password: "" }));
  const config = getCmsAuthConfig();

  if (!config.configured) {
    return NextResponse.json({ error: "CMS auth is not configured." }, { status: 503 });
  }

  if (username !== config.username || password !== config.password) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setCmsCookie(response, createCmsSession(config.username));

  return response;
}

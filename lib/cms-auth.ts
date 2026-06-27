import "server-only";

import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";

const cookieName = "sunnit_cms_session";
const sessionTtlMs = 1000 * 60 * 60 * 8;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSecret() {
  return process.env.CMS_SESSION_SECRET || (isProduction() ? "" : "local-cms-session-secret");
}

export function getCmsAuthConfig() {
  const username = process.env.CMS_USERNAME || (isProduction() ? "" : "admin");
  const password = process.env.CMS_PASSWORD || (isProduction() ? "" : "admin");
  const secret = getSecret();

  return {
    username,
    password,
    secret,
    configured: Boolean(username && password && secret),
  };
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createCmsSession(username: string) {
  const { secret, configured } = getCmsAuthConfig();

  if (!configured) {
    throw new Error("CMS auth is not configured.");
  }

  const expires = Date.now() + sessionTtlMs;
  const payload = `${username}.${expires}`;
  const signature = sign(payload, secret);

  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyCmsSession(token: string | undefined) {
  if (!token) return false;

  const { username, secret, configured } = getCmsAuthConfig();

  if (!configured) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");

    if (parts.length !== 3) return false;

    const [tokenUsername, expires, signature] = parts;
    const payload = `${tokenUsername}.${expires}`;
    const expected = sign(payload, secret);

    return tokenUsername === username && Number(expires) > Date.now() && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isCmsRequestAuthenticated(request: NextRequest) {
  return verifyCmsSession(request.cookies.get(cookieName)?.value);
}

export function setCmsCookie(response: NextResponse, token: string) {
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: sessionTtlMs / 1000,
  });
}

export function clearCmsCookie(response: NextResponse) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: 0,
  });
}

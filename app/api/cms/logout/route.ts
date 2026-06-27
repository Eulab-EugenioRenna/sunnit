import { NextResponse } from "next/server";
import { clearCmsCookie } from "@/lib/cms-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearCmsCookie(response);

  return response;
}

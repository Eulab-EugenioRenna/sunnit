import { NextRequest, NextResponse } from "next/server";
import { getCmsAuthConfig, isCmsRequestAuthenticated } from "@/lib/cms-auth";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: isCmsRequestAuthenticated(request),
    configured: getCmsAuthConfig().configured,
  });
}

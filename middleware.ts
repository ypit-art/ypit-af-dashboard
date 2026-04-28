import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

function parseBasicAuth(header: string | null): { user: string; password: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(":");
    if (colon === -1) return null;
    return {
      user: decoded.slice(0, colon),
      password: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Admin access is not configured. Set ADMIN_USER and ADMIN_PASSWORD.",
      { status: 503 },
    );
  }

  const parsed = parseBasicAuth(request.headers.get("authorization"));
  if (
    parsed &&
    parsed.user === expectedUser &&
    parsed.password === expectedPass
  ) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: [
    "/",
    "/api/registrations",
    "/api/registrations/:path*",
    "/api/conference_waitlist",
    "/api/conference_waitlist/:path*",
  ],
};

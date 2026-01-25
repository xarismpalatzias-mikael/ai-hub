import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_EMAILS = ["xarismpalatzias@gmail.com"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // We only run middleware for /admin paths (see config below)
  const isAdminPage = path.startsWith("/admin");

  // If it's not /admin, just allow
  if (!isAdminPage) {
    return NextResponse.next();
  }

  // Check admin cookie
  const adminCookie = req.cookies.get("admin")?.value === "ok";
  if (adminCookie) {
    return NextResponse.next();
  }

  // Check email in query (?email=...)
  const email = url.searchParams.get("email");
  if (email && ALLOWED_EMAILS.includes(email)) {
    const res = NextResponse.redirect(new URL(path, req.url));
    res.cookies.set("admin", "ok", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return res;
  }

  // Block everything else
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  // ⭐ ONLY /admin/** is protected. ALL /api/** are free.
  matcher: ["/admin/:path*"],
};

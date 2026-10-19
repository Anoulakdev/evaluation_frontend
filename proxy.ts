import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes permissions by role according to Navbar.tsx
const ROLE_PERMITTED_ROUTES: { route: string; roles: number[] }[] = [
  { route: "/users", roles: [1, 11, 13, 14] },
  { route: "/alltotalscore", roles: [1, 12] },
  { route: "/totalscore", roles: [1, 12] },
  { route: "/organization", roles: [1] },
  { route: "/managedata", roles: [1] },
];

// Helper to decode JWT payload without external library
function decodeJwtPayload(token: string): {
  sub?: number;
  username?: string;
  roleId?: number;
  exp?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, API auth routes, public files, and unauthorized page
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/fonts") ||
    pathname === "/unauthorized" ||
    pathname === "/unauthorize" ||
    pathname.includes(".") // static files like edl.png, favicon.ico
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  let payload: ReturnType<typeof decodeJwtPayload> = null;

  if (token) {
    payload = decodeJwtPayload(token);

    // Check expiration
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      payload = null;
    }
  }

  const isAuthenticated = !!payload;

  // 2. If user is on /login page
  if (pathname === "/login") {
    if (isAuthenticated) {
      // If already logged in, redirect based on roleId
      let targetPath = "/evaluaterole";
      if (
        payload?.roleId === 1 ||
        payload?.roleId === 11 ||
        payload?.roleId === 13 ||
        payload?.roleId === 14
      ) {
        targetPath = "/users";
      } else if (payload?.roleId === 12) {
        targetPath = "/alltotalscore";
      }
      return NextResponse.redirect(new URL(targetPath, request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected Routes: If not authenticated, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid/expired cookie
    response.cookies.delete("token");
    return response;
  }

  // 4. Role-based Access Control (RBAC) according to Navbar.tsx
  for (const item of ROLE_PERMITTED_ROUTES) {
    if (pathname === item.route || pathname.startsWith(`${item.route}/`)) {
      if (!payload?.roleId || !item.roles.includes(payload.roleId)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

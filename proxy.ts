import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that only Admin (roleId === 1) can access according to Navbar.tsx
const ADMIN_ONLY_ROUTES = [
  "/users",
  "/alltotalscore",
  "/totalscore",
  "/organization",
  "/managedata",
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
        .join("")
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
      const targetPath = payload?.roleId === 1 ? "/users" : "/evaluaterole";
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
  // Only roleId === 1 (Admin) can access ADMIN_ONLY_ROUTES
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute) {
    if (payload?.roleId !== 1) {
      // Non-admin user attempting to access Admin route -> redirect to /unauthorized
      return NextResponse.redirect(new URL("/unauthorized", request.url));
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

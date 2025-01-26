// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookies } from "@/lib/cookies";

const protectedRoutes = {
  "/doctor": ["DOCTOR"],
  "/patient": ["PATIENT"],
  "/nurse": ["NURSE"],
};

const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookie = await getCookies();
  const userRole = cookie?.role;
  const rolePath = userRole ? `/${userRole.toLowerCase()}` : null;

  // Handle public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    if (cookie) {
      return NextResponse.redirect(new URL(rolePath!, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  const protectedRoute = Object.entries(protectedRoutes).find(([route]) => 
    path.startsWith(route)
  );

  if (protectedRoute) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [basePath, allowedRoles] = protectedRoute;

    // Redirect unauthenticated users to login
    if (!cookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect unauthorized users to their dashboard
    if (!allowedRoles.includes(userRole!)) {
      return NextResponse.redirect(new URL(rolePath!, request.url));
    }
  }

  // Allow access to non-protected routes
  return NextResponse.next();
}
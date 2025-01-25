// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookies } from "@/lib/cookies";

// Define protected routes and their allowed roles
const protectedRoutes = {
  "/doctor": ["DOCTOR"],
  "/patient": ["PATIENT"],
  "/nurse": ["NURSE"],
};

// Define public login routes
const publicLoginRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const cookie = await getCookies();

  // Get the current path
  const path = request.nextUrl.pathname;

  // Check if the route is a public login route
  const isPublicLoginRoute = publicLoginRoutes.some((route) => path === route);

  if (isPublicLoginRoute) {
    // Allow access to public login routes
    return NextResponse.next();
  }

  // Check if the route is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Allow access to routes that are neither public login nor protected
    return NextResponse.next();
  }

  // No session means unauthorized for protected routes
  if (!cookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check role-based access for protected routes
  const userRole = cookie.role;
  const allowedRoles = Object.entries(protectedRoutes).find(([route]) =>
    path.startsWith(route)
  )?.[1];

  if (!allowedRoles?.includes(userRole)) {
    return NextResponse.redirect(
      new URL(`/${userRole.toLocaleLowerCase()}`, request.url)
    );
  }

  // Allow access if all checks pass
  return NextResponse.next();
}

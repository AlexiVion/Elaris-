import { NextRequest, NextResponse } from "next/server";

const DEPLOYMENT_PREFIX = "/platform/deployment-control";
const LEGACY_PRODUCT_ROOTS = [
  "/robots",
  "/deployments",
  "/evidence",
  "/requirements",
  "/changes",
  "/incidents",
  "/reports",
  "/search",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith(DEPLOYMENT_PREFIX + "/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(DEPLOYMENT_PREFIX.length);
    return NextResponse.rewrite(target);
  }

  if (LEGACY_PRODUCT_ROOTS.some((root) => pathname === root || pathname.startsWith(root + "/"))) {
    const target = request.nextUrl.clone();
    target.pathname = DEPLOYMENT_PREFIX + pathname;
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/platform/deployment-control/:path*",
    "/robots/:path*",
    "/deployments/:path*",
    "/evidence/:path*",
    "/requirements/:path*",
    "/changes/:path*",
    "/incidents/:path*",
    "/reports/:path*",
    "/search/:path*",
  ],
};

import { SiteConfig } from "@/site-config";
import { defaultLocale, isLocale, locales } from "@/i18n";
import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pickPreferredLocale = (): string => {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (isLocale(cookieLocale)) return cookieLocale;

    const accept = request.headers.get("accept-language") ?? "";
    if (accept.toLowerCase().startsWith("fr")) return "fr";
    return defaultLocale;
  };

  const segments = pathname.split("/").filter(Boolean);
  const firstSeg = segments[0];
  const secondSeg = segments[1];
  const hasLocalePrefix = isLocale(firstSeg);
  const appSections = new Set(["dashboard", "auth", "admin"]);

  // Handle bare root path: redirect to locale-prefixed path or dashboard if logged in
  if (pathname === "/") {
    const locale = pickPreferredLocale();
    const session = getSessionCookie(request, { cookiePrefix: SiteConfig.appId });

    const url = new URL(request.url);
    url.pathname = session ? `/dashboard` : `/${locale}`;
    return NextResponse.redirect(url);
  }

  // If the path starts with a locale
  if (hasLocalePrefix) {
    const locale = firstSeg as string;

    // If the next segment is an app section, rewrite to non-prefixed path but keep URL
    if (secondSeg && appSections.has(secondSeg)) {
      const url = new URL(request.url);
      const stripped = `/${segments.slice(1).join("/")}`;
      url.pathname = stripped.length > 1 ? stripped : "/";
      const response = NextResponse.rewrite(url);
      response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
      return response;
    }

    // Otherwise, pass through locale-scoped routes (e.g., marketing pages under app/[locale])
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
    return response;
  }

  // If no locale prefix:
  // - For app sections (dashboard/auth/admin), pass through without adding a locale to avoid loops.
  if (firstSeg && appSections.has(firstSeg)) {
    const response = NextResponse.next();
    // Ensure NEXT_LOCALE cookie is set for next-intl (from cookie or Accept-Language)
    if (!request.cookies.get("NEXT_LOCALE")) {
      const locale = pickPreferredLocale();
      response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
    }
    return response;
  }

  // - For non-app routes, redirect to add the preferred locale
  const locale = pickPreferredLocale();
  const url = new URL(request.url);
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

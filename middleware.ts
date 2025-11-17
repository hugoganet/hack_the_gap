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

    const accept = request.headers.get("accept-language") || "";
    if (accept.toLowerCase().startsWith("fr")) return "fr";
    return defaultLocale;
  };

  const firstSeg = pathname.split("/")[1];
  const hasLocalePrefix = isLocale(firstSeg);

  // Handle bare root path: keep visible locale in URL
  if (pathname === "/") {
    const locale = pickPreferredLocale();
    const session = getSessionCookie(request, { cookiePrefix: SiteConfig.appId });

    const url = new URL(request.url);
    url.pathname = session ? `/${locale}/dashboard/courses` : `/${locale}`;
    return NextResponse.redirect(url);
  }

  // If path starts with a locale, set cookie and rewrite internally to non-locale path
  if (hasLocalePrefix) {
    const locale = firstSeg;
    const url = new URL(request.url);
    // strip the locale segment
    const rest = pathname.split("/").slice(2).join("/");
    url.pathname = `/${rest}`;
    const response = NextResponse.rewrite(url);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
    return response;
  }

  return NextResponse.next();
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

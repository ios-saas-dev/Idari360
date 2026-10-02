import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files, api routes, and public assets pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow access to login and unauthorized access page
  if (pathname === "/login" || pathname === "/yetkisiz-erisim") {
    return NextResponse.next();
  }

  // Read role from cookie or auth token
  // In demo/dev mode, role can be set via 'idari360_user_role' cookie
  const userRole = request.cookies.get("idari360_user_role")?.value || "facility_admin";

  // CRITICAL REQUIREMENT: Personel (staff) KESİNLİKLE web paneline giremez!
  if (userRole === "staff") {
    const url = request.nextUrl.clone();
    url.pathname = "/yetkisiz-erisim";
    const response = NextResponse.redirect(url);
    // Oturumu sonlandır / çerezi temizle
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

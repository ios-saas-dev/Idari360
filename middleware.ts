import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files, API routes, public assets → pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public pages → always accessible
  if (pathname === "/login" || pathname === "/yetkisiz-erisim") {
    return NextResponse.next();
  }

  // Build Supabase server client to read session from cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as any)
        );
      },
    },
  });

  // Oturumu al
  const { data: { user } } = await supabase.auth.getUser();

  // Oturum yoksa login'e yönlendir
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // E-posta doğrulanmamışsa login'e yönlendir
  if (!user.email_confirmed_at) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Profil ve onay durumunu kontrol et
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status, is_active")
    .eq("id", user.id)
    .single();

  // Profil yoksa veya onay bekliyorsa → login'e yönlendir
  if (!profile || profile.approval_status !== "approved" || !profile.is_active) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Personel (staff) web paneline KESİNLİKLE giremez
  if (profile.role === "staff") {
    const url = request.nextUrl.clone();
    url.pathname = "/yetkisiz-erisim";
    return NextResponse.redirect(url);
  }

  // Kullanıcı yönetim paneline sadece facility_admin girebilir
  if (pathname.startsWith("/kullanicilar") && profile.role !== "facility_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Rol çerezi güncelle (layout için)
  response.cookies.set("idari360_user_role", profile.role, { path: "/", maxAge: 86400 });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

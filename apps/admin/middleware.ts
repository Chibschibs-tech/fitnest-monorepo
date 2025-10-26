// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crée un client Supabase côté middleware (Edge) avec gestion des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            // propage les cookies sur la réponse
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // routes publiques
  const publicPaths = ["/login", "/_next", "/favicon", "/images", "/fonts"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    return res;
  }

  // routes protégées (comme on a enlevé le préfixe /admin)
  const protectedRoots = ["/", "/meals", "/plans"];
  const isProtected = protectedRoots.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  // protège tout sauf l’API, les assets, favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

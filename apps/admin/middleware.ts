import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const USER = process.env.ADMIN_USER || "";
  const PASS = process.env.ADMIN_PASS || "";

  // Si pas de creds -> on laisse passer (utile en dev local)
  if (!USER || !PASS) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const creds = auth.startsWith("Basic ") ? Buffer.from(auth.slice(6), "base64").toString() : "";
  const [u, p] = creds.split(":");

  if (u === USER && p === PASS) return NextResponse.next();

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:png|jpg|jpeg|svg|gif|ico|css|js|map)).*)"],
};

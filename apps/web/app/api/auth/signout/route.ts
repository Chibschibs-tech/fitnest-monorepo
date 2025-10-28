import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;        // ← pas d'env requis
  const redirectTo = new URL('/', origin);       // où tu veux rediriger

  const res = NextResponse.redirect(redirectTo.toString(), 302);
  // nettoie les cookies NextAuth si présents
  res.cookies.delete('next-auth.session-token');
  res.cookies.delete('__Secure-next-auth.session-token');
  return res;
}

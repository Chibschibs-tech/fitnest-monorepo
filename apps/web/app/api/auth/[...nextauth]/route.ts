export const dynamic = "force-dynamic";
export const revalidate = 0;

export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      return session
    },
    async jwt({ token, user }: any) {
      return token
    },
  },
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Auth endpoint" }), {
    headers: { "content-type": "application/json" },
  })
}

export async function POST() {
  return new Response(JSON.stringify({ message: "Auth endpoint" }), {
    headers: { "content-type": "application/json" },
  })
}

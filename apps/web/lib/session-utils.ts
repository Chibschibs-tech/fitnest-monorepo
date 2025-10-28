import { getSessionUser } from "./simple-auth"

export async function getServerSession(sessionId: string | undefined) {
  if (!sessionId) return null

  try {
    return await getSessionUser(sessionId)
  } catch (error) {
    console.error("Server session error:", error)
    return null
  }
}

export function getSessionFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(";").map((c) => c.trim())
  const sessionCookie = cookies.find((c) => c.startsWith("session-id="))

  return sessionCookie ? sessionCookie.split("=")[1] : null
}

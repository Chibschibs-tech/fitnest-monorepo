export function encrypt(payload: any): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function decrypt(token: string): any {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString())
  } catch (error) {
    return null
  }
}

export function verify(token: string): boolean {
  try {
    return !!decrypt(token)
  } catch (error) {
    return false
  }
}

export function login(user: any) {
  return encrypt({ userId: user.id })
}

export function logout() {
  return null
}

export function getSession(token: string) {
  return decrypt(token)
}

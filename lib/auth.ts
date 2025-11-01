import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.ADMIN_SECRET || 'dev-admin-secret')

export async function signAdminJWT(payload: Record<string, any>) {
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
}

export async function verifyAdminJWT(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

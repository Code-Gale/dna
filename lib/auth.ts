import { SignJWT, jwtVerify } from 'jose'

const getSecret = () => {
  const secretKey = process.env.ADMIN_SECRET || 'dev-admin-secret'
  if (!secretKey || secretKey === 'dev-admin-secret') {
    console.warn('Warning: Using default ADMIN_SECRET. Set ADMIN_SECRET environment variable in production!')
  }
  return new TextEncoder().encode(secretKey)
}

export async function signAdminJWT(payload: Record<string, any>) {
  try {
    const secret = getSecret()
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)
  } catch (error) {
    console.error('Error signing JWT:', error)
    throw error
  }
}

export async function verifyAdminJWT(token: string) {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error('Error verifying JWT:', error)
    throw error
  }
}

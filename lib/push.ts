import webpush from 'web-push'

export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const contact = process.env.VAPID_CONTACT || 'mailto:admin@example.com'
  if (!publicKey || !privateKey) throw new Error('Missing VAPID keys')
  webpush.setVapidDetails(contact, publicKey, privateKey)
  return webpush
}

import nodemailer from "nodemailer"

// Use `any` here to avoid depending on @types/nodemailer in this repo
let transporter: any = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn("SMTP not fully configured. Emails will be skipped.")
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  })
  return transporter
}

export async function sendMail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: Buffer | string; encoding?: string; contentType?: string; cid?: string }>
}) {
  const from = process.env.TICKETS_FROM_EMAIL || "Dinner Tickets <tickets@example.com>"
  const t = getTransporter()
  if (!t) {
    console.log(`[Email skipped] To: ${to}, Subject: ${subject}`)
    return { skipped: true }
  }
  const info = await t.sendMail({ from, to, subject, html, attachments })
  return { messageId: info.messageId }
}

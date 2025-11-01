export function renderTicketsEmail({
  firstName,
  lastName,
  ticketType,
  tickets,
  useCid = false,
}: {
  firstName: string
  lastName: string
  ticketType: string
  tickets: { id: string; qrCode: string }[]
  useCid?: boolean
}) {
  const items = tickets
    .map((t, i) => {
      const imgSrc = useCid ? `cid:qr-${t.id}@tickets` : t.qrCode
      return `
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:12px 0;">
        <p style="margin:0 0 8px 0;"><strong>Ticket ${i + 1}</strong> — ${ticketType.toUpperCase()}</p>
        <p style="margin:0 0 8px 0;">ID: ${t.id}</p>
        <div style="text-align:center;">
          <img src="${imgSrc}" alt="QR Code" style="max-width:240px" />
        </div>
      </div>`
    })
    .join("")

  return `
    <div style="font-family:Arial, sans-serif;background:#fff;">
      <div style="background:linear-gradient(135deg,#6B3FA0,#D4AF37);padding:20px;border-radius:8px;color:#fff;text-align:center;">
        <h1 style="margin:0">Dinner N' Awards Night</h1>
        <p style="margin:6px 0 0">Your E-Tickets</p>
      </div>
      <div style="padding:20px;">
        <p>Hello ${firstName} ${lastName},</p>
        <p>Thank you for your purchase. Please find your e-tickets below. Present the QR at entry.</p>
        ${items}
        <p style="color:#666;font-size:12px;margin-top:16px;">If you need help, reply to this email.</p>
      </div>
    </div>`
}

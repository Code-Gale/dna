import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateTicketPDF({
  ticketId,
  firstName,
  lastName,
  ticketType,
  qrDataUrl,
}: {
  ticketId: string
  firstName: string
  lastName: string
  ticketType: string
  qrDataUrl: string
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([400, 600])
  const { width, height } = page.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Header gradient bar (approx)
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.42, 0.25, 0.63) })
  page.drawText("Dinner N' Awards Night", { x: 24, y: height - 48, size: 18, font, color: rgb(1, 1, 1) })
  page.drawText('The Great Banquet', { x: 24, y: height - 68, size: 12, font: regular, color: rgb(1, 1, 1) })

  // Ticket info
  page.drawText('Ticket', { x: 24, y: height - 110, size: 14, font })
  page.drawText(`Name: ${firstName} ${lastName}`.trim(), { x: 24, y: height - 130, size: 12, font: regular })
  page.drawText(`Type: ${ticketType.toUpperCase()}`, { x: 24, y: height - 150, size: 12, font: regular })
  page.drawText(`ID: ${ticketId}`, { x: 24, y: height - 170, size: 12, font: regular })

  // Event info
  page.drawText('Event', { x: 24, y: height - 210, size: 14, font })
  page.drawText('Date: Dec 10, 2025 · Red Carpet 2PM · Main 3PM', { x: 24, y: height - 230, size: 11, font: regular })
  page.drawText('Venue: Victory House', { x: 24, y: height - 246, size: 11, font: regular })
  page.drawText('Dress Code: Royal Elegance', { x: 24, y: height - 262, size: 11, font: regular })

  // QR image
  const pngBytes = Buffer.from((qrDataUrl.split(',')[1] || ''), 'base64')
  try {
    const image = await pdfDoc.embedPng(pngBytes)
    const scaled = image.scale(0.5)
    const x = (width - scaled.width) / 2
    page.drawImage(image, { x, y: 100, width: scaled.width, height: scaled.height })
  } catch {
    // if embed fails, ignore
  }

  // Footer
  page.drawText('Present this code at entry. Non-transferable.', { x: 24, y: 60, size: 10, font: regular, color: rgb(0.2,0.2,0.2) })

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}

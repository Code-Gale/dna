"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Mail, Eye, Loader2, Image as ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

interface TicketData {
  serialNumber: string
  fullName: string
  email: string
}

export default function ManualTicketGenerator() {
  const [ticketData, setTicketData] = useState<TicketData>({
    serialNumber: "",
    fullName: "",
    email: "",
  })
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate preview when ticket data or background changes
  useEffect(() => {
    if (ticketData.serialNumber && ticketData.fullName && ticketData.email && backgroundImage) {
      generatePreview()
    } else {
      setPreviewUrl(null)
    }
  }, [ticketData, backgroundImage])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBackgroundImage(result)
        setBackgroundImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const generatePreview = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/tickets/manual-generate/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber: ticketData.serialNumber,
          fullName: ticketData.fullName,
          email: ticketData.email,
          backgroundImage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate preview")
      }

      const data = await response.json()
      
      // Composite the background image and QR code using canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas size (more rectangular ticket format: ~3:1 aspect ratio)
      canvas.width = 1200
      canvas.height = 400

      // Load background image
      const bgImg = new Image()
      bgImg.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve
        bgImg.onerror = reject
        bgImg.src = data.backgroundImage
      })

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

      // Load QR code
      const qrImg = new Image()
      qrImg.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve
        qrImg.onerror = reject
        qrImg.src = data.qrCode
      })

      // Draw QR code to fill the entire right side
      const qrPadding = 20
      const qrWidth = canvas.width * 0.35 // 35% of ticket width
      const qrHeight = canvas.height - (qrPadding * 2) // Full height minus padding
      const qrX = canvas.width - qrWidth - qrPadding
      const qrY = qrPadding

      // White background for QR code (fills entire right side)
      ctx.fillStyle = "white"
      ctx.fillRect(qrX - qrPadding, 0, qrWidth + qrPadding, canvas.height)
      
      // Draw QR code to fill the right side area
      ctx.drawImage(qrImg, qrX, qrY, qrWidth - qrPadding, qrHeight)

      // Convert to data URL
      const previewDataUrl = canvas.toDataURL("image/png")
      setPreviewUrl(previewDataUrl)
    } catch (error) {
      console.error("Preview generation error:", error)
      toast.error("Failed to generate preview")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAndSend = async () => {
    if (!ticketData.serialNumber || !ticketData.fullName || !ticketData.email) {
      toast.error("Please fill in all ticket fields")
      return
    }

    if (!backgroundImage) {
      toast.error("Please upload a background image")
      return
    }

    if (!recipientEmail) {
      toast.error("Please enter recipient email address")
      return
    }

    try {
      setIsSending(true)

      const response = await fetch("/api/tickets/manual-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber: ticketData.serialNumber,
          fullName: ticketData.fullName,
          email: ticketData.email,
          recipientEmail,
          emailMessage,
          backgroundImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate and send ticket")
      }

      const data = await response.json()
      toast.success("Ticket generated and sent successfully!")
      
      // Reset form
      setTicketData({ serialNumber: "", fullName: "", email: "" })
      setBackgroundImage(null)
      setBackgroundImageFile(null)
      setPreviewUrl(null)
      setRecipientEmail("")
      setEmailMessage("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Ticket generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate and send ticket")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Manual Ticket Generation</h2>
        <p className="text-foreground/70 mt-1">Create and distribute digital tickets manually</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Ticket Creation Form */}
        <div className="space-y-6">
          {/* Ticket Details Card */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>Enter the ticket information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  placeholder="e.g., TICKET-2025-001"
                  value={ticketData.serialNumber}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, serialNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g., John Doe"
                  value={ticketData.fullName}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.doe@example.com"
                  value={ticketData.email}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, email: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Image Card */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Background Image</CardTitle>
              <CardDescription>Upload or select a background image for the ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {backgroundImage ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-accent/20">
                    <img
                      src={backgroundImage}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setBackgroundImage(null)
                        setBackgroundImageFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full shadow-sm hover:bg-background transition-colors"
                      aria-label="Remove image"
                    >
                      <X size={16} className="text-foreground/70" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-accent/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-foreground/40" />
                  <p className="text-sm text-foreground/70 mb-2">
                    Click to upload background image
                  </p>
                  <p className="text-xs text-foreground/50">PNG, JPG up to 10MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {!backgroundImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload size={18} />
                  Upload Image
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Email Delivery Card */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Email Delivery</CardTitle>
              <CardDescription>Configure email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailMessage">Custom Message</Label>
                <Textarea
                  id="emailMessage"
                  placeholder="Add a custom message to accompany the ticket..."
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Ticket Preview
              </CardTitle>
              <CardDescription>Real-time preview of the generated ticket</CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center h-96 bg-accent/5 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-foreground/70">Generating preview...</p>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden border border-accent/20 bg-background">
                    <img
                      src={previewUrl}
                      alt="Ticket preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs text-foreground/60 text-center">
                    Preview shows ticket with QR code overlay
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-accent/5 rounded-lg border border-dashed border-accent/20">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
                    <p className="text-sm text-foreground/60">
                      Fill in ticket details and upload a background image
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      Preview will appear here automatically
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card className="border-accent/20">
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerateAndSend}
                disabled={isSending || !ticketData.serialNumber || !ticketData.fullName || !ticketData.email || !backgroundImage || !recipientEmail}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Generating & Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Generate & Send Ticket
                  </>
                )}
              </Button>
              <p className="text-xs text-foreground/50 text-center mt-3">
                The ticket will be generated and sent to the recipient email address
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, CheckCircle, AlertCircle, Flashlight, RefreshCcw } from "lucide-react"
import jsQR from "jsqr"

export default function TicketScanner() {
  const [scannedTicket, setScannedTicket] = useState<any>(null)
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle")
  const [manualInput, setManualInput] = useState("")
  const [offlineMode, setOfflineMode] = useState(false)
  const [pending, setPending] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('pendingCheckins')||'[]') } catch { return [] }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const [torchOn, setTorchOn] = useState(false)

  const handleManualScan = async () => {
    if (!manualInput.trim()) return
    try {
      await handleVerify(manualInput.trim())
    } catch {
      setScanStatus("error")
    } finally {
      setManualInput("")
    }
  }

  function persistPending(list: string[]) {
    setPending(list)
    try { localStorage.setItem('pendingCheckins', JSON.stringify(list)) } catch {}
  }

  async function handleVerify(ticketId: string) {
    if (offlineMode || !navigator.onLine) {
      const next = Array.from(new Set([ticketId, ...pending]))
      persistPending(next)
      setScannedTicket({ id: ticketId, firstName: 'Offline', lastName: 'Scan', ticketType: 'unknown' })
      setScanStatus('success')
      playTone('success')
      return
    }
    const res = await fetch('/api/tickets/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId }) })
    const data = await res.json()
    if (res.ok && data.ticket) {
      setScannedTicket({ id: data.ticket.id, firstName: data.ticket.firstName, lastName: data.ticket.lastName, ticketType: data.ticket.ticketType })
      setScanStatus('success')
      playTone('success')
      if (navigator.vibrate) navigator.vibrate(40)
    } else {
      // Duplicate vs error
      if (res.status === 409 && data?.duplicate) {
        setScannedTicket({ id: data.ticket?.id, firstName: data.ticket?.firstName, lastName: data.ticket?.lastName, ticketType: data.ticket?.ticketType })
        setScanStatus('error')
        playTone('duplicate')
        if (navigator.vibrate) navigator.vibrate([60, 40, 60])
      } else {
        setScanStatus('error')
        playTone('error')
        if (navigator.vibrate) navigator.vibrate(120)
      }
    }
  }

  // Simple WebAudio tones for feedback
  function playTone(kind: 'success' | 'duplicate' | 'error') {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      const now = ctx.currentTime
      if (kind === 'success') {
        o.frequency.setValueAtTime(880, now)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.2, now + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
      } else if (kind === 'duplicate') {
        o.frequency.setValueAtTime(440, now)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.25, now + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      } else {
        o.frequency.setValueAtTime(220, now)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.3, now + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
      }
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      o.stop(now + 0.35)
    } catch {}
  }

  const handleCheckIn = () => {
    if (scannedTicket) {
      setScannedTicket(null)
      setScanStatus("idle")
    }
  }

  useEffect(() => {
    let rafId: number | null = null
    let stream: MediaStream | null = null

    async function start() {
      try {
        if (!('mediaDevices' in navigator) || !navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not available in this browser")
        }
        // iOS/Safari/Android friendly constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
          audio: false,
        })
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        // Wait for metadata to ensure videoWidth/Height are populated
        await new Promise<void>((resolve) => {
          const v = videoRef.current!
          const done = () => resolve()
          if (v.readyState >= 1) return resolve()
          v.onloadedmetadata = done
        })
        await videoRef.current.play().catch(() => {})
        setErrorMessage(null)
        // enumerate devices (needs permission in some browsers)
        try {
          const list = await navigator.mediaDevices.enumerateDevices()
          setDevices(list.filter((d) => d.kind === "videoinput"))
        } catch {}
        // try to apply torch (if supported)
        try {
          const track = stream.getVideoTracks()[0]
          const caps: any = (track as any).getCapabilities?.() || {}
          if (typeof caps.torch !== "undefined") {
            await (track as any).applyConstraints({ advanced: [{ torch: torchOn }] })
          }
        } catch {}
        tick()
      } catch (e) {
        console.error("Camera error", e)
        const insecure = typeof window !== 'undefined' && !window.isSecureContext && location.hostname !== 'localhost'
        setErrorMessage(
          insecure
            ? "Camera requires HTTPS (or localhost). Please use a secure connection."
            : e?.message || "Unable to access camera. Check permissions and try again.",
        )
        setScanning(false)
      }
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }

    function tick() {
      if (!scanning || !videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      const vw = video.videoWidth || 0
      const vh = video.videoHeight || 0
      if (vw === 0 || vh === 0) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const w = (canvas.width = vw)
      const h = (canvas.height = vh)
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0, w, h)
      const img = ctx.getImageData(0, 0, w, h)
      const code = jsQR(img.data, w, h)
      if (code?.data) {
        handleQRData(code.data)
      } else {
        rafId = requestAnimationFrame(tick)
      }
    }

    async function handleQRData(data: string) {
      try {
        let ticketId = data
        if (data.startsWith("{")) {
          const obj = JSON.parse(data)
          ticketId = obj.ticketId || data
        }
        if (ticketId) await handleVerify(ticketId)
        setScanning(false)
      } catch (e) {
        setScanStatus("error")
      }
    }

    if (scanning) start()
    return () => stop()
  }, [scanning])

  return (
    <div className="space-y-8">
      {/* Scanner Input */}
      <Card className="p-8 border-accent/20">
        <h3 className="font-semibold text-foreground mb-6">Scan Ticket QR Code</h3>

        <div className="space-y-4">
          {/* Offline Toggle */}
          <div className="flex items-center justify-between border border-accent/20 rounded-lg p-3">
            <div>
              <p className="text-sm font-semibold">Offline Mode</p>
              <p className="text-xs text-foreground/60">Queue scans without internet; sync later.</p>
            </div>
            <button onClick={()=>setOfflineMode(v=>!v)} className={`px-3 py-1 rounded text-sm ${offlineMode ? 'bg-green-600 text-white' : 'bg-accent/10'}`}>{offlineMode ? 'On' : 'Off'}</button>
          </div>
          {/* Camera Input */}
          <div className="bg-primary/5 border-2 border-dashed border-accent/30 rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 text-accent/50 mx-auto mb-4" />
            <p className="text-foreground/70 mb-4">Use your camera or enter ticket ID manually</p>
            <div className="flex flex-col items-center gap-3 mb-4">
              <video ref={videoRef} className="w-full max-w-sm rounded" muted playsInline autoPlay />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {devices.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={deviceId || ""}
                  onChange={(e) => setDeviceId(e.target.value || undefined)}
                >
                  <option value="">Default (environment)</option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded text-sm"
                  onClick={() => {
                    setScanning(false)
                    setTimeout(() => setScanning(true), 50)
                  }}
                  title="Restart camera"
                >
                  <RefreshCcw className="w-4 h-4" /> Restart
                </button>
                <button
                  className={`inline-flex items-center gap-2 px-3 py-2 border rounded text-sm ${torchOn ? 'bg-amber-500 text-white' : ''}`}
                  onClick={async () => {
                    setTorchOn((v) => !v)
                    try {
                      const s = (videoRef.current?.srcObject as MediaStream) || null
                      const track = s?.getVideoTracks?.()[0]
                      if (track && (track as any).applyConstraints) {
                        await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] })
                      }
                    } catch {}
                  }}
                  title="Toggle torch"
                >
                  <Flashlight className="w-4 h-4" /> Torch
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  const imgUrl = URL.createObjectURL(file)
                  const img = new Image()
                  img.onload = async () => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    ctx.drawImage(img, 0, 0)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const result = jsQR(imageData.data, canvas.width, canvas.height)
                    if (result?.data) {
                      await handleVerify(result.data)
                    } else {
                      setScanStatus('error')
                      setErrorMessage('No QR code found in image')
                    }
                    URL.revokeObjectURL(imgUrl)
                  }
                  img.onerror = () => {
                    setScanStatus('error')
                    setErrorMessage('Unable to read selected image')
                  }
                  img.src = imgUrl
                } catch (err: any) {
                  setScanStatus('error')
                  setErrorMessage(err?.message || 'Image scanning failed')
                }
              }}
            />
            <Button
              onClick={() => setScanning((s) => !s)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 bg-transparent"
            >
              {scanning ? "Stop Camera" : "Start Camera"}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-accent/50">
                Upload QR Image
              </Button>
            </div>
            {errorMessage && <p className="text-sm text-red-600 mt-3">{errorMessage}</p>}
          </div>

          {/* Manual Input */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Or Enter Ticket ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
                placeholder="TICKET-1234567890-ABC123"
                className="flex-1 px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button onClick={handleManualScan} className="bg-primary hover:bg-primary/90 text-white">
                Scan
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Scan Result */}
      {scanStatus !== "idle" && scannedTicket && (
        <Card
          className={`p-8 border-2 ${
            scanStatus === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-4 mb-6">
            {scanStatus === "success" ? (
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${scanStatus === "success" ? "text-green-900" : "text-red-900"}`}>
                {scanStatus === "success" ? "Ticket Valid" : "Ticket Invalid"}
              </h3>
              {scanStatus === "success" && (
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    <strong>Name:</strong> {scannedTicket.firstName} {scannedTicket.lastName}
                  </p>
                  <p>
                    <strong>Ticket Type:</strong> {scannedTicket.ticketType}
                  </p>
                  <p>
                    <strong>Ticket ID:</strong> {scannedTicket.id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {scanStatus === "success" && (
            <Button onClick={handleCheckIn} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Confirm Check-In
            </Button>
          )}
        </Card>
      )}

      {/* Recent Check-ins */}
      <Card className="p-6 border-accent/20">
        <h3 className="font-semibold text-foreground mb-4">Recent Check-ins</h3>
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-foreground/60">No pending offline check-ins.</p>}
          {pending.map((id) => (
            <div key={id} className="flex items-center justify-between py-2 border-b border-accent/10 last:border-0">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-foreground">Pending Ticket</p>
                  <p className="text-xs text-foreground/60">{id}</p>
                </div>
              </div>
              <button
                className="text-sm px-3 py-1 rounded bg-primary text-white"
                onClick={async ()=>{
                  await handleVerify(id)
                  // if online and success, remove from queue
                  if (navigator.onLine && !offlineMode) {
                    const next = pending.filter(x=>x!==id)
                    persistPending(next)
                  }
                }}
              >Sync</button>
            </div>
          ))}
        </div>
        {pending.length>0 && (
          <Button onClick={async ()=>{
            for (const id of [...pending]) {
              await handleVerify(id)
            }
            if (navigator.onLine && !offlineMode) persistPending([])
          }} className="mt-4">Sync All</Button>
        )}
      </Card>
    </div>
  )
}

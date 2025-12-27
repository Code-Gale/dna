"use client"

import { BarChart3, QrCode, Ticket, TrendingUp, LogOut, Settings, HardDrive, Bell, Award, Menu, X, TicketPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface AdminNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function AdminNavigation({ activeTab, setActiveTab }: AdminNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "scanner", label: "Ticket Scanner", icon: QrCode },
    { id: "tickets", label: "All Tickets", icon: Ticket },
    { id: "manual-tickets", label: "Manual Tickets", icon: TicketPlus },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "awards", label: "Awards", icon: Award },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "comms", label: "Comms", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-accent/20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold">D</span>
            </div>
            <span className="font-serif font-bold text-primary hidden sm:inline">Admin Panel</span>
          </div>

          {/* Tabs - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={async ()=>{ try{ await fetch('/api/auth/logout', { method:'POST' }); window.location.href='/admin/login' } catch{} }}
              variant="outline" className="border-primary text-primary hover:bg-primary/5 bg-transparent gap-2 hidden sm:inline-flex">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            {/* Mobile menu toggle */}
            <button
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-accent/30 bg-white/60 text-foreground shadow-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-accent/20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${active ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent/10'}`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
            <Button
              onClick={async ()=>{ try{ await fetch('/api/auth/logout', { method:'POST' }); window.location.href='/admin/login' } catch{} }}
              variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 bg-transparent gap-2">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}

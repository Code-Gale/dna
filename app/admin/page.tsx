"use client"

import { useState } from "react"
import AdminNavigation from "@/components/admin-navigation"
import DashboardOverview from "@/components/dashboard-overview"
import TicketScanner from "@/components/ticket-scanner"
import TicketsList from "@/components/tickets-list"
import Analytics from "@/components/analytics"
import SettingsEditor from "@/components/settings-editor"
import AdminStorage from "@/components/admin-storage"
import AdminNotifications from "@/components/admin-notifications"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-foreground/70 mt-2">Manage tickets and view event analytics</p>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "scanner" && <TicketScanner />}
          {activeTab === "tickets" && <TicketsList />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "storage" && <AdminStorage />}
          {activeTab === "comms" && <AdminNotifications />}
          {activeTab === "settings" && <SettingsEditor />}
        </div>
      </main>
    </div>
  )
}

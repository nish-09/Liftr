"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import ContextualPanel from "./ContextualPanel";
import FloatingRestTimer from "@/components/workout/FloatingRestTimer";

interface DashboardShellProps {
  userDisplayName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
}

export default function DashboardShell({
  userDisplayName,
  userEmail,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#EBCBF7] flex flex-col lg:flex-row">
      {/* LEFT: Pastel Green Navigation Sidebar */}
      <Sidebar
        isMobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* CENTRE: Fullscreen Pastel Pink Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#EBCBF7]">
        <Header
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenContextPanel={() => setContextPanelOpen(true)}
        />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-3.5 py-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 min-w-0">
          {children}
        </main>
      </div>

      {/* RIGHT: Contextual Pastel Green Information Panel */}
      <ContextualPanel
        isOpenMobile={contextPanelOpen}
        onCloseMobile={() => setContextPanelOpen(false)}
      />

      <FloatingRestTimer />
      <MobileNav />
    </div>
  );
}

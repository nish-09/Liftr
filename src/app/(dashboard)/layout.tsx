import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";
import FloatingRestTimer from "@/components/workout/FloatingRestTimer";
import { getUser } from "@/lib/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#B8D99A] flex flex-col lg:flex-row text-[#171B16]">
      {/* Desktop Persistent Sidebar in Deep Forest Green */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userDisplayName={user?.user_metadata?.display_name || null}
          userEmail={user?.email || null}
        />

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Persistent Rest Timer Bar */}
      <FloatingRestTimer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}

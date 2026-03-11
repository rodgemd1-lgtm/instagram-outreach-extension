import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";

export const metadata: Metadata = {
  title: "Dashboard | Alex Recruiting",
  description: "Recruiting operations dashboard for Jacob Rodgers",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell min-h-screen">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <main className="min-h-screen pb-20 md:ml-64 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <DashboardMobileNav />
    </div>
  );
}

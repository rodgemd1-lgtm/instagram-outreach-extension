"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-nav";

// Routes that bypass the standard app shell (sidebar/header)
const STANDALONE_ROUTES = ["/recruit"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="md:ml-64">
        <Header />
        <main className="p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav - hidden on desktop */}
      <MobileBottomNav />
    </>
  );
}

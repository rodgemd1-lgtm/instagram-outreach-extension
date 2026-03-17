"use client";

import { usePathname } from "next/navigation";
import { SCSidebar } from "./sc-sidebar";
import { SCHeader } from "./sc-header";
import { SCFooter } from "./sc-footer";
import { SCMobileNav } from "./sc-mobile-nav";

/** Routes that render without the app shell (sidebar, header, footer). */
const STANDALONE_ROUTES = ["/recruit"];

interface SCShellProps {
  children: React.ReactNode;
}

export function SCShell({ children }: SCShellProps) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-sc-bg">
      {/* Sidebar - desktop only */}
      <SCSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-y-auto lg:ml-64">
        <SCHeader />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <SCFooter />
      </div>

      {/* Mobile bottom nav */}
      <SCMobileNav />
    </div>
  );
}

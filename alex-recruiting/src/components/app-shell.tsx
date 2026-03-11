"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-nav";
import { OperatorDock } from "@/components/operator-dock";

// Routes that bypass the standard app shell (sidebar/header)
const STANDALONE_ROUTES = ["/recruit", "/dashboard"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 shell-grid opacity-70" />
      <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(200,155,60,0.24),_transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(15,40,75,0.18),_transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[24%] top-[18%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(237,180,98,0.22),_transparent_70%)] blur-3xl" />

      <div className="relative hidden md:block">
        <Sidebar />
      </div>

      <div className="relative md:ml-[18rem] xl:mr-[24rem]">
        <Header />
        <main className="px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>

      <OperatorDock />
      <MobileBottomNav />
    </div>
  );
}

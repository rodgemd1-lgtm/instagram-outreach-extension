"use client";

import { useEffect, useState } from "react";
import { Download, X, Wifi, WifiOff } from "lucide-react";

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed - non-critical
      });
    }

    // Listen for install prompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    }

    // Online/offline detection
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstall(false);
      setInstallPrompt(null);
    }
  }

  return (
    <>
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg md:bottom-4">
          <WifiOff className="h-4 w-4" />
          Offline — showing cached data
        </div>
      )}

      {/* Install prompt */}
      {showInstall && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-xl border border-[rgba(15,40,75,0.12)] bg-white p-4 shadow-xl md:bottom-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F284B]">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F1720]">Install App</p>
            <p className="text-xs text-[#9CA3AF]">Add to home screen for quick access</p>
          </div>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-[#0F284B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0F1720]"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstall(false)}
            className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F5F5F4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

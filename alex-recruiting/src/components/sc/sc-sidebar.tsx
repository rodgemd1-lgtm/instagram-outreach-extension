"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: "Command", href: "/dashboard", icon: "dashboard" },
      { label: "Coaches", href: "/coaches", icon: "groups" },
      { label: "Outreach", href: "/outreach", icon: "campaign" },
      { label: "Content", href: "/content", icon: "edit_note" },
      { label: "Camps", href: "/camps", icon: "event" },
      { label: "Agency", href: "/agency", icon: "smart_toy" },
    ],
  },
];

interface UserInfo {
  name: string;
  role: string;
  avatarInitials: string;
}

interface SCSidebarProps {
  user?: UserInfo;
}

export function SCSidebar({ user }: SCSidebarProps) {
  const pathname = usePathname();

  const defaultUser: UserInfo = {
    name: "Commander",
    role: "Head of Operations",
    avatarInitials: "CR",
  };

  const currentUser = user ?? defaultUser;

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen bg-sc-surface border-r border-sc-border fixed left-0 top-0 z-40">
      {/* Logo area */}
      <div className="px-5 py-6 border-b border-sc-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sc-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-xl">
              sailing
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold uppercase tracking-wider text-sc-text leading-tight">
              Alex Recruiting
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-sc-primary leading-tight mt-0.5">
              Command Center
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <div className="px-3 pt-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sc-text-dim">
                  {section.title}
                </span>
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 relative
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface
                    ${
                      active
                        ? "text-sc-text border-l-[3px] border-sc-primary"
                        : "text-slate-400 border-l-[3px] border-transparent hover:bg-white/5 hover:text-white"
                    }
                  `}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(to right, rgba(197, 5, 12, 0.2), transparent)",
                        }
                      : undefined
                  }
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      active
                        ? "text-sc-primary"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-4 py-4 border-t border-sc-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-sc-primary/50 bg-sc-bg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sc-primary">
              {currentUser.avatarInitials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sc-text truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-sc-text-muted truncate">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

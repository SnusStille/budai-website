"use client";

import { ReactNode, useEffect, useState } from "react";
import { Users, BarChart3, Settings, LogOut, Terminal, Menu, X, KeyRound } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";

const NAV_ITEMS = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard" },
  { id: "waitlist", icon: Users, label: "Waitlist" },
  { id: "logs", icon: Terminal, label: "System Logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsHint, setSettingsHint] = useState(false);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => !!el
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const NavButton = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => (
    <button
      key={item.id}
      onClick={() => goTo(item.id)}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active === item.id
          ? "bg-accent-cyan/12 text-accent-cyan border border-accent-cyan/20"
          : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex">
        <aside className="w-64 min-h-screen border-r border-white/[0.08] bg-[#07070c] fixed left-0 top-0 hidden lg:flex flex-col">
          <div className="p-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <BudAILogo size="sm" animated={false} />
              <div>
                <div className="font-bold text-sm leading-tight">
                  Bud<span className="text-accent-cyan">AI</span>
                </div>
                <div className="text-[10px] text-muted font-mono">Control Center</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}

            <div className="relative pt-2">
              <button
                type="button"
                onClick={() => setSettingsHint((v) => !v)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted/60 hover:text-muted border border-transparent"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              {settingsHint && (
                <div className="mt-1 mx-1 text-[11px] text-muted leading-relaxed bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-accent-cyan shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/80 font-medium mb-1">Owner console</p>
                      <p className="text-muted/90">
                        Private to Stille (Stilledev). Key is never shown in the UI.
                      </p>
                      <p className="mt-1 text-muted/70 text-[10px]">
                        Rotate via env if needed — do not paste secrets here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="p-3 border-t border-white/[0.08]">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Exit Admin
            </a>
          </div>
        </aside>

        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/[0.08] bg-[#07070c]/95 backdrop-blur-xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <BudAILogo size="xs" animated={false} />
            <span className="font-bold text-sm">
              Bud<span className="text-accent-cyan">AI</span> Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 pt-14">
            <div
              className="absolute inset-0 bg-background/98 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="relative p-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavButton key={item.id} item={item} />
              ))}
              <a
                href="/"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Exit Admin
              </a>
            </nav>
          </div>
        )}

        <main className="flex-1 lg:ml-64 p-5 pt-20 lg:pt-8 lg:p-8 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { ReactNode, useEffect, useState } from "react";
import { Cpu, Users, BarChart3, Settings, LogOut, Terminal, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard" },
  { id: "waitlist", icon: Users, label: "Waitlist" },
  { id: "logs", icon: Terminal, label: "System Logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsHint, setSettingsHint] = useState(false);

  // Highlight the nav item for whichever section is currently in view,
  // instead of a hardcoded "Dashboard is always active" flag.
  useEffect(() => {
    const sections = NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);

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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
        active === item.id ? "bg-accent-cyan/10 text-accent-cyan" : "text-muted hover:text-white hover:bg-white/5"
      }`}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="w-64 min-h-screen glass-strong border-r border-white/[0.06] fixed left-0 top-0 hidden lg:flex flex-col">
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Bud<span className="text-accent-cyan">AI</span> Admin</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}

            <div className="relative">
              <button
                onClick={() => setSettingsHint(true)}
                onBlur={() => setSettingsHint(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted/50 cursor-default"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              {settingsHint && (
                <div className="absolute left-4 right-4 -bottom-1 translate-y-full text-[11px] text-muted/70 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 z-10">
                  Coming soon
                </div>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-white/[0.06]">
            <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" />
              Exit Admin
            </a>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/[0.06] flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Bud<span className="text-accent-cyan">AI</span> Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu sheet */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 pt-16">
            <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <nav className="relative p-4 space-y-1">
              {NAV_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted/40 cursor-not-allowed"
              >
                <Settings className="w-4 h-4" />
                Settings <span className="text-[10px] ml-auto">Coming soon</span>
              </button>
              <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="w-4 h-4" />
                Exit Admin
              </a>
            </nav>
          </div>
        )}

        <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-8 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

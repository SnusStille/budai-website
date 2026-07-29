import { ReactNode } from "react";
import { Cpu, Users, BarChart3, Settings, LogOut, Terminal } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex">
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
            {[
              { icon: BarChart3, label: "Dashboard", active: true },
              { icon: Users, label: "Waitlist", active: false },
              { icon: Terminal, label: "System Logs", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  item.active ? "bg-accent-cyan/10 text-accent-cyan" : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/[0.06]">
            <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" />
              Exit Admin
            </a>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

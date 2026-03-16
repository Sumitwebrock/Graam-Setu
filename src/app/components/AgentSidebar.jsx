import { NavLink } from "react-router";
import { Users, LayoutDashboard, FileText, PiggyBank, ShieldAlert, Scale } from "lucide-react";

export default function AgentSidebar() {
  const navItems = [
    { to: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/agent/dashboard#users", label: "Users", icon: Users },
    { to: "/agent/dashboard#agent-schemes", label: "Schemes", icon: FileText },
    { to: "/agent/dashboard#agent-savings", label: "Savings", icon: PiggyBank },
    { to: "/agent/dashboard#agent-fraud", label: "Fraud", icon: ShieldAlert },
    { to: "/agent/dashboard#agent-legal", label: "Legal", icon: Scale },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col bg-[#2c2416] text-white w-64 shrink-0 border-r border-black/10">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="text-xs uppercase tracking-wide text-white/60 mb-1">BC Agent</div>
        <div className="flex items-center gap-3">
          <img
            src="/graamsetu-logo.png"
            alt="GraamSetu logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="text-lg font-semibold">GraamSetu Panel</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors hover:bg-white/10 ${
                  isActive ? "bg-white/10 text-white" : "text-white/80"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-4 text-xs text-white/60 border-t border-white/10">
        Field view for laptops & tablets
      </div>
    </aside>
  );
}

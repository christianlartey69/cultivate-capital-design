import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Tractor, 
  Package, 
  Video, 
  Calendar,
  Wallet,
  Bell,
  Settings,
  BarChart3,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/farmers", icon: Tractor, label: "Farmers" },
  { to: "/admin/packages", icon: Package, label: "Packages" },
  { to: "/admin/assets", icon: Shield, label: "Assets" },
  { to: "/admin/media", icon: Video, label: "Media" },
  { to: "/admin/visits", icon: Calendar, label: "Farm Visits" },
  { to: "/admin/withdrawals", icon: Wallet, label: "Withdrawals" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Admin Panel
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

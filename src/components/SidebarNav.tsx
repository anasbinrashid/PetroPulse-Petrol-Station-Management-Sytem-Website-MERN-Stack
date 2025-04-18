
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  GaugeCircle,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Wrench,
  Settings,
  CreditCard,
  FileText,
  LucideIcon
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  submenu?: { title: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    submenu: [
      { title: "Fuel Stock", href: "/inventory/fuel" },
      { title: "Products", href: "/inventory/products" },
    ],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    submenu: [
      { title: "Transactions", href: "/sales/transactions" },
      { title: "Reports", href: "/sales/reports" },
    ],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: UserCircle,
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: CreditCard,
    submenu: [
      { title: "Expenses", href: "/finance/expenses" },
      { title: "Revenue", href: "/finance/revenue" },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <GaugeCircle size={24} className="text-primary" />
        <span className="text-xl font-bold">PetroPulse</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <div key={item.title} className="flex flex-col">
              {item.submenu ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 hover:bg-accent",
                    location.pathname.startsWith(item.href) &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => toggleSubmenu(item.title)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openMenus[item.title] && "rotate-90"
                    )}
                  />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full justify-start gap-3 px-3 py-2",
                    location.pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </Button>
              )}
              {item.submenu && openMenus[item.title] && (
                <div className="ml-8 grid gap-1 pt-1">
                  {item.submenu.map((subItem) => (
                    <Button
                      key={subItem.title}
                      variant="ghost"
                      className={cn(
                        "flex w-full justify-start gap-3 px-3 py-2 text-sm",
                        location.pathname === subItem.href &&
                          "bg-accent text-accent-foreground"
                      )}
                      asChild
                    >
                      <Link to={subItem.href}>{subItem.title}</Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

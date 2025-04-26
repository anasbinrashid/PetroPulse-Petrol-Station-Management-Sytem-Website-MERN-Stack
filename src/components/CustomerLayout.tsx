import { ReactNode, useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { GaugeCircle, Home, User, FileText, Fuel, CreditCard, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "flex w-full justify-start gap-3 px-3 py-2",
          isActive && "bg-accent text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </Button>
    </Link>
  );
}

export function CustomerLayout() {
  const [customerName, setCustomerName] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    // Check if the user is authenticated as a customer
    const checkAuth = () => {
      const storedUserType = localStorage.getItem("userType");
      const storedName = localStorage.getItem("userName");
      
      if (storedUserType !== "customer") {
        navigate("/auth/login");
      } else if (storedName) {
        setCustomerName(storedName);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("customerId");
    toast.success("You have been logged out");
    navigate("/auth/login");
  };

  if (userType !== "customer") {
    return <Navigate to="/auth/login" />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Navigation menu items
  const navItems = [
    { href: "/customer/dashboard", icon: Home, title: "Dashboard" },
    { href: "/customer/profile", icon: User, title: "My Profile" },
    { href: "/customer/fuel-purchases", icon: Fuel, title: "Fuel Purchases" },
    { href: "/customer/invoices", icon: FileText, title: "Invoices" },
    { href: "/customer/payment-methods", icon: CreditCard, title: "Payment Methods" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-full w-full flex-col gap-2">
          <div className="flex items-center gap-2 p-4">
            <img src="/logo.png" alt="PetroPulse Logo" className="h-6" />
            <span className="text-xl font-bold">PetroPulse</span>
          </div>
          
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={location.pathname === item.href}
                />
              ))}
            </nav>
          </div>

          <div className="border-t p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex w-full flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full w-full flex-col gap-2">
                <div className="flex items-center gap-2 p-4">
                  <img src="/logo.png" alt="PetroPulse Logo" className="h-6" />
                  <span className="text-xl font-bold">PetroPulse</span>
                </div>
                
                <nav className="grid gap-1 px-2">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      isActive={location.pathname === item.href}
                    />
                  ))}
                </nav>
                
                <div className="mt-auto border-t p-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-medium md:hidden">PetroPulse</h1>
          
          <div className="flex items-center gap-4 md:ml-auto">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{customerName ? getInitials(customerName) : "CU"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{customerName || "Customer"}</div>
                <div className="text-xs text-muted-foreground">Customer</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

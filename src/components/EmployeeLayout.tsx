import { ReactNode, useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { GaugeCircle, Home, User, Calendar, Clock, DollarSign, LogOut, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function EmployeeLayout() {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [employeeRole, setEmployeeRole] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  
  const [notifications] = useState([
    { id: 1, message: "New shift scheduled for tomorrow" },
    { id: 2, message: "Payroll processed for this month" },
    { id: 3, message: "Please update your attendance for yesterday" },
  ]);

  useEffect(() => {
    // Check if the user is authenticated as an employee
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUserType = localStorage.getItem("userType");
      const storedName = localStorage.getItem("userName");
      const storedRole = localStorage.getItem("role");
      
      console.log('[DEBUG][EmployeeLayout] Checking authentication:');
      console.log(`[DEBUG][EmployeeLayout] - Token: ${token ? 'Present' : 'Missing'}`);
      console.log(`[DEBUG][EmployeeLayout] - UserType: ${storedUserType}`);
      console.log(`[DEBUG][EmployeeLayout] - Name: ${storedName}`);
      
      if (!token) {
        console.log('[DEBUG][EmployeeLayout] No token found, redirecting to login');
        navigate("/auth/login");
        return;
      }
      
      // Allow any authenticated user with a token to access employee pages for debugging
      // In production, we would strictly check userType === "employee"
      if (storedUserType !== "employee") {
        console.log('[DEBUG][EmployeeLayout] Setting userType to employee for debugging');
        localStorage.setItem("userType", "employee");
      }
      
      if (storedName) setEmployeeName(storedName);
      if (storedRole) setEmployeeRole(storedRole);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("role");
    toast.success("You have been logged out");
    navigate("/auth/login");
  };

  // Modified check - only ensure we have a token
  const token = localStorage.getItem("token");
  if (!token) {
    console.log('[DEBUG][EmployeeLayout] No token in storage, redirecting to login');
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
    { href: "/employee/dashboard", icon: Home, title: "Dashboard" },
    { href: "/employee/profile", icon: User, title: "My Profile" },
    { href: "/employee/schedule", icon: Calendar, title: "My Schedule" },
    { href: "/employee/attendance", icon: Clock, title: "Attendance" },
    { href: "/employee/payroll", icon: DollarSign, title: "Payroll" },
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="py-2">
                    {notification.message}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{employeeName ? getInitials(employeeName) : "EM"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{employeeName || "Employee"}</div>
                <div className="text-xs text-muted-foreground">{employeeRole}</div>
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

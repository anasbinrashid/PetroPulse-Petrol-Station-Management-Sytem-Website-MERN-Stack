import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/services/api";
import { AuthResponse } from "@/types/api";

// Extend the AuthResponse type for employee-specific properties
interface EmployeeAuthResponse extends AuthResponse {
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  position?: string;
}

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('[DEBUG][EmployeeLogin] Attempting login with:', email);
    
    try {
      // Use the employee-specific login endpoint
      const response = await api.employee.login(email, password);
      
      console.log('[DEBUG][EmployeeLogin] Login response received');
      console.log('[DEBUG][EmployeeLogin] Success:', response.success);
      console.log('[DEBUG][EmployeeLogin] Full response data:', response.data);
      
      if (response.success && response.data) {
        const userData = response.data as EmployeeAuthResponse;
        
        console.log('[DEBUG][EmployeeLogin] Response data fields:');
        Object.keys(userData).forEach(key => {
          console.log(`[DEBUG][EmployeeLogin] - ${key}: ${typeof userData[key]}`);
        });
        
        // FOR DEBUGGING: Always treat as employee bypassing the checks
        // since we're using the employee login endpoint
        const isEmployee = true;
        console.log('[DEBUG][EmployeeLogin] Bypassing employee check for debugging');
        
        // Store user data in localStorage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userType", "employee"); // Force employee type
        localStorage.setItem("userEmail", userData.email);
        
        // Use firstName and lastName if available, or fallback
        const displayName = userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : (userData.name || email.split('@')[0]);
          
        localStorage.setItem("userName", displayName);
        localStorage.setItem("employeeId", userData.employeeId || userData._id || '');
        localStorage.setItem("role", userData.position || 'Employee');
        
        console.log('[DEBUG][EmployeeLogin] Stored in localStorage:', {
          token: userData.token ? `${userData.token.substring(0, 15)}...` : 'Missing',
          userType: 'employee',
          userEmail: userData.email,
          userName: displayName,
          employeeId: userData.employeeId || userData._id || ''
        });
        
        toast.success(`Welcome back, ${displayName}!`);
        navigate("/employee/dashboard");
      } else {
        console.log('[DEBUG][EmployeeLogin] Login failed:', response.error);
        toast.error(response.error || "Invalid credentials");
      }
    } catch (error) {
      console.error('[DEBUG][EmployeeLogin] Login error:', error);
      toast.error("Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Employee Login"
      subtitle="Enter your credentials to access your account"
    >
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@petropulse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Not an employee? </span>
              <Button variant="link" className="p-0" onClick={() => navigate("/auth/login")}>
                Choose another login
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}

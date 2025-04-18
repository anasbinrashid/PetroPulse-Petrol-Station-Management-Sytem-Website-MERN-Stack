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

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data as AuthResponse;
        
        // Check if user is admin
        if (userData.userType !== 'admin') {
          toast.error("Access denied. Please use the admin account.");
          setIsLoading(false);
          return;
        }
        
        // Store user data in localStorage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userType", "admin"); // Ensure userType is set as 'admin'
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userName", userData.name);
        if (userData.profile) {
          localStorage.setItem("userProfile", JSON.stringify(userData.profile));
        }
        
        toast.success(`Welcome back, ${userData.name}!`);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Login"
      subtitle="Enter your credentials to access admin dashboard"
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
                  placeholder="admin@petropulse.com"
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
              <span className="text-muted-foreground">Not an admin? </span>
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

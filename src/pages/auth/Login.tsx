
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserCircle, Users, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome to PetroPulse"
      subtitle="Choose how you want to sign in"
    >
      <Card>
        <CardContent className="pt-6 grid gap-4">
          <Button 
            variant="outline" 
            className="h-14 justify-start p-4" 
            onClick={() => navigate("/auth/admin")}
          >
            <ShieldCheck className="mr-4 h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="font-medium">Admin</div>
              <div className="text-xs text-muted-foreground">
                Access the station management dashboard
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-14 justify-start p-4" 
            onClick={() => navigate("/auth/employee")}
          >
            <UserCircle className="mr-4 h-5 w-5 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Employee</div>
              <div className="text-xs text-muted-foreground">
                Access your employee portal
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-14 justify-start p-4" 
            onClick={() => navigate("/auth/customer")}
          >
            <Users className="mr-4 h-5 w-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Customer</div>
              <div className="text-xs text-muted-foreground">
                Access your customer account
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

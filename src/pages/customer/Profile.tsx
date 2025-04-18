import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Edit2, Key, MapPin, Phone, Save, User, UserCircle, Activity, Shield } from "lucide-react";
import { format } from "date-fns";

// Interface for customer profile data
interface CustomerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  loyaltyPoints: number;
  vehicle?: string;
  address?: string;
  lastVisit?: string;
  memberSince: string;
  customerType: string;
  membershipLevel: string;
  totalSpent: number;
}

// Interface for profile form data
interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  vehicle: string;
  address: string;
}

// Interface for password form data
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function CustomerProfile() {
  // State for profile data
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    vehicle: "",
    address: ""
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      try {
        const response = await api.customer.getProfile();
        
        if (response.success && response.data) {
          setProfile(response.data);
          
          // Initialize form data with profile values
          setProfileForm({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            phone: response.data.phone || "",
            vehicle: response.data.vehicle || "",
            address: response.data.address || ""
          });
        } else {
          console.error("Failed to fetch profile:", response.error);
          toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    
    try {
      const response = await api.customer.updateProfile(profileForm);
      
      if (response.success) {
        toast.success("Profile updated successfully");
        setProfile(prev => prev ? { ...prev, ...profileForm } : null);
        setEditing(false);
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setUpdatingPassword(true);
    
    try {
      const response = await api.customer.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (response.success) {
        toast.success("Password updated successfully");
        // Reset password form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(response.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Get membership level color
  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'platinum': return "bg-slate-400 hover:bg-slate-400";
      case 'gold': return "bg-amber-500 hover:bg-amber-500";
      case 'silver': return "bg-gray-400 hover:bg-gray-400";
      default: return "bg-emerald-600 hover:bg-emerald-600";
    }
  };

  // Get customer status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return "bg-purple-600 hover:bg-purple-600";
      case 'regular': return "bg-blue-600 hover:bg-blue-600";
      default: return "bg-green-600 hover:bg-green-600";
    }
  };

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Profile Overview</CardTitle>
                {!editing && (
                  <Button 
                    onClick={() => setEditing(true)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!editing ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <UserCircle className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-xl font-medium">{profile?.firstName} {profile?.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Status: </span>
                      <Badge className={`ml-2 ${profile?.status ? getStatusColor(profile.status) : ""}`}>
                        {profile?.status || "N/A"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Membership: </span>
                      <Badge className={`ml-2 ${profile?.membershipLevel ? getMembershipColor(profile.membershipLevel) : ""}`}>
                        {profile?.membershipLevel || "N/A"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Loyalty Points: </span>
                      <span className="ml-2 font-medium">{profile?.loyaltyPoints || 0} points</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Member Since: </span>
                      <span className="ml-2">{formatDate(profile?.memberSince)}</span>
                    </div>
                    
                    {profile?.lastVisit && (
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Last Visit: </span>
                        <span className="ml-2">{formatDate(profile.lastVisit)}</span>
                      </div>
                    )}
                    
                    {profile?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Phone: </span>
                        <span className="ml-2">{profile.phone}</span>
                      </div>
                    )}
                    
                    {profile?.vehicle && (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Vehicle: </span>
                        <span className="ml-2">{profile.vehicle}</span>
                      </div>
                    )}
                    
                    {profile?.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div>
                          <span className="text-sm">Address: </span>
                          <span className="ml-2 block">{profile.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={profileForm.firstName}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={profileForm.lastName}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle</Label>
                      <Input
                        id="vehicle"
                        name="vehicle"
                        value={profileForm.vehicle}
                        onChange={handleProfileChange}
                        placeholder="Enter your vehicle details"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        placeholder="Enter your address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" disabled={updatingProfile}>
                        {updatingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          // Reset form values to current profile
                          if (profile) {
                            setProfileForm({
                              firstName: profile.firstName || "",
                              lastName: profile.lastName || "",
                              phone: profile.phone || "",
                              vehicle: profile.vehicle || "",
                              address: profile.address || ""
                            });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 mt-4">
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to ensure your account remains secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={updatingPassword}>
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Use a strong, unique password that you don't use elsewhere</li>
                <li>Include a mix of letters, numbers, and special characters</li>
                <li>Avoid using easily guessable information like birthdays</li>
                <li>Consider using a password manager for better security</li>
                <li>Change your password regularly for enhanced protection</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
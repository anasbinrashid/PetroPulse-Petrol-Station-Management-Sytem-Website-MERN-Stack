import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Briefcase, Building, MapPin, Calendar, Clock, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { api } from "@/services/api";

interface EmployeeProfile {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  department: string;
  position: string;
  avatar?: string;
  dateOfBirth: string;
  dateOfHire: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankInfo?: {
    accountNumber: string;
    routingNumber: string;
    accountType: string;
  };
}

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  
  // For form editing
  const [editedProfile, setEditedProfile] = useState<Partial<EmployeeProfile>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Profile state updated:', JSON.stringify(profile, null, 2));
  }, [profile]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      console.log('[DEBUG][Profile] Fetching profile with token:', token ? 'Present' : 'Missing');
      console.log('[DEBUG][Profile] User email from localStorage:', email);
      
      if (!token) {
        console.log('[DEBUG][Profile] Authentication token missing');
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      if (!email) {
        console.log('[DEBUG][Profile] User email missing');
        toast.error('User information missing. Please log in again.');
        return;
      }
      
      console.log('[DEBUG][Profile] Making API request to /api/employee/profile using employee-specific endpoint');
      const response = await api.employee.getProfile();
      
      console.log('[DEBUG][Profile] API response status:', response.success ? 'Success' : 'Failed');
      console.log('[DEBUG][Profile] API response data:', JSON.stringify(response.data));
      
      if (response.success && response.data.profile) {
        console.log('[DEBUG][Profile] Profile data found in response');
        setProfile(response.data.profile);
        // Initialize the edited profile with the fetched data
        setEditedProfile(response.data.profile);
      } else if (response.success && response.data.mainInfo && !response.data.profile) {
        console.log('[DEBUG][Profile] mainInfo found but profile missing');
        console.log('[DEBUG][Profile] mainInfo:', JSON.stringify(response.data.mainInfo));
        toast.warning('Your profile information is incomplete. Please contact support.');
      } else {
        console.log('[DEBUG][Profile] No profile data found in response');
        toast.error('Profile data not available');
      }
    } catch (error: any) {
      console.error('[DEBUG][Profile] Error fetching employee profile:', error);
      console.error('[DEBUG][Profile] Error details:', error.response ? JSON.stringify(error.response.data) : 'No response data');
      
      if (error.response && error.response.status === 401) {
        console.log('[DEBUG][Profile] 401 Unauthorized error');
        toast.error('Session expired. Please log in again.');
      } else {
        console.log('[DEBUG][Profile] Other API error:', error.message);
        toast.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Create a new copy of the profile to modify
      const newProfile = { ...editedProfile };
      
      // Handle emergencyContact updates
      if (parent === 'emergencyContact' && newProfile.emergencyContact) {
        newProfile.emergencyContact = {
          ...newProfile.emergencyContact,
          [child]: value
        };
      } 
      // Handle bankInfo updates
      else if (parent === 'bankInfo' && newProfile.bankInfo) {
        newProfile.bankInfo = {
          ...newProfile.bankInfo,
          [child]: value
        };
      }
      
      setEditedProfile(newProfile);
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      console.log('[DEBUG] Starting profile update process');
      setUpdating(true);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[DEBUG] Missing authentication token');
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      console.log('[DEBUG] Sending PUT request to /api/employee/profile with data:', JSON.stringify(editedProfile, null, 2));
      const response = await axios.put('/api/employee/profile', editedProfile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('[DEBUG] Response from /api/employee/profile:', JSON.stringify(response.data, null, 2));
      if (response.data.success || response.data.profile) {
        console.log('[DEBUG] Profile updated successfully');
        toast.success('Profile updated successfully');
        setProfile({ ...response.data.profile }); // Replace with a new object to trigger re-render
        setEditedProfile({ ...response.data.profile }); // Sync editedProfile with the updated profile
        setIsEditing(false);

        // Update localStorage with the new name
        if (response.data.profile.firstName && response.data.profile.lastName) {
          const updatedName = `${response.data.profile.firstName} ${response.data.profile.lastName}`;
          localStorage.setItem('userName', updatedName);
          console.log('[DEBUG] Updated localStorage userName:', updatedName);
        }
      } else {
        console.log('[DEBUG] Profile update failed with message:', response.data.message);
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('[DEBUG] Error updating profile:', error);
      if (error.response && error.response.status === 401) {
        console.log('[DEBUG] Unauthorized error during profile update');
        toast.error('Session expired. Please log in again.');
      } else {
        console.log('[DEBUG] Other error during profile update:', error.message);
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      console.log('[DEBUG] Profile update process completed');
      setUpdating(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setUpdating(true);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      const response = await axios.put('/api/employee/update-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <p className="text-muted-foreground">Profile data not available</p>
          <Button className="mt-4" onClick={fetchEmployeeProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditedProfile(profile);
            }}>Cancel</Button>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updating}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile.avatar || ""} />
              <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-muted-foreground">{profile.position}</p>
            <p className="text-sm text-muted-foreground">{profile.department}</p>
            
            <Separator className="my-4" />
            
            <div className="w-full space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.address}, {profile.city}, {profile.state} {profile.zipCode}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Joined: {new Date(profile.dateOfHire).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 md:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              <TabsTrigger value="bank">Bank Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        value={isEditing ? editedProfile.firstName : profile.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        value={isEditing ? editedProfile.lastName : profile.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        value={isEditing ? editedProfile.email : profile.email}
                        onChange={handleInputChange}
                        disabled={true} // Email shouldn't be editable
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={isEditing ? editedProfile.phone : profile.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        name="dateOfBirth"
                        type="date"
                        value={isEditing ? 
                          editedProfile.dateOfBirth?.split('T')[0] : 
                          profile.dateOfBirth?.split('T')[0]}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input 
                        id="department" 
                        name="department"
                        value={isEditing ? editedProfile.department : profile.department}
                        onChange={handleInputChange}
                        disabled={true} // Department shouldn't be editable by employee
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position" 
                        name="position"
                        value={isEditing ? editedProfile.position : profile.position}
                        onChange={handleInputChange}
                        disabled={true} // Position shouldn't be editable by employee
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfHire">Date of Hire</Label>
                      <Input 
                        id="dateOfHire" 
                        name="dateOfHire"
                        type="date"
                        value={isEditing ? 
                          editedProfile.dateOfHire?.split('T')[0] : 
                          profile.dateOfHire?.split('T')[0]}
                        onChange={handleInputChange}
                        disabled={true} // Hire date shouldn't be editable by employee
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={isEditing ? editedProfile.address : profile.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={isEditing ? editedProfile.city : profile.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state"
                        value={isEditing ? editedProfile.state : profile.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode"
                        value={isEditing ? editedProfile.zipCode : profile.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="emergency" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Person to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency.name">Contact Name</Label>
                      <Input 
                        id="emergency.name" 
                        name="emergencyContact.name"
                        value={isEditing ? editedProfile.emergencyContact?.name : profile.emergencyContact?.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency.relationship">Relationship</Label>
                      <Input 
                        id="emergency.relationship" 
                        name="emergencyContact.relationship"
                        value={isEditing ? editedProfile.emergencyContact?.relationship : profile.emergencyContact?.relationship}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency.phone">Phone</Label>
                      <Input 
                        id="emergency.phone" 
                        name="emergencyContact.phone"
                        value={isEditing ? editedProfile.emergencyContact?.phone : profile.emergencyContact?.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bank" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Information</CardTitle>
                  <CardDescription>Your banking details for direct deposit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank.accountType">Account Type</Label>
                      <Input 
                        id="bank.accountType" 
                        name="bankInfo.accountType"
                        value={isEditing ? editedProfile.bankInfo?.accountType : profile.bankInfo?.accountType}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bank.accountNumber">Account Number</Label>
                      <Input 
                        id="bank.accountNumber" 
                        name="bankInfo.accountNumber"
                        value={isEditing ? editedProfile.bankInfo?.accountNumber : profile.bankInfo?.accountNumber?.replace(/\d(?=\d{4})/g, "*")}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bank.routingNumber">Routing Number</Label>
                      <Input 
                        id="bank.routingNumber" 
                        name="bankInfo.routingNumber"
                        value={isEditing ? editedProfile.bankInfo?.routingNumber : profile.bankInfo?.routingNumber?.replace(/\d(?=\d{4})/g, "*")}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: For security reasons, your full account and routing numbers are not displayed.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="mt-2" 
                    onClick={handleChangePassword}
                    disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
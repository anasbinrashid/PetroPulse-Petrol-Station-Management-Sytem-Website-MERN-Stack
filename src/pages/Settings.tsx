import { useState } from "react";
import { Check, Save, User, Building, Bell, Shield, CreditCard, MapPin, CircleHelp, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <CircleHelp className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="hidden sm:flex"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how it appears on your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">JS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                
                <div className="grid flex-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" defaultValue="Smith" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.smith@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us a little about yourself..."
                  defaultValue="Station manager with 5 years of experience in the fuel retail industry."
                />
              </div>
              
              <Separator />
              
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and updates.
                    </p>
                  </div>
                  <Switch id="marketing" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="usage-data">Usage Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymous usage data to help us improve our product.
                    </p>
                  </div>
                  <Switch id="usage-data" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage details about your gas station business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue="PetroPulse Gas Station" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID / EIN</Label>
                    <Input id="tax-id" defaultValue="12-3456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Business Phone</Label>
                    <Input id="business-phone" defaultValue="(555) 987-6543" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input id="business-email" type="email" defaultValue="info@petropulse.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-website">Website</Label>
                  <Input id="business-website" type="url" defaultValue="https://petropulse.com" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" defaultValue="123 Fuel Lane" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue="Gastonville" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" defaultValue="California" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" defaultValue="95123" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" defaultValue="United States" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Hours</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekday-hours">Weekday Hours</Label>
                    <Input id="weekday-hours" defaultValue="6:00 AM - 10:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekend-hours">Weekend Hours</Label>
                    <Input id="weekend-hours" defaultValue="7:00 AM - 9:00 PM" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="holiday-hours" />
                  <Label htmlFor="holiday-hours" className="text-sm">Special hours for holidays</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when inventory levels are low.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for scheduled maintenance tasks.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Financial Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new financial reports are available.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Methods</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via text message.
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your devices.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Schedule</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-time">Preferred Time for Daily Digest</Label>
                  <Select defaultValue="morning">
                    <SelectTrigger id="notification-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    We'll send your daily summary at this time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <div>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <p className="font-medium">Two-factor authentication is enabled</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Your account is currently protected with authenticator app.
                  </p>
                  <div className="pl-7 pt-2">
                    <Button variant="outline" size="sm">Configure 2FA</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Login Sessions</h3>
                
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Windows • Chrome • San Francisco, CA
                        </p>
                      </div>
                      <Badge>Active Now</Badge>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Previous Session</p>
                        <p className="text-sm text-muted-foreground">
                          MacOS • Safari • San Francisco, CA
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Revoke
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Sign Out of All Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your billing information and subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium text-lg">Premium Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews on August 1, 2023
                  </p>
                </div>
                <Badge variant="outline" className="text-primary">Active</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Method</h3>
                
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 04/24</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                
                <Button variant="outline" size="sm">
                  Add Payment Method
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing History</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <p className="font-medium">Premium Plan - July 2023</p>
                      <p className="text-sm text-muted-foreground">Jul 1, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$49.99</p>
                      <Button variant="link" size="sm" className="p-0 h-auto">Download</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <p className="font-medium">Premium Plan - June 2023</p>
                      <p className="text-sm text-muted-foreground">Jun 1, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$49.99</p>
                      <Button variant="link" size="sm" className="p-0 h-auto">Download</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-0.5">
                      <p className="font-medium">Premium Plan - May 2023</p>
                      <p className="text-sm text-muted-foreground">May 1, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$49.99</p>
                      <Button variant="link" size="sm" className="p-0 h-auto">Download</Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage your gas station locations and their settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Your Locations</h3>
                <Button variant="outline" size="sm">
                  Add New Location
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">Main Station - Downtown</p>
                    <p className="text-sm text-muted-foreground">
                      123 Fuel Lane, Gastonville, CA 95123
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">Northside Location</p>
                    <p className="text-sm text-muted-foreground">
                      456 Gas Avenue, Northville, CA 95145
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>
                Configure default settings for all locations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Time Zone Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Time Zone</Label>
                  <Select defaultValue="america-los_angeles">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-los_angeles">Pacific Time (US & Canada)</SelectItem>
                      <SelectItem value="america-denver">Mountain Time (US & Canada)</SelectItem>
                      <SelectItem value="america-chicago">Central Time (US & Canada)</SelectItem>
                      <SelectItem value="america-new_york">Eastern Time (US & Canada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location Display</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show All Locations in Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Include data from all locations in summary reports.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Centralized Inventory Management</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage inventory across all locations from a single dashboard.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Get help with using the PetroPulse management system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="text-lg font-medium">24/7 Customer Support</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Our support team is available around the clock to help you with any issues.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button>Contact Support</Button>
                    <Button variant="outline">View Knowledge Base</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      support@petropulse.com
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Phone Support</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      (800) 555-1234
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                
                <div className="space-y-3">
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="px-4">How do I add a new employee to the system?</AccordionTrigger>
                        <AccordionContent className="px-4">
                          Navigate to the Employees page and click the "Add New Employee" button. Fill out the required information and click "Save" to create a new employee profile.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="px-4">How do I update fuel prices?</AccordionTrigger>
                        <AccordionContent className="px-4">
                          Go to the Inventory page, select the "Fuel Inventory" tab, and click the "Edit" button next to the fuel type you want to update. Enter the new price and save your changes.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="px-4">How do I generate a custom report?</AccordionTrigger>
                        <AccordionContent className="px-4">
                          Navigate to the Reports page and click "Create New Report." Select the metrics and date range you want to include, then click "Generate Report."
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Training Resources</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 rounded-lg border p-4">
                    <div className="font-medium">Getting Started Guide</div>
                    <p className="text-sm text-muted-foreground">
                      Learn the basics of using the PetroPulse system.
                    </p>
                    <Button variant="link" className="justify-start px-0">View Guide</Button>
                  </div>
                  
                  <div className="flex flex-col gap-2 rounded-lg border p-4">
                    <div className="font-medium">Video Tutorials</div>
                    <p className="text-sm text-muted-foreground">
                      Watch step-by-step video guides for common tasks.
                    </p>
                    <Button variant="link" className="justify-start px-0">View Videos</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:hidden">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

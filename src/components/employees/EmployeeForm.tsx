import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Employee } from "@/types/employee";

// Props for the form component
interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

// Status options
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

// Department options
const DEPARTMENT_OPTIONS = [
  { value: "management", label: "Management" },
  { value: "cashier", label: "Cashier" },
  { value: "fuel_attendant", label: "Fuel Attendant" },
  { value: "maintenance", label: "Maintenance" },
  { value: "stock", label: "Stock" },
  { value: "security", label: "Security" },
  { value: "admin", label: "Admin" },
  { value: "other", label: "Other" },
];

// Permissions options
const PERMISSION_OPTIONS = [
  { value: "view_reports", label: "View Reports" },
  { value: "edit_inventory", label: "Edit Inventory" },
  { value: "process_sales", label: "Process Sales" },
  { value: "manage_employees", label: "Manage Employees" },
  { value: "admin_panel", label: "Admin Panel" },
];

// Employee form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  phone: z.string().min(5, { message: "Phone number is required." }),
  position: z.string().min(2, { message: "Position is required." }),
  department: z.string({ required_error: "Department is required." }),
  employeeId: z.string().optional(),
  hireDate: z.date().optional(),
  salary: z.coerce.number().min(0, { message: "Salary must be a positive number." }),
  status: z.string(),
  
  // Emergency contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Bank details
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  routingNumber: z.string().optional(),
  
  notes: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!employee;
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    employee?.permissions || []
  );

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      password: "",
      phone: employee?.phone || "",
      position: employee?.position || "",
      department: employee?.department || "other",
      employeeId: employee?.employeeId || "",
      hireDate: employee?.hireDate ? new Date(employee.hireDate) : new Date(),
      salary: employee?.salary || 0,
      status: employee?.status || "active",
      
      // Emergency contact
      emergencyContactName: employee?.emergencyContact?.name || "",
      emergencyContactRelationship: employee?.emergencyContact?.relationship || "",
      emergencyContactPhone: employee?.emergencyContact?.phone || "",
      
      // Address
      street: employee?.address?.street || "",
      city: employee?.address?.city || "",
      state: employee?.address?.state || "",
      zipCode: employee?.address?.zipCode || "",
      country: employee?.address?.country || "United States",
      
      // Bank details
      accountName: employee?.bankDetails?.accountName || "",
      accountNumber: employee?.bankDetails?.accountNumber || "",
      bankName: employee?.bankDetails?.bankName || "",
      routingNumber: employee?.bankDetails?.routingNumber || "",
      
      notes: employee?.notes || "",
      permissions: employee?.permissions || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Format data for API - structure data according to backend model
      const formattedData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        position: values.position,
        department: values.department,
        employeeId: values.employeeId,
        mainEmployeeId: values.employeeId,
        hireDate: values.hireDate,
        salary: values.salary,
        status: values.status,
        
        // Nested objects
        emergencyContact: {
          name: values.emergencyContactName,
          relationship: values.emergencyContactRelationship,
          phone: values.emergencyContactPhone,
        },
        
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country || "United States",
        },
        
        bankDetails: {
          accountName: values.accountName,
          accountNumber: values.accountNumber,
          bankName: values.bankName,
          routingNumber: values.routingNumber,
        },
        
        notes: values.notes,
        permissions: selectedPermissions,
      };
      
      console.log('Submitting employee data:', formattedData);
      let response;
      
      if (isEditing && employee?._id) {
        // Update existing employee - remove password if not provided
        if (!formattedData.password) {
          delete formattedData.password;
        }
        response = await api.employeeDb.update(employee._id, formattedData);
      } else {
        // Create new employee - password is required
        if (!formattedData.password) {
          toast({
            title: "Error",
            description: "Password is required for new employees",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        response = await api.employeeDb.create(formattedData);
      }
      
      if (response.success) {
        toast({
          title: isEditing ? "Employee updated successfully" : "Employee created successfully",
          description: isEditing 
            ? "The employee information has been updated." 
            : "New employee has been added to the system.",
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save employee",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle permission toggles
  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {/* First Name and Last Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {/* Email and Phone */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone*</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password field - only show when creating new employee */}
        {!isEditing && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password*</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Set account password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {/* Position, Department and Status */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position*</FormLabel>
                <FormControl>
                  <Input placeholder="Job position" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {/* Employee ID and Hire Date */}
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormDescription>Leave blank for auto-generated ID</FormDescription>
                <FormControl>
                  <Input placeholder="Employee ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hire Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Salary */}
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary*</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Emergency Contact Section */}
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-lg font-medium">Emergency Contact</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Relationship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-lg font-medium">Address</h3>
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-lg font-medium">Bank Details</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Routing number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Permissions Section */}
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-lg font-medium">Permissions</h3>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {PERMISSION_OPTIONS.map(permission => (
              <div key={permission.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={permission.value}
                  checked={selectedPermissions.includes(permission.value)}
                  onChange={() => togglePermission(permission.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={permission.value} className="text-sm">
                  {permission.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
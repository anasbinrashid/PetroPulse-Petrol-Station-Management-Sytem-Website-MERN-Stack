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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Customer } from "@/types/customer";

// Props for the form component
interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

// Status options
const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "regular", label: "Regular" },
  { value: "premium", label: "Premium" },
];

// Customer type options
const CUSTOMER_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

// Membership level options
const MEMBERSHIP_LEVEL_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

// Customer form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  status: z.enum(["new", "regular", "premium"]),
  loyaltyPoints: z.coerce.number().min(0).optional(),
  vehicle: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  customerType: z.enum(["individual", "business"]).optional(),
  membershipLevel: z.enum(["basic", "silver", "gold", "platinum"]).optional(),
});

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!customer;

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      password: "",
      status: customer?.status || "new",
      loyaltyPoints: customer?.loyaltyPoints || 0,
      vehicle: customer?.vehicle || "",
      address: customer?.address || "",
      notes: customer?.notes || "",
      customerType: customer?.customerType || "individual",
      membershipLevel: customer?.membershipLevel || "basic",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Format data for API - convert form fields to match backend expectations
      const formattedData = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email || '', // Required by backend
        phone: values.phone || '',
        address: values.address || '',
        status: values.status,
        // Backend expects these formatted exactly right
        vehicles: [{
          make: "Unknown",
          model: values.vehicle || "Not provided",
          year: new Date().getFullYear(),
          licensePlate: ""
        }],
        // Backend requires this array
        paymentMethods: [{
          type: "none",
          lastFour: "",
          isDefault: true
        }]
      };
      
      // Only include password for new customers
      if (!isEditing) {
        formattedData['password'] = values.password;
      }
      
      console.log('Submitting customer data:', formattedData);
      let response;
      
      if (isEditing && customer?._id) {
        // Update existing customer
        response = await api.customers.update(customer._id, formattedData);
      } else {
        // Create new customer - must include password
        if (!values.password) {
          toast({
            title: "Error",
            description: "Password is required for new customers",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        response = await api.customers.create(formattedData);
      }
      
      if (response.success) {
        toast({
          title: isEditing ? "Customer updated successfully" : "Customer created successfully",
          description: isEditing 
            ? "The customer information has been updated." 
            : "New customer has been added to the system.",
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save customer",
          variant: "destructive"
        });
        console.error("API response error:", response.error);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

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
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password field - only show when creating new customer */}
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
          {/* Status, Customer Type, and Membership Level */}
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

          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CUSTOMER_TYPE_OPTIONS.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            name="membershipLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEMBERSHIP_LEVEL_OPTIONS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
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
          {/* Vehicle and Loyalty Points */}
          <FormField
            control={form.control}
            name="vehicle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <FormControl>
                  <Input placeholder="Vehicle information" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="loyaltyPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loyalty Points</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isLoading ? "Saving..." : isEditing ? "Update Customer" : "Add Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
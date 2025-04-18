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
  FormDescription,
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
import { toast } from "sonner";
import { FuelInventory } from "@/types/api";

// Props for the form component
interface FuelInventoryFormProps {
  fuel?: FuelInventory;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fuel inventory form validation schema
const formSchema = z.object({
  fuelType: z.string({ required_error: "Please select a fuel type." }),
  currentLevel: z.coerce.number().min(0, { message: "Current level must be 0 or greater." }),
  capacity: z.coerce.number().min(0, { message: "Capacity must be 0 or greater." }),
  pricePerGallon: z.coerce.number().min(0, { message: "Price must be 0 or greater." }),
  costPerGallon: z.coerce.number().min(0, { message: "Cost must be 0 or greater." }),
  supplier: z.string().min(2, { message: "Supplier name must be at least 2 characters." }),
  tankNumber: z.string().min(1, { message: "Tank number is required." }),
  reorderLevel: z.coerce.number().min(0, { message: "Reorder level must be 0 or greater." }),
  status: z.enum(["available", "low", "critical", "maintenance", "offline"]),
  location: z.string().default("Main Station"),
  notes: z.string().optional(),
});

// Fuel types based on backend enum
const FUEL_TYPES = [
  "regular",
  "premium",
  "diesel",
  "e85",
  "other",
];

// Status options
const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "low", label: "Low Stock" },
  { value: "critical", label: "Critical" },
  { value: "maintenance", label: "Maintenance" },
  { value: "offline", label: "Offline" },
];

export function FuelInventoryForm({ fuel, onSuccess, onCancel }: FuelInventoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!fuel;

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuelType: fuel?.fuelType || "",
      currentLevel: fuel?.currentLevel || 0,
      capacity: fuel?.capacity || 0,
      pricePerGallon: fuel?.pricePerGallon || 0,
      costPerGallon: fuel?.costPerGallon || 0,
      supplier: fuel?.supplier || "",
      tankNumber: fuel?.tankNumber || "",
      reorderLevel: fuel?.reorderLevel || 100,
      status: fuel?.status || "available",
      location: fuel?.location || "Main Station",
      notes: fuel?.notes || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let response;
      
      if (isEditing && fuel?._id) {
        // Update existing fuel inventory
        response = await api.fuelInventory.update(fuel._id, values);
      } else {
        // Create new fuel inventory
        response = await api.fuelInventory.create(values);
      }
      
      if (response.success) {
        toast.success(
          isEditing ? "Fuel inventory updated successfully" : "Fuel inventory created successfully"
        );
        onSuccess();
      } else {
        toast.error(response.error || "Failed to save fuel inventory");
      }
    } catch (error) {
      console.error("Error saving fuel inventory:", error);
      toast.error("Failed to save fuel inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {/* First row: Fuel Type and Tank Number */}
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
            name="tankNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tank Number*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. T1, T2" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Unique identifier for the tank
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {/* Second row: Current Level, Capacity, Reorder Level */}
          <FormField
            control={form.control}
            name="currentLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Level (gal)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (gal)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level (gal)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="100" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {/* Third row: Price and Cost */}
          <FormField
            control={form.control}
            name="pricePerGallon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Gallon ($)*</FormLabel>
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

          <FormField
            control={form.control}
            name="costPerGallon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Per Gallon ($)*</FormLabel>
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
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {/* Fourth row: Supplier and Status */}
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier*</FormLabel>
                <FormControl>
                  <Input placeholder="Supplier name" {...field} />
                </FormControl>
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
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Main Station" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this fuel tank" 
                  {...field} 
                  rows={2}
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
            {isLoading ? "Saving..." : isEditing ? "Update Fuel Inventory" : "Create Fuel Inventory"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
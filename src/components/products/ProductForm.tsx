import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

// Define Product interface
interface Product {
  _id?: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  supplier: string;
  reorderLevel: number;
  location?: string;
  isActive: boolean;
}

// Props for the form component
interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

// Product form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  sku: z.string().optional(),
  category: z.string({ required_error: "Please select a category." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be 0 or greater." }),
  cost: z.coerce.number().min(0, { message: "Cost must be 0 or greater." }),
  quantity: z.coerce.number().min(0, { message: "Quantity must be 0 or greater." }),
  supplier: z.string().min(2, { message: "Supplier name must be at least 2 characters." }),
  reorderLevel: z.coerce.number().min(0, { message: "Reorder level must be 0 or greater." }),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Categories options based on backend enum
const CATEGORIES = [
  "food",
  "beverage",
  "tobacco",
  "automotive",
  "household",
  "personal_care",
  "electronics",
  "other",
];

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      category: product?.category || "",
      description: product?.description || "",
      price: product?.price || 0,
      cost: product?.cost || 0,
      quantity: product?.quantity || 0,
      supplier: product?.supplier || "",
      reorderLevel: product?.reorderLevel || 5,
      location: product?.location || "Main Store",
      isActive: product?.isActive ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let response;
      
      if (isEditing && product?._id) {
        // Update existing product
        response = await api.products.update(product._id, values);
      } else {
        // Create new product
        response = await api.products.create(values);
      }
      
      if (response.success) {
        toast.success(
          isEditing ? "Product updated successfully" : "Product created successfully"
        );
        onSuccess();
      } else {
        toast.error(response.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {/* First row: Name and SKU */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU {isEditing && "(Read Only)"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Auto-generated if empty" 
                    {...field} 
                    disabled={isEditing} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {/* Second row: Category, Supplier, Location */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Main Store" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {/* Third row: Price, Cost, Quantity */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)*</FormLabel>
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
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost ($)*</FormLabel>
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity*</FormLabel>
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
        </div>

        <div className="grid gap-3 grid-cols-2">
          {/* Fourth row: Reorder Level and Active status */}
          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="5" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 mt-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription className="text-xs">
                    Available for sale
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
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
            {isLoading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
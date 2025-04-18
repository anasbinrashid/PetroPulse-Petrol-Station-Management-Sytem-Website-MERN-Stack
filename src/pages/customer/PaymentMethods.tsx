import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Edit,
  Star,
  StarOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Interface for payment method
interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'fleet';
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
  isDefault: boolean;
  billingAddress?: string;
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    type: "credit",
    cardNumber: "4111111111111111",
    expiryDate: "05/25",
    cardHolderName: "John Doe",
    isDefault: true,
    billingAddress: "123 Main St, Anytown, USA 12345"
  },
  {
    id: "pm2",
    type: "debit",
    cardNumber: "5555555555554444",
    expiryDate: "10/24",
    cardHolderName: "John Doe",
    isDefault: false
  },
  {
    id: "pm3",
    type: "fleet",
    cardNumber: "3782822463100051",
    expiryDate: "02/26",
    cardHolderName: "Acme Corp",
    isDefault: false,
    billingAddress: "456 Business Ave, Commerce City, USA 67890"
  }
];

// Payment Method Form Interface
interface PaymentMethodForm {
  type: string;
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
  isDefault: boolean;
  billingAddress: string;
}

export default function PaymentMethods() {
  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Form state
  const [form, setForm] = useState<PaymentMethodForm>({
    type: "credit",
    cardNumber: "",
    expiryDate: "",
    cardHolderName: "",
    isDefault: false,
    billingAddress: ""
  });
  
  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      
      // In a real app, you would call the API here
      // For now, just use mock data
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setPaymentMethods(mockPaymentMethods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Failed to load payment methods");
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!form.cardNumber) {
      toast.error("Please enter a card number");
      return false;
    }
    
    if (!form.expiryDate) {
      toast.error("Please enter an expiry date");
      return false;
    }
    
    if (!form.cardHolderName) {
      toast.error("Please enter the cardholder name");
      return false;
    }
    
    return true;
  };

  // Add new payment method
  const handleAddPaymentMethod = () => {
    if (!validateForm()) return;
    
    const newPaymentMethod: PaymentMethod = {
      id: `pm${Math.floor(Math.random() * 1000)}`,
      type: form.type as 'credit' | 'debit' | 'fleet',
      cardNumber: form.cardNumber,
      expiryDate: form.expiryDate,
      cardHolderName: form.cardHolderName,
      isDefault: form.isDefault,
      billingAddress: form.billingAddress
    };
    
    // If this is set as default, update other cards
    let updatedPaymentMethods = [...paymentMethods];
    if (form.isDefault) {
      updatedPaymentMethods = updatedPaymentMethods.map(pm => ({
        ...pm,
        isDefault: false
      }));
    }
    
    setPaymentMethods([...updatedPaymentMethods, newPaymentMethod]);
    
    // Reset form and close dialog
    setForm({
      type: "credit",
      cardNumber: "",
      expiryDate: "",
      cardHolderName: "",
      isDefault: false,
      billingAddress: ""
    });
    
    setAddDialogOpen(false);
    toast.success("Payment method added successfully");
  };

  // Start editing payment method
  const handleEditStart = (paymentMethod: PaymentMethod) => {
    setForm({
      type: paymentMethod.type,
      cardNumber: paymentMethod.cardNumber,
      expiryDate: paymentMethod.expiryDate,
      cardHolderName: paymentMethod.cardHolderName,
      isDefault: paymentMethod.isDefault,
      billingAddress: paymentMethod.billingAddress || ""
    });
    
    setEditMode(true);
    setEditId(paymentMethod.id);
    setAddDialogOpen(true);
  };

  // Update payment method
  const handleUpdatePaymentMethod = () => {
    if (!validateForm() || !editId) return;
    
    // Update payment method
    let updatedPaymentMethods = [...paymentMethods];
    
    // If this is set as default, update other cards
    if (form.isDefault) {
      updatedPaymentMethods = updatedPaymentMethods.map(pm => ({
        ...pm,
        isDefault: false
      }));
    }
    
    // Update the specific payment method
    updatedPaymentMethods = updatedPaymentMethods.map(pm => 
      pm.id === editId
        ? {
            ...pm,
            type: form.type as 'credit' | 'debit' | 'fleet',
            cardNumber: form.cardNumber,
            expiryDate: form.expiryDate,
            cardHolderName: form.cardHolderName,
            isDefault: form.isDefault,
            billingAddress: form.billingAddress
          }
        : pm
    );
    
    setPaymentMethods(updatedPaymentMethods);
    
    // Reset form and close dialog
    setForm({
      type: "credit",
      cardNumber: "",
      expiryDate: "",
      cardHolderName: "",
      isDefault: false,
      billingAddress: ""
    });
    
    setEditMode(false);
    setEditId(null);
    setAddDialogOpen(false);
    toast.success("Payment method updated successfully");
  };

  // Delete payment method
  const handleDeletePaymentMethod = (id: string) => {
    // Check if it's the default method
    const isDefault = paymentMethods.find(pm => pm.id === id)?.isDefault;
    
    if (isDefault && paymentMethods.length > 1) {
      toast.error("Cannot delete the default payment method. Please set another method as default first.");
      return;
    }
    
    // Remove the payment method
    const updatedPaymentMethods = paymentMethods.filter(pm => pm.id !== id);
    setPaymentMethods(updatedPaymentMethods);
    
    toast.success("Payment method deleted successfully");
  };

  // Set payment method as default
  const handleSetDefault = (id: string) => {
    const updatedPaymentMethods = paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    }));
    
    setPaymentMethods(updatedPaymentMethods);
    toast.success("Default payment method updated");
  };

  // Format card number for display
  const formatCardNumber = (cardNumber: string) => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  // Get card icon based on type
  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge variant="outline" className="bg-blue-50">Credit Card</Badge>;
      case 'debit':
        return <Badge variant="outline" className="bg-green-50">Debit Card</Badge>;
      case 'fleet':
        return <Badge variant="outline" className="bg-amber-50">Fleet Card</Badge>;
      default:
        return <Badge variant="outline">Card</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              // Reset form when opening for a new payment method
              if (!editMode) {
                setForm({
                  type: "credit",
                  cardNumber: "",
                  expiryDate: "",
                  cardHolderName: "",
                  isDefault: false,
                  billingAddress: ""
                });
              }
            }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
              <DialogDescription>
                {editMode 
                  ? "Update your payment method details below."
                  : "Enter your payment details below to add a new payment method."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Card Type</Label>
                <Select 
                  value={form.type} 
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                    <SelectItem value="fleet">Fleet Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={form.expiryDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Cardholder Name</Label>
                <Input
                  id="cardHolderName"
                  name="cardHolderName"
                  placeholder="John Doe"
                  value={form.cardHolderName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address (Optional)</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  placeholder="123 Main St, Anytown, USA"
                  value={form.billingAddress}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isDefault" 
                  checked={form.isDefault}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("isDefault", checked === true)
                  }
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default payment method
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setAddDialogOpen(false);
                setEditMode(false);
                setEditId(null);
              }}>
                Cancel
              </Button>
              <Button type="button" onClick={editMode ? handleUpdatePaymentMethod : handleAddPaymentMethod}>
                {editMode ? "Update" : "Add"} Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payment methods...</p>
            </div>
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Payment Methods</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any payment methods yet. Add one to make fuel purchases easier.
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((paymentMethod) => (
            <Card key={paymentMethod.id} className={paymentMethod.isDefault ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <CreditCard className={`h-5 w-5 ${paymentMethod.isDefault ? "text-primary" : "text-muted-foreground"}`} />
                    <CardTitle className="text-lg">
                      {paymentMethod.cardHolderName}'s {paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1)} Card
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {paymentMethod.isDefault && (
                      <div className="flex items-center text-primary text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Default
                      </div>
                    )}
                    {getCardTypeIcon(paymentMethod.type)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-mono text-lg">{formatCardNumber(paymentMethod.cardNumber)}</div>
                    <div className="text-sm text-muted-foreground">Expires: {paymentMethod.expiryDate}</div>
                  </div>
                  
                  {paymentMethod.billingAddress && (
                    <div className="text-sm text-muted-foreground">
                      Billing Address: {paymentMethod.billingAddress}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditStart(paymentMethod)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                
                {!paymentMethod.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSetDefault(paymentMethod.id)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Security</CardTitle>
          <CardDescription>
            We take the security of your payment information seriously
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Secure Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All payment information is encrypted using industry-standard SSL technology
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">PCI Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  Our payment processing adheres to Payment Card Industry Data Security Standards
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">Never Share Your Information</h4>
                <p className="text-sm text-muted-foreground">
                  We will never ask for your CVV or full card details over email or phone
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
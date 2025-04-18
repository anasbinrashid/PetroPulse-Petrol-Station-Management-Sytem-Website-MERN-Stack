
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Fuel, Calendar, CreditCard } from "lucide-react";

interface CustomerStatCardsProps {
  totalSpent: number;
  totalGallons: number;
  totalTransactions: number;
  loyaltyPoints: string | number;
}

export const CustomerStatCards: React.FC<CustomerStatCardsProps> = ({
  totalSpent,
  totalGallons,
  totalTransactions,
  loyaltyPoints
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Spent (YTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </div>
          <p className="text-xs text-muted-foreground">+12% from last year</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fuel Purchased (YTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Fuel className="mr-2 h-4 w-4 text-blue-500" />
            <div className="text-2xl font-bold">{totalGallons} gal</div>
          </div>
          <p className="text-xs text-muted-foreground">+5% from last year</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-violet-500" />
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </div>
          <p className="text-xs text-muted-foreground">This year</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4 text-amber-500" />
            <div className="text-2xl font-bold">{loyaltyPoints}</div>
          </div>
          <p className="text-xs text-muted-foreground">Available to redeem</p>
        </CardContent>
      </Card>
    </div>
  );
};

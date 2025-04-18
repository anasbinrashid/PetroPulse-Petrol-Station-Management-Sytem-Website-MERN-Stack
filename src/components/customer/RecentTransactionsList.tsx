
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id?: string;
  _id?: string;
  date: string | Date;
  type?: string;
  fuelType?: string;
  amount?: number;
  total?: number;
  gallons: number;
  pumpNumber?: number;
  paymentMethod: string;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ transactions }) => {
  return (
    <Card className="col-span-12 md:col-span-8">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id || transaction._id}
                className="flex items-center justify-between border-b border-muted pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{transaction.type || transaction.fuelType}</p>
                  <div className="flex text-xs text-muted-foreground">
                    <span>
                      {typeof transaction.date === 'string' 
                        ? transaction.date 
                        : new Date(transaction.date).toLocaleString()}
                    </span>
                    {transaction.pumpNumber && (
                      <span className="ml-2">• Pump #{transaction.pumpNumber}</span>
                    )}
                    <span className="ml-2">• {transaction.gallons.toFixed(1)} gal</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${(transaction.amount || transaction.total || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transaction.paymentMethod}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

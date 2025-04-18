
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  pumpNumber?: number;
  paymentMethod: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-muted pb-4 last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{transaction.type}</p>
                <div className="flex text-xs text-muted-foreground">
                  <span>{transaction.date}</span>
                  {transaction.pumpNumber && (
                    <span className="ml-2">• Pump #{transaction.pumpNumber}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  ${transaction.amount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {transaction.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


export const generateMockCustomerData = () => {
  // Mock fuel purchase data for the last 6 months
  const mockFuelPurchaseData = [
    { month: "Jan", diesel: 45, regular: 120, premium: 65 },
    { month: "Feb", diesel: 50, regular: 115, premium: 70 },
    { month: "Mar", diesel: 65, regular: 130, premium: 75 },
    { month: "Apr", diesel: 70, regular: 125, premium: 60 },
    { month: "May", diesel: 55, regular: 135, premium: 80 },
    { month: "Jun", diesel: 60, regular: 140, premium: 90 },
  ];

  // Mock spending trend data
  const mockSpendingTrendData = [
    { month: "Jan", amount: 230 },
    { month: "Feb", amount: 235 },
    { month: "Mar", amount: 270 },
    { month: "Apr", amount: 255 },
    { month: "May", amount: 270 },
    { month: "Jun", amount: 290 },
  ];

  // Mock payment method breakdown
  const mockPaymentMethodData = [
    { name: "Credit Card", value: 65 },
    { name: "Fleet Card", value: 25 },
    { name: "Cash", value: 10 },
  ];

  // Mock recent transactions
  const mockRecentTransactions = [
    {
      id: "tx1",
      date: "Today, 10:30 AM",
      type: "Regular Unleaded",
      amount: 45.50,
      gallons: 13.2,
      pumpNumber: 2,
      paymentMethod: "Credit Card",
    },
    {
      id: "tx2",
      date: "Jun 25, 09:15 AM",
      type: "Diesel",
      amount: 87.25,
      gallons: 23.3,
      pumpNumber: 5,
      paymentMethod: "Fleet Card",
    },
    {
      id: "tx3",
      date: "Jun 22, 05:45 PM",
      type: "Premium Unleaded",
      amount: 62.75,
      gallons: 15.9,
      pumpNumber: 3,
      paymentMethod: "Credit Card",
    },
    {
      id: "tx4",
      date: "Jun 18, 02:30 PM",
      type: "Regular Unleaded",
      amount: 41.25,
      gallons: 12.0,
      pumpNumber: 1,
      paymentMethod: "Cash",
    },
  ];
  
  return {
    fuelPurchaseData: mockFuelPurchaseData,
    spendingTrendData: mockSpendingTrendData,
    paymentMethodData: mockPaymentMethodData,
    recentTransactions: mockRecentTransactions,
    totals: {
      totalSpent: 1550.75,
      totalGallons: 452,
      totalTransactions: 24
    }
  };
};

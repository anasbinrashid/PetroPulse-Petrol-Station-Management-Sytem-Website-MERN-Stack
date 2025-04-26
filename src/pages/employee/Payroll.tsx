import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Download, Calendar, DollarSign, CreditCard, Clock, CalendarDays, Printer, FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/services/api";

interface PayrollEntry {
  _id: string;
  employeeId: string;
  payPeriod: string;
  startDate: string;
  endDate: string;
  basePay: number;
  overtimePay: number;
  bonus: number;
  deductions: {
    tax: number;
    insurance: number;
    retirement: number;
    other: number;
  };
  netPay: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'processing';
  hoursWorked: number;
  overtimeHours: number;
}

interface PayrollSummary {
  yearToDate: {
    grossPay: number;
    netPay: number;
    tax: number;
    insurance: number;
    retirement: number;
  };
  recentPayments: number;
  upcomingPayment?: {
    date: string;
    amount: number;
  };
}

export default function EmployeePayroll() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollEntry[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  
  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      console.log('[DEBUG][Payroll] Making API request with token:', token ? 'Token exists' : 'No token');
      console.log('[DEBUG][Payroll] Year parameter:', selectedYear);
      
      const response = await api.employee.getPayroll(selectedYear);
      
      console.log('[DEBUG][Payroll] API Response:', response);
      
      if (response.success) {
        const transformedPayrolls = response.data.payrolls.map((payroll: any) => ({
          _id: payroll._id,
          employeeId: payroll.employeeId,
          payPeriod: payroll.payPeriod.startDate,
          startDate: payroll.payPeriod.startDate,
          endDate: payroll.payPeriod.endDate,
          basePay: payroll.earnings.regularPay,
          overtimePay: payroll.earnings.overtimePay,
          bonus: payroll.earnings.bonuses || 0,
          deductions: {
            tax: payroll.deductions.taxes.federal + 
                 payroll.deductions.taxes.state + 
                 (payroll.deductions.taxes.local || 0) + 
                 payroll.deductions.taxes.fica + 
                 payroll.deductions.taxes.medicare,
            insurance: (payroll.deductions.benefits?.healthInsurance || 0) + 
                      (payroll.deductions.benefits?.dentalInsurance || 0) + 
                      (payroll.deductions.benefits?.visionInsurance || 0),
            retirement: payroll.deductions.benefits?.retirement401k || 0,
            other: payroll.deductions.otherDeductions?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0
          },
          netPay: payroll.netPay,
          paymentDate: payroll.paymentDetails?.paymentDate,
          paymentMethod: payroll.paymentDetails?.paymentMethod,
          status: payroll.status,
          hoursWorked: payroll.earnings.regularHours,
          overtimeHours: payroll.earnings.overtimeHours
        }));
        
        setPayrollRecords(transformedPayrolls);
        
        // Transform summary data
        if (response.data.ytdTotals) {
          setPayrollSummary({
            yearToDate: {
              grossPay: response.data.ytdTotals.grossPay,
              netPay: response.data.ytdTotals.netPay,
              tax: response.data.ytdTotals.taxes,
              insurance: 0, // Need to calculate from benefits
              retirement: 0 // Need to calculate from benefits
            },
            recentPayments: transformedPayrolls.length,
            upcomingPayment: transformedPayrolls.length > 0 ? {
              date: transformedPayrolls[0].paymentDate,
              amount: transformedPayrolls[0].netPay
            } : undefined
          });
        }
      }
    } catch (error: any) {
      console.error('[DEBUG][Payroll] Error:', error);
      if (error.response) {
        console.error('[DEBUG][Payroll] Error Response:', error.response.data);
      }
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load payroll data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewPayslip = (payslip: PayrollEntry) => {
    setSelectedPayslip(payslip);
    setPayslipDialogOpen(true);
  };

  const handleDownloadPayslip = (id: string) => {
    toast.success('Payslip download started');
    // In a real application, this would be an API call to download the payslip
  };

  const getTotalGrossPay = (payslip: PayrollEntry) => {
    return payslip.basePay + payslip.overtimePay + payslip.bonus;
  };

  const getTotalDeductions = (payslip: PayrollEntry) => {
    return payslip.deductions.tax + payslip.deductions.insurance + payslip.deductions.retirement + payslip.deductions.other;
  };

  const getNextPayday = () => {
    if (!payrollSummary?.upcomingPayment) return 'Not scheduled';
    return formatDate(payrollSummary.upcomingPayment.date);
  };

  const sortedPayroll = [...payrollRecords].sort((a, b) => 
    new Date(b.payPeriod).getTime() - new Date(a.payPeriod).getTime()
  );

  if (loading && !payrollRecords.length) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (!loading && !payrollRecords.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center space-y-4">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">No Payroll Data Available</h2>
          <p className="text-muted-foreground">
            No payroll records found for the selected year.
          </p>
          <Button onClick={fetchPayrollData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Payroll</h1>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchPayrollData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {payrollSummary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                <div className="text-2xl font-bold">{formatCurrency(payrollSummary.yearToDate.grossPay)}</div>
              </div>
              <p className="text-xs text-muted-foreground">Year to date earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">YTD Net Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">{formatCurrency(payrollSummary.yearToDate.netPay)}</div>
              </div>
              <p className="text-xs text-muted-foreground">Take-home pay for {selectedYear}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">YTD Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-red-500" />
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payrollSummary.yearToDate.tax +
                    payrollSummary.yearToDate.insurance +
                    payrollSummary.yearToDate.retirement
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Total deductions this year</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next Payday</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                <div className="text-2xl font-bold">
                  {payrollSummary.upcomingPayment ? (
                    formatDate(payrollSummary.upcomingPayment.date)
                  ) : (
                    'Not scheduled'
                  )}
                </div>
              </div>
              {payrollSummary.upcomingPayment && (
                <p className="text-xs text-muted-foreground">
                  Estimated: {formatCurrency(payrollSummary.upcomingPayment.amount)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="deductions">Tax & Deductions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your payroll history for {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedPayroll.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Gross Pay</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPayroll.map((payslip) => (
                        <TableRow key={payslip._id}>
                          <TableCell>
                            {formatDate(payslip.startDate)} - {formatDate(payslip.endDate)}
                          </TableCell>
                          <TableCell>
                            {formatDate(payslip.paymentDate)}
                          </TableCell>
                          <TableCell>
                            {payslip.hoursWorked} 
                            {payslip.overtimeHours > 0 && <span className="text-sm text-muted-foreground ml-1">({payslip.overtimeHours} OT)</span>}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(getTotalGrossPay(payslip))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payslip.netPay)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payslip.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewPayslip(payslip)}
                              >
                                <FileDown className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              {payslip.status === 'paid' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownloadPayslip(payslip._id)}
                                >
                                  <Printer className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">No payroll records found for {selectedYear}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax & Deductions</CardTitle>
              <CardDescription>Summary of your payroll deductions for {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              {payrollSummary ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Federal Income Tax</span>
                      <span>{formatCurrency(payrollSummary.yearToDate.tax * 0.7)}</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">State Income Tax</span>
                      <span>{formatCurrency(payrollSummary.yearToDate.tax * 0.3)}</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Health Insurance</span>
                      <span>{formatCurrency(payrollSummary.yearToDate.insurance)}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">401(k) Retirement</span>
                      <span>{formatCurrency(payrollSummary.yearToDate.retirement)}</span>
                    </div>
                    <Progress value={55} className="h-2" />
                  </div>
                  
                  <div className="rounded-md border p-4 mt-6">
                    <h3 className="font-medium mb-2">YTD Summary</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gross Income</span>
                        <span className="font-medium">{formatCurrency(payrollSummary.yearToDate.grossPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Taxes</span>
                        <span className="font-medium text-red-600">-{formatCurrency(payrollSummary.yearToDate.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Insurance</span>
                        <span className="font-medium text-red-600">-{formatCurrency(payrollSummary.yearToDate.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Retirement</span>
                        <span className="font-medium text-red-600">-{formatCurrency(payrollSummary.yearToDate.retirement)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between">
                        <span className="font-medium">Net Income</span>
                        <span className="font-bold text-green-600">{formatCurrency(payrollSummary.yearToDate.netPay)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">No deduction data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payslip Detail Dialog */}
      {selectedPayslip && (
        <Dialog open={payslipDialogOpen} onOpenChange={setPayslipDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payslip Details</DialogTitle>
              <DialogDescription>
                Pay Period: {formatDate(selectedPayslip.startDate)} to {formatDate(selectedPayslip.endDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-semibold text-lg">PetroPulse Haven</h3>
                  <p className="text-sm text-muted-foreground">123 Energy Way, Houston, TX 77001</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Payment Date</p>
                  <p className="text-sm">{formatDate(selectedPayslip.paymentDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Regular ({selectedPayslip.hoursWorked} hrs)</span>
                      <span>{formatCurrency(selectedPayslip.basePay)}</span>
                    </div>
                    {selectedPayslip.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime ({selectedPayslip.overtimeHours} hrs)</span>
                        <span>{formatCurrency(selectedPayslip.overtimePay)}</span>
                      </div>
                    )}
                    {selectedPayslip.bonus > 0 && (
                      <div className="flex justify-between">
                        <span>Bonus</span>
                        <span>{formatCurrency(selectedPayslip.bonus)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Gross Pay</span>
                      <span>{formatCurrency(getTotalGrossPay(selectedPayslip))}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Federal Tax</span>
                      <span>-{formatCurrency(selectedPayslip.deductions.tax * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax</span>
                      <span>-{formatCurrency(selectedPayslip.deductions.tax * 0.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Insurance</span>
                      <span>-{formatCurrency(selectedPayslip.deductions.insurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>401(k)</span>
                      <span>-{formatCurrency(selectedPayslip.deductions.retirement)}</span>
                    </div>
                    {selectedPayslip.deductions.other > 0 && (
                      <div className="flex justify-between">
                        <span>Other</span>
                        <span>-{formatCurrency(selectedPayslip.deductions.other)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Total Deductions</span>
                      <span className="text-red-600">-{formatCurrency(getTotalDeductions(selectedPayslip))}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Net Pay</span>
                <span className="text-lg font-bold">{formatCurrency(selectedPayslip.netPay)}</span>
              </div>
              
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Payment Method</p>
                <p>{selectedPayslip.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : selectedPayslip.paymentMethod}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleDownloadPayslip(selectedPayslip._id)}
                disabled={selectedPayslip.status !== 'paid'}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Payslip
              </Button>
              <Button onClick={() => setPayslipDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 
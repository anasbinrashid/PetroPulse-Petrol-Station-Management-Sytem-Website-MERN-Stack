import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FilterIcon,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays, formatISO, parseISO, format, subMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Get current date for clock in/out
const currentDate = new Date();
const formattedCurrentDate = currentDate.toLocaleString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export default function EmployeeAttendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("list");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState("leave");
  const [requestDate, setRequestDate] = useState<Date | undefined>(new Date());
  const [requestReason, setRequestReason] = useState("");
  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    hoursWorked: 0
  });
  const [attendanceMetrics, setAttendanceMetrics] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClocking, setIsClocking] = useState(false);

  // Fetch attendance data
  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceMetrics();
  }, [dateRange]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      if (!email) {
        toast.error('User information missing. Please log in again.');
        return;
      }
      
      // Prepare date range parameters
      const params: any = {
        email: email, // Add email as a query parameter
        page: 1,
        limit: 50
      };
      
      if (dateRange?.from) {
        params.startDate = formatISO(dateRange.from, { representation: 'date' });
      }
      
      if (dateRange?.to) {
        params.endDate = formatISO(dateRange.to, { representation: 'date' });
      }
      
      // Fetch enhanced attendance data from the API with auth token
      const response = await axios.get('/api/employee/attendance/enhanced', { 
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Format the received data
        const formattedRecords = response.data.data.map((record: any) => ({
          id: record._id,
          date: format(new Date(record.date), 'yyyy-MM-dd'),
          clockIn: record.clockInTime || null,
          clockOut: record.clockOutTime || null,
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
          hours: record.totalHours || 0,
          notes: record.notes || "",
          selfReported: record.selfReported,
          isApproved: record.isApproved
        }));
        
        setAttendanceRecords(formattedRecords);
        
        // Set attendance summary from the API response
        if (response.data.stats) {
          setAttendanceSummary({
            total: response.data.total || 0,
            present: response.data.stats.present || 0,
            absent: response.data.stats.absent || 0,
            late: response.data.stats.late || 0,
            hoursWorked: Math.round(response.data.stats.totalHours * 100) / 100 || 0
          });
        }
        
        // Generate calendar days with real data
        generateCalendarDays(formattedRecords);
      }
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance metrics
  const fetchAttendanceMetrics = async () => {
    try {
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      if (!token) return;
      if (!email) return;
      
      const response = await axios.get('/api/employee/attendance/metrics', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          email: email // Add email as a query parameter
        }
      });
      
      if (response.data.success) {
        setAttendanceMetrics(response.data.metrics);
      }
    } catch (error: any) {
      console.error('Error fetching attendance metrics:', error);
      // Don't show toast for metrics as it's less critical
    }
  };

  // Generate calendar days with attendance status
  const generateCalendarDays = (records: any[]) => {
    const days = [];
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateStr = formatISO(date, { representation: 'date' });
      
      const record = records.find(r => r.date === dateStr);
      let status = "Unknown";
      
      if (record) {
        status = record.status;
      } else if (date > today) {
        status = "Upcoming";
      } else if (date.getDay() === 0 || date.getDay() === 6) {
        status = "Weekend";
      } else {
        status = "Unknown";
      }
      
      days.push({
        date,
        status
      });
    }
    
    setCalendarDays(days);
  };

  // Filter attendance records based on search
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch = 
      record.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Handle submitting attendance request
  const handleSubmitRequest = async () => {
    if (!requestDate) {
      toast.error('Please select a date');
      return;
    }
    
    if (!requestReason && requestType !== 'correction') {
      toast.error('Please provide a reason');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      if (!email) {
        toast.error('User information missing. Please log in again.');
        return;
      }
      
      let status = 'present';
      let leaveType = undefined;
      
      // Set appropriate status based on request type
      if (requestType === 'leave') {
        status = 'leave';
        leaveType = 'personal';
      } else if (requestType === 'wfh') {
        status = 'present';
        // Note: Work from home is still marked as present but with a note
      }
      
      // Submit attendance report with auth token
      const response = await axios.post('/api/employee/attendance/report', 
        {
          email: email, // Add email in request body
          date: requestDate,
          status,
          leaveType,
          leaveReason: requestReason,
          notes: requestType === 'wfh' ? 'Working from home: ' + requestReason : requestReason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully!`);
        setRequestDialogOpen(false);
        setRequestType("leave");
        setRequestDate(new Date());
        setRequestReason("");
        
        // Refresh attendance data
        fetchAttendanceData();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clock in/out
  const handleClockAction = async (action: string) => {
    try {
      setIsClocking(true);
      
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      if (!email) {
        toast.error('User information missing. Please log in again.');
        return;
      }
      
      // Call appropriate API endpoint based on action with auth token
      const endpoint = action === 'in' ? '/api/employee/clock-in' : '/api/employee/clock-out';
      
      const response = await axios.post(
        endpoint, 
        {
          email: email, // Add email in request body
          location: 'Web portal'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      toast.success(`You have successfully clocked ${action} at ${time}`);
      setClockDialogOpen(false);
      
      // Refresh attendance data
      fetchAttendanceData();
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || `Failed to clock ${action}`);
      }
    } finally {
      setIsClocking(false);
    }
  };

  // Attendance rate percentage
  const attendanceRate = attendanceSummary.total > 0 ? 
    Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : 0;

  // Current streak from metrics
  const currentStreak = attendanceMetrics?.currentStreak || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <div className="flex items-center gap-2">
          <Dialog open={clockDialogOpen} onOpenChange={setClockDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Clock className="mr-2 h-4 w-4" />
                Clock In/Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clock In/Out</DialogTitle>
                <DialogDescription>
                  Record your attendance for today: {formattedCurrentDate}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="text-center text-2xl font-bold">
                    {currentDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:space-x-0">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => handleClockAction("in")}
                  disabled={isClocking}
                >
                  {isClocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Clock In
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => handleClockAction("out")}
                  disabled={isClocking}
                >
                  {isClocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Clock Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{attendanceRate}%</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={attendanceRate} className="h-2" />
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{attendanceSummary.present}</div>
            </div>
            <p className="text-xs text-muted-foreground">Out of {attendanceSummary.total} workdays</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absences/Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold">{attendanceSummary.absent}/{attendanceSummary.late}</div>
            </div>
            <p className="text-xs text-muted-foreground">Absent days / Late arrivals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{attendanceSummary.hoursWorked}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total hours this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Request Leave/Correction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attendance Request</DialogTitle>
                  <DialogDescription>
                    Submit a request for leave or attendance correction
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="request-type">Request Type</Label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leave">Leave Request</SelectItem>
                        <SelectItem value="correction">Attendance Correction</SelectItem>
                        <SelectItem value="wfh">Work From Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Calendar
                      mode="single"
                      selected={requestDate}
                      onSelect={setRequestDate}
                      className="border rounded-md p-3"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="Please provide a reason for your request"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSubmitRequest} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="list" className="mt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search attendance records..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DatePickerWithRange 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                View your attendance records and time logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Self Reported</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.clockIn || "--"}</TableCell>
                        <TableCell>{record.clockOut || "--"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "Present"
                                ? "default"
                                : record.status === "Late"
                                ? "outline"
                                : record.status === "Leave"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.hours.toFixed(2)}</TableCell>
                        <TableCell>{record.notes || "--"}</TableCell>
                        <TableCell>
                          {record.selfReported ? (
                            record.isApproved ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>
                            )
                          ) : (
                            "--"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRecords.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>
                View your monthly attendance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="font-medium text-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      let bgColor = "bg-muted";
                      let textColor = "text-foreground";
                      
                      if (day.status === "Present") {
                        bgColor = "bg-green-100 border-green-300";
                        textColor = "text-green-900";
                      } else if (day.status === "Absent") {
                        bgColor = "bg-red-100 border-red-300";
                        textColor = "text-red-900";
                      } else if (day.status === "Late") {
                        bgColor = "bg-amber-100 border-amber-300";
                        textColor = "text-amber-900";
                      } else if (day.status === "Leave") {
                        bgColor = "bg-purple-100 border-purple-300";
                        textColor = "text-purple-900";
                      } else if (day.status === "Weekend") {
                        bgColor = "bg-muted/50";
                        textColor = "text-muted-foreground";
                      } else if (day.status === "Upcoming") {
                        bgColor = "bg-muted/30 border-dashed";
                        textColor = "text-muted-foreground";
                      }
                      
                      // Add the first day of the month in the correct position
                      const firstDayOffset = index === 0 ? day.date.getDay() : 0;
                      
                      return (
                        <>
                          {index === 0 && firstDayOffset > 0 && Array.from({ length: firstDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-14 rounded-md"></div>
                          ))}
                          <div 
                            key={day.date.toISOString()} 
                            className={`h-14 rounded-md border p-1 flex flex-col ${bgColor} ${textColor}`}
                          >
                            <div className="text-right text-xs">{day.date.getDate()}</div>
                            <div className="flex-1 flex items-center justify-center text-xs font-medium">
                              {day.status !== "Weekend" && day.status !== "Upcoming" && day.status}
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></div>
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></div>
                      <span className="text-xs">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-100 border border-amber-300"></div>
                      <span className="text-xs">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-100 border border-purple-300"></div>
                      <span className="text-xs">Leave</span>
                    </div>
                  </div>

                  {attendanceMetrics && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium mb-2">Your Attendance Streak</h3>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold mr-2">{currentStreak}</div>
                        <div className="text-sm text-muted-foreground">consecutive days present</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

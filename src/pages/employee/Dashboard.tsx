import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Clock, CalendarClock, DollarSign, Users } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmployeeAttendanceResponse } from "@/types/api";
import axios from "axios";

export default function EmployeeDashboard() {
  const [employeeName] = useState(localStorage.getItem("userName") || "Employee");
  const [employeeId] = useState(localStorage.getItem("employeeId") || "");
  const [role] = useState(localStorage.getItem("role") || "Employee");
  const [clockedIn, setClockedIn] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalHours: 0,
    weeklyHours: 0,
    monthlyHours: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAttendanceData = async () => {
    // Get authentication token and email from localStorage
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      console.log('[DEBUG][Dashboard] Authentication token missing');
      toast.error('Authentication required. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    if (!email) {
      console.log('[DEBUG][Dashboard] User email missing');
      toast.error('User information missing. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    if (!employeeId) {
      console.log('[DEBUG][Dashboard] Employee ID missing');
      toast.error('Employee information missing. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    setLoading(true);
    try {
      // Use the correct API method from the api service
      const response = await api.attendance.getMyAttendance();
      
      if (response.success && response.data) {
        // Log the raw response data for debugging
        console.log('[DEBUG][Dashboard] Raw response:', response);
        console.log('[DEBUG][Dashboard] Response data:', response.data);
        
        // Extract records from the response
        const records = response.data.data || [];
        console.log('[DEBUG][Dashboard] Raw records:', records);
        
        // Helper function to calculate hours between two times
        const calculateHours = (clockIn: string, clockOut: string) => {
          console.log('[DEBUG][Dashboard] Calculating hours for:', { clockIn, clockOut });
          
          if (!clockIn || !clockOut) {
            console.log('[DEBUG][Dashboard] Missing clock in/out time');
            return 0;
          }
          
          try {
            // Helper function to parse time from different formats
            const parseTime = (timeStr: string) => {
              // If it's a simple time string (e.g., "15:40")
              if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
                return timeStr;
              }
              
              // If it's a full date string (e.g., "Sun Apr 13 2025 08:19:00 GMT+0500")
              if (timeStr.includes('GMT')) {
                const timePart = timeStr.split(' ')[4];
                return timePart;
              }
              
              // If it's an ISO date string (e.g., "2025-04-17T19:00:00.000Z")
              if (timeStr.includes('T')) {
                return timeStr.split('T')[1].split('.')[0];
              }
              
              return timeStr;
            };
            
            const inTime = parseTime(clockIn);
            const outTime = parseTime(clockOut);
            
            console.log('[DEBUG][Dashboard] Parsed times:', { inTime, outTime });
            
            // Parse hours and minutes
            const [inHours, inMinutes] = inTime.split(':').map(Number);
            const [outHours, outMinutes] = outTime.split(':').map(Number);
            
            console.log('[DEBUG][Dashboard] Time components:', { inHours, inMinutes, outHours, outMinutes });
            
            // Calculate total hours
            const inTotal = inHours + inMinutes / 60;
            const outTotal = outHours + outMinutes / 60;
            
            let hours = outTotal - inTotal;
            if (hours < 0) hours += 24; // Handle overnight shifts
            
            console.log('[DEBUG][Dashboard] Calculated hours:', hours);
            return Math.round(hours * 10) / 10; // Round to 1 decimal place
          } catch (error) {
            console.error('[DEBUG][Dashboard] Error calculating hours:', error);
            return 0;
          }
        };
        
        // Process records to calculate hours
        const processedRecords = records.map((record: any) => {
          console.log('[DEBUG][Dashboard] Processing record:', record);
          const hours = calculateHours(record.clockInTime, record.clockOutTime);
          const processedRecord = {
            ...record,
            totalHours: hours
          };
          console.log('[DEBUG][Dashboard] Processed record:', processedRecord);
          return processedRecord;
        });
        
        console.log('[DEBUG][Dashboard] All processed records:', processedRecords);
        
        // Calculate summary statistics from the processed records
        const totalHours = processedRecords.reduce((sum: number, record: any) => {
          return sum + (record.totalHours || 0);
        }, 0);
        
        // Calculate weekly hours (last 7 days)
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        
        console.log('[DEBUG][Dashboard] Date range for weekly hours:', {
          start: oneWeekAgo.toISOString(),
          end: today.toISOString()
        });
        
        const weeklyHours = processedRecords
          .filter((record: any) => {
            const recordDate = new Date(record.date);
            return recordDate >= oneWeekAgo && recordDate <= today;
          })
          .reduce((sum: number, record: any) => sum + (record.totalHours || 0), 0);
        
        // Calculate monthly hours (last 30 days)
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        console.log('[DEBUG][Dashboard] Date range for monthly hours:', {
          start: oneMonthAgo.toISOString(),
          end: today.toISOString()
        });
        
        const monthlyHours = processedRecords
          .filter((record: any) => {
            const recordDate = new Date(record.date);
            return recordDate >= oneMonthAgo && recordDate <= today;
          })
          .reduce((sum: number, record: any) => sum + (record.totalHours || 0), 0);
        
        console.log('[DEBUG][Dashboard] Summary calculations:', {
          totalHours,
          weeklyHours,
          monthlyHours
        });
        
        // Set attendance records
        setAttendanceRecords(processedRecords);
        
        // Set attendance summary
        setAttendanceSummary({
          totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
          weeklyHours: Math.round(weeklyHours * 10) / 10,
          monthlyHours: Math.round(monthlyHours * 10) / 10
        });
        
        // Check if employee is currently clocked in
        const todayStr = today.toISOString().split('T')[0];
        const isClockedIn = processedRecords.some((record: any) => {
          return record.date.includes(todayStr) && !record.clockOutTime;
        });
        setClockedIn(isClockedIn);
      } else {
        console.error('[DEBUG][Dashboard] Invalid response format:', response);
        toast.error('Invalid response format from server');
        setMockAttendanceData();
      }
    } catch (error: any) {
      console.error("[DEBUG][Dashboard] Error fetching attendance data:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/auth/login';
        } else {
          toast.error("Failed to load attendance data");
          setMockAttendanceData();
        }
      } else {
        toast.error("Network error. Using sample data.");
        setMockAttendanceData();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [employeeId]);
  
  const setMockAttendanceData = () => {
    const mockRecords = [
      { date: "2024-07-01", clockInTime: "08:00", clockOutTime: "17:00" },
      { date: "2024-07-02", clockInTime: "08:00", clockOutTime: "17:00" },
      { date: "2024-07-03", clockInTime: "08:00", clockOutTime: "12:00" },
      { date: "2024-07-04", clockInTime: "13:00", clockOutTime: "17:00" },
      { date: "2024-07-05", clockInTime: "08:00", clockOutTime: "17:00" },
    ];
    setAttendanceRecords(mockRecords);
    setAttendanceSummary({
      totalHours: 120,
      weeklyHours: 40,
      monthlyHours: 120
    });
    setClockedIn(false);
  };

  const handleClockInOut = async () => {
    // Get authentication token and email from localStorage
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    if (!email) {
      toast.error('User information missing. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    if (!employeeId) {
      toast.error('Employee information missing. Please log in again.');
      window.location.href = '/auth/login';
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = clockedIn ? '/api/employee/clock-out' : '/api/employee/clock-in';
      const response = await axios.post(
        endpoint,
        {
          employeeId,
          email,
          location: 'Web portal'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(`Clocked ${clockedIn ? 'Out' : 'In'} Successfully!`);
        setClockedIn(!clockedIn);
        // Refresh attendance data
        fetchAttendanceData();
      } else {
        toast.error(response.data.error || `Failed to Clock ${clockedIn ? 'Out' : 'In'}`);
      }
    } catch (error: any) {
      console.error("[DEBUG][Dashboard] Error during clock in/out:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/auth/login';
        } else {
          toast.error(error.response.data?.message || "An error occurred while clocking in/out");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {employeeName}</h1>
          <p className="text-muted-foreground">Here's a summary of your attendance and schedule</p>
        </div>
        <Button disabled={loading} onClick={handleClockInOut}>
          {clockedIn ? "Clock Out" : "Clock In"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{attendanceSummary.totalHours} hrs</div>
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarClock className="mr-2 h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{attendanceSummary.weeklyHours} hrs</div>
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings (Estimate)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-violet-500" />
              <div className="text-2xl font-bold">${(attendanceSummary.monthlyHours * 15).toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Based on $15/hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="col-span-12 md:col-span-8">
          <CardHeader>
            <CardTitle>Recent Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours Worked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceRecords.map((record: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">{record.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">{record.clockInTime || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">{record.clockOutTime || (clockedIn && record.date === new Date().toISOString().split('T')[0] ? 'Clocked In' : 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">
                          {record.clockInTime && record.clockOutTime ? (
                            (new Date(`1970-01-01T${record.clockOutTime}:00`).getTime() - new Date(`1970-01-01T${record.clockInTime}:00`).getTime()) / 3600000
                          ).toFixed(2) + " hrs" : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              This section is under development. Check back later for team performance metrics.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

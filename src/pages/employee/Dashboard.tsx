import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Clock, CalendarClock, DollarSign, Users } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmployeeAttendanceResponse } from "@/types/api";

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

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        const response = await api.attendance.getSummary(employeeId);
        
        if (response.success && response.data) {
          const data = response.data as EmployeeAttendanceResponse;
          setAttendanceRecords(data.records || []);
          setAttendanceSummary(data.summary || {
            totalHours: 0,
            weeklyHours: 0,
            monthlyHours: 0
          });
          
          // Check if employee is currently clocked in
          const today = new Date().toISOString().split('T')[0];
          const isClockedIn = data.records?.some((record: any) => {
            return record.date.includes(today) && !record.clockOutTime;
          });
          setClockedIn(isClockedIn);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        toast.error("Failed to load attendance data");
        // Use mock data as fallback
        setMockAttendanceData();
      } finally {
        setLoading(false);
      }
    };
    
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
    setLoading(true);
    try {
      if (!clockedIn) {
        // Clock In
        const response = await api.attendance.clockIn(employeeId);
        if (response.success) {
          toast.success("Clocked In Successfully!");
          setClockedIn(true);
        } else {
          toast.error(response.error || "Failed to Clock In");
        }
      } else {
        // Clock Out
        const response = await api.attendance.clockOut(employeeId);
        if (response.success) {
          toast.success("Clocked Out Successfully!");
          setClockedIn(false);
        } else {
          toast.error(response.error || "Failed to Clock Out");
        }
      }
    } catch (error) {
      console.error("Error during clock in/out:", error);
      toast.error("An error occurred while clocking in/out");
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.clockInTime || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.clockOutTime || (clockedIn && record.date === new Date().toISOString().split('T')[0] ? 'Clocked In' : 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
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

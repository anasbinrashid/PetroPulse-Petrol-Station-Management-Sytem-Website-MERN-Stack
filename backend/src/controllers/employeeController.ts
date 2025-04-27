import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Employee from '../models/employee/EmployeeModel';
import Attendance, { IAttendance } from '../models/employee/AttendanceModel';
import mongoose from 'mongoose';

// Define interface for req.user
interface RequestUser {
  _id: string | mongoose.Types.ObjectId;
  [key: string]: any;
}

// Define custom request interface instead of extending Express namespace
interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

/**
 * @desc    Get employee profile
 * @route   GET /api/employees/profile
 * @access  Private/Employee
 */
export const getEmployeeProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching employee profile...');
    
    // The user ID should be available from the auth middleware
    const employeeId = req.user?._id;
    
    if (!employeeId) {
      console.log('User ID not found in request');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const employee = await Employee.findById(employeeId).select('-password');
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    console.log(`Found employee profile for: ${employee.firstName} ${employee.lastName}`);
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Error fetching employee profile', error: (error as Error).message });
  }
});

/**
 * @desc    Get employee's own attendance records
 * @route   GET /api/employees/attendance
 * @access  Private/Employee
 */
export const getMyAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching employee attendance records...');
    
    const employeeId = req.user?._id;
    
    if (!employeeId) {
      console.log('User ID not found in request');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Parse query parameters for date range
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Find attendance records for the employee
    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    console.log(`Found ${attendance.length} attendance records`);
    
    // Calculate summary statistics
    const total = attendance.length;
    const present = attendance.filter((record: IAttendance) => record.status === 'present').length;
    const absent = attendance.filter((record: IAttendance) => record.status === 'absent').length;
    const late = attendance.filter((record: IAttendance) => record.status === 'late').length;
    
    res.json({
      records: attendance,
      summary: {
        total,
        present,
        absent,
        late,
        attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : '0'
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Error fetching attendance records', error: (error as Error).message });
  }
});

/**
 * @desc    Submit attendance (clock in)
 * @route   POST /api/employees/clock-in
 * @access  Private/Employee
 */
export const clockIn = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Employee clocking in...');
    
    const employeeId = req.user?._id;
    
    if (!employeeId) {
      console.log('User ID not found in request');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Check if employee already clocked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingRecord = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      clockInTime: { $exists: true }
    });
    
    if (existingRecord) {
      console.log('Employee already clocked in today');
      res.status(400).json({ message: 'Already clocked in today' });
      return;
    }
    
    // Create new attendance record
    const attendance = await Attendance.create({
      employee: employeeId,
      date: new Date(),
      clockInTime: new Date().toTimeString().slice(0, 5), // Format as HH:MM
      status: 'present'
    });
    
    console.log(`Employee clocked in at ${attendance.clockInTime}`);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Error clocking in', error: (error as Error).message });
  }
});

/**
 * @desc    Submit attendance (clock out)
 * @route   POST /api/employees/clock-out
 * @access  Private/Employee
 */
export const clockOut = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Employee clocking out...');
    
    const employeeId = req.user?._id;
    
    if (!employeeId) {
      console.log('User ID not found in request');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRecord = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      clockInTime: { $exists: true },
      clockOutTime: { $exists: false }
    });
    
    if (!attendanceRecord) {
      console.log('No active clock-in found');
      res.status(400).json({ message: 'No active clock-in found' });
      return;
    }
    
    // Update with clock out time
    attendanceRecord.clockOutTime = new Date().toTimeString().slice(0, 5); // Format as HH:MM
    
    // Hours will be calculated in the pre-save hook of the model
    await attendanceRecord.save();
    
    console.log(`Employee clocked out at ${attendanceRecord.clockOutTime}`);
    console.log(`Hours worked: ${attendanceRecord.totalHours || 'Not calculated'}`);
    
    res.json(attendanceRecord);
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ message: 'Error clocking out', error: (error as Error).message });
  }
});

/**
 * @desc    Get employee schedule
 * @route   GET /api/employees/schedule
 * @access  Private/Employee
 */
export const getEmployeeSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching employee schedule...');
    
    const employeeId = req.user?._id;
    
    if (!employeeId) {
      console.log('User ID not found in request');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Find employee to get shift information
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Determine shift based on position or department
    // Since the model doesn't have a shifts property, we'll derive it
    let shift = 'day'; // Default shift
    
    // You can add logic to determine shift based on department or position
    if (employee.department === 'cashier') {
      shift = 'day';
    } else if (employee.department === 'security') {
      shift = 'night';
    } else if (employee.position.toLowerCase().includes('manager')) {
      shift = 'morning';
    }
    
    // Mock schedule data - in a real application, this would come from a schedule collection
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      let startTime, endTime;
      
      // Set shift times based on determined shift
      switch(shift) {
        case 'morning':
          startTime = new Date(day.setHours(6, 0, 0));
          endTime = new Date(day.setHours(14, 0, 0));
          break;
        case 'evening':
          startTime = new Date(day.setHours(14, 0, 0));
          endTime = new Date(day.setHours(22, 0, 0));
          break;
        case 'night':
          startTime = new Date(day.setHours(22, 0, 0));
          endTime = new Date(new Date(day).setHours(6, 0, 0));
          endTime.setDate(endTime.getDate() + 1);
          break;
        default: // day shift
          startTime = new Date(day.setHours(9, 0, 0));
          endTime = new Date(day.setHours(17, 0, 0));
      }
      
      schedule.push({
        date: new Date(day),
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.getDay()],
        startTime,
        endTime,
        shift
      });
    }
    
    console.log(`Generated schedule for employee with ${shift} shift`);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching employee schedule:', error);
    res.status(500).json({ message: 'Error fetching employee schedule', error: (error as Error).message });
  }
}); 
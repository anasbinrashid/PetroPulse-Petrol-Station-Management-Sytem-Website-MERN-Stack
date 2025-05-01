import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Employee from '../models/employee/EmployeeModel';
import EmployeeProfileConnection from '../models/employeeDB/EmployeeProfileModel';
import ScheduleConnection from '../models/employeeDB/ScheduleModel';
import PayrollConnection from '../models/employeeDB/PayrollModel';
import EmployeeAttendanceConnection from '../models/employeeDB/EmployeeAttendanceModel';
import Attendance from '../models/employee/AttendanceModel';
import jwt from 'jsonwebtoken';

// Custom typed asyncHandler to handle Express Response properly
const typedAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Add types for attendance records
interface IAttendanceInput {
  employeeId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  clockInTime?: string;
  clockOutTime?: string;
  notes?: string;
  leaveType?: 'sick' | 'vacation' | 'personal' | 'unpaid' | 'other';
  leaveReason?: string;
  selfReported: boolean;
  isApproved: boolean;
  attachments?: string[];
  metrics?: {
    punctuality?: number;
    consistency?: number;
    consecutiveDays?: number;
  };
}

interface IAttendanceMainDB {
  employee: any;
  date: Date;
  status: string;
  clockInTime?: string;
  clockOutTime?: string;
  notes?: string;
  leaveType?: string;
  leaveReason?: string;
}

// @desc    Employee portal login
// @route   POST /api/employee/login
// @access  Public
export const employeeLogin = typedAsyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log(`[EmployeeDashboardController] Login attempt for: ${email}`);
  
  // Find employee in main database
  const employee = await Employee.findOne({ email });
  
  if (employee && (await employee.comparePassword(password))) {
    // Generate jwt token
    const token = jwt.sign(
      { id: employee._id, employeeId: employee.employeeId },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '8h' }
    );
    
    // Update last login
    employee.lastLogin = new Date();
    await employee.save();
    
    console.log(`[EmployeeDashboardController] Login successful for: ${email}`);
    
    // Check if employee exists in employee database, if not, create
    await syncEmployeeProfile(employee);
    
    res.json({
      _id: employee._id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      profileImage: employee.profileImage,
      permissions: employee.permissions,
      token
    });
  } else {
    console.log(`[EmployeeDashboardController] Login failed for: ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get employee profile for dashboard
// @route   GET /api/employee/profile
// @access  Private/Employee
export const getEmployeeProfile = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  console.log(`[EmployeeDashboardController] Getting profile for employee: ${userId}`);
  console.log(`[DEBUG] Request user object:`, JSON.stringify(req.user || {}));
  
  if (!userId) {
    console.log(`[DEBUG] User ID is missing in request`);
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId).select('-password');
  
  console.log(`[DEBUG] Employee from main database: ${employee ? 'Found' : 'Not found'}`);
  if (employee) {
    console.log(`[DEBUG] Employee details: ID=${employee._id}, employeeId=${employee.employeeId}, email=${employee.email}`);
  }
  
  if (!employee) {
    console.log(`[DEBUG] Employee not found in main database with ID: ${userId}`);
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get employee profile from employee database
  const EmployeeProfile = await (await EmployeeProfileConnection);
  console.log(`[DEBUG] Looking for employee profile with mainEmployeeId: ${employee.employeeId}`);
  
  const employeeProfile = await EmployeeProfile.findOne({ mainEmployeeId: employee.employeeId });
  console.log(`[DEBUG] Employee profile from employee database: ${employeeProfile ? 'Found' : 'Not found'}`);
  
  // If profile doesn't exist, sync and create it
  if (!employeeProfile) {
    console.log(`[DEBUG] Profile not found, attempting to sync and create`);
    const syncResult = await syncEmployeeProfile(employee);
    console.log(`[DEBUG] Sync result: ${syncResult ? 'Success' : 'Failed'}`);
    
    const newProfile = await EmployeeProfile.findOne({ mainEmployeeId: employee.employeeId });
    console.log(`[DEBUG] New profile after sync: ${newProfile ? 'Created' : 'Not created'}`);
    
    console.log(`[EmployeeDashboardController] Created new profile for: ${employee.email}`);
    
    return res.json({ 
      mainInfo: employee, 
      profile: newProfile,
    });
  }
  
  console.log(`[EmployeeDashboardController] Retrieved profile for: ${employee.email}`);
  
  res.json({ 
    mainInfo: employee, 
    profile: employeeProfile,
  });
});

// @desc    Get employee schedule
// @route   GET /api/employee/schedule
// @access  Private/Employee
export const getEmployeeSchedule = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { startDate, endDate } = req.query;
  
  console.log(`[EmployeeDashboardController] Getting schedule for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get schedule from employee database
  const Schedule = await (await ScheduleConnection);
  
  const query: any = { employeeId: employee.employeeId };
  
  // Add filter for date range if provided
  if (startDate && endDate) {
    query.weekStartDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  } else {
    // Default to current and next week
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);
    
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + (13 - today.getDay()));
    nextWeekEnd.setHours(23, 59, 59, 999);
    
    query.weekStartDate = {
      $gte: lastWeekStart,
      $lte: nextWeekEnd
    };
  }
  
  const schedules = await Schedule.find(query).sort({ weekStartDate: 1 });
  
  console.log(`[EmployeeDashboardController] Retrieved ${schedules.length} schedule entries for: ${employee.email}`);
  
  res.json(schedules);
});

// @desc    Get employee attendance
// @route   GET /api/employee/attendance
// @access  Private/Employee
export const getEmployeeAttendance = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { startDate, endDate, page = 1, limit = 31 } = req.query;
  
  console.log(`[EmployeeDashboardController] Getting attendance for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  const query: any = { employee: employee._id };
  
  // Add date range filter if provided
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Attendance.countDocuments(query);
  
  const attendanceRecords = await Attendance.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  // Calculate attendance statistics
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    totalHours: 0
  };
  
  attendanceRecords.forEach(record => {
    stats[record.status as keyof typeof stats] += 1;
    if (record.totalHours) {
      stats.totalHours += record.totalHours;
    }
  });
  
  console.log(`[EmployeeDashboardController] Retrieved ${attendanceRecords.length} attendance records for: ${employee.email}`);
  
  res.json({
    success: true,
    count: attendanceRecords.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    stats,
    data: attendanceRecords
  });
});

// @desc    Get employee payroll
// @route   GET /api/employee/payroll
// @access  Private/Employee
export const getEmployeePayroll = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { year, month } = req.query;
  
  console.log(`[EmployeeDashboardController] Getting payroll for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get payroll from employee database
  const Payroll = await (await PayrollConnection);
  
  const query: any = { employeeId: employee.employeeId };
  
  // Add filter for year and month if provided
  if (year && month) {
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
    
    query['payPeriod.startDate'] = {
      $gte: startDate,
      $lte: endDate
    };
  } else {
    // Default to current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    
    query['payPeriod.startDate'] = {
      $gte: startOfYear,
      $lte: endOfYear
    };
  }
  
  const payrolls = await Payroll.find(query).sort({ 'payPeriod.startDate': -1 });
  
  console.log(`[EmployeeDashboardController] Retrieved ${payrolls.length} payroll entries for: ${employee.email}`);
  
  // Calculate YTD totals if not already present
  if (payrolls.length > 0 && !payrolls[0].ytdTotals) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const allYearPayrolls = await Payroll.find({
      employeeId: employee.employeeId,
      'payPeriod.startDate': { $gte: startOfYear }
    });
    
    const ytdTotals = {
      grossPay: 0,
      taxes: 0,
      deductions: 0,
      netPay: 0
    };
    
    allYearPayrolls.forEach(payroll => {
      ytdTotals.grossPay += payroll.earnings.grossPay;
      ytdTotals.taxes += payroll.deductions.taxes.federal + 
                       payroll.deductions.taxes.state + 
                       (payroll.deductions.taxes.local || 0) + 
                       payroll.deductions.taxes.fica + 
                       payroll.deductions.taxes.medicare;
      ytdTotals.deductions += payroll.deductions.totalDeductions;
      ytdTotals.netPay += payroll.netPay;
    });
    
    // Round to 2 decimal places
    Object.keys(ytdTotals).forEach(key => {
      ytdTotals[key as keyof typeof ytdTotals] = Math.round(ytdTotals[key as keyof typeof ytdTotals] * 100) / 100;
    });
    
    res.json({
      payrolls,
      ytdTotals
    });
  } else {
    res.json({
      payrolls
    });
  }
});

// @desc    Clock in
// @route   POST /api/employee/clock-in
// @access  Private/Employee
export const clockIn = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { location } = req.body;
  
  console.log(`[EmployeeDashboardController] Clock in request for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if already clocked in today
  const existingRecord = await Attendance.findOne({
    employee: userId,
    date: { $gte: today }
  });
  
  if (existingRecord) {
    if (existingRecord.clockInTime) {
      res.status(400);
      throw new Error('Already clocked in today');
    }
    
    // Update existing record with clock in time
    const now = new Date();
    const clockInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    existingRecord.clockInTime = clockInTime;
    existingRecord.status = 'present';
    
    if (location) {
      existingRecord.location = location;
    }
    
    await existingRecord.save();
    
    console.log(`[EmployeeDashboardController] Updated clock in for: ${employee.email} at ${clockInTime}`);
    
    res.json(existingRecord);
  } else {
    // Create new attendance record
    const now = new Date();
    const clockInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check if clocking in late (after 8:30 AM)
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    
    const newAttendance = await Attendance.create({
      employee: userId,
      date: today,
      clockInTime,
      status: isLate ? 'late' : 'present',
      location
    });
    
    console.log(`[EmployeeDashboardController] Created new clock in for: ${employee.email} at ${clockInTime}`);
    
    res.status(201).json(newAttendance);
  }
});

// @desc    Clock out
// @route   POST /api/employee/clock-out
// @access  Private/Employee
export const clockOut = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { location } = req.body;
  
  console.log(`[EmployeeDashboardController] Clock out request for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find today's attendance record
  const attendanceRecord = await Attendance.findOne({
    employee: userId,
    date: { $gte: today }
  });
  
  if (!attendanceRecord) {
    res.status(404);
    throw new Error('No clock-in record found for today');
  }
  
  if (!attendanceRecord.clockInTime) {
    res.status(400);
    throw new Error('Must clock in before clocking out');
  }
  
  if (attendanceRecord.clockOutTime) {
    res.status(400);
    throw new Error('Already clocked out today');
  }
  
  // Update record with clock out time
  const now = new Date();
  const clockOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  attendanceRecord.clockOutTime = clockOutTime;
  
  // Update location if provided
  if (location) {
    attendanceRecord.location = location;
  }
  
  await attendanceRecord.save();
  
  console.log(`[EmployeeDashboardController] Clocked out for: ${employee.email} at ${clockOutTime}`);
  
  res.json(attendanceRecord);
});

// @desc    Update employee profile
// @route   PUT /api/employee/profile
// @access  Private/Employee
export const updateEmployeeProfile = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  console.log(`[EmployeeDashboardController] Update profile request for employee: ${userId}`);

  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  // Get employee from main database
  const employee = await Employee.findById(userId);

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Extract fields to update from the request body
  const {
    bio,
    skills,
    education,
    experience,
    certifications,
    preferences,
    socialMedia,
    phone,
    firstName,
    lastName
  } = req.body;

  // Prepare the update object
  const updateData: any = {
    bio,
    skills,
    education,
    experience,
    certifications,
    preferences,
    socialMedia,
    firstName,
    lastName,
    lastUpdated: new Date(),
  };

  // Remove undefined fields from the update object
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  // Update phone in the main employee record if provided
  if (phone) {
    employee.phone = phone;
    await employee.save();
    updateData.phone = phone;
  }

  console.log('[DEBUG] Updating profile with data:', updateData);

  // Use findByIdAndUpdate to update the profile and return the updated document
  const EmployeeProfile = await (await EmployeeProfileConnection);
  const updatedProfile = await EmployeeProfile.findOneAndUpdate(
    { mainEmployeeId: employee.employeeId },
    updateData,
    { new: true } // Return the updated document
  );

  if (!updatedProfile) {
    res.status(404);
    throw new Error('Employee profile not found');
  }

  console.log('[DEBUG] Updated profile:', updatedProfile);

  res.json({
    success: true,
    profile: updatedProfile
  });
});

// Helper function to sync employee data between databases
const syncEmployeeProfile = async (employee: any) => {
  console.log(`[EmployeeDashboardController] Syncing employee profile for: ${employee.employeeId}`);
  console.log(`[DEBUG][syncEmployeeProfile] Employee data:`, JSON.stringify({
    id: employee._id,
    employeeId: employee.employeeId,
    name: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    department: employee.department,
    position: employee.position
  }));
  
  try {
    const EmployeeProfile = await (await EmployeeProfileConnection);
    console.log(`[DEBUG][syncEmployeeProfile] EmployeeProfile connection established`);
    
    // Check if profile already exists
    const existingProfile = await EmployeeProfile.findOne({ mainEmployeeId: employee.employeeId });
    console.log(`[DEBUG][syncEmployeeProfile] Existing profile: ${existingProfile ? 'Found' : 'Not found'}`);
    
    if (!existingProfile) {
      // Create a new profile in the employee database
      console.log(`[DEBUG][syncEmployeeProfile] Creating new profile for employeeId: ${employee.employeeId}`);
      
      try {
        const newProfile = new EmployeeProfile({
          mainEmployeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          lastUpdated: new Date()
        });
        
        console.log(`[DEBUG][syncEmployeeProfile] New profile object created, attempting to save`);
        const savedProfile = await newProfile.save();
        console.log(`[DEBUG][syncEmployeeProfile] Profile saved successfully with id: ${savedProfile._id}`);
        console.log(`[EmployeeDashboardController] Created new employee profile for: ${employee.employeeId}`);
        return true;
      } catch (saveError: any) {
        console.error(`[DEBUG][syncEmployeeProfile] Error saving new profile: ${saveError.message}`);
        if (saveError.code === 11000) {
          console.error(`[DEBUG][syncEmployeeProfile] Duplicate key error: ${JSON.stringify(saveError.keyValue)}`);
        }
        throw saveError;
      }
    } else {
      // Update core fields to ensure they're in sync
      console.log(`[DEBUG][syncEmployeeProfile] Updating existing profile for employeeId: ${employee.employeeId}`);
      try {
        existingProfile.firstName = employee.firstName;
        existingProfile.lastName = employee.lastName;
        existingProfile.email = employee.email;
        existingProfile.phone = employee.phone;
        existingProfile.department = employee.department;
        existingProfile.position = employee.position;
        existingProfile.lastUpdated = new Date();
        
        const updatedProfile = await existingProfile.save();
        console.log(`[DEBUG][syncEmployeeProfile] Profile updated successfully with id: ${updatedProfile._id}`);
        console.log(`[EmployeeDashboardController] Updated existing employee profile for: ${employee.employeeId}`);
        return true;
      } catch (updateError: any) {
        console.error(`[DEBUG][syncEmployeeProfile] Error updating profile: ${updateError.message}`);
        throw updateError;
      }
    }
  } catch (error: any) {
    console.error(`[DEBUG][syncEmployeeProfile] Error syncing employee profile: ${error.message}`);
    console.error(`[DEBUG][syncEmployeeProfile] Error stack: ${error.stack}`);
    return false;
  }
};

// @desc    Get employee attendance with enhanced data
// @route   GET /api/employee/attendance/enhanced
// @access  Private/Employee
export const getEmployeeEnhancedAttendance = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { startDate, endDate, page = 1, limit = 31 } = req.query;
  
  console.log(`[EmployeeDashboardController] Getting enhanced attendance for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get employee attendance from employee-specific database
  const EmployeeAttendance = await EmployeeAttendanceConnection;
  
  const query: any = { employeeId: employee.employeeId };
  
  // Add date range filter if provided
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  
  const skip = (Number(page) - 1) * Number(limit);
  const total = await EmployeeAttendance.countDocuments(query);
  
  const attendanceRecords = await EmployeeAttendance.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  // Get the latest month summary if available
  let monthlySummary = null;
  if (attendanceRecords.length > 0) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    // Find a record with this month's summary
    const recordWithSummary = attendanceRecords.find(record => 
      record.monthSummary && 
      record.monthSummary.month === currentMonth && 
      record.monthSummary.year === currentYear
    );
    
    if (recordWithSummary) {
      monthlySummary = recordWithSummary.monthSummary;
    }
  }
  
  // Calculate attendance statistics
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    totalHours: 0,
    averagePunctuality: 0,
    averageConsistency: 0,
    currentStreak: 0
  };
  
  // Process attendance records
  if (attendanceRecords.length > 0) {
    attendanceRecords.forEach(record => {
      stats[record.status as keyof typeof stats] += 1;
      if (record.totalHours) {
        stats.totalHours += record.totalHours;
      }
      
      // Add metrics if available
      if (record.metrics) {
        if (record.metrics.punctuality) {
          stats.averagePunctuality += record.metrics.punctuality;
        }
        if (record.metrics.consistency) {
          stats.averageConsistency += record.metrics.consistency;
        }
      }
    });
    
    // Get current streak from the most recent record
    const mostRecentRecord = attendanceRecords[0];
    if (mostRecentRecord.metrics && mostRecentRecord.metrics.consecutiveDays !== undefined) {
      stats.currentStreak = mostRecentRecord.metrics.consecutiveDays;
    }
    
    // Calculate averages
    const count = attendanceRecords.length;
    stats.averagePunctuality = Math.round((stats.averagePunctuality / count) * 10) / 10;
    stats.averageConsistency = Math.round((stats.averageConsistency / count) * 10) / 10;
  }
  
  console.log(`[EmployeeDashboardController] Retrieved ${attendanceRecords.length} enhanced attendance records for: ${employee.email}`);
  
  res.json({
    success: true,
    count: attendanceRecords.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    stats,
    monthlySummary,
    data: attendanceRecords
  });
});

// @desc    Get employee attendance performance metrics
// @route   GET /api/employee/attendance/metrics
// @access  Private/Employee
export const getAttendanceMetrics = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  console.log(`[EmployeeDashboardController] Getting attendance metrics for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get employee attendance from employee-specific database
  const EmployeeAttendance = await EmployeeAttendanceConnection;
  
  // Get all attendance records for the current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  
  const allRecords = await EmployeeAttendance.find({
    employeeId: employee.employeeId,
    date: { $gte: startOfYear }
  }).sort({ date: 1 });
  
  console.log(`[EmployeeDashboardController] Found ${allRecords.length} records for metrics calculation`);
  
  // Group by month for trend analysis
  const monthlyData: Record<string, any> = {};
  
  // Performance metrics
  const metrics = {
    totalDaysPresent: 0,
    totalDaysAbsent: 0,
    totalDaysLate: 0,
    attendanceRate: 0,
    punctualityRate: 0,
    averagePunctualityScore: 0,
    averageConsistencyScore: 0,
    longestStreak: 0,
    currentStreak: 0,
    monthlyTrends: [] as any[]
  };
  
  // Process records
  allRecords.forEach(record => {
    // Count by status
    if (record.status === 'present') {
      metrics.totalDaysPresent++;
    } else if (record.status === 'absent') {
      metrics.totalDaysAbsent++;
    } else if (record.status === 'late') {
      metrics.totalDaysLate++;
    }
    
    // Track metrics scores
    if (record.metrics) {
      if (record.metrics.punctuality) {
        metrics.averagePunctualityScore += record.metrics.punctuality;
      }
      if (record.metrics.consistency) {
        metrics.averageConsistencyScore += record.metrics.consistency;
      }
      if (record.metrics.consecutiveDays) {
        metrics.longestStreak = Math.max(metrics.longestStreak, record.metrics.consecutiveDays);
      }
    }
    
    // Group by month
    const date = new Date(record.date);
    const month = date.getMonth() + 1; // 1-12
    const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month,
        year: currentYear,
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0,
        punctualityScore: 0,
        recordCount: 0
      };
    }
    
    // Add data to monthly record
    const monthRecord = monthlyData[monthKey];
    monthRecord.recordCount++;
    if (record.status === 'present') monthRecord.present++;
    if (record.status === 'absent') monthRecord.absent++;
    if (record.status === 'late') monthRecord.late++;
    if (record.totalHours) monthRecord.totalHours += record.totalHours;
    if (record.metrics && record.metrics.punctuality) {
      monthRecord.punctualityScore += record.metrics.punctuality;
    }
  });
  
  // Calculate aggregate metrics
  const totalRecords = allRecords.length;
  if (totalRecords > 0) {
    metrics.attendanceRate = Math.round((metrics.totalDaysPresent / totalRecords) * 100);
    metrics.punctualityRate = Math.round(((metrics.totalDaysPresent) / (metrics.totalDaysPresent + metrics.totalDaysLate)) * 100) || 0;
    metrics.averagePunctualityScore = Math.round((metrics.averagePunctualityScore / totalRecords) * 10) / 10;
    metrics.averageConsistencyScore = Math.round((metrics.averageConsistencyScore / totalRecords) * 10) / 10;
  }
  
  // Get current streak from the most recent record
  if (allRecords.length > 0) {
    const mostRecentRecord = allRecords[allRecords.length - 1];
    if (mostRecentRecord.metrics && mostRecentRecord.metrics.consecutiveDays !== undefined) {
      metrics.currentStreak = mostRecentRecord.metrics.consecutiveDays;
    }
  }
  
  // Create monthly trend array
  metrics.monthlyTrends = Object.values(monthlyData).map(data => {
    const totalDays = data.present + data.absent + data.late;
    return {
      month: data.month,
      year: data.year,
      present: data.present,
      absent: data.absent,
      late: data.late,
      totalHours: Math.round(data.totalHours * 100) / 100,
      attendanceRate: totalDays > 0 ? Math.round((data.present / totalDays) * 100) : 0,
      punctualityRate: (data.present + data.late) > 0 ? 
        Math.round((data.present / (data.present + data.late)) * 100) : 0,
      averagePunctuality: data.recordCount > 0 ? 
        Math.round((data.punctualityScore / data.recordCount) * 10) / 10 : 0
    };
  });
  
  // Sort trends by month
  metrics.monthlyTrends.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  
  console.log(`[EmployeeDashboardController] Generated attendance metrics for employee: ${employee.email}`);
  
  res.json({
    success: true,
    metrics
  });
});

// @desc    Report attendance for self-reporting
// @route   POST /api/employee/attendance/report
// @access  Private/Employee
export const reportAttendance = typedAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { date, status, clockInTime, clockOutTime, notes, leaveType, leaveReason, attachments } = req.body;
  
  console.log(`[EmployeeDashboardController] Self-reporting attendance for employee: ${userId}`);
  
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Get employee from main database
  const employee = await Employee.findById(userId);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Validate the date
  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    res.status(400);
    throw new Error('Invalid date format');
  }
  
  // Normalize date to midnight
  attendanceDate.setHours(0, 0, 0, 0);
  
  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (attendanceDate > today) {
    res.status(400);
    throw new Error('Cannot report attendance for future dates');
  }
  
  // Get employee attendance from employee-specific database
  const EmployeeAttendance = await EmployeeAttendanceConnection;
  
  // Check if record already exists for this date
  const existingRecord = await EmployeeAttendance.findOne({
    employeeId: employee.employeeId,
    date: attendanceDate
  });
  
  if (existingRecord) {
    res.status(400);
    throw new Error('Attendance record already exists for this date');
  }
  
  // Create new self-reported attendance record
  const newAttendance: IAttendanceInput = {
    employeeId: employee.employeeId,
    date: attendanceDate,
    status: status as 'present' | 'absent' | 'late' | 'half_day' | 'leave',
    clockInTime,
    clockOutTime,
    notes,
    selfReported: true,
    isApproved: false, // Self-reported attendance needs approval
    attachments: attachments || []
  };
  
  // Add leave details if status is 'leave'
  if (status === 'leave' && leaveType) {
    newAttendance.leaveType = leaveType as 'sick' | 'vacation' | 'personal' | 'unpaid' | 'other';
    newAttendance.leaveReason = leaveReason;
  }
  
  // Calculate totalHours if both clock times provided
  if (clockInTime && clockOutTime) {
    // Calculation will be done by the pre-save hook in the model
  }
  
  // Create the record in employee-specific DB
  const record = new EmployeeAttendance(newAttendance);
  const savedRecord = await record.save();
  
  console.log(`[EmployeeDashboardController] Created self-reported attendance for: ${employee.email} on ${date}`);
  
  // Also create the record in the main DB
  const mainDbAttendance: IAttendanceMainDB = {
    employee: userId,
    date: attendanceDate,
    status,
    clockInTime,
    clockOutTime,
    notes
  };
  
  // Add leave details if status is 'leave'
  if (status === 'leave' && leaveType) {
    mainDbAttendance.leaveType = leaveType;
    mainDbAttendance.leaveReason = leaveReason;
  }
  
  await Attendance.create(mainDbAttendance);
  
  res.status(201).json({
    success: true,
    message: 'Attendance reported successfully. Pending approval.',
    data: savedRecord
  });
});
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Attendance from '../models/employee/AttendanceModel';
import Employee from '../models/employee/EmployeeModel';
import mongoose from 'mongoose';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin
export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await Attendance.find({}).sort({ date: -1 });
  res.json(attendance);
});

// @desc    Get attendance records by employee
// @route   GET /api/attendance/employee/:id
// @access  Private
export const getAttendanceByEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.params.id;
  
  // Verify employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get attendance records for the employee, sorted by date descending
  const records = await Attendance.find({ employeeId }).sort({ date: -1 }).limit(10);
  
  // Get attendance summary statistics
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 30));
  
  const allRecords = await Attendance.find({
    employeeId,
    date: { $gte: thirtyDaysAgo }
  });
  
  const total = allRecords.length;
  const present = allRecords.filter(record => record.status === 'present').length;
  const absent = allRecords.filter(record => record.status === 'absent').length;
  const late = allRecords.filter(record => record.status === 'late').length;
  
  // Return records and summary
  res.json({
    records,
    summary: { total, present, absent, late }
  });
});

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
export const clockIn = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.body;
  
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if already clocked in today
  const existingRecord = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });
  
  if (existingRecord) {
    if (existingRecord.clockIn) {
      res.status(400);
      throw new Error('Already clocked in today');
    }
    
    // Update existing record with clock in time
    existingRecord.clockIn = new Date();
    existingRecord.status = 'present';
    await existingRecord.save();
    
    res.json(existingRecord);
  } else {
    // Create new attendance record
    const now = new Date();
    
    // Check if clocking in late (after 8:30 AM)
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    
    const newAttendance = await Attendance.create({
      employeeId,
      date: today,
      clockIn: now,
      status: isLate ? 'late' : 'present',
    });
    
    res.status(201).json(newAttendance);
  }
});

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
export const clockOut = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.body;
  
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  
  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find today's attendance record
  const attendanceRecord = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });
  
  if (!attendanceRecord) {
    res.status(404);
    throw new Error('No clock-in record found for today');
  }
  
  if (!attendanceRecord.clockIn) {
    res.status(400);
    throw new Error('Must clock in before clocking out');
  }
  
  if (attendanceRecord.clockOut) {
    res.status(400);
    throw new Error('Already clocked out today');
  }
  
  // Update record with clock out time and calculate hours
  const now = new Date();
  attendanceRecord.clockOut = now;
  
  // Calculate hours worked (difference in milliseconds / 3600000 to get hours)
  const clockInTime = new Date(attendanceRecord.clockIn);
  const hoursWorked = (now.getTime() - clockInTime.getTime()) / 3600000;
  attendanceRecord.hours = parseFloat(hoursWorked.toFixed(2));
  
  await attendanceRecord.save();
  
  res.json(attendanceRecord);
});

// Get all attendance records with filtering options
export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    console.log('[AttendanceController] Getting all attendance records');
    const {
      employee,
      date,
      startDate,
      endDate,
      status,
      department,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    // Build filter criteria
    if (employee) {
      query.employee = new mongoose.Types.ObjectId(employee as string);
    }

    if (date) {
      const selectedDate = new Date(date as string);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      
      query.date = {
        $gte: selectedDate,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (status) {
      query.status = status;
    }

    // For department filter, we need to join with employees
    const skip = (Number(page) - 1) * Number(limit);

    console.log('[AttendanceController] Query:', JSON.stringify(query));

    // If department is specified, first get employee IDs from that department
    if (department) {
      const employeesInDept = await Employee.find({ department }).select('_id');
      const employeeIds = employeesInDept.map(emp => emp._id);
      query.employee = { $in: employeeIds };
      console.log(`[AttendanceController] Filtering by department ${department}, found ${employeeIds.length} employees`);
    }

    const total = await Attendance.countDocuments(query);
    
    // Get attendance records with employee details populated
    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[AttendanceController] Found ${attendanceRecords.length} attendance records`);
    
    return res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: attendanceRecords
    });
  } catch (error: any) {
    console.error('[AttendanceController] Error getting attendance records:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get attendance record by ID
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[AttendanceController] Getting attendance record with ID: ${id}`);

    const attendance = await Attendance.findById(id)
      .populate('employee', 'firstName lastName employeeId department position')
      .populate('approvedBy', 'firstName lastName');

    if (!attendance) {
      console.log(`[AttendanceController] Attendance record with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    console.log(`[AttendanceController] Found attendance record: ${attendance._id}`);
    return res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error getting attendance record: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create attendance record
export const createAttendance = async (req: Request, res: Response) => {
  try {
    console.log(`[AttendanceController] Creating attendance record: ${JSON.stringify(req.body)}`);
    
    const { employee, date, status, clockInTime, clockOutTime, location, notes, leaveType, leaveReason } = req.body;

    // Check if employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      console.log(`[AttendanceController] Employee with ID ${employee} not found`);
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance record already exists for this employee on this date
    const attendanceDate = new Date(date);
    const existingAttendance = await Attendance.findOne({
      employee,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      console.log(`[AttendanceController] Attendance record already exists for employee ${employee} on ${date}`);
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this employee on this date'
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employee,
      date,
      status,
      clockInTime,
      clockOutTime,
      location,
      notes,
      leaveType,
      leaveReason,
      approvedBy: req.user?._id
    });

    const savedAttendance = await attendance.save();
    console.log(`[AttendanceController] Attendance record created with ID: ${savedAttendance._id}`);

    return res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: savedAttendance
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error creating attendance record: ${error}`);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update attendance record
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[AttendanceController] Updating attendance record with ID: ${id}`);
    console.log(`[AttendanceController] Update data: ${JSON.stringify(req.body)}`);

    // Find attendance record
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      console.log(`[AttendanceController] Attendance record with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update attendance record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { 
        ...req.body,
        approvedBy: req.user?._id 
      },
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId department position');

    console.log(`[AttendanceController] Attendance record updated: ${updatedAttendance?._id}`);
    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updatedAttendance
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error updating attendance record: ${error}`);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete attendance record
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[AttendanceController] Deleting attendance record with ID: ${id}`);

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      console.log(`[AttendanceController] Attendance record with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await Attendance.findByIdAndDelete(id);
    console.log(`[AttendanceController] Deleted attendance record with ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error deleting attendance record: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get attendance summary for a date range
export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    console.log('[AttendanceController] Getting attendance summary');
    const { startDate, endDate, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query: any = {
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };

    // Check if the request is from an employee
    const isEmployee = req.user?.userType === 'employee';
    
    // If user is an employee, restrict data to only their attendance
    if (isEmployee) {
      console.log(`[AttendanceController] Employee access: ${req.user?._id} getting their own attendance summary`);
      query.employee = req.user?._id;
    } 
    // If admin is filtering by department
    else if (department) {
      const employeesInDept = await Employee.find({ department }).select('_id');
      const employeeIds = employeesInDept.map(emp => emp._id);
      query.employee = { $in: employeeIds };
      console.log(`[AttendanceController] Admin filtering summary by department ${department}, found ${employeeIds.length} employees`);
    }

    // Get aggregate statistics
    const summary = await Attendance.aggregate([
      { $match: query },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily statistics
    const dailyStats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: { 
            $push: { 
              status: "$_id.status", 
              count: "$count" 
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format summary results
    const formattedSummary = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      leave: 0
    };

    summary.forEach((item: any) => {
      formattedSummary[item._id as keyof typeof formattedSummary] = item.count;
    });

    console.log(`[AttendanceController] Generated attendance summary with ${dailyStats.length} days of data`);

    return res.status(200).json({
      success: true,
      data: {
        summary: formattedSummary,
        dailyStats,
        isEmployeeView: isEmployee
      }
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error generating attendance summary: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get employee attendance history
export const getEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 31 } = req.query;

    console.log(`[AttendanceController] Getting attendance history for employee ${employeeId}`);

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      console.log(`[AttendanceController] Employee with ID ${employeeId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const query: any = {
      employee: employee._id
    };

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

    console.log(`[AttendanceController] Found ${attendanceRecords.length} attendance records for employee ${employeeId}`);

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

    return res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      stats,
      data: {
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          position: employee.position
        },
        attendance: attendanceRecords
      }
    });
  } catch (error: any) {
    console.error(`[AttendanceController] Error getting employee attendance: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

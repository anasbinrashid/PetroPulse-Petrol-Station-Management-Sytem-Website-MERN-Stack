import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Create a separate connection for employee database
const connectEmployeeDB = async (): Promise<mongoose.Connection> => {
  try {
    console.log(`[DEBUG][EmployeeDB] Original MONGODB_URI: ${process.env.MONGODB_URI ? 'Present' : 'Missing'}`);
    
    // Use a different database name but same server
    const EMPLOYEE_DB_URI = process.env.MONGODB_URI?.replace(
      /\/[^/]+(\?|$)/, 
      '/petropulse-employees$1'
    ) || '';
    
    console.log(`[DEBUG][EmployeeDB] Connecting to employee database with URI: ${EMPLOYEE_DB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
    
    // Create a named connection for employee data
    const conn = await mongoose.createConnection(EMPLOYEE_DB_URI);
    console.log(`[DEBUG][EmployeeDB] Employee DB Connected: ${conn.host}`);
    console.log(`[DEBUG][EmployeeDB] Connection state: ${conn.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Test the connection
    conn.on('error', (err) => {
      console.error(`[DEBUG][EmployeeDB] Connection error: ${err.message}`);
    });
    
    conn.on('disconnected', () => {
      console.log(`[DEBUG][EmployeeDB] Employee database disconnected`);
    });
    
    conn.on('connected', () => {
      console.log(`[DEBUG][EmployeeDB] Employee database connected`);
    });
    
    return conn;
  } catch (error: any) {
    console.error(`[DEBUG][EmployeeDB] Error connecting to Employee DB: ${error.message}`);
    console.error(`[DEBUG][EmployeeDB] Error stack: ${error.stack}`);
    process.exit(1);
  }
};

// Export the connection promise to be used by models
console.log(`[DEBUG][EmployeeDB] Initializing employee database connection`);
const employeeDbConnection = connectEmployeeDB();
export default employeeDbConnection; 
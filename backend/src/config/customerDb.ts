import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Create a separate connection for customer database
const connectCustomerDB = async (): Promise<mongoose.Connection> => {
  try {
    console.log(`[DEBUG][CustomerDB] Original MONGODB_URI: ${process.env.MONGODB_URI ? 'Present' : 'Missing'}`);
    
    // Use a dedicated customer database URI if available, otherwise modify the main URI
    const CUSTOMER_DB_URI = process.env.MONGODB_CUSTOMER_URI || process.env.MONGODB_URI?.replace(
      /\/[^/]+(\?|$)/, 
      '/petropulse-customers$1'
    ) || '';
    
    console.log(`[DEBUG][CustomerDB] Connecting to customer database with URI: ${CUSTOMER_DB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
    
    // Create a named connection for customer data
    const conn = await mongoose.createConnection(CUSTOMER_DB_URI);
    console.log(`[DEBUG][CustomerDB] Customer DB Connected: ${conn.host}`);
    console.log(`[DEBUG][CustomerDB] Connection state: ${conn.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Test the connection
    conn.on('error', (err) => {
      console.error(`[DEBUG][CustomerDB] Connection error: ${err.message}`);
    });
    
    conn.on('disconnected', () => {
      console.log(`[DEBUG][CustomerDB] Customer database disconnected`);
    });
    
    conn.on('connected', () => {
      console.log(`[DEBUG][CustomerDB] Customer database connected`);
    });
    
    return conn;
  } catch (error: any) {
    console.error(`[DEBUG][CustomerDB] Error connecting to Customer DB: ${error.message}`);
    console.error(`[DEBUG][CustomerDB] Error stack: ${error.stack}`);
    process.exit(1);
  }
};

export default connectCustomerDB; 
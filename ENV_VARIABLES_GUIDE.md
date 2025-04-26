# Environment Variables Guide for PetroPulse

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel project settings:

```
# Main MongoDB connection URI
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/petropulse

# Dedicated database URIs for employee and customer databases
# If not provided, they will be derived from MONGODB_URI with different database names
MONGODB_EMPLOYEE_URI=mongodb+srv://username:password@cluster0.mongodb.net/petropulse-employees
MONGODB_CUSTOMER_URI=mongodb+srv://username:password@cluster0.mongodb.net/petropulse-customers

# JWT Secret for authentication tokens
JWT_SECRET=your_jwt_secret_key_here

# Node environment (Vercel sets this automatically)
NODE_ENV=production
```

## Development Environment

For local development, create a `.env` file in the backend directory with the above variables, changing:

```
NODE_ENV=development
PORT=5000
```

## Database Structure

The application is set up to use three separate MongoDB databases:
1. Main database (`petropulse`) - General application data
2. Employee database (`petropulse-employees`) - Employee-specific data
3. Customer database (`petropulse-customers`) - Customer-specific data

If you provide only the `MONGODB_URI`, the other two databases will be created automatically using the same MongoDB connection but with different database names.

For better isolation or to use completely different MongoDB instances, you can provide separate URIs for each database. 
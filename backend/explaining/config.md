# Backend Configuration Files Explanation

This document explains the purpose and functionality of the three configuration files in the `backend/config` directory.

## 1. config.js

This file contains the main configuration settings for your backend application.

### Key Components:

1. **Environment Variables**: 
   - The file starts by loading environment variables from a `.env` file using `require('dotenv').config()`
   - This allows you to store sensitive information like API keys and passwords outside your code

2. **Server Configuration**:
   - `port`: Sets the port your server will run on (5000 by default)
   - `nodeEnv`: Sets the environment (development, production, etc.)

3. **JWT Configuration**:
   - JWT (JSON Web Tokens) are used for user authentication
   - `secret`: A key used to sign tokens (should be kept secure)
   - `expiresIn`: How long tokens remain valid (30 days by default)

4. **CORS Configuration**:
   - CORS (Cross-Origin Resource Sharing) controls which domains can access your API
   - `origin`: Which frontend URL can connect to your backend
   - `credentials`: Allows cookies to be sent with requests

5. **File Upload Configuration**:
   - `maxFileSize`: Maximum size of uploaded files (10MB by default)
   - `uploadDir`: Directory where files will be stored
   - `allowedFileTypes`: List of file types your application accepts (images, documents, etc.)

## 2. db.js

This file handles the database connection using Sequelize (an ORM for Node.js).

### Key Components:

1. **Imports**:
   - Imports Sequelize library
   - Imports database configuration from `database.js` based on the current environment

2. **Sequelize Configuration**:
   - Creates a new Sequelize instance with database credentials
   - Sets options like host, dialect (PostgreSQL), and logging behavior

3. **Connection Function**:
   - `connectDB()`: Attempts to connect to the database
   - Logs success message if connection works
   - Logs error and exits process if connection fails

4. **Exports**:
   - Exports the Sequelize instance and connection function for use in other files

## 3. database.js

This file contains specific database configuration for different environments.

### Key Components:

1. **Development Environment**:
   - Used during local development
   - Contains database credentials for your local PostgreSQL database
   - Database name: "studyconnect"

2. **Test Environment**:
   - Used for running tests
   - Similar to development but uses a separate database "studyconnect_test"

3. **Production Environment**:
   - Used when your app is deployed to production
   - Uses environment variables for credentials (more secure)
   - Has additional SSL configuration for secure database connections

## How They Work Together

These three files work together to provide a complete configuration system for your backend:
- `config.js` handles general application settings
- `database.js` stores database credentials for different environments
- `db.js` uses those credentials to establish the actual database connection

This modular approach makes your application more maintainable and allows for different configurations in different environments. 
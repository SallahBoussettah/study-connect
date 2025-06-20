# Backend Controllers Explanation

## What are Controllers?

Controllers are a fundamental part of the MVC (Model-View-Controller) architecture in web applications. They serve as the intermediary between the Models (data) and the Views (user interface). In a backend API context like this project, controllers handle:

1. **Request Processing**: They receive HTTP requests from clients (like your frontend application)
2. **Data Manipulation**: They interact with models to fetch, create, update, or delete data
3. **Response Formatting**: They format the data appropriately and send HTTP responses back to clients
4. **Business Logic**: They contain the application's business logic that determines how data should be processed

Controllers help maintain a clean separation of concerns in your application, making the code more organized, maintainable, and testable.

## 1. authController.js

The Authentication Controller handles user registration, login, and profile management.

### Key Functions:

1. **register**: 
   - Creates a new user account in the database
   - Collects user information (firstName, lastName, email, password)
   - Returns a JWT (JSON Web Token) for authentication

2. **login**:
   - Validates user credentials (email and password)
   - Updates the user's last login timestamp
   - Returns a JWT token upon successful authentication

3. **getMe**:
   - Retrieves the current logged-in user's profile information
   - Excludes sensitive data like passwords from the response

4. **updateProfile**:
   - Updates the user's profile information (name, email, bio, etc.)
   - Handles partial updates by only changing specified fields

5. **logout**:
   - Handles user logout functionality
   - Returns a success message

6. **sendTokenResponse** (Helper Function):
   - Creates a JWT token using the user's information
   - Formats the user data for the response
   - Sends the token and user data in the response

## 2. dashboardController.js

The Dashboard Controller provides personalized data for the user's dashboard view.

### Key Functions:

1. **getDashboardData**:
   - Fetches personalized dashboard data for the current user
   - Uses caching to improve performance (stores data for 1 minute)
   - Collects and formats various types of data:
     - Active study rooms the user is a member of
     - Upcoming events
     - Recent resources uploaded by the user
     - Unread notifications

2. **getAdminDashboardData**:
   - Provides administrative overview data (for admin users only)
   - Collects statistics like:
     - Total users count
     - New users registered today
     - Active users in the past 7 days
     - Total resources and study rooms
     - Recent user registrations

3. **Data Formatting**:
   - Transforms database records into a clean, frontend-friendly format
   - Calculates relative times for notifications (e.g., "2 hours ago")
   - Generates placeholder images for study rooms without images

## 3. studyRoomController.js

The Study Room Controller manages all operations related to study rooms, which are the core collaborative spaces in the application.

### Key Functions:

1. **getStudyRooms**:
   - Retrieves two sets of study rooms:
     - Rooms the user has joined (userRooms)
     - Rooms available for discovery (discoverRooms)
   - Includes related data like creator, subject, and resource count
   - Formats the data for frontend display

2. **getStudyRoom**:
   - Fetches detailed information about a specific study room
   - Includes related data:
     - Creator details
     - Member list with roles
     - Subject information
     - Resources with uploader details
     - Upcoming events
   - Verifies the user has permission to access the room

3. **Additional Functions** (not shown in the excerpt but likely included):
   - Creating new study rooms
   - Joining/leaving study rooms
   - Managing room membership and roles
   - Updating room information
   - Handling room activities and resources

## How Controllers Work Together

These controllers work together to provide a complete backend API for your application:

1. **Authentication Flow**:
   - Users register or log in through the authController
   - The authController provides a JWT token
   - This token is used to authenticate requests to other controllers

2. **User Experience Flow**:
   - After login, users see their personalized dashboard via dashboardController
   - Users can view and join study rooms through studyRoomController
   - Within rooms, users can participate in various activities

3. **Data Security**:
   - Controllers verify user authentication and permissions
   - They ensure users can only access data they're authorized to see
   - They validate input data before processing

Controllers are essential for organizing your application's logic into manageable, focused components that each handle a specific aspect of your application's functionality. 
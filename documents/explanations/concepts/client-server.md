# Client-Server Architecture Simplified 🏗️

## What is Client-Server Architecture?

Client-server architecture is like a restaurant:
- **Client** = Customers who order food (your web browser)
- **Server** = Kitchen that prepares food (backend application)
- **Request** = Food order
- **Response** = Prepared meal

In web applications:
- The **client** is the web browser running your React app
- The **server** is your Express/Node.js application
- They communicate by sending requests and responses over HTTP

## How It Works

```
┌─────────────┐                 ┌─────────────┐
│             │    Request      │             │
│   Client    │ ─────────────► │   Server    │
│  (Browser)  │                 │  (Node.js)  │
│             │ ◄───────────── │             │
└─────────────┘    Response     └─────────────┘
                                      │
                                      ▼
                                ┌─────────────┐
                                │  Database   │
                                │ (Postgres)  │
                                └─────────────┘
```

## Two Key Examples from StudyConnect

### Example 1: User Authentication Flow

When a user logs in to StudyConnect:

1. **Client**: User enters email and password in the login form
2. **Client**: React app sends credentials to the server
   ```javascript
   // src/services/authService.js
   
   const login = async (email, password) => {
     try {
       // Send HTTP POST request to server
       const response = await axios.post('/api/auth/login', {
         email,
         password
       });
       
       // Store JWT token in local storage
       localStorage.setItem('token', response.data.token);
       
       return response.data;
     } catch (error) {
       throw error.response.data;
     }
   };
   ```

3. **Server**: Receives request and verifies credentials
   ```javascript
   // backend/controllers/authController.js
   
   const login = async (req, res) => {
     try {
       const { email, password } = req.body;
       
       // Find user by email
       const user = await User.findOne({ where: { email } });
       
       // Check if user exists
       if (!user) {
         return res.status(401).json({
           success: false,
           message: 'Invalid credentials'
         });
       }
       
       // Check if password matches
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         return res.status(401).json({
           success: false,
           message: 'Invalid credentials'
         });
       }
       
       // Create JWT token
       const token = jwt.sign(
         { id: user.id },
         process.env.JWT_SECRET,
         { expiresIn: '24h' }
       );
       
       // Send response with token and user data
       res.json({
         success: true,
         token,
         user: {
           id: user.id,
           firstName: user.firstName,
           lastName: user.lastName,
           email: user.email,
           role: user.role
         }
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         message: 'Server error'
       });
     }
   };
   ```

4. **Client**: Receives token and user data, updates UI
5. **Client**: Stores token for future authenticated requests

### Example 2: Fetching Study Rooms

When loading the dashboard with study rooms:

1. **Client**: Component mounts and requests study rooms
   ```javascript
   // src/components/dashboard/StudyRooms.jsx
   
   import React, { useState, useEffect } from 'react';
   import studyRoomService from '../../services/studyRoomService';
   
   const StudyRooms = () => {
     const [rooms, setRooms] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       // Fetch study rooms when component mounts
       const fetchRooms = async () => {
         try {
           setLoading(true);
           const data = await studyRoomService.getAllRooms();
           setRooms(data);
           setLoading(false);
         } catch (err) {
           setError('Failed to load study rooms');
           setLoading(false);
         }
       };
       
       fetchRooms();
     }, []);
     
     if (loading) return <div>Loading study rooms...</div>;
     if (error) return <div>Error: {error}</div>;
     
     return (
       <div className="study-rooms">
         <h2>Available Study Rooms</h2>
         {rooms.length === 0 ? (
           <p>No study rooms available</p>
         ) : (
           <ul>
             {rooms.map(room => (
               <li key={room.id}>
                 <h3>{room.name}</h3>
                 <p>{room.description}</p>
                 <span>Participants: {room.participantCount}</span>
               </li>
             ))}
           </ul>
         )}
       </div>
     );
   };
   
   export default StudyRooms;
   ```

2. **Client Service**: Makes API call with authentication
   ```javascript
   // src/services/studyRoomService.js
   
   import axios from 'axios';
   
   // Set up axios with auth token
   const api = axios.create({
     baseURL: '/api'
   });
   
   // Add auth token to each request
   api.interceptors.request.use(config => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   
   const getAllRooms = async () => {
     try {
       const response = await api.get('/study-rooms');
       return response.data.data;
     } catch (error) {
       throw error.response.data;
     }
   };
   
   export default { getAllRooms };
   ```

3. **Server**: Receives request, authenticates, and fetches data
   ```javascript
   // backend/controllers/studyRoomController.js
   
   const getAllRooms = async (req, res) => {
     try {
       // Get all study rooms with participant count
       const rooms = await StudyRoom.findAll({
         attributes: [
           'id', 
           'name', 
           'description', 
           'isPublic',
           [
             sequelize.literal('(SELECT COUNT(*) FROM room_participants WHERE room_participants.room_id = StudyRoom.id)'),
             'participantCount'
           ]
         ],
         where: {
           // Only show public rooms or rooms where user is participant
           [Op.or]: [
             { isPublic: true },
             { '$participants.user_id$': req.user.id }
           ]
         },
         include: [
           {
             model: User,
             as: 'participants',
             attributes: [],
             through: { attributes: [] }
           }
         ],
         group: ['StudyRoom.id']
       });
       
       res.json({
         success: true,
         data: rooms
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         message: 'Failed to fetch study rooms',
         error: error.message
       });
     }
   };
   ```

4. **Server**: Sends JSON response back to client
5. **Client**: Receives data and updates UI with study rooms

## Key Concepts

### 1. Separation of Concerns

- **Frontend (Client)**: Handles UI, user interaction, and data presentation
- **Backend (Server)**: Handles business logic, data processing, and database operations

### 2. API (Application Programming Interface)

The contract between client and server:
- **Endpoints**: URLs that the client can request (e.g., `/api/auth/login`)
- **Methods**: HTTP verbs (GET, POST, PUT, DELETE) that define the action
- **Request Body**: Data sent from client to server
- **Response**: Data sent from server to client

### 3. Authentication Flow

```
┌─────────┐  1. Login Request   ┌─────────┐
│ Client  │ ─────────────────► │ Server  │
└─────────┘                     └─────────┘
     │                               │
     │                               │ 2. Verify User
     │                               ▼
     │                          ┌─────────┐
     │                          │ Database│
     │                          └─────────┘
     │                               │
     │ 4. Store Token               │ 3. Generate JWT
     ▼                               │
┌─────────┐  ◄────────────────  ┌─────────┐
│ Client  │    5. Send Token    │ Server  │
└─────────┘                     └─────────┘
```

## Benefits of Client-Server Architecture

1. **Scalability**: Each part can scale independently
2. **Separation of Concerns**: Frontend and backend teams can work separately
3. **Security**: Sensitive operations happen on the server
4. **Reusability**: Same server can support multiple clients (web, mobile)
5. **Maintenance**: Updates to one part don't require changing the other

## Summary

- Client-server architecture divides applications into frontend (client) and backend (server)
- They communicate through HTTP requests and responses using APIs
- The client handles UI and user interaction
- The server handles data processing, business logic, and database operations
- StudyConnect uses React for the client and Express/Node.js for the server 
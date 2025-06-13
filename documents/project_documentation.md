# StudyConnect - Project Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Database Schema](#database-schema)
- [System Architecture](#system-architecture)
- [User Flows](#user-flows)
- [Implementation Plan](#implementation-plan)
- [Technical Specifications](#technical-specifications)
- [Timeline](#timeline)
- [Tools & Resources](#tools--resources)

## Project Overview

StudyConnect is a web platform designed to facilitate student interactions, collaborative learning, and resource sharing. The platform enables students to create and join study rooms, share resources, communicate in real-time, schedule events, and organize study materials.

### Key Features
- User authentication and profile management
- Study room creation and management
- Real-time messaging
- Resource sharing and organization
- Event scheduling and attendance tracking
- Flashcard creation and study tools
- Study session tracking

### Target Users
- University students
- High school students
- Study groups
- Educational institutions
- Self-learners

## Database Schema

### Class Diagram
```mermaid
classDiagram
    %% User and related tables
    class User {
        +UUID id
        +VARCHAR(255) email
        +VARCHAR(255) password
        +VARCHAR(100) first_name
        +VARCHAR(100) last_name
        +ENUM role
        +VARCHAR(255) avatar
        +TEXT bio
        +VARCHAR(255) institution
        +VARCHAR(100) major
        +VARCHAR(50) year_of_study
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +TIMESTAMP last_login
        +BOOLEAN email_verified
        +BOOLEAN is_active
    }
    
    class UserPreferences {
        +UUID id
        +UUID user_id
        +BOOLEAN notification_email
        +BOOLEAN notification_push
        +VARCHAR(50) theme
        +VARCHAR(50) language
        +VARCHAR(100) timezone
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    
    class UserSubjects {
        +UUID id
        +UUID user_id
        +UUID subject_id
        +ENUM proficiency_level
        +BOOLEAN is_teaching
        +TIMESTAMP created_at
    }
    
    %% Subject table
    class Subject {
        +UUID id
        +VARCHAR(100) name
        +VARCHAR(100) category
        +TEXT description
        +VARCHAR(255) icon
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    
    %% Study Room tables
    class StudyRoom {
        +UUID id
        +VARCHAR(255) name
        +TEXT description
        +UUID subject_id
        +UUID owner_id
        +BOOLEAN is_private
        +VARCHAR(50) access_code
        +INTEGER max_members
        +VARCHAR(255) image
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +TIMESTAMP last_active
        +ENUM status
    }
    
    class StudyRoomMember {
        +UUID id
        +UUID room_id
        +UUID user_id
        +ENUM role
        +TIMESTAMP joined_at
        +TIMESTAMP last_active_at
        +BOOLEAN is_favorite
        +ENUM status
    }
    
    class StudyRoomRequest {
        +UUID id
        +UUID room_id
        +UUID user_id
        +TEXT message
        +ENUM status
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +TEXT response_message
        +UUID responded_by
    }
    
    %% Message table
    class Message {
        +UUID id
        +UUID room_id
        +UUID sender_id
        +TEXT content
        +BOOLEAN is_system
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +BOOLEAN is_edited
        +UUID parent_id
        +JSONB read_by
    }
    
    %% Resource table
    class Resource {
        +UUID id
        +VARCHAR(255) title
        +TEXT description
        +VARCHAR(255) file_url
        +VARCHAR(50) file_type
        +INTEGER file_size
        +UUID uploaded_by
        +UUID room_id
        +BOOLEAN is_public
        +INTEGER download_count
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +JSONB tags
    }
    
    %% Event tables
    class Event {
        +UUID id
        +VARCHAR(255) title
        +TEXT description
        +UUID room_id
        +UUID created_by
        +TIMESTAMP start_time
        +TIMESTAMP end_time
        +BOOLEAN is_recurring
        +VARCHAR(100) recurrence_pattern
        +INTEGER reminder_time
        +VARCHAR(255) location
        +VARCHAR(255) meeting_link
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +ENUM status
    }
    
    class EventAttendee {
        +UUID id
        +UUID event_id
        +UUID user_id
        +ENUM status
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +BOOLEAN reminder_sent
    }
    
    %% Flashcard tables
    class FlashcardDeck {
        +UUID id
        +VARCHAR(255) title
        +TEXT description
        +UUID owner_id
        +UUID subject_id
        +BOOLEAN is_public
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +INTEGER card_count
        +INTEGER study_count
    }
    
    class Flashcard {
        +UUID id
        +UUID deck_id
        +TEXT front_content
        +TEXT back_content
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +ENUM difficulty
        +INTEGER position
    }
    
    %% Study Session table
    class StudySession {
        +UUID id
        +UUID user_id
        +UUID room_id
        +TIMESTAMP start_time
        +TIMESTAMP end_time
        +INTEGER duration
        +INTEGER focus_score
        +TEXT notes
        +TIMESTAMP created_at
    }
    
    %% Notification table
    class Notification {
        +UUID id
        +UUID user_id
        +VARCHAR(255) title
        +TEXT content
        +VARCHAR(50) type
        +UUID related_id
        +BOOLEAN is_read
        +TIMESTAMP created_at
        +VARCHAR(255) action_url
    }
    
    %% Relationships
    User "1" --> "1" UserPreferences : has
    User "1" --> "*" UserSubjects : has
    User "1" --> "*" StudyRoom : owns
    User "1" --> "*" StudyRoomMember : participates
    User "1" --> "*" Message : sends
    User "1" --> "*" Resource : uploads
    User "1" --> "*" Event : creates
    User "1" --> "*" EventAttendee : attends
    User "1" --> "*" FlashcardDeck : owns
    User "1" --> "*" StudySession : tracks
    User "1" --> "*" Notification : receives
    User "1" --> "*" StudyRoomRequest : requests
    
    Subject "1" --> "*" StudyRoom : categorizes
    Subject "1" --> "*" UserSubjects : studied_by
    Subject "1" --> "*" FlashcardDeck : categorizes
    
    StudyRoom "1" --> "*" StudyRoomMember : contains
    StudyRoom "1" --> "*" Message : contains
    StudyRoom "1" --> "*" Resource : contains
    StudyRoom "1" --> "*" Event : hosts
    StudyRoom "1" --> "*" StudyRoomRequest : receives
    StudyRoom "1" --> "*" StudySession : hosts
    
    Event "1" --> "*" EventAttendee : has
    
    FlashcardDeck "1" --> "*" Flashcard : contains
    
    Message "*" --> "0..1" Message : replies_to
```

### Individual Tables

For detailed information on each table's structure, see [Individual Tables Documentation](excalidraw_individual_tables.md).

## System Architecture

### User Flow Diagram
```mermaid
flowchart TD
    A[Student] -->|Register/Login| B[Authentication]
    B --> C[Dashboard]
    
    C -->|Create| D[Study Room]
    C -->|Join| D
    C -->|View| E[Profile]
    C -->|Manage| F[Flashcards]
    
    D -->|Chat| G[Messages]
    D -->|Share| H[Resources]
    D -->|Schedule| I[Events]
    D -->|Video Call| J[Real-time Communication]
    
    F -->|Create| K[Flashcard Deck]
    K -->|Add| L[Flashcards]
    K -->|Study| M[Study Session]
    
    I -->|Attend| N[Event Attendance]
    
    G -->|Notification| A
    N -->|Reminder| A
```

### Real-time Messaging Sequence
```mermaid
sequenceDiagram
    participant User1 as Student 1
    participant Server
    participant Socket as Socket.IO
    participant DB as Database
    participant User2 as Student 2
    
    User1->>Server: Authenticate
    Server->>User1: JWT Token
    User1->>Socket: Connect with token
    Socket->>Socket: Authenticate user
    
    User1->>Socket: Join room
    Socket->>DB: Log room entry
    Socket->>User2: User1 joined notification
    
    User1->>Socket: Send message
    Socket->>DB: Store message
    Socket->>User2: New message notification
    
    User2->>Socket: Mark message as read
    Socket->>DB: Update message status
    
    User1->>Socket: Start typing
    Socket->>User2: User1 is typing
    
    User1->>Socket: Stop typing
    Socket->>User2: User1 stopped typing
    
    User1->>Socket: Disconnect
    Socket->>DB: Update user status
    Socket->>User2: User1 went offline
```

### Study Room Creation Flow
```mermaid
flowchart TD
    A[User] -->|Click Create Room| B[Create Room Form]
    B -->|Fill Details| C{Is Private?}
    C -->|Yes| D[Set Access Code]
    C -->|No| E[Create Public Room]
    D --> F[Submit Form]
    E --> F
    F -->|API Request| G[Backend Validation]
    G -->|Success| H[Room Created]
    G -->|Error| I[Show Error]
    I --> B
    H --> J[Redirect to Room]
    J -->|Initialize| K[Socket Connection]
    K --> L[Room Dashboard]
```

### Authentication Flow
```mermaid
flowchart TD
    A[User] -->|Visit Site| B[Landing Page]
    B -->|Click Login| C[Login Form]
    B -->|Click Register| D[Registration Form]
    
    C -->|Submit| E{Valid Credentials?}
    E -->|Yes| F[Generate JWT]
    E -->|No| G[Show Error]
    G --> C
    
    D -->|Submit| H{Valid Data?}
    H -->|Yes| I[Create User]
    H -->|No| J[Show Error]
    J --> D
    I --> K[Send Verification Email]
    K --> F
    
    F --> L[Store Token]
    L --> M[Redirect to Dashboard]
```

## Implementation Plan

### Technology Stack
- **Frontend**: React.js, Redux, Socket.io Client, Material UI
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL with UUID extension
- **Authentication**: JWT-based authentication
- **File Storage**: AWS S3 or equivalent
- **Deployment**: Docker, AWS/GCP/Azure

### Project Structure

#### Backend Structure
```
/backend
  /src
    /controllers    # Request handlers
    /models         # Database models
    /routes         # API routes
    /middlewares    # Auth, validation, etc.
    /services       # Business logic
    /utils          # Helper functions
    /config         # Configuration files
    /sockets        # Socket.io handlers
    /validators     # Input validation
    app.js          # Express app setup
    server.js       # Server entry point
  /tests            # Unit and integration tests
  package.json
  .env.example
  Dockerfile
```

#### Frontend Structure
```
/frontend
  /public           # Static assets
  /src
    /components     # Reusable UI components
    /pages          # Page components
    /contexts       # React contexts (Auth, etc.)
    /hooks          # Custom React hooks
    /services       # API service calls
    /utils          # Helper functions
    /assets         # Images, styles, etc.
    /redux          # State management
    App.js          # Main component
    index.js        # Entry point
  package.json
  .env.example
  Dockerfile
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

#### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id/preferences` - Update user preferences
- `GET /api/users/:id/subjects` - Get user subjects
- `POST /api/users/:id/subjects` - Add user subject

#### Study Rooms
- `GET /api/rooms` - List study rooms
- `POST /api/rooms` - Create study room
- `GET /api/rooms/:id` - Get study room details
- `PUT /api/rooms/:id` - Update study room
- `DELETE /api/rooms/:id` - Delete study room
- `POST /api/rooms/:id/join` - Join study room
- `POST /api/rooms/:id/leave` - Leave study room

#### Messages
- `GET /api/rooms/:id/messages` - Get room messages
- `POST /api/rooms/:id/messages` - Send message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/:id/read` - Mark message as read

#### Resources
- `GET /api/rooms/:id/resources` - Get room resources
- `POST /api/rooms/:id/resources` - Upload resource
- `GET /api/resources/:id` - Get resource details
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/resources/:id/download` - Download resource

#### Events
- `GET /api/rooms/:id/events` - Get room events
- `POST /api/rooms/:id/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/attend` - Attend event

#### Flashcards
- `GET /api/decks` - List flashcard decks
- `POST /api/decks` - Create flashcard deck
- `GET /api/decks/:id` - Get deck details
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck
- `GET /api/decks/:id/cards` - Get deck cards
- `POST /api/decks/:id/cards` - Create flashcard
- `PUT /api/cards/:id` - Update flashcard
- `DELETE /api/cards/:id` - Delete flashcard

### Implementation Phases

#### Phase 1: Core Features
- User authentication and profiles
- Study room creation and management
- Basic messaging functionality

#### Phase 2: Enhanced Collaboration
- Real-time messaging with Socket.io
- Resource sharing and management
- Event scheduling

#### Phase 3: Study Tools
- Flashcard system
- Study session tracking
- Advanced search and filters

#### Phase 4: Optimization & Additional Features
- Performance optimizations
- Mobile responsiveness improvements
- Notifications system
- Analytics dashboard

## Technical Specifications

### Security Considerations
- HTTPS for all communications
- JWT with short expiry and refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- CSRF protection
- Rate limiting for API endpoints
- SQL injection prevention with prepared statements

### Scalability Considerations
- Horizontal scaling for API servers
- Database connection pooling
- Caching layer with Redis
- CDN for static assets
- Optimized database queries with proper indexing
- Pagination for large data sets

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance testing for high-traffic scenarios
- Security testing for vulnerabilities

## Timeline

### Month 1: Planning & Setup
- Week 1: Project requirements and planning
- Week 2: Database schema design and API specifications
- Week 3: Development environment setup
- Week 4: Authentication system implementation

### Month 2: Core Development
- Week 5-6: User profile and study room features
- Week 7-8: Messaging system and real-time communication

### Month 3: Feature Expansion
- Week 9-10: Resource sharing and event scheduling
- Week 11-12: Flashcard system and study tools

### Month 4: Refinement & Deployment
- Week 13-14: Testing, bug fixing, and optimization
- Week 15: Documentation and final touches
- Week 16: Deployment and monitoring setup

## Tools & Resources

### Development Tools
- **Code Editor**: Visual Studio Code
- **Version Control**: Git & GitHub
- **API Testing**: Postman
- **Database Management**: pgAdmin
- **Design**: Figma

### Deployment & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud Provider**: AWS/GCP/Azure
- **Monitoring**: Sentry, Prometheus & Grafana

### Libraries & Frameworks
- **Frontend**: 
  - React.js for UI components
  - Redux for state management
  - Socket.io Client for real-time features
  - Material UI for design system
  - Axios for API requests
  
- **Backend**:
  - Express.js for API framework
  - Sequelize for ORM
  - Socket.io for WebSockets
  - Passport.js for authentication
  - Multer for file uploads
  - Joi for validation 
# Final Year Project - StudyConnect

## Acknowledgments

We would like to express our deepest gratitude to Mr. OUADIEE MAK and the entire teaching team who have excellently delivered the Web Administration and Development training program.

May the distinguished members of the jury find here the expression of our sincere appreciation for agreeing to evaluate our work. We wish to extend our warmest thanks to all those who have contributed, directly or indirectly, to the completion of this project.

We are particularly grateful to Mr. FOUAD TAZANI, who entrusted us with this subject and provided constant guidance throughout our project. His interest in our work, his kindness, his scientific rigor, as well as our enriching discussions have been invaluable support, enabling us to successfully complete this study.

We also extend these acknowledgments to all the faculty members who have contributed to our education, as well as all the administrative and technical staff at SAGIM School for their availability and assistance throughout this journey.

## Dedication

We dedicate this work, the result of sustained effort and passion, to those who have formed the foundation of our journey and the sources of our inspiration.

To our beloved mothers, for their boundless tenderness, their subtle encouragement, and their unwavering love that constituted our first momentum. Their confidence in us has always inspired us to believe in our dreams.

To our dear fathers, for their wisdom, their precious advice, and their unfailing support that have illuminated our path. Their example remains a constant source of inspiration and determination.

To the Director of SAGIM company, whose vision and commitment have contributed to creating an environment conducive to the emergence of talents. We express our sincere gratitude for the excellence of the education provided.

To our mentor, Mrs. Ben Zakia, whose expertise, perseverance, and teaching methods have transformed each challenge into a learning opportunity. Your guidance has played a decisive role in the success of this project.

Finally, to our fellow classmates with whom we shared this enriching experience, full of discoveries, interactions, and memorable moments. Your support and spirit of camaraderie have made this journey all the more rewarding.

May this dedication bear witness to our profound gratitude towards all those who have participated, directly or indirectly, in the accomplishment of this project.

## Abstract

StudyConnect represents a significant innovation in the field of educational technologies, combining a robust full-stack architecture with an intuitive user experience. Our comprehensive analysis of the platform reveals a carefully designed web application that integrates modern technologies to address contemporary challenges in collaborative education.

The backend architecture of StudyConnect, developed with Node.js and Express, relies on a PostgreSQL database managed by Sequelize ORM, offering a sophisticated relational data structure that supports multiple dimensions of educational interaction. The JWT authentication system ensures user data security, while the Socket.IO implementation enables real-time interactions essential for synchronous collaboration.

The frontend, built with React.js, employs a modular architecture with contextual state management that facilitates a smooth and responsive user experience. The user interface, inspired by modern communication platforms, offers intuitive navigation through various features of virtual study rooms, resource sharing, and multimodal communication.

This synergy between a robust backend and ergonomic frontend makes StudyConnect a comprehensive solution that effectively addresses the growing needs of digital collaborative learning environments.

## Introduction

The rapid evolution of digital technologies and the transformation of learning methods have created an urgent need for educational platforms that transcend the limitations of traditional tools. Our in-depth technical analysis of StudyConnect reveals an innovative approach that deserves to be explored in this final year project.

StudyConnect distinguishes itself through its sophisticated technical architecture that addresses contemporary challenges in collaborative education. By examining its structure, we have identified a meticulously designed full-stack approach that combines performance, security, and user experience. The backend, structured according to MVC (Model-View-Controller) principles, provides a solid foundation for data management and business logic, while the modular frontend facilitates intuitive interaction with the system.

This project represents a successful convergence between software engineering and modern pedagogy. Our study aims to dissect the technical choices underlying this platform, analyze their effectiveness in the current educational context, and propose evolutionary perspectives to meet the future needs of digital learning communities. Through this analysis, we hope to contribute to the advancement of knowledge in the field of educational technologies and inspire future innovations in this rapidly transforming sector.

## System Overview

Our analysis of StudyConnect reveals an elegant system architecture based on a clear separation between backend and frontend, communicating through a RESTful API and websockets for real-time functionality.

The backend, developed with Node.js and Express, adopts a well-organized MVC structure with Sequelize models connected to PostgreSQL. Key strengths include JWT authentication, Socket.IO integration for real-time communications, and specialized middleware for security and file management.

The React frontend uses Context API for state management and features a hierarchical component architecture. React Router handles secure navigation, while the interface adapts perfectly to all devices.

StudyConnect's major technical assets include horizontal scalability, multi-layered security, caching mechanisms for optimized performance, and a robust system for managing shared resources. This architecture provides a solid foundation for the platform's advanced collaborative features.

## Specifications

Our analysis of the StudyConnect project has identified the key functional and technical requirements that guided its development. The platform addresses a crucial need in the digital educational ecosystem: providing an integrated collaborative environment for students.

### Main Objectives

The platform aims to solve several issues identified during our analysis:
- Fragmentation of existing collaborative study tools
- Coordination difficulties between geographically dispersed students
- Lack of solutions specifically designed for academic needs
- Need for integration between communication, resource sharing, and study tools

### Essential Features

Our technical examination confirmed the implementation of the following key features:

1. **User Management**: Robust authentication system, customizable profiles, and preference management
2. **Virtual Study Rooms**: Thematic collaborative spaces with access control and personalization
3. **Real-time Communication**: Instant messaging with presence indicators and persistent history
4. **Resource Sharing**: Structured system for uploading, categorizing, and previewing documents
5. **Integrated Learning Tools**: Flashcard functionality and study session tracking

### Technical Constraints

The implemented architecture respects several technical constraints identified as essential:

- **Security**: Protection of personal data and secure communications
- **Performance**: Optimization for different network conditions and devices
- **Scalability**: Architecture allowing horizontal scaling to support user growth
- **Maintainability**: Modular code organization facilitating future developments

This design effectively meets user needs while establishing a solid technical foundation for future platform developments.

## Task Planning

Overview of work distribution:

| PHASE | DESCRIPTION | DURATION |
|-------|-------------|----------|
| Phase 1 | Design and Planning | 2 weeks |
| Phase 2 | Development of Core Features | 4 weeks |
| Phase 3 | Implementation of Collaborative Features | 2 weeks |
| Phase 4 | Learning Tools and Optimization | 2 weeks |
| Phase 5 | Finalization and Launch | 2 weeks |

### Simplified Gantt Chart (Months - Main Tasks)

| Task | Month 1 | Month 2 | Month 3 |
|------|---------|---------|---------|
| Analysis & Design | ✓ |  |  |
| UI/UX Mockups | ✓ |  |  |
| Frontend Development |  | ✓ |  |
| Backend Development |  | ✓ | ✓ |
| Testing & Optimization |  |  | ✓ |
| Documentation |  |  | ✓ |
| Defense Presentation |  |  | ✓ |

### Planning Notes

✅ **Active task during the month**: Analysis & Design: Specifications, needs assessment. Mockups: Wireframes and prototypes. Development: Frontend (interfaces) + Backend (functionalities). Testing: Verification of features (chat, video, etc.).

🚩 **Points to note in your report**: Flexibility: Phases may slightly overlap (e.g., testing at the end of development). Estimated durations: Adjust according to actual progress (e.g., more time for collaborative tools if complex).

## UML Analysis

UML (Unified Modeling Language) diagrams provide visual representations of the StudyConnect system architecture and behavior. The following diagrams illustrate key aspects of the application.

### Use Case Diagram

This diagram illustrates the interactions between system actors (Student, Teacher, Administrator) and the available functionality grouped by modules.

Path: `diagrams/use_case_diagram.puml`

### Class Diagram

The class diagram represents the data model of StudyConnect, showing classes, attributes, operations, and relationships between entities.

Path: `diagrams/class_diagram.puml`

### Sequence Diagram

This diagram shows the messaging flow between components during real-time communication in a study room.

Path: `diagrams/sequence_diagram.puml`

### Component Diagram

The component diagram illustrates the high-level architectural components of the system and their interactions.

Path: `diagrams/component_diagram.puml`

### Deployment Diagram

This diagram shows the physical deployment architecture of StudyConnect across different servers and environments.

Path: `diagrams/deployment_diagram.puml`

### Package Diagram

The package diagram visualizes the organization of the StudyConnect project into logical modules and their dependencies.

**Frontend**: Authentication (login/registration), Dashboard (overview), Room (chat, video), AdminPanel (administration).

**Backend**: UserManagement (authentication), RoomManagement (room management), Communication (WebSockets), FileStorage (files).

**Database**: User and Room models for data persistence.

Path: `diagrams/package_diagram.puml`

All diagrams are available in both PlantUML format (.puml) for text-based representation and StarUML format (.mdj) for visual editing.

## Tools Used

### 🔄 UML Modeling Tools

StarUML (limited free version)
* Type: Complete UML software
* Purpose: Create professional UML diagrams
* Note: Functional free version, but some features locked

### 🎨 UI Design and Mockup Tools

* Direct code development without specific design software
* Use of Tailwind CSS to rapidly implement the user interface

### 📊 Presentation and Documentation Tools

Canva
* Type: Visual design tool
* Purpose: Create logos, banners, presentation slides
* Advantages: Very intuitive, numerous free templates

PowerPoint
* Type: Presentation software
* Purpose: Creation of slides for the final defense
* Advantages: Familiarity and precise content control

## Development Tools for StudyConnect

1. Frontend Development
   - **Framework**:
     React.js → For a dynamic and modular UI
     Vite → Fast and optimized build tool

   - **UI/UX**:
     Direct code development without design software
     Tailwind CSS → Rapid design system

   - **Real-time Communication**:
     Socket.io → Text chat and notifications

2. Backend Development
   - **Main Stack**:
     Node.js (Express) → Robustness and speed

   - **Databases**:
     PostgreSQL → Relational (clear structure for rooms/users)

   - **APIs**:
     REST → For flexible data management

3. Advanced Features
   - **Authentication**:
     JWT (JSON Web Tokens) → Security and stateless
     bcrypt → Secure password hashing

   - **File Storage**:
     Multer → Server-side upload management
     Local file system → Structured resource organization

   - **Search and Filtering**:
     Sequelize queries → Efficient database searches
     Client-side filters → Enhanced user experience

4. DevOps and Deployment
   - **Version Control**:
     Git and GitHub → Version control and collaboration
   
   - **Deployment**:
     Vercel → Frontend hosting
     Local application → Backend in development

   - **Environment**:
     Environment variables → Configuration separation
     dotenv → Environment variable management

5. Testing & Quality
   - **Testing**:
     Manual testing → Feature verification
     Debug console → Error identification

   - **Code Quality**:
     ESLint → Coding standards and error detection
     Prettier → Consistent code formatting

   - **Performance**:
     React DevTools → Component optimization
     Compression → Resource optimization

6. Project Management
   - **Organization**:
     Modular folder structure → Clear separation of responsibilities
     Inline documentation → Explanatory comments in code

   - **Tracking**:
     Phase objectives → Incremental development
     Regular reviews → Feature validation

   - **Collaboration**:
     Git branches → Parallel feature development
     Pull requests → Code review and integration

## Why These Tools?

Our technology selection for StudyConnect addresses specific collaborative learning needs:

React + Node.js: Rich ecosystem suited for collaborative applications, providing client-side reactivity and server-side robustness.

Socket.io: Essential real-time communication for instant interactions between users in study rooms.

PostgreSQL: Ensures integrity of complex relational data between users, study rooms, and shared resources.

REST API + JWT: Optimal balance between security and performance, with stateless authentication suited to our application model.

These choices form a coherent architecture that meets the requirements of a modern educational platform while remaining scalable.

## Annexes

### 📋 Technical Annexes

#### Complete Specifications Document
Detailed version of StudyConnect's functional and non-functional requirements, including key user stories such as "As a student, I want to join a study room via an invitation link" and "As a user, I want to share resources with members of my study room."

#### UML Diagrams
Complete UML diagrams include:
- Use case diagram showing interactions between students, teachers, and administrators
- Class diagram detailing the structure of User, StudyRoom, Resource models, etc.
- Sequence diagram illustrating the real-time communication flow when sending a message in a study room
- Component diagram showing the modular architecture of the system
- Deployment diagram presenting the physical architecture of the application
- Package diagram visualizing the logical organization of the code

#### Database Schema
Relational model of the PostgreSQL database with:
- Main tables: users, study_rooms, resources, messages, subjects
- Entity relationships and integrity constraints
- Structure optimized for frequent queries

#### Critical Code Excerpts
Code examples of essential functionalities:
- Socket.IO implementation for real-time communication
- JWT authentication system with protection middleware
- React components for chat and notification management

### 📊 Methodological Annexes

#### Detailed Planning
Gantt chart showing:
- Task distribution over the 3 months of development
- Critical milestones and task dependencies
- Resource allocation and responsibilities

#### Test Results
Documentation of tests performed:
- Manual testing of main functionalities
- Performance tests for real-time communications
- User feedback analysis

#### Technical Documentation
Installation and deployment guide including:
- Required configuration for development environment
- Instructions for database setup
- Frontend and backend deployment procedure

### 📚 Complementary Annexes

#### Bibliography & Webography
Resources consulted including:
- Official documentation of used technologies
- Technical articles on collaborative application architecture
- Studies on student needs for online learning tools

#### User Manual
Step-by-step guide for users covering:
- Registration and login procedures
- Creating and managing study rooms
- Sharing and organizing resources
- Example: "How to create a private room in 3 clicks"

#### Legal Constraints (GDPR)
Documentation on compliance with data protection requirements:
- Privacy policy and personal data usage
- Technical measures to ensure data security

#### Proof of Functionality
Annotated screenshots of main features:
- Login interface and user dashboard
- Real-time chat system with presence indicators
- Mobile and desktop interfaces demonstrating responsive design

## Summary

### Key Points:

1 - **Optimized User Experience**: The student is at the core of the system, with intuitive interfaces and functionalities adapted to collaborative learning (chat, video, resource sharing).

2 - **Modular Architecture**: Clear division into packages (User Management, Rooms, Communication, etc.), facilitating maintenance and the addition of new functionalities.

3 - **Technical Challenges**: Real-time communication: complex connection management (latency, bandwidth). Security: Robust authentication, data encryption, and essential access control. Data management: Efficient storage of files and discussion histories.

4 - **Scalability**: Adaptable structure for potential scaling (addition of rooms, supplementary collaborative tools).

This analysis confirms the feasibility of the project while identifying critical areas (performance, security) to prioritize during development.

### Proposed Solution:
An implementation through iterations, starting with essential modules (chat, rooms) before integrating advanced functionalities (video, whiteboard).

## Global Conclusion

### StudyConnect

The project represents an innovative solution for online collaborative learning, addressing the growing needs of students and teachers in terms of flexibility, interactivity, and knowledge sharing.

Through this work, we have designed an intuitive and high-performance platform, integrating advanced functionalities such as virtual rooms, real-time communication (chat, audio, video), and resource sharing, all within a secure and modular environment.

### Project Strengths:
✅ User-centered approach: A simple and accessible interface, adapted to the needs of students and teachers.
✅ Robust architecture: Modular structure (Frontend, Backend, database) allowing for easy maintenance and evolution.
✅ Operational key features: Creation and management of study rooms, Real-time chat with Socket.io, Video calls via WebRTC, File sharing and collaborative tools.
✅ Scalability: Possibility to add new functionalities (whiteboard, LMS integration, etc.).

### Final Assessment
StudyConnect positions the student at the heart of the learning process, offering a collaborative, dynamic, and accessible space. This project demonstrates that it is possible to bridge the gap between in-person and remote learning through a well-designed technological solution. With future developments and widespread adoption. 
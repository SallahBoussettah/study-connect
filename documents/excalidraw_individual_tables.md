# StudyConnect Database Tables for Excalidraw

## User Table

```mermaid
classDiagram
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
```

## User Preferences Table

```mermaid
classDiagram
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
```

## User Subjects Table

```mermaid
classDiagram
    class UserSubjects {
        +UUID id
        +UUID user_id
        +UUID subject_id
        +ENUM proficiency_level
        +BOOLEAN is_teaching
        +TIMESTAMP created_at
    }
```

## Subject Table

```mermaid
classDiagram
    class Subject {
        +UUID id
        +VARCHAR(100) name
        +VARCHAR(100) category
        +TEXT description
        +VARCHAR(255) icon
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
```

## Study Room Table

```mermaid
classDiagram
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
```

## Study Room Member Table

```mermaid
classDiagram
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
```

## Study Room Request Table

```mermaid
classDiagram
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
```

## Message Table

```mermaid
classDiagram
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
```

## Resource Table

```mermaid
classDiagram
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
```

## Event Table

```mermaid
classDiagram
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
```

## Event Attendee Table

```mermaid
classDiagram
    class EventAttendee {
        +UUID id
        +UUID event_id
        +UUID user_id
        +ENUM status
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
        +BOOLEAN reminder_sent
    }
```

## Flashcard Deck Table

```mermaid
classDiagram
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
```

## Flashcard Table

```mermaid
classDiagram
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
```

## Study Session Table

```mermaid
classDiagram
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
```

## Notification Table

```mermaid
classDiagram
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
``` 
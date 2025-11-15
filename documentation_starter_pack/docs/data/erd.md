# Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string name
        datetime created_at
    }

    SUBJECTS {
        uuid id PK
        string name
        datetime created_at
    }

    ACADEMIC_YEARS {
        uuid id PK
        string name
        int level
        datetime created_at
    }

    SEMESTERS {
        uuid id PK
        int number
        datetime created_at
    }

    COURSES {
        uuid id PK
        string code
        string name
        uuid subject_id FK
        uuid year_id FK
        uuid semester_id FK
        string ue_number
        string syllabus_url
        datetime created_at
    }

    USER_COURSES {
        uuid user_id FK
        uuid course_id FK
        boolean is_active
        int learned_count
        datetime created_at
    }

    SYLLABUS_CONCEPTS {
        uuid id PK
        uuid course_id FK
        string concept_text
        string category
        int importance
        int order
        datetime created_at
    }

    VIDEO_JOBS {
        uuid id PK
        uuid user_id FK
        string url
        string youtube_video_id
        string status
        int processed_concepts_count
        string error_message
        datetime created_at
        datetime completed_at
    }

    CONCEPTS {
        uuid id PK
        uuid video_job_id FK
        string concept_text
        string definition
        string timestamp
        decimal confidence
        datetime created_at
    }

    CONCEPT_MATCHES {
        uuid id PK
        uuid concept_id FK
        uuid syllabus_concept_id FK
        decimal confidence
        string match_type
        string rationale
        string user_feedback
        datetime created_at
    }

    FLASHCARDS {
        uuid id PK
        uuid concept_match_id FK
        uuid user_id FK
        string question
        string answer
        string source_timestamp
        int times_reviewed
        int times_correct
        datetime last_reviewed_at
        datetime next_review_at
        datetime created_at
    }

    REVIEW_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        int flashcard_count
        int current_card_index
        string status
        datetime started_at
        datetime completed_at
    }

    REVIEW_EVENTS {
        uuid id PK
        uuid session_id FK
        uuid flashcard_id FK
        string difficulty
        int time_to_reveal_ms
        int time_to_rate_ms
        datetime created_at
    }

    USERS ||--o{ USER_COURSES : enrolls
    USERS ||--o{ VIDEO_JOBS : submits
    USERS ||--o{ FLASHCARDS : owns
    USERS ||--o{ REVIEW_SESSIONS : completes

    SUBJECTS ||--o{ COURSES : categorizes
    ACADEMIC_YEARS ||--o{ COURSES : "belongs to"
    SEMESTERS ||--o{ COURSES : "scheduled in"

    COURSES ||--o{ USER_COURSES : has
    COURSES ||--o{ SYLLABUS_CONCEPTS : contains

    VIDEO_JOBS ||--o{ CONCEPTS : extracts

    CONCEPTS ||--o{ CONCEPT_MATCHES : matches
    SYLLABUS_CONCEPTS ||--o{ CONCEPT_MATCHES : "matched to"

    CONCEPT_MATCHES ||--o{ FLASHCARDS : generates

    REVIEW_SESSIONS ||--o{ REVIEW_EVENTS : tracks
    FLASHCARDS ||--o{ REVIEW_EVENTS : "reviewed in"
```

## Notes

- **Normalized schema**: 13 tables (3 new: subjects, academic_years, semesters)
- **French university structure**: Courses reference subject, year, semester for proper UE organization
- **Dynamic concept counts**: Total concepts per course computed from `COUNT(syllabus_concepts)`, not hardcoded
- **Syllabus-driven**: Concept counts emerge from AI processing of actual syllabus PDFs
- **Hard deletes**: No soft delete columns (`deleted_at`)
- **No retention policies**: Keep all data for demo
- **Single active course**: `user_courses.is_active` flag
- **Pre-computed learned_count**: `user_courses.learned_count` for dashboard performance ("12 learned")

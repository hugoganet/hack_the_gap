# Entity Relationship Diagram

> Updated: 2025-11-16 - Knowledge Tree Migration

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

    KNOWLEDGE_NODES {
        uuid id PK
        uuid subject_id FK
        uuid parent_id FK
        string name
        string slug
        int order
        json metadata
        datetime created_at
        datetime updated_at
    }

    COURSES {
        uuid id PK
        string code
        string name
        uuid subject_id FK
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

    NODE_SYLLABUS_CONCEPTS {
        uuid node_id FK
        uuid syllabus_concept_id FK
        uuid added_by_user_id FK
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
    USERS ||--o{ NODE_SYLLABUS_CONCEPTS : "attaches (optional)"

    SUBJECTS ||--o{ COURSES : categorizes
    SUBJECTS ||--o{ KNOWLEDGE_NODES : "organizes into"

    KNOWLEDGE_NODES ||--o{ KNOWLEDGE_NODES : "parent of"
    KNOWLEDGE_NODES ||--o{ NODE_SYLLABUS_CONCEPTS : "contains"

    COURSES ||--o{ USER_COURSES : has
    COURSES ||--o{ SYLLABUS_CONCEPTS : contains

    SYLLABUS_CONCEPTS ||--o{ NODE_SYLLABUS_CONCEPTS : "attached to"

    VIDEO_JOBS ||--o{ CONCEPTS : extracts

    CONCEPTS ||--o{ CONCEPT_MATCHES : matches
    SYLLABUS_CONCEPTS ||--o{ CONCEPT_MATCHES : "matched to"

    CONCEPT_MATCHES ||--o{ FLASHCARDS : generates

    REVIEW_SESSIONS ||--o{ REVIEW_EVENTS : tracks
    FLASHCARDS ||--o{ REVIEW_EVENTS : "reviewed in"
```

## Notes

- **Normalized schema**: 12 tables (removed academic_years and semesters, added knowledge_nodes and node_syllabus_concepts)
- **Simplified hierarchy**: Courses now only reference subject (no year/semester)
- **Flexible knowledge tree**: `knowledge_nodes` provides arbitrary-depth organization within subjects
- **Tree structure**: Self-referential `parent_id` in `knowledge_nodes` enables hierarchical organization
- **Optional concept organization**: `node_syllabus_concepts` junction allows attaching concepts to tree nodes
- **Dynamic concept counts**: Total concepts per course computed from `COUNT(syllabus_concepts)`, not hardcoded
- **Syllabus-driven**: Concept counts emerge from AI processing of actual syllabus PDFs
- **Hard deletes**: No soft delete columns (`deleted_at`)
- **No retention policies**: Keep all data for demo
- **Single active course**: `user_courses.is_active` flag
- **Pre-computed learned_count**: `user_courses.learned_count` for dashboard performance ("12 learned")

## Migration Notes (2025-11-16)

**Removed:**
- `academic_years` table (rigid calendar structure)
- `semesters` table (rigid calendar structure)
- `courses.year_id` field
- `courses.semester_id` field

**Added:**
- `knowledge_nodes` table (flexible tree hierarchy)
- `node_syllabus_concepts` junction table (organize concepts into tree)

**Rationale:**
- Calendar-based organization (Year/Semester) was too rigid for diverse content
- Knowledge tree allows flexible, domain-driven organization (e.g., Philosophy → Epistemology → Kant)
- Courses remain as containers, but knowledge is organized via tree structure
- Enables better concept discovery and navigation

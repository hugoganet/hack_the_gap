# Task: Display subdirectories on course details page and fix blocking errors

Approved Plan Breakdown

- [ ] Fix async NavigationWrapper usage error
  - Convert app/(logged-in)/error.tsx from Client Component to Server Component by removing "use client".

- [ ] Harden organization query to avoid runtime failure
  - Update src/query/org/get-users-orgs.query.ts to gracefully handle cases where auth.api.listOrganizations is unavailable, returning an empty array fallback.

- [ ] UI: Display subdirectories on course details page using cards
  - Update app/dashboard/courses/[courseId]/page.tsx:
    - Fetch top-level KnowledgeNode entries (parentId = null) for the course&#39;s subject that have NodeSyllabusConcept linked to this course&#39;s syllabus concepts.
    - Render a "Subdirectories" section above the flashcards:
      - Use Card components (shadcn/ui) and lucide icon (FolderTree).
      - Each card shows: subdirectory name, optional metadata.description, and concept count for this course.
      - Responsive grid: 1/2/3 columns for mobile/tablet/desktop.

- [ ] Validate
  - Load /dashboard/courses/{course.id} and verify:
    - No NavigationWrapper async client error.
    - No "uncached promise" error.
    - No "listOrganizations is not a function" runtime error (org lists will be empty gracefully).
    - Subdirectories appear as cards above Concepts &amp; Flashcards section.

Notes

- Knowledge structure is subject-scoped; filter by NodeSyllabusConcept.syllabusConcept.courseId to scope subdirectories to the current course.
- Styling follows existing card patterns used in app/dashboard/information-cards.tsx and course-card.tsx.

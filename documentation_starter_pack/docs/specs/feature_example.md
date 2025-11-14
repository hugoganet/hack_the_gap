# Feature Spec: Example Uploads v1

Owner: you
Status: Draft
Last Updated: 2025-10-26

## Summary

Allow users to upload files up to 10MB and view them in their dashboard.

## User Stories

- As a {user}, I want to upload a file so that I can store and access it later.

## Acceptance Criteria

- [ ] Upload supports PNG/JPG/PDF up to 10MB
- [ ] Show success or error state

## UX & Flows

- Simple upload form on /uploads with drag-and-drop

## Scope

- In scope: upload form, server endpoint, basic list view
- Out of scope: advanced sharing, previews for all file types

## Technical Design

- Web app posts to /api/uploads
- API validates and writes metadata to DB and file to blob storage
- DB: uploads table (id, user_id, filename, size, type, created_at)
- Risks: storage costs, abuse

## Rollout

- Feature flag: uploads_v1
- Metrics: daily uploads, error rate
- Post-launch: add bulk upload

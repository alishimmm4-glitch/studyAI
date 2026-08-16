# StudyAI API Documentation

Base URL (local): `http://localhost:5000/api`

All endpoints return JSON in this envelope:

```json
{ "success": true, "message": "...", "data": { } }
```

Errors:

```json
{ "success": false, "message": "...", "details": null }
```

Authenticated routes require a header:

```
Authorization: Bearer <token>
```

---

## Auth — `/api/auth`

### POST `/register`
Create an account.

**Body**
```json
{ "name": "Alex Morgan", "email": "alex@studyai.app", "password": "password123" }
```
**201 Response**
```json
{ "success": true, "message": "Account created successfully",
  "data": { "user": { "_id": "...", "name": "...", "email": "...", "plan": "free" }, "token": "eyJ..." } }
```

### POST `/login`
**Body**
```json
{ "email": "alex@studyai.app", "password": "password123", "remember": true }
```
Returns `{ user, token }`. `remember: true` issues a 30-day token instead of 7-day.

### GET `/me` 🔒
Returns the authenticated user.

### POST `/forgot-password`
**Body:** `{ "email": "alex@studyai.app" }`
Returns a reset token (in production this would be emailed instead of returned).

### POST `/reset-password/:token`
**Body:** `{ "password": "newPassword123" }`

---

## Notes — `/api/notes` 🔒 (all routes require auth)

### GET `/`
List the user's uploaded notes.

### POST `/`
`multipart/form-data` with field `file` (PDF/DOC/DOCX, max 20MB).
Text is extracted server-side (pdf-parse / mammoth) directly from the uploaded buffer — the
file itself is never written to disk, so this works unchanged on serverless hosts. Sets
`status: "ready" | "failed"` based on whether extractable text was found.

### GET `/:id`
Get a single note's metadata.

### DELETE `/:id`
Deletes the note record and any derived summaries/quizzes/flashcard decks. (No file exists on
disk to clean up — uploads are processed in-memory only, see the note below.)

---

## AI Summary — `/api/summaries/:noteId` 🔒

### POST `/`
Generates (or regenerates) a summary from the note's extracted text.
**201 Response**
```json
{ "summary": { "overview": "...", "keyPoints": ["..."], "definitions": [{ "term": "ATP", "def": "..." }] } }
```

### GET `/`
Fetch the existing summary for a note (404 if none yet).

---

## Quiz Generator — `/api/quizzes` 🔒

### POST `/:noteId`
**Body (optional):** `{ "count": 6 }`
Generates a mixed MCQ / True-False / Short-answer quiz from the note.
Returned quiz **omits correct answers** (`options` only) to prevent client-side cheating.

### GET `/`
List quizzes (answers omitted).

### GET `/:id`
Get a single quiz **including answers** — used for the review screen after submission.

### POST `/:id/attempts`
**Body**
```json
{ "answers": { "<questionId>": "Mitochondria" }, "durationSeconds": 180 }
```
Grades the attempt server-side and returns score/percentage plus the correct answers.

### GET `/attempts/history`
List the user's past quiz attempts (used by the Analytics dashboard).

---

## Flashcards — `/api/flashcards` 🔒

### POST `/:noteId`
**Body (optional):** `{ "count": 8 }` — generates a flashcard deck from the note.

### GET `/`
List all decks.

### GET `/:id`
Get one deck.

### DELETE `/:id`
Delete a deck.

---

## Study Planner — `/api/planner` 🔒

### GET `/tasks?month=8&year=2026`
List tasks, optionally filtered to a calendar month.

### POST `/tasks`
**Body:** `{ "title": "Review notes", "date": "2026-08-20" }`

### PATCH `/tasks/:id`
**Body (any subset):** `{ "title": "...", "date": "...", "completed": true }`

### DELETE `/tasks/:id`

---

## Analytics — `/api/analytics` 🔒

### GET `/overview`
Aggregated dashboard data:
```json
{
  "totalNotes": 3, "totalQuizzes": 4, "totalDecks": 2,
  "successRate": 84, "totalStudyHours": 18.4,
  "weeklyHours": [{ "day": "Mon", "hours": 2.5 }, ...],
  "quizScores": [{ "name": "Quiz 1", "score": 78 }, ...]
}
```

### POST `/study-session`
**Body:** `{ "hours": 1.5 }` — accumulates study hours for today (used for the streak & weekly chart).

---

## Profile — `/api/profile` 🔒

### PATCH `/`
**Body (any subset):** `{ "name", "school", "major", "year", "bio", "avatar" }`

### PATCH `/password`
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## Error codes

| Code | Meaning |
|------|---------|
| 400  | Validation error / bad request |
| 401  | Missing/invalid/expired token, or wrong credentials |
| 403  | Forbidden (e.g. premium-only feature) |
| 404  | Resource not found |
| 409  | Conflict (duplicate email, note still processing) |
| 422  | Unprocessable (e.g. not enough text to generate a quiz) |
| 429  | Rate limited |
| 500  | Server error |

## Notes on the AI engine

`src/utils/aiService.js` implements a self-contained **extractive** algorithm (word-frequency
scoring + sentence ranking) so summaries/quizzes/flashcards work fully offline with no API
keys or per-request cost. The function signatures and return shapes are designed so you can
swap in a real LLM call (OpenAI, Anthropic, etc.) without touching any controller or route —
just replace the internals of `generateSummary`, `generateQuiz`, and `generateFlashcards`.

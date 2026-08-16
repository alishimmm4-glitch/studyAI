# Wiring the StudyAI frontend to the backend

This folder contains `src/lib/api.js` — a fetch-based client with one function per backend
endpoint, matched to every module in the frontend (auth, notes, summary, quiz, flashcards,
planner, analytics, profile).

## 1. Where this goes

If you exported the earlier frontend as a Vite project, copy `src/lib/api.js` into it, then
add to the project root `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## 2. Swap mock state for real calls, module by module

| Frontend module     | Replace local mock logic with |
|----------------------|-------------------------------|
| Login / Signup       | `authApi.login()` / `authApi.register()`, then `authApi.setToken(data.token)` and store `data.user` in app state |
| App bootstrap        | On load, if `authApi.getToken()` exists, call `authApi.me()` to restore the session |
| Notes upload page     | `notesApi.upload(file, onProgress)` for the drag-and-drop uploader; `notesApi.list()` / `notesApi.remove(id)` for the file list |
| AI Summary page       | `summaryApi.generate(noteId)` on click "Generate Summary"; `summaryApi.get(noteId)` to reload a previous one |
| Quiz Generator        | `quizApi.generate(noteId)` to create; `quizApi.get(quizId)` to fetch questions for the run screen; `quizApi.submit(quizId, answersMap, seconds)` on finish |
| Flashcards            | `flashcardApi.generate(noteId)`; `flashcardApi.list()` to show saved decks |
| Study Planner         | `plannerApi.list(month, year)`, `plannerApi.create()`, `plannerApi.update(id, { completed: true })`, `plannerApi.remove(id)` |
| Analytics dashboard    | `analyticsApi.overview()` — returns `{ totalNotes, totalQuizzes, totalDecks, successRate, totalStudyHours, weeklyHours, quizScores }`, shaped to drop straight into the existing Recharts components |
| Profile page           | `profileApi.update({ name, school, major, year, bio })` |

## 3. Logout

Call `authApi.clearToken()` and reset your app's user state to `null`.

## 4. Error handling

Every `api.js` function throws an `Error` with `.message` (from the backend's `message`
field) and `.status` (HTTP status code) on failure — catch it and feed `.message` straight
into your existing toast system.

## 5. Local development

Run both processes side by side:

```bash
# terminal 1
cd studyai-backend && npm run dev

# terminal 2
cd studyai-frontend && npm run dev
```

Make sure `CLIENT_URL` in the backend's `.env` matches the frontend's dev server origin
(Vite defaults to `http://localhost:5173`) so CORS allows the requests.

> **Note:** the Claude.ai artifact preview of the frontend runs in a sandboxed iframe with no
> access to `localhost`, so it can't reach a locally-running backend — it will keep working in
> its own in-memory demo mode. To see the real integration, run the frontend as an actual Vite
> project on your machine, exactly as described above.

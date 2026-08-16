# StudyAI — Backend API

Production-ready REST API for the AI Study Assistant platform: JWT auth, note upload with
real PDF/DOCX text extraction, AI-style summary/quiz/flashcard generation, a study planner,
and an analytics aggregation endpoint.

## Stack

Node.js · Express.js · MongoDB (Mongoose) · JWT · Multer · pdf-parse · mammoth

## Folder structure

```
studyai-backend/
├── server.js                 # entrypoint — connects DB, starts HTTP server
├── src/
│   ├── app.js                 # express app: middleware + route mounting
│   ├── config/
│   │   ├── db.js               # mongoose connection
│   │   └── constants.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Summary.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   ├── FlashcardDeck.js
│   │   ├── PlannerTask.js
│   │   └── StudySession.js
│   ├── controllers/            # business logic per module
│   ├── routes/                 # express routers per module
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification (protect, requirePremium)
│   │   ├── errorMiddleware.js   # centralized error handling
│   │   ├── uploadMiddleware.js  # multer config for note uploads
│   │   ├── rateLimiter.js
│   │   └── validateMiddleware.js
│   └── utils/
│       ├── aiService.js         # extractive summary/quiz/flashcard generator
│       ├── extractText.js       # PDF/DOCX -> plain text
│       ├── generateToken.js
│       ├── ApiError.js / ApiResponse.js
│       └── seed.js              # optional demo-data seeder
├── uploads/                    # uploaded note files (gitignored)
├── .env.example
├── API_DOCUMENTATION.md
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```
   At minimum set `MONGO_URI` (a local `mongod` or a MongoDB Atlas connection string) and a
   long random `JWT_SECRET`.

3. **Run MongoDB** locally, or point `MONGO_URI` at Atlas.

4. **(Optional) seed demo data**
   ```bash
   npm run seed
   ```
   Creates `demo@studyai.app` / `password123` with a week of study hours and a sample task.

5. **Start the server**
   ```bash
   npm run dev     # nodemon, auto-restart
   # or
   npm start
   ```
   The API is now live at `http://localhost:5000/api` — check `GET /api/health`.

## Connecting the frontend

The React frontend expects `VITE_API_URL` (or a hardcoded base) pointing at this server's
`/api` root, and stores the JWT returned from `/auth/login` / `/auth/register` to send as
`Authorization: Bearer <token>` on every subsequent request. See `API_DOCUMENTATION.md` for
the full endpoint contract, and the accompanying `frontend-api-client` folder for a ready-made
`api.js` you can drop into a Vite project.

**Note on CORS:** set `CLIENT_URL` in `.env` to your frontend's origin (e.g.
`http://localhost:5173`) so browser requests aren't blocked.

## Security features included

- Passwords hashed with bcrypt (12 salt rounds)
- JWT auth with configurable expiry + "remember me" long-lived tokens
- `helmet` security headers, `cors` allow-list, `express-mongo-sanitize`, `xss-clean`
- Rate limiting (general + stricter on auth endpoints)
- express-validator input validation on all mutating routes
- File-type/size validation on uploads (PDF/DOC/DOCX only, 20MB cap)
- Centralized error handler that never leaks stack traces in production
- Quiz answers are stripped from list/generate responses so the client can't read them
  before submitting (only returned after grading, or on the explicit single-quiz "review" fetch)

## Scaling this further

- Swap `aiService.js` internals for a real LLM call (OpenAI/Anthropic) — the function
  signatures are already shaped for a drop-in replacement.
- Move file storage to S3/Cloud Storage instead of local disk for multi-instance deployments.
- Add a background job queue (BullMQ) if text extraction / AI generation becomes slow at scale.
- Add refresh-token rotation if you need shorter-lived access tokens with silent renewal.

# AI Interviewer Platform

A production-ready full-stack platform that helps students and professionals prepare for technical and HR interviews using AI.

## Project Structure

```
ai-interviewer-platform/
├── backend/                 # Express.js + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma    # Database models
│   │   └── seed.ts          # Admin seed data
│   └── src/
│       ├── config/          # Environment & database
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, sanitization
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       ├── utils/           # Helpers
│       └── validators/      # Zod schemas
├── frontend/                # Next.js App Router
│   └── src/
│       ├── app/             # Pages & layouts
│       ├── components/      # UI & layout components
│       ├── features/        # Feature modules
│       ├── hooks/           # React hooks
│       ├── lib/             # Axios client
│       ├── services/        # API services
│       ├── styles/          # Global CSS
│       ├── types/           # TypeScript types
│       └── utils/           # Utilities
└── docker-compose.yml       # PostgreSQL
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Shadcn-style UI, React Hook Form, Zod, Axios |
| Backend | Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, bcrypt, Helmet, Rate Limiting |
| AI (Phase 4+) | Google Gemini, Groq (fallback) |

## Phase Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **1** | ✅ Complete | Project setup & authentication |
| **2** | ✅ Complete | Resume upload & ATS checker |
| **3** | ✅ Complete | Resume builder |
| **4** | ✅ Complete | AI interview engine |
| **5** | ✅ Complete | Voice interview |
| **6** | ✅ Complete | Camera monitoring |
| **7** | ✅ Complete | Feedback generation |
| **8** | ✅ Complete | Dashboard analytics |
| **9** | ✅ Complete | Testing & optimization |
| 10 | Pending | Deployment |

---

## Phase 1: Authentication (Complete)

### Features Implemented

- User registration with validation
- Login / logout
- JWT authentication (Bearer token + HTTP-only cookie)
- Password hashing (bcrypt, 12 rounds)
- Protected API routes
- Rate limiting on auth endpoints (20 req / 15 min)
- Input sanitization (XSS prevention)
- Frontend auth context & protected routes
- Dashboard shell with placeholder stats
- Dark / light mode
- Glassmorphism UI with Framer Motion animations

### Database Models (Prisma)

All tables are defined in `backend/prisma/schema.prisma`:

- `User` — accounts with roles (USER, ADMIN)
- `Resume` — uploaded/built resumes
- `AtsScore` — ATS analysis results
- `Interview` — interview sessions
- `Question` / `Answer` — Q&A pairs
- `InterviewFeedback` — post-interview scores
- `UserHistory` — activity audit log

### API Endpoints (Phase 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user |

---

## Phase 2: Resume Upload & ATS Checker (Complete)

### Features Implemented

**Resume Module**
- PDF upload with drag-and-drop (Multer, max 5MB)
- PDF text extraction via `pdf-parse`
- Section & contact info detection
- List, view, edit, delete resumes
- Set primary resume
- Download original PDF

**ATS Checker**
- Score 0–100 with category breakdown (length, keywords, sections, formatting, grammar, experience, projects, education)
- Keyword & skill detection
- Missing keywords & sections
- Grammar and formatting issue detection
- Suggestions & improvement tips
- Animated score ring and breakdown charts
- Downloadable HTML ATS report

### API Endpoints (Phase 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resumes` | Yes | List user resumes |
| GET | `/api/resumes/stats` | Yes | Dashboard resume/ATS stats |
| POST | `/api/resumes/upload` | Yes | Upload PDF resume |
| GET | `/api/resumes/:id` | Yes | Get resume details |
| PUT | `/api/resumes/:id` | Yes | Update resume (title, text) |
| DELETE | `/api/resumes/:id` | Yes | Delete resume |
| GET | `/api/resumes/:id/download` | Yes | Download PDF file |
| POST | `/api/ats/analyze/:resumeId` | Yes | Run ATS analysis |
| GET | `/api/ats` | Yes | List ATS scores |
| GET | `/api/ats/:id` | Yes | Get ATS score details |
| GET | `/api/ats/:id/report` | Yes | Download HTML report |
| GET | `/api/ats/resume/:resumeId/latest` | Yes | Latest score for resume |

### Testing Phase 2

1. Login → navigate to **Resume** in navbar
2. Drag & drop a PDF resume (or click to browse)
3. View uploaded resume in the list
4. Click **View** → see extracted text and detected sections
5. Click **Edit** → modify title or text → Save
6. Click **ATS Check** → **Run Analysis**
7. Review score breakdown, skills, suggestions
8. Click **Download Report** → saves HTML file
9. Dashboard shows updated resume count and ATS score

### API Testing (curl)

```bash
# Upload resume (replace TOKEN)
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "resume=@/path/to/resume.pdf" \
  -F "title=My Resume"

# List resumes
curl http://localhost:5000/api/resumes -H "Authorization: Bearer TOKEN"

# Run ATS analysis (replace RESUME_ID)
curl -X POST http://localhost:5000/api/ats/analyze/RESUME_ID \
  -H "Authorization: Bearer TOKEN"

# Download ATS report (replace SCORE_ID)
curl http://localhost:5000/api/ats/SCORE_ID/report \
  -H "Authorization: Bearer TOKEN"   -o ats-report.html
```

---

## Phase 3: Resume Builder (Complete)

### Features Implemented

**Resume Builder**
- Full section editor: Personal Info, Summary, Skills, Experience, Education, Projects, Certifications, Languages, Achievements
- **Live preview** updates as you type
- **3 ATS-friendly templates**: Modern, Classic, Minimal
- Create new resumes from scratch
- Edit existing built resumes
- Auto-syncs `rawText` for ATS analysis compatibility

**Export**
- **Export PDF** (server-side via PDFKit)
- **Export HTML** (downloadable ATS-friendly HTML)
- **Print** from live preview

### API Endpoints (Phase 3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/resumes/builder` | Yes | Create built resume |
| PUT | `/api/resumes/:id/builder` | Yes | Update builder data |
| GET | `/api/resumes/:id/export/pdf` | Yes | Download PDF |
| GET | `/api/resumes/:id/export/html` | Yes | Download HTML |
| GET | `/api/resumes/:id/preview` | Yes | Preview HTML in browser |

### Testing Phase 3

1. Go to **Resume** → click **Create Resume**
2. Fill in personal info and add experience/education
3. Switch between Modern, Classic, Minimal templates — preview updates live
4. Click **Create Resume** to save
5. Click **Export PDF** to download
6. Click **ATS Check** to analyze the built resume
7. Return via **Edit** on the resume list

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/resume/builder` | New resume builder |
| `/resume/builder/[id]` | Edit existing built resume |

---

## Phase 4: AI Interview Engine (Complete)

### Features Implemented

**Interview Setup**
- Domain selection (11 domains: Frontend, Backend, Java, Python, MERN, Data Science, ML, DevOps, UI/UX, HR, Marketing)
- Resume-based or domain-only question personalization
- Difficulty: Easy, Medium, Hard
- Duration: 10, 20, 30, 45 minutes
- Question count: 5, 10, 15, 20

**AI Interview Session**
- One question at a time with progress bar and timer
- **Gemini API** primary LLM with **Groq fallback**
- Rule-based fallback when no API keys configured
- Dynamic question generation based on resume, domain, difficulty, previous answers
- Answer analysis with score (1–10), feedback, strengths, improvements
- Adaptive difficulty adjustment after each answer
- Auto-completion when all questions answered
- Interview history with continue/review

### API Endpoints (Phase 4)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/interviews` | Yes | List interviews |
| GET | `/api/interviews/stats` | Yes | Interview statistics |
| POST | `/api/interviews` | Yes | Create interview config |
| GET | `/api/interviews/:id` | Yes | Get interview details |
| POST | `/api/interviews/:id/start` | Yes | Start & generate Q1 |
| GET | `/api/interviews/:id/current` | Yes | Current unanswered question |
| POST | `/api/interviews/:id/questions/:questionId/answer` | Yes | Submit answer, get next Q |
| POST | `/api/interviews/:id/cancel` | Yes | Cancel interview |

### Environment Variables (AI)

Add to `backend/.env` for AI-powered questions (optional — fallback works without keys):

```env
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

### Testing Phase 4

1. Go to **Interview** in navbar
2. Select domain, difficulty, duration, question count
3. Optionally enable **Use Resume** for tailored questions
4. Click **Start Interview**
5. Answer each question one at a time
6. Review instant feedback after each submission
7. Complete all questions → see completion screen
8. Check **Interview History** and dashboard stats

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/interview` | Setup & history |
| `/interview/[id]` | Active interview session |

---

## Phase 5: Voice Interview (Complete)

### Features Implemented

**Text-to-Speech (TTS)**
- Questions auto-read aloud when each new question appears
- "Replay Question" button to hear again
- Speaking indicator badge while TTS is active
- Stop speaking control

**Speech-to-Text (STT)**
- Browser Web Speech API for microphone input
- Live interim transcription display while speaking
- Final transcript synced to editable answer field
- Start / Stop recording controls

**Voice / Text Mode Toggle**
- Switch between voice mode and pure text mode
- Preference saved in localStorage
- Graceful fallback message for unsupported browsers

**Backend**
- Raw speech transcription stored separately in `answers.transcription`
- Edited final answer stored in `answers.answerText`

### Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ✅ | ❌ | ⚠️ Limited |

Use **Chrome** or **Edge** for full voice interview experience.

### Testing Phase 5

1. Start an interview (Chrome/Edge recommended)
2. Question is spoken automatically — watch for "Speaking..." badge
3. Click **Start Recording** and speak your answer
4. See live transcription appear in real time
5. Edit the text in the textarea if needed
6. Click **Submit Answer**
7. Toggle **Text Mode** to disable voice features
8. Click **Replay Question** to hear the question again

### New Files

```
frontend/src/hooks/use-speech-synthesis.ts
frontend/src/hooks/use-speech-recognition.ts
frontend/src/features/interview/voice-answer-panel.tsx
frontend/src/types/speech.d.ts
```

---

## Phase 6: Camera Monitoring (Complete)

### Features Implemented

**MediaPipe Face Landmarker**
- Real-time face mesh detection via `@mediapipe/tasks-vision`
- WASM loaded from CDN; model from Google MediaPipe servers
- Processes video locally in the browser — no video sent to server by default

**Live Tracking Metrics**
| Metric | Description |
|--------|-------------|
| Face Detection | Whether a face is visible in frame |
| Eye Contact Score | 0–100 based on head pose and face centering |
| Looking Away | Alert when head turned or off-center |
| Head Movement | stable / moderate / high via nose position variance |
| Multiple Faces | Warns if more than one person detected |
| Face Visibility | How fully the face appears in frame |

**Privacy**
- Video processed client-side only
- **Recording off by default** — toggle explicitly to store video (UI only; no server upload in this phase)
- Per-question camera metrics summary sent with answers (aggregated numbers only)

**UI**
- Live webcam preview (mirrored)
- Color-coded indicator cards
- Score bars for eye contact, visibility, head stability
- Sticky sidebar panel during interview on large screens

### Backend

- `cameraMetrics` optional field on answer submission
- Stored inside `answers.analysis.cameraMetrics` for Phase 7 feedback

### New Files

```
frontend/src/hooks/use-camera-monitor.ts
frontend/src/features/interview/camera-monitor.tsx
frontend/src/utils/face-analysis.ts
frontend/src/types/camera.ts
```

### Testing Phase 6

1. Start an interview — allow camera permission when prompted
2. Verify live video preview in the right sidebar
3. Watch indicators update as you move your head
4. Look away from camera — "Looking away" badge appears
5. Have someone else enter frame — "Multiple faces" warning
6. Toggle **Store video recording** (off by default)
7. Submit answers — metrics saved per question
8. Disable camera via **Disable** button

### Dependencies

```bash
cd frontend && npm install @mediapipe/tasks-vision
```

---

## Phase 7: Feedback Generation (Complete)

Comprehensive post-interview performance analysis with multi-dimensional scoring, AI-generated insights, and downloadable reports.

### Features

**Scoring (0–100%)**
- Overall — weighted composite of all categories
- Technical — average answer quality scores
- Communication — answer length, structure, clarity heuristics
- Confidence — aggregated camera eye contact and head stability
- Problem Solving — performance on hard-difficulty questions
- Resume Match — keyword overlap when resume was used
- Behavioral — HR/behavioral category performance

**AI Insights**
- Strengths and weaknesses (Gemini/Groq with rule-based fallback)
- Topics to improve from weak answers
- Domain-specific learning resources
- Performance summary narrative

**Reports**
- Interactive feedback page with score ring and breakdown bars
- Q&A replay with per-question scores
- Camera metrics summary (when enabled)
- HTML and PDF report download

**Auto-generation**
- Feedback generates automatically when the last answer is submitted
- Manual regenerate available from the feedback page

### API Endpoints (Phase 7)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/:id/feedback/generate` | Generate feedback |
| GET | `/api/interviews/:id/feedback` | Get feedback + Q&A |
| GET | `/api/interviews/:id/feedback/report/html` | Download HTML report |
| GET | `/api/interviews/:id/feedback/report/pdf` | Download PDF report |

### New Files

```
backend/src/services/feedback.service.ts
backend/src/controllers/feedback.controller.ts
frontend/src/types/feedback.ts
frontend/src/services/feedback.service.ts
frontend/src/features/feedback/feedback-report.tsx
frontend/src/app/interview/[id]/feedback/page.tsx
```

### Testing Phase 7

1. Complete a mock interview (voice/camera optional)
2. On completion screen, click **View Feedback Report**
3. Verify overall score ring and category breakdown bars
4. Review strengths, weaknesses, and learning resources
5. Expand Q&A replay — check per-question scores
6. Download HTML and PDF reports
7. From interview history, open **View Feedback** on completed sessions
8. Dashboard recent interviews link to feedback for completed sessions

---

## Phase 8: Dashboard Analytics (Complete)

Rich analytics dashboard with progress tracking, skill visualization, and interview history insights.

### Features

**Overview Stats**
- Resume status, ATS score, interview count, average score
- Score change indicator (recent vs prior sessions)
- Interviews completed this month

**Charts & Visualizations**
- **Score Trend** — line chart of overall scores over completed interviews (click points to open feedback)
- **Skill Radar** — hexagonal radar of averaged feedback dimensions (technical, communication, confidence, etc.)
- **Domain Breakdown** — bar chart of sessions and avg scores by interview domain
- **Difficulty Breakdown** — stacked distribution of Easy/Medium/Hard sessions
- **ATS Trend** — resume score history over time

**Activity Panel**
- Total questions answered
- Session status breakdown (completed, in progress, pending, cancelled)
- Recent interviews with quick links to feedback

### API Endpoints (Phase 8)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Full dashboard analytics payload |

### New Files

```
backend/src/services/analytics.service.ts
backend/src/controllers/analytics.controller.ts
backend/src/routes/analytics.routes.ts
frontend/src/types/analytics.ts
frontend/src/services/analytics.service.ts
frontend/src/features/dashboard/score-trend-chart.tsx
frontend/src/features/dashboard/skill-radar-chart.tsx
frontend/src/features/dashboard/analytics-charts.tsx
```

### Testing Phase 8

1. Log in and open `/dashboard`
2. Complete 2+ interviews with feedback to populate score trend and skill radar
3. Verify score trend line animates and points are clickable
4. Check skill radar shows all six dimensions
5. Confirm domain/difficulty breakdowns match your interview history
6. Run multiple ATS analyses — verify ATS trend chart updates
7. Review activity summary and session status counts

---

## Phase 9: Testing & Optimization (Complete)

Unit tests, performance improvements, and robust error handling across the stack.

### Backend Testing (Vitest)

- **`scoring.utils.test.ts`** — Score conversion, communication/resume/confidence scoring, camera aggregation
- **`analytics.utils.test.ts`** — Average and score-change calculations
- **`auth.utils.test.ts`** — User sanitization, JWT sign/verify
- **`error.utils.test.ts`** — AppError and Zod validation handling
- **`app.test.ts`** — Health check and 404 integration tests (Supertest)

Run backend tests:

```bash
cd backend
npm test
```

### Frontend Testing (Vitest)

- **`cn.test.ts`** — Class merging, initials, date formatting
- **`axios.test.ts`** — Error message extraction for timeouts, network, and API errors

Run frontend tests:

```bash
cd frontend
npm test
```

### Performance Optimizations

- **Gzip compression** on API responses (`compression` middleware)
- **Lazy-loaded charts** on dashboard (Score Trend, Skill Radar, Domain/Difficulty/ATS charts)
- **Lazy-loaded CameraMonitor** during interviews (client-only, reduces initial bundle)
- **Analytics query limits** — capped ATS trend and recent interview lists

### Error Handling

- **API 404 handler** — JSON response for unknown routes
- **`not-found.tsx`** — Custom 404 page with navigation
- **`error.tsx`** — Global error boundary with retry action
- **Axios improvements** — 30s timeout, network/timeout/server-specific error messages

### Refactored Utilities

```
backend/src/utils/scoring.utils.ts   # Extracted from feedback service
backend/src/utils/analytics.utils.ts # Extracted from analytics service
```

### Testing Phase 9

1. Run `npm test` in both `backend/` and `frontend/` — all tests pass
2. Hit unknown API route → `{ success: false, message: "Route not found" }`
3. Visit `/nonexistent-page` → custom 404 page
4. Open dashboard — charts load lazily with placeholder
5. Start interview — camera monitor loads on demand
6. Disconnect backend → frontend shows friendly network error toast

---

## Installation

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or local PostgreSQL 16+
- npm

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_interviewer?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=
GROQ_API_KEY=
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Testing Phase 1

### Manual Testing

1. Open **http://localhost:3000** — landing page loads
2. Click **Get Started** → register with valid credentials
3. Password rules: 8+ chars, uppercase, lowercase, number
4. After registration → redirected to dashboard
5. Refresh page → session persists
6. Click logout → redirected to login
7. Login with same credentials → dashboard loads
8. Toggle dark/light mode in header

### API Testing (curl)

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Default Admin (after seed)

- Email: `admin@aiinterviewer.com`
- Password: `Admin@123456`

---

## Deployment Guide (Phase 10 Preview)

### Backend (Railway / Render / VPS)

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure `DATABASE_URL` for managed PostgreSQL
4. Set `FRONTEND_URL` to production domain
5. Run `npm run build && npm start`

### Frontend (Vercel)

1. Connect GitHub repo
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` env var
4. Deploy

### Database

Use managed PostgreSQL (Supabase, Neon, Railway) in production.

---

## Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- Helmet.js security headers
- CORS restricted to frontend URL
- Rate limiting on auth routes
- Input sanitization middleware
- Prisma parameterized queries (SQL injection prevention)
- File upload validation — PDF only, 5MB max, sanitized filenames

---

## Next Phase

**Phase 10: Deployment**

- Docker production setup
- Environment configuration
- CI/CD pipeline
- Vercel + Railway deployment

Say **"Continue Phase 10"** to proceed.

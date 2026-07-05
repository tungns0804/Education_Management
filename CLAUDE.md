# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EduManage** — a full-stack university management system. Two independent apps share one git repo:

| Folder | Stack | Port |
|--------|-------|------|
| `server_side/` | NestJS + Prisma + PostgreSQL | 3000 |
| `client_side/` | ReactJS (Vite, no TypeScript) | 5173 |

## Commands

### Server (`server_side/`)
```bash
npm run start:dev      # dev with hot reload
npm run start:fresh    # kill port 3000 then start:dev
npm run build          # compile TS
npm run start:prod     # run compiled output
npm run seed           # seed demo data via ts-node prisma/seed.ts
npm run lint           # ESLint --fix
npm test               # Jest unit tests (files: src/**/*.spec.ts)
npx prisma migrate dev # apply schema changes and regenerate client
npx prisma studio      # GUI browser for the DB
```

### Client (`client_side/`)
```bash
npm run dev      # Vite dev server
npm run build    # production bundle → dist/
npm run preview  # serve production bundle locally
```

### Startup order
1. PostgreSQL must be running
2. `server_side/` → `npm run start:dev`
3. `client_side/` → `npm run dev`

## Server Architecture

### NestJS module layout
Each feature lives in `src/<feature>/` with `module`, `controller`, and `service` files. All modules are registered in `src/app.module.ts`. The shared singletons are:
- `PrismaModule` — global DB client (exported, injected everywhere)
- `EmailModule` — nodemailer wrapper for account credentials and OTP emails

### JWT authentication — per-user RSA key pairs
This is not a shared-secret JWT setup. On every login:
1. Any existing `ApiKey` row for the user is deleted (invalidating old tokens).
2. A new RSA-2048 key pair is generated and stored in the `api_keys` table.
3. Access token (15 min) and refresh token (7 days) are both signed with the user's **private key** and verified with the **public key** from DB.

Consequence: logout, password reset, and login all call `prisma.apiKey.deleteMany({ where: { userId } })` to immediately revoke all live tokens for that user.

### Cookie strategy
Three cookies are set on login:
- `token` — httpOnly, access token (15 min)
- `refreshToken` — httpOnly, refresh token (7 days)
- `logged` — non-httpOnly, value `'1'`, JS-readable, used by client to detect login state without exposing a token

CORS is configured in `src/main.ts` using the `URL_CLIENT` env var (comma-separated list of allowed origins).

### Forgot-password / OTP flow
`POST /api/users/forgot-password` → `POST /api/users/reset-password`
- OTP is a 6-digit number, **bcrypt-hashed** before storage in the `otps` table, 5-minute TTL.
- OTP is sent to `user.personalEmail` (not the school login email). If `personalEmail` is null the API returns 400.
- Successful reset deletes the OTP record and the user's `ApiKey` row.
- Logic lives in `src/auth/auth.service.ts` (`forgotPassword`, `resetPassword`).

### Auth constants
All token lifetimes, cookie names, bcrypt rounds, and algorithm are centralised in `src/constants/auth.constants.ts`. Never hardcode these values elsewhere.

## Client Architecture

### Folder layout (`client_side/src/`)
Standardised structure (refactored 2026-07): `components/` (shared UI), `config/` (axios + API request functions), `constants/`, `context/` (AppContext, AuthContext), `layouts/` (MainLayout), `pages/` (per role: `admin/`, `teacher/`, `student/`, plus `login/`, `profile/`, `shared/`), `routes/` (central route registry), `utils/` (csv, excel, schedule helpers).

### Routing & auth gating
`src/App.jsx` renders `<LoginUser renderApp={…} />` when the user is not authenticated; on success it renders `layouts/MainLayout.jsx` — the single shell (Sidebar + Topbar + content + logout modal) used by all three roles. Navigation is **state-based** (internal route keys like `a-students`, `t-grades`), not URL/React Router. The route key → screen/title mapping lives in `src/routes/index.jsx` (`ROUTES`, `HOME_ROUTE`); per-role sidebar menus (`NAV`) are declared in MainLayout. The auth gate is `AuthContext.user === null`.

### Contexts (`src/context/`)
- `AppContext.jsx` — theme (light/dark), language (vi/en), `t()` i18n lookup into `constants/i18n.constants.js`.
- `AuthContext.jsx` — on mount calls `GET /api/users/auth` to rehydrate the session. Provides `{ user, loading, login, logout }`. The `user` object is enriched with a `roleKey` field mapped from the DB role string.

### HTTP clients (`src/config/`)
Two axios instances:
- `request.js` — bare instance, used for unauthenticated calls (login, forgot-password, reset-password, refresh-token)
- `axiosClient.js` (`apiClient`) — wraps bare axios with a 401 interceptor that calls `GET /refresh-token` once, retries the failed request, then redirects to `/` on second failure. Used for all authenticated API calls.

All API paths are defined in `src/constants/api.constants.js`. All request functions are in `src/config/userRequest.js`.

### Shared UI building blocks (`src/components/`)
- `icons.jsx` — named icon exports (`I.mail`, `I.lock`, etc.)
- `ui.jsx` — `useToast()`, `useForm()`/`validate`, primitives (Avatar, Modal, Drawer, StatCard, FormField…)
- `shell.jsx` — Sidebar, Topbar, DataTable, Page, SectionHead
- `charts.jsx` — pure-SVG LineChart/BarChart/DonutChart/HBars/Ring
- `feedback.jsx` — Spinner, Empty, SimplePagination
- `table.jsx` — TableToolbar, FilterSelect, RowAction
- `BulkImportDrawer.jsx` / `TeacherBulkImportDrawer.jsx` — CSV/Excel bulk-import drawers

### E2E regression tests
`client_side/tests/e2e.regression.mjs` (run: `npm run test:e2e`, needs backend + seeded DB + dev server on 5173). Testcase catalogue: `documents/testcases/client-side-regression-testcases.md`.

### Password rules
Defined in `src/constants/auth.constants.js` as `PW_RULES` (array of `{ key, test, label_vi, label_en }`). Any form that sets a password must validate against all rules before enabling submit.

## Environment Variables (server_side/.env)

```env
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?schema=public"
PORT=3000
NODE_ENV=development
URL_CLIENT="http://localhost:5173"   # comma-separated for multiple origins
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail address>
SMTP_PASS=<Gmail App Password>       # not the Google account password
```

`JWT_SECRET`, `JWT_EXPIRES_IN`, and `JWT_REFRESH_EXPIRES_IN` in `.env` are **not used** — the actual values come from `src/constants/auth.constants.ts` and per-user RSA keys.

## Database

Schema is in `server_side/prisma/schema.prisma`. Key relationships:
- `User` → `ApiKey` (1:1, cascade delete) — the RSA key pair
- `User` → `Otp` (1:N, cascade delete) — only the latest unexpired OTP matters
- `User` → `Enrollment` → `SubjectClass` → `Subject` — the grade/enrollment chain
- Grade formula: 10% attendance + 30% midterm + 60% final, stored as `totalScore` on `Enrollment`

Seed file: `server_side/prisma/seed.ts`. Seeded constants (emails, passwords, IDs) live in `src/constants/seed.constants.ts`.

---
name: verify
description: How to build, launch, and drive EduManage to verify client/server changes at the real UI.
---

# Verify EduManage

## Launch
1. PostgreSQL must already be running (Windows service).
2. Backend: `cd Server_Side && npm run start:dev` → port 3000 (wait for "Found 0 errors" + Nest route mapping, ~10s).
3. Frontend: `cd Client_Side && npm run dev` → port 5173.
4. Readiness probe: `curl http://localhost:3000/` and `curl http://localhost:5173/` both return 200.

## Drive (Playwright)
- Playwright is a devDependency of `Client_Side` — write a throwaway `.mjs` script inside `Client_Side/tests/` (so `import { chromium } from 'playwright'` resolves), run with `node tests/<script>.mjs`, delete it after. Screenshots go to `tests/screenshots/`.
- Reusable login/nav snippets are in `Client_Side/tests/e2e.regression.mjs` (login placeholder: `Nhập mã tài khoản`; nav: `page.locator('nav button', { hasText: <label> })`).

## Seeded accounts (UI is Vietnamese by default)
- admin / Admin@123
- gv1001 / Teacher@123 (teacher)
- 20216001 / Student@123 (student — has 3 seeded enrollments, 9 credits)

## Gotchas
- Two 401s in the browser console on the login page are normal (AuthContext rehydration before login).
- Student 20216001 gets 409 "Bạn đã đăng ký lớp học phần này" when registering CTDLGT-HK1-2425 — a prior enrollment exists server-side. Use a different section to test happy-path register.
- If you register/drop during verification, restore the seed state afterwards (re-register what you dropped).

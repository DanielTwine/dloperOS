# ClassConnect

Backend: Fastify + TypeScript + Prisma + PostgreSQL
Frontend: Static HTML/CSS/JS (no build step) hitting the API via `/api`.

## Backend dev
```bash
cd classconnect/backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```
API runs on `:4000` by default.

## Frontend dev
Static files live in `classconnect/frontend`. You can open `index.html` directly or serve with `python -m http.server`.

## Key routes
- POST `/auth/login`, `/auth/register`, `/auth/logout`
- GET `/me`, `/dashboard`
- GET `/classes`, POST `/classes/create`
- GET `/timetable/today`, POST `/timetable/add`
- GET `/homework`, POST `/homework/create`
- POST `/homework/submit`
- POST `/setup/school` (EDU first-boot wizard)

Auth via JWT (`Authorization: Bearer <token>`).

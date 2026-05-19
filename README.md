# EMS Pro — Enterprise Employee Management System

Premium dark/neon glassmorphism Employee Management System built with:

- **Next.js 15** (App Router) + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **NextAuth** (Credentials + JWT sessions)
- **Tailwind CSS**, **Framer Motion**, **Recharts**, **Lucide**
- **React Hook Form + Zod**, **Zustand**, **Sonner** toasts

## 1. Setup

```bash
npm install
# or: pnpm install / yarn / bun install
```

Create `.env.local` (copy from `.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ems?retryWrites=true&w=majority
NEXTAUTH_SECRET=replace-with-a-long-random-string
NEXTAUTH_URL=http://localhost:3000
```

> Get a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas — whitelist `0.0.0.0/0` for local dev.
> Generate a secret: `openssl rand -base64 32`

## 2. Seed demo data

```bash
npm run seed
```

Creates demo accounts:

| Role          | Email                | Password    |
|---------------|----------------------|-------------|
| Administrator | admin@ems.com        | admin12345  |
| HR Manager    | hr@ems.com           | hr12345     |
| Employee      | employee@ems.com     | emp12345    |

Plus sample departments and employees.

## 3. Run

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
  app/
    (auth)/login, signup       # Auth pages
    dashboard/                 # Protected dashboard, employees, departments
    api/                       # REST APIs: auth, employees, departments, stats
  components/                  # UI + dashboard widgets
  lib/                         # db, auth, utils
  models/                      # Mongoose models
  types/
middleware.ts                  # Route protection + role-based access
scripts/seed.ts                # Demo data seeder
```

## v1 Scope

Included: Auth + roles, Employees CRUD, Departments CRUD, Dashboard analytics, protected routes.

Coming next: Payroll, Attendance, Leaves, Announcements, Tasks, Notifications — the foundation makes adding these straightforward (replicate the employees/departments pattern).

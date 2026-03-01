# Automated Expense Tracker

Full-stack expense management app with authentication, OCR-powered receipt extraction (Tesseract + Gemini), Veryfi pro parsing, dashboards, settings, and support workflows.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind + TanStack Query
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL
- Auth: Better Auth

## Features

- Auth flow: register, login, forgot/reset password, verify email
- Expense management: add/list expenses with categories
- Dashboard analytics: totals, trends, weekly/monthly charts
- Receipt processing:
  - Basic mode: Tesseract OCR + Gemini parsing
  - Pro mode: Veryfi parsing (with OCR fallback)
- User settings:
  - Default receipt engine
  - Default currency (ETB, USD, EUR)
  - Email notification preference
- Profile management: display info, budget, income, avatar
- Theme support: light/dark mode with localStorage persistence
- Support module:
  - User support request submission + history
  - Admin queue to review and resolve requests

## Project Structure

```
Automated-Expense-Tracker/
├─ frontend/
└─ server/
```

## Getting Started

### 1) Install dependencies

Run in each app folder:

```bash
cd server
npm install

cd ../frontend
npm install
```

### 2) Configure environment variables

Copy the example files and fill in your own values:

```bash
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item frontend/.env.example frontend/.env
```

### 3) Run database migrations

```bash
cd server
npx prisma migrate dev
```

### 4) Start development servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Scripts

Server (`server/package.json`):

- `npm run dev` - start backend with nodemon
- `npm run build` - compile TypeScript
- `npm run lint` - run ESLint
- `npm run test` - run Vitest

Frontend (`frontend/package.json`):

- `npm run dev` - start Vite dev server
- `npm run build` - type-check + production build
- `npm run lint` - run ESLint
- `npm run preview` - preview built app

## Notes

- Default profile currency is ETB.
- Support admin UI is shown only to users allowed by `SUPPORT_ADMIN_EMAILS` on the backend.

## Deploying backend on Render

For the backend service, configure Render with:

- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Pre-Deploy Command** (optional): `npx prisma migrate deploy`
- **Start Command**: `npm start`

The backend uses an npm `prestart` hook (`npm run build`), so `dist/server.js` is generated before startup.

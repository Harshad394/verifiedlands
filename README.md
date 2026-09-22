# VerifiedLand

VerifiedLand is a land marketplace prototype with seller listings, buyer discovery, admin-led verification, KYC document review, site visit requests, and admin-mediated messaging.

## Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Local database: PostgreSQL via Docker Compose

## Project Structure

```text
.
├── backend/          # Express API and Prisma schema
├── frontend/         # Next.js app
├── docker-compose.yml
└── project_guide.md  # Architecture notes and roadmap
```

## Prerequisites

- Node.js 20 or newer
- npm
- Docker and Docker Compose

## Environment Setup

Create local env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Update `backend/.env` with strong values for `JWT_SECRET`, `ADMIN_SECRET`, and the admin seed credentials before deploying.

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d
```

Install backend dependencies and prepare Prisma:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed:admin
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:3000`. The API defaults to `http://localhost:5000`.

## Build Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## GitHub Push

This repository is configured to ignore local secrets, dependencies, uploads, and build outputs. After committing, push to the configured remote:

```bash
git add .
git commit -m "Prepare project for GitHub"
git push -u origin main
```

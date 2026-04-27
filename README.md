# ⚡ VeloConvert

**Fast, secure, and effortless file conversion — built for speed and scale.**

VeloConvert is a full-stack SaaS application that lets authenticated users upload files and process them asynchronously through a job queue. The first supported operation is **PDF compression**, with three quality presets to choose from.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up the server](#2-set-up-the-server)
  - [3. Set up the client](#3-set-up-the-client)
- [Environment Variables](#environment-variables)
  - [Server (`server/.env`)](#server-serverenv)
  - [Client (`client/.env.local`)](#client-clientenvlocal)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client (Next.js)                            │
│   User uploads PDF → Cloudinary → POST /api/jobs/create             │
│   Polls GET /api/jobs/:id/status → GET /api/jobs/:id/download        │
└─────────────────────────────┬────────────────────────────────────────┘
                              │  HTTP (REST)
┌─────────────────────────────▼────────────────────────────────────────┐
│                     Server (Express + TypeScript)                    │
│   • Validates request via Clerk JWT middleware                       │
│   • Inserts job record into Supabase                                 │
│   • Enqueues compression job onto BullMQ (Upstash Redis)             │
└────────────┬─────────────────────────────┬───────────────────────────┘
             │                             │
 ┌───────────▼───────────┐   ┌─────────────▼───────────────────────┐
 │  Upstash Redis Queue  │   │  BullMQ Worker (separate process)    │
 │  (BullMQ transport)   │   │  • Downloads PDF from Cloudinary     │
 └───────────────────────┘   │  • Compresses with pdf-lib           │
                             │  • Stores result on local tmp disk   │
                             └─────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                                            |
|-------------|-------------------------------------------------------|
| Frontend    | Next.js 16, React 19, Tailwind CSS 4, TypeScript      |
| Auth        | [Clerk](https://clerk.com) (client & server SDK)      |
| Backend     | Node.js, Express 5, TypeScript                        |
| Job Queue   | [BullMQ](https://bullmq.io) + [Upstash Redis](https://upstash.com) |
| Database    | [Supabase](https://supabase.com) (PostgreSQL)         |
| File Storage| [Cloudinary](https://cloudinary.com) (upload staging)|
| PDF Engine  | [pdf-lib](https://pdf-lib.js.org)                     |

---

## Features

- 🔐 **Authentication** — Sign-up / sign-in via Clerk (OAuth-ready)
- 📄 **PDF Compression** — Three quality presets:
  - **High Quality** — preserves metadata, minimal size reduction
  - **Balanced** — strips metadata, uses object streams
  - **Small Size** — maximum reduction, strips all metadata
- ⚙️ **Async Job Queue** — jobs processed in the background via BullMQ workers, with real-time status polling
- 📥 **One-click Download** — processed file served directly from the API and cleaned up automatically
- 📱 **Responsive UI** — mobile-first design with a collapsible navbar

---

## Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- A [Clerk](https://dashboard.clerk.com) account (free tier is fine)
- An [Upstash Redis](https://console.upstash.com) database (TCP endpoint required for BullMQ)
- A [Supabase](https://supabase.com) project with a `Job` table
- A [Cloudinary](https://cloudinary.com) account with an **unsigned** upload preset

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yenugantirahul/veloconvert.git
cd veloconvert
```

### 2. Set up the server

```bash
cd server
npm install

# Start the API server
npm run dev

# In a second terminal — start the BullMQ worker
npm run dev:worker
```

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Server (`server/.env`)

Create `server/.env` with the following values:

```env
# Clerk
CLERK_SECRET_KEY=sk_...

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash Redis (TCP host — NOT the REST URL)
UPSTASH_REDIS_HOST=<your-upstash-hostname>
UPSTASH_REDIS_PASSWORD=<your-upstash-password>

# Optional
PORT=5000
SUPABASE_JOBS_TABLE=Job
```

> **Note:** BullMQ requires the raw TCP Redis endpoint. Copy the **hostname** from your Upstash Redis dashboard under "TCP / TLS endpoint", not the REST URL.

### Client (`client/.env.local`)

Create `client/.env.local` with the following values:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup

# Cloudinary (unsigned upload preset)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## API Reference

All endpoints are prefixed with `/api/jobs` and require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

| Method | Path                    | Description                                         |
|--------|-------------------------|-----------------------------------------------------|
| `POST` | `/api/jobs/create`      | Enqueue a new compression job                       |
| `GET`  | `/api/jobs/:jobId/status` | Poll the status of a job (`pending`, `active`, `completed`, `failed`) |
| `GET`  | `/api/jobs/:jobId/download` | Download the processed file once the job is completed |

### POST `/api/jobs/create`

**Request body:**

```json
{
  "uId": "user_abc123",
  "inFormat": "pdf",
  "inUrl": "https://res.cloudinary.com/.../file.pdf",
  "quality": "medium"
}
```

`quality` accepts `"high"`, `"medium"` (default), or `"low"`.

**Response `201`:**

```json
{
  "message": "Job queued",
  "jobId": "42"
}
```

### GET `/api/jobs/:jobId/status`

**Response `200`:**

```json
{
  "jobId": "42",
  "state": "completed",
  "result": {
    "success": true,
    "inputBytes": 2048000,
    "outputBytes": 940000,
    "compressionLevel": "recommended"
  },
  "failedReason": null,
  "downloadUrl": "/api/jobs/42/download"
}
```

---

## Project Structure

```
veloconvert/
├── client/                  # Next.js frontend
│   ├── app/
│   │   ├── auth/            # Login & signup pages (Clerk)
│   │   ├── convert/         # PDF compression page
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   └── Navbar.tsx
│   └── package.json
│
└── server/                  # Express backend
    └── src/
        ├── config/
        │   ├── cloudinary.ts  # (reserved)
        │   ├── supabase.ts    # Supabase client
        │   └── upstash.ts     # BullMQ queue + Redis connection
        ├── controllers/
        │   └── jobs.controller.ts
        ├── routes/
        │   └── jobs.routes.ts
        ├── app.ts             # Express app setup
        ├── server.ts          # HTTP server entry point
        └── worker.ts          # BullMQ worker process
```

---

## Deployment

### Client — Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Set **Root Directory** to `client`.
4. Add all `NEXT_PUBLIC_*` and `CLERK_SECRET_KEY` environment variables in the Vercel dashboard.

### Server — any Node.js host (Railway, Render, Fly.io, etc.)

```bash
cd server
npm run build       # compiles TypeScript → dist/
npm run start       # starts API server
npm run start:worker  # starts BullMQ worker (run as a separate service)
```

Make sure to set all server environment variables in your hosting provider's dashboard.

> **Tip:** Run the API server and the worker as **two separate services** so they can scale independently.

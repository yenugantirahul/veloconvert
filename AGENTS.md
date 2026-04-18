# Workspace Guide

This repository is split into two separate apps. Run commands from the app folder you are changing, not from the workspace root.

- Backend lives in [backend/package.json](backend/package.json) and is an Express + Prisma + Better Auth API. See [backend/AGENTS.md](backend/AGENTS.md) for backend-specific conventions.
- Frontend lives in [frontend/package.json](frontend/package.json) and is a Next.js App Router app. See [frontend/AGENTS.md](frontend/AGENTS.md) for frontend-specific conventions.

Project-specific rules that matter across the repo:

- Keep the upload contract stable: multipart form-data uses `file` plus `targetFormat`.
- The BullMQ / Upstash queue is named `convert`.
- Avoid renaming misspelled paths unless you update every import at the same time, especially `backend/src/wrokers/filconversionWorker.ts` and `frontend/components/Heor.tsx`.
- Prefer linking to existing docs or source files instead of repeating them here.
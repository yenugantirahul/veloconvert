# Frontend Guide

Frontend code lives under [frontend/app](app) and [frontend/components](components). Use the frontend package scripts for all local work:

- `npm run dev` starts the app
- `npm run build` builds the app
- `npm run start` runs the production server
- `npm run lint` checks formatting and static issues

Important frontend conventions:

- This is an App Router app; prefer edits that fit the existing `app/` route structure.
- The auth client lives in [frontend/app/lib/auth-client.ts](app/lib/auth-client.ts); session-aware UI should use the existing client rather than creating a second auth layer.
- API routing depends on [frontend/proxy.ts](proxy.ts) and [frontend/next.config.ts](next.config.ts); backend path changes should be checked against both files.
- The convert flow posts `file` plus `targetFormat` and polls `/api/jobs/:jobId`; keep frontend expectations aligned with backend status values.
- Preserve the current dark, high-contrast visual style unless the task explicitly asks for a redesign.
- Avoid renaming misspelled files like [frontend/components/Heor.tsx](components/Heor.tsx) unless you update every import that depends on them.

For general Next.js background, use the source in this workspace rather than create-next-app defaults.

# Backend Guide

Backend code lives under [backend/src](src) and Prisma schema / migrations live under [backend/prisma](prisma). Use the backend package scripts for all local work:

- `npm run dev` starts `tsx watch src/server.ts`
- `npm run build` runs `tsc`
- `npm run start` runs `nodemon dist/server.js`
- `npm run prisma:migrate` runs `prisma migrate dev`
- `npm test` is a placeholder and exits with an error

Important backend conventions:

- `backend/src/server.ts` boots the API and imports the file-conversion worker on startup.
- The worker path is intentionally misspelled as `wrokers/filconversionWorker.ts`; keep the import aligned if you touch it.
- Uploads expect `multipart/form-data` with `file` and `targetFormat`, and the route uses `upload.single("file")`.
- Job creation should connect the user relation with Prisma instead of writing a raw `userId`.
- The conversion queue is `convert`; keep queue names consistent with the worker and upload controller.
- Cloudinary upload logic is in [backend/src/services/upload.service.ts](src/services/upload.service.ts); the configured client comes from [backend/src/config/cloudinary.ts](src/config/cloudinary.ts).
- CORS and auth behavior are wired in [backend/src/app.ts](src/app.ts) and [backend/src/lib/auth.ts](src/lib/auth.ts); origin and cookie changes should be checked together.

If you need deeper context, prefer the source files over duplicating behavior here.
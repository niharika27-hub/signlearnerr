# SignLearnerr Workspace

This repository is now organized with a clear separation between frontend and backend apps.

## Folder structure

- `frontend/` — React + Vite client app
- `backend/` — Node.js + Express authentication API
- `openspec/` — project specs and change artifacts

## Run commands (from workspace root)

- Start everything + Cloudinary check: `npm run dev:all` (or `npm run run:all`)
- Start everything but skip MongoDB precheck: `npm run dev:all -- --skip-mongo-check`
- Seed default learning modules: `npm run modules:seed`
- Generic import command: `npm run modules:import -- <path-to-manifest.json|csv> [upsert|replace] [dry-run]`
- Import modules from JSON manifest: `npm run modules:import:json`
- Import modules from CSV manifest: `npm run modules:import:csv`
- Frontend dev: `npm run frontend:dev`
- Frontend build: `npm run frontend:build`
- Backend dev: `npm run backend:dev`
- Backend start: `npm run backend:start`

## Environment setup

- Copy `backend/.env.example` to `backend/.env` and fill values.
- Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if backend runs on a different host/port.
- Ensure MongoDB is running before starting backend.
- Cloudinary lesson uploads require backend env keys:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## Notes

- Frontend source lives in `frontend/src/`
- Backend server entry point is `backend/server.js`
- Auth data file is `backend/users.json`
<<<<<<< HEAD
- Dataset shortlist for modules: `docs/module-datasets.md`
- Manifest examples for bulk lesson import: `docs/examples/module-manifest.example.json` and `docs/examples/module-manifest.example.csv`
=======
- Avatar uploads use Cloudinary; the client setup lives in `backend/config/cloudinary.js` and needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from `backend/.env`.
>>>>>>> 408f45b7bb6a527d8d0ee055bc1ebc331495150e

# SignLearnerr Workspace

This repository is now organized with a clear separation between frontend and backend apps.

## Folder structure

- `frontend/` — React + Vite client app
- `backend/` — Node.js + Express authentication API
- `openspec/` — project specs and change artifacts

## Run commands (from workspace root)

- Frontend dev: `npm run frontend:dev`
- Frontend build: `npm run frontend:build`
- Backend dev: `npm run backend:dev`
- Backend start: `npm run backend:start`

## Notes

- Frontend source lives in `frontend/src/`
- Backend server entry point is `backend/server.js`
- Auth data file is `backend/users.json`
- Avatar uploads use Cloudinary; the client setup lives in `backend/config/cloudinary.js` and needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from `backend/.env`.

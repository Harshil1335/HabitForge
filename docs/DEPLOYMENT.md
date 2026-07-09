# Deployment Readiness Guide

This document outlines the architecture and steps required to deploy HabitForge to a production environment. 
**Do not execute these steps during Phase 8.** This is a reference guide for future deployment.

## Production Architecture

- **Frontend:** Netlify (or Vercel, Cloudflare Pages) hosting the static SPA build.
- **Backend:** Render (or Railway, Fly.io, Heroku) hosting the Node.js Express API.
- **Database:** A managed MySQL provider (e.g., Aiven, PlanetScale, DigitalOcean, or an RDS instance).

## Required Production Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | Must be explicitly set to `production`. |
| `PORT` | Often dynamically injected by the hosting provider (e.g., Render sets this). |
| `DATABASE_URL` | The production MySQL connection string. |
| `JWT_SECRET` | A highly secure, long, random string. **Do not use the development secret.** |
| `JWT_EXPIRES_IN` | `7d` (or your preferred session length). |
| `CORS_ORIGIN` | The exact URL of the deployed frontend (e.g., `https://habitforge.netlify.app`). Multiple origins can be comma-separated. |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | The exact URL of your deployed backend API (e.g., `https://habitforge-api.onrender.com/api`). |

## Deployment Order

Deployment must follow a specific sequence to ensure database safety and API availability.

1. **Create the Production Database:** Provision a MySQL database via your chosen provider and obtain the connection string.
2. **Configure Backend Environment Variables:** In your backend hosting dashboard (e.g., Render), enter all required server variables, including the new `DATABASE_URL` and `JWT_SECRET`.
3. **Run Prisma Migrations:** 
   - **CRITICAL:** Use `npx prisma migrate deploy` for production. 
   - Do **NOT** use `npx prisma migrate dev` or `npx prisma db push`.
   - Your CI/CD pipeline or build command should look like:
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && node src/server.js
     ```
4. **Seed Achievements:** Run `npm run seed` against the production database to populate the achievement catalog. This only needs to be done once, but is safe (idempotent) to run multiple times.
5. **Deploy Backend:** Trigger the deployment on your backend provider.
6. **Test Backend Health:** Navigate to `https://<YOUR_BACKEND_URL>/api/health` and verify you receive a success JSON response.
7. **Configure Frontend API URL:** In your frontend hosting dashboard (e.g., Netlify), set `VITE_API_BASE_URL` to point to the backend domain you just tested.
8. **Deploy Frontend:** Trigger the frontend deployment. The build command is `npm run build` and the output directory is `dist`.
9. **Configure CORS:** Ensure the backend `CORS_ORIGIN` matches the exact final URL Netlify provided for the frontend.
10. **Test Full Application:** Open the deployed frontend, register a test user, create a habit, and log a check-in.

## SPA Routing

The frontend includes a `public/_redirects` file designed for Netlify:
```text
/* /index.html 200
```
This ensures React Router correctly handles dynamic routes instead of returning a server-side 404. If deploying to another host, consult their documentation for SPA rewrites.

# Lead Platform — Web App

React frontend for the Lead Platform: a public lead capture form plus a role-based
dashboard for managing the lead lifecycle.

This repository holds the frontend. The API, database and full documentation live in
[**dh-lead-platform-server**](https://github.com/udayasish/dh-lead-platform-server).

Built for Digital Heroes Training Task.

## Live demo

| | |
| --- | --- |
| App | _add URL_ |

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@dhlead.test` | `Admin@12345` |
| Member | `member@dhlead.test` | `Member@12345` |

> Both accounts are listed on the sign-in page and fill the form on click.

## Features

- Public capture form at `/capture` — no account needed
- Lead list with search, status and assignee filters, sorting and pagination
- Lead detail with status pipeline, assignment, notes and activity trail
- Role-aware UI: admin-only actions are hidden, and members can only edit leads
  assigned to them
- Light / dark mode

Permissions are enforced by the API. The UI mirrors them so users aren't shown
actions that would be rejected.

## Tech stack

React 19, TypeScript, Vite, Redux Toolkit, React Router 7, React Hook Form,
Tailwind CSS.

## Getting started

**Requirements:** Node.js 20+, and the
[API](https://github.com/udayasish/dh-lead-platform-server) running locally.

```bash
git clone https://github.com/udayasish/dh-lead-platform-client.git
cd dh-lead-platform-client

cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend origin, e.g. `http://localhost:4000` |

## Project structure

```
src/
├── api/                # typed API client with automatic token refresh
├── components/         # shared UI + AuthLayout route guard
├── conf/               # env config
├── hooks/
├── pages/
├── store/              # Redux Toolkit slices
└── utils/
```

**Notes**

- All requests go through `api/client.ts`. On a `401` it refreshes the token pair and
  retries once; concurrent calls share a single refresh promise, since refresh tokens
  rotate.
- Routes are guarded by `AuthLayout` (`requireRole="admin"` for the team page), and
  admin-only controls are gated again at the component level.

## Deployment

Static build — `npm run build` outputs to `dist/`. Set `VITE_API_URL` to the deployed
API origin at build time, and set the API's `CORS_ORIGIN` to this app's origin. Both
must be served over HTTPS for auth cookies to work.

---

<sub>Built for <a href="https://digitalheroesco.com">Digital Heroes</a> Training Task.</sub>

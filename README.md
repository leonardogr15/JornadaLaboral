# Jornada Laboral

A containerized work-shift tracker: employees log their daily entry and exit times, and administrators manage user accounts, all behind JWT authentication with role-based access enforced on the server.

[![CI](https://github.com/leonardogr15/JornadaLaboral/actions/workflows/ci.yml/badge.svg)](https://github.com/leonardogr15/JornadaLaboral/actions/workflows/ci.yml)

The UI is in Spanish (the original target users); code comments, docs and commits are in English.

## Features

- **Login** with email and password; JWT (HS256, 8 h expiry) and automatic logout after 5 minutes of inactivity.
- **Work-shift log**: register entry/exit times; worked hours are calculated on the server; each user only sees their own shifts.
- **User management (admin only)**: list, create, edit and delete users and assign the `user` or `admin` role.
- **Server-side authorization**: the admin role is checked against the database on every request, and the last admin cannot be deleted or demoted.
- **Health endpoint** that checks both databases, used by the Docker healthchecks.
- **One-command setup** with Docker Compose (four services, healthchecks, no database ports exposed).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Create React App), React Router 7, Axios, served by unprivileged nginx |
| API | Node.js 22, Express 5, zod, jsonwebtoken, bcrypt, helmet, express-rate-limit |
| Users | PostgreSQL 16 (`pg`) |
| Work shifts | MongoDB 7 (Mongoose 8) |
| Tests | Jest + Supertest (integration, real databases), React Testing Library |
| Delivery | Docker Compose, GitHub Actions, gitleaks |

## Architecture

```mermaid
flowchart LR
    B[Browser] -->|HTTP :3000| F["Frontend<br/>React SPA on nginx"]
    B -->|"REST /api + Bearer JWT<br/>:5000"| A["API<br/>Express 5"]
    A -->|"users, roles<br/>(pg)"| P[(PostgreSQL)]
    A -->|"work shifts<br/>(Mongoose)"| M[(MongoDB)]
```

The frontend is a static bundle; the browser calls the API directly (the API URL is set at build time with `REACT_APP_API_URL`, and the API only accepts browser origins listed in `CORS_ORIGINS`).

**Why two data stores?** The project deliberately demonstrates polyglot persistence:

- **Users** are relational data with a hard uniqueness constraint (email) and a role column used for authorization. PostgreSQL gives constraints, transactions and row locks, which the last-admin protection relies on.
- **Work shifts** are append-mostly, per-user documents read as a time-ordered list. They fit a document store and can grow independently of the user table. The link between both is the numeric user id taken from the verified JWT.

For an application this size a single PostgreSQL database would be enough; the split is a learning and portfolio choice, and it is documented as such.

### Backend layout

```
backend/
  app.js            # createApp(): middleware, routes, error handler (no listen)
  server.js         # startup: config check, DB connections, schema/seed, listen
  config/           # PostgreSQL pool, MongoDB connection, JWT settings
  db/bootstrap.js   # idempotent schema creation + demo admin seed
  middlewares/      # authenticate, requireRole, validate (zod), errorHandler
  validation/       # zod schemas for auth, users and shifts
  models/ controllers/ routes/
  tests/            # Jest + Supertest integration tests
```

## Quick start

Requirements: Docker with Docker Compose v2. Ports 3000 and 5000 must be free.

```bash
git clone https://github.com/leonardogr15/JornadaLaboral.git
cd JornadaLaboral
cp .env.example .env      # then replace every "change-me" value
docker compose up -d --build
docker compose ps         # wait until backend shows "healthy"
```

- App: <http://localhost:3000>
- API: <http://localhost:5000/api> (health: <http://localhost:5000/api/health>)

Stop with `docker compose down` (add `-v` to also delete the database volumes).

Compose refuses to start if a required variable is missing, and the backend refuses to start if `JWT_SECRET` is shorter than 32 characters. See [`.env.example`](.env.example) for every variable.

### Demo login

No default password is published. On startup, if no admin exists, the backend creates one using `DEMO_ADMIN_EMAIL` (default `admin@example.com`) and `DEMO_ADMIN_PASSWORD` (at least 12 characters) from your `.env`. The password is stored only as a bcrypt hash. Log in with those values, then create normal users from **Configuración**.

## Running the tests

Backend integration tests run against real, throwaway PostgreSQL and MongoDB containers (no `.env` needed):

```bash
docker compose -f docker-compose.test.yml run --rm --build backend-test
docker compose -f docker-compose.test.yml down
```

Frontend tests:

```bash
cd frontend
npm ci
CI=true npm test
```

The backend suite covers login (including generic error messages and rate limiting), forged tokens (`alg: none`, wrong key), admin CRUD, **a normal user getting 403 on every user-management action including escalating their own role**, 401 without a token, last-admin protection, shift validation and per-user shift isolation. GitHub Actions runs both suites, a Docker Compose build with a health smoke test, and a gitleaks scan of the full history.

## API

Base URL: `http://localhost:5000/api`. Authenticated routes need `Authorization: Bearer <token>`. Errors are JSON `{ "error": "...", "details"?: [...] }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | `200` when PostgreSQL and MongoDB respond, `503` otherwise |
| POST | `/auth/login` | Public, rate limited | `{ email, password }` → `{ token }`; `401` with a generic message on failure, `429` after repeated failures |
| GET | `/usuarios/me` | Any user | Read-only profile of the caller |
| GET | `/usuarios` | Admin | List users (no password hashes) |
| GET | `/usuarios/:id` | Admin | Get one user |
| POST | `/usuarios` | Admin | Create `{ nombre, email, password (8–72), rol? }`; `409` if the email exists |
| PUT | `/usuarios/:id` | Admin | Partial update; empty `password` keeps the current one; `409` on duplicate email or when demoting the last admin |
| DELETE | `/usuarios/:id` | Admin | Delete; `409` for the last admin |
| GET | `/jornadas` | Any user | The caller's shifts, oldest first |
| POST | `/jornadas` | Any user | `{ horaEntrada: "HH:MM", horaSalida: "HH:MM", fecha?: "YYYY-MM-DD" }`; exit must be after entry |

Status codes: `400` validation, `401` missing/invalid token or credentials, `403` insufficient role, `404` not found, `409` conflict, `429` too many login attempts, `500` generic (internal details are logged, never returned).

## Security measures

- Authorization on the server: `authenticate` verifies the JWT, `requireRole('admin')` reloads the caller's role from PostgreSQL, so a demoted or deleted account loses access immediately. A user's own role cannot be changed by themselves.
- Last-admin protection inside a transaction that locks the admin rows.
- JWT algorithm pinned to HS256 for signing and verification; startup fails if `JWT_SECRET` is missing or shorter than 32 characters.
- Passwords hashed with bcrypt; login returns the same message and performs one bcrypt comparison whether or not the email exists (no user enumeration).
- Input validation with zod on every body and id parameter; JSON body limited to 10 kB.
- helmet security headers, rate limit on failed logins, CORS allowlist from `CORS_ORIGINS`.
- No credentials in the repository: Compose reads everything from an untracked `.env`; MongoDB requires authentication and the API uses a least-privilege `readWrite` user.
- Containers run as non-root users; databases are not published to the host.
- Secret scanning with gitleaks in CI. A development `.env` committed early in the history was removed; its values are treated as compromised (see [`.gitleaksignore`](.gitleaksignore)).

## Known limitations and roadmap

- The JWT is stored in `localStorage`, which is readable by any script on the page (XSS risk). Planned: httpOnly, `SameSite` cookie with CSRF protection.
- No refresh tokens or server-side revocation; tokens are valid for 8 hours (role changes are still enforced immediately).
- The admin UI is only hidden for normal users by decoding the token in the browser; this is cosmetic, the server enforces access.
- Shifts cannot be edited or deleted yet, and overlapping shifts on the same day are not detected.
- The login rate limiter uses in-memory storage, so limits are per instance.
- Domain identifiers (`usuarios`, `jornadas`, `rol`) are Spanish to match the UI and existing data.
- Planned: OpenAPI specification, ESLint in CI, shift editing, reports per date range, migration tool instead of the startup schema bootstrap.

## License

[MIT](LICENSE) © 2025-2026 Leonardo Galvis

# NyayaSetu

NyayaSetu is a human-led legal case-management prototype built around the principle **"AI Assists — Human Judge Decides."** It provides a restrained judicial workspace for navigating cases, checking document health, viewing mock research recommendations, planning a cause list, and preparing editable working drafts.

## Stack

- Next.js App Router and TypeScript
- MongoDB and Mongoose for persistence
- Zod validation for all write endpoints
- JWT (jose) + bcrypt (bcryptjs) for admin session authentication
- Deterministic mock review tools; no court data or external AI keys are used

## Run locally

### Prerequisites

1. Install packages: `npm install`
2. Copy `.env.example` to `.env.local`: `copy .env.example .env.local` (Windows) or `cp .env.example .env.local` (macOS/Linux)
3. Set `MONGODB_URI` in `.env.local` to your MongoDB connection string.

### Generate admin credentials (required for the admin dashboard)

**Step 1 – Generate a strong JWT secret** (run in your terminal):
```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy the output into `.env.local` as `ADMIN_JWT_SECRET`.

**Step 2 – Generate a bcrypt password hash** (replace `yourpassword`):
```
node -e "require('bcryptjs').hash('yourpassword', 12).then(console.log)"
```
Copy the hash into `.env.local` as `ADMIN_PASSWORD_HASH`.

> ⚠ Never commit `.env.local`. It is listed in `.gitignore`.

### Seed sample data (optional)

```
npm run seed
```

### Start the development server

```
npm run dev
```

Then open <http://localhost:3000>.

Without `MONGODB_URI`, NyayaSetu runs in demonstration mode with four in-memory sample case records. This makes the interface and routes usable before a local MongoDB instance is available; the sample data resets on restart. Sign-in events and the admin dashboard require a live MongoDB connection.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create and validate a production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run the lint checks |
| `npm run seed` | Upsert the supplied sample data into MongoDB |

## Routes

| Route | Description |
| --- | --- |
| `/` | Case board dashboard |
| `/login` | User sign-in page (records login events to MongoDB) |
| `/admin` | Protected admin dashboard — login records audit table |
| `/admin/login` | Admin authentication page |
| `/cases/:id` | Case detail view |
| `/ai-workspace` | AI review desk |
| `/cause-list` | Cause list planning |
| `/drafting` | Drafting studio |
| `/people` | Lawyers & clients directory |

## API surface

### Case management
- `GET` / `POST` `/api/cases`
- `GET` / `PATCH` `/api/cases/:id`
- `GET` `/api/cases/:id/documents`
- `POST` `/api/cases/:id/document-health`
- `GET` `/api/cases/:id/precedents`
- `GET` `/api/cases/:id/summary`
- `GET` / `POST` `/api/cases/:id/drafts`
- `GET` `/api/cause-list`

### Authentication & login records
- `POST` `/api/signin` — Record a user sign-in event (username + email)
- `POST` `/api/admin/auth` — Admin login (returns an HttpOnly JWT cookie)
- `DELETE` `/api/admin/auth` — Admin logout (clears the session cookie)
- `GET` `/api/admin/login-records` — Paginated login records (requires admin session)

### Admin API query parameters (`/api/admin/login-records`)

| Param | Default | Description |
| --- | --- | --- |
| `page` | `1` | Page number |
| `limit` | `20` | Records per page (max 100) |
| `search` | — | Filter by username or email (case-insensitive) |

## Security notes

- Admin password is **never stored in source code**. Only a bcrypt hash is kept in the environment.
- Admin sessions are JWT tokens signed with `ADMIN_JWT_SECRET`, stored in an HttpOnly, SameSite=Lax cookie.
- All `/admin/*` pages and `/api/admin/login-records` are protected by Next.js edge middleware.
- The `/api/signin` endpoint records who signed in but does **not** issue an authenticated session. Full user authentication would require adding an identity provider (e.g., NextAuth.js).

All assistance endpoints return orientation, data-quality, or scheduling recommendations for judicial review. They do not make findings, determine outcomes, or automate judicial decisions.

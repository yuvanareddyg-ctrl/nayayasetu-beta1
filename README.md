# NyayaSetu

NyayaSetu is a human-led legal case-management prototype built around the principle **“AI Assists — Human Judge Decides.”** It provides a restrained judicial workspace for navigating cases, checking document health, viewing mock research recommendations, planning a cause list, and preparing editable working drafts.

## Stack

- Next.js App Router and TypeScript
- MongoDB and Mongoose for persistence
- Zod validation for all write endpoints
- Deterministic mock review tools; no court data or external AI keys are used

## Run locally

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. To persist data in MongoDB, set `MONGODB_URI` in `.env.local`.
4. Optional: populate MongoDB with the sample matters using `npm run seed`.
5. Start the app with `npm run dev`, then open `http://localhost:3000`.

Without `MONGODB_URI`, NyayaSetu runs in demonstration mode with four in-memory sample case records. This makes the interface and routes usable before a local MongoDB instance is available; the sample data resets on restart.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create and validate a production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run the lint checks |
| `npm run seed` | Upsert the supplied sample data into MongoDB |

## API surface

- `GET` / `POST` `/api/cases`
- `GET` / `PATCH` `/api/cases/:id`
- `GET` `/api/cases/:id/documents`
- `POST` `/api/cases/:id/document-health`
- `GET` `/api/cases/:id/precedents`
- `GET` `/api/cases/:id/summary`
- `GET` / `POST` `/api/cases/:id/drafts`
- `GET` `/api/cause-list`

All assistance endpoints return orientation, data-quality, or scheduling recommendations for judicial review. They do not make findings, determine outcomes, or automate judicial decisions.

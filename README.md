# FetvaBul

FetvaBul is a Next.js 13 application for searching and reading Islamic fatwas.
It provides category-based discovery, autocomplete, sorting, and API endpoints for
search and engagement flows.

<p align="center">
  <img src="./public/fetvabul_logo.png" alt="FetvaBul Logo" width="200" />
</p>

## Features

- Fast fatwa search (`/arama`) with filters and sorting
- Category pages (`/kategori/[slug]`) and fatwa detail pages (`/fetva/[id]`)
- Autocomplete and search stats endpoints
- Contact form endpoint for user submissions
- View/search telemetry backed by Firestore

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- Firebase Firestore
- Vitest

## Requirements

- Node.js 18+
- npm

## Setup

```bash
git clone https://github.com/mtgsoftworks/FetvaBul.git
cd FetvaBul
npm install
npm run dev
```

Local app: `http://localhost:3000`

## Environment Variables

Create `.env.local`:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
DATA_FILE=data/consolidated_fetvas.jsonl
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run start
```

Windows PowerShell policy issue for `npm`:

```bash
npm.cmd run build
```

## API Overview

- `GET /api/search` - query, category, sortBy, page, limit
- `GET /api/search/stats` - index/search stats
- `GET /api/autocomplete` - suggestions
- `GET /api/categories` - category list/count
- `GET /api/categories/[slug]` - category detail
- `GET /api/fatwas/[id]` - fatwa detail
- `POST /api/contact` - contact/question submit
- `GET /api/health` - health status

## Project Structure

```text
app/         pages + API routes
components/  UI and page components
hooks/       custom React hooks
lib/         data service, search index, firebase, utilities
data/        JSONL datasets
public/      static assets
scripts/     build/data scripts
test/        vitest tests
```

## Deployment

### Vercel

1. Import repository
2. Set `FIREBASE_*` and `DATA_FILE` environment variables
3. Build command: `npm run build`

### Self-hosted

```bash
npm run build
npm run start
```

If port `3000` is already in use:

```bash
npx next start -p 3010
```

## License

MIT

## Contact

- Email: mtgsoftworks@gmail.com
- Web: https://fetvabul.com
- GitHub: https://github.com/mtgsoftworks/FetvaBul


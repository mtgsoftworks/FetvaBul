# File-Backed Data Service

This project now uses a file-backed `DataService` instead of MongoDB.

## Overview
- Data is loaded from `data/normalized_qa_with_keywords.jsonl` into memory on first use.
- A custom in-memory search index (`lib/search-index.ts`) provides Turkish-aware search, suggestions, and highlighting.
- API routes under `app/api/` call `DataService` on the server. Client-side hooks call these API routes.

## Key Files
- `lib/data-service.ts`: Loads JSONL, builds indexes, exposes read/search methods.
- `lib/search-index.ts`: Tokenization, normalization, inverted index, search & suggestions.
- `scripts/migrate-data.ts`: Transforms a raw JSONL into `normalized_qa_with_keywords.jsonl` (adds keywords, normalized text, IDs).

## Dataset
- Canonical dataset path: `data/normalized_qa_with_keywords.jsonl`.
- Each line is a JSON object representing a single fatwa, e.g. fields: `id`, `q_in_file`, `question`, `answer`, `categories`, `searchKeywords`, `views`, `likes`, optional `date`, `source`, `arabicText`, `normalizedText`.

### Generate/refresh dataset
```bash
npm run migrate
# Output: data/normalized_qa_with_keywords.jsonl
```

## API Endpoints
- `GET /api/search?q=...&category=&sortBy=&limit=&page=`
  - Response: `{ results: InternalSearchResult[], pagination: { page, limit, hasMore }, success: true }`
- `GET /api/search/stats`
  - Response: `{ stats: { totalFatwas, totalKeywords, averageKeywordsPerFatva, mostCommonKeywords[] }, success: true }`
- `GET /api/autocomplete?q=...`
  - Response: `{ suggestions: string[], success: true }`
- `GET /api/categories`
  - Response: `{ categories: Category[], success: true }`
- `GET /api/categories/[slug]`
  - Response includes `category` and `fatwas`.
- `GET /api/fatwas/[id]`
  - Returns a fatwa and increments its view count in-memory.
- `GET /api/health`
  - Returns system health + basic metrics.

## Client Hooks
- `hooks/use-search.ts` calls API endpoints and manages local state, pagination, and stats loading on the client.

## Environment
- MongoDB variables (e.g., `MONGODB_URI`, `MONGODB_DB_NAME`) are no longer used.
- No env variable is required for the dataset; default path is `data/normalized_qa_with_keywords.jsonl`.

## Notes
- On first request, `DataService.initialize()` loads the dataset and builds indexes.
- Views are incremented in-memory during the request lifecycle (not persisted to disk).
- If you change the dataset, rebuild the search index by restarting the dev server.

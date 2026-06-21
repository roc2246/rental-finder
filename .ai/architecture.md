# Architecture

## High-Level Split

- client/: React + Vite single-page application.
- server/: Express API, scraping utilities, cron ingestion, MongoDB persistence.
- mock-websites/: Static HTML fixtures used by scraper and tests.

## Backend Request Flow

1. Route definition in server/routes/index.js
2. Middleware chain in server/middleware/index.js
	 - requestLogger
	 - validateRentalQuery / validateObjectId / validateRentalBody
	 - authenticateToken + authorize (for write routes)
3. Controller in server/controls/CRUD.js
4. Model in server/models/CRUD.js
5. Standard JSON response returned to client

## API Contract (Current)

- Read endpoints:
	- GET /api/rentals
	- GET /api/listings
	- GET /api/rentals/:id
- Write endpoints (authenticated):
	- POST /api/rentals (admin, agent)
	- PUT /api/rentals/:id (admin, agent)
	- DELETE /api/rentals/:id (admin)

Collection response shape:
- data: []
- meta: { total, page, pageSize, totalPages }

## Data Ingestion Flow

1. Cron scheduler in server/chron/index.js triggers on configured schedule.
2. Utilities scrape from configured sources in server/utils/scrape.js.
3. Batch helper in server/utils/CRUD.js applies model operations safely.
4. Models persist updates in MongoDB.

## Frontend Flow

1. State and orchestration in client/src/App.jsx
2. API calls via client/src/js/fetch-library.js
3. UI composition using sections and reusable components:
	 - Filters
	 - ListingsGrid
	 - Pagination

## Environment Notes

- Required: MONGO_URI
- Common: PORT, CORS_ORIGIN, JWT_SECRET, CRON_SCHEDULE, BATCH_SIZE, NODE_ENV
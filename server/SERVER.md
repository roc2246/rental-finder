# Rental Finder Server Documentation

## Overview
The Rental Finder server is a Node.js/Express API that provides rental listing management with web scraping capabilities. It includes database persistence with MongoDB, batch processing utilities, and scheduled task management.

## Project Structure

```
server/
├── index.js              # Main server entry point
├── package.json
├── chron/                # Scheduled tasks/cron jobs
│   └── index.js
├── config/               # Environment configuration
├── controls/             # HTTP request handlers
│   ├── CRUD.js          # Rental retrieval endpoint
│   ├── index.js
│   └── __tests__/        # Controller tests
├── models/               # Data layer
│   ├── db.js            # Database connection
│   ├── CRUD.js          # Database operations (add, update, delete, get)
│   ├── schemas.js       # MongoDB schema definitions
│   ├── index.js
│   └── __tests__/        # Model tests
└── utils/                # Utility functions
    ├── scrape.js        # Web scraping utilities
    ├── CRUD.js          # Batch processing helper
    ├── site-dir.js      # CSS selectors for different rental sites
    ├── index.js
    └── __tests__/        # Utility tests
```

## API Endpoints

### Health Check
```
GET /health
Response: { status: "ok" }
```

### Retrieve Rentals

This endpoint is available under both:
```
GET /api/rentals
GET /api/listings   (alias used by the frontend)
```

The path accepts the following query parameters (JSON string values may be
provided either as raw objects or stringified):

```
?filters={...}&page=1&pagesize=20&sort={...}
```

or with camel‑case names (supported for convenience):

```
?filters={...}&page=1&pageSize=20&sort={...}
```

#### Query Parameters
  - filters (JSON string/object): Filter criteria, e.g. `{"city":"Boston"}`
  - page (number): Page number for pagination (default: 1)
  - pagesize / pageSize (number): Results per page (default: 20)
  - sort (JSON string/object): Sort criteria, e.g. `{"price":1}` (default: ascending by price)

#### Response
```json
{
  "data": [
    { "title": "...", "price": "...", "location": "..." },
    ...
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

### Single Rental
```
GET /api/rentals/:id
Response: { data: { ...rental } }
```

### Create Rental (Protected)
```
POST /api/rentals
Requires: Authorization: Bearer <token>
Allowed Roles: admin, agent
```

### Update Rental (Protected)
```
PUT /api/rentals/:id
Requires: Authorization: Bearer <token>
Allowed Roles: admin, agent
```

### Delete Rental (Protected)
```
DELETE /api/rentals/:id
Requires: Authorization: Bearer <token>
Allowed Roles: admin
Response: 204 No Content
```

## Key Components

### Models (`server/models/`)
- **db.js**: Establishes MongoDB connection via mongoose
- **CRUD.js**: Core database operations
  - `addRental()`: Insert new rental, prevents duplicates by listingURL
  - `updateRentalById()`: Update rental fields by MongoDB id
  - `deleteRentalById()`: Delete rental by MongoDB id
  - `getRentals()`: Fetch and paginate rentals with filtering

### Controls (`server/controls/`)
- **CRUD.js**: HTTP request handler
  - `manageRentalRetrieval()`: Returns collection responses in `{ data, meta }` format
  - `getRental()`: Returns single rental by id
  - `createRental()`: Creates rental with validation and conflict handling
  - `updateRental()`: Updates rental by id
  - `deleteRental()`: Deletes rental by id

### Utils (`server/utils/`)
- **scrape.js**: Web scraping functions
  - `scrapeRentals(url)`: Parses HTML from URL or local file, extracts rental listings
- **CRUD.js**: Batch processing utility
  - `manageBatchSize(batchSize, data, modelFunc)`: Processes large datasets in batches and returns success/failure counts
- **site-dir.js**: CSS selector mappings for different rental websites

## Configuration

Environment variables must be set in `config/.env`:
```
MONGO_URI=mongodb://localhost:27017/rentalfinder
PORT=3000
JWT_SECRET=replace-with-strong-secret
CORS_ORIGIN=http://localhost:5173
CRON_SCHEDULE=*/5 * * * *
BATCH_SIZE=10
NODE_ENV=development
```

## Running Tests

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- CRUD.test.js
```

Watch mode:
```bash
npm test -- --watch
```

## Testing

### Model Tests (`server/models/__tests__/CRUD.test.js`)
Tests core CRUD operations with MongoDB memory server:
- Rental creation and duplicate prevention
- Updates and data integrity
- Pagination and filtering
- Soft/hard delete operations

### Control Tests (`server/controls/__tests__/CRUD.test.js`)
Tests HTTP endpoint handling:
- Default and custom query parameters
- Pagination and sorting
- Filter application
- Error handling (500 responses)

### Utility Tests (`server/utils/__tests__/`)
- **scrape.test.js**: HTML parsing and scraping functionality
- **CRUD.test.js**: Batch processing with error handling

## Development Workflow

1. Add new features to models first
2. Write/update model tests
3. Create controller handlers using models
4. Write controller tests
5. Update this documentation

## Error Handling

- Database errors: Return 500 with error message
- Invalid input: Defaults applied (e.g., page=1, pagesize=20)
- Scraping errors: Logged to console, error thrown
- Authentication errors: Return 401/403 with standardized JSON response

## Performance Considerations

- Pagination: Use page + pagesize to handle large datasets
- Batch processing: `manageBatchSize()` prevents overwhelming database with bulk operations
- Caching: Implement in controls layer for frequently accessed data

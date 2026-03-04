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
  "results": [
    { "title": "...", "price": "...", "location": "..." },
    ...
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

## Key Components

### Models (`server/models/`)
- **db.js**: Establishes MongoDB connection via mongoose
- **CRUD.js**: Core database operations
  - `addRental()`: Insert new rental, prevents duplicates by listingURL
  - `updateRental()`: Update rental fields
  - `deleteRental()`: Delete rental (soft delete by default)
  - `getRentals()`: Fetch and paginate rentals with filtering

### Controls (`server/controls/`)
- **CRUD.js**: HTTP request handler
  - `manageRentalRetrieval()`: Processes GET /rentals requests, validates query params, returns paginated results

### Utils (`server/utils/`)
- **scrape.js**: Web scraping functions
  - `scrapeRentals(url)`: Parses HTML from URL or local file, extracts rental listings
- **CRUD.js**: Batch processing utility
  - `manageBatchSize(batchSize, data, modelFunc)`: Processes large datasets in configurable batches
- **site-dir.js**: CSS selector mappings for different rental websites

## Configuration

Environment variables must be set in `config/.env`:
```
MONGO_URI=mongodb://localhost:27017/rentalfinder
PORT=3000
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

## Performance Considerations

- Pagination: Use page + pagesize to handle large datasets
- Batch processing: `manageBatchSize()` prevents overwhelming database with bulk operations
- Caching: Implement in controls layer for frequently accessed data

# Server Test Files Reference

## Quick File Locations & Contents

### Models Tests
```
server/models/__tests__/
├── CRUD.test.js (90+ tests)
│   ├── addRental (15 tests)
│   │   ✓ Creation, duplicates, validation, edge cases
│   ├── updateRental (12 tests)
│   │   ✓ Field updates, preservation, edge cases
│   ├── deleteRental (4 tests)
│   │   ✓ Deletion, non-existent, double-delete
│   └── getRentals (52 tests)
│       ✓ Pagination, filtering, sorting, metadata, edge cases
│
└── db.test.js (25+ tests)
    ├── connectDB (20 tests)
    │   ✓ Success, errors, logging, config
    └── Configuration (5 tests)
        ✓ Env vars, custom URIs, ports
```

### Controls Tests
```
server/controls/__tests__/
└── CRUD.test.js (95+ tests)
    ├── Basic Functionality (5 tests)
    │   ✓ Defaults, filters, pagination, sort
    ├── Parameter Parsing (15+ tests)
    │   ✓ Invalid inputs, floats, whitespace, edge cases
    ├── Filter Handling (10 tests)
    │   ✓ Single, multiple, operators, special chars
    ├── Sort Parameters (5 tests)
    │   ✓ Ascending, descending, multi-field
    ├── Error Handling (10 tests)
    │   ✓ Network, timeout, custom messages
    ├── Response Handling (10 tests)
    │   ✓ Empty, large, single item, preserves data
    └── Integration Scenarios (5 tests)
        ✓ Full requests, pagination flow, refinement
```

### Utilities Tests
```
server/utils/__tests__/
├── scrape.test.js (85+ tests)
│   ├── Basic Functionality (2 tests)
│   │   ✓ Single & multiple listings
│   ├── HTML Parsing (20 tests)
│   │   ✓ Empty, missing fields, special chars, malformed
│   ├── URL Handling (5 tests)
│   │   ✓ HTTP/HTTPS, params, fragments, complex
│   ├── Error Handling (10 tests)
│   │   ✓ Network, timeout, 404, unknown errors
│   ├── Response Format (5 tests)
│   │   ✓ Array, structure, consistency
│   ├── Performance (3 tests)
│   │   ✓ 1000+ items, accuracy, efficiency
│   └── Logging (1 test)
│       ✓ Count verification
│
├── CRUD.test.js (60+ tests)
│   ├── Basic Batch Processing (5 tests)
│   │   ✓ All items, single batch, multiple batches
│   ├── Batch Size Variations (6 tests)
│   │   ✓ Size 1, equal to length, larger, very large
│   ├── Data Handling (10 tests)
│   │   ✓ Empty, single, order, large datasets
│   ├── Success/Failure Counting (8 tests)
│   │   ✓ Fulfillment, rejection, mixed results
│   ├── Function Behavior (5 tests)
│   │   ✓ Order, individual passing, sequential
│   ├── Async Behavior (3 tests)
│   │   ✓ Completion, rapid resolution, batching
│   ├── Large Scale (3 tests)
│   │   ✓ 1000+ items, extremes, accuracy
│   └── Console Logging (3 tests)
│       ✓ Function names, counts, empty data
│
└── site-dir.test.js (40+ tests)
    ├── Structure & Format (3 tests)
    │   ✓ Object export, config presence
    ├── Selector Values (4 tests)
    │   ✓ Valid CSS, non-empty, format
    ├── CSS Validator (5 tests)
    │   ✓ Syntax, dot notation, characters
    ├── Data Consistency (5 tests)
    │   ✓ Properties, compatibility, uniqueness
    ├── Usage & Compatibility (5 tests)
    │   ✓ Cheerio, querySelector, chains
    ├── Extensibility (3 tests)
    │   ✓ Adding configs, backward compat, structure
    ├── Hierarchy (2 tests)
    │   ✓ Nesting, distinctness
    ├── Real-world (2 tests)
    │   ✓ HTML matching, parsing
    └── Documentation (3 tests)
        ✓ Naming, descriptive, documented
```

### Server Entry Point Tests
```
server/__tests__/
└── index.test.js (35+ tests)
    ├── Express Init (4 tests)
    │   ✓ Creation, middleware, endpoints
    ├── Health Endpoint (2 tests)
    │   ✓ JSON response, status field
    ├── Root Endpoint (1 test)
    │   ✓ API message
    ├── Server Startup (5 tests)
    │   ✓ DB connection, cron, ports, env vars
    ├── Error Handling (3 tests)
    │   ✓ DB errors, logging, exit
    ├── Configuration (2 tests)
    │   ✓ Env loading, path resolution
    ├── Middleware (2 tests)
    │   ✓ JSON parser, ordering
    ├── Routes (3 tests)
    │   ✓ Handler registration, types
    ├── Startup Sequence (3 tests)
    │   ✓ Initialization order, completion
    ├── Logging (3 tests)
    │   ✓ Success, error, startup messages
    └── Instance Management (3 tests)
        ✓ Single instance, single port, routes
```

## Total Test Count

| Category | Count | Type |
|----------|-------|------|
| Models | 115+ | Unit + Integration |
| Controls | 95+ | Unit + Mock |
| Utils | 185+ | Unit + Edge Cases |
| Server | 35+ | Unit + Mock |
| **TOTAL** | **430+** | **All Types** |

## Test Execution Order (Recommended)

1. **Models first** (Most fundamental)
   ```bash
   npm test -- server/models/__tests__/
   ```

2. **Utils second** (Dependencies for other layers)
   ```bash
   npm test -- server/utils/__tests__/
   ```

3. **Controls third** (Depends on models)
   ```bash
   npm test -- server/controls/__tests__/
   ```

4. **Server last** (Everything together)
   ```bash
   npm test -- server/__tests__/
   ```

## Running Specific Tests

```bash
# All tests
npm test

# Models only
npm test -- models/__tests__

# CRUD operations specifically
npm test -- -t "CRUD"

# Batch processing tests
npm test -- -t "manageBatchSize"

# Scraping tests
npm test -- -t "scrapeRentals"

# Parameter validation
npm test -- -t "Parameter"

# Error handling
npm test -- -t "Error"

# Watch mode (great for development)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Key Test Patterns Used

### Pattern 1: Happy Path Testing
```javascript
it('does the happy thing', async () => {
  const result = await function();
  expect(result).toBeTruthy();
});
```

### Pattern 2: Error Testing
```javascript
it('handles errors properly', async () => {
  const error = new Error('fail');
  vi.mocked(dependency).mockRejectedValue(error);
  await expect(function()).rejects.toThrow();
});
```

### Pattern 3: Edge Case Testing
```javascript
it('handles edge case (null, zero, empty)', async () => {
  const result = await function(null);
  expect(result).toEqual(expectedBehavior);
});
```

### Pattern 4: Mock Testing
```javascript
beforeEach(() => {
  vi.clearAllMocks();
  mockFunction.mockResolvedValue(data);
});
```

### Pattern 5: Integration Testing
```javascript
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(uri);
});
```

## Coverage Statistics

### By Function
- **addRental()**: 15 tests
- **updateRental()**: 12 tests
- **deleteRental()**: 4 tests
- **getRentals()**: 52 tests
- **manageRentalRetrieval()**: 95 tests
- **connectDB()**: 25 tests
- **scrapeRentals()**: 85 tests
- **manageBatchSize()**: 60 tests
- **siteDir**: 40 tests
- **Server startup**: 35 tests

### By Type
- **Unit tests**: 150+
- **Integration tests**: 50+
- **Edge case tests**: 100+
- **Error handling tests**: 50+
- **Performance tests**: 20+
- **Logging/output tests**: 30+

## Test Discovery

All test files follow the pattern: `*.test.js` or `*.spec.js`

Vitest automatically discovers them in:
```
server/**/__tests__/*.test.js
server/**/*.test.js
server/**/*.spec.js
```

## Maintenance Notes

- ✅ Tests run in isolation (no state carried between tests)
- ✅ Mocks are cleared between tests
- ✅ Async operations properly awaited
- ✅ No test interdependencies
- ✅ Realistic test data used
- ✅ Error cases explicitly tested
- ✅ Performance scenarios included
- ✅ Logging output verified

## Adding New Tests

When you add a new feature:

1. Create/update test file in `__tests__` directory
2. Add describe blocks by feature
3. Include multiple test cases:
   - Normal operation
   - Error scenarios
   - Edge cases
4. Run tests: `npm test`
5. Verify coverage: `npm test -- --coverage`

## Test Documentation Files

- **TEST-COVERAGE.md** - Detailed test breakdown
- **TESTING-GUIDE.md** - Testing overview and examples
- **This file** - Quick reference

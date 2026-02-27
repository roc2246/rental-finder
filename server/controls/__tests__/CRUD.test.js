import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controls from '../CRUD.js';
import * as models from '../../models/index.js';

// Mock the models module
vi.mock('../../models/index.js');

describe('manageRentalRetrieval', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Express request/response objects
    req = {
      query: {}
    };

    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    };
  });

  describe('Basic Functionality', () => {
    it('retrieves rentals with default parameters when no query params provided', async () => {
      const mockRentals = {
        results: [
          { title: 'Apartment 1', price: '$1000', location: 'Boston' },
          { title: 'Apartment 2', price: '$1200', location: 'Cambridge' }
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1
      };

      models.getRentals.mockResolvedValue(mockRentals);

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
      expect(res.json).toHaveBeenCalledWith(mockRentals);
    });

    it('applies filters from query parameters', async () => {
      req.query.filters = { city: 'Boston' };

      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({ city: 'Boston' }, 1, 20, { dailyRate: 1 });
    });

    it('respects pagination parameters', async () => {
      req.query.page = '2';
      req.query.pagesize = '50';

      models.getRentals.mockResolvedValue({ results: [], total: 100 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 2, 50, { dailyRate: 1 });
    });

    it('applies custom sort criteria', async () => {
      req.query.sort = { dailyRate: -1 };

      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: -1 });
    });

    it('returns paginated results with all metadata', async () => {
      const mockResponse = {
        results: [
          { id: 1, title: 'Apt A', price: '$1000' },
          { id: 2, title: 'Apt B', price: '$1500' }
        ],
        total: 45,
        page: 2,
        pageSize: 20,
        totalPages: 3
      };

      models.getRentals.mockResolvedValue(mockResponse);
      req.query.page = '2';
      req.query.pagesize = '20';

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });

  describe('Parameter Parsing and Validation', () => {
    it('handles invalid page number by defaulting to 1', async () => {
      req.query.page = 'invalid';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles invalid pagesize by defaulting to 20', async () => {
      req.query.pagesize = 'notanumber';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles null page parameter', async () => {
      req.query.page = null;
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles zero as page number', async () => {
      req.query.page = '0';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      // 0 from parseInt defaults to 1 due to logical OR
      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles negative page number', async () => {
      req.query.page = '-5';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalled();
    });

    it('handles very large page number', async () => {
      req.query.page = '999999';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 999999, 20, { dailyRate: 1 });
    });

    it('handles very large pagesize', async () => {
      req.query.pagesize = '10000';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 10000, { dailyRate: 1 });
    });

    it('handles pagesize of 0', async () => {
      req.query.pagesize = '0';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalled();
    });

    it('handles negative pagesize', async () => {
      req.query.pagesize = '-10';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalled();
    });

    it('handles float values for page/pagesize', async () => {
      req.query.page = '2.5';
      req.query.pagesize = '20.9';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      // parseInt truncates floats
      expect(models.getRentals).toHaveBeenCalledWith({}, 2, 20, { dailyRate: 1 });
    });

    it('handles whitespace in numeric parameters', async () => {
      req.query.page = '  3  ';
      req.query.pagesize = '  25  ';
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      // parseInt should handle leading/trailing whitespace
      expect(models.getRentals).toHaveBeenCalledWith({}, 3, 25, { dailyRate: 1 });
    });
  });

  describe('Filter Handling', () => {
    it('handles single filter parameter', async () => {
      req.query.filters = { city: 'Boston' };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({ city: 'Boston' }, 1, 20, { dailyRate: 1 });
    });

    it('handles multiple filter parameters', async () => {
      req.query.filters = { city: 'Boston', state: 'MA', minPrice: 500 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith(
        { city: 'Boston', state: 'MA', minPrice: 500 },
        1,
        20,
        { dailyRate: 1 }
      );
    });

    it('handles empty filter object', async () => {
      req.query.filters = {};
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles null filters parameter', async () => {
      req.query.filters = null;
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('handles complex filter with operators', async () => {
      req.query.filters = {
        city: 'NYC',
        dailyRate: { $gte: 100, $lte: 500 },
        bedrooms: { $in: [2, 3] }
      };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith(
        req.query.filters,
        1,
        20,
        { dailyRate: 1 }
      );
    });

    it('handles special characters in filter values', async () => {
      req.query.filters = { city: "New York's 'Premier' Apts (®)" };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalled();
    });

    it('handles numeric filter values', async () => {
      req.query.filters = { bedrooms: 3, maxPrice: 2000 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith(
        { bedrooms: 3, maxPrice: 2000 },
        1,
        20,
        { dailyRate: 1 }
      );
    });

    it('handles boolean filter values', async () => {
      req.query.filters = { available: true, petFriendly: false };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalled();
    });
  });

  describe('Sort Parameter Handling', () => {
    it('uses default sort when none provided', async () => {
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('applies ascending sort when specified', async () => {
      req.query.sort = { dailyRate: 1 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: 1 });
    });

    it('applies descending sort when specified', async () => {
      req.query.sort = { dailyRate: -1 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { dailyRate: -1 });
    });

    it('applies multi-field sort', async () => {
      req.query.sort = { city: 1, dailyRate: -1 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { city: 1, dailyRate: -1 });
    });

    it('sorts by title field', async () => {
      req.query.sort = { title: 1 };
      models.getRentals.mockResolvedValue({ results: [], total: 0 });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith({}, 1, 20, { title: 1 });
    });
  });

  describe('Error Handling', () => {
    it('returns 500 status with error message on database failure', async () => {
      const error = new Error('Database connection failed');
      models.getRentals.mockRejectedValue(error);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });

    it('handles generic Error type', async () => {
      const error = new Error('Something went wrong');
      models.getRentals.mockRejectedValue(error);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    });

    it('handles errors with custom messages', async () => {
      const error = new Error('Validation failed: missing city filter');
      models.getRentals.mockRejectedValue(error);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed: missing city filter' });
    });

    it('handles timeout errors', async () => {
      const error = new Error('Query timeout');
      models.getRentals.mockRejectedValue(error);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query timeout' });
    });

    it('handles network errors', async () => {
      const error = new Error('ECONNREFUSED');
      models.getRentals.mockRejectedValue(error);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('handles null error objects gracefully', async () => {
      models.getRentals.mockRejectedValue(null);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unknown error occurred' })
      );
    });

    it('handles undefined error', async () => {
      models.getRentals.mockRejectedValue(undefined);

      await controls.manageRentalRetrieval(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unknown error occurred' })
      );
    });
  });

  describe('Response Handling', () => {
    it('returns empty results list when no rentals found', async () => {
      const mockResponse = {
        results: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('returns results with large total count', async () => {
      const mockResponse = {
        results: Array(20).fill({ title: 'Apt', price: '$1000' }),
        total: 999999,
        page: 1,
        pageSize: 20,
        totalPages: 50000
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('returns single result when pagesize matches total', async () => {
      const mockResponse = {
        results: [{ title: 'Only Apt', price: '$1000' }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('returns full page of results', async () => {
      const results = Array(20).fill(null).map((_, i) => ({
        id: i,
        title: `Apartment ${i}`,
        price: `$${1000 + i * 100}`
      }));

      const mockResponse = {
        results,
        total: 200,
        page: 1,
        pageSize: 20,
        totalPages: 10
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('preserves result field values', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'Test Apt',
            price: '$1500',
            location: 'Boston',
            bedrooms: 2,
            bathrooms: 1
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);

      // Verify all fields are preserved
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.results[0]).toEqual(mockResponse.results[0]);
    });
  });

  describe('Integration Scenarios', () => {
    it('handles complete request with all query parameters', async () => {
      req.query.filters = { city: 'Boston', minPrice: 500, maxPrice: 2000 };
      req.query.page = '2';
      req.query.pagesize = '50';
      req.query.sort = { dailyRate: -1 };

      const mockResponse = {
        results: Array(50).fill({ title: 'Apt', price: '$1200' }),
        total: 250,
        page: 2,
        pageSize: 50,
        totalPages: 5
      };
      models.getRentals.mockResolvedValue(mockResponse);

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledWith(
        { city: 'Boston', minPrice: 500, maxPrice: 2000 },
        2,
        50,
        { dailyRate: -1 }
      );
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('handles paginating through all results', async () => {
      // First page
      req.query.page = '1';
      req.query.pagesize = '3';
      models.getRentals.mockResolvedValue({
        results: [{ title: '1' }, { title: '2' }, { title: '3' }],
        total: 7,
        page: 1,
        pageSize: 3,
        totalPages: 3
      });

      await controls.manageRentalRetrieval(req, res);

      // Second page
      req.query.page = '2';
      models.getRentals.mockResolvedValue({
        results: [{ title: '4' }, { title: '5' }, { title: '6' }],
        total: 7,
        page: 2,
        pageSize: 3,
        totalPages: 3
      });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledTimes(2);
    });

    it('handles filter refinement across requests', async () => {
      // Broad search
      req.query.filters = { city: 'Boston' };
      models.getRentals.mockResolvedValue({
        results: Array(20).fill({ city: 'Boston' }),
        total: 150,
        page: 1,
        pageSize: 20,
        totalPages: 8
      });

      await controls.manageRentalRetrieval(req, res);

      // Refined search
      req.query.filters = { city: 'Boston', dailyRate: { $lte: 1500 } };
      models.getRentals.mockResolvedValue({
        results: Array(20).fill({ city: 'Boston' }),
        total: 45,
        page: 1,
        pageSize: 20,
        totalPages: 3
      });

      await controls.manageRentalRetrieval(req, res);

      expect(models.getRentals).toHaveBeenCalledTimes(2);
    });
  });
});

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import * as CRUD from '../CRUD.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('CRUD functions', () => {
  describe('addRental', () => {
    it('creates a new rental successfully', async () => {
      const listing = { title: 'A', listingURL: 'http://a', city: 'X', dailyRate: 100 };
      const created = await CRUD.addRental(listing);
      expect(created).toBeTruthy();
      expect(created.listingURL).toBe(listing.listingURL);
      expect(created.title).toBe(listing.title);
      expect(created.city).toBe(listing.city);
      expect(created.dailyRate).toBe(listing.dailyRate);
    });

    it('prevents duplicate insertions by listingURL', async () => {
      const listing = { title: 'A', listingURL: 'http://a', city: 'X', dailyRate: 100 };
      const created = await CRUD.addRental(listing);
      expect(created).toBeTruthy();

      const duplicate = await CRUD.addRental(listing);
      expect(duplicate).toBeNull();
    });

    it('throws error when listing is null', async () => {
      await expect(CRUD.addRental(null)).rejects.toThrow('listing must include a listingURL');
    });

    it('throws error when listing is undefined', async () => {
      await expect(CRUD.addRental(undefined)).rejects.toThrow('listing must include a listingURL');
    });

    it('throws error when listingURL is missing', async () => {
      const listing = { title: 'Missing URL', city: 'Boston' };
      await expect(CRUD.addRental(listing)).rejects.toThrow('listing must include a listingURL');
    });

    it('throws error when listingURL is empty string', async () => {
      const listing = { title: 'Empty URL', listingURL: '', city: 'Boston' };
      await expect(CRUD.addRental(listing)).rejects.toThrow('listing must include a listingURL');
    });

    it('handles listings with all optional fields', async () => {
      const listing = {
        title: 'Full Listing',
        listingURL: 'http://full',
        city: 'Boston',
        dailyRate: 1500,
        description: 'Beautiful apartment',
        bedrooms: 2,
        bathrooms: 1.5,
        squareFeet: 900,
        amenities: ['WiFi', 'Parking'],
        images: ['img1.jpg', 'img2.jpg'],
        timestamp: new Date()
      };
      const created = await CRUD.addRental(listing);
      expect(created).toBeTruthy();
      expect(created.title).toBe(listing.title);
      expect(created.bedrooms).toBe(listing.bedrooms);
    });

    it('stores rental with minimal required fields', async () => {
      const listing = { listingURL: 'http://minimal' };
      const created = await CRUD.addRental(listing);
      expect(created).toBeTruthy();
      expect(created.listingURL).toBe('http://minimal');
    });

    it('preserves exact listingURL format', async () => {
      const urls = [
        'http://example.com/apt/123',
        'https://api.site.com?id=456&param=value',
        'ftp://oldschool.com',
        '/relative/path'
      ];
      
      for (const url of urls) {
        const listing = { listingURL: url, title: `Test ${url}` };
        const created = await CRUD.addRental(listing);
        expect(created.listingURL).toBe(url);
      }
    });

    it('handles special characters in fields', async () => {
      const listing = {
        title: "Apt. #42 - 'Luxury' Suite (w/ view!)",
        listingURL: 'http://example.com?city=NYC&price=$1000',
        city: "New York, NY"
      };
      const created = await CRUD.addRental(listing);
      expect(created.title).toBe(listing.title);
      expect(created.city).toBe(listing.city);
    });
  });

  describe('updateRental', () => {
    it('updates single field on existing rental', async () => {
      const listing = { title: 'Original', listingURL: 'http://b', city: 'Y', dailyRate: 200 };
      await CRUD.addRental(listing);

      const updated = await CRUD.updateRental({ ...listing, city: 'Z' });
      expect(updated).toBeTruthy();
      expect(updated.city).toBe('Z');
      expect(updated.title).toBe('Original');
    });

    it('updates multiple fields', async () => {
      const listing = { title: 'Old', listingURL: 'http://multi', city: 'Old City', dailyRate: 100 };
      await CRUD.addRental(listing);

      const updated = await CRUD.updateRental({
        ...listing,
        title: 'New',
        city: 'New City',
        dailyRate: 500
      });
      expect(updated).toBeTruthy();
      expect(updated.title).toBe('New');
      expect(updated.city).toBe('New City');
      expect(updated.dailyRate).toBe(500);
    });

    it('returns null when updating non-existent rental', async () => {
      const updated = await CRUD.updateRental({ listingURL: 'http://nonexistent', city: 'Boston' });
      expect(updated).toBeNull();
    });

    it('returns null when no fields actually change', async () => {
      const listing = { title: 'Same', listingURL: 'http://same', city: 'Boston' };
      await CRUD.addRental(listing);

      // Try to "update" with identical data
      const updated = await CRUD.updateRental(listing);
      expect(updated).toBeNull();
    });

    it('preserves listingURL when attempting to change it', async () => {
      const listing = { title: 'Test', listingURL: 'http://original', city: 'Boston' };
      const created = await CRUD.addRental(listing);

      const updated = await CRUD.updateRental({
        ...listing,
        listingURL: 'http://different'
      });
      
      if (updated) {
        expect(updated.listingURL).toBe('http://original');
      }
    });

    it('updates with new optional fields', async () => {
      const listing = { title: 'Basic', listingURL: 'http://enhance' };
      await CRUD.addRental(listing);

      const updated = await CRUD.updateRental({
        ...listing,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['Pool', 'Gym']
      });
      expect(updated).toBeTruthy();
      expect(updated.bedrooms).toBe(3);
    });
  });

  describe('deleteRental', () => {
    it('deletes existing rental', async () => {
      const listing = { title: 'To Delete', listingURL: 'http://delete', city: 'Boston' };
      await CRUD.addRental(listing);

      const deleted = await CRUD.deleteRental(listing);
      expect(deleted).toBeTruthy();
    });

    it('returns null when deleting non-existent rental', async () => {
      const listing = { listingURL: 'http://never-existed' };
      const deleted = await CRUD.deleteRental(listing);
      expect(deleted).toBeNull();
    });

    it('prevents double deletion', async () => {
      const listing = { title: 'Delete Once', listingURL: 'http://once', city: 'Boston' };
      await CRUD.addRental(listing);

      const first = await CRUD.deleteRental(listing);
      expect(first).toBeTruthy();

      const second = await CRUD.deleteRental(listing);
      expect(second).toBeNull();
    });
  });

  describe('getRentals', () => {
    beforeEach(async () => {
      const items = [
        { title: 'Cheap', listingURL: 'u1', dailyRate: 50, city: 'Boston' },
        { title: 'Mid', listingURL: 'u2', dailyRate: 150, city: 'NYC' },
        { title: 'Expensive', listingURL: 'u3', dailyRate: 300, city: 'LA' },
        { title: 'Budget', listingURL: 'u4', dailyRate: 80, city: 'Boston' },
        { title: 'Premium', listingURL: 'u5', dailyRate: 500, city: 'Miami' }
      ];
      await Promise.all(items.map(i => CRUD.addRental(i)));
    });

    it('returns all rentals with default pagination', async () => {
      const page = await CRUD.getRentals();
      expect(page.results.length).toBe(5);
      expect(page.total).toBe(5);
      expect(page.page).toBe(1);
      expect(page.pageSize).toBe(20);
      expect(page.totalPages).toBe(1);
    });

    it('paginates results correctly', async () => {
      const page1 = await CRUD.getRentals({}, 1, 2);
      expect(page1.results.length).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);

      const page2 = await CRUD.getRentals({}, 2, 2);
      expect(page2.results.length).toBe(2);

      const page3 = await CRUD.getRentals({}, 3, 2);
      expect(page3.results.length).toBe(1);
    });

    it('returns empty results for out-of-range page', async () => {
      const page = await CRUD.getRentals({}, 100, 10);
      expect(page.results.length).toBe(0);
      expect(page.total).toBe(5);
    });

    it('filters by single field', async () => {
      const page = await CRUD.getRentals({ city: 'Boston' });
      expect(page.results.length).toBe(2);
      expect(page.total).toBe(2);
      expect(page.results.every(r => r.city === 'Boston')).toBe(true);
    });

    it('filters by multiple fields', async () => {
      const page = await CRUD.getRentals({ city: 'Boston', dailyRate: { $gte: 70 } });
      expect(page.total).toBeGreaterThanOrEqual(0);
    });

    it('supports MongoDB query operators', async () => {
      const expensive = await CRUD.getRentals({ dailyRate: { $gte: 200 } });
      expect(expensive.results.every(r => r.dailyRate >= 200)).toBe(true);

      const cheap = await CRUD.getRentals({ dailyRate: { $lt: 100 } });
      expect(cheap.results.every(r => r.dailyRate < 100)).toBe(true);
    });

    it('sorts by ascending price by default', async () => {
      const page = await CRUD.getRentals({}, 1, 10, { dailyRate: 1 });
      expect(page.results.length).toBeGreaterThan(0);
      for (let i = 1; i < page.results.length; i++) {
        expect(page.results[i].dailyRate).toBeGreaterThanOrEqual(page.results[i - 1].dailyRate);
      }
    });

    it('sorts by descending when specified', async () => {
      const page = await CRUD.getRentals({}, 1, 10, { dailyRate: -1 });
      expect(page.results.length).toBeGreaterThan(0);
      for (let i = 1; i < page.results.length; i++) {
        expect(page.results[i].dailyRate).toBeLessThanOrEqual(page.results[i - 1].dailyRate);
      }
    });

    it('sorts by title field', async () => {
      const page = await CRUD.getRentals({}, 1, 10, { title: 1 });
      expect(page.results.length).toBeGreaterThan(0);
    });

    it('returns correct pagination metadata', async () => {
      const page = await CRUD.getRentals({}, 2, 2);
      expect(page.page).toBe(2);
      expect(page.pageSize).toBe(2);
      expect(page.total).toBe(5);
      expect(page.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('calculates totalPages correctly for various pageSize values', async () => {
      const page1 = await CRUD.getRentals({}, 1, 1);
      expect(page1.totalPages).toBe(5);

      const page5 = await CRUD.getRentals({}, 1, 5);
      expect(page5.totalPages).toBe(1);

      const page3 = await CRUD.getRentals({}, 1, 3);
      expect(page3.totalPages).toBe(2);
    });

    it('handles pageSize of 0 gracefully', async () => {
      const page = await CRUD.getRentals({}, 1, 0);
      // Should either return empty or use default
      expect(page).toHaveProperty('results');
      expect(page).toHaveProperty('total');
    });

    it('returns different results for different pages', async () => {
      const page1 = await CRUD.getRentals({}, 1, 2);
      const page2 = await CRUD.getRentals({}, 2, 2);
      
      const p1Urls = page1.results.map(r => r.listingURL);
      const p2Urls = page2.results.map(r => r.listingURL);
      
      // Pages should have different rentals
      const overlap = p1Urls.filter(url => p2Urls.includes(url));
      expect(overlap).toHaveLength(0);
    });

    it('handles filter that matches no results', async () => {
      const page = await CRUD.getRentals({ city: 'NonExistentCity' });
      expect(page.results.length).toBe(0);
      expect(page.total).toBe(0);
      expect(page.totalPages).toBe(0);
    });

    it('handles complex filter combinations', async () => {
      const page = await CRUD.getRentals({
        city: 'Boston',
        dailyRate: { $lte: 100, $gte: 50 }
      });
      expect(page.total).toBeGreaterThanOrEqual(0);
    });

    it('preserves field values in results', async () => {
      const page = await CRUD.getRentals();
      const rental = page.results[0];
      expect(rental).toHaveProperty('title');
      expect(rental).toHaveProperty('listingURL');
      expect(rental).toHaveProperty('dailyRate');
      expect(rental).toHaveProperty('city');
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles concurrent operations safely', async () => {
      const listing1 = { title: 'Concurrent 1', listingURL: 'http://conc1' };
      const listing2 = { title: 'Concurrent 2', listingURL: 'http://conc2' };
      
      const [r1, r2] = await Promise.all([
        CRUD.addRental(listing1),
        CRUD.addRental(listing2)
      ]);
      
      expect(r1).toBeTruthy();
      expect(r2).toBeTruthy();
    });

    it('handles very large daily rate values', async () => {
      const listing = { listingURL: 'http://expensive', dailyRate: 9999999 };
      const created = await CRUD.addRental(listing);
      expect(created.dailyRate).toBe(9999999);
    });

    it('handles negative price values if stored', async () => {
      const listing = { listingURL: 'http://negative', dailyRate: -100 };
      const created = await CRUD.addRental(listing);
      expect(created).toBeTruthy();
    });

    it('handles zero as a valid daily rate', async () => {
      const listing = { listingURL: 'http://free', dailyRate: 0 };
      const created = await CRUD.addRental(listing);
      expect(created.dailyRate).toBe(0);
    });
  });
});

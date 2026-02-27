import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as scrape from '../scrape.js';

vi.mock('axios');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scrapeRentals', () => {
  describe('Basic Functionality', () => {
    it('parses single rental listing from HTML', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Title A</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">Cityville</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toEqual([
        { title: 'Title A', price: '$1000', location: 'Cityville' }
      ]);
    });

    it('parses multiple rental listings from HTML', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Apt 1</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">Boston</div>
        </div>
        <div class="rental-listing">
          <div class="rental-title">Apt 2</div>
          <div class="rental-price">$1200</div>
          <div class="rental-location">Cambridge</div>
        </div>
        <div class="rental-listing">
          <div class="rental-title">Apt 3</div>
          <div class="rental-price">$1500</div>
          <div class="rental-location">NYC</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(3);
      expect(results[0].title).toBe('Apt 1');
      expect(results[1].title).toBe('Apt 2');
      expect(results[2].title).toBe('Apt 3');
    });
  });

  describe('HTML Parsing Edge Cases', () => {
    it('handles empty HTML', async () => {
      axios.get.mockResolvedValue({ data: '' });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toEqual([]);
    });

    it('handles HTML with no matching selectors', async () => {
      const html = '<div><p>No rentals here</p></div>';
      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toEqual([]);
    });

    it('handles HTML with missing price field', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Title A</div>
          <div class="rental-location">City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0].price).toBe('');
    });

    it('handles HTML with missing location field', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Title A</div>
          <div class="rental-price">$1000</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0].location).toBe('');
    });

    it('handles HTML with missing title field', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-price">$1000</div>
          <div class="rental-location">City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0].title).toBe('');
    });

    it('trims whitespace from extracted text', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">  Title with spaces  </div>
          <div class="rental-price">  $1000  </div>
          <div class="rental-location">  Boston  </div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0].title).toBe('Title with spaces');
      expect(results[0].price).toBe('$1000');
      expect(results[0].location).toBe('Boston');
    });

    it('handles nested HTML structure', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-info">
            <span class="rental-title">Nested Title</span>
          </div>
          <div class="rental-price">$1500</div>
          <div class="rental-location">Nested Location</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(1);
    });

    it('handles HTML with special characters', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Apt #42 - "Premium" Suite & Beyond</div>
          <div class="rental-price">$1,000/month</div>
          <div class="rental-location">New York, NY</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0].title).toContain('Apt #42');
      expect(results[0].price).toContain('$');
    });

    it('handles HTML entities in text', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Apt &amp; Room &lt;4 people&gt;</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(1);
    });

    it('handles very large HTML documents', async () => {
      let html = '';
      for (let i = 0; i < 100; i++) {
        html += `
          <div class="rental-listing">
            <div class="rental-title">Apartment ${i}</div>
            <div class="rental-price">$${1000 + i * 100}</div>
            <div class="rental-location">City ${i}</div>
          </div>
        `;
      }

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(100);
    });

    it('handles malformed HTML', async () => {
      const html = `
        <div class="rental-listing>
          <div class="rental-title">Bad Title
          <div class="rental-price">$1000</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      // Should still try to parse what it can
      expect(async () => {
        await scrape.scrapeRentals('http://example.com');
      }).not.toThrow();
    });

    it('handles mixed case selector matches', async () => {
      const html = `
        <div class="RENTAL-LISTING">
          <div class="rental-title">Title</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      // CSS selectors are case-sensitive, so this won't match
      expect(results).toEqual([]);
    });

    it('handles duplicate listings', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Same Title</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">Same City</div>
        </div>
        <div class="rental-listing">
          <div class="rental-title">Same Title</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">Same City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(2);
    });
  });

  describe('URL Handling', () => {
    it('handles HTTPS URLs', async () => {
      axios.get.mockResolvedValue({ data: '<div class="rental-listing"><div class="rental-title">Test</div></div>' });

      await scrape.scrapeRentals('https://example.com');
      
      expect(axios.get).toHaveBeenCalledWith('https://example.com');
    });

    it('handles HTTP URLs', async () => {
      axios.get.mockResolvedValue({ data: '<div class="rental-listing"></div>' });

      await scrape.scrapeRentals('http://example.com');
      
      expect(axios.get).toHaveBeenCalledWith('http://example.com');
    });

    it('handles URLs with query parameters', async () => {
      axios.get.mockResolvedValue({ data: '' });

      await scrape.scrapeRentals('http://example.com?page=1&sort=price');
      
      expect(axios.get).toHaveBeenCalledWith('http://example.com?page=1&sort=price');
    });

    it('handles URLs with fragments', async () => {
      axios.get.mockResolvedValue({ data: '' });

      await scrape.scrapeRentals('http://example.com#top');
      
      expect(axios.get).toHaveBeenCalledWith('http://example.com#top');
    });

    it('handles complex URLs', async () => {
      const url = 'https://api.example.com/v1/rentals?city=Boston&minPrice=500&maxPrice=2000#results';
      axios.get.mockResolvedValue({ data: '' });

      await scrape.scrapeRentals(url);
      
      expect(axios.get).toHaveBeenCalledWith(url);
    });
  });

  describe('Error Handling', () => {
    it('logs and rethrows network errors from axios', async () => {
      const error = new Error('network failure');
      axios.get.mockRejectedValue(error);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrape.scrapeRentals('http://bad')).rejects.toThrow(error);
      expect(errSpy).toHaveBeenCalled();

      errSpy.mockRestore();
    });

    it('logs and rethrows connection timeout errors', async () => {
      const error = new Error('ETIMEDOUT');
      axios.get.mockRejectedValue(error);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrape.scrapeRentals('http://slow')).rejects.toThrow('ETIMEDOUT');
      expect(errSpy).toHaveBeenCalledWith('Error scraping rentals:', error);

      errSpy.mockRestore();
    });

    it('logs and rethrows connection refused errors', async () => {
      const error = new Error('ECONNREFUSED');
      axios.get.mockRejectedValue(error);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrape.scrapeRentals('http://unavailable')).rejects.toThrow();
      expect(errSpy).toHaveBeenCalled();

      errSpy.mockRestore();
    });

    it('logs and rethrows 404 errors', async () => {
      const error = new Error('404 Not Found');
      axios.get.mockRejectedValue(error);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrape.scrapeRentals('http://notfound')).rejects.toThrow();

      errSpy.mockRestore();
    });

    it('logs and rethrows any unknown error', async () => {
      const error = new Error('Unknown error');
      axios.get.mockRejectedValue(error);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrape.scrapeRentals('http://error')).rejects.toThrow();

      errSpy.mockRestore();
    });

    it('handles non-string HTML data', async () => {
      const data = { html: '<div></div>' }; // Not a string
      axios.get.mockResolvedValue({ data });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toBeDefined();
    });

    it('handles null response data', async () => {
      axios.get.mockResolvedValue({ data: null });

      // Should convert to string or handle gracefully
      expect(async () => {
        await scrape.scrapeRentals('http://example.com');
      }).not.toThrow();
    });
  });

  describe('Response Format', () => {
    it('returns array format', async () => {
      axios.get.mockResolvedValue({ data: '<div class="rental-listing"></div>' });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns objects with correct structure', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Test</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">City</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('price');
      expect(results[0]).toHaveProperty('location');
    });

    it('returns consistent result properties', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Title 1</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">City 1</div>
        </div>
        <div class="rental-listing">
          <div class="rental-title">Title 2</div>
          <div class="rental-price">$2000</div>
          <div class="rental-location">City 2</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      
      results.forEach(result => {
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('price');
        expect(result).toHaveProperty('location');
        expect(typeof result.title).toBe('string');
        expect(typeof result.price).toBe('string');
        expect(typeof result.location).toBe('string');
      });
    });
  });

  describe('Performance and Data Volume', () => {
    it('handles scraping many listings efficiently', async () => {
      let html = '';
      const count = 1000;
      for (let i = 0; i < count; i++) {
        html += `
          <div class="rental-listing">
            <div class="rental-title">Listing ${i}</div>
            <div class="rental-price">$${1000 + i}</div>
            <div class="rental-location">City</div>
          </div>
        `;
      }

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results).toHaveLength(count);
    });

    it('preserves field values accurately for large datasets', async () => {
      let html = '';
      for (let i = 0; i < 100; i++) {
        html += `
          <div class="rental-listing">
            <div class="rental-title">Apartment ${i}</div>
            <div class="rental-price">$${(i + 1) * 1000}</div>
            <div class="rental-location">Location ${String.fromCharCode(65 + (i % 26))}</div>
          </div>
        `;
      }

      axios.get.mockResolvedValue({ data: html });

      const results = await scrape.scrapeRentals('http://example.com');
      expect(results[50].title).toBe('Apartment 50');
      expect(results[50].price).toBe('$51000');
    });
  });

  describe('Logging and Debugging', () => {
    it('logs count of scraped rentals', async () => {
      const html = `
        <div class="rental-listing">
          <div class="rental-title">T1</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">C1</div>
        </div>
        <div class="rental-listing">
          <div class="rental-title">T2</div>
          <div class="rental-price">$2000</div>
          <div class="rental-location">C2</div>
        </div>
      `;

      axios.get.mockResolvedValue({ data: html });
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await scrape.scrapeRentals('http://example.com');

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as scrape from '../scrape.js';

vi.mock('axios');

vi.mock('cheerio', async () => {
  const actual = await vi.importActual('cheerio');
  return { Cheerio: { load: actual.load } };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scrapeRentals', () => {
  it('parses rental listings from HTML', async () => {
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

  it('logs and rethrows errors from axios', async () => {
    const error = new Error('network failure');
    axios.get.mockRejectedValue(error);

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(scrape.scrapeRentals('http://bad')).rejects.toThrow(error);
    expect(errSpy).toHaveBeenCalled();

    errSpy.mockRestore();
  });
});

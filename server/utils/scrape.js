import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const scrapeRentals = async (url) => {
  try {
    let data;

    if (/^https?:\/\//i.test(url)) {
      const resp = await axios.get(url);
      data = resp.data;
    } else {
      // Treat as a local filename or path. If a bare filename is provided,
      // resolve it to the project's mock-websites directory.
      let filePath;
      if (path.isAbsolute(url) || url.includes(path.sep) || url.includes('/')) {
        filePath = url;
      } else {
        filePath = path.resolve(__dirname, '../../mock-websites', url);
      }

      data = await fs.readFile(filePath, 'utf8');
    }

    const $ = load(data);
    const rentals = [];

    $('.rental-listing').each((index, element) => {
      const title = $(element).find('.rental-title').text().trim();
      const price = $(element).find('.rental-price').text().trim();
      const location = $(element).find('.rental-location').text().trim();
      rentals.push({ title, price, location });
    });

    return rentals;
  } catch (error) {
    console.error('Error scraping rentals:', error);
    throw error;
  }
};

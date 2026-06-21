import axios from "axios";
import { load } from "cheerio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { siteDir } from "./site-dir.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Maps filenames to site selectors for efficient parsing
 * Only parses with the correct selector for each site
 * @type {Object<string, string>}
 */
const siteMapping = {
  'luxe-stay.html': 'general',
  'quick-rent.html': 'general',
  'realty-hub.html': 'general',
  'apartment-finder.html': 'general'
};

/**
 * Identifies which site selector to use based on filename
 * @param {string} url - File path or URL
 * @returns {string|null} - Site key from siteMapping or null if unknown
 */
function identifySite(url) {
  if (/^https?:\/\//i.test(url)) {
    return "general";
  }

  const filename = url.split('/').pop();
  const siteKey = siteMapping[filename];
  
  if (!siteKey) {
    throw new Error(
      `Unknown site: ${filename}. Supported sites: ${Object.keys(siteMapping).join(', ')}`
    );
  }
  
  return siteKey;
}

/**
 * Reads HTML content from a local file or resolves path
 * @async
 * @private
 * @param {string} url - File path (absolute, relative with separators, or filename)
 * @returns {Promise<string>} - File contents as UTF-8 string
 * @throws {Error} - If file cannot be read
 */
async function readLocalFile(url) {
  let filePath;
  if (path.isAbsolute(url) || url.includes(path.sep) || url.includes("/")) {
    filePath = url;
  } else {
    filePath = path.resolve(__dirname, "../../mock-websites", url);
  }
  return await fs.readFile(filePath, "utf8");
}

/**
 * Validates and extracts numeric price from price string
 * @private
 * @param {string} priceString - Price string (e.g., "$2,450")
 * @returns {number|null} - Numeric price or null if invalid
 */
function extractPrice(priceString) {
  if (!priceString || typeof priceString !== 'string') {
    return null;
  }

  const numeric = parseInt(priceString.replace(/[\$,]/g, ''));
  
  // Validate the result is actually a number
  if (isNaN(numeric) || numeric < 0) {
    console.warn(`Invalid price format: "${priceString}"`);
    return null;
  }

  return numeric;
}

/**
 * Extracts rental listings from HTML using CSS selectors
 * @private
 * @param {string} data - HTML content to parse
 * @param {string} site - Website name matching key in siteDir
 * @returns {Array<{title: string, price: string, location: string, dailyRate: number|null}>} - Extracted rental data
 */
function findData(data, site) {
  const $ = load(data);
  let rentals = [];
  $(siteDir[site].listing).each((index, element) => {
    const title = $(element).find(siteDir[site].title).text().trim();
    const price = $(element).find(siteDir[site].price).text().trim();
    const location = $(element).find(siteDir[site].location).text().trim();
    
    // Validate required fields
    if (!title || !location) {
      return; // Skip incomplete listings
    }
    
    const dailyRate = extractPrice(price);
    
    rentals.push({ title, price, location, dailyRate });
  });
  return rentals;
}

/**
 * Fetches HTML content from URL or local file
 * @async
 * @private
 * @param {string} url - HTTP/HTTPS URL or local file path
 * @returns {Promise<string>} - HTML content as string
 * @throws {Error} - If fetch fails for network or file operations
 */
async function manageData(url) {
  let data;

  if (/^https?:\/\//i.test(url)) {
    const resp = await axios.get(url);
    data = resp.data;
  } else {
    data = await readLocalFile(url);
  }
  return data;
}

/**
 * Scrapes rental listings from a website or HTML file
 * Uses site-specific selectors for accurate parsing (not all sites parsed for each URL)
 * @async
 * @param {string} url - URL (http/https) or local file path to HTML
 * @returns {Promise<Array<{title: string, price: string, location: string, dailyRate: number|null}>>} - Array of rental listings
 * @throws {Error} - Logs error and rethrows if scraping fails
 * @example
 * const rentals = await scrapeRentals('http://example-rentals.com');
 * const mockRentals = await scrapeRentals('apartment-finder.html');
 */
export const scrapeRentals = async (url) => {
  try {
    // Identify which site selector to use (prevents parsing with all selectors)
    const siteKey = identifySite(url);

    let data = await manageData(url);

    if (!data) data = "";
    if (typeof data !== "string") data = data.toString();

    // Parse ONLY with the correct site selector
    const rentals = findData(data, siteKey);
    console.log(`Found ${rentals.length} rentals for ${url} (site: ${siteKey})`);

    return rentals;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    throw error;
  }
};

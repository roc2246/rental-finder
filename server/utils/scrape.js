import axios from "axios";
import { load } from "cheerio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { siteDir } from "./site-dir.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
 * Extracts rental listings from HTML using CSS selectors
 * @private
 * @param {string} data - HTML content to parse
 * @param {string} site - Website name matching key in siteDir
 * @returns {Array<{title: string, price: string, location: string}>} - Extracted rental data
 */
function findData(data, site) {
  const $ = load(data);
  let rentals = [];
  $(siteDir[site].listing).each((index, element) => {
    const title = $(element).find(siteDir[site].title).text().trim();
    const price = $(element).find(siteDir[site].price).text().trim();
    const location = $(element).find(siteDir[site].location).text().trim();
    rentals.push({ title, price, location });
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
 * Supports both live URLs and mock HTML files
 * @async
 * @param {string} url - URL (http/https) or local file path to HTML
 * @returns {Promise<Array<{title: string, price: string, location: string}>>} - Array of rental listings
 * @throws {Error} - Logs error and rethrows if scraping fails
 * @example
 * const rentals = await scrapeRentals('http://example-rentals.com');
 * const mockRentals = await scrapeRentals('apartment-finder.html');
 */
export const scrapeRentals = async (url) => {
  try {
   
    let data = await manageData(url);

    if (!data) data = '';
    if (typeof data !== "string") data = data.toString();

    let rentals = [];
    for(const site in siteDir) { 
      rentals = rentals.concat(findData(data, site));
      console.log(`Found ${rentals.length} rentals for site: ${site}`);
    }

    return rentals;
  } catch (error) {
    console.error("Error scraping rentals:", error);
    throw error;
  }
};

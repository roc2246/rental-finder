import cron from "node-cron";
import * as utilities from "../utils/index.js";
import * as models from "../models/index.js";

/**
 * Initializes periodic rental scraping and database synchronization
 * Uses configurable schedule and batch size via environment variables
 * Implements error recovery - continues processing even if some sites fail
 */
export default function initializeChron() {
  const rentalUrls = {
    luxeStay: "luxe-stay.html",
    quickRent: "quick-rent.html",
    realtyHub: "realty-hub.html",
    apartmentFinder: "apartment-finder.html",
  };

  // Read from environment, with sensible defaults
  const schedule = process.env.CRON_SCHEDULE || (
    process.env.NODE_ENV === 'development' ? "*/5 * * * *" : "0 */6 * * *"
  );
  const batchSize = parseInt(process.env.BATCH_SIZE) || 10;

  // Log initialization
  console.log(`[CRON] Scheduler initialized`);
  console.log(`[CRON] Schedule: "${schedule}" | Batch size: ${batchSize}`);

  cron.schedule(schedule, async () => {
    console.log(`[CRON] Starting rental scrape at ${new Date().toISOString()}`);
    
    const urls = Object.values(rentalUrls);
    const scrapingResults = {};
    let allRentals = [];
    let failedSites = [];

    // Use allSettled to track per-site results instead of failing on first error
    const scrapedArrays = await Promise.allSettled(
      urls.map(url => 
        utilities.scrapeRentals(url)
          .then(rentals => ({
            url,
            rentals,
            success: true
          }))
          .catch(error => ({
            url,
            error: error.message,
            success: false
          }))
      )
    );

    // Process results and aggregate rentals
    scrapedArrays.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const scrapResult = result.value;
        if (scrapResult.success) {
          scrapingResults[scrapResult.url] = { success: true, count: scrapResult.rentals.length };
          allRentals.push(
            ...scrapResult.rentals.map(r => ({
              ...r,
              listingURL: `mock-websites/${scrapResult.url}#${r.title}`
            }))
          );
        } else {
          scrapingResults[scrapResult.url] = { success: false, error: scrapResult.error };
          failedSites.push(`${scrapResult.url}: ${scrapResult.error}`);
        }
      } else {
        const url = urls[index];
        scrapingResults[url] = { success: false, error: result.reason?.message || 'Unknown error' };
        failedSites.push(`${url}: ${result.reason?.message || 'Unknown error'}`);
      }
    });

    // Log scraping summary
    console.log(`[CRON] Scraping results:`, scrapingResults);
    if (failedSites.length > 0) {
      console.warn(`[CRON] Failed to scrape ${failedSites.length} site(s):`, failedSites);
    }

    if (allRentals.length === 0) {
      console.warn('[CRON] No rentals scraped. Skipping database update.');
      return;
    }

    console.log(`[CRON] Scraped ${allRentals.length} total rentals, updating database...`);

    try {
      // Add new rentals
      const addResults = await utilities.manageBatchSize(
        batchSize,
        allRentals,
        models.addRental
      );

      // Update existing rentals
      const updateResults = await utilities.manageBatchSize(
        batchSize,
        allRentals,
        models.updateRental
      );

      // Delete rentals no longer in current scrape
      const deleteResults = await models.deleteRental(allRentals, batchSize);

      console.log(
        `[CRON] Completed: Added ${addResults.succeeded}, Updated ${updateResults.succeeded}, Deleted ${deleteResults.deletedCount}`
      );
    } catch (error) {
      console.error(`[CRON] Database operation failed:`, error.message);
    }
  });
}

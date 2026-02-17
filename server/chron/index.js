import cron from "node-cron";
import * as utilities from "../utils/index.js";
import * as models from "../models/index.js";

export default function initializeChron() {
  //  Object with key value pairs of rental listing urls
  const rentalUrls = {
    luxeStay: "luxe-stay.html",
    quickRent: "quick-rent.html",
    realtyHub: "realty-hub.html",
    apartmentFinder: "apartment-finder.html",
  };

  cron.schedule("*/5 * * * *", async () => {
    try {
      const urls = Object.values(rentalUrls);
      
      // Scrape all URLs in parallel
      const scrapedArrays = await Promise.all(urls.map((url) => utilities.scrapeRentals(url)));

      // Annotate and flatten without nested for-loops
      const allRentals = scrapedArrays.flatMap((rentals, i) =>
        rentals.map((r) => ({ ...r, listingURL: `${urls[i]}#${r.title}` })),
      );

      console.log("Scraped rentals total:", allRentals.length);

      // Insert rentals in bounded-size batches to limit DB concurrency and memory
      const BATCH_SIZE = 10;
      let addedCount = 0;
      for (let i = 0; i < allRentals.length; i += BATCH_SIZE) {
        const batch = allRentals.slice(i, i + BATCH_SIZE);
        const settled = await Promise.allSettled(batch.map((r) => models.addRental(r)));
        settled.forEach((res) => {
          if (res.status === 'fulfilled' && res.value) addedCount++;
        });
      }

      console.log('Added rentals:', addedCount);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
}

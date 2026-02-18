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

  const time = process.env.DEV_ENV === "local" ? "*/1 * * * *" : "*/5 * * * *"; 

  cron.schedule(time, async () => {
    try {
      const urls = Object.values(rentalUrls);

      // Scrape all URLs in parallel
      const scrapedArrays = await Promise.all(
        urls.map((url) => utilities.scrapeRentals(url)),
      );

      // Annotate and flatten without nested for-loops
      const allRentals = scrapedArrays.flatMap((rentals, i) =>
        rentals.map((r) => ({ ...r, listingURL: `${urls[i]}#${r.title}` })),
      );

      console.log("Scraped rentals total:", allRentals.length);

      // Insert rentals in bounded-size batches to limit DB concurrency and memory
      await utilities.manageBatchSize(10, allRentals, models.addRental);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
}

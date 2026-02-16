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
    let scrapedRentals = [];
    Object.keys(rentalUrls).forEach(async (url) => {
      scrapedRentals += await utilities.scrapeRentals(url);
    });
    scrapedRentals.forEach(async (scrapedData) => {
      await models.addRental(scrapedData);
    });
  });
}

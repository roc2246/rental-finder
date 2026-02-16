import chron from "chron";
import * as utilities from "../utilities/index.js";
import * as models from "../models/index.js";

export default function initializeChron() {
  const app = chron();

  //  Object with key value pairs of rental listing urls
  const rentalUrls = {
    luxeStay: "luxe-stay.html",
    quickRent: "quick-rent.html",
    realtyHub: "realty-hub.html",
    apartmentFinder: "apartment-finder.html",
  };

  app.schedule("*/5 * * * *", async () => {
    let scrapedRentals = [];
    rentalUrls.forEach(async (url) => {
      scrapedRentals += await utilities.scrapeRentals(url);
    });
    scrapedRentals.forEach(async (scrapedData) => {
      await models.addRental(scrapedData);
    });
  });
}

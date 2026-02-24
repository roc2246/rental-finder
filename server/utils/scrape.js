import axios from "axios";
import { load } from "cheerio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { siteDir } from "./site-dir.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function readLocalFile(url) {
  let filePath;
  if (path.isAbsolute(url) || url.includes(path.sep) || url.includes("/")) {
    filePath = url;
  } else {
    filePath = path.resolve(__dirname, "../../mock-websites", url);
  }
  return await fs.readFile(filePath, "utf8");
}

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

export const scrapeRentals = async (url) => {
  try {
   
    const data = await manageData(url);

    if (typeof data !== "string") data = data.toString();

    const rentals = findData(data, "general");

    return rentals;
  } catch (error) {
    console.error("Error scraping rentals:", error);
    throw error;
  }
};

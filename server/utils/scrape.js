import  axios from 'axios';
import { Cheerio } from 'cheerio';

export const scrapeRentals = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = Cheerio.load(data);
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
}

/**
 * CSS selectors mapping for different rental website structures
 * Maps website names to their unique CSS selectors for scraping rental data
 * @type {Object<string, {listing: string, title: string, price: string, location: string}>}
 * @example
 * // Use selectors to parse website-specific HTML structure
 * const rentalElements = $(siteDir['apartmentFinder'].listing);
 * rentalElements.each((i, el) => {
 *   const title = $(el).find(siteDir['apartmentFinder'].title).text();
 * });
 */
export const siteDir = {
    general:{
        listing: '.rental-listing',
        title: '.rental-title',
        price: '.rental-price',
        location: '.rental-location'
    }
}
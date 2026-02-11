// CRUD.js
import RentalSchema from './schemas.js';

/**
 * Add a new rental if it doesn't already exist
 * @param {Object} listing - rental object matching Rental schema
 * @returns {Object|null} - newly created rental or null if exists
 */
export async function addRental(listing) {
  try {
    const exists = await RentalSchema.findOne({ listingURL: listing.listingURL });
    if (exists) return null;

    const newRental = await RentalSchema.create(listing);
    return newRental;
  } catch (err) {
    console.error('Error adding rental:', err);
    throw err;
  }
}

/**
 * Update an existing rental by listingURL
 * @param {string} listingURL
 * @param {Object} updates - fields to update
 * @returns {Object|null} - updated rental or null if not found
 */
export async function updateRental(listingURL, updates) {
  try {
    const updated = await RentalSchema.findOneAndUpdate(
      { listingURL },
      { $set: updates },
      { new: true }
    );
    return updated;
  } catch (err) {
    console.error('Error updating rental:', err);
    throw err;
  }
}

/**
 * Delete a rental by listingURL
 * @param {string} listingURL
 * @returns {Object|null} - deleted rental or null if not found
 */
export async function deleteRental(listingURL) {
  try {
    const deleted = await RentalSchema.findOneAndDelete({ listingURL });
    return deleted;
  } catch (err) {
    console.error('Error deleting rental:', err);
    throw err;
  }
}

/**
 * Fetch rentals with optional filters
 * @param {Object} filters - e.g., { city: 'Boston', dailyRate: { $lte: 2000 } }
 * @returns {Array} - array of matching rentals
 */
export async function getRentals(filters = {}) {
  try {
    return RentalSchema.find(filters).sort({ dailyRate: 1 });
  } catch (err) {
    console.error('Error fetching rentals:', err);
    throw err;
  }
}

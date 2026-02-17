// CRUD.js
import RentalSchema from './schemas.js';

/**
 * Add a new rental if it doesn't already exist
 * @param {Object} listing - rental object matching Rental schema
 * @returns {Object|null} - newly created rental or null if exists
 */
export async function addRental(listing) {
  try {
    // Use an atomic upsert to avoid races: insert only if listingURL doesn't exist
    if (!listing || !listing.listingURL) {
      throw new Error('listing must include a listingURL');
    }

    const rental = await RentalSchema.findOneAndUpdate(
      { listingURL: listing.listingURL },
      { $setOnInsert: listing },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean().exec();

    return rental;
  } catch (err) {
    // If a duplicate-key error still occurs, return null (already exists)
    if (err && err.code === 11000) return null;
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
    // Prevent changing the unique key
    if (updates && Object.prototype.hasOwnProperty.call(updates, 'listingURL')) {
      delete updates.listingURL;
    }

    const updated = await RentalSchema.findOneAndUpdate(
      { listingURL },
      { $set: updates },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    ).lean().exec();

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
export async function deleteRental(listingURL, { soft = true } = {}) {
  try {
    if (soft) {
      const updated = await RentalSchema.findOneAndUpdate(
        { listingURL },
        { $set: { deleted: true, deletedAt: new Date() } },
        { returnDocument: 'after', runValidators: true, context: 'query' }
      ).lean().exec();
      return updated;
    }

    const deleted = await RentalSchema.findOneAndDelete({ listingURL }).lean().exec();
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
export async function getRentals(filters = {}, { skip = 0, limit = 50, fields = null, sort = { dailyRate: 1 } } = {}) {
  try {
    const effectiveFilters = { ...filters };
    if (!Object.prototype.hasOwnProperty.call(effectiveFilters, 'deleted')) {
      effectiveFilters.deleted = { $ne: true };
    }

    const q = RentalSchema.find(effectiveFilters, fields).sort(sort).skip(Number(skip)).limit(Number(limit)).lean();
    const [results, total] = await Promise.all([q.exec(), RentalSchema.countDocuments(effectiveFilters).exec()]);
    return { results, total };
  } catch (err) {
    console.error('Error fetching rentals:', err);
    throw err;
  }
}

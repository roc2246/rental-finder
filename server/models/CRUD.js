// CRUD.js
import RentalSchema from "./schemas.js";

/**
 * Add a new rental if it doesn't already exist
 * @param {Object} listing - rental object matching Rental schema
 * @returns {Object|null} - newly created rental or null if exists
 */
export async function addRental(listing) {
  try {
    // Use an atomic upsert to avoid races: insert only if listingURL doesn't exist
    if (!listing || !listing.listingURL) {
      throw new Error("listing must include a listingURL");
    }

    const rental = await RentalSchema.findOneAndUpdate(
      { listingURL: listing.listingURL },
      { $setOnInsert: listing },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();

    return rental;
  } catch (err) {
    // If a duplicate-key error still occurs, return null (already exists)
    if (err && err.code === 11000) return null;
    console.error("Error adding rental:", err);
    throw err;
  }
}

/**
 * Update an existing rental by listingURL
 * @param {string} listingURL
 * @param {Object} updates - fields to update
 * @returns {Object|null} - updated rental or null if not found
 */
export async function updateRental(listing) {
  try {
    const exists = await RentalSchema.exists({
      listingURL: listing.listingURL,
    });
    const hasChanged = await RentalSchema.exists({
      listingURL: listing.listingURL,
      ...listing,
    });
    let updated = null;
    if (exists && hasChanged) {
      updated = await RentalSchema.findOneAndUpdate(
        { listingURL: listing.listingURL },
        { $set: listing },
        { returnDocument: "after" },
      )
        .lean()
        .exec();
    }

    return updated;
  } catch (err) {
    console.error("Error updating rental:", err);
    throw err;
  }
}

/**
 * Delete a rental by listingURL
 * @param {string} listingURL
 * @returns {Object|null} - deleted rental or null if not found
 */
export async function deleteRental(listing) {
  try {
    let deleted;
    const exists = await RentalSchema.exists({
      listingURL: listing.listingURL,
    });
    if (!exists) {
      deleted = await RentalSchema.findOneAndDelete({
        listingURL: listing.listingURL,
      })
        .lean()
        .exec();
    }
    return deleted;
  } catch (err) {
    console.error("Error deleting rental:", err);
    throw err;
  }
}

/**
 * Fetch rentals with optional filters
 * @param {Object} filters - e.g., { city: 'Boston', dailyRate: { $lte: 2000 } }
 * @returns {Array} - array of matching rentals
 */
export async function getRentals(
  filters = {},
  page = 1,
  pageSize = 20,
  sort = { price: 1 },
) {
  try {
    // Calculate how many documents to skip
    const skip = (page - 1) * pageSize;

    const results = await RentalSchema.find(filters)
      .sort(sort)
      .skip(skip) // skip documents from previous pages
      .limit(pageSize) // limit to pageSize
      .lean()
      .exec();

    // Optional: get total count for frontend pagination
    const total = await RentalSchema.countDocuments(filters);

    return {
      results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (err) {
    console.error("Error fetching rentals:", err);
    throw err;
  }
}

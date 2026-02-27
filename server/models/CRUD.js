// CRUD.js
import RentalSchema from "./schemas.js";

/**
 * Add a new rental if it doesn't already exist
 * @param {Object} listing - rental object matching Rental schema
 * @returns {Object|null} - newly created rental or null if exists
 */
export async function addRental(listing) {
  try {
    // Validate input
    if (!listing || !listing.listingURL) {
      throw new Error("listing must include a listingURL");
    }

    // Try to insert - if duplicate exists, will throw error which we catch
    const result = new RentalSchema(listing);
    const rental = await result.save();
    return rental.toObject();
  } catch (err) {
    // If a duplicate-key error occurs, the rental already exists
    if (err && (err.code === 11000 || err.code === 11001)) {
      return null;
    }
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
    // First check if rental exists
    const exists = await RentalSchema.findOne({
      listingURL: listing.listingURL,
    });
    
    if (!exists) return null;
    

    // Check if any fields are actually different
    let hasChanges = false;
    for (const key in listing) {
      if (key !== 'listingURL' && exists[key] !== listing[key]) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) return null;
    

    // Update the document
    const updated = await RentalSchema.findOneAndUpdate(
      { listingURL: listing.listingURL },
      { $set: listing },
      { returnDocument: "after" },
    )
      .lean()
      .exec();

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
    const deleted = await RentalSchema.findOneAndDelete({
      listingURL: listing.listingURL,
    })
      .lean()
      .exec();
    
    return deleted;
  } catch (err) {
    console.error("Error deleting rental:", err);
    throw err;
  }
}

/**
 * Fetch rentals with optional filters
 * @param {Object} filters - e.g., { city: 'Boston', dailyRate: { $lte: 2000 } }
 * @returns {Promise<{results: Array, total: number, page: number, pageSize: number, totalPages: number}>} - search results with pagination info
 */
export async function getRentals(
  filters = {},
  page = 1,
  pageSize = 20,
  sort = { dailyRate: 1 },
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

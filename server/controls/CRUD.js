import * as models from "../models/index.js";
import * as utils from "../utils/index.js";

/**
 * HTTP endpoint handler for retrieving rentals with filtering and pagination
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.filters] - JSON string of filters to apply (e.g., city, price range)
 * @param {string} [req.query.page] - Page number for pagination (default: 1)
 * @param {string} [req.query.pagesize] - Number of results per page (default: 20)
 * @param {string} [req.query.sort] - JSON string of sort criteria (default: { dailyRate: 1 })
 * @param {Object} res - Express response object
 * @returns {void} - Responds with JSON containing rental results or error
 * @example
 * // GET /rentals?filters={"city":"Boston"}&page=1&pagesize=10&sort={"dailyRate":1}
 * // Response: { data: [...], meta: { total: 45, page: 1, pageSize: 10, totalPages: 5 } }
 */
export async function manageRentalRetrieval(req, res) {
  try {
    // parse query parameters, accepting either stringified values or raw objects
    const rawFilters = req.query.filters;
    const rawSort = req.query.sort;

    const filters = utils.parseJsonOrValue(rawFilters, {});

    // Move regex logic here for security and to keep database implementation 
    // details off the client. Only apply regex if location is a string.
    if (filters.location && typeof filters.location === "string") {
      filters.location = { $regex: filters.location, $options: "i" };
    }

    const args = {
      filters,
      page: parseInt(req.query.page) || 1,
      pagesize: parseInt(req.query.pageSize || req.query.pagesize) || 20,
      sort: utils.parseJsonOrValue(rawSort, { dailyRate: 1 }),
    };

    const rentals = await models.getRentals(
      args.filters,
      args.page,
      args.pagesize,
      args.sort,
    );
    
    res.json({
      data: rentals.results,
      meta: {
        total: rentals.total,
        page: rentals.page,
        pageSize: rentals.pageSize,
        totalPages: rentals.totalPages,
      },
    });
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({
      error: errorMessage,
      message: "Failed to retrieve rentals"
    });
  }
}

/**
 * HTTP endpoint handler for creating a new rental
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Rental data
 * @param {Object} res - Express response object
 * @returns {void} - Responds with created rental (201) or error
 * @example
 * // POST /rentals
 * // Body: { title: "...", location: "...", price: 150, ... }
 * // Response (201): { data: { _id: "...", title: "...", ... }, message: "Rental created" }
 */
export async function createRental(req, res) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body cannot be empty"
      });
    }

    if (!req.body.listingURL) {
      return res.status(400).json({
        error: "Bad Request",
        message: "listingURL is required"
      });
    }

    const rental = await models.addRental(req.body);
    
    if (!rental) {
      return res.status(409).json({
        error: "Conflict",
        message: "Rental with this listingURL already exists"
      });
    }

    res.status(201).json({
      data: rental,
      message: "Rental created successfully"
    });
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({
      error: errorMessage,
      message: "Failed to create rental"
    });
  }
}

/**
 * HTTP endpoint handler for updating a rental by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB rental ID
 * @param {Object} req.body - Fields to update
 * @param {Object} res - Express response object
 * @returns {void} - Responds with updated rental (200) or error
 * @example
 * // PUT /rentals/507f1f77bcf86cd799439011
 * // Body: { price: 200, bedrooms: 2 }
 * // Response (200): { data: { _id: "...", price: 200, ... }, message: "Rental updated" }
 */
export async function updateRental(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid rental ID format"
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body cannot be empty"
      });
    }

    const rental = await models.updateRentalById(id, req.body);
    
    if (!rental) {
      return res.status(404).json({
        error: "Not Found",
        message: "Rental not found"
      });
    }

    res.json({
      data: rental,
      message: "Rental updated successfully"
    });
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({
      error: errorMessage,
      message: "Failed to update rental"
    });
  }
}

/**
 * HTTP endpoint handler for deleting a rental by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB rental ID
 * @param {Object} res - Express response object
 * @returns {void} - Responds with 204 No Content or error
 * @example
 * // DELETE /rentals/507f1f77bcf86cd799439011
 * // Response (204): No Content
 */
export async function deleteRental(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid rental ID format"
      });
    }

    const rental = await models.deleteRentalById(id);
    
    if (!rental) {
      return res.status(404).json({
        error: "Not Found",
        message: "Rental not found"
      });
    }

    res.status(204).send();
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({
      error: errorMessage,
      message: "Failed to delete rental"
    });
  }
}

/**
 * HTTP endpoint handler for getting a single rental by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB rental ID
 * @param {Object} res - Express response object
 * @returns {void} - Responds with rental (200) or error
 * @example
 * // GET /rentals/507f1f77bcf86cd799439011
 * // Response (200): { data: { _id: "...", title: "...", ... } }
 */
export async function getRental(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid rental ID format"
      });
    }

    const rental = await models.getRentalById(id);
    
    if (!rental) {
      return res.status(404).json({
        error: "Not Found",
        message: "Rental not found"
      });
    }

    res.json({ data: rental });
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({
      error: errorMessage,
      message: "Failed to retrieve rental"
    });
  }
}

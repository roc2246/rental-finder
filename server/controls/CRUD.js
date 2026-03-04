import * as models from "../models/index.js";
import * as utils from "./index.js";

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
 * // Response: { results: [...], total: 45, page: 1, pageSize: 10, totalPages: 5 }
 */
export async function manageRentalRetrieval(req, res) {
  try {
    // parse query parameters, accepting either stringified values or raw objects
    const rawFilters = req.query.filters;
    const rawSort = req.query.sort;

    const args = {
      filters: utils.parseJsonOrValue(rawFilters, {}),
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
    res.json(rentals);
  } catch (error) {
    const errorMessage = error?.message || "Unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
}

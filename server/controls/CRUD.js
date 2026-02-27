import * as models from "../models/index.js";

export async function manageRentalRetrieval(req, res) {
  try {
    const args = {
      filters: req.query.filters || {},
      page: parseInt(req.query.page) || 1,
      pagesize: parseInt(req.query.pagesize) || 20,
      sort: req.query.sort || { price: 1 },
    };
    const rentals = await models.getRentals(
      args.filters,
      args.page,
      args.pagesize,
      args.sort,
    );
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

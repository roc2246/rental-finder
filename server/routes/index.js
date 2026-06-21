import express from "express";
import * as controls from "../controls/index.js";
import {
  validateRentalQuery,
  authenticateToken,
  validateObjectId,
} from "../middleware/index.js";

// use a router so that the main server file can mount it under a prefix
const router = express.Router();

// ===== READ Operations (Public) =====

// expose both `/rentals` and `/listings` as equivalent endpoints
// so existing clients and docs can work without having to change both.
router.get("/rentals", validateRentalQuery, controls.manageRentalRetrieval);
router.get("/listings", validateRentalQuery, controls.manageRentalRetrieval);

// Get single rental by ID
router.get("/rentals/:id", validateObjectId, controls.getRental);

// ===== WRITE Operations (Protected) =====

// Create new rental - requires authentication
router.post("/rentals", authenticateToken, controls.createRental);

// Update rental - requires authentication
router.put("/rentals/:id", authenticateToken, validateObjectId, controls.updateRental);

// Delete rental - requires authentication
router.delete("/rentals/:id", authenticateToken, validateObjectId, controls.deleteRental);

export default router;
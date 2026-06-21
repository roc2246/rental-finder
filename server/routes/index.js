import express from "express";
import * as controls from "../controls/index.js";
import {
  requestLogger,
  validateRentalQuery,
  validateRentalBody,
  authenticateToken,
  authorize,
  validateObjectId,
} from "../middleware/index.js";

// use a router so that the main server file can mount it under a prefix
const router = express.Router();

// Apply logging to all routes
router.use(requestLogger);

// ===== READ Operations (Public) =====

// expose both `/rentals` and `/listings` as equivalent endpoints
// so existing clients and docs can work without having to change both.
router.get("/rentals", validateRentalQuery, controls.manageRentalRetrieval);
router.get("/listings", validateRentalQuery, controls.manageRentalRetrieval);

// Get single rental by ID
router.get("/rentals/:id", validateObjectId, controls.getRental);

// ===== WRITE Operations (Protected) =====

// Create new rental - requires authentication and admin/agent role
router.post(
  "/rentals",
  authenticateToken,
  authorize(['admin', 'agent']),
  validateRentalBody,
  controls.createRental
);

// Update rental - requires authentication and admin/agent role
router.put(
  "/rentals/:id",
  authenticateToken,
  authorize(['admin', 'agent']),
  validateObjectId,
  validateRentalBody,
  controls.updateRental
);

// Delete rental - requires authentication and admin role only
router.delete(
  "/rentals/:id",
  authenticateToken,
  authorize(['admin']),
  validateObjectId,
  controls.deleteRental
);

export default router;
import express from "express";
import * as controls from "../controls/index.js";

// use a router so that the main server file can mount it under a prefix
const router = express.Router();

// expose both `/rentals` and `/listings` as equivalent endpoints
// so existing clients and docs can work without having to change both.
router.get("/rentals", controls.manageRentalRetrieval);
router.get("/listings", controls.manageRentalRetrieval);

export default router;
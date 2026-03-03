import express from "express";
import * as controls from "../controllers/index.js";

const app = express();
app.get("/rentals", controls.manageRentalRetrieval);
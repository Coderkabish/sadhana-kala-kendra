import express from "express";
import EventsController from "../controllers/eventsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", EventsController.getAll);
router.get("/:slug", EventsController.getById);

// ADMIN ROUTES (CRUD)
router.post("/", adminAuth, EventsController.create);
router.put("/:id" ,adminAuth, EventsController.update);
router.delete("/:id", adminAuth, EventsController.delete);

export default router;
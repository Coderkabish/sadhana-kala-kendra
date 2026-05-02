import express from "express";
import EventsController from "../controllers/eventsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ============ PROGRAMS ROUTES (nested under events) - Define FIRST for specificity ============
// PUBLIC ROUTES
router.get("/programs", EventsController.getAllPrograms);
router.get("/programs/:id/resources", EventsController.getProgramResources);
router.get("/programs/by-id/:id", EventsController.getProgramById);
router.get("/programs/:slug", EventsController.getProgramBySlug);

// ADMIN PROTECTED ROUTES
router.post("/programs", adminAuth, uploadMedia.fields([
  { name: 'image_url', maxCount: 1 },
  { name: 'extraImages', maxCount: 10 }
]), EventsController.createProgram);
router.put("/programs/:id", adminAuth, uploadMedia.fields([
  { name: 'image_url', maxCount: 1 },
  { name: 'extraImages', maxCount: 10 }
]), EventsController.updateProgram);
router.delete("/programs/:id", adminAuth, EventsController.deleteProgram);

// ============ EVENTS ROUTES ============
// PUBLIC ROUTES
router.get("/", EventsController.getAll);
router.get("/:slug", EventsController.getById);

// ADMIN ROUTES (CRUD)
router.post("/", adminAuth, EventsController.create);
router.put("/:id" ,adminAuth, EventsController.update);
router.delete("/:id", adminAuth, EventsController.delete);

export default router;
// path: backend/routes/coursesRoutes.js

import express from "express";
import CoursesController from "../controllers/coursesController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia  } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// PUBLIC ROUTES
router.get("/", CoursesController.getAll);
router.get("/:slug", CoursesController.getById);

// ADMIN ROUTES (CRUD) - 🔑 FIX: Corrected order (Upload BEFORE Auth)
router.post("/", uploadMedia.single("image"), adminAuth, CoursesController.create);
router.put("/:id", uploadMedia.single("image"), adminAuth, CoursesController.update);
router.delete("/:id", adminAuth, CoursesController.delete); // Auth is still before Controller

export default router;
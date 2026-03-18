import express from "express";
import ArtistController from "../controllers/artistController.js";
import { adminAuth } from "../middleware/authMiddleware.js"; 
import { uploadMedia } from "../middleware/uploadMiddleware.js"; 

const router = express.Router();

// PUBLIC ROUTES (Anyone can view all artists or a single artist)
router.get("/", ArtistController.getAll);
router.get("/:slug", ArtistController.getById);

// ADMIN ROUTES (CRUD - Protected by adminAuth middleware)
// Use uploadMedia instead of upload
router.post("/", adminAuth, uploadMedia.single('profile_image'), ArtistController.create); 
router.put("/:id", adminAuth, uploadMedia.single('profile_image'), ArtistController.update); 
router.delete("/:id", adminAuth, ArtistController.delete);

export default router;
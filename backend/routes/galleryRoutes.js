import express from "express";
import GalleryController from "../controllers/galleryController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", GalleryController.getAll);
router.get("/:id", GalleryController.getById);

router.post("/", uploadMedia.single("image"), adminAuth, GalleryController.create);
router.put("/:id", uploadMedia.single("image"), adminAuth, GalleryController.update);
router.delete("/:id", adminAuth, GalleryController.delete);

export default router;

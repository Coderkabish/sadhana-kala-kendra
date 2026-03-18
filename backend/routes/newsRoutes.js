import express from "express";
import NewsController from "../controllers/newsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public endpoints used by Events and News detail pages
router.get("/", NewsController.getAll);
router.get("/:id/resources", NewsController.getResources);
router.get("/:slug", NewsController.getById);

// Admin CRUD endpoints
router.post(
	"/",
	adminAuth,
	uploadMedia.fields([
		{ name: "image", maxCount: 1 },
		{ name: "extraImages", maxCount: 20 },
	]),
	NewsController.create
);
router.put(
	"/:id",
	adminAuth,
	uploadMedia.fields([
		{ name: "image", maxCount: 1 },
		{ name: "extraImages", maxCount: 20 },
	]),
	NewsController.update
);
router.delete("/:id", adminAuth, NewsController.delete);

export default router;

import express from "express";
import OffersController from "../controllers/offersController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", OffersController.getPublic);
router.get("/admin/all", adminAuth, OffersController.getAllForAdmin);
router.get("/:slug", OffersController.getById);

router.post("/", adminAuth, uploadMedia.single("image"), OffersController.create);
router.put("/:id", adminAuth, uploadMedia.single("image"), OffersController.update);
router.delete("/:id", adminAuth, OffersController.delete);

export default router;

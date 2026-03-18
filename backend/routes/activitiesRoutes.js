import express from "express";
import ActivitiesController from "../controllers/activitiesController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ActivitiesController.getAll);
router.get("/:id", ActivitiesController.getById);
router.post("/", adminAuth, ActivitiesController.create);
router.put("/:id", adminAuth, ActivitiesController.update);
router.delete("/:id", adminAuth, ActivitiesController.delete);

export default router;

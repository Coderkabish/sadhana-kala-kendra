import express from "express";
import AboutController from "../controllers/aboutController.js";

const router = express.Router();

router.get("/", AboutController.getAllPrograms);
router.get("/:slug", AboutController.getProgramBySlug);

export default router;

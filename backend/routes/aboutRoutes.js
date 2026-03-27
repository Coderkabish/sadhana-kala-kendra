import express from "express";
import path from "path";
import AboutController from "../controllers/aboutController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ======== BOD ROUTES ========
// PUBLIC
router.get("/bod", AboutController.getAllBOD);
router.get("/bod/:slug", AboutController.getBODBySlug);
router.get("/bod/by-id/:id", AboutController.getBODById);

// ADMIN PROTECTED
router.post("/bod", adminAuth, uploadMedia.single("profile_image"), AboutController.createBOD);
router.put("/bod/:id", adminAuth, uploadMedia.single("profile_image"), AboutController.updateBOD);
router.delete("/bod/:id", adminAuth, AboutController.deleteBOD);

// ======== TEAM MEMBERS ROUTES ========
// PUBLIC
router.get("/team-members", AboutController.getAllTeamMembers);
router.get("/team-members/:id", AboutController.getTeamMemberById);

// ADMIN PROTECTED
router.post("/team-members", adminAuth, uploadMedia.single("image_url"), AboutController.createTeamMember);
router.put("/team-members/:id", adminAuth, uploadMedia.single("image_url"), AboutController.updateTeamMember);
router.delete("/team-members/:id", adminAuth, AboutController.deleteTeamMember);

// ======== PROGRAMS ROUTES ========
// PUBLIC
router.get("/programs", AboutController.getAllPrograms);
router.get("/programs/slug/:slug", AboutController.getProgramBySlug);
router.get("/programs/:id", AboutController.getProgramById);

// ADMIN PROTECTED
router.post("/programs", adminAuth, uploadMedia.single("image_url"), AboutController.createProgram);
router.put("/programs/:id", adminAuth, uploadMedia.single("image_url"), AboutController.updateProgram);
router.delete("/programs/:id", adminAuth, AboutController.deleteProgram);

export default router;
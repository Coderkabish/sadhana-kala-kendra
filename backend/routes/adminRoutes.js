
import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import AdminController from "../controllers/adminController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { sessionTimeoutMiddleware } from "../middleware/errorCorrelationMiddleware.js";
import { validateAdminLogin, validateAdminPasswordChange, handleValidationErrors } from "../utils/validationRules.js";
import db from "../config/db.js";
import { getAuthCookieOptions } from "../utils/cookieUtils.js";

const router = express.Router();

router.post("/login", validateAdminLogin, handleValidationErrors, AdminController.login);
router.post("/logout", adminAuth, AdminController.logout);

router.put("/update-password", adminAuth, sessionTimeoutMiddleware, validateAdminPasswordChange, handleValidationErrors, AdminController.updatePassword);
router.get("/me", adminAuth, sessionTimeoutMiddleware, (req, res) => {
  // Optional: issue a new token to extend session
  const token = jwt.sign(
    { admin_id: req.admin.admin_id, username: req.admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );

  res.cookie("adminToken", token, getAuthCookieOptions({ maxAge: 20 * 60 * 1000 }));

  res.json({
    valid: true,
    username: req.admin.username,
    correlationId: req.correlationId,
  });
});

// Dashboard endpoint - returns basic stats
router.get("/dashboard", adminAuth, sessionTimeoutMiddleware, async (req, res) => {
  try {
    
    const [coursesCount] = await db.query("SELECT COUNT(*) as count FROM Courses");
    const [galleryCount] = await db.query("SELECT COUNT(*) as count FROM Gallery");
    const [teachersCount] = await db.query("SELECT COUNT(*) as count FROM Teachers");
    const [eventsCount] = await db.query("SELECT COUNT(*) as count FROM Events");
    const [newsCount] = await db.query("SELECT COUNT(*) as count FROM News");
    const [registrationsCount] = await db.query("SELECT COUNT(*) as count FROM Registrations");

    res.json({
      success: true,
      data: {
        totalCourses: coursesCount[0]?.count || 0,
        totalGalleries: galleryCount[0]?.count || 0,
        totalTeachers: teachersCount[0]?.count || 0,
        totalEvents: eventsCount[0]?.count || 0,
        totalNews: newsCount[0]?.count || 0,
        totalUsers: registrationsCount[0]?.count || 0,
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch dashboard stats",
      error: err.message
    });
  }
});

// Admin CRUD endpoints for all content types
// NOTE: Most CRUD operations are now handled by individual route files (coursesRoutes, galleryRoutes, etc.)
// All main routes (GET /api/courses, GET /api/gallery, etc.) return raw arrays
// POST/PUT/DELETE on main routes require adminAuth middleware and handle upload/validation properly
// This avoids data structure inconsistency from duplicate implementations

// The main routes already have proper implementation:
// - GET /api/courses (public) → returns array with all course data + schedules  
// - POST /api/courses (admin) → creates course with schedules
// - PUT /api/courses/:id (admin) → updates course with schedules
// - DELETE /api/courses/:id (admin) → deletes course and schedules
// Same pattern for /api/gallery, /api/teachers, /api/events, /api/news, /api/activities, /api/offers, etc.

// REMOVED: Duplicate GET /api/server/courses, /api/server/gallery, etc. to avoid inconsistency


router.get("/activities/:id", adminAuth, async (req, res) => {
  try {
    const [activity] = await db.query("SELECT * FROM activities WHERE activity_id = ?", [req.params.id]);
    res.json({ success: true, data: activity[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

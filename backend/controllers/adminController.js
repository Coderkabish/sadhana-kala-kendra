import AdminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { logAdminAction } from "../utils/auditLogger.js"; 
import { getUserFriendlyError, ERROR_MESSAGES } from "../utils/errorMessages.js";
import { getAuthCookieOptions } from "../utils/cookieUtils.js";

class AdminController {
  static async login(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const { username, password } = req.body;
    const genericErrorMessage = "Login failed. Check your credentials.";

    try {
      const admin = await AdminModel.findByUsername(username);

      if (!admin) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      // Trim the password from the database
      const dbPasswordHash = admin.password;

      const isMatch = await bcrypt.compare(password, dbPasswordHash);

      if (!isMatch) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("FATAL: JWT_SECRET environment variable is missing.");
      }

      const token = jwt.sign(
        { admin_id: admin.admin_id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: "20m" }
      );

      // Set token as HttpOnly cookie
      res.cookie("adminToken", token, getAuthCookieOptions({ maxAge: 30 * 60 * 1000 }));

      res.json({
        message: "Login successful",
        username: admin.username,
      });
    } catch (err) {
      next(err);
    }
  }
  

  static async logout(req, res, next) {
    try {
      res.clearCookie("adminToken", {
        ...getAuthCookieOptions(),
      });

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Map validation errors to user-friendly messages
      const errorArray = errors.array();
      const userMessage = errorArray[0]?.msg || "Please check your password requirements";
      return res.status(400).json({ message: userMessage });
    }

    const { oldPassword, newPassword } = req.body;
    const adminId = req.admin.admin_id;

    try {
      const hashedPassword = await AdminModel.getHashedPassword(adminId);

      if (!hashedPassword) {
        return res.status(404).json({ message: ERROR_MESSAGES.ADMIN_NOT_FOUND });
      }

      const dbHashedPassword = hashedPassword.trim();
      const isMatch = await bcrypt.compare(oldPassword, dbHashedPassword);

      if (!isMatch) {
        return res.status(401).json({ message: ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT });
      }

      // Check if new password is different from old password
      const isSameAsOld = await bcrypt.compare(newPassword, dbHashedPassword);
      if (isSameAsOld) {
        return res.status(400).json({ message: ERROR_MESSAGES.PASSWORD_SAME_AS_OLD });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      const updated = await AdminModel.updatePassword(
        adminId,
        newHashedPassword
      );

      if (!updated) {
        return res.status(500).json({ message: ERROR_MESSAGES.PASSWORD_UPDATE_FAILED });
      }

      // Log the admin action
      await logAdminAction({
        admin_id: adminId,
        action: "UPDATE",
        entity: "ADMIN_PASSWORD",
        entity_id: adminId,
        ip: req.ip
      });
      
      res.clearCookie("adminToken", {
        ...getAuthCookieOptions(),
      });

      res.json({ message: "Your password has been updated successfully. Please log in again." });
    } catch (err) {
      next(err);
    }
  }
}

export default AdminController;

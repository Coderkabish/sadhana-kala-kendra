import AboutModel from "../models/aboutModel.js";
import fs from "fs/promises";
import path from "path";
import { logAdminAction } from "../utils/auditLogger.js"; 
import { slugify } from "../utils/slug.js";

const toArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const parseMaybeJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

class AboutController {
    static async removeFile(filePath) {
        if (!filePath) return;
        if (!filePath.startsWith("/uploads/")) return;
        const fullPath = path.join(process.cwd(), filePath);
        try {
            await fs.unlink(fullPath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                // Error deleting file
            }
        }
    }

    static getImagePath(req) {
        if (req.file) return `/uploads/${req.file.filename}`;
        if (req.files?.image_url?.[0]) return `/uploads/${req.files.image_url[0].filename}`;
        return null;
    }

    static async deleteOldBODImage(id) {
        try {
            const existing = await AboutModel.getBODById(id);
            if (existing && existing.profile_image) {
                await AboutController.removeFile(existing.profile_image);
            }
        } catch {}
    }

    static async deleteOldTeamImage(id) {
        try {
            const existing = await AboutModel.getTeamMemberById(id);
            if (existing && existing.image_url) {
                await AboutController.removeFile(existing.image_url);
            }
        } catch {}
    }



    // ================= BOD CONTROLLERS =================
    static async getAllBOD(req, res) {
        try {
            const bodMembers = await AboutModel.getAllBOD();
            res.status(200).json(bodMembers);
        } catch {
            res.status(500).json({ message: "Failed to fetch BOD members." });
        }
    }

    static async getBODById(req, res) {
        try {
            const bodMember = await AboutModel.getBODById(req.params.id);
            if (!bodMember) return res.status(404).json({ message: "BOD member not found." });
            res.status(200).json(bodMember);
        } catch {
            res.status(500).json({ message: "Failed to fetch BOD member." });
        }
    }

    static async getBODBySlug(req, res) {
        try {
            const bodMember = await AboutModel.getBODBySlug(req.params.slug);
            if (!bodMember) return res.status(404).json({ message: "BOD member not found." });
            res.status(200).json(bodMember);
        } catch {
            res.status(500).json({ message: "Failed to fetch BOD member." });
        }
    }

    static async createBOD(req, res) {
        const profile_image = AboutController.getImagePath(req);
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : 0;
        const bodData = { ...req.body, profile_image, display_order: displayOrderNum };
        try {
            const newId = await AboutModel.createBOD(bodData);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "BOD",
                entity_id: newId,
                ip: req.ip
            });

            res.status(201).json({ message: "BOD member created successfully.", bod_id: newId, ...bodData });
        } catch (error) {
            if (profile_image) await AboutController.removeFile(profile_image);
            res.status(500).json({ 
                message: "Failed to create BOD member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async updateBOD(req, res) {
        const { id } = req.params;
        const newImagePath = AboutController.getImagePath(req);
        const clearImage = req.body.clear_image === "true";
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : undefined;
        const updateData = {
            ...req.body,
            ...(displayOrderNum !== undefined && { display_order: displayOrderNum }),
        };

        if (newImagePath) {
            updateData.profile_image = newImagePath;
        }
        if (clearImage) {
            updateData.profile_image = null;
        }

        try {
            if (newImagePath || clearImage) await AboutController.deleteOldBODImage(id);
            await AboutModel.updateBOD(id, updateData);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "BOD",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "BOD member updated successfully." });
        } catch (error) {
            if (newImagePath) await AboutController.removeFile(newImagePath);
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ 
                message: "Failed to update BOD member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async deleteBOD(req, res) {
        const { id } = req.params;
        try {
            await AboutController.deleteOldBODImage(id);
            await AboutModel.deleteBOD(id);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "BOD",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "BOD member deleted successfully." });
        } catch (error) {
            console.error("Error deleting BOD member:", error);
            res.status(500).json({ 
                message: "Failed to delete BOD member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    // ================= Team Members CONTROLLERS =================
    static async getAllTeamMembers(req, res) {
        try {
            const members = await AboutModel.getAllTeamMembers();
            res.status(200).json(members);
        } catch {
            res.status(500).json({ message: "Failed to fetch team members." });
        }
    }

    static async getTeamMemberById(req, res) {
        try {
            const member = await AboutModel.getTeamMemberById(req.params.id);
            if (!member) return res.status(404).json({ message: "Team member not found." });
            res.status(200).json(member);
        } catch {
            res.status(500).json({ message: "Failed to fetch team member." });
        }
    }

    static async createTeamMember(req, res) {
        const image_url = AboutController.getImagePath(req);
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : 0;
        const data = { ...req.body, image_url, display_order: displayOrderNum };
        try {
            const newId = await AboutModel.createTeamMember(data);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "TEAM_MEMBER",
                entity_id: newId,
                ip: req.ip
            });

            res.status(201).json({ message: "Team member created successfully.", team_member_id: newId, ...data });
        } catch (error) {
            console.error("Error creating team member:", error);
            res.status(500).json({ 
                message: "Failed to create team member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async updateTeamMember(req, res) {
        const { id } = req.params;
        const newImage = AboutController.getImagePath(req);
        const clearImage = req.body.clear_image === "true";
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : undefined;
        const updateData = {
            ...req.body,
            ...(displayOrderNum !== undefined && { display_order: displayOrderNum }),
        };

        if (newImage) {
            updateData.image_url = newImage;
        }
        if (clearImage) {
            updateData.image_url = null;
        }

        try {
            if (newImage || clearImage) await AboutController.deleteOldTeamImage(id);
            await AboutModel.updateTeamMember(id, updateData);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "TEAM_MEMBER",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Team member updated successfully." });
        } catch (error) {
            if (newImage) await AboutController.removeFile(newImage);
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ 
                message: "Failed to update team member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async deleteTeamMember(req, res) {
        const { id } = req.params;
        try {
            await AboutController.deleteOldTeamImage(id);
            await AboutModel.deleteTeamMember(id);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "TEAM_MEMBER",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Team member deleted successfully." });
        } catch (error) {
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ 
                message: "Failed to delete team member.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

}

export default AboutController;

import AboutModel from "../models/aboutModel.js";
import fs from "fs/promises";
import path from "path";
import { logAdminAction } from "../utils/auditLogger.js"; 
import { slugify } from "../utils/slug.js";

class AboutController {
    static async removeFile(filePath) {
        if (!filePath) return;
        if (!filePath.startsWith("/uploads/")) return;
        const fullPath = path.join(process.cwd(), filePath);
        try {
            await fs.unlink(fullPath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Error deleting file ${fullPath}:`, err);
            }
        }
    }

    static getImagePath(req) {
        if (req.file) return `/uploads/${req.file.filename}`;
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

    static async deleteOldProgramImage(id) {
        try {
            const existing = await AboutModel.getProgramById(id);
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
        const bodData = { ...req.body, profile_image };
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
            res.status(500).json({ message: "Failed to create BOD member." });
        }
    }

    static async updateBOD(req, res) {
        const { id } = req.params;
        const newImagePath = AboutController.getImagePath(req);
        const updateData = { ...req.body, ...(newImagePath && { profile_image: newImagePath }) };
        try {
            if (newImagePath) await AboutController.deleteOldBODImage(id);
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
            res.status(500).json({ message: "Failed to update BOD member." });
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
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ message: "Failed to delete BOD member." });
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
        const data = { ...req.body, image_url };
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
            if (image_url) await AboutController.removeFile(image_url);
            res.status(500).json({ message: "Failed to create team member." });
        }
    }

    static async updateTeamMember(req, res) {
        const { id } = req.params;
        const newImage = AboutController.getImagePath(req);
        const updateData = { ...req.body, ...(newImage && { image_url: newImage }) };
        try {
            if (newImage) await AboutController.deleteOldTeamImage(id);
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
            res.status(500).json({ message: "Failed to update team member." });
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
            res.status(500).json({ message: "Failed to delete team member." });
        }
    }

    // ================= PROGRAMS CONTROLLERS =================
    static async getAllPrograms(req, res) {
        try {
            const programs = await AboutModel.getAllPrograms();
            res.status(200).json(programs);
        } catch {
            res.status(500).json({ message: "Failed to fetch programs." });
        }
    }

    static async getProgramById(req, res) {
        try {
            const program = await AboutModel.getProgramById(req.params.id);
            if (!program) return res.status(404).json({ message: "Program not found." });
            res.status(200).json(program);
        } catch {
            res.status(500).json({ message: "Failed to fetch program." });
        }
    }

    static async getProgramBySlug(req, res) {
        try {
            const program = await AboutModel.getProgramBySlug(req.params.slug);
            if (!program) return res.status(404).json({ message: "Program not found." });
            res.status(200).json(program);
        } catch {
            res.status(500).json({ message: "Failed to fetch program." });
        }
    }

    static async createProgram(req, res) {
        const image_url = AboutController.getImagePath(req);
        const programData = {
            ...req.body,
            slug: slugify(req.body.slug || req.body.title),
            image_url,
        };
        try {
            const newId = await AboutModel.createProgram(programData);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "PROGRAM",
                entity_id: newId,
                ip: req.ip
            });

            res.status(201).json({ message: "Program created successfully.", program_id: newId, ...programData });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                if (image_url) await AboutController.removeFile(image_url);
                return res.status(409).json({ message: "Slug already exists." });
            }
            if (image_url) await AboutController.removeFile(image_url);
            res.status(500).json({ message: "Failed to create program." });
        }
    }

    static async updateProgram(req, res) {
        const { id } = req.params;
        const newImagePath = AboutController.getImagePath(req);
        const updateData = {
            ...req.body,
            ...(req.body.slug !== undefined || req.body.title !== undefined
                ? { slug: slugify(req.body.slug || req.body.title) }
                : {}),
            ...(newImagePath && { image_url: newImagePath }),
        };
        try {
            if (newImagePath) await AboutController.deleteOldProgramImage(id);
            await AboutModel.updateProgram(id, updateData);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "PROGRAM",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Program updated successfully." });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                if (newImagePath) await AboutController.removeFile(newImagePath);
                return res.status(409).json({ message: "Slug already exists." });
            }
            if (newImagePath) await AboutController.removeFile(newImagePath);
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ message: "Failed to update program." });
        }
    }

    static async deleteProgram(req, res) {
        const { id } = req.params;
        try {
            await AboutController.deleteOldProgramImage(id);
            await AboutModel.deleteProgram(id);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "PROGRAM",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Program deleted successfully." });
        } catch (error) {
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ message: "Failed to delete program." });
        }
    }
}

export default AboutController;

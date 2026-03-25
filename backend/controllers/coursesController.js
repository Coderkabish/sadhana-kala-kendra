import fs from "fs/promises";
import path from "path";
import CoursesModel from "../models/coursesModel.js";
import { logAdminAction } from "../utils/auditLogger.js"; 
import { slugify } from "../utils/slug.js";

class CoursesController {
    static normalizePrice(priceValue) {
        if (priceValue === undefined || priceValue === null || String(priceValue).trim() === "") {
            return null;
        }

        const parsed = Number(priceValue);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return { invalid: true };
        }

        return parsed;
    }

    static async removeFile(filePath) {
        if (!filePath) return;
        
        // 🔒 Path traversal protection
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

    static async getAll(req, res, next) {
        try {
            const courses = await CoursesModel.getAll();
            res.json(courses);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const slugOrId = req.params.slug;
            const course = Number.isFinite(Number(slugOrId))
                ? await CoursesModel.getById(slugOrId)
                : await CoursesModel.getBySlug(slugOrId);
            if (!course) return res.status(404).json({ message: "Course not found" });
            res.json(course);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, description, level, price, teacher_name, schedules, slug, seo_title, seo_description, seo_keywords } = req.body;
            // 🔑 FIX: Use req.file.filename to save only the filename, prepending the public path
            const image_url = req.file ? `/uploads/${req.file.filename}` : null; 
            const normalizedSlug = slugify(slug || title);
            const normalizedPrice = CoursesController.normalizePrice(price);

            if (!title?.trim()) {
                if (req.file) await CoursesController.removeFile(req.file.path); // Use req.file.path for disk deletion
                return res.status(400).json({ message: "Course title is required" });
            }

            if (normalizedPrice?.invalid) {
                if (req.file) await CoursesController.removeFile(req.file.path);
                return res.status(400).json({ message: "Course price must be a valid non-negative number" });
            }
            
            // ... (rest of the create logic) ...
            const courseId = await CoursesModel.create({
                title,
                description,
                level,
                price: normalizedPrice,
                teacher_name,
                image_url, // Saved as /uploads/filename.ext
                schedules: schedules ? JSON.parse(schedules) : [],
                slug: normalizedSlug,
                seo_title,
                seo_description,
                seo_keywords,
            });
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "COURSE",
                entity_id: courseId,
                ip: req.ip
            });
            return res.status(201).json({
            message: "Course created successfully",
            course_id: courseId
        });
        } catch (err) {
            if (err?.code === "ER_BAD_FIELD_ERROR") {
                if (req.file) await CoursesController.removeFile(req.file.path);
                return res.status(500).json({
                    message: `Database schema mismatch in '${process.env.DB_NAME}'. ${err.sqlMessage || err.message}`
                });
            }
            if (err?.code === "ER_DUP_ENTRY") {
                if (req.file) await CoursesController.removeFile(req.file.path);
                return res.status(409).json({ message: "Slug already exists." });
            }
            if (req.file) {
                await CoursesController.removeFile(req.file.path); 
            }
            next(err);
        }
    }

    static async update(req, res, next) {
        const courseId = req.params.id;
        try {
            const { title, description, level, price, teacher_name, schedules, clear_image, slug, seo_title, seo_description, seo_keywords } = req.body;
            const normalizedSlug = slugify(slug || title);
            const normalizedPrice = CoursesController.normalizePrice(price);
            
            let new_image_path = undefined; 
            
            if (req.file) {
                // 🔑 FIX: Use req.file.filename to save only the filename, prepending the public path
                new_image_path = `/uploads/${req.file.filename}`; 
            } else if (clear_image === 'true') { 
                new_image_path = null; 
            }
            
            if (!title?.trim()) {
                if (req.file) await CoursesController.removeFile(req.file.path); // Use req.file.path for disk deletion
                return res.status(400).json({ message: "Course title is required" });
            }

            if (normalizedPrice?.invalid) {
                if (req.file) await CoursesController.removeFile(req.file.path);
                return res.status(400).json({ message: "Course price must be a valid non-negative number" });
            }
            
            const oldImagePath = await CoursesModel.update(courseId, {
                title,
                description,
                level,
                price: normalizedPrice,
                teacher_name,
                image_url: new_image_path,
                schedules: schedules ? JSON.parse(schedules) : [],
                slug: normalizedSlug,
                seo_title,
                seo_description,
                seo_keywords,
            });

            if (oldImagePath) {
                await CoursesController.removeFile(oldImagePath); // oldImagePath is the public URL path
            }
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "COURSE",
                entity_id: courseId,
                ip: req.ip
            });

            res.json({ message: "Course updated successfully" });
        } catch (err) {
            if (err?.code === "ER_BAD_FIELD_ERROR") {
                if (req.file) {
                    const newFilePath = req.file.path.replace(/\\/g, "/");
                    await CoursesController.removeFile(newFilePath);
                }
                return res.status(500).json({
                    message: `Database schema mismatch in '${process.env.DB_NAME}'. ${err.sqlMessage || err.message}`
                });
            }
            if (err?.code === "ER_DUP_ENTRY") {
                if (req.file) await CoursesController.removeFile(req.file.path);
                return res.status(409).json({ message: "Slug already exists." });
            }
            if (req.file) {
                const newFilePath = req.file.path.replace(/\\/g, "/");
                await CoursesController.removeFile(newFilePath);
            }
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            const imagePathToDelete = await CoursesModel.delete(req.params.id);

            if (imagePathToDelete) {
                await CoursesController.removeFile(imagePathToDelete);
            }
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "COURSE",
                entity_id: req.params.id,
                ip: req.ip
            });

            res.json({ message: "Course deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
}

export default CoursesController;
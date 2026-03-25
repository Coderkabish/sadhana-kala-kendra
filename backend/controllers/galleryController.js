import fs from "fs/promises";
import path from "path";
import GalleryModel from "../models/galleryModel.js";
import { logAdminAction } from "../utils/auditLogger.js";

class GalleryController {
  static async removeFile(filePath) {
    if (!filePath || !filePath.startsWith("/uploads/")) return;

    const fullPath = path.join(process.cwd(), filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`Error deleting file ${fullPath}:`, err);
      }
    }
  }

  static async getAll(req, res, next) {
    try {
      const items = await GalleryModel.getAll();
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const item = await GalleryModel.getById(req.params.id);
      if (!item) return res.status(404).json({ message: "Gallery item not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { title } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      if (!image_url) {
        return res.status(400).json({ message: "Gallery image is required" });
      }

      const mediaId = await GalleryModel.create({ title, image_url });

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "CREATE",
        entity: "GALLERY",
        entity_id: mediaId,
        ip: req.ip,
      });

      res.status(201).json({ message: "Gallery item created", media_id: mediaId });
    } catch (err) {
      if (req.file) {
        await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      }
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const mediaId = req.params.id;
      const { title, clear_image } = req.body;

      const existing = await GalleryModel.getById(mediaId);
      if (!existing) {
        if (req.file) {
          await GalleryController.removeFile(`/uploads/${req.file.filename}`);
        }
        return res.status(404).json({ message: "Gallery item not found" });
      }

      let nextImage = undefined;
      if (req.file) {
        nextImage = `/uploads/${req.file.filename}`;
      } else if (clear_image === "true") {
        nextImage = null;
      }

      await GalleryModel.update(mediaId, { title, image_url: nextImage });

      if (req.file && existing.image_url) {
        await GalleryController.removeFile(existing.image_url);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "UPDATE",
        entity: "GALLERY",
        entity_id: mediaId,
        ip: req.ip,
      });

      res.json({ message: "Gallery item updated" });
    } catch (err) {
      if (req.file) {
        await GalleryController.removeFile(`/uploads/${req.file.filename}`);
      }
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const imagePath = await GalleryModel.delete(req.params.id);
      if (imagePath) {
        await GalleryController.removeFile(imagePath);
      }

      await logAdminAction({
        admin_id: req.admin.admin_id,
        action: "DELETE",
        entity: "GALLERY",
        entity_id: req.params.id,
        ip: req.ip,
      });

      res.json({ message: "Gallery item deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default GalleryController;

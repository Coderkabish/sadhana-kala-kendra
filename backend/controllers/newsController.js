import NewsModel from "../models/newsModel.js";
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

class NewsController {
  static async getAll(req, res, next) {
    try {
      const rows = await NewsModel.getAll();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const slugOrId = req.params.slug;
      const row = Number.isFinite(Number(slugOrId))
        ? await NewsModel.getById(slugOrId)
        : await NewsModel.getBySlug(slugOrId);
      if (!row) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(row);
    } catch (err) {
      next(err);
    }
  }

  static async getResources(req, res, next) {
    try {
      const resources = await NewsModel.getResources(req.params.id);
      res.json(resources);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { title, content, news_date, image_url, resources, slug, seo_title, seo_description, seo_keywords } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required." });
      }

      const imageFile = req.files?.image?.[0];
      const normalizedImageUrl = imageFile
        ? `/uploads/${imageFile.filename}`
        : (image_url || null);

      const id = await NewsModel.create({
        title,
        slug: slugify(slug || title),
        content,
        news_date,
        image_url: normalizedImageUrl,
        seo_title,
        seo_description,
        seo_keywords,
      });

      const extraImageFiles = req.files?.extraImages || [];
      const ytLinks = parseMaybeJsonArray(req.body.ytLinks).filter(Boolean);

      const normalizedResources = [];

      // JSON resources support for non-multipart clients.
      const bodyResources = Array.isArray(resources) ? resources : parseMaybeJsonArray(resources);
      bodyResources.forEach((item, index) => {
        if (
          item &&
          (item.resource_type === "image" || item.resource_type === "youtube") &&
          item.resource_url
        ) {
          normalizedResources.push({
            resource_type: item.resource_type,
            resource_url: item.resource_url,
            caption: item.caption || null,
            sort_order: item.sort_order ?? index + 1,
          });
        }
      });

      extraImageFiles.forEach((file, index) => {
        normalizedResources.push({
          resource_type: "image",
          resource_url: `/uploads/${file.filename}`,
          sort_order: normalizedResources.length + index + 1,
        });
      });

      ytLinks.forEach((url, index) => {
        normalizedResources.push({
          resource_type: "youtube",
          resource_url: url,
          sort_order: normalizedResources.length + index + 1,
        });
      });

      if (normalizedResources.length > 0) {
        await NewsModel.replaceResources(id, normalizedResources);
      }

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "CREATE",
          entity: "NEWS",
          entity_id: id,
          ip: req.ip,
        });
      }

      res.status(201).json({ message: "News created", id });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Slug already exists." });
      }
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { title, content, news_date, image_url, resources, slug, seo_title, seo_description, seo_keywords } = req.body;

      const imageFile = req.files?.image?.[0];
      const normalizedImageUrl = imageFile
        ? `/uploads/${imageFile.filename}`
        : image_url;

      await NewsModel.update(req.params.id, {
        title,
        slug: slug !== undefined || title !== undefined ? slugify(slug || title) : undefined,
        content,
        news_date,
        image_url: normalizedImageUrl,
        seo_title,
        seo_description,
        seo_keywords,
      });

      const hasResourceInputs =
        resources !== undefined ||
        req.body.ytLinks !== undefined ||
        req.body.existingImagesToKeep !== undefined ||
        (req.files?.extraImages && req.files.extraImages.length > 0);

      if (hasResourceInputs) {
        const normalizedResources = [];

        const bodyResources = Array.isArray(resources) ? resources : parseMaybeJsonArray(resources);
        bodyResources.forEach((item, index) => {
          if (
            item &&
            (item.resource_type === "image" || item.resource_type === "youtube") &&
            item.resource_url
          ) {
            normalizedResources.push({
              resource_type: item.resource_type,
              resource_url: item.resource_url,
              caption: item.caption || null,
              sort_order: item.sort_order ?? index + 1,
            });
          }
        });

        const existingImagesToKeep = toArray(req.body.existingImagesToKeep)
          .filter((url) => typeof url === "string" && url.trim())
          .map((url, index) => ({
            resource_type: "image",
            resource_url: url.trim(),
            sort_order: normalizedResources.length + index + 1,
          }));

        const extraImageFiles = req.files?.extraImages || [];
        const uploadedImageResources = extraImageFiles.map((file, index) => ({
          resource_type: "image",
          resource_url: `/uploads/${file.filename}`,
          sort_order: normalizedResources.length + existingImagesToKeep.length + index + 1,
        }));

        const ytLinks = parseMaybeJsonArray(req.body.ytLinks)
          .filter((url) => typeof url === "string" && url.trim())
          .map((url, index) => ({
            resource_type: "youtube",
            resource_url: url.trim(),
            sort_order:
              normalizedResources.length +
              existingImagesToKeep.length +
              uploadedImageResources.length +
              index +
              1,
          }));

        const mergedResources = [
          ...normalizedResources,
          ...existingImagesToKeep,
          ...uploadedImageResources,
          ...ytLinks,
        ];

        await NewsModel.replaceResources(req.params.id, mergedResources);
      }

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "UPDATE",
          entity: "NEWS",
          entity_id: req.params.id,
          ip: req.ip,
        });
      }

      res.json({ message: "News updated" });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Slug already exists." });
      }
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await NewsModel.delete(req.params.id);

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "DELETE",
          entity: "NEWS",
          entity_id: req.params.id,
          ip: req.ip,
        });
      }

      res.json({ message: "News deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default NewsController;

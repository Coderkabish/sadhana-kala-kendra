import OffersModel from "../models/offersModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
import { slugify } from "../utils/slug.js";

const toNullableText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

const parseOptionalNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

class OffersController {
  static async getPublic(req, res, next) {
    try {
      const rows = await OffersModel.getPublic(req.query.limit);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }

  static async getAllForAdmin(req, res, next) {
    try {
      const rows = await OffersModel.getAllForAdmin();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const slugOrId = req.params.slug;
      const row = Number.isFinite(Number(slugOrId))
        ? await OffersModel.getById(slugOrId)
        : await OffersModel.getBySlug(slugOrId);
      if (!row) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(row);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const imageFile = req.file;
      const body = req.body || {};

      if (!body.title || !String(body.title).trim()) {
        return res.status(400).json({ message: "Title is required." });
      }

      const id = await OffersModel.create({
        title: String(body.title).trim(),
        slug: slugify(body.slug || body.title),
        subtitle: toNullableText(body.subtitle),
        description: toNullableText(body.description),
        image_url: imageFile ? `/uploads/${imageFile.filename}` : toNullableText(body.image_url),
        cta_text: toNullableText(body.cta_text),
        cta_link: toNullableText(body.cta_link),
        valid_from: toNullableText(body.valid_from),
        valid_to: toNullableText(body.valid_to),
        seo_title: toNullableText(body.seo_title),
        seo_description: toNullableText(body.seo_description),
        seo_keywords: toNullableText(body.seo_keywords),
        display_order: parseOptionalNumber(body.display_order) ?? 0,
        is_active: parseOptionalNumber(body.is_active) ?? 1,
      });

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "CREATE",
          entity: "OFFER",
          entity_id: id,
          ip: req.ip,
        });
      }

      res.status(201).json({ message: "Offer created", id });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Slug already exists." });
      }
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const imageFile = req.file;
      const body = req.body || {};

      const payload = {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        slug:
          body.slug !== undefined || body.title !== undefined
            ? slugify(body.slug || body.title)
            : undefined,
        subtitle: toNullableText(body.subtitle),
        description: toNullableText(body.description),
        image_url: imageFile
          ? `/uploads/${imageFile.filename}`
          : (body.image_url !== undefined ? toNullableText(body.image_url) : undefined),
        cta_text: toNullableText(body.cta_text),
        cta_link: toNullableText(body.cta_link),
        valid_from: body.valid_from !== undefined ? toNullableText(body.valid_from) : undefined,
        valid_to: body.valid_to !== undefined ? toNullableText(body.valid_to) : undefined,
        seo_title: toNullableText(body.seo_title),
        seo_description: toNullableText(body.seo_description),
        seo_keywords: toNullableText(body.seo_keywords),
        display_order: parseOptionalNumber(body.display_order),
        is_active: parseOptionalNumber(body.is_active),
      };

      await OffersModel.update(req.params.id, payload);

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "UPDATE",
          entity: "OFFER",
          entity_id: req.params.id,
          ip: req.ip,
        });
      }

      res.json({ message: "Offer updated" });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Slug already exists." });
      }
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await OffersModel.delete(req.params.id);

      if (req.admin?.admin_id) {
        await logAdminAction({
          admin_id: req.admin.admin_id,
          action: "DELETE",
          entity: "OFFER",
          entity_id: req.params.id,
          ip: req.ip,
        });
      }

      res.json({ message: "Offer deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default OffersController;

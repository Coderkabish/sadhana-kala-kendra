import db from "../config/db.js";

class OffersModel {
  static async getPublic(limit) {
    const parsedLimit = Number.parseInt(limit, 10);
    const hasLimit = Number.isFinite(parsedLimit) && parsedLimit > 0;

    const query = `
      SELECT
        offer_id,
        course_id,
        title,
        slug,
        subtitle,
        description,
        image_url,
        discount_percentage,
        discount_type,
        cta_text,
        cta_link,
        valid_from,
        valid_to,
        seo_title,
        seo_description,
        seo_keywords,
        display_order,
        created_at,
        updated_at
      FROM Offers
      WHERE COALESCE(is_active, 1) = 1
      ORDER BY display_order ASC, created_at DESC
      ${hasLimit ? "LIMIT ?" : ""}
    `;

    const [rows] = hasLimit
      ? await db.query(query, [parsedLimit])
      : await db.query(query);

    return rows;
  }

  static async getAllForAdmin() {
    const [rows] = await db.query(
      `SELECT o.*, c.course_name FROM Offers o
       LEFT JOIN Courses c ON o.course_id = c.course_id
       ORDER BY o.created_at DESC, o.offer_id DESC`
    );
    return rows;
  }

  static async getById(offerId) {
    const [rows] = await db.query(`SELECT * FROM Offers WHERE offer_id = ?`, [offerId]);
    return rows[0] || null;
  }

  static async getBySlug(slug) {
    const [rows] = await db.query(`SELECT * FROM Offers WHERE slug = ?`, [slug]);
    return rows[0] || null;
  }

  static async getByCourse(courseId) {
    const [rows] = await db.query(
      `SELECT * FROM Offers 
       WHERE course_id = ? AND is_active = 1
       AND (valid_from IS NULL OR valid_from <= CURDATE())
       AND (valid_to IS NULL OR valid_to >= CURDATE())
       ORDER BY created_at DESC`,
      [courseId]
    );
    return rows;
  }

  static async create({
    course_id,
    title,
    slug,
    subtitle,
    description,
    image_url,
    discount_percentage,
    discount_type,
    cta_text,
    cta_link,
    valid_from,
    valid_to,
    seo_title,
    seo_description,
    seo_keywords,
    display_order,
    is_active,
  }) {
    const [result] = await db.query(
      `INSERT INTO Offers (
        course_id,
        title,
        slug,
        subtitle,
        description,
        image_url,
        discount_percentage,
        discount_type,
        cta_text,
        cta_link,
        valid_from,
        valid_to,
        seo_title,
        seo_description,
        seo_keywords,
        display_order,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id || null,
        title,
        slug,
        subtitle || null,
        description || null,
        image_url || null,
        discount_percentage ?? 0,
        discount_type || 'percentage',
        cta_text || null,
        cta_link || null,
        valid_from || null,
        valid_to || null,
        seo_title || null,
        seo_description || null,
        seo_keywords || null,
        display_order ?? 0,
        is_active ?? 1,
      ]
    );

    return result.insertId;
  }

  static async update(offerId, payload) {
    const fields = [];
    const values = [];

    const pushField = (field, value) => {
      if (value !== undefined) {
        fields.push(`${field} = ?`);
        values.push(value);
      }
    };

    pushField("course_id", payload.course_id);
    pushField("title", payload.title);
    pushField("slug", payload.slug);
    pushField("subtitle", payload.subtitle);
    pushField("description", payload.description);
    pushField("image_url", payload.image_url);
    pushField("discount_percentage", payload.discount_percentage);
    pushField("discount_type", payload.discount_type);
    pushField("cta_text", payload.cta_text);
    pushField("cta_link", payload.cta_link);
    pushField("valid_from", payload.valid_from);
    pushField("valid_to", payload.valid_to);
    pushField("seo_title", payload.seo_title);
    pushField("seo_description", payload.seo_description);
    pushField("seo_keywords", payload.seo_keywords);
    pushField("display_order", payload.display_order);
    pushField("is_active", payload.is_active);

    if (fields.length === 0) return;

    values.push(offerId);
    await db.query(`UPDATE Offers SET ${fields.join(", ")} WHERE offer_id = ?`, values);
  }

  static async delete(offerId) {
    await db.query(`DELETE FROM Offers WHERE offer_id = ?`, [offerId]);
  }
}

export default OffersModel;
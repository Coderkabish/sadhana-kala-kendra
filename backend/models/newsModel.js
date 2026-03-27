import db from "../config/db.js";

class NewsModel {
  static async getAll() {
    const [rows] = await db.query(
      `SELECT * FROM News ORDER BY news_date DESC, created_at DESC`
    );
    return rows;
  }

  static async getById(news_id) {
    const [rows] = await db.query(`SELECT * FROM News WHERE news_id = ?`, [news_id]);
    return rows[0] || null;
  }

  static async getBySlug(slug) {
    const [rows] = await db.query(`SELECT * FROM News WHERE slug = ?`, [slug]);
    return rows[0] || null;
  }

  static async getResources(news_id) {
    try {
      const [rows] = await db.query(
        `SELECT resource_id, news_id, resource_type, resource_url, caption, sort_order
         FROM News_Resources
         WHERE news_id = ?
         ORDER BY sort_order ASC, resource_id ASC`,
        [news_id]
      );
      return rows;
    } catch (err) {
      if (err.code === "ER_BAD_FIELD_ERROR") {
        const [rows] = await db.query(
          `SELECT resource_id, news_id, resource_type, resource_url
           FROM News_Resources
           WHERE news_id = ?
           ORDER BY resource_id ASC`,
          [news_id]
        );

        return rows.map((row, index) => ({
          ...row,
          caption: null,
          sort_order: index + 1,
        }));
      }

      // Allow frontend details page to load even before News_Resources migration is applied.
      if (err.code === "ER_NO_SUCH_TABLE") {
        return [];
      }
      throw err;
    }
  }

  static async create({ title, slug, rich_content, news_date, image_url, seo_title, seo_description, seo_keywords }) {
    const [result] = await db.query(
      `INSERT INTO News (title, slug, rich_content, news_date, image_url, seo_title, seo_description, seo_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        rich_content || null,
        news_date || null,
        image_url || null,
        seo_title || null,
        seo_description || null,
        seo_keywords || null,
      ]
    );
    return result.insertId;
  }

  static async update(news_id, { title, slug, rich_content, news_date, image_url, seo_title, seo_description, seo_keywords }) {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }
    if (rich_content !== undefined) {
      fields.push("rich_content = ?");
      values.push(rich_content);
    }
    if (news_date !== undefined) {
      fields.push("news_date = ?");
      values.push(news_date);
    }
    if (image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(image_url);
    }
    if (seo_title !== undefined) {
      fields.push("seo_title = ?");
      values.push(seo_title);
    }
    if (seo_description !== undefined) {
      fields.push("seo_description = ?");
      values.push(seo_description);
    }
    if (seo_keywords !== undefined) {
      fields.push("seo_keywords = ?");
      values.push(seo_keywords);
    }
    if (fields.length === 0) return;

    const query = `UPDATE News SET ${fields.join(", ")} WHERE news_id = ?`;
    values.push(news_id);
    await db.query(query, values);
  }

  static async delete(news_id) {
    await db.query(`DELETE FROM News WHERE news_id = ?`, [news_id]);
  }

  static async replaceResources(news_id, resources = []) {
    await db.query(`DELETE FROM News_Resources WHERE news_id = ?`, [news_id]);

    if (!Array.isArray(resources) || resources.length === 0) {
      return;
    }

    const placeholders = resources.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const values = [];

    resources.forEach((item, index) => {
      values.push(
        news_id,
        item.resource_type,
        item.resource_url,
        item.caption || null,
        item.sort_order ?? index + 1
      );
    });

    try {
      await db.query(
        `INSERT INTO News_Resources (news_id, resource_type, resource_url, caption, sort_order)
         VALUES ${placeholders}`,
        values
      );
    } catch (err) {
      if (err.code !== "ER_BAD_FIELD_ERROR") {
        throw err;
      }

      const legacyPlaceholders = resources.map(() => "(?, ?, ?)").join(", ");
      const legacyValues = [];

      resources.forEach((item) => {
        legacyValues.push(news_id, item.resource_type, item.resource_url);
      });

      await db.query(
        `INSERT INTO News_Resources (news_id, resource_type, resource_url)
         VALUES ${legacyPlaceholders}`,
        legacyValues
      );
    }
  }
}

export default NewsModel;

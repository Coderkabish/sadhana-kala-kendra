import db from "../config/db.js";

class ArtistModel {

  // Get all artists
  static async getAll() {
    const [rows] = await db.query(
      `SELECT * FROM Artists ORDER BY artist_id ASC`
    );
    return rows;
  }

  // Get artist by ID
  static async getById(artist_id) {
    const [rows] = await db.query(
      `SELECT * FROM Artists WHERE artist_id = ?`,
      [artist_id]
    );
    return rows[0];
  }

  // Get artist by slug
  static async getBySlug(slug) {
    const [rows] = await db.query(
      `SELECT * FROM Artists WHERE slug = ?`,
      [slug]
    );
    return rows[0] || null;
  }

  // Create new artist
  static async create({ full_name, slug, bio, profile_image, seo_title, seo_description, seo_keywords }) {
    const [result] = await db.query(
      `INSERT INTO Artists (full_name, slug, bio, profile_image, seo_title, seo_description, seo_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, slug, bio, profile_image, seo_title || null, seo_description || null, seo_keywords || null]
    );
    return result.insertId;
  }

  // Update artist
  static async update(artist_id, { full_name, slug, bio, profile_image, seo_title, seo_description, seo_keywords }) {
    const fields = [];
    const values = [];

    if (full_name !== undefined) {
      fields.push("full_name = ?");
      values.push(full_name);
    }

    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }

    if (bio !== undefined) {
      fields.push("bio = ?");
      values.push(bio);
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

    // Only update profile_image if a new file was uploaded
    if (profile_image !== undefined) {
      fields.push("profile_image = ?");
      values.push(profile_image);
    }

    if (fields.length === 0) return;

    const query = `UPDATE Artists SET ${fields.join(", ")} WHERE artist_id = ?`;
    values.push(artist_id);

    await db.query(query, values);
  }

  // Delete artist
  static async delete(artist_id) {
    await db.query(
      `DELETE FROM Artists WHERE artist_id = ?`,
      [artist_id]
    );
  }

}

export default ArtistModel;
import db from "../config/db.js";

class EventsModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Events ORDER BY event_date DESC, event_time ASC`
        );
        return rows;
    }

    // Get events by category
    static async getByCategory(category) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE category = ? ORDER BY event_date DESC, event_time ASC`,
            [category]
        );
        return rows;
    }

    static async getById(event_id) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE event_id = ?`,
            [event_id]
        );
        return rows[0];
    }

    static async getBySlug(slug) {
        const [rows] = await db.query(
            `SELECT * FROM Events WHERE slug = ?`,
            [slug]
        );
        return rows[0] || null;
    }
    
    static async create({ event_name, slug, description, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords }) { 
        const [result] = await db.query(
            `INSERT INTO Events (event_name, slug, description, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event_name,
                slug,
                description,
                event_date,
                event_time,
                venue,
                organized_by,
                category || 'upcoming',
                seo_title || null,
                seo_description || null,
                seo_keywords || null,
            ]
        );
        return result.insertId;
    }

    static async update(event_id, { event_name, slug, description, event_date, event_time, venue, organized_by, category, seo_title, seo_description, seo_keywords }) {
        const fields = [];
        const values = [];

        if (event_name !== undefined) { fields.push("event_name = ?"); values.push(event_name); }
        if (slug !== undefined) { fields.push("slug = ?"); values.push(slug); }
        if (description !== undefined) { fields.push("description = ?"); values.push(description); }
        if (event_date !== undefined) { fields.push("event_date = ?"); values.push(event_date); }
        if (event_time !== undefined) { fields.push("event_time = ?"); values.push(event_time); }
        if (venue !== undefined) { fields.push("venue = ?"); values.push(venue); }
        if (organized_by !== undefined) { fields.push("organized_by = ?"); values.push(organized_by); }
        if (category !== undefined) { fields.push("category = ?"); values.push(category); }
        if (seo_title !== undefined) { fields.push("seo_title = ?"); values.push(seo_title); }
        if (seo_description !== undefined) { fields.push("seo_description = ?"); values.push(seo_description); }
        if (seo_keywords !== undefined) { fields.push("seo_keywords = ?"); values.push(seo_keywords); }
        
        if (fields.length === 0) return;

        const query = `UPDATE Events SET ${fields.join(', ')} WHERE event_id = ?`;
        values.push(event_id);

        await db.query(query, values);
    }

    static async delete(event_id) {
        await db.query(
            `DELETE FROM Events WHERE event_id = ?`,
            [event_id]
        );
    }
}

export default EventsModel;
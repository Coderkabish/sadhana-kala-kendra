import db from "../config/db.js";

class ActivitiesModel {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT activity_id, title, description, video_url, created_at, updated_at
             FROM activities
             ORDER BY created_at DESC, activity_id DESC`
        );
        return rows;
    }

    static async getById(activityId) {
        const [rows] = await db.query(
            `SELECT activity_id, title, description, video_url, created_at, updated_at
             FROM activities
             WHERE activity_id = ?`,
            [activityId]
        );
        return rows[0] || null;
    }

    static async create({ title, description, video_url }) {
        const [result] = await db.query(
            `INSERT INTO activities (title, description, video_url)
             VALUES (?, ?, ?)`,
            [title, description || null, video_url]
        );
        return result.insertId;
    }

    static async update(activityId, { title, description, video_url }) {
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push("title = ?");
            values.push(title);
        }

        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }

        if (video_url !== undefined) {
            fields.push("video_url = ?");
            values.push(video_url);
        }

        if (fields.length === 0) return;

        values.push(activityId);
        await db.query(
            `UPDATE activities SET ${fields.join(", ")} WHERE activity_id = ?`,
            values
        );
    }

    static async delete(activityId) {
        await db.query(
            `DELETE FROM activities WHERE activity_id = ?`,
            [activityId]
        );
    }
}

export default ActivitiesModel;

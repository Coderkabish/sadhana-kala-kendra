import db from "../config/db.js";

class CoursesModel {
    static async getOffers(courseId) {
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

    static async getAll() {
        const [courses] = await db.query(`
            SELECT c.*, t.full_name AS teacher_name
            FROM Courses c
            LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
            ORDER BY c.created_at ASC
        `);

        const schedulePromises = courses.map(async (course) => {
            const [schedules] = await db.query(
                `SELECT cs.*, t.full_name AS teacher_name
                 FROM Class_Schedule cs
                 LEFT JOIN Teachers t ON cs.teacher_id = t.teacher_id
                 WHERE cs.course_id = ?`,
                [course.course_id]
            );
            course.schedules = schedules;
        });

        await Promise.all(schedulePromises);

        return courses;
    }

    static async getById(course_id) {
        const [rows] = await db.query(`
            SELECT c.*, t.full_name AS teacher_name
            FROM Courses c
            LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
            WHERE c.course_id = ?
        `, [course_id]);

        const course = rows[0];
        if (!course) return null;

        const [schedules] = await db.query(
            `SELECT cs.*, t.full_name AS teacher_name
             FROM Class_Schedule cs
             LEFT JOIN Teachers t ON cs.teacher_id = t.teacher_id
             WHERE cs.course_id = ?`,
            [course_id]
        );
        course.schedules = schedules;

        const offers = await this.getOffers(course_id);
        course.offers = offers;

        return course;
    }

    static async getBySlug(slug) {
        const [rows] = await db.query(
            `SELECT c.*, t.full_name AS teacher_name
             FROM Courses c
             LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
             WHERE c.slug = ?`,
            [slug]
        );

        const course = rows[0];
        if (!course) return null;

        const [schedules] = await db.query(
            `SELECT cs.*, t.full_name AS teacher_name
             FROM Class_Schedule cs
             LEFT JOIN Teachers t ON cs.teacher_id = t.teacher_id
             WHERE cs.course_id = ?`,
            [course.course_id]
        );
        course.schedules = schedules;

        const offers = await this.getOffers(course.course_id);
        course.offers = offers;

        return course;
    }

    static async create({ title, description, level, price, teacher_name, image_url, schedules, slug, seo_title, seo_description, seo_keywords }) {
        if (!title?.trim()) throw new Error("Course title is required");
        
        const connection = await db.getConnection(); // 🔧 Start transaction
        try {
            await connection.beginTransaction(); // 🔧 Begin transaction

            const [teacherRows] = await connection.query(
                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                [teacher_name]
            );
            const teacher_id = teacherRows[0]?.teacher_id || null;

            const [result] = await connection.query(
                `INSERT INTO Courses (course_name, slug, description, level, price, teacher_id, image_url, seo_title, seo_description, seo_keywords)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    slug,
                    description || null,
                    level || null,
                    price !== undefined && price !== null && price !== "" ? Number(price) : null,
                    teacher_id,
                    image_url || null,
                    seo_title || null,
                    seo_description || null,
                    seo_keywords || null,
                ]
            );

            const course_id = result.insertId;

            if (Array.isArray(schedules)) {
                for (let s of schedules) {
                    if (s.class_day && s.start_time && s.end_time) {
                        let schedule_teacher_id = s.teacher_id || null;
                        if (s.teacher_name && !s.teacher_id) {
                            const [scheduleTeacherRows] = await connection.query(
                                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                                [s.teacher_name]
                            );
                            schedule_teacher_id = scheduleTeacherRows[0]?.teacher_id || null;
                        }

                        await connection.query(
                            `INSERT INTO Class_Schedule (course_id, teacher_id, class_day, start_time, end_time)
                             VALUES (?, ?, ?, ?, ?)`,
                            [course_id, schedule_teacher_id, s.class_day, s.start_time, s.end_time]
                        );
                    }
                }
            }

            await connection.commit(); // 🔧 Commit transaction
            return course_id;
        } catch (err) {
            await connection.rollback(); // 🔧 Rollback on error
            throw err;
        } finally {
            connection.release(); // 🔧 Release connection
        }
    }

    static async update(course_id, { title, description, level, price, teacher_name, image_url, schedules, slug, seo_title, seo_description, seo_keywords }) {
        if (!course_id) throw new Error("Course ID is required for update.");
        if (!title?.trim()) throw new Error("Course title is required");

        const connection = await db.getConnection(); // 🔧 Start transaction
        try {
            await connection.beginTransaction(); // 🔧 Begin transaction

            const [teacherRows] = await connection.query(
                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                [teacher_name]
            );
            const teacher_id = teacherRows[0]?.teacher_id || null;

            let oldImagePath = null;
            let updateImageClause = '';
            const params = [
                title,
                slug,
                description || null,
                level || null,
                price !== undefined && price !== null && price !== "" ? Number(price) : null,
                teacher_id,
                seo_title || null,
                seo_description || null,
                seo_keywords || null,
            ];

            if (image_url !== undefined) {
                const [old] = await connection.query(`SELECT image_url FROM Courses WHERE course_id = ?`, [course_id]);
                oldImagePath = old[0]?.image_url || null;
                
                updateImageClause = ', image_url = ?';
                params.push(image_url);
            }

            params.push(course_id);

            await connection.query(
                `UPDATE Courses
                 SET course_name = ?, slug = ?, description = ?, level = ?, price = ?, teacher_id = ?, seo_title = ?, seo_description = ?, seo_keywords = ? ${updateImageClause}
                 WHERE course_id = ?`,
                params
            );

            await connection.query(`DELETE FROM Class_Schedule WHERE course_id = ?`, [course_id]);

            if (Array.isArray(schedules)) {
                for (let s of schedules) {
                    if (s.class_day && s.start_time && s.end_time) {
                        let schedule_teacher_id = s.teacher_id || null;
                        if (s.teacher_name && !s.teacher_id) {
                            const [scheduleTeacherRows] = await connection.query(
                                `SELECT teacher_id FROM Teachers WHERE full_name = ?`,
                                [s.teacher_name]
                            );
                            schedule_teacher_id = scheduleTeacherRows[0]?.teacher_id || null;
                        }

                        await connection.query(
                            `INSERT INTO Class_Schedule (course_id, teacher_id, class_day, start_time, end_time)
                             VALUES (?, ?, ?, ?, ?)`,
                            [course_id, schedule_teacher_id, s.class_day, s.start_time, s.end_time]
                        );
                    }
                }
            }

            await connection.commit(); // 🔧 Commit transaction
            return oldImagePath;
        } catch (err) {
            await connection.rollback(); // 🔧 Rollback on error
            throw err;
        } finally {
            connection.release(); // 🔧 Release connection
        }
    }

    static async delete(course_id) {
        if (!course_id) throw new Error("Course ID is required for deletion.");
        
        const [rows] = await db.query(`SELECT image_url FROM Courses WHERE course_id = ?`, [course_id]);
        const imagePath = rows[0]?.image_url || null;

        await db.query(`DELETE FROM Class_Schedule WHERE course_id = ?`, [course_id]);
        
        await db.query(`DELETE FROM Courses WHERE course_id = ?`, [course_id]);

        return imagePath; 
    }
}

export default CoursesModel;

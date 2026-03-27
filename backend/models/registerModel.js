import db from "../config/db.js";

class RegisterModel {
    // --- Student CRUD Methods ---
    static async getAllStudents() {
        const [rows] = await db.query(`
            SELECT * FROM Students ORDER BY registered_date DESC
        `);
        return rows;
    }

    static async getStudentById(student_id) {
        const [rows] = await db.query(`
            SELECT * FROM Students WHERE student_id = ?
        `, [student_id]);
        return rows[0];
    }

    static async createStudent({ full_name, email, phone, address, age, occupation }, connection = db) {
        const [result] = await connection.query(`
            INSERT INTO Students (full_name, email, phone, address, age, occupation)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [full_name, email, phone, address, age, occupation]);
        return result.insertId;
    }

    static async updateStudent(student_id, { full_name, email, phone, address, age, occupation }) {
        await db.query(`
            UPDATE Students
            SET full_name = ?, email = ?, phone = ?, address = ?, age = ?, occupation = ?
            WHERE student_id = ?
        `, [full_name, email, phone, address, age, occupation, student_id]);
    }

    static async deleteStudent(student_id) {
        await db.query(`
            DELETE FROM Students WHERE student_id = ?
        `, [student_id]);
    }

    // --- Registration Methods ---
    static async getAllRegistrations() {
        const [rows] = await db.query(`
            SELECT 
                r.registration_id,
                r.registration_date,
                r.status,
                r.course_id,
                s.full_name AS student_name,
                s.email,
                s.phone,
                s.address,
                s.age,
                s.occupation,
                r.student_id,
                c.course_name
            FROM Registrations r
            JOIN Students s ON r.student_id = s.student_id
            JOIN Courses c ON r.course_id = c.course_id
            ORDER BY r.registration_date DESC
        `);
        return rows;
    }

    static async getRegistrationById(registration_id) {
        const [rows] = await db.query(`
            SELECT 
                r.registration_id, 
                r.registration_date, 
                r.status,
                r.course_id,
                s.full_name AS student_name, 
                s.email,
                s.phone,
                s.address,
                s.age,
                s.occupation,
                r.student_id,
                c.course_name,
                c.duration,
                c.price
            FROM Registrations r
            JOIN Students s ON r.student_id = s.student_id
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.registration_id = ?
        `, [registration_id]);
        return rows[0];
    }

    static async createRegistration(student_id, course_id, connection = db) {
        const [result] = await connection.query(`
            INSERT INTO Registrations (student_id, course_id, status)
            VALUES (?, ?, 'Unread')
        `, [student_id, course_id]);
        return result.insertId;
    }

    // ✅ Transaction-safe version
    static async createStudentAndRegistration(studentData, course_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const student_id = await this.createStudent(studentData, connection);
            const registration_id = await this.createRegistration(student_id, course_id, connection);

            await connection.commit();
            return { student_id, registration_id };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    static async updateRegistrationStatus(registration_id, status) {
        await db.query(`
            UPDATE Registrations
            SET status = ?
            WHERE registration_id = ?
        `, [status, registration_id]);
    }

    static async updateRegistration(registration_id, { student_id, course_id }) {
        await db.query(`
            UPDATE Registrations
            SET student_id = ?, course_id = ?
            WHERE registration_id = ?
        `, [student_id, course_id, registration_id]);
    }

    static async deleteRegistration(registration_id) {
        await db.query(`
            DELETE FROM Registrations WHERE registration_id = ?
        `, [registration_id]);
    }
}

export default RegisterModel;

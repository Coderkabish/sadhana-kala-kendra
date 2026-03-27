import RegisterModel from "../models/registerModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
const logDbError = (context, err) => {
    console.error(`❌ CRITICAL DB ERROR in ${context}:`, {
        message: err.message,
        code: err.code,
        sql: err.sql || 'N/A',
        stack: err.stack ? err.stack.split('\n')[0] + '...' : 'N/A'
    });
};

class RegisterController {
    static async getAllStudents(req, res, next) {
        try {
            const students = await RegisterModel.getAllStudents();
            res.json(students);
        } catch (err) {
            logDbError("getAllStudents", err);
            next(err);
        }
    }

    static async getStudentById(req, res, next) {
        try {
            const student = await RegisterModel.getStudentById(req.params.id);
            if (!student) return res.status(404).json({ message: "Student not found" });
            res.json(student);
        } catch (err) {
            logDbError("getStudentById", err);
            next(err);
        }
    }

    static async createStudent(req, res, next) {
        try {
            const id = await RegisterModel.createStudent(req.body);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "STUDENT",
                entity_id: id,
                ip: req.ip
            });
            res.status(201).json({ message: "Student created", id });
        } catch (err) {
            logDbError("createStudent", err);
            next(err);
        }
    }

    static async updateStudent(req, res, next) {
        try {
            await RegisterModel.updateStudent(req.params.id, req.body);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "STUDENT",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Student updated" });
        } catch (err) {
            logDbError("updateStudent", err);
            next(err);
        }
    }

    static async deleteStudent(req, res, next) {
        try {
            await RegisterModel.deleteStudent(req.params.id);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "STUDENT",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Student deleted" });
        } catch (err) {
            logDbError("deleteStudent", err);
            next(err);
        }
    }

    static async getAllRegistrations(req, res, next) {
        try {
            const registrations = await RegisterModel.getAllRegistrations();
            res.json(registrations);
        } catch (err) {
            logDbError("getAllRegistrations", err);
            next(err);
        }
    }

    static async getRegistrationById(req, res, next) {
        try {
            const registration = await RegisterModel.getRegistrationById(req.params.id);
            if (!registration) return res.status(404).json({ message: "Registration not found" });
            res.json(registration);
        } catch (err) {
            logDbError("getRegistrationById", err);
            next(err);
        }
    }

    // UPDATED: Now expects course_id in request body
    static async createRegistration(req, res, next) {
        try {
            const { student_id, course_id } = req.body;
            
            if (!student_id || !course_id) {
                return res.status(400).json({ 
                    message: "Missing required fields: student_id and course_id are mandatory." 
                });
            }
            
            const id = await RegisterModel.createRegistration(student_id, course_id);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "REGISTRATION",
                entity_id: id,
                ip: req.ip
            });
            res.status(201).json({ message: "Registration created", id });
        } catch (err) {
            logDbError("createRegistration", err);
            next(err);
        }
    }

    static async handlePublicRegistration(req, res, next) {
    const { full_name, email, phone, address, age, occupation, course_id } = req.body;

    if (!full_name || !email || !phone || !course_id) {
        return res.status(400).json({ 
            message: "Missing required fields: full_name, email, phone, and course_id are mandatory." 
        });
    }

    const studentData = { full_name, email, phone, address, age, occupation };

    try {
        const { student_id, registration_id } = await RegisterModel.createStudentAndRegistration(studentData, course_id);

        // Only log if an admin exists
        if (req.admin && req.admin.admin_id) {
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "REGISTRATION",
                entity_id: registration_id,
                ip: req.ip
            });
        }

        res.status(201).json({ 
            message: "Registration successful! We will soon reach out to you.", 
            student_id,
            registration_id
        });
    } catch (err) {
        logDbError("handlePublicRegistration", err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Use a Unique Email" });
        }

        next(err);
    }
}

    
    static async updateRegistrationStatus(req, res, next) {
        try {
            const { status } = req.body;
            const registration_id = req.params.id;
            
            if (!status || (status !== 'Read' && status !== 'Unread')) {
                return res.status(400).json({ message: "Invalid status provided. Must be 'Read' or 'Unread'." });
            }

            await RegisterModel.updateRegistrationStatus(registration_id, status);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "REGISTRATION",
                entity_id: registration_id,
                ip: req.ip
            });
            res.json({ message: `Registration ${registration_id} status updated to ${status}` });
        } catch (err) {
            logDbError("updateRegistrationStatus", err);
            next(err);
        }
    }

    // UPDATED: Now handles course_id in request body
    static async updateRegistration(req, res, next) {
        try {
            const { student_id, course_id } = req.body;
            
            // Optional: Add validation
            if (!student_id && !course_id) {
                return res.status(400).json({ 
                    message: "At least one field (student_id or course_id) must be provided." 
                });
            }
            
            await RegisterModel.updateRegistration(req.params.id, req.body);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "REGISTRATION",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Registration updated" });
        } catch (err) {
            logDbError("updateRegistration", err);
            next(err);
        }
    }

    static async deleteRegistration(req, res, next) {
        try {
            await RegisterModel.deleteRegistration(req.params.id);
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "REGISTRATION",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Registration deleted" });
        } catch (err) {
            logDbError("deleteRegistration", err);
            next(err);
        }
    }
}

export default RegisterController;
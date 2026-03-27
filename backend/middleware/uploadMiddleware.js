import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = "uploads";
// Removed MAX_FILE_SIZE_MB constant

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Simple storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Ensure filename is unique and preserves extension
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

// File filter: allows common image formats and MP4 video
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".mp4"];
    const allowedMimes = ["image/png", "image/jpeg", "image/webp", "video/mp4"];
    
    // Check MIME type
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
    
    // Check file extension
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Invalid file extension. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
    
    cb(null, true);
};

/**
 * Middleware export configured for general media uploads (single file).
 * It enforces storage and file type filtering. Size limits are increased to allow larger files.
 */
export const uploadMedia = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});
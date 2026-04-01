import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Fix __dirname issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory path
const uploadDir = path.join(__dirname, '../uploads/documents');

// Create folder if not exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// File filter — only PDFs allowed
const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// Configure multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10mb
    }
});

export default upload;
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File filter for images only
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

/**
 * File filter for documents
 */
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /pdf|msword|document|text/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files are allowed (pdf, doc, docx, txt)'));
  }
};

/**
 * Memory storage for processing before upload
 * Files are stored in memory as buffers
 */
const memoryStorage = multer.memoryStorage();

/**
 * Disk storage for temporary files (fallback)
 */
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Upload profile image (memory storage)
 */
export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
}).single('profileImage');

/**
 * Upload room images (multiple, memory storage)
 */
export const uploadRoomImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: imageFilter
}).array('roomImages', 10);

/**
 * Upload single room image (memory storage)
 */
export const uploadRoomImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: imageFilter
}).single('roomImage');

/**
 * Upload menu item image (memory storage)
 */
export const uploadMenuImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
}).single('menuImage');

/**
 * Upload bar item image (memory storage)
 */
export const uploadBarImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
}).single('barImage');

/**
 * Upload document (memory storage)
 */
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: documentFilter
}).single('document');

/**
 * Upload to disk storage (for large files that need disk processing)
 */
export const uploadToDisk = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: imageFilter
}).single('image');

/**
 * Upload multiple files to disk storage
 */
export const uploadMultipleToDisk = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10
  },
  fileFilter: imageFilter
}).array('images', 10);

/**
 * Generic single file upload (memory)
 */
export const uploadSingleFile = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: imageFilter
}).single('file');

/**
 * Generic multiple files upload (memory)
 */
export const uploadMultipleFiles = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10
  },
  fileFilter: imageFilter
}).array('files', 10);

/**
 * Error handler for multer
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size allowed is based on file type.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 10 files.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.'
      });
    }
  }
  
  if (err) {
    logger.error(`Multer error: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};

export default {
  uploadProfileImage,
  uploadRoomImages,
  uploadRoomImage,
  uploadMenuImage,
  uploadBarImage,
  uploadDocument,
  uploadToDisk,
  uploadMultipleToDisk,
  uploadSingleFile,
  uploadMultipleFiles,
  handleMulterError
};

const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
    const allowedDocTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check file type based on field name
    if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar') {
        const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
        if (isImage) {
            return cb(null, true);
        }
        return cb(new Error('Only image files are allowed for thumbnails and avatars'));
    }

    if (file.fieldname === 'video' || file.fieldname === 'previewVideo') {
        const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
        if (isVideo) {
            return cb(null, true);
        }
        return cb(new Error('Only video files are allowed'));
    }

    if (file.fieldname === 'resources' || file.fieldname.startsWith('resource_')) {
        const isDoc = allowedDocTypes.test(extname);
        if (isDoc) {
            return cb(null, true);
        }
        return cb(new Error('Only document files (PDF, DOC, PPT, XLS) are allowed for resources'));
    }

    // Allow lesson_ prefixed files (for course creation with multiple videos)
    if (file.fieldname.startsWith('lesson_')) {
        const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
        if (isVideo) {
            return cb(null, true);
        }
        return cb(new Error('Only video files are allowed'));
    }

    cb(null, true);
};

// Multer config
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
    },
    fileFilter: fileFilter
});

// Export different upload configurations
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);
exports.uploadAny = () => upload.any(); // NEW: For handling dynamic field names

// Error handler for multer
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 50MB'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field in file upload'
            });
        }
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next();
};
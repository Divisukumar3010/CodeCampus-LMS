const { body, param, validationResult } = require('express-validator');

// Validation middleware wrapper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Create course validation
const createCourseValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Course title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

    body('subtitle')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Subtitle cannot exceed 300 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Course description is required')
        .isLength({ min: 50, max: 5000 }).withMessage('Description must be between 50 and 5000 characters'),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),

    body('level')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'all']).withMessage('Invalid course level'),

    body('language')
        .optional()
        .trim()
        .notEmpty().withMessage('Language cannot be empty'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('discountPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discount price must be a positive number')
        .custom((value, { req }) => {
            if (value && parseFloat(value) >= parseFloat(req.body.price)) {
                throw new Error('Discount price must be less than the regular price');
            }
            return true;
        }),

    body('whatYouWillLearn')
        .optional()
        .isArray().withMessage('What you will learn must be an array'),

    body('requirements')
        .optional()
        .isArray().withMessage('Requirements must be an array'),

    body('targetAudience')
        .optional()
        .isArray().withMessage('Target audience must be an array'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),

    validate
];

// Update course validation
const updateCourseValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

    body('subtitle')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Subtitle cannot exceed 300 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 5000 }).withMessage('Description must be between 50 and 5000 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('discountPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),

    validate
];

// Add section validation
const addSectionValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Section title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Section title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Section description cannot exceed 500 characters'),

    validate
];

// Add lesson validation
const addLessonValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Lesson title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Lesson title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Lesson description cannot exceed 1000 characters'),

    body('isFree')
        .optional()
        .isBoolean().withMessage('isFree must be a boolean'),

    validate
];

// MongoDB ID validation
const validateMongoId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),

    validate
];

module.exports = {
    createCourseValidation,
    updateCourseValidation,
    addSectionValidation,
    addLessonValidation,
    validateMongoId,
};
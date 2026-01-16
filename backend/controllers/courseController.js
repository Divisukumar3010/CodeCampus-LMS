const Course = require('../models/Course');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Progress = require('../models/Progress');
const { uploadImage, uploadVideo, uploadDocument, deleteFile } = require('../config/cloudinary');

// @desc    Get all courses with filters and pagination
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build query
        const query = { status: 'published', isApproved: true };

        // Search - supports both 'search' and 'keyword' parameters
        const searchTerm = req.query.search || req.query.keyword;
        if (searchTerm && searchTerm.trim()) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { subtitle: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { tags: { $in: [new RegExp(searchTerm, 'i')] } }
            ];
        }

        // Category filter
        if (req.query.category && req.query.category.trim()) {
            query.category = req.query.category;
        }

        // Level filter
        if (req.query.level && req.query.level.trim() && req.query.level !== 'all') {
            query.level = req.query.level;
        }

        // Price filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = parseInt(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = parseInt(req.query.maxPrice);
            }
        }

        // Rating filter
        if (req.query.minRating) {
            query.averageRating = { $gte: parseFloat(req.query.minRating) };
        }

        // Trainer filter
        if (req.query.trainer && req.query.trainer.trim()) {
            query.trainer = req.query.trainer;
        }

        // Determine sort order - FIX: Make sure this works correctly
        let sort = { createdAt: -1 }; // default

        const sortParam = req.query.sort || 'newest';

        switch (sortParam) {
            case 'popular':
                sort = { enrollmentCount: -1 };
                break;
            case 'rating':
                sort = { averageRating: -1, totalReviews: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'price-low':
                sort = { price: 1 }; // Ascending - low to high
                break;
            case 'price-high':
                sort = { price: -1 }; // Descending - high to low
                break;
            default:
                sort = { createdAt: -1 };
        }

        console.log('Sort parameter:', sortParam);
        console.log('Sort object:', sort);
        console.log('Search Query:', JSON.stringify(query, null, 2));

        // Execute the query
        const courses = await Course.find(query)
            .populate('trainer', 'name avatar')
            .populate('category', 'name slug')
            .select('-sections')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(); // Add lean() for better performance

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            courses
        });
    } catch (error) {
        console.error('Error in getCourses:', error);
        next(error);
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('trainer', 'name avatar bio expertise')
            .populate('category', 'name slug')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name avatar' },
                options: { sort: { createdAt: -1 }, limit: 10 }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user has purchased the course
        let isPurchased = false;
        if (req.user) {
            const order = await Order.findOne({
                user: req.user.id,
                course: course._id,
                paymentStatus: 'completed'
            });
            isPurchased = !!order;
        }

        // If not purchased, hide lesson videos
        if (!isPurchased && req.user?.role !== 'admin') {
            course.sections.forEach(section => {
                section.lessons.forEach(lesson => {
                    if (!lesson.isFree) {
                        lesson.videoUrl = null;
                        lesson.resources = [];
                    }
                });
            });
        }

        res.status(200).json({
            success: true,
            course,
            isPurchased
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Trainer/Admin)
exports.createCourse = async (req, res, next) => {
    try {
        // Parse array fields from FormData
        const bodyData = { ...req.body };

        if (typeof bodyData.whatYouWillLearn === 'string') {
            bodyData.whatYouWillLearn = JSON.parse(bodyData.whatYouWillLearn);
        }
        if (typeof bodyData.requirements === 'string') {
            bodyData.requirements = JSON.parse(bodyData.requirements);
        }
        if (typeof bodyData.targetAudience === 'string') {
            bodyData.targetAudience = JSON.parse(bodyData.targetAudience);
        }
        if (typeof bodyData.tags === 'string') {
            bodyData.tags = JSON.parse(bodyData.tags);
        }

        // Parse sections
        let sections = [];
        if (typeof bodyData.sections === 'string') {
            sections = JSON.parse(bodyData.sections);
        } else if (Array.isArray(bodyData.sections)) {
            sections = bodyData.sections;
        }

        // Filter out empty strings from arrays
        if (Array.isArray(bodyData.whatYouWillLearn)) {
            bodyData.whatYouWillLearn = bodyData.whatYouWillLearn.filter(item => item && item.trim());
        }
        if (Array.isArray(bodyData.requirements)) {
            bodyData.requirements = bodyData.requirements.filter(item => item && item.trim());
        }
        if (Array.isArray(bodyData.targetAudience)) {
            bodyData.targetAudience = bodyData.targetAudience.filter(item => item && item.trim());
        }
        if (Array.isArray(bodyData.tags)) {
            bodyData.tags = bodyData.tags.filter(item => item && item.trim());
        }

        // Validate required fields
        if (!bodyData.title || !bodyData.description || !bodyData.category || !bodyData.price) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields: title, description, category, price'
            });
        }

        // Upload thumbnail if provided
        let thumbnailData = {};
        let thumbnailFile = null;

        // Debug: log all files received
        console.log('req.files keys:', req.files ? Object.keys(req.files) : 'no files');
        console.log('Full req.files:', req.files);

        // When using uploadAny(), req.files is an ARRAY, not an object
        // So we need to find the thumbnail by fieldname
        if (Array.isArray(req.files)) {
            thumbnailFile = req.files.find(file => file.fieldname === 'thumbnail');
        } else if (req.files && req.files['thumbnail']) {
            // Fallback for object format
            const thumbnailArr = req.files['thumbnail'];
            thumbnailFile = Array.isArray(thumbnailArr) ? thumbnailArr[0] : thumbnailArr;
        } else if (req.file) {
            thumbnailFile = req.file;
        }

        if (thumbnailFile && thumbnailFile.buffer) {
            try {
                console.log('Uploading thumbnail:', thumbnailFile.originalname);
                const result = await uploadImage(thumbnailFile.buffer, 'lms/thumbnails');
                thumbnailData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
                console.log('Thumbnail uploaded successfully:', thumbnailData);
            } catch (thumbnailError) {
                console.error('Error uploading thumbnail:', thumbnailError);
                return res.status(400).json({
                    success: false,
                    message: 'Error uploading thumbnail: ' + thumbnailError.message
                });
            }
        } else {
            console.error('No thumbnail file found');
            return res.status(400).json({
                success: false,
                message: 'Thumbnail is required'
            });
        }

        // Process sections with videos
        const processedSections = [];
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];
            const processedLessons = [];

            for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
                const lesson = section.lessons[lessonIndex];
                let videoData = {};

                // Check if video file exists in req.files
                const videoFieldName = `lesson_${sectionIndex}_${lessonIndex}`;
                let videoFile = null;

                // When using uploadAny(), req.files is an ARRAY
                if (Array.isArray(req.files)) {
                    videoFile = req.files.find(file => file.fieldname === videoFieldName);
                } else if (req.files && req.files[videoFieldName]) {
                    // Fallback for object format
                    const videoArr = req.files[videoFieldName];
                    videoFile = Array.isArray(videoArr) ? videoArr[0] : videoArr;
                }

                if (videoFile && videoFile.buffer) {
                    try {
                        console.log('Uploading video:', videoFieldName);
                        const videoResult = await uploadVideo(videoFile.buffer, 'lms/lessons');
                        videoData = {
                            public_id: videoResult.public_id,
                            url: videoResult.secure_url,
                            duration: videoResult.duration || 0
                        };
                    } catch (videoError) {
                        console.error(`Error uploading video for lesson ${lessonIndex}:`, videoError);
                        return res.status(400).json({
                            success: false,
                            message: `Error uploading video for lesson "${lesson.title}": ${videoError.message}`
                        });
                    }
                } else {
                    // Video is optional
                    videoData = {
                        url: null,
                        public_id: null,
                        duration: 0
                    };
                }

                processedLessons.push({
                    title: lesson.title || `Lesson ${lessonIndex + 1}`,
                    description: lesson.description || '',
                    videoUrl: videoData.url,
                    videoPublicId: videoData.public_id,
                    videoDuration: videoData.duration || 0,
                    isFree: lesson.isFree || false,
                    order: lessonIndex + 1,
                    resources: []
                });
            }

            processedSections.push({
                title: section.title || `Section ${sectionIndex + 1}`,
                description: section.description || '',
                order: sectionIndex + 1,
                lessons: processedLessons
            });
        }

        // Create course object
        const course = await Course.create({
            title: bodyData.title,
            subtitle: bodyData.subtitle || '',
            description: bodyData.description,
            category: bodyData.category,
            level: bodyData.level || 'beginner',
            language: bodyData.language || 'English',
            price: parseFloat(bodyData.price),
            discountPrice: bodyData.discountPrice ? parseFloat(bodyData.discountPrice) : null,
            thumbnail: thumbnailData,
            instructor: req.user.id,
            trainer: req.user.id,
            whatYouWillLearn: bodyData.whatYouWillLearn || [],
            requirements: bodyData.requirements || [],
            targetAudience: bodyData.targetAudience || [],
            tags: bodyData.tags || [],
            sections: processedSections,
            status: 'draft',
            isApproved: false
        });

        // Add course to user's created courses
        if (req.user.createdCourses) {
            req.user.createdCourses.push(course._id);
            await req.user.save();
        }

        // Update category course count
        if (course.category) {
            await Category.findByIdAndUpdate(course.category, {
                $inc: { courseCount: 1 }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating course'
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Trainer/Admin)
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        // ✅ If course was rejected, allow resubmission to admin
        if (course.status === 'rejected') {
            course.status = 'draft';       // back to admin review
            course.isApproved = false;
            course.rejectionReason = null;
            course.rejectedAt = null;
            course.rejectedBy = null;

            await course.save(); // IMPORTANT
        }


        // Parse JSON strings to objects
        if (req.body.sections && typeof req.body.sections === 'string') {
            try {
                req.body.sections = JSON.parse(req.body.sections);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid sections data format'
                });
            }
        }

        if (req.body.whatYouWillLearn && typeof req.body.whatYouWillLearn === 'string') {
            req.body.whatYouWillLearn = JSON.parse(req.body.whatYouWillLearn);
        }

        if (req.body.requirements && typeof req.body.requirements === 'string') {
            req.body.requirements = JSON.parse(req.body.requirements);
        }

        if (req.body.targetAudience && typeof req.body.targetAudience === 'string') {
            req.body.targetAudience = JSON.parse(req.body.targetAudience);
        }

        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = JSON.parse(req.body.tags);
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            // Import upload functions at top: const { uploadImage, uploadVideo, deleteFile } = require('../utils/cloudinary');

            // Process thumbnail
            const thumbnailFile = req.files.find(f => f.fieldname === 'thumbnail');
            if (thumbnailFile) {
                // Delete old thumbnail if exists
                if (course.thumbnail && course.thumbnail.public_id) {
                    await deleteFile(course.thumbnail.public_id, 'image');
                }

                const result = await uploadImage(thumbnailFile.buffer, 'lms/thumbnails');
                req.body.thumbnail = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            }

            // Process lesson videos
            if (req.body.sections && Array.isArray(req.body.sections)) {
                for (let sectionIndex = 0; sectionIndex < req.body.sections.length; sectionIndex++) {
                    const section = req.body.sections[sectionIndex];

                    if (section.lessons && Array.isArray(section.lessons)) {
                        for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
                            const lesson = section.lessons[lessonIndex];
                            const videoFieldName = `lesson_${sectionIndex}_${lessonIndex}`;
                            const videoFile = req.files.find(f => f.fieldname === videoFieldName);

                            if (videoFile) {
                                // Delete old video if exists
                                const existingLesson = course.sections?.[sectionIndex]?.lessons?.[lessonIndex];
                                if (existingLesson?.video?.public_id) {
                                    await deleteFile(existingLesson.video.public_id, 'video');
                                }

                                // Upload new video
                                const videoResult = await uploadVideo(videoFile.buffer, 'lms/videos');

                                lesson.video = {
                                    public_id: videoResult.public_id,
                                    url: videoResult.secure_url
                                };
                                lesson.videoUrl = videoResult.secure_url;
                                // Duration will be set to 0 - calculate it if you have ffmpeg available
                                lesson.videoDuration = 0;
                            } else if (!lesson.videoUrl) {
                                // If no video file and no existing videoUrl, set default
                                lesson.videoUrl = '';
                                lesson.videoDuration = 0;
                            }
                        }
                    }
                }
            }
        }

        // Ensure all sections and lessons have required fields
        if (req.body.sections && Array.isArray(req.body.sections)) {
            req.body.sections.forEach((section, sectionIndex) => {
                // Section MUST have order
                if (!section.order) {
                    section.order = sectionIndex + 1;
                }

                if (section.lessons && Array.isArray(section.lessons)) {
                    section.lessons.forEach((lesson, lessonIndex) => {
                        // Lesson MUST have order
                        if (!lesson.order) {
                            lesson.order = lessonIndex + 1;
                        }
                        // MUST have videoDuration
                        if (lesson.videoDuration === undefined || lesson.videoDuration === null) {
                            lesson.videoDuration = 0;
                        }
                        // MUST have videoUrl - never empty
                        if (!lesson.videoUrl || lesson.videoUrl === '') {
                            lesson.videoUrl = 'https://placeholder.com/video.mp4';
                        }
                    });
                }
            });
        }

        // Update the course - completely replace sections array
        course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                subtitle: req.body.subtitle,
                description: req.body.description,
                category: req.body.category,
                level: req.body.level,
                language: req.body.language,
                price: req.body.price,
                discountPrice: req.body.discountPrice || undefined,
                whatYouWillLearn: req.body.whatYouWillLearn,
                requirements: req.body.requirements,
                targetAudience: req.body.targetAudience,
                tags: req.body.tags,
                ...(req.body.thumbnail && { thumbnail: req.body.thumbnail }),
                sections: req.body.sections // Completely replace sections
            },
            {
                new: true,
                runValidators: false // Disable validation temporarily
            }
        );

        // Manually validate the course
        const validationError = course.validateSync();
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.message
            });
        }

        // Save to trigger pre-save hooks
        await course.save();

        // Populate and return
        course = await Course.findById(req.params.id)
            .populate('trainer', 'name email avatar');

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        });

    } catch (error) {
        console.error('Update course error:', error);
        next(error);
    }
};


// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Trainer/Admin)
exports.deleteCourse = async (req, res, next) => {
    try {
        // 🔐 ADMIN CHECK (HERE)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course'
            });
        }

        // Delete course files from Cloudinary
        if (course.thumbnail.public_id) {
            await deleteFile(course.thumbnail.public_id, 'image');
        }

        // Delete all lesson videos
        for (const section of course.sections) {
            for (const lesson of section.lessons) {
                if (lesson.videoPublicId) {
                    await deleteFile(lesson.videoPublicId, 'video');
                }
                // Delete resources
                for (const resource of lesson.resources) {
                    if (resource.publicId) {
                        await deleteFile(resource.publicId, 'raw');
                    }
                }
            }
        }

        await course.deleteOne();

        // Update category course count
        if (course.category) {
            await Category.findByIdAndUpdate(course.category, {
                $inc: { courseCount: -1 }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add section to course
// @route   POST /api/courses/:id/sections
// @access  Private (Trainer/Admin)
exports.addSection = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        const section = {
            title: req.body.title,
            description: req.body.description,
            order: course.sections.length + 1,
            lessons: []
        };

        course.sections.push(section);
        await course.save();

        res.status(201).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add lesson to section
// @route   POST /api/courses/:id/sections/:sectionId/lessons
// @access  Private (Trainer/Admin)
exports.addLesson = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        const section = course.sections.id(req.params.sectionId);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Upload video
        const videoResult = await uploadVideo(req.file.buffer, 'lms/lessons');

        const lesson = {
            title: req.body.title,
            description: req.body.description,
            videoUrl: videoResult.secure_url,
            videoPublicId: videoResult.public_id,
            videoDuration: videoResult.duration || 0,
            isFree: req.body.isFree || false,
            order: section.lessons.length + 1,
            resources: []
        };

        section.lessons.push(lesson);
        await course.save();

        res.status(201).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get enrolled students for a course
// @route   GET /api/courses/:id/students
// @access  Private (Trainer/Admin)
exports.getEnrolledStudents = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this information'
            });
        }

        const orders = await Order.find({
            course: req.params.id,
            paymentStatus: 'completed'
        })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            students: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending courses for admin approval
// @route   GET /api/courses/admin/pending
// @access  Private (Admin)
exports.getPendingCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ status: 'draft', isApproved: false })
            .populate('trainer', 'name email avatar')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a course
// @route   PUT /api/courses/:id/approve
// @access  Private (Admin)
exports.approveCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Update course status
        course.status = 'published';
        course.isApproved = true;
        course.approvedAt = new Date();
        course.approvedBy = req.user.id;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course approved successfully',
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject a course
// @route   PUT /api/courses/:id/reject
// @access  Private (Admin)
exports.rejectCourse = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Update course status
        course.status = 'rejected';
        course.isApproved = false;
        course.rejectionReason = reason || 'No reason provided';
        course.rejectedAt = new Date();
        course.rejectedBy = req.user.id;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course rejected successfully',
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get course approval status
// @route   GET /api/courses/:id/approval-status
// @access  Private
exports.getApprovalStatus = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .select('status isApproved approvedAt approvedBy rejectionReason');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            approval: {
                status: course.status,
                isApproved: course.isApproved,
                approvedAt: course.approvedAt,
                rejectionReason: course.rejectionReason
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourseContent = async (req, res, next) => {
    const course = await Course.findById(req.params.id)
        .populate({
            path: 'sections.lessons',
            select: '-videoUrl' // optional if you want to hide video URLs
        });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    res.status(200).json({
        success: true,
        course
    });
};

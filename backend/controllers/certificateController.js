const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { generateCertificate } = require('../utils/certificateGenerator');
const { sendCertificateEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Generate certificate for completed course
// @route   POST /api/certificates/generate/:courseId
// @access  Private (Student)
exports.generateCourseCertificate = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get progress
        const progress = await Progress.findOne({
            user: userId,
            course: courseId
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Check if course is completed
        if (progress.percentComplete < 100) {
            return res.status(400).json({
                success: false,
                message: 'You must complete the entire course to receive a certificate'
            });
        }

        // Check if exam exists and if student has passed
        const exam = await Exam.findOne({ course: courseId });
        if (!exam || !progress.exam || !progress.exam.hasPassed) {
            return res.status(400).json({
                success: false,
                message: 'You must take and pass the course qualification exam to receive your certificate'
            });
        }

        // Check if certificate already generated
        if (progress.certificate.isGenerated) {
            return res.status(200).json({
                success: true,
                message: 'Certificate already generated',
                certificate: {
                    certificateId: progress.certificate.certificateId,
                    certificateUrl: progress.certificate.certificateUrl,
                    generatedAt: progress.certificate.generatedAt
                }
            });
        }

        // Generate unique certificate ID
        const certificateId = `CC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

        // Get user details
        const user = await User.findById(userId);

        // Format completion date
        const completionDate = new Date(progress.completedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate certificate PDF
        const certificateData = await generateCertificate(
            user.name,
            course.title,
            completionDate,
            certificateId
        );

        // Update progress with certificate info
        progress.certificate = {
            isGenerated: true,
            generatedAt: new Date(),
            certificateId: certificateId,
            certificateUrl: certificateData.url
        };
        await progress.save();

        // Send certificate via SMTP email
        try {
            await sendCertificateEmail(user, course, {
                certificateId,
                filePath: certificateData.filePath
            });
            console.log(`✅ Certificate email sent to ${user.email} for course "${course.title}"`);
        } catch (emailErr) {
            console.error('⚠️ Failed to send certificate email:', emailErr);
            // Non-blocking error: allow response to succeed even if email delivery fails
        }

        res.status(200).json({
            success: true,
            message: 'Certificate generated successfully and emailed to your inbox!',
            certificate: {
                certificateId: certificateId,
                certificateUrl: certificateData.url,
                generatedAt: progress.certificate.generatedAt
            }
        });

    } catch (error) {
        console.error('Certificate generation error:', error);
        next(error);
    }
};

// @desc    Get certificate details
// @route   GET /api/certificates/:courseId
// @access  Private
exports.getCertificate = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const progress = await Progress.findOne({
            user: userId,
            course: courseId
        }).populate('course', 'title');

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Course progress not found'
            });
        }

        if (!progress.certificate.isGenerated) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not generated yet'
            });
        }

        res.status(200).json({
            success: true,
            certificate: {
                courseTitle: progress.course.title,
                certificateId: progress.certificate.certificateId,
                certificateUrl: progress.certificate.certificateUrl,
                generatedAt: progress.certificate.generatedAt,
                completedAt: progress.completedAt
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all user certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
exports.getMyCertificates = async (req, res, next) => {
    try {
        const certificates = await Progress.find({
            user: req.user.id,
            'certificate.isGenerated': true
        })
            .populate('course', 'title thumbnail')
            .sort({ 'certificate.generatedAt': -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            certificates: certificates.map(prog => ({
                courseId: prog.course._id,
                courseTitle: prog.course.title,
                courseThumbnail: prog.course.thumbnail,
                certificateId: prog.certificate.certificateId,
                certificateUrl: prog.certificate.certificateUrl,
                generatedAt: prog.certificate.generatedAt,
                completedAt: prog.completedAt
            }))
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Verify certificate authenticity
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
    try {
        const { certificateId } = req.params;

        const progress = await Progress.findOne({
            'certificate.certificateId': certificateId
        })
            .populate('user', 'name')
            .populate('course', 'title');

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.status(200).json({
            success: true,
            isValid: true,
            certificate: {
                studentName: progress.user.name,
                courseTitle: progress.course.title,
                completedAt: progress.completedAt,
                certificateId: progress.certificate.certificateId,
                generatedAt: progress.certificate.generatedAt
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Send / Resend certificate to user's email
// @route   POST /api/certificates/email/:courseId
// @access  Private
exports.emailCertificate = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const progress = await Progress.findOne({
            user: userId,
            course: courseId
        }).populate('course', 'title');

        if (!progress || !progress.certificate.isGenerated) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not generated yet'
            });
        }

        const user = await User.findById(userId);
        const path = require('path');
        const filePath = path.join(__dirname, `../public${progress.certificate.certificateUrl}`);

        await sendCertificateEmail(user, progress.course, {
            certificateId: progress.certificate.certificateId,
            filePath: filePath
        });

        res.status(200).json({
            success: true,
            message: `Certificate sent to ${user.email} successfully!`
        });
    } catch (error) {
        console.error('Error emailing certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send certificate email. Please verify SMTP settings.'
        });
    }
};
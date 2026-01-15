const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },

        // Completed lessons
        completedLessons: [
            {
                lessonId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Lesson',
                    required: true
                },
                completedAt: {
                    type: Date,
                    default: Date.now
                },
                watchTime: {
                    type: Number, // seconds
                    default: 0
                }
            }
        ],

        // Last accessed lesson
        lastAccessedLesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },

        // Progress percentage
        percentComplete: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        // Course completion flags
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },

        // Enrollment tracking
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },

        // Certificate details
        certificate: {
            isGenerated: {
                type: Boolean,
                default: false
            },
            generatedAt: {
                type: Date
            },
            certificateId: {
                type: String
            },
            certificateUrl: {
                type: String
            }
        }
    },
    {
        timestamps: true
    }
);

// 🔐 Ensure one progress per user per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ user: 1, lastAccessedAt: -1 });

/**
 * 📊 Calculate and update course progress
 */
progressSchema.methods.calculateProgress = async function () {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);

    if (!course) return;

    const totalLessons = course.totalLessons || 0;
    const completedCount = this.completedLessons.length;

    this.percentComplete =
        totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

    // Ensure percent never exceeds 100
    if (this.percentComplete >= 100) {
        this.percentComplete = 100;

        // Mark course as completed
        if (!this.completedAt) {
            this.completedAt = new Date();
        }

        // 🔑 UNLOCK CERTIFICATE
        if (!this.certificateIssued) {
            this.certificateIssued = true;
        }
    }

    await this.save();
};


module.exports = mongoose.model('Progress', progressSchema);

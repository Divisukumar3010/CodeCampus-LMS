const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    completedLessons: [{
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        watchTime: {
            type: Number, // in seconds
            default: 0
        }
    }],
    currentLesson: {
        type: mongoose.Schema.Types.ObjectId
    },
    percentComplete: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateUrl: String
}, {
    timestamps: true
});

// One progress record per user per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ user: 1, lastAccessedAt: -1 });

// Calculate completion percentage
progressSchema.methods.calculateProgress = async function () {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);

    if (!course) return;

    const totalLessons = course.totalLessons;
    const completedCount = this.completedLessons.length;

    this.percentComplete = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    if (this.percentComplete === 100 && !this.completedAt) {
        this.completedAt = new Date();
    }

    await this.save();
};

module.exports = mongoose.model('Progress', progressSchema);
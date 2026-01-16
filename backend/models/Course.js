const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    videoDuration: {
        type: Number, // in seconds
        required: true
    },
    videoPublicId: String,
    resources: [{
        type: {
            type: String,
            enum: ['pdf', 'doc', 'video', 'link', 'other'],
            default: 'pdf'
        },
        title: String,
        url: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isFree: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        required: true
    }
});

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    order: {
        type: Number,
        required: true
    },
    lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [300, 'Subtitle cannot exceed 300 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'beginner'
    },
    language: {
        type: String,
        default: 'English'
    },
    thumbnail: {
        public_id: String,
        url: {
            type: String,
            required: true
        }
    },
    previewVideo: {
        url: String,
        publicId: String
    },
    price: {
        type: Number,
        required: [true, 'Please provide a course price'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative']
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sections: [sectionSchema],
    whatYouWillLearn: [{
        type: String
    }],
    requirements: [{
        type: String
    }],
    targetAudience: [{
        type: String
    }],
    totalDuration: {
        type: Number, // in seconds
        default: 0
    },
    totalLessons: {
        type: Number,
        default: 0
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'suspended', 'rejected'],
        default: 'draft'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: String,
        trim: true
    }],
    revenue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
courseSchema.index({
    title: 'text',
    subtitle: 'text',
    description: 'text',
    tags: 'text'
});

// Virtual for reviews
courseSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'course',
    justOne: false
});

// Calculate total duration and lessons before saving
courseSchema.pre('save', function (next) {
    let totalDuration = 0;
    let totalLessons = 0;

    this.sections.forEach(section => {
        section.lessons.forEach(lesson => {
            totalDuration += lesson.videoDuration;
            totalLessons += 1;
        });
    });

    this.totalDuration = totalDuration;
    this.totalLessons = totalLessons;
    next();
});

// Indexes for search and performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ trainer: 1 });
courseSchema.index({ averageRating: -1, enrollmentCount: -1 });
courseSchema.index({ price: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ isApproved: 1, status: 1 });

module.exports = mongoose.model('Course', courseSchema);
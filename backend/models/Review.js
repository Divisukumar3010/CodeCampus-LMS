const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// One review per user per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });

// Update course rating after review
reviewSchema.statics.calculateAverageRating = async function (courseId) {
    const stats = await this.aggregate([
        {
            $match: { course: courseId }
        },
        {
            $group: {
                _id: '$course',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.model('Course').findByIdAndUpdate(courseId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            totalReviews: stats[0].totalReviews
        });
    } else {
        await this.model('Course').findByIdAndUpdate(courseId, {
            averageRating: 0,
            totalReviews: 0
        });
    }
};

// Call after save
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.course);
});

// Call after remove
reviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);
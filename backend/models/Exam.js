const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    }
});

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [1000, 'Question cannot exceed 1000 characters']
    },
    options: {
        type: [optionSchema],
        validate: {
            validator: function (opts) {
                return opts.length >= 2 && opts.length <= 6;
            },
            message: 'Each question must have between 2 and 6 options'
        }
    },
    explanation: {
        type: String,
        trim: true,
        maxlength: [500, 'Explanation cannot exceed 500 characters']
    },
    points: {
        type: Number,
        default: 1,
        min: 1
    },
    order: {
        type: Number,
        required: true
    }
});

const examSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    questions: [questionSchema],
    totalQuestions: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    passingScore: {
        type: Number,
        required: true,
        default: 60,
        min: 1,
        max: 100
    },
    duration: {
        type: Number,
        required: true,
        default: 30,
        min: 5,
        max: 180
    },
    maxAttempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Pre-save: calculate totalQuestions and totalPoints
examSchema.pre('save', function (next) {
    this.totalQuestions = this.questions.length;
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
    next();
});

examSchema.index({ course: 1 });
examSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Exam', examSchema);

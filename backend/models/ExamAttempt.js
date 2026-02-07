const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
});

const examAttemptSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
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
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    isPassed: {
        type: Boolean,
        default: false
    },
    attemptNumber: {
        type: Number,
        required: true,
        default: 1
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in_progress', 'submitted', 'timed_out'],
        default: 'in_progress'
    }
}, {
    timestamps: true
});

examAttemptSchema.index({ exam: 1, user: 1 });
examAttemptSchema.index({ user: 1, course: 1 });
examAttemptSchema.index({ user: 1, course: 1, isPassed: 1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);

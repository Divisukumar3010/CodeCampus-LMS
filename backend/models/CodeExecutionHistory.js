const mongoose = require('mongoose');

const codeExecutionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allows guest/anonymous saves as well
        index: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        maxlength: 100000
    },
    input: {
        type: String,
        default: '',
        maxlength: 10000
    },
    output: {
        type: String,
        default: '',
        maxlength: 100000
    },
    error: {
        type: String,
        default: '',
        maxlength: 100000
    },
    executionTime: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['success', 'error', 'timeout'],
        default: 'success'
    }
}, {
    timestamps: true
});

codeExecutionHistorySchema.index({ user: 1, createdAt: -1 });
codeExecutionHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('CodeExecutionHistory', codeExecutionHistorySchema);

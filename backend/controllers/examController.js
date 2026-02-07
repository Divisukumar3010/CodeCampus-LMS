const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Order = require('../models/Order');

// @desc    Create exam for a course
// @route   POST /api/exams/:courseId
// @access  Private (Trainer/Admin)
exports.createExam = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Verify ownership
        if (course.trainer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create exam for this course'
            });
        }

        // Check if exam already exists
        const existingExam = await Exam.findOne({ course: courseId });
        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: 'An exam already exists for this course. Use update instead.'
            });
        }

        const { title, description, questions, passingScore, duration, maxAttempts } = req.body;

        // Validate questions
        if (!questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one question is required'
            });
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText || q.questionText.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} text is required`
                });
            }
            if (!q.options || q.options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have at least 2 options`
                });
            }
            const correctCount = q.options.filter(o => o.isCorrect).length;
            if (correctCount !== 1) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have exactly one correct answer`
                });
            }
            // Validate option text
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j].text || q.options[j].text.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1}, Option ${j + 1} text is required`
                    });
                }
            }
        }

        // Add order to questions
        const orderedQuestions = questions.map((q, index) => ({
            ...q,
            order: q.order || index + 1
        }));

        const exam = await Exam.create({
            course: courseId,
            title: title || `${course.title} - Final Exam`,
            description,
            questions: orderedQuestions,
            passingScore: passingScore || 60,
            duration: duration || 30,
            maxAttempts: maxAttempts || 3,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            exam
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update exam for a course
// @route   PUT /api/exams/:courseId
// @access  Private (Trainer/Admin)
exports.updateExam = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const exam = await Exam.findOne({ course: courseId });
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'No exam found for this course'
            });
        }

        // Verify ownership
        if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this exam'
            });
        }

        const { title, description, questions, passingScore, duration, maxAttempts } = req.body;

        // Validate questions if provided
        if (questions) {
            if (questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one question is required'
                });
            }

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.questionText || q.questionText.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1} text is required`
                    });
                }
                if (!q.options || q.options.length < 2) {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1} must have at least 2 options`
                    });
                }
                const correctCount = q.options.filter(o => o.isCorrect).length;
                if (correctCount !== 1) {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1} must have exactly one correct answer`
                    });
                }
                for (let j = 0; j < q.options.length; j++) {
                    if (!q.options[j].text || q.options[j].text.trim() === '') {
                        return res.status(400).json({
                            success: false,
                            message: `Question ${i + 1}, Option ${j + 1} text is required`
                        });
                    }
                }
            }

            exam.questions = questions.map((q, index) => ({
                ...q,
                order: q.order || index + 1
            }));
        }

        if (title !== undefined) exam.title = title;
        if (description !== undefined) exam.description = description;
        if (passingScore !== undefined) exam.passingScore = passingScore;
        if (duration !== undefined) exam.duration = duration;
        if (maxAttempts !== undefined) exam.maxAttempts = maxAttempts;

        await exam.save();

        res.status(200).json({
            success: true,
            message: 'Exam updated successfully',
            exam
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get exam for a course
// @route   GET /api/exams/:courseId
// @access  Private
exports.getExam = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const exam = await Exam.findOne({ course: courseId });
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'No exam found for this course'
            });
        }

        // Check if requester is the trainer/admin or a student
        const course = await Course.findById(courseId);
        const isOwner = course && (course.trainer.toString() === req.user.id || req.user.role === 'admin');

        let examData;
        if (isOwner) {
            // Trainer/Admin gets full exam with answers
            examData = exam.toObject();
        } else {
            // Student gets exam info without answers
            examData = {
                _id: exam._id,
                course: exam.course,
                title: exam.title,
                description: exam.description,
                totalQuestions: exam.totalQuestions,
                totalPoints: exam.totalPoints,
                passingScore: exam.passingScore,
                duration: exam.duration,
                maxAttempts: exam.maxAttempts,
                isActive: exam.isActive
            };
        }

        // Get attempt info for the requesting user
        const attemptCount = await ExamAttempt.countDocuments({
            exam: exam._id,
            user: req.user.id
        });
        const bestAttempt = await ExamAttempt.findOne({
            exam: exam._id,
            user: req.user.id,
            status: 'submitted'
        }).sort({ score: -1 });

        const progress = await Progress.findOne({
            user: req.user.id,
            course: courseId
        });

        res.status(200).json({
            success: true,
            exam: examData,
            attemptInfo: {
                totalAttempts: attemptCount,
                bestScore: bestAttempt?.score || 0,
                hasPassed: progress?.exam?.hasPassed || false,
                remainingAttempts: Math.max(0, exam.maxAttempts - attemptCount)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete exam for a course
// @route   DELETE /api/exams/:courseId
// @access  Private (Trainer/Admin)
exports.deleteExam = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const exam = await Exam.findOne({ course: courseId });
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'No exam found for this course'
            });
        }

        // Verify ownership
        if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this exam'
            });
        }

        // Delete all attempts
        await ExamAttempt.deleteMany({ exam: exam._id });

        // Reset exam status on all progress records for this course
        await Progress.updateMany(
            { course: courseId },
            {
                $set: {
                    'exam.hasPassed': false,
                    'exam.bestScore': 0,
                    'exam.totalAttempts': 0,
                    'exam.passedAt': null,
                    'exam.lastAttemptAt': null
                }
            }
        );

        await Exam.findByIdAndDelete(exam._id);

        res.status(200).json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Start an exam attempt
// @route   POST /api/exams/:courseId/start
// @access  Private (Student)
exports.startAttempt = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check enrollment
        const order = await Order.findOne({
            user: userId,
            course: courseId,
            paymentStatus: 'completed'
        });
        if (!order) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to take the exam'
            });
        }

        // Check all lessons completed
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress || !progress.isCompleted) {
            return res.status(400).json({
                success: false,
                message: 'You must complete all lessons before taking the exam'
            });
        }

        // Get exam
        const exam = await Exam.findOne({ course: courseId });
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'No exam found for this course'
            });
        }

        if (!exam.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This exam is currently not available'
            });
        }

        // Check for existing in_progress attempt (allow resume)
        const existingAttempt = await ExamAttempt.findOne({
            exam: exam._id,
            user: userId,
            status: 'in_progress'
        });

        if (existingAttempt) {
            // Check if it has timed out
            const elapsedMinutes = (Date.now() - existingAttempt.startedAt.getTime()) / 60000;
            if (elapsedMinutes > exam.duration + 1) {
                existingAttempt.status = 'timed_out';
                existingAttempt.submittedAt = new Date();
                await existingAttempt.save();
            } else {
                // Return existing attempt for resume
                const sanitizedQuestions = exam.questions.map(q => ({
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options.map(o => ({
                        _id: o._id,
                        text: o.text
                    })),
                    points: q.points,
                    order: q.order
                }));

                return res.status(200).json({
                    success: true,
                    message: 'Resuming existing attempt',
                    attempt: {
                        _id: existingAttempt._id,
                        startedAt: existingAttempt.startedAt,
                        attemptNumber: existingAttempt.attemptNumber,
                        answers: existingAttempt.answers
                    },
                    questions: sanitizedQuestions,
                    duration: exam.duration,
                    totalPoints: exam.totalPoints
                });
            }
        }

        // Check max attempts
        const attemptCount = await ExamAttempt.countDocuments({
            exam: exam._id,
            user: userId
        });

        if (attemptCount >= exam.maxAttempts) {
            return res.status(400).json({
                success: false,
                message: `Maximum attempts (${exam.maxAttempts}) reached for this exam`
            });
        }

        // Create new attempt
        const attempt = await ExamAttempt.create({
            exam: exam._id,
            user: userId,
            course: courseId,
            attemptNumber: attemptCount + 1,
            startedAt: new Date(),
            status: 'in_progress',
            totalPoints: exam.totalPoints
        });

        // Return questions without correct answers
        const sanitizedQuestions = exam.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options.map(o => ({
                _id: o._id,
                text: o.text
            })),
            points: q.points,
            order: q.order
        }));

        res.status(201).json({
            success: true,
            attempt: {
                _id: attempt._id,
                startedAt: attempt.startedAt,
                attemptNumber: attempt.attemptNumber
            },
            questions: sanitizedQuestions,
            duration: exam.duration,
            totalPoints: exam.totalPoints
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit exam attempt
// @route   POST /api/exams/:courseId/submit/:attemptId
// @access  Private (Student)
exports.submitAttempt = async (req, res, next) => {
    try {
        const { courseId, attemptId } = req.params;
        const userId = req.user.id;
        const { answers } = req.body;

        // Find the attempt
        const attempt = await ExamAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found'
            });
        }

        // Verify ownership
        if (attempt.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check status
        if (attempt.status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'This attempt has already been submitted'
            });
        }

        // Get exam
        const exam = await Exam.findById(attempt.exam);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check time limit (1 min grace period)
        const elapsedMinutes = (Date.now() - attempt.startedAt.getTime()) / 60000;
        if (elapsedMinutes > exam.duration + 1) {
            attempt.status = 'timed_out';
            attempt.submittedAt = new Date();
            await attempt.save();
            return res.status(400).json({
                success: false,
                message: 'Time limit exceeded. Your attempt has been timed out.'
            });
        }

        // Grade the answers
        let pointsEarned = 0;
        const gradedAnswers = [];

        if (answers && Array.isArray(answers)) {
            for (const ans of answers) {
                const question = exam.questions.id(ans.questionId);
                if (!question) continue;

                const selectedOption = question.options.id(ans.selectedOptionId);
                if (!selectedOption) continue;

                const isCorrect = selectedOption.isCorrect;
                const points = isCorrect ? question.points : 0;
                pointsEarned += points;

                gradedAnswers.push({
                    question: question._id,
                    selectedOption: selectedOption._id,
                    isCorrect,
                    pointsEarned: points
                });
            }
        }

        const score = exam.totalPoints > 0
            ? Math.round((pointsEarned / exam.totalPoints) * 100)
            : 0;
        const isPassed = score >= exam.passingScore;

        // Update attempt
        attempt.answers = gradedAnswers;
        attempt.score = score;
        attempt.pointsEarned = pointsEarned;
        attempt.totalPoints = exam.totalPoints;
        attempt.isPassed = isPassed;
        attempt.status = 'submitted';
        attempt.submittedAt = new Date();
        await attempt.save();

        // Update progress
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (progress) {
            progress.exam.totalAttempts = (progress.exam.totalAttempts || 0) + 1;
            progress.exam.lastAttemptAt = new Date();
            if (score > (progress.exam.bestScore || 0)) {
                progress.exam.bestScore = score;
            }
            if (isPassed && !progress.exam.hasPassed) {
                progress.exam.hasPassed = true;
                progress.exam.passedAt = new Date();
            }
            await progress.save();
        }

        // Build result with question details
        const resultDetails = exam.questions.map(q => {
            const answer = gradedAnswers.find(a => a.question.toString() === q._id.toString());
            return {
                questionText: q.questionText,
                options: q.options.map(o => ({
                    _id: o._id,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    isSelected: answer ? answer.selectedOption.toString() === o._id.toString() : false
                })),
                explanation: q.explanation,
                points: q.points,
                isCorrect: answer ? answer.isCorrect : false,
                pointsEarned: answer ? answer.pointsEarned : 0
            };
        });

        res.status(200).json({
            success: true,
            result: {
                score,
                pointsEarned,
                totalPoints: exam.totalPoints,
                isPassed,
                passingScore: exam.passingScore,
                attemptNumber: attempt.attemptNumber,
                questions: resultDetails
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get attempt result
// @route   GET /api/exams/:courseId/attempts/:attemptId
// @access  Private
exports.getAttemptResult = async (req, res, next) => {
    try {
        const { attemptId } = req.params;

        const attempt = await ExamAttempt.findById(attemptId)
            .populate('exam');

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found'
            });
        }

        // Verify ownership or trainer/admin
        const course = await Course.findById(attempt.course);
        const isOwner = attempt.user.toString() === req.user.id;
        const isTrainer = course && course.trainer.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isTrainer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this attempt'
            });
        }

        res.status(200).json({
            success: true,
            attempt
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all attempts for a course by current user
// @route   GET /api/exams/:courseId/attempts
// @access  Private
exports.getMyAttempts = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const attempts = await ExamAttempt.find({
            user: req.user.id,
            course: courseId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: attempts.length,
            attempts
        });
    } catch (error) {
        next(error);
    }
};

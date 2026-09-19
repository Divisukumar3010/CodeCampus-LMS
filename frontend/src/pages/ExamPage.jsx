import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiChevronLeft, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { examAPI } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import ExamResult from '../components/exam/ExamResult';
import toast from 'react-hot-toast';

const ExamPage = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useContext(ThemeContext);

    const [examInfo, setExamInfo] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [examStarted, setExamStarted] = useState(false);
    const [attemptInfo, setAttemptInfo] = useState(null);
    const [error, setError] = useState('');

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const durationRef = useRef(0);

    // Fetch exam info on mount
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await examAPI.getExam(courseId);
                setExamInfo(res.data.exam);
                setAttemptInfo(res.data.attemptInfo);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load exam');
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [courseId]);

    // Timer logic
    useEffect(() => {
        if (!examStarted || !startTimeRef.current) return;

        timerRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining = Math.max(0, durationRef.current * 60 - elapsed);
            setTimeRemaining(Math.ceil(remaining));

            if (remaining <= 0) {
                clearInterval(timerRef.current);
                handleSubmit(true);
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [examStarted]);

    const startExam = async () => {
        try {
            setLoading(true);
            const res = await examAPI.startAttempt(courseId);
            setAttempt(res.data.attempt);
            setQuestions(res.data.questions);
            durationRef.current = res.data.duration;
            startTimeRef.current = new Date(res.data.attempt.startedAt).getTime();
            setTimeRemaining(res.data.duration * 60);

            // Restore previous answers if resuming
            if (res.data.attempt.answers && res.data.attempt.answers.length > 0) {
                const restored = {};
                res.data.attempt.answers.forEach(a => {
                    restored[a.question] = a.selectedOption;
                });
                setAnswers(restored);
            }

            setExamStarted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start exam');
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = useCallback(async (autoSubmit = false) => {
        if (submitting) return;
        setSubmitting(true);
        setShowConfirm(false);

        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
                questionId,
                selectedOptionId
            }));

            const res = await examAPI.submitAttempt(courseId, attempt._id, { answers: formattedAnswers });
            setResult(res.data.result);
            setExamStarted(false);

            if (autoSubmit) {
                toast('Time is up! Your exam has been auto-submitted.', { icon: '⏰' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit exam');
            setSubmitting(false);
        }
    }, [answers, attempt, courseId, submitting]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const isTimeLow = timeRemaining > 0 && timeRemaining <= 60;
    const isTimeWarning = timeRemaining > 60 && timeRemaining <= 300;

    // Loading state
    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div className="text-center p-8">
                    <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cannot Load Exam</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(`/course/view/${courseId}`)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    // Result view
    if (result) {
        return (
            <div className={`min-h-screen py-6 px-4 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <ExamResult
                    result={result}
                    examTitle={examInfo?.title || 'Course Exam'}
                    attemptsRemaining={
                        (examInfo?.maxAttempts || 3) - (result.attemptNumber || (attemptInfo?.totalAttempts || 0) + 1)
                    }
                    onRetry={() => {
                        setResult(null);
                        setAnswers({});
                        setSubmitting(false);
                        startExam();
                    }}
                    onBackToCourse={() => navigate(`/course/view/${courseId}`)}
                />
            </div>
        );
    }

    // Pre-exam info screen
    if (!examStarted) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div className={`max-w-lg w-full rounded-2xl shadow-xl p-6 sm:p-8 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                    <button
                        onClick={() => navigate(`/course/view/${courseId}`)}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition"
                    >
                        <FiChevronLeft size={16} /> Back to Course
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FiClock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {examInfo?.title || 'Course Exam'}
                        </h1>
                        {examInfo?.description && (
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{examInfo.description}</p>
                        )}

                        <div className={`rounded-xl p-4 mb-6 space-y-3 text-left ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Questions</span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{examInfo?.totalQuestions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{examInfo?.duration} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Passing Score</span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{examInfo?.passingScore}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Attempts</span>
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {attemptInfo?.totalAttempts || 0} / {examInfo?.maxAttempts}
                                </span>
                            </div>
                            {attemptInfo?.bestScore > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Best Score</span>
                                    <span className="font-semibold text-primary-600">{attemptInfo.bestScore}%</span>
                                </div>
                            )}
                        </div>

                        <div className={`rounded-xl p-4 mb-6 text-left text-sm ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                            <div className="flex items-start gap-2">
                                <FiAlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                                <div className="text-yellow-700 dark:text-yellow-300">
                                    <p className="font-medium mb-1">Important:</p>
                                    <ul className="list-disc ml-4 space-y-1 text-xs">
                                        <li>Once started, the timer cannot be paused</li>
                                        <li>The exam will auto-submit when time runs out</li>
                                        <li>You can navigate between questions freely</li>
                                        <li>Make sure you have a stable internet connection</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {(attemptInfo?.remainingAttempts ?? examInfo?.maxAttempts) > 0 ? (
                            <button
                                onClick={startExam}
                                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition text-lg"
                            >
                                Start Exam
                            </button>
                        ) : (
                            <p className="text-red-500 dark:text-red-400 font-medium">
                                No attempts remaining
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Exam in progress
    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
            {/* Top Bar */}
            <div className={`sticky top-0 z-40 border-b shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className={`text-sm sm:text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {examInfo?.title || 'Course Exam'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {answeredCount}/{totalQuestions} answered
                        </p>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${isTimeLow
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                        : isTimeWarning
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : isDarkMode
                                ? 'bg-slate-800 text-white'
                                : 'bg-gray-100 text-gray-900'
                        }`}>
                        <FiClock size={18} />
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                {/* Question progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all"
                        style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                    />
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* Questions Column */}
                <div className="flex-1 space-y-4">
                    {questions.map((q, index) => (
                        <div
                            key={q._id}
                            id={`question-${index}`}
                            className={`rounded-xl p-4 sm:p-6 border transition ${answers[q._id]
                                ? isDarkMode
                                    ? 'bg-slate-900 border-primary-800'
                                    : 'bg-white border-primary-200'
                                : isDarkMode
                                    ? 'bg-slate-900 border-slate-800'
                                    : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answers[q._id]
                                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {q.questionText}
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{q.points} point{q.points > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            <div className="ml-11 space-y-2">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt._id}
                                        type="button"
                                        onClick={() => selectAnswer(q._id, opt._id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${answers[q._id] === opt._id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                                            : isDarkMode
                                                ? 'border-slate-700 hover:border-slate-600 text-gray-300 hover:bg-slate-800'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${answers[q._id] === opt._id
                                                ? 'border-primary-500 bg-primary-500'
                                                : isDarkMode
                                                    ? 'border-slate-600'
                                                    : 'border-gray-300'
                                                }`}>
                                                {answers[q._id] === opt._id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            {opt.text}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="pt-4 pb-8">
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition text-lg disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Exam'}
                        </button>
                    </div>
                </div>

                {/* Sidebar - Question Navigation */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className={`sticky top-20 rounded-xl p-4 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Questions
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, index) => (
                                <button
                                    key={q._id}
                                    onClick={() => {
                                        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition ${answers[q._id]
                                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                                        : isDarkMode
                                            ? 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
                                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-800" />
                                Answered ({answeredCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-200'}`} />
                                Unanswered ({totalQuestions - answeredCount})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Question Navigation Dock */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md">
                <div className={`border-t px-3 py-2.5 shadow-lg ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200'}`}>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-thin max-w-full justify-start sm:justify-center">
                        {questions.map((q, index) => (
                            <button
                                key={q._id}
                                onClick={() => {
                                    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                aria-label={`Jump to question ${index + 1}`}
                                className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold transition active:scale-95 ${answers[q._id]
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-gray-300 border border-slate-700'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className={`max-w-sm w-full rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className="text-center">
                            {answeredCount < totalQuestions ? (
                                <FiAlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            ) : (
                                <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            )}
                            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Submit Exam?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                You have answered <span className="font-bold">{answeredCount}</span> out of <span className="font-bold">{totalQuestions}</span> questions.
                            </p>
                            {answeredCount < totalQuestions && (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                                    {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's are' : ' is'} unanswered!
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={`flex-1 py-3 rounded-xl font-semibold transition ${isDarkMode
                                    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl font-semibold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;

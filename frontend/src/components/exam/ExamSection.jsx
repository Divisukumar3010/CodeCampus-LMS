import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiFileText, FiClock, FiAward } from 'react-icons/fi';
import { examAPI } from '../../services/api';

const ExamSection = ({ courseId, progress, isCompleted, exam }) => {
    const navigate = useNavigate();
    const [attemptInfo, setAttemptInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttemptInfo = async () => {
            try {
                const res = await examAPI.getExam(courseId);
                setAttemptInfo(res.data.attemptInfo);
            } catch {
                // Silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchAttemptInfo();
    }, [courseId]);

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    const hasPassed = progress?.exam?.hasPassed || attemptInfo?.hasPassed;
    const bestScore = progress?.exam?.bestScore || attemptInfo?.bestScore || 0;
    const totalAttempts = attemptInfo?.totalAttempts || 0;
    const remainingAttempts = attemptInfo?.remainingAttempts ?? exam?.maxAttempts ?? 3;

    // Exam locked - lessons not complete
    if (!isCompleted) {
        return (
            <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <FiLock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Exam Locked
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Complete all lessons to unlock the exam
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress?.percentComplete || 0}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round(progress?.percentComplete || 0)}% complete
                </p>
            </div>
        );
    }

    // Exam passed
    if (hasPassed) {
        return (
            <div className="text-center py-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Exam Passed!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Score: <span className="font-bold text-green-600 dark:text-green-400">{bestScore}%</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can now claim your certificate below
                </p>
            </div>
        );
    }

    // Exam available - can take it
    return (
        <div className="text-center py-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FiFileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                {exam.title || 'Course Exam'}
            </h3>
            {exam.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {exam.description}
                </p>
            )}
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                    <FiFileText size={12} /> {exam.totalQuestions} questions
                </span>
                <span className="flex items-center gap-1">
                    <FiClock size={12} /> {exam.duration} min
                </span>
                <span className="flex items-center gap-1">
                    <FiAward size={12} /> Pass: {exam.passingScore}%
                </span>
            </div>

            {totalAttempts > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Best score: <span className="font-semibold">{bestScore}%</span> | Attempts: {totalAttempts}/{exam.maxAttempts}
                </p>
            )}

            {remainingAttempts > 0 ? (
                <button
                    onClick={() => navigate(`/course/${courseId}/exam`)}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
                >
                    {totalAttempts > 0 ? 'Retry Exam' : 'Take Exam'}
                </button>
            ) : (
                <div className="text-sm text-red-500 dark:text-red-400 font-medium">
                    No attempts remaining
                </div>
            )}
        </div>
    );
};

export default ExamSection;

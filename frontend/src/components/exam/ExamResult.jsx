import { FiCheckCircle, FiXCircle, FiAward, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const ExamResult = ({ result, examTitle, onRetry, onBackToCourse, attemptsRemaining }) => {
    const { score, pointsEarned, totalPoints, isPassed, passingScore, questions } = result;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Score Card */}
            <div className={`rounded-2xl p-6 sm:p-8 text-center ${isPassed
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800'
                }`}>
                {/* Score Circle */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            className="stroke-gray-200 dark:stroke-slate-700"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            className={isPassed ? 'stroke-green-500' : 'stroke-red-500'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(score / 100) * 327} 327`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl sm:text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                            {score}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {pointsEarned}/{totalPoints} pts
                        </span>
                    </div>
                </div>

                {/* Pass/Fail Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${isPassed
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                    {isPassed ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
                    {isPassed ? 'PASSED' : 'NOT PASSED'}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isPassed ? 'Congratulations!' : 'Keep Trying!'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {examTitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Passing score: {passingScore}%
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    {isPassed ? (
                        <button
                            onClick={onBackToCourse}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg transition"
                        >
                            <FiAward size={18} />
                            Claim Certificate
                        </button>
                    ) : (
                        <>
                            {attemptsRemaining > 0 && (
                                <button
                                    onClick={onRetry}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg transition"
                                >
                                    <FiRefreshCw size={18} />
                                    Try Again ({attemptsRemaining} left)
                                </button>
                            )}
                            <button
                                onClick={onBackToCourse}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                            >
                                <FiArrowLeft size={18} />
                                Back to Course
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Question Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-slate-800 overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Answer Review
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {questions.filter(q => q.isCorrect).length} correct out of {questions.length} questions
                    </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {questions.map((q, index) => (
                        <div key={index} className="p-4 sm:p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${q.isCorrect
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                    {q.isCorrect ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                        {index + 1}. {q.questionText}
                                    </p>
                                    <span className={`text-xs font-medium ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {q.pointsEarned}/{q.points} pts
                                    </span>
                                </div>
                            </div>
                            <div className="ml-9 space-y-1.5">
                                {q.options.map((opt, oIdx) => (
                                    <div
                                        key={oIdx}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${opt.isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                            : opt.isSelected && !opt.isCorrect
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {opt.isCorrect && <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                                        {opt.isSelected && !opt.isCorrect && <FiXCircle size={14} className="text-red-500 flex-shrink-0" />}
                                        {!opt.isCorrect && !opt.isSelected && <span className="w-3.5 flex-shrink-0" />}
                                        <span>{opt.text}</span>
                                        {opt.isSelected && <span className="text-xs ml-auto opacity-60">(your answer)</span>}
                                    </div>
                                ))}
                            </div>
                            {q.explanation && (
                                <div className="ml-9 mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    <span className="font-medium">Explanation:</span> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExamResult;

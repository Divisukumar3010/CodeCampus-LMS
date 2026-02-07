import { useState } from 'react';
import { FiPlus, FiTrash2, FiCheck, FiSettings } from 'react-icons/fi';

const QuestionBuilder = ({ questions = [], examSettings = {}, onQuestionsChange, onSettingsChange, isDarkMode }) => {
    const [showSettings, setShowSettings] = useState(false);

    const addQuestion = () => {
        const newQuestion = {
            questionText: '',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            explanation: '',
            points: 1,
            order: questions.length + 1
        };
        onQuestionsChange([...questions, newQuestion]);
    };

    const removeQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 }));
        onQuestionsChange(updated);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        onQuestionsChange(updated);
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const updated = [...questions];
        const options = [...updated[qIndex].options];
        if (field === 'isCorrect' && value === true) {
            // Only one correct answer
            options.forEach((opt, i) => {
                options[i] = { ...opt, isCorrect: i === oIndex };
            });
        } else {
            options[oIndex] = { ...options[oIndex], [field]: value };
        }
        updated[qIndex] = { ...updated[qIndex], options };
        onQuestionsChange(updated);
    };

    const addOption = (qIndex) => {
        const updated = [...questions];
        if (updated[qIndex].options.length >= 6) return;
        updated[qIndex] = {
            ...updated[qIndex],
            options: [...updated[qIndex].options, { text: '', isCorrect: false }]
        };
        onQuestionsChange(updated);
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...questions];
        if (updated[qIndex].options.length <= 2) return;
        const removedWasCorrect = updated[qIndex].options[oIndex].isCorrect;
        const options = updated[qIndex].options.filter((_, i) => i !== oIndex);
        if (removedWasCorrect && options.length > 0) {
            options[0] = { ...options[0], isCorrect: true };
        }
        updated[qIndex] = { ...updated[qIndex], options };
        onQuestionsChange(updated);
    };

    return (
        <div className="space-y-6">
            {/* Exam Settings Toggle */}
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Exam Questions ({questions.length})
                </h3>
                <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isDarkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <FiSettings size={16} />
                    Exam Settings
                </button>
            </div>

            {/* Exam Settings Panel */}
            {showSettings && (
                <div className={`rounded-xl p-4 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Exam Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Exam Title
                            </label>
                            <input
                                type="text"
                                value={examSettings.title || ''}
                                onChange={(e) => onSettingsChange({ ...examSettings, title: e.target.value })}
                                placeholder="Final Exam"
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Passing Score (%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={examSettings.passingScore || 60}
                                onChange={(e) => onSettingsChange({ ...examSettings, passingScore: parseInt(e.target.value) || 60 })}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="180"
                                value={examSettings.duration || 30}
                                onChange={(e) => onSettingsChange({ ...examSettings, duration: parseInt(e.target.value) || 30 })}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Max Attempts
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={examSettings.maxAttempts || 3}
                                onChange={(e) => onSettingsChange({ ...examSettings, maxAttempts: parseInt(e.target.value) || 3 })}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Exam Description
                        </label>
                        <textarea
                            value={examSettings.description || ''}
                            onChange={(e) => onSettingsChange({ ...examSettings, description: e.target.value })}
                            placeholder="Instructions for students..."
                            rows={2}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                        />
                    </div>
                </div>
            )}

            {/* Questions List */}
            {questions.map((question, qIndex) => (
                <div
                    key={qIndex}
                    className={`rounded-xl p-4 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-gray-50 border border-gray-200'}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? 'bg-primary-900/40 text-primary-300' : 'bg-primary-100 text-primary-700'}`}>
                                {qIndex + 1}
                            </span>
                            <input
                                type="text"
                                value={question.questionText}
                                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                placeholder="Enter your question..."
                                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={question.points}
                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                                className={`w-16 px-2 py-2 rounded-lg border text-sm text-center ${isDarkMode
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                title="Points"
                            />
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>pts</span>
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 ml-11">
                        {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateOption(qIndex, oIndex, 'isCorrect', true)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${option.isCorrect
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : isDarkMode
                                            ? 'border-slate-500 hover:border-green-400'
                                            : 'border-gray-300 hover:border-green-400'
                                        }`}
                                    title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                                >
                                    {option.isCorrect && <FiCheck size={14} />}
                                </button>
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                        ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                        } ${option.isCorrect
                                            ? isDarkMode ? 'border-green-700' : 'border-green-300'
                                            : ''
                                        }`}
                                />
                                {question.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(qIndex, oIndex)}
                                        className="p-1.5 text-red-400 hover:text-red-600 transition"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {question.options.length < 6 && (
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className={`text-sm font-medium flex items-center gap-1 ml-8 ${isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
                            >
                                <FiPlus size={14} /> Add Option
                            </button>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="ml-11">
                        <input
                            type="text"
                            value={question.explanation || ''}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            placeholder="Explanation (shown after submission, optional)"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                                ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                        />
                    </div>
                </div>
            ))}

            {/* Add Question Button */}
            <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 border-gray-300 text-gray-500 dark:border-slate-600 dark:text-gray-400"
            >
                <FiPlus size={18} />
                Add Question
            </button>
        </div>
    );
};

export default QuestionBuilder;

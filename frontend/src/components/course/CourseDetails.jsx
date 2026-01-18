// ========== src/components/course/CourseDetails.jsx ==========
import { useState } from 'react';
import { FiClock, FiBook, FiStar, FiPlay } from 'react-icons/fi';

const CourseDetails = ({ course }) => {
    const [expandedSection, setExpandedSection] = useState(null);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    return (
        <div className="space-y-6">
            {/* Course Curriculum */}
            <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">Course Curriculum</h3>
                    <p className="text-primary-100 text-sm mt-1">
                        {course.sections?.length || 0} sections • {course.totalLessons || 0} lessons • {formatDuration(course.totalDuration || 0)} total length
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {course.sections?.map((section, index) => (
                        <div key={section._id || index} className="bg-white dark:bg-slate-950 dark:bg-slate-900">
                            <button
                                onClick={() => toggleSection(section._id || index)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-bold">{index + 1}</span>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{section.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {section.lessons?.length || 0} lessons • {formatDuration(
                                                section.lessons?.reduce((acc, lesson) => acc + (lesson.videoDuration || 0), 0) || 0
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === (section._id || index) ? 'transform rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {expandedSection === (section._id || index) && (
                                <div className="px-6 pb-4 bg-gray-50">
                                    {section.lessons?.map((lesson, lessonIndex) => (
                                        <div
                                            key={lesson._id || lessonIndex}
                                            className="flex items-center justify-between py-3 border-t border-gray-200 first:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 dark:bg-slate-900 flex items-center justify-center border border-gray-300 dark:border-slate-600 dark:border-slate-700">
                                                    <FiPlay className="text-primary-600 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 dark:text-gray-100 font-medium">{lesson.title}</p>
                                                    {lesson.isFree && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                            Free Preview
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {Math.floor((lesson.videoDuration || 0) / 60)}:{String((lesson.videoDuration || 0) % 60).padStart(2, '0')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
                        <FiBook className="text-primary-600 text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course.totalLessons || 0}</p>
                    <p className="text-sm text-gray-600">Lessons</p>
                </div>

                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-2">
                        <FiClock className="text-secondary-600 text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatDuration(course.totalDuration || 0)}</p>
                    <p className="text-sm text-gray-600">Duration</p>
                </div>

                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                        <FiStar className="text-yellow-600 text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course.averageRating?.toFixed(1) || '0.0'}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
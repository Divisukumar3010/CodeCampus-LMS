import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseAPI, userAPI } from '../services/api';
import VideoPlayer from '../components/course/VideoPlayer';
import { FiCheckCircle, FiLock, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Certificate from '../components/Certificate';
import RatingForm from '../components/course/RatingForm';

const CourseView = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        fetchCourseAndProgress();
    }, [id]);

    useEffect(() => {
        // Expand all sections by default
        if (course?.sections) {
            const expanded = {};
            course.sections.forEach(section => {
                expanded[section._id] = true;
            });
            setExpandedSections(expanded);
        }
    }, [course]);

    const fetchCourseAndProgress = async () => {
        try {
            const [courseRes, progressRes] = await Promise.all([
                courseAPI.getById(id),
                userAPI.getProgress(id)
            ]);

            setCourse(courseRes.data.course);
            setProgress(progressRes.data.progress);

            // Set initial lesson - with safety checks
            const sections = courseRes.data.course?.sections || [];
            const firstSection = sections[0];
            if (firstSection && firstSection.lessons?.length > 0) {
                setCurrentLesson({
                    ...firstSection.lessons[0],
                    sectionId: firstSection._id,
                    sectionTitle: firstSection.title
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async (lessonId, watchTime = 0) => {
        try {
            const response = await userAPI.completeLesson(id, { lessonId, watchTime });

            // Update progress with the response
            setProgress(response.data.progress);

            toast.success('Lesson marked as complete!');

            // If course is now completed, show celebration
            if (response.data.progress.isCompleted) {
                toast.success('🎉 Congratulations! You completed the course!', {
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            toast.error('Failed to update progress');
        }
    };

    const isLessonCompleted = (lessonId) => {
        return progress?.completedLessons?.some(cl => cl.lessonId === lessonId);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
                    <p className="text-gray-600 dark:text-slate-400">The course you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Safety check for sections
    const sections = course.sections || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-4 lg:py-8">
                <div className="mb-6 flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Course Player</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800">
                            {currentLesson ? (
                                <div>
                                    <div className="bg-black aspect-video">
                                        {currentLesson.videoUrl ? (
                                            <VideoPlayer
                                                url={currentLesson.videoUrl}
                                                onComplete={({ watchTime }) => handleLessonComplete(currentLesson._id, watchTime)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                <p>Video unavailable</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                                {isLessonCompleted(currentLesson._id) ? 'Completed' : 'Watch to complete'}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Lesson {currentLesson.order || 1}
                                            </span>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {currentLesson.title}
                                        </h2>
                                        <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">{currentLesson.sectionTitle}</p>
                                        {currentLesson.description && (
                                            <p className="text-gray-700 dark:text-slate-300 mb-6">{currentLesson.description}</p>
                                        )}

                                        {currentLesson.resources && currentLesson.resources.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <FiDownload className="text-primary-600 dark:text-primary-400" />
                                                    Course Resources
                                                </h3>
                                                <div className="space-y-2">
                                                    {currentLesson.resources.map((resource, index) => (
                                                        <a
                                                            key={index}
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-700 hover:border-primary-200 border border-transparent dark:border-slate-700 transition"
                                                        >
                                                            <FiDownload className="text-primary-600 dark:text-primary-400" />
                                                            <span className="text-gray-700 dark:text-slate-300 font-medium">{resource.title}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!isLessonCompleted(currentLesson._id) && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Finish watching to unlock completion.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-gray-900 dark:bg-slate-900 flex items-center justify-center text-white">
                                    <p>No lessons available</p>
                                </div>
                            )}
                        </div>

                        {/* Rating Section - Below Video on Desktop */}
                        <div className="mt-6 lg:block hidden">
                            {progress && (
                                <RatingForm
                                    courseId={id}
                                    onReviewSubmitted={fetchCourseAndProgress}
                                />
                            )}
                        </div>
                    </div>

                    {/* Course Content Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-800 overflow-hidden lg:sticky lg:top-24 border border-slate-100 dark:border-slate-800">
                            {/* Progress Header */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                                <h3 className="font-bold text-lg mb-3">Your Progress</h3>
                                {progress && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>{progress.completedLessons?.length || 0} / {course.totalLessons || 0} lessons</span>
                                            <span className="font-bold">{progress.percentComplete || 0}%</span>
                                        </div>
                                        <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 shadow-lg ${progress.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                style={{ width: `${progress.percentComplete || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Certificate Section */}
                            {progress?.isCompleted && (
                                <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 dark:from-green-900/20 to-blue-50 dark:to-blue-900/20 border-b-4 border-green-500">
                                    <Certificate
                                        courseId={id}
                                        courseTitle={course.title}
                                        progress={progress}
                                        isCompleted={progress.isCompleted}
                                    />
                                </div>
                            )}

                            {/* Course Sections */}
                            <div className="max-h-[400px] lg:max-h-[600px] overflow-y-auto">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Course Content</h4>
                                </div>
                                {sections.length > 0 ? (
                                    sections.map((section) => (
                                        <div key={section._id} className="border-b border-gray-200 dark:border-slate-800">
                                            {/* Section Header - Collapsible */}
                                            <button
                                                onClick={() => toggleSection(section._id)}
                                                className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-between group"
                                            >
                                                <span className="font-semibold text-gray-900 dark:text-white text-left text-sm sm:text-base">
                                                    {section.title}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-500 dark:text-slate-400">
                                                        {section.lessons?.length || 0} lessons
                                                    </span>
                                                    {expandedSections[section._id] ? (
                                                        <FiChevronUp className="text-gray-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" />
                                                    ) : (
                                                        <FiChevronDown className="text-gray-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Lessons List - Collapsible */}
                                            {expandedSections[section._id] && (
                                                <div className="bg-white dark:bg-slate-900">
                                                    {section.lessons?.map((lesson) => {
                                                        const isCompleted = isLessonCompleted(lesson._id);
                                                        const isCurrent = currentLesson?._id === lesson._id;

                                                        return (
                                                            <button
                                                                key={lesson._id}
                                                                onClick={() => setCurrentLesson({
                                                                    ...lesson,
                                                                    sectionId: section._id,
                                                                    sectionTitle: section.title
                                                                })}
                                                                className={`w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition border-l-4 ${isCurrent
                                                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600'
                                                                    : 'border-transparent'
                                                                    }`}
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    {isCompleted ? (
                                                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                                            <FiCheckCircle className="text-white" size={16} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-slate-600" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow text-left">
                                                                    <p className={`text-sm ${isCurrent
                                                                        ? 'font-semibold text-primary-600 dark:text-primary-400'
                                                                        : 'text-gray-700 dark:text-slate-300'
                                                                        }`}>
                                                                        {lesson.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                                                        {Math.floor(lesson.videoDuration / 60)}:{String(lesson.videoDuration % 60).padStart(2, '0')} min
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500 dark:text-slate-400">
                                        No course content available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rating Section - Mobile Only */}
                        <div className="mt-6 lg:hidden">
                            {progress && (
                                <RatingForm
                                    courseId={id}
                                    onReviewSubmitted={fetchCourseAndProgress}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseView;
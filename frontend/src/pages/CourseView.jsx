import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseAPI, userAPI } from '../services/api';
import VideoPlayer from '../components/course/VideoPlayer';
import { FiCheckCircle, FiLock, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CourseView = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseAndProgress();
    }, [id]);

    const fetchCourseAndProgress = async () => {
        try {
            const [courseRes, progressRes] = await Promise.all([
                courseAPI.getById(id),
                userAPI.getProgress(id)
            ]);

            setCourse(courseRes.data.course);
            setProgress(progressRes.data.progress);

            // Set initial lesson
            const firstSection = courseRes.data.course.sections[0];
            if (firstSection && firstSection.lessons.length > 0) {
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

    const handleLessonComplete = async (lessonId) => {
        try {
            await userAPI.completeLesson(id, { lessonId, watchTime: 0 });

            // Refresh progress
            const progressRes = await userAPI.getProgress(id);
            setProgress(progressRes.data.progress);

            toast.success('Lesson marked as complete!');
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            toast.error('Failed to update progress');
        }
    };

    const isLessonCompleted = (lessonId) => {
        return progress?.completedLessons?.some(cl => cl.lessonId === lessonId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!course) {
        return <div>Course not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-0">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2 bg-black ">
                        {currentLesson && (
                            <div>
                                <VideoPlayer
                                    url={currentLesson.videoUrl}
                                    onComplete={() => handleLessonComplete(currentLesson._id)}
                                />
                                <div className="bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {currentLesson.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4">{currentLesson.sectionTitle}</p>
                                    {currentLesson.description && (
                                        <p className="text-gray-700 mb-4">{currentLesson.description}</p>
                                    )}

                                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
                                            <div className="space-y-2">
                                                {currentLesson.resources.map((resource, index) => (
                                                    <a
                                                        key={index}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                                    >
                                                        <FiDownload />
                                                        <span>{resource.title}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!isLessonCompleted(currentLesson._id) && (
                                        <button
                                            onClick={() => handleLessonComplete(currentLesson._id)}
                                            className="btn-primary mt-4"
                                        >
                                            Mark as Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Content Sidebar */}
                    <div className="bg-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="font-bold text-lg mb-2">Course Content</h3>
                            {progress && (
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>{progress.completedLessons.length} / {course.totalLessons} completed</span>
                                        <span>{progress.percentComplete}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all"
                                            style={{ width: `${progress.percentComplete}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="divide-y divide-gray-200">
                            {course.sections.map((section) => (
                                <div key={section._id}>
                                    <div className="p-4 bg-gray-50 font-semibold">
                                        {section.title}
                                    </div>
                                    <div>
                                        {section.lessons.map((lesson) => {
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
                                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition ${isCurrent ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                                                        }`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        {isCompleted ? (
                                                            <FiCheckCircle className="text-green-500" size={20} />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow text-left">
                                                        <p className={`text-sm ${isCurrent ? 'font-semibold text-primary-600' : 'text-gray-700'}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {Math.floor(lesson.videoDuration / 60)}:{String(lesson.videoDuration % 60).padStart(2, '0')}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseView;
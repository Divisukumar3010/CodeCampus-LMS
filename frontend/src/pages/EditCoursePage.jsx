import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, adminAPI, examAPI } from '../services/api';
import { FiUpload, FiX, FiPlus, FiTrash2, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme'; // Import useTheme hook
import QuestionBuilder from '../components/exam/QuestionBuilder';

const extractYouTubeId = (value) => {
    if (!value || typeof value !== 'string') return null;

    try {
        const url = new URL(value);
        const host = url.hostname.replace('www.', '');

        if (host === 'youtu.be') {
            return url.pathname.split('/')[1] || null;
        }

        if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
            if (url.pathname === '/watch') {
                return url.searchParams.get('v');
            }
            if (url.pathname.startsWith('/embed/')) {
                return url.pathname.split('/')[2] || null;
            }
            if (url.pathname.startsWith('/shorts/')) {
                return url.pathname.split('/')[2] || null;
            }
        }
    } catch (error) {
        // Fall through to regex match.
    }

    const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : null;
};

const getYouTubeThumbnail = (value) => {
    const id = extractYouTubeId(value);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const loadYouTubeApi = () => {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (window.__ytApiPromise) return window.__ytApiPromise;
    window.__ytApiPromise = new Promise((resolve) => {
        if (document.getElementById('youtube-iframe-api')) {
            const check = setInterval(() => {
                if (window.YT && window.YT.Player) { clearInterval(check); resolve(); }
            }, 100);
            return;
        }
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
    });
    return window.__ytApiPromise;
};

const fetchVideoDuration = (videoId) => {
    return new Promise((resolve) => {
        loadYouTubeApi().then(() => {
            const container = document.createElement('div');
            container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px';
            document.body.appendChild(container);
            let resolved = false;
            const player = new window.YT.Player(container, {
                videoId,
                playerVars: { autoplay: 0 },
                events: {
                    onReady: (event) => {
                        if (resolved) return;
                        resolved = true;
                        const duration = Math.round(event.target.getDuration());
                        try { player.destroy(); } catch {}
                        try { container.remove(); } catch {}
                        resolve(duration > 0 ? duration : 0);
                    },
                    onError: () => {
                        if (resolved) return;
                        resolved = true;
                        try { player.destroy(); } catch {}
                        try { container.remove(); } catch {}
                        resolve(0);
                    }
                }
            });
            setTimeout(() => {
                if (resolved) return;
                resolved = true;
                try { player.destroy(); } catch {}
                try { container.remove(); } catch {}
                resolve(0);
            }, 10000);
        });
    });
};

const EditCoursePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isDarkMode } = useTheme(); // Get theme state
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [categories, setCategories] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [course, setCourse] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [fetchingDuration, setFetchingDuration] = useState(null);    const [enableExam, setEnableExam] = useState(false);
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        passingScore: 60,
        duration: 30,
        maxAttempts: 3,
    });
    const [examQuestions, setExamQuestions] = useState([]);
    const [existingExam, setExistingExam] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        category: '',
        level: 'beginner',
        language: 'English',
        price: '',
        discountPrice: '',
        whatYouWillLearn: [''],
        requirements: [''],
        targetAudience: [''],
        tags: '',
        sections: [],
    });

    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchCourseData();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await adminAPI.getCategories();
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchCourseData = async () => {
        try {
            setIsFetching(true);
            const response = await courseAPI.getById(id);
            const courseData = response.data.course;

            console.log('Course Data:', courseData);

            setCourse(courseData);
            setThumbnailPreview(courseData.thumbnail?.url || '');

            const sections = courseData.sections?.map(section => ({
                _id: section._id,
                title: section.title || '',
                description: section.description || '',
                lessons: section.lessons?.map(lesson => ({
                    _id: lesson._id,
                    title: lesson.title || '',
                    description: lesson.description || '',
                    videoUrl: lesson.videoUrl || '',
                    videoDuration: lesson.videoDuration || 0,
                    isFree: lesson.isFree || false,
                    resources: lesson.resources?.map(resource => ({
                        _id: resource._id,
                        title: resource.title || resource.fileName || '',
                        url: resource.url || '',
                        fileName: resource.fileName || '',
                        originalName: resource.originalName || '',
                        file: null
                    })) || []
                })) || []
            })) || [];


            setFormData({
                title: courseData.title || '',
                subtitle: courseData.subtitle || '',
                description: courseData.description || '',
                category: courseData.category?._id || '',
                level: courseData.level || 'beginner',
                language: courseData.language || 'English',
                price: courseData.price || '',
                discountPrice: courseData.discountPrice || '',
                whatYouWillLearn: courseData.whatYouWillLearn || [''],
                requirements: courseData.requirements || [''],
                targetAudience: courseData.targetAudience || [''],
                tags: courseData.tags?.join(', ') || '',
                sections: sections,
            });

            // Fetch existing exam data
            try {
                const examRes = await examAPI.getExam(id);
                if (examRes.data.exam) {
                    const examInfo = examRes.data.exam;
                    setEnableExam(true);
                    setExistingExam(true);
                    setExamData({
                        title: examInfo.title || '',
                        description: examInfo.description || '',
                        passingScore: examInfo.passingScore || 60,
                        duration: examInfo.duration || 30,
                        maxAttempts: examInfo.maxAttempts || 3,
                    });
                    setExamQuestions(examInfo.questions || []);
                }
            } catch {
                // No exam exists for this course
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course');
            navigate('/dashboard/trainer');
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleVideoUrlBlur = async (sectionIndex, lessonIndex, videoUrl) => {
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) return;
        const key = `${sectionIndex}_${lessonIndex}`;
        setFetchingDuration(key);
        try {
            const duration = await fetchVideoDuration(videoId);
            if (duration > 0) {
                updateLesson(sectionIndex, lessonIndex, 'videoDuration', duration);
            }
        } catch {
            // Silently fail
        } finally {
            setFetchingDuration(null);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const removeThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview('');
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: '', description: '', lessons: [] }]
        }));
    };

    const removeSection = (sectionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== sectionIndex)
        }));
    };

    const updateSection = (sectionIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex ? { ...section, [field]: value } : section
            )
        }));
    };

    const addLesson = (sectionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        lessons: [...section.lessons, {
                            title: '',
                            description: '',
                            videoUrl: '',
                            videoDuration: '',
                            isFree: false,
                            resources: []
                        }]
                    }
                    : section
            )
        }));
    };

    const removeLesson = (sectionIndex, lessonIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? { ...section, lessons: section.lessons.filter((_, j) => j !== lessonIndex) }
                    : section
            )
        }));
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        lessons: section.lessons.map((lesson, j) =>
                            j === lessonIndex ? { ...lesson, [field]: value } : lesson
                        )
                    }
                    : section
            )
        }));
    };

    const addResource = (sectionIndex, lessonIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        lessons: section.lessons.map((lesson, j) =>
                            j === lessonIndex
                                ? {
                                    ...lesson,
                                    resources: [...(lesson.resources || []), {
                                        title: '',
                                        file: null,
                                        fileName: '',
                                        url: ''
                                    }]
                                }
                                : lesson
                        )
                    }
                    : section
            )
        }));
    };

    const removeResource = (sectionIndex, lessonIndex, resourceIdx) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        lessons: section.lessons.map((lesson, j) =>
                            j === lessonIndex
                                ? {
                                    ...lesson,
                                    resources: lesson.resources.filter((_, k) => k !== resourceIdx)
                                }
                                : lesson
                        )
                    }
                    : section
            )
        }));
    };

    const handleResourceChange = (sectionIndex, lessonIndex, resourceIdx, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Resource size should be less than 50MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                sections: prev.sections.map((section, i) =>
                    i === sectionIndex
                        ? {
                            ...section,
                            lessons: section.lessons.map((lesson, j) =>
                                j === lessonIndex
                                    ? {
                                        ...lesson,
                                        resources: lesson.resources.map((resource, k) =>
                                            k === resourceIdx
                                                ? {
                                                    ...resource,
                                                    file: file,
                                                    fileName: file.name,
                                                    title: file.name.split('.')[0]
                                                }
                                                : resource
                                        )
                                    }
                                    : lesson
                            )
                        }
                        : section
                )
            }));
        }
    };

    const updateResourceTitle = (sectionIndex, lessonIndex, resourceIdx, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        lessons: section.lessons.map((lesson, j) =>
                            j === lessonIndex
                                ? {
                                    ...lesson,
                                    resources: lesson.resources.map((resource, k) =>
                                        k === resourceIdx
                                            ? { ...resource, title: value }
                                            : resource
                                    )
                                }
                                : lesson
                        )
                    }
                    : section
            )
        }));
    };

    const toggleSection = (sectionIndex) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        if (formData.price && formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
            toast.error('Discount price must be less than regular price');
            return;
        }

        for (let sectionIndex = 0; sectionIndex < formData.sections.length; sectionIndex++) {
            const section = formData.sections[sectionIndex];
            for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
                const lesson = section.lessons[lessonIndex];
                if (!lesson.videoUrl || !extractYouTubeId(lesson.videoUrl)) {
                    toast.error(`Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1} needs a valid YouTube URL`);
                    return;
                }
            }
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();

            // Add basic fields
            submitData.append('title', formData.title);
            submitData.append('subtitle', formData.subtitle);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('level', formData.level);
            submitData.append('language', formData.language);
            submitData.append('price', formData.price);

            if (formData.discountPrice) {
                submitData.append('discountPrice', formData.discountPrice);
            }

            if (thumbnail) {
                submitData.append('thumbnail', thumbnail, thumbnail.name);
            }

            // Add arrays
            const whatYouWillLearn = formData.whatYouWillLearn.filter(item => item.trim());
            const requirements = formData.requirements.filter(item => item.trim());
            const targetAudience = formData.targetAudience.filter(item => item.trim());

            submitData.append('whatYouWillLearn', JSON.stringify(whatYouWillLearn));
            submitData.append('requirements', JSON.stringify(requirements));
            submitData.append('targetAudience', JSON.stringify(targetAudience));

            if (formData.tags) {
                const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
                submitData.append('tags', JSON.stringify(tagsArray));
            }

            // Build sections data
            const sectionsData = formData.sections.map((section, sectionIndex) => {
                const sectionObj = {
                    title: section.title,
                    description: section.description,
                    order: sectionIndex + 1,
                    lessons: section.lessons.map((lesson, lessonIndex) => {
                        const lessonObj = {
                            title: lesson.title,
                            description: lesson.description,
                            isFree: lesson.isFree,
                            order: lessonIndex + 1,
                            videoDuration: Number(lesson.videoDuration) || 0,
                            videoUrl: lesson.videoUrl || '',
                            resources: lesson.resources?.map(resource => ({
                                title: resource.title,
                                fileName: resource.fileName,
                                url: resource.url,
                                originalName: resource.originalName
                            })) || []
                        };

                        if (lesson._id) {
                            lessonObj._id = lesson._id;
                        }

                        return lessonObj;
                    })
                };

                if (section._id) {
                    sectionObj._id = section._id;
                }

                return sectionObj;
            });

            console.log('Sections Data:', sectionsData);
            submitData.append('sections', JSON.stringify(sectionsData));

            // Add resource files to form data
            const resourceFiles = [];
            formData.sections.forEach((section, sectionIndex) => {
                section.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.resources && lesson.resources.length > 0) {
                        lesson.resources.forEach((resource, resourceIdx) => {
                            if (resource.file && resource.file instanceof File) {
                                const resourceFieldName = `resource_${sectionIndex}_${lessonIndex}_${resourceIdx}`;
                                console.log('Adding resource:', resourceFieldName, resource.file.name);
                                resourceFiles.push({
                                    fieldName: resourceFieldName,
                                    file: resource.file
                                });
                            }
                        });
                    }
                });
            });

            // Add resources to form data
            resourceFiles.forEach(({ fieldName, file }) => {
                submitData.append(fieldName, file, file.name);
            });

            console.log('Submitting update with', resourceFiles.length, 'resources...');

            const response = await courseAPI.update(id, submitData);

            if (response.data.success) {
                // Handle exam create/update/delete
                if (enableExam && examQuestions.length > 0) {
                    try {
                        if (existingExam) {
                            await examAPI.updateExam(id, {
                                title: examData.title || `${formData.title} - Final Exam`,
                                description: examData.description,
                                questions: examQuestions,
                                passingScore: examData.passingScore,
                                duration: examData.duration,
                                maxAttempts: examData.maxAttempts,
                            });
                        } else {
                            await examAPI.createExam(id, {
                                title: examData.title || `${formData.title} - Final Exam`,
                                description: examData.description,
                                questions: examQuestions,
                                passingScore: examData.passingScore,
                                duration: examData.duration,
                                maxAttempts: examData.maxAttempts,
                            });
                        }
                    } catch (examError) {
                        console.error('Error saving exam:', examError);
                        toast.error('Course updated but exam save failed');
                    }
                } else if (!enableExam && existingExam) {
                    // Exam was disabled, delete it
                    try {
                        await examAPI.deleteExam(id);
                    } catch {
                        // Ignore delete errors
                    }
                }

                toast.success('Course updated successfully!');
                navigate('/dashboard/trainer');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);

            if (error.code === 'ERR_NETWORK') {
                toast.error('Network error - Backend server may be down or request too large');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update course');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className={`w-12 h-12 border-4 ${isDarkMode ? 'border-gray-300' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`}></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Course</h1>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Update your course details and curriculum</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Course Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    placeholder="e.g., Complete Web Development Bootcamp 2024"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    placeholder="Brief description of your course"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    placeholder="Detailed description of what students will learn..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Level *</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="all">All Levels</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
                                    <input
                                        type="text"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="English"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (INR) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="99.99"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Discount Price (INR)</label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="49.99"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Thumbnail</h2>
                        {thumbnailPreview ? (
                            <div className="relative">
                                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-64 object-cover rounded-xl" />
                                <button type="button" onClick={removeThumbnail} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                                    <FiX size={20} />
                                </button>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition ${isDarkMode
                                ? 'border-gray-600 hover:border-blue-500 bg-gray-700'
                                : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                                }`}>
                                <FiUpload className={`text-5xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                                <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload thumbnail</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PNG, JPG up to 5MB</p>
                                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* What You'll Learn */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What You'll Learn</h2>
                        <div className="space-y-3">
                            {formData.whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                                        className={`flex-grow px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="e.g., Build responsive websites"
                                    />
                                    {formData.whatYouWillLearn.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('whatYouWillLearn', index)}
                                            className={`px-4 py-2 rounded-lg transition ${isDarkMode
                                                ? 'text-red-400 hover:bg-red-900/30'
                                                : 'text-red-600 hover:bg-red-50'
                                                }`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('whatYouWillLearn')}
                                className={`flex items-center gap-2 font-semibold ${isDarkMode
                                    ? 'text-blue-400 hover:text-blue-300'
                                    : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                <FiPlus /> Add Learning Outcome
                            </button>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Requirements</h2>
                        <div className="space-y-3">
                            {formData.requirements.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                                        className={`flex-grow px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="e.g., Basic computer skills"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('requirements', index)}
                                            className={`px-4 py-2 rounded-lg transition ${isDarkMode
                                                ? 'text-red-400 hover:bg-red-900/30'
                                                : 'text-red-600 hover:bg-red-50'
                                                }`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('requirements')}
                                className={`flex items-center gap-2 font-semibold ${isDarkMode
                                    ? 'text-blue-400 hover:text-blue-300'
                                    : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                <FiPlus /> Add Requirement
                            </button>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Target Audience</h2>
                        <div className="space-y-3">
                            {formData.targetAudience.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                                        className={`flex-grow px-4 py-3 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        placeholder="e.g., Beginners who want to learn web development"
                                    />
                                    {formData.targetAudience.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('targetAudience', index)}
                                            className={`px-4 py-2 rounded-lg transition ${isDarkMode
                                                ? 'text-red-400 hover:bg-red-900/30'
                                                : 'text-red-600 hover:bg-red-50'
                                                }`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('targetAudience')}
                                className={`flex items-center gap-2 font-semibold ${isDarkMode
                                    ? 'text-blue-400 hover:text-blue-300'
                                    : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                <FiPlus /> Add Target Audience
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tags</h2>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2`}
                            placeholder="web development, html, css, javascript (comma separated)"
                        />
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter tags separated by commas</p>
                    </div>

                    {/* Course Sections */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Curriculum</h2>
                            <button
                                type="button"
                                onClick={addSection}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isDarkMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <FiPlus /> Add Section
                            </button>
                        </div>

                        {formData.sections.length === 0 ? (
                            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No sections added. Click "Add Section" to start.</p>
                        ) : (
                            <div className="space-y-4">
                                {formData.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div onClick={() => toggleSection(sectionIndex)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 cursor-pointer flex justify-between items-center hover:opacity-90">
                                            <div>
                                                <h3 className="font-bold text-lg">{section.title || `Section ${sectionIndex + 1}`}</h3>
                                                <p className="text-sm opacity-90">{section.lessons.length} lessons</p>
                                            </div>
                                            {expandedSections[sectionIndex] ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>

                                        {expandedSections[sectionIndex] && (
                                            <div className={`p-6 space-y-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <div>
                                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Section Title *</label>
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                        required
                                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                            } focus:outline-none focus:ring-2`}
                                                        placeholder="e.g., Introduction to Web Development"
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Section Description</label>
                                                    <textarea
                                                        value={section.description}
                                                        onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                                                        rows={3}
                                                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                            } focus:outline-none focus:ring-2`}
                                                        placeholder="Brief description of this section"
                                                    />
                                                </div>

                                                <div className="mt-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lessons</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => addLesson(sectionIndex)}
                                                            className={`flex items-center gap-2 font-semibold ${isDarkMode
                                                                ? 'text-blue-400 hover:text-blue-300'
                                                                : 'text-blue-600 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            <FiPlus /> Add Lesson
                                                        </button>
                                                    </div>

                                                    {section.lessons.length === 0 ? (
                                                        <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No lessons yet.</p>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {section.lessons.map((lesson, lessonIndex) => (
                                                                <div key={lessonIndex} className={`border rounded-lg p-4 ${isDarkMode
                                                                    ? 'bg-gray-800 border-gray-700'
                                                                    : 'bg-white border-gray-200'
                                                                    }`}>
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lesson {lessonIndex + 1}</h5>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeLesson(sectionIndex, lessonIndex)}
                                                                            className={`p-2 rounded ${isDarkMode
                                                                                ? 'text-red-400 hover:bg-red-900/30'
                                                                                : 'text-red-600 hover:bg-red-50'
                                                                                }`}
                                                                        >
                                                                            <FiTrash2 />
                                                                        </button>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lesson Title *</label>
                                                                            <input
                                                                                type="text"
                                                                                value={lesson.title}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                                                                required
                                                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                                                    } focus:outline-none focus:ring-2`}
                                                                                placeholder="e.g., Welcome to the Course"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lesson Description</label>
                                                                            <textarea
                                                                                value={lesson.description}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'description', e.target.value)}
                                                                                rows={2}
                                                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                                                    } focus:outline-none focus:ring-2`}
                                                                                placeholder="Brief description of this lesson"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>YouTube Video URL *</label>
                                                                            <input
                                                                                type="url"
                                                                                value={lesson.videoUrl}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                                                                                onBlur={(e) => handleVideoUrlBlur(sectionIndex, lessonIndex, e.target.value)}
                                                                                required
                                                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                                                    } focus:outline-none focus:ring-2`}
                                                                                placeholder="https://www.youtube.com/watch?v=..."
                                                                            />
                                                                            {lesson.videoUrl && getYouTubeThumbnail(lesson.videoUrl) && (
                                                                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                                                    <img
                                                                                        src={getYouTubeThumbnail(lesson.videoUrl)}
                                                                                        alt="YouTube thumbnail"
                                                                                        className="w-full h-40 object-cover"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                                Video Duration (seconds)
                                                                                {fetchingDuration === `${sectionIndex}_${lessonIndex}` && (
                                                                                    <span className="ml-2 text-xs text-blue-500">Detecting...</span>
                                                                                )}
                                                                                {!fetchingDuration && lesson.videoDuration > 0 && (
                                                                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                                        ({Math.floor(lesson.videoDuration / 60)}:{String(lesson.videoDuration % 60).padStart(2, '0')})
                                                                                    </span>
                                                                                )}
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={lesson.videoDuration}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoDuration', e.target.value)}
                                                                                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                                                                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                                                    } focus:outline-none focus:ring-2`}
                                                                                placeholder="Auto-detected from YouTube URL"
                                                                            />
                                                                        </div>

                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={lesson.isFree}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'isFree', e.target.checked)}
                                                                                className="w-4 h-4"
                                                                            />
                                                                            <label className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mark as free preview</label>
                                                                        </div>

                                                                        {/* Resources */}
                                                                        <div className="mt-4">
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                                Lesson Resources
                                                                            </label>

                                                                            {lesson.resources && lesson.resources.length > 0 && (
                                                                                <div className="mb-3 space-y-2">
                                                                                    {lesson.resources.map((resource, resourceIdx) => (
                                                                                        <div key={resourceIdx} className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode
                                                                                            ? 'bg-gray-800 border-gray-700'
                                                                                            : 'bg-gray-50 border-gray-200'
                                                                                            }`}>
                                                                                            <div className="flex-grow mr-3">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={resource.title}
                                                                                                    onChange={(e) => updateResourceTitle(sectionIndex, lessonIndex, resourceIdx, e.target.value)}
                                                                                                    className={`w-full bg-transparent text-sm font-medium border-none focus:outline-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                                                                                    placeholder="Resource title"
                                                                                                />
                                                                                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                                    {resource.file ? resource.file.name : resource.url ? 'Uploaded' : 'No file'}
                                                                                                    {resource.file && ` (${(resource.file.size / 1024 / 1024).toFixed(2)} MB)`}
                                                                                                </p>
                                                                                            </div>
                                                                                            {!resource.url && (
                                                                                                <input
                                                                                                    type="file"
                                                                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                                                                    onChange={(e) => handleResourceChange(sectionIndex, lessonIndex, resourceIdx, e)}
                                                                                                    className={`text-xs w-40 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                                                                />
                                                                                            )}
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeResource(sectionIndex, lessonIndex, resourceIdx)}
                                                                                                className={`ml-2 p-2 rounded transition ${isDarkMode
                                                                                                    ? 'text-red-400 hover:bg-red-900/30'
                                                                                                    : 'text-red-600 hover:bg-red-50'
                                                                                                    }`}
                                                                                            >
                                                                                                <FiTrash2 size={16} />
                                                                                            </button>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => addResource(sectionIndex, lessonIndex)}
                                                                                className={`text-sm px-3 py-1.5 rounded-lg border transition ${isDarkMode
                                                                                    ? 'text-blue-400 border-blue-800 hover:bg-blue-900/30'
                                                                                    : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                                                                                    }`}
                                                                            >
                                                                                + Add Resource
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSection(sectionIndex)}
                                                    className={`mt-4 w-full px-4 py-2 rounded-lg border font-semibold transition ${isDarkMode
                                                        ? 'text-red-400 hover:bg-red-900/30 border-red-800'
                                                        : 'text-red-600 hover:bg-red-50 border-red-200'
                                                        }`}
                                                >
                                                    Delete Section
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Course Exam (Optional) */}
                    <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Exam</h2>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Add an MCQ exam that students must pass to get their certificate
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableExam}
                                    onChange={(e) => setEnableExam(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600" />
                            </label>
                        </div>

                        {enableExam && (
                            <QuestionBuilder
                                questions={examQuestions}
                                examSettings={examData}
                                onQuestionsChange={setExamQuestions}
                                onSettingsChange={setExamData}
                                isDarkMode={isDarkMode}
                            />
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating Course...
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    Update Course
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/trainer')}
                            className={`px-6 py-3 font-semibold rounded-lg transition ${isDarkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCoursePage;
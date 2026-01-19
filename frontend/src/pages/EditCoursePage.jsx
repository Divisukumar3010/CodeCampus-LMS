import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import { FiUpload, FiX, FiPlus, FiTrash2, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme'; // Import useTheme hook

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
                    video: null,
                    videoPreview: lesson.videoUrl || null,
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
                            video: null,
                            videoPreview: null,
                            videoDuration: 0,
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

    const handleVideoChange = (sectionIndex, lessonIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) {
                toast.error('Video size should be less than 500MB');
                return;
            }
            updateLesson(sectionIndex, lessonIndex, 'video', file);
            updateLesson(sectionIndex, lessonIndex, 'videoPreview', URL.createObjectURL(file));
        }
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
                            videoDuration: lesson.videoDuration || 0,
                            videoUrl: lesson.videoPreview || '',
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

            // Add lesson videos as separate fields
            const videoFiles = [];
            formData.sections.forEach((section, sectionIndex) => {
                section.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.video && lesson.video instanceof File) {
                        const videoFieldName = `lesson_${sectionIndex}_${lessonIndex}`;
                        console.log('Adding video:', videoFieldName, lesson.video.name, lesson.video.size);
                        videoFiles.push({
                            fieldName: videoFieldName,
                            file: lesson.video
                        });
                    }
                });
            });

            // Add videos to form data
            videoFiles.forEach(({ fieldName, file }) => {
                submitData.append(fieldName, file, file.name);
            });
            
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

            console.log('Submitting update with', videoFiles.length, 'videos...');

            const response = await courseAPI.update(id, submitData);

            if (response.data.success) {
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
                                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lesson Video (MP4, WebM)</label>
                                                                            {lesson.videoPreview ? (
                                                                                <div className="mb-3">
                                                                                    <div className="relative bg-black rounded-lg overflow-hidden">
                                                                                        <video controls className="w-full h-40">
                                                                                            <source src={lesson.videoPreview} />
                                                                                        </video>
                                                                                    </div>
                                                                                    <p className={`text-xs font-medium mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Video</p>
                                                                                </div>
                                                                            ) : null}
                                                                            <div className="mt-3">
                                                                                <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                                    {lesson.videoPreview ? 'Replace Video' : 'Upload Video'}
                                                                                </label>
                                                                                <input 
                                                                                    type="file" 
                                                                                    accept="video/*" 
                                                                                    onChange={(e) => handleVideoChange(sectionIndex, lessonIndex, e)} 
                                                                                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode 
                                                                                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                                                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                                                                    } focus:outline-none focus:ring-2`}
                                                                                />
                                                                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max 500MB. {lesson.videoPreview ? 'Leave empty to keep existing video.' : ''}</p>
                                                                            </div>
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import { FiUpload, FiX, FiPlus, FiTrash2, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
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
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await adminAPI.getCategories();
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
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

    // Section handlers
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

    // Lesson handlers
    const addLesson = (sectionIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? { ...section, lessons: [...section.lessons, { title: '', description: '', video: null, videoPreview: null, isFree: false }] }
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

    const toggleSection = (sectionIndex) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!thumbnail) {
            toast.error('Please upload a course thumbnail');
            return;
        }

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

            // Add thumbnail
            console.log('Adding thumbnail:', thumbnail);
            submitData.append('thumbnail', thumbnail, thumbnail.name);

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

            // Add sections WITH all required fields (order, videoUrl, videoDuration)
            const sectionsData = formData.sections.map((section, sectionIndex) => ({
                title: section.title,
                description: section.description,
                order: sectionIndex + 1, // REQUIRED
                lessons: section.lessons.map((lesson, lessonIndex) => ({
                    title: lesson.title,
                    description: lesson.description,
                    isFree: lesson.isFree,
                    order: lessonIndex + 1, // REQUIRED
                    videoDuration: 0, // Will be calculated or updated later
                    videoUrl: '' // Will be set when video is uploaded
                }))
            }));
            submitData.append('sections', JSON.stringify(sectionsData));

            // Add lesson videos separately
            formData.sections.forEach((section, sectionIndex) => {
                section.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.video) {
                        const videoFieldName = `lesson_${sectionIndex}_${lessonIndex}`;
                        console.log('Adding video:', videoFieldName);
                        submitData.append(videoFieldName, lesson.video, lesson.video.name);
                    }
                });
            });

            console.log('Submitting course data...');
            const response = await courseAPI.create(submitData);

            if (response.data.success) {
                toast.success('Course created successfully!');
                navigate('/dashboard/trainer');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error(error.response?.data?.message || 'Failed to create course');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Course</h1>
                    <p className="text-gray-600">Fill in the details to create your course</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="input-field w-full"
                                    placeholder="e.g., Complete Web Development Bootcamp 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Brief description of your course"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="input-field w-full"
                                    placeholder="Detailed description of what students will learn..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="input-field w-full"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level *</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="input-field w-full"
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                                    <input
                                        type="text"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="English"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (INR) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="input-field w-full"
                                        placeholder="99.99"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Price (INR)</label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="input-field w-full"
                                        placeholder="49.99"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Course Thumbnail *</h2>

                        {thumbnailPreview ? (
                            <div className="relative">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full h-64 object-cover rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={removeThumbnail}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary-500 transition bg-gray-50">
                                <FiUpload className="text-5xl text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Click to upload thumbnail</p>
                                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* What You'll Learn */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">What You'll Learn</h2>
                        <div className="space-y-3">
                            {formData.whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                                        className="input-field flex-grow"
                                        placeholder="e.g., Build responsive websites with HTML, CSS, and JavaScript"
                                    />
                                    {formData.whatYouWillLearn.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('whatYouWillLearn', index)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('whatYouWillLearn')}
                                className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                            >
                                <FiPlus /> Add Learning Outcome
                            </button>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Requirements</h2>
                        <div className="space-y-3">
                            {formData.requirements.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                                        className="input-field flex-grow"
                                        placeholder="e.g., Basic computer skills"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('requirements', index)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('requirements')}
                                className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                            >
                                <FiPlus /> Add Requirement
                            </button>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Target Audience</h2>
                        <div className="space-y-3">
                            {formData.targetAudience.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                                        className="input-field flex-grow"
                                        placeholder="e.g., Beginners who want to learn web development"
                                    />
                                    {formData.targetAudience.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('targetAudience', index)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('targetAudience')}
                                className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                            >
                                <FiPlus /> Add Target Audience
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tags</h2>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="input-field w-full"
                            placeholder="web development, html, css, javascript (comma separated)"
                        />
                        <p className="text-sm text-gray-500 mt-2">Enter tags separated by commas</p>
                    </div>

                    {/* Course Sections */}
                    <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Curriculum</h2>
                            <button
                                type="button"
                                onClick={addSection}
                                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <FiPlus /> Add Section
                            </button>
                        </div>

                        {formData.sections.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No sections added yet. Click "Add Section" to start building your course curriculum.</p>
                        ) : (
                            <div className="space-y-4">
                                {formData.sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Section Header */}
                                        <div
                                            onClick={() => toggleSection(sectionIndex)}
                                            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 cursor-pointer flex justify-between items-center hover:opacity-90"
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg">{section.title || `Section ${sectionIndex + 1}`}</h3>
                                                <p className="text-sm opacity-90">{section.lessons.length} lessons</p>
                                            </div>
                                            {expandedSections[sectionIndex] ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>

                                        {/* Section Content */}
                                        {expandedSections[sectionIndex] && (
                                            <div className="p-6 space-y-4 bg-gray-50">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title *</label>
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                        required
                                                        className="input-field w-full"
                                                        placeholder="e.g., Introduction to Web Development"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section Description</label>
                                                    <textarea
                                                        value={section.description}
                                                        onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                                                        rows={3}
                                                        className="input-field w-full"
                                                        placeholder="Brief description of this section"
                                                    />
                                                </div>

                                                {/* Lessons */}
                                                <div className="mt-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Lessons</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => addLesson(sectionIndex)}
                                                            className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                                                        >
                                                            <FiPlus /> Add Lesson
                                                        </button>
                                                    </div>

                                                    {section.lessons.length === 0 ? (
                                                        <p className="text-gray-500 text-center py-4">No lessons in this section yet.</p>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {section.lessons.map((lesson, lessonIndex) => (
                                                                <div key={lessonIndex} className="bg-white dark:bg-slate-950 dark:bg-slate-900 border border-gray-200 rounded-lg p-4">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">Lesson {lessonIndex + 1}</h5>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeLesson(sectionIndex, lessonIndex)}
                                                                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                                        >
                                                                            <FiTrash2 />
                                                                        </button>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                                                                            <input
                                                                                type="text"
                                                                                value={lesson.title}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                                                                required
                                                                                className="input-field w-full"
                                                                                placeholder="e.g., Welcome to the Course"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Description</label>
                                                                            <textarea
                                                                                value={lesson.description}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'description', e.target.value)}
                                                                                rows={2}
                                                                                className="input-field w-full"
                                                                                placeholder="Brief description of this lesson"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Video (MP4, WebM)</label>
                                                                            {lesson.videoPreview ? (
                                                                                <div className="mb-3">
                                                                                    <video controls className="w-full h-40 bg-black rounded-lg">
                                                                                        <source src={lesson.videoPreview} />
                                                                                    </video>
                                                                                </div>
                                                                            ) : null}
                                                                            <input
                                                                                type="file"
                                                                                accept="video/*"
                                                                                onChange={(e) => handleVideoChange(sectionIndex, lessonIndex, e)}
                                                                                className="input-field w-full"
                                                                            />
                                                                            <p className="text-xs text-gray-500 mt-1">Max 500MB. Upload will happen when you create the course.</p>
                                                                        </div>

                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={lesson.isFree}
                                                                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'isFree', e.target.checked)}
                                                                                className="w-4 h-4"
                                                                            />
                                                                            <label className="ml-2 text-sm text-gray-700">Mark as free preview</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove Section Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSection(sectionIndex)}
                                                    className="mt-4 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-semibold transition"
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
                            className="btn-primary flex items-center gap-2 flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Course...
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    Create Course
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/trainer')}
                            className="btn-ghost"
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

export default CreateCourse;
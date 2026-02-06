import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiTrash2, FiPlus } from 'react-icons/fi';

const EditProfile = ({ user, onSave }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewImage, setPreviewImage] = useState(user?.avatar?.url || null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        avatar: null,
        skills: user?.skills || [],
        socialMedia: {
            facebook: user?.socialMedia?.facebook || '',
            twitter: user?.socialMedia?.twitter || '',
            linkedin: user?.socialMedia?.linkedin || '',
            instagram: user?.socialMedia?.instagram || '',
        },
        education: user?.education || [],
        experience: user?.experience || [],
    });

    const [newSkill, setNewSkill] = useState('');
    const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
    const [newExperience, setNewExperience] = useState({ title: '', company: '', duration: '', description: '' });

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle social media changes
    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            socialMedia: { ...formData.socialMedia, [name]: value }
        });
    };

    // Add skill
    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    // Remove skill
    const removeSkill = (index) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((_, i) => i !== index)
        });
    };

    // Add education
    const addEducation = () => {
        if (newEducation.degree.trim() && newEducation.institution.trim()) {
            setFormData({
                ...formData,
                education: [...formData.education, newEducation]
            });
            setNewEducation({ degree: '', institution: '', year: '' });
        }
    };

    // Remove education
    const removeEducation = (index) => {
        setFormData({
            ...formData,
            education: formData.education.filter((_, i) => i !== index)
        });
    };

    // Add experience
    const addExperience = () => {
        if (newExperience.title.trim() && newExperience.company.trim()) {
            setFormData({
                ...formData,
                experience: [...formData.experience, newExperience]
            });
            setNewExperience({ title: '', company: '', duration: '', description: '' });
        }
    };

    // Remove experience
    const removeExperience = (index) => {
        setFormData({
            ...formData,
            experience: formData.experience.filter((_, i) => i !== index)
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Create FormData for file upload
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'avatar' && formData[key]) {
                    submitData.append(key, formData[key]);
                } else if (key === 'socialMedia' || key === 'skills' || key === 'education' || key === 'experience') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            // Call parent component's onSave function
            if (onSave) {
                await onSave(submitData);
            }

            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/profile"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-8"
                >
                    <FiArrowLeft size={20} />
                    <span>Back to Profile</span>
                </Link>

                {/* Edit Profile Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 lg:px-12 py-8">
                        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                        <p className="text-blue-100 mt-2">Update your profile information</p>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 lg:px-12 py-8">

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                {success}
                            </div>
                        )}

                        {/* Avatar Section */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Picture</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <div className="relative">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-gray-300 dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-300 dark:border-gray-600">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all">
                                        <FiCamera size={18} />
                                        <span>Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        Recommended: Square image, max 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">About You</h2>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Write a short bio about yourself..."
                                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Social Media */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Social Media</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Facebook Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={formData.socialMedia.facebook}
                                        onChange={handleSocialChange}
                                        placeholder="https://facebook.com/..."
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Twitter Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={formData.socialMedia.twitter}
                                        onChange={handleSocialChange}
                                        placeholder="https://twitter.com/..."
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        LinkedIn Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.socialMedia.linkedin}
                                        onChange={handleSocialChange}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Instagram Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={formData.socialMedia.instagram}
                                        onChange={handleSocialChange}
                                        placeholder="https://instagram.com/..."
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Skills & Expertise</h2>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                    placeholder="Add a skill..."
                                    className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-all"
                                >
                                    <FiPlus size={18} />
                                    <span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                    >
                                        <span>{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(index)}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                    placeholder="Degree/Qualification"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newEducation.institution}
                                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                    placeholder="Institution/School"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newEducation.year}
                                    onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                                    placeholder="Year (e.g., 2023)"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addEducation}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-all"
                                >
                                    <FiPlus size={18} />
                                    <span>Add Education</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="flex justify-between items-start p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                            {edu.year && <p className="text-xs text-gray-500 dark:text-gray-500">{edu.year}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Work Experience</h2>
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    value={newExperience.title}
                                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                                    placeholder="Job Title"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newExperience.company}
                                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                    placeholder="Company Name"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newExperience.duration}
                                    onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                                    placeholder="Duration (e.g., 2020-2023)"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <textarea
                                    value={newExperience.description}
                                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                    placeholder="Job description"
                                    rows="2"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={addExperience}
                                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-all"
                                >
                                    <FiPlus size={18} />
                                    <span>Add Experience</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.experience.map((exp, index) => (
                                    <div key={index} className="flex justify-between items-start p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                                            {exp.duration && <p className="text-xs text-gray-500 dark:text-gray-500">{exp.duration}</p>}
                                            {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors ml-4"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-700/50">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
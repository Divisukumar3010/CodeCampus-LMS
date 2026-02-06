import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiMail, FiPhone, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiArrowLeft } from 'react-icons/fi';

const ProfileView = ({ user }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-8"
                >
                    <FiArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">

                    {/* Header Background */}
                    <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    {/* Profile Content */}
                    <div className="px-6 sm:px-8 lg:px-12 pb-8">

                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-8">
                            {/* Avatar */}
                            <div className="mb-6 sm:mb-0">
                                {user?.avatar?.url ? (
                                    <img
                                        src={user.avatar.url}
                                        alt={user?.name}
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                                    />
                                ) : (
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-gray-800 shadow-xl">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Name & Role */}
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {user?.name}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 capitalize font-semibold mb-4">
                                    {user?.role}
                                </p>
                                <Link
                                    to="/profile/edit"
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    <FiEdit size={18} />
                                    <span>Edit Profile</span>
                                </Link>
                            </div>
                        </div>

                        {/* Bio Section */}
                        {user?.bio && (
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Email</h3>
                                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                                    <FiMail size={18} className="text-blue-500" />
                                    <a href={`mailto:${user?.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {user?.email}
                                    </a>
                                </div>
                            </div>

                            {user?.phone && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Phone</h3>
                                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                                        <FiPhone size={18} className="text-green-500" />
                                        <a href={`tel:${user.phone}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            {user.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Social Media */}
                        {(user?.socialMedia?.facebook || user?.socialMedia?.twitter || user?.socialMedia?.linkedin || user?.socialMedia?.instagram) && (
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">Social Links</h3>
                                <div className="flex space-x-4">
                                    {user?.socialMedia?.facebook && (
                                        <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all">
                                            <FiFacebook size={20} />
                                        </a>
                                    )}
                                    {user?.socialMedia?.twitter && (
                                        <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-400 hover:text-white transition-all">
                                            <FiTwitter size={20} />
                                        </a>
                                    )}
                                    {user?.socialMedia?.linkedin && (
                                        <a href={user.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-700 hover:text-white transition-all">
                                            <FiLinkedin size={20} />
                                        </a>
                                    )}
                                    {user?.socialMedia?.instagram && (
                                        <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-pink-600 hover:text-white transition-all">
                                            <FiInstagram size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {user?.skills && user.skills.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Skills & Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill, index) => (
                                        <span key={index} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {user?.education && user.education.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700/50">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Education</h3>
                                <div className="space-y-4">
                                    {user.education.map((edu, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {edu.degree}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                            {edu.year && <p className="text-sm text-gray-500 dark:text-gray-500">{edu.year}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Work Experience */}
                        {user?.experience && user.experience.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Work Experience</h3>
                                <div className="space-y-4">
                                    {user.experience.map((exp, index) => (
                                        <div key={index} className="border-l-4 border-purple-500 pl-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {exp.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                                            {exp.duration && <p className="text-sm text-gray-500 dark:text-gray-500">{exp.duration}</p>}
                                            {exp.description && <p className="text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
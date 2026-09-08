import { useState, useEffect } from 'react';
import { FiDownload, FiAward, FiCheck, FiLoader, FiShield, FiExternalLink, FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { certificateAPI } from '../services/api';

const Certificate = ({ courseId, courseTitle, progress, isCompleted }) => {
    const [generating, setGenerating] = useState(false);
    const [emailing, setEmailing] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_ORIGIN = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).origin
        : 'http://localhost:5000';

    useEffect(() => {
        // Check if certificate already exists in progress
        if (progress?.certificate?.isGenerated) {
            setCertificate(progress.certificate);
        }
        setLoading(false);
    }, [progress]);

    const handleGenerateCertificate = async () => {
        setGenerating(true);
        try {
            const response = await certificateAPI.generateCertificate(courseId);
            setCertificate(response.data.certificate);
            toast.success('Certificate generated & emailed to your inbox! 🎓📬');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setGenerating(false);
        }
    };

    const handleEmailCertificate = async () => {
        setEmailing(true);
        try {
            await certificateAPI.emailCertificate(courseId);
            toast.success('Certificate successfully emailed to your inbox! 📬');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send certificate email');
        } finally {
            setEmailing(false);
        }
    };

    const handleDownload = () => {
        if (!certificate?.certificateUrl) return;
        const link = document.createElement('a');
        link.href = `${API_ORIGIN}${certificate.certificateUrl}`;
        link.target = '_blank';
        link.download = `${courseTitle}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Certificate downloaded!');
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <FiLoader className="w-8 h-8 text-primary-600 mx-auto animate-spin" />
            </div>
        );
    }

    if (!isCompleted) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400 shadow-sm">
                    <FiAward className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Certificate Locked
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
                    Complete all lessons and pass the final examination with $\ge 60\%$ to earn your verified credential.
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress?.percentComplete || 0}%` }}
                    />
                </div>
            </div>
        );
    }

    if (certificate) {
        return (
            <div className="text-center py-6">
                <div className="w-18 h-18 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 p-4">
                    <FiShield className="w-10 h-10 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                    <FiCheck className="w-3.5 h-3.5" /> Verified Credential
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Certificate Ready! 🎉
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    You qualified the examination and completed all curriculum standards.
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Credential Identification
                    </div>
                    <div className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400 select-all">
                        {certificate.certificateId}
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleEmailCertificate}
                        disabled={emailing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl inline-flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
                    >
                        {emailing ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                Sending to Your Email...
                            </>
                        ) : (
                            <>
                                <FiMail className="w-4 h-4" />
                                Send Certificate to Email
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl inline-flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 hover:shadow-lg active:scale-[0.99]"
                    >
                        <FiDownload className="w-4 h-4" />
                        Download Certificate (PDF)
                    </button>
                    <a
                        href={`${API_ORIGIN}${certificate.certificateUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                    >
                        <FiExternalLink className="w-3.5 h-3.5" /> View Full Certificate in Browser
                    </a>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
                    Conferred on {new Date(certificate.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-6">
            <div className="w-18 h-18 bg-gradient-to-br from-amber-500 via-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/20 p-4">
                <FiAward className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
                <FiCheck className="w-3.5 h-3.5" /> Exam Qualified
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Claim Your Certificate!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
                Congratulations! You have satisfied all syllabus requirements and passed the qualification examination.
            </p>
            <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl inline-flex items-center justify-center gap-2 transition shadow-lg shadow-primary-600/20 hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
            >
                {generating ? (
                    <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Generating Credential...
                    </>
                ) : (
                    <>
                        <FiAward className="w-5 h-5" />
                        Generate Official Certificate
                    </>
                )}
            </button>
        </div>
    );
};

export default Certificate;
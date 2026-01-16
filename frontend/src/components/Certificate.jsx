import { useState, useEffect } from 'react';
import { FiDownload, FiAward, FiCheck, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Certificate = ({ courseId, courseTitle, progress, isCompleted }) => {
    const [generating, setGenerating] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

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
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/certificates/generate/${courseId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setCertificate(response.data.certificate);
            toast.success('Certificate generated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${certificate.certificateUrl}`;
        link.download = `${courseTitle}_Certificate.pdf`;
        link.click();
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FiAward className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Certificate Locked
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Complete all lessons to unlock
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress?.percentComplete || 0}%` }}
                    />
                </div>
            </div>
        );
    }

    if (certificate) {
        return (
            <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FiCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Certificate Ready! 🎉
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Congratulations on completing the course
                </p>

                <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Certificate ID</div>
                    <div className="font-mono text-sm font-bold text-primary-600">
                        {certificate.certificateId}
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
                >
                    <FiDownload className="w-5 h-5" />
                    Download Certificate
                </button>

                <p className="text-xs text-gray-500 mt-3">
                    Generated on {new Date(certificate.generatedAt).toLocaleDateString()}
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiAward className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
                Claim Your Certificate!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                You've completed the course
            </p>
            <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
                {generating ? (
                    <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <FiAward className="w-5 h-5" />
                        Generate Certificate
                    </>
                )}
            </button>
        </div>
    );
};

export default Certificate;
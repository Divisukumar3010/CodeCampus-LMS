import { useState, useEffect } from 'react';
import { FiDownload, FiAward, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Certificate = ({ courseId, courseTitle, progress, isCompleted }) => {
    const [generating, setGenerating] = useState(false);
    const [certificate, setCertificate] = useState(progress?.certificate || {});


    useEffect(() => {
        if (progress?.certificate) {
            setCertificate(progress.certificate);
        }
    }, [progress]);

    // 🔑 Certificate unlock condition
    const isUnlocked = progress?.percentComplete === 100;

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
        if (!certificate?.certificateUrl) {
            toast.error('Certificate file not available');
            return;
        }

        const link = document.createElement('a');
        link.href = `http://localhost:5000${certificate.certificateUrl}`;
        link.download = `certificate_${courseTitle}.pdf`;
        link.click();
    };


    if (!isUnlocked) {
        return (
            <div className="card border-2 border-dashed border-gray-300">
                <div className="text-center py-8">
                    <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Certificate Locked
                    </h3>
                    <p className="text-gray-600">
                        Complete the entire course to unlock your certificate
                    </p>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress?.percentComplete || 0}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{progress?.percentComplete || 0}% Complete</p>
                    </div>
                </div>
            </div>
        );
    }

    if (certificate?.isGenerated) {
        return (
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Certificate Ready! 🎉
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Congratulations on completing the course
                    </p>

                    <div className="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto">
                        <div className="text-sm text-gray-600 mb-1">Certificate ID</div>
                        <div className="font-mono text-lg font-bold text-primary-600">
                            {certificate.certificateId}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Generated on {new Date(certificate.generatedAt).toLocaleDateString()}
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <FiDownload />
                        Download Certificate
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <div className="text-center py-8">
                <FiAward className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ready to Claim Your Certificate!
                </h3>
                <p className="text-gray-600 mb-6">
                    You've completed the course. Generate your certificate now.
                </p>
                <button
                    onClick={handleGenerateCertificate}
                    disabled={generating}
                    className="btn-primary"
                >
                    {generating ? 'Generating...' : 'Generate Certificate'}
                </button>
            </div>
        </div>
    );
};

export default Certificate;
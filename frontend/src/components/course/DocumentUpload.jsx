import { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DocumentUpload = ({ onDocumentAdd }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF, DOC, DOCX, and TXT files are allowed');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'your_upload_preset'); // Cloudinary preset

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                const document = {
                    type: getFileType(file.type),
                    title: file.name,
                    url: data.secure_url,
                    fileSize: file.size
                };

                onDocumentAdd(document);
                toast.success('Document uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const getFileType = (mimeType) => {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
        return 'other';
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Documents (Optional)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
                    <FiUpload />
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, TXT (Max 10MB)
                </span>
            </div>
        </div>
    );
};

const DocumentList = ({ documents, onRemove }) => {
    if (!documents || documents.length === 0) return null;

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Uploaded Documents
            </label>
            <div className="space-y-2">
                {documents.map((doc, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <FiFile className="text-primary-600" size={20} />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.title}</p>
                                <p className="text-xs text-gray-500">
                                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { DocumentUpload, DocumentList };
const cloudinary = require('../config/cloudinary');

// Upload single file
const uploadSingleFile = async (file, folder = 'lms') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: 'auto',
        });

        return {
            public_id: result.public_id,
            url: result.secure_url,
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error('File upload failed');
    }
};

// Upload multiple files
const uploadMultipleFiles = async (files, folder = 'lms') => {
    const uploadPromises = files.map((file) => uploadSingleFile(file, folder));
    return Promise.all(uploadPromises);
};

// Delete file from cloudinary
const deleteFile = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error('Delete error:', error);
        throw new Error('File deletion failed');
    }
};

module.exports = {
    uploadSingleFile,
    uploadMultipleFiles,
    deleteFile,
};
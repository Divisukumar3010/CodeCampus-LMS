const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image from buffer
exports.uploadImage = async (buffer, folder = 'lms') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1920, height: 1080, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

// Upload video from buffer
exports.uploadVideo = async (buffer, folder = 'lms/videos') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'video',
                chunk_size: 6000000, // 6MB chunks
                eager: [
                    { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
                ],
                eager_async: true
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

// Upload document/resource
exports.uploadDocument = async (buffer, folder = 'lms/resources') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'raw'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

// Delete file from Cloudinary
exports.deleteFile = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
    }
};

// Get video duration and metadata
exports.getVideoMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: 'video'
        });
        return {
            duration: result.duration,
            format: result.format,
            width: result.width,
            height: result.height,
            url: result.secure_url
        };
    } catch (error) {
        console.error('Error getting video metadata:', error);
        throw error;
    }
};

// module.exports = cloudinary;
const User = require('../models/User');
const { uploadImage, deleteFile } = require('../config/cloudinary');

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's public profile
// @route   GET /api/users/:userId/profile
// @access  Public
exports.getUserPublicProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name avatar bio role skills education experience socialMedia');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/update
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Fields that can be updated
        const { name, email, phone, bio, socialMedia, skills, education, experience } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;

        // Parse JSON strings if they come from FormData
        if (socialMedia) {
            user.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
        }
        if (skills) {
            user.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
        }
        if (education) {
            user.education = typeof education === 'string' ? JSON.parse(education) : education;
        }
        if (experience) {
            user.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
        }

        // Handle avatar upload
        if (req.file) {
            // Delete old avatar from Cloudinary if it exists and isn't the default
            if (user.avatar?.public_id) {
                await deleteFile(user.avatar.public_id);
            }

            // Upload new avatar
            const result = await uploadImage(req.file.buffer, 'lms/avatars');
            user.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        await user.save();

        // Return user without sensitive fields
        const updatedUser = await User.findById(user._id).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user avatar
// @route   DELETE /api/users/profile/avatar
// @access  Private
exports.deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete from Cloudinary
        if (user.avatar?.public_id) {
            await deleteFile(user.avatar.public_id);
        }

        // Reset to default avatar
        user.avatar = {
            public_id: null,
            url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff&size=200`
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar deleted successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('name email avatar role bio').limit(20);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

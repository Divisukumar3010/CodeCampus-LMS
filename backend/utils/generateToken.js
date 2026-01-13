const jwt = require('jsonwebtoken');

// Generate JWT Access Token
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        }
    );
};

// Generate JWT Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
        }
    );
};

// Verify Token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Generate password reset token
const generateResetToken = () => {
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const hashedToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    return { resetToken, hashedToken };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    generateResetToken,
};
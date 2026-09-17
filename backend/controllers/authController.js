const crypto = require('crypto');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
    sendWelcomeEmail,
    sendLoginNotificationEmail,
    sendPasswordResetEmail
} = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.status(statusCode)
        .cookie('token', accessToken, options)
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 30 * 24 * 60 * 60 * 1000 })
        .json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified
            }
        });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Prevent direct admin registration
        const userRole = role === 'admin' ? 'student' : role;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: userRole || 'student'
        });

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Send Welcome Email asynchronously
        try {
            sendWelcomeEmail(user).catch(err => console.error('⚠️ Welcome email send failed:', err.message));
        } catch (emailErr) {
            console.error('⚠️ Welcome email error:', emailErr.message);
        }

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Send Login Notification Email asynchronously
        try {
            sendLoginNotificationEmail(user, {
                ip: req.ip || req.headers['x-forwarded-for'] || 'Localhost',
                userAgent: req.headers['user-agent'] || 'Web Browser'
            }).catch(err => console.error('⚠️ Login notification email failed:', err.message));
        } catch (emailErr) {
            console.error('⚠️ Login notification error:', emailErr.message);
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('enrolledCourses', 'title thumbnail price')
            .populate('createdCourses', 'title thumbnail enrollmentCount averageRating');

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Get user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const newAccessToken = user.generateAccessToken();

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            bio: req.body.bio,
            expertise: req.body.expertise
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key =>
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change or Set password (supports Google OAuth accounts creating a password)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        // If the user already has a password, verify their current password
        if (user.password) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide your current password'
                });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }

        // Set or update password
        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password - Request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Anti-enumeration security requirement: Return identical generic message whether account exists or not
        const genericMessage = 'If an account exists for this email address, a password reset link has been sent.';

        if (!user) {
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        // Generate and save token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user, resetToken);
            console.log(`✅ Password reset email dispatched for ${user.email}`);
        } catch (err) {
            console.error('❌ Failed to dispatch password reset email:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Error sending password reset email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: genericMessage
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password with secure token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { password, confirmPassword } = req.body;
        const resetToken = req.params.token;

        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Hash token from param to compare with database hash
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset link. Please request a new one.'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// Helper to determine base URLs
const getBackendUrl = (req) => {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    return `${protocol}://${host}`;
};

const getFrontendUrl = () => {
    const raw = process.env.FRONTEND_URL;
    if (raw) {
        const first = raw.split(',')[0].trim();
        if (first) return first;
    }
    return 'http://localhost:5173';
};

// @desc    Initiate Real Google OAuth 2.0 redirect
// @route   GET /api/auth/google
// @access  Public
exports.initiateGoogleAuth = async (req, res, next) => {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes('your_google_client_id')) {
            return res.status(500).send(`
                <html>
                <body style="font-family:sans-serif;padding:2rem;text-align:center;">
                    <h2>Google OAuth Not Configured</h2>
                    <p>Please configure <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in <code>backend/.env</code> to proceed with Google Login.</p>
                    <a href="${getFrontendUrl()}/login" style="color:#4f46e5;font-weight:bold;">Return to Login</a>
                </body>
                </html>
            `);
        }

        // Generate cryptographic state for CSRF prevention
        const state = crypto.randomBytes(24).toString('hex');
        res.cookie('oauth_state_google', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        const redirectUri = `${getBackendUrl(req)}/api/auth/google/callback`;
        const scope = encodeURIComponent('openid email profile');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=select_account&access_type=offline`;

        res.redirect(authUrl);
    } catch (error) {
        next(error);
    }
};

// @desc    Google OAuth Callback (handles authorization code from Google)
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res, next) => {
    const frontendUrl = getFrontendUrl();
    try {
        const { code, state, error } = req.query;

        if (error) {
            console.error('Google Auth Error from provider:', error);
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent(error)}`);
        }

        if (!code) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('No authorization code provided by Google')}`);
        }

        // Validate state
        const savedState = req.cookies.oauth_state_google;
        res.clearCookie('oauth_state_google');
        if (!state || state !== savedState) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Authentication security state mismatch. Please try again.')}`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${getBackendUrl(req)}/api/auth/google/callback`;

        // Exchange authorization code for tokens directly with Google
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });

        const { id_token, access_token } = tokenRes.data;

        // Cryptographically verify ID token with Google's public keys
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: clientId
        });
        const payload = ticket.getPayload();

        const email = payload.email?.toLowerCase();
        const name = payload.name;
        const picture = payload.picture;
        const googleId = payload.sub;

        if (!email) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Google account did not return a verified email address')}`);
        }

        // Safe Account Linking or New User Creation
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            if (!user.googleId) user.googleId = googleId;
            if (user.authProvider === 'local') user.authProvider = 'google';
            if (picture && (!user.avatar?.url || user.avatar?.url.includes('ui-avatars.com'))) {
                user.avatar = { url: picture };
            }
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        } else {
            user = await User.create({
                name: name || 'Google Scholar',
                email,
                googleId,
                authProvider: 'google',
                role: 'student',
                isVerified: true,
                avatar: picture ? { url: picture } : undefined,
                lastLogin: Date.now()
            });

            try {
                sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));
            } catch (e) {
                // Ignore email failure
            }
        }

        if (!user.isActive) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Your academic account is deactivated')}`);
        }

        // Set Auth JWT tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.cookie('token', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

        return res.redirect(`${frontendUrl}/oauth/callback?success=true&token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
        console.error('Google Callback Error:', err.response?.data || err.message);
        return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent(err.response?.data?.error_description || err.message || 'Google authentication failed')}`);
    }
};

// @desc    Initiate Real Microsoft OAuth 2.0 redirect
// @route   GET /api/auth/microsoft
// @access  Public
exports.initiateMicrosoftAuth = async (req, res, next) => {
    try {
        const clientId = process.env.MICROSOFT_CLIENT_ID;
        const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

        if (!clientId || clientId.includes('your_microsoft_client_id')) {
            return res.status(500).send(`
                <html>
                <body style="font-family:sans-serif;padding:2rem;text-align:center;">
                    <h2>Microsoft OAuth Not Configured</h2>
                    <p>Please configure <code>MICROSOFT_CLIENT_ID</code> and <code>MICROSOFT_CLIENT_SECRET</code> in <code>backend/.env</code> to proceed with Microsoft Login.</p>
                    <a href="${getFrontendUrl()}/login" style="color:#4f46e5;font-weight:bold;">Return to Login</a>
                </body>
                </html>
            `);
        }

        // Generate cryptographic state
        const state = crypto.randomBytes(24).toString('hex');
        res.cookie('oauth_state_microsoft', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000
        });

        const redirectUri = `${getBackendUrl(req)}/api/auth/microsoft/callback`;
        const scope = encodeURIComponent('openid profile email User.Read');
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;

        res.redirect(authUrl);
    } catch (error) {
        next(error);
    }
};

// @desc    Microsoft OAuth Callback (handles authorization code from Microsoft)
// @route   GET /api/auth/microsoft/callback
// @access  Public
exports.microsoftCallback = async (req, res, next) => {
    const frontendUrl = getFrontendUrl();
    try {
        const { code, state, error, error_description } = req.query;

        if (error) {
            console.error('Microsoft Auth Error from provider:', error, error_description);
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent(error_description || error)}`);
        }

        if (!code) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('No authorization code provided by Microsoft')}`);
        }

        // Validate state
        const savedState = req.cookies.oauth_state_microsoft;
        res.clearCookie('oauth_state_microsoft');
        if (!state || state !== savedState) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Authentication security state mismatch. Please try again.')}`);
        }

        const clientId = process.env.MICROSOFT_CLIENT_ID;
        const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
        const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
        const redirectUri = `${getBackendUrl(req)}/api/auth/microsoft/callback`;

        // Exchange authorization code for tokens with Microsoft Token Endpoint
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('grant_type', 'authorization_code');

        const tokenRes = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenRes.data;

        // Fetch verified user profile directly from Microsoft Graph API
        const graphRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const email = (graphRes.data.mail || graphRes.data.userPrincipalName)?.toLowerCase();
        const name = graphRes.data.displayName;
        const microsoftId = graphRes.data.id;

        if (!email) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Microsoft account did not return a verified email address')}`);
        }

        // Safe Account Linking or New User Creation
        let user = await User.findOne({
            $or: [{ microsoftId }, { email }]
        });

        if (user) {
            if (!user.microsoftId) user.microsoftId = microsoftId;
            if (user.authProvider === 'local') user.authProvider = 'microsoft';
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        } else {
            user = await User.create({
                name: name || 'Microsoft Scholar',
                email,
                microsoftId,
                authProvider: 'microsoft',
                role: 'student',
                isVerified: true,
                lastLogin: Date.now()
            });

            try {
                sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));
            } catch (e) {
                // Ignore email failure
            }
        }

        if (!user.isActive) {
            return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Your academic account is deactivated')}`);
        }

        // Set Auth JWT tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.cookie('token', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

        return res.redirect(`${frontendUrl}/oauth/callback?success=true&token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
        console.error('Microsoft Callback Error:', err.response?.data || err.message);
        return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent(err.response?.data?.error_description || err.message || 'Microsoft authentication failed')}`);
    }
};

// @desc    Direct ID Token / Access Token verification (API fallback without mock)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
    try {
        const { credential, accessToken } = req.body;

        let email;
        let name;
        let picture;
        let googleId;

        if (credential) {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload.email?.toLowerCase();
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        } else if (accessToken) {
            const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            email = googleRes.data.email?.toLowerCase();
            name = googleRes.data.name;
            picture = googleRes.data.picture;
            googleId = googleRes.data.sub;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Official Google authentication credential or access token is required'
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Verified email address not found in Google credentials'
            });
        }

        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            if (!user.googleId) user.googleId = googleId;
            if (user.authProvider === 'local') user.authProvider = 'google';
            if (picture && (!user.avatar?.url || user.avatar?.url.includes('ui-avatars.com'))) {
                user.avatar = { url: picture };
            }
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        } else {
            user = await User.create({
                name: name || 'Google Scholar',
                email,
                googleId,
                authProvider: 'google',
                role: 'student',
                isVerified: true,
                avatar: picture ? { url: picture } : undefined,
                lastLogin: Date.now()
            });

            try {
                sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));
            } catch (e) {
                // Ignore email failure
            }
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Google authentication token verification failed: ' + error.message
        });
    }
};

// @desc    Direct Microsoft Access Token verification (API fallback without mock)
// @route   POST /api/auth/microsoft
// @access  Public
exports.microsoftAuth = async (req, res, next) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Official Microsoft access token is required'
            });
        }

        const msRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const email = (msRes.data.mail || msRes.data.userPrincipalName)?.toLowerCase();
        const name = msRes.data.displayName;
        const microsoftId = msRes.data.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Microsoft account did not return a verified email address'
            });
        }

        let user = await User.findOne({
            $or: [{ microsoftId }, { email }]
        });

        if (user) {
            if (!user.microsoftId) user.microsoftId = microsoftId;
            if (user.authProvider === 'local') user.authProvider = 'microsoft';
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        } else {
            user = await User.create({
                name: name || 'Microsoft Scholar',
                email,
                microsoftId,
                authProvider: 'microsoft',
                role: 'student',
                isVerified: true,
                lastLogin: Date.now()
            });

            try {
                sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));
            } catch (e) {
                // Ignore email failure
            }
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Microsoft token verification failed: ' + error.message
        });
    }
};
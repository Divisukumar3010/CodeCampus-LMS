const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'CodeCampus'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
    attachments: options.attachments || [],
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CodeCampus! 🎓</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for joining CodeCampus! We're excited to have you on board.</p>
          <p>As a ${user.role}, you can now:</p>
          <ul>
            ${user.role === 'student' ? `
              <li>Browse thousands of courses</li>
              <li>Track your learning progress</li>
              <li>Earn certificates</li>
              <li>Connect with expert instructors</li>
            ` : `
              <li>Create and publish courses</li>
              <li>Reach thousands of students</li>
              <li>Track your earnings</li>
              <li>Build your teaching career</li>
            `}
          </ul>
          <a href="${(process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim()}/dashboard" class="button">Go to Dashboard</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy Learning!</p>
          <p><strong>The CodeCampus Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CodeCampus. All rights reserved.</p>
          <p>You received this email because you signed up for CodeCampus.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Welcome to CodeCampus - Start Your Learning Journey!',
    html,
  });
};

const sendEnrollmentEmail = async (user, course) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .course-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Enrollment Successful!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Congratulations! You've successfully enrolled in:</p>
          <div class="course-card">
            <h3>${course.title}</h3>
            <p><strong>Instructor:</strong> ${course.trainer.name}</p>
            <p><strong>Lessons:</strong> ${course.totalLessons}</p>
          </div>
          <a href="${(process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim()}/course/view/${course._id}" class="button">Start Learning Now</a>
          <p>Your learning journey begins now. Take your time, practice, and don't hesitate to ask questions!</p>
          <p>Good luck!</p>
          <p><strong>The CodeCampus Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email: user.email,
    subject: `You're enrolled in ${course.title}!`,
    html,
  });
};

const sendCourseApprovalEmail = async (trainer, course, isApproved) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>Course ${isApproved ? 'Approved' : 'Rejected'}</h2>
      <p>Hi ${trainer.name},</p>
      <p>Your course "<strong>${course.title}</strong>" has been ${isApproved ? 'approved' : 'rejected'}.</p>
      ${isApproved
      ? '<p>It is now live on the platform and students can enroll!</p>'
      : '<p>Please review the course content and resubmit for approval.</p>'
    }
      <p>Best regards,<br>CodeCampus Team</p>
    </body>
    </html>
  `;

  return sendEmail({
    email: trainer.email,
    subject: `Course ${isApproved ? 'Approved' : 'Rejected'}: ${course.title}`,
    html,
  });
};

const sendCertificateEmail = async (user, course, certificateData) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
  const verifyUrl = `${frontendUrl}/verify/${certificateData.certificateId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 620px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #047857 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; font-weight: 400; }
        .badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fef08a; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 36px 32px; }
        .cert-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .cert-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .cert-meta { font-size: 13px; color: #64748b; line-height: 1.8; }
        .cert-id { font-family: 'Courier New', monospace; font-weight: bold; color: #1e3a8a; background: #e0e7ff; padding: 3px 8px; border-radius: 6px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 12px 0 20px 0; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }
        .footer { background: #f1f5f9; text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Certificate of Completion</h1>
          <p>Congratulations on reaching a major milestone!</p>
          <div class="badge">Verified Credential Issued</div>
        </div>
        <div class="content">
          <h2>Dear ${user.name},</h2>
          <p>Congratulations on successfully completing all curriculum modules and passing the examination for <strong>${course.title}</strong> on CodeCampus!</p>
          
          <div class="cert-card">
            <div class="cert-title">${course.title}</div>
            <div class="cert-meta">
              <div><strong>Recipient:</strong> ${user.name}</div>
              <div><strong>Certificate ID:</strong> <span class="cert-id">${certificateData.certificateId}</span></div>
              <div><strong>Conferred on:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>Verification Status:</strong> Officially Authenticated & Verified</div>
            </div>
          </div>

          <p>Your official high-resolution certificate PDF is attached directly to this email for your records and career portfolio.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" class="button" target="_blank">Verify Certificate Online</a>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            You can share this credential on LinkedIn, include it on your resume, or share the verification link with potential employers.
          </p>
          <p style="margin-top: 24px;">Best regards,<br><strong>CodeCampus Academic Accreditation Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CodeCampus LMS. All rights reserved.</p>
          <p>This credential was issued to ${user.email} in accordance with CodeCampus examination standards.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = [];
  if (certificateData.filePath) {
    attachments.push({
      filename: `${course.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Certificate.pdf`,
      path: certificateData.filePath,
    });
  }

  return sendEmail({
    email: user.email,
    subject: `🎓 Your Certificate of Completion: ${course.title} (ID: ${certificateData.certificateId})`,
    html,
    attachments,
  });
};

const sendLoginNotificationEmail = async (user, meta = {}) => {
  const loginTime = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a, #334155); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 28px; }
        .info-card { background: #f1f5f9; border-radius: 10px; padding: 18px 20px; margin: 20px 0; font-size: 14px; }
        .button { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 10px; }
        .footer { background: #f8fafc; text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Account Login Notification</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>We noticed a successful sign-in to your CodeCampus account.</p>
          
          <div class="info-card">
            <div><strong>Account:</strong> ${user.email}</div>
            <div><strong>Time:</strong> ${loginTime}</div>
            ${meta.ip ? `<div><strong>IP Address:</strong> ${meta.ip}</div>` : ''}
            ${meta.userAgent ? `<div><strong>Device / Browser:</strong> ${meta.userAgent}</div>` : ''}
          </div>

          <p>If this was you, you can safely disregard this email.</p>
          <p style="color: #dc2626; font-size: 13px;">If you did not log in, please reset your password immediately or contact our security team.</p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CodeCampus LMS. All rights reserved.</p>
          <p>Security notification sent to ${user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email: user.email,
    subject: `🔐 New Sign-in to CodeCampus Account (${user.name})`,
    html
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca); color: white; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; }
        .alert-card { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 20px 0; color: #92400e; font-size: 13px; }
        .button { display: inline-block; padding: 13px 32px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
        .footer { background: #f8fafc; text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .link-text { word-break: break-all; color: #4f46e5; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.85; font-size: 13px;">CodeCampus Academic LMS Security</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>We received a request to reset the password for your CodeCampus account.</p>
          <p>Click the button below to choose a new password:</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" class="button" target="_blank">Reset My Password</a>
          </div>

          <div class="alert-card">
            <strong>⏰ Security Notice:</strong> This password reset link is strictly valid for <strong>15 minutes</strong> and can only be used once.
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If you did not make this request, you can safely ignore this email. Your current password will remain unchanged and your account is secure.
          </p>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            Button not working? Copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" class="link-text">${resetUrl}</a>
          </p>

          <p style="margin-top: 24px; font-size: 14px;">
            Best regards,<br>
            <strong>CodeCampus Security Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CodeCampus LMS. All rights reserved.</p>
          <p>This automated security message was sent to ${user.email}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email: user.email,
    subject: '🔐 CodeCampus Password Reset Request (Valid for 15 minutes)',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendCourseApprovalEmail,
  sendCertificateEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
};
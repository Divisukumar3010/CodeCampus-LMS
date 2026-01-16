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
    from: `${process.env.EMAIL_FROM_NAME || 'CodeCampus'} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
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
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
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
          <a href="${process.env.FRONTEND_URL}/course/view/${course._id}" class="button">Start Learning Now</a>
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

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendCourseApprovalEmail,
};
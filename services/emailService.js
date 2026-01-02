import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: this.parseBoolean(process.env.SMTP_SECURE),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
    this.createTransporter();
  }

  /**
   * Parse boolean string from environment variables
   */
  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return false;
  }

  createTransporter() {
    // Validate required SMTP configuration
    if (!this.smtpConfig.host || !this.smtpConfig.user || !this.smtpConfig.pass) {
      logger.warn('Email service not configured: Missing SMTP_HOST, SMTP_USER, or SMTP_PASS');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        auth: {
          user: this.smtpConfig.user,
          pass: this.smtpConfig.pass,
        },
      });

      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter connection error:', error);
        } else {
          logger.info('Email service configured and ready to send messages');
        }
      });
    } catch (error) {
      logger.error('Error initializing email transporter:', error);
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (!this.transporter) {
      logger.warn('Cannot send email: SMTP transporter not initialized');
      return null;
    }

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@elitehub.com';

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    // Determine frontend URL from env or use default
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const message = `
You are receiving this email because you (or someone else) have requested the reset of the password for your account.
Please click on the following link, or paste this into your browser to complete the process:

${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.
    `.trim();

    const htmlMessage = `
      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or paste this into your browser to complete the process:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>Or copy and paste this URL: ${resetUrl}</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      return await this.sendEmail({
        to: email,
        subject: 'EliteHub - Password Reset Request',
        text: message,
        html: htmlMessage,
      });
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error.message);
      throw error;
    }
  }

  async sendNotificationEmail(to, subject, message) {
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif;">
        <h2>EliteHub Notification</h2>
        <p>${message}</p>
      </div>
    `;

    try {
      return await this.sendEmail({
        to,
        subject,
        text: message,
        html: htmlMessage,
      });
    } catch (error) {
      logger.error(`Failed to send notification email to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Get email service status
   */
  isConfigured() {
    return !!this.transporter && !!(this.smtpConfig.host && this.smtpConfig.user && this.smtpConfig.pass);
  }
}

export default new EmailService();

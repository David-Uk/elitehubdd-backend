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

  async sendGuestReservationEmail(reservationData) {
    const {
      reservationNumber,
      guestName,
      guestEmail,
      guestPhone,
      roomNumber,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      currency,
      status,
      specialRequests,
      bookingDate
    } = reservationData;

    const subject = `New Guest Reservation: ${reservationNumber} - ${guestName}`;
    
    const message = `
New Guest Reservation Details:

Reservation Number: ${reservationNumber}
Guest Name: ${guestName}
Guest Email: ${guestEmail}
Guest Phone: ${guestPhone}
Room Number: ${roomNumber}
Room Type: ${roomType}
Check-in Date: ${new Date(checkInDate).toLocaleString()}
Check-out Date: ${new Date(checkOutDate).toLocaleString()}
Number of Guests: ${numberOfGuests}
Total Amount: ${currency} ${totalAmount}
Status: ${status}
Special Requests: ${specialRequests || 'None'}
Booking Date: ${new Date(bookingDate).toLocaleString()}

This reservation requires staff approval.
    `.trim();

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Guest Reservation</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Reservation Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Reservation Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reservationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Guest Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${guestName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Guest Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${guestEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Guest Phone:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${guestPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Room Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${roomNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Room Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${roomType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Check-in Date:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(checkInDate).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Check-out Date:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(checkOutDate).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Number of Guests:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${numberOfGuests}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Total Amount:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${currency} ${totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Status:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="color: #ff9800;">${status.toUpperCase()}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Special Requests:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${specialRequests || 'None'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Booking Date:</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(bookingDate).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;"><strong>Note:</strong> This reservation requires staff approval.</p>
        </div>
      </div>
    `;

    try {
      return await this.sendEmail({
        to: 'info@elitehubbydd.com',
        subject,
        text: message,
        html: htmlMessage,
      });
    } catch (error) {
      logger.error(`Failed to send guest reservation email for ${reservationNumber}:`, error.message);
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

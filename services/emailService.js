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
════════════════════════════════════════════════════════════════════════════════
🏨 ELITEHUB HOTEL - NEW GUEST RESERVATION
════════════════════════════════════════════════════════════════════════════════

RESERVATION DETAILS
────────────────────────────────────────────────────────────────────────────

Reservation Number:  ${reservationNumber}
Guest Name:          ${guestName}
Guest Email:         ${guestEmail}
Guest Phone:         ${guestPhone}
Room Number:         ${roomNumber}
Room Type:           ${roomType}
Check-in Date:       ${new Date(checkInDate).toLocaleString('en-US', { 
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
Check-out Date:      ${new Date(checkOutDate).toLocaleString('en-US', { 
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
Number of Guests:    ${numberOfGuests} ${numberOfGuests === 1 ? 'Guest' : 'Guests'}
Total Amount:        ${currency} ${totalAmount.toFixed(2)}
Status:              ${status.toUpperCase()}
Special Requests:    ${specialRequests || 'None'}
Booking Date:        ${new Date(bookingDate).toLocaleString('en-US', { 
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

════════════════════════════════════════════════════════════════════════════════
⚠️  IMPORTANT: ACTION REQUIRED
════════════════════════════════════════════════════════════════════════════════

This reservation requires staff approval.

Please review the reservation details and update the status to 
"confirmed" or "rejected" in the system.

Guest will receive a confirmation email once the reservation is approved.

════════════════════════════════════════════════════════════════════════════════
Generated automatically by EliteHub Hotel Reservation System
For technical issues, contact the system administrator
════════════════════════════════════════════════════════════════════════════════
    `.trim();

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Guest Reservation</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #fff;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #007bff; 
            margin: 0;
            font-size: 28px;
          }
          .header p { 
            color: #666; 
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .section { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
          }
          .section h2 { 
            color: #007bff; 
            margin-top: 0; 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 10px;
            font-size: 20px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 200px 1fr; 
            gap: 10px; 
            margin-bottom: 20px;
          }
          .info-label { 
            font-weight: bold; 
            color: #495057; 
            padding: 8px;
            background: #e9ecef;
            border-radius: 4px;
          }
          .info-value { 
            padding: 8px;
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 4px;
          }
          .status-pending { 
            color: #ff9800; 
            font-weight: bold;
            background: #fff3cd;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ffeaa7;
          }
          .important-note { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7;
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 20px;
            border-left: 5px solid #ffc107;
          }
          .important-note h3 { 
            color: #856404; 
            margin-top: 0;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #dee2e6; 
            text-align: center; 
            color: #6c757d; 
            font-size: 12px;
          }
          @media print {
            body { font-size: 12px; }
            .header { page-break-after: always; }
            .section { page-break-inside: avoid; }
            .important-note { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏨 NEW GUEST RESERVATION</h1>
          <p>EliteHub Hotel - Reservation Notification</p>
        </div>

        <div class="section">
          <h2>📋 Reservation Details</h2>
          <div class="info-grid">
            <div class="info-label">Reservation Number:</div>
            <div class="info-value"><strong>${reservationNumber}</strong></div>
            
            <div class="info-label">Guest Name:</div>
            <div class="info-value">${guestName}</div>
            
            <div class="info-label">Guest Email:</div>
            <div class="info-value">${guestEmail}</div>
            
            <div class="info-label">Guest Phone:</div>
            <div class="info-value">${guestPhone}</div>
            
            <div class="info-label">Room Number:</div>
            <div class="info-value"><strong>${roomNumber}</strong></div>
            
            <div class="info-label">Room Type:</div>
            <div class="info-value">${roomType}</div>
            
            <div class="info-label">Check-in Date:</div>
            <div class="info-value">${new Date(checkInDate).toLocaleString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
            
            <div class="info-label">Check-out Date:</div>
            <div class="info-value">${new Date(checkOutDate).toLocaleString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
            
            <div class="info-label">Number of Guests:</div>
            <div class="info-value">${numberOfGuests} ${numberOfGuests === 1 ? 'Guest' : 'Guests'}</div>
            
            <div class="info-label">Total Amount:</div>
            <div class="info-value"><strong>${currency} ${totalAmount.toFixed(2)}</strong></div>
            
            <div class="info-label">Status:</div>
            <div class="status-pending">⏳ ${status.toUpperCase()}</div>
            
            <div class="info-label">Special Requests:</div>
            <div class="info-value">${specialRequests || 'None'}</div>
            
            <div class="info-label">Booking Date:</div>
            <div class="info-value">${new Date(bookingDate).toLocaleString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
        </div>

        <div class="important-note">
          <h3>⚠️ IMPORTANT: Action Required</h3>
          <p><strong>This reservation requires staff approval.</strong></p>
          <p>Please review the reservation details and update the status to "confirmed" or "rejected" in the system.</p>
          <p>Guest will receive a confirmation email once the reservation is approved.</p>
        </div>

        <div class="footer">
          <p>This email was generated automatically by the EliteHub Hotel Reservation System</p>
          <p>For any technical issues, please contact the system administrator</p>
        </div>
      </body>
      </html>
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

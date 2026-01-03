import emailService from '../services/emailService.js';

// Test data for guest reservation email
const testReservationData = {
  reservationNumber: 'RES-20260103-123456789',
  guestName: 'John Doe',
  guestEmail: 'john.doe@example.com',
  guestPhone: '+1234567890',
  roomNumber: '101',
  roomType: 'Deluxe Suite',
  checkInDate: '2026-01-15T14:00:00.000Z',
  checkOutDate: '2026-01-17T11:00:00.000Z',
  numberOfGuests: 2,
  totalAmount: 300.00,
  currency: 'NGN',
  status: 'pending',
  specialRequests: 'Late check-in requested',
  bookingDate: new Date().toISOString()
};

async function testGuestReservationEmail() {
  try {
    console.log('Testing guest reservation email functionality...');
    console.log('Email service configured:', emailService.isConfigured());
    
    // Test sending the email
    const result = await emailService.sendGuestReservationEmail(testReservationData);
    
    if (result) {
      console.log('✅ Guest reservation email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Email sent to: info@elitehubbydd.com');
    } else {
      console.log('❌ Email service not configured or failed to send');
    }
  } catch (error) {
    console.error('❌ Error testing guest reservation email:', error.message);
  }
}

// Run the test
testGuestReservationEmail();

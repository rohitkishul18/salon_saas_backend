// Utility to send booking notification emails to salon owners
const transporter = require('../config/email.config');
const sendBookingNotification = (salon, location, service, customerName, customerPhone, scheduledAt, notes, callback) => {
  if (!salon || !salon.contact?.email) {
    console.warn('No salon owner email found for notification');
    return callback(new Error('No email configured'), null);
  }

  const ownerEmail = salon.contact.email;
  const serviceName = service.name || 'Unknown Service';
  const formattedScheduledAt = new Date(scheduledAt).toLocaleString('en-IN', {
    timeZone: salon.settings?.timezone || 'Asia/Kolkata'
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: ownerEmail, 
    subject: `New Booking Alert: ${customerName} at ${location.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">New Appointment Booked! 🎉</h2>
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p><strong>Salon:</strong> ${salon.name}</p>
          <p><strong>Branch/Location:</strong> ${location.name}</p>
          <p><strong>Address:</strong> ${location.address || salon.contact.address}</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3>Booking Details</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Scheduled At:</strong> ${formattedScheduledAt}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="text-align: center; color: #666;">This is an automated notification. Reply to this email if needed.</p>
        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email notification failed:', error);
      return callback(error, null);
    } else {
      console.log('Booking email sent successfully:', info.messageId);
      return callback(null, info);
    }
  });
};

module.exports = { sendBookingNotification };
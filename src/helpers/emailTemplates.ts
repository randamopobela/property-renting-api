export const paymentReceivedTemplate = (userName: string, bookingId: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #0d9488;">Pembayaran Diterima</h2>
    <p>Halo ${userName},</p>
    <p>Terima kasih telah melakukan pembayaran untuk Booking ID: <strong>${bookingId}</strong>.</p>
    <p>Saat ini Tenant sedang memverifikasi bukti bayar Anda. Mohon tunggu maksimal 1x24 jam.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">StayEase Team</p>
  </div>
`;

export const bookingConfirmedTemplate = (userName: string, bookingId: string, propertyName: string, checkIn: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #0d9488;">Booking Dikonfirmasi! 🎉</h2>
    <p>Halo ${userName},</p>
    <p>Selamat! Pesanan Anda di <strong>${propertyName}</strong> telah disetujui.</p>
    
    <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Status:</strong> LUNAS</p>
    </div>

    <p>Silakan tunjukkan email ini saat check-in.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">StayEase Team</p>
  </div>
`;

export const reminderEmailTemplate = (userName: string, propertyName: string, checkInDate: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #0d9488; margin: 0;">Besok Waktunya Check-in! 🎒</h2>
    </div>
    
    <p>Halo <strong>${userName}</strong>,</p>
    <p>Ini adalah pengingat bahwa Anda memiliki jadwal menginap besok di <strong>${propertyName}</strong>.</p>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
      <p style="margin: 5px 0;"><strong>📅 Tanggal Check-in:</strong> ${checkInDate}</p>
      <p style="margin: 5px 0;"><strong>📍 Properti:</strong> ${propertyName}</p>
    </div>

    <p>Pastikan Anda membawa kartu identitas saat kedatangan. Kami tidak sabar menyambut Anda!</p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #888; text-align: center;">StayEase Team</p>
  </div>
`;
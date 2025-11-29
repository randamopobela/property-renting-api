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
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

export const reminderEmailTemplate = (guestName: string, propertyName: string, checkInDate: string) => {
    return `
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f7f7f7;">
                    <h2 style="color: #00796b;">Pengingat: Check-in Besok! 🎒</h2>
                    <p>Halo, ${guestName},</p>
                    <p>Kami ingin mengingatkan bahwa waktu check-in Anda untuk penginapan berikut adalah **Besok!**</p>
                    
                    <div style="background-color: #e0f2f1; padding: 15px; border-radius: 6px; margin-top: 15px;">
                        <p style="margin: 0;"><strong>Nama Properti:</strong> ${propertyName}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Tanggal Check-in:</strong> ${checkInDate}</p>
                    </div>

                    <p style="margin-top: 20px; font-size: 0.9em; color: #555;">
                        Pastikan Anda membawa identitas yang diperlukan. Jika ada pertanyaan, silakan hubungi Tenant Anda.
                    </p>
                    
                    <p style="margin-top: 30px; text-align: center;">
                        <a href="http://localhost:3000/user/my-bookings" 
                           style="background-color: #00796b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                           Lihat Detail Pesanan
                        </a>
                    </p>
                </div>
            </body>
        </html>
    `;
};

export const paymentRejectedTemplate = (guestName: string, bookingId: string) => {
    return `
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #c0392b;">Pemberitahuan Penolakan Bukti Pembayaran</h2>
                    <p>Halo, ${guestName},</p>
                    <p>Kami telah meninjau bukti pembayaran Anda untuk Pesanan ID **${bookingId}** dan mohon maaf, kami harus menolaknya. Ini mungkin disebabkan oleh bukti yang buram, tidak lengkap, atau tidak sesuai.</p>
                    <p style="margin-top: 20px;">
                        <strong>Tindakan yang Harus Dilakukan:</strong>
                    </p>
                    <ol style="padding-left: 20px;">
                        <li>Segera cek kembali status pesanan Anda.</li>
                        <li>Silakan **upload ulang** bukti transfer yang jelas dan valid.</li>
                        <li>Pesanan Anda akan tetap pada status Menunggu Pembayaran (PENDING).</li>
                    </ol>
                    <p style="margin-top: 30px; text-align: center;">
                        <a href="http://localhost:3000/user/my-bookings" 
                           style="background-color: #c0392b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                           Cek Pesanan Saya
                        </a>
                    </p>
                    <p style="font-size: 0.9em; color: #777; margin-top: 20px;">
                        Terima kasih atas kerja samanya.
                    </p>
                </div>
            </body>
        </html>
    `;
};

// Tambahkan function ini ke dalam file emailTemplates.ts Anda

/**
 * Template untuk notifikasi sukses pembayaran via Midtrans/Gateway.
 * Dipanggil oleh Webhook (PaymentService).
 */
export const paymentSuccessTemplate = (
    guestName: string, 
    bookingId: string, 
    propertyName: string, 
    checkInDate: string,
    amount: string | number // Ambil dari gross_amount notifikasi
) => {
    // Format jumlah untuk tampilan yang lebih baik
    const formattedAmount = Number(amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

    return `
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #00796b; border-radius: 8px; background-color: #e0f2f1;">
                    <h2 style="color: #00796b;">Pembayaran Berhasil Dikonfirmasi! 🎉</h2>
                    <p>Halo, ${guestName},</p>
                    <p>Pembayaran Anda sebesar <strong>${formattedAmount}</strong> untuk pesanan berikut telah kami terima dan berhasil dikonfirmasi:</p>
                    
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #b2dfdb;">
                        <p style="margin: 0;"><strong>ID Pesanan:</strong> ${bookingId}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Properti:</strong> ${propertyName}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Check-in:</strong> ${checkInDate}</p>
                    </div>

                    <p style="margin-top: 20px;">
                        Pesanan Anda sekarang berstatus **LUNAS (PAID)**. Kami menantikan kedatangan Anda!
                    </p>
                    
                    <p style="margin-top: 30px; text-align: center;">
                        <a href="http://localhost:3000/user/my-bookings" 
                           style="background-color: #00796b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                           Lihat Riwayat Pesanan
                        </a>
                    </p>
                    <p style="font-size: 0.9em; color: #777; margin-top: 20px;">
                        Email ini dikirim otomatis oleh sistem Midtrans.
                    </p>
                </div>
            </body>
        </html>
    `;
};
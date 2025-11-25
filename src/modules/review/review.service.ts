import { PrismaClient, BookingStatus } from '../../generated/prisma'; // Sesuaikan path ke generated prisma
import { CreateReviewRequest } from '../../types/review.type';

const prisma = new PrismaClient();

export class ReviewService {
  
  // 1. Create Review (User memberikan ulasan)
  async createReview(userId: string, data: CreateReviewRequest) {
    const { bookingId, comment } = data;

    // A. Cek apakah Booking ada?
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true } // Kita butuh propertyId dari room
    });

    if (!booking) throw new Error("Booking not found");
    
    // B. Validasi Kepemilikan: Apakah yang mau review adalah pemesan asli?
    if (booking.userId !== userId) throw new Error("Unauthorized: You did not make this booking");
    
    // C. Validasi Status: Hanya boleh review jika sudah selesai (COMPLETED) atau lunas (PAID)
    // Sesuai spek: "Review tempat penginapan dapat dilakukan ketika user selesai menginap"
    if (booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.PAID) {
        throw new Error("Cannot review unfinished booking. Status must be COMPLETED or PAID.");
    }

    // D. Simpan ke Database
    // (Tidak perlu cek duplikat manual, karena bookingId @unique di schema akan otomatis menolak)
    return await prisma.review.create({
      data: {
        userId: userId,
        propertyId: booking.room.propertyId, // Otomatis ambil dari relasi booking->room
        bookingId: bookingId,
        comment: comment
      }
    });
  }

  // 2. Get Reviews by Property (Public - Untuk ditampilkan di detail properti)
  async getPropertyReviews(propertyId: string) {
    return await prisma.review.findMany({
      where: { propertyId },
      include: {
        user: { 
            select: { firstName: true, lastName: true, profilePicture: true } 
        },
        // Sertakan info balasan tenant jika ada
        repliedByUser: {
            select: { 
                firstName: true, 
                // Perbaikan: Ambil company dari relasi tenant
                tenant: {
                    select: { company: true }
                }
            } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Reply Review (Tenant membalas ulasan)
  async replyReview(tenantUserId: string, reviewId: string, replyText: string) {
    // Validasi: Pastikan review ini ada di properti milik tenant tersebut
    // Kita cari reviewnya dulu, cek relasi ke property -> tenant -> userId
    const review = await prisma.review.findFirst({
        where: {
            id: reviewId,
            property: { 
                tenant: { userId: tenantUserId } // Query relasi ke tenant
            }
        }
    });

    if (!review) throw new Error("Review not found or you are not authorized to reply");

    // Update Review dengan balasan
    return await prisma.review.update({
        where: { id: reviewId },
        data: {
            reply: replyText,
            repliedBy: tenantUserId,
            repliedAt: new Date(),
            updatedAt: new Date()
        }
    });
  }
}
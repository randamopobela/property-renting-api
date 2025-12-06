import { format } from 'date-fns/format';
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
      include: { room: true, user: true } // Kita butuh propertyId dari room
    });

    if (!booking) throw new Error("Booking not found");
    
    // B. Validasi Kepemilikan: Apakah yang mau review adalah pemesan asli?
    if (booking.userId !== userId) {
        console.error(`❌ REVIEW GAGAL: User ${userId} mencoba mereview booking milik user ${booking.userId}`);
        // Jika tidak cocok, lempar error yang sesuai dengan pop-up Anda
        throw new Error("Unauthorized, you did not make this booking"); 
    }
    
    // C. Validasi Status: Hanya boleh review jika sudah selesai (COMPLETED) atau lunas (PAID)
    // Sesuai spek: "Review tempat penginapan dapat dilakukan ketika user selesai menginap"
    if (booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.PAID) {
        throw new Error("Cannot review unfinished booking. Status must be COMPLETED or PAID.");
    }

    // Cek 3: Apakah tanggal check-out sudah lewat (Jika Anda menggunakan validasi ini)
    if (new Date(booking.checkOut) > new Date()) {
        throw new Error("Review can only be left after check-out date: " + format(new Date(booking.checkOut), 'dd MMMM yyyy'));
    }

    // 2. Cek apakah sudah ada review
    const existingReview = await prisma.review.findUnique({ where: { bookingId } });
    if (existingReview) {
      throw new Error("Review already exists for this booking.");
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
  async replyReview(reviewId: string, reply: string, tenantUserId: string) { // Menerima tenantUserId dari Controller
    // 1. Ambil detail Review dan relasi kepemilikan sampai ke Tenant
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        booking: {
          include: {
            room: {
              include: {
                property: {
                  include: {
                    tenant: true // Include Tenant Profile
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new Error("Review not found.");
    }

    // 2. Cek Kepemilikan (Validasi KRUSIAL)
    const propertyTenantId = review.booking.room.property.tenantId; // ID dari Tenant Profile
    const tenantProfile = await prisma.tenant.findUnique({
        where: { id: propertyTenantId }
    });

    // Cek apakah User ID Tenant yang login cocok dengan pemilik Tenant Profile di Property
    if (!tenantProfile || tenantProfile.userId !== tenantUserId) {
        // Jika ID User Token (tenantUserId) tidak cocok dengan ID User di Tenant Profile
        console.error(`❌ REPLY GAGAL: Tenant User ID ${tenantUserId} mencoba membalas review properti milik User ID ${tenantProfile?.userId}.`);
        throw new Error("You are not authorized to reply to this review.");
    }
    
    // 3. Update Review (Balas)
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        reply,
        repliedBy: tenantUserId, // Opsional: Simpan siapa yang membalas
        repliedAt: new Date()
      }
    });

    return updatedReview;
  }
}
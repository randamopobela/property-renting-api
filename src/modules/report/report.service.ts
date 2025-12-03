import { PrismaClient, BookingStatus } from '../../generated/prisma';

const prisma = new PrismaClient();

export class ReportService {
  async getSalesReport(tenantUserId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sales = await prisma.booking.aggregate({
      _sum: {
        amount: true, 
      },
      _count: {
        id: true,     
      },
      where: {
        room: {
            property: {
                tenant: { userId: tenantUserId }
            }
        },
        status: { in: [BookingStatus.PAID, BookingStatus.COMPLETED] },
        createdAt: {
            gte: start,
            lte: end
        }
      }
    });

    const transactions = await prisma.booking.findMany({
        where: {
            room: { property: { tenant: { userId: tenantUserId } } },
            status: { in: [BookingStatus.PAID, BookingStatus.COMPLETED] },
            createdAt: { gte: start, lte: end }
        },
        select: {
            id: true,
            createdAt: true,
            amount: true,
            room: { select: { type: true, property: { select: { name: true } } } },
            user: { select: { firstName: true } }
        },
        orderBy: { createdAt: 'asc' }
    });

    return {
        summary: {
            totalRevenue: sales._sum.amount || 0,
            totalTransactions: sales._count.id || 0,
        },
        chartData: transactions,
        period: { start, end }
    };
  }

  async getAvailabilityReport(tenantUserId: string, propertyId?: string) {
    const rooms = await prisma.room.findMany({
        where: {
            property: {
                tenant: { userId: tenantUserId },
                id: propertyId // Optional filter
            }
        },
        include: {
            bookings: {
                where: {
                    status: { not: BookingStatus.CANCELLED },
                    checkIn: { gte: new Date() } 
                },
                select: {
                    checkIn: true,
                    checkOut: true,
                    status: true
                }
            },
            property: { select: { name: true } }
        }
    });

    return rooms.map(room => ({
        roomId: room.id,
        roomName: room.type,
        propertyName: room.property.name,
        totalBookings: room.bookings.length,
        bookedDates: room.bookings
    }));
  }
}
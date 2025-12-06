// 👇 UBAH IMPORT INI: Dari '@prisma/client' menjadi path relatif ke file yang digenerate
import { PrismaClient, BookingStatus, PaymentMethod } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Bersihkan Data Lama (Urutan penting karena relasi!)
  try {
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    
    // 👇 TAMBAHAN: Hapus Tenant Profile dulu sebelum User
    await prisma.tenant.deleteMany(); 
    
    await prisma.user.deleteMany(); // Hapus User (Tenant & Guest)
    console.log('🧹 Database cleaned');
  } catch (error) {
    console.log('⚠️  Database cleaning skipped (tables might be empty)');
  }

  const newPassword = 'Password123!'; 
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. Buat User (Akun Login untuk Tenant)
  const tenantUser = await prisma.user.create({
    data: {
      email: 'tenant@demo.com',
      password: hashedPassword,
      firstName: 'Juragan',
      lastName: 'Kost',
      role: 'TENANT',
      isVerified: true,
    },
  });
  console.log('👤 Tenant User created:', tenantUser.email);

  // 3.5. 👇 BARU: Buat Tenant Profile (Jembatan antara User dan Property)
  const tenantProfile = await prisma.tenant.create({
    data: {
      userId: tenantUser.id,
      company: 'Juragan Kost Official',
    }
  });
  console.log('🏢 Tenant Profile created:', tenantProfile.company);

  // 4. Buat User GUEST (Penyewa)
  const guest = await prisma.user.create({
    data: {
      email: 'guest@demo.com',
      password: hashedPassword,
      firstName: 'Anak',
      lastName: 'Rantau',
      role: 'GUEST',
      isVerified: true,
    },
  });
  console.log('👤 Guest created:', guest.email);

  // 5. Buat Property
  const property = await prisma.property.create({
    data: {
      name: 'Indah Village',
      description: 'Hunian nyaman di tengah kota',
      // 👇 UPDATE: Gunakan ID dari Tenant Profile, BUKAN User ID
      tenantId: tenantProfile.id, 
      city: 'Jakarta',
      address: 'Jl. Sudirman No. 1',
      category: 'GUESTHOUSE',
    },
  });

  const room = await prisma.room.create({
    data: {
      propertyId: property.id,
      type: 'Deluxe Room',
      basePrice: 500000,
      capacity: 2,
      description: 'Kamar luas dengan AC dan WiFi',
    },
  });
  console.log('🏠 Property & Room created');

  const pastCheckIn = new Date();
  pastCheckIn.setDate(pastCheckIn.getDate() - 2);
  const pastCheckOut = new Date();
  pastCheckOut.setDate(pastCheckOut.getDate() - 1);

  await prisma.booking.create({
    data: {
      userId: guest.id,
      roomId: room.id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      amount: 500000,
      status: BookingStatus.PAID,
      method: PaymentMethod.TRANSFER,
      guests: 1,
      nights: 1
    },
  });

  // 8. Buat Booking: PENDING (Untuk test Auto Cancel & Midtrans nanti)
  await prisma.booking.create({
    data: {
      userId: guest.id,
      roomId: room.id,
      checkIn: new Date(),
      checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
      amount: 500000,
      status: BookingStatus.PENDING,
      method: PaymentMethod.TRANSFER,
      guests: 1,
      nights: 1,
      expireAt: new Date(new Date().getTime() + 60 * 60 * 1000)
    },
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed API partner
  const apiKey = 'sns_8c82fbaa0e2782ce79034b83b16bf5c4e7a32900113e7b1c6760b2627911951b';
  const existingPartner = await prisma.apiPartner.findUnique({ where: { apiKey } });
  if (!existingPartner) {
    await prisma.apiPartner.create({
      data: {
        name: 'Incident Response Portal',
        email: 'admin@snapnsend.io',
        apiKey,
        description: 'Internal staff portal for responding to incidents',
        isActive: true,
      },
    });
    console.log('API partner created.');
  } else {
    console.log('API partner already exists.');
  }

  // Seed admin staff account
  const adminEmail = process.env.ADMIN_EMAIL || 'olu.oshaa@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SnapAdmin2024!';

  const existingAdmin = await prisma.staffMember.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.staffMember.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        password: hashed,
        category: 'all',
        isAdmin: true,
      },
    });
    console.log(`Admin staff account created: ${adminEmail}`);
  } else {
    console.log('Admin staff account already exists.');
  }
}

main()
  .catch((e) => { console.error('Init DB error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

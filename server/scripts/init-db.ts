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

  // Seed (or sync) the admin staff account. Password is synced from the
  // ADMIN_PASSWORD env var on every startup, not just on first creation, so
  // rotating the env var and redeploying actually takes effect.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be set.');
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  const existingAdmin = await prisma.staffMember.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
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
    await prisma.staffMember.update({ where: { email: adminEmail }, data: { password: hashed } });
    console.log(`Admin staff account password synced: ${adminEmail}`);
  }
}

main()
  .catch((e) => { console.error('Init DB error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

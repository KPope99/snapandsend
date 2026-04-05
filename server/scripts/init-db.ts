import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create the incident response API partner if it doesn't exist
  const apiKey = 'sns_8c82fbaa0e2782ce79034b83b16bf5c4e7a32900113e7b1c6760b2627911951b';

  const existing = await prisma.apiPartner.findUnique({ where: { apiKey } });

  if (!existing) {
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
}

main()
  .catch((e) => { console.error('Init DB error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

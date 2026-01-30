import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample reports
  const reports = [
    {
      title: 'Large pothole on main road',
      description: 'There is a large pothole on the main road that has been causing issues for vehicles. It is about 30cm deep and 50cm wide.',
      category: 'pothole',
      latitude: 9.0579,
      longitude: 7.4951,
      address: 'Main Street, Central Area',
      status: 'pending',
      sessionId: 'seed-session-1'
    },
    {
      title: 'Overflowing garbage bins',
      description: 'The garbage bins at the market have been overflowing for days. This is causing a health hazard and attracting pests.',
      category: 'garbage',
      latitude: 9.0600,
      longitude: 7.4900,
      address: 'Market Area',
      status: 'verified',
      agreementCount: 3,
      sessionId: 'seed-session-2'
    },
    {
      title: 'Broken streetlight',
      description: 'The streetlight at the corner has been broken for over a week. It makes the area very dark and unsafe at night.',
      category: 'streetlight',
      latitude: 9.0550,
      longitude: 7.5000,
      address: 'Corner of 1st and 2nd Street',
      status: 'pending',
      sessionId: 'seed-session-3'
    },
    {
      title: 'Blocked drainage causing flooding',
      description: 'The drainage system is blocked with debris and garbage. During rain, the water floods the street.',
      category: 'drainage',
      latitude: 9.0620,
      longitude: 7.4850,
      address: 'Low-lying residential area',
      status: 'verified',
      agreementCount: 5,
      sessionId: 'seed-session-4'
    },
    {
      title: 'Graffiti on public building',
      description: 'Someone has spray-painted graffiti on the wall of the community center. It looks inappropriate.',
      category: 'vandalism',
      latitude: 9.0530,
      longitude: 7.4920,
      address: 'Community Center',
      status: 'resolved',
      agreementCount: 2,
      sessionId: 'seed-session-5'
    }
  ];

  for (const reportData of reports) {
    const report = await prisma.report.create({
      data: {
        ...reportData,
        images: {
          create: [{
            imageUrl: '/uploads/placeholder.jpg'
          }]
        }
      }
    });
    console.log(`Created report: ${report.title}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

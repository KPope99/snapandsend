import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateApiKey(): string {
  return `sns_${crypto.randomBytes(32).toString('hex')}`;
}

async function createPartner(name: string, email: string, description?: string) {
  const apiKey = generateApiKey();

  const partner = await prisma.apiPartner.create({
    data: {
      name,
      email,
      apiKey,
      description
    }
  });

  console.log('\n=== API Partner Created ===');
  console.log(`Name: ${partner.name}`);
  console.log(`Email: ${partner.email}`);
  console.log(`API Key: ${partner.apiKey}`);
  console.log(`Created: ${partner.createdAt}`);
  console.log('\nIMPORTANT: Save this API key securely. It cannot be retrieved later.');
  console.log('========================\n');

  return partner;
}

async function listPartners() {
  const partners = await prisma.apiPartner.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      description: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
      _count: {
        select: { webhooks: true }
      }
    }
  });

  console.log('\n=== API Partners ===');
  if (partners.length === 0) {
    console.log('No partners found.');
  } else {
    partners.forEach(p => {
      console.log(`\nID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Email: ${p.email}`);
      console.log(`Description: ${p.description || 'N/A'}`);
      console.log(`Active: ${p.isActive ? 'Yes' : 'No'}`);
      console.log(`Webhooks: ${p._count.webhooks}`);
      console.log(`Last Used: ${p.lastUsedAt || 'Never'}`);
      console.log(`Created: ${p.createdAt}`);
    });
  }
  console.log('====================\n');
}

async function deactivatePartner(email: string) {
  const partner = await prisma.apiPartner.update({
    where: { email },
    data: { isActive: false }
  });

  console.log(`\nPartner '${partner.name}' has been deactivated.\n`);
}

async function activatePartner(email: string) {
  const partner = await prisma.apiPartner.update({
    where: { email },
    data: { isActive: true }
  });

  console.log(`\nPartner '${partner.name}' has been activated.\n`);
}

async function regenerateApiKey(email: string) {
  const newApiKey = generateApiKey();

  const partner = await prisma.apiPartner.update({
    where: { email },
    data: { apiKey: newApiKey }
  });

  console.log('\n=== API Key Regenerated ===');
  console.log(`Partner: ${partner.name}`);
  console.log(`New API Key: ${newApiKey}`);
  console.log('\nIMPORTANT: The old API key is now invalid.');
  console.log('===========================\n');
}

async function deletePartner(email: string) {
  const partner = await prisma.apiPartner.delete({
    where: { email }
  });

  console.log(`\nPartner '${partner.name}' has been deleted.\n`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.log('Usage: npx tsx server/scripts/manage-partners.ts create <name> <email> [description]');
        process.exit(1);
      }
      await createPartner(args[1], args[2], args[3]);
      break;

    case 'list':
      await listPartners();
      break;

    case 'deactivate':
      if (args.length < 2) {
        console.log('Usage: npx tsx server/scripts/manage-partners.ts deactivate <email>');
        process.exit(1);
      }
      await deactivatePartner(args[1]);
      break;

    case 'activate':
      if (args.length < 2) {
        console.log('Usage: npx tsx server/scripts/manage-partners.ts activate <email>');
        process.exit(1);
      }
      await activatePartner(args[1]);
      break;

    case 'regenerate':
      if (args.length < 2) {
        console.log('Usage: npx tsx server/scripts/manage-partners.ts regenerate <email>');
        process.exit(1);
      }
      await regenerateApiKey(args[1]);
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('Usage: npx tsx server/scripts/manage-partners.ts delete <email>');
        process.exit(1);
      }
      await deletePartner(args[1]);
      break;

    default:
      console.log(`
SnapAndSend API Partner Management

Usage: npx tsx server/scripts/manage-partners.ts <command> [options]

Commands:
  create <name> <email> [description]  Create a new API partner
  list                                  List all API partners
  deactivate <email>                   Deactivate a partner's API access
  activate <email>                     Reactivate a partner's API access
  regenerate <email>                   Generate a new API key for a partner
  delete <email>                       Delete a partner

Examples:
  npx tsx server/scripts/manage-partners.ts create "Nigeria Police" police@nigeria.gov.ng "Official police integration"
  npx tsx server/scripts/manage-partners.ts list
  npx tsx server/scripts/manage-partners.ts regenerate police@nigeria.gov.ng
      `);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

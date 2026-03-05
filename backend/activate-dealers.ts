import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { role: 'dealer', isActive: false },
    data: { isActive: true },
  });

  console.log(`Activated ${result.count} dealer accounts.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const masterEmail = 'master@stafupro.com';
  const hashedPassword = await bcrypt.hash('masterpass123', 10);

  const masterAdmin = await prisma.user.upsert({
    where: { email: masterEmail },
    update: {},
    create: {
      email: masterEmail,
      password: hashedPassword,
      role: 'master_admin' as Role,
      isActive: true,
    },
  });

  console.log({ masterAdmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

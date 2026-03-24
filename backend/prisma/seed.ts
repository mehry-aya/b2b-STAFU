import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const masterEmail = process.env.MASTER_EMAIL || 'merve@cheesecakemoda.com';
  const masterPassword = process.env.MASTER_PASSWORD || 'ChangeMe123!';

  const hashedPassword = await bcrypt.hash(masterPassword, 10);
  
  await prisma.user.upsert({
    where: { email: masterEmail },
    update: {},
    create: {
      email: masterEmail,
      password: hashedPassword,
      role: 'master_admin',
      isActive: true,
    },
  });

  console.log(`Master admin created: ${masterEmail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
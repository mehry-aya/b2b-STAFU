import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'merve@cheesecakemoda.com' },
    update: {},
    create: {
      email: 'merve@cheesecakemoda.com',
      password: hashedPassword,
      role: 'master_admin',
      isActive: true,
    },
  });

  console.log('Master admin created: merve@cheesecakemoda.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
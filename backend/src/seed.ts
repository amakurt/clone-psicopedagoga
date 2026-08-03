import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'sarah@edupsych.com' },
    update: { password: hash },
    create: {
      name: 'Dra. Sarah Miller',
      email: 'sarah@edupsych.com',
      password: hash,
      role: 'GESTOR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: hash },
    create: {
      name: 'Admin Teste',
      email: 'admin@test.com',
      password: hash,
      role: 'GESTOR',
    },
  });

  console.log('Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

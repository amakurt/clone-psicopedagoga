require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function setupAdmin() {
  const customEmail = process.argv[2];
  const customPassword = process.argv[3] || '@Exodo2220mami';

  const emails = customEmail 
    ? [customEmail.trim().toLowerCase()] 
    : ['amakurt@gmail.com', 'admin@edupsychpro.tech', 'admin@edupsych.tech'];

  const password = customPassword;
  const hash = await bcrypt.hash(password, 10);

  console.log('--- Configurando Usuário Master (SUPERADMIN) ---');

  for (const email of emails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hash,
        role: 'SUPERADMIN',
        active: true,
      },
      create: {
        name: 'Administrador Master',
        email,
        password: hash,
        role: 'SUPERADMIN',
        active: true,
      },
    });

    console.log(`✅ Sucesso! Usuário Master configurado:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   Role:  ${user.role} (Ativo: ${user.active})\n`);
  }
}

setupAdmin()
  .catch((err) => {
    console.error('❌ Erro ao configurar admin:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

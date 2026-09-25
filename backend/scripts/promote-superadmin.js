require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: node promote-superadmin.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Usuário com o email "${email}" não encontrado.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPERADMIN' },
  });

  console.log(`✅ Sucesso! O usuário ${updated.name} (${updated.email}) agora é SUPERADMIN.`);
}

promote()
  .catch((err) => {
    console.error('Erro ao promover usuário:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import jwt from 'jsonwebtoken';
import express from 'express';
import superadminRoutes from '../src/routes/superadmin';
import prisma from '../src/lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/superadmin', superadminRoutes);

async function runSuperAdminTests() {
  const server = app.listen(4001);
  console.log('--- Iniciando Testes Automatizados do Superadmin ---');

  try {
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
    if (!superAdmin) throw new Error('Nenhum SUPERADMIN encontrado no banco');

    const regularUser = await prisma.user.findFirst({ where: { role: 'PROFISSIONAL' } });
    if (!regularUser) throw new Error('Nenhum PROFISSIONAL encontrado no banco');

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
    const superToken = jwt.sign({ sub: superAdmin.id, email: superAdmin.email, role: 'SUPERADMIN' }, jwtSecret);
    const regularToken = jwt.sign({ sub: regularUser.id, email: regularUser.email, role: 'PROFISSIONAL' }, jwtSecret);

    // Test 1: Usuário comum bloqueado
    const resBlocked = await fetch('http://localhost:4001/api/superadmin/stats', {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    if (resBlocked.status === 403) {
      console.log('✅ PASS: Usuário comum barrado com 403 Forbidden em rota Superadmin');
    } else {
      throw new Error(`FALHA: Status esperado 403, recebido ${resBlocked.status}`);
    }

    // Test 2: Superadmin acessa /stats
    const resStats = await fetch('http://localhost:4001/api/superadmin/stats', {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    if (resStats.status === 200) {
      const stats = await resStats.json();
      console.log('✅ PASS: Superadmin acessou /stats com sucesso. MRR:', stats.mrrFormatted, 'Total Clínicas:', stats.tenantsTotal);
    } else {
      throw new Error(`FALHA: Status esperado 200, recebido ${resStats.status}`);
    }

    // Test 3: Listar tenants
    const resTenants = await fetch('http://localhost:4001/api/superadmin/tenants', {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    const tenantsData = await resTenants.json();
    if (resTenants.status === 200 && Array.isArray(tenantsData.data)) {
      console.log('✅ PASS: Superadmin listou clínicas com sucesso. Quantidade:', tenantsData.data.length);
    } else {
      throw new Error(`FALHA na listagem de tenants: ${resTenants.status}`);
    }

    const targetTenant = tenantsData.data[0];
    if (targetTenant) {
      // Test 4: Prorrogar trial
      const resTrial = await fetch(`http://localhost:4001/api/superadmin/tenants/${targetTenant.id}/trial`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superToken}` },
        body: JSON.stringify({ days: 14 }),
      });
      if (resTrial.status === 200) {
        console.log('✅ PASS: Prorrogação de trial executada com sucesso (+14 dias)');
      } else {
        throw new Error(`FALHA ao prorrogar trial: ${resTrial.status}`);
      }

      // Test 5: Alterar plano
      const resPlan = await fetch(`http://localhost:4001/api/superadmin/tenants/${targetTenant.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superToken}` },
        body: JSON.stringify({ planCode: 'PRO' }),
      });
      if (resPlan.status === 200) {
        console.log('✅ PASS: Alteração manual de plano executada com sucesso (Plano PRO)');
      } else {
        throw new Error(`FALHA ao alterar plano: ${resPlan.status}`);
      }

      // Test 6: Impersonação (Modo Suporte)
      const resImpersonate = await fetch(`http://localhost:4001/api/superadmin/tenants/${targetTenant.id}/impersonate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${superToken}` },
      });
      const impersonateData = await resImpersonate.json();
      if (resImpersonate.status === 200 && impersonateData.token && impersonateData.isImpersonated) {
        console.log('✅ PASS: Impersonação (Modo Suporte) gerou token válido para a clínica:', impersonateData.tenant.name);
      } else {
        throw new Error(`FALHA na impersonação: ${resImpersonate.status}`);
      }
    }

    console.log('🎉 TODOS OS TESTES DO SUPERADMIN PASSARAM COM 100% DE SUCESSO!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runSuperAdminTests().catch((err) => {
  console.error('❌ Erro nos testes:', err);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const PORT = 3999;
const BASE = `http://localhost:${PORT}/api`;

interface ApiResult {
  status: number;
  body: any;
}

function expect(cond: boolean, label: string) {
  if (!cond) throw new Error(`FALHOU: ${label}`);
  console.log(`PASS: ${label}`);
}

async function api(method: string, urlPath: string, token?: string, body?: any): Promise<ApiResult> {
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* no body */ }
  return { status: res.status, body: json };
}

async function login(email: string, password: string): Promise<string> {
  const r = await api('POST', '/auth/login', undefined, { email, password });
  expect(r.status === 200, `login ${email} -> 200`);
  return r.body.token;
}

async function waitForServer(proc: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Servidor não subiu em 30s')), 30000);
    proc.stdout?.on('data', (d) => {
      if (d.toString().includes('rodando na porta')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

async function main() {
  const tsxBin = path.join(__dirname, '..', 'node_modules', '.bin', 'tsx');
  const server = spawn(tsxBin, ['src/index.ts'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout?.pipe(fs.createWriteStream(path.join(__dirname, '..', 'test-isolation-server.log')));
  server.stderr?.pipe(fs.createWriteStream(path.join(__dirname, '..', 'test-isolation-server.log'), { flags: 'a' }));
  try {
    await waitForServer(server);
    console.log('Servidor de teste no ar em', BASE);

    const tokenA = await login('sarah@edupsych.com', '123456');
    const sarah = await prisma.user.findUnique({ where: { email: 'sarah@edupsych.com' } });
    const membershipA = await prisma.membership.findFirst({ where: { userId: sarah!.id } });
    const tenantA = membershipA!.tenantId;
    console.log(`Tenant A: ${tenantA}`);

    const tenantB = await prisma.tenant.create({
      data: { name: 'Clínica Teste ISO', slug: `clinica-teste-iso-${Date.now()}` },
    });
    const hash = await bcrypt.hash('123456', 10);
    const userB = await prisma.user.create({
      data: { name: 'Usuário Iso B', email: `iso.b.${Date.now()}@test.com`, password: hash, role: 'GESTOR' },
    });
    await prisma.membership.create({
      data: { tenantId: tenantB.id, userId: userB.id, role: 'GESTOR' },
    });
    const tokenB = await login(userB.email, '123456');
    console.log(`Tenant B: ${tenantB.id}`);

    const r1 = await api('POST', '/pacientes', tokenA, {
      name: 'Paciente ISO A',
      phone: '(11) 90000-0001',
      age: '5 anos',
    });
    expect(r1.status === 201, 'POST paciente com token A -> 201');
    expect(r1.body?.tenantId === tenantA, `create injeta tenantId do A (${r1.body?.tenantId})`);
    const patientA = r1.body;

    const r2 = await api('GET', '/pacientes', tokenB);
    expect(r2.status === 200, 'GET pacientes com token B -> 200');
    expect(!(r2.body?.data || []).some((p: any) => p.id === patientA.id), 'lista do B não contém paciente do A');
    expect((r2.body?.data || []).every((p: any) => p.tenantId === tenantB.id), 'todos os pacientes da lista do B são do tenant B');

    const r3 = await api('GET', `/pacientes/${patientA.id}`, tokenB);
    expect(r3.status === 404, `GET cruzado do paciente do A com token B -> 404 (status ${r3.status})`);

    const r4 = await api('PUT', `/pacientes/${patientA.id}`, tokenB, { name: 'Sobrescrita indevida' });
    expect(r4.status === 404, `PUT cruzado com token B -> 404 (status ${r4.status})`);

    const r5 = await api('DELETE', `/pacientes/${patientA.id}`, tokenB);
    expect(r5.status === 404, `DELETE cruzado com token B -> 404 (status ${r5.status})`);

    const r6 = await api('GET', `/pacientes/${patientA.id}`, tokenA);
    expect(r6.status === 200, 'A ainda vê o próprio paciente (registro não foi alterado/apagado)');

    const r7 = await api('POST', '/pacientes', tokenB, {
      name: 'Paciente ISO B',
      phone: '(11) 90000-0002',
      age: '7 anos',
    });
    expect(r7.status === 201, 'POST paciente com token B -> 201');
    expect(r7.body?.tenantId === tenantB.id, `create injeta tenantId do B (${r7.body?.tenantId})`);
    const patientB = r7.body;

    const r8 = await api('GET', '/pacientes', tokenA);
    expect(!(r8.body?.data || []).some((p: any) => p.id === patientB.id), 'lista do A não contém paciente do B');

    const r9 = await api('GET', `/pacientes/${patientB.id}`, tokenA);
    expect(r9.status === 404, 'GET cruzado do paciente do B com token A -> 404');

    const r10 = await api('DELETE', `/pacientes/${patientA.id}`, tokenA);
    expect(r10.status === 204, 'A deleta o próprio paciente -> 204');

    await prisma.paciente.deleteMany({ where: { name: { startsWith: 'Paciente ISO' } } });
    await prisma.membership.deleteMany({ where: { userId: userB.id } });
    await prisma.user.delete({ where: { id: userB.id } });
    await prisma.tenant.delete({ where: { id: tenantB.id } });

    console.log('\nTODOS OS TESTES DE ISOLAMENTO PASSARAM');
  } finally {
    server.kill();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
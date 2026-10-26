import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import prisma from '../lib/prisma';

export interface TenantBackupPayload {
  version: string;
  system: string;
  exportedAt: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    trialEndsAt?: string | null;
    phone?: string | null;
    email?: string | null;
    cnpj?: string | null;
    address?: string | null;
  };
  summary: {
    totalPacientes: number;
    totalProntuarios: number;
    totalSessoes: number;
    totalLaudos: number;
    totalAgendamentos: number;
    totalMembros: number;
  };
  data: {
    tenant: any;
    memberships: any[];
    responsibles: any[];
    schools: any[];
    pacientes: any[];
    whatsappConfigs: any[];
  };
}

const BACKUPS_DIR = path.resolve(process.cwd(), 'backups');
const PRE_RESTORE_DIR = path.resolve(BACKUPS_DIR, 'pre-restore');

function ensureBackupDirs() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRE_RESTORE_DIR)) {
    fs.mkdirSync(PRE_RESTORE_DIR, { recursive: true });
  }
}

/**
 * Gera um snapshot completo em JSON de uma clínica (Tenant).
 */
export async function exportTenantBackup(tenantId: string): Promise<TenantBackupPayload> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              registration: true,
              clinicName: true,
              clinicAddress: true,
              active: true,
            },
          },
        },
      },
      responsibles: true,
      schools: true,
      pacientes: {
        include: {
          responsible: true,
          anamneses: true,
          prontuarios: true,
          sessoes: true,
          sessionRecords: true,
          laudos: true,
          encaminhamentos: true,
          financeiro: true,
          appointments: true,
          sessionDiaries: true,
          frequencySheets: true,
          screeningAssessments: true,
          abaAssessments: true,
          abaPrograms: true,
          protocolEvaluations: true,
          interventionPlans: true,
        },
      },
      whatsappConfigs: true,
    },
  });

  if (!tenant) {
    throw new Error(`Clínica não encontrada para o ID: ${tenantId}`);
  }

  let totalProntuarios = 0;
  let totalSessoes = 0;
  let totalLaudos = 0;
  let totalAgendamentos = 0;

  tenant.pacientes.forEach((p) => {
    totalProntuarios += p.prontuarios?.length || 0;
    totalSessoes += p.sessoes?.length || 0;
    totalLaudos += p.laudos?.length || 0;
    totalAgendamentos += p.appointments?.length || 0;
  });

  const summary = {
    totalPacientes: tenant.pacientes.length,
    totalProntuarios,
    totalSessoes,
    totalLaudos,
    totalAgendamentos,
    totalMembros: tenant.memberships.length,
  };

  const payload: TenantBackupPayload = {
    version: '1.0',
    system: 'EduPsych Pro SaaS',
    exportedAt: new Date().toISOString(),
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      trialEndsAt: tenant.trialEndsAt ? tenant.trialEndsAt.toISOString() : null,
      phone: tenant.phone,
      email: tenant.email,
      cnpj: tenant.cnpj,
      address: tenant.address,
    },
    summary,
    data: {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
        logoUrl: tenant.logoUrl,
        colors: tenant.colors,
        phone: tenant.phone,
        email: tenant.email,
        cnpj: tenant.cnpj,
        address: tenant.address,
      },
      memberships: tenant.memberships,
      responsibles: tenant.responsibles,
      schools: tenant.schools,
      pacientes: tenant.pacientes,
      whatsappConfigs: tenant.whatsappConfigs,
    },
  };

  // Salva cópia local em backups/
  ensureBackupDirs();
  const safeSlug = tenant.slug.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${safeSlug}_${timestamp}.json`;
  const filePath = path.join(BACKUPS_DIR, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[BACKUP_LOCAL_SAVE_WARN] Não foi possível salvar cópia em disco:', err);
  }

  return payload;
}

/**
 * Restaura o snapshot de uma clínica com snapshot pré-rollback automático.
 */
export async function restoreTenantBackup(
  targetTenantId: string,
  backupPayload: TenantBackupPayload
): Promise<{ success: boolean; message: string; summary: any; preRestoreFile?: string }> {
  if (!backupPayload || !backupPayload.data || !backupPayload.data.pacientes) {
    throw new Error('Formato de arquivo de backup inválido.');
  }

  const existingTenant = await prisma.tenant.findUnique({
    where: { id: targetTenantId },
  });

  if (!existingTenant) {
    throw new Error(`Clínica de destino (${targetTenantId}) não existe.`);
  }

  // 1. Snapshot preventivo automático ANTES de aplicar qualquer alteração
  ensureBackupDirs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preRestoreFilename = `pre-restore_${existingTenant.slug}_${timestamp}.json`;
  const preRestorePath = path.join(PRE_RESTORE_DIR, preRestoreFilename);

  try {
    const currentSnapshot = await exportTenantBackup(targetTenantId);
    fs.writeFileSync(preRestorePath, JSON.stringify(currentSnapshot, null, 2), 'utf-8');
  } catch (preErr) {
    console.warn('[PRE_RESTORE_SNAPSHOT_WARN] Não foi possível salvar snapshot preventivo:', preErr);
  }

  const { data } = backupPayload;

  // 2. Executa a restauração dentro de uma transação
  await prisma.$transaction(async (tx: any) => {
    // A. Atualiza dados cadastrais da clínica se informados
    if (data.tenant) {
      await tx.tenant.update({
        where: { id: targetTenantId },
        data: {
          name: data.tenant.name || existingTenant.name,
          phone: data.tenant.phone ?? existingTenant.phone,
          email: data.tenant.email ?? existingTenant.email,
          cnpj: data.tenant.cnpj ?? existingTenant.cnpj,
          address: data.tenant.address ?? existingTenant.address,
        },
      });
    }

    // B. Limpa registros clínicos atuais da clínica de forma segura
    const currentPatients = await tx.paciente.findMany({
      where: { tenantId: targetTenantId },
      select: { id: true },
    });
    const patientIds = currentPatients.map((p: any) => p.id);

    if (patientIds.length > 0) {
      await tx.appointment.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.prontuario.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.anamnese.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.laudo.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.sessao.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.sessionRecord.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.sessionDiary.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.frequencySheet.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.screeningAssessment.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.protocolEvaluation.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.interventionPlan.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.financeiroSessao.deleteMany({ where: { tenantId: targetTenantId } });
      await tx.encaminhamento.deleteMany({ where: { pacienteId: { in: patientIds } } });
      await tx.paciente.deleteMany({ where: { tenantId: targetTenantId } });
    }

    // C. Restaura Responsáveis se existirem
    if (Array.isArray(data.responsibles)) {
      for (const resp of data.responsibles) {
        await tx.responsible.upsert({
          where: { id: resp.id },
          create: {
            id: resp.id,
            tenantId: targetTenantId,
            name: resp.name,
            birthDate: resp.birthDate,
            relationship: resp.relationship || 'RESPONSAVEL',
            cpf: resp.cpf,
            rg: resp.rg,
            phones: resp.phones,
            phoneIsWhatsApp: resp.phoneIsWhatsApp ?? false,
            email: resp.email,
            avatarUrl: resp.avatarUrl,
            cep: resp.cep,
            street: resp.street,
            neighborhood: resp.neighborhood,
            city: resp.city,
            state: resp.state,
          },
          update: {
            name: resp.name,
            phones: resp.phones,
            email: resp.email,
          },
        });
      }
    }

    // D. Restaura Escolas
    if (Array.isArray(data.schools)) {
      for (const sc of data.schools) {
        await tx.school.upsert({
          where: { id: sc.id },
          create: {
            id: sc.id,
            tenantId: targetTenantId,
            name: sc.name,
            city: sc.city,
            state: sc.state,
            phone: sc.phone,
            status: sc.status || 'Ativa',
          },
          update: {
            name: sc.name,
            phone: sc.phone,
          },
        });
      }
    }

    // E. Reinsere pacientes e seus registros clínicos a partir do snapshot
    for (const p of data.pacientes || []) {
      const createdPatient = await tx.paciente.create({
        data: {
          id: p.id,
          tenantId: targetTenantId,
          name: p.name,
          email: p.email,
          phone: p.phone,
          cpf: p.cpf,
          rg: p.rg,
          birthDate: p.birthDate,
          age: p.age,
          initials: p.initials,
          color: p.color,
          avatarUrl: p.avatarUrl,
          status: p.status || 'ATIVO',
          grade: p.grade,
          schoolShift: p.schoolShift,
          diagnosis: p.diagnosis,
          medications: p.medications,
          allergies: p.allergies,
          notes: p.notes,
          active: p.active ?? true,
          accessCode: p.accessCode,
          cep: p.cep,
          street: p.street,
          neighborhood: p.neighborhood,
          number: p.number,
          complement: p.complement,
          city: p.city,
          state: p.state,
          phoneIsWhatsApp: p.phoneIsWhatsApp ?? false,
          responsibleId: p.responsibleId || undefined,
          schoolId: p.schoolId || undefined,
        },
      });

      // Prontuários
      if (Array.isArray(p.prontuarios)) {
        for (const pront of p.prontuarios) {
          await tx.prontuario.create({
            data: {
              id: pront.id,
              tenantId: targetTenantId,
              titulo: pront.titulo,
              conteudo: pront.conteudo || '',
              pacienteId: createdPatient.id,
              autorId: pront.autorId,
            },
          });
        }
      }

      // Sessões
      if (Array.isArray(p.sessoes)) {
        for (const sess of p.sessoes) {
          await tx.sessao.create({
            data: {
              id: sess.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              psicopedagogoId: sess.psicopedagogoId,
              date: sess.date ? new Date(sess.date) : new Date(),
              duration: sess.duration ?? 50,
              tipo: sess.tipo || 'INDIVIDUAL',
              status: sess.status || 'REALIZADA',
              valor: sess.valor,
              observacoes: sess.observacoes,
              objective: sess.objective,
              summary: sess.summary,
              activities: sess.activities,
              instruments: sess.instruments,
              materials: sess.materials,
              startTime: sess.startTime,
              endTime: sess.endTime,
            },
          });
        }
      }

      // Laudos
      if (Array.isArray(p.laudos)) {
        for (const l of p.laudos) {
          await tx.laudo.create({
            data: {
              id: l.id,
              tenantId: targetTenantId,
              titulo: l.titulo || 'Laudo Clínico',
              type: l.type || 'LAUDO',
              content: l.content || '',
              status: l.status || 'FINALIZADO',
              pacienteId: createdPatient.id,
              autorId: l.autorId,
              signatureImage: l.signatureImage,
              signedAt: l.signedAt ? new Date(l.signedAt) : undefined,
            },
          });
        }
      }

      // Agendamentos
      if (Array.isArray(p.appointments)) {
        for (const app of p.appointments) {
          await tx.appointment.create({
            data: {
              id: app.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              patientName: app.patientName || p.name,
              date: app.date || new Date().toISOString().split('T')[0],
              startTime: app.startTime || '09:00',
              endTime: app.endTime || '10:00',
              type: app.type || 'CONSULTA',
              status: app.status || 'SCHEDULED',
              notes: app.notes,
              color: app.color,
              autorId: app.autorId,
            },
          });
        }
      }

      // Anamneses
      if (Array.isArray(p.anamneses)) {
        for (const an of p.anamneses) {
          await tx.anamnese.create({
            data: {
              id: an.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              autorId: an.autorId,
              status: an.status || 'CONCLUIDA',
              turno: an.turno,
              telefoneEscola: an.telefoneEscola,
              enderecoEscola: an.enderecoEscola,
              diagnostico: an.diagnostico,
            },
          });
        }
      }

      // Diários de Sessão
      if (Array.isArray(p.sessionDiaries)) {
        for (const d of p.sessionDiaries) {
          await tx.sessionDiary.create({
            data: {
              id: d.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              sessionNumber: d.sessionNumber ?? 1,
              date: d.date || new Date().toISOString().split('T')[0],
              professionalId: d.professionalId,
              professionalName: d.professionalName,
              objective: d.objective,
              instruments: d.instruments,
              studentBehavior: d.studentBehavior,
              activities: d.activities,
              observations: d.observations,
            },
          });
        }
      }

      // Folhas de Frequência
      if (Array.isArray(p.frequencySheets)) {
        for (const f of p.frequencySheets) {
          await tx.frequencySheet.create({
            data: {
              id: f.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              date: f.date || new Date().toISOString().split('T')[0],
              entryTime: f.entryTime,
              exitTime: f.exitTime,
            },
          });
        }
      }

      // Rastreios
      if (Array.isArray(p.screeningAssessments)) {
        for (const r of p.screeningAssessments) {
          await tx.screeningAssessment.create({
            data: {
              id: r.id,
              tenantId: targetTenantId,
              pacienteId: createdPatient.id,
              profissionalId: r.profissionalId,
              instrument: r.instrument || 'MCHAT_R',
              respondent: r.respondent || 'PAIS',
              answers: r.answers || '{}',
              scores: r.scores || '{}',
              riskLevel: r.riskLevel || 'BAIXO',
              summary: r.summary,
              notes: r.notes,
              assessedAt: r.assessedAt ? new Date(r.assessedAt) : new Date(),
            },
          });
        }
      }
    }
  });

  return {
    success: true,
    message: `Restauração concluída com sucesso para a clínica ${existingTenant.name}!`,
    summary: backupPayload.summary,
    preRestoreFile: preRestoreFilename,
  };
}

/**
 * Lista todos os arquivos de backup salvos localmente no servidor.
 */
export function listSavedBackups() {
  ensureBackupDirs();
  const files: Array<{
    filename: string;
    type: 'tenant_backup' | 'pre_restore';
    sizeBytes: number;
    sizeFormatted: string;
    createdAt: Date;
    path: string;
  }> = [];

  const readDir = (dir: string, type: 'tenant_backup' | 'pre_restore') => {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir);
      for (const f of dirFiles) {
        if (f.endsWith('.json')) {
          const filePath = path.join(dir, f);
          const stat = fs.statSync(filePath);
          const sizeKb = (stat.size / 1024).toFixed(1);
          files.push({
            filename: f,
            type,
            sizeBytes: stat.size,
            sizeFormatted: `${sizeKb} KB`,
            createdAt: stat.mtime,
            path: filePath,
          });
        }
      }
    }
  };

  readDir(BACKUPS_DIR, 'tenant_backup');
  readDir(PRE_RESTORE_DIR, 'pre_restore');

  return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Gera dump global do banco de dados (PostgreSQL em produção ou SQLite em dev).
 */
export async function generateDatabaseDump(): Promise<{
  type: 'sql' | 'sqlite';
  filename: string;
  buffer: Buffer;
}> {
  const dbUrl = process.env.DATABASE_URL || '';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:')) {
    return new Promise((resolve, reject) => {
      const dockerCmd = 'docker exec edupsych-postgres pg_dump -U edupsych -d edupsych_prod --no-owner --no-privileges';
      exec(dockerCmd, { maxBuffer: 100 * 1024 * 1024 }, (dockerErr, stdout, stderr) => {
        if (!dockerErr && stdout && stdout.length > 50) {
          return resolve({
            type: 'sql',
            filename: `edupsych_pg_dump_${timestamp}.sql`,
            buffer: Buffer.from(stdout, 'utf-8'),
          });
        }

        const nativeCmd = `pg_dump "${dbUrl}" --no-owner --no-privileges`;
        exec(nativeCmd, { maxBuffer: 100 * 1024 * 1024 }, (nativeErr, nStdout) => {
          if (!nativeErr && nStdout && nStdout.length > 50) {
            return resolve({
              type: 'sql',
              filename: `edupsych_pg_dump_${timestamp}.sql`,
              buffer: Buffer.from(nStdout, 'utf-8'),
            });
          }

          reject(new Error(`Falha ao gerar dump PostgreSQL: ${dockerErr?.message || nativeErr?.message || stderr}`));
        });
      });
    });
  } else {
    const sqlitePath = path.resolve(process.cwd(), 'prisma/dev.db');
    if (fs.existsSync(sqlitePath)) {
      const buffer = fs.readFileSync(sqlitePath);
      return {
        type: 'sqlite',
        filename: `edupsych_sqlite_${timestamp}.db`,
        buffer,
      };
    }
    throw new Error('Banco SQLite não encontrado em ' + sqlitePath);
  }
}

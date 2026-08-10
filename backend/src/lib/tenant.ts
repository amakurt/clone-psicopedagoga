import type { PrismaClient } from '@prisma/client';
import prisma from './prisma';

// Nomes dos models no client Prisma que possuem tenantId (isolamento por clínica)
const TENANT_MODELS = new Set<string>([
  'paciente', 'responsible', 'school', 'prontuario', 'anamnese', 'sessao',
  'laudo', 'encaminhamento', 'comunicacao', 'financeiroSessao', 'notification',
  'document', 'appointment', 'libraryResource', 'transaction', 'sessionRecord',
  'aBAAssessment', 'aBAProgram', 'aBADataPoint', 'protocolEvaluation',
  'interventionPlan', 'chatMessage', 'sessionDiary', 'frequencySheet',
  'interventionDocument', 'consentLog', 'nfse', 'waitingRoom', 'documentRequest',
  'availability', 'signature', 'whatsAppConfig', 'whatsAppLog',
]);

const WITH_WHERE = new Set(['findMany', 'findFirst', 'count', 'aggregate', 'groupBy', 'updateMany', 'deleteMany']);

function mergeWhere(existing: any, tenantId: string) {
  return { ...(existing || {}), tenantId };
}

export function isTenantModel(name: string): boolean {
  return TENANT_MODELS.has(name);
}

export function scoped(prisma: PrismaClient, tenantId?: string): any {
  const tid = tenantId ?? '';
  const models: any = prisma;

  return new Proxy({}, {
    get(_, modelName) {
      const model = models[String(modelName)];
      if (!model || typeof model !== 'object' || !TENANT_MODELS.has(String(modelName))) {
        return model;
      }

      return new Proxy(model, {
        get(t, methodName) {
          const method: any = (t as any)[String(methodName)];
          if (typeof method !== 'function') return method;
          const name = String(methodName);

          if (name === 'create') {
            return (args?: any) => method.call(t, {
              ...(args || {}),
              data: { ...(args?.data || {}), tenantId: args?.data?.tenantId ?? tid },
            });
          }

          if (name === 'createMany') {
            return (args?: any) => {
              const data = Array.isArray(args?.data)
                ? args.data.map((r: any) => ({ ...r, tenantId: r.tenantId ?? tid }))
                : { ...(args?.data || {}), tenantId: tid };
              return method.call(t, { ...(args || {}), data });
            };
          }

          if (WITH_WHERE.has(name)) {
            return (args?: any) => method.call(t, { ...(args || {}), where: mergeWhere(args?.where, tid) });
          }

          if (name === 'findUnique') {
            return (args?: any) => model.findFirst({ ...(args || {}), where: mergeWhere(args?.where, tid) });
          }

          if (name === 'update' || name === 'delete') {
            return async (args?: any) => {
              const found = await model.findFirst({ where: mergeWhere(args?.where, tid) });
              if (!found) {
                const err: any = new Error('Registro não encontrado');
                err.status = 404;
                throw err;
              }
              return method.call(t, args);
            };
          }

          if (name === 'upsert') {
            return async (args?: any) => {
              const found = await model.findFirst({ where: mergeWhere(args?.where, tid) });
              if (found) return model.update({ where: { id: found.id }, data: args?.update || {} });
              return model.create({ data: { ...(args?.create || {}), tenantId: tid } });
            };
          }

          return method;
        },
      });
    },
  });
}

// Garante que um usuário tenha membership ativa em uma clínica
// (registro, Google OAuth, contas legadas)
export async function ensureMembership(user: any) {
  const existing = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (existing) return existing;

  let tenantId: string | undefined;
  if (user.role === 'RESPONSAVEL') {
    const responsible = await prisma.responsible.findFirst({ where: { userId: user.id } });
    tenantId = responsible?.tenantId;
  }

  if (!tenantId) {
    const main = await prisma.tenant.findFirst({ where: { slug: 'clinica-principal' } });
    tenantId = main?.id;
  }

  if (!tenantId) throw new Error('Nenhuma clínica disponível para vincular o usuário');

  return prisma.membership.create({
    data: { tenantId, userId: user.id, role: user.role || 'SECRETARIA' },
  });
}
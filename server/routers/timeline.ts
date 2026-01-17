import { z } from "zod";
import { eq, desc, and, sql, gte, lte, like, or } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  timelines,
  timelineImagens,
  timelineEventos,
  timelineCompartilhamentos,
  timelineResponsaveis,
  timelineLocais,
  timelineStatus,
  timelinePrioridades,
  timelineTitulos,
  timelineComentarios,
  timelineComentarioReacoes,
  timelineComentarioHistorico,
  timelineComentarioTemplates,
  timelineLembretes,
  users,
  membrosEquipe,
} from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { sendEmail } from "../_core/email";
import { notifyOwner } from "../_core/notification";

// ==================== TIMELINE ROUTER ====================
export const timelineRouter = router({
  // ==================== CONFIGURAÇÕES - RESPONSÁVEIS ====================
  listarResponsaveis: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelineResponsaveis)
        .where(eq(timelineResponsaveis.condominioId, input.condominioId))
        .orderBy(timelineResponsaveis.nome);
    }),

  criarResponsavel: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      nome: z.string().min(2),
      cargo: z.string().optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cor: z.string().default("#3B82F6"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(timelineResponsaveis).values(input);
      return { id: result[0].insertId };
    }),

  atualizarResponsavel: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(2).optional(),
      cargo: z.string().optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cor: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(timelineResponsaveis).set(data).where(eq(timelineResponsaveis.id, id));
      return { success: true };
    }),

  excluirResponsavel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelineResponsaveis).where(eq(timelineResponsaveis.id, input.id));
      return { success: true };
    }),

  // ==================== CONFIGURAÇÕES - LOCAIS ====================
  listarLocais: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelineLocais)
        .where(eq(timelineLocais.condominioId, input.condominioId))
        .orderBy(timelineLocais.nome);
    }),

  criarLocal: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      nome: z.string().min(2),
      descricao: z.string().optional(),
      cor: z.string().default("#10B981"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(timelineLocais).values(input);
      return { id: result[0].insertId };
    }),

  atualizarLocal: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(2).optional(),
      descricao: z.string().optional(),
      cor: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(timelineLocais).set(data).where(eq(timelineLocais.id, id));
      return { success: true };
    }),

  excluirLocal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelineLocais).where(eq(timelineLocais.id, input.id));
      return { success: true };
    }),

  // ==================== CONFIGURAÇÕES - STATUS ====================
  listarStatus: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelineStatus)
        .where(eq(timelineStatus.condominioId, input.condominioId))
        .orderBy(timelineStatus.ordem);
    }),

  criarStatus: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      nome: z.string().min(2),
      cor: z.string().default("#6366F1"),
      icone: z.string().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(timelineStatus).values(input);
      return { id: result[0].insertId };
    }),

  atualizarStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(2).optional(),
      cor: z.string().optional(),
      icone: z.string().optional(),
      ordem: z.number().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(timelineStatus).set(data).where(eq(timelineStatus.id, id));
      return { success: true };
    }),

  excluirStatus: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelineStatus).where(eq(timelineStatus.id, input.id));
      return { success: true };
    }),

  // ==================== CONFIGURAÇÕES - PRIORIDADES ====================
  listarPrioridades: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelinePrioridades)
        .where(eq(timelinePrioridades.condominioId, input.condominioId))
        .orderBy(timelinePrioridades.nivel);
    }),

  criarPrioridade: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      nome: z.string().min(2),
      cor: z.string().default("#F59E0B"),
      nivel: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(timelinePrioridades).values(input);
      return { id: result[0].insertId };
    }),

  atualizarPrioridade: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(2).optional(),
      cor: z.string().optional(),
      nivel: z.number().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(timelinePrioridades).set(data).where(eq(timelinePrioridades.id, id));
      return { success: true };
    }),

  excluirPrioridade: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelinePrioridades).where(eq(timelinePrioridades.id, input.id));
      return { success: true };
    }),

  // ==================== CONFIGURAÇÕES - TÍTULOS ====================
  listarTitulos: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelineTitulos)
        .where(eq(timelineTitulos.condominioId, input.condominioId))
        .orderBy(timelineTitulos.titulo);
    }),

  criarTitulo: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(2),
      categoria: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(timelineTitulos).values(input);
      return { id: result[0].insertId };
    }),

  excluirTitulo: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelineTitulos).where(eq(timelineTitulos.id, input.id));
      return { success: true };
    }),

  // ==================== TIMELINE - CRUD PRINCIPAL ====================
  listar: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      estado: z.enum(["rascunho", "enviado", "registado"]).optional(),
      responsavelId: z.number().optional(),
      localId: z.number().optional(),
      statusId: z.number().optional(),
      prioridadeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      busca: z.string().optional(),
      limite: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { timelines: [], total: 0 };

      const conditions = [eq(timelines.condominioId, input.condominioId)];

      if (input.estado) conditions.push(eq(timelines.estado, input.estado));
      if (input.responsavelId) conditions.push(eq(timelines.responsavelId, input.responsavelId));
      if (input.localId) conditions.push(eq(timelines.localId, input.localId));
      if (input.statusId) conditions.push(eq(timelines.statusId, input.statusId));
      if (input.prioridadeId) conditions.push(eq(timelines.prioridadeId, input.prioridadeId));
      if (input.dataInicio) conditions.push(gte(timelines.dataRegistro, new Date(input.dataInicio)));
      if (input.dataFim) conditions.push(lte(timelines.dataRegistro, new Date(input.dataFim)));
      if (input.busca) {
        conditions.push(or(
          like(timelines.titulo, `%${input.busca}%`),
          like(timelines.protocolo, `%${input.busca}%`),
          like(timelines.descricao, `%${input.busca}%`)
        )!);
      }

      const whereClause = and(...conditions);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(timelines)
        .where(whereClause);

      const results = await db.select().from(timelines)
        .where(whereClause)
        .orderBy(desc(timelines.createdAt))
        .limit(input.limite)
        .offset(input.offset);

      // Buscar dados relacionados para cada timeline
      const timelinesComDados = await Promise.all(results.map(async (t: typeof results[0]) => {
        const [responsavel] = t.responsavelId
          ? await db.select().from(timelineResponsaveis).where(eq(timelineResponsaveis.id, t.responsavelId))
          : [null];
        const [local] = t.localId
          ? await db.select().from(timelineLocais).where(eq(timelineLocais.id, t.localId))
          : [null];
        const [status] = t.statusId
          ? await db.select().from(timelineStatus).where(eq(timelineStatus.id, t.statusId))
          : [null];
        const [prioridade] = t.prioridadeId
          ? await db.select().from(timelinePrioridades).where(eq(timelinePrioridades.id, t.prioridadeId))
          : [null];

        const imagens = await db.select().from(timelineImagens)
          .where(eq(timelineImagens.timelineId, t.id))
          .orderBy(timelineImagens.ordem);

        return { ...t, responsavel, local, status, prioridade, imagens };
      }));

      return { timelines: timelinesComDados, total: countResult?.count || 0 };
    }),

  obter: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [timeline] = await db.select().from(timelines).where(eq(timelines.id, input.id));
      if (!timeline) return null;

      const [responsavel] = timeline.responsavelId
        ? await db.select().from(timelineResponsaveis).where(eq(timelineResponsaveis.id, timeline.responsavelId))
        : [null];
      const [local] = timeline.localId
        ? await db.select().from(timelineLocais).where(eq(timelineLocais.id, timeline.localId))
        : [null];
      const [status] = timeline.statusId
        ? await db.select().from(timelineStatus).where(eq(timelineStatus.id, timeline.statusId))
        : [null];
      const [prioridade] = timeline.prioridadeId
        ? await db.select().from(timelinePrioridades).where(eq(timelinePrioridades.id, timeline.prioridadeId))
        : [null];

      const imagens = await db.select().from(timelineImagens)
        .where(eq(timelineImagens.timelineId, timeline.id))
        .orderBy(timelineImagens.ordem);

      const eventos = await db.select().from(timelineEventos)
        .where(eq(timelineEventos.timelineId, timeline.id))
        .orderBy(desc(timelineEventos.createdAt));

      const compartilhamentos = await db.select().from(timelineCompartilhamentos)
        .where(eq(timelineCompartilhamentos.timelineId, timeline.id))
        .orderBy(desc(timelineCompartilhamentos.createdAt));

      return { ...timeline, responsavel, local, status, prioridade, imagens, eventos, compartilhamentos };
    }),

  criar: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      responsavelId: z.number().optional(),
      titulo: z.string().min(2),
      localId: z.number().nullable().optional(),
      statusId: z.number().nullable().optional(),
      prioridadeId: z.number().nullable().optional(),
      descricao: z.string().optional(),
      dataRegistro: z.string().optional(),
      estado: z.enum(["rascunho", "enviado", "registado"]).default("rascunho"),
      imagens: z.array(z.object({
        url: z.string(),
        legenda: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Gerar protocolo único
      const now = new Date();
      const ano = now.getFullYear();
      const mes = String(now.getMonth() + 1).padStart(2, "0");
      const dia = String(now.getDate()).padStart(2, "0");
      const hora = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const seg = String(now.getSeconds()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const protocolo = `TL-${ano}${mes}${dia}-${hora}${min}${seg}-${random}`;

      // Gerar token público
      const tokenPublico = nanoid(32);

      const { imagens, dataRegistro, ...timelineData } = input;

      const result = await db.insert(timelines).values({
        condominioId: timelineData.condominioId,
        responsavelId: timelineData.responsavelId || 0,
        titulo: timelineData.titulo,
        localId: timelineData.localId ?? null,
        statusId: timelineData.statusId ?? null,
        prioridadeId: timelineData.prioridadeId ?? null,
        descricao: timelineData.descricao,
        estado: timelineData.estado,
        protocolo,
        tokenPublico,
        horaRegistro: `${hora}:${min}:${seg}`,
        criadoPor: ctx.user?.id,
        criadoPorNome: ctx.user?.name || "Sistema",
      });

      const timelineId = Number(result[0].insertId);

      // Inserir imagens
      if (imagens && imagens.length > 0) {
        await db.insert(timelineImagens).values(
          imagens.map((img, idx) => ({
            timelineId,
            url: img.url,
            legenda: img.legenda,
            ordem: idx,
          }))
        );
      }

      // Registar evento de criação
      await db.insert(timelineEventos).values({
        timelineId,
        tipo: "criacao",
        descricao: "Timeline criada",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
      });

      return { id: timelineId, protocolo, tokenPublico };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      responsavelId: z.number().optional(),
      titulo: z.string().min(2).optional(),
      localId: z.number().nullable().optional(),
      statusId: z.number().nullable().optional(),
      prioridadeId: z.number().nullable().optional(),
      descricao: z.string().optional(),
      estado: z.enum(["rascunho", "enviado", "registado"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      // Buscar dados anteriores para histórico
      const [anterior] = await db.select().from(timelines).where(eq(timelines.id, id));

      await db.update(timelines).set(data).where(eq(timelines.id, id));

      // Registar evento de edição
      await db.insert(timelineEventos).values({
        timelineId: id,
        tipo: "edicao",
        descricao: "Timeline atualizada",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
        dadosAnteriores: JSON.stringify(anterior),
        dadosNovos: JSON.stringify(data),
      });

      return { success: true };
    }),

  excluir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Excluir imagens, eventos e compartilhamentos relacionados
      await db.delete(timelineImagens).where(eq(timelineImagens.timelineId, input.id));
      await db.delete(timelineEventos).where(eq(timelineEventos.timelineId, input.id));
      await db.delete(timelineCompartilhamentos).where(eq(timelineCompartilhamentos.timelineId, input.id));
      // Tabelas de notificações serão adicionadas posteriormente
      await db.delete(timelines).where(eq(timelines.id, input.id));

      return { success: true };
    }),

  // ==================== TIMELINE - IMAGENS ====================
  adicionarImagem: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      url: z.string(),
      legenda: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obter próxima ordem
      const [maxOrdem] = await db.select({ max: sql<number>`MAX(ordem)` })
        .from(timelineImagens)
        .where(eq(timelineImagens.timelineId, input.timelineId));

      const result = await db.insert(timelineImagens).values({
        ...input,
        ordem: (maxOrdem?.max || 0) + 1,
      });

      // Registar evento
      await db.insert(timelineEventos).values({
        timelineId: input.timelineId,
        tipo: "imagem",
        descricao: "Imagem adicionada",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
      });

      return { id: result[0].insertId };
    }),

  removerImagem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(timelineImagens).where(eq(timelineImagens.id, input.id));
      return { success: true };
    }),

  // ==================== TIMELINE - COMPARTILHAMENTO ====================
  compartilhar: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      membroEquipeId: z.number().optional(),
      membroNome: z.string(),
      membroEmail: z.string().optional(),
      membroTelefone: z.string().optional(),
      canalEnvio: z.enum(["email", "whatsapp", "ambos"]).default("email"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(timelineCompartilhamentos).values(input);

      // Registar evento
      await db.insert(timelineEventos).values({
        timelineId: input.timelineId,
        tipo: "compartilhamento",
        descricao: `Compartilhado com ${input.membroNome} via ${input.canalEnvio}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
      });

      // Buscar timeline para enviar email
      const [timeline] = await db.select().from(timelines).where(eq(timelines.id, input.timelineId));

      if (input.membroEmail && (input.canalEnvio === "email" || input.canalEnvio === "ambos") && timeline) {
        const linkVisualizacao = `${process.env.VITE_APP_URL || ""}/timeline/${timeline.tokenPublico}`;

        try {
          await sendEmail({
            to: input.membroEmail,
            subject: `Timeline Compartilhada: ${timeline.titulo}`,
            html: `
              <h2>Timeline Compartilhada</h2>
              <p>Olá ${input.membroNome},</p>
              <p>${ctx.user?.name || "Sistema"} compartilhou uma timeline com você:</p>
              <p><strong>Título:</strong> ${timeline.titulo}</p>
              <p><strong>Protocolo:</strong> ${timeline.protocolo}</p>
              <p><a href="${linkVisualizacao}">Clique aqui para visualizar</a></p>
            `,
          });
        } catch (e) {
          console.error("Erro ao enviar email de compartilhamento:", e);
        }
      }

      return { id: result[0].insertId };
    }),

  listarCompartilhamentos: protectedProcedure
    .input(z.object({ timelineId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(timelineCompartilhamentos)
        .where(eq(timelineCompartilhamentos.timelineId, input.timelineId))
        .orderBy(desc(timelineCompartilhamentos.createdAt));
    }),

  // ==================== TIMELINE - VISUALIZAÇÃO PÚBLICA ====================
  obterPorToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [timeline] = await db.select().from(timelines)
        .where(eq(timelines.tokenPublico, input.token));

      if (!timeline) return null;

      // Buscar dados relacionados
      const [responsavel] = timeline.responsavelId
        ? await db.select().from(timelineResponsaveis).where(eq(timelineResponsaveis.id, timeline.responsavelId))
        : [null];
      const [local] = timeline.localId
        ? await db.select().from(timelineLocais).where(eq(timelineLocais.id, timeline.localId))
        : [null];
      const [status] = timeline.statusId
        ? await db.select().from(timelineStatus).where(eq(timelineStatus.id, timeline.statusId))
        : [null];
      const [prioridade] = timeline.prioridadeId
        ? await db.select().from(timelinePrioridades).where(eq(timelinePrioridades.id, timeline.prioridadeId))
        : [null];

      const imagens = await db.select().from(timelineImagens)
        .where(eq(timelineImagens.timelineId, timeline.id))
        .orderBy(timelineImagens.ordem);

      return { ...timeline, responsavel, local, status, prioridade, imagens };
    }),

  registarVisualizacao: publicProcedure
    .input(z.object({
      token: z.string(),
      compartilhamentoId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [timeline] = await db.select().from(timelines)
        .where(eq(timelines.tokenPublico, input.token));

      if (!timeline) return { success: false };

      // Registar evento de visualização
      await db.insert(timelineEventos).values({
        timelineId: timeline.id,
        tipo: "visualizacao",
        descricao: "Timeline visualizada",
      });

      // Atualizar compartilhamento se fornecido
      if (input.compartilhamentoId) {
        await db.update(timelineCompartilhamentos)
          .set({ visualizado: true, dataVisualizacao: new Date() })
          .where(eq(timelineCompartilhamentos.id, input.compartilhamentoId));
      }

      return { success: true };
    }),

  // ==================== TIMELINE - REGISTAR (FINALIZAR) ====================
  registar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(timelines)
        .set({ estado: "registado" })
        .where(eq(timelines.id, input.id));

      // Registar evento
      await db.insert(timelineEventos).values({
        timelineId: input.id,
        tipo: "registro",
        descricao: "Timeline registada/finalizada",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
      });

      return { success: true };
    }),

  // ==================== TIMELINE - ESTATÍSTICAS ====================
  estatisticas: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, rascunhos: 0, enviados: 0, registados: 0 };

      const all = await db.select().from(timelines)
        .where(eq(timelines.condominioId, input.condominioId));

      return {
        total: all.length,
        rascunhos: all.filter((t: typeof all[0]) => t.estado === "rascunho").length,
        enviados: all.filter((t: typeof all[0]) => t.estado === "enviado").length,
        registados: all.filter((t: typeof all[0]) => t.estado === "registado").length,
      };
    }),

  // ==================== TIMELINE - COMENTÁRIOS ====================
  
  // Listar comentários de uma timeline
  listarComentarios: protectedProcedure
    .input(z.object({ 
      timelineId: z.number(),
      limite: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { comentarios: [], total: 0 };

      const comentarios = await db.select()
        .from(timelineComentarios)
        .where(and(
          eq(timelineComentarios.timelineId, input.timelineId),
          eq(timelineComentarios.excluido, false)
        ))
        .orderBy(desc(timelineComentarios.createdAt))
        .limit(input.limite)
        .offset(input.offset);

      // Contar total
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(timelineComentarios)
        .where(and(
          eq(timelineComentarios.timelineId, input.timelineId),
          eq(timelineComentarios.excluido, false)
        ));

      // Buscar reações para cada comentário
      const comentariosComReacoes = await Promise.all(
        comentarios.map(async (comentario) => {
          const reacoes = await db.select()
            .from(timelineComentarioReacoes)
            .where(eq(timelineComentarioReacoes.comentarioId, comentario.id));
          return { ...comentario, reacoes };
        })
      );

      return { 
        comentarios: comentariosComReacoes, 
        total: countResult?.count || 0 
      };
    }),

  // Criar comentário
  criarComentario: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      texto: z.string().min(1),
      imagensUrls: z.array(z.string()).optional(),
      arquivosUrls: z.array(z.object({
        url: z.string(),
        nome: z.string(),
        tipo: z.string(),
        tamanho: z.number(),
      })).optional(),
      comentarioPaiId: z.number().optional(),
      membroEquipeId: z.number().optional(),
      mencoes: z.array(z.object({
        usuarioId: z.number().optional(),
        membroEquipeId: z.number().optional(),
        nome: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar informações da timeline
      const [timeline] = await db.select()
        .from(timelines)
        .where(eq(timelines.id, input.timelineId));

      const result = await db.insert(timelineComentarios).values({
        timelineId: input.timelineId,
        texto: input.texto,
        imagensUrls: input.imagensUrls || [],
        arquivosUrls: input.arquivosUrls || [],
        mencoes: input.mencoes || [],
        comentarioPaiId: input.comentarioPaiId,
        membroEquipeId: input.membroEquipeId,
        usuarioId: ctx.user?.id,
        autorNome: ctx.user?.name || "Usuário",
        autorEmail: ctx.user?.email,
        autorAvatar: ctx.user?.avatarUrl,
      });

      // Registrar evento
      await db.insert(timelineEventos).values({
        timelineId: input.timelineId,
        tipo: "comentario",
        descricao: `Comentário adicionado por ${ctx.user?.name || "Usuário"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name || "Sistema",
      });

      // Enviar notificação ao dono da timeline (se não for o mesmo usuário)
      if (timeline && timeline.criadoPor !== ctx.user?.id) {
        try {
          await notifyOwner({
            title: `Novo comentário na Timeline: ${timeline.titulo}`,
            content: `${ctx.user?.name || "Usuário"} comentou: "${input.texto.substring(0, 100)}${input.texto.length > 100 ? "..." : ""}"`,
          });
        } catch (e) {
          console.error("Erro ao enviar notificação:", e);
        }
      }

      // Enviar notificações para usuários mencionados
      if (input.mencoes && input.mencoes.length > 0) {
        for (const mencao of input.mencoes) {
          if (mencao.usuarioId && mencao.usuarioId !== ctx.user?.id) {
            // Buscar email do usuário mencionado
            const [usuarioMencionado] = await db.select()
              .from(users)
              .where(eq(users.id, mencao.usuarioId));
            
            if (usuarioMencionado?.email) {
              try {
                await sendEmail({
                  to: usuarioMencionado.email,
                  subject: `Você foi mencionado em um comentário - Timeline: ${timeline?.titulo || "Sem título"}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #3b82f6;">Você foi mencionado!</h2>
                      <p><strong>${ctx.user?.name || "Usuário"}</strong> mencionou você em um comentário:</p>
                      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0;">${input.texto}</p>
                      </div>
                      <p style="color: #6b7280; font-size: 14px;">Timeline: ${timeline?.titulo || "Sem título"}</p>
                    </div>
                  `,
                });
              } catch (e) {
                console.error("Erro ao enviar email de menção:", e);
              }
            }
          }
        }
      }

      return { id: result[0].insertId };
    }),

  // Editar comentário
  editarComentario: protectedProcedure
    .input(z.object({
      id: z.number(),
      texto: z.string().min(1),
      imagensUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o comentário pertence ao usuário
      const [comentario] = await db.select()
        .from(timelineComentarios)
        .where(eq(timelineComentarios.id, input.id));

      if (!comentario) throw new Error("Comentário não encontrado");
      if (comentario.usuarioId !== ctx.user?.id) {
        throw new Error("Você não pode editar este comentário");
      }

      // Contar versões anteriores para determinar o número da versão
      const historicoAnterior = await db.select({ count: sql<number>`count(*)` })
        .from(timelineComentarioHistorico)
        .where(eq(timelineComentarioHistorico.comentarioId, input.id));
      const versaoAtual = (historicoAnterior[0]?.count || 0) + 1;

      // Salvar versão anterior no histórico
      await db.insert(timelineComentarioHistorico).values({
        comentarioId: input.id,
        textoAnterior: comentario.texto,
        imagensUrlsAnterior: comentario.imagensUrls as string[] | null,
        arquivosUrlsAnterior: comentario.arquivosUrls as any,
        mencoesAnterior: comentario.mencoes as any,
        editadoPorId: ctx.user?.id,
        editadoPorNome: ctx.user?.name || "Usuário",
        versao: versaoAtual,
      });

      await db.update(timelineComentarios)
        .set({
          texto: input.texto,
          imagensUrls: input.imagensUrls,
          editado: true,
          dataEdicao: new Date(),
        })
        .where(eq(timelineComentarios.id, input.id));

      return { success: true };
    }),

  // Excluir comentário (soft delete)
  excluirComentario: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o comentário pertence ao usuário ou se é admin
      const [comentario] = await db.select()
        .from(timelineComentarios)
        .where(eq(timelineComentarios.id, input.id));

      if (!comentario) throw new Error("Comentário não encontrado");
      if (comentario.usuarioId !== ctx.user?.id && ctx.user?.role !== "admin" && ctx.user?.role !== "sindico") {
        throw new Error("Você não pode excluir este comentário");
      }

      await db.update(timelineComentarios)
        .set({
          excluido: true,
          dataExclusao: new Date(),
        })
        .where(eq(timelineComentarios.id, input.id));

      return { success: true };
    }),

  // Adicionar reação a comentário
  adicionarReacao: protectedProcedure
    .input(z.object({
      comentarioId: z.number(),
      tipo: z.enum(["like", "love", "check", "question", "alert"]),
      membroEquipeId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se já existe reação do mesmo usuário
      const [existente] = await db.select()
        .from(timelineComentarioReacoes)
        .where(and(
          eq(timelineComentarioReacoes.comentarioId, input.comentarioId),
          eq(timelineComentarioReacoes.usuarioId, ctx.user?.id || 0)
        ));

      if (existente) {
        // Atualizar reação existente
        await db.update(timelineComentarioReacoes)
          .set({ tipo: input.tipo })
          .where(eq(timelineComentarioReacoes.id, existente.id));
        return { id: existente.id, updated: true };
      }

      const result = await db.insert(timelineComentarioReacoes).values({
        comentarioId: input.comentarioId,
        tipo: input.tipo,
        membroEquipeId: input.membroEquipeId,
        usuarioId: ctx.user?.id,
        autorNome: ctx.user?.name || "Usuário",
      });

      return { id: result[0].insertId, updated: false };
    }),

  // Remover reação de comentário
  removerReacao: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(timelineComentarioReacoes)
        .where(eq(timelineComentarioReacoes.id, input.id));

      return { success: true };
    }),

  // Listar membros da equipe para menção/compartilhamento
  listarMembrosEquipe: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select()
        .from(membrosEquipe)
        .where(and(
          eq(membrosEquipe.condominioId, input.condominioId),
          eq(membrosEquipe.ativo, true)
        ))
        .orderBy(membrosEquipe.nome);
    }),

  // ==================== TIMELINE - HISTÓRICO DE EDIÇÕES ====================
  
  // Listar histórico de edições de um comentário
  listarHistoricoComentario: protectedProcedure
    .input(z.object({ comentarioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select()
        .from(timelineComentarioHistorico)
        .where(eq(timelineComentarioHistorico.comentarioId, input.comentarioId))
        .orderBy(desc(timelineComentarioHistorico.versao));
    }),

  // ==================== TIMELINE - FILTROS DE COMENTÁRIOS ====================
  
  // Listar comentários com filtros avançados
  listarComentariosFiltrados: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      filtroAutor: z.string().optional(),
      filtroDataInicio: z.date().optional(),
      filtroDataFim: z.date().optional(),
      filtroTipoAnexo: z.enum(["imagem", "arquivo", "todos", "nenhum"]).optional(),
      apenasComMencoes: z.boolean().optional(),
      apenasRespostas: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { comentarios: [], total: 0 };

      // Construir condições de filtro
      const conditions = [
        eq(timelineComentarios.timelineId, input.timelineId),
        eq(timelineComentarios.excluido, false),
      ];

      // Filtro por autor
      if (input.filtroAutor) {
        conditions.push(like(timelineComentarios.autorNome, `%${input.filtroAutor}%`));
      }

      // Filtro por data
      if (input.filtroDataInicio) {
        conditions.push(gte(timelineComentarios.createdAt, input.filtroDataInicio));
      }
      if (input.filtroDataFim) {
        conditions.push(lte(timelineComentarios.createdAt, input.filtroDataFim));
      }

      // Filtro por tipo de anexo
      if (input.filtroTipoAnexo === "imagem") {
        conditions.push(sql`JSON_LENGTH(${timelineComentarios.imagensUrls}) > 0`);
      } else if (input.filtroTipoAnexo === "arquivo") {
        conditions.push(sql`JSON_LENGTH(${timelineComentarios.arquivosUrls}) > 0`);
      } else if (input.filtroTipoAnexo === "nenhum") {
        conditions.push(sql`(JSON_LENGTH(${timelineComentarios.imagensUrls}) = 0 OR ${timelineComentarios.imagensUrls} IS NULL)`);
        conditions.push(sql`(JSON_LENGTH(${timelineComentarios.arquivosUrls}) = 0 OR ${timelineComentarios.arquivosUrls} IS NULL)`);
      }

      // Filtro por menções
      if (input.apenasComMencoes) {
        conditions.push(sql`JSON_LENGTH(${timelineComentarios.mencoes}) > 0`);
      }

      // Filtro por respostas (apenas comentários que são respostas)
      if (input.apenasRespostas) {
        conditions.push(sql`${timelineComentarios.comentarioPaiId} IS NOT NULL`);
      }

      // Buscar comentários com filtros
      const comentarios = await db.select()
        .from(timelineComentarios)
        .where(and(...conditions))
        .orderBy(desc(timelineComentarios.createdAt));

      // Buscar reações para cada comentário
      const comentariosComReacoes = await Promise.all(
        comentarios.map(async (c) => {
          const reacoes = await db.select()
            .from(timelineComentarioReacoes)
            .where(eq(timelineComentarioReacoes.comentarioId, c.id));
          
          // Buscar respostas (comentários filhos)
          const respostas = await db.select()
            .from(timelineComentarios)
            .where(and(
              eq(timelineComentarios.comentarioPaiId, c.id),
              eq(timelineComentarios.excluido, false)
            ))
            .orderBy(timelineComentarios.createdAt);
          
          // Buscar reações das respostas
          const respostasComReacoes = await Promise.all(
            respostas.map(async (r) => {
              const reacoesResposta = await db.select()
                .from(timelineComentarioReacoes)
                .where(eq(timelineComentarioReacoes.comentarioId, r.id));
              return { ...r, reacoes: reacoesResposta };
            })
          );
          
          return { ...c, reacoes, respostas: respostasComReacoes };
        })
      );

      // Filtrar apenas comentários de nível raiz (sem pai) para evitar duplicação
      const comentariosRaiz = comentariosComReacoes.filter(c => !c.comentarioPaiId);

      return {
        comentarios: comentariosRaiz,
        total: comentariosRaiz.length,
      };
    }),

  // ==================== TIMELINE - GERAÇÃO DE PDF ====================
  
  // Gerar dados para PDF da timeline
  gerarDadosPdf: protectedProcedure
    .input(z.object({ timelineId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar timeline com todos os relacionamentos
      const [timeline] = await db.select()
        .from(timelines)
        .where(eq(timelines.id, input.timelineId));

      if (!timeline) throw new Error("Timeline não encontrada");

      // Buscar responsável
      let responsavel = null;
      if (timeline.responsavelId) {
        const [resp] = await db.select()
          .from(timelineResponsaveis)
          .where(eq(timelineResponsaveis.id, timeline.responsavelId));
        responsavel = resp;
      }

      // Buscar local
      let local = null;
      if (timeline.localId) {
        const [loc] = await db.select()
          .from(timelineLocais)
          .where(eq(timelineLocais.id, timeline.localId));
        local = loc;
      }

      // Buscar status
      let status = null;
      if (timeline.statusId) {
        const [stat] = await db.select()
          .from(timelineStatus)
          .where(eq(timelineStatus.id, timeline.statusId));
        status = stat;
      }

      // Buscar prioridade
      let prioridade = null;
      if (timeline.prioridadeId) {
        const [prio] = await db.select()
          .from(timelinePrioridades)
          .where(eq(timelinePrioridades.id, timeline.prioridadeId));
        prioridade = prio;
      }

      // Buscar imagens
      const imagensTimeline = await db.select()
        .from(timelineImagens)
        .where(eq(timelineImagens.timelineId, input.timelineId));

      // Buscar comentários com reações
      const comentariosBase = await db.select()
        .from(timelineComentarios)
        .where(and(
          eq(timelineComentarios.timelineId, input.timelineId),
          eq(timelineComentarios.excluido, false)
        ))
        .orderBy(timelineComentarios.createdAt);

      const comentarios = await Promise.all(
        comentariosBase.map(async (c) => {
          const reacoes = await db.select()
            .from(timelineComentarioReacoes)
            .where(eq(timelineComentarioReacoes.comentarioId, c.id));
          return { ...c, reacoes };
        })
      );

      return {
        timeline,
        responsavel,
        local,
        status,
        prioridade,
        imagens: imagensTimeline,
        comentarios,
      };
    }),

  // ==================== TIMELINE - BUSCA GLOBAL ====================
  
  // Buscar comentários por texto
  buscarComentarios: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      termo: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { comentarios: [], total: 0 };

      // Buscar comentários que contenham o termo
      const comentarios = await db.select()
        .from(timelineComentarios)
        .where(and(
          eq(timelineComentarios.timelineId, input.timelineId),
          eq(timelineComentarios.excluido, false),
          like(timelineComentarios.texto, `%${input.termo}%`)
        ))
        .orderBy(desc(timelineComentarios.createdAt));

      // Buscar reações para cada comentário
      const comentariosComReacoes = await Promise.all(
        comentarios.map(async (c) => {
          const reacoes = await db.select()
            .from(timelineComentarioReacoes)
            .where(eq(timelineComentarioReacoes.comentarioId, c.id));
          return { ...c, reacoes };
        })
      );

      return {
        comentarios: comentariosComReacoes,
        total: comentariosComReacoes.length,
      };
    }),

  // ==================== TIMELINE - ESTATÍSTICAS ====================
  
  // Obter estatísticas da timeline
  obterEstatisticas: protectedProcedure
    .input(z.object({ timelineId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Total de comentários
      const comentarios = await db.select()
        .from(timelineComentarios)
        .where(and(
          eq(timelineComentarios.timelineId, input.timelineId),
          eq(timelineComentarios.excluido, false)
        ));

      // Agrupar por autor
      const participacaoPorMembro: Record<string, number> = {};
      comentarios.forEach((c) => {
        const autor = c.autorNome || 'Anônimo';
        participacaoPorMembro[autor] = (participacaoPorMembro[autor] || 0) + 1;
      });

      // Calcular tempo médio entre comentários
      let tempoMedioResposta = 0;
      if (comentarios.length > 1) {
        const tempos: number[] = [];
        for (let i = 1; i < comentarios.length; i++) {
          const diff = new Date(comentarios[i].createdAt).getTime() - new Date(comentarios[i-1].createdAt).getTime();
          tempos.push(diff);
        }
        tempoMedioResposta = tempos.reduce((a, b) => a + b, 0) / tempos.length;
      }

      // Contar reações
      const reacoes = await db.select()
        .from(timelineComentarioReacoes)
        .where(sql`comentarioId IN (SELECT id FROM timeline_comentarios WHERE timelineId = ${input.timelineId})`);

      // Agrupar reações por tipo
      const reacoesPorTipo: Record<string, number> = {};
      reacoes.forEach((r) => {
        reacoesPorTipo[r.tipo] = (reacoesPorTipo[r.tipo] || 0) + 1;
      });

      // Comentários por dia (últimos 7 dias)
      const hoje = new Date();
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      const comentariosPorDia: Record<string, number> = {};
      
      for (let i = 0; i < 7; i++) {
        const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
        const dataStr = data.toISOString().split('T')[0];
        comentariosPorDia[dataStr] = 0;
      }
      
      comentarios.forEach((c) => {
        const dataStr = new Date(c.createdAt).toISOString().split('T')[0];
        if (comentariosPorDia[dataStr] !== undefined) {
          comentariosPorDia[dataStr]++;
        }
      });

      return {
        totalComentarios: comentarios.length,
        totalReacoes: reacoes.length,
        participacaoPorMembro,
        reacoesPorTipo,
        tempoMedioResposta, // em milissegundos
        comentariosPorDia,
        ultimoComentario: comentarios[comentarios.length - 1]?.createdAt || null,
      };
    }),

  // ==================== TIMELINE - TEMPLATES DE COMENTÁRIOS ====================
  
  // Listar templates de comentários
  listarTemplates: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select()
        .from(timelineComentarioTemplates)
        .where(and(
          or(
            eq(timelineComentarioTemplates.condominioId, input.condominioId),
            eq(timelineComentarioTemplates.publico, true)
          ),
          eq(timelineComentarioTemplates.ativo, true)
        ))
        .orderBy(desc(timelineComentarioTemplates.vezesUsado));
    }),

  // Criar template de comentário
  criarTemplate: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(2),
      texto: z.string().min(5),
      categoria: z.string().optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      publico: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(timelineComentarioTemplates).values({
        ...input,
        usuarioId: ctx.user?.id,
      });

      return { id: result[0].insertId };
    }),

  // Usar template (incrementar contador)
  usarTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(timelineComentarioTemplates)
        .set({
          vezesUsado: sql`vezesUsado + 1`,
          ultimoUso: new Date(),
        })
        .where(eq(timelineComentarioTemplates.id, input.id));

      return { success: true };
    }),

  // Editar template
  editarTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(2).optional(),
      texto: z.string().min(5).optional(),
      categoria: z.string().optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      publico: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(timelineComentarioTemplates)
        .set(data)
        .where(eq(timelineComentarioTemplates.id, id));

      return { success: true };
    }),

  // Excluir template
  excluirTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(timelineComentarioTemplates)
        .set({ ativo: false })
        .where(eq(timelineComentarioTemplates.id, input.id));

      return { success: true };
    }),

  // ==================== TIMELINE - LEMBRETES ====================
  
  // Listar lembretes
  listarLembretes: protectedProcedure
    .input(z.object({
      timelineId: z.number().optional(),
      condominioId: z.number().optional(),
      status: z.enum(["pendente", "enviado", "cancelado"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(timelineLembretes.usuarioId, ctx.user?.id || 0)];
      
      if (input.timelineId) {
        conditions.push(eq(timelineLembretes.timelineId, input.timelineId));
      }
      if (input.condominioId) {
        conditions.push(eq(timelineLembretes.condominioId, input.condominioId));
      }
      if (input.status) {
        conditions.push(eq(timelineLembretes.status, input.status));
      }

      return db.select()
        .from(timelineLembretes)
        .where(and(...conditions))
        .orderBy(timelineLembretes.dataLembrete);
    }),

  // Criar lembrete
  criarLembrete: protectedProcedure
    .input(z.object({
      timelineId: z.number(),
      condominioId: z.number().optional(),
      titulo: z.string().min(2),
      descricao: z.string().optional(),
      dataLembrete: z.string(), // ISO date string
      notificarEmail: z.boolean().optional(),
      notificarPush: z.boolean().optional(),
      antecedencia: z.number().optional(),
      recorrente: z.boolean().optional(),
      intervaloRecorrencia: z.enum(["diario", "semanal", "mensal"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(timelineLembretes).values({
        ...input,
        dataLembrete: new Date(input.dataLembrete),
        usuarioId: ctx.user?.id,
      });

      return { id: result[0].insertId };
    }),

  // Editar lembrete
  editarLembrete: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(2).optional(),
      descricao: z.string().optional(),
      dataLembrete: z.string().optional(),
      notificarEmail: z.boolean().optional(),
      notificarPush: z.boolean().optional(),
      antecedencia: z.number().optional(),
      recorrente: z.boolean().optional(),
      intervaloRecorrencia: z.enum(["diario", "semanal", "mensal"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, dataLembrete, ...data } = input;
      const updateData: any = { ...data };
      if (dataLembrete) {
        updateData.dataLembrete = new Date(dataLembrete);
      }

      await db.update(timelineLembretes)
        .set(updateData)
        .where(eq(timelineLembretes.id, id));

      return { success: true };
    }),

  // Cancelar lembrete
  cancelarLembrete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(timelineLembretes)
        .set({ status: "cancelado" })
        .where(eq(timelineLembretes.id, input.id));

      return { success: true };
    }),

  // Excluir lembrete
  excluirLembrete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(timelineLembretes)
        .where(eq(timelineLembretes.id, input.id));

      return { success: true };
    }),

  // ==================== TIMELINE - CONFIGURAÇÕES DE NOTIFICAÇÕES ====================
  // TODO: Adicionar tabelas de notificações e implementar endpoints
});

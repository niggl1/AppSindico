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
  users,
} from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { sendEmail } from "../_core/email";

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

  // ==================== TIMELINE - CONFIGURAÇÕES DE NOTIFICAÇÕES ====================
  // TODO: Adicionar tabelas de notificações e implementar endpoints
});

import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  notificacoesPush,
  configuracoesNotificacoes,
} from "../../drizzle/schema";

// ==================== NOTIFICAÇÕES ROUTER ====================
export const notificacoesRouter = router({
  // Listar notificações do usuário
  listar: protectedProcedure
    .input(z.object({
      limite: z.number().optional().default(20),
      apenasNaoLidas: z.boolean().optional().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { notificacoes: [], total: 0, naoLidas: 0 };

      const conditions = [eq(notificacoesPush.usuarioId, ctx.user?.id || 0)];
      
      if (input.apenasNaoLidas) {
        conditions.push(eq(notificacoesPush.lida, false));
      }

      const notificacoes = await db.select()
        .from(notificacoesPush)
        .where(and(...conditions))
        .orderBy(desc(notificacoesPush.createdAt))
        .limit(input.limite);

      // Contar não lidas
      const naoLidas = await db.select()
        .from(notificacoesPush)
        .where(and(
          eq(notificacoesPush.usuarioId, ctx.user?.id || 0),
          eq(notificacoesPush.lida, false)
        ));

      return {
        notificacoes,
        total: notificacoes.length,
        naoLidas: naoLidas.length,
      };
    }),

  // Marcar notificação como lida
  marcarComoLida: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(notificacoesPush)
        .set({
          lida: true,
          dataLeitura: new Date(),
        })
        .where(and(
          eq(notificacoesPush.id, input.id),
          eq(notificacoesPush.usuarioId, ctx.user?.id || 0)
        ));

      return { success: true };
    }),

  // Marcar todas como lidas
  marcarTodasComoLidas: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(notificacoesPush)
        .set({
          lida: true,
          dataLeitura: new Date(),
        })
        .where(and(
          eq(notificacoesPush.usuarioId, ctx.user?.id || 0),
          eq(notificacoesPush.lida, false)
        ));

      return { success: true };
    }),

  // Criar notificação (interno)
  criar: protectedProcedure
    .input(z.object({
      usuarioId: z.number(),
      condominioId: z.number().optional(),
      titulo: z.string(),
      mensagem: z.string(),
      tipo: z.enum(["comentario", "mencao", "timeline", "sistema"]).optional(),
      timelineId: z.number().optional(),
      comentarioId: z.number().optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      linkAcao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(notificacoesPush).values({
        usuarioId: input.usuarioId,
        condominioId: input.condominioId,
        titulo: input.titulo,
        mensagem: input.mensagem,
        tipo: input.tipo || "sistema",
        timelineId: input.timelineId,
        comentarioId: input.comentarioId,
        icone: input.icone,
        cor: input.cor,
        linkAcao: input.linkAcao,
      });

      return { id: result[0].insertId };
    }),

  // Obter configurações de notificações
  obterConfiguracoes: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [config] = await db.select()
        .from(configuracoesNotificacoes)
        .where(eq(configuracoesNotificacoes.usuarioId, ctx.user?.id || 0));

      // Se não existir, criar configuração padrão
      if (!config) {
        await db.insert(configuracoesNotificacoes).values({
          usuarioId: ctx.user?.id || 0,
        });
        
        const [novaConfig] = await db.select()
          .from(configuracoesNotificacoes)
          .where(eq(configuracoesNotificacoes.usuarioId, ctx.user?.id || 0));
        
        return novaConfig;
      }

      return config;
    }),

  // Atualizar configurações de notificações
  atualizarConfiguracoes: protectedProcedure
    .input(z.object({
      receberNotificacoesPush: z.boolean().optional(),
      receberNotificacoesEmail: z.boolean().optional(),
      notificarComentarios: z.boolean().optional(),
      notificarMencoes: z.boolean().optional(),
      notificarTimelines: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se já existe configuração
      const [config] = await db.select()
        .from(configuracoesNotificacoes)
        .where(eq(configuracoesNotificacoes.usuarioId, ctx.user?.id || 0));

      if (config) {
        await db.update(configuracoesNotificacoes)
          .set(input)
          .where(eq(configuracoesNotificacoes.usuarioId, ctx.user?.id || 0));
      } else {
        await db.insert(configuracoesNotificacoes).values({
          usuarioId: ctx.user?.id || 0,
          ...input,
        });
      }

      return { success: true };
    }),

  // Excluir notificação
  excluir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(notificacoesPush)
        .where(and(
          eq(notificacoesPush.id, input.id),
          eq(notificacoesPush.usuarioId, ctx.user?.id || 0)
        ));

      return { success: true };
    }),

  // Limpar todas as notificações
  limparTodas: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(notificacoesPush)
        .where(eq(notificacoesPush.usuarioId, ctx.user?.id || 0));

      return { success: true };
    }),
});

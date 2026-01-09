import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { tarefasFacil } from "../../drizzle/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Prefixos de protocolo por tipo
const PREFIXOS_PROTOCOLO = {
  vistoria: "VS",
  manutencao: "MS",
  ocorrencia: "OS",
  antes_depois: "AD",
} as const;

// Função para gerar protocolo único
async function gerarProtocolo(tipo: keyof typeof PREFIXOS_PROTOCOLO, condominioId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  
  const prefixo = PREFIXOS_PROTOCOLO[tipo];
  const ano = new Date().getFullYear();
  
  // Buscar o último protocolo do mesmo tipo e ano
  const ultimoProtocolo = await db
    .select({ protocolo: tarefasFacil.protocolo })
    .from(tarefasFacil)
    .where(
      and(
        eq(tarefasFacil.condominioId, condominioId),
        like(tarefasFacil.protocolo, `${prefixo}-${ano}-%`)
      )
    )
    .orderBy(desc(tarefasFacil.id))
    .limit(1);

  let numero = 1;
  if (ultimoProtocolo.length > 0) {
    const partes = ultimoProtocolo[0].protocolo.split("-");
    numero = parseInt(partes[2], 10) + 1;
  }

  return `${prefixo}-${ano}-${numero.toString().padStart(4, "0")}`;
}

export const tarefaFacilRouter = router({
  // Criar nova tarefa
  criar: protectedProcedure
    .input(
      z.object({
        condominioId: z.number(),
        tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "antes_depois"]),
        titulo: z.string().min(1, "Título é obrigatório"),
        descricao: z.string().optional(),
        imagens: z.array(z.string()).optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        endereco: z.string().optional(),
        status: z.enum(["rascunho", "pendente", "em_andamento", "concluido", "cancelado"]).default("rascunho"),
        prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
        observacoes: z.string().optional(),
        imagemAntes: z.string().optional(),
        imagemDepois: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const protocolo = await gerarProtocolo(input.tipo, input.condominioId);
      
      const [result] = await db.insert(tarefasFacil).values({
        condominioId: input.condominioId,
        userId: ctx.user.id,
        tipo: input.tipo,
        protocolo,
        titulo: input.titulo,
        descricao: input.descricao,
        imagens: input.imagens || [],
        latitude: input.latitude,
        longitude: input.longitude,
        endereco: input.endereco,
        status: input.status,
        prioridade: input.prioridade || "media",
        observacoes: input.observacoes,
        imagemAntes: input.imagemAntes,
        imagemDepois: input.imagemDepois,
        enviadoEm: input.status !== "rascunho" ? new Date() : null,
      });

      return { id: result.insertId, protocolo };
    }),

  // Listar tarefas com filtros
  listar: protectedProcedure
    .input(
      z.object({
        condominioId: z.number(),
        tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "antes_depois"]).optional(),
        status: z.enum(["rascunho", "pendente", "em_andamento", "concluido", "cancelado"]).optional(),
        limite: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const conditions = [eq(tarefasFacil.condominioId, input.condominioId)];
      
      if (input.tipo) {
        conditions.push(eq(tarefasFacil.tipo, input.tipo));
      }
      if (input.status) {
        conditions.push(eq(tarefasFacil.status, input.status));
      }

      const tarefas = await db
        .select()
        .from(tarefasFacil)
        .where(and(...conditions))
        .orderBy(desc(tarefasFacil.createdAt))
        .limit(input.limite)
        .offset(input.offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tarefasFacil)
        .where(and(...conditions));

      return {
        tarefas,
        total: countResult?.count || 0,
      };
    }),

  // Buscar tarefa por ID
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [tarefa] = await db
        .select()
        .from(tarefasFacil)
        .where(eq(tarefasFacil.id, input.id));

      if (!tarefa) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
      }

      return tarefa;
    }),

  // Atualizar tarefa
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        imagens: z.array(z.string()).optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        endereco: z.string().optional(),
        status: z.enum(["rascunho", "pendente", "em_andamento", "concluido", "cancelado"]).optional(),
        prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
        observacoes: z.string().optional(),
        imagemAntes: z.string().optional(),
        imagemDepois: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { id, ...dados } = input;
      
      const updateData: Record<string, unknown> = { ...dados };
      
      // Se mudou para status diferente de rascunho, marcar como enviado
      if (dados.status && dados.status !== "rascunho") {
        const [tarefa] = await db.select().from(tarefasFacil).where(eq(tarefasFacil.id, id));
        if (tarefa && tarefa.status === "rascunho") {
          updateData.enviadoEm = new Date();
        }
      }
      
      // Se concluído, marcar data de conclusão
      if (dados.status === "concluido") {
        updateData.concluidoEm = new Date();
      }

      await db.update(tarefasFacil).set(updateData).where(eq(tarefasFacil.id, id));

      return { success: true };
    }),

  // Enviar rascunhos (múltiplos de uma vez)
  enviarRascunhos: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        status: z.enum(["pendente", "em_andamento"]).default("pendente"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const agora = new Date();
      
      for (const id of input.ids) {
        await db
          .update(tarefasFacil)
          .set({
            status: input.status,
            enviadoEm: agora,
          })
          .where(
            and(
              eq(tarefasFacil.id, id),
              eq(tarefasFacil.status, "rascunho")
            )
          );
      }

      return { success: true, enviados: input.ids.length };
    }),

  // Excluir tarefa
  excluir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.delete(tarefasFacil).where(eq(tarefasFacil.id, input.id));
      return { success: true };
    }),

  // Estatísticas por condomínio
  estatisticas: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const stats = await db
        .select({
          tipo: tarefasFacil.tipo,
          status: tarefasFacil.status,
          count: sql<number>`count(*)`,
        })
        .from(tarefasFacil)
        .where(eq(tarefasFacil.condominioId, input.condominioId))
        .groupBy(tarefasFacil.tipo, tarefasFacil.status);

      // Organizar estatísticas
      const resultado = {
        vistoria: { total: 0, rascunho: 0, pendente: 0, em_andamento: 0, concluido: 0, cancelado: 0 },
        manutencao: { total: 0, rascunho: 0, pendente: 0, em_andamento: 0, concluido: 0, cancelado: 0 },
        ocorrencia: { total: 0, rascunho: 0, pendente: 0, em_andamento: 0, concluido: 0, cancelado: 0 },
        antes_depois: { total: 0, rascunho: 0, pendente: 0, em_andamento: 0, concluido: 0, cancelado: 0 },
      };

      type TipoTarefa = "vistoria" | "manutencao" | "ocorrencia" | "antes_depois";
      type StatusTarefa = "rascunho" | "pendente" | "em_andamento" | "concluido" | "cancelado";
      
      for (const stat of stats) {
        if (stat.tipo && stat.status) {
          const tipo = stat.tipo as TipoTarefa;
          const status = stat.status as StatusTarefa;
          resultado[tipo][status] = stat.count;
          resultado[tipo].total += stat.count;
        }
      }

      return resultado;
    }),

  // Listar rascunhos do usuário
  listarRascunhos: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const rascunhos = await db
        .select()
        .from(tarefasFacil)
        .where(
          and(
            eq(tarefasFacil.condominioId, input.condominioId),
            eq(tarefasFacil.userId, ctx.user.id),
            eq(tarefasFacil.status, "rascunho")
          )
        )
        .orderBy(desc(tarefasFacil.createdAt));

      return rascunhos;
    }),
});

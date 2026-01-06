import { COOKIE_NAME } from "@shared/const";
import { generateRevistaPDF } from "./pdfGenerator";
import { generateFuncaoRapidaPDF } from "./pdfFuncoesRapidas";
import webpush from "web-push";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  condominios,
  revistas,
  secoes,
  mensagensSindico,
  avisos,
  funcionarios,
  eventos,
  antesDepois,
  achadosPerdidos,
  caronas,
  classificados,
  votacoes,
  opcoesVotacao,
  votos,
  vagasEstacionamento,
  linksUteis,
  telefonesUteis,
  publicidades,
  moradores,
  notificacoes,
  preferenciasNotificacao,
  realizacoes,
  melhorias,
  anunciantes,
  anuncios,
  aquisicoes,
  users,
  comunicados,
  albuns,
  fotos,
  dicasSeguranca,
  regrasNormas,
  imagensRealizacoes,
  imagensMelhorias,
  imagensAquisicoes,
  imagensAchadosPerdidos,
  imagensVagas,
  favoritos,
  apps,
  appModulos,
  vistorias,
  vistoriaImagens,
  vistoriaTimeline,
  manutencoes,
  manutencaoImagens,
  manutencaoTimeline,
  ocorrencias,
  ocorrenciaImagens,
  ocorrenciaTimeline,
  checklists,
  checklistItens,
  checklistImagens,
  checklistTimeline,
  membrosEquipe,
  linksCompartilhaveis,
  historicoCompartilhamentos,
  comentariosItem,
  anexosComentario,
  respostasComentario,
  destaques,
  imagensDestaques,
  paginasCustom,
  imagensCustom,
  vencimentos,
  vencimentoAlertas,
  vencimentoEmails,
  vencimentoNotificacoes,
  pushSubscriptions,
  lembretes,
  historicoNotificacoes,
  configuracoesEmail,
  configuracoesPush,
  templatesNotificacao,
  tiposInfracao,
  notificacoesInfracao,
  respostasInfracao,
  condominioFuncoes,
  funcionarioFuncoes,
  funcionarioAcessos,
  funcionarioCondominios,
  funcionarioApps,
  FUNCOES_DISPONIVEIS,
  checklistTemplates,
  checklistTemplateItens,
  valoresSalvos,
  osCategorias,
  osPrioridades,
  osStatus,
  osSetores,
  osConfiguracoes,
  ordensServico,
  osResponsaveis,
  osMateriais,
  osOrcamentos,
  osTimeline,
  osChat,
  osImagens,
  funcoesRapidas
} from "../drizzle/schema";
import { eq, and, desc, like, or, sql, gte, lte, inArray, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    // ==================== LOGIN LOCAL PARA SÃNDICOS ====================
    // Registar novo sÃ­ndico com email/senha
    registar: publicProcedure.input(z.object({
      nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      email: z.string().email("Email invÃ¡lido"),
      senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      tipoConta: z.enum(["sindico", "administradora"]).default("sindico")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error("Este email jÃ¡ estÃ¡ cadastrado");
      }
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.senha, 10);
      const crypto = await import("crypto");
      const openId = `local_${crypto.randomBytes(16).toString("hex")}`;
      const [result] = await db.insert(users).values({
        openId,
        email: input.email,
        name: input.nome,
        senha: senhaHash,
        loginMethod: "local",
        role: "sindico",
        tipoConta: input.tipoConta,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const { sdk } = await import("./_core/sdk");
      const sessionToken = await sdk.createSessionToken(openId, { name: input.nome });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      return {
        success: true,
        message: "Conta criada com sucesso!",
        user: {
          id: result.insertId,
          nome: input.nome,
          email: input.email
        }
      };
    }),
    // Login com email/senha
    loginLocal: publicProcedure.input(z.object({
      email: z.string().email("Email invÃ¡lido"),
      senha: z.string().min(1, "Senha Ã© obrigatÃ³ria")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user) {
        throw new Error("Email ou senha incorretos");
      }
      if (!user.senha) {
        throw new Error("Esta conta usa login social. Por favor, use o botÃ£o de login com Google/Apple.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaValida = await bcrypt.compare(input.senha, user.senha);
      if (!senhaValida) {
        throw new Error("Email ou senha incorretos");
      }
      await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
      const { sdk } = await import("./_core/sdk");
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      return {
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          nome: user.name,
          email: user.email
        }
      };
    }),
    // Solicitar recuperaÃ§Ã£o de senha
    solicitarRecuperacao: publicProcedure.input(z.object({
      email: z.string().email("Email invÃ¡lido")
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user) {
        return {
          success: true,
          message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link para redefinir sua senha."
        };
      }
      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 60 * 60 * 1e3);
      await db.update(users).set({
        resetToken,
        resetTokenExpira: expira
      }).where(eq(users.id, user.id));
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `RecuperaÃ§Ã£o de Senha - ${user.name || user.email}`,
          content: `O utilizador ${user.name || "N/A"} (${user.email}) solicitou recuperaÃ§Ã£o de senha.

Token: ${resetToken}

Link: /redefinir-senha/${resetToken}`
        });
      } catch (e) {
        console.error("Erro ao enviar notificaÃ§Ã£o:", e);
      }
      return {
        success: true,
        message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link para redefinir sua senha.",
        // Em desenvolvimento, retornar o token para testes
        _debug_token: resetToken
      };
    }),
    // Validar token de recuperaÃ§Ã£o
    validarTokenRecuperacao: publicProcedure.input(z.object({
      token: z.string()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.resetToken, input.token)).limit(1);
      if (!user) {
        return { valido: false, mensagem: "Token invÃ¡lido" };
      }
      if (user.resetTokenExpira && new Date(user.resetTokenExpira) < /* @__PURE__ */ new Date()) {
        return { valido: false, mensagem: "Token expirado. Solicite um novo link." };
      }
      return {
        valido: true,
        email: user.email,
        nome: user.name
      };
    }),
    // Redefinir senha com token
    redefinirSenha: publicProcedure.input(z.object({
      token: z.string(),
      novaSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.resetToken, input.token)).limit(1);
      if (!user) {
        throw new Error("Token invÃ¡lido");
      }
      if (user.resetTokenExpira && new Date(user.resetTokenExpira) < /* @__PURE__ */ new Date()) {
        throw new Error("Token expirado. Solicite um novo link de recuperaÃ§Ã£o.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.novaSenha, 10);
      await db.update(users).set({
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null,
        lastSignedIn: /* @__PURE__ */ new Date()
      }).where(eq(users.id, user.id));
      const { sdk } = await import("./_core/sdk");
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      return {
        success: true,
        message: "Senha redefinida com sucesso!",
        user: {
          id: user.id,
          nome: user.name,
          email: user.email
        }
      };
    }),
    // ==================== PERFIL DO USUÃRIO ====================
    // Obter dados do perfil
    getPerfil: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select({
        id: users.id,
        nome: users.name,
        email: users.email,
        telefone: users.phone,
        avatarUrl: users.avatarUrl,
        tipoConta: users.tipoConta,
        role: users.role,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn
      }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user) {
        throw new Error("UsuÃ¡rio nÃ£o encontrado");
      }
      return user;
    }),
    // Atualizar dados do perfil
    atualizarPerfil: protectedProcedure.input(z.object({
      nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
      telefone: z.string().optional().nullable(),
      avatarUrl: z.string().optional().nullable()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = {};
      if (input.nome !== void 0) updateData.name = input.nome;
      if (input.telefone !== void 0) updateData.phone = input.telefone;
      if (input.avatarUrl !== void 0) updateData.avatarUrl = input.avatarUrl;
      if (Object.keys(updateData).length === 0) {
        throw new Error("Nenhum dado para atualizar");
      }
      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
      return {
        success: true,
        message: "Perfil atualizado com sucesso!"
      };
    }),
    // Alterar senha
    alterarSenha: protectedProcedure.input(z.object({
      senhaAtual: z.string().min(1, "Senha atual Ã© obrigatÃ³ria"),
      novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user) {
        throw new Error("UsuÃ¡rio nÃ£o encontrado");
      }
      if (!user.senha) {
        throw new Error("Esta conta usa login social e nÃ£o possui senha local.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaValida = await bcrypt.compare(input.senhaAtual, user.senha);
      if (!senhaValida) {
        throw new Error("Senha atual incorreta");
      }
      const novaSenhaHash = await bcrypt.hash(input.novaSenha, 10);
      await db.update(users).set({
        senha: novaSenhaHash
      }).where(eq(users.id, ctx.user.id));
      return {
        success: true,
        message: "Senha alterada com sucesso!"
      };
    }),
    // Atualizar email (com verificaÃ§Ã£o de duplicidade)
    atualizarEmail: protectedProcedure.input(z.object({
      novoEmail: z.string().email("Email invÃ¡lido"),
      senha: z.string().min(1, "Senha Ã© obrigatÃ³ria para alterar o email")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user) {
        throw new Error("UsuÃ¡rio nÃ£o encontrado");
      }
      if (!user.senha) {
        throw new Error("Esta conta usa login social e nÃ£o pode alterar o email.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaValida = await bcrypt.compare(input.senha, user.senha);
      if (!senhaValida) {
        throw new Error("Senha incorreta");
      }
      const [existingUser] = await db.select().from(users).where(and(
        eq(users.email, input.novoEmail),
        sql`${users.id} != ${ctx.user.id}`
      )).limit(1);
      if (existingUser) {
        throw new Error("Este email jÃ¡ estÃ¡ em uso por outra conta");
      }
      await db.update(users).set({
        email: input.novoEmail
      }).where(eq(users.id, ctx.user.id));
      return {
        success: true,
        message: "Email atualizado com sucesso!"
      };
    })
  }),
  // ==================== CONDOMÃNIOS ====================
  condominio: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(condominios).where(eq(condominios.sindicoId, ctx.user.id));
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(condominios).where(eq(condominios.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      nome: z.string().min(1),
      endereco: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      capaUrl: z.string().optional(),
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(condominios).values({
        ...input,
        sindicoId: ctx.user.id
      });
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      endereco: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      capaUrl: z.string().optional(),
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional(),
      // Campos de cabeÃ§alho/rodapÃ© personalizados
      cabecalhoLogoUrl: z.string().nullable().optional(),
      cabecalhoNomeCondominio: z.string().nullable().optional(),
      cabecalhoNomeSindico: z.string().nullable().optional(),
      rodapeTexto: z.string().nullable().optional(),
      rodapeContato: z.string().nullable().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(condominios).set(data).where(eq(condominios.id, id));
      return { success: true };
    }),
    // Buscar condomÃ­nio pelo token de cadastro (pÃºblico)
    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(condominios).where(eq(condominios.cadastroToken, input.token)).limit(1);
      return result[0] || null;
    }),
    // Gerar token de cadastro para o condomÃ­nio
    generateCadastroToken: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const token = nanoid(16);
      await db.update(condominios).set({ cadastroToken: token }).where(eq(condominios.id, input.id));
      return { token };
    }),
    // Salvar link da assembleia online
    saveAssembleiaLink: protectedProcedure.input(z.object({
      id: z.number(),
      assembleiaLink: z.string(),
      assembleiaData: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = {
        assembleiaLink: input.assembleiaLink
      };
      if (input.assembleiaData) {
        updateData.assembleiaData = new Date(input.assembleiaData);
      }
      await db.update(condominios).set(updateData).where(eq(condominios.id, input.id));
      return { success: true };
    }),
    // Obter link da assembleia (pÃºblico)
    getAssembleiaLink: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select({
        id: condominios.id,
        nome: condominios.nome,
        assembleiaLink: condominios.assembleiaLink,
        assembleiaData: condominios.assembleiaData,
        logoUrl: condominios.logoUrl
      }).from(condominios).where(eq(condominios.id, input.id)).limit(1);
      return result[0] || null;
    })
  }),
  // ==================== REVISTAS ====================
  revista: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(revistas).where(eq(revistas.condominioId, input.condominioId)).orderBy(desc(revistas.createdAt));
    }),
    get: publicProcedure.input(z.object({ id: z.number().optional(), shareLink: z.string().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      let result;
      if (input.id) {
        result = await db.select().from(revistas).where(eq(revistas.id, input.id)).limit(1);
      } else if (input.shareLink) {
        result = await db.select().from(revistas).where(eq(revistas.shareLink, input.shareLink)).limit(1);
      }
      return result?.[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1),
      subtitulo: z.string().optional(),
      edicao: z.string().optional(),
      capaUrl: z.string().optional(),
      templateId: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const shareLink = nanoid(10);
      const result = await db.insert(revistas).values({
        ...input,
        shareLink
      });
      return { id: Number(result[0].insertId), shareLink };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      edicao: z.string().optional(),
      capaUrl: z.string().optional(),
      status: z.enum(["rascunho", "publicada", "arquivada"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      if (data.status === "publicada") {
        data.publicadaEm = /* @__PURE__ */ new Date();
      }
      await db.update(revistas).set(data).where(eq(revistas.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(secoes).where(eq(secoes.revistaId, input.id));
      await db.delete(mensagensSindico).where(eq(mensagensSindico.revistaId, input.id));
      await db.delete(avisos).where(eq(avisos.revistaId, input.id));
      await db.delete(comunicados).where(eq(comunicados.revistaId, input.id));
      await db.delete(eventos).where(eq(eventos.revistaId, input.id));
      await db.delete(antesDepois).where(eq(antesDepois.revistaId, input.id));
      await db.delete(linksUteis).where(eq(linksUteis.revistaId, input.id));
      await db.delete(telefonesUteis).where(eq(telefonesUteis.revistaId, input.id));
      await db.delete(melhorias).where(eq(melhorias.revistaId, input.id));
      await db.delete(aquisicoes).where(eq(aquisicoes.revistaId, input.id));
      await db.delete(realizacoes).where(eq(realizacoes.revistaId, input.id));
      await db.delete(anuncios).where(eq(anuncios.revistaId, input.id));
      const votacoesRevista = await db.select({ id: votacoes.id }).from(votacoes).where(eq(votacoes.revistaId, input.id));
      for (const votacao of votacoesRevista) {
        await db.delete(votos).where(eq(votos.votacaoId, votacao.id));
        await db.delete(opcoesVotacao).where(eq(opcoesVotacao.votacaoId, votacao.id));
      }
      await db.delete(votacoes).where(eq(votacoes.revistaId, input.id));
      await db.delete(revistas).where(eq(revistas.id, input.id));
      return { success: true };
    }),
    // Gerar PDF da revista
    generatePDF: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const revistaResult = await db.select().from(revistas).where(eq(revistas.id, input.id)).limit(1);
      const revista = revistaResult[0];
      if (!revista) throw new Error("Revista nÃ£o encontrada");
      const condominioResult = await db.select().from(condominios).where(eq(condominios.id, revista.condominioId)).limit(1);
      const condominio = condominioResult[0];
      if (!condominio) throw new Error("CondomÃ­nio nÃ£o encontrado");
      const mensagemResult = await db.select().from(mensagensSindico).where(eq(mensagensSindico.revistaId, input.id)).limit(1);
      const mensagem = mensagemResult[0];
      const avisosResult = await db.select().from(avisos).where(eq(avisos.revistaId, input.id));
      const eventosResult = await db.select().from(eventos).where(eq(eventos.revistaId, input.id));
      const funcionariosResult = await db.select().from(funcionarios).where(eq(funcionarios.condominioId, revista.condominioId));
      const telefonesResult = await db.select().from(telefonesUteis).where(eq(telefonesUteis.revistaId, input.id));
      const anunciantesResult = await db.select().from(anunciantes).where(and(
        eq(anunciantes.condominioId, revista.condominioId),
        eq(anunciantes.status, "ativo")
      ));
      const pdfBuffer = await generateRevistaPDF({
        titulo: revista.titulo,
        subtitulo: revista.subtitulo || void 0,
        edicao: revista.edicao || "EdiÃ§Ã£o Especial",
        condominioNome: condominio.nome,
        condominioLogo: condominio.logoUrl || void 0,
        mensagemSindico: mensagem ? {
          titulo: mensagem.titulo || "Mensagem do SÃ­ndico",
          mensagem: mensagem.mensagem || "",
          nomeSindico: mensagem.nomeSindico || "SÃ­ndico",
          fotoSindico: mensagem.fotoSindicoUrl || void 0,
          assinatura: mensagem.assinatura || void 0
        } : void 0,
        avisos: avisosResult.map((a) => ({
          titulo: a.titulo,
          conteudo: a.conteudo || "",
          tipo: a.tipo || "informativo"
        })),
        eventos: eventosResult.map((e) => ({
          titulo: e.titulo,
          descricao: e.descricao || void 0,
          dataEvento: e.dataEvento?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          horario: e.horaInicio || void 0,
          local: e.local || void 0
        })),
        funcionarios: funcionariosResult.map((f) => ({
          nome: f.nome,
          cargo: f.cargo || "FuncionÃ¡rio",
          turno: void 0,
          fotoUrl: f.fotoUrl || void 0
        })),
        telefones: telefonesResult.map((t) => ({
          nome: t.nome,
          numero: t.telefone
        })),
        anunciantes: anunciantesResult.map((a) => ({
          nome: a.nome,
          descricao: a.descricao || void 0,
          categoria: a.categoria,
          telefone: a.telefone || void 0,
          whatsapp: a.whatsapp || void 0,
          logoUrl: a.logoUrl || void 0
        }))
      });
      return {
        pdf: pdfBuffer.toString("base64"),
        filename: `${revista.titulo.replace(/[^a-zA-Z0-9]/g, "_")}_${revista.edicao?.replace(/[^a-zA-Z0-9]/g, "_") || "revista"}.pdf`
      };
    })
  }),
  // ==================== AVISOS ====================
  aviso: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(avisos).where(eq(avisos.revistaId, input.revistaId)).orderBy(desc(avisos.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      conteudo: z.string().optional(),
      tipo: z.enum(["urgente", "importante", "informativo"]).optional(),
      imagemUrl: z.string().optional(),
      destaque: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(avisos).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      conteudo: z.string().optional(),
      tipo: z.enum(["urgente", "importante", "informativo"]).optional(),
      imagemUrl: z.string().optional(),
      destaque: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(avisos).set(data).where(eq(avisos.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(avisos).where(eq(avisos.id, input.id));
      return { success: true };
    })
  }),
  // ==================== FUNCIONÃRIOS ====================
  funcionario: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number().optional(), revistaId: z.number().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.condominioId) {
        return db.select().from(funcionarios).where(eq(funcionarios.condominioId, input.condominioId));
      }
      if (input.revistaId) {
        const revista = await db.select().from(revistas).where(eq(revistas.id, input.revistaId));
        if (revista.length === 0) return [];
        return db.select().from(funcionarios).where(eq(funcionarios.condominioId, revista[0].condominioId));
      }
      return [];
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number().optional(),
      revistaId: z.number().optional(),
      nome: z.string().min(1),
      cargo: z.string().optional(),
      departamento: z.string().optional(),
      telefone: z.string().optional(),
      email: z.string().optional(),
      fotoUrl: z.string().optional(),
      descricao: z.string().optional(),
      tipoFuncionario: z.enum(["zelador", "porteiro", "supervisor", "gerente", "auxiliar", "sindico_externo"]).optional(),
      condominiosIds: z.array(z.number()).optional(),
      appsIds: z.array(z.number()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let condominioId = input.condominioId;
      if (!condominioId && input.revistaId) {
        const revista = await db.select().from(revistas).where(eq(revistas.id, input.revistaId));
        if (revista.length > 0) condominioId = revista[0].condominioId;
      }
      if (!condominioId) throw new Error("CondomÃ­nio nÃ£o encontrado");
      const { revistaId: _, condominiosIds, appsIds, ...data } = input;
      const result = await db.insert(funcionarios).values({ ...data, condominioId });
      const funcionarioId = Number(result[0].insertId);
      if (condominiosIds && condominiosIds.length > 0) {
        await db.insert(funcionarioCondominios).values(
          condominiosIds.map((cId) => ({
            funcionarioId,
            condominioId: cId,
            ativo: true
          }))
        );
      }
      if (appsIds && appsIds.length > 0) {
        await db.insert(funcionarioApps).values(
          appsIds.map((appId) => ({
            funcionarioId,
            appId,
            ativo: true
          }))
        );
      }
      return { id: funcionarioId };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      cargo: z.string().optional(),
      departamento: z.string().optional(),
      telefone: z.string().optional(),
      email: z.string().optional(),
      fotoUrl: z.string().optional(),
      descricao: z.string().optional(),
      ativo: z.boolean().optional(),
      loginEmail: z.string().optional(),
      senha: z.string().optional(),
      loginAtivo: z.boolean().optional(),
      tipoFuncionario: z.enum(["zelador", "porteiro", "supervisor", "gerente", "auxiliar", "sindico_externo"]).optional(),
      condominiosIds: z.array(z.number()).optional(),
      appsIds: z.array(z.number()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, senha, condominiosIds, appsIds, ...data } = input;
      const updateData = { ...data };
      if (senha) {
        const bcrypt = await import("bcryptjs");
        updateData.senha = await bcrypt.hash(senha, 10);
      }
      await db.update(funcionarios).set(updateData).where(eq(funcionarios.id, id));
      if (condominiosIds !== void 0) {
        await db.delete(funcionarioCondominios).where(eq(funcionarioCondominios.funcionarioId, id));
        if (condominiosIds.length > 0) {
          await db.insert(funcionarioCondominios).values(
            condominiosIds.map((cId) => ({
              funcionarioId: id,
              condominioId: cId,
              ativo: true
            }))
          );
        }
      }
      if (appsIds !== void 0) {
        await db.delete(funcionarioApps).where(eq(funcionarioApps.funcionarioId, id));
        if (appsIds.length > 0) {
          await db.insert(funcionarioApps).values(
            appsIds.map((appId) => ({
              funcionarioId: id,
              appId,
              ativo: true
            }))
          );
        }
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(funcionarioFuncoes).where(eq(funcionarioFuncoes.funcionarioId, input.id));
      await db.delete(funcionarioCondominios).where(eq(funcionarioCondominios.funcionarioId, input.id));
      await db.delete(funcionarioApps).where(eq(funcionarioApps.funcionarioId, input.id));
      await db.delete(funcionarios).where(eq(funcionarios.id, input.id));
      return { success: true };
    }),
    // Configurar login do funcionÃ¡rio
    configurarLogin: protectedProcedure.input(z.object({
      funcionarioId: z.number(),
      loginEmail: z.string().email(),
      senha: z.string().min(6),
      loginAtivo: z.boolean().default(true)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.senha, 10);
      await db.update(funcionarios).set({
        loginEmail: input.loginEmail,
        senha: senhaHash,
        loginAtivo: input.loginAtivo
      }).where(eq(funcionarios.id, input.funcionarioId));
      return { success: true };
    }),
    // Listar funÃ§Ãµes do funcionÃ¡rio
    listFuncoes: protectedProcedure.input(z.object({ funcionarioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const funcoes = await db.select().from(funcionarioFuncoes).where(eq(funcionarioFuncoes.funcionarioId, input.funcionarioId));
      return funcoes.map((f) => ({ ...f, habilitada: f.habilitada === true }));
    }),
    // Atualizar funÃ§Ãµes do funcionÃ¡rio
    updateFuncoes: protectedProcedure.input(z.object({
      funcionarioId: z.number(),
      funcoes: z.array(z.object({
        funcaoKey: z.string(),
        habilitada: z.boolean()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(funcionarioFuncoes).where(eq(funcionarioFuncoes.funcionarioId, input.funcionarioId));
      if (input.funcoes.length > 0) {
        await db.insert(funcionarioFuncoes).values(
          input.funcoes.map((f) => ({
            funcionarioId: input.funcionarioId,
            funcaoKey: f.funcaoKey,
            habilitada: f.habilitada
          }))
        );
      }
      return { success: true };
    }),
    // Login de funcionÃ¡rio
    login: publicProcedure.input(z.object({
      email: z.string().email(),
      senha: z.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [funcionario] = await db.select().from(funcionarios).where(eq(funcionarios.loginEmail, input.email)).limit(1);
      if (!funcionario) {
        throw new Error("Email ou senha invÃ¡lidos");
      }
      if (!funcionario.loginAtivo) {
        throw new Error("Acesso desativado. Contacte o administrador.");
      }
      if (!funcionario.senha) {
        throw new Error("Senha nÃ£o configurada. Contacte o administrador.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaValida = await bcrypt.compare(input.senha, funcionario.senha);
      if (!senhaValida) {
        throw new Error("Email ou senha invÃ¡lidos");
      }
      const funcoes = await db.select().from(funcionarioFuncoes).where(eq(funcionarioFuncoes.funcionarioId, funcionario.id));
      const jwt = await import('jsonwebtoken');
      const token = jwt.sign(
        {
          funcionarioId: funcionario.id,
          condominioId: funcionario.condominioId,
          nome: funcionario.nome,
          cargo: funcionario.cargo,
          tipo: "funcionario"
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );
      ctx.res.cookie("funcionario_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 dias
      });
      const userAgent = ctx.req.headers["user-agent"] || "";
      const ip = ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0] || ctx.req.socket.remoteAddress || "";
      let dispositivo = "Desktop";
      let navegador = "Desconhecido";
      let sistemaOperacional = "Desconhecido";
      if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
        dispositivo = "Mobile";
      } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
        dispositivo = "Tablet";
      }
      if (userAgent.includes("Chrome")) navegador = "Chrome";
      else if (userAgent.includes("Firefox")) navegador = "Firefox";
      else if (userAgent.includes("Safari")) navegador = "Safari";
      else if (userAgent.includes("Edge")) navegador = "Edge";
      if (userAgent.includes("Windows")) sistemaOperacional = "Windows";
      else if (userAgent.includes("Mac")) sistemaOperacional = "macOS";
      else if (userAgent.includes("Linux")) sistemaOperacional = "Linux";
      else if (userAgent.includes("Android")) sistemaOperacional = "Android";
      else if (userAgent.includes("iOS") || userAgent.includes("iPhone")) sistemaOperacional = "iOS";
      let geoData = {};
      try {
        if (ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
          const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`);
          const geoJson = await geoResponse.json();
          if (geoJson.status === "success") {
            geoData = {
              lat: geoJson.lat?.toString(),
              lon: geoJson.lon?.toString(),
              city: geoJson.city,
              regionName: geoJson.regionName,
              country: geoJson.country
            };
          }
        }
      } catch (e) {
        console.error("Erro ao buscar geolocalizaÃ§Ã£o:", e);
      }
      await db.insert(funcionarioAcessos).values({
        funcionarioId: funcionario.id,
        condominioId: funcionario.condominioId,
        ip,
        userAgent,
        dispositivo,
        navegador,
        sistemaOperacional,
        latitude: geoData.lat || null,
        longitude: geoData.lon || null,
        cidade: geoData.city || null,
        regiao: geoData.regionName || null,
        pais: geoData.country || null,
        tipoAcesso: "login",
        sucesso: true
      });
      await db.update(funcionarios).set({
        ultimoLogin: /* @__PURE__ */ new Date()
      }).where(eq(funcionarios.id, funcionario.id));
      const condominiosVinculados = await db.select({
        id: condominios.id,
        nome: condominios.nome,
        logoUrl: condominios.logoUrl
      }).from(funcionarioCondominios).innerJoin(condominios, eq(funcionarioCondominios.condominioId, condominios.id)).where(and(
        eq(funcionarioCondominios.funcionarioId, funcionario.id),
        eq(funcionarioCondominios.ativo, true)
      ));
      const appsVinculados = await db.select({
        id: apps.id,
        nome: apps.nome,
        condominioId: apps.condominioId,
        logoUrl: apps.logoUrl,
        shareLink: apps.shareLink
      }).from(funcionarioApps).innerJoin(apps, eq(funcionarioApps.appId, apps.id)).where(and(
        eq(funcionarioApps.funcionarioId, funcionario.id),
        eq(funcionarioApps.ativo, true)
      ));
      return {
        success: true,
        funcionario: {
          id: funcionario.id,
          nome: funcionario.nome,
          cargo: funcionario.cargo,
          tipoFuncionario: funcionario.tipoFuncionario,
          condominioId: funcionario.condominioId,
          fotoUrl: funcionario.fotoUrl
        },
        funcoes: funcoes.map((f) => ({ funcaoKey: f.funcaoKey, habilitada: f.habilitada === true })),
        condominiosVinculados,
        appsVinculados
      };
    }),
    // Verificar sessÃ£o do funcionÃ¡rio
    me: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.funcionario_token;
      if (!token) return null;
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.tipo !== "funcionario") return null;
        const db = await getDb();
        if (!db) return null;
        const [funcionario] = await db.select().from(funcionarios).where(eq(funcionarios.id, decoded.funcionarioId)).limit(1);
        if (!funcionario || !funcionario.loginAtivo) return null;
        const funcoes = await db.select().from(funcionarioFuncoes).where(eq(funcionarioFuncoes.funcionarioId, funcionario.id));
        const condominiosVinculados = await db.select({
          id: condominios.id,
          nome: condominios.nome,
          logoUrl: condominios.logoUrl
        }).from(funcionarioCondominios).innerJoin(condominios, eq(funcionarioCondominios.condominioId, condominios.id)).where(and(
          eq(funcionarioCondominios.funcionarioId, funcionario.id),
          eq(funcionarioCondominios.ativo, true)
        ));
        const appsVinculados = await db.select({
          id: apps.id,
          nome: apps.nome,
          condominioId: apps.condominioId,
          logoUrl: apps.logoUrl,
          shareLink: apps.shareLink
        }).from(funcionarioApps).innerJoin(apps, eq(funcionarioApps.appId, apps.id)).where(and(
          eq(funcionarioApps.funcionarioId, funcionario.id),
          eq(funcionarioApps.ativo, true)
        ));
        const [condominioPrincipal] = await db.select({
          id: condominios.id,
          nome: condominios.nome,
          logoUrl: condominios.logoUrl
        }).from(condominios).where(eq(condominios.id, funcionario.condominioId));
        return {
          id: funcionario.id,
          nome: funcionario.nome,
          cargo: funcionario.cargo,
          tipoFuncionario: funcionario.tipoFuncionario,
          condominioId: funcionario.condominioId,
          condominioPrincipal,
          fotoUrl: funcionario.fotoUrl,
          funcoes: funcoes.map((f) => ({ funcaoKey: f.funcaoKey, habilitada: f.habilitada === true })),
          condominiosVinculados,
          appsVinculados
        };
      } catch {
        return null;
      }
    }),
    // Logout de funcionÃ¡rio
    logout: publicProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie("funcionario_token");
      return { success: true };
    }),
    // Solicitar recuperaÃ§Ã£o de senha
    solicitarRecuperacao: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [funcionario] = await db.select().from(funcionarios).where(eq(funcionarios.loginEmail, input.email));
      if (!funcionario) {
        return { success: true, message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link de recuperaÃ§Ã£o." };
      }
      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpira = new Date(Date.now() + 60 * 60 * 1e3);
      await db.update(funcionarios).set({ resetToken, resetTokenExpira }).where(eq(funcionarios.id, funcionario.id));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, funcionario.condominioId));
      try {
        const { notifyOwner } = await import("./_core/notification");
        const baseUrl = process.env.VITE_APP_URL || "https://app-sindico.manus.space";
        const resetLink = `${baseUrl}/funcionario/redefinir-senha?token=${resetToken}`;
        await notifyOwner({
          title: `RecuperaÃ§Ã£o de Senha - ${funcionario.nome}`,
          content: `O funcionÃ¡rio ${funcionario.nome} do condomÃ­nio ${condominio?.nome || "N/A"} solicitou recuperaÃ§Ã£o de senha.

Link de recuperaÃ§Ã£o: ${resetLink}

Este link expira em 1 hora.

Envie este link para o funcionÃ¡rio pelo WhatsApp ou outro meio de comunicaÃ§Ã£o.`
        });
      } catch (e) {
        console.error("Erro ao enviar notificaÃ§Ã£o:", e);
      }
      return {
        success: true,
        message: "Se o email estiver cadastrado, o administrador receberÃ¡ uma notificaÃ§Ã£o com o link de recuperaÃ§Ã£o."
      };
    }),
    // Validar token de recuperaÃ§Ã£o
    validarToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false };
      const [funcionario] = await db.select().from(funcionarios).where(eq(funcionarios.resetToken, input.token));
      if (!funcionario || !funcionario.resetTokenExpira) {
        return { valid: false };
      }
      if (/* @__PURE__ */ new Date() > funcionario.resetTokenExpira) {
        return { valid: false, expired: true };
      }
      return { valid: true, nome: funcionario.nome };
    }),
    // Redefinir senha com token
    redefinirSenha: publicProcedure.input(z.object({
      token: z.string(),
      novaSenha: z.string().min(6)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [funcionario] = await db.select().from(funcionarios).where(eq(funcionarios.resetToken, input.token));
      if (!funcionario || !funcionario.resetTokenExpira) {
        throw new Error("Token invÃ¡lido ou expirado");
      }
      if (/* @__PURE__ */ new Date() > funcionario.resetTokenExpira) {
        throw new Error("Token expirado. Solicite uma nova recuperaÃ§Ã£o de senha.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.novaSenha, 10);
      await db.update(funcionarios).set({
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null,
        loginAtivo: true
      }).where(eq(funcionarios.id, funcionario.id));
      return { success: true, message: "Senha redefinida com sucesso!" };
    }),
    // ==================== HISTÃRICO DE ACESSOS ====================
    // Registrar acesso
    registrarAcesso: publicProcedure.input(z.object({
      funcionarioId: z.number(),
      condominioId: z.number(),
      ip: z.string().optional(),
      userAgent: z.string().optional(),
      dispositivo: z.string().optional(),
      navegador: z.string().optional(),
      sistemaOperacional: z.string().optional(),
      localizacao: z.string().optional(),
      tipoAcesso: z.enum(["login", "logout", "recuperacao_senha", "alteracao_senha"]).default("login"),
      sucesso: z.boolean().default(true),
      motivoFalha: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(funcionarioAcessos).values({
        funcionarioId: input.funcionarioId,
        condominioId: input.condominioId,
        ip: input.ip || null,
        userAgent: input.userAgent || null,
        dispositivo: input.dispositivo || null,
        navegador: input.navegador || null,
        sistemaOperacional: input.sistemaOperacional || null,
        localizacao: input.localizacao || null,
        tipoAcesso: input.tipoAcesso,
        sucesso: input.sucesso,
        motivoFalha: input.motivoFalha || null
      });
      return { success: true };
    }),
    // Listar histÃ³rico de acessos de um funcionÃ¡rio
    listarAcessos: protectedProcedure.input(z.object({
      funcionarioId: z.number().optional(),
      condominioId: z.number().optional(),
      limite: z.number().default(50),
      pagina: z.number().default(1),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { acessos: [], total: 0 };
      const conditions = [];
      if (input.funcionarioId) {
        conditions.push(eq(funcionarioAcessos.funcionarioId, input.funcionarioId));
      }
      if (input.condominioId) {
        conditions.push(eq(funcionarioAcessos.condominioId, input.condominioId));
      }
      if (input.dataInicio) {
        conditions.push(gte(funcionarioAcessos.dataHora, input.dataInicio));
      }
      if (input.dataFim) {
        conditions.push(lte(funcionarioAcessos.dataHora, input.dataFim));
      }
      const offset = (input.pagina - 1) * input.limite;
      const acessos = await db.select({
        id: funcionarioAcessos.id,
        funcionarioId: funcionarioAcessos.funcionarioId,
        condominioId: funcionarioAcessos.condominioId,
        dataHora: funcionarioAcessos.dataHora,
        ip: funcionarioAcessos.ip,
        userAgent: funcionarioAcessos.userAgent,
        dispositivo: funcionarioAcessos.dispositivo,
        navegador: funcionarioAcessos.navegador,
        sistemaOperacional: funcionarioAcessos.sistemaOperacional,
        localizacao: funcionarioAcessos.localizacao,
        latitude: funcionarioAcessos.latitude,
        longitude: funcionarioAcessos.longitude,
        cidade: funcionarioAcessos.cidade,
        regiao: funcionarioAcessos.regiao,
        pais: funcionarioAcessos.pais,
        tipoAcesso: funcionarioAcessos.tipoAcesso,
        sucesso: funcionarioAcessos.sucesso,
        motivoFalha: funcionarioAcessos.motivoFalha,
        funcionarioNome: funcionarios.nome,
        funcionarioCargo: funcionarios.cargo
      }).from(funcionarioAcessos).leftJoin(funcionarios, eq(funcionarioAcessos.funcionarioId, funcionarios.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(funcionarioAcessos.dataHora)).limit(input.limite).offset(offset);
      const [{ count }] = await db.select({ count: sql`count(*)` }).from(funcionarioAcessos).where(conditions.length > 0 ? and(...conditions) : void 0);
      return { acessos, total: Number(count) };
    }),
    // Obter estatÃ­sticas de acessos
    estatisticasAcessos: protectedProcedure.input(z.object({
      condominioId: z.number(),
      dias: z.number().default(30)
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const dataInicio = /* @__PURE__ */ new Date();
      dataInicio.setDate(dataInicio.getDate() - input.dias);
      const [{ totalAcessos }] = await db.select({ totalAcessos: sql`count(*)` }).from(funcionarioAcessos).where(and(
        eq(funcionarioAcessos.condominioId, input.condominioId),
        gte(funcionarioAcessos.dataHora, dataInicio)
      ));
      const [{ acessosSucesso }] = await db.select({ acessosSucesso: sql`count(*)` }).from(funcionarioAcessos).where(and(
        eq(funcionarioAcessos.condominioId, input.condominioId),
        eq(funcionarioAcessos.sucesso, true),
        gte(funcionarioAcessos.dataHora, dataInicio)
      ));
      const [{ acessosFalhados }] = await db.select({ acessosFalhados: sql`count(*)` }).from(funcionarioAcessos).where(and(
        eq(funcionarioAcessos.condominioId, input.condominioId),
        eq(funcionarioAcessos.sucesso, false),
        gte(funcionarioAcessos.dataHora, dataInicio)
      ));
      const [{ funcionariosUnicos }] = await db.select({ funcionariosUnicos: sql`count(distinct funcionarioId)` }).from(funcionarioAcessos).where(and(
        eq(funcionarioAcessos.condominioId, input.condominioId),
        gte(funcionarioAcessos.dataHora, dataInicio)
      ));
      const [ultimoAcesso] = await db.select().from(funcionarioAcessos).where(eq(funcionarioAcessos.condominioId, input.condominioId)).orderBy(desc(funcionarioAcessos.dataHora)).limit(1);
      return {
        totalAcessos: Number(totalAcessos),
        acessosSucesso: Number(acessosSucesso),
        acessosFalhados: Number(acessosFalhados),
        funcionariosUnicos: Number(funcionariosUnicos),
        ultimoAcesso: ultimoAcesso?.dataHora || null
      };
    }),
    // Listar condomÃ­nios vinculados ao funcionÃ¡rio
    listCondominios: protectedProcedure.input(z.object({ funcionarioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: condominios.id,
        nome: condominios.nome,
        logoUrl: condominios.logoUrl
      }).from(funcionarioCondominios).innerJoin(condominios, eq(funcionarioCondominios.condominioId, condominios.id)).where(and(
        eq(funcionarioCondominios.funcionarioId, input.funcionarioId),
        eq(funcionarioCondominios.ativo, true)
      ));
    }),
    // Listar apps vinculados ao funcionÃ¡rio
    listApps: protectedProcedure.input(z.object({ funcionarioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: apps.id,
        nome: apps.nome,
        condominioId: apps.condominioId,
        logoUrl: apps.logoUrl,
        shareLink: apps.shareLink
      }).from(funcionarioApps).innerJoin(apps, eq(funcionarioApps.appId, apps.id)).where(and(
        eq(funcionarioApps.funcionarioId, input.funcionarioId),
        eq(funcionarioApps.ativo, true)
      ));
    }),
    // Atualizar condomÃ­nios vinculados
    updateCondominios: protectedProcedure.input(z.object({
      funcionarioId: z.number(),
      condominiosIds: z.array(z.number())
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(funcionarioCondominios).where(eq(funcionarioCondominios.funcionarioId, input.funcionarioId));
      if (input.condominiosIds.length > 0) {
        await db.insert(funcionarioCondominios).values(
          input.condominiosIds.map((condominioId) => ({
            funcionarioId: input.funcionarioId,
            condominioId,
            ativo: true
          }))
        );
      }
      return { success: true };
    }),
    // Atualizar apps vinculados
    updateApps: protectedProcedure.input(z.object({
      funcionarioId: z.number(),
      appsIds: z.array(z.number())
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(funcionarioApps).where(eq(funcionarioApps.funcionarioId, input.funcionarioId));
      if (input.appsIds.length > 0) {
        await db.insert(funcionarioApps).values(
          input.appsIds.map((appId) => ({
            funcionarioId: input.funcionarioId,
            appId,
            ativo: true
          }))
        );
      }
      return { success: true };
    })
  }),
  // ==================== EVENTOS ====================
  evento: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(eventos).where(eq(eventos.revistaId, input.revistaId)).orderBy(desc(eventos.dataEvento));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      dataEvento: z.date().optional(),
      horaInicio: z.string().optional(),
      horaFim: z.string().optional(),
      local: z.string().optional(),
      imagemUrl: z.string().optional(),
      tipo: z.enum(["agendado", "realizado"]).optional(),
      nomeResponsavel: z.string().optional(),
      whatsappResponsavel: z.string().optional(),
      lembreteAntecedencia: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(eventos).values({
        ...input,
        lembreteEnviado: false
      });
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      dataEvento: z.date().optional(),
      horaInicio: z.string().optional(),
      horaFim: z.string().optional(),
      local: z.string().optional(),
      imagemUrl: z.string().optional(),
      tipo: z.enum(["agendado", "realizado"]).optional(),
      nomeResponsavel: z.string().optional(),
      whatsappResponsavel: z.string().optional(),
      lembreteAntecedencia: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      if (data.dataEvento) {
        data.lembreteEnviado = false;
      }
      await db.update(eventos).set(data).where(eq(eventos.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(eventos).where(eq(eventos.id, input.id));
      return { success: true };
    }),
    // Buscar eventos que precisam de lembrete
    getPendingReminders: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const now = /* @__PURE__ */ new Date();
      const allEventos = await db.select().from(eventos).where(and(
        eq(eventos.lembreteEnviado, false),
        eq(eventos.tipo, "agendado")
      ));
      return allEventos.filter((evento) => {
        if (!evento.dataEvento || !evento.lembreteAntecedencia) return false;
        const dataEvento = new Date(evento.dataEvento);
        const diasAntecedencia = evento.lembreteAntecedencia;
        const dataLembrete = new Date(dataEvento);
        dataLembrete.setDate(dataLembrete.getDate() - diasAntecedencia);
        return now >= dataLembrete && now < dataEvento;
      });
    }),
    // Enviar lembretes para um evento
    sendReminder: protectedProcedure.input(z.object({ eventoId: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [evento] = await db.select().from(eventos).where(eq(eventos.id, input.eventoId));
      if (!evento) throw new Error("Evento nÃ£o encontrado");
      if (evento.lembreteEnviado) return { success: true, message: "Lembrete jÃ¡ enviado" };
      const [revista] = await db.select().from(revistas).where(eq(revistas.id, evento.revistaId));
      if (!revista) throw new Error("Revista nÃ£o encontrada");
      const moradoresList = await db.select().from(moradores).where(eq(moradores.condominioId, revista.condominioId));
      const dataFormatada = evento.dataEvento ? new Date(evento.dataEvento).toLocaleDateString("pt-BR") : "data a definir";
      for (const morador of moradoresList) {
        if (morador.usuarioId) {
          await db.insert(notificacoes).values({
            userId: morador.usuarioId,
            tipo: "evento",
            titulo: `Lembrete: ${evento.titulo}`,
            mensagem: `O evento "${evento.titulo}" acontecerÃ¡ em ${dataFormatada}${evento.local ? ` no ${evento.local}` : ""}.`,
            link: `/dashboard/eventos`
          });
        }
      }
      await db.update(eventos).set({ lembreteEnviado: true }).where(eq(eventos.id, input.eventoId));
      return {
        success: true,
        message: `Lembrete enviado para ${moradoresList.filter((m) => m.usuarioId).length} moradores`
      };
    }),
    // Enviar todos os lembretes pendentes
    sendAllPendingReminders: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = /* @__PURE__ */ new Date();
      const allEventos = await db.select().from(eventos).where(and(
        eq(eventos.lembreteEnviado, false),
        eq(eventos.tipo, "agendado")
      ));
      let enviados = 0;
      for (const evento of allEventos) {
        if (!evento.dataEvento || !evento.lembreteAntecedencia) continue;
        const dataEvento = new Date(evento.dataEvento);
        const diasAntecedencia = evento.lembreteAntecedencia;
        const dataLembrete = new Date(dataEvento);
        dataLembrete.setDate(dataLembrete.getDate() - diasAntecedencia);
        if (now >= dataLembrete && now < dataEvento) {
          const [revista] = await db.select().from(revistas).where(eq(revistas.id, evento.revistaId));
          if (!revista) continue;
          const moradoresList = await db.select().from(moradores).where(eq(moradores.condominioId, revista.condominioId));
          const dataFormatada = new Date(evento.dataEvento).toLocaleDateString("pt-BR");
          for (const morador of moradoresList) {
            if (morador.usuarioId) {
              await db.insert(notificacoes).values({
                userId: morador.usuarioId,
                tipo: "evento",
                titulo: `Lembrete: ${evento.titulo}`,
                mensagem: `O evento "${evento.titulo}" acontecerÃ¡ em ${dataFormatada}${evento.local ? ` no ${evento.local}` : ""}.`,
                link: `/dashboard/eventos`
              });
            }
          }
          await db.update(eventos).set({ lembreteEnviado: true }).where(eq(eventos.id, evento.id));
          enviados++;
        }
      }
      return { success: true, enviados };
    })
  }),
  // ==================== VOTAÃÃES ====================
  votacao: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(votacoes).where(eq(votacoes.revistaId, input.revistaId)).orderBy(desc(votacoes.createdAt));
    }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const votacao = await db.select().from(votacoes).where(eq(votacoes.id, input.id)).limit(1);
      if (!votacao[0]) return null;
      const opcoes = await db.select().from(opcoesVotacao).where(eq(opcoesVotacao.votacaoId, input.id));
      return { ...votacao[0], opcoes };
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      tipo: z.enum(["funcionario_mes", "enquete", "decisao"]),
      imagemUrl: z.string().optional(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
      opcoes: z.array(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        imagemUrl: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { opcoes, ...votacaoData } = input;
      const result = await db.insert(votacoes).values(votacaoData);
      const votacaoId = Number(result[0].insertId);
      if (opcoes.length > 0) {
        await db.insert(opcoesVotacao).values(
          opcoes.map((o) => ({ ...o, votacaoId }))
        );
      }
      const revista = await db.select().from(revistas).where(eq(revistas.id, input.revistaId)).limit(1);
      if (revista[0]?.condominioId) {
        const moradoresList = await db.select().from(moradores).where(eq(moradores.condominioId, revista[0].condominioId));
        const tipoLabel = input.tipo === "funcionario_mes" ? "FuncionÃ¡rio do MÃªs" : input.tipo === "enquete" ? "Enquete" : "DecisÃ£o";
        for (const morador of moradoresList) {
          if (morador.usuarioId) {
            await db.insert(notificacoes).values({
              userId: morador.usuarioId,
              tipo: "votacao",
              titulo: `Nova ${tipoLabel}: ${input.titulo}`,
              mensagem: `Participe da votaÃ§Ã£o "${input.titulo}". Aceda ao link para votar.`,
              link: `/votar/${votacaoId}`
            });
          }
        }
      }
      return { id: votacaoId };
    }),
    votar: protectedProcedure.input(z.object({
      votacaoId: z.number(),
      opcaoId: z.number()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existingVote = await db.select().from(votos).where(and(
        eq(votos.votacaoId, input.votacaoId),
        eq(votos.usuarioId, ctx.user.id)
      )).limit(1);
      if (existingVote.length > 0) {
        throw new Error("VocÃª jÃ¡ votou nesta votaÃ§Ã£o");
      }
      await db.insert(votos).values({
        votacaoId: input.votacaoId,
        opcaoId: input.opcaoId,
        usuarioId: ctx.user.id
      });
      await db.update(opcoesVotacao).set({ votos: (await db.select().from(opcoesVotacao).where(eq(opcoesVotacao.id, input.opcaoId)))[0].votos + 1 }).where(eq(opcoesVotacao.id, input.opcaoId));
      return { success: true };
    }),
    verificarVoto: protectedProcedure.input(z.object({ votacaoId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { jaVotou: false };
      const existingVote = await db.select().from(votos).where(and(
        eq(votos.votacaoId, input.votacaoId),
        eq(votos.usuarioId, ctx.user.id)
      )).limit(1);
      return { jaVotou: existingVote.length > 0 };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(votos).where(eq(votos.votacaoId, input.id));
      await db.delete(opcoesVotacao).where(eq(opcoesVotacao.votacaoId, input.id));
      await db.delete(votacoes).where(eq(votacoes.id, input.id));
      return { success: true };
    }),
    encerrar: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(votacoes).set({ status: "encerrada" }).where(eq(votacoes.id, input.id));
      return { success: true };
    }),
    // Listar votantes de uma votaÃ§Ã£o (para admin)
    listarVotantes: protectedProcedure.input(z.object({ votacaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const votosComUsuarios = await db.select({
        id: votos.id,
        opcaoId: votos.opcaoId,
        usuarioId: votos.usuarioId,
        createdAt: votos.createdAt,
        userName: users.name,
        userEmail: users.email,
        opcaoTitulo: opcoesVotacao.titulo
      }).from(votos).leftJoin(users, eq(votos.usuarioId, users.id)).leftJoin(opcoesVotacao, eq(votos.opcaoId, opcoesVotacao.id)).where(eq(votos.votacaoId, input.votacaoId)).orderBy(desc(votos.createdAt));
      return votosComUsuarios;
    }),
    // Obter estatÃ­sticas detalhadas da votaÃ§Ã£o
    estatisticas: protectedProcedure.input(z.object({ votacaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const votacao = await db.select().from(votacoes).where(eq(votacoes.id, input.votacaoId)).limit(1);
      if (!votacao[0]) return null;
      const opcoes = await db.select().from(opcoesVotacao).where(eq(opcoesVotacao.votacaoId, input.votacaoId));
      const totalVotos = opcoes.reduce((acc, opt) => acc + (opt.votos || 0), 0);
      const votosDetalhados = await db.select({
        id: votos.id,
        opcaoId: votos.opcaoId,
        usuarioId: votos.usuarioId,
        createdAt: votos.createdAt
      }).from(votos).where(eq(votos.votacaoId, input.votacaoId));
      return {
        votacao: votacao[0],
        opcoes,
        totalVotos,
        totalVotantes: votosDetalhados.length,
        votos: votosDetalhados
      };
    })
  }),
  // ==================== CLASSIFICADOS ====================
  classificado: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number(), status: z.string().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(classificados).where(eq(classificados.condominioId, input.condominioId));
      return query.orderBy(desc(classificados.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["produto", "servico"]),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      preco: z.string().optional(),
      fotoUrl: z.string().optional(),
      contato: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(classificados).values({
        ...input,
        usuarioId: ctx.user.id
      });
      return { id: Number(result[0].insertId) };
    }),
    moderar: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["aprovado", "rejeitado"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(classificados).set({ status: input.status }).where(eq(classificados.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(classificados).where(eq(classificados.id, input.id));
      return { success: true };
    }),
    // ==================== PORTAL DO MORADOR ====================
    // Listar classificados do morador
    listByMorador: publicProcedure.input(z.object({ moradorId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(classificados).where(eq(classificados.moradorId, input.moradorId)).orderBy(desc(classificados.createdAt));
    }),
    // Criar classificado pelo morador
    createByMorador: publicProcedure.input(z.object({
      token: z.string(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      preco: z.number().optional(),
      categoria: z.string().optional(),
      contato: z.string().optional(),
      imagemUrl: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("SessÃ£o invÃ¡lida. FaÃ§a login novamente.");
      }
      const { token, preco, ...data } = input;
      const result = await db.insert(classificados).values({
        ...data,
        preco: preco ? String(preco) : void 0,
        tipo: "produto",
        condominioId: morador.condominioId,
        moradorId: morador.id,
        status: "pendente"
      });
      return { id: Number(result[0].insertId) };
    }),
    // Excluir classificado pelo morador
    deleteByMorador: publicProcedure.input(z.object({
      token: z.string(),
      id: z.number()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("SessÃ£o invÃ¡lida. FaÃ§a login novamente.");
      }
      const [classificado] = await db.select().from(classificados).where(and(
        eq(classificados.id, input.id),
        eq(classificados.moradorId, morador.id)
      )).limit(1);
      if (!classificado) {
        throw new Error("Classificado nÃ£o encontrado ou nÃ£o pertence a vocÃª.");
      }
      await db.delete(classificados).where(eq(classificados.id, input.id));
      return { success: true };
    })
  }),
  // ==================== CARONAS ====================
  carona: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(caronas).where(eq(caronas.condominioId, input.condominioId)).orderBy(desc(caronas.dataCarona));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["oferece", "procura"]),
      origem: z.string().min(1),
      destino: z.string().min(1),
      dataCarona: z.date().optional(),
      horario: z.string().optional(),
      vagasDisponiveis: z.number().optional(),
      observacoes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(caronas).values({
        ...input,
        usuarioId: ctx.user.id
      });
      return { id: Number(result[0].insertId) };
    }),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["ativa", "concluida", "cancelada"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(caronas).set({ status: input.status }).where(eq(caronas.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(caronas).where(eq(caronas.id, input.id));
      return { success: true };
    }),
    // ==================== PORTAL DO MORADOR ====================
    // Listar caronas do morador
    listByMorador: publicProcedure.input(z.object({ moradorId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(caronas).where(eq(caronas.moradorId, input.moradorId)).orderBy(desc(caronas.createdAt));
    }),
    // Criar carona pelo morador
    createByMorador: publicProcedure.input(z.object({
      token: z.string(),
      origem: z.string().min(1),
      destino: z.string().min(1),
      data: z.date().optional(),
      horario: z.string().optional(),
      vagas: z.number().optional(),
      tipo: z.enum(["ofereco", "procuro"]),
      observacoes: z.string().optional(),
      contato: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("SessÃ£o invÃ¡lida. FaÃ§a login novamente.");
      }
      const { token, data, vagas, tipo, ...rest } = input;
      const result = await db.insert(caronas).values({
        ...rest,
        tipo: tipo === "ofereco" ? "oferece" : "procura",
        dataCarona: data,
        vagasDisponiveis: vagas,
        condominioId: morador.condominioId,
        moradorId: morador.id,
        status: "ativa"
      });
      return { id: Number(result[0].insertId) };
    }),
    // Excluir carona pelo morador
    deleteByMorador: publicProcedure.input(z.object({
      token: z.string(),
      id: z.number()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("SessÃ£o invÃ¡lida. FaÃ§a login novamente.");
      }
      const [carona] = await db.select().from(caronas).where(and(
        eq(caronas.id, input.id),
        eq(caronas.moradorId, morador.id)
      )).limit(1);
      if (!carona) {
        throw new Error("Carona nÃ£o encontrada ou nÃ£o pertence a vocÃª.");
      }
      await db.delete(caronas).where(eq(caronas.id, input.id));
      return { success: true };
    })
  }),
  // ==================== ACHADOS E PERDIDOS ====================
  achadoPerdido: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(achadosPerdidos).where(eq(achadosPerdidos.condominioId, input.condominioId)).orderBy(desc(achadosPerdidos.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["achado", "perdido"]),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      fotoUrl: z.string().optional(),
      localEncontrado: z.string().optional(),
      dataOcorrencia: z.date().optional(),
      contato: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(achadosPerdidos).values({
        ...input,
        usuarioId: ctx.user.id
      });
      return { id: Number(result[0].insertId) };
    }),
    resolver: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(achadosPerdidos).set({ status: "resolvido" }).where(eq(achadosPerdidos.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(achadosPerdidos).where(eq(achadosPerdidos.id, input.id));
      return { success: true };
    })
  }),
  // ==================== APPS PERSONALIZADOS ====================
  apps: router({
    // Listar apps do condomÃ­nio
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(apps).where(eq(apps.condominioId, input.condominioId)).orderBy(desc(apps.createdAt));
      return result;
    }),
    // Obter app por ID com mÃ³dulos
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [app] = await db.select().from(apps).where(eq(apps.id, input.id));
      if (!app) return null;
      const modulos = await db.select().from(appModulos).where(eq(appModulos.appId, input.id)).orderBy(asc(appModulos.ordem));
      return { ...app, modulos };
    }),
    // Criar novo app
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string(),
      descricao: z.string().optional(),
      logoUrl: z.string().optional(),
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional(),
      modulos: z.array(z.object({
        moduloKey: z.string(),
        titulo: z.string(),
        icone: z.string().optional(),
        cor: z.string().optional(),
        bgCor: z.string().optional(),
        ordem: z.number(),
        habilitado: z.boolean()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const shareLink = `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      const [app] = await db.insert(apps).values({
        condominioId: input.condominioId,
        nome: input.nome,
        descricao: input.descricao,
        logoUrl: input.logoUrl,
        corPrimaria: input.corPrimaria,
        corSecundaria: input.corSecundaria,
        shareLink
      }).$returningId();
      if (input.modulos.length > 0) {
        await db.insert(appModulos).values(
          input.modulos.map((m) => ({
            appId: app.id,
            moduloKey: m.moduloKey,
            titulo: m.titulo,
            icone: m.icone,
            cor: m.cor,
            bgCor: m.bgCor,
            ordem: m.ordem,
            habilitado: m.habilitado
          }))
        );
      }
      return { id: app.id, shareLink };
    }),
    // Atualizar app
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      logoUrl: z.string().optional(),
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional(),
      ativo: z.boolean().optional(),
      modulos: z.array(z.object({
        moduloKey: z.string(),
        titulo: z.string(),
        icone: z.string().optional(),
        cor: z.string().optional(),
        bgCor: z.string().optional(),
        ordem: z.number(),
        habilitado: z.boolean()
      })).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, modulos, ...updateData } = input;
      if (Object.keys(updateData).length > 0) {
        await db.update(apps).set(updateData).where(eq(apps.id, id));
      }
      if (modulos) {
        await db.delete(appModulos).where(eq(appModulos.appId, id));
        if (modulos.length > 0) {
          await db.insert(appModulos).values(
            modulos.map((m) => ({
              appId: id,
              moduloKey: m.moduloKey,
              titulo: m.titulo,
              icone: m.icone,
              cor: m.cor,
              bgCor: m.bgCor,
              ordem: m.ordem,
              habilitado: m.habilitado
            }))
          );
        }
      }
      return { success: true };
    }),
    // Excluir app
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(appModulos).where(eq(appModulos.appId, input.id));
      await db.delete(apps).where(eq(apps.id, input.id));
      return { success: true };
    }),
    // Contar apps por condomÃ­nio
    count: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.select({ count: sql`count(*)` }).from(apps).where(eq(apps.condominioId, input.condominioId));
      return result[0]?.count || 0;
    }),
    // Obter app por shareLink (pÃºblico)
    getByShareLink: publicProcedure.input(z.object({ shareLink: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [app] = await db.select().from(apps).where(and(eq(apps.shareLink, input.shareLink), eq(apps.ativo, true)));
      if (!app) return null;
      const modulos = await db.select().from(appModulos).where(and(eq(appModulos.appId, app.id), eq(appModulos.habilitado, true))).orderBy(asc(appModulos.ordem));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, app.condominioId));
      return { ...app, modulos, condominio };
    })
  }),
  // ==================== MORADORES ====================
  morador: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(moradores).where(eq(moradores.condominioId, input.condominioId));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      email: z.string().optional(),
      telefone: z.string().optional(),
      celular: z.string().optional(),
      apartamento: z.string().min(1),
      bloco: z.string().optional(),
      andar: z.string().optional(),
      tipo: z.enum(["proprietario", "inquilino", "familiar", "funcionario"]).optional(),
      cpf: z.string().optional(),
      dataNascimento: z.date().optional(),
      fotoUrl: z.string().optional(),
      observacoes: z.string().optional(),
      dataEntrada: z.date().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(moradores).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      celular: z.string().optional(),
      apartamento: z.string().optional(),
      bloco: z.string().optional(),
      andar: z.string().optional(),
      tipo: z.enum(["proprietario", "inquilino", "familiar", "funcionario"]).optional(),
      cpf: z.string().optional(),
      dataNascimento: z.date().optional(),
      fotoUrl: z.string().optional(),
      observacoes: z.string().optional(),
      dataEntrada: z.date().optional(),
      dataSaida: z.date().optional(),
      ativo: z.boolean().optional(),
      usuarioId: z.number().nullable().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(moradores).set(data).where(eq(moradores.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(moradores).where(eq(moradores.id, input.id));
      return { success: true };
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(moradores).where(eq(moradores.id, input.id)).limit(1);
      return result[0] || null;
    }),
    listByBloco: protectedProcedure.input(z.object({ condominioId: z.number(), bloco: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(moradores).where(and(eq(moradores.condominioId, input.condominioId), eq(moradores.bloco, input.bloco)));
    }),
    search: protectedProcedure.input(z.object({ condominioId: z.number(), query: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(moradores).where(and(
        eq(moradores.condominioId, input.condominioId),
        or(
          like(moradores.nome, `%${input.query}%`),
          like(moradores.apartamento, `%${input.query}%`),
          like(moradores.bloco, `%${input.query}%`)
        )
      ));
    }),
    vincularUsuario: protectedProcedure.input(z.object({ moradorId: z.number(), usuarioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ usuarioId: input.usuarioId }).where(eq(moradores.id, input.moradorId));
      return { success: true };
    }),
    // ==================== BLOQUEIO DE VOTAÃÃO ====================
    bloquearVotacao: protectedProcedure.input(z.object({ moradorId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ bloqueadoVotacao: true }).where(eq(moradores.id, input.moradorId));
      return { success: true };
    }),
    desbloquearVotacao: protectedProcedure.input(z.object({ moradorId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ bloqueadoVotacao: false }).where(eq(moradores.id, input.moradorId));
      return { success: true };
    }),
    bloquearVotacaoEmMassa: protectedProcedure.input(z.object({ moradorIds: z.array(z.number()) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ bloqueadoVotacao: true }).where(inArray(moradores.id, input.moradorIds));
      return { success: true, count: input.moradorIds.length };
    }),
    desbloquearVotacaoEmMassa: protectedProcedure.input(z.object({ moradorIds: z.array(z.number()) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ bloqueadoVotacao: false }).where(inArray(moradores.id, input.moradorIds));
      return { success: true, count: input.moradorIds.length };
    }),
    bloquearTodosVotacao: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.update(moradores).set({ bloqueadoVotacao: true }).where(eq(moradores.condominioId, input.condominioId));
      return { success: true };
    }),
    desbloquearTodosVotacao: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.update(moradores).set({ bloqueadoVotacao: false }).where(eq(moradores.condominioId, input.condominioId));
      return { success: true };
    }),
    // RelatÃ³rio de moradores bloqueados para votaÃ§Ã£o
    relatorioBloqueados: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const bloqueados = await db.select().from(moradores).where(and(
        eq(moradores.condominioId, input.condominioId),
        eq(moradores.bloqueadoVotacao, true)
      )).orderBy(moradores.nome);
      const condominio = await db.select().from(condominios).where(eq(condominios.id, input.condominioId)).limit(1);
      return {
        condominio: condominio[0],
        moradores: bloqueados,
        totalBloqueados: bloqueados.length,
        dataGeracao: /* @__PURE__ */ new Date()
      };
    }),
    // RelatÃ³rio geral de moradores com marcaÃ§Ã£o de bloqueados
    relatorioGeral: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const todosMoradores = await db.select().from(moradores).where(eq(moradores.condominioId, input.condominioId)).orderBy(moradores.bloco, moradores.apartamento, moradores.nome);
      const condominio = await db.select().from(condominios).where(eq(condominios.id, input.condominioId)).limit(1);
      const bloqueados = todosMoradores.filter((m) => m.bloqueadoVotacao);
      const liberados = todosMoradores.filter((m) => !m.bloqueadoVotacao);
      return {
        condominio: condominio[0],
        moradores: todosMoradores,
        totalMoradores: todosMoradores.length,
        totalBloqueados: bloqueados.length,
        totalLiberados: liberados.length,
        dataGeracao: /* @__PURE__ */ new Date()
      };
    }),
    desvincularUsuario: protectedProcedure.input(z.object({ moradorId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({ usuarioId: null }).where(eq(moradores.id, input.moradorId));
      return { success: true };
    }),
    // Verificar se o morador logado estÃ¡ bloqueado para votaÃ§Ã£o
    verificarBloqueioVotacao: protectedProcedure.input(z.object({ votacaoId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const votacao = await db.select().from(votacoes).where(eq(votacoes.id, input.votacaoId)).limit(1);
      if (!votacao[0]) {
        return { bloqueado: false, telefoneContato: null };
      }
      const revista = await db.select().from(revistas).where(eq(revistas.id, votacao[0].revistaId)).limit(1);
      if (!revista[0]) {
        return { bloqueado: false, telefoneContato: null };
      }
      const condominioId = revista[0].condominioId;
      const morador = await db.select().from(moradores).where(and(
        eq(moradores.usuarioId, ctx.user.id),
        eq(moradores.condominioId, condominioId)
      )).limit(1);
      if (!morador[0]) {
        return { bloqueado: false, telefoneContato: null };
      }
      if (morador[0].bloqueadoVotacao) {
        const condominio = await db.select().from(condominios).where(eq(condominios.id, condominioId)).limit(1);
        return {
          bloqueado: true,
          telefoneContato: condominio[0]?.telefoneContato || null
        };
      }
      return { bloqueado: false, telefoneContato: null };
    }),
    // Cadastro pÃºblico de morador via token
    createPublic: publicProcedure.input(z.object({
      token: z.string(),
      nome: z.string().min(1),
      email: z.string().min(1),
      telefone: z.string().optional(),
      celular: z.string().optional(),
      apartamento: z.string().min(1),
      bloco: z.string().optional(),
      andar: z.string().optional(),
      tipo: z.enum(["proprietario", "inquilino", "familiar", "funcionario"]).optional(),
      cpf: z.string().optional(),
      observacoes: z.string().optional(),
      senha: z.string().min(6)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const condominio = await db.select().from(condominios).where(eq(condominios.cadastroToken, input.token)).limit(1);
      if (!condominio[0]) {
        throw new Error("Token invÃ¡lido ou expirado");
      }
      const existingMorador = await db.select().from(moradores).where(and(
        eq(moradores.email, input.email),
        eq(moradores.condominioId, condominio[0].id)
      )).limit(1);
      if (existingMorador[0]) {
        throw new Error("JÃ¡ existe um morador cadastrado com este e-mail neste condomÃ­nio");
      }
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.senha, 10);
      const { token, senha, ...moradorData } = input;
      const result = await db.insert(moradores).values({
        ...moradorData,
        condominioId: condominio[0].id,
        senha: senhaHash
      });
      return { id: Number(result[0].insertId) };
    }),
    // Cadastro em lote via Excel
    createBatch: protectedProcedure.input(z.object({
      condominioId: z.number(),
      moradores: z.array(z.object({
        nome: z.string().min(1),
        email: z.string().optional(),
        telefone: z.string().optional(),
        celular: z.string().optional(),
        apartamento: z.string().min(1),
        bloco: z.string().optional(),
        andar: z.string().optional(),
        tipo: z.enum(["proprietario", "inquilino", "familiar", "funcionario"]).optional(),
        cpf: z.string().optional(),
        observacoes: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const moradoresData = input.moradores.map((m) => ({
        ...m,
        condominioId: input.condominioId
      }));
      if (moradoresData.length === 0) {
        return { count: 0 };
      }
      await db.insert(moradores).values(moradoresData);
      return { count: moradoresData.length };
    }),
    // ==================== PORTAL DO MORADOR - AUTENTICAÃÃO ====================
    // Login do morador com email e senha
    login: publicProcedure.input(z.object({
      email: z.string().email(),
      senha: z.string().min(4)
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.email, input.email),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("Email nÃ£o encontrado ou morador inativo");
      }
      if (!morador.senha) {
        throw new Error("Senha nÃ£o configurada. Use o link mÃ¡gico para primeiro acesso.");
      }
      const crypto = await import("crypto");
      const senhaHash = crypto.createHash("sha256").update(input.senha).digest("hex");
      if (morador.senha !== senhaHash) {
        throw new Error("Senha incorreta");
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.update(moradores).set({
        loginToken: token,
        loginTokenExpira: expira,
        ultimoLogin: /* @__PURE__ */ new Date()
      }).where(eq(moradores.id, morador.id));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, morador.condominioId));
      return {
        token,
        morador: {
          id: morador.id,
          nome: morador.nome,
          email: morador.email,
          apartamento: morador.apartamento,
          bloco: morador.bloco,
          fotoUrl: morador.fotoUrl
        },
        condominio: condominio ? {
          id: condominio.id,
          nome: condominio.nome,
          logoUrl: condominio.logoUrl
        } : null
      };
    }),
    // Solicitar link mÃ¡gico de login
    solicitarLinkMagico: publicProcedure.input(z.object({
      email: z.string().email()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.email, input.email),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        return { success: true, message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link de acesso." };
      }
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 30 * 60 * 1e3);
      await db.update(moradores).set({
        loginToken: token,
        loginTokenExpira: expira
      }).where(eq(moradores.id, morador.id));
      return {
        success: true,
        message: "Link de acesso enviado para o email.",
        // Em produÃ§Ã£o, remover o token do retorno
        _debug_token: token
      };
    }),
    // Login via link mÃ¡gico
    loginComToken: publicProcedure.input(z.object({
      token: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("Token invÃ¡lido ou expirado");
      }
      if (morador.loginTokenExpira && new Date(morador.loginTokenExpira) < /* @__PURE__ */ new Date()) {
        throw new Error("Token expirado. Solicite um novo link.");
      }
      const crypto = await import("crypto");
      const novoToken = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.update(moradores).set({
        loginToken: novoToken,
        loginTokenExpira: expira,
        ultimoLogin: /* @__PURE__ */ new Date()
      }).where(eq(moradores.id, morador.id));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, morador.condominioId));
      return {
        token: novoToken,
        morador: {
          id: morador.id,
          nome: morador.nome,
          email: morador.email,
          apartamento: morador.apartamento,
          bloco: morador.bloco,
          fotoUrl: morador.fotoUrl
        },
        condominio: condominio ? {
          id: condominio.id,
          nome: condominio.nome,
          logoUrl: condominio.logoUrl
        } : null
      };
    }),
    // Definir senha do morador
    definirSenha: publicProcedure.input(z.object({
      token: z.string(),
      senha: z.string().min(4)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("Token invÃ¡lido");
      }
      const crypto = await import("crypto");
      const senhaHash = crypto.createHash("sha256").update(input.senha).digest("hex");
      const novoToken = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.update(moradores).set({
        senha: senhaHash,
        loginToken: novoToken,
        loginTokenExpira: expira,
        ultimoLogin: /* @__PURE__ */ new Date()
      }).where(eq(moradores.id, morador.id));
      return { success: true, token: novoToken };
    }),
    // Verificar sessÃ£o do morador
    verificarSessao: publicProcedure.input(z.object({
      token: z.string()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.loginToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        return { valido: false };
      }
      if (morador.loginTokenExpira && new Date(morador.loginTokenExpira) < /* @__PURE__ */ new Date()) {
        return { valido: false };
      }
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, morador.condominioId));
      return {
        valido: true,
        morador: {
          id: morador.id,
          nome: morador.nome,
          email: morador.email,
          apartamento: morador.apartamento,
          bloco: morador.bloco,
          fotoUrl: morador.fotoUrl,
          condominioId: morador.condominioId
        },
        condominio: condominio ? {
          id: condominio.id,
          nome: condominio.nome,
          logoUrl: condominio.logoUrl
        } : null
      };
    }),
    // Solicitar recuperaÃ§Ã£o de senha
    solicitarRecuperacaoSenha: publicProcedure.input(z.object({
      email: z.string().email()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.email, input.email),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        return { success: true, message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link para redefinir sua senha." };
      }
      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 60 * 60 * 1e3);
      await db.update(moradores).set({
        resetToken,
        resetTokenExpira: expira
      }).where(eq(moradores.id, morador.id));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, morador.condominioId));
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `RecuperaÃ§Ã£o de Senha - ${morador.nome}`,
          content: `O morador ${morador.nome} (${morador.email}) do condomÃ­nio ${condominio?.nome || "N/A"} solicitou recuperaÃ§Ã£o de senha.

Token: ${resetToken}

Link: /morador/redefinir-senha/${resetToken}`
        });
      } catch (e) {
        console.error("Erro ao enviar notificaÃ§Ã£o:", e);
      }
      return {
        success: true,
        message: "Se o email estiver cadastrado, vocÃª receberÃ¡ um link para redefinir sua senha.",
        // Em desenvolvimento, retornar o token para testes
        _debug_token: resetToken
      };
    }),
    // Validar token de recuperaÃ§Ã£o
    validarTokenRecuperacao: publicProcedure.input(z.object({
      token: z.string()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.resetToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        return { valido: false, mensagem: "Token invÃ¡lido" };
      }
      if (morador.resetTokenExpira && new Date(morador.resetTokenExpira) < /* @__PURE__ */ new Date()) {
        return { valido: false, mensagem: "Token expirado. Solicite um novo link." };
      }
      return {
        valido: true,
        email: morador.email,
        nome: morador.nome
      };
    }),
    // Redefinir senha com token
    redefinirSenha: publicProcedure.input(z.object({
      token: z.string(),
      novaSenha: z.string().min(6)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [morador] = await db.select().from(moradores).where(and(
        eq(moradores.resetToken, input.token),
        eq(moradores.ativo, true)
      )).limit(1);
      if (!morador) {
        throw new Error("Token invÃ¡lido");
      }
      if (morador.resetTokenExpira && new Date(morador.resetTokenExpira) < /* @__PURE__ */ new Date()) {
        throw new Error("Token expirado. Solicite um novo link de recuperaÃ§Ã£o.");
      }
      const bcrypt = await import("bcryptjs");
      const senhaHash = await bcrypt.hash(input.novaSenha, 10);
      const crypto = await import("crypto");
      const loginToken = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await db.update(moradores).set({
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null,
        loginToken,
        loginTokenExpira: expira,
        ultimoLogin: /* @__PURE__ */ new Date()
      }).where(eq(moradores.id, morador.id));
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, morador.condominioId));
      return {
        success: true,
        message: "Senha redefinida com sucesso!",
        token: loginToken,
        morador: {
          id: morador.id,
          nome: morador.nome,
          email: morador.email,
          apartamento: morador.apartamento,
          bloco: morador.bloco,
          fotoUrl: morador.fotoUrl
        },
        condominio: condominio ? {
          id: condominio.id,
          nome: condominio.nome,
          logoUrl: condominio.logoUrl
        } : null
      };
    }),
    // Logout do morador
    logout: publicProcedure.input(z.object({
      token: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(moradores).set({
        loginToken: null,
        loginTokenExpira: null
      }).where(eq(moradores.loginToken, input.token));
      return { success: true };
    })
  }),
  // ==================== TELEFONES ÃTEIS ====================
  telefone: router({
    list: publicProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(telefonesUteis).where(eq(telefonesUteis.revistaId, input.revistaId)).orderBy(telefonesUteis.ordem);
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      nome: z.string().min(1),
      telefone: z.string().min(1),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(telefonesUteis).values(input);
      return { id: Number(result[0].insertId) };
    })
  }),
  // ==================== LINKS ÃTEIS ====================
  link: router({
    list: publicProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(linksUteis).where(eq(linksUteis.revistaId, input.revistaId)).orderBy(linksUteis.ordem);
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      url: z.string().min(1),
      descricao: z.string().optional(),
      icone: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(linksUteis).values(input);
      return { id: Number(result[0].insertId) };
    })
  }),
  // ==================== PUBLICIDADE ====================
  publicidade: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(publicidades).where(eq(publicidades.condominioId, input.condominioId));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      anunciante: z.string().min(1),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      imagemUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      telefone: z.string().optional(),
      tipo: z.enum(["banner", "destaque", "lateral"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(publicidades).values(input);
      return { id: Number(result[0].insertId) };
    })
  }),
  // ==================== UPLOAD DE IMAGENS ====================
  upload: router({
    image: protectedProcedure.input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileData: z.string(),
      // base64
      folder: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { fileName, fileType, fileData, folder = "uploads" } = input;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(fileType)) {
        throw new Error("Tipo de ficheiro nÃ£o suportado. Use JPEG, PNG, GIF ou WebP.");
      }
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        throw new Error("Ficheiro muito grande. MÃ¡ximo 5MB.");
      }
      const ext = fileName.split(".").pop() || "jpg";
      const uniqueId = nanoid(10);
      const fileKey = `${folder}/${ctx.user.id}/${uniqueId}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, fileType);
      return { url, key: fileKey };
    }),
    // Upload de arquivos genÃ©ricos (PDF, DOC, etc.)
    file: protectedProcedure.input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileData: z.string(),
      // base64
      folder: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { fileName, fileType, fileData, folder = "files" } = input;
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        throw new Error("Ficheiro muito grande. MÃ¡ximo 10MB.");
      }
      const ext = fileName.split(".").pop() || "bin";
      const uniqueId = nanoid(10);
      const fileKey = `${folder}/${ctx.user.id}/${uniqueId}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, fileType);
      return { url, key: fileKey };
    })
  }),
  // ==================== NOTIFICAÃÃES ====================
  notificacao: router({
    // Listar notificaÃ§Ãµes do utilizador
    list: protectedProcedure.input(z.object({
      limit: z.number().optional().default(20),
      onlyUnread: z.boolean().optional().default(false)
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(notificacoes).where(eq(notificacoes.userId, ctx.user.id)).orderBy(desc(notificacoes.createdAt)).limit(input.limit);
      if (input.onlyUnread) {
        query = db.select().from(notificacoes).where(and(
          eq(notificacoes.userId, ctx.user.id),
          eq(notificacoes.lida, false)
        )).orderBy(desc(notificacoes.createdAt)).limit(input.limit);
      }
      return query;
    }),
    // Contar notificaÃ§Ãµes nÃ£o lidas
    countUnread: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.select().from(notificacoes).where(and(
        eq(notificacoes.userId, ctx.user.id),
        eq(notificacoes.lida, false)
      ));
      return result.length;
    }),
    // Criar notificaÃ§Ã£o (uso interno)
    create: protectedProcedure.input(z.object({
      userId: z.number(),
      condominioId: z.number().optional(),
      tipo: z.enum(["aviso", "evento", "votacao", "classificado", "carona", "geral"]),
      titulo: z.string().min(1),
      mensagem: z.string().optional(),
      link: z.string().optional(),
      referenciaId: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(notificacoes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    // Criar notificaÃ§Ã£o para todos os moradores de um condomÃ­nio
    notifyAll: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["aviso", "evento", "votacao", "classificado", "carona", "geral"]),
      titulo: z.string().min(1),
      mensagem: z.string().optional(),
      link: z.string().optional(),
      referenciaId: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const moradoresList = await db.select().from(moradores).where(eq(moradores.condominioId, input.condominioId));
      const notifications = moradoresList.filter((morador) => morador.usuarioId !== null).map((morador) => ({
        userId: morador.usuarioId,
        condominioId: input.condominioId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensagem: input.mensagem,
        link: input.link,
        referenciaId: input.referenciaId
      }));
      if (notifications.length > 0) {
        await db.insert(notificacoes).values(notifications);
      }
      return { count: notifications.length };
    }),
    // Marcar notificaÃ§Ã£o como lida
    markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoes).set({ lida: true }).where(and(
        eq(notificacoes.id, input.id),
        eq(notificacoes.userId, ctx.user.id)
      ));
      return { success: true };
    }),
    // Marcar todas as notificaÃ§Ãµes como lidas
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.userId, ctx.user.id));
      return { success: true };
    }),
    // Excluir notificaÃ§Ã£o
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(notificacoes).where(and(
        eq(notificacoes.id, input.id),
        eq(notificacoes.userId, ctx.user.id)
      ));
      return { success: true };
    }),
    // Excluir todas as notificaÃ§Ãµes lidas
    deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(notificacoes).where(and(
        eq(notificacoes.userId, ctx.user.id),
        eq(notificacoes.lida, true)
      ));
      return { success: true };
    })
  }),
  // ==================== PREFERÃNCIAS DE NOTIFICAÃÃO ====================
  preferenciaNotificacao: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(preferenciasNotificacao).where(eq(preferenciasNotificacao.userId, ctx.user.id)).limit(1);
      return result[0] || null;
    }),
    upsert: protectedProcedure.input(z.object({
      avisos: z.boolean().optional(),
      eventos: z.boolean().optional(),
      votacoes: z.boolean().optional(),
      classificados: z.boolean().optional(),
      caronas: z.boolean().optional(),
      emailNotificacoes: z.boolean().optional(),
      efeitoTransicao: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(preferenciasNotificacao).where(eq(preferenciasNotificacao.userId, ctx.user.id)).limit(1);
      if (existing.length > 0) {
        await db.update(preferenciasNotificacao).set(input).where(eq(preferenciasNotificacao.userId, ctx.user.id));
      } else {
        await db.insert(preferenciasNotificacao).values({
          userId: ctx.user.id,
          ...input
        });
      }
      return { success: true };
    })
  }),
  // ==================== REALIZAÃÃES ====================
  realizacao: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(realizacoes).where(eq(realizacoes.revistaId, input.revistaId)).orderBy(desc(realizacoes.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      imagemUrl: z.string().optional(),
      dataRealizacao: z.date().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(realizacoes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(realizacoes).where(eq(realizacoes.id, input.id));
      return { success: true };
    })
  }),
  // ==================== MELHORIAS ====================
  melhoria: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(melhorias).where(eq(melhorias.revistaId, input.revistaId)).orderBy(desc(melhorias.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      imagemUrl: z.string().optional(),
      custo: z.string().optional(),
      dataImplementacao: z.date().optional(),
      status: z.enum(["planejada", "em_andamento", "concluida"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(melhorias).values(input);
      return { id: Number(result[0].insertId) };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(melhorias).where(eq(melhorias.id, input.id));
      return { success: true };
    })
  }),
  // ==================== AQUISIÃÃES ====================
  aquisicao: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(aquisicoes).where(eq(aquisicoes.revistaId, input.revistaId)).orderBy(desc(aquisicoes.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      imagemUrl: z.string().optional(),
      valor: z.string().optional(),
      fornecedor: z.string().optional(),
      dataAquisicao: z.date().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(aquisicoes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(aquisicoes).where(eq(aquisicoes.id, input.id));
      return { success: true };
    })
  }),
  // ==================== ANTES E DEPOIS ====================
  antesDepois: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(antesDepois).where(eq(antesDepois.revistaId, input.revistaId)).orderBy(desc(antesDepois.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      fotoAntesUrl: z.string().optional(),
      fotoDepoisUrl: z.string().optional(),
      dataRealizacao: z.date().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(antesDepois).values(input);
      return { id: Number(result[0].insertId) };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(antesDepois).where(eq(antesDepois.id, input.id));
      return { success: true };
    })
  }),
  // ==================== CLASSIFICADOS (CRUD COMPLETO) ====================
  classificadoCrud: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(classificados).where(eq(classificados.condominioId, input.condominioId)).orderBy(desc(classificados.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["produto", "servico"]),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      preco: z.string().optional(),
      fotoUrl: z.string().optional(),
      contato: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(classificados).values({
        ...input,
        usuarioId: ctx.user.id
      });
      return { id: Number(result[0].insertId) };
    }),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["pendente", "aprovado", "rejeitado", "vendido"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(classificados).set({ status: input.status }).where(eq(classificados.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(classificados).where(eq(classificados.id, input.id));
      return { success: true };
    })
  }),
  // ==================== ANUNCIANTES ====================
  anunciante: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(anunciantes).where(eq(anunciantes.condominioId, input.condominioId)).orderBy(desc(anunciantes.createdAt));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(anunciantes).where(eq(anunciantes.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional(),
      categoria: z.enum(["comercio", "servicos", "profissionais", "alimentacao", "saude", "educacao", "outros"]),
      logoUrl: z.string().optional(),
      telefone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      endereco: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      horarioFuncionamento: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(anunciantes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      categoria: z.enum(["comercio", "servicos", "profissionais", "alimentacao", "saude", "educacao", "outros"]).optional(),
      logoUrl: z.string().optional(),
      telefone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      endereco: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      horarioFuncionamento: z.string().optional(),
      status: z.enum(["ativo", "inativo"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(anunciantes).set(data).where(eq(anunciantes.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(anunciantes).where(eq(anunciantes.id, input.id));
      return { success: true };
    })
  }),
  // ==================== ANÃCIOS ====================
  anuncio: router({
    list: protectedProcedure.input(z.object({ anuncianteId: z.number().optional(), revistaId: z.number().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.anuncianteId) {
        return db.select().from(anuncios).where(eq(anuncios.anuncianteId, input.anuncianteId)).orderBy(desc(anuncios.createdAt));
      }
      if (input.revistaId) {
        return db.select().from(anuncios).where(eq(anuncios.revistaId, input.revistaId)).orderBy(desc(anuncios.createdAt));
      }
      return db.select().from(anuncios).orderBy(desc(anuncios.createdAt));
    }),
    listByCondominioAtivos: publicProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select({
        anuncio: anuncios,
        anunciante: anunciantes
      }).from(anuncios).innerJoin(anunciantes, eq(anuncios.anuncianteId, anunciantes.id)).where(and(
        eq(anunciantes.condominioId, input.condominioId),
        eq(anuncios.status, "ativo")
      )).orderBy(desc(anuncios.createdAt));
      return result;
    }),
    create: protectedProcedure.input(z.object({
      anuncianteId: z.number(),
      revistaId: z.number().optional(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      bannerUrl: z.string().optional(),
      linkDestino: z.string().optional(),
      posicao: z.enum(["capa", "contracapa", "pagina_interna", "rodape", "lateral"]),
      tamanho: z.enum(["pequeno", "medio", "grande", "pagina_inteira"]),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(anuncios).values({
        ...input,
        status: "ativo"
      });
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      bannerUrl: z.string().optional(),
      linkDestino: z.string().optional(),
      posicao: z.enum(["capa", "contracapa", "pagina_interna", "rodape", "lateral"]).optional(),
      tamanho: z.enum(["pequeno", "medio", "grande", "pagina_inteira"]).optional(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
      status: z.enum(["ativo", "pausado", "expirado", "pendente"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(anuncios).set(data).where(eq(anuncios.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(anuncios).where(eq(anuncios.id, input.id));
      return { success: true };
    }),
    registrarVisualizacao: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const anuncio = await db.select().from(anuncios).where(eq(anuncios.id, input.id)).limit(1);
      if (anuncio[0]) {
        await db.update(anuncios).set({ visualizacoes: (anuncio[0].visualizacoes || 0) + 1 }).where(eq(anuncios.id, input.id));
      }
      return { success: true };
    }),
    registrarClique: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const anuncio = await db.select().from(anuncios).where(eq(anuncios.id, input.id)).limit(1);
      if (anuncio[0]) {
        await db.update(anuncios).set({ cliques: (anuncio[0].cliques || 0) + 1 }).where(eq(anuncios.id, input.id));
      }
      return { success: true };
    })
  }),
  // ==================== VAGAS DE ESTACIONAMENTO ====================
  vagaEstacionamento: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vagasEstacionamento).where(eq(vagasEstacionamento.condominioId, input.condominioId)).orderBy(vagasEstacionamento.numero);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(vagasEstacionamento).where(eq(vagasEstacionamento.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      numero: z.string().min(1),
      apartamento: z.string().optional(),
      bloco: z.string().optional(),
      tipo: z.enum(["coberta", "descoberta", "moto"]).default("coberta"),
      observacoes: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(vagasEstacionamento).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      numero: z.string().min(1).optional(),
      apartamento: z.string().optional(),
      bloco: z.string().optional(),
      tipo: z.enum(["coberta", "descoberta", "moto"]).optional(),
      observacoes: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(vagasEstacionamento).set(data).where(eq(vagasEstacionamento.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(vagasEstacionamento).where(eq(vagasEstacionamento.id, input.id));
      return { success: true };
    }),
    getByApartamento: protectedProcedure.input(z.object({ condominioId: z.number(), apartamento: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vagasEstacionamento).where(and(
        eq(vagasEstacionamento.condominioId, input.condominioId),
        eq(vagasEstacionamento.apartamento, input.apartamento)
      ));
    })
  }),
  // ==================== MODERAÃÃO DE CLASSIFICADOS ====================
  moderacao: router({
    // Listar classificados pendentes de aprovaÃ§Ã£o
    listPendentes: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        classificado: classificados,
        usuario: {
          id: users.id,
          name: users.name,
          apartment: users.apartment
        }
      }).from(classificados).leftJoin(users, eq(classificados.usuarioId, users.id)).where(and(
        eq(classificados.condominioId, input.condominioId),
        eq(classificados.status, "pendente")
      )).orderBy(desc(classificados.createdAt));
    }),
    // Aprovar classificado
    aprovar: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(classificados).set({ status: "aprovado" }).where(eq(classificados.id, input.id));
      return { success: true };
    }),
    // Rejeitar classificado
    rejeitar: protectedProcedure.input(z.object({ id: z.number(), motivo: z.string().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(classificados).set({ status: "rejeitado" }).where(eq(classificados.id, input.id));
      return { success: true };
    }),
    // EstatÃ­sticas de moderaÃ§Ã£o
    stats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { pendentes: 0, aprovados: 0, rejeitados: 0 };
      const pendentes = await db.select({ count: sql`count(*)` }).from(classificados).where(and(
        eq(classificados.condominioId, input.condominioId),
        eq(classificados.status, "pendente")
      ));
      const aprovados = await db.select({ count: sql`count(*)` }).from(classificados).where(and(
        eq(classificados.condominioId, input.condominioId),
        eq(classificados.status, "aprovado")
      ));
      const rejeitados = await db.select({ count: sql`count(*)` }).from(classificados).where(and(
        eq(classificados.condominioId, input.condominioId),
        eq(classificados.status, "rejeitado")
      ));
      return {
        pendentes: Number(pendentes[0]?.count || 0),
        aprovados: Number(aprovados[0]?.count || 0),
        rejeitados: Number(rejeitados[0]?.count || 0)
      };
    })
  }),
  // ==================== COMUNICADOS ====================
  comunicado: router({
    list: protectedProcedure.input(z.object({ revistaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(comunicados).where(eq(comunicados.revistaId, input.revistaId)).orderBy(desc(comunicados.createdAt));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(comunicados).where(eq(comunicados.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      revistaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      anexoUrl: z.string().optional(),
      anexoNome: z.string().optional(),
      anexoTipo: z.string().optional(),
      anexoTamanho: z.number().optional(),
      destaque: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(comunicados).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      anexoUrl: z.string().optional(),
      anexoNome: z.string().optional(),
      anexoTipo: z.string().optional(),
      anexoTamanho: z.number().optional(),
      destaque: z.boolean().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(comunicados).set(data).where(eq(comunicados.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(comunicados).where(eq(comunicados.id, input.id));
      return { success: true };
    }),
    // Upload de anexo
    uploadAnexo: protectedProcedure.input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileData: z.string()
      // Base64
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `comunicados/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.fileType);
      return { url, fileName: input.fileName, fileType: input.fileType, fileSize: buffer.length };
    })
  }),
  // ==================== GALERIA DE FOTOS ====================
  album: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number(), categoria: z.string().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.categoria) {
        return db.select().from(albuns).where(and(
          eq(albuns.condominioId, input.condominioId),
          eq(albuns.categoria, input.categoria),
          eq(albuns.ativo, true)
        )).orderBy(desc(albuns.createdAt));
      }
      return db.select().from(albuns).where(and(
        eq(albuns.condominioId, input.condominioId),
        eq(albuns.ativo, true)
      )).orderBy(desc(albuns.createdAt));
    }),
    listPublic: publicProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(albuns).where(and(
        eq(albuns.condominioId, input.condominioId),
        eq(albuns.ativo, true)
      )).orderBy(desc(albuns.createdAt));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(albuns).where(eq(albuns.id, input.id)).limit(1);
      return result[0] || null;
    }),
    getByIdWithFotos: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const albumResult = await db.select().from(albuns).where(eq(albuns.id, input.id)).limit(1);
      if (!albumResult[0]) return null;
      const fotosResult = await db.select().from(fotos).where(eq(fotos.albumId, input.id)).orderBy(fotos.ordem);
      return {
        ...albumResult[0],
        fotos: fotosResult
      };
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      categoria: z.enum(["eventos", "obras", "areas_comuns", "melhorias", "outros"]),
      capaUrl: z.string().optional(),
      dataEvento: z.date().optional(),
      destaque: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(albuns).values(input);
      return { id: Number(result[0].insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      categoria: z.enum(["eventos", "obras", "areas_comuns", "melhorias", "outros"]).optional(),
      capaUrl: z.string().optional(),
      dataEvento: z.date().optional(),
      destaque: z.boolean().optional(),
      ativo: z.boolean().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(albuns).set(data).where(eq(albuns.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(fotos).where(eq(fotos.albumId, input.id));
      await db.delete(albuns).where(eq(albuns.id, input.id));
      return { success: true };
    }),
    stats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, porCategoria: {} };
      const albunsResult = await db.select().from(albuns).where(and(
        eq(albuns.condominioId, input.condominioId),
        eq(albuns.ativo, true)
      ));
      const porCategoria = {};
      albunsResult.forEach((album) => {
        porCategoria[album.categoria] = (porCategoria[album.categoria] || 0) + 1;
      });
      return {
        total: albunsResult.length,
        porCategoria
      };
    })
  }),
  foto: router({
    list: protectedProcedure.input(z.object({ albumId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(fotos).where(eq(fotos.albumId, input.albumId)).orderBy(fotos.ordem);
    }),
    create: protectedProcedure.input(z.object({
      albumId: z.number(),
      url: z.string().min(1),
      legenda: z.string().optional(),
      ordem: z.number().optional(),
      largura: z.number().optional(),
      altura: z.number().optional(),
      tamanho: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(fotos).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      albumId: z.number(),
      fotos: z.array(z.object({
        url: z.string().min(1),
        legenda: z.string().optional(),
        ordem: z.number().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const fotosToInsert = input.fotos.map((foto, index) => ({
        albumId: input.albumId,
        url: foto.url,
        legenda: foto.legenda,
        ordem: foto.ordem ?? index
      }));
      await db.insert(fotos).values(fotosToInsert);
      return { success: true, count: fotosToInsert.length };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      legenda: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(fotos).set(data).where(eq(fotos.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(fotos).where(eq(fotos.id, input.id));
      return { success: true };
    }),
    reorder: protectedProcedure.input(z.object({
      albumId: z.number(),
      fotoIds: z.array(z.number())
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (let i = 0; i < input.fotoIds.length; i++) {
        await db.update(fotos).set({ ordem: i }).where(eq(fotos.id, input.fotoIds[i]));
      }
      return { success: true };
    }),
    count: protectedProcedure.input(z.object({ albumId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.select({ count: sql`count(*)` }).from(fotos).where(eq(fotos.albumId, input.albumId));
      return result[0]?.count || 0;
    })
  }),
  // ==================== DICAS DE SEGURANÃA ====================
  seguranca: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(dicasSeguranca).where(eq(dicasSeguranca.ativo, true)).orderBy(dicasSeguranca.ordem);
    }),
    create: protectedProcedure.input(z.object({
      titulo: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.string().optional(),
      icone: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(dicasSeguranca).values({
        titulo: input.titulo,
        conteudo: input.conteudo,
        categoria: input.categoria || "geral",
        icone: input.icone || "shield"
      });
      return { id: result[0].insertId };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.string().optional(),
      icone: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(dicasSeguranca).set({
        titulo: input.titulo,
        conteudo: input.conteudo,
        categoria: input.categoria || "geral",
        icone: input.icone
      }).where(eq(dicasSeguranca.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(dicasSeguranca).where(eq(dicasSeguranca.id, input.id));
      return { success: true };
    })
  }),
  // ==================== REGRAS E NORMAS ====================
  regras: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(regrasNormas).where(eq(regrasNormas.ativo, true)).orderBy(regrasNormas.ordem);
    }),
    create: protectedProcedure.input(z.object({
      titulo: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(regrasNormas).values({
        titulo: input.titulo,
        conteudo: input.conteudo,
        categoria: input.categoria || "geral",
        ordem: input.ordem || 0
      });
      return { id: result[0].insertId };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1),
      conteudo: z.string().min(1),
      categoria: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(regrasNormas).set({
        titulo: input.titulo,
        conteudo: input.conteudo,
        categoria: input.categoria || "geral",
        ordem: input.ordem
      }).where(eq(regrasNormas.id, input.id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(regrasNormas).where(eq(regrasNormas.id, input.id));
      return { success: true };
    })
  }),
  // ==================== IMAGENS DE REALIZAÃÃES ====================
  imagemRealizacao: router({
    list: protectedProcedure.input(z.object({ realizacaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensRealizacoes).where(eq(imagensRealizacoes.realizacaoId, input.realizacaoId)).orderBy(imagensRealizacoes.ordem);
    }),
    create: protectedProcedure.input(z.object({
      realizacaoId: z.number(),
      imagemUrl: z.string().min(1),
      legenda: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(imagensRealizacoes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      realizacaoId: z.number(),
      imagens: z.array(z.object({
        imagemUrl: z.string().min(1),
        legenda: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const imagensToInsert = input.imagens.map((img, index) => ({
        realizacaoId: input.realizacaoId,
        imagemUrl: img.imagemUrl,
        legenda: img.legenda,
        ordem: index
      }));
      await db.insert(imagensRealizacoes).values(imagensToInsert);
      return { success: true, count: imagensToInsert.length };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensRealizacoes).where(eq(imagensRealizacoes.id, input.id));
      return { success: true };
    }),
    deleteAll: protectedProcedure.input(z.object({ realizacaoId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensRealizacoes).where(eq(imagensRealizacoes.realizacaoId, input.realizacaoId));
      return { success: true };
    })
  }),
  // ==================== IMAGENS DE MELHORIAS ====================
  imagemMelhoria: router({
    list: protectedProcedure.input(z.object({ melhoriaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensMelhorias).where(eq(imagensMelhorias.melhoriaId, input.melhoriaId)).orderBy(imagensMelhorias.ordem);
    }),
    create: protectedProcedure.input(z.object({
      melhoriaId: z.number(),
      imagemUrl: z.string().min(1),
      legenda: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(imagensMelhorias).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      melhoriaId: z.number(),
      imagens: z.array(z.object({
        imagemUrl: z.string().min(1),
        legenda: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const imagensToInsert = input.imagens.map((img, index) => ({
        melhoriaId: input.melhoriaId,
        imagemUrl: img.imagemUrl,
        legenda: img.legenda,
        ordem: index
      }));
      await db.insert(imagensMelhorias).values(imagensToInsert);
      return { success: true, count: imagensToInsert.length };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensMelhorias).where(eq(imagensMelhorias.id, input.id));
      return { success: true };
    }),
    deleteAll: protectedProcedure.input(z.object({ melhoriaId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensMelhorias).where(eq(imagensMelhorias.melhoriaId, input.melhoriaId));
      return { success: true };
    })
  }),
  // ==================== IMAGENS DE AQUISIÃÃES ====================
  imagemAquisicao: router({
    list: protectedProcedure.input(z.object({ aquisicaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensAquisicoes).where(eq(imagensAquisicoes.aquisicaoId, input.aquisicaoId)).orderBy(imagensAquisicoes.ordem);
    }),
    create: protectedProcedure.input(z.object({
      aquisicaoId: z.number(),
      imagemUrl: z.string().min(1),
      legenda: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(imagensAquisicoes).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      aquisicaoId: z.number(),
      imagens: z.array(z.object({
        imagemUrl: z.string().min(1),
        legenda: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const imagensToInsert = input.imagens.map((img, index) => ({
        aquisicaoId: input.aquisicaoId,
        imagemUrl: img.imagemUrl,
        legenda: img.legenda,
        ordem: index
      }));
      await db.insert(imagensAquisicoes).values(imagensToInsert);
      return { success: true, count: imagensToInsert.length };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensAquisicoes).where(eq(imagensAquisicoes.id, input.id));
      return { success: true };
    }),
    deleteAll: protectedProcedure.input(z.object({ aquisicaoId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensAquisicoes).where(eq(imagensAquisicoes.aquisicaoId, input.aquisicaoId));
      return { success: true };
    })
  }),
  // ==================== IMAGENS DE ACHADOS E PERDIDOS ====================
  imagemAchadoPerdido: router({
    list: protectedProcedure.input(z.object({ achadoPerdidoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensAchadosPerdidos).where(eq(imagensAchadosPerdidos.achadoPerdidoId, input.achadoPerdidoId)).orderBy(imagensAchadosPerdidos.ordem);
    }),
    create: protectedProcedure.input(z.object({
      achadoPerdidoId: z.number(),
      imagemUrl: z.string().min(1),
      legenda: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(imagensAchadosPerdidos).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      achadoPerdidoId: z.number(),
      imagens: z.array(z.object({
        imagemUrl: z.string().min(1),
        legenda: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const imagensToInsert = input.imagens.map((img, index) => ({
        achadoPerdidoId: input.achadoPerdidoId,
        imagemUrl: img.imagemUrl,
        legenda: img.legenda,
        ordem: index
      }));
      await db.insert(imagensAchadosPerdidos).values(imagensToInsert);
      return { success: true, count: imagensToInsert.length };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensAchadosPerdidos).where(eq(imagensAchadosPerdidos.id, input.id));
      return { success: true };
    }),
    deleteAll: protectedProcedure.input(z.object({ achadoPerdidoId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensAchadosPerdidos).where(eq(imagensAchadosPerdidos.achadoPerdidoId, input.achadoPerdidoId));
      return { success: true };
    })
  }),
  // ==================== IMAGENS E ANEXOS DE VAGAS ====================
  imagemVaga: router({
    list: protectedProcedure.input(z.object({ vagaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensVagas).where(eq(imagensVagas.vagaId, input.vagaId)).orderBy(imagensVagas.ordem);
    }),
    create: protectedProcedure.input(z.object({
      vagaId: z.number(),
      tipo: z.enum(["imagem", "anexo"]).optional(),
      url: z.string().min(1),
      nome: z.string().optional(),
      mimeType: z.string().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(imagensVagas).values(input);
      return { id: Number(result[0].insertId) };
    }),
    createMultiple: protectedProcedure.input(z.object({
      vagaId: z.number(),
      arquivos: z.array(z.object({
        tipo: z.enum(["imagem", "anexo"]).optional(),
        url: z.string().min(1),
        nome: z.string().optional(),
        mimeType: z.string().optional()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const arquivosToInsert = input.arquivos.map((arq, index) => ({
        vagaId: input.vagaId,
        tipo: arq.tipo || "imagem",
        url: arq.url,
        nome: arq.nome,
        mimeType: arq.mimeType,
        ordem: index
      }));
      await db.insert(imagensVagas).values(arquivosToInsert);
      return { success: true, count: arquivosToInsert.length };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensVagas).where(eq(imagensVagas.id, input.id));
      return { success: true };
    }),
    deleteAll: protectedProcedure.input(z.object({ vagaId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensVagas).where(eq(imagensVagas.vagaId, input.vagaId));
      return { success: true };
    })
  }),
  // ==================== FAVORITOS ====================
  favorito: router({
    list: protectedProcedure.input(z.object({ tipoItem: z.string().optional() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];
      if (input.tipoItem) {
        return db.select().from(favoritos).where(and(
          eq(favoritos.userId, ctx.user.id),
          eq(favoritos.tipoItem, input.tipoItem)
        )).orderBy(desc(favoritos.createdAt));
      }
      return db.select().from(favoritos).where(eq(favoritos.userId, ctx.user.id)).orderBy(desc(favoritos.createdAt));
    }),
    check: protectedProcedure.input(z.object({
      tipoItem: z.string(),
      itemId: z.number().optional(),
      cardSecaoId: z.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) return false;
      let conditions = [
        eq(favoritos.userId, ctx.user.id),
        eq(favoritos.tipoItem, input.tipoItem)
      ];
      if (input.itemId) {
        conditions.push(eq(favoritos.itemId, input.itemId));
      }
      if (input.cardSecaoId) {
        conditions.push(eq(favoritos.cardSecaoId, input.cardSecaoId));
      }
      const result = await db.select().from(favoritos).where(and(...conditions));
      return result.length > 0;
    }),
    toggle: protectedProcedure.input(z.object({
      tipoItem: z.string(),
      itemId: z.number().optional(),
      cardSecaoId: z.string().optional(),
      condominioId: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) throw new Error("Not authenticated");
      let conditions = [
        eq(favoritos.userId, ctx.user.id),
        eq(favoritos.tipoItem, input.tipoItem)
      ];
      if (input.itemId) {
        conditions.push(eq(favoritos.itemId, input.itemId));
      }
      if (input.cardSecaoId) {
        conditions.push(eq(favoritos.cardSecaoId, input.cardSecaoId));
      }
      const existing = await db.select().from(favoritos).where(and(...conditions));
      if (existing.length > 0) {
        await db.delete(favoritos).where(eq(favoritos.id, existing[0].id));
        return { favorito: false };
      } else {
        await db.insert(favoritos).values({
          userId: ctx.user.id,
          tipoItem: input.tipoItem,
          itemId: input.itemId,
          cardSecaoId: input.cardSecaoId,
          condominioId: input.condominioId
        });
        return { favorito: true };
      }
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) throw new Error("Not authenticated");
      await db.delete(favoritos).where(and(
        eq(favoritos.id, input.id),
        eq(favoritos.userId, ctx.user.id)
      ));
      return { success: true };
    }),
    listCards: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];
      return db.select().from(favoritos).where(and(
        eq(favoritos.userId, ctx.user.id),
        eq(favoritos.tipoItem, "card_secao")
      )).orderBy(desc(favoritos.createdAt));
    })
  }),
  // ==================== VISTORIAS ====================
  vistoria: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vistorias).where(eq(vistorias.condominioId, input.condominioId)).orderBy(desc(vistorias.createdAt));
    }),
    listWithDetails: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vistorias).where(eq(vistorias.condominioId, input.condominioId)).orderBy(desc(vistorias.createdAt));
      const result = await Promise.all(items.map(async (item) => {
        const imagens = await db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, item.id));
        const timeline = await db.select().from(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, item.id)).orderBy(desc(vistoriaTimeline.createdAt));
        return { ...item, imagens, timeline };
      }));
      return result;
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.select().from(vistorias).where(eq(vistorias.id, input.id));
      return result || null;
    }),
    searchByProtocolo: protectedProcedure.input(z.object({ protocolo: z.string(), condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vistorias).where(and(
        eq(vistorias.condominioId, input.condominioId),
        like(vistorias.protocolo, `%${input.protocolo}%`)
      )).orderBy(desc(vistorias.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      enderecoGeo: z.string().optional(),
      dataAgendada: z.string().optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      tipo: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const protocolo = String(Math.floor(1e5 + Math.random() * 9e5));
      const [result] = await db.insert(vistorias).values({
        condominioId: input.condominioId,
        protocolo,
        titulo: input.titulo,
        subtitulo: input.subtitulo || null,
        descricao: input.descricao || null,
        observacoes: input.observacoes || null,
        responsavelId: ctx.user?.id,
        responsavelNome: input.responsavelNome || null,
        localizacao: input.localizacao || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        enderecoGeo: input.enderecoGeo || null,
        dataAgendada: input.dataAgendada ? new Date(input.dataAgendada) : null,
        prioridade: input.prioridade || "media",
        tipo: input.tipo || null
      });
      await db.insert(vistoriaTimeline).values({
        vistoriaId: result.insertId,
        tipo: "abertura",
        descricao: `Vistoria criada: ${input.titulo}`,
        statusNovo: "pendente",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId, protocolo };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      dataAgendada: z.string().optional(),
      dataRealizada: z.string().optional(),
      status: z.enum(["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      tipo: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const [vistoriaAtual] = await db.select().from(vistorias).where(eq(vistorias.id, id));
      const statusAnterior = vistoriaAtual?.status;
      await db.update(vistorias).set({
        ...data,
        dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : void 0,
        dataRealizada: data.dataRealizada ? new Date(data.dataRealizada) : void 0
      }).where(eq(vistorias.id, id));
      if (data.status && data.status !== statusAnterior) {
        let tipoEvento = "status_alterado";
        if (data.status === "finalizada") tipoEvento = "fechamento";
        if (data.status === "reaberta") tipoEvento = "reabertura";
        await db.insert(vistoriaTimeline).values({
          vistoriaId: id,
          tipo: tipoEvento,
          descricao: `Status alterado de ${statusAnterior} para ${data.status}`,
          statusAnterior,
          statusNovo: data.status,
          userId: ctx.user?.id,
          userNome: ctx.user?.name || "Sistema"
        });
      } else if (Object.keys(data).length > 0) {
        await db.insert(vistoriaTimeline).values({
          vistoriaId: id,
          tipo: "atualizacao",
          descricao: "Vistoria atualizada",
          userId: ctx.user?.id,
          userNome: ctx.user?.name || "Sistema"
        });
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, input.id));
      await db.delete(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, input.id));
      await db.delete(vistorias).where(eq(vistorias.id, input.id));
      return { success: true };
    }),
    // Timeline
    getTimeline: protectedProcedure.input(z.object({ vistoriaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, input.vistoriaId)).orderBy(desc(vistoriaTimeline.createdAt));
    }),
    addTimelineEvent: protectedProcedure.input(z.object({
      vistoriaId: z.number(),
      tipo: z.enum(["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]),
      descricao: z.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(vistoriaTimeline).values({
        ...input,
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    // Imagens
    getImagens: protectedProcedure.input(z.object({ vistoriaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, input.vistoriaId)).orderBy(vistoriaImagens.ordem);
    }),
    addImagem: protectedProcedure.input(z.object({
      vistoriaId: z.number(),
      url: z.string(),
      legenda: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(vistoriaImagens).values(input);
      await db.insert(vistoriaTimeline).values({
        vistoriaId: input.vistoriaId,
        tipo: "imagem_adicionada",
        descricao: "Nova imagem adicionada",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(vistoriaImagens).where(eq(vistoriaImagens.id, input.id));
      return { success: true };
    }),
    // EstatÃ­sticas
    getStats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, pendentes: 0, realizadas: 0, finalizadas: 0, requerAcao: 0 };
      const all = await db.select().from(vistorias).where(eq(vistorias.condominioId, input.condominioId));
      return {
        total: all.length,
        pendentes: all.filter((v) => v.status === "pendente").length,
        realizadas: all.filter((v) => v.status === "realizada").length,
        finalizadas: all.filter((v) => v.status === "finalizada").length,
        requerAcao: all.filter((v) => v.status === "acao_necessaria").length,
        reabertas: all.filter((v) => v.status === "reaberta").length
      };
    }),
    // Gerar PDF
    generatePdf: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [vistoria] = await db.select().from(vistorias).where(eq(vistorias.id, input.id));
      if (!vistoria) throw new Error("Vistoria nÃ£o encontrada");
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, vistoria.condominioId));
      const imagens = await db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, input.id));
      const pdfBuffer = await generateFuncaoRapidaPDF({
        tipo: "vistoria",
        protocolo: vistoria.protocolo,
        titulo: vistoria.titulo,
        subtitulo: vistoria.subtitulo,
        descricao: vistoria.descricao,
        observacoes: vistoria.observacoes,
        status: vistoria.status,
        prioridade: vistoria.prioridade,
        responsavelNome: vistoria.responsavelNome,
        localizacao: vistoria.localizacao,
        latitude: vistoria.latitude,
        longitude: vistoria.longitude,
        enderecoGeo: vistoria.enderecoGeo,
        createdAt: vistoria.createdAt,
        dataAgendada: vistoria.dataAgendada,
        dataRealizada: vistoria.dataRealizada,
        imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
        condominioNome: condominio?.nome || "CondomÃ­nio",
        condominioLogo: condominio?.logoUrl,
        // CabeÃ§alho e RodapÃ© personalizados
        cabecalhoLogoUrl: condominio?.cabecalhoLogoUrl,
        cabecalhoNomeCondominio: condominio?.cabecalhoNomeCondominio,
        cabecalhoNomeSindico: condominio?.cabecalhoNomeSindico,
        rodapeTexto: condominio?.rodapeTexto,
        rodapeContato: condominio?.rodapeContato
      });
      return { pdf: pdfBuffer.toString("base64") };
    })
  }),
  // ==================== MANUTENÃÃES ====================
  manutencao: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(manutencoes).where(eq(manutencoes.condominioId, input.condominioId)).orderBy(desc(manutencoes.createdAt));
    }),
    // Endpoint para relatÃ³rios - retorna dados completos com imagens e timeline
    listWithDetails: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, input.condominioId)).orderBy(desc(manutencoes.createdAt));
      const result = await Promise.all(items.map(async (item) => {
        const imagens = await db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, item.id)).orderBy(manutencaoImagens.ordem);
        const timeline = await db.select().from(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, item.id)).orderBy(desc(manutencaoTimeline.createdAt));
        return { ...item, imagens, timeline };
      }));
      return result;
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.select().from(manutencoes).where(eq(manutencoes.id, input.id));
      return result || null;
    }),
    searchByProtocolo: protectedProcedure.input(z.object({ protocolo: z.string(), condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(manutencoes).where(and(
        eq(manutencoes.condominioId, input.condominioId),
        like(manutencoes.protocolo, `%${input.protocolo}%`)
      )).orderBy(desc(manutencoes.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      enderecoGeo: z.string().optional(),
      dataAgendada: z.string().optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      tipo: z.enum(["preventiva", "corretiva", "emergencial", "programada"]).optional(),
      tempoEstimadoDias: z.number().optional(),
      tempoEstimadoHoras: z.number().optional(),
      tempoEstimadoMinutos: z.number().optional(),
      fornecedor: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const protocolo = String(Math.floor(1e5 + Math.random() * 9e5));
      const [result] = await db.insert(manutencoes).values({
        condominioId: input.condominioId,
        protocolo,
        titulo: input.titulo,
        subtitulo: input.subtitulo || null,
        descricao: input.descricao || null,
        observacoes: input.observacoes || null,
        responsavelId: ctx.user?.id,
        responsavelNome: input.responsavelNome || null,
        localizacao: input.localizacao || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        enderecoGeo: input.enderecoGeo || null,
        dataAgendada: input.dataAgendada ? new Date(input.dataAgendada) : null,
        prioridade: input.prioridade || "media",
        tipo: input.tipo || "corretiva",
        tempoEstimadoDias: input.tempoEstimadoDias || 0,
        tempoEstimadoHoras: input.tempoEstimadoHoras || 0,
        tempoEstimadoMinutos: input.tempoEstimadoMinutos || 0,
        fornecedor: input.fornecedor || null
      });
      await db.insert(manutencaoTimeline).values({
        manutencaoId: result.insertId,
        tipo: "abertura",
        descricao: `ManutenÃ§Ã£o criada: ${input.titulo}`,
        statusNovo: "pendente",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId, protocolo };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      dataAgendada: z.string().optional(),
      dataRealizada: z.string().optional(),
      status: z.enum(["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      tipo: z.enum(["preventiva", "corretiva", "emergencial", "programada"]).optional(),
      tempoEstimadoDias: z.number().optional(),
      tempoEstimadoHoras: z.number().optional(),
      tempoEstimadoMinutos: z.number().optional(),
      fornecedor: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const [manutencaoAtual] = await db.select().from(manutencoes).where(eq(manutencoes.id, id));
      const statusAnterior = manutencaoAtual?.status;
      await db.update(manutencoes).set({
        ...data,
        dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : void 0,
        dataRealizada: data.dataRealizada ? new Date(data.dataRealizada) : void 0
      }).where(eq(manutencoes.id, id));
      if (data.status && data.status !== statusAnterior) {
        let tipoEvento = "status_alterado";
        if (data.status === "finalizada") tipoEvento = "fechamento";
        if (data.status === "reaberta") tipoEvento = "reabertura";
        await db.insert(manutencaoTimeline).values({
          manutencaoId: id,
          tipo: tipoEvento,
          descricao: `Status alterado de ${statusAnterior} para ${data.status}`,
          statusAnterior,
          statusNovo: data.status,
          userId: ctx.user?.id,
          userNome: ctx.user?.name || "Sistema"
        });
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, input.id));
      await db.delete(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, input.id));
      await db.delete(manutencoes).where(eq(manutencoes.id, input.id));
      return { success: true };
    }),
    getTimeline: protectedProcedure.input(z.object({ manutencaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, input.manutencaoId)).orderBy(desc(manutencaoTimeline.createdAt));
    }),
    addTimelineEvent: protectedProcedure.input(z.object({
      manutencaoId: z.number(),
      tipo: z.enum(["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]),
      descricao: z.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(manutencaoTimeline).values({
        ...input,
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    getImagens: protectedProcedure.input(z.object({ manutencaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, input.manutencaoId)).orderBy(manutencaoImagens.ordem);
    }),
    addImagem: protectedProcedure.input(z.object({
      manutencaoId: z.number(),
      url: z.string(),
      legenda: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(manutencaoImagens).values(input);
      await db.insert(manutencaoTimeline).values({
        manutencaoId: input.manutencaoId,
        tipo: "imagem_adicionada",
        descricao: "Nova imagem adicionada",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(manutencaoImagens).where(eq(manutencaoImagens.id, input.id));
      return { success: true };
    }),
    getStats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, pendentes: 0, realizadas: 0, finalizadas: 0, requerAcao: 0 };
      const all = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, input.condominioId));
      return {
        total: all.length,
        pendentes: all.filter((m) => m.status === "pendente").length,
        realizadas: all.filter((m) => m.status === "realizada").length,
        finalizadas: all.filter((m) => m.status === "finalizada").length,
        requerAcao: all.filter((m) => m.status === "acao_necessaria").length,
        reabertas: all.filter((m) => m.status === "reaberta").length
      };
    }),
    // Gerar PDF
    generatePdf: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [manutencao] = await db.select().from(manutencoes).where(eq(manutencoes.id, input.id));
      if (!manutencao) throw new Error("ManutenÃ§Ã£o nÃ£o encontrada");
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, manutencao.condominioId));
      const imagens = await db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, input.id));
      const pdfBuffer = await generateFuncaoRapidaPDF({
        tipo: "manutencao",
        protocolo: manutencao.protocolo,
        titulo: manutencao.titulo,
        subtitulo: manutencao.subtitulo,
        descricao: manutencao.descricao,
        observacoes: manutencao.observacoes,
        status: manutencao.status,
        prioridade: manutencao.prioridade,
        responsavelNome: manutencao.responsavelNome,
        localizacao: manutencao.localizacao,
        latitude: manutencao.latitude,
        longitude: manutencao.longitude,
        enderecoGeo: manutencao.enderecoGeo,
        createdAt: manutencao.createdAt,
        dataAgendada: manutencao.dataAgendada,
        dataRealizada: manutencao.dataRealizada,
        tipo_manutencao: manutencao.tipo,
        tempoEstimadoDias: manutencao.tempoEstimadoDias,
        tempoEstimadoHoras: manutencao.tempoEstimadoHoras,
        tempoEstimadoMinutos: manutencao.tempoEstimadoMinutos,
        fornecedor: manutencao.fornecedor,
        imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
        condominioNome: condominio?.nome || "CondomÃ­nio",
        condominioLogo: condominio?.logoUrl,
        // CabeÃ§alho e RodapÃ© personalizados
        cabecalhoLogoUrl: condominio?.cabecalhoLogoUrl,
        cabecalhoNomeCondominio: condominio?.cabecalhoNomeCondominio,
        cabecalhoNomeSindico: condominio?.cabecalhoNomeSindico,
        rodapeTexto: condominio?.rodapeTexto,
        rodapeContato: condominio?.rodapeContato
      });
      return { pdf: pdfBuffer.toString("base64") };
    })
  }),
  // ==================== OCORRÃNCIAS ====================
  ocorrencia: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, input.condominioId)).orderBy(desc(ocorrencias.createdAt));
    }),
    listWithDetails: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, input.condominioId)).orderBy(desc(ocorrencias.createdAt));
      const result = await Promise.all(items.map(async (item) => {
        const imagens = await db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, item.id));
        const timeline = await db.select().from(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, item.id)).orderBy(desc(ocorrenciaTimeline.createdAt));
        return { ...item, imagens, timeline };
      }));
      return result;
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.select().from(ocorrencias).where(eq(ocorrencias.id, input.id));
      return result || null;
    }),
    searchByProtocolo: protectedProcedure.input(z.object({ protocolo: z.string(), condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ocorrencias).where(and(
        eq(ocorrencias.condominioId, input.condominioId),
        like(ocorrencias.protocolo, `%${input.protocolo}%`)
      )).orderBy(desc(ocorrencias.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      reportadoPorNome: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      enderecoGeo: z.string().optional(),
      dataOcorrencia: z.string().optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      categoria: z.enum(["seguranca", "barulho", "manutencao", "convivencia", "animais", "estacionamento", "limpeza", "outros"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const protocolo = String(Math.floor(1e5 + Math.random() * 9e5));
      const [result] = await db.insert(ocorrencias).values({
        condominioId: input.condominioId,
        protocolo,
        titulo: input.titulo,
        subtitulo: input.subtitulo || null,
        descricao: input.descricao || null,
        observacoes: input.observacoes || null,
        reportadoPorId: ctx.user?.id,
        reportadoPorNome: input.reportadoPorNome || null,
        responsavelNome: input.responsavelNome || null,
        localizacao: input.localizacao || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        enderecoGeo: input.enderecoGeo || null,
        dataOcorrencia: input.dataOcorrencia ? new Date(input.dataOcorrencia) : /* @__PURE__ */ new Date(),
        prioridade: input.prioridade || "media",
        categoria: input.categoria || "outros"
      });
      await db.insert(ocorrenciaTimeline).values({
        ocorrenciaId: result.insertId,
        tipo: "abertura",
        descricao: `OcorrÃªncia registrada: ${input.titulo}`,
        statusNovo: "pendente",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId, protocolo };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      status: z.enum(["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      categoria: z.enum(["seguranca", "barulho", "manutencao", "convivencia", "animais", "estacionamento", "limpeza", "outros"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const [ocorrenciaAtual] = await db.select().from(ocorrencias).where(eq(ocorrencias.id, id));
      const statusAnterior = ocorrenciaAtual?.status;
      await db.update(ocorrencias).set(data).where(eq(ocorrencias.id, id));
      if (data.status && data.status !== statusAnterior) {
        let tipoEvento = "status_alterado";
        if (data.status === "finalizada") tipoEvento = "fechamento";
        if (data.status === "reaberta") tipoEvento = "reabertura";
        await db.insert(ocorrenciaTimeline).values({
          ocorrenciaId: id,
          tipo: tipoEvento,
          descricao: `Status alterado de ${statusAnterior} para ${data.status}`,
          statusAnterior,
          statusNovo: data.status,
          userId: ctx.user?.id,
          userNome: ctx.user?.name || "Sistema"
        });
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, input.id));
      await db.delete(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, input.id));
      await db.delete(ocorrencias).where(eq(ocorrencias.id, input.id));
      return { success: true };
    }),
    getTimeline: protectedProcedure.input(z.object({ ocorrenciaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, input.ocorrenciaId)).orderBy(desc(ocorrenciaTimeline.createdAt));
    }),
    addTimelineEvent: protectedProcedure.input(z.object({
      ocorrenciaId: z.number(),
      tipo: z.enum(["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]),
      descricao: z.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(ocorrenciaTimeline).values({
        ...input,
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    getImagens: protectedProcedure.input(z.object({ ocorrenciaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, input.ocorrenciaId)).orderBy(ocorrenciaImagens.ordem);
    }),
    addImagem: protectedProcedure.input(z.object({
      ocorrenciaId: z.number(),
      url: z.string(),
      legenda: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(ocorrenciaImagens).values(input);
      await db.insert(ocorrenciaTimeline).values({
        ocorrenciaId: input.ocorrenciaId,
        tipo: "imagem_adicionada",
        descricao: "Nova imagem adicionada",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(ocorrenciaImagens).where(eq(ocorrenciaImagens.id, input.id));
      return { success: true };
    }),
    getStats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, pendentes: 0, realizadas: 0, finalizadas: 0, requerAcao: 0 };
      const all = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, input.condominioId));
      return {
        total: all.length,
        pendentes: all.filter((o) => o.status === "pendente").length,
        realizadas: all.filter((o) => o.status === "realizada").length,
        finalizadas: all.filter((o) => o.status === "finalizada").length,
        requerAcao: all.filter((o) => o.status === "acao_necessaria").length,
        reabertas: all.filter((o) => o.status === "reaberta").length
      };
    }),
    // Gerar PDF
    generatePdf: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ocorrencia] = await db.select().from(ocorrencias).where(eq(ocorrencias.id, input.id));
      if (!ocorrencia) throw new Error("OcorrÃªncia nÃ£o encontrada");
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, ocorrencia.condominioId));
      const imagens = await db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, input.id));
      const pdfBuffer = await generateFuncaoRapidaPDF({
        tipo: "ocorrencia",
        protocolo: ocorrencia.protocolo,
        titulo: ocorrencia.titulo,
        subtitulo: ocorrencia.subtitulo,
        descricao: ocorrencia.descricao,
        observacoes: ocorrencia.observacoes,
        status: ocorrencia.status,
        prioridade: ocorrencia.prioridade,
        responsavelNome: ocorrencia.responsavelNome,
        localizacao: ocorrencia.localizacao,
        latitude: ocorrencia.latitude,
        longitude: ocorrencia.longitude,
        enderecoGeo: ocorrencia.enderecoGeo,
        createdAt: ocorrencia.createdAt,
        dataOcorrencia: ocorrencia.dataOcorrencia,
        categoria: ocorrencia.categoria,
        imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
        condominioNome: condominio?.nome || "CondomÃ­nio",
        condominioLogo: condominio?.logoUrl,
        // CabeÃ§alho e RodapÃ© personalizados
        cabecalhoLogoUrl: condominio?.cabecalhoLogoUrl,
        cabecalhoNomeCondominio: condominio?.cabecalhoNomeCondominio,
        cabecalhoNomeSindico: condominio?.cabecalhoNomeSindico,
        rodapeTexto: condominio?.rodapeTexto,
        rodapeContato: condominio?.rodapeContato
      });
      return { pdf: pdfBuffer.toString("base64") };
    })
  }),
  // ==================== CHECKLISTS ====================
  checklist: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklists).where(eq(checklists.condominioId, input.condominioId)).orderBy(desc(checklists.createdAt));
    }),
    listWithDetails: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(checklists).where(eq(checklists.condominioId, input.condominioId)).orderBy(desc(checklists.createdAt));
      const result = await Promise.all(items.map(async (item) => {
        const imagens = await db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, item.id));
        const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, item.id));
        return { ...item, imagens, itens };
      }));
      return result;
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.select().from(checklists).where(eq(checklists.id, input.id));
      return result || null;
    }),
    searchByProtocolo: protectedProcedure.input(z.object({ protocolo: z.string(), condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklists).where(and(
        eq(checklists.condominioId, input.condominioId),
        like(checklists.protocolo, `%${input.protocolo}%`)
      )).orderBy(desc(checklists.createdAt));
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      enderecoGeo: z.string().optional(),
      dataAgendada: z.string().optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      categoria: z.string().optional(),
      itens: z.array(z.string()).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const protocolo = String(Math.floor(1e5 + Math.random() * 9e5));
      const { itens } = input;
      const [result] = await db.insert(checklists).values({
        condominioId: input.condominioId,
        protocolo,
        titulo: input.titulo,
        subtitulo: input.subtitulo || null,
        descricao: input.descricao || null,
        observacoes: input.observacoes || null,
        responsavelId: ctx.user?.id,
        responsavelNome: input.responsavelNome || null,
        localizacao: input.localizacao || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        enderecoGeo: input.enderecoGeo || null,
        dataAgendada: input.dataAgendada ? new Date(input.dataAgendada) : null,
        prioridade: input.prioridade || "media",
        categoria: input.categoria || null,
        totalItens: itens?.length || 0
      });
      if (itens && itens.length > 0) {
        for (let i = 0; i < itens.length; i++) {
          await db.insert(checklistItens).values({
            checklistId: result.insertId,
            descricao: itens[i],
            ordem: i
          });
        }
      }
      await db.insert(checklistTimeline).values({
        checklistId: result.insertId,
        tipo: "abertura",
        descricao: `Checklist criado: ${input.titulo}`,
        statusNovo: "pendente",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId, protocolo };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      responsavelNome: z.string().optional(),
      localizacao: z.string().optional(),
      dataAgendada: z.string().optional(),
      dataRealizada: z.string().optional(),
      status: z.enum(["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).optional(),
      prioridade: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      categoria: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const [checklistAtual] = await db.select().from(checklists).where(eq(checklists.id, id));
      const statusAnterior = checklistAtual?.status;
      await db.update(checklists).set({
        ...data,
        dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : void 0,
        dataRealizada: data.dataRealizada ? new Date(data.dataRealizada) : void 0
      }).where(eq(checklists.id, id));
      if (data.status && data.status !== statusAnterior) {
        let tipoEvento = "status_alterado";
        if (data.status === "finalizada") tipoEvento = "fechamento";
        if (data.status === "reaberta") tipoEvento = "reabertura";
        await db.insert(checklistTimeline).values({
          checklistId: id,
          tipo: tipoEvento,
          descricao: `Status alterado de ${statusAnterior} para ${data.status}`,
          statusAnterior,
          statusNovo: data.status,
          userId: ctx.user?.id,
          userNome: ctx.user?.name || "Sistema"
        });
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(checklistTimeline).where(eq(checklistTimeline.checklistId, input.id));
      await db.delete(checklistImagens).where(eq(checklistImagens.checklistId, input.id));
      await db.delete(checklistItens).where(eq(checklistItens.checklistId, input.id));
      await db.delete(checklists).where(eq(checklists.id, input.id));
      return { success: true };
    }),
    // Itens do checklist
    getItens: protectedProcedure.input(z.object({ checklistId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklistItens).where(eq(checklistItens.checklistId, input.checklistId)).orderBy(checklistItens.ordem);
    }),
    addItem: protectedProcedure.input(z.object({
      checklistId: z.number(),
      descricao: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(checklistItens).values(input);
      const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, input.checklistId));
      await db.update(checklists).set({ totalItens: itens.length }).where(eq(checklists.id, input.checklistId));
      return { id: result.insertId };
    }),
    updateItem: protectedProcedure.input(z.object({
      id: z.number(),
      descricao: z.string().optional(),
      completo: z.boolean().optional(),
      observacao: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const [itemAtual] = await db.select().from(checklistItens).where(eq(checklistItens.id, id));
      await db.update(checklistItens).set(data).where(eq(checklistItens.id, id));
      if (data.completo !== void 0 && data.completo !== itemAtual?.completo) {
        const checklistId = itemAtual?.checklistId;
        if (checklistId) {
          await db.insert(checklistTimeline).values({
            checklistId,
            tipo: "item_completo",
            descricao: data.completo ? `Item concluÃ­do: ${itemAtual?.descricao}` : `Item reaberto: ${itemAtual?.descricao}`,
            userId: ctx.user?.id,
            userNome: ctx.user?.name || "Sistema"
          });
          const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, checklistId));
          const completos = itens.filter((i) => i.completo).length;
          await db.update(checklists).set({ itensCompletos: completos }).where(eq(checklists.id, checklistId));
        }
      }
      return { success: true };
    }),
    removeItem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [item] = await db.select().from(checklistItens).where(eq(checklistItens.id, input.id));
      await db.delete(checklistItens).where(eq(checklistItens.id, input.id));
      if (item?.checklistId) {
        const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, item.checklistId));
        await db.update(checklists).set({
          totalItens: itens.length,
          itensCompletos: itens.filter((i) => i.completo).length
        }).where(eq(checklists.id, item.checklistId));
      }
      return { success: true };
    }),
    getTimeline: protectedProcedure.input(z.object({ checklistId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklistTimeline).where(eq(checklistTimeline.checklistId, input.checklistId)).orderBy(desc(checklistTimeline.createdAt));
    }),
    addTimelineEvent: protectedProcedure.input(z.object({
      checklistId: z.number(),
      tipo: z.enum(["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "item_completo", "fechamento", "reabertura"]),
      descricao: z.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(checklistTimeline).values({
        ...input,
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    getImagens: protectedProcedure.input(z.object({ checklistId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, input.checklistId)).orderBy(checklistImagens.ordem);
    }),
    addImagem: protectedProcedure.input(z.object({
      checklistId: z.number(),
      url: z.string(),
      legenda: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(checklistImagens).values(input);
      await db.insert(checklistTimeline).values({
        checklistId: input.checklistId,
        tipo: "imagem_adicionada",
        descricao: "Nova imagem adicionada",
        userId: ctx.user?.id,
        userNome: ctx.user?.name || "Sistema"
      });
      return { id: result.insertId };
    }),
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(checklistImagens).where(eq(checklistImagens.id, input.id));
      return { success: true };
    }),
    getStats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, pendentes: 0, realizadas: 0, finalizadas: 0, requerAcao: 0 };
      const all = await db.select().from(checklists).where(eq(checklists.condominioId, input.condominioId));
      return {
        total: all.length,
        pendentes: all.filter((c) => c.status === "pendente").length,
        realizadas: all.filter((c) => c.status === "realizada").length,
        finalizadas: all.filter((c) => c.status === "finalizada").length,
        requerAcao: all.filter((c) => c.status === "acao_necessaria").length,
        reabertas: all.filter((c) => c.status === "reaberta").length
      };
    }),
    // Gerar PDF
    generatePdf: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [checklist] = await db.select().from(checklists).where(eq(checklists.id, input.id));
      if (!checklist) throw new Error("Checklist nÃ£o encontrado");
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, checklist.condominioId));
      const imagens = await db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, input.id));
      const pdfBuffer = await generateFuncaoRapidaPDF({
        tipo: "checklist",
        protocolo: checklist.protocolo,
        titulo: checklist.titulo,
        subtitulo: checklist.subtitulo,
        descricao: checklist.descricao,
        observacoes: checklist.observacoes,
        status: checklist.status,
        prioridade: checklist.prioridade,
        responsavelNome: checklist.responsavelNome,
        localizacao: checklist.localizacao,
        latitude: checklist.latitude,
        longitude: checklist.longitude,
        enderecoGeo: checklist.enderecoGeo,
        createdAt: checklist.createdAt,
        dataAgendada: checklist.dataAgendada,
        categoria: checklist.categoria,
        totalItens: checklist.totalItens,
        itensCompletos: checklist.itensCompletos,
        imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
        condominioNome: condominio?.nome || "CondomÃ­nio",
        condominioLogo: condominio?.logoUrl,
        // CabeÃ§alho e RodapÃ© personalizados
        cabecalhoLogoUrl: condominio?.cabecalhoLogoUrl,
        cabecalhoNomeCondominio: condominio?.cabecalhoNomeCondominio,
        cabecalhoNomeSindico: condominio?.cabecalhoNomeSindico,
        rodapeTexto: condominio?.rodapeTexto,
        rodapeContato: condominio?.rodapeContato
      });
      return { pdf: pdfBuffer.toString("base64") };
    }),
    // ==================== TEMPLATES DE CHECKLIST ====================
    listTemplates: protectedProcedure.input(z.object({ condominioId: z.number().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const templates = await db.select().from(checklistTemplates).where(
        input.condominioId ? or(
          eq(checklistTemplates.isPadrao, true),
          eq(checklistTemplates.condominioId, input.condominioId)
        ) : eq(checklistTemplates.isPadrao, true)
      ).orderBy(desc(checklistTemplates.isPadrao), checklistTemplates.nome);
      const templatesComItens = await Promise.all(
        templates.map(async (template) => {
          const itens = await db.select().from(checklistTemplateItens).where(eq(checklistTemplateItens.templateId, template.id)).orderBy(checklistTemplateItens.ordem);
          return { ...template, itens };
        })
      );
      return templatesComItens;
    }),
    getTemplate: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [template] = await db.select().from(checklistTemplates).where(eq(checklistTemplates.id, input.id));
      if (!template) return null;
      const itens = await db.select().from(checklistTemplateItens).where(eq(checklistTemplateItens.templateId, input.id)).orderBy(checklistTemplateItens.ordem);
      return { ...template, itens };
    }),
    createTemplate: protectedProcedure.input(z.object({
      condominioId: z.number().optional(),
      nome: z.string(),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      isPadrao: z.boolean().optional(),
      itens: z.array(z.string())
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { itens, ...templateData } = input;
      const [result] = await db.insert(checklistTemplates).values(templateData);
      const templateId = result.insertId;
      if (itens.length > 0) {
        await db.insert(checklistTemplateItens).values(
          itens.map((descricao, index) => ({
            templateId,
            descricao,
            ordem: index
          }))
        );
      }
      return { id: templateId };
    }),
    updateTemplate: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      itens: z.array(z.string()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, itens, ...updateData } = input;
      if (Object.keys(updateData).length > 0) {
        await db.update(checklistTemplates).set(updateData).where(eq(checklistTemplates.id, id));
      }
      if (itens) {
        await db.delete(checklistTemplateItens).where(eq(checklistTemplateItens.templateId, id));
        if (itens.length > 0) {
          await db.insert(checklistTemplateItens).values(
            itens.map((descricao, index) => ({
              templateId: id,
              descricao,
              ordem: index
            }))
          );
        }
      }
      return { success: true };
    }),
    deleteTemplate: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(checklistTemplateItens).where(eq(checklistTemplateItens.templateId, input.id));
      await db.delete(checklistTemplates).where(eq(checklistTemplates.id, input.id));
      return { success: true };
    })
  }),
  // Painel de Controlo - EstatÃ­sticas Agregadas
  painelControlo: router({
    // EstatÃ­sticas gerais de todas as secÃ§Ãµes
    getEstatisticasGerais: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { vistorias: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0 }, manutencoes: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0, porTipo: { preventiva: 0, corretiva: 0, emergencial: 0, programada: 0 } }, ocorrencias: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0, porCategoria: { seguranca: 0, barulho: 0, manutencao: 0, convivencia: 0, animais: 0, estacionamento: 0, limpeza: 0, outros: 0 } }, checklists: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0 } };
      const { condominioId } = input;
      const vistoriasData = await db.select().from(vistorias).where(eq(vistorias.condominioId, condominioId));
      const vistoriasStats = {
        total: vistoriasData.length,
        pendentes: vistoriasData.filter((v) => v.status === "pendente").length,
        realizadas: vistoriasData.filter((v) => v.status === "realizada").length,
        acaoNecessaria: vistoriasData.filter((v) => v.status === "acao_necessaria").length,
        finalizadas: vistoriasData.filter((v) => v.status === "finalizada").length,
        reabertas: vistoriasData.filter((v) => v.status === "reaberta").length
      };
      const manutencoesData = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, condominioId));
      const manutencoesStats = {
        total: manutencoesData.length,
        pendentes: manutencoesData.filter((m) => m.status === "pendente").length,
        realizadas: manutencoesData.filter((m) => m.status === "realizada").length,
        acaoNecessaria: manutencoesData.filter((m) => m.status === "acao_necessaria").length,
        finalizadas: manutencoesData.filter((m) => m.status === "finalizada").length,
        reabertas: manutencoesData.filter((m) => m.status === "reaberta").length,
        porTipo: {
          preventiva: manutencoesData.filter((m) => m.tipo === "preventiva").length,
          corretiva: manutencoesData.filter((m) => m.tipo === "corretiva").length,
          emergencial: manutencoesData.filter((m) => m.tipo === "emergencial").length,
          programada: manutencoesData.filter((m) => m.tipo === "programada").length
        }
      };
      const ocorrenciasData = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, condominioId));
      const ocorrenciasStats = {
        total: ocorrenciasData.length,
        pendentes: ocorrenciasData.filter((o) => o.status === "pendente").length,
        realizadas: ocorrenciasData.filter((o) => o.status === "realizada").length,
        acaoNecessaria: ocorrenciasData.filter((o) => o.status === "acao_necessaria").length,
        finalizadas: ocorrenciasData.filter((o) => o.status === "finalizada").length,
        reabertas: ocorrenciasData.filter((o) => o.status === "reaberta").length,
        porCategoria: {
          seguranca: ocorrenciasData.filter((o) => o.categoria === "seguranca").length,
          barulho: ocorrenciasData.filter((o) => o.categoria === "barulho").length,
          manutencao: ocorrenciasData.filter((o) => o.categoria === "manutencao").length,
          convivencia: ocorrenciasData.filter((o) => o.categoria === "convivencia").length,
          animais: ocorrenciasData.filter((o) => o.categoria === "animais").length,
          estacionamento: ocorrenciasData.filter((o) => o.categoria === "estacionamento").length,
          limpeza: ocorrenciasData.filter((o) => o.categoria === "limpeza").length,
          outros: ocorrenciasData.filter((o) => o.categoria === "outros").length
        }
      };
      const checklistsData = await db.select().from(checklists).where(eq(checklists.condominioId, condominioId));
      const checklistsStats = {
        total: checklistsData.length,
        pendentes: checklistsData.filter((c) => c.status === "pendente").length,
        realizadas: checklistsData.filter((c) => c.status === "realizada").length,
        acaoNecessaria: checklistsData.filter((c) => c.status === "acao_necessaria").length,
        finalizadas: checklistsData.filter((c) => c.status === "finalizada").length,
        reabertas: checklistsData.filter((c) => c.status === "reaberta").length
      };
      return {
        vistorias: vistoriasStats,
        manutencoes: manutencoesStats,
        ocorrencias: ocorrenciasStats,
        checklists: checklistsStats,
        totais: {
          total: vistoriasStats.total + manutencoesStats.total + ocorrenciasStats.total + checklistsStats.total,
          pendentes: vistoriasStats.pendentes + manutencoesStats.pendentes + ocorrenciasStats.pendentes + checklistsStats.pendentes,
          finalizadas: vistoriasStats.finalizadas + manutencoesStats.finalizadas + ocorrenciasStats.finalizadas + checklistsStats.finalizadas
        }
      };
    }),
    // EvoluÃ§Ã£o temporal (itens criados por dia nos Ãºltimos 30 dias)
    getEvolucaoTemporal: protectedProcedure.input(z.object({ condominioId: z.number(), dias: z.number().default(30) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId, dias } = input;
      const dataInicio = /* @__PURE__ */ new Date();
      dataInicio.setDate(dataInicio.getDate() - dias);
      const vistoriasData = await db.select().from(vistorias).where(and(eq(vistorias.condominioId, condominioId), gte(vistorias.createdAt, dataInicio)));
      const manutencoesData = await db.select().from(manutencoes).where(and(eq(manutencoes.condominioId, condominioId), gte(manutencoes.createdAt, dataInicio)));
      const ocorrenciasData = await db.select().from(ocorrencias).where(and(eq(ocorrencias.condominioId, condominioId), gte(ocorrencias.createdAt, dataInicio)));
      const checklistsData = await db.select().from(checklists).where(and(eq(checklists.condominioId, condominioId), gte(checklists.createdAt, dataInicio)));
      const evolucao = {};
      for (let i = 0; i < dias; i++) {
        const data = /* @__PURE__ */ new Date();
        data.setDate(data.getDate() - i);
        const key = data.toISOString().split("T")[0];
        evolucao[key] = { vistorias: 0, manutencoes: 0, ocorrencias: 0, checklists: 0 };
      }
      vistoriasData.forEach((v) => {
        const key = new Date(v.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].vistorias++;
      });
      manutencoesData.forEach((m) => {
        const key = new Date(m.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].manutencoes++;
      });
      ocorrenciasData.forEach((o) => {
        const key = new Date(o.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].ocorrencias++;
      });
      checklistsData.forEach((c) => {
        const key = new Date(c.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].checklists++;
      });
      return Object.entries(evolucao).map(([data, valores]) => ({ data, ...valores })).sort((a, b) => a.data.localeCompare(b.data));
    }),
    // DistribuiÃ§Ã£o por prioridade
    getDistribuicaoPrioridade: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId } = input;
      const vistoriasData = await db.select().from(vistorias).where(eq(vistorias.condominioId, condominioId));
      const manutencoesData = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, condominioId));
      const ocorrenciasData = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, condominioId));
      const prioridades = ["baixa", "media", "alta", "urgente"];
      const distribuicao = prioridades.map((p) => ({
        prioridade: p,
        vistorias: vistoriasData.filter((v) => v.prioridade === p).length,
        manutencoes: manutencoesData.filter((m) => m.prioridade === p).length,
        ocorrencias: ocorrenciasData.filter((o) => o.prioridade === p).length,
        total: vistoriasData.filter((v) => v.prioridade === p).length + manutencoesData.filter((m) => m.prioridade === p).length + ocorrenciasData.filter((o) => o.prioridade === p).length
      }));
      return distribuicao;
    }),
    // Itens recentes (timeline geral)
    getItensRecentes: protectedProcedure.input(z.object({ condominioId: z.number(), limite: z.number().default(10) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId, limite } = input;
      const vistoriasData = await db.select().from(vistorias).where(eq(vistorias.condominioId, condominioId)).orderBy(desc(vistorias.createdAt)).limit(limite);
      const manutencoesData = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, condominioId)).orderBy(desc(manutencoes.createdAt)).limit(limite);
      const ocorrenciasData = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, condominioId)).orderBy(desc(ocorrencias.createdAt)).limit(limite);
      const checklistsData = await db.select().from(checklists).where(eq(checklists.condominioId, condominioId)).orderBy(desc(checklists.createdAt)).limit(limite);
      const itens = [
        ...vistoriasData.map((v) => ({ ...v, itemTipo: "vistoria" })),
        ...manutencoesData.map((m) => ({ ...m, itemTipo: "manutencao" })),
        ...ocorrenciasData.map((o) => ({ ...o, itemTipo: "ocorrencia" })),
        ...checklistsData.map((c) => ({ ...c, itemTipo: "checklist" }))
      ];
      return itens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limite);
    })
  }),
  // ==================== MEMBROS DA EQUIPE ====================
  membroEquipe: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(membrosEquipe).where(and(
        eq(membrosEquipe.condominioId, input.condominioId),
        eq(membrosEquipe.ativo, true)
      )).orderBy(membrosEquipe.nome);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(membrosEquipe).where(eq(membrosEquipe.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      whatsapp: z.string().min(1),
      descricao: z.string().optional(),
      cargo: z.string().optional(),
      fotoUrl: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(membrosEquipe).values({
        condominioId: input.condominioId,
        nome: input.nome,
        whatsapp: input.whatsapp,
        descricao: input.descricao || null,
        cargo: input.cargo || null,
        fotoUrl: input.fotoUrl || null
      });
      return { id: result[0].insertId };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      whatsapp: z.string().min(1).optional(),
      descricao: z.string().optional(),
      cargo: z.string().optional(),
      fotoUrl: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(membrosEquipe).set(data).where(eq(membrosEquipe.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(membrosEquipe).set({ ativo: false }).where(eq(membrosEquipe.id, input.id));
      return { success: true };
    })
  }),
  // ==================== LINKS COMPARTILHÃVEIS ====================
  linkCompartilhavel: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number(), tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]).optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(linksCompartilhaveis.condominioId, input.condominioId), eq(linksCompartilhaveis.ativo, true)];
      if (input.tipo) {
        conditions.push(eq(linksCompartilhaveis.tipo, input.tipo));
      }
      return db.select().from(linksCompartilhaveis).where(and(...conditions)).orderBy(desc(linksCompartilhaveis.createdAt));
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(linksCompartilhaveis).where(eq(linksCompartilhaveis.id, input.id)).limit(1);
      return result[0] || null;
    }),
    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(linksCompartilhaveis).where(and(
        eq(linksCompartilhaveis.token, input.token),
        eq(linksCompartilhaveis.ativo, true)
      )).limit(1);
      if (!result[0]) return null;
      await db.update(linksCompartilhaveis).set({ acessos: (result[0].acessos || 0) + 1 }).where(eq(linksCompartilhaveis.id, result[0].id));
      return result[0];
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]),
      itemId: z.number(),
      editavel: z.boolean().default(false),
      expiracaoHoras: z.number().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const token = nanoid(32);
      const result = await db.insert(linksCompartilhaveis).values({
        condominioId: input.condominioId,
        tipo: input.tipo,
        itemId: input.itemId,
        token,
        editavel: input.editavel,
        expiracaoHoras: input.expiracaoHoras || 168,
        criadoPorId: ctx.user.id,
        criadoPorNome: ctx.user.name || "UsuÃ¡rio"
      });
      return { id: result[0].insertId, token };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      editavel: z.boolean().optional(),
      expiracaoHoras: z.number().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(linksCompartilhaveis).set(data).where(eq(linksCompartilhaveis.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(linksCompartilhaveis).set({ ativo: false }).where(eq(linksCompartilhaveis.id, input.id));
      return { success: true };
    }),
    compartilhar: protectedProcedure.input(z.object({
      linkId: z.number(),
      membroId: z.number().optional(),
      membroNome: z.string().optional(),
      membroWhatsapp: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let nome = input.membroNome;
      let whatsapp = input.membroWhatsapp;
      if (input.membroId) {
        const membro = await db.select().from(membrosEquipe).where(eq(membrosEquipe.id, input.membroId)).limit(1);
        if (membro[0]) {
          nome = membro[0].nome;
          whatsapp = membro[0].whatsapp;
        }
      }
      await db.insert(historicoCompartilhamentos).values({
        linkId: input.linkId,
        membroId: input.membroId || null,
        membroNome: nome || null,
        membroWhatsapp: whatsapp || null,
        compartilhadoPorId: ctx.user.id,
        compartilhadoPorNome: ctx.user.name || "UsuÃ¡rio"
      });
      const link = await db.select().from(linksCompartilhaveis).where(eq(linksCompartilhaveis.id, input.linkId)).limit(1);
      return {
        success: true,
        whatsapp,
        token: link[0]?.token
      };
    }),
    historicoCompartilhamentos: protectedProcedure.input(z.object({ linkId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(historicoCompartilhamentos).where(eq(historicoCompartilhamentos.linkId, input.linkId)).orderBy(desc(historicoCompartilhamentos.createdAt));
    })
  }),
  // ==================== ACESSO PÃBLICO A ITENS COMPARTILHADOS ====================
  itemCompartilhado: router({
    getVistoria: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const link = await db.select().from(linksCompartilhaveis).where(and(
        eq(linksCompartilhaveis.token, input.token),
        eq(linksCompartilhaveis.tipo, "vistoria"),
        eq(linksCompartilhaveis.ativo, true)
      )).limit(1);
      if (!link[0]) return null;
      const vistoria = await db.select().from(vistorias).where(eq(vistorias.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, link[0].itemId));
      const timeline = await db.select().from(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, link[0].itemId)).orderBy(desc(vistoriaTimeline.createdAt));
      return {
        item: vistoria[0] || null,
        imagens,
        timeline,
        editavel: link[0].editavel
      };
    }),
    getManutencao: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const link = await db.select().from(linksCompartilhaveis).where(and(
        eq(linksCompartilhaveis.token, input.token),
        eq(linksCompartilhaveis.tipo, "manutencao"),
        eq(linksCompartilhaveis.ativo, true)
      )).limit(1);
      if (!link[0]) return null;
      const manutencao = await db.select().from(manutencoes).where(eq(manutencoes.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, link[0].itemId));
      const timeline = await db.select().from(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, link[0].itemId)).orderBy(desc(manutencaoTimeline.createdAt));
      return {
        item: manutencao[0] || null,
        imagens,
        timeline,
        editavel: link[0].editavel
      };
    }),
    getOcorrencia: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const link = await db.select().from(linksCompartilhaveis).where(and(
        eq(linksCompartilhaveis.token, input.token),
        eq(linksCompartilhaveis.tipo, "ocorrencia"),
        eq(linksCompartilhaveis.ativo, true)
      )).limit(1);
      if (!link[0]) return null;
      const ocorrencia = await db.select().from(ocorrencias).where(eq(ocorrencias.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, link[0].itemId));
      const timeline = await db.select().from(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, link[0].itemId)).orderBy(desc(ocorrenciaTimeline.createdAt));
      return {
        item: ocorrencia[0] || null,
        imagens,
        timeline,
        editavel: link[0].editavel
      };
    }),
    getChecklist: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const link = await db.select().from(linksCompartilhaveis).where(and(
        eq(linksCompartilhaveis.token, input.token),
        eq(linksCompartilhaveis.tipo, "checklist"),
        eq(linksCompartilhaveis.ativo, true)
      )).limit(1);
      if (!link[0]) return null;
      const checklist = await db.select().from(checklists).where(eq(checklists.id, link[0].itemId)).limit(1);
      const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, link[0].itemId));
      const imagens = await db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, link[0].itemId));
      const timeline = await db.select().from(checklistTimeline).where(eq(checklistTimeline.checklistId, link[0].itemId)).orderBy(desc(checklistTimeline.createdAt));
      return {
        item: checklist[0] || null,
        itens,
        imagens,
        timeline,
        editavel: link[0].editavel
      };
    })
  }),
  // ==================== COMENTÃRIOS EM ITENS PARTILHADOS ====================
  comentario: router({
    list: publicProcedure.input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"])
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const comentarios = await db.select().from(comentariosItem).where(and(
        eq(comentariosItem.itemId, input.itemId),
        eq(comentariosItem.itemTipo, input.itemTipo)
      )).orderBy(desc(comentariosItem.createdAt));
      const comentariosComAnexos = await Promise.all(
        comentarios.map(async (comentario) => {
          const anexos = await db.select().from(anexosComentario).where(eq(anexosComentario.comentarioId, comentario.id));
          const respostas = await db.select().from(respostasComentario).where(eq(respostasComentario.comentarioId, comentario.id)).orderBy(respostasComentario.createdAt);
          return { ...comentario, anexos, respostas };
        })
      );
      return comentariosComAnexos;
    }),
    create: publicProcedure.input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]),
      condominioId: z.number(),
      autorNome: z.string().min(1),
      autorWhatsapp: z.string().optional(),
      autorEmail: z.string().optional(),
      autorFoto: z.string().optional(),
      texto: z.string().min(1),
      isInterno: z.boolean().optional(),
      anexos: z.array(z.object({
        url: z.string(),
        nome: z.string(),
        tipo: z.string(),
        tamanho: z.number().optional()
      })).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(comentariosItem).values({
        itemId: input.itemId,
        itemTipo: input.itemTipo,
        condominioId: input.condominioId,
        autorNome: input.autorNome,
        autorWhatsapp: input.autorWhatsapp || null,
        autorEmail: input.autorEmail || null,
        autorFoto: input.autorFoto || null,
        texto: input.texto,
        isInterno: input.isInterno || false
      });
      const comentarioId = result[0].insertId;
      if (input.anexos && input.anexos.length > 0) {
        await Promise.all(
          input.anexos.map(
            (anexo) => db.insert(anexosComentario).values({
              comentarioId,
              url: anexo.url,
              nome: anexo.nome,
              tipo: anexo.tipo,
              tamanho: anexo.tamanho || null
            })
          )
        );
      }
      return { id: comentarioId };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(anexosComentario).where(eq(anexosComentario.comentarioId, input.id));
      await db.delete(respostasComentario).where(eq(respostasComentario.comentarioId, input.id));
      await db.delete(comentariosItem).where(eq(comentariosItem.id, input.id));
      return { success: true };
    }),
    marcarLido: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(comentariosItem).set({
        lido: true,
        lidoPorId: ctx.user.id,
        lidoEm: /* @__PURE__ */ new Date()
      }).where(eq(comentariosItem.id, input.id));
      return { success: true };
    }),
    responder: publicProcedure.input(z.object({
      comentarioId: z.number(),
      autorNome: z.string().min(1),
      autorFoto: z.string().optional(),
      texto: z.string().min(1)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(respostasComentario).values({
        comentarioId: input.comentarioId,
        autorNome: input.autorNome,
        autorFoto: input.autorFoto || null,
        texto: input.texto
      });
      return { id: result[0].insertId };
    }),
    // Contar comentÃ¡rios nÃ£o lidos por item
    contarNaoLidos: protectedProcedure.input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"])
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.select({ count: sql`count(*)` }).from(comentariosItem).where(and(
        eq(comentariosItem.itemId, input.itemId),
        eq(comentariosItem.itemTipo, input.itemTipo),
        eq(comentariosItem.lido, false)
      ));
      return result[0]?.count || 0;
    }),
    // Listar todos os comentÃ¡rios nÃ£o lidos do condomÃ­nio
    listNaoLidos: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(comentariosItem).where(and(
        eq(comentariosItem.condominioId, input.condominioId),
        eq(comentariosItem.lido, false)
      )).orderBy(desc(comentariosItem.createdAt));
    })
  }),
  // ==================== DESTAQUES ====================
  destaque: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const destaquesData = await db.select().from(destaques).where(eq(destaques.condominioId, input.condominioId)).orderBy(destaques.ordem);
      const destaquesComImagens = await Promise.all(
        destaquesData.map(async (destaque) => {
          const imagens = await db.select().from(imagensDestaques).where(eq(imagensDestaques.destaqueId, destaque.id)).orderBy(imagensDestaques.ordem);
          return { ...destaque, imagens };
        })
      );
      return destaquesComImagens;
    }),
    listAtivos: publicProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const destaquesData = await db.select().from(destaques).where(and(
        eq(destaques.condominioId, input.condominioId),
        eq(destaques.ativo, true)
      )).orderBy(destaques.ordem);
      const destaquesComImagens = await Promise.all(
        destaquesData.map(async (destaque) => {
          const imagens = await db.select().from(imagensDestaques).where(eq(imagensDestaques.destaqueId, destaque.id)).orderBy(imagensDestaques.ordem);
          return { ...destaque, imagens };
        })
      );
      return destaquesComImagens;
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(destaques).where(eq(destaques.id, input.id)).limit(1);
      if (!result[0]) return null;
      const imagens = await db.select().from(imagensDestaques).where(eq(imagensDestaques.destaqueId, input.id)).orderBy(imagensDestaques.ordem);
      return { ...result[0], imagens };
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      link: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      videoUrl: z.string().optional(),
      ordem: z.number().optional(),
      ativo: z.boolean().optional(),
      imagens: z.array(z.object({
        url: z.string(),
        legenda: z.string().optional(),
        ordem: z.number().optional()
      })).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { imagens, ...destaqueData } = input;
      const result = await db.insert(destaques).values({
        condominioId: destaqueData.condominioId,
        titulo: destaqueData.titulo,
        subtitulo: destaqueData.subtitulo || null,
        descricao: destaqueData.descricao || null,
        link: destaqueData.link || null,
        arquivoUrl: destaqueData.arquivoUrl || null,
        arquivoNome: destaqueData.arquivoNome || null,
        videoUrl: destaqueData.videoUrl || null,
        ordem: destaqueData.ordem || 0,
        ativo: destaqueData.ativo !== void 0 ? destaqueData.ativo : true
      });
      const destaqueId = Number(result[0].insertId);
      if (imagens && imagens.length > 0) {
        await db.insert(imagensDestaques).values(
          imagens.map((img, index) => ({
            destaqueId,
            url: img.url,
            legenda: img.legenda || null,
            ordem: img.ordem !== void 0 ? img.ordem : index
          }))
        );
      }
      return { id: destaqueId };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      link: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      videoUrl: z.string().optional(),
      ordem: z.number().optional(),
      ativo: z.boolean().optional(),
      imagens: z.array(z.object({
        url: z.string(),
        legenda: z.string().optional(),
        ordem: z.number().optional()
      })).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, imagens, ...updateData } = input;
      const fieldsToUpdate = {};
      if (updateData.titulo !== void 0) fieldsToUpdate.titulo = updateData.titulo;
      if (updateData.subtitulo !== void 0) fieldsToUpdate.subtitulo = updateData.subtitulo || null;
      if (updateData.descricao !== void 0) fieldsToUpdate.descricao = updateData.descricao || null;
      if (updateData.link !== void 0) fieldsToUpdate.link = updateData.link || null;
      if (updateData.arquivoUrl !== void 0) fieldsToUpdate.arquivoUrl = updateData.arquivoUrl || null;
      if (updateData.arquivoNome !== void 0) fieldsToUpdate.arquivoNome = updateData.arquivoNome || null;
      if (updateData.videoUrl !== void 0) fieldsToUpdate.videoUrl = updateData.videoUrl || null;
      if (updateData.ordem !== void 0) fieldsToUpdate.ordem = updateData.ordem;
      if (updateData.ativo !== void 0) fieldsToUpdate.ativo = updateData.ativo;
      if (Object.keys(fieldsToUpdate).length > 0) {
        await db.update(destaques).set(fieldsToUpdate).where(eq(destaques.id, id));
      }
      if (imagens !== void 0) {
        await db.delete(imagensDestaques).where(eq(imagensDestaques.destaqueId, id));
        if (imagens.length > 0) {
          await db.insert(imagensDestaques).values(
            imagens.map((img, index) => ({
              destaqueId: id,
              url: img.url,
              legenda: img.legenda || null,
              ordem: img.ordem !== void 0 ? img.ordem : index
            }))
          );
        }
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensDestaques).where(eq(imagensDestaques.destaqueId, input.id));
      await db.delete(destaques).where(eq(destaques.id, input.id));
      return { success: true };
    }),
    // Reordenar destaques
    reorder: protectedProcedure.input(z.object({
      items: z.array(z.object({
        id: z.number(),
        ordem: z.number()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (const item of input.items) {
        await db.update(destaques).set({ ordem: item.ordem }).where(eq(destaques.id, item.id));
      }
      return { success: true };
    }),
    // Toggle ativo
    toggleAtivo: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const current = await db.select().from(destaques).where(eq(destaques.id, input.id)).limit(1);
      if (!current[0]) throw new Error("Destaque nÃ£o encontrado");
      await db.update(destaques).set({ ativo: !current[0].ativo }).where(eq(destaques.id, input.id));
      return { success: true, ativo: !current[0].ativo };
    })
  }),
  // ==================== PÃGINAS 100% PERSONALIZADAS ====================
  paginaCustom: router({
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(paginasCustom).where(eq(paginasCustom.condominioId, input.condominioId)).orderBy(paginasCustom.ordem, desc(paginasCustom.createdAt));
    }),
    listAtivos: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(paginasCustom).where(and(
        eq(paginasCustom.condominioId, input.condominioId),
        eq(paginasCustom.ativo, true)
      )).orderBy(paginasCustom.ordem, desc(paginasCustom.createdAt));
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(paginasCustom).where(eq(paginasCustom.id, input.id)).limit(1);
      return result[0] || null;
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      link: z.string().optional(),
      videoUrl: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      imagens: z.array(z.object({ url: z.string(), legenda: z.string().optional() })).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(paginasCustom).values({
        condominioId: input.condominioId,
        titulo: input.titulo,
        subtitulo: input.subtitulo || null,
        descricao: input.descricao || null,
        link: input.link || null,
        videoUrl: input.videoUrl || null,
        arquivoUrl: input.arquivoUrl || null,
        arquivoNome: input.arquivoNome || null,
        imagens: input.imagens || []
      });
      return { id: Number(result.insertId) };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      subtitulo: z.string().optional(),
      descricao: z.string().optional(),
      link: z.string().optional(),
      videoUrl: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      imagens: z.array(z.object({ url: z.string(), legenda: z.string().optional() })).optional(),
      ativo: z.boolean().optional(),
      ordem: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(paginasCustom).set(data).where(eq(paginasCustom.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensCustom).where(eq(imagensCustom.paginaId, input.id));
      await db.delete(paginasCustom).where(eq(paginasCustom.id, input.id));
      return { success: true };
    }),
    toggleAtivo: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const current = await db.select().from(paginasCustom).where(eq(paginasCustom.id, input.id)).limit(1);
      if (!current[0]) throw new Error("PÃ¡gina nÃ£o encontrada");
      await db.update(paginasCustom).set({ ativo: !current[0].ativo }).where(eq(paginasCustom.id, input.id));
      return { success: true, ativo: !current[0].ativo };
    }),
    // Upload de imagem para galeria
    addImagem: protectedProcedure.input(z.object({
      paginaId: z.number(),
      url: z.string(),
      legenda: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const maxOrdem = await db.select({ max: sql`MAX(ordem)` }).from(imagensCustom).where(eq(imagensCustom.paginaId, input.paginaId));
      const ordem = (maxOrdem[0]?.max || 0) + 1;
      const result = await db.insert(imagensCustom).values({
        paginaId: input.paginaId,
        url: input.url,
        legenda: input.legenda || null,
        ordem
      });
      return { id: Number(result.insertId) };
    }),
    // Remover imagem da galeria
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(imagensCustom).where(eq(imagensCustom.id, input.id));
      return { success: true };
    }),
    // Listar imagens de uma pÃ¡gina
    listImagens: protectedProcedure.input(z.object({ paginaId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imagensCustom).where(eq(imagensCustom.paginaId, input.paginaId)).orderBy(imagensCustom.ordem);
    })
  }),
  // ==================== AGENDA DE VENCIMENTOS ====================
  vencimentos: router({
    // Listar vencimentos por tipo
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["contrato", "servico", "manutencao"])
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vencimentos).where(and(
        eq(vencimentos.condominioId, input.condominioId),
        eq(vencimentos.tipo, input.tipo)
      )).orderBy(vencimentos.dataVencimento);
      const hoje = /* @__PURE__ */ new Date();
      return items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diffTime = dataVenc.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        return {
          ...item,
          diasRestantes: diffDays,
          vencido: diffDays < 0
        };
      });
    }),
    // Obter um vencimento por ID com alertas
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(vencimentos).where(eq(vencimentos.id, input.id)).limit(1);
      if (!result[0]) return null;
      const alertas = await db.select().from(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, input.id));
      const hoje = /* @__PURE__ */ new Date();
      const dataVenc = new Date(result[0].dataVencimento);
      const diffTime = dataVenc.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      return {
        ...result[0],
        alertas,
        diasRestantes: diffDays,
        vencido: diffDays < 0
      };
    }),
    // Criar vencimento
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["contrato", "servico", "manutencao"]),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      fornecedor: z.string().optional(),
      valor: z.string().optional(),
      dataInicio: z.string().optional(),
      dataVencimento: z.string(),
      ultimaRealizacao: z.string().optional(),
      proximaRealizacao: z.string().optional(),
      periodicidade: z.enum(["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"]).optional(),
      observacoes: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      alertas: z.array(z.enum(["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"])).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { alertas, ...vencimentoData } = input;
      const result = await db.insert(vencimentos).values({
        condominioId: vencimentoData.condominioId,
        tipo: vencimentoData.tipo,
        titulo: vencimentoData.titulo,
        descricao: vencimentoData.descricao || null,
        fornecedor: vencimentoData.fornecedor || null,
        valor: vencimentoData.valor || null,
        dataInicio: vencimentoData.dataInicio ? new Date(vencimentoData.dataInicio) : null,
        dataVencimento: new Date(vencimentoData.dataVencimento),
        ultimaRealizacao: vencimentoData.ultimaRealizacao ? new Date(vencimentoData.ultimaRealizacao) : null,
        proximaRealizacao: vencimentoData.proximaRealizacao ? new Date(vencimentoData.proximaRealizacao) : null,
        periodicidade: vencimentoData.periodicidade || "unico",
        observacoes: vencimentoData.observacoes || null,
        arquivoUrl: vencimentoData.arquivoUrl || null,
        arquivoNome: vencimentoData.arquivoNome || null,
        status: "ativo"
      });
      const vencimentoId = Number(result[0].insertId);
      if (alertas && alertas.length > 0) {
        await db.insert(vencimentoAlertas).values(
          alertas.map((tipoAlerta) => ({
            vencimentoId,
            tipoAlerta,
            ativo: true,
            enviado: false
          }))
        );
      }
      return { id: vencimentoId };
    }),
    // Atualizar vencimento
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      fornecedor: z.string().optional(),
      valor: z.string().optional(),
      dataInicio: z.string().optional(),
      dataVencimento: z.string().optional(),
      ultimaRealizacao: z.string().optional(),
      proximaRealizacao: z.string().optional(),
      periodicidade: z.enum(["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"]).optional(),
      status: z.enum(["ativo", "vencido", "renovado", "cancelado"]).optional(),
      observacoes: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoNome: z.string().optional(),
      alertas: z.array(z.enum(["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"])).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, alertas, ...updateData } = input;
      const fieldsToUpdate = {};
      if (updateData.titulo !== void 0) fieldsToUpdate.titulo = updateData.titulo;
      if (updateData.descricao !== void 0) fieldsToUpdate.descricao = updateData.descricao || null;
      if (updateData.fornecedor !== void 0) fieldsToUpdate.fornecedor = updateData.fornecedor || null;
      if (updateData.valor !== void 0) fieldsToUpdate.valor = updateData.valor || null;
      if (updateData.dataInicio !== void 0) fieldsToUpdate.dataInicio = updateData.dataInicio ? new Date(updateData.dataInicio) : null;
      if (updateData.dataVencimento !== void 0) fieldsToUpdate.dataVencimento = new Date(updateData.dataVencimento);
      if (updateData.ultimaRealizacao !== void 0) fieldsToUpdate.ultimaRealizacao = updateData.ultimaRealizacao ? new Date(updateData.ultimaRealizacao) : null;
      if (updateData.proximaRealizacao !== void 0) fieldsToUpdate.proximaRealizacao = updateData.proximaRealizacao ? new Date(updateData.proximaRealizacao) : null;
      if (updateData.periodicidade !== void 0) fieldsToUpdate.periodicidade = updateData.periodicidade;
      if (updateData.status !== void 0) fieldsToUpdate.status = updateData.status;
      if (updateData.observacoes !== void 0) fieldsToUpdate.observacoes = updateData.observacoes || null;
      if (updateData.arquivoUrl !== void 0) fieldsToUpdate.arquivoUrl = updateData.arquivoUrl || null;
      if (updateData.arquivoNome !== void 0) fieldsToUpdate.arquivoNome = updateData.arquivoNome || null;
      if (Object.keys(fieldsToUpdate).length > 0) {
        await db.update(vencimentos).set(fieldsToUpdate).where(eq(vencimentos.id, id));
      }
      if (alertas !== void 0) {
        await db.delete(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, id));
        if (alertas.length > 0) {
          await db.insert(vencimentoAlertas).values(
            alertas.map((tipoAlerta) => ({
              vencimentoId: id,
              tipoAlerta,
              ativo: true,
              enviado: false
            }))
          );
        }
      }
      return { success: true };
    }),
    // Excluir vencimento
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, input.id));
      await db.delete(vencimentoNotificacoes).where(eq(vencimentoNotificacoes.vencimentoId, input.id));
      await db.delete(vencimentos).where(eq(vencimentos.id, input.id));
      return { success: true };
    }),
    // Obter estatÃ­sticas de vencimentos
    stats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, proximos: 0, vencidos: 0, contratos: 0, servicos: 0, manutencoes: 0 };
      const hoje = /* @__PURE__ */ new Date();
      const em30dias = /* @__PURE__ */ new Date();
      em30dias.setDate(em30dias.getDate() + 30);
      const todos = await db.select().from(vencimentos).where(and(
        eq(vencimentos.condominioId, input.condominioId),
        eq(vencimentos.status, "ativo")
      ));
      const vencidos = todos.filter((v) => new Date(v.dataVencimento) < hoje);
      const proximos = todos.filter((v) => {
        const data = new Date(v.dataVencimento);
        return data >= hoje && data <= em30dias;
      });
      return {
        total: todos.length,
        proximos: proximos.length,
        vencidos: vencidos.length,
        contratos: todos.filter((v) => v.tipo === "contrato").length,
        servicos: todos.filter((v) => v.tipo === "servico").length,
        manutencoes: todos.filter((v) => v.tipo === "manutencao").length
      };
    }),
    // Listar prÃ³ximos vencimentos (para card na visÃ£o geral)
    proximos: protectedProcedure.input(z.object({
      condominioId: z.number(),
      dias: z.number().optional().default(30),
      limite: z.number().optional().default(5)
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const hoje = /* @__PURE__ */ new Date();
      const limite = /* @__PURE__ */ new Date();
      limite.setDate(limite.getDate() + input.dias);
      const items = await db.select().from(vencimentos).where(and(
        eq(vencimentos.condominioId, input.condominioId),
        eq(vencimentos.status, "ativo")
      )).orderBy(vencimentos.dataVencimento);
      return items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diffTime = dataVenc.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        return { ...item, diasRestantes: diffDays, vencido: diffDays < 0 };
      }).filter((item) => item.diasRestantes <= input.dias).slice(0, input.limite);
    })
  }),
  // ==================== E-MAILS DE VENCIMENTOS ====================
  vencimentoEmails: router({
    // Listar e-mails do condomÃ­nio
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vencimentoEmails).where(eq(vencimentoEmails.condominioId, input.condominioId));
    }),
    // Adicionar e-mail
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      email: z.string().email(),
      nome: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(vencimentoEmails).values({
        condominioId: input.condominioId,
        email: input.email,
        nome: input.nome || null,
        ativo: true
      });
      return { id: Number(result[0].insertId) };
    }),
    // Atualizar e-mail
    update: protectedProcedure.input(z.object({
      id: z.number(),
      email: z.string().email().optional(),
      nome: z.string().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      const fieldsToUpdate = {};
      if (updateData.email !== void 0) fieldsToUpdate.email = updateData.email;
      if (updateData.nome !== void 0) fieldsToUpdate.nome = updateData.nome || null;
      if (updateData.ativo !== void 0) fieldsToUpdate.ativo = updateData.ativo;
      if (Object.keys(fieldsToUpdate).length > 0) {
        await db.update(vencimentoEmails).set(fieldsToUpdate).where(eq(vencimentoEmails.id, id));
      }
      return { success: true };
    }),
    // Excluir e-mail
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(vencimentoEmails).where(eq(vencimentoEmails.id, input.id));
      return { success: true };
    })
  }),
  // ==================== NOTIFICAÃÃES DE VENCIMENTOS ====================
  vencimentoNotificacoes: router({
    // Listar notificaÃ§Ãµes de um vencimento
    list: protectedProcedure.input(z.object({ vencimentoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(vencimentoNotificacoes).where(eq(vencimentoNotificacoes.vencimentoId, input.vencimentoId)).orderBy(desc(vencimentoNotificacoes.createdAt));
    }),
    // Enviar notificaÃ§Ã£o manual
    enviar: protectedProcedure.input(z.object({
      vencimentoId: z.number(),
      condominioId: z.number()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const venc = await db.select().from(vencimentos).where(eq(vencimentos.id, input.vencimentoId)).limit(1);
      if (!venc[0]) throw new Error("Vencimento nÃ£o encontrado");
      const emails = await db.select().from(vencimentoEmails).where(and(
        eq(vencimentoEmails.condominioId, input.condominioId),
        eq(vencimentoEmails.ativo, true)
      ));
      if (emails.length === 0) {
        throw new Error("Nenhum e-mail configurado para notificaÃ§Ãµes");
      }
      const dataVenc = new Date(venc[0].dataVencimento);
      const hoje = /* @__PURE__ */ new Date();
      const diffTime = dataVenc.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      const tipoLabel = venc[0].tipo === "contrato" ? "Contrato" : venc[0].tipo === "servico" ? "ServiÃ§o" : "ManutenÃ§Ã£o";
      const statusLabel = diffDays < 0 ? `VENCIDO hÃ¡ ${Math.abs(diffDays)} dias` : diffDays === 0 ? "VENCE HOJE" : `vence em ${diffDays} dias`;
      const assunto = `[Alerta] ${tipoLabel}: ${venc[0].titulo} - ${statusLabel}`;
      const conteudo = `
OlÃ¡,

Este Ã© um alerta automÃ¡tico sobre o seguinte vencimento:

TÃ­tulo: ${venc[0].titulo}
Tipo: ${tipoLabel}
Data de Vencimento: ${dataVenc.toLocaleDateString("pt-BR")}
Status: ${statusLabel}
${venc[0].fornecedor ? `Fornecedor: ${venc[0].fornecedor}` : ""}
${venc[0].valor ? `Valor: R$ ${venc[0].valor}` : ""}
${venc[0].descricao ? `
DescriÃ§Ã£o: ${venc[0].descricao}` : ""}
${venc[0].observacoes ? `
ObservaÃ§Ãµes: ${venc[0].observacoes}` : ""}

Atenciosamente,
Sistema de GestÃ£o do CondomÃ­nio
        `.trim();
      const notificacoes2 = emails.map((email) => ({
        vencimentoId: input.vencimentoId,
        emailDestinatario: email.email,
        assunto,
        conteudo,
        status: "enviado"
      }));
      await db.insert(vencimentoNotificacoes).values(notificacoes2);
      return { success: true, enviados: emails.length };
    })
  }),
  // ==================== DISPARO AUTOMÃTICO DE E-MAILS ====================
  alertasAutomaticos: router({
    // Verificar e enviar alertas pendentes
    processarAlertas: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const hoje = /* @__PURE__ */ new Date();
      hoje.setHours(0, 0, 0, 0);
      const alertas = await db.select({
        alerta: vencimentoAlertas,
        vencimento: vencimentos
      }).from(vencimentoAlertas).innerJoin(vencimentos, eq(vencimentoAlertas.vencimentoId, vencimentos.id)).where(and(
        eq(vencimentoAlertas.ativo, true),
        eq(vencimentoAlertas.enviado, false),
        eq(vencimentos.status, "ativo"),
        eq(vencimentos.condominioId, input.condominioId)
      ));
      const diasAntecedencia = {
        "na_data": 0,
        "um_dia_antes": 1,
        "uma_semana_antes": 7,
        "quinze_dias_antes": 15,
        "um_mes_antes": 30
      };
      const alertasParaEnviar = alertas.filter(({ alerta, vencimento }) => {
        const dataVencimento = new Date(vencimento.dataVencimento);
        dataVencimento.setHours(0, 0, 0, 0);
        const diasAntes = diasAntecedencia[alerta.tipoAlerta] || 0;
        const dataAlerta = new Date(dataVencimento);
        dataAlerta.setDate(dataAlerta.getDate() - diasAntes);
        return dataAlerta <= hoje;
      });
      if (alertasParaEnviar.length === 0) {
        return { enviados: 0, mensagem: "Nenhum alerta pendente para enviar" };
      }
      const emails = await db.select().from(vencimentoEmails).where(and(
        eq(vencimentoEmails.condominioId, input.condominioId),
        eq(vencimentoEmails.ativo, true)
      ));
      if (emails.length === 0) {
        return { enviados: 0, mensagem: "Nenhum e-mail configurado para notificaÃ§Ãµes" };
      }
      let enviados = 0;
      for (const { alerta, vencimento } of alertasParaEnviar) {
        const dataVenc = new Date(vencimento.dataVencimento);
        const diffTime = dataVenc.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        const tipoLabel = vencimento.tipo === "contrato" ? "Contrato" : vencimento.tipo === "servico" ? "ServiÃ§o" : "ManutenÃ§Ã£o";
        const alertaLabel = {
          "na_data": "VENCE HOJE",
          "um_dia_antes": "Vence amanhÃ£",
          "uma_semana_antes": "Vence em 1 semana",
          "quinze_dias_antes": "Vence em 15 dias",
          "um_mes_antes": "Vence em 1 mÃªs"
        };
        const statusLabel = diffDays < 0 ? `VENCIDO hÃ¡ ${Math.abs(diffDays)} dias` : alertaLabel[alerta.tipoAlerta] || `vence em ${diffDays} dias`;
        const assunto = `[â ï¸ Alerta de Vencimento] ${tipoLabel}: ${vencimento.titulo} - ${statusLabel}`;
        const conteudo = `
OlÃ¡,

Este Ã© um alerta automÃ¡tico sobre o seguinte vencimento:

ð TÃ­tulo: ${vencimento.titulo}
ð Tipo: ${tipoLabel}
ð Data de Vencimento: ${dataVenc.toLocaleDateString("pt-BR")}
â° Status: ${statusLabel}
${vencimento.fornecedor ? `ð¢ Fornecedor: ${vencimento.fornecedor}` : ""}
${vencimento.valor ? `ð° Valor: R$ ${vencimento.valor}` : ""}
${vencimento.descricao ? `
ð DescriÃ§Ã£o: ${vencimento.descricao}` : ""}
${vencimento.observacoes ? `
ð¬ ObservaÃ§Ãµes: ${vencimento.observacoes}` : ""}

---
Este e-mail foi enviado automaticamente pelo Sistema de GestÃ£o do CondomÃ­nio.
Para gerenciar suas notificaÃ§Ãµes, acesse a Agenda de Vencimentos no painel.
          `.trim();
        for (const email of emails) {
          await db.insert(vencimentoNotificacoes).values({
            vencimentoId: vencimento.id,
            alertaId: alerta.id,
            emailDestinatario: email.email,
            assunto,
            conteudo,
            status: "enviado"
          });
        }
        await db.update(vencimentoAlertas).set({ enviado: true, dataEnvio: /* @__PURE__ */ new Date() }).where(eq(vencimentoAlertas.id, alerta.id));
        enviados++;
      }
      return {
        enviados,
        totalDestinatarios: emails.length,
        mensagem: `${enviados} alerta(s) processado(s) para ${emails.length} destinatÃ¡rio(s)`
      };
    }),
    // Verificar alertas pendentes (sem enviar)
    verificarPendentes: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { pendentes: 0, alertas: [] };
      const hoje = /* @__PURE__ */ new Date();
      hoje.setHours(0, 0, 0, 0);
      const alertas = await db.select({
        alerta: vencimentoAlertas,
        vencimento: vencimentos
      }).from(vencimentoAlertas).innerJoin(vencimentos, eq(vencimentoAlertas.vencimentoId, vencimentos.id)).where(and(
        eq(vencimentoAlertas.ativo, true),
        eq(vencimentoAlertas.enviado, false),
        eq(vencimentos.status, "ativo"),
        eq(vencimentos.condominioId, input.condominioId)
      ));
      const diasAntecedencia = {
        "na_data": 0,
        "um_dia_antes": 1,
        "uma_semana_antes": 7,
        "quinze_dias_antes": 15,
        "um_mes_antes": 30
      };
      const alertasPendentes = alertas.filter(({ alerta, vencimento }) => {
        const dataVencimento = new Date(vencimento.dataVencimento);
        dataVencimento.setHours(0, 0, 0, 0);
        const diasAntes = diasAntecedencia[alerta.tipoAlerta] || 0;
        const dataAlerta = new Date(dataVencimento);
        dataAlerta.setDate(dataAlerta.getDate() - diasAntes);
        return dataAlerta <= hoje;
      });
      return {
        pendentes: alertasPendentes.length,
        alertas: alertasPendentes.map(({ alerta, vencimento }) => ({
          alertaId: alerta.id,
          vencimentoId: vencimento.id,
          titulo: vencimento.titulo,
          tipo: vencimento.tipo,
          tipoAlerta: alerta.tipoAlerta,
          dataVencimento: vencimento.dataVencimento
        }))
      };
    }),
    // HistÃ³rico de notificaÃ§Ãµes enviadas
    historico: protectedProcedure.input(z.object({
      condominioId: z.number(),
      limite: z.number().optional().default(50)
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const notifs = await db.select({
        notificacao: vencimentoNotificacoes,
        vencimento: vencimentos
      }).from(vencimentoNotificacoes).innerJoin(vencimentos, eq(vencimentoNotificacoes.vencimentoId, vencimentos.id)).where(eq(vencimentos.condominioId, input.condominioId)).orderBy(desc(vencimentoNotificacoes.createdAt)).limit(input.limite);
      return notifs.map(({ notificacao, vencimento }) => ({
        ...notificacao,
        vencimentoTitulo: vencimento.titulo,
        vencimentoTipo: vencimento.tipo
      }));
    })
  }),
  // ==================== RELATÃRIO DE VENCIMENTOS EM PDF ====================
  vencimentosRelatorio: router({
    // Gerar relatÃ³rio em PDF
    gerarPDF: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["todos", "contrato", "servico", "manutencao"]).optional().default("todos"),
      status: z.enum(["todos", "ativo", "vencido", "renovado", "cancelado"]).optional().default("todos"),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const cond = await db.select().from(condominios).where(eq(condominios.id, input.condominioId)).limit(1);
      if (!cond[0]) throw new Error("CondomÃ­nio nÃ£o encontrado");
      const conditions = [eq(vencimentos.condominioId, input.condominioId)];
      if (input.tipo !== "todos") {
        conditions.push(eq(vencimentos.tipo, input.tipo));
      }
      if (input.status !== "todos") {
        conditions.push(eq(vencimentos.status, input.status));
      }
      if (input.dataInicio) {
        conditions.push(gte(vencimentos.dataVencimento, new Date(input.dataInicio)));
      }
      if (input.dataFim) {
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        conditions.push(sql`${vencimentos.dataVencimento} <= ${dataFim}`);
      }
      const items = await db.select().from(vencimentos).where(and(...conditions)).orderBy(vencimentos.dataVencimento);
      const hoje = /* @__PURE__ */ new Date();
      const stats = {
        total: items.length,
        vencidos: items.filter((v) => new Date(v.dataVencimento) < hoje && v.status === "ativo").length,
        proximos30dias: items.filter((v) => {
          const data = new Date(v.dataVencimento);
          const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1e3 * 60 * 60 * 24));
          return diff >= 0 && diff <= 30 && v.status === "ativo";
        }).length,
        contratos: items.filter((v) => v.tipo === "contrato").length,
        servicos: items.filter((v) => v.tipo === "servico").length,
        manutencoes: items.filter((v) => v.tipo === "manutencao").length
      };
      const tipoLabel = input.tipo === "todos" ? "Todos os Tipos" : input.tipo === "contrato" ? "Contratos" : input.tipo === "servico" ? "ServiÃ§os" : "ManutenÃ§Ãµes";
      const statusLabel = input.status === "todos" ? "Todos os Status" : input.status === "ativo" ? "Ativos" : input.status === "vencido" ? "Vencidos" : input.status === "renovado" ? "Renovados" : "Cancelados";
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>RelatÃ³rio de Vencimentos - ${cond[0].nome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #333; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 15px; }
    .header h1 { color: #4F46E5; font-size: 24px; margin-bottom: 5px; }
    .header h2 { color: #666; font-size: 14px; font-weight: normal; }
    .header .date { color: #888; font-size: 11px; margin-top: 10px; }
    .filters { background: #f8f9fa; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px; }
    .filters span { margin-right: 20px; }
    .stats { display: flex; justify-content: space-around; margin-bottom: 25px; }
    .stat-box { text-align: center; padding: 15px 20px; background: #f8f9fa; border-radius: 8px; min-width: 100px; }
    .stat-box .number { font-size: 28px; font-weight: bold; color: #4F46E5; }
    .stat-box .label { font-size: 10px; color: #666; text-transform: uppercase; }
    .stat-box.danger .number { color: #dc3545; }
    .stat-box.warning .number { color: #ffc107; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #4F46E5; color: white; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:nth-child(even) { background: #f8f9fa; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; }
    .badge-contrato { background: #e3f2fd; color: #1565c0; }
    .badge-servico { background: #f3e5f5; color: #7b1fa2; }
    .badge-manutencao { background: #fff3e0; color: #e65100; }
    .badge-vencido { background: #ffebee; color: #c62828; }
    .badge-proximo { background: #fff8e1; color: #f57f17; }
    .badge-ok { background: #e8f5e9; color: #2e7d32; }
    .footer { margin-top: 30px; text-align: center; color: #888; font-size: 10px; border-top: 1px solid #eee; padding-top: 15px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>ð RelatÃ³rio de Vencimentos</h1>
    <h2>${cond[0].nome}</h2>
    <div class="date">Gerado em ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")} Ã s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}</div>
  </div>
  
  <div class="filters">
    <span><strong>Tipo:</strong> ${tipoLabel}</span>
    <span><strong>Status:</strong> ${statusLabel}</span>
    ${input.dataInicio ? `<span><strong>De:</strong> ${new Date(input.dataInicio).toLocaleDateString("pt-BR")}</span>` : ""}
    ${input.dataFim ? `<span><strong>AtÃ©:</strong> ${new Date(input.dataFim).toLocaleDateString("pt-BR")}</span>` : ""}
  </div>
  
  <div class="stats">
    <div class="stat-box">
      <div class="number">${stats.total}</div>
      <div class="label">Total</div>
    </div>
    <div class="stat-box danger">
      <div class="number">${stats.vencidos}</div>
      <div class="label">Vencidos</div>
    </div>
    <div class="stat-box warning">
      <div class="number">${stats.proximos30dias}</div>
      <div class="label">PrÃ³x. 30 dias</div>
    </div>
    <div class="stat-box">
      <div class="number">${stats.contratos}</div>
      <div class="label">Contratos</div>
    </div>
    <div class="stat-box">
      <div class="number">${stats.servicos}</div>
      <div class="label">ServiÃ§os</div>
    </div>
    <div class="stat-box">
      <div class="number">${stats.manutencoes}</div>
      <div class="label">ManutenÃ§Ãµes</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>TÃ­tulo</th>
        <th>Fornecedor</th>
        <th>Vencimento</th>
        <th>Dias</th>
        <th>Valor</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diffDays = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1e3 * 60 * 60 * 24));
        const tipoBadge = item.tipo === "contrato" ? "badge-contrato" : item.tipo === "servico" ? "badge-servico" : "badge-manutencao";
        const tipoText = item.tipo === "contrato" ? "Contrato" : item.tipo === "servico" ? "ServiÃ§o" : "ManutenÃ§Ã£o";
        const statusBadge = diffDays < 0 ? "badge-vencido" : diffDays <= 30 ? "badge-proximo" : "badge-ok";
        const diasText = diffDays < 0 ? `${Math.abs(diffDays)} atrasado` : diffDays === 0 ? "Hoje" : `${diffDays} restantes`;
        return `
          <tr>
            <td><span class="badge ${tipoBadge}">${tipoText}</span></td>
            <td><strong>${item.titulo}</strong>${item.descricao ? `<br><small style="color:#666">${item.descricao.substring(0, 50)}${item.descricao.length > 50 ? "..." : ""}</small>` : ""}</td>
            <td>${item.fornecedor || "-"}</td>
            <td>${dataVenc.toLocaleDateString("pt-BR")}</td>
            <td><span class="badge ${statusBadge}">${diasText}</span></td>
            <td>${item.valor ? `R$ ${item.valor}` : "-"}</td>
            <td>${item.status}</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Sistema de GestÃ£o de CondomÃ­nios - Revista Digital</p>
    <p>Este relatÃ³rio foi gerado automaticamente e nÃ£o requer assinatura.</p>
  </div>
</body>
</html>
        `;
      const pdfBuffer = await generateVencimentosPDF(htmlContent);
      const fileName = `relatorio-vencimentos-${input.condominioId}-${Date.now()}.pdf`;
      const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
      return { url, fileName, stats };
    }),
    // Obter dados para o relatÃ³rio (sem gerar PDF)
    dados: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["todos", "contrato", "servico", "manutencao"]).optional().default("todos"),
      status: z.enum(["todos", "ativo", "vencido", "renovado", "cancelado"]).optional().default("todos")
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], stats: { total: 0, vencidos: 0, proximos30dias: 0 } };
      const conditions = [eq(vencimentos.condominioId, input.condominioId)];
      if (input.tipo !== "todos") {
        conditions.push(eq(vencimentos.tipo, input.tipo));
      }
      if (input.status !== "todos") {
        conditions.push(eq(vencimentos.status, input.status));
      }
      const items = await db.select().from(vencimentos).where(and(...conditions)).orderBy(vencimentos.dataVencimento);
      const hoje = /* @__PURE__ */ new Date();
      const itemsComDias = items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diffDays = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1e3 * 60 * 60 * 24));
        return { ...item, diasRestantes: diffDays, vencido: diffDays < 0 };
      });
      return {
        items: itemsComDias,
        stats: {
          total: items.length,
          vencidos: itemsComDias.filter((v) => v.vencido && v.status === "ativo").length,
          proximos30dias: itemsComDias.filter((v) => v.diasRestantes >= 0 && v.diasRestantes <= 30 && v.status === "ativo").length
        }
      };
    })
  }),
  // Dashboard de Vencimentos com grÃ¡ficos
  vencimentosDashboard: router({
    // EstatÃ­sticas gerais
    estatisticasGerais: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const hoje = /* @__PURE__ */ new Date();
      const items = await db.select().from(vencimentos).where(eq(vencimentos.condominioId, input.condominioId));
      const total = items.length;
      const ativos = items.filter((v) => v.status === "ativo").length;
      const vencidos = items.filter((v) => {
        const dataVenc = new Date(v.dataVencimento);
        return dataVenc < hoje && v.status === "ativo";
      }).length;
      const proximos30dias = items.filter((v) => {
        const dataVenc = new Date(v.dataVencimento);
        const diff = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1e3 * 60 * 60 * 24));
        return diff >= 0 && diff <= 30 && v.status === "ativo";
      }).length;
      const contratos = items.filter((v) => v.tipo === "contrato").length;
      const servicos = items.filter((v) => v.tipo === "servico").length;
      const manutencoes2 = items.filter((v) => v.tipo === "manutencao").length;
      const valorTotalAtivo = items.filter((v) => v.status === "ativo").reduce((sum, v) => sum + Number(v.valor || 0), 0);
      return { total, ativos, vencidos, proximos30dias, contratos, servicos, manutencoes: manutencoes2, valorTotalAtivo };
    }),
    // Vencimentos por mÃªs (para grÃ¡fico de barras)
    porMes: protectedProcedure.input(z.object({ condominioId: z.number(), ano: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vencimentos).where(eq(vencimentos.condominioId, input.condominioId));
      const hoje = /* @__PURE__ */ new Date();
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const resultado = meses.map((nome, index) => {
        const mesItems = items.filter((v) => {
          const data = new Date(v.dataVencimento);
          return data.getMonth() === index && data.getFullYear() === input.ano;
        });
        return {
          mes: index + 1,
          nome,
          total: mesItems.length,
          vencidos: mesItems.filter((v) => {
            const dataVenc = new Date(v.dataVencimento);
            return dataVenc < hoje && v.status === "ativo";
          }).length,
          ativos: mesItems.filter((v) => v.status === "ativo").length,
          contratos: mesItems.filter((v) => v.tipo === "contrato").length,
          servicos: mesItems.filter((v) => v.tipo === "servico").length,
          manutencoes: mesItems.filter((v) => v.tipo === "manutencao").length
        };
      });
      return resultado;
    }),
    // Vencimentos por categoria (para grÃ¡fico de pizza)
    porCategoria: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vencimentos).where(eq(vencimentos.condominioId, input.condominioId));
      const hoje = /* @__PURE__ */ new Date();
      const categorias = [
        { tipo: "contrato", nome: "Contratos", cor: "#3B82F6" },
        { tipo: "servico", nome: "ServiÃ§os", cor: "#8B5CF6" },
        { tipo: "manutencao", nome: "ManutenÃ§Ãµes", cor: "#F59E0B" }
      ];
      return categorias.map((cat) => {
        const catItems = items.filter((v) => v.tipo === cat.tipo);
        return {
          tipo: cat.tipo,
          nome: cat.nome,
          cor: cat.cor,
          total: catItems.length,
          ativos: catItems.filter((v) => v.status === "ativo").length,
          vencidos: catItems.filter((v) => {
            const dataVenc = new Date(v.dataVencimento);
            return dataVenc < hoje && v.status === "ativo";
          }).length,
          valorTotal: catItems.reduce((sum, v) => sum + Number(v.valor || 0), 0)
        };
      });
    }),
    // Vencimentos por status (para grÃ¡fico de pizza)
    porStatus: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vencimentos).where(eq(vencimentos.condominioId, input.condominioId));
      const statusList = [
        { status: "ativo", nome: "Ativos", cor: "#22C55E" },
        { status: "vencido", nome: "Vencidos", cor: "#EF4444" },
        { status: "renovado", nome: "Renovados", cor: "#3B82F6" },
        { status: "cancelado", nome: "Cancelados", cor: "#6B7280" }
      ];
      return statusList.map((s) => ({
        status: s.status,
        nome: s.nome,
        cor: s.cor,
        total: items.filter((v) => v.status === s.status).length,
        valorTotal: items.filter((v) => v.status === s.status).reduce((sum, v) => sum + Number(v.valor || 0), 0)
      }));
    }),
    // PrÃ³ximos vencimentos (lista)
    proximos: protectedProcedure.input(z.object({ condominioId: z.number(), dias: z.number().default(30) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const hoje = /* @__PURE__ */ new Date();
      const dataLimite = /* @__PURE__ */ new Date();
      dataLimite.setDate(dataLimite.getDate() + input.dias);
      const items = await db.select().from(vencimentos).where(and(
        eq(vencimentos.condominioId, input.condominioId),
        eq(vencimentos.status, "ativo"),
        gte(vencimentos.dataVencimento, hoje),
        lte(vencimentos.dataVencimento, dataLimite)
      )).orderBy(vencimentos.dataVencimento);
      return items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1e3 * 60 * 60 * 24));
        return { ...item, diasRestantes };
      });
    }),
    // Vencimentos vencidos (lista)
    vencidos: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const hoje = /* @__PURE__ */ new Date();
      const items = await db.select().from(vencimentos).where(and(
        eq(vencimentos.condominioId, input.condominioId),
        eq(vencimentos.status, "ativo"),
        lte(vencimentos.dataVencimento, hoje)
      )).orderBy(desc(vencimentos.dataVencimento));
      return items.map((item) => {
        const dataVenc = new Date(item.dataVencimento);
        const diasAtrasados = Math.ceil((hoje.getTime() - dataVenc.getTime()) / (1e3 * 60 * 60 * 24));
        return { ...item, diasAtrasados };
      });
    }),
    // EvoluÃ§Ã£o temporal (para grÃ¡fico de linha)
    evolucao: protectedProcedure.input(z.object({ condominioId: z.number(), meses: z.number().default(12) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(vencimentos).where(eq(vencimentos.condominioId, input.condominioId));
      const dataLimite = /* @__PURE__ */ new Date();
      dataLimite.setMonth(dataLimite.getMonth() - input.meses);
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const resultado = [];
      const agora = /* @__PURE__ */ new Date();
      for (let i = input.meses - 1; i >= 0; i--) {
        const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const ano = data.getFullYear();
        const mes = data.getMonth();
        const mesItems = items.filter((v) => {
          const dataVenc = new Date(v.dataVencimento);
          return dataVenc.getMonth() === mes && dataVenc.getFullYear() === ano;
        });
        resultado.push({
          ano,
          mes: mes + 1,
          nome: `${meses[mes]}/${ano.toString().slice(-2)}`,
          total: mesItems.length,
          contratos: mesItems.filter((v) => v.tipo === "contrato").length,
          servicos: mesItems.filter((v) => v.tipo === "servico").length,
          manutencoes: mesItems.filter((v) => v.tipo === "manutencao").length,
          valorTotal: mesItems.reduce((sum, v) => sum + Number(v.valor || 0), 0)
        });
      }
      return resultado;
    })
  }),
  // ==================== NOTIFICAÃÃES PUSH ====================
  pushNotifications: router({
    // Listar blocos disponÃ­veis para segmentaÃ§Ã£o
    getBlocos: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.selectDistinct({ bloco: moradores.bloco }).from(moradores).where(and(
        eq(moradores.condominioId, input.condominioId),
        eq(moradores.ativo, true)
      ));
      return result.filter((r) => r.bloco !== null && r.bloco !== "").map((r) => r.bloco).sort();
    }),
    // Listar apartamentos disponÃ­veis para segmentaÃ§Ã£o (opcionalmente filtrados por bloco)
    getApartamentos: protectedProcedure.input(z.object({
      condominioId: z.number(),
      blocos: z.array(z.string()).optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const allMoradores = await db.select({
        apartamento: moradores.apartamento,
        bloco: moradores.bloco
      }).from(moradores).where(and(
        eq(moradores.condominioId, input.condominioId),
        eq(moradores.ativo, true)
      ));
      let filtered = allMoradores;
      if (input.blocos && input.blocos.length > 0) {
        filtered = allMoradores.filter((m) => m.bloco && input.blocos.includes(m.bloco));
      }
      const aptosSet = new Set(filtered.map((m) => m.apartamento));
      const aptos = Array.from(aptosSet).sort();
      return aptos;
    }),
    // Contar destinatÃ¡rios com filtros
    countDestinatarios: protectedProcedure.input(z.object({
      condominioId: z.number(),
      blocos: z.array(z.string()).optional(),
      apartamentos: z.array(z.string()).optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, comPush: 0 };
      const hasFiltros = input.blocos && input.blocos.length > 0 || input.apartamentos && input.apartamentos.length > 0;
      const allMoradores = await db.select().from(moradores).where(and(
        eq(moradores.condominioId, input.condominioId),
        eq(moradores.ativo, true)
      ));
      let moradoresFiltrados = allMoradores;
      if (hasFiltros) {
        moradoresFiltrados = allMoradores.filter((m) => {
          const matchBloco = !input.blocos || input.blocos.length === 0 || m.bloco && input.blocos.includes(m.bloco);
          const matchApto = !input.apartamentos || input.apartamentos.length === 0 || input.apartamentos.includes(m.apartamento);
          return matchBloco && matchApto;
        });
      }
      const moradorIds = moradoresFiltrados.map((m) => m.id);
      const allSubs = await db.select().from(pushSubscriptions).where(and(
        eq(pushSubscriptions.condominioId, input.condominioId),
        eq(pushSubscriptions.ativo, true)
      ));
      let subsCount = allSubs.length;
      if (hasFiltros) {
        subsCount = allSubs.filter((s) => s.moradorId && moradorIds.includes(s.moradorId)).length;
      }
      return {
        total: moradoresFiltrados.length,
        comPush: subsCount
      };
    }),
    // Registrar subscription
    subscribe: protectedProcedure.input(z.object({
      condominioId: z.number(),
      endpoint: z.string(),
      p256dh: z.string(),
      auth: z.string(),
      userAgent: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, input.endpoint)).limit(1);
      if (existing.length > 0) {
        await db.update(pushSubscriptions).set({
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent || null,
          ativo: true
        }).where(eq(pushSubscriptions.id, existing[0].id));
        return { success: true, id: existing[0].id };
      }
      const result = await db.insert(pushSubscriptions).values({
        condominioId: input.condominioId,
        userId: ctx.user.id,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent || null,
        ativo: true
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Cancelar subscription
    unsubscribe: protectedProcedure.input(z.object({ endpoint: z.string() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(pushSubscriptions).set({ ativo: false }).where(eq(pushSubscriptions.endpoint, input.endpoint));
      return { success: true };
    }),
    // Verificar status da subscription
    getStatus: protectedProcedure.input(z.object({ endpoint: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { subscribed: false };
      const result = await db.select().from(pushSubscriptions).where(and(
        eq(pushSubscriptions.endpoint, input.endpoint),
        eq(pushSubscriptions.ativo, true)
      )).limit(1);
      return { subscribed: result.length > 0 };
    }),
    // Listar subscriptions do condomÃ­nio (admin)
    listByCondominio: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(pushSubscriptions).where(and(
        eq(pushSubscriptions.condominioId, input.condominioId),
        eq(pushSubscriptions.ativo, true)
      ));
    }),
    // Enviar push de teste para o dispositivo do utilizador
    sendTest: protectedProcedure.input(z.object({
      condominioId: z.number(),
      vapidPublicKey: z.string(),
      vapidPrivateKey: z.string(),
      vapidSubject: z.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const subscriptions = await db.select().from(pushSubscriptions).where(and(
        eq(pushSubscriptions.userId, ctx.user.id),
        eq(pushSubscriptions.condominioId, input.condominioId),
        eq(pushSubscriptions.ativo, true)
      )).limit(1);
      if (subscriptions.length === 0) {
        return {
          success: false,
          message: "Nenhuma subscriÃ§Ã£o encontrada. Por favor, ative as notificaÃ§Ãµes push primeiro."
        };
      }
      const subscription = subscriptions[0];
      try {
        webpush.setVapidDetails(
          input.vapidSubject,
          input.vapidPublicKey,
          input.vapidPrivateKey
        );
        const payload = JSON.stringify({
          title: "ð Teste de NotificaÃ§Ã£o",
          body: "Esta Ã© uma notificaÃ§Ã£o de teste do seu condomÃ­nio!",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: {
            url: "/dashboard/gestao-notificacoes",
            timestamp: Date.now()
          }
        });
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          payload
        );
        return {
          success: true,
          message: "NotificaÃ§Ã£o de teste enviada com sucesso!"
        };
      } catch (error) {
        console.error("Erro ao enviar push de teste:", error);
        if (error.statusCode === 410) {
          await db.update(pushSubscriptions).set({ ativo: false }).where(eq(pushSubscriptions.id, subscription.id));
          return {
            success: false,
            message: "A subscriÃ§Ã£o expirou. Por favor, reative as notificaÃ§Ãµes."
          };
        }
        return {
          success: false,
          message: `Erro ao enviar: ${error.message || "Erro desconhecido"}`
        };
      }
    }),
    // Enviar push em massa para moradores do condomÃ­nio (com filtros opcionais)
    sendBroadcast: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1, "TÃ­tulo Ã© obrigatÃ³rio"),
      mensagem: z.string().min(1, "Mensagem Ã© obrigatÃ³ria"),
      url: z.string().optional(),
      vapidPublicKey: z.string(),
      vapidPrivateKey: z.string(),
      vapidSubject: z.string(),
      // Filtros de segmentaÃ§Ã£o
      blocos: z.array(z.string()).optional(),
      apartamentos: z.array(z.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let moradorIds = [];
      const hasFiltros = input.blocos && input.blocos.length > 0 || input.apartamentos && input.apartamentos.length > 0;
      if (hasFiltros) {
        let moradoresQuery = db.select({ id: moradores.id }).from(moradores).where(and(
          eq(moradores.condominioId, input.condominioId),
          eq(moradores.ativo, true)
        ));
        const moradoresFiltrados = await moradoresQuery;
        const moradoresCompletos = await db.select().from(moradores).where(and(
          eq(moradores.condominioId, input.condominioId),
          eq(moradores.ativo, true)
        ));
        moradorIds = moradoresCompletos.filter((m) => {
          const matchBloco = !input.blocos || input.blocos.length === 0 || m.bloco && input.blocos.includes(m.bloco);
          const matchApto = !input.apartamentos || input.apartamentos.length === 0 || input.apartamentos.includes(m.apartamento);
          return matchBloco && matchApto;
        }).map((m) => m.id);
      }
      let subscriptions;
      if (hasFiltros && moradorIds.length > 0) {
        const allSubs = await db.select().from(pushSubscriptions).where(and(
          eq(pushSubscriptions.condominioId, input.condominioId),
          eq(pushSubscriptions.ativo, true)
        ));
        subscriptions = allSubs.filter((s) => s.moradorId && moradorIds.includes(s.moradorId));
      } else if (hasFiltros && moradorIds.length === 0) {
        return {
          success: false,
          message: "Nenhum morador encontrado com os filtros selecionados.",
          stats: { total: 0, enviados: 0, falhas: 0 }
        };
      } else {
        subscriptions = await db.select().from(pushSubscriptions).where(and(
          eq(pushSubscriptions.condominioId, input.condominioId),
          eq(pushSubscriptions.ativo, true)
        ));
      }
      if (subscriptions.length === 0) {
        return {
          success: false,
          message: "Nenhum morador com notificaÃ§Ãµes push ativas.",
          stats: { total: 0, enviados: 0, falhas: 0 }
        };
      }
      webpush.setVapidDetails(
        input.vapidSubject,
        input.vapidPublicKey,
        input.vapidPrivateKey
      );
      const payload = JSON.stringify({
        title: input.titulo,
        body: input.mensagem,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: {
          url: input.url || "/dashboard",
          timestamp: Date.now()
        }
      });
      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth
                }
              },
              payload
            );
            return { success: true, subscriptionId: sub.id };
          } catch (error) {
            if (error.statusCode === 410) {
              await db.update(pushSubscriptions).set({ ativo: false }).where(eq(pushSubscriptions.id, sub.id));
            }
            return { success: false, subscriptionId: sub.id, error: error.message };
          }
        })
      );
      const enviados = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
      const falhas = results.length - enviados;
      await db.insert(historicoNotificacoes).values({
        condominioId: input.condominioId,
        tipo: "push",
        titulo: input.titulo,
        mensagem: input.mensagem,
        destinatarios: subscriptions.length,
        sucessos: enviados,
        falhas,
        enviadoPor: ctx.user.id
      });
      return {
        success: true,
        message: `NotificaÃ§Ã£o enviada para ${enviados} de ${subscriptions.length} dispositivos.`,
        stats: {
          total: subscriptions.length,
          enviados,
          falhas
        }
      };
    })
  }),
  // ==================== LEMBRETES AGENDADOS ====================
  lembretes: router({
    // Listar lembretes do condomÃ­nio
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(lembretes).where(eq(lembretes.condominioId, input.condominioId)).orderBy(desc(lembretes.dataAgendada));
    }),
    // Criar lembrete
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["assembleia", "vencimento", "evento", "manutencao", "custom"]),
      titulo: z.string(),
      mensagem: z.string().optional(),
      dataAgendada: z.string(),
      antecedenciaHoras: z.number().optional(),
      referenciaId: z.number().optional(),
      referenciaTipo: z.string().optional(),
      canais: z.array(z.string()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(lembretes).values({
        condominioId: input.condominioId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensagem: input.mensagem || null,
        dataAgendada: new Date(input.dataAgendada),
        antecedenciaHoras: input.antecedenciaHoras || 24,
        referenciaId: input.referenciaId || null,
        referenciaTipo: input.referenciaTipo || null,
        canais: input.canais || ["push", "email"]
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Excluir lembrete
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(lembretes).where(eq(lembretes.id, input.id));
      return { success: true };
    }),
    // Marcar lembrete como enviado
    markSent: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(lembretes).set({ enviado: true, enviadoEm: /* @__PURE__ */ new Date() }).where(eq(lembretes.id, input.id));
      return { success: true };
    }),
    // Listar lembretes pendentes (para processamento)
    getPending: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const now = /* @__PURE__ */ new Date();
      return db.select().from(lembretes).where(and(
        eq(lembretes.condominioId, input.condominioId),
        eq(lembretes.enviado, false),
        lte(lembretes.dataAgendada, now)
      ));
    })
  }),
  // ==================== HISTÃRICO DE NOTIFICAÃÃES ====================
  historicoNotificacoes: router({
    // Listar histÃ³rico
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      limit: z.number().optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(historicoNotificacoes).where(eq(historicoNotificacoes.condominioId, input.condominioId)).orderBy(desc(historicoNotificacoes.createdAt));
      if (input.limit) {
        query = query.limit(input.limit);
      }
      return query;
    }),
    // Registrar envio de notificaÃ§Ã£o
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["push", "email", "whatsapp", "sistema"]),
      titulo: z.string(),
      mensagem: z.string().optional(),
      destinatarios: z.number().optional(),
      sucessos: z.number().optional(),
      falhas: z.number().optional(),
      lembreteId: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(historicoNotificacoes).values({
        condominioId: input.condominioId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensagem: input.mensagem || null,
        destinatarios: input.destinatarios || 0,
        sucessos: input.sucessos || 0,
        falhas: input.falhas || 0,
        lembreteId: input.lembreteId || null,
        enviadoPor: ctx.user.id
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // EstatÃ­sticas de notificaÃ§Ãµes
    getStats: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, push: 0, email: 0, whatsapp: 0 };
      const all = await db.select().from(historicoNotificacoes).where(eq(historicoNotificacoes.condominioId, input.condominioId));
      return {
        total: all.length,
        push: all.filter((n) => n.tipo === "push").length,
        email: all.filter((n) => n.tipo === "email").length,
        whatsapp: all.filter((n) => n.tipo === "whatsapp").length
      };
    })
  }),
  // ==================== CONFIGURAÃÃES DE EMAIL ====================
  configEmail: router({
    // Obter configuraÃ§Ãµes
    get: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(configuracoesEmail).where(eq(configuracoesEmail.condominioId, input.condominioId)).limit(1);
      return result[0] || null;
    }),
    // Salvar configuraÃ§Ãµes
    save: protectedProcedure.input(z.object({
      condominioId: z.number(),
      provedor: z.enum(["resend", "sendgrid", "mailgun", "smtp"]).optional(),
      apiKey: z.string().optional(),
      emailRemetente: z.string().optional(),
      nomeRemetente: z.string().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(configuracoesEmail).where(eq(configuracoesEmail.condominioId, input.condominioId)).limit(1);
      if (existing.length > 0) {
        await db.update(configuracoesEmail).set({
          provedor: input.provedor || existing[0].provedor,
          apiKey: input.apiKey || existing[0].apiKey,
          emailRemetente: input.emailRemetente || existing[0].emailRemetente,
          nomeRemetente: input.nomeRemetente || existing[0].nomeRemetente,
          ativo: input.ativo !== void 0 ? input.ativo : existing[0].ativo
        }).where(eq(configuracoesEmail.id, existing[0].id));
        return { success: true, id: existing[0].id };
      }
      const result = await db.insert(configuracoesEmail).values({
        condominioId: input.condominioId,
        provedor: input.provedor || "resend",
        apiKey: input.apiKey || null,
        emailRemetente: input.emailRemetente || null,
        nomeRemetente: input.nomeRemetente || null,
        ativo: input.ativo || false
      });
      return { success: true, id: Number(result[0].insertId) };
    })
  }),
  // ==================== CONFIGURAÃÃES PUSH (VAPID) ====================
  configPush: router({
    // Obter configuraÃ§Ãµes VAPID
    get: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(configuracoesPush).where(eq(configuracoesPush.condominioId, input.condominioId)).limit(1);
      if (result.length === 0) return null;
      const config = result[0];
      return {
        ...config,
        vapidPrivateKey: config.vapidPrivateKey ? "****" + config.vapidPrivateKey.slice(-8) : null,
        vapidPrivateKeyFull: config.vapidPrivateKey
        // Para uso interno
      };
    }),
    // Salvar configuraÃ§Ãµes VAPID
    save: protectedProcedure.input(z.object({
      condominioId: z.number(),
      vapidPublicKey: z.string().optional(),
      vapidPrivateKey: z.string().optional(),
      vapidSubject: z.string().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(configuracoesPush).where(eq(configuracoesPush.condominioId, input.condominioId)).limit(1);
      if (existing.length > 0) {
        const updateData = {};
        if (input.vapidPublicKey !== void 0) updateData.vapidPublicKey = input.vapidPublicKey;
        if (input.vapidPrivateKey !== void 0 && !input.vapidPrivateKey.startsWith("****")) {
          updateData.vapidPrivateKey = input.vapidPrivateKey;
        }
        if (input.vapidSubject !== void 0) updateData.vapidSubject = input.vapidSubject;
        if (input.ativo !== void 0) updateData.ativo = input.ativo;
        await db.update(configuracoesPush).set(updateData).where(eq(configuracoesPush.id, existing[0].id));
        return { success: true, id: existing[0].id };
      }
      const result = await db.insert(configuracoesPush).values({
        condominioId: input.condominioId,
        vapidPublicKey: input.vapidPublicKey || null,
        vapidPrivateKey: input.vapidPrivateKey || null,
        vapidSubject: input.vapidSubject || null,
        ativo: input.ativo || false
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Testar configuraÃ§Ãµes VAPID
    test: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const config = await db.select().from(configuracoesPush).where(eq(configuracoesPush.condominioId, input.condominioId)).limit(1);
      if (config.length === 0) {
        return { success: false, message: "ConfiguraÃ§Ãµes VAPID nÃ£o encontradas" };
      }
      const { vapidPublicKey, vapidPrivateKey, vapidSubject } = config[0];
      if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
        return { success: false, message: "ConfiguraÃ§Ãµes VAPID incompletas" };
      }
      if (vapidPublicKey.length < 80) {
        return { success: false, message: "Chave pÃºblica VAPID invÃ¡lida" };
      }
      if (vapidPrivateKey.length < 40) {
        return { success: false, message: "Chave privada VAPID invÃ¡lida" };
      }
      if (!vapidSubject.startsWith("mailto:") && !vapidSubject.startsWith("https://")) {
        return { success: false, message: "Subject deve comeÃ§ar com 'mailto:' ou 'https://'" };
      }
      return { success: true, message: "ConfiguraÃ§Ãµes VAPID vÃ¡lidas!" };
    })
  }),
  // ==================== TEMPLATES DE NOTIFICAÃÃO ====================
  templatesNotificacao: router({
    // Listar templates do condomÃ­nio
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      categoria: z.enum(["assembleia", "manutencao", "vencimento", "aviso", "evento", "custom"]).optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(templatesNotificacao).where(eq(templatesNotificacao.condominioId, input.condominioId));
      if (input.categoria) {
        query = db.select().from(templatesNotificacao).where(and(
          eq(templatesNotificacao.condominioId, input.condominioId),
          eq(templatesNotificacao.categoria, input.categoria)
        ));
      }
      return query.orderBy(desc(templatesNotificacao.usageCount));
    }),
    // Obter template por ID
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(templatesNotificacao).where(eq(templatesNotificacao.id, input.id)).limit(1);
      return result[0] || null;
    }),
    // Criar template
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1, "Nome Ã© obrigatÃ³rio"),
      titulo: z.string().min(1, "TÃ­tulo Ã© obrigatÃ³rio"),
      mensagem: z.string().min(1, "Mensagem Ã© obrigatÃ³ria"),
      categoria: z.enum(["assembleia", "manutencao", "vencimento", "aviso", "evento", "custom"]).optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      urlDestino: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(templatesNotificacao).values({
        condominioId: input.condominioId,
        nome: input.nome,
        titulo: input.titulo,
        mensagem: input.mensagem,
        categoria: input.categoria || "custom",
        icone: input.icone || null,
        cor: input.cor || null,
        urlDestino: input.urlDestino || null
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Atualizar template
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      titulo: z.string().optional(),
      mensagem: z.string().optional(),
      categoria: z.enum(["assembleia", "manutencao", "vencimento", "aviso", "evento", "custom"]).optional(),
      icone: z.string().optional(),
      cor: z.string().optional(),
      urlDestino: z.string().optional(),
      ativo: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;
      await db.update(templatesNotificacao).set(updateData).where(eq(templatesNotificacao.id, id));
      return { success: true };
    }),
    // Excluir template
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(templatesNotificacao).where(eq(templatesNotificacao.id, input.id));
      return { success: true };
    }),
    // Incrementar contador de uso
    incrementUsage: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(templatesNotificacao).set({ usageCount: sql`${templatesNotificacao.usageCount} + 1` }).where(eq(templatesNotificacao.id, input.id));
      return { success: true };
    }),
    // Criar templates padrÃ£o para um condomÃ­nio
    createDefaults: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const defaultTemplates = [
        {
          nome: "ConvocaÃ§Ã£o de Assembleia",
          titulo: "ð Assembleia Geral",
          mensagem: "Prezado morador, vocÃª estÃ¡ convocado para a Assembleia Geral que serÃ¡ realizada em breve. Sua presenÃ§a Ã© fundamental!",
          categoria: "assembleia",
          icone: "Calendar",
          cor: "#3B82F6",
          urlDestino: "/dashboard/assembleias"
        },
        {
          nome: "Aviso de ManutenÃ§Ã£o",
          titulo: "ð ï¸ ManutenÃ§Ã£o Programada",
          mensagem: "Informamos que haverÃ¡ manutenÃ§Ã£o nas Ã¡reas comuns. Pedimos desculpas por eventuais transtornos.",
          categoria: "manutencao",
          icone: "Wrench",
          cor: "#F59E0B",
          urlDestino: "/dashboard/manutencoes"
        },
        {
          nome: "Lembrete de Vencimento",
          titulo: "ð° Taxa Condominial",
          mensagem: "Lembrete: A taxa condominial vence em breve. Evite multas e juros realizando o pagamento atÃ© a data de vencimento.",
          categoria: "vencimento",
          icone: "DollarSign",
          cor: "#10B981",
          urlDestino: "/dashboard/financeiro"
        },
        {
          nome: "Aviso Geral",
          titulo: "ð¢ Aviso Importante",
          mensagem: "AtenÃ§Ã£o moradores! Temos um comunicado importante para vocÃª. Confira os detalhes no app.",
          categoria: "aviso",
          icone: "Bell",
          cor: "#8B5CF6",
          urlDestino: "/dashboard/avisos"
        },
        {
          nome: "Evento no CondomÃ­nio",
          titulo: "ð Evento Especial",
          mensagem: "VocÃª estÃ¡ convidado para um evento especial no condomÃ­nio! NÃ£o perca!",
          categoria: "evento",
          icone: "PartyPopper",
          cor: "#EC4899",
          urlDestino: "/dashboard/eventos"
        }
      ];
      for (const template of defaultTemplates) {
        await db.insert(templatesNotificacao).values({
          condominioId: input.condominioId,
          ...template
        });
      }
      return { success: true, count: defaultTemplates.length };
    })
  }),
  // ==================== TIPOS DE INFRAÃÃO ====================
  tiposInfracao: router({
    // Listar tipos de infraÃ§Ã£o
    list: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(tiposInfracao).where(and(
        eq(tiposInfracao.condominioId, input.condominioId),
        eq(tiposInfracao.ativo, true)
      )).orderBy(tiposInfracao.titulo);
    }),
    // Criar tipo de infraÃ§Ã£o
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1, "TÃ­tulo Ã© obrigatÃ³rio"),
      descricaoPadrao: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(tiposInfracao).values({
        condominioId: input.condominioId,
        titulo: input.titulo,
        descricaoPadrao: input.descricaoPadrao || null
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Atualizar tipo de infraÃ§Ã£o
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      descricaoPadrao: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = {};
      if (input.titulo !== void 0) updateData.titulo = input.titulo;
      if (input.descricaoPadrao !== void 0) updateData.descricaoPadrao = input.descricaoPadrao;
      await db.update(tiposInfracao).set(updateData).where(eq(tiposInfracao.id, input.id));
      return { success: true };
    }),
    // Excluir tipo de infraÃ§Ã£o (soft delete)
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(tiposInfracao).set({ ativo: false }).where(eq(tiposInfracao.id, input.id));
      return { success: true };
    }),
    // Criar tipos padrÃ£o
    createDefaults: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const defaultTypes = [
        { titulo: "Barulho Excessivo", descricaoPadrao: "Foi constatado barulho excessivo proveniente da unidade, em horÃ¡rio nÃ£o permitido pelo regulamento interno do condomÃ­nio." },
        { titulo: "Estacionamento Irregular", descricaoPadrao: "Foi verificado que o veÃ­culo da unidade estÃ¡ estacionado em local nÃ£o permitido ou de forma irregular." },
        { titulo: "Lixo Fora do HorÃ¡rio", descricaoPadrao: "Foi constatado descarte de lixo fora do horÃ¡rio estabelecido pelo regulamento interno." },
        { titulo: "Animais em Ãrea Comum", descricaoPadrao: "Foi verificada a presenÃ§a de animal de estimaÃ§Ã£o em Ã¡rea comum sem a devida guia ou em desacordo com as regras." },
        { titulo: "AlteraÃ§Ã£o de Fachada", descricaoPadrao: "Foi constatada alteraÃ§Ã£o na fachada do imÃ³vel sem autorizaÃ§Ã£o prÃ©via da administraÃ§Ã£o." },
        { titulo: "Uso Indevido de Ãrea Comum", descricaoPadrao: "Foi verificado uso indevido de Ã¡rea comum do condomÃ­nio." },
        { titulo: "Vazamento de Ãgua", descricaoPadrao: "Foi constatado vazamento de Ã¡gua proveniente da unidade, causando prejuÃ­zos Ã s Ã¡reas comuns ou unidades vizinhas." },
        { titulo: "Obras Sem AutorizaÃ§Ã£o", descricaoPadrao: "Foi verificada realizaÃ§Ã£o de obras na unidade sem a devida autorizaÃ§Ã£o da administraÃ§Ã£o." }
      ];
      for (const tipo of defaultTypes) {
        await db.insert(tiposInfracao).values({
          condominioId: input.condominioId,
          ...tipo
        });
      }
      return { success: true, count: defaultTypes.length };
    })
  }),
  // ==================== NOTIFICAÃÃES DE INFRAÃÃO ====================
  notificacoesInfracao: router({
    // Listar notificaÃ§Ãµes
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      status: z.enum(["pendente", "respondida", "resolvida", "arquivada"]).optional(),
      moradorId: z.number().optional(),
      limit: z.number().optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(notificacoesInfracao.condominioId, input.condominioId)];
      if (input.status) conditions.push(eq(notificacoesInfracao.status, input.status));
      if (input.moradorId) conditions.push(eq(notificacoesInfracao.moradorId, input.moradorId));
      let query = db.select({
        notificacao: notificacoesInfracao,
        morador: moradores,
        tipoInfracao: tiposInfracao
      }).from(notificacoesInfracao).leftJoin(moradores, eq(notificacoesInfracao.moradorId, moradores.id)).leftJoin(tiposInfracao, eq(notificacoesInfracao.tipoInfracaoId, tiposInfracao.id)).where(and(...conditions)).orderBy(desc(notificacoesInfracao.createdAt));
      if (input.limit) {
        query = query.limit(input.limit);
      }
      return query;
    }),
    // Buscar notificaÃ§Ã£o por ID
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select({
        notificacao: notificacoesInfracao,
        morador: moradores,
        tipoInfracao: tiposInfracao
      }).from(notificacoesInfracao).leftJoin(moradores, eq(notificacoesInfracao.moradorId, moradores.id)).leftJoin(tiposInfracao, eq(notificacoesInfracao.tipoInfracaoId, tiposInfracao.id)).where(eq(notificacoesInfracao.id, input.id)).limit(1);
      return result[0] || null;
    }),
    // Buscar notificaÃ§Ã£o por token (pÃºblico - para morador responder)
    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select({
        notificacao: notificacoesInfracao,
        morador: {
          id: moradores.id,
          nome: moradores.nome,
          apartamento: moradores.apartamento,
          bloco: moradores.bloco
        },
        tipoInfracao: tiposInfracao,
        condominio: {
          id: condominios.id,
          nome: condominios.nome,
          logoUrl: condominios.logoUrl
        }
      }).from(notificacoesInfracao).leftJoin(moradores, eq(notificacoesInfracao.moradorId, moradores.id)).leftJoin(tiposInfracao, eq(notificacoesInfracao.tipoInfracaoId, tiposInfracao.id)).leftJoin(condominios, eq(notificacoesInfracao.condominioId, condominios.id)).where(eq(notificacoesInfracao.linkPublico, input.token)).limit(1);
      return result[0] || null;
    }),
    // Criar notificaÃ§Ã£o
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      moradorId: z.number(),
      tipoInfracaoId: z.number().optional(),
      titulo: z.string().min(1, "TÃ­tulo Ã© obrigatÃ³rio"),
      descricao: z.string().min(1, "DescriÃ§Ã£o Ã© obrigatÃ³ria"),
      imagens: z.array(z.string()).optional(),
      dataOcorrencia: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const linkPublico = nanoid(32);
      const result = await db.insert(notificacoesInfracao).values({
        condominioId: input.condominioId,
        moradorId: input.moradorId,
        tipoInfracaoId: input.tipoInfracaoId || null,
        titulo: input.titulo,
        descricao: input.descricao,
        imagens: input.imagens || [],
        dataOcorrencia: input.dataOcorrencia ? new Date(input.dataOcorrencia) : null,
        linkPublico,
        criadoPor: ctx.user.id
      });
      const notificacaoId = Number(result[0].insertId);
      return {
        success: true,
        id: notificacaoId,
        linkPublico
      };
    }),
    // Atualizar status
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pendente", "respondida", "resolvida", "arquivada"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoesInfracao).set({ status: input.status }).where(eq(notificacoesInfracao.id, input.id));
      return { success: true };
    }),
    // Marcar como enviado por WhatsApp
    markWhatsappSent: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoesInfracao).set({ enviadoWhatsapp: true }).where(eq(notificacoesInfracao.id, input.id));
      return { success: true };
    }),
    // Marcar como enviado por Email
    markEmailSent: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoesInfracao).set({ enviadoEmail: true }).where(eq(notificacoesInfracao.id, input.id));
      return { success: true };
    }),
    // Salvar URL do PDF
    savePdfUrl: protectedProcedure.input(z.object({
      id: z.number(),
      pdfUrl: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notificacoesInfracao).set({ pdfUrl: input.pdfUrl }).where(eq(notificacoesInfracao.id, input.id));
      return { success: true };
    }),
    // Contar notificaÃ§Ãµes por status
    countByStatus: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { pendente: 0, respondida: 0, resolvida: 0, arquivada: 0, total: 0 };
      const all = await db.select().from(notificacoesInfracao).where(eq(notificacoesInfracao.condominioId, input.condominioId));
      return {
        pendente: all.filter((n) => n.status === "pendente").length,
        respondida: all.filter((n) => n.status === "respondida").length,
        resolvida: all.filter((n) => n.status === "resolvida").length,
        arquivada: all.filter((n) => n.status === "arquivada").length,
        total: all.length
      };
    })
  }),
  // ==================== RESPOSTAS DE INFRAÃÃO (TIMELINE) ====================
  respostasInfracao: router({
    // Listar respostas de uma notificaÃ§Ã£o
    list: publicProcedure.input(z.object({ notificacaoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(respostasInfracao).where(eq(respostasInfracao.notificacaoId, input.notificacaoId)).orderBy(respostasInfracao.createdAt);
    }),
    // Adicionar resposta (sÃ­ndico)
    createSindico: protectedProcedure.input(z.object({
      notificacaoId: z.number(),
      mensagem: z.string().min(1, "Mensagem Ã© obrigatÃ³ria"),
      imagens: z.array(z.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(respostasInfracao).values({
        notificacaoId: input.notificacaoId,
        autorTipo: "sindico",
        autorId: ctx.user.id,
        autorNome: ctx.user.name || "SÃ­ndico",
        mensagem: input.mensagem,
        imagens: input.imagens || []
      });
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Adicionar resposta (morador - pÃºblico via token)
    createMorador: publicProcedure.input(z.object({
      token: z.string(),
      mensagem: z.string().min(1, "Mensagem Ã© obrigatÃ³ria"),
      imagens: z.array(z.string()).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const notificacao = await db.select().from(notificacoesInfracao).where(eq(notificacoesInfracao.linkPublico, input.token)).limit(1);
      if (!notificacao[0]) {
        throw new Error("NotificaÃ§Ã£o nÃ£o encontrada");
      }
      const morador = await db.select().from(moradores).where(eq(moradores.id, notificacao[0].moradorId)).limit(1);
      const result = await db.insert(respostasInfracao).values({
        notificacaoId: notificacao[0].id,
        autorTipo: "morador",
        autorId: notificacao[0].moradorId,
        autorNome: morador[0]?.nome || "Morador",
        mensagem: input.mensagem,
        imagens: input.imagens || []
      });
      await db.update(notificacoesInfracao).set({ status: "respondida" }).where(eq(notificacoesInfracao.id, notificacao[0].id));
      return { success: true, id: Number(result[0].insertId) };
    }),
    // Contar respostas nÃ£o lidas (para badge)
    countUnread: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      const notificacoes2 = await db.select({ id: notificacoesInfracao.id }).from(notificacoesInfracao).where(eq(notificacoesInfracao.condominioId, input.condominioId));
      if (notificacoes2.length === 0) return 0;
      const notificacaoIds = notificacoes2.map((n) => n.id);
      const respostasNaoLidas = await db.select().from(respostasInfracao).where(and(
        inArray(respostasInfracao.notificacaoId, notificacaoIds),
        eq(respostasInfracao.autorTipo, "morador"),
        eq(respostasInfracao.lidaPeloSindico, false)
      ));
      return respostasNaoLidas.length;
    }),
    // Buscar novas respostas nÃ£o lidas (para alerta)
    getUnread: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const notificacoes2 = await db.select().from(notificacoesInfracao).where(eq(notificacoesInfracao.condominioId, input.condominioId));
      if (notificacoes2.length === 0) return [];
      const notificacaoIds = notificacoes2.map((n) => n.id);
      const respostasNaoLidas = await db.select().from(respostasInfracao).where(and(
        inArray(respostasInfracao.notificacaoId, notificacaoIds),
        eq(respostasInfracao.autorTipo, "morador"),
        eq(respostasInfracao.lidaPeloSindico, false)
      )).orderBy(desc(respostasInfracao.createdAt)).limit(10);
      const respostasComDados = await Promise.all(
        respostasNaoLidas.map(async (resposta) => {
          const notificacao = notificacoes2.find((n) => n.id === resposta.notificacaoId);
          return {
            ...resposta,
            notificacaoTitulo: notificacao?.titulo || "NotificaÃ§Ã£o",
            notificacaoId: notificacao?.id
          };
        })
      );
      return respostasComDados;
    }),
    // Marcar resposta como lida
    markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(respostasInfracao).set({ lidaPeloSindico: true }).where(eq(respostasInfracao.id, input.id));
      return { success: true };
    }),
    // Marcar todas as respostas de uma notificaÃ§Ã£o como lidas
    markAllAsRead: protectedProcedure.input(z.object({ notificacaoId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(respostasInfracao).set({ lidaPeloSindico: true }).where(and(
        eq(respostasInfracao.notificacaoId, input.notificacaoId),
        eq(respostasInfracao.autorTipo, "morador")
      ));
      return { success: true };
    })
  }),
  // ==================== RELATÃRIO DE INFRAÃÃES ====================
  relatorioInfracoes: router({
    // Gerar relatÃ³rio PDF de infraÃ§Ãµes
    gerar: protectedProcedure.input(z.object({
      condominioId: z.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      moradorId: z.number().optional(),
      status: z.enum(["pendente", "respondida", "resolvida", "arquivada"]).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const condominio = await db.select().from(condominios).where(eq(condominios.id, input.condominioId)).limit(1);
      if (!condominio[0]) throw new Error("CondomÃ­nio nÃ£o encontrado");
      let conditions = [eq(notificacoesInfracao.condominioId, input.condominioId)];
      if (input.moradorId) {
        conditions.push(eq(notificacoesInfracao.moradorId, input.moradorId));
      }
      if (input.status) {
        conditions.push(eq(notificacoesInfracao.status, input.status));
      }
      let notificacoes2 = await db.select().from(notificacoesInfracao).where(and(...conditions)).orderBy(desc(notificacoesInfracao.createdAt));
      if (input.dataInicio) {
        const dataInicio = new Date(input.dataInicio);
        notificacoes2 = notificacoes2.filter((n) => new Date(n.createdAt) >= dataInicio);
      }
      if (input.dataFim) {
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        notificacoes2 = notificacoes2.filter((n) => new Date(n.createdAt) <= dataFim);
      }
      const moradoresIdsSet = new Set(notificacoes2.map((n) => n.moradorId));
      const moradoresIds = [];
      moradoresIdsSet.forEach((id) => moradoresIds.push(id));
      const moradoresData = moradoresIds.length > 0 ? await db.select().from(moradores).where(inArray(moradores.id, moradoresIds)) : [];
      const tiposIdsSet = new Set(notificacoes2.map((n) => n.tipoInfracaoId).filter(Boolean));
      const tiposIds = [];
      tiposIdsSet.forEach((id) => tiposIds.push(id));
      const tiposData = tiposIds.length > 0 ? await db.select().from(tiposInfracao).where(inArray(tiposInfracao.id, tiposIds)) : [];
      const notificacoesComDados = await Promise.all(
        notificacoes2.map(async (notif) => {
          const respostas = await db.select().from(respostasInfracao).where(eq(respostasInfracao.notificacaoId, notif.id)).orderBy(respostasInfracao.createdAt);
          const morador = moradoresData.find((m) => m.id === notif.moradorId);
          const tipo = tiposData.find((t) => t.id === notif.tipoInfracaoId);
          return {
            ...notif,
            moradorNome: morador?.nome || "N/A",
            moradorBloco: morador?.bloco || "",
            moradorApartamento: morador?.apartamento || "",
            tipoTitulo: tipo?.titulo || "N/A",
            respostas,
            totalRespostas: respostas.length
          };
        })
      );
      const estatisticas = {
        total: notificacoesComDados.length,
        pendentes: notificacoesComDados.filter((n) => n.status === "pendente").length,
        respondidas: notificacoesComDados.filter((n) => n.status === "respondida").length,
        resolvidas: notificacoesComDados.filter((n) => n.status === "resolvida").length,
        arquivadas: notificacoesComDados.filter((n) => n.status === "arquivada").length
      };
      const dataAtual = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR");
      const periodoTexto = input.dataInicio && input.dataFim ? `PerÃ­odo: ${new Date(input.dataInicio).toLocaleDateString("pt-BR")} a ${new Date(input.dataFim).toLocaleDateString("pt-BR")}` : input.dataInicio ? `A partir de: ${new Date(input.dataInicio).toLocaleDateString("pt-BR")}` : input.dataFim ? `AtÃ©: ${new Date(input.dataFim).toLocaleDateString("pt-BR")}` : "Todos os perÃ­odos";
      const moradorFiltro = input.moradorId ? moradoresData.find((m) => m.id === input.moradorId)?.nome || "" : "";
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>RelatÃ³rio de InfraÃ§Ãµes - ${condominio[0].nome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
    .container { max-width: 100%; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
    .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 5px; }
    .header h2 { font-size: 16px; color: #64748b; font-weight: normal; }
    .header .data { font-size: 11px; color: #94a3b8; margin-top: 10px; }
    .filtros { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .filtros h3 { font-size: 12px; color: #475569; margin-bottom: 8px; }
    .filtros p { font-size: 11px; color: #64748b; }
    .estatisticas { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 100px; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; }
    .stat-card .numero { font-size: 24px; font-weight: bold; color: #1e40af; }
    .stat-card .label { font-size: 10px; color: #64748b; text-transform: uppercase; }
    .stat-card.pendente .numero { color: #f59e0b; }
    .stat-card.respondida .numero { color: #3b82f6; }
    .stat-card.resolvida .numero { color: #22c55e; }
    .stat-card.arquivada .numero { color: #6b7280; }
    .infracoes-lista { margin-top: 20px; }
    .infracoes-lista h3 { font-size: 14px; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .infracao-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
    .infracao-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .infracao-titulo { font-size: 13px; font-weight: 600; color: #1e293b; }
    .infracao-status { font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 500; }
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-respondida { background: #dbeafe; color: #1e40af; }
    .status-resolvida { background: #dcfce7; color: #166534; }
    .status-arquivada { background: #f3f4f6; color: #4b5563; }
    .infracao-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
    .info-item { font-size: 11px; }
    .info-item .label { color: #64748b; }
    .info-item .valor { color: #1e293b; font-weight: 500; }
    .infracao-descricao { font-size: 11px; color: #475569; background: #f8fafc; padding: 10px; border-radius: 4px; margin-top: 10px; }
    .infracao-respostas { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
    .infracao-respostas .titulo { font-size: 11px; color: #64748b; margin-bottom: 8px; }
    .resposta-item { font-size: 10px; padding: 8px; background: #f1f5f9; border-radius: 4px; margin-bottom: 5px; }
    .resposta-item.morador { background: #fef3c7; }
    .resposta-item.sindico { background: #dbeafe; }
    .resposta-autor { font-weight: 600; color: #1e293b; }
    .resposta-data { color: #94a3b8; font-size: 9px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
    @media print { .container { padding: 10px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RelatÃ³rio de InfraÃ§Ãµes</h1>
      <h2>${condominio[0].nome}</h2>
      <p class="data">Gerado em ${dataAtual}</p>
    </div>
    
    <div class="filtros">
      <h3>Filtros Aplicados</h3>
      <p><strong>PerÃ­odo:</strong> ${periodoTexto}</p>
      ${moradorFiltro ? `<p><strong>Morador:</strong> ${moradorFiltro}</p>` : ""}
      ${input.status ? `<p><strong>Status:</strong> ${input.status.charAt(0).toUpperCase() + input.status.slice(1)}</p>` : ""}
    </div>
    
    <div class="estatisticas">
      <div class="stat-card">
        <div class="numero">${estatisticas.total}</div>
        <div class="label">Total</div>
      </div>
      <div class="stat-card pendente">
        <div class="numero">${estatisticas.pendentes}</div>
        <div class="label">Pendentes</div>
      </div>
      <div class="stat-card respondida">
        <div class="numero">${estatisticas.respondidas}</div>
        <div class="label">Respondidas</div>
      </div>
      <div class="stat-card resolvida">
        <div class="numero">${estatisticas.resolvidas}</div>
        <div class="label">Resolvidas</div>
      </div>
      <div class="stat-card arquivada">
        <div class="numero">${estatisticas.arquivadas}</div>
        <div class="label">Arquivadas</div>
      </div>
    </div>
    
    <div class="infracoes-lista">
      <h3>Lista de InfraÃ§Ãµes (${notificacoesComDados.length})</h3>
      ${notificacoesComDados.map((notif) => `
        <div class="infracao-item">
          <div class="infracao-header">
            <div class="infracao-titulo">${notif.titulo}</div>
            <span class="infracao-status status-${notif.status || "pendente"}">${(notif.status || "pendente").charAt(0).toUpperCase() + (notif.status || "pendente").slice(1)}</span>
          </div>
          <div class="infracao-info">
            <div class="info-item">
              <div class="label">Morador</div>
              <div class="valor">${notif.moradorNome}</div>
            </div>
            <div class="info-item">
              <div class="label">Unidade</div>
              <div class="valor">${notif.moradorBloco ? `Bloco ${notif.moradorBloco}, ` : ""}Apto ${notif.moradorApartamento}</div>
            </div>
            <div class="info-item">
              <div class="label">Data</div>
              <div class="valor">${new Date(notif.createdAt).toLocaleDateString("pt-BR")}</div>
            </div>
            <div class="info-item">
              <div class="label">Tipo</div>
              <div class="valor">${notif.tipoTitulo}</div>
            </div>
            <div class="info-item">
              <div class="label">Respostas</div>
              <div class="valor">${notif.totalRespostas}</div>
            </div>
          </div>
          ${notif.descricao ? `<div class="infracao-descricao">${notif.descricao}</div>` : ""}
          ${notif.respostas.length > 0 ? `
            <div class="infracao-respostas">
              <div class="titulo">HistÃ³rico de Respostas:</div>
              ${notif.respostas.slice(0, 5).map((resp) => `
                <div class="resposta-item ${resp.autorTipo}">
                  <span class="resposta-autor">${resp.autorNome} (${resp.autorTipo === "morador" ? "Morador" : "SÃ­ndico"}):</span>
                  <span class="resposta-data">${new Date(resp.createdAt).toLocaleDateString("pt-BR")} ${new Date(resp.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  <p style="margin-top: 4px;">${resp.mensagem.substring(0, 200)}${resp.mensagem.length > 200 ? "..." : ""}</p>
                </div>
              `).join("")}
              ${notif.respostas.length > 5 ? `<p style="font-size: 10px; color: #94a3b8; margin-top: 5px;">+ ${notif.respostas.length - 5} respostas adicionais</p>` : ""}
            </div>
          ` : ""}
        </div>
      `).join("")}
      ${notificacoesComDados.length === 0 ? '<p style="text-align: center; color: #94a3b8; padding: 40px;">Nenhuma infraÃ§Ã£o encontrada com os filtros selecionados.</p>' : ""}
    </div>
    
    <div class="footer">
      <p>RelatÃ³rio gerado automaticamente pelo sistema RevistaDigital</p>
      <p>${condominio[0].nome} - ${dataAtual}</p>
    </div>
  </div>
</body>
</html>
        `;
      const pdfBuffer = await generateInfracoesPDF(htmlContent);
      const base64 = pdfBuffer.toString("base64");
      return {
        success: true,
        pdf: base64,
        filename: `relatorio-infracoes-${condominio[0].nome.toLowerCase().replace(/\s+/g, "-")}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`,
        estatisticas
      };
    }),
    // Listar moradores para filtro
    listarMoradores: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const notificacoes2 = await db.select({ moradorId: notificacoesInfracao.moradorId }).from(notificacoesInfracao).where(eq(notificacoesInfracao.condominioId, input.condominioId));
      const moradoresIdsSet = new Set(notificacoes2.map((n) => n.moradorId));
      const moradoresIds = [];
      moradoresIdsSet.forEach((id) => moradoresIds.push(id));
      if (moradoresIds.length === 0) return [];
      const moradoresData = await db.select({
        id: moradores.id,
        nome: moradores.nome,
        bloco: moradores.bloco,
        apartamento: moradores.apartamento
      }).from(moradores).where(inArray(moradores.id, moradoresIds));
      return moradoresData;
    })
  }),
  // ==================== FUNÃÃES POR CONDOMÃNIO (ADMIN) ====================
  funcoesCondominio: router({
    // Listar todas as funÃ§Ãµes disponÃ­veis
    listarDisponiveis: publicProcedure.query(() => {
      return FUNCOES_DISPONIVEIS;
    }),
    // Obter funÃ§Ãµes habilitadas para um condomÃ­nio
    listar: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(condominioFuncoes).where(eq(condominioFuncoes.condominioId, input.condominioId));
      return result;
    }),
    // Obter lista de IDs de funÃ§Ãµes habilitadas
    listarHabilitadas: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return FUNCOES_DISPONIVEIS.map((f) => f.id);
      const result = await db.select().from(condominioFuncoes).where(and(
        eq(condominioFuncoes.condominioId, input.condominioId),
        eq(condominioFuncoes.habilitada, true)
      ));
      if (result.length === 0) {
        return FUNCOES_DISPONIVEIS.map((f) => f.id);
      }
      return result.map((r) => r.funcaoId);
    }),
    // Habilitar/desabilitar uma funÃ§Ã£o (apenas admin)
    toggle: protectedProcedure.input(z.object({
      condominioId: z.number(),
      funcaoId: z.string(),
      habilitada: z.boolean()
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Apenas administradores podem alterar funÃ§Ãµes");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(condominioFuncoes).where(and(
        eq(condominioFuncoes.condominioId, input.condominioId),
        eq(condominioFuncoes.funcaoId, input.funcaoId)
      ));
      if (existing.length > 0) {
        await db.update(condominioFuncoes).set({ habilitada: input.habilitada }).where(and(
          eq(condominioFuncoes.condominioId, input.condominioId),
          eq(condominioFuncoes.funcaoId, input.funcaoId)
        ));
      } else {
        await db.insert(condominioFuncoes).values({
          condominioId: input.condominioId,
          funcaoId: input.funcaoId,
          habilitada: input.habilitada
        });
      }
      return { success: true, ...input };
    }),
    // Atualizar mÃºltiplas funÃ§Ãµes de uma vez (apenas admin)
    atualizarMultiplas: protectedProcedure.input(z.object({
      condominioId: z.number(),
      funcoes: z.array(z.object({
        funcaoId: z.string(),
        habilitada: z.boolean()
      }))
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Apenas administradores podem alterar funÃ§Ãµes");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (const funcao of input.funcoes) {
        const existing = await db.select().from(condominioFuncoes).where(and(
          eq(condominioFuncoes.condominioId, input.condominioId),
          eq(condominioFuncoes.funcaoId, funcao.funcaoId)
        ));
        if (existing.length > 0) {
          await db.update(condominioFuncoes).set({ habilitada: funcao.habilitada }).where(and(
            eq(condominioFuncoes.condominioId, input.condominioId),
            eq(condominioFuncoes.funcaoId, funcao.funcaoId)
          ));
        } else {
          await db.insert(condominioFuncoes).values({
            condominioId: input.condominioId,
            funcaoId: funcao.funcaoId,
            habilitada: funcao.habilitada
          });
        }
      }
      return { success: true, updated: input.funcoes.length };
    }),
    // Inicializar funÃ§Ãµes para um condomÃ­nio (todas habilitadas)
    inicializar: protectedProcedure.input(z.object({ condominioId: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Apenas administradores podem inicializar funÃ§Ãµes");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(condominioFuncoes).where(eq(condominioFuncoes.condominioId, input.condominioId));
      if (existing.length > 0) {
        return { initialized: false, message: "FunÃ§Ãµes jÃ¡ inicializadas" };
      }
      for (const funcao of FUNCOES_DISPONIVEIS) {
        await db.insert(condominioFuncoes).values({
          condominioId: input.condominioId,
          funcaoId: funcao.id,
          habilitada: true
        });
      }
      return { initialized: true, count: FUNCOES_DISPONIVEIS.length };
    })
  }),
  // ==================== VALORES SALVOS ====================
  valoresSalvos: router({
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum([
        "responsavel",
        "categoria_vistoria",
        "categoria_manutencao",
        "categoria_checklist",
        "categoria_ocorrencia",
        "tipo_vistoria",
        "tipo_manutencao",
        "tipo_checklist",
        "tipo_ocorrencia",
        "fornecedor",
        "localizacao"
      ])
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(valoresSalvos).where(and(
        eq(valoresSalvos.condominioId, input.condominioId),
        eq(valoresSalvos.tipo, input.tipo),
        eq(valoresSalvos.ativo, true)
      )).orderBy(valoresSalvos.valor);
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      tipo: z.enum([
        "responsavel",
        "categoria_vistoria",
        "categoria_manutencao",
        "categoria_checklist",
        "categoria_ocorrencia",
        "tipo_vistoria",
        "tipo_manutencao",
        "tipo_checklist",
        "tipo_ocorrencia",
        "fornecedor",
        "localizacao"
      ]),
      valor: z.string().min(1)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(valoresSalvos).where(and(
        eq(valoresSalvos.condominioId, input.condominioId),
        eq(valoresSalvos.tipo, input.tipo),
        eq(valoresSalvos.valor, input.valor)
      ));
      if (existing.length > 0) {
        if (!existing[0].ativo) {
          await db.update(valoresSalvos).set({ ativo: true }).where(eq(valoresSalvos.id, existing[0].id));
        }
        return { id: existing[0].id, isNew: false };
      }
      const [result] = await db.insert(valoresSalvos).values(input);
      return { id: result.insertId, isNew: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(valoresSalvos).set({ ativo: false }).where(eq(valoresSalvos.id, input.id));
      return { success: true };
    })
  }),
  // Router de RelatÃ³rio Consolidado Profissional
  relatorioConsolidado: router({
    gerar: protectedProcedure.input(z.object({
      condominioId: z.number(),
      secoes: z.array(z.string()),
      dataInicio: z.string(),
      dataFim: z.string(),
      incluirGraficos: z.boolean().optional(),
      incluirEstatisticas: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const dataInicio = new Date(input.dataInicio);
      const dataFim = new Date(input.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      const [condominio] = await db.select().from(condominios).where(eq(condominios.id, input.condominioId));
      const resultado = {
        condominio: condominio || null,
        periodo: { inicio: input.dataInicio, fim: input.dataFim },
        secoes: {},
        totais: {},
        geradoEm: (/* @__PURE__ */ new Date()).toISOString()
      };
      for (const secao of input.secoes) {
        switch (secao) {
          case "manutencoes":
            const listaManutencoes = await db.select().from(manutencoes).where(and(
              eq(manutencoes.condominioId, input.condominioId),
              gte(manutencoes.createdAt, dataInicio),
              lte(manutencoes.createdAt, dataFim)
            )).orderBy(desc(manutencoes.createdAt));
            const manutencoesComImagens = await Promise.all(
              listaManutencoes.map(async (m) => {
                const imgs = await db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, m.id));
                const timeline = await db.select().from(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, m.id)).orderBy(desc(manutencaoTimeline.createdAt));
                return { ...m, imagens: imgs, timeline };
              })
            );
            resultado.secoes.manutencoes = manutencoesComImagens;
            resultado.totais.manutencoes = listaManutencoes.length;
            break;
          case "ocorrencias":
            const listaOcorrencias = await db.select().from(ocorrencias).where(and(
              eq(ocorrencias.condominioId, input.condominioId),
              gte(ocorrencias.createdAt, dataInicio),
              lte(ocorrencias.createdAt, dataFim)
            )).orderBy(desc(ocorrencias.createdAt));
            const ocorrenciasComImagens = await Promise.all(
              listaOcorrencias.map(async (o) => {
                const imgs = await db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, o.id));
                const timeline = await db.select().from(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, o.id)).orderBy(desc(ocorrenciaTimeline.createdAt));
                return { ...o, imagens: imgs, timeline };
              })
            );
            resultado.secoes.ocorrencias = ocorrenciasComImagens;
            resultado.totais.ocorrencias = listaOcorrencias.length;
            break;
          case "vistorias":
            const listaVistorias = await db.select().from(vistorias).where(and(
              eq(vistorias.condominioId, input.condominioId),
              gte(vistorias.createdAt, dataInicio),
              lte(vistorias.createdAt, dataFim)
            )).orderBy(desc(vistorias.createdAt));
            const vistoriasComImagens = await Promise.all(
              listaVistorias.map(async (v) => {
                const imgs = await db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, v.id));
                const timeline = await db.select().from(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, v.id)).orderBy(desc(vistoriaTimeline.createdAt));
                return { ...v, imagens: imgs, timeline };
              })
            );
            resultado.secoes.vistorias = vistoriasComImagens;
            resultado.totais.vistorias = listaVistorias.length;
            break;
          case "checklists":
            const listaChecklists = await db.select().from(checklists).where(and(
              eq(checklists.condominioId, input.condominioId),
              gte(checklists.createdAt, dataInicio),
              lte(checklists.createdAt, dataFim)
            )).orderBy(desc(checklists.createdAt));
            const checklistsComItens = await Promise.all(
              listaChecklists.map(async (c) => {
                const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, c.id));
                const imgs = await db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, c.id));
                const timeline = await db.select().from(checklistTimeline).where(eq(checklistTimeline.checklistId, c.id)).orderBy(desc(checklistTimeline.createdAt));
                return { ...c, itens, imagens: imgs, timeline };
              })
            );
            resultado.secoes.checklists = checklistsComItens;
            resultado.totais.checklists = listaChecklists.length;
            break;
          case "antesDepois":
            const revistasParaAntesDepois = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsAD = revistasParaAntesDepois.map((r) => r.id);
            let listaAntesDepois = [];
            if (revistaIdsAD.length > 0) {
              listaAntesDepois = await db.select().from(antesDepois).where(and(
                inArray(antesDepois.revistaId, revistaIdsAD),
                gte(antesDepois.createdAt, dataInicio),
                lte(antesDepois.createdAt, dataFim)
              )).orderBy(desc(antesDepois.createdAt));
            }
            resultado.secoes.antesDepois = listaAntesDepois;
            resultado.totais.antesDepois = listaAntesDepois.length;
            break;
          case "eventos":
            const revistasParaEventos = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsEv = revistasParaEventos.map((r) => r.id);
            let listaEventos = [];
            if (revistaIdsEv.length > 0) {
              listaEventos = await db.select().from(eventos).where(and(
                inArray(eventos.revistaId, revistaIdsEv),
                gte(eventos.dataEvento, dataInicio),
                lte(eventos.dataEvento, dataFim)
              )).orderBy(desc(eventos.dataEvento));
            }
            resultado.secoes.eventos = listaEventos;
            resultado.totais.eventos = listaEventos.length;
            break;
          case "avisos":
            const revistasParaAvisos = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsAv = revistasParaAvisos.map((r) => r.id);
            let listaAvisos = [];
            if (revistaIdsAv.length > 0) {
              listaAvisos = await db.select().from(avisos).where(and(
                inArray(avisos.revistaId, revistaIdsAv),
                gte(avisos.createdAt, dataInicio),
                lte(avisos.createdAt, dataFim)
              )).orderBy(desc(avisos.createdAt));
            }
            resultado.secoes.avisos = listaAvisos;
            resultado.totais.avisos = listaAvisos.length;
            break;
          case "comunicados":
            const revistasParaComunicados = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsCom = revistasParaComunicados.map((r) => r.id);
            let listaComunicados = [];
            if (revistaIdsCom.length > 0) {
              listaComunicados = await db.select().from(comunicados).where(and(
                inArray(comunicados.revistaId, revistaIdsCom),
                gte(comunicados.createdAt, dataInicio),
                lte(comunicados.createdAt, dataFim)
              )).orderBy(desc(comunicados.createdAt));
            }
            resultado.secoes.comunicados = listaComunicados;
            resultado.totais.comunicados = listaComunicados.length;
            break;
          case "votacoes":
            const revistasParaVotacoes = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsVot = revistasParaVotacoes.map((r) => r.id);
            let listaVotacoes = [];
            if (revistaIdsVot.length > 0) {
              listaVotacoes = await db.select().from(votacoes).where(and(
                inArray(votacoes.revistaId, revistaIdsVot),
                gte(votacoes.createdAt, dataInicio),
                lte(votacoes.createdAt, dataFim)
              )).orderBy(desc(votacoes.createdAt));
            }
            const votacoesComOpcoes = await Promise.all(
              listaVotacoes.map(async (v) => {
                const opcoes = await db.select().from(opcoesVotacao).where(eq(opcoesVotacao.votacaoId, v.id));
                const totalVotos = await db.select({ count: sql`count(*)` }).from(votos).where(eq(votos.votacaoId, v.id));
                return { ...v, opcoes, totalVotos: totalVotos[0]?.count || 0 };
              })
            );
            resultado.secoes.votacoes = votacoesComOpcoes;
            resultado.totais.votacoes = listaVotacoes.length;
            break;
          case "moradores":
            const listaMoradores = await db.select().from(moradores).where(eq(moradores.condominioId, input.condominioId)).orderBy(moradores.nome);
            resultado.secoes.moradores = listaMoradores;
            resultado.totais.moradores = listaMoradores.length;
            break;
          case "funcionarios":
            const listaFuncionarios = await db.select().from(funcionarios).where(eq(funcionarios.condominioId, input.condominioId)).orderBy(funcionarios.nome);
            resultado.secoes.funcionarios = listaFuncionarios;
            resultado.totais.funcionarios = listaFuncionarios.length;
            break;
          case "realizacoes":
            const revistasParaRealizacoes = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsReal = revistasParaRealizacoes.map((r) => r.id);
            let listaRealizacoes = [];
            if (revistaIdsReal.length > 0) {
              listaRealizacoes = await db.select().from(realizacoes).where(and(
                inArray(realizacoes.revistaId, revistaIdsReal),
                gte(realizacoes.createdAt, dataInicio),
                lte(realizacoes.createdAt, dataFim)
              )).orderBy(desc(realizacoes.createdAt));
            }
            const realizacoesComImagens = await Promise.all(
              listaRealizacoes.map(async (r) => {
                const imgs = await db.select().from(imagensRealizacoes).where(eq(imagensRealizacoes.realizacaoId, r.id));
                return { ...r, imagens: imgs };
              })
            );
            resultado.secoes.realizacoes = realizacoesComImagens;
            resultado.totais.realizacoes = listaRealizacoes.length;
            break;
          case "melhorias":
            const revistasParaMelhorias = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsMel = revistasParaMelhorias.map((r) => r.id);
            let listaMelhorias = [];
            if (revistaIdsMel.length > 0) {
              listaMelhorias = await db.select().from(melhorias).where(and(
                inArray(melhorias.revistaId, revistaIdsMel),
                gte(melhorias.createdAt, dataInicio),
                lte(melhorias.createdAt, dataFim)
              )).orderBy(desc(melhorias.createdAt));
            }
            const melhoriasComImagens = await Promise.all(
              listaMelhorias.map(async (m) => {
                const imgs = await db.select().from(imagensMelhorias).where(eq(imagensMelhorias.melhoriaId, m.id));
                return { ...m, imagens: imgs };
              })
            );
            resultado.secoes.melhorias = melhoriasComImagens;
            resultado.totais.melhorias = listaMelhorias.length;
            break;
          case "aquisicoes":
            const revistasParaAquisicoes = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsAq = revistasParaAquisicoes.map((r) => r.id);
            let listaAquisicoes = [];
            if (revistaIdsAq.length > 0) {
              listaAquisicoes = await db.select().from(aquisicoes).where(and(
                inArray(aquisicoes.revistaId, revistaIdsAq),
                gte(aquisicoes.createdAt, dataInicio),
                lte(aquisicoes.createdAt, dataFim)
              )).orderBy(desc(aquisicoes.createdAt));
            }
            const aquisicoesComImagens = await Promise.all(
              listaAquisicoes.map(async (a) => {
                const imgs = await db.select().from(imagensAquisicoes).where(eq(imagensAquisicoes.aquisicaoId, a.id));
                return { ...a, imagens: imgs };
              })
            );
            resultado.secoes.aquisicoes = aquisicoesComImagens;
            resultado.totais.aquisicoes = listaAquisicoes.length;
            break;
          case "classificados":
            const listaClassificados = await db.select().from(classificados).where(and(
              eq(classificados.condominioId, input.condominioId),
              gte(classificados.createdAt, dataInicio),
              lte(classificados.createdAt, dataFim)
            )).orderBy(desc(classificados.createdAt));
            resultado.secoes.classificados = listaClassificados;
            resultado.totais.classificados = listaClassificados.length;
            break;
          case "achadosPerdidos":
            const listaAchadosPerdidos = await db.select().from(achadosPerdidos).where(and(
              eq(achadosPerdidos.condominioId, input.condominioId),
              gte(achadosPerdidos.createdAt, dataInicio),
              lte(achadosPerdidos.createdAt, dataFim)
            )).orderBy(desc(achadosPerdidos.createdAt));
            const achadosComImagens = await Promise.all(
              listaAchadosPerdidos.map(async (a) => {
                const imgs = await db.select().from(imagensAchadosPerdidos).where(eq(imagensAchadosPerdidos.achadoPerdidoId, a.id));
                return { ...a, imagens: imgs };
              })
            );
            resultado.secoes.achadosPerdidos = achadosComImagens;
            resultado.totais.achadosPerdidos = listaAchadosPerdidos.length;
            break;
          case "caronas":
            const listaCaronas = await db.select().from(caronas).where(and(
              eq(caronas.condominioId, input.condominioId),
              gte(caronas.createdAt, dataInicio),
              lte(caronas.createdAt, dataFim)
            )).orderBy(desc(caronas.createdAt));
            resultado.secoes.caronas = listaCaronas;
            resultado.totais.caronas = listaCaronas.length;
            break;
          case "estacionamento":
            const listaVagas = await db.select().from(vagasEstacionamento).where(eq(vagasEstacionamento.condominioId, input.condominioId)).orderBy(vagasEstacionamento.numero);
            resultado.secoes.estacionamento = listaVagas;
            resultado.totais.estacionamento = listaVagas.length;
            break;
          case "albuns":
            const listaAlbuns = await db.select().from(albuns).where(and(
              eq(albuns.condominioId, input.condominioId),
              gte(albuns.createdAt, dataInicio),
              lte(albuns.createdAt, dataFim)
            )).orderBy(desc(albuns.createdAt));
            const albunsComFotos = await Promise.all(
              listaAlbuns.map(async (a) => {
                const fotosAlbum = await db.select().from(fotos).where(eq(fotos.albumId, a.id));
                return { ...a, fotos: fotosAlbum };
              })
            );
            resultado.secoes.albuns = albunsComFotos;
            resultado.totais.albuns = listaAlbuns.length;
            break;
          case "telefonesUteis":
            const revistasParaTelefones = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsTel = revistasParaTelefones.map((r) => r.id);
            let listaTelefones = [];
            if (revistaIdsTel.length > 0) {
              listaTelefones = await db.select().from(telefonesUteis).where(inArray(telefonesUteis.revistaId, revistaIdsTel)).orderBy(telefonesUteis.nome);
            }
            resultado.secoes.telefonesUteis = listaTelefones;
            resultado.totais.telefonesUteis = listaTelefones.length;
            break;
          case "linksUteis":
            const revistasParaLinks = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIdsLink = revistasParaLinks.map((r) => r.id);
            let listaLinks = [];
            if (revistaIdsLink.length > 0) {
              listaLinks = await db.select().from(linksUteis).where(inArray(linksUteis.revistaId, revistaIdsLink)).orderBy(linksUteis.titulo);
            }
            resultado.secoes.linksUteis = listaLinks;
            resultado.totais.linksUteis = listaLinks.length;
            break;
          case "publicidades":
            const listaPublicidades = await db.select().from(publicidades).where(eq(publicidades.condominioId, input.condominioId)).orderBy(desc(publicidades.createdAt));
            resultado.secoes.publicidades = listaPublicidades;
            resultado.totais.publicidades = listaPublicidades.length;
            break;
          case "anunciantes":
            const listaAnunciantes = await db.select().from(anunciantes).where(eq(anunciantes.condominioId, input.condominioId)).orderBy(anunciantes.nome);
            resultado.secoes.anunciantes = listaAnunciantes;
            resultado.totais.anunciantes = listaAnunciantes.length;
            break;
          case "dicasSeguranca":
            const listaDicas = await db.select().from(dicasSeguranca).where(eq(dicasSeguranca.condominioId, input.condominioId)).orderBy(dicasSeguranca.titulo);
            resultado.secoes.dicasSeguranca = listaDicas;
            resultado.totais.dicasSeguranca = listaDicas.length;
            break;
          case "regrasNormas":
            const listaRegras = await db.select().from(regrasNormas).where(eq(regrasNormas.condominioId, input.condominioId)).orderBy(regrasNormas.titulo);
            resultado.secoes.regrasNormas = listaRegras;
            resultado.totais.regrasNormas = listaRegras.length;
            break;
          case "infracoes":
            const listaInfracoes = await db.select().from(notificacoesInfracao).where(and(
              eq(notificacoesInfracao.condominioId, input.condominioId),
              gte(notificacoesInfracao.createdAt, dataInicio),
              lte(notificacoesInfracao.createdAt, dataFim)
            )).orderBy(desc(notificacoesInfracao.createdAt));
            resultado.secoes.infracoes = listaInfracoes;
            resultado.totais.infracoes = listaInfracoes.length;
            break;
          case "destaques":
            const listaDestaques = await db.select().from(destaques).where(and(
              eq(destaques.condominioId, input.condominioId),
              gte(destaques.createdAt, dataInicio),
              lte(destaques.createdAt, dataFim)
            )).orderBy(desc(destaques.createdAt));
            const destaquesComImagens = await Promise.all(
              listaDestaques.map(async (d) => {
                const imgs = await db.select().from(imagensDestaques).where(eq(imagensDestaques.destaqueId, d.id));
                return { ...d, imagens: imgs };
              })
            );
            resultado.secoes.destaques = destaquesComImagens;
            resultado.totais.destaques = listaDestaques.length;
            break;
          case "vencimentos":
            const listaVencimentos = await db.select().from(vencimentos).where(and(
              eq(vencimentos.condominioId, input.condominioId),
              gte(vencimentos.dataVencimento, dataInicio),
              lte(vencimentos.dataVencimento, dataFim)
            )).orderBy(vencimentos.dataVencimento);
            resultado.secoes.vencimentos = listaVencimentos;
            resultado.totais.vencimentos = listaVencimentos.length;
            break;
          case "mensagensSindico":
            const revistasDoCondominio = await db.select({ id: revistas.id }).from(revistas).where(eq(revistas.condominioId, input.condominioId));
            const revistaIds = revistasDoCondominio.map((r) => r.id);
            let listaMensagens = [];
            if (revistaIds.length > 0) {
              listaMensagens = await db.select().from(mensagensSindico).where(inArray(mensagensSindico.revistaId, revistaIds)).orderBy(desc(mensagensSindico.createdAt));
            }
            resultado.secoes.mensagensSindico = listaMensagens;
            resultado.totais.mensagensSindico = listaMensagens.length;
            break;
          case "condominio":
            resultado.secoes.condominio = condominio;
            resultado.totais.condominio = 1;
            break;
        }
      }
      return resultado;
    })
  }),
  // ==================== ORDENS DE SERVIÃO ====================
  ordensServico: router({
    // ========== CONFIGURAÃÃES ==========
    getConfiguracoes: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [config] = await db.select().from(osConfiguracoes).where(eq(osConfiguracoes.condominioId, input.condominioId)).limit(1);
      if (!config) {
        const [result] = await db.insert(osConfiguracoes).values({
          condominioId: input.condominioId,
          habilitarOrcamentos: true,
          habilitarAprovacaoOrcamento: true,
          habilitarGestaoFinanceira: true,
          habilitarRelatoriosGastos: true,
          habilitarVinculoManutencao: true
        });
        return {
          id: result.insertId,
          condominioId: input.condominioId,
          habilitarOrcamentos: true,
          habilitarAprovacaoOrcamento: true,
          habilitarGestaoFinanceira: true,
          habilitarRelatoriosGastos: true,
          habilitarVinculoManutencao: true
        };
      }
      return config;
    }),
    updateConfiguracoes: protectedProcedure.input(z.object({
      condominioId: z.number(),
      habilitarOrcamentos: z.boolean().optional(),
      habilitarAprovacaoOrcamento: z.boolean().optional(),
      habilitarGestaoFinanceira: z.boolean().optional(),
      habilitarRelatoriosGastos: z.boolean().optional(),
      habilitarVinculoManutencao: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { condominioId, ...updates } = input;
      await db.update(osConfiguracoes).set(updates).where(eq(osConfiguracoes.condominioId, condominioId));
      return { success: true };
    }),
    // ========== CATEGORIAS ==========
    getCategorias: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let categorias = await db.select().from(osCategorias).where(and(
        eq(osCategorias.condominioId, input.condominioId),
        eq(osCategorias.ativo, true)
      )).orderBy(asc(osCategorias.nome));
      if (categorias.length === 0) {
        const categoriasPadrao = [
          { nome: "ElÃ©trica", icone: "Zap", cor: "#EAB308" },
          { nome: "HidrÃ¡ulica", icone: "Droplets", cor: "#3B82F6" },
          { nome: "Estrutural", icone: "Building2", cor: "#6B7280" },
          { nome: "Jardinagem", icone: "TreePine", cor: "#22C55E" },
          { nome: "Limpeza", icone: "Sparkles", cor: "#06B6D4" },
          { nome: "Pintura", icone: "Paintbrush", cor: "#EC4899" },
          { nome: "SeguranÃ§a", icone: "Shield", cor: "#EF4444" },
          { nome: "Outros", icone: "MoreHorizontal", cor: "#8B5CF6" }
        ];
        for (const cat of categoriasPadrao) {
          await db.insert(osCategorias).values({
            condominioId: input.condominioId,
            nome: cat.nome,
            icone: cat.icone,
            cor: cat.cor,
            isPadrao: true
          });
        }
        categorias = await db.select().from(osCategorias).where(and(
          eq(osCategorias.condominioId, input.condominioId),
          eq(osCategorias.ativo, true)
        )).orderBy(asc(osCategorias.nome));
      }
      return categorias;
    }),
    createCategoria: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional(),
      icone: z.string().optional(),
      cor: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(osCategorias).values({
        condominioId: input.condominioId,
        nome: input.nome,
        descricao: input.descricao,
        icone: input.icone || "Tag",
        cor: input.cor || "#6B7280",
        isPadrao: false
      });
      return { id: result.insertId, success: true };
    }),
    updateCategoria: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      cor: z.string().optional(),
      icone: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.nome) updateData.nome = input.nome;
      if (input.cor) updateData.cor = input.cor;
      if (input.icone) updateData.icone = input.icone;
      await db.update(osCategorias).set(updateData).where(eq(osCategorias.id, input.id));
      return { success: true };
    }),
    deleteCategoria: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osCategorias).set({ ativo: false }).where(eq(osCategorias.id, input.id));
      return { success: true };
    }),
    // ========== PRIORIDADES ==========
    getPrioridades: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let prioridades = await db.select().from(osPrioridades).where(and(
        eq(osPrioridades.condominioId, input.condominioId),
        eq(osPrioridades.ativo, true)
      )).orderBy(asc(osPrioridades.nivel));
      if (prioridades.length === 0) {
        const prioridadesPadrao = [
          { nome: "Baixa", nivel: 1, cor: "#22C55E", icone: "ArrowDown" },
          { nome: "Normal", nivel: 2, cor: "#3B82F6", icone: "Minus" },
          { nome: "Alta", nivel: 3, cor: "#F97316", icone: "ArrowUp" },
          { nome: "Urgente", nivel: 4, cor: "#EF4444", icone: "AlertTriangle" }
        ];
        for (const prio of prioridadesPadrao) {
          await db.insert(osPrioridades).values({
            condominioId: input.condominioId,
            nome: prio.nome,
            nivel: prio.nivel,
            cor: prio.cor,
            icone: prio.icone,
            isPadrao: true
          });
        }
        prioridades = await db.select().from(osPrioridades).where(and(
          eq(osPrioridades.condominioId, input.condominioId),
          eq(osPrioridades.ativo, true)
        )).orderBy(asc(osPrioridades.nivel));
      }
      return prioridades;
    }),
    createPrioridade: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      nivel: z.number().optional(),
      cor: z.string().optional(),
      icone: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [maxNivel] = await db.select({ max: sql`MAX(nivel)` }).from(osPrioridades).where(eq(osPrioridades.condominioId, input.condominioId));
      const [result] = await db.insert(osPrioridades).values({
        condominioId: input.condominioId,
        nome: input.nome,
        nivel: input.nivel || (maxNivel?.max || 0) + 1,
        cor: input.cor || "#6B7280",
        icone: input.icone || "Flag",
        isPadrao: false
      });
      return { id: result.insertId, success: true };
    }),
    updatePrioridade: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      nivel: z.number().optional(),
      cor: z.string().optional(),
      icone: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.nome) updateData.nome = input.nome;
      if (input.nivel !== void 0) updateData.nivel = input.nivel;
      if (input.cor) updateData.cor = input.cor;
      if (input.icone) updateData.icone = input.icone;
      await db.update(osPrioridades).set(updateData).where(eq(osPrioridades.id, input.id));
      return { success: true };
    }),
    deletePrioridade: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osPrioridades).set({ ativo: false }).where(eq(osPrioridades.id, input.id));
      return { success: true };
    }),
    // ========== STATUS ==========
    getStatus: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let statusList = await db.select().from(osStatus).where(and(
        eq(osStatus.condominioId, input.condominioId),
        eq(osStatus.ativo, true)
      )).orderBy(asc(osStatus.ordem));
      if (statusList.length === 0) {
        const statusPadrao = [
          { nome: "Aberta", ordem: 1, cor: "#3B82F6", icone: "FolderOpen", isFinal: false },
          { nome: "Em AnÃ¡lise", ordem: 2, cor: "#8B5CF6", icone: "Search", isFinal: false },
          { nome: "Aprovada", ordem: 3, cor: "#22C55E", icone: "CheckCircle", isFinal: false },
          { nome: "Em ExecuÃ§Ã£o", ordem: 4, cor: "#F97316", icone: "Wrench", isFinal: false },
          { nome: "Aguardando Material", ordem: 5, cor: "#EAB308", icone: "Package", isFinal: false },
          { nome: "ConcluÃ­da", ordem: 6, cor: "#10B981", icone: "CheckCircle2", isFinal: true },
          { nome: "Cancelada", ordem: 7, cor: "#EF4444", icone: "XCircle", isFinal: true }
        ];
        for (const st of statusPadrao) {
          await db.insert(osStatus).values({
            condominioId: input.condominioId,
            nome: st.nome,
            ordem: st.ordem,
            cor: st.cor,
            icone: st.icone,
            isFinal: st.isFinal,
            isPadrao: true
          });
        }
        statusList = await db.select().from(osStatus).where(and(
          eq(osStatus.condominioId, input.condominioId),
          eq(osStatus.ativo, true)
        )).orderBy(asc(osStatus.ordem));
      }
      return statusList;
    }),
    createStatus: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      cor: z.string().optional(),
      icone: z.string().optional(),
      isFinal: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [maxOrdem] = await db.select({ max: sql`MAX(ordem)` }).from(osStatus).where(eq(osStatus.condominioId, input.condominioId));
      const [result] = await db.insert(osStatus).values({
        condominioId: input.condominioId,
        nome: input.nome,
        ordem: (maxOrdem?.max || 0) + 1,
        cor: input.cor || "#6B7280",
        icone: input.icone || "Circle",
        isFinal: input.isFinal || false,
        isPadrao: false
      });
      return { id: result.insertId, success: true };
    }),
    updateOsStatus: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      ordem: z.number().optional(),
      cor: z.string().optional(),
      icone: z.string().optional(),
      isFinal: z.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.nome) updateData.nome = input.nome;
      if (input.ordem !== void 0) updateData.ordem = input.ordem;
      if (input.cor) updateData.cor = input.cor;
      if (input.icone) updateData.icone = input.icone;
      if (input.isFinal !== void 0) updateData.isFinal = input.isFinal;
      await db.update(osStatus).set(updateData).where(eq(osStatus.id, input.id));
      return { success: true };
    }),
    deleteStatus: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osStatus).set({ ativo: false }).where(eq(osStatus.id, input.id));
      return { success: true };
    }),
    // ========== SETORES ==========
    getSetores: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(osSetores).where(and(
        eq(osSetores.condominioId, input.condominioId),
        eq(osSetores.ativo, true)
      )).orderBy(asc(osSetores.nome));
    }),
    createSetor: protectedProcedure.input(z.object({
      condominioId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(osSetores).values({
        condominioId: input.condominioId,
        nome: input.nome,
        descricao: input.descricao
      });
      return { id: result.insertId, success: true };
    }),
    updateSetor: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.nome) updateData.nome = input.nome;
      if (input.descricao !== void 0) updateData.descricao = input.descricao;
      await db.update(osSetores).set(updateData).where(eq(osSetores.id, input.id));
      return { success: true };
    }),
    deleteSetor: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osSetores).set({ ativo: false }).where(eq(osSetores.id, input.id));
      return { success: true };
    }),
    // ========== ORDENS DE SERVIÃO CRUD ==========
    list: protectedProcedure.input(z.object({
      condominioId: z.number(),
      statusId: z.number().optional(),
      categoriaId: z.number().optional(),
      prioridadeId: z.number().optional(),
      search: z.string().optional(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0)
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(ordensServico.condominioId, input.condominioId)];
      if (input.statusId) conditions.push(eq(ordensServico.statusId, input.statusId));
      if (input.categoriaId) conditions.push(eq(ordensServico.categoriaId, input.categoriaId));
      if (input.prioridadeId) conditions.push(eq(ordensServico.prioridadeId, input.prioridadeId));
      if (input.search) {
        conditions.push(or(
          like(ordensServico.protocolo, `%${input.search}%`),
          like(ordensServico.titulo, `%${input.search}%`)
        ));
      }
      const lista = await db.select().from(ordensServico).where(and(...conditions)).orderBy(desc(ordensServico.createdAt)).limit(input.limit).offset(input.offset);
      const osIds = lista.map((os) => os.id);
      const categorias = await db.select().from(osCategorias).where(eq(osCategorias.condominioId, input.condominioId));
      const prioridades = await db.select().from(osPrioridades).where(eq(osPrioridades.condominioId, input.condominioId));
      const statusList = await db.select().from(osStatus).where(eq(osStatus.condominioId, input.condominioId));
      return lista.map((os) => ({
        ...os,
        categoria: categorias.find((c) => c.id === os.categoriaId),
        prioridade: prioridades.find((p) => p.id === os.prioridadeId),
        status: statusList.find((s) => s.id === os.statusId)
      }));
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [os] = await db.select().from(ordensServico).where(eq(ordensServico.id, input.id)).limit(1);
      if (!os) throw new Error("Ordem de serviÃ§o nÃ£o encontrada");
      const [categoria] = os.categoriaId ? await db.select().from(osCategorias).where(eq(osCategorias.id, os.categoriaId)) : [null];
      const [prioridade] = os.prioridadeId ? await db.select().from(osPrioridades).where(eq(osPrioridades.id, os.prioridadeId)) : [null];
      const [status] = os.statusId ? await db.select().from(osStatus).where(eq(osStatus.id, os.statusId)) : [null];
      const [setor] = os.setorId ? await db.select().from(osSetores).where(eq(osSetores.id, os.setorId)) : [null];
      const responsaveis = await db.select().from(osResponsaveis).where(eq(osResponsaveis.ordemServicoId, os.id));
      const materiais = await db.select().from(osMateriais).where(eq(osMateriais.ordemServicoId, os.id));
      const orcamentos = await db.select().from(osOrcamentos).where(eq(osOrcamentos.ordemServicoId, os.id));
      const timeline = await db.select().from(osTimeline).where(eq(osTimeline.ordemServicoId, os.id)).orderBy(desc(osTimeline.createdAt));
      const imagens = await db.select().from(osImagens).where(eq(osImagens.ordemServicoId, os.id)).orderBy(asc(osImagens.ordem));
      return {
        ...os,
        categoria,
        prioridade,
        status,
        setor,
        responsaveis,
        materiais,
        orcamentos,
        timeline,
        imagens
      };
    }),
    create: protectedProcedure.input(z.object({
      condominioId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      categoriaId: z.number().optional(),
      prioridadeId: z.number().optional(),
      statusId: z.number().optional(),
      setorId: z.number().optional(),
      endereco: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      localizacaoDescricao: z.string().optional(),
      tempoEstimadoDias: z.number().optional(),
      tempoEstimadoHoras: z.number().optional(),
      tempoEstimadoMinutos: z.number().optional(),
      valorEstimado: z.string().optional(),
      manutencaoId: z.number().optional(),
      solicitanteNome: z.string().optional(),
      solicitanteTipo: z.enum(["sindico", "morador", "funcionario", "administradora"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const protocolo = String(Math.floor(1e5 + Math.random() * 9e5));
      const chatToken = nanoid(32);
      const shareToken = nanoid(32);
      let statusId = input.statusId;
      if (!statusId) {
        const [primeiroStatus] = await db.select().from(osStatus).where(and(
          eq(osStatus.condominioId, input.condominioId),
          eq(osStatus.ativo, true)
        )).orderBy(asc(osStatus.ordem)).limit(1);
        statusId = primeiroStatus?.id;
      }
      const [result] = await db.insert(ordensServico).values({
        condominioId: input.condominioId,
        protocolo,
        titulo: input.titulo,
        descricao: input.descricao,
        categoriaId: input.categoriaId,
        prioridadeId: input.prioridadeId,
        statusId,
        setorId: input.setorId,
        endereco: input.endereco,
        latitude: input.latitude,
        longitude: input.longitude,
        localizacaoDescricao: input.localizacaoDescricao,
        tempoEstimadoDias: input.tempoEstimadoDias || 0,
        tempoEstimadoHoras: input.tempoEstimadoHoras || 0,
        tempoEstimadoMinutos: input.tempoEstimadoMinutos || 0,
        valorEstimado: input.valorEstimado,
        manutencaoId: input.manutencaoId,
        chatToken,
        shareToken,
        solicitanteId: ctx.user?.id,
        solicitanteNome: input.solicitanteNome || ctx.user?.name,
        solicitanteTipo: input.solicitanteTipo || "sindico"
      });
      await db.insert(osTimeline).values({
        ordemServicoId: result.insertId,
        tipo: "criacao",
        descricao: "Ordem de serviÃ§o criada",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, protocolo, success: true };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      categoriaId: z.number().optional(),
      prioridadeId: z.number().optional(),
      statusId: z.number().optional(),
      setorId: z.number().optional(),
      endereco: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      localizacaoDescricao: z.string().optional(),
      tempoEstimadoDias: z.number().optional(),
      tempoEstimadoHoras: z.number().optional(),
      tempoEstimadoMinutos: z.number().optional(),
      valorEstimado: z.string().optional(),
      valorReal: z.string().optional(),
      manutencaoId: z.number().nullable().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      const [osAtual] = await db.select().from(ordensServico).where(eq(ordensServico.id, id));
      if (!osAtual) throw new Error("Ordem de serviÃ§o nÃ£o encontrada");
      await db.update(ordensServico).set(updates).where(eq(ordensServico.id, id));
      if (input.statusId && input.statusId !== osAtual.statusId) {
        const [novoStatus] = await db.select().from(osStatus).where(eq(osStatus.id, input.statusId));
        await db.insert(osTimeline).values({
          ordemServicoId: id,
          tipo: "status_alterado",
          descricao: `Status alterado para: ${novoStatus?.nome || "Desconhecido"}`,
          usuarioId: ctx.user?.id,
          usuarioNome: ctx.user?.name,
          dadosAnteriores: { statusId: osAtual.statusId },
          dadosNovos: { statusId: input.statusId }
        });
        try {
          if (osAtual.solicitanteId) {
            await db.insert(notificacoes).values({
              userId: osAtual.solicitanteId,
              tipo: "geral",
              titulo: `OS #${osAtual.protocolo} - Status Atualizado`,
              mensagem: `A ordem de serviÃ§o "${osAtual.titulo}" teve o status alterado para: ${novoStatus?.nome || "Desconhecido"}`,
              link: `/dashboard/ordens-servico/${id}`
            });
          }
        } catch (e) {
          console.error("Erro ao enviar notificaÃ§Ã£o de OS:", e);
        }
      }
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(osTimeline).where(eq(osTimeline.ordemServicoId, input.id));
      await db.delete(osChat).where(eq(osChat.ordemServicoId, input.id));
      await db.delete(osImagens).where(eq(osImagens.ordemServicoId, input.id));
      await db.delete(osMateriais).where(eq(osMateriais.ordemServicoId, input.id));
      await db.delete(osOrcamentos).where(eq(osOrcamentos.ordemServicoId, input.id));
      await db.delete(osResponsaveis).where(eq(osResponsaveis.ordemServicoId, input.id));
      await db.delete(ordensServico).where(eq(ordensServico.id, input.id));
      return { success: true };
    }),
    // ========== INÃCIO/FIM DO SERVIÃO ==========
    iniciarServico: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(ordensServico).set({ dataInicio: /* @__PURE__ */ new Date() }).where(eq(ordensServico.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.id,
        tipo: "inicio_servico",
        descricao: "ServiÃ§o iniciado",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    finalizarServico: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [os] = await db.select().from(ordensServico).where(eq(ordensServico.id, input.id));
      if (!os) throw new Error("Ordem de serviÃ§o nÃ£o encontrada");
      const dataFim = /* @__PURE__ */ new Date();
      let tempoDecorridoMinutos = 0;
      if (os.dataInicio) {
        tempoDecorridoMinutos = Math.floor((dataFim.getTime() - new Date(os.dataInicio).getTime()) / 6e4);
      }
      await db.update(ordensServico).set({ dataFim, tempoDecorridoMinutos }).where(eq(ordensServico.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.id,
        tipo: "fim_servico",
        descricao: `ServiÃ§o finalizado. Tempo total: ${Math.floor(tempoDecorridoMinutos / 60)}h ${tempoDecorridoMinutos % 60}min`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true, tempoDecorridoMinutos };
    }),
    // ========== RESPONSÃVEIS ==========
    addResponsavel: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      nome: z.string().min(1),
      cargo: z.string().optional(),
      telefone: z.string().optional(),
      email: z.string().optional(),
      funcionarioId: z.number().optional(),
      principal: z.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(osResponsaveis).values(input);
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "responsavel_adicionado",
        descricao: `ResponsÃ¡vel adicionado: ${input.nome}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, success: true };
    }),
    removeResponsavel: protectedProcedure.input(z.object({ id: z.number(), ordemServicoId: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [resp] = await db.select().from(osResponsaveis).where(eq(osResponsaveis.id, input.id));
      await db.delete(osResponsaveis).where(eq(osResponsaveis.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "responsavel_removido",
        descricao: `ResponsÃ¡vel removido: ${resp?.nome || "Desconhecido"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    // ========== MATERIAIS ==========
    addMaterial: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional(),
      quantidade: z.number().optional(),
      unidade: z.string().optional(),
      emEstoque: z.boolean().optional(),
      precisaPedir: z.boolean().optional(),
      pedidoDescricao: z.string().optional(),
      valorUnitario: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const valorTotal = input.valorUnitario && input.quantidade ? String(parseFloat(input.valorUnitario) * input.quantidade) : void 0;
      const [result] = await db.insert(osMateriais).values({
        ...input,
        valorTotal
      });
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "material_adicionado",
        descricao: `Material adicionado: ${input.nome} (${input.quantidade || 1} ${input.unidade || "un"})`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, success: true };
    }),
    removeMaterial: protectedProcedure.input(z.object({ id: z.number(), ordemServicoId: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [mat] = await db.select().from(osMateriais).where(eq(osMateriais.id, input.id));
      await db.delete(osMateriais).where(eq(osMateriais.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "material_removido",
        descricao: `Material removido: ${mat?.nome || "Desconhecido"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    // ========== ORÃAMENTOS ==========
    addOrcamento: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      fornecedor: z.string().optional(),
      descricao: z.string().optional(),
      valor: z.string(),
      dataValidade: z.string().optional(),
      anexoUrl: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(osOrcamentos).values({
        ordemServicoId: input.ordemServicoId,
        fornecedor: input.fornecedor,
        descricao: input.descricao,
        valor: input.valor,
        dataValidade: input.dataValidade ? new Date(input.dataValidade) : void 0,
        anexoUrl: input.anexoUrl
      });
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "orcamento_adicionado",
        descricao: `OrÃ§amento adicionado: R$ ${input.valor} - ${input.fornecedor || "Sem fornecedor"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, success: true };
    }),
    aprovarOrcamento: protectedProcedure.input(z.object({ id: z.number(), ordemServicoId: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osOrcamentos).set({
        aprovado: true,
        aprovadoPor: ctx.user?.id,
        dataAprovacao: /* @__PURE__ */ new Date()
      }).where(eq(osOrcamentos.id, input.id));
      const [orc] = await db.select().from(osOrcamentos).where(eq(osOrcamentos.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "orcamento_aprovado",
        descricao: `OrÃ§amento aprovado: R$ ${orc?.valor} - ${orc?.fornecedor || "Sem fornecedor"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    rejeitarOrcamento: protectedProcedure.input(z.object({ id: z.number(), ordemServicoId: z.number(), motivo: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(osOrcamentos).set({
        aprovado: false,
        motivoRejeicao: input.motivo
      }).where(eq(osOrcamentos.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "orcamento_rejeitado",
        descricao: `OrÃ§amento rejeitado${input.motivo ? `: ${input.motivo}` : ""}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    removeOrcamento: protectedProcedure.input(z.object({ id: z.number(), ordemServicoId: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(osOrcamentos).where(eq(osOrcamentos.id, input.id));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "orcamento_removido",
        descricao: "OrÃ§amento removido",
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { success: true };
    }),
    // ========== IMAGENS ==========
    addImagem: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      url: z.string(),
      tipo: z.enum(["antes", "durante", "depois", "orcamento", "outro"]).optional(),
      descricao: z.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [maxOrdem] = await db.select({ max: sql`MAX(ordem)` }).from(osImagens).where(eq(osImagens.ordemServicoId, input.ordemServicoId));
      const [result] = await db.insert(osImagens).values({
        ordemServicoId: input.ordemServicoId,
        url: input.url,
        tipo: input.tipo || "outro",
        descricao: input.descricao,
        ordem: (maxOrdem?.max || 0) + 1
      });
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "foto_adicionada",
        descricao: `Foto adicionada: ${input.tipo || "outro"}`,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, success: true };
    }),
    removeImagem: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(osImagens).where(eq(osImagens.id, input.id));
      return { success: true };
    }),
    // ========== CHAT ==========
    getChat: protectedProcedure.input(z.object({ ordemServicoId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(osChat).where(eq(osChat.ordemServicoId, input.ordemServicoId)).orderBy(asc(osChat.createdAt));
    }),
    sendMessage: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      mensagem: z.string().optional(),
      anexoUrl: z.string().optional(),
      anexoNome: z.string().optional(),
      anexoTipo: z.string().optional(),
      anexoTamanho: z.number().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!input.mensagem && !input.anexoUrl) {
        throw new Error("Mensagem ou anexo Ã© obrigatÃ³rio");
      }
      const [result] = await db.insert(osChat).values({
        ordemServicoId: input.ordemServicoId,
        remetenteId: ctx.user?.id,
        remetenteNome: ctx.user?.name || "UsuÃ¡rio",
        remetenteTipo: "sindico",
        mensagem: input.mensagem || null,
        anexoUrl: input.anexoUrl || null,
        anexoNome: input.anexoNome || null,
        anexoTipo: input.anexoTipo || null,
        anexoTamanho: input.anexoTamanho || null
      });
      return { id: result.insertId, success: true };
    }),
    // Chat pÃºblico via token
    getChatByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [os] = await db.select().from(ordensServico).where(eq(ordensServico.chatToken, input.token)).limit(1);
      if (!os || !os.chatAtivo) throw new Error("Chat nÃ£o encontrado ou inativo");
      const mensagens = await db.select().from(osChat).where(eq(osChat.ordemServicoId, os.id)).orderBy(asc(osChat.createdAt));
      return { os, mensagens };
    }),
    sendMessageByToken: publicProcedure.input(z.object({
      token: z.string(),
      nome: z.string().min(1),
      mensagem: z.string().optional(),
      anexoUrl: z.string().optional(),
      anexoNome: z.string().optional(),
      anexoTipo: z.string().optional(),
      anexoTamanho: z.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!input.mensagem && !input.anexoUrl) {
        throw new Error("Mensagem ou anexo Ã© obrigatÃ³rio");
      }
      const [os] = await db.select().from(ordensServico).where(eq(ordensServico.chatToken, input.token)).limit(1);
      if (!os || !os.chatAtivo) throw new Error("Chat nÃ£o encontrado ou inativo");
      const [result] = await db.insert(osChat).values({
        ordemServicoId: os.id,
        remetenteNome: input.nome,
        remetenteTipo: "visitante",
        mensagem: input.mensagem || null,
        anexoUrl: input.anexoUrl || null,
        anexoNome: input.anexoNome || null,
        anexoTipo: input.anexoTipo || null,
        anexoTamanho: input.anexoTamanho || null
      });
      return { id: result.insertId, success: true };
    }),
    // ========== TIMELINE ==========
    addComentario: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      descricao: z.string().min(1)
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "comentario",
        descricao: input.descricao,
        usuarioId: ctx.user?.id,
        usuarioNome: ctx.user?.name
      });
      return { id: result.insertId, success: true };
    }),
    // ========== ESTATÃSTICAS ==========
    getEstatisticas: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const todas = await db.select().from(ordensServico).where(eq(ordensServico.condominioId, input.condominioId));
      const statusList = await db.select().from(osStatus).where(eq(osStatus.condominioId, input.condominioId));
      const categorias = await db.select().from(osCategorias).where(eq(osCategorias.condominioId, input.condominioId));
      const porStatus = statusList.map((s) => ({
        ...s,
        total: todas.filter((os) => os.statusId === s.id).length
      }));
      const porCategoria = categorias.map((c) => ({
        ...c,
        total: todas.filter((os) => os.categoriaId === c.id).length
      }));
      const valorEstimadoTotal = todas.reduce((acc, os) => acc + parseFloat(os.valorEstimado || "0"), 0);
      const valorRealTotal = todas.reduce((acc, os) => acc + parseFloat(os.valorReal || "0"), 0);
      const concluidas = todas.filter((os) => os.dataFim && os.dataInicio);
      const tempoMedioMinutos = concluidas.length > 0 ? concluidas.reduce((acc, os) => acc + (os.tempoDecorridoMinutos || 0), 0) / concluidas.length : 0;
      return {
        total: todas.length,
        porStatus,
        porCategoria,
        valorEstimadoTotal,
        valorRealTotal,
        tempoMedioMinutos,
        abertas: todas.filter((os) => !statusList.find((s) => s.id === os.statusId)?.isFinal).length,
        concluidas: concluidas.length
      };
    }),
    // ========== COMPARTILHAMENTO ==========
    getByShareToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [os] = await db.select().from(ordensServico).where(eq(ordensServico.shareToken, input.token)).limit(1);
      if (!os) throw new Error("Ordem de serviÃ§o nÃ£o encontrada");
      const [categoria] = os.categoriaId ? await db.select().from(osCategorias).where(eq(osCategorias.id, os.categoriaId)) : [null];
      const [prioridade] = os.prioridadeId ? await db.select().from(osPrioridades).where(eq(osPrioridades.id, os.prioridadeId)) : [null];
      const [status] = os.statusId ? await db.select().from(osStatus).where(eq(osStatus.id, os.statusId)) : [null];
      const imagens = await db.select().from(osImagens).where(eq(osImagens.ordemServicoId, os.id)).orderBy(asc(osImagens.ordem));
      const timeline = await db.select().from(osTimeline).where(eq(osTimeline.ordemServicoId, os.id)).orderBy(desc(osTimeline.createdAt));
      return {
        ...os,
        categoria,
        prioridade,
        status,
        imagens,
        timeline
      };
    }),
    // ========== LOCALIZAÃÃO ==========
    updateLocalizacao: protectedProcedure.input(z.object({
      ordemServicoId: z.number(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      endereco: z.string().nullable()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(ordensServico).set({
        latitude: input.latitude?.toString() || null,
        longitude: input.longitude?.toString() || null,
        endereco: input.endereco
      }).where(eq(ordensServico.id, input.ordemServicoId));
      await db.insert(osTimeline).values({
        ordemServicoId: input.ordemServicoId,
        tipo: "localizacao_atualizada",
        descricao: `LocalizaÃ§Ã£o atualizada: ${input.endereco || "Coordenadas atualizadas"}`,
        usuarioId: ctx.user.id,
        usuarioNome: ctx.user.name || "UsuÃ¡rio"
      });
      return { success: true };
    })
  }),
  // ==================== FUNÃÃES RÃPIDAS ====================
  funcoesRapidas: router({
    // Listar funÃ§Ãµes rÃ¡pidas do condomÃ­nio
    listar: protectedProcedure.input(z.object({ condominioId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const funcoes = await db.select().from(funcoesRapidas).where(eq(funcoesRapidas.condominioId, input.condominioId)).orderBy(asc(funcoesRapidas.ordem));
      return funcoes;
    }),
    // Adicionar funÃ§Ã£o rÃ¡pida
    adicionar: protectedProcedure.input(z.object({
      condominioId: z.number(),
      funcaoId: z.string(),
      nome: z.string(),
      path: z.string(),
      icone: z.string(),
      cor: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existente = await db.select().from(funcoesRapidas).where(and(
        eq(funcoesRapidas.condominioId, input.condominioId),
        eq(funcoesRapidas.funcaoId, input.funcaoId)
      )).limit(1);
      if (existente.length > 0) {
        throw new Error("Esta funÃ§Ã£o jÃ¡ estÃ¡ nas funÃ§Ãµes rÃ¡pidas");
      }
      const total = await db.select({ count: sql`count(*)` }).from(funcoesRapidas).where(eq(funcoesRapidas.condominioId, input.condominioId));
      if (total[0].count >= 12) {
        throw new Error("Limite de 12 funÃ§Ãµes rÃ¡pidas atingido. Remova uma para adicionar outra.");
      }
      const [result] = await db.insert(funcoesRapidas).values({
        condominioId: input.condominioId,
        funcaoId: input.funcaoId,
        nome: input.nome,
        path: input.path,
        icone: input.icone,
        cor: input.cor,
        ordem: total[0].count
      });
      return { success: true, id: result.insertId };
    }),
    // Remover funÃ§Ã£o rÃ¡pida
    remover: protectedProcedure.input(z.object({
      condominioId: z.number(),
      funcaoId: z.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(funcoesRapidas).where(and(
        eq(funcoesRapidas.condominioId, input.condominioId),
        eq(funcoesRapidas.funcaoId, input.funcaoId)
      ));
      return { success: true };
    }),
    // Verificar se funÃ§Ã£o estÃ¡ nas rÃ¡pidas
    verificar: protectedProcedure.input(z.object({
      condominioId: z.number(),
      funcaoId: z.string()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existente = await db.select().from(funcoesRapidas).where(and(
        eq(funcoesRapidas.condominioId, input.condominioId),
        eq(funcoesRapidas.funcaoId, input.funcaoId)
      )).limit(1);
      return { existe: existente.length > 0 };
    }),
    // Reordenar funÃ§Ãµes rÃ¡pidas
    reordenar: protectedProcedure.input(z.object({
      condominioId: z.number(),
      ordens: z.array(z.object({
        funcaoId: z.string(),
        ordem: z.number()
      }))
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (const item of input.ordens) {
        await db.update(funcoesRapidas).set({ ordem: item.ordem }).where(and(
          eq(funcoesRapidas.condominioId, input.condominioId),
          eq(funcoesRapidas.funcaoId, item.funcaoId)
        ));
      }
      return { success: true };
    })
  })
});
async function generateInfracoesPDF(htmlContent: string): Promise<Buffer> {
  // TODO: Implementar geração de PDF com puppeteer
  console.warn("generateInfracoesPDF: puppeteer não disponível, retornando HTML como buffer");
  return Buffer.from(htmlContent, "utf-8");
}
async function generateVencimentosPDF(htmlContent: string): Promise<Buffer> {
  // TODO: Implementar geração de PDF com puppeteer
  console.warn("generateVencimentosPDF: puppeteer não disponível, retornando HTML como buffer");
  return Buffer.from(htmlContent, "utf-8");
}


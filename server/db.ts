import { drizzle } from "drizzle-orm/mysql2";
import { users, vencimentos, vencimentoAlertas, vencimentoEmails, vencimentoNotificacoes } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { desc, and, lte, gte, sql, eq } from "drizzle-orm";
let _db = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
export async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
export async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
export async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
export async function getUserById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
export async function createLocalUser(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const result = await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    senha: data.senha,
    loginMethod: "local",
    role: "sindico",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return result[0].insertId;
}
export async function updateUserPassword(userId, senhaHash) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ senha: senhaHash }).where(eq(users.id, userId));
}
export async function setUserResetToken(userId, token, expira) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ resetToken: token, resetTokenExpira: expira }).where(eq(users.id, userId));
}
export async function getUserByResetToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
export async function clearUserResetToken(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ resetToken: null, resetTokenExpira: null }).where(eq(users.id, userId));
}
export async function updateUserLastSignedIn(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
}
export async function createVencimento(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vencimentos).values(data);
  return result[0].insertId;
}
export async function updateVencimento(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vencimentos).set(data).where(eq(vencimentos.id, id));
}
export async function deleteVencimento(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, id));
  await db.delete(vencimentoNotificacoes).where(eq(vencimentoNotificacoes.vencimentoId, id));
  await db.delete(vencimentos).where(eq(vencimentos.id, id));
}
export async function getVencimentosByCondominioAndTipo(condominioId, tipo) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vencimentos).where(and(eq(vencimentos.condominioId, condominioId), eq(vencimentos.tipo, tipo))).orderBy(desc(vencimentos.dataVencimento));
}
export async function getVencimentoById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(vencimentos).where(eq(vencimentos.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
export async function getVencimentosProximos(condominioId, dias = 30) {
  const db = await getDb();
  if (!db) return [];
  const hoje = /* @__PURE__ */ new Date();
  const limite = /* @__PURE__ */ new Date();
  limite.setDate(limite.getDate() + dias);
  return db.select().from(vencimentos).where(and(
    eq(vencimentos.condominioId, condominioId),
    gte(vencimentos.dataVencimento, hoje),
    lte(vencimentos.dataVencimento, limite),
    eq(vencimentos.status, "ativo")
  )).orderBy(vencimentos.dataVencimento);
}
export async function getVencimentosVencidos(condominioId) {
  const db = await getDb();
  if (!db) return [];
  const hoje = /* @__PURE__ */ new Date();
  return db.select().from(vencimentos).where(and(
    eq(vencimentos.condominioId, condominioId),
    lte(vencimentos.dataVencimento, hoje),
    eq(vencimentos.status, "ativo")
  )).orderBy(desc(vencimentos.dataVencimento));
}
export async function getVencimentoStats(condominioId) {
  const db = await getDb();
  if (!db) return { total: 0, proximos: 0, vencidos: 0, contratos: 0, servicos: 0, manutencoes: 0 };
  const hoje = /* @__PURE__ */ new Date();
  const em30dias = /* @__PURE__ */ new Date();
  em30dias.setDate(em30dias.getDate() + 30);
  const todos = await db.select().from(vencimentos).where(and(eq(vencimentos.condominioId, condominioId), eq(vencimentos.status, "ativo")));
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
}
export async function createVencimentoAlerta(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vencimentoAlertas).values(data);
  return result[0].insertId;
}
export async function getAlertasByVencimento(vencimentoId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, vencimentoId));
}
export async function updateVencimentoAlerta(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vencimentoAlertas).set(data).where(eq(vencimentoAlertas.id, id));
}
export async function deleteAlertasByVencimento(vencimentoId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vencimentoAlertas).where(eq(vencimentoAlertas.vencimentoId, vencimentoId));
}
export async function getAlertasPendentes() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    alerta: vencimentoAlertas,
    vencimento: vencimentos
  }).from(vencimentoAlertas).innerJoin(vencimentos, eq(vencimentoAlertas.vencimentoId, vencimentos.id)).where(and(
    eq(vencimentoAlertas.ativo, true),
    eq(vencimentoAlertas.enviado, false),
    eq(vencimentos.status, "ativo")
  ));
}
export async function createVencimentoEmail(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vencimentoEmails).values(data);
  return result[0].insertId;
}
export async function getEmailsByCondominio(condominioId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vencimentoEmails).where(eq(vencimentoEmails.condominioId, condominioId));
}
export async function updateVencimentoEmail(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vencimentoEmails).set(data).where(eq(vencimentoEmails.id, id));
}
export async function deleteVencimentoEmail(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vencimentoEmails).where(eq(vencimentoEmails.id, id));
}
export async function createVencimentoNotificacao(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vencimentoNotificacoes).values(data);
  return result[0].insertId;
}
export async function getNotificacoesByVencimento(vencimentoId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vencimentoNotificacoes).where(eq(vencimentoNotificacoes.vencimentoId, vencimentoId)).orderBy(desc(vencimentoNotificacoes.createdAt));
}
export async function getAlertasParaEnviar() {
  const db = await getDb();
  if (!db) return [];
  const hoje = /* @__PURE__ */ new Date();
  hoje.setHours(0, 0, 0, 0);
  const alertas = await db.select({
    alerta: vencimentoAlertas,
    vencimento: vencimentos
  }).from(vencimentoAlertas).innerJoin(vencimentos, eq(vencimentoAlertas.vencimentoId, vencimentos.id)).where(and(
    eq(vencimentoAlertas.ativo, true),
    eq(vencimentoAlertas.enviado, false),
    eq(vencimentos.status, "ativo")
  ));
  return alertas.filter(({ alerta, vencimento }) => {
    const dataVencimento = new Date(vencimento.dataVencimento);
    dataVencimento.setHours(0, 0, 0, 0);
    const diasAntecedencia = {
      "na_data": 0,
      "um_dia_antes": 1,
      "uma_semana_antes": 7,
      "quinze_dias_antes": 15,
      "um_mes_antes": 30
    };
    const diasAntes = diasAntecedencia[alerta.tipoAlerta] || 0;
    const dataAlerta = new Date(dataVencimento);
    dataAlerta.setDate(dataAlerta.getDate() - diasAntes);
    return dataAlerta <= hoje;
  });
}
export async function marcarAlertaComoEnviado(alertaId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vencimentoAlertas).set({ enviado: true, dataEnvio: /* @__PURE__ */ new Date() }).where(eq(vencimentoAlertas.id, alertaId));
}
export async function getAllVencimentosByCondominio(condominioId, filtros) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(vencimentos).where(eq(vencimentos.condominioId, condominioId));
  const conditions = [eq(vencimentos.condominioId, condominioId)];
  if (filtros?.tipo) {
    conditions.push(eq(vencimentos.tipo, filtros.tipo));
  }
  if (filtros?.status) {
    conditions.push(eq(vencimentos.status, filtros.status));
  }
  if (filtros?.dataInicio) {
    conditions.push(gte(vencimentos.dataVencimento, filtros.dataInicio));
  }
  if (filtros?.dataFim) {
    conditions.push(lte(vencimentos.dataVencimento, filtros.dataFim));
  }
  return db.select().from(vencimentos).where(and(...conditions)).orderBy(vencimentos.dataVencimento);
}
export async function getVencimentosPorMes(condominioId, ano) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    mes: sql`MONTH(data_vencimento)`,
    total: sql`COUNT(*)`,
    vencidos: sql`SUM(CASE WHEN data_vencimento < CURDATE() AND status = 'ativo' THEN 1 ELSE 0 END)`,
    ativos: sql`SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END)`
  }).from(vencimentos).where(and(
    eq(vencimentos.condominioId, condominioId),
    sql`YEAR(data_vencimento) = ${ano}`
  )).groupBy(sql`MONTH(data_vencimento)`).orderBy(sql`MONTH(data_vencimento)`);
  return result;
}
export async function getVencimentosPorCategoria(condominioId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    tipo: vencimentos.tipo,
    total: sql`COUNT(*)`,
    vencidos: sql`SUM(CASE WHEN data_vencimento < CURDATE() AND status = 'ativo' THEN 1 ELSE 0 END)`,
    ativos: sql`SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END)`,
    valorTotal: sql`COALESCE(SUM(valor), 0)`
  }).from(vencimentos).where(eq(vencimentos.condominioId, condominioId)).groupBy(vencimentos.tipo);
  return result;
}
export async function getVencimentosPorStatus(condominioId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    status: vencimentos.status,
    total: sql`COUNT(*)`,
    valorTotal: sql`COALESCE(SUM(valor), 0)`
  }).from(vencimentos).where(eq(vencimentos.condominioId, condominioId)).groupBy(vencimentos.status);
  return result;
}
export async function getProximosVencimentos(condominioId, dias = 30) {
  const db = await getDb();
  if (!db) return [];
  const hoje = /* @__PURE__ */ new Date();
  const dataLimite = /* @__PURE__ */ new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  return db.select().from(vencimentos).where(and(
    eq(vencimentos.condominioId, condominioId),
    eq(vencimentos.status, "ativo"),
    gte(vencimentos.dataVencimento, hoje),
    lte(vencimentos.dataVencimento, dataLimite)
  )).orderBy(vencimentos.dataVencimento);
}
export async function getEstatisticasGeraisVencimentos(condominioId) {
  const db = await getDb();
  if (!db) return null;
  const hoje = /* @__PURE__ */ new Date();
  const proximos30 = /* @__PURE__ */ new Date();
  proximos30.setDate(proximos30.getDate() + 30);
  const result = await db.select({
    total: sql`COUNT(*)`,
    ativos: sql`SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END)`,
    vencidos: sql`SUM(CASE WHEN data_vencimento < CURDATE() AND status = 'ativo' THEN 1 ELSE 0 END)`,
    proximos30dias: sql`SUM(CASE WHEN data_vencimento >= CURDATE() AND data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'ativo' THEN 1 ELSE 0 END)`,
    valorTotalAtivo: sql`COALESCE(SUM(CASE WHEN status = 'ativo' THEN valor ELSE 0 END), 0)`,
    contratos: sql`SUM(CASE WHEN tipo = 'contrato' THEN 1 ELSE 0 END)`,
    servicos: sql`SUM(CASE WHEN tipo = 'servico' THEN 1 ELSE 0 END)`,
    manutencoes: sql`SUM(CASE WHEN tipo = 'manutencao' THEN 1 ELSE 0 END)`
  }).from(vencimentos).where(eq(vencimentos.condominioId, condominioId));
  return result[0] || null;
}
export async function getEvolucaoVencimentos(condominioId, meses = 12) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    ano: sql`YEAR(data_vencimento)`,
    mes: sql`MONTH(data_vencimento)`,
    total: sql`COUNT(*)`,
    contratos: sql`SUM(CASE WHEN tipo = 'contrato' THEN 1 ELSE 0 END)`,
    servicos: sql`SUM(CASE WHEN tipo = 'servico' THEN 1 ELSE 0 END)`,
    manutencoes: sql`SUM(CASE WHEN tipo = 'manutencao' THEN 1 ELSE 0 END)`,
    valorTotal: sql`COALESCE(SUM(valor), 0)`
  }).from(vencimentos).where(and(
    eq(vencimentos.condominioId, condominioId),
    sql`data_vencimento >= DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH)`
  )).groupBy(sql`YEAR(data_vencimento)`, sql`MONTH(data_vencimento)`).orderBy(sql`YEAR(data_vencimento)`, sql`MONTH(data_vencimento)`);
  return result;
}
import { condominioFuncoes, FUNCOES_DISPONIVEIS } from "../drizzle/schema";
export async function getFuncoesCondominio(condominioId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(condominioFuncoes).where(eq(condominioFuncoes.condominioId, condominioId));
  return result;
}
export async function getFuncoesHabilitadas(condominioId) {
  const db = await getDb();
  if (!db) return FUNCOES_DISPONIVEIS.map((f) => f.id);
  const result = await db.select().from(condominioFuncoes).where(and(
    eq(condominioFuncoes.condominioId, condominioId),
    eq(condominioFuncoes.habilitada, true)
  ));
  if (result.length === 0) {
    return FUNCOES_DISPONIVEIS.map((f) => f.id);
  }
  return result.map((r) => r.funcaoId);
}
export async function setFuncaoHabilitada(condominioId, funcaoId, habilitada) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(condominioFuncoes).where(and(
    eq(condominioFuncoes.condominioId, condominioId),
    eq(condominioFuncoes.funcaoId, funcaoId)
  ));
  if (existing.length > 0) {
    await db.update(condominioFuncoes).set({ habilitada }).where(and(
      eq(condominioFuncoes.condominioId, condominioId),
      eq(condominioFuncoes.funcaoId, funcaoId)
    ));
  } else {
    await db.insert(condominioFuncoes).values({
      condominioId,
      funcaoId,
      habilitada
    });
  }
  return { condominioId, funcaoId, habilitada };
}
export async function setMultiplasFuncoesHabilitadas(condominioId, funcoes) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const funcao of funcoes) {
    await setFuncaoHabilitada(condominioId, funcao.funcaoId, funcao.habilitada);
  }
  return { condominioId, updated: funcoes.length };
}
export async function inicializarFuncoesCondominio(condominioId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(condominioFuncoes).where(eq(condominioFuncoes.condominioId, condominioId));
  if (existing.length > 0) {
    return { condominioId, initialized: false, message: "FunÃ§Ãµes jÃ¡ inicializadas" };
  }
  for (const funcao of FUNCOES_DISPONIVEIS) {
    await db.insert(condominioFuncoes).values({
      condominioId,
      funcaoId: funcao.id,
      habilitada: true
    });
  }
  return { condominioId, initialized: true, count: FUNCOES_DISPONIVEIS.length };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRyaXp6bGUgfSBmcm9tIFwiZHJpenpsZS1vcm0vbXlzcWwyXCI7XG5pbXBvcnQgeyBJbnNlcnRVc2VyLCB1c2VycywgdmVuY2ltZW50b3MsIHZlbmNpbWVudG9BbGVydGFzLCB2ZW5jaW1lbnRvRW1haWxzLCB2ZW5jaW1lbnRvTm90aWZpY2Fjb2VzLCBJbnNlcnRWZW5jaW1lbnRvLCBJbnNlcnRWZW5jaW1lbnRvQWxlcnRhLCBJbnNlcnRWZW5jaW1lbnRvRW1haWwsIEluc2VydFZlbmNpbWVudG9Ob3RpZmljYWNhbyB9IGZyb20gXCIuLi9kcml6emxlL3NjaGVtYVwiO1xuaW1wb3J0IHsgRU5WIH0gZnJvbSAnLi9fY29yZS9lbnYnO1xuaW1wb3J0IHsgZGVzYywgYW5kLCBsdGUsIGd0ZSwgc3FsLCBlcSB9IGZyb20gXCJkcml6emxlLW9ybVwiO1xuXG5sZXQgX2RiOiBSZXR1cm5UeXBlPHR5cGVvZiBkcml6emxlPiB8IG51bGwgPSBudWxsO1xuXG4vLyBMYXppbHkgY3JlYXRlIHRoZSBkcml6emxlIGluc3RhbmNlIHNvIGxvY2FsIHRvb2xpbmcgY2FuIHJ1biB3aXRob3V0IGEgREIuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGIoKSB7XG4gIGlmICghX2RiICYmIHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCkge1xuICAgIHRyeSB7XG4gICAgICBfZGIgPSBkcml6emxlKHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIltEYXRhYmFzZV0gRmFpbGVkIHRvIGNvbm5lY3Q6XCIsIGVycm9yKTtcbiAgICAgIF9kYiA9IG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBfZGI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cHNlcnRVc2VyKHVzZXI6IEluc2VydFVzZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCF1c2VyLm9wZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVzZXIgb3BlbklkIGlzIHJlcXVpcmVkIGZvciB1cHNlcnRcIik7XG4gIH1cblxuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHtcbiAgICBjb25zb2xlLndhcm4oXCJbRGF0YWJhc2VdIENhbm5vdCB1cHNlcnQgdXNlcjogZGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlczogSW5zZXJ0VXNlciA9IHtcbiAgICAgIG9wZW5JZDogdXNlci5vcGVuSWQsXG4gICAgfTtcbiAgICBjb25zdCB1cGRhdGVTZXQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICBjb25zdCB0ZXh0RmllbGRzID0gW1wibmFtZVwiLCBcImVtYWlsXCIsIFwibG9naW5NZXRob2RcIl0gYXMgY29uc3Q7XG4gICAgdHlwZSBUZXh0RmllbGQgPSAodHlwZW9mIHRleHRGaWVsZHMpW251bWJlcl07XG5cbiAgICBjb25zdCBhc3NpZ25OdWxsYWJsZSA9IChmaWVsZDogVGV4dEZpZWxkKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHVzZXJbZmllbGRdO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZSA/PyBudWxsO1xuICAgICAgdmFsdWVzW2ZpZWxkXSA9IG5vcm1hbGl6ZWQ7XG4gICAgICB1cGRhdGVTZXRbZmllbGRdID0gbm9ybWFsaXplZDtcbiAgICB9O1xuXG4gICAgdGV4dEZpZWxkcy5mb3JFYWNoKGFzc2lnbk51bGxhYmxlKTtcblxuICAgIGlmICh1c2VyLmxhc3RTaWduZWRJbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YWx1ZXMubGFzdFNpZ25lZEluID0gdXNlci5sYXN0U2lnbmVkSW47XG4gICAgICB1cGRhdGVTZXQubGFzdFNpZ25lZEluID0gdXNlci5sYXN0U2lnbmVkSW47XG4gICAgfVxuICAgIGlmICh1c2VyLnJvbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFsdWVzLnJvbGUgPSB1c2VyLnJvbGU7XG4gICAgICB1cGRhdGVTZXQucm9sZSA9IHVzZXIucm9sZTtcbiAgICB9IGVsc2UgaWYgKHVzZXIub3BlbklkID09PSBFTlYub3duZXJPcGVuSWQpIHtcbiAgICAgIHZhbHVlcy5yb2xlID0gJ2FkbWluJztcbiAgICAgIHVwZGF0ZVNldC5yb2xlID0gJ2FkbWluJztcbiAgICB9XG5cbiAgICBpZiAoIXZhbHVlcy5sYXN0U2lnbmVkSW4pIHtcbiAgICAgIHZhbHVlcy5sYXN0U2lnbmVkSW4gPSBuZXcgRGF0ZSgpO1xuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyh1cGRhdGVTZXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdXBkYXRlU2V0Lmxhc3RTaWduZWRJbiA9IG5ldyBEYXRlKCk7XG4gICAgfVxuXG4gICAgYXdhaXQgZGIuaW5zZXJ0KHVzZXJzKS52YWx1ZXModmFsdWVzKS5vbkR1cGxpY2F0ZUtleVVwZGF0ZSh7XG4gICAgICBzZXQ6IHVwZGF0ZVNldCxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW0RhdGFiYXNlXSBGYWlsZWQgdG8gdXBzZXJ0IHVzZXI6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckJ5T3BlbklkKG9wZW5JZDogc3RyaW5nKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikge1xuICAgIGNvbnNvbGUud2FybihcIltEYXRhYmFzZV0gQ2Fubm90IGdldCB1c2VyOiBkYXRhYmFzZSBub3QgYXZhaWxhYmxlXCIpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHVzZXJzKS53aGVyZShlcSh1c2Vycy5vcGVuSWQsIG9wZW5JZCkpLmxpbWl0KDEpO1xuXG4gIHJldHVybiByZXN1bHQubGVuZ3RoID4gMCA/IHJlc3VsdFswXSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFVzZXJCeUVtYWlsKGVtYWlsOiBzdHJpbmcpIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSB7XG4gICAgY29uc29sZS53YXJuKFwiW0RhdGFiYXNlXSBDYW5ub3QgZ2V0IHVzZXI6IGRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCgpLmZyb20odXNlcnMpLndoZXJlKGVxKHVzZXJzLmVtYWlsLCBlbWFpbCkpLmxpbWl0KDEpO1xuXG4gIHJldHVybiByZXN1bHQubGVuZ3RoID4gMCA/IHJlc3VsdFswXSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFVzZXJCeUlkKGlkOiBudW1iZXIpIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSB7XG4gICAgY29uc29sZS53YXJuKFwiW0RhdGFiYXNlXSBDYW5ub3QgZ2V0IHVzZXI6IGRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCgpLmZyb20odXNlcnMpLndoZXJlKGVxKHVzZXJzLmlkLCBpZCkpLmxpbWl0KDEpO1xuXG4gIHJldHVybiByZXN1bHQubGVuZ3RoID4gMCA/IHJlc3VsdFswXSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUxvY2FsVXNlcihkYXRhOiB7IGVtYWlsOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2VuaGE6IHN0cmluZyB9KSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcblxuICAvLyBHZXJhciBvcGVuSWQgw7puaWNvIHBhcmEgdXRpbGl6YWRvcmVzIGxvY2Fpc1xuICBjb25zdCBvcGVuSWQgPSBgbG9jYWxfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSl9YDtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmluc2VydCh1c2VycykudmFsdWVzKHtcbiAgICBvcGVuSWQsXG4gICAgZW1haWw6IGRhdGEuZW1haWwsXG4gICAgbmFtZTogZGF0YS5uYW1lLFxuICAgIHNlbmhhOiBkYXRhLnNlbmhhLFxuICAgIGxvZ2luTWV0aG9kOiAnbG9jYWwnLFxuICAgIHJvbGU6ICdzaW5kaWNvJyxcbiAgICBsYXN0U2lnbmVkSW46IG5ldyBEYXRlKCksXG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRbMF0uaW5zZXJ0SWQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVVc2VyUGFzc3dvcmQodXNlcklkOiBudW1iZXIsIHNlbmhhSGFzaDogc3RyaW5nKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcblxuICBhd2FpdCBkYi51cGRhdGUodXNlcnMpLnNldCh7IHNlbmhhOiBzZW5oYUhhc2ggfSkud2hlcmUoZXEodXNlcnMuaWQsIHVzZXJJZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0VXNlclJlc2V0VG9rZW4odXNlcklkOiBudW1iZXIsIHRva2VuOiBzdHJpbmcsIGV4cGlyYTogRGF0ZSkge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG5cbiAgYXdhaXQgZGIudXBkYXRlKHVzZXJzKS5zZXQoeyByZXNldFRva2VuOiB0b2tlbiwgcmVzZXRUb2tlbkV4cGlyYTogZXhwaXJhIH0pLndoZXJlKGVxKHVzZXJzLmlkLCB1c2VySWQpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFVzZXJCeVJlc2V0VG9rZW4odG9rZW46IHN0cmluZykge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh1c2Vycykud2hlcmUoZXEodXNlcnMucmVzZXRUb2tlbiwgdG9rZW4pKS5saW1pdCgxKTtcblxuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA+IDAgPyByZXN1bHRbMF0gOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclVzZXJSZXNldFRva2VuKHVzZXJJZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcblxuICBhd2FpdCBkYi51cGRhdGUodXNlcnMpLnNldCh7IHJlc2V0VG9rZW46IG51bGwsIHJlc2V0VG9rZW5FeHBpcmE6IG51bGwgfSkud2hlcmUoZXEodXNlcnMuaWQsIHVzZXJJZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVXNlckxhc3RTaWduZWRJbih1c2VySWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG5cbiAgYXdhaXQgZGIudXBkYXRlKHVzZXJzKS5zZXQoeyBsYXN0U2lnbmVkSW46IG5ldyBEYXRlKCkgfSkud2hlcmUoZXEodXNlcnMuaWQsIHVzZXJJZCkpO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWRU5DSU1FTlRPUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVmVuY2ltZW50byhkYXRhOiBJbnNlcnRWZW5jaW1lbnRvKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmluc2VydCh2ZW5jaW1lbnRvcykudmFsdWVzKGRhdGEpO1xuICByZXR1cm4gcmVzdWx0WzBdLmluc2VydElkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVmVuY2ltZW50byhpZDogbnVtYmVyLCBkYXRhOiBQYXJ0aWFsPEluc2VydFZlbmNpbWVudG8+KSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIGF3YWl0IGRiLnVwZGF0ZSh2ZW5jaW1lbnRvcykuc2V0KGRhdGEpLndoZXJlKGVxKHZlbmNpbWVudG9zLmlkLCBpZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVmVuY2ltZW50byhpZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIC8vIERlbGV0ZSByZWxhdGVkIHJlY29yZHMgZmlyc3RcbiAgYXdhaXQgZGIuZGVsZXRlKHZlbmNpbWVudG9BbGVydGFzKS53aGVyZShlcSh2ZW5jaW1lbnRvQWxlcnRhcy52ZW5jaW1lbnRvSWQsIGlkKSk7XG4gIGF3YWl0IGRiLmRlbGV0ZSh2ZW5jaW1lbnRvTm90aWZpY2Fjb2VzKS53aGVyZShlcSh2ZW5jaW1lbnRvTm90aWZpY2Fjb2VzLnZlbmNpbWVudG9JZCwgaWQpKTtcbiAgYXdhaXQgZGIuZGVsZXRlKHZlbmNpbWVudG9zKS53aGVyZShlcSh2ZW5jaW1lbnRvcy5pZCwgaWQpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlbmNpbWVudG9zQnlDb25kb21pbmlvQW5kVGlwbyhjb25kb21pbmlvSWQ6IG51bWJlciwgdGlwbzogJ2NvbnRyYXRvJyB8ICdzZXJ2aWNvJyB8ICdtYW51dGVuY2FvJykge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIHJldHVybiBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9zKVxuICAgIC53aGVyZShhbmQoZXEodmVuY2ltZW50b3MuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpLCBlcSh2ZW5jaW1lbnRvcy50aXBvLCB0aXBvKSkpXG4gICAgLm9yZGVyQnkoZGVzYyh2ZW5jaW1lbnRvcy5kYXRhVmVuY2ltZW50bykpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmVuY2ltZW50b0J5SWQoaWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiB1bmRlZmluZWQ7XG4gIFxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9zKS53aGVyZShlcSh2ZW5jaW1lbnRvcy5pZCwgaWQpKS5saW1pdCgxKTtcbiAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPiAwID8gcmVzdWx0WzBdIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmVuY2ltZW50b3NQcm94aW1vcyhjb25kb21pbmlvSWQ6IG51bWJlciwgZGlhczogbnVtYmVyID0gMzApIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSByZXR1cm4gW107XG4gIFxuICBjb25zdCBob2plID0gbmV3IERhdGUoKTtcbiAgY29uc3QgbGltaXRlID0gbmV3IERhdGUoKTtcbiAgbGltaXRlLnNldERhdGUobGltaXRlLmdldERhdGUoKSArIGRpYXMpO1xuICBcbiAgcmV0dXJuIGRiLnNlbGVjdCgpLmZyb20odmVuY2ltZW50b3MpXG4gICAgLndoZXJlKGFuZChcbiAgICAgIGVxKHZlbmNpbWVudG9zLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSxcbiAgICAgIGd0ZSh2ZW5jaW1lbnRvcy5kYXRhVmVuY2ltZW50bywgaG9qZSksXG4gICAgICBsdGUodmVuY2ltZW50b3MuZGF0YVZlbmNpbWVudG8sIGxpbWl0ZSksXG4gICAgICBlcSh2ZW5jaW1lbnRvcy5zdGF0dXMsICdhdGl2bycpXG4gICAgKSlcbiAgICAub3JkZXJCeSh2ZW5jaW1lbnRvcy5kYXRhVmVuY2ltZW50byk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWZW5jaW1lbnRvc1ZlbmNpZG9zKGNvbmRvbWluaW9JZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgaG9qZSA9IG5ldyBEYXRlKCk7XG4gIFxuICByZXR1cm4gZGIuc2VsZWN0KCkuZnJvbSh2ZW5jaW1lbnRvcylcbiAgICAud2hlcmUoYW5kKFxuICAgICAgZXEodmVuY2ltZW50b3MuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpLFxuICAgICAgbHRlKHZlbmNpbWVudG9zLmRhdGFWZW5jaW1lbnRvLCBob2plKSxcbiAgICAgIGVxKHZlbmNpbWVudG9zLnN0YXR1cywgJ2F0aXZvJylcbiAgICApKVxuICAgIC5vcmRlckJ5KGRlc2ModmVuY2ltZW50b3MuZGF0YVZlbmNpbWVudG8pKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlbmNpbWVudG9TdGF0cyhjb25kb21pbmlvSWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiB7IHRvdGFsOiAwLCBwcm94aW1vczogMCwgdmVuY2lkb3M6IDAsIGNvbnRyYXRvczogMCwgc2Vydmljb3M6IDAsIG1hbnV0ZW5jb2VzOiAwIH07XG4gIFxuICBjb25zdCBob2plID0gbmV3IERhdGUoKTtcbiAgY29uc3QgZW0zMGRpYXMgPSBuZXcgRGF0ZSgpO1xuICBlbTMwZGlhcy5zZXREYXRlKGVtMzBkaWFzLmdldERhdGUoKSArIDMwKTtcbiAgXG4gIGNvbnN0IHRvZG9zID0gYXdhaXQgZGIuc2VsZWN0KCkuZnJvbSh2ZW5jaW1lbnRvcylcbiAgICAud2hlcmUoYW5kKGVxKHZlbmNpbWVudG9zLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSwgZXEodmVuY2ltZW50b3Muc3RhdHVzLCAnYXRpdm8nKSkpO1xuICBcbiAgY29uc3QgdmVuY2lkb3MgPSB0b2Rvcy5maWx0ZXIodiA9PiBuZXcgRGF0ZSh2LmRhdGFWZW5jaW1lbnRvKSA8IGhvamUpO1xuICBjb25zdCBwcm94aW1vcyA9IHRvZG9zLmZpbHRlcih2ID0+IHtcbiAgICBjb25zdCBkYXRhID0gbmV3IERhdGUodi5kYXRhVmVuY2ltZW50byk7XG4gICAgcmV0dXJuIGRhdGEgPj0gaG9qZSAmJiBkYXRhIDw9IGVtMzBkaWFzO1xuICB9KTtcbiAgXG4gIHJldHVybiB7XG4gICAgdG90YWw6IHRvZG9zLmxlbmd0aCxcbiAgICBwcm94aW1vczogcHJveGltb3MubGVuZ3RoLFxuICAgIHZlbmNpZG9zOiB2ZW5jaWRvcy5sZW5ndGgsXG4gICAgY29udHJhdG9zOiB0b2Rvcy5maWx0ZXIodiA9PiB2LnRpcG8gPT09ICdjb250cmF0bycpLmxlbmd0aCxcbiAgICBzZXJ2aWNvczogdG9kb3MuZmlsdGVyKHYgPT4gdi50aXBvID09PSAnc2VydmljbycpLmxlbmd0aCxcbiAgICBtYW51dGVuY29lczogdG9kb3MuZmlsdGVyKHYgPT4gdi50aXBvID09PSAnbWFudXRlbmNhbycpLmxlbmd0aCxcbiAgfTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQUxFUlRBUyBERSBWRU5DSU1FTlRPUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVmVuY2ltZW50b0FsZXJ0YShkYXRhOiBJbnNlcnRWZW5jaW1lbnRvQWxlcnRhKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLmluc2VydCh2ZW5jaW1lbnRvQWxlcnRhcykudmFsdWVzKGRhdGEpO1xuICByZXR1cm4gcmVzdWx0WzBdLmluc2VydElkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxlcnRhc0J5VmVuY2ltZW50byh2ZW5jaW1lbnRvSWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIHJldHVybiBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9BbGVydGFzKVxuICAgIC53aGVyZShlcSh2ZW5jaW1lbnRvQWxlcnRhcy52ZW5jaW1lbnRvSWQsIHZlbmNpbWVudG9JZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVmVuY2ltZW50b0FsZXJ0YShpZDogbnVtYmVyLCBkYXRhOiBQYXJ0aWFsPEluc2VydFZlbmNpbWVudG9BbGVydGE+KSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIGF3YWl0IGRiLnVwZGF0ZSh2ZW5jaW1lbnRvQWxlcnRhcykuc2V0KGRhdGEpLndoZXJlKGVxKHZlbmNpbWVudG9BbGVydGFzLmlkLCBpZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQWxlcnRhc0J5VmVuY2ltZW50byh2ZW5jaW1lbnRvSWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gIFxuICBhd2FpdCBkYi5kZWxldGUodmVuY2ltZW50b0FsZXJ0YXMpLndoZXJlKGVxKHZlbmNpbWVudG9BbGVydGFzLnZlbmNpbWVudG9JZCwgdmVuY2ltZW50b0lkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGVydGFzUGVuZGVudGVzKCkge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIHJldHVybiBkYi5zZWxlY3Qoe1xuICAgIGFsZXJ0YTogdmVuY2ltZW50b0FsZXJ0YXMsXG4gICAgdmVuY2ltZW50bzogdmVuY2ltZW50b3MsXG4gIH0pXG4gICAgLmZyb20odmVuY2ltZW50b0FsZXJ0YXMpXG4gICAgLmlubmVySm9pbih2ZW5jaW1lbnRvcywgZXEodmVuY2ltZW50b0FsZXJ0YXMudmVuY2ltZW50b0lkLCB2ZW5jaW1lbnRvcy5pZCkpXG4gICAgLndoZXJlKGFuZChcbiAgICAgIGVxKHZlbmNpbWVudG9BbGVydGFzLmF0aXZvLCB0cnVlKSxcbiAgICAgIGVxKHZlbmNpbWVudG9BbGVydGFzLmVudmlhZG8sIGZhbHNlKSxcbiAgICAgIGVxKHZlbmNpbWVudG9zLnN0YXR1cywgJ2F0aXZvJylcbiAgICApKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRS1NQUlMUyBERSBWRU5DSU1FTlRPUyA9PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVmVuY2ltZW50b0VtYWlsKGRhdGE6IEluc2VydFZlbmNpbWVudG9FbWFpbCkge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gIFxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5pbnNlcnQodmVuY2ltZW50b0VtYWlscykudmFsdWVzKGRhdGEpO1xuICByZXR1cm4gcmVzdWx0WzBdLmluc2VydElkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW1haWxzQnlDb25kb21pbmlvKGNvbmRvbWluaW9JZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgcmV0dXJuIGRiLnNlbGVjdCgpLmZyb20odmVuY2ltZW50b0VtYWlscylcbiAgICAud2hlcmUoZXEodmVuY2ltZW50b0VtYWlscy5jb25kb21pbmlvSWQsIGNvbmRvbWluaW9JZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVmVuY2ltZW50b0VtYWlsKGlkOiBudW1iZXIsIGRhdGE6IFBhcnRpYWw8SW5zZXJ0VmVuY2ltZW50b0VtYWlsPikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gIFxuICBhd2FpdCBkYi51cGRhdGUodmVuY2ltZW50b0VtYWlscykuc2V0KGRhdGEpLndoZXJlKGVxKHZlbmNpbWVudG9FbWFpbHMuaWQsIGlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVWZW5jaW1lbnRvRW1haWwoaWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gIFxuICBhd2FpdCBkYi5kZWxldGUodmVuY2ltZW50b0VtYWlscykud2hlcmUoZXEodmVuY2ltZW50b0VtYWlscy5pZCwgaWQpKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTk9USUZJQ0HDh8OVRVMgREUgVkVOQ0lNRU5UT1MgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVZlbmNpbWVudG9Ob3RpZmljYWNhbyhkYXRhOiBJbnNlcnRWZW5jaW1lbnRvTm90aWZpY2FjYW8pIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSB0aHJvdyBuZXcgRXJyb3IoXCJEYXRhYmFzZSBub3QgYXZhaWxhYmxlXCIpO1xuICBcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuaW5zZXJ0KHZlbmNpbWVudG9Ob3RpZmljYWNvZXMpLnZhbHVlcyhkYXRhKTtcbiAgcmV0dXJuIHJlc3VsdFswXS5pbnNlcnRJZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5vdGlmaWNhY29lc0J5VmVuY2ltZW50byh2ZW5jaW1lbnRvSWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIHJldHVybiBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9Ob3RpZmljYWNvZXMpXG4gICAgLndoZXJlKGVxKHZlbmNpbWVudG9Ob3RpZmljYWNvZXMudmVuY2ltZW50b0lkLCB2ZW5jaW1lbnRvSWQpKVxuICAgIC5vcmRlckJ5KGRlc2ModmVuY2ltZW50b05vdGlmaWNhY29lcy5jcmVhdGVkQXQpKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQUxFUlRBUyBBVVRPTcOBVElDT1MgREUgVkVOQ0lNRU5UT1MgPT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFsZXJ0YXNQYXJhRW52aWFyKCkge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIGNvbnN0IGhvamUgPSBuZXcgRGF0ZSgpO1xuICBob2plLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBcbiAgLy8gQnVzY2FyIHRvZG9zIG9zIGFsZXJ0YXMgbsOjbyBlbnZpYWRvcyBjb20gc2V1cyB2ZW5jaW1lbnRvc1xuICBjb25zdCBhbGVydGFzID0gYXdhaXQgZGIuc2VsZWN0KHtcbiAgICBhbGVydGE6IHZlbmNpbWVudG9BbGVydGFzLFxuICAgIHZlbmNpbWVudG86IHZlbmNpbWVudG9zLFxuICB9KVxuICAgIC5mcm9tKHZlbmNpbWVudG9BbGVydGFzKVxuICAgIC5pbm5lckpvaW4odmVuY2ltZW50b3MsIGVxKHZlbmNpbWVudG9BbGVydGFzLnZlbmNpbWVudG9JZCwgdmVuY2ltZW50b3MuaWQpKVxuICAgIC53aGVyZShhbmQoXG4gICAgICBlcSh2ZW5jaW1lbnRvQWxlcnRhcy5hdGl2bywgdHJ1ZSksXG4gICAgICBlcSh2ZW5jaW1lbnRvQWxlcnRhcy5lbnZpYWRvLCBmYWxzZSksXG4gICAgICBlcSh2ZW5jaW1lbnRvcy5zdGF0dXMsICdhdGl2bycpXG4gICAgKSk7XG4gIFxuICAvLyBGaWx0cmFyIGFsZXJ0YXMgcXVlIGRldmVtIHNlciBlbnZpYWRvcyBob2plXG4gIHJldHVybiBhbGVydGFzLmZpbHRlcigoeyBhbGVydGEsIHZlbmNpbWVudG8gfSkgPT4ge1xuICAgIGNvbnN0IGRhdGFWZW5jaW1lbnRvID0gbmV3IERhdGUodmVuY2ltZW50by5kYXRhVmVuY2ltZW50byk7XG4gICAgZGF0YVZlbmNpbWVudG8uc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgXG4gICAgY29uc3QgZGlhc0FudGVjZWRlbmNpYSA9IHtcbiAgICAgICduYV9kYXRhJzogMCxcbiAgICAgICd1bV9kaWFfYW50ZXMnOiAxLFxuICAgICAgJ3VtYV9zZW1hbmFfYW50ZXMnOiA3LFxuICAgICAgJ3F1aW56ZV9kaWFzX2FudGVzJzogMTUsXG4gICAgICAndW1fbWVzX2FudGVzJzogMzAsXG4gICAgfTtcbiAgICBcbiAgICBjb25zdCBkaWFzQW50ZXMgPSBkaWFzQW50ZWNlZGVuY2lhW2FsZXJ0YS50aXBvQWxlcnRhIGFzIGtleW9mIHR5cGVvZiBkaWFzQW50ZWNlZGVuY2lhXSB8fCAwO1xuICAgIGNvbnN0IGRhdGFBbGVydGEgPSBuZXcgRGF0ZShkYXRhVmVuY2ltZW50byk7XG4gICAgZGF0YUFsZXJ0YS5zZXREYXRlKGRhdGFBbGVydGEuZ2V0RGF0ZSgpIC0gZGlhc0FudGVzKTtcbiAgICBcbiAgICAvLyBWZXJpZmljYXIgc2UgYSBkYXRhIGRvIGFsZXJ0YSBqw6EgcGFzc291IG91IMOpIGhvamVcbiAgICByZXR1cm4gZGF0YUFsZXJ0YSA8PSBob2plO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmNhckFsZXJ0YUNvbW9FbnZpYWRvKGFsZXJ0YUlkOiBudW1iZXIpIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSB0aHJvdyBuZXcgRXJyb3IoXCJEYXRhYmFzZSBub3QgYXZhaWxhYmxlXCIpO1xuICBcbiAgYXdhaXQgZGIudXBkYXRlKHZlbmNpbWVudG9BbGVydGFzKVxuICAgIC5zZXQoeyBlbnZpYWRvOiB0cnVlLCBkYXRhRW52aW86IG5ldyBEYXRlKCkgfSlcbiAgICAud2hlcmUoZXEodmVuY2ltZW50b0FsZXJ0YXMuaWQsIGFsZXJ0YUlkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxWZW5jaW1lbnRvc0J5Q29uZG9taW5pbyhjb25kb21pbmlvSWQ6IG51bWJlciwgZmlsdHJvcz86IHtcbiAgdGlwbz86ICdjb250cmF0bycgfCAnc2VydmljbycgfCAnbWFudXRlbmNhbyc7XG4gIHN0YXR1cz86ICdhdGl2bycgfCAndmVuY2lkbycgfCAncmVub3ZhZG8nIHwgJ2NhbmNlbGFkbyc7XG4gIGRhdGFJbmljaW8/OiBEYXRlO1xuICBkYXRhRmltPzogRGF0ZTtcbn0pIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSByZXR1cm4gW107XG4gIFxuICBsZXQgcXVlcnkgPSBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9zKVxuICAgIC53aGVyZShlcSh2ZW5jaW1lbnRvcy5jb25kb21pbmlvSWQsIGNvbmRvbWluaW9JZCkpO1xuICBcbiAgLy8gQXBsaWNhciBmaWx0cm9zIGFkaWNpb25haXMgc2UgZm9ybmVjaWRvc1xuICBjb25zdCBjb25kaXRpb25zID0gW2VxKHZlbmNpbWVudG9zLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKV07XG4gIFxuICBpZiAoZmlsdHJvcz8udGlwbykge1xuICAgIGNvbmRpdGlvbnMucHVzaChlcSh2ZW5jaW1lbnRvcy50aXBvLCBmaWx0cm9zLnRpcG8pKTtcbiAgfVxuICBpZiAoZmlsdHJvcz8uc3RhdHVzKSB7XG4gICAgY29uZGl0aW9ucy5wdXNoKGVxKHZlbmNpbWVudG9zLnN0YXR1cywgZmlsdHJvcy5zdGF0dXMpKTtcbiAgfVxuICBpZiAoZmlsdHJvcz8uZGF0YUluaWNpbykge1xuICAgIGNvbmRpdGlvbnMucHVzaChndGUodmVuY2ltZW50b3MuZGF0YVZlbmNpbWVudG8sIGZpbHRyb3MuZGF0YUluaWNpbykpO1xuICB9XG4gIGlmIChmaWx0cm9zPy5kYXRhRmltKSB7XG4gICAgY29uZGl0aW9ucy5wdXNoKGx0ZSh2ZW5jaW1lbnRvcy5kYXRhVmVuY2ltZW50bywgZmlsdHJvcy5kYXRhRmltKSk7XG4gIH1cbiAgXG4gIHJldHVybiBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9zKVxuICAgIC53aGVyZShhbmQoLi4uY29uZGl0aW9ucykpXG4gICAgLm9yZGVyQnkodmVuY2ltZW50b3MuZGF0YVZlbmNpbWVudG8pO1xufVxuXG4vLyBFc3RhdMOtc3RpY2FzIGRlIHZlbmNpbWVudG9zIHBhcmEgZGFzaGJvYXJkXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmVuY2ltZW50b3NQb3JNZXMoY29uZG9taW5pb0lkOiBudW1iZXIsIGFubzogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuc2VsZWN0KHtcbiAgICBtZXM6IHNxbDxudW1iZXI+YE1PTlRIKGRhdGFfdmVuY2ltZW50bylgLFxuICAgIHRvdGFsOiBzcWw8bnVtYmVyPmBDT1VOVCgqKWAsXG4gICAgdmVuY2lkb3M6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gZGF0YV92ZW5jaW1lbnRvIDwgQ1VSREFURSgpIEFORCBzdGF0dXMgPSAnYXRpdm8nIFRIRU4gMSBFTFNFIDAgRU5EKWAsXG4gICAgYXRpdm9zOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIHN0YXR1cyA9ICdhdGl2bycgVEhFTiAxIEVMU0UgMCBFTkQpYCxcbiAgfSkuZnJvbSh2ZW5jaW1lbnRvcylcbiAgICAud2hlcmUoYW5kKFxuICAgICAgZXEodmVuY2ltZW50b3MuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpLFxuICAgICAgc3FsYFlFQVIoZGF0YV92ZW5jaW1lbnRvKSA9ICR7YW5vfWBcbiAgICApKVxuICAgIC5ncm91cEJ5KHNxbGBNT05USChkYXRhX3ZlbmNpbWVudG8pYClcbiAgICAub3JkZXJCeShzcWxgTU9OVEgoZGF0YV92ZW5jaW1lbnRvKWApO1xuICBcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlbmNpbWVudG9zUG9yQ2F0ZWdvcmlhKGNvbmRvbWluaW9JZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuc2VsZWN0KHtcbiAgICB0aXBvOiB2ZW5jaW1lbnRvcy50aXBvLFxuICAgIHRvdGFsOiBzcWw8bnVtYmVyPmBDT1VOVCgqKWAsXG4gICAgdmVuY2lkb3M6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gZGF0YV92ZW5jaW1lbnRvIDwgQ1VSREFURSgpIEFORCBzdGF0dXMgPSAnYXRpdm8nIFRIRU4gMSBFTFNFIDAgRU5EKWAsXG4gICAgYXRpdm9zOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIHN0YXR1cyA9ICdhdGl2bycgVEhFTiAxIEVMU0UgMCBFTkQpYCxcbiAgICB2YWxvclRvdGFsOiBzcWw8bnVtYmVyPmBDT0FMRVNDRShTVU0odmFsb3IpLCAwKWAsXG4gIH0pLmZyb20odmVuY2ltZW50b3MpXG4gICAgLndoZXJlKGVxKHZlbmNpbWVudG9zLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSlcbiAgICAuZ3JvdXBCeSh2ZW5jaW1lbnRvcy50aXBvKTtcbiAgXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWZW5jaW1lbnRvc1BvclN0YXR1cyhjb25kb21pbmlvSWQ6IG51bWJlcikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCh7XG4gICAgc3RhdHVzOiB2ZW5jaW1lbnRvcy5zdGF0dXMsXG4gICAgdG90YWw6IHNxbDxudW1iZXI+YENPVU5UKCopYCxcbiAgICB2YWxvclRvdGFsOiBzcWw8bnVtYmVyPmBDT0FMRVNDRShTVU0odmFsb3IpLCAwKWAsXG4gIH0pLmZyb20odmVuY2ltZW50b3MpXG4gICAgLndoZXJlKGVxKHZlbmNpbWVudG9zLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSlcbiAgICAuZ3JvdXBCeSh2ZW5jaW1lbnRvcy5zdGF0dXMpO1xuICBcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb3hpbW9zVmVuY2ltZW50b3MoY29uZG9taW5pb0lkOiBudW1iZXIsIGRpYXM6IG51bWJlciA9IDMwKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgaG9qZSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGRhdGFMaW1pdGUgPSBuZXcgRGF0ZSgpO1xuICBkYXRhTGltaXRlLnNldERhdGUoZGF0YUxpbWl0ZS5nZXREYXRlKCkgKyBkaWFzKTtcbiAgXG4gIHJldHVybiBkYi5zZWxlY3QoKS5mcm9tKHZlbmNpbWVudG9zKVxuICAgIC53aGVyZShhbmQoXG4gICAgICBlcSh2ZW5jaW1lbnRvcy5jb25kb21pbmlvSWQsIGNvbmRvbWluaW9JZCksXG4gICAgICBlcSh2ZW5jaW1lbnRvcy5zdGF0dXMsICdhdGl2bycpLFxuICAgICAgZ3RlKHZlbmNpbWVudG9zLmRhdGFWZW5jaW1lbnRvLCBob2plKSxcbiAgICAgIGx0ZSh2ZW5jaW1lbnRvcy5kYXRhVmVuY2ltZW50bywgZGF0YUxpbWl0ZSlcbiAgICApKVxuICAgIC5vcmRlckJ5KHZlbmNpbWVudG9zLmRhdGFWZW5jaW1lbnRvKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVzdGF0aXN0aWNhc0dlcmFpc1ZlbmNpbWVudG9zKGNvbmRvbWluaW9JZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIG51bGw7XG4gIFxuICBjb25zdCBob2plID0gbmV3IERhdGUoKTtcbiAgY29uc3QgcHJveGltb3MzMCA9IG5ldyBEYXRlKCk7XG4gIHByb3hpbW9zMzAuc2V0RGF0ZShwcm94aW1vczMwLmdldERhdGUoKSArIDMwKTtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCh7XG4gICAgdG90YWw6IHNxbDxudW1iZXI+YENPVU5UKCopYCxcbiAgICBhdGl2b3M6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gc3RhdHVzID0gJ2F0aXZvJyBUSEVOIDEgRUxTRSAwIEVORClgLFxuICAgIHZlbmNpZG9zOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIGRhdGFfdmVuY2ltZW50byA8IENVUkRBVEUoKSBBTkQgc3RhdHVzID0gJ2F0aXZvJyBUSEVOIDEgRUxTRSAwIEVORClgLFxuICAgIHByb3hpbW9zMzBkaWFzOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIGRhdGFfdmVuY2ltZW50byA+PSBDVVJEQVRFKCkgQU5EIGRhdGFfdmVuY2ltZW50byA8PSBEQVRFX0FERChDVVJEQVRFKCksIElOVEVSVkFMIDMwIERBWSkgQU5EIHN0YXR1cyA9ICdhdGl2bycgVEhFTiAxIEVMU0UgMCBFTkQpYCxcbiAgICB2YWxvclRvdGFsQXRpdm86IHNxbDxudW1iZXI+YENPQUxFU0NFKFNVTShDQVNFIFdIRU4gc3RhdHVzID0gJ2F0aXZvJyBUSEVOIHZhbG9yIEVMU0UgMCBFTkQpLCAwKWAsXG4gICAgY29udHJhdG9zOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIHRpcG8gPSAnY29udHJhdG8nIFRIRU4gMSBFTFNFIDAgRU5EKWAsXG4gICAgc2Vydmljb3M6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gdGlwbyA9ICdzZXJ2aWNvJyBUSEVOIDEgRUxTRSAwIEVORClgLFxuICAgIG1hbnV0ZW5jb2VzOiBzcWw8bnVtYmVyPmBTVU0oQ0FTRSBXSEVOIHRpcG8gPSAnbWFudXRlbmNhbycgVEhFTiAxIEVMU0UgMCBFTkQpYCxcbiAgfSkuZnJvbSh2ZW5jaW1lbnRvcylcbiAgICAud2hlcmUoZXEodmVuY2ltZW50b3MuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpKTtcbiAgXG4gIHJldHVybiByZXN1bHRbMF0gfHwgbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEV2b2x1Y2FvVmVuY2ltZW50b3MoY29uZG9taW5pb0lkOiBudW1iZXIsIG1lc2VzOiBudW1iZXIgPSAxMikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHJldHVybiBbXTtcbiAgXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRiLnNlbGVjdCh7XG4gICAgYW5vOiBzcWw8bnVtYmVyPmBZRUFSKGRhdGFfdmVuY2ltZW50bylgLFxuICAgIG1lczogc3FsPG51bWJlcj5gTU9OVEgoZGF0YV92ZW5jaW1lbnRvKWAsXG4gICAgdG90YWw6IHNxbDxudW1iZXI+YENPVU5UKCopYCxcbiAgICBjb250cmF0b3M6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gdGlwbyA9ICdjb250cmF0bycgVEhFTiAxIEVMU0UgMCBFTkQpYCxcbiAgICBzZXJ2aWNvczogc3FsPG51bWJlcj5gU1VNKENBU0UgV0hFTiB0aXBvID0gJ3NlcnZpY28nIFRIRU4gMSBFTFNFIDAgRU5EKWAsXG4gICAgbWFudXRlbmNvZXM6IHNxbDxudW1iZXI+YFNVTShDQVNFIFdIRU4gdGlwbyA9ICdtYW51dGVuY2FvJyBUSEVOIDEgRUxTRSAwIEVORClgLFxuICAgIHZhbG9yVG90YWw6IHNxbDxudW1iZXI+YENPQUxFU0NFKFNVTSh2YWxvciksIDApYCxcbiAgfSkuZnJvbSh2ZW5jaW1lbnRvcylcbiAgICAud2hlcmUoYW5kKFxuICAgICAgZXEodmVuY2ltZW50b3MuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpLFxuICAgICAgc3FsYGRhdGFfdmVuY2ltZW50byA+PSBEQVRFX1NVQihDVVJEQVRFKCksIElOVEVSVkFMICR7bWVzZXN9IE1PTlRIKWBcbiAgICApKVxuICAgIC5ncm91cEJ5KHNxbGBZRUFSKGRhdGFfdmVuY2ltZW50bylgLCBzcWxgTU9OVEgoZGF0YV92ZW5jaW1lbnRvKWApXG4gICAgLm9yZGVyQnkoc3FsYFlFQVIoZGF0YV92ZW5jaW1lbnRvKWAsIHNxbGBNT05USChkYXRhX3ZlbmNpbWVudG8pYCk7XG4gIFxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBUT0RPOiBhZGQgZmVhdHVyZSBxdWVyaWVzIGhlcmUgYXMgeW91ciBzY2hlbWEgZ3Jvd3MuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRlVOw4fDlUVTIFBPUiBDT05ET03DjU5JTyA9PT09PT09PT09PT09PT09PT09PVxuaW1wb3J0IHsgY29uZG9taW5pb0Z1bmNvZXMsIEZVTkNPRVNfRElTUE9OSVZFSVMsIEluc2VydENvbmRvbWluaW9GdW5jYW8gfSBmcm9tIFwiLi4vZHJpenpsZS9zY2hlbWFcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZ1bmNvZXNDb25kb21pbmlvKGNvbmRvbWluaW9JZDogbnVtYmVyKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIFtdO1xuICBcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGIuc2VsZWN0KClcbiAgICAuZnJvbShjb25kb21pbmlvRnVuY29lcylcbiAgICAud2hlcmUoZXEoY29uZG9taW5pb0Z1bmNvZXMuY29uZG9taW5pb0lkLCBjb25kb21pbmlvSWQpKTtcbiAgXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGdW5jb2VzSGFiaWxpdGFkYXMoY29uZG9taW5pb0lkOiBudW1iZXIpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgcmV0dXJuIEZVTkNPRVNfRElTUE9OSVZFSVMubWFwKGYgPT4gZi5pZCk7IC8vIFNlIG7Do28gaMOhIERCLCByZXRvcm5hIHRvZGFzIGhhYmlsaXRhZGFzXG4gIFxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBkYi5zZWxlY3QoKVxuICAgIC5mcm9tKGNvbmRvbWluaW9GdW5jb2VzKVxuICAgIC53aGVyZShhbmQoXG4gICAgICBlcShjb25kb21pbmlvRnVuY29lcy5jb25kb21pbmlvSWQsIGNvbmRvbWluaW9JZCksXG4gICAgICBlcShjb25kb21pbmlvRnVuY29lcy5oYWJpbGl0YWRhLCB0cnVlKVxuICAgICkpO1xuICBcbiAgLy8gU2UgbsOjbyBow6EgcmVnaXN0cm9zLCBzaWduaWZpY2EgcXVlIHRvZGFzIGVzdMOjbyBoYWJpbGl0YWRhcyBwb3IgcGFkcsOjb1xuICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBGVU5DT0VTX0RJU1BPTklWRUlTLm1hcChmID0+IGYuaWQpO1xuICB9XG4gIFxuICByZXR1cm4gcmVzdWx0Lm1hcChyID0+IHIuZnVuY2FvSWQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0RnVuY2FvSGFiaWxpdGFkYShjb25kb21pbmlvSWQ6IG51bWJlciwgZnVuY2FvSWQ6IHN0cmluZywgaGFiaWxpdGFkYTogYm9vbGVhbikge1xuICBjb25zdCBkYiA9IGF3YWl0IGdldERiKCk7XG4gIGlmICghZGIpIHRocm93IG5ldyBFcnJvcihcIkRhdGFiYXNlIG5vdCBhdmFpbGFibGVcIik7XG4gIFxuICAvLyBWZXJpZmljYXIgc2UgasOhIGV4aXN0ZSByZWdpc3Ryb1xuICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgLmZyb20oY29uZG9taW5pb0Z1bmNvZXMpXG4gICAgLndoZXJlKGFuZChcbiAgICAgIGVxKGNvbmRvbWluaW9GdW5jb2VzLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSxcbiAgICAgIGVxKGNvbmRvbWluaW9GdW5jb2VzLmZ1bmNhb0lkLCBmdW5jYW9JZClcbiAgICApKTtcbiAgXG4gIGlmIChleGlzdGluZy5sZW5ndGggPiAwKSB7XG4gICAgLy8gQXR1YWxpemFyXG4gICAgYXdhaXQgZGIudXBkYXRlKGNvbmRvbWluaW9GdW5jb2VzKVxuICAgICAgLnNldCh7IGhhYmlsaXRhZGEgfSlcbiAgICAgIC53aGVyZShhbmQoXG4gICAgICAgIGVxKGNvbmRvbWluaW9GdW5jb2VzLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSxcbiAgICAgICAgZXEoY29uZG9taW5pb0Z1bmNvZXMuZnVuY2FvSWQsIGZ1bmNhb0lkKVxuICAgICAgKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSW5zZXJpclxuICAgIGF3YWl0IGRiLmluc2VydChjb25kb21pbmlvRnVuY29lcykudmFsdWVzKHtcbiAgICAgIGNvbmRvbWluaW9JZCxcbiAgICAgIGZ1bmNhb0lkLFxuICAgICAgaGFiaWxpdGFkYSxcbiAgICB9KTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgY29uZG9taW5pb0lkLCBmdW5jYW9JZCwgaGFiaWxpdGFkYSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TXVsdGlwbGFzRnVuY29lc0hhYmlsaXRhZGFzKGNvbmRvbWluaW9JZDogbnVtYmVyLCBmdW5jb2VzOiB7IGZ1bmNhb0lkOiBzdHJpbmc7IGhhYmlsaXRhZGE6IGJvb2xlYW4gfVtdKSB7XG4gIGNvbnN0IGRiID0gYXdhaXQgZ2V0RGIoKTtcbiAgaWYgKCFkYikgdGhyb3cgbmV3IEVycm9yKFwiRGF0YWJhc2Ugbm90IGF2YWlsYWJsZVwiKTtcbiAgXG4gIGZvciAoY29uc3QgZnVuY2FvIG9mIGZ1bmNvZXMpIHtcbiAgICBhd2FpdCBzZXRGdW5jYW9IYWJpbGl0YWRhKGNvbmRvbWluaW9JZCwgZnVuY2FvLmZ1bmNhb0lkLCBmdW5jYW8uaGFiaWxpdGFkYSk7XG4gIH1cbiAgXG4gIHJldHVybiB7IGNvbmRvbWluaW9JZCwgdXBkYXRlZDogZnVuY29lcy5sZW5ndGggfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaWNpYWxpemFyRnVuY29lc0NvbmRvbWluaW8oY29uZG9taW5pb0lkOiBudW1iZXIpIHtcbiAgY29uc3QgZGIgPSBhd2FpdCBnZXREYigpO1xuICBpZiAoIWRiKSB0aHJvdyBuZXcgRXJyb3IoXCJEYXRhYmFzZSBub3QgYXZhaWxhYmxlXCIpO1xuICBcbiAgLy8gVmVyaWZpY2FyIHNlIGrDoSBleGlzdGVtIHJlZ2lzdHJvc1xuICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLnNlbGVjdCgpXG4gICAgLmZyb20oY29uZG9taW5pb0Z1bmNvZXMpXG4gICAgLndoZXJlKGVxKGNvbmRvbWluaW9GdW5jb2VzLmNvbmRvbWluaW9JZCwgY29uZG9taW5pb0lkKSk7XG4gIFxuICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7IGNvbmRvbWluaW9JZCwgaW5pdGlhbGl6ZWQ6IGZhbHNlLCBtZXNzYWdlOiBcIkZ1bsOnw7VlcyBqw6EgaW5pY2lhbGl6YWRhc1wiIH07XG4gIH1cbiAgXG4gIC8vIENyaWFyIHJlZ2lzdHJvcyBwYXJhIHRvZGFzIGFzIGZ1bsOnw7VlcyAodG9kYXMgaGFiaWxpdGFkYXMgcG9yIHBhZHLDo28pXG4gIGZvciAoY29uc3QgZnVuY2FvIG9mIEZVTkNPRVNfRElTUE9OSVZFSVMpIHtcbiAgICBhd2FpdCBkYi5pbnNlcnQoY29uZG9taW5pb0Z1bmNvZXMpLnZhbHVlcyh7XG4gICAgICBjb25kb21pbmlvSWQsXG4gICAgICBmdW5jYW9JZDogZnVuY2FvLmlkLFxuICAgICAgaGFiaWxpdGFkYTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICBcbiAgcmV0dXJuIHsgY29uZG9taW5pb0lkLCBpbml0aWFsaXplZDogdHJ1ZSwgY291bnQ6IEZVTkNPRVNfRElTUE9OSVZFSVMubGVuZ3RoIH07XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsZUFBZTtBQUN4QixTQUFxQixPQUFPLGFBQWEsbUJBQW1CLGtCQUFrQiw4QkFBNEg7QUFDMU0sU0FBUyxXQUFXO0FBQ3BCLFNBQVMsTUFBTSxLQUFLLEtBQUssS0FBSyxLQUFLLFVBQVU7QUFFN0MsSUFBSSxNQUF5QztBQUc3QyxzQkFBc0IsUUFBUTtBQUM1QixNQUFJLENBQUMsT0FBTyxRQUFRLElBQUksY0FBYztBQUNwQyxRQUFJO0FBQ0YsWUFBTSxRQUFRLFFBQVEsSUFBSSxZQUFZO0FBQUEsSUFDeEMsU0FBUyxPQUFPO0FBQ2QsY0FBUSxLQUFLLGlDQUFpQyxLQUFLO0FBQ25ELFlBQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUVBLHNCQUFzQixXQUFXLE1BQWlDO0FBQ2hFLE1BQUksQ0FBQyxLQUFLLFFBQVE7QUFDaEIsVUFBTSxJQUFJLE1BQU0sb0NBQW9DO0FBQUEsRUFDdEQ7QUFFQSxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJO0FBQ1AsWUFBUSxLQUFLLHVEQUF1RDtBQUNwRTtBQUFBLEVBQ0Y7QUFFQSxNQUFJO0FBQ0YsVUFBTSxTQUFxQjtBQUFBLE1BQ3pCLFFBQVEsS0FBSztBQUFBLElBQ2Y7QUFDQSxVQUFNLFlBQXFDLENBQUM7QUFFNUMsVUFBTSxhQUFhLENBQUMsUUFBUSxTQUFTLGFBQWE7QUFHbEQsVUFBTSxpQkFBaUIsQ0FBQyxVQUFxQjtBQUMzQyxZQUFNLFFBQVEsS0FBSyxLQUFLO0FBQ3hCLFVBQUksVUFBVSxPQUFXO0FBQ3pCLFlBQU0sYUFBYSxTQUFTO0FBQzVCLGFBQU8sS0FBSyxJQUFJO0FBQ2hCLGdCQUFVLEtBQUssSUFBSTtBQUFBLElBQ3JCO0FBRUEsZUFBVyxRQUFRLGNBQWM7QUFFakMsUUFBSSxLQUFLLGlCQUFpQixRQUFXO0FBQ25DLGFBQU8sZUFBZSxLQUFLO0FBQzNCLGdCQUFVLGVBQWUsS0FBSztBQUFBLElBQ2hDO0FBQ0EsUUFBSSxLQUFLLFNBQVMsUUFBVztBQUMzQixhQUFPLE9BQU8sS0FBSztBQUNuQixnQkFBVSxPQUFPLEtBQUs7QUFBQSxJQUN4QixXQUFXLEtBQUssV0FBVyxJQUFJLGFBQWE7QUFDMUMsYUFBTyxPQUFPO0FBQ2QsZ0JBQVUsT0FBTztBQUFBLElBQ25CO0FBRUEsUUFBSSxDQUFDLE9BQU8sY0FBYztBQUN4QixhQUFPLGVBQWUsb0JBQUksS0FBSztBQUFBLElBQ2pDO0FBRUEsUUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFLFdBQVcsR0FBRztBQUN2QyxnQkFBVSxlQUFlLG9CQUFJLEtBQUs7QUFBQSxJQUNwQztBQUVBLFVBQU0sR0FBRyxPQUFPLEtBQUssRUFBRSxPQUFPLE1BQU0sRUFBRSxxQkFBcUI7QUFBQSxNQUN6RCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0scUNBQXFDLEtBQUs7QUFDeEQsVUFBTTtBQUFBLEVBQ1I7QUFDRjtBQUVBLHNCQUFzQixnQkFBZ0IsUUFBZ0I7QUFDcEQsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsSUFBSTtBQUNQLFlBQVEsS0FBSyxvREFBb0Q7QUFDakUsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRSxNQUFNLEdBQUcsTUFBTSxRQUFRLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQztBQUVwRixTQUFPLE9BQU8sU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJO0FBQ3pDO0FBRUEsc0JBQXNCLGVBQWUsT0FBZTtBQUNsRCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJO0FBQ1AsWUFBUSxLQUFLLG9EQUFvRDtBQUNqRSxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sU0FBUyxNQUFNLEdBQUcsT0FBTyxFQUFFLEtBQUssS0FBSyxFQUFFLE1BQU0sR0FBRyxNQUFNLE9BQU8sS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDO0FBRWxGLFNBQU8sT0FBTyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUk7QUFDekM7QUFFQSxzQkFBc0IsWUFBWSxJQUFZO0FBQzVDLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLElBQUk7QUFDUCxZQUFRLEtBQUssb0RBQW9EO0FBQ2pFLFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxTQUFTLE1BQU0sR0FBRyxPQUFPLEVBQUUsS0FBSyxLQUFLLEVBQUUsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUM7QUFFNUUsU0FBTyxPQUFPLFNBQVMsSUFBSSxPQUFPLENBQUMsSUFBSTtBQUN6QztBQUVBLHNCQUFzQixnQkFBZ0IsTUFBc0Q7QUFDMUYsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxPQUFNLElBQUksTUFBTSx3QkFBd0I7QUFHakQsUUFBTSxTQUFTLFNBQVMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBRWpGLFFBQU0sU0FBUyxNQUFNLEdBQUcsT0FBTyxLQUFLLEVBQUUsT0FBTztBQUFBLElBQzNDO0FBQUEsSUFDQSxPQUFPLEtBQUs7QUFBQSxJQUNaLE1BQU0sS0FBSztBQUFBLElBQ1gsT0FBTyxLQUFLO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixjQUFjLG9CQUFJLEtBQUs7QUFBQSxFQUN6QixDQUFDO0FBRUQsU0FBTyxPQUFPLENBQUMsRUFBRTtBQUNuQjtBQUVBLHNCQUFzQixtQkFBbUIsUUFBZ0IsV0FBbUI7QUFDMUUsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxPQUFNLElBQUksTUFBTSx3QkFBd0I7QUFFakQsUUFBTSxHQUFHLE9BQU8sS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLFVBQVUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDO0FBQzdFO0FBRUEsc0JBQXNCLGtCQUFrQixRQUFnQixPQUFlLFFBQWM7QUFDbkYsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxPQUFNLElBQUksTUFBTSx3QkFBd0I7QUFFakQsUUFBTSxHQUFHLE9BQU8sS0FBSyxFQUFFLElBQUksRUFBRSxZQUFZLE9BQU8sa0JBQWtCLE9BQU8sQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDO0FBQ3hHO0FBRUEsc0JBQXNCLG9CQUFvQixPQUFlO0FBQ3ZELFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTztBQUVoQixRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRSxNQUFNLEdBQUcsTUFBTSxZQUFZLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQztBQUV2RixTQUFPLE9BQU8sU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJO0FBQ3pDO0FBRUEsc0JBQXNCLG9CQUFvQixRQUFnQjtBQUN4RCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxRQUFNLEdBQUcsT0FBTyxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksTUFBTSxrQkFBa0IsS0FBSyxDQUFDLEVBQUUsTUFBTSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUM7QUFDckc7QUFFQSxzQkFBc0IsdUJBQXVCLFFBQWdCO0FBQzNELFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBRWpELFFBQU0sR0FBRyxPQUFPLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxvQkFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDO0FBQ3JGO0FBSUEsc0JBQXNCLGlCQUFpQixNQUF3QjtBQUM3RCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sV0FBVyxFQUFFLE9BQU8sSUFBSTtBQUN2RCxTQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ25CO0FBRUEsc0JBQXNCLGlCQUFpQixJQUFZLE1BQWlDO0FBQ2xGLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBRWpELFFBQU0sR0FBRyxPQUFPLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxNQUFNLEdBQUcsWUFBWSxJQUFJLEVBQUUsQ0FBQztBQUNyRTtBQUVBLHNCQUFzQixpQkFBaUIsSUFBWTtBQUNqRCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUdqRCxRQUFNLEdBQUcsT0FBTyxpQkFBaUIsRUFBRSxNQUFNLEdBQUcsa0JBQWtCLGNBQWMsRUFBRSxDQUFDO0FBQy9FLFFBQU0sR0FBRyxPQUFPLHNCQUFzQixFQUFFLE1BQU0sR0FBRyx1QkFBdUIsY0FBYyxFQUFFLENBQUM7QUFDekYsUUFBTSxHQUFHLE9BQU8sV0FBVyxFQUFFLE1BQU0sR0FBRyxZQUFZLElBQUksRUFBRSxDQUFDO0FBQzNEO0FBRUEsc0JBQXNCLGtDQUFrQyxjQUFzQixNQUE2QztBQUN6SCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLFFBQU8sQ0FBQztBQUVqQixTQUFPLEdBQUcsT0FBTyxFQUFFLEtBQUssV0FBVyxFQUNoQyxNQUFNLElBQUksR0FBRyxZQUFZLGNBQWMsWUFBWSxHQUFHLEdBQUcsWUFBWSxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQ2pGLFFBQVEsS0FBSyxZQUFZLGNBQWMsQ0FBQztBQUM3QztBQUVBLHNCQUFzQixrQkFBa0IsSUFBWTtBQUNsRCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLFFBQU87QUFFaEIsUUFBTSxTQUFTLE1BQU0sR0FBRyxPQUFPLEVBQUUsS0FBSyxXQUFXLEVBQUUsTUFBTSxHQUFHLFlBQVksSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUM7QUFDeEYsU0FBTyxPQUFPLFNBQVMsSUFBSSxPQUFPLENBQUMsSUFBSTtBQUN6QztBQUVBLHNCQUFzQix1QkFBdUIsY0FBc0IsT0FBZSxJQUFJO0FBQ3BGLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFFBQU0sT0FBTyxvQkFBSSxLQUFLO0FBQ3RCLFFBQU0sU0FBUyxvQkFBSSxLQUFLO0FBQ3hCLFNBQU8sUUFBUSxPQUFPLFFBQVEsSUFBSSxJQUFJO0FBRXRDLFNBQU8sR0FBRyxPQUFPLEVBQUUsS0FBSyxXQUFXLEVBQ2hDLE1BQU07QUFBQSxJQUNMLEdBQUcsWUFBWSxjQUFjLFlBQVk7QUFBQSxJQUN6QyxJQUFJLFlBQVksZ0JBQWdCLElBQUk7QUFBQSxJQUNwQyxJQUFJLFlBQVksZ0JBQWdCLE1BQU07QUFBQSxJQUN0QyxHQUFHLFlBQVksUUFBUSxPQUFPO0FBQUEsRUFDaEMsQ0FBQyxFQUNBLFFBQVEsWUFBWSxjQUFjO0FBQ3ZDO0FBRUEsc0JBQXNCLHVCQUF1QixjQUFzQjtBQUNqRSxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLFFBQU8sQ0FBQztBQUVqQixRQUFNLE9BQU8sb0JBQUksS0FBSztBQUV0QixTQUFPLEdBQUcsT0FBTyxFQUFFLEtBQUssV0FBVyxFQUNoQyxNQUFNO0FBQUEsSUFDTCxHQUFHLFlBQVksY0FBYyxZQUFZO0FBQUEsSUFDekMsSUFBSSxZQUFZLGdCQUFnQixJQUFJO0FBQUEsSUFDcEMsR0FBRyxZQUFZLFFBQVEsT0FBTztBQUFBLEVBQ2hDLENBQUMsRUFDQSxRQUFRLEtBQUssWUFBWSxjQUFjLENBQUM7QUFDN0M7QUFFQSxzQkFBc0IsbUJBQW1CLGNBQXNCO0FBQzdELFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxFQUFFLE9BQU8sR0FBRyxVQUFVLEdBQUcsVUFBVSxHQUFHLFdBQVcsR0FBRyxVQUFVLEdBQUcsYUFBYSxFQUFFO0FBRWhHLFFBQU0sT0FBTyxvQkFBSSxLQUFLO0FBQ3RCLFFBQU0sV0FBVyxvQkFBSSxLQUFLO0FBQzFCLFdBQVMsUUFBUSxTQUFTLFFBQVEsSUFBSSxFQUFFO0FBRXhDLFFBQU0sUUFBUSxNQUFNLEdBQUcsT0FBTyxFQUFFLEtBQUssV0FBVyxFQUM3QyxNQUFNLElBQUksR0FBRyxZQUFZLGNBQWMsWUFBWSxHQUFHLEdBQUcsWUFBWSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBRXpGLFFBQU0sV0FBVyxNQUFNLE9BQU8sT0FBSyxJQUFJLEtBQUssRUFBRSxjQUFjLElBQUksSUFBSTtBQUNwRSxRQUFNLFdBQVcsTUFBTSxPQUFPLE9BQUs7QUFDakMsVUFBTSxPQUFPLElBQUksS0FBSyxFQUFFLGNBQWM7QUFDdEMsV0FBTyxRQUFRLFFBQVEsUUFBUTtBQUFBLEVBQ2pDLENBQUM7QUFFRCxTQUFPO0FBQUEsSUFDTCxPQUFPLE1BQU07QUFBQSxJQUNiLFVBQVUsU0FBUztBQUFBLElBQ25CLFVBQVUsU0FBUztBQUFBLElBQ25CLFdBQVcsTUFBTSxPQUFPLE9BQUssRUFBRSxTQUFTLFVBQVUsRUFBRTtBQUFBLElBQ3BELFVBQVUsTUFBTSxPQUFPLE9BQUssRUFBRSxTQUFTLFNBQVMsRUFBRTtBQUFBLElBQ2xELGFBQWEsTUFBTSxPQUFPLE9BQUssRUFBRSxTQUFTLFlBQVksRUFBRTtBQUFBLEVBQzFEO0FBQ0Y7QUFJQSxzQkFBc0IsdUJBQXVCLE1BQThCO0FBQ3pFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBRWpELFFBQU0sU0FBUyxNQUFNLEdBQUcsT0FBTyxpQkFBaUIsRUFBRSxPQUFPLElBQUk7QUFDN0QsU0FBTyxPQUFPLENBQUMsRUFBRTtBQUNuQjtBQUVBLHNCQUFzQix1QkFBdUIsY0FBc0I7QUFDakUsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsU0FBTyxHQUFHLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixFQUN0QyxNQUFNLEdBQUcsa0JBQWtCLGNBQWMsWUFBWSxDQUFDO0FBQzNEO0FBRUEsc0JBQXNCLHVCQUF1QixJQUFZLE1BQXVDO0FBQzlGLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBRWpELFFBQU0sR0FBRyxPQUFPLGlCQUFpQixFQUFFLElBQUksSUFBSSxFQUFFLE1BQU0sR0FBRyxrQkFBa0IsSUFBSSxFQUFFLENBQUM7QUFDakY7QUFFQSxzQkFBc0IsMEJBQTBCLGNBQXNCO0FBQ3BFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBRWpELFFBQU0sR0FBRyxPQUFPLGlCQUFpQixFQUFFLE1BQU0sR0FBRyxrQkFBa0IsY0FBYyxZQUFZLENBQUM7QUFDM0Y7QUFFQSxzQkFBc0Isc0JBQXNCO0FBQzFDLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFNBQU8sR0FBRyxPQUFPO0FBQUEsSUFDZixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsRUFDZCxDQUFDLEVBQ0UsS0FBSyxpQkFBaUIsRUFDdEIsVUFBVSxhQUFhLEdBQUcsa0JBQWtCLGNBQWMsWUFBWSxFQUFFLENBQUMsRUFDekUsTUFBTTtBQUFBLElBQ0wsR0FBRyxrQkFBa0IsT0FBTyxJQUFJO0FBQUEsSUFDaEMsR0FBRyxrQkFBa0IsU0FBUyxLQUFLO0FBQUEsSUFDbkMsR0FBRyxZQUFZLFFBQVEsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDTDtBQUlBLHNCQUFzQixzQkFBc0IsTUFBNkI7QUFDdkUsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxPQUFNLElBQUksTUFBTSx3QkFBd0I7QUFFakQsUUFBTSxTQUFTLE1BQU0sR0FBRyxPQUFPLGdCQUFnQixFQUFFLE9BQU8sSUFBSTtBQUM1RCxTQUFPLE9BQU8sQ0FBQyxFQUFFO0FBQ25CO0FBRUEsc0JBQXNCLHNCQUFzQixjQUFzQjtBQUNoRSxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLFFBQU8sQ0FBQztBQUVqQixTQUFPLEdBQUcsT0FBTyxFQUFFLEtBQUssZ0JBQWdCLEVBQ3JDLE1BQU0sR0FBRyxpQkFBaUIsY0FBYyxZQUFZLENBQUM7QUFDMUQ7QUFFQSxzQkFBc0Isc0JBQXNCLElBQVksTUFBc0M7QUFDNUYsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxPQUFNLElBQUksTUFBTSx3QkFBd0I7QUFFakQsUUFBTSxHQUFHLE9BQU8sZ0JBQWdCLEVBQUUsSUFBSSxJQUFJLEVBQUUsTUFBTSxHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztBQUMvRTtBQUVBLHNCQUFzQixzQkFBc0IsSUFBWTtBQUN0RCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxRQUFNLEdBQUcsT0FBTyxnQkFBZ0IsRUFBRSxNQUFNLEdBQUcsaUJBQWlCLElBQUksRUFBRSxDQUFDO0FBQ3JFO0FBSUEsc0JBQXNCLDRCQUE0QixNQUFtQztBQUNuRixRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sc0JBQXNCLEVBQUUsT0FBTyxJQUFJO0FBQ2xFLFNBQU8sT0FBTyxDQUFDLEVBQUU7QUFDbkI7QUFFQSxzQkFBc0IsNEJBQTRCLGNBQXNCO0FBQ3RFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFNBQU8sR0FBRyxPQUFPLEVBQUUsS0FBSyxzQkFBc0IsRUFDM0MsTUFBTSxHQUFHLHVCQUF1QixjQUFjLFlBQVksQ0FBQyxFQUMzRCxRQUFRLEtBQUssdUJBQXVCLFNBQVMsQ0FBQztBQUNuRDtBQUlBLHNCQUFzQix1QkFBdUI7QUFDM0MsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsUUFBTSxPQUFPLG9CQUFJLEtBQUs7QUFDdEIsT0FBSyxTQUFTLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFHeEIsUUFBTSxVQUFVLE1BQU0sR0FBRyxPQUFPO0FBQUEsSUFDOUIsUUFBUTtBQUFBLElBQ1IsWUFBWTtBQUFBLEVBQ2QsQ0FBQyxFQUNFLEtBQUssaUJBQWlCLEVBQ3RCLFVBQVUsYUFBYSxHQUFHLGtCQUFrQixjQUFjLFlBQVksRUFBRSxDQUFDLEVBQ3pFLE1BQU07QUFBQSxJQUNMLEdBQUcsa0JBQWtCLE9BQU8sSUFBSTtBQUFBLElBQ2hDLEdBQUcsa0JBQWtCLFNBQVMsS0FBSztBQUFBLElBQ25DLEdBQUcsWUFBWSxRQUFRLE9BQU87QUFBQSxFQUNoQyxDQUFDO0FBR0gsU0FBTyxRQUFRLE9BQU8sQ0FBQyxFQUFFLFFBQVEsV0FBVyxNQUFNO0FBQ2hELFVBQU0saUJBQWlCLElBQUksS0FBSyxXQUFXLGNBQWM7QUFDekQsbUJBQWUsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBRWxDLFVBQU0sbUJBQW1CO0FBQUEsTUFDdkIsV0FBVztBQUFBLE1BQ1gsZ0JBQWdCO0FBQUEsTUFDaEIsb0JBQW9CO0FBQUEsTUFDcEIscUJBQXFCO0FBQUEsTUFDckIsZ0JBQWdCO0FBQUEsSUFDbEI7QUFFQSxVQUFNLFlBQVksaUJBQWlCLE9BQU8sVUFBMkMsS0FBSztBQUMxRixVQUFNLGFBQWEsSUFBSSxLQUFLLGNBQWM7QUFDMUMsZUFBVyxRQUFRLFdBQVcsUUFBUSxJQUFJLFNBQVM7QUFHbkQsV0FBTyxjQUFjO0FBQUEsRUFDdkIsQ0FBQztBQUNIO0FBRUEsc0JBQXNCLHdCQUF3QixVQUFrQjtBQUM5RCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxRQUFNLEdBQUcsT0FBTyxpQkFBaUIsRUFDOUIsSUFBSSxFQUFFLFNBQVMsTUFBTSxXQUFXLG9CQUFJLEtBQUssRUFBRSxDQUFDLEVBQzVDLE1BQU0sR0FBRyxrQkFBa0IsSUFBSSxRQUFRLENBQUM7QUFDN0M7QUFFQSxzQkFBc0IsOEJBQThCLGNBQXNCLFNBS3ZFO0FBQ0QsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsTUFBSSxRQUFRLEdBQUcsT0FBTyxFQUFFLEtBQUssV0FBVyxFQUNyQyxNQUFNLEdBQUcsWUFBWSxjQUFjLFlBQVksQ0FBQztBQUduRCxRQUFNLGFBQWEsQ0FBQyxHQUFHLFlBQVksY0FBYyxZQUFZLENBQUM7QUFFOUQsTUFBSSxTQUFTLE1BQU07QUFDakIsZUFBVyxLQUFLLEdBQUcsWUFBWSxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDcEQ7QUFDQSxNQUFJLFNBQVMsUUFBUTtBQUNuQixlQUFXLEtBQUssR0FBRyxZQUFZLFFBQVEsUUFBUSxNQUFNLENBQUM7QUFBQSxFQUN4RDtBQUNBLE1BQUksU0FBUyxZQUFZO0FBQ3ZCLGVBQVcsS0FBSyxJQUFJLFlBQVksZ0JBQWdCLFFBQVEsVUFBVSxDQUFDO0FBQUEsRUFDckU7QUFDQSxNQUFJLFNBQVMsU0FBUztBQUNwQixlQUFXLEtBQUssSUFBSSxZQUFZLGdCQUFnQixRQUFRLE9BQU8sQ0FBQztBQUFBLEVBQ2xFO0FBRUEsU0FBTyxHQUFHLE9BQU8sRUFBRSxLQUFLLFdBQVcsRUFDaEMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLEVBQ3hCLFFBQVEsWUFBWSxjQUFjO0FBQ3ZDO0FBR0Esc0JBQXNCLHFCQUFxQixjQUFzQixLQUFhO0FBQzVFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFFBQU0sU0FBUyxNQUFNLEdBQUcsT0FBTztBQUFBLElBQzdCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxFQUNWLENBQUMsRUFBRSxLQUFLLFdBQVcsRUFDaEIsTUFBTTtBQUFBLElBQ0wsR0FBRyxZQUFZLGNBQWMsWUFBWTtBQUFBLElBQ3pDLDhCQUE4QixHQUFHO0FBQUEsRUFDbkMsQ0FBQyxFQUNBLFFBQVEsMkJBQTJCLEVBQ25DLFFBQVEsMkJBQTJCO0FBRXRDLFNBQU87QUFDVDtBQUVBLHNCQUFzQiwyQkFBMkIsY0FBc0I7QUFDckUsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsUUFBTSxTQUFTLE1BQU0sR0FBRyxPQUFPO0FBQUEsSUFDN0IsTUFBTSxZQUFZO0FBQUEsSUFDbEIsT0FBTztBQUFBLElBQ1AsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsWUFBWTtBQUFBLEVBQ2QsQ0FBQyxFQUFFLEtBQUssV0FBVyxFQUNoQixNQUFNLEdBQUcsWUFBWSxjQUFjLFlBQVksQ0FBQyxFQUNoRCxRQUFRLFlBQVksSUFBSTtBQUUzQixTQUFPO0FBQ1Q7QUFFQSxzQkFBc0Isd0JBQXdCLGNBQXNCO0FBQ2xFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFFBQU0sU0FBUyxNQUFNLEdBQUcsT0FBTztBQUFBLElBQzdCLFFBQVEsWUFBWTtBQUFBLElBQ3BCLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxFQUNkLENBQUMsRUFBRSxLQUFLLFdBQVcsRUFDaEIsTUFBTSxHQUFHLFlBQVksY0FBYyxZQUFZLENBQUMsRUFDaEQsUUFBUSxZQUFZLE1BQU07QUFFN0IsU0FBTztBQUNUO0FBRUEsc0JBQXNCLHVCQUF1QixjQUFzQixPQUFlLElBQUk7QUFDcEYsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsUUFBTSxPQUFPLG9CQUFJLEtBQUs7QUFDdEIsUUFBTSxhQUFhLG9CQUFJLEtBQUs7QUFDNUIsYUFBVyxRQUFRLFdBQVcsUUFBUSxJQUFJLElBQUk7QUFFOUMsU0FBTyxHQUFHLE9BQU8sRUFBRSxLQUFLLFdBQVcsRUFDaEMsTUFBTTtBQUFBLElBQ0wsR0FBRyxZQUFZLGNBQWMsWUFBWTtBQUFBLElBQ3pDLEdBQUcsWUFBWSxRQUFRLE9BQU87QUFBQSxJQUM5QixJQUFJLFlBQVksZ0JBQWdCLElBQUk7QUFBQSxJQUNwQyxJQUFJLFlBQVksZ0JBQWdCLFVBQVU7QUFBQSxFQUM1QyxDQUFDLEVBQ0EsUUFBUSxZQUFZLGNBQWM7QUFDdkM7QUFFQSxzQkFBc0IsaUNBQWlDLGNBQXNCO0FBQzNFLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTztBQUVoQixRQUFNLE9BQU8sb0JBQUksS0FBSztBQUN0QixRQUFNLGFBQWEsb0JBQUksS0FBSztBQUM1QixhQUFXLFFBQVEsV0FBVyxRQUFRLElBQUksRUFBRTtBQUU1QyxRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU87QUFBQSxJQUM3QixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVixnQkFBZ0I7QUFBQSxJQUNoQixpQkFBaUI7QUFBQSxJQUNqQixXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsRUFDZixDQUFDLEVBQUUsS0FBSyxXQUFXLEVBQ2hCLE1BQU0sR0FBRyxZQUFZLGNBQWMsWUFBWSxDQUFDO0FBRW5ELFNBQU8sT0FBTyxDQUFDLEtBQUs7QUFDdEI7QUFFQSxzQkFBc0IsdUJBQXVCLGNBQXNCLFFBQWdCLElBQUk7QUFDckYsUUFBTSxLQUFLLE1BQU0sTUFBTTtBQUN2QixNQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsUUFBTSxTQUFTLE1BQU0sR0FBRyxPQUFPO0FBQUEsSUFDN0IsS0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLEVBQ2QsQ0FBQyxFQUFFLEtBQUssV0FBVyxFQUNoQixNQUFNO0FBQUEsSUFDTCxHQUFHLFlBQVksY0FBYyxZQUFZO0FBQUEsSUFDekMsc0RBQXNELEtBQUs7QUFBQSxFQUM3RCxDQUFDLEVBQ0EsUUFBUSw0QkFBNEIsMkJBQTJCLEVBQy9ELFFBQVEsNEJBQTRCLDJCQUEyQjtBQUVsRSxTQUFPO0FBQ1Q7QUFNQSxTQUFTLG1CQUFtQiwyQkFBbUQ7QUFFL0Usc0JBQXNCLHFCQUFxQixjQUFzQjtBQUMvRCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLFFBQU8sQ0FBQztBQUVqQixRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sRUFDNUIsS0FBSyxpQkFBaUIsRUFDdEIsTUFBTSxHQUFHLGtCQUFrQixjQUFjLFlBQVksQ0FBQztBQUV6RCxTQUFPO0FBQ1Q7QUFFQSxzQkFBc0Isc0JBQXNCLGNBQXlDO0FBQ25GLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksUUFBTyxvQkFBb0IsSUFBSSxPQUFLLEVBQUUsRUFBRTtBQUVqRCxRQUFNLFNBQVMsTUFBTSxHQUFHLE9BQU8sRUFDNUIsS0FBSyxpQkFBaUIsRUFDdEIsTUFBTTtBQUFBLElBQ0wsR0FBRyxrQkFBa0IsY0FBYyxZQUFZO0FBQUEsSUFDL0MsR0FBRyxrQkFBa0IsWUFBWSxJQUFJO0FBQUEsRUFDdkMsQ0FBQztBQUdILE1BQUksT0FBTyxXQUFXLEdBQUc7QUFDdkIsV0FBTyxvQkFBb0IsSUFBSSxPQUFLLEVBQUUsRUFBRTtBQUFBLEVBQzFDO0FBRUEsU0FBTyxPQUFPLElBQUksT0FBSyxFQUFFLFFBQVE7QUFDbkM7QUFFQSxzQkFBc0Isb0JBQW9CLGNBQXNCLFVBQWtCLFlBQXFCO0FBQ3JHLFFBQU0sS0FBSyxNQUFNLE1BQU07QUFDdkIsTUFBSSxDQUFDLEdBQUksT0FBTSxJQUFJLE1BQU0sd0JBQXdCO0FBR2pELFFBQU0sV0FBVyxNQUFNLEdBQUcsT0FBTyxFQUM5QixLQUFLLGlCQUFpQixFQUN0QixNQUFNO0FBQUEsSUFDTCxHQUFHLGtCQUFrQixjQUFjLFlBQVk7QUFBQSxJQUMvQyxHQUFHLGtCQUFrQixVQUFVLFFBQVE7QUFBQSxFQUN6QyxDQUFDO0FBRUgsTUFBSSxTQUFTLFNBQVMsR0FBRztBQUV2QixVQUFNLEdBQUcsT0FBTyxpQkFBaUIsRUFDOUIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxFQUNsQixNQUFNO0FBQUEsTUFDTCxHQUFHLGtCQUFrQixjQUFjLFlBQVk7QUFBQSxNQUMvQyxHQUFHLGtCQUFrQixVQUFVLFFBQVE7QUFBQSxJQUN6QyxDQUFDO0FBQUEsRUFDTCxPQUFPO0FBRUwsVUFBTSxHQUFHLE9BQU8saUJBQWlCLEVBQUUsT0FBTztBQUFBLE1BQ3hDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTyxFQUFFLGNBQWMsVUFBVSxXQUFXO0FBQzlDO0FBRUEsc0JBQXNCLCtCQUErQixjQUFzQixTQUFzRDtBQUMvSCxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUVqRCxhQUFXLFVBQVUsU0FBUztBQUM1QixVQUFNLG9CQUFvQixjQUFjLE9BQU8sVUFBVSxPQUFPLFVBQVU7QUFBQSxFQUM1RTtBQUVBLFNBQU8sRUFBRSxjQUFjLFNBQVMsUUFBUSxPQUFPO0FBQ2pEO0FBRUEsc0JBQXNCLDZCQUE2QixjQUFzQjtBQUN2RSxRQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxHQUFJLE9BQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUdqRCxRQUFNLFdBQVcsTUFBTSxHQUFHLE9BQU8sRUFDOUIsS0FBSyxpQkFBaUIsRUFDdEIsTUFBTSxHQUFHLGtCQUFrQixjQUFjLFlBQVksQ0FBQztBQUV6RCxNQUFJLFNBQVMsU0FBUyxHQUFHO0FBQ3ZCLFdBQU8sRUFBRSxjQUFjLGFBQWEsT0FBTyxTQUFTLDJCQUEyQjtBQUFBLEVBQ2pGO0FBR0EsYUFBVyxVQUFVLHFCQUFxQjtBQUN4QyxVQUFNLEdBQUcsT0FBTyxpQkFBaUIsRUFBRSxPQUFPO0FBQUEsTUFDeEM7QUFBQSxNQUNBLFVBQVUsT0FBTztBQUFBLE1BQ2pCLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTyxFQUFFLGNBQWMsYUFBYSxNQUFNLE9BQU8sb0JBQW9CLE9BQU87QUFDOUU7IiwibmFtZXMiOltdfQ==
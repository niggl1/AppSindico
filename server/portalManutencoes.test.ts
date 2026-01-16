import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

describe("Portal de Manutenções - Database Tables", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should have manutencoes table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    // Verificar se a tabela manutencoes existe e pode ser consultada
    const result = await db.execute("SELECT 1 FROM manutencoes LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });

  it("should have vistorias table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    const result = await db.execute("SELECT 1 FROM vistorias LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });

  it("should have ocorrencias table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    const result = await db.execute("SELECT 1 FROM ocorrencias LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });

  it("should have checklists table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    const result = await db.execute("SELECT 1 FROM checklists LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });

  it("should have membros_equipe table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    const result = await db.execute("SELECT 1 FROM membros_equipe LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });

  it("should have tarefas_facil table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    const result = await db.execute("SELECT 1 FROM tarefas_facil LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });
});

describe("Portal de Manutenções - tRPC Routers", () => {
  it("should have manutencao router defined", async () => {
    const { appRouter } = await import("./routers");
    // Os routers estão aninhados, então verificamos se existem como propriedades
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("manutencao");
  });

  it("should have vistoria router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("vistoria");
  });

  it("should have ocorrencia router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("ocorrencia");
  });

  it("should have checklist router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("checklist");
  });

  it("should have membroEquipe router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("membroEquipe");
  });

  it("should have tarefaFacil router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("tarefaFacil");
  });
});

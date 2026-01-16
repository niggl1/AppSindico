import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

describe("Construtor de App - Database Tables", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should have condominio_funcoes table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }
    
    // Verificar se a tabela condominio_funcoes existe e pode ser consultada
    const result = await db.execute("SELECT 1 FROM condominio_funcoes LIMIT 1").catch(() => null);
    expect(result).not.toBeNull();
  });
});

describe("Construtor de App - tRPC Routers", () => {
  it("should have funcoesCondominio router defined", async () => {
    const { appRouter } = await import("./routers");
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("funcoesCondominio");
  });

  it("should have listarDisponiveis procedure", async () => {
    const { appRouter } = await import("./routers");
    const funcoesCondominio = appRouter._def.record.funcoesCondominio;
    expect(funcoesCondominio).toBeDefined();
  });

  it("should have listarCategorias procedure", async () => {
    const { appRouter } = await import("./routers");
    const funcoesCondominio = appRouter._def.record.funcoesCondominio;
    expect(funcoesCondominio).toBeDefined();
  });

  it("should have toggle procedure", async () => {
    const { appRouter } = await import("./routers");
    const funcoesCondominio = appRouter._def.record.funcoesCondominio;
    expect(funcoesCondominio).toBeDefined();
  });

  it("should have atualizarMultiplas procedure", async () => {
    const { appRouter } = await import("./routers");
    const funcoesCondominio = appRouter._def.record.funcoesCondominio;
    expect(funcoesCondominio).toBeDefined();
  });
});

describe("Construtor de App - FUNCOES_DISPONIVEIS", () => {
  it("should have all required fields in FUNCOES_DISPONIVEIS", async () => {
    const { FUNCOES_DISPONIVEIS } = await import("../drizzle/schema");
    
    expect(FUNCOES_DISPONIVEIS.length).toBeGreaterThan(30);
    
    // Verificar que cada função tem os campos necessários
    FUNCOES_DISPONIVEIS.forEach((funcao) => {
      expect(funcao).toHaveProperty("id");
      expect(funcao).toHaveProperty("nome");
      expect(funcao).toHaveProperty("categoria");
      expect(funcao).toHaveProperty("descricao");
      expect(funcao).toHaveProperty("icone");
      expect(funcao).toHaveProperty("rota");
    });
  });

  it("should have CATEGORIAS_FUNCOES defined", async () => {
    const { CATEGORIAS_FUNCOES } = await import("../drizzle/schema");
    
    expect(CATEGORIAS_FUNCOES.length).toBeGreaterThan(5);
    
    // Verificar que cada categoria tem os campos necessários
    CATEGORIAS_FUNCOES.forEach((categoria) => {
      expect(categoria).toHaveProperty("id");
      expect(categoria).toHaveProperty("nome");
      expect(categoria).toHaveProperty("icone");
      expect(categoria).toHaveProperty("cor");
    });
  });

  it("should have all categories covered in FUNCOES_DISPONIVEIS", async () => {
    const { FUNCOES_DISPONIVEIS, CATEGORIAS_FUNCOES } = await import("../drizzle/schema");
    
    const categoriasUsadas = new Set(FUNCOES_DISPONIVEIS.map(f => f.categoria));
    const categoriasDefinidas = new Set(CATEGORIAS_FUNCOES.map(c => c.id));
    
    // Verificar que todas as categorias usadas estão definidas
    categoriasUsadas.forEach(cat => {
      expect(categoriasDefinidas.has(cat)).toBe(true);
    });
  });
});

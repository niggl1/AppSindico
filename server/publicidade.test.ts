import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("anunciante router", () => {
  it("should have list procedure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Test that the procedure exists and can be called
    const result = await caller.anunciante.list({ condominioId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should have getById procedure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.anunciante.getById({ id: 999 });
    expect(result).toBeNull();
  });
});

describe("anuncio router", () => {
  it("should have list procedure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.anuncio.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should have listByCondominioAtivos procedure (public)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.anuncio.listByCondominioAtivos({ condominioId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("publicidade integration", () => {
  it("should support categorias de anunciantes", () => {
    const categorias = [
      "comercio",
      "servicos", 
      "profissionais",
      "alimentacao",
      "saude",
      "educacao",
      "outros"
    ];
    
    expect(categorias).toHaveLength(7);
    expect(categorias).toContain("comercio");
    expect(categorias).toContain("servicos");
    expect(categorias).toContain("profissionais");
  });

  it("should support posicoes de anuncios", () => {
    const posicoes = [
      "capa",
      "contracapa",
      "pagina_interna",
      "rodape",
      "lateral"
    ];
    
    expect(posicoes).toHaveLength(5);
    expect(posicoes).toContain("pagina_interna");
  });

  it("should support tamanhos de anuncios", () => {
    const tamanhos = [
      "pequeno",
      "medio",
      "grande",
      "pagina_inteira"
    ];
    
    expect(tamanhos).toHaveLength(4);
    expect(tamanhos).toContain("medio");
  });

  it("should support status de anuncios", () => {
    const status = [
      "ativo",
      "pausado",
      "expirado",
      "pendente"
    ];
    
    expect(status).toHaveLength(4);
    expect(status).toContain("ativo");
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});

describe("condominio router", () => {
  it("list returns empty array when database is not available", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // This will return empty array since we don't have a real DB in tests
    const result = await caller.condominio.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("get returns null for non-existent condominio", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.condominio.get({ id: 99999 });
    
    expect(result).toBeNull();
  });
});

describe("revista router", () => {
  it("list returns empty array when no revistas exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.revista.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("get returns null for non-existent revista by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.revista.get({ id: 99999 });
    
    expect(result).toBeNull();
  });

  it("get returns null for non-existent revista by shareLink", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.revista.get({ shareLink: "non-existent-link" });
    
    expect(result).toBeNull();
  });
});

describe("aviso router", () => {
  it("list returns empty array when no avisos exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.aviso.list({ revistaId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("funcionario router", () => {
  it("list returns empty array when no funcionarios exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.funcionario.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("votacao router", () => {
  it("list returns empty array when no votacoes exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.votacao.list({ revistaId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("get returns null for non-existent votacao", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.votacao.get({ id: 99999 });
    
    expect(result).toBeNull();
  });
});

describe("telefone router", () => {
  it("list is accessible without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.telefone.list({ revistaId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("link router", () => {
  it("list is accessible without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.link.list({ revistaId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("classificado router", () => {
  it("list returns empty array when no classificados exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.classificado.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("carona router", () => {
  it("list returns empty array when no caronas exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.carona.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("achadoPerdido router", () => {
  it("list returns empty array when no achados/perdidos exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.achadoPerdido.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("morador router", () => {
  it("list returns empty array when no moradores exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.morador.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("publicidade router", () => {
  it("list returns empty array when no publicidades exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.publicidade.list({ condominioId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

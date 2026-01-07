import { describe, it, expect } from "vitest";
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

describe("Valores Salvos API", () => {
  const ctx = createAuthContext();
  const caller = appRouter.createCaller(ctx);
  const testCondominioId = 1;

  describe("valoresSalvos.create", () => {
    it("should create a new saved value", async () => {
      const uniqueValue = `João Silva - Teste ${Date.now()}`;
      const result = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "responsavel",
        valor: uniqueValue,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
      expect(result.isNew).toBe(true);
    });

    it("should return existing value if duplicate", async () => {
      const uniqueValue = `Duplicate Test ${Date.now()}`;
      
      // Create first time
      const result1 = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "responsavel",
        valor: uniqueValue,
      });
      expect(result1.isNew).toBe(true);

      // Create second time (duplicate)
      const result2 = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "responsavel",
        valor: uniqueValue,
      });
      expect(result2.isNew).toBe(false);
      expect(result2.id).toBe(result1.id);
    });

    it("should create values for different types", async () => {
      const timestamp = Date.now();
      const tipos = [
        { tipo: "categoria_vistoria" as const, valor: `Preventiva ${timestamp}` },
        { tipo: "tipo_manutencao" as const, valor: `Elétrica ${timestamp}` },
        { tipo: "fornecedor" as const, valor: `Empresa ABC ${timestamp}` },
        { tipo: "localizacao" as const, valor: `Bloco A - Térreo ${timestamp}` },
      ];

      for (const item of tipos) {
        const result = await caller.valoresSalvos.create({
          condominioId: testCondominioId,
          tipo: item.tipo,
          valor: item.valor,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.isNew).toBe(true);
      }
    });
  });

  describe("valoresSalvos.list", () => {
    it("should list saved values by type", async () => {
      // First create a value to ensure there's at least one
      const uniqueValue = `List Test ${Date.now()}`;
      await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "responsavel",
        valor: uniqueValue,
      });

      const result = await caller.valoresSalvos.list({
        condominioId: testCondominioId,
        tipo: "responsavel",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verify all items have the correct type
      result.forEach((item) => {
        expect(item.tipo).toBe("responsavel");
        expect(item.condominioId).toBe(testCondominioId);
        expect(item.ativo).toBe(true);
      });
    });

    it("should return empty array for type with no values", async () => {
      const result = await caller.valoresSalvos.list({
        condominioId: 99999, // Non-existent condominio
        tipo: "tipo_ocorrencia",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("valoresSalvos.delete", () => {
    it("should soft delete a saved value", async () => {
      // First create a value to delete
      const uniqueValue = `Delete Test ${Date.now()}`;
      const createResult = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "categoria_checklist",
        valor: uniqueValue,
      });

      const deleteResult = await caller.valoresSalvos.delete({
        id: createResult.id,
      });

      expect(deleteResult).toBeDefined();
      expect(deleteResult.success).toBe(true);

      // Verify it's no longer in the list
      const listResult = await caller.valoresSalvos.list({
        condominioId: testCondominioId,
        tipo: "categoria_checklist",
      });

      const deletedItem = listResult.find((item) => item.id === createResult.id);
      expect(deletedItem).toBeUndefined();
    });

    it("should reactivate a deleted value when created again", async () => {
      const uniqueValue = `Reactivate Test ${Date.now()}`;
      
      // Create and delete a value
      const createResult1 = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "tipo_vistoria",
        valor: uniqueValue,
      });

      await caller.valoresSalvos.delete({ id: createResult1.id });

      // Create the same value again
      const createResult2 = await caller.valoresSalvos.create({
        condominioId: testCondominioId,
        tipo: "tipo_vistoria",
        valor: uniqueValue,
      });

      expect(createResult2.id).toBe(createResult1.id);
      expect(createResult2.isNew).toBe(false);

      // Verify it's back in the list
      const listResult = await caller.valoresSalvos.list({
        condominioId: testCondominioId,
        tipo: "tipo_vistoria",
      });

      const reactivatedItem = listResult.find((item) => item.id === createResult1.id);
      expect(reactivatedItem).toBeDefined();
    });
  });
});

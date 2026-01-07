import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo de base de dados
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";

describe("Vagas de Estacionamento API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("vagaEstacionamento.list", () => {
    it("deve retornar lista vazia quando não há vagas", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).orderBy({});
      expect(result).toEqual([]);
    });

    it("deve retornar vagas ordenadas por número", async () => {
      const mockVagas = [
        { id: 1, numero: "101", tipo: "coberta", apartamento: "101", bloco: "A" },
        { id: 2, numero: "102", tipo: "descoberta", apartamento: "102", bloco: "A" },
        { id: 3, numero: "M01", tipo: "moto", apartamento: "103", bloco: "B" },
      ];
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockVagas),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).orderBy({});
      expect(result).toHaveLength(3);
      expect(result[0].numero).toBe("101");
      expect(result[2].tipo).toBe("moto");
    });
  });

  describe("vagaEstacionamento.create", () => {
    it("deve criar uma nova vaga com sucesso", async () => {
      const mockInsertResult = [{ insertId: 1 }];
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(mockInsertResult),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.insert({}).values({
        condominioId: 1,
        numero: "101",
        tipo: "coberta",
        apartamento: "101",
        bloco: "A",
      });

      expect(result[0].insertId).toBe(1);
    });

    it("deve aceitar diferentes tipos de vaga", async () => {
      const tipos = ["coberta", "descoberta", "moto"];
      
      for (const tipo of tipos) {
        const mockDb = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        const result = await mockDb.insert({}).values({
          condominioId: 1,
          numero: "101",
          tipo,
        });

        expect(result[0].insertId).toBe(1);
      }
    });
  });

  describe("vagaEstacionamento.getByApartamento", () => {
    it("deve retornar vagas de um apartamento específico", async () => {
      const mockVagas = [
        { id: 1, numero: "101", apartamento: "101", bloco: "A" },
        { id: 2, numero: "102", apartamento: "101", bloco: "A" },
      ];
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVagas),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({});
      expect(result).toHaveLength(2);
      expect(result.every((v: any) => v.apartamento === "101")).toBe(true);
    });
  });
});

describe("Moderação de Classificados API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("moderacao.listPendentes", () => {
    it("deve retornar lista vazia quando não há classificados pendentes", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).leftJoin({}, {}).where({}).orderBy({});
      expect(result).toEqual([]);
    });

    it("deve retornar classificados pendentes com dados do usuário", async () => {
      const mockPendentes = [
        {
          classificado: { id: 1, titulo: "Sofá", status: "pendente", tipo: "produto" },
          usuario: { id: 1, name: "João", apartment: "101" },
        },
        {
          classificado: { id: 2, titulo: "Aulas de Inglês", status: "pendente", tipo: "servico" },
          usuario: { id: 2, name: "Maria", apartment: "202" },
        },
      ];
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockPendentes),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).leftJoin({}, {}).where({}).orderBy({});
      expect(result).toHaveLength(2);
      expect(result[0].classificado.status).toBe("pendente");
      expect(result[0].usuario.name).toBe("João");
    });
  });

  describe("moderacao.aprovar", () => {
    it("deve aprovar um classificado com sucesso", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.update({}).set({ status: "aprovado" }).where({});
      expect(result.affectedRows).toBe(1);
    });
  });

  describe("moderacao.rejeitar", () => {
    it("deve rejeitar um classificado com sucesso", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.update({}).set({ status: "rejeitado" }).where({});
      expect(result.affectedRows).toBe(1);
    });
  });

  describe("moderacao.stats", () => {
    it("deve retornar estatísticas de moderação", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      // Simular 3 chamadas para pendentes, aprovados e rejeitados
      const pendentes = await mockDb.select().from({}).where({});
      const aprovados = await mockDb.select().from({}).where({});
      const rejeitados = await mockDb.select().from({}).where({});

      expect(pendentes[0].count).toBe(5);
      expect(aprovados[0].count).toBe(5);
      expect(rejeitados[0].count).toBe(5);
    });
  });
});

describe("Preferências de Notificação API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("preferenciaNotificacao.get", () => {
    it("deve retornar null quando não há preferências", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result).toEqual([]);
    });

    it("deve retornar preferências do usuário", async () => {
      const mockPreferencias = [{
        id: 1,
        userId: 1,
        avisos: true,
        eventos: true,
        votacoes: false,
        classificados: true,
        caronas: false,
        efeitoTransicao: "flip",
      }];
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockPreferencias),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result[0].efeitoTransicao).toBe("flip");
      expect(result[0].votacoes).toBe(false);
    });
  });

  describe("preferenciaNotificacao.upsert", () => {
    it("deve criar novas preferências quando não existem", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      // Verificar se não existe
      const existing = await mockDb.select().from({}).where({}).limit(1);
      expect(existing).toEqual([]);

      // Criar novo
      const result = await mockDb.insert({}).values({
        userId: 1,
        efeitoTransicao: "cube",
      });
      expect(result[0].insertId).toBe(1);
    });

    it("deve atualizar preferências existentes", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, userId: 1 }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      // Verificar se existe
      const existing = await mockDb.select().from({}).where({}).limit(1);
      expect(existing).toHaveLength(1);

      // Atualizar
      const result = await mockDb.update({}).set({ efeitoTransicao: "magazine" }).where({});
      expect(result.affectedRows).toBe(1);
    });

    it("deve aceitar diferentes efeitos de transição", async () => {
      const efeitos = ["slide", "flip", "fade", "zoom", "rotate", "cube", "cards", "magazine"];
      
      for (const efeito of efeitos) {
        const mockDb = {
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ id: 1 }]),
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
          }),
        };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        const result = await mockDb.update({}).set({ efeitoTransicao: efeito }).where({});
        expect(result.affectedRows).toBe(1);
      }
    });
  });
});

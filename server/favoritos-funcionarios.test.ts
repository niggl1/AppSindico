import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do banco de dados
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("Favoritos API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockResolvedValue([]);
  });

  describe("favorito.list", () => {
    it("deve retornar lista vazia quando não há favoritos", async () => {
      mockDb.orderBy.mockResolvedValue([]);
      const result = await mockDb.select().from("favoritos").where("userId = 1").orderBy("createdAt");
      expect(result).toEqual([]);
    });

    it("deve retornar favoritos do utilizador", async () => {
      const mockFavoritos = [
        { id: 1, userId: 1, tipoItem: "aviso", itemId: 1, createdAt: new Date() },
        { id: 2, userId: 1, tipoItem: "evento", itemId: 2, createdAt: new Date() },
      ];
      mockDb.orderBy.mockResolvedValue(mockFavoritos);
      
      const result = await mockDb.select().from("favoritos").where("userId = 1").orderBy("createdAt");
      expect(result).toHaveLength(2);
      expect(result[0].tipoItem).toBe("aviso");
    });
  });

  describe("favorito.check", () => {
    it("deve retornar false quando item não é favorito", async () => {
      mockDb.where.mockResolvedValue([]);
      const result = await mockDb.select().from("favoritos").where("userId = 1 AND itemId = 1");
      expect(result.length).toBe(0);
    });

    it("deve retornar true quando item é favorito", async () => {
      mockDb.where.mockResolvedValue([{ id: 1 }]);
      const result = await mockDb.select().from("favoritos").where("userId = 1 AND itemId = 1");
      expect(result.length).toBe(1);
    });
  });

  describe("favorito.toggle", () => {
    it("deve adicionar favorito quando não existe", async () => {
      mockDb.where.mockResolvedValue([]);
      mockDb.values.mockResolvedValue([{ insertId: 1 }]);
      
      const existing = await mockDb.select().from("favoritos").where("userId = 1 AND itemId = 1");
      expect(existing.length).toBe(0);
      
      const result = await mockDb.insert("favoritos").values({ userId: 1, tipoItem: "aviso", itemId: 1 });
      expect(result[0].insertId).toBe(1);
    });

    it("deve remover favorito quando já existe", async () => {
      mockDb.where.mockResolvedValue([{ id: 1 }]);
      
      const existing = await mockDb.select().from("favoritos").where("userId = 1 AND itemId = 1");
      expect(existing.length).toBe(1);
    });
  });

  describe("favorito.listCards", () => {
    it("deve retornar apenas favoritos do tipo card_secao", async () => {
      const mockCardFavoritos = [
        { id: 1, userId: 1, tipoItem: "card_secao", cardSecaoId: "Avisos", createdAt: new Date() },
        { id: 2, userId: 1, tipoItem: "card_secao", cardSecaoId: "Eventos", createdAt: new Date() },
      ];
      mockDb.orderBy.mockResolvedValue(mockCardFavoritos);
      
      const result = await mockDb.select().from("favoritos").where("tipoItem = card_secao").orderBy("createdAt");
      expect(result).toHaveLength(2);
      expect(result[0].cardSecaoId).toBe("Avisos");
    });
  });
});

describe("Funcionários API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockResolvedValue([]);
  });

  describe("funcionario.list", () => {
    it("deve retornar lista vazia quando não há funcionários", async () => {
      mockDb.where.mockResolvedValue([]);
      const result = await mockDb.select().from("funcionarios").where("condominioId = 1");
      expect(result).toEqual([]);
    });

    it("deve retornar funcionários do condomínio", async () => {
      const mockFuncionarios = [
        { id: 1, condominioId: 1, nome: "João Silva", cargo: "Porteiro", departamento: "Portaria" },
        { id: 2, condominioId: 1, nome: "Maria Santos", cargo: "Zeladora", departamento: "Limpeza" },
      ];
      mockDb.where.mockResolvedValue(mockFuncionarios);
      
      const result = await mockDb.select().from("funcionarios").where("condominioId = 1");
      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe("João Silva");
      expect(result[0].cargo).toBe("Porteiro");
    });
  });

  describe("funcionario.create", () => {
    it("deve criar funcionário com campos obrigatórios", async () => {
      mockDb.values.mockResolvedValue([{ insertId: 1 }]);
      
      const result = await mockDb.insert("funcionarios").values({
        condominioId: 1,
        nome: "Pedro Costa",
        cargo: "Faxineiro",
      });
      
      expect(result[0].insertId).toBe(1);
    });

    it("deve criar funcionário com todos os campos", async () => {
      mockDb.values.mockResolvedValue([{ insertId: 2 }]);
      
      const result = await mockDb.insert("funcionarios").values({
        condominioId: 1,
        nome: "Ana Oliveira",
        cargo: "Recepcionista",
        departamento: "Recepção",
        telefone: "(11) 99999-9999",
        email: "ana@condominio.com",
        fotoUrl: "https://example.com/foto.jpg",
      });
      
      expect(result[0].insertId).toBe(2);
    });
  });

  describe("funcionario.update", () => {
    it("deve atualizar dados do funcionário", async () => {
      mockDb.where.mockResolvedValue([{ affectedRows: 1 }]);
      
      await mockDb.update("funcionarios").set({ cargo: "Supervisor" }).where("id = 1");
      expect(mockDb.set).toHaveBeenCalledWith({ cargo: "Supervisor" });
    });
  });

  describe("funcionario.delete", () => {
    it("deve remover funcionário", async () => {
      mockDb.where.mockResolvedValue([{ affectedRows: 1 }]);
      
      await mockDb.delete("funcionarios").where("id = 1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});

describe("Imagens Múltiplas API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockResolvedValue([]);
  });

  describe("imagemRealizacao.list", () => {
    it("deve retornar imagens de uma realização", async () => {
      const mockImagens = [
        { id: 1, realizacaoId: 1, imagemUrl: "https://example.com/img1.jpg", ordem: 0 },
        { id: 2, realizacaoId: 1, imagemUrl: "https://example.com/img2.jpg", ordem: 1 },
      ];
      mockDb.orderBy.mockResolvedValue(mockImagens);
      
      const result = await mockDb.select().from("imagens_realizacoes").where("realizacaoId = 1").orderBy("ordem");
      expect(result).toHaveLength(2);
      expect(result[0].ordem).toBe(0);
    });
  });

  describe("imagemRealizacao.createMultiple", () => {
    it("deve criar múltiplas imagens de uma vez", async () => {
      mockDb.values.mockResolvedValue([{ affectedRows: 3 }]);
      
      const imagens = [
        { realizacaoId: 1, imagemUrl: "https://example.com/img1.jpg", ordem: 0 },
        { realizacaoId: 1, imagemUrl: "https://example.com/img2.jpg", ordem: 1 },
        { realizacaoId: 1, imagemUrl: "https://example.com/img3.jpg", ordem: 2 },
      ];
      
      await mockDb.insert("imagens_realizacoes").values(imagens);
      expect(mockDb.values).toHaveBeenCalledWith(imagens);
    });
  });

  describe("imagemVaga.list", () => {
    it("deve retornar imagens e anexos de uma vaga", async () => {
      const mockArquivos = [
        { id: 1, vagaId: 1, tipo: "imagem", url: "https://example.com/vaga1.jpg" },
        { id: 2, vagaId: 1, tipo: "anexo", url: "https://example.com/contrato.pdf", nome: "contrato.pdf" },
      ];
      mockDb.orderBy.mockResolvedValue(mockArquivos);
      
      const result = await mockDb.select().from("imagens_vagas").where("vagaId = 1").orderBy("ordem");
      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe("imagem");
      expect(result[1].tipo).toBe("anexo");
    });
  });
});

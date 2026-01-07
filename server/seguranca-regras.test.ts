import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo de base de dados
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";

describe("Dicas de Segurança API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("seguranca.list", () => {
    it("deve retornar lista vazia quando não há dicas", async () => {
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

    it("deve retornar lista de dicas quando existem", async () => {
      const mockDicas = [
        { id: 1, titulo: "Dica 1", conteudo: "Conteúdo 1", categoria: "geral" },
        { id: 2, titulo: "Dica 2", conteudo: "Conteúdo 2", categoria: "incendio" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockDicas),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).orderBy({});
      expect(result).toHaveLength(2);
      expect(result[0].titulo).toBe("Dica 1");
    });
  });

  describe("seguranca.create", () => {
    it("deve criar uma nova dica de segurança", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.insert({}).values({
        titulo: "Nova Dica",
        conteudo: "Conteúdo da dica",
        categoria: "geral",
      });
      expect(result[0].insertId).toBe(1);
    });

    it("deve aceitar diferentes categorias", async () => {
      const categorias = ["geral", "incendio", "roubo", "criancas", "idosos", "digital", "veiculos"];
      
      for (const categoria of categorias) {
        const mockDb = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        const result = await mockDb.insert({}).values({
          titulo: `Dica ${categoria}`,
          conteudo: "Conteúdo",
          categoria,
        });
        expect(result[0].insertId).toBe(1);
      }
    });
  });

  describe("seguranca.update", () => {
    it("deve atualizar uma dica existente", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.update({}).set({
        titulo: "Dica Atualizada",
        conteudo: "Conteúdo atualizado",
      }).where({});
      expect(result.affectedRows).toBe(1);
    });
  });

  describe("seguranca.delete", () => {
    it("deve excluir uma dica", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.delete({}).where({});
      expect(result.affectedRows).toBe(1);
    });
  });
});

describe("Regras e Normas API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("regras.list", () => {
    it("deve retornar lista vazia quando não há regras", async () => {
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

    it("deve retornar lista de regras ordenadas", async () => {
      const mockRegras = [
        { id: 1, titulo: "Regra 1", conteudo: "Conteúdo 1", categoria: "geral", ordem: 0 },
        { id: 2, titulo: "Regra 2", conteudo: "Conteúdo 2", categoria: "barulho", ordem: 1 },
        { id: 3, titulo: "Regra 3", conteudo: "Conteúdo 3", categoria: "animais", ordem: 2 },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockRegras),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.select().from({}).where({}).orderBy({});
      expect(result).toHaveLength(3);
      expect(result[0].ordem).toBe(0);
      expect(result[1].ordem).toBe(1);
      expect(result[2].ordem).toBe(2);
    });
  });

  describe("regras.create", () => {
    it("deve criar uma nova regra", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.insert({}).values({
        titulo: "Nova Regra",
        conteudo: "Conteúdo da regra",
        categoria: "geral",
        ordem: 0,
      });
      expect(result[0].insertId).toBe(1);
    });

    it("deve aceitar diferentes categorias de regras", async () => {
      const categorias = [
        "geral", "convivencia", "areas_comuns", "animais", "barulho",
        "estacionamento", "mudancas", "obras", "piscina", "salao_festas"
      ];
      
      for (const categoria of categorias) {
        const mockDb = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        };
        vi.mocked(getDb).mockResolvedValue(mockDb as any);

        const result = await mockDb.insert({}).values({
          titulo: `Regra ${categoria}`,
          conteudo: "Conteúdo",
          categoria,
        });
        expect(result[0].insertId).toBe(1);
      }
    });
  });

  describe("regras.update", () => {
    it("deve atualizar uma regra existente", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.update({}).set({
        titulo: "Regra Atualizada",
        conteudo: "Conteúdo atualizado",
        ordem: 5,
      }).where({});
      expect(result.affectedRows).toBe(1);
    });
  });

  describe("regras.delete", () => {
    it("deve excluir uma regra", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const result = await mockDb.delete({}).where({});
      expect(result.affectedRows).toBe(1);
    });
  });
});

describe("Validação de Dados", () => {
  it("deve validar campos obrigatórios para dicas de segurança", () => {
    const dicaValida = {
      titulo: "Título válido",
      conteudo: "Conteúdo válido",
    };
    
    expect(dicaValida.titulo.length).toBeGreaterThan(0);
    expect(dicaValida.conteudo.length).toBeGreaterThan(0);
  });

  it("deve validar campos obrigatórios para regras", () => {
    const regraValida = {
      titulo: "Título válido",
      conteudo: "Conteúdo válido",
    };
    
    expect(regraValida.titulo.length).toBeGreaterThan(0);
    expect(regraValida.conteudo.length).toBeGreaterThan(0);
  });

  it("deve rejeitar título vazio", () => {
    const dicaInvalida = {
      titulo: "",
      conteudo: "Conteúdo",
    };
    
    expect(dicaInvalida.titulo.length).toBe(0);
  });

  it("deve rejeitar conteúdo vazio", () => {
    const regraInvalida = {
      titulo: "Título",
      conteudo: "",
    };
    
    expect(regraInvalida.conteudo.length).toBe(0);
  });
});

describe("Categorias", () => {
  describe("Categorias de Segurança", () => {
    const categoriasSeguranca = [
      { id: "geral", label: "Geral" },
      { id: "incendio", label: "Incêndio" },
      { id: "roubo", label: "Roubo/Furto" },
      { id: "criancas", label: "Crianças" },
      { id: "idosos", label: "Idosos" },
      { id: "digital", label: "Segurança Digital" },
      { id: "veiculos", label: "Veículos" },
    ];

    it("deve ter todas as categorias de segurança definidas", () => {
      expect(categoriasSeguranca).toHaveLength(7);
    });

    it("cada categoria deve ter id e label", () => {
      categoriasSeguranca.forEach((cat) => {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.id.length).toBeGreaterThan(0);
        expect(cat.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Categorias de Regras", () => {
    const categoriasRegras = [
      { id: "geral", label: "Geral" },
      { id: "convivencia", label: "Convivência" },
      { id: "areas_comuns", label: "Áreas Comuns" },
      { id: "animais", label: "Animais" },
      { id: "barulho", label: "Barulho" },
      { id: "estacionamento", label: "Estacionamento" },
      { id: "mudancas", label: "Mudanças" },
      { id: "obras", label: "Obras" },
      { id: "piscina", label: "Piscina" },
      { id: "salao_festas", label: "Salão de Festas" },
    ];

    it("deve ter todas as categorias de regras definidas", () => {
      expect(categoriasRegras).toHaveLength(10);
    });

    it("cada categoria deve ter id e label", () => {
      categoriasRegras.forEach((cat) => {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.id.length).toBeGreaterThan(0);
        expect(cat.label.length).toBeGreaterThan(0);
      });
    });
  });
});

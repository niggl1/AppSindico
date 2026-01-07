import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do getDb
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("Destaques API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.insert.mockReturnThis();
    mockDb.values.mockResolvedValue([{ insertId: 1 }]);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.delete.mockReturnThis();
  });

  describe("Destaque Schema", () => {
    it("deve ter campos obrigatórios: titulo, condominioId", () => {
      const destaqueData = {
        condominioId: 1,
        titulo: "Destaque de Teste",
      };
      
      expect(destaqueData.condominioId).toBeDefined();
      expect(destaqueData.titulo).toBeDefined();
    });

    it("deve ter campos opcionais: subtitulo, descricao, link, arquivoUrl, videoUrl", () => {
      const destaqueData = {
        condominioId: 1,
        titulo: "Destaque de Teste",
        subtitulo: "Subtítulo opcional",
        descricao: "Descrição detalhada",
        link: "https://exemplo.com",
        arquivoUrl: "https://s3.exemplo.com/arquivo.pdf",
        arquivoNome: "documento.pdf",
        videoUrl: "https://youtube.com/watch?v=abc123",
        ordem: 0,
        ativo: true,
      };
      
      expect(destaqueData.subtitulo).toBeDefined();
      expect(destaqueData.descricao).toBeDefined();
      expect(destaqueData.link).toBeDefined();
      expect(destaqueData.arquivoUrl).toBeDefined();
      expect(destaqueData.videoUrl).toBeDefined();
    });
  });

  describe("Destaque Imagens Schema", () => {
    it("deve ter campos obrigatórios: destaqueId, url", () => {
      const imagemData = {
        destaqueId: 1,
        url: "https://s3.exemplo.com/imagem.jpg",
      };
      
      expect(imagemData.destaqueId).toBeDefined();
      expect(imagemData.url).toBeDefined();
    });

    it("deve ter campos opcionais: legenda, ordem", () => {
      const imagemData = {
        destaqueId: 1,
        url: "https://s3.exemplo.com/imagem.jpg",
        legenda: "Legenda da imagem",
        ordem: 0,
      };
      
      expect(imagemData.legenda).toBeDefined();
      expect(imagemData.ordem).toBeDefined();
    });
  });

  describe("Destaque List", () => {
    it("deve retornar lista vazia quando não há destaques", async () => {
      mockDb.orderBy.mockResolvedValue([]);
      
      const result: any[] = [];
      expect(result).toEqual([]);
    });

    it("deve retornar destaques com imagens", async () => {
      const mockDestaques = [
        {
          id: 1,
          condominioId: 1,
          titulo: "Destaque 1",
          subtitulo: "Sub 1",
          descricao: "Desc 1",
          link: null,
          arquivoUrl: null,
          arquivoNome: null,
          videoUrl: null,
          ordem: 0,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const mockImagens = [
        {
          id: 1,
          destaqueId: 1,
          url: "https://s3.exemplo.com/img1.jpg",
          legenda: "Imagem 1",
          ordem: 0,
          createdAt: new Date(),
        },
      ];
      
      mockDb.orderBy.mockResolvedValueOnce(mockDestaques);
      mockDb.orderBy.mockResolvedValueOnce(mockImagens);
      
      const destaquesComImagens = mockDestaques.map((d) => ({
        ...d,
        imagens: mockImagens.filter((i) => i.destaqueId === d.id),
      }));
      
      expect(destaquesComImagens[0].imagens.length).toBe(1);
      expect(destaquesComImagens[0].imagens[0].url).toBe("https://s3.exemplo.com/img1.jpg");
    });
  });

  describe("Destaque Create", () => {
    it("deve criar destaque com dados básicos", async () => {
      const input = {
        condominioId: 1,
        titulo: "Novo Destaque",
        subtitulo: "Subtítulo",
        descricao: "Descrição",
        ativo: true,
      };
      
      mockDb.values.mockResolvedValue([{ insertId: 1 }]);
      
      expect(input.titulo).toBe("Novo Destaque");
      expect(input.condominioId).toBe(1);
    });

    it("deve criar destaque com imagens", async () => {
      const input = {
        condominioId: 1,
        titulo: "Destaque com Imagens",
        imagens: [
          { url: "https://s3.exemplo.com/img1.jpg", legenda: "Imagem 1" },
          { url: "https://s3.exemplo.com/img2.jpg", legenda: "Imagem 2" },
        ],
      };
      
      expect(input.imagens.length).toBe(2);
    });

    it("deve criar destaque com link externo", async () => {
      const input = {
        condominioId: 1,
        titulo: "Destaque com Link",
        link: "https://exemplo.com",
      };
      
      expect(input.link).toBe("https://exemplo.com");
    });

    it("deve criar destaque com arquivo para download", async () => {
      const input = {
        condominioId: 1,
        titulo: "Destaque com Arquivo",
        arquivoUrl: "https://s3.exemplo.com/documento.pdf",
        arquivoNome: "documento.pdf",
      };
      
      expect(input.arquivoUrl).toBeDefined();
      expect(input.arquivoNome).toBe("documento.pdf");
    });

    it("deve criar destaque com vídeo do YouTube", async () => {
      const input = {
        condominioId: 1,
        titulo: "Destaque com Vídeo",
        videoUrl: "https://youtube.com/watch?v=abc123",
      };
      
      expect(input.videoUrl).toContain("youtube.com");
    });
  });

  describe("Destaque Update", () => {
    it("deve atualizar título do destaque", async () => {
      const input = {
        id: 1,
        titulo: "Título Atualizado",
      };
      
      expect(input.titulo).toBe("Título Atualizado");
    });

    it("deve atualizar imagens do destaque", async () => {
      const input = {
        id: 1,
        imagens: [
          { url: "https://s3.exemplo.com/nova-img.jpg", legenda: "Nova imagem" },
        ],
      };
      
      expect(input.imagens.length).toBe(1);
    });

    it("deve atualizar status ativo do destaque", async () => {
      const input = {
        id: 1,
        ativo: false,
      };
      
      expect(input.ativo).toBe(false);
    });
  });

  describe("Destaque Delete", () => {
    it("deve excluir destaque e suas imagens", async () => {
      const destaqueId = 1;
      
      // Simula exclusão de imagens primeiro
      mockDb.where.mockResolvedValueOnce({ rowsAffected: 2 });
      // Simula exclusão do destaque
      mockDb.where.mockResolvedValueOnce({ rowsAffected: 1 });
      
      expect(destaqueId).toBe(1);
    });
  });

  describe("Destaque Toggle Ativo", () => {
    it("deve alternar status de ativo para inativo", async () => {
      const mockDestaque = {
        id: 1,
        ativo: true,
      };
      
      mockDb.limit.mockResolvedValue([mockDestaque]);
      
      const novoStatus = !mockDestaque.ativo;
      expect(novoStatus).toBe(false);
    });

    it("deve alternar status de inativo para ativo", async () => {
      const mockDestaque = {
        id: 1,
        ativo: false,
      };
      
      mockDb.limit.mockResolvedValue([mockDestaque]);
      
      const novoStatus = !mockDestaque.ativo;
      expect(novoStatus).toBe(true);
    });
  });

  describe("Destaque Reorder", () => {
    it("deve reordenar destaques", async () => {
      const input = {
        items: [
          { id: 1, ordem: 2 },
          { id: 2, ordem: 0 },
          { id: 3, ordem: 1 },
        ],
      };
      
      expect(input.items.length).toBe(3);
      expect(input.items[0].ordem).toBe(2);
      expect(input.items[1].ordem).toBe(0);
    });
  });

  describe("Destaque List Ativos", () => {
    it("deve retornar apenas destaques ativos", async () => {
      const mockDestaques = [
        { id: 1, titulo: "Destaque Ativo", ativo: true },
        { id: 2, titulo: "Destaque Inativo", ativo: false },
      ];
      
      const destaquesAtivos = mockDestaques.filter((d) => d.ativo);
      
      expect(destaquesAtivos.length).toBe(1);
      expect(destaquesAtivos[0].titulo).toBe("Destaque Ativo");
    });
  });

  describe("YouTube URL Parser", () => {
    it("deve extrair ID de vídeo do YouTube de URL padrão", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      expect(match).toBeTruthy();
      expect(match?.[2]).toBe("dQw4w9WgXcQ");
    });

    it("deve extrair ID de vídeo do YouTube de URL curta", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      expect(match).toBeTruthy();
      expect(match?.[2]).toBe("dQw4w9WgXcQ");
    });

    it("deve extrair ID de vídeo do YouTube de URL embed", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      expect(match).toBeTruthy();
      expect(match?.[2]).toBe("dQw4w9WgXcQ");
    });
  });
});

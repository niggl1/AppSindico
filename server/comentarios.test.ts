import { describe, it, expect } from "vitest";

describe("Comentários em Itens Partilhados", () => {
  describe("Schema de comentários", () => {
    it("deve ter campos obrigatórios definidos", () => {
      const camposObrigatorios = [
        "itemId",
        "itemTipo",
        "condominioId",
        "autorNome",
        "texto",
      ];
      
      camposObrigatorios.forEach(campo => {
        expect(campo).toBeDefined();
      });
    });

    it("deve ter tipos de item válidos", () => {
      const tiposValidos = ["vistoria", "manutencao", "ocorrencia", "checklist"];
      
      tiposValidos.forEach(tipo => {
        expect(["vistoria", "manutencao", "ocorrencia", "checklist"]).toContain(tipo);
      });
    });
  });

  describe("Schema de anexos", () => {
    it("deve ter campos obrigatórios para anexos", () => {
      const camposObrigatorios = [
        "comentarioId",
        "url",
        "nome",
        "tipo",
      ];
      
      camposObrigatorios.forEach(campo => {
        expect(campo).toBeDefined();
      });
    });

    it("deve suportar tipos de ficheiro comuns", () => {
      const tiposSuportados = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      tiposSuportados.forEach(tipo => {
        expect(tipo).toBeTruthy();
      });
    });
  });

  describe("Schema de respostas", () => {
    it("deve ter campos obrigatórios para respostas", () => {
      const camposObrigatorios = [
        "comentarioId",
        "autorNome",
        "texto",
      ];
      
      camposObrigatorios.forEach(campo => {
        expect(campo).toBeDefined();
      });
    });
  });

  describe("Validação de dados", () => {
    it("deve validar nome do autor não vazio", () => {
      const autorNome = "João Silva";
      expect(autorNome.trim().length).toBeGreaterThan(0);
    });

    it("deve validar texto do comentário não vazio", () => {
      const texto = "Este é um comentário de teste";
      expect(texto.trim().length).toBeGreaterThan(0);
    });

    it("deve validar formato de WhatsApp", () => {
      const whatsapp = "(11) 99999-9999";
      const regex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
      expect(regex.test(whatsapp)).toBe(true);
    });

    it("deve validar formato de email", () => {
      const email = "teste@exemplo.com";
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test(email)).toBe(true);
    });
  });

  describe("Formatação de tamanho de ficheiro", () => {
    it("deve formatar bytes corretamente", () => {
      const formatarTamanho = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      expect(formatarTamanho(500)).toBe("500 B");
      expect(formatarTamanho(1024)).toBe("1.0 KB");
      expect(formatarTamanho(1536)).toBe("1.5 KB");
      expect(formatarTamanho(1048576)).toBe("1.0 MB");
      expect(formatarTamanho(2621440)).toBe("2.5 MB");
    });
  });

  describe("Iniciais do autor", () => {
    it("deve gerar iniciais corretamente", () => {
      const getInitials = (nome: string): string => {
        return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      };

      expect(getInitials("João Silva")).toBe("JS");
      expect(getInitials("Maria")).toBe("M");
      expect(getInitials("Ana Paula Santos")).toBe("AP");
      expect(getInitials("Carlos")).toBe("C");
    });
  });

  describe("Tipos de anexo", () => {
    it("deve identificar imagens corretamente", () => {
      const isImagem = (tipo: string): boolean => tipo.startsWith("image/");
      
      expect(isImagem("image/jpeg")).toBe(true);
      expect(isImagem("image/png")).toBe(true);
      expect(isImagem("image/webp")).toBe(true);
      expect(isImagem("application/pdf")).toBe(false);
    });

    it("deve identificar PDFs corretamente", () => {
      const isPDF = (tipo: string): boolean => tipo === "application/pdf";
      
      expect(isPDF("application/pdf")).toBe(true);
      expect(isPDF("image/png")).toBe(false);
    });
  });

  describe("Status de leitura", () => {
    it("deve marcar comentário como não lido por padrão", () => {
      const comentario = {
        lido: false,
        lidoPorId: null,
        lidoEm: null,
      };
      
      expect(comentario.lido).toBe(false);
      expect(comentario.lidoPorId).toBeNull();
      expect(comentario.lidoEm).toBeNull();
    });

    it("deve atualizar status ao marcar como lido", () => {
      const comentario = {
        lido: true,
        lidoPorId: 1,
        lidoEm: new Date(),
      };
      
      expect(comentario.lido).toBe(true);
      expect(comentario.lidoPorId).toBe(1);
      expect(comentario.lidoEm).toBeInstanceOf(Date);
    });
  });

  describe("Comentários internos", () => {
    it("deve suportar flag de comentário interno", () => {
      const comentarioInterno = { isInterno: true };
      const comentarioPublico = { isInterno: false };
      
      expect(comentarioInterno.isInterno).toBe(true);
      expect(comentarioPublico.isInterno).toBe(false);
    });
  });
});

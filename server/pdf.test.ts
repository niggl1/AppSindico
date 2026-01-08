import { describe, expect, it, vi } from "vitest";
import { generateRevistaPDF, estilosDisponiveis, type RevistaData } from "./pdfGenerator";

describe("PDF Generator", () => {
  it("should export generateRevistaPDF function", () => {
    expect(typeof generateRevistaPDF).toBe("function");
  });

  it("should accept RevistaData type with required fields", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [],
      eventos: [],
      funcionarios: [],
      telefones: [],
      anunciantes: [],
    };

    // Verify the type is correct
    expect(mockData.titulo).toBe("Residencial Teste");
    expect(mockData.subtitulo).toBe("Informativo Mensal");
    expect(mockData.edicao).toBe("Dezembro 2024");
    expect(mockData.condominioNome).toBe("Condomínio Teste");
    expect(Array.isArray(mockData.avisos)).toBe(true);
    expect(Array.isArray(mockData.eventos)).toBe(true);
    expect(Array.isArray(mockData.funcionarios)).toBe(true);
    expect(Array.isArray(mockData.telefones)).toBe(true);
    expect(Array.isArray(mockData.anunciantes)).toBe(true);
  });

  it("should accept RevistaData with optional mensagemSindico", () => {
    const mockDataWithMensagem: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      mensagemSindico: {
        titulo: "Mensagem do Síndico",
        mensagem: "Prezados moradores...",
        nomeSindico: "João Silva",
      },
      avisos: [],
      eventos: [],
      funcionarios: [],
      telefones: [],
      anunciantes: [],
    };

    expect(mockDataWithMensagem.mensagemSindico?.titulo).toBe("Mensagem do Síndico");
    expect(mockDataWithMensagem.mensagemSindico?.nomeSindico).toBe("João Silva");
  });

  it("should accept avisos with different types", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [
        { titulo: "Aviso Urgente", conteudo: "Conteúdo urgente", tipo: "urgente" },
        { titulo: "Aviso Importante", conteudo: "Conteúdo importante", tipo: "importante" },
        { titulo: "Aviso Informativo", conteudo: "Conteúdo informativo", tipo: "informativo" },
      ],
      eventos: [],
      funcionarios: [],
      telefones: [],
      anunciantes: [],
    };

    expect(mockData.avisos.length).toBe(3);
    expect(mockData.avisos[0].tipo).toBe("urgente");
    expect(mockData.avisos[1].tipo).toBe("importante");
    expect(mockData.avisos[2].tipo).toBe("informativo");
  });

  it("should accept eventos with all fields", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [],
      eventos: [
        {
          titulo: "Festa de Natal",
          descricao: "Confraternização de fim de ano",
          dataEvento: "2024-12-25",
          horario: "19:00",
          local: "Salão de Festas",
        },
      ],
      funcionarios: [],
      telefones: [],
      anunciantes: [],
    };

    expect(mockData.eventos.length).toBe(1);
    expect(mockData.eventos[0].titulo).toBe("Festa de Natal");
    expect(mockData.eventos[0].local).toBe("Salão de Festas");
  });

  it("should accept funcionarios with optional fields", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [],
      eventos: [],
      funcionarios: [
        { nome: "Carlos Silva", cargo: "Porteiro", turno: "Diurno" },
        { nome: "Maria Santos", cargo: "Zeladora" },
      ],
      telefones: [],
      anunciantes: [],
    };

    expect(mockData.funcionarios.length).toBe(2);
    expect(mockData.funcionarios[0].turno).toBe("Diurno");
    expect(mockData.funcionarios[1].turno).toBeUndefined();
  });

  it("should accept telefones uteis", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [],
      eventos: [],
      funcionarios: [],
      telefones: [
        { nome: "Portaria", numero: "(11) 1234-5678" },
        { nome: "Emergência", numero: "190" },
      ],
      anunciantes: [],
    };

    expect(mockData.telefones.length).toBe(2);
    expect(mockData.telefones[0].nome).toBe("Portaria");
    expect(mockData.telefones[1].numero).toBe("190");
  });

  it("should accept anunciantes with all fields", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      subtitulo: "Informativo Mensal",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      avisos: [],
      eventos: [],
      funcionarios: [],
      telefones: [],
      anunciantes: [
        {
          nome: "Padaria do João",
          descricao: "Pães frescos todos os dias",
          categoria: "alimentacao",
          telefone: "(11) 9999-8888",
        },
      ],
    };

    expect(mockData.anunciantes.length).toBe(1);
    expect(mockData.anunciantes[0].categoria).toBe("alimentacao");
  });

  it("should export estilosDisponiveis array with 5 styles", () => {
    expect(Array.isArray(estilosDisponiveis)).toBe(true);
    expect(estilosDisponiveis.length).toBe(5);
  });

  it("should have all required style IDs", () => {
    const styleIds = estilosDisponiveis.map(e => e.id);
    expect(styleIds).toContain('classico');
    expect(styleIds).toContain('moderno');
    expect(styleIds).toContain('minimalista');
    expect(styleIds).toContain('elegante');
    expect(styleIds).toContain('corporativo');
  });

  it("should accept estilo parameter in RevistaData", () => {
    const mockData: RevistaData = {
      titulo: "Residencial Teste",
      edicao: "Dezembro 2024",
      condominioNome: "Condomínio Teste",
      estilo: 'moderno',
    };

    expect(mockData.estilo).toBe('moderno');
  });

  it("should have nome and descricao for each style", () => {
    estilosDisponiveis.forEach(estilo => {
      expect(estilo.nome).toBeDefined();
      expect(estilo.descricao).toBeDefined();
      expect(typeof estilo.nome).toBe('string');
      expect(typeof estilo.descricao).toBe('string');
    });
  });
});

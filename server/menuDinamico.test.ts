import { describe, it, expect } from "vitest";
import { FUNCOES_DISPONIVEIS, CATEGORIAS_FUNCOES } from "../drizzle/schema";

/**
 * Testes para o sistema de Menu Dinâmico
 * Verifica a estrutura de funções e categorias disponíveis
 */
describe("Menu Dinâmico - Estrutura de Funções", () => {
  
  it("deve ter todas as funções com IDs únicos", () => {
    const ids = FUNCOES_DISPONIVEIS.map(f => f.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("deve ter todas as funções com categoria válida", () => {
    const categoriasValidas = CATEGORIAS_FUNCOES.map(c => c.id);
    
    for (const funcao of FUNCOES_DISPONIVEIS) {
      expect(categoriasValidas).toContain(funcao.categoria);
    }
  });

  it("deve ter pelo menos 30 funções disponíveis", () => {
    expect(FUNCOES_DISPONIVEIS.length).toBeGreaterThanOrEqual(30);
  });

  it("deve ter todas as funções com campos obrigatórios", () => {
    for (const funcao of FUNCOES_DISPONIVEIS) {
      expect(funcao.id).toBeDefined();
      expect(funcao.nome).toBeDefined();
      expect(funcao.descricao).toBeDefined();
      expect(funcao.categoria).toBeDefined();
      expect(funcao.icone).toBeDefined();
      expect(funcao.rota).toBeDefined();
    }
  });

  it("deve ter funções de comunicação", () => {
    const comunicacao = FUNCOES_DISPONIVEIS.filter(f => f.categoria === "comunicacao");
    expect(comunicacao.length).toBeGreaterThan(0);
    
    const ids = comunicacao.map(f => f.id);
    expect(ids).toContain("avisos");
    expect(ids).toContain("comunicados");
  });

  it("deve ter funções operacionais", () => {
    const operacional = FUNCOES_DISPONIVEIS.filter(f => f.categoria === "operacional");
    expect(operacional.length).toBeGreaterThan(0);
    
    const ids = operacional.map(f => f.id);
    expect(ids).toContain("vistorias");
    expect(ids).toContain("manutencoes");
    expect(ids).toContain("ocorrencias");
    expect(ids).toContain("checklists");
  });

  it("deve ter funções interativas", () => {
    const interativo = FUNCOES_DISPONIVEIS.filter(f => f.categoria === "interativo");
    expect(interativo.length).toBeGreaterThan(0);
    
    const ids = interativo.map(f => f.id);
    expect(ids).toContain("votacoes");
    expect(ids).toContain("classificados");
    expect(ids).toContain("achados-perdidos");
  });
});

describe("Menu Dinâmico - Categorias", () => {
  
  it("deve ter todas as categorias com IDs únicos", () => {
    const ids = CATEGORIAS_FUNCOES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("deve ter pelo menos 8 categorias", () => {
    expect(CATEGORIAS_FUNCOES.length).toBeGreaterThanOrEqual(8);
  });

  it("deve ter categorias com campos obrigatórios", () => {
    for (const categoria of CATEGORIAS_FUNCOES) {
      expect(categoria.id).toBeDefined();
      expect(categoria.nome).toBeDefined();
      expect(categoria.icone).toBeDefined();
    }
  });

  it("deve ter categorias principais", () => {
    const ids = CATEGORIAS_FUNCOES.map(c => c.id);
    expect(ids).toContain("comunicacao");
    expect(ids).toContain("operacional");
    expect(ids).toContain("interativo");
    expect(ids).toContain("documentacao");
  });
});

describe("Menu Dinâmico - Consistência de Rotas", () => {
  
  it("todas as rotas devem começar com /dashboard ou /modulo", () => {
    for (const funcao of FUNCOES_DISPONIVEIS) {
      // Aceita /dashboard, /dashboard/*, /modulo/*
      expect(funcao.rota).toMatch(/^\/(dashboard|modulo)(\/|$)/);
    }
  });

  it("não deve haver rotas duplicadas", () => {
    const rotas = FUNCOES_DISPONIVEIS.map(f => f.rota);
    const uniqueRotas = new Set(rotas);
    expect(rotas.length).toBe(uniqueRotas.size);
  });
});

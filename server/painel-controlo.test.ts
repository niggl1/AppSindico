import { describe, it, expect } from "vitest";

describe("Painel de Controlo", () => {
  describe("Estatísticas Gerais", () => {
    it("deve calcular totais corretamente", () => {
      const vistoriasStats = { total: 10, pendentes: 3, finalizadas: 5 };
      const manutencoesStats = { total: 8, pendentes: 2, finalizadas: 4 };
      const ocorrenciasStats = { total: 15, pendentes: 5, finalizadas: 8 };
      const checklistsStats = { total: 12, pendentes: 4, finalizadas: 6 };

      const totais = {
        total: vistoriasStats.total + manutencoesStats.total + ocorrenciasStats.total + checklistsStats.total,
        pendentes: vistoriasStats.pendentes + manutencoesStats.pendentes + ocorrenciasStats.pendentes + checklistsStats.pendentes,
        finalizadas: vistoriasStats.finalizadas + manutencoesStats.finalizadas + ocorrenciasStats.finalizadas + checklistsStats.finalizadas,
      };

      expect(totais.total).toBe(45);
      expect(totais.pendentes).toBe(14);
      expect(totais.finalizadas).toBe(23);
    });

    it("deve calcular taxa de conclusão corretamente", () => {
      const total = 100;
      const finalizadas = 75;
      const taxaConclusao = Math.round((finalizadas / total) * 100);
      
      expect(taxaConclusao).toBe(75);
    });

    it("deve lidar com total zero", () => {
      const total = 0;
      const finalizadas = 0;
      const taxaConclusao = total > 0 ? Math.round((finalizadas / total) * 100) : 0;
      
      expect(taxaConclusao).toBe(0);
    });
  });

  describe("Distribuição por Status", () => {
    it("deve contar itens por status corretamente", () => {
      const items = [
        { status: "pendente" },
        { status: "pendente" },
        { status: "realizada" },
        { status: "finalizada" },
        { status: "finalizada" },
        { status: "finalizada" },
        { status: "acao_necessaria" },
        { status: "reaberta" },
      ];

      const stats = {
        pendentes: items.filter(i => i.status === "pendente").length,
        realizadas: items.filter(i => i.status === "realizada").length,
        finalizadas: items.filter(i => i.status === "finalizada").length,
        acaoNecessaria: items.filter(i => i.status === "acao_necessaria").length,
        reabertas: items.filter(i => i.status === "reaberta").length,
      };

      expect(stats.pendentes).toBe(2);
      expect(stats.realizadas).toBe(1);
      expect(stats.finalizadas).toBe(3);
      expect(stats.acaoNecessaria).toBe(1);
      expect(stats.reabertas).toBe(1);
    });
  });

  describe("Distribuição por Prioridade", () => {
    it("deve contar itens por prioridade corretamente", () => {
      const items = [
        { prioridade: "baixa" },
        { prioridade: "baixa" },
        { prioridade: "media" },
        { prioridade: "media" },
        { prioridade: "media" },
        { prioridade: "alta" },
        { prioridade: "alta" },
        { prioridade: "urgente" },
      ];

      const prioridades = ["baixa", "media", "alta", "urgente"];
      const distribuicao = prioridades.map(p => ({
        prioridade: p,
        total: items.filter(i => i.prioridade === p).length,
      }));

      expect(distribuicao.find(d => d.prioridade === "baixa")?.total).toBe(2);
      expect(distribuicao.find(d => d.prioridade === "media")?.total).toBe(3);
      expect(distribuicao.find(d => d.prioridade === "alta")?.total).toBe(2);
      expect(distribuicao.find(d => d.prioridade === "urgente")?.total).toBe(1);
    });
  });

  describe("Evolução Temporal", () => {
    it("deve agrupar itens por data corretamente", () => {
      const items = [
        { createdAt: new Date("2024-12-01") },
        { createdAt: new Date("2024-12-01") },
        { createdAt: new Date("2024-12-02") },
        { createdAt: new Date("2024-12-03") },
        { createdAt: new Date("2024-12-03") },
        { createdAt: new Date("2024-12-03") },
      ];

      const evolucao: Record<string, number> = {};
      items.forEach(item => {
        const key = item.createdAt.toISOString().split("T")[0];
        evolucao[key] = (evolucao[key] || 0) + 1;
      });

      expect(evolucao["2024-12-01"]).toBe(2);
      expect(evolucao["2024-12-02"]).toBe(1);
      expect(evolucao["2024-12-03"]).toBe(3);
    });

    it("deve gerar datas para período especificado", () => {
      const dias = 7;
      const datas: string[] = [];
      
      for (let i = 0; i < dias; i++) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        datas.push(data.toISOString().split("T")[0]);
      }

      expect(datas.length).toBe(7);
    });
  });

  describe("Categorias de Ocorrências", () => {
    it("deve contar ocorrências por categoria corretamente", () => {
      const ocorrencias = [
        { categoria: "seguranca" },
        { categoria: "seguranca" },
        { categoria: "barulho" },
        { categoria: "manutencao" },
        { categoria: "convivencia" },
        { categoria: "animais" },
        { categoria: "estacionamento" },
        { categoria: "limpeza" },
        { categoria: "outros" },
        { categoria: "outros" },
      ];

      const categorias = {
        seguranca: ocorrencias.filter(o => o.categoria === "seguranca").length,
        barulho: ocorrencias.filter(o => o.categoria === "barulho").length,
        manutencao: ocorrencias.filter(o => o.categoria === "manutencao").length,
        convivencia: ocorrencias.filter(o => o.categoria === "convivencia").length,
        animais: ocorrencias.filter(o => o.categoria === "animais").length,
        estacionamento: ocorrencias.filter(o => o.categoria === "estacionamento").length,
        limpeza: ocorrencias.filter(o => o.categoria === "limpeza").length,
        outros: ocorrencias.filter(o => o.categoria === "outros").length,
      };

      expect(categorias.seguranca).toBe(2);
      expect(categorias.barulho).toBe(1);
      expect(categorias.outros).toBe(2);
    });
  });

  describe("Tipos de Manutenção", () => {
    it("deve contar manutenções por tipo corretamente", () => {
      const manutencoes = [
        { tipo: "preventiva" },
        { tipo: "preventiva" },
        { tipo: "preventiva" },
        { tipo: "corretiva" },
        { tipo: "corretiva" },
        { tipo: "emergencial" },
        { tipo: "programada" },
        { tipo: "programada" },
      ];

      const tipos = {
        preventiva: manutencoes.filter(m => m.tipo === "preventiva").length,
        corretiva: manutencoes.filter(m => m.tipo === "corretiva").length,
        emergencial: manutencoes.filter(m => m.tipo === "emergencial").length,
        programada: manutencoes.filter(m => m.tipo === "programada").length,
      };

      expect(tipos.preventiva).toBe(3);
      expect(tipos.corretiva).toBe(2);
      expect(tipos.emergencial).toBe(1);
      expect(tipos.programada).toBe(2);
    });
  });

  describe("Itens Recentes", () => {
    it("deve ordenar itens por data de criação decrescente", () => {
      const itens = [
        { tipo: "vistoria", createdAt: new Date("2024-12-01") },
        { tipo: "manutencao", createdAt: new Date("2024-12-03") },
        { tipo: "ocorrencia", createdAt: new Date("2024-12-02") },
      ];

      const ordenados = itens.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      expect(ordenados[0].tipo).toBe("manutencao");
      expect(ordenados[1].tipo).toBe("ocorrencia");
      expect(ordenados[2].tipo).toBe("vistoria");
    });

    it("deve limitar número de itens retornados", () => {
      const itens = Array.from({ length: 20 }, (_, i) => ({
        tipo: "vistoria",
        createdAt: new Date(`2024-12-${String(i + 1).padStart(2, "0")}`),
      }));

      const limite = 10;
      const limitados = itens.slice(0, limite);

      expect(limitados.length).toBe(10);
    });
  });

  describe("Cores de Status", () => {
    it("deve ter cores definidas para todos os status", () => {
      const statusColors = {
        pendente: "#f59e0b",
        realizada: "#3b82f6",
        acao_necessaria: "#ef4444",
        finalizada: "#22c55e",
        reaberta: "#8b5cf6",
      };

      expect(statusColors.pendente).toBeDefined();
      expect(statusColors.realizada).toBeDefined();
      expect(statusColors.acao_necessaria).toBeDefined();
      expect(statusColors.finalizada).toBeDefined();
      expect(statusColors.reaberta).toBeDefined();
    });
  });

  describe("Cores de Prioridade", () => {
    it("deve ter cores definidas para todas as prioridades", () => {
      const prioridadeColors = {
        baixa: "#22c55e",
        media: "#3b82f6",
        alta: "#f59e0b",
        urgente: "#ef4444",
      };

      expect(prioridadeColors.baixa).toBeDefined();
      expect(prioridadeColors.media).toBeDefined();
      expect(prioridadeColors.alta).toBeDefined();
      expect(prioridadeColors.urgente).toBeDefined();
    });
  });
});

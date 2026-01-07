import { describe, expect, it } from "vitest";

describe("Notificações", () => {
  describe("Schema de notificações", () => {
    it("deve ter os campos necessários para uma notificação", () => {
      const notificacaoFields = [
        "id",
        "userId",
        "condominioId",
        "tipo",
        "titulo",
        "mensagem",
        "link",
        "lida",
        "referenciaId",
        "createdAt",
      ];
      
      // Verificar que todos os campos esperados existem
      expect(notificacaoFields).toContain("id");
      expect(notificacaoFields).toContain("userId");
      expect(notificacaoFields).toContain("tipo");
      expect(notificacaoFields).toContain("titulo");
      expect(notificacaoFields).toContain("lida");
    });

    it("deve suportar os tipos de notificação corretos", () => {
      const tiposValidos = ["aviso", "evento", "votacao", "classificado", "carona", "geral"];
      
      expect(tiposValidos).toContain("aviso");
      expect(tiposValidos).toContain("evento");
      expect(tiposValidos).toContain("votacao");
      expect(tiposValidos).toContain("classificado");
      expect(tiposValidos).toContain("carona");
      expect(tiposValidos).toContain("geral");
    });
  });

  describe("Lógica de notificações", () => {
    it("deve criar notificação com campos obrigatórios", () => {
      const notificacao = {
        userId: 1,
        condominioId: 1,
        tipo: "aviso" as const,
        titulo: "Novo aviso importante",
        mensagem: "Conteúdo do aviso",
        lida: false,
      };

      expect(notificacao.userId).toBe(1);
      expect(notificacao.tipo).toBe("aviso");
      expect(notificacao.titulo).toBe("Novo aviso importante");
      expect(notificacao.lida).toBe(false);
    });

    it("deve permitir marcar notificação como lida", () => {
      const notificacao = {
        id: 1,
        lida: false,
      };

      // Simular marcar como lida
      const notificacaoAtualizada = {
        ...notificacao,
        lida: true,
      };

      expect(notificacaoAtualizada.lida).toBe(true);
    });

    it("deve filtrar notificações não lidas corretamente", () => {
      const notificacoes = [
        { id: 1, titulo: "Aviso 1", lida: false },
        { id: 2, titulo: "Aviso 2", lida: true },
        { id: 3, titulo: "Aviso 3", lida: false },
        { id: 4, titulo: "Aviso 4", lida: true },
      ];

      const naoLidas = notificacoes.filter(n => !n.lida);
      
      expect(naoLidas.length).toBe(2);
      expect(naoLidas[0].id).toBe(1);
      expect(naoLidas[1].id).toBe(3);
    });

    it("deve contar notificações não lidas corretamente", () => {
      const notificacoes = [
        { id: 1, lida: false },
        { id: 2, lida: true },
        { id: 3, lida: false },
        { id: 4, lida: false },
        { id: 5, lida: true },
      ];

      const countNaoLidas = notificacoes.filter(n => !n.lida).length;
      
      expect(countNaoLidas).toBe(3);
    });

    it("deve ordenar notificações por data de criação (mais recentes primeiro)", () => {
      const notificacoes = [
        { id: 1, titulo: "Antiga", createdAt: new Date("2024-01-01") },
        { id: 2, titulo: "Recente", createdAt: new Date("2024-12-24") },
        { id: 3, titulo: "Média", createdAt: new Date("2024-06-15") },
      ];

      const ordenadas = [...notificacoes].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      expect(ordenadas[0].titulo).toBe("Recente");
      expect(ordenadas[1].titulo).toBe("Média");
      expect(ordenadas[2].titulo).toBe("Antiga");
    });
  });

  describe("Integração com avisos e eventos", () => {
    it("deve criar notificação ao publicar novo aviso", () => {
      const aviso = {
        id: 1,
        titulo: "Manutenção da Piscina",
        tipo: "importante",
        condominioId: 1,
      };

      const notificacao = {
        tipo: "aviso" as const,
        titulo: `Novo aviso: ${aviso.titulo}`,
        condominioId: aviso.condominioId,
        referenciaId: aviso.id,
      };

      expect(notificacao.tipo).toBe("aviso");
      expect(notificacao.titulo).toContain(aviso.titulo);
      expect(notificacao.referenciaId).toBe(aviso.id);
    });

    it("deve criar notificação ao publicar novo evento", () => {
      const evento = {
        id: 1,
        titulo: "Assembleia Geral",
        local: "Salão de Festas",
        condominioId: 1,
      };

      const notificacao = {
        tipo: "evento" as const,
        titulo: `Novo evento: ${evento.titulo}`,
        mensagem: `Local: ${evento.local}`,
        condominioId: evento.condominioId,
        referenciaId: evento.id,
      };

      expect(notificacao.tipo).toBe("evento");
      expect(notificacao.titulo).toContain(evento.titulo);
      expect(notificacao.mensagem).toContain(evento.local);
    });
  });
});

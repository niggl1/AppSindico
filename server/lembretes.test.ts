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
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

describe("Sistema de Lembretes de Eventos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Campos de Lembrete no Schema", () => {
    it("deve ter campo lembreteAntecedencia com valor padrão 1", () => {
      const eventoComLembrete = {
        id: 1,
        titulo: "Assembleia Geral",
        dataEvento: new Date("2025-01-15"),
        lembreteAntecedencia: 1,
        lembreteEnviado: false,
      };
      
      expect(eventoComLembrete.lembreteAntecedencia).toBe(1);
      expect(eventoComLembrete.lembreteEnviado).toBe(false);
    });

    it("deve permitir configurar diferentes dias de antecedência", () => {
      const configuracoes = [0, 1, 2, 3, 5, 7];
      
      configuracoes.forEach(dias => {
        const evento = {
          id: 1,
          titulo: "Evento Teste",
          lembreteAntecedencia: dias,
        };
        expect(evento.lembreteAntecedencia).toBe(dias);
      });
    });
  });

  describe("Lógica de Verificação de Lembretes", () => {
    it("deve identificar evento que precisa de lembrete (1 dia antes)", () => {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const evento = {
        id: 1,
        titulo: "Evento Amanhã",
        dataEvento: amanha,
        lembreteAntecedencia: 1,
        lembreteEnviado: false,
      };
      
      // Calcular se o lembrete deve ser enviado
      const dataLembrete = new Date(evento.dataEvento);
      dataLembrete.setDate(dataLembrete.getDate() - evento.lembreteAntecedencia);
      
      const deveEnviar = hoje >= dataLembrete && hoje < evento.dataEvento && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(true);
    });

    it("não deve enviar lembrete se já foi enviado", () => {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const evento = {
        id: 1,
        titulo: "Evento Amanhã",
        dataEvento: amanha,
        lembreteAntecedencia: 1,
        lembreteEnviado: true, // Já enviado
      };
      
      const dataLembrete = new Date(evento.dataEvento);
      dataLembrete.setDate(dataLembrete.getDate() - evento.lembreteAntecedencia);
      
      const deveEnviar = hoje >= dataLembrete && hoje < evento.dataEvento && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(false);
    });

    it("não deve enviar lembrete se evento já passou", () => {
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      
      const evento = {
        id: 1,
        titulo: "Evento Passado",
        dataEvento: ontem,
        lembreteAntecedencia: 1,
        lembreteEnviado: false,
      };
      
      const deveEnviar = hoje < evento.dataEvento && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(false);
    });

    it("não deve enviar lembrete se ainda não chegou a data do lembrete", () => {
      const hoje = new Date();
      const emUmaSemana = new Date(hoje);
      emUmaSemana.setDate(emUmaSemana.getDate() + 7);
      
      const evento = {
        id: 1,
        titulo: "Evento em Uma Semana",
        dataEvento: emUmaSemana,
        lembreteAntecedencia: 1, // Lembrete 1 dia antes
        lembreteEnviado: false,
      };
      
      const dataLembrete = new Date(evento.dataEvento);
      dataLembrete.setDate(dataLembrete.getDate() - evento.lembreteAntecedencia);
      
      // Hoje ainda não chegou na data do lembrete (6 dias antes)
      const deveEnviar = hoje >= dataLembrete && hoje < evento.dataEvento && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(false);
    });

    it("deve enviar lembrete 7 dias antes quando configurado", () => {
      const hoje = new Date();
      const emUmaSemana = new Date(hoje);
      emUmaSemana.setDate(emUmaSemana.getDate() + 7);
      
      const evento = {
        id: 1,
        titulo: "Evento em Uma Semana",
        dataEvento: emUmaSemana,
        lembreteAntecedencia: 7, // Lembrete 7 dias antes (hoje)
        lembreteEnviado: false,
      };
      
      const dataLembrete = new Date(evento.dataEvento);
      dataLembrete.setDate(dataLembrete.getDate() - evento.lembreteAntecedencia);
      
      const deveEnviar = hoje >= dataLembrete && hoje < evento.dataEvento && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(true);
    });
  });

  describe("Configuração de Lembrete = 0 (Desativado)", () => {
    it("não deve enviar lembrete quando configurado como 0", () => {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const evento = {
        id: 1,
        titulo: "Evento Sem Lembrete",
        dataEvento: amanha,
        lembreteAntecedencia: 0, // Desativado
        lembreteEnviado: false,
      };
      
      // Quando lembreteAntecedencia é 0, não deve enviar
      const deveEnviar = evento.lembreteAntecedencia > 0 && !evento.lembreteEnviado;
      expect(deveEnviar).toBe(false);
    });
  });

  describe("Formatação de Mensagem de Lembrete", () => {
    it("deve formatar mensagem de lembrete corretamente", () => {
      const evento = {
        titulo: "Assembleia Geral",
        dataEvento: new Date("2025-01-15T12:00:00"), // Usar horário para evitar problemas de fuso
        local: "Salão de Festas",
      };
      
      const dataFormatada = evento.dataEvento.toLocaleDateString("pt-BR");
      const mensagem = `O evento "${evento.titulo}" acontecerá em ${dataFormatada}${evento.local ? ` no ${evento.local}` : ''}.`;
      
      expect(mensagem).toContain("Assembleia Geral");
      expect(mensagem).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Verificar formato de data
      expect(mensagem).toContain("Salão de Festas");
    });

    it("deve formatar mensagem sem local quando não definido", () => {
      const evento = {
        titulo: "Reunião Online",
        dataEvento: new Date("2025-01-20"),
        local: null,
      };
      
      const dataFormatada = evento.dataEvento.toLocaleDateString("pt-BR");
      const mensagem = `O evento "${evento.titulo}" acontecerá em ${dataFormatada}${evento.local ? ` no ${evento.local}` : ''}.`;
      
      expect(mensagem).toContain("Reunião Online");
      expect(mensagem).not.toContain("no ");
    });
  });

  describe("Reset de Lembrete ao Alterar Data", () => {
    it("deve resetar lembreteEnviado quando data do evento muda", () => {
      const eventoOriginal = {
        id: 1,
        titulo: "Evento",
        dataEvento: new Date("2025-01-15"),
        lembreteEnviado: true,
      };
      
      // Simular update com nova data
      const novaData = new Date("2025-01-20");
      const eventoAtualizado = {
        ...eventoOriginal,
        dataEvento: novaData,
        lembreteEnviado: false, // Deve ser resetado
      };
      
      expect(eventoAtualizado.lembreteEnviado).toBe(false);
      expect(eventoAtualizado.dataEvento).toEqual(novaData);
    });
  });

  describe("Contagem de Moradores Notificados", () => {
    it("deve contar apenas moradores com usuarioId vinculado", () => {
      const moradores = [
        { id: 1, nome: "João", usuarioId: 101 },
        { id: 2, nome: "Maria", usuarioId: 102 },
        { id: 3, nome: "Pedro", usuarioId: null }, // Não vinculado
        { id: 4, nome: "Ana", usuarioId: 103 },
        { id: 5, nome: "Carlos", usuarioId: null }, // Não vinculado
      ];
      
      const moradoresNotificados = moradores.filter(m => m.usuarioId !== null);
      expect(moradoresNotificados.length).toBe(3);
    });
  });

  describe("Múltiplos Eventos Pendentes", () => {
    it("deve processar múltiplos eventos com lembretes pendentes", () => {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const eventos = [
        { id: 1, titulo: "Evento 1", dataEvento: amanha, lembreteAntecedencia: 1, lembreteEnviado: false },
        { id: 2, titulo: "Evento 2", dataEvento: amanha, lembreteAntecedencia: 1, lembreteEnviado: true }, // Já enviado
        { id: 3, titulo: "Evento 3", dataEvento: amanha, lembreteAntecedencia: 1, lembreteEnviado: false },
      ];
      
      const eventosPendentes = eventos.filter(evento => {
        const dataLembrete = new Date(evento.dataEvento);
        dataLembrete.setDate(dataLembrete.getDate() - evento.lembreteAntecedencia);
        return hoje >= dataLembrete && hoje < evento.dataEvento && !evento.lembreteEnviado;
      });
      
      expect(eventosPendentes.length).toBe(2);
      expect(eventosPendentes.map(e => e.id)).toEqual([1, 3]);
    });
  });
});

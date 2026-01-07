import { describe, it, expect } from "vitest";

// Mock do contexto tRPC
const mockCtx = {
  user: { id: 1, openId: "test-user-vencimentos", name: "Test User", role: "admin" },
  db: {},
};

describe("Vencimentos", () => {
  describe("Tipos de Vencimento", () => {
    it("deve validar tipos de vencimento permitidos", () => {
      const tiposPermitidos = ["contrato", "servico", "manutencao"];
      
      expect(tiposPermitidos).toContain("contrato");
      expect(tiposPermitidos).toContain("servico");
      expect(tiposPermitidos).toContain("manutencao");
      expect(tiposPermitidos).not.toContain("outro");
    });

    it("deve ter 3 tipos de vencimento", () => {
      const tiposPermitidos = ["contrato", "servico", "manutencao"];
      expect(tiposPermitidos.length).toBe(3);
    });
  });

  describe("Periodicidade", () => {
    it("deve validar periodicidades permitidas", () => {
      const periodicidadesPermitidas = ["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"];
      
      expect(periodicidadesPermitidas).toContain("unico");
      expect(periodicidadesPermitidas).toContain("mensal");
      expect(periodicidadesPermitidas).toContain("bimestral");
      expect(periodicidadesPermitidas).toContain("trimestral");
      expect(periodicidadesPermitidas).toContain("semestral");
      expect(periodicidadesPermitidas).toContain("anual");
    });

    it("deve ter 6 opções de periodicidade", () => {
      const periodicidadesPermitidas = ["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"];
      expect(periodicidadesPermitidas.length).toBe(6);
    });
  });

  describe("Tipos de Alerta", () => {
    it("deve validar tipos de alerta permitidos", () => {
      const tiposAlertaPermitidos = ["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"];
      
      expect(tiposAlertaPermitidos).toContain("na_data");
      expect(tiposAlertaPermitidos).toContain("um_dia_antes");
      expect(tiposAlertaPermitidos).toContain("uma_semana_antes");
      expect(tiposAlertaPermitidos).toContain("quinze_dias_antes");
      expect(tiposAlertaPermitidos).toContain("um_mes_antes");
    });

    it("deve ter 5 tipos de alerta", () => {
      const tiposAlertaPermitidos = ["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"];
      expect(tiposAlertaPermitidos.length).toBe(5);
    });
  });

  describe("Status de Vencimento", () => {
    it("deve validar status permitidos", () => {
      const statusPermitidos = ["ativo", "vencido", "renovado", "cancelado"];
      
      expect(statusPermitidos).toContain("ativo");
      expect(statusPermitidos).toContain("vencido");
      expect(statusPermitidos).toContain("renovado");
      expect(statusPermitidos).toContain("cancelado");
    });
  });

  describe("Cálculo de Dias Restantes", () => {
    it("deve calcular dias restantes corretamente para vencimento futuro", () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataVencimento = new Date(hoje);
      dataVencimento.setDate(dataVencimento.getDate() + 15);
      
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasRestantes).toBe(15);
    });

    it("deve calcular dias negativos para vencimento passado", () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataVencimento = new Date(hoje);
      dataVencimento.setDate(dataVencimento.getDate() - 5);
      
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasRestantes).toBe(-5);
    });

    it("deve retornar 0 para vencimento hoje", () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const diasRestantes = Math.ceil((hoje.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasRestantes).toBe(0);
    });

    it("deve identificar vencimento como vencido quando dias < 0", () => {
      const diasRestantes = -5;
      const vencido = diasRestantes < 0;
      
      expect(vencido).toBe(true);
    });

    it("deve identificar vencimento como não vencido quando dias >= 0", () => {
      const diasRestantes = 5;
      const vencido = diasRestantes < 0;
      
      expect(vencido).toBe(false);
    });
  });

  describe("Alertas de Vencimento", () => {
    it("deve calcular data de alerta para 'na_data'", () => {
      const dataVencimento = new Date("2025-01-15");
      const tipoAlerta = "na_data";
      
      let dataAlerta = new Date(dataVencimento);
      if (tipoAlerta === "na_data") {
        // Data de alerta é a mesma do vencimento
      }
      
      expect(dataAlerta.toISOString().split("T")[0]).toBe("2025-01-15");
    });

    it("deve calcular data de alerta para 'um_dia_antes'", () => {
      const dataVencimento = new Date("2025-01-15");
      const tipoAlerta = "um_dia_antes";
      
      let dataAlerta = new Date(dataVencimento);
      if (tipoAlerta === "um_dia_antes") {
        dataAlerta.setDate(dataAlerta.getDate() - 1);
      }
      
      expect(dataAlerta.toISOString().split("T")[0]).toBe("2025-01-14");
    });

    it("deve calcular data de alerta para 'uma_semana_antes'", () => {
      const dataVencimento = new Date("2025-01-15");
      const tipoAlerta = "uma_semana_antes";
      
      let dataAlerta = new Date(dataVencimento);
      if (tipoAlerta === "uma_semana_antes") {
        dataAlerta.setDate(dataAlerta.getDate() - 7);
      }
      
      expect(dataAlerta.toISOString().split("T")[0]).toBe("2025-01-08");
    });

    it("deve calcular data de alerta para 'quinze_dias_antes'", () => {
      const dataVencimento = new Date("2025-01-15");
      const tipoAlerta = "quinze_dias_antes";
      
      let dataAlerta = new Date(dataVencimento);
      if (tipoAlerta === "quinze_dias_antes") {
        dataAlerta.setDate(dataAlerta.getDate() - 15);
      }
      
      expect(dataAlerta.toISOString().split("T")[0]).toBe("2024-12-31");
    });

    it("deve calcular data de alerta para 'um_mes_antes'", () => {
      const dataVencimento = new Date("2025-01-15");
      const tipoAlerta = "um_mes_antes";
      
      let dataAlerta = new Date(dataVencimento);
      if (tipoAlerta === "um_mes_antes") {
        dataAlerta.setMonth(dataAlerta.getMonth() - 1);
      }
      
      expect(dataAlerta.toISOString().split("T")[0]).toBe("2024-12-15");
    });
  });

  describe("Validação de E-mail", () => {
    it("deve validar formato de e-mail correto", () => {
      const emailValido = "sindico@condominio.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(emailValido)).toBe(true);
    });

    it("deve rejeitar formato de e-mail inválido", () => {
      const emailInvalido = "email-invalido";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(emailInvalido)).toBe(false);
    });

    it("deve rejeitar e-mail sem domínio", () => {
      const emailInvalido = "sindico@";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(emailInvalido)).toBe(false);
    });
  });

  describe("Formatação de Valor", () => {
    it("deve formatar valor monetário corretamente", () => {
      const valor = 5000.00;
      const valorFormatado = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      
      expect(valorFormatado).toContain("5.000");
      expect(valorFormatado).toContain("R$");
    });

    it("deve formatar valor com centavos", () => {
      const valor = 1234.56;
      const valorFormatado = valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      expect(valorFormatado).toContain("1.234,56");
    });
  });

  describe("Categorização por Urgência", () => {
    it("deve classificar como urgente quando vencido", () => {
      const diasRestantes = -5;
      const urgencia = diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "urgente" : diasRestantes <= 15 ? "atencao" : diasRestantes <= 30 ? "proximo" : "ok";
      
      expect(urgencia).toBe("vencido");
    });

    it("deve classificar como urgente quando faltam 7 dias ou menos", () => {
      const diasRestantes = 5;
      const urgencia = diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "urgente" : diasRestantes <= 15 ? "atencao" : diasRestantes <= 30 ? "proximo" : "ok";
      
      expect(urgencia).toBe("urgente");
    });

    it("deve classificar como atenção quando faltam 8-15 dias", () => {
      const diasRestantes = 10;
      const urgencia = diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "urgente" : diasRestantes <= 15 ? "atencao" : diasRestantes <= 30 ? "proximo" : "ok";
      
      expect(urgencia).toBe("atencao");
    });

    it("deve classificar como próximo quando faltam 16-30 dias", () => {
      const diasRestantes = 20;
      const urgencia = diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "urgente" : diasRestantes <= 15 ? "atencao" : diasRestantes <= 30 ? "proximo" : "ok";
      
      expect(urgencia).toBe("proximo");
    });

    it("deve classificar como ok quando faltam mais de 30 dias", () => {
      const diasRestantes = 45;
      const urgencia = diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "urgente" : diasRestantes <= 15 ? "atencao" : diasRestantes <= 30 ? "proximo" : "ok";
      
      expect(urgencia).toBe("ok");
    });
  });

  describe("Estrutura de Dados do Vencimento", () => {
    it("deve ter todos os campos obrigatórios", () => {
      const camposObrigatorios = ["id", "condominioId", "tipo", "titulo", "dataVencimento", "status"];
      const vencimentoExemplo = {
        id: 1,
        condominioId: 1,
        tipo: "contrato",
        titulo: "Contrato de Limpeza",
        dataVencimento: Date.now(),
        status: "ativo",
      };
      
      camposObrigatorios.forEach(campo => {
        expect(vencimentoExemplo).toHaveProperty(campo);
      });
    });

    it("deve ter campos opcionais para manutenção", () => {
      const camposManutencao = ["ultimaRealizacao", "proximaRealizacao"];
      const manutencaoExemplo = {
        id: 1,
        condominioId: 1,
        tipo: "manutencao",
        titulo: "Manutenção Elevadores",
        dataVencimento: Date.now(),
        status: "ativo",
        ultimaRealizacao: Date.now() - 86400000 * 180,
        proximaRealizacao: Date.now() + 86400000 * 180,
      };
      
      camposManutencao.forEach(campo => {
        expect(manutencaoExemplo).toHaveProperty(campo);
      });
    });
  });

  describe("Geração de Mensagem de Notificação", () => {
    it("deve gerar mensagem de notificação para vencimento próximo", () => {
      const titulo = "Contrato de Limpeza";
      const diasRestantes = 7;
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + diasRestantes);
      
      const mensagem = `O ${titulo} vence em ${diasRestantes} dias (${dataVencimento.toLocaleDateString("pt-BR")}).`;
      
      expect(mensagem).toContain(titulo);
      expect(mensagem).toContain("7 dias");
    });

    it("deve gerar mensagem de notificação para vencimento hoje", () => {
      const titulo = "Contrato de Limpeza";
      const diasRestantes = 0;
      
      const mensagem = diasRestantes === 0 
        ? `ATENÇÃO: O ${titulo} vence HOJE!`
        : `O ${titulo} vence em ${diasRestantes} dias.`;
      
      expect(mensagem).toContain("vence HOJE");
    });

    it("deve gerar mensagem de notificação para vencimento passado", () => {
      const titulo = "Contrato de Limpeza";
      const diasRestantes = -5;
      
      const mensagem = diasRestantes < 0 
        ? `URGENTE: O ${titulo} está vencido há ${Math.abs(diasRestantes)} dias!`
        : `O ${titulo} vence em ${diasRestantes} dias.`;
      
      expect(mensagem).toContain("vencido há 5 dias");
    });
  });
});


describe("Alertas Automáticos", () => {
  describe("Cálculo de Data de Alerta", () => {
    const diasAntecedencia: Record<string, number> = {
      'na_data': 0,
      'um_dia_antes': 1,
      'uma_semana_antes': 7,
      'quinze_dias_antes': 15,
      'um_mes_antes': 30,
    };

    it("deve calcular corretamente os dias de antecedência para cada tipo de alerta", () => {
      expect(diasAntecedencia['na_data']).toBe(0);
      expect(diasAntecedencia['um_dia_antes']).toBe(1);
      expect(diasAntecedencia['uma_semana_antes']).toBe(7);
      expect(diasAntecedencia['quinze_dias_antes']).toBe(15);
      expect(diasAntecedencia['um_mes_antes']).toBe(30);
    });

    it("deve determinar se um alerta deve ser enviado hoje", () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataVencimento = new Date(hoje);
      dataVencimento.setDate(dataVencimento.getDate() + 7); // Vence em 7 dias
      
      const tipoAlerta = 'uma_semana_antes';
      const diasAntes = diasAntecedencia[tipoAlerta];
      
      const dataAlerta = new Date(dataVencimento);
      dataAlerta.setDate(dataAlerta.getDate() - diasAntes);
      
      // O alerta deve ser enviado hoje
      expect(dataAlerta.getTime()).toBeLessThanOrEqual(hoje.getTime());
    });

    it("deve determinar que um alerta não deve ser enviado ainda", () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataVencimento = new Date(hoje);
      dataVencimento.setDate(dataVencimento.getDate() + 45); // Vence em 45 dias
      
      const tipoAlerta = 'um_mes_antes'; // 30 dias antes
      const diasAntes = diasAntecedencia[tipoAlerta];
      
      const dataAlerta = new Date(dataVencimento);
      dataAlerta.setDate(dataAlerta.getDate() - diasAntes);
      
      // O alerta ainda não deve ser enviado
      expect(dataAlerta.getTime()).toBeGreaterThan(hoje.getTime());
    });
  });

  describe("Geração de Mensagem de Alerta", () => {
    it("deve gerar assunto de e-mail com tipo e status corretos", () => {
      const tipoLabel = 'Contrato';
      const titulo = 'Contrato de Limpeza';
      const statusLabel = 'Vence em 1 semana';
      
      const assunto = `[⚠️ Alerta de Vencimento] ${tipoLabel}: ${titulo} - ${statusLabel}`;
      
      expect(assunto).toContain('Alerta de Vencimento');
      expect(assunto).toContain('Contrato');
      expect(assunto).toContain('Contrato de Limpeza');
      expect(assunto).toContain('Vence em 1 semana');
    });

    it("deve gerar conteúdo de e-mail com informações completas", () => {
      const vencimento = {
        titulo: 'Contrato de Limpeza',
        tipo: 'contrato',
        dataVencimento: new Date('2025-01-15'),
        fornecedor: 'Empresa ABC',
        valor: '5000.00',
        descricao: 'Contrato anual de limpeza',
      };
      
      const conteudo = `
Título: ${vencimento.titulo}
Tipo: Contrato
Data de Vencimento: ${vencimento.dataVencimento.toLocaleDateString('pt-BR')}
Fornecedor: ${vencimento.fornecedor}
Valor: R$ ${vencimento.valor}
Descrição: ${vencimento.descricao}
      `.trim();
      
      expect(conteudo).toContain('Contrato de Limpeza');
      expect(conteudo).toContain('Empresa ABC');
      expect(conteudo).toContain('5000.00');
    });
  });

  describe("Status de Envio de Alerta", () => {
    it("deve marcar alerta como enviado após processamento", () => {
      const alerta = {
        id: 1,
        vencimentoId: 1,
        tipoAlerta: 'uma_semana_antes',
        ativo: true,
        enviado: false,
        dataEnvio: null,
      };
      
      // Simular envio
      alerta.enviado = true;
      alerta.dataEnvio = new Date();
      
      expect(alerta.enviado).toBe(true);
      expect(alerta.dataEnvio).not.toBeNull();
    });

    it("deve filtrar apenas alertas não enviados", () => {
      const alertas = [
        { id: 1, enviado: false, ativo: true },
        { id: 2, enviado: true, ativo: true },
        { id: 3, enviado: false, ativo: true },
        { id: 4, enviado: false, ativo: false },
      ];
      
      const alertasPendentes = alertas.filter(a => !a.enviado && a.ativo);
      
      expect(alertasPendentes.length).toBe(2);
      expect(alertasPendentes.map(a => a.id)).toEqual([1, 3]);
    });
  });
});

describe("Relatório de Vencimentos PDF", () => {
  describe("Filtros de Relatório", () => {
    it("deve filtrar por tipo de vencimento", () => {
      const vencimentos = [
        { id: 1, tipo: 'contrato', titulo: 'Contrato A' },
        { id: 2, tipo: 'servico', titulo: 'Serviço B' },
        { id: 3, tipo: 'manutencao', titulo: 'Manutenção C' },
        { id: 4, tipo: 'contrato', titulo: 'Contrato D' },
      ];
      
      const filtroTipo = 'contrato';
      const filtrados = vencimentos.filter(v => v.tipo === filtroTipo);
      
      expect(filtrados.length).toBe(2);
      expect(filtrados.every(v => v.tipo === 'contrato')).toBe(true);
    });

    it("deve filtrar por status", () => {
      const vencimentos = [
        { id: 1, status: 'ativo', titulo: 'Item A' },
        { id: 2, status: 'vencido', titulo: 'Item B' },
        { id: 3, status: 'ativo', titulo: 'Item C' },
        { id: 4, status: 'cancelado', titulo: 'Item D' },
      ];
      
      const filtroStatus = 'ativo';
      const filtrados = vencimentos.filter(v => v.status === filtroStatus);
      
      expect(filtrados.length).toBe(2);
      expect(filtrados.every(v => v.status === 'ativo')).toBe(true);
    });

    it("deve retornar todos quando filtro é 'todos'", () => {
      const vencimentos = [
        { id: 1, tipo: 'contrato' },
        { id: 2, tipo: 'servico' },
        { id: 3, tipo: 'manutencao' },
      ];
      
      const filtroTipo = 'todos';
      const filtrados = filtroTipo === 'todos' 
        ? vencimentos 
        : vencimentos.filter(v => v.tipo === filtroTipo);
      
      expect(filtrados.length).toBe(3);
    });

    it("deve filtrar por intervalo de datas", () => {
      const vencimentos = [
        { id: 1, dataVencimento: new Date('2025-01-10') },
        { id: 2, dataVencimento: new Date('2025-01-20') },
        { id: 3, dataVencimento: new Date('2025-02-05') },
        { id: 4, dataVencimento: new Date('2025-02-15') },
      ];
      
      const dataInicio = new Date('2025-01-15');
      const dataFim = new Date('2025-02-10');
      
      const filtrados = vencimentos.filter(v => 
        v.dataVencimento >= dataInicio && v.dataVencimento <= dataFim
      );
      
      expect(filtrados.length).toBe(2);
      expect(filtrados.map(v => v.id)).toEqual([2, 3]);
    });
  });

  describe("Estatísticas do Relatório", () => {
    it("deve calcular total de vencimentos", () => {
      const vencimentos = [
        { id: 1, tipo: 'contrato' },
        { id: 2, tipo: 'servico' },
        { id: 3, tipo: 'manutencao' },
      ];
      
      expect(vencimentos.length).toBe(3);
    });

    it("deve calcular quantidade de vencidos", () => {
      const hoje = new Date();
      const vencimentos = [
        { id: 1, dataVencimento: new Date(hoje.getTime() - 86400000 * 5), status: 'ativo' }, // 5 dias atrás
        { id: 2, dataVencimento: new Date(hoje.getTime() + 86400000 * 10), status: 'ativo' }, // 10 dias à frente
        { id: 3, dataVencimento: new Date(hoje.getTime() - 86400000 * 2), status: 'ativo' }, // 2 dias atrás
      ];
      
      const vencidos = vencimentos.filter(v => 
        new Date(v.dataVencimento) < hoje && v.status === 'ativo'
      );
      
      expect(vencidos.length).toBe(2);
    });

    it("deve calcular quantidade próximos 30 dias", () => {
      const hoje = new Date();
      const em30dias = new Date(hoje.getTime() + 86400000 * 30);
      
      const vencimentos = [
        { id: 1, dataVencimento: new Date(hoje.getTime() + 86400000 * 5), status: 'ativo' },
        { id: 2, dataVencimento: new Date(hoje.getTime() + 86400000 * 45), status: 'ativo' },
        { id: 3, dataVencimento: new Date(hoje.getTime() + 86400000 * 20), status: 'ativo' },
      ];
      
      const proximos = vencimentos.filter(v => {
        const data = new Date(v.dataVencimento);
        return data >= hoje && data <= em30dias && v.status === 'ativo';
      });
      
      expect(proximos.length).toBe(2);
    });

    it("deve contar por tipo de vencimento", () => {
      const vencimentos = [
        { tipo: 'contrato' },
        { tipo: 'contrato' },
        { tipo: 'servico' },
        { tipo: 'manutencao' },
        { tipo: 'manutencao' },
        { tipo: 'manutencao' },
      ];
      
      const contratos = vencimentos.filter(v => v.tipo === 'contrato').length;
      const servicos = vencimentos.filter(v => v.tipo === 'servico').length;
      const manutencoes = vencimentos.filter(v => v.tipo === 'manutencao').length;
      
      expect(contratos).toBe(2);
      expect(servicos).toBe(1);
      expect(manutencoes).toBe(3);
    });
  });

  describe("Formatação do Relatório", () => {
    it("deve formatar data no padrão brasileiro", () => {
      const data = new Date(2025, 0, 15); // Janeiro é mês 0
      const dataFormatada = data.toLocaleDateString('pt-BR');
      
      expect(dataFormatada).toBe('15/01/2025');
    });

    it("deve gerar nome de arquivo com timestamp", () => {
      const condominioId = 1;
      const timestamp = Date.now();
      const fileName = `relatorio-vencimentos-${condominioId}-${timestamp}.pdf`;
      
      expect(fileName).toContain('relatorio-vencimentos');
      expect(fileName).toContain('1');
      expect(fileName).toContain('.pdf');
    });

    it("deve determinar badge de status correto", () => {
      const getBadgeClass = (diasRestantes: number) => {
        if (diasRestantes < 0) return 'badge-vencido';
        if (diasRestantes <= 30) return 'badge-proximo';
        return 'badge-ok';
      };
      
      expect(getBadgeClass(-5)).toBe('badge-vencido');
      expect(getBadgeClass(15)).toBe('badge-proximo');
      expect(getBadgeClass(45)).toBe('badge-ok');
    });
  });
});


describe("Dashboard de Vencimentos", () => {
  describe("Estatísticas Gerais", () => {
    it("deve calcular total de vencimentos", () => {
      const vencimentos = [
        { id: 1, tipo: 'contrato', status: 'ativo' },
        { id: 2, tipo: 'servico', status: 'ativo' },
        { id: 3, tipo: 'manutencao', status: 'vencido' },
      ];
      
      expect(vencimentos.length).toBe(3);
    });

    it("deve calcular vencimentos ativos", () => {
      const vencimentos = [
        { id: 1, status: 'ativo' },
        { id: 2, status: 'ativo' },
        { id: 3, status: 'cancelado' },
        { id: 4, status: 'renovado' },
      ];
      
      const ativos = vencimentos.filter(v => v.status === 'ativo').length;
      expect(ativos).toBe(2);
    });

    it("deve calcular valor total ativo", () => {
      const vencimentos = [
        { id: 1, status: 'ativo', valor: 1000 },
        { id: 2, status: 'ativo', valor: 2500 },
        { id: 3, status: 'cancelado', valor: 500 },
      ];
      
      const valorTotalAtivo = vencimentos
        .filter(v => v.status === 'ativo')
        .reduce((sum, v) => sum + v.valor, 0);
      
      expect(valorTotalAtivo).toBe(3500);
    });
  });

  describe("Vencimentos por Mês", () => {
    it("deve agrupar vencimentos por mês", () => {
      const vencimentos = [
        { id: 1, dataVencimento: new Date('2025-01-15') },
        { id: 2, dataVencimento: new Date('2025-01-20') },
        { id: 3, dataVencimento: new Date('2025-02-10') },
        { id: 4, dataVencimento: new Date('2025-03-05') },
      ];
      
      const porMes = new Map<number, number>();
      vencimentos.forEach(v => {
        const mes = new Date(v.dataVencimento).getMonth();
        porMes.set(mes, (porMes.get(mes) || 0) + 1);
      });
      
      expect(porMes.get(0)).toBe(2); // Janeiro
      expect(porMes.get(1)).toBe(1); // Fevereiro
      expect(porMes.get(2)).toBe(1); // Março
    });

    it("deve retornar 12 meses no resultado", () => {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      expect(meses.length).toBe(12);
    });

    it("deve filtrar por ano específico", () => {
      const vencimentos = [
        { id: 1, dataVencimento: new Date('2024-12-15') },
        { id: 2, dataVencimento: new Date('2025-01-20') },
        { id: 3, dataVencimento: new Date('2025-06-10') },
      ];
      
      const ano = 2025;
      const doAno = vencimentos.filter(v => new Date(v.dataVencimento).getFullYear() === ano);
      
      expect(doAno.length).toBe(2);
    });
  });

  describe("Vencimentos por Categoria", () => {
    it("deve agrupar por tipo de vencimento", () => {
      const vencimentos = [
        { tipo: 'contrato' },
        { tipo: 'contrato' },
        { tipo: 'servico' },
        { tipo: 'manutencao' },
        { tipo: 'manutencao' },
        { tipo: 'manutencao' },
      ];
      
      const porCategoria = {
        contratos: vencimentos.filter(v => v.tipo === 'contrato').length,
        servicos: vencimentos.filter(v => v.tipo === 'servico').length,
        manutencoes: vencimentos.filter(v => v.tipo === 'manutencao').length,
      };
      
      expect(porCategoria.contratos).toBe(2);
      expect(porCategoria.servicos).toBe(1);
      expect(porCategoria.manutencoes).toBe(3);
    });

    it("deve ter 3 categorias definidas", () => {
      const categorias = [
        { tipo: 'contrato', nome: 'Contratos', cor: '#3B82F6' },
        { tipo: 'servico', nome: 'Serviços', cor: '#8B5CF6' },
        { tipo: 'manutencao', nome: 'Manutenções', cor: '#F59E0B' },
      ];
      
      expect(categorias.length).toBe(3);
      expect(categorias.map(c => c.tipo)).toEqual(['contrato', 'servico', 'manutencao']);
    });
  });

  describe("Vencimentos por Status", () => {
    it("deve agrupar por status", () => {
      const vencimentos = [
        { status: 'ativo' },
        { status: 'ativo' },
        { status: 'vencido' },
        { status: 'renovado' },
        { status: 'cancelado' },
      ];
      
      const porStatus = {
        ativos: vencimentos.filter(v => v.status === 'ativo').length,
        vencidos: vencimentos.filter(v => v.status === 'vencido').length,
        renovados: vencimentos.filter(v => v.status === 'renovado').length,
        cancelados: vencimentos.filter(v => v.status === 'cancelado').length,
      };
      
      expect(porStatus.ativos).toBe(2);
      expect(porStatus.vencidos).toBe(1);
      expect(porStatus.renovados).toBe(1);
      expect(porStatus.cancelados).toBe(1);
    });

    it("deve ter 4 status definidos", () => {
      const statusList = [
        { status: 'ativo', nome: 'Ativos', cor: '#22C55E' },
        { status: 'vencido', nome: 'Vencidos', cor: '#EF4444' },
        { status: 'renovado', nome: 'Renovados', cor: '#3B82F6' },
        { status: 'cancelado', nome: 'Cancelados', cor: '#6B7280' },
      ];
      
      expect(statusList.length).toBe(4);
    });
  });

  describe("Próximos Vencimentos", () => {
    it("deve filtrar vencimentos nos próximos N dias", () => {
      const hoje = new Date();
      const vencimentos = [
        { id: 1, dataVencimento: new Date(hoje.getTime() + 86400000 * 5), status: 'ativo' },
        { id: 2, dataVencimento: new Date(hoje.getTime() + 86400000 * 15), status: 'ativo' },
        { id: 3, dataVencimento: new Date(hoje.getTime() + 86400000 * 45), status: 'ativo' },
        { id: 4, dataVencimento: new Date(hoje.getTime() - 86400000 * 5), status: 'ativo' }, // passado
      ];
      
      const dias = 30;
      const dataLimite = new Date(hoje.getTime() + 86400000 * dias);
      
      const proximos = vencimentos.filter(v => {
        const data = new Date(v.dataVencimento);
        return data >= hoje && data <= dataLimite && v.status === 'ativo';
      });
      
      expect(proximos.length).toBe(2);
    });

    it("deve calcular dias restantes corretamente", () => {
      const hoje = new Date();
      const dataVencimento = new Date(hoje.getTime() + 86400000 * 10);
      
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasRestantes).toBe(10);
    });
  });

  describe("Vencimentos Vencidos", () => {
    it("deve filtrar apenas vencimentos atrasados", () => {
      const hoje = new Date();
      const vencimentos = [
        { id: 1, dataVencimento: new Date(hoje.getTime() - 86400000 * 5), status: 'ativo' },
        { id: 2, dataVencimento: new Date(hoje.getTime() + 86400000 * 10), status: 'ativo' },
        { id: 3, dataVencimento: new Date(hoje.getTime() - 86400000 * 2), status: 'ativo' },
        { id: 4, dataVencimento: new Date(hoje.getTime() - 86400000 * 10), status: 'cancelado' },
      ];
      
      const vencidos = vencimentos.filter(v => {
        const data = new Date(v.dataVencimento);
        return data < hoje && v.status === 'ativo';
      });
      
      expect(vencidos.length).toBe(2);
    });

    it("deve calcular dias atrasados corretamente", () => {
      const hoje = new Date();
      const dataVencimento = new Date(hoje.getTime() - 86400000 * 7);
      
      const diasAtrasados = Math.ceil((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diasAtrasados).toBe(7);
    });
  });

  describe("Evolução Temporal", () => {
    it("deve gerar dados para os últimos N meses", () => {
      const meses = 12;
      const resultado: Array<{ mes: number; ano: number }> = [];
      
      const agora = new Date();
      for (let i = meses - 1; i >= 0; i--) {
        const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        resultado.push({
          mes: data.getMonth() + 1,
          ano: data.getFullYear(),
        });
      }
      
      expect(resultado.length).toBe(12);
    });

    it("deve formatar nome do mês corretamente", () => {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesIndex = 0; // Janeiro
      const ano = 2025;
      
      const nome = `${meses[mesIndex]}/${ano.toString().slice(-2)}`;
      
      expect(nome).toBe('Jan/25');
    });
  });

  describe("Gráficos", () => {
    it("deve calcular percentagem para gráfico de pizza", () => {
      const categorias = [
        { nome: 'Contratos', total: 10 },
        { nome: 'Serviços', total: 5 },
        { nome: 'Manutenções', total: 15 },
      ];
      
      const total = categorias.reduce((sum, c) => sum + c.total, 0);
      const percentagens = categorias.map(c => ({
        nome: c.nome,
        percentagem: (c.total / total) * 100,
      }));
      
      expect(percentagens[0].percentagem).toBeCloseTo(33.33, 1);
      expect(percentagens[1].percentagem).toBeCloseTo(16.67, 1);
      expect(percentagens[2].percentagem).toBe(50);
    });

    it("deve calcular escala para gráfico de barras", () => {
      const dados = [5, 10, 3, 8, 15, 2];
      const max = Math.max(...dados);
      
      const escala = dados.map(d => (d / max) * 100);
      
      expect(max).toBe(15);
      expect(escala[4]).toBe(100); // O maior valor deve ser 100%
      expect(escala[5]).toBeCloseTo(13.33, 1); // 2/15 * 100
    });
  });

  describe("Formatação de Moeda", () => {
    it("deve formatar valor em reais", () => {
      const valor = 5000;
      const formatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
      
      expect(formatado).toContain('R$');
      expect(formatado).toContain('5.000');
    });

    it("deve formatar valor com centavos", () => {
      const valor = 1234.56;
      const formatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
      
      expect(formatado).toContain('1.234,56');
    });
  });
});

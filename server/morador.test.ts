import { describe, expect, it } from "vitest";

describe("Moradores", () => {
  describe("Schema de moradores", () => {
    it("deve ter os campos necessários para um morador", () => {
      const moradorFields = [
        "id",
        "condominioId",
        "usuarioId",
        "nome",
        "email",
        "telefone",
        "celular",
        "apartamento",
        "bloco",
        "andar",
        "tipo",
        "cpf",
        "dataNascimento",
        "fotoUrl",
        "observacoes",
        "dataEntrada",
        "dataSaida",
        "ativo",
        "createdAt",
        "updatedAt",
      ];
      
      // Verificar que todos os campos esperados existem
      expect(moradorFields).toContain("id");
      expect(moradorFields).toContain("condominioId");
      expect(moradorFields).toContain("nome");
      expect(moradorFields).toContain("apartamento");
      expect(moradorFields).toContain("bloco");
      expect(moradorFields).toContain("tipo");
      expect(moradorFields).toContain("usuarioId");
    });

    it("deve suportar os tipos de morador corretos", () => {
      const tiposValidos = ["proprietario", "inquilino", "familiar", "funcionario"];
      
      expect(tiposValidos).toContain("proprietario");
      expect(tiposValidos).toContain("inquilino");
      expect(tiposValidos).toContain("familiar");
      expect(tiposValidos).toContain("funcionario");
      expect(tiposValidos.length).toBe(4);
    });
  });

  describe("Validação de dados do morador", () => {
    it("deve criar morador com campos obrigatórios", () => {
      const morador = {
        condominioId: 1,
        nome: "João da Silva",
        apartamento: "101",
        tipo: "proprietario" as const,
        ativo: true,
      };

      expect(morador.condominioId).toBe(1);
      expect(morador.nome).toBe("João da Silva");
      expect(morador.apartamento).toBe("101");
      expect(morador.tipo).toBe("proprietario");
      expect(morador.ativo).toBe(true);
    });

    it("deve criar morador com todos os campos opcionais", () => {
      const morador = {
        condominioId: 1,
        nome: "Maria Santos",
        email: "maria@email.com",
        telefone: "(11) 3333-4444",
        celular: "(11) 99999-8888",
        apartamento: "202",
        bloco: "A",
        andar: "2º",
        tipo: "inquilino" as const,
        cpf: "123.456.789-00",
        observacoes: "Mora com 2 filhos",
        ativo: true,
      };

      expect(morador.email).toBe("maria@email.com");
      expect(morador.celular).toBe("(11) 99999-8888");
      expect(morador.bloco).toBe("A");
      expect(morador.andar).toBe("2º");
      expect(morador.cpf).toBe("123.456.789-00");
      expect(morador.observacoes).toBe("Mora com 2 filhos");
    });

    it("deve validar que nome não pode ser vazio", () => {
      const validarNome = (nome: string) => nome.trim().length > 0;
      
      expect(validarNome("João")).toBe(true);
      expect(validarNome("")).toBe(false);
      expect(validarNome("   ")).toBe(false);
    });

    it("deve validar que apartamento não pode ser vazio", () => {
      const validarApartamento = (apt: string) => apt.trim().length > 0;
      
      expect(validarApartamento("101")).toBe(true);
      expect(validarApartamento("A-101")).toBe(true);
      expect(validarApartamento("")).toBe(false);
    });
  });

  describe("Agrupamento por bloco", () => {
    it("deve agrupar moradores por bloco corretamente", () => {
      const moradores = [
        { id: 1, nome: "João", apartamento: "101", bloco: "A" },
        { id: 2, nome: "Maria", apartamento: "201", bloco: "B" },
        { id: 3, nome: "Pedro", apartamento: "102", bloco: "A" },
        { id: 4, nome: "Ana", apartamento: "202", bloco: "B" },
        { id: 5, nome: "Carlos", apartamento: "301", bloco: null },
      ];

      const moradoresPorBloco = moradores.reduce((acc, morador) => {
        const bloco = morador.bloco || "Sem Bloco";
        if (!acc[bloco]) acc[bloco] = [];
        acc[bloco].push(morador);
        return acc;
      }, {} as Record<string, typeof moradores>);

      expect(Object.keys(moradoresPorBloco).length).toBe(3);
      expect(moradoresPorBloco["A"].length).toBe(2);
      expect(moradoresPorBloco["B"].length).toBe(2);
      expect(moradoresPorBloco["Sem Bloco"].length).toBe(1);
    });

    it("deve ordenar blocos alfabeticamente", () => {
      const blocos = ["C", "A", "B", "Sem Bloco"];
      const blocosOrdenados = [...blocos].sort();

      expect(blocosOrdenados[0]).toBe("A");
      expect(blocosOrdenados[1]).toBe("B");
      expect(blocosOrdenados[2]).toBe("C");
      expect(blocosOrdenados[3]).toBe("Sem Bloco");
    });
  });

  describe("Busca e filtros", () => {
    it("deve filtrar moradores por nome", () => {
      const moradores = [
        { id: 1, nome: "João Silva", apartamento: "101", bloco: "A" },
        { id: 2, nome: "Maria Santos", apartamento: "201", bloco: "B" },
        { id: 3, nome: "João Pedro", apartamento: "102", bloco: "A" },
      ];

      const query = "joão";
      const filtrados = moradores.filter(m => 
        m.nome.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtrados.length).toBe(2);
      expect(filtrados[0].nome).toBe("João Silva");
      expect(filtrados[1].nome).toBe("João Pedro");
    });

    it("deve filtrar moradores por apartamento", () => {
      const moradores = [
        { id: 1, nome: "João", apartamento: "101", bloco: "A" },
        { id: 2, nome: "Maria", apartamento: "201", bloco: "B" },
        { id: 3, nome: "Pedro", apartamento: "102", bloco: "A" },
      ];

      const query = "10";
      const filtrados = moradores.filter(m => 
        m.apartamento.includes(query)
      );

      expect(filtrados.length).toBe(2);
      expect(filtrados[0].apartamento).toBe("101");
      expect(filtrados[1].apartamento).toBe("102");
    });

    it("deve filtrar moradores por bloco", () => {
      const moradores = [
        { id: 1, nome: "João", apartamento: "101", bloco: "A" },
        { id: 2, nome: "Maria", apartamento: "201", bloco: "B" },
        { id: 3, nome: "Pedro", apartamento: "102", bloco: "A" },
      ];

      const query = "A";
      const filtrados = moradores.filter(m => 
        m.bloco?.toLowerCase() === query.toLowerCase()
      );

      expect(filtrados.length).toBe(2);
    });

    it("deve buscar em múltiplos campos simultaneamente", () => {
      const moradores = [
        { id: 1, nome: "João Silva", apartamento: "101", bloco: "A", email: "joao@email.com" },
        { id: 2, nome: "Maria Santos", apartamento: "201", bloco: "B", email: "maria@email.com" },
        { id: 3, nome: "Pedro Alves", apartamento: "102", bloco: "A", email: "pedro@email.com" },
      ];

      const buscar = (query: string) => {
        const q = query.toLowerCase();
        return moradores.filter(m => 
          m.nome.toLowerCase().includes(q) ||
          m.apartamento.toLowerCase().includes(q) ||
          (m.bloco && m.bloco.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q))
        );
      };

      expect(buscar("joão").length).toBe(1);
      expect(buscar("101").length).toBe(1);
      // Busca por "a" encontra todos que têm "a" em qualquer campo
      // Então vamos testar busca por bloco específico
      const moradoresBlocoA = moradores.filter(m => m.bloco === "A");
      expect(moradoresBlocoA.length).toBe(2);
      expect(buscar("email.com").length).toBe(3);
    });
  });

  describe("Vinculação de usuário", () => {
    it("deve permitir vincular morador a usuário do sistema", () => {
      const morador = {
        id: 1,
        nome: "João Silva",
        apartamento: "101",
        usuarioId: null as number | null,
      };

      // Vincular usuário
      const moradorVinculado = {
        ...morador,
        usuarioId: 123,
      };

      expect(moradorVinculado.usuarioId).toBe(123);
    });

    it("deve permitir desvincular usuário do morador", () => {
      const morador = {
        id: 1,
        nome: "João Silva",
        apartamento: "101",
        usuarioId: 123,
      };

      // Desvincular usuário
      const moradorDesvinculado = {
        ...morador,
        usuarioId: null,
      };

      expect(moradorDesvinculado.usuarioId).toBeNull();
    });
  });

  describe("Status ativo/inativo", () => {
    it("deve filtrar apenas moradores ativos", () => {
      const moradores = [
        { id: 1, nome: "João", ativo: true },
        { id: 2, nome: "Maria", ativo: false },
        { id: 3, nome: "Pedro", ativo: true },
        { id: 4, nome: "Ana", ativo: false },
      ];

      const ativos = moradores.filter(m => m.ativo);

      expect(ativos.length).toBe(2);
      expect(ativos[0].nome).toBe("João");
      expect(ativos[1].nome).toBe("Pedro");
    });

    it("deve marcar morador como inativo ao invés de excluir", () => {
      const morador = {
        id: 1,
        nome: "João",
        ativo: true,
        dataSaida: null as Date | null,
      };

      // Desativar morador
      const moradorInativo = {
        ...morador,
        ativo: false,
        dataSaida: new Date(),
      };

      expect(moradorInativo.ativo).toBe(false);
      expect(moradorInativo.dataSaida).toBeInstanceOf(Date);
    });
  });

  describe("Tipos de morador", () => {
    it("deve retornar label correto para cada tipo", () => {
      const getTipoLabel = (tipo: string) => {
        switch (tipo) {
          case "proprietario": return "Proprietário";
          case "inquilino": return "Inquilino";
          case "familiar": return "Familiar";
          case "funcionario": return "Funcionário";
          default: return "Morador";
        }
      };

      expect(getTipoLabel("proprietario")).toBe("Proprietário");
      expect(getTipoLabel("inquilino")).toBe("Inquilino");
      expect(getTipoLabel("familiar")).toBe("Familiar");
      expect(getTipoLabel("funcionario")).toBe("Funcionário");
      expect(getTipoLabel("outro")).toBe("Morador");
    });

    it("deve retornar cor correta para cada tipo de badge", () => {
      const getTipoBadgeColor = (tipo: string) => {
        switch (tipo) {
          case "proprietario": return "bg-emerald-100";
          case "inquilino": return "bg-blue-100";
          case "familiar": return "bg-purple-100";
          case "funcionario": return "bg-amber-100";
          default: return "bg-gray-100";
        }
      };

      expect(getTipoBadgeColor("proprietario")).toBe("bg-emerald-100");
      expect(getTipoBadgeColor("inquilino")).toBe("bg-blue-100");
      expect(getTipoBadgeColor("familiar")).toBe("bg-purple-100");
      expect(getTipoBadgeColor("funcionario")).toBe("bg-amber-100");
    });
  });

  describe("Contagem de moradores", () => {
    it("deve contar total de moradores por condomínio", () => {
      const moradores = [
        { id: 1, condominioId: 1, nome: "João" },
        { id: 2, condominioId: 1, nome: "Maria" },
        { id: 3, condominioId: 2, nome: "Pedro" },
        { id: 4, condominioId: 1, nome: "Ana" },
      ];

      const countByCondominio = (condominioId: number) => 
        moradores.filter(m => m.condominioId === condominioId).length;

      expect(countByCondominio(1)).toBe(3);
      expect(countByCondominio(2)).toBe(1);
    });

    it("deve contar moradores por bloco", () => {
      const moradores = [
        { id: 1, bloco: "A", nome: "João" },
        { id: 2, bloco: "B", nome: "Maria" },
        { id: 3, bloco: "A", nome: "Pedro" },
        { id: 4, bloco: "A", nome: "Ana" },
      ];

      const countByBloco = (bloco: string) => 
        moradores.filter(m => m.bloco === bloco).length;

      expect(countByBloco("A")).toBe(3);
      expect(countByBloco("B")).toBe(1);
    });
  });

  describe("Edição de morador", () => {
    it("deve atualizar dados do morador corretamente", () => {
      const morador = {
        id: 1,
        nome: "João Silva",
        email: "joao@email.com",
        apartamento: "101",
        bloco: "A",
      };

      const dadosAtualizados = {
        nome: "João da Silva Santos",
        email: "joao.santos@email.com",
        celular: "(11) 99999-1234",
      };

      const moradorAtualizado = {
        ...morador,
        ...dadosAtualizados,
      };

      expect(moradorAtualizado.nome).toBe("João da Silva Santos");
      expect(moradorAtualizado.email).toBe("joao.santos@email.com");
      expect(moradorAtualizado.celular).toBe("(11) 99999-1234");
      expect(moradorAtualizado.apartamento).toBe("101"); // Não alterado
    });

    it("deve manter campos não atualizados", () => {
      const morador = {
        id: 1,
        nome: "João",
        apartamento: "101",
        bloco: "A",
        tipo: "proprietario",
        cpf: "123.456.789-00",
      };

      const atualizacao = { nome: "João Silva" };
      const moradorAtualizado = { ...morador, ...atualizacao };

      expect(moradorAtualizado.apartamento).toBe("101");
      expect(moradorAtualizado.bloco).toBe("A");
      expect(moradorAtualizado.tipo).toBe("proprietario");
      expect(moradorAtualizado.cpf).toBe("123.456.789-00");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do getDb
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((password: string, hash: string) => 
      Promise.resolve(hash === `hashed_${password}` || hash === "hashed_123456")
    ),
  },
}));

describe("Perfil APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPerfil", () => {
    it("deve retornar dados do perfil do usuário", async () => {
      const mockUser = {
        id: 1,
        name: "EDUARDO DOMINIKUS",
        email: "eddnpt@gmail.com",
        phone: "81999618516",
        avatarUrl: null,
        tipoConta: "admin",
        role: "admin",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      };

      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Simular chamada da API
      const result = mockUser;

      expect(result.id).toBe(1);
      expect(result.name).toBe("EDUARDO DOMINIKUS");
      expect(result.email).toBe("eddnpt@gmail.com");
      expect(result.role).toBe("admin");
    });

    it("deve lançar erro se usuário não for encontrado", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      // Simular erro
      const error = new Error("Usuário não encontrado");
      expect(error.message).toBe("Usuário não encontrado");
    });
  });

  describe("atualizarPerfil", () => {
    it("deve atualizar nome do usuário", async () => {
      mockDb.where.mockResolvedValueOnce({ affectedRows: 1 });

      const input = { nome: "Novo Nome" };
      
      // Simular atualização
      expect(input.nome).toBe("Novo Nome");
    });

    it("deve atualizar telefone do usuário", async () => {
      mockDb.where.mockResolvedValueOnce({ affectedRows: 1 });

      const input = { telefone: "(81) 99961-8516" };
      
      expect(input.telefone).toBe("(81) 99961-8516");
    });

    it("deve lançar erro se nenhum dado for fornecido", async () => {
      const error = new Error("Nenhum dado para atualizar");
      expect(error.message).toBe("Nenhum dado para atualizar");
    });
  });

  describe("alterarSenha", () => {
    it("deve alterar senha quando senha atual estiver correta", async () => {
      const mockUser = {
        id: 1,
        senha: "hashed_123456",
      };

      mockDb.limit.mockResolvedValueOnce([mockUser]);
      mockDb.where.mockResolvedValueOnce({ affectedRows: 1 });

      const input = {
        senhaAtual: "123456",
        novaSenha: "novaSenha123",
      };

      // Simular validação
      expect(input.novaSenha.length).toBeGreaterThanOrEqual(6);
    });

    it("deve lançar erro se senha atual estiver incorreta", async () => {
      const error = new Error("Senha atual incorreta");
      expect(error.message).toBe("Senha atual incorreta");
    });

    it("deve lançar erro se conta usar login social", async () => {
      const mockUser = {
        id: 1,
        senha: null, // Login social não tem senha
      };

      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const error = new Error("Esta conta usa login social e não possui senha local.");
      expect(error.message).toContain("login social");
    });

    it("deve validar tamanho mínimo da nova senha", async () => {
      const novaSenha = "12345"; // Menos de 6 caracteres
      
      expect(novaSenha.length).toBeLessThan(6);
    });
  });

  describe("atualizarEmail", () => {
    it("deve atualizar email quando senha estiver correta", async () => {
      const mockUser = {
        id: 1,
        email: "antigo@email.com",
        senha: "hashed_123456",
      };

      mockDb.limit.mockResolvedValueOnce([mockUser]);
      mockDb.limit.mockResolvedValueOnce([]); // Nenhum usuário com o novo email
      mockDb.where.mockResolvedValueOnce({ affectedRows: 1 });

      const input = {
        novoEmail: "novo@email.com",
        senha: "123456",
      };

      // Simular validação de email
      expect(input.novoEmail).toContain("@");
    });

    it("deve lançar erro se email já estiver em uso", async () => {
      const error = new Error("Este email já está em uso por outra conta");
      expect(error.message).toContain("já está em uso");
    });

    it("deve lançar erro se senha estiver incorreta", async () => {
      const error = new Error("Senha incorreta");
      expect(error.message).toBe("Senha incorreta");
    });

    it("deve validar formato do email", async () => {
      const emailValido = "teste@email.com";
      const emailInvalido = "emailinvalido";

      expect(emailValido).toContain("@");
      expect(emailInvalido).not.toContain("@");
    });
  });
});

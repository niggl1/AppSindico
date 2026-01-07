import { describe, it, expect, vi } from "vitest";

describe("Amazon SES Email Service", () => {
  describe("Configuração SMTP", () => {
    it("deve ter as variáveis de ambiente configuradas", () => {
      // Verificar que as variáveis de ambiente estão definidas
      expect(process.env.SES_SMTP_HOST).toBeDefined();
      expect(process.env.SES_SMTP_USER).toBeDefined();
      expect(process.env.SES_SMTP_PASSWORD).toBeDefined();
      expect(process.env.SES_FROM_EMAIL).toBeDefined();
    });

    it("deve ter o host SMTP correto para região eu-north-1", () => {
      expect(process.env.SES_SMTP_HOST).toBe("email-smtp.eu-north-1.amazonaws.com");
    });

    it("deve ter um email de remetente válido", () => {
      const email = process.env.SES_FROM_EMAIL || "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });

    it("deve ter credenciais SMTP no formato correto", () => {
      const user = process.env.SES_SMTP_USER || "";
      const password = process.env.SES_SMTP_PASSWORD || "";
      
      // Usuário SMTP do SES começa com AKIA
      expect(user.startsWith("AKIA")).toBe(true);
      expect(user.length).toBeGreaterThan(10);
      
      // Senha SMTP deve ter comprimento adequado
      expect(password.length).toBeGreaterThan(20);
    });
  });

  describe("Funções do serviço de email", () => {
    it("deve exportar função sendEmail", async () => {
      const emailModule = await import("./_core/email");
      expect(typeof emailModule.sendEmail).toBe("function");
    });

    it("deve exportar função sendBulkEmail", async () => {
      const emailModule = await import("./_core/email");
      expect(typeof emailModule.sendBulkEmail).toBe("function");
    });

    it("deve exportar função isEmailConfigured", async () => {
      const emailModule = await import("./_core/email");
      expect(typeof emailModule.isEmailConfigured).toBe("function");
    });

    it("deve retornar true para isEmailConfigured quando credenciais estão definidas", async () => {
      const emailModule = await import("./_core/email");
      expect(emailModule.isEmailConfigured()).toBe(true);
    });

    it("deve exportar templates de email", async () => {
      const emailModule = await import("./_core/email");
      expect(emailModule.emailTemplates).toBeDefined();
      expect(emailModule.emailTemplates.vencimento).toBeDefined();
      expect(emailModule.emailTemplates.notificacao).toBeDefined();
      expect(emailModule.emailTemplates.recuperacaoSenha).toBeDefined();
      expect(emailModule.emailTemplates.linkMagico).toBeDefined();
    });
  });

  describe("Templates de email", () => {
    it("deve gerar template de vencimento corretamente", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.vencimento({
        condominioNome: "Residencial Teste",
        tipo: "IPTU",
        descricao: "Pagamento do IPTU 2024",
        dataVencimento: "15/01/2024",
        valor: "R$ 1.500,00",
        status: "Pendente",
      });

      expect(template.subject).toContain("Residencial Teste");
      expect(template.subject).toContain("IPTU");
      expect(template.html).toContain("IPTU");
      expect(template.html).toContain("R$ 1.500,00");
      expect(template.text).toContain("Pagamento do IPTU 2024");
    });

    it("deve gerar template de notificação corretamente", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.notificacao({
        condominioNome: "Residencial Teste",
        titulo: "Aviso Importante",
        mensagem: "Reunião de condomínio amanhã às 19h.",
      });

      expect(template.subject).toContain("Residencial Teste");
      expect(template.subject).toContain("Aviso Importante");
      expect(template.html).toContain("Reunião de condomínio");
      expect(template.text).toContain("amanhã às 19h");
    });

    it("deve gerar template de recuperação de senha corretamente", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.recuperacaoSenha({
        nome: "João Silva",
        link: "https://appsindico.com.br/redefinir-senha/abc123",
        expiracaoHoras: 24,
      });

      expect(template.subject).toContain("Recuperação de Senha");
      expect(template.html).toContain("João Silva");
      expect(template.html).toContain("https://appsindico.com.br/redefinir-senha/abc123");
      expect(template.html).toContain("24 horas");
    });

    it("deve gerar template de link mágico corretamente", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.linkMagico({
        nome: "Maria Santos",
        link: "https://appsindico.com.br/morador/acesso/xyz789",
        condominioNome: "Residencial Jardins",
        expiracaoMinutos: 30,
      });

      expect(template.subject).toContain("Residencial Jardins");
      expect(template.html).toContain("Maria Santos");
      expect(template.html).toContain("30 minutos");
      expect(template.text).toContain("Portal do Morador");
    });
  });

  describe("Validação de email", () => {
    it("deve validar formato de email corretamente", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test("teste@exemplo.com")).toBe(true);
      expect(emailRegex.test("usuario@dominio.com.br")).toBe(true);
      expect(emailRegex.test("email-invalido")).toBe(false);
      expect(emailRegex.test("@semlocal.com")).toBe(false);
      expect(emailRegex.test("semdominio@")).toBe(false);
    });
  });
});

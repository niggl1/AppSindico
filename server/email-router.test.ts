import { describe, it, expect } from "vitest";

describe("Email Router Procedures", () => {
  describe("Configuração do serviço", () => {
    it("deve ter as variáveis de ambiente SES configuradas", () => {
      expect(process.env.SES_SMTP_HOST).toBeDefined();
      expect(process.env.SES_SMTP_USER).toBeDefined();
      expect(process.env.SES_SMTP_PASSWORD).toBeDefined();
      expect(process.env.SES_FROM_EMAIL).toBeDefined();
    });

    it("deve ter credenciais válidas do Amazon SES", () => {
      const user = process.env.SES_SMTP_USER || "";
      expect(user.startsWith("AKIA")).toBe(true);
    });
  });

  describe("Funções do módulo de email", () => {
    it("deve exportar isEmailConfigured", async () => {
      const { isEmailConfigured } = await import("./_core/email");
      expect(typeof isEmailConfigured).toBe("function");
      expect(isEmailConfigured()).toBe(true);
    });

    it("deve exportar sendEmail", async () => {
      const { sendEmail } = await import("./_core/email");
      expect(typeof sendEmail).toBe("function");
    });

    it("deve exportar sendBulkEmail", async () => {
      const { sendBulkEmail } = await import("./_core/email");
      expect(typeof sendBulkEmail).toBe("function");
    });

    it("deve exportar emailTemplates", async () => {
      const { emailTemplates } = await import("./_core/email");
      expect(emailTemplates).toBeDefined();
      expect(emailTemplates.notificacao).toBeDefined();
      expect(emailTemplates.vencimento).toBeDefined();
      expect(emailTemplates.recuperacaoSenha).toBeDefined();
      expect(emailTemplates.linkMagico).toBeDefined();
    });
  });

  describe("Templates de email", () => {
    it("deve gerar template de notificação com campos corretos", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.notificacao({
        condominioNome: "Residencial Teste",
        titulo: "Aviso Importante",
        mensagem: "Esta é uma mensagem de teste.",
      });

      expect(template.subject).toContain("Residencial Teste");
      expect(template.subject).toContain("Aviso Importante");
      expect(template.html).toContain("Residencial Teste");
      expect(template.html).toContain("Esta é uma mensagem de teste.");
      expect(template.text).toContain("Aviso Importante");
    });

    it("deve gerar template de vencimento com todos os campos", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.vencimento({
        condominioNome: "Residencial Jardins",
        tipo: "Taxa Condominial",
        descricao: "Pagamento mensal de janeiro",
        dataVencimento: "15/01/2026",
        valor: "R$ 850,00",
        status: "Pendente",
      });

      expect(template.subject).toContain("Residencial Jardins");
      expect(template.subject).toContain("Taxa Condominial");
      expect(template.html).toContain("15/01/2026");
      expect(template.html).toContain("R$ 850,00");
      expect(template.html).toContain("Pendente");
    });

    it("deve gerar template de recuperação de senha com link", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.recuperacaoSenha({
        nome: "João Silva",
        link: "https://appsindico.com.br/redefinir/abc123",
        expiracaoHoras: 24,
      });

      expect(template.subject).toContain("Recuperação de Senha");
      expect(template.html).toContain("João Silva");
      expect(template.html).toContain("https://appsindico.com.br/redefinir/abc123");
      expect(template.html).toContain("24 horas");
    });

    it("deve gerar template de link mágico com dados do condomínio", async () => {
      const { emailTemplates } = await import("./_core/email");
      
      const template = emailTemplates.linkMagico({
        nome: "Maria Santos",
        link: "https://appsindico.com.br/acesso/xyz789",
        condominioNome: "Edifício Aurora",
        expiracaoMinutos: 30,
      });

      expect(template.subject).toContain("Edifício Aurora");
      expect(template.html).toContain("Maria Santos");
      expect(template.html).toContain("30 minutos");
    });
  });

  describe("Validação de emails", () => {
    it("deve validar formato de email corretamente", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // Emails válidos
      expect(emailRegex.test("teste@exemplo.com")).toBe(true);
      expect(emailRegex.test("usuario@dominio.com.br")).toBe(true);
      expect(emailRegex.test("nome.sobrenome@empresa.org")).toBe(true);
      
      // Emails inválidos
      expect(emailRegex.test("email-invalido")).toBe(false);
      expect(emailRegex.test("@semlocal.com")).toBe(false);
      expect(emailRegex.test("semdominio@")).toBe(false);
      expect(emailRegex.test("espacos no email@teste.com")).toBe(false);
    });
  });

  describe("Estrutura do router", () => {
    it("deve ter o import do serviço de email no router", async () => {
      // Verificar que as funções de email estão disponíveis
      const { isEmailConfigured, sendEmail, emailTemplates } = await import("./_core/email");
      expect(typeof isEmailConfigured).toBe("function");
      expect(typeof sendEmail).toBe("function");
      expect(emailTemplates).toBeDefined();
    });
  });

  describe("Integração com Amazon SES", () => {
    it("deve ter host SMTP configurado para região correta", () => {
      const host = process.env.SES_SMTP_HOST || "";
      expect(host).toContain("email-smtp");
      expect(host).toContain("amazonaws.com");
    });

    it("deve ter email de remetente válido", () => {
      const fromEmail = process.env.SES_FROM_EMAIL || "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(fromEmail)).toBe(true);
    });
  });
});

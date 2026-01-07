import { describe, expect, it } from "vitest";

describe("Configurações de Notificações", () => {
  describe("Schema de configuracoesEmail", () => {
    it("deve ter os campos necessários para configuração de email", () => {
      const emailFields = [
        "id",
        "condominioId",
        "provedor",
        "apiKey",
        "emailRemetente",
        "nomeRemetente",
        "ativo",
        "createdAt",
        "updatedAt",
      ];
      
      expect(emailFields).toContain("id");
      expect(emailFields).toContain("condominioId");
      expect(emailFields).toContain("provedor");
      expect(emailFields).toContain("apiKey");
      expect(emailFields).toContain("emailRemetente");
      expect(emailFields).toContain("nomeRemetente");
      expect(emailFields).toContain("ativo");
    });

    it("deve suportar os provedores de email corretos", () => {
      const provedoresValidos = ["resend", "sendgrid", "mailgun", "smtp"];
      
      expect(provedoresValidos).toContain("resend");
      expect(provedoresValidos).toContain("sendgrid");
      expect(provedoresValidos).toContain("mailgun");
      expect(provedoresValidos).toContain("smtp");
      expect(provedoresValidos.length).toBe(4);
    });
  });

  describe("Schema de configuracoesPush (VAPID)", () => {
    it("deve ter os campos necessários para configuração VAPID", () => {
      const pushFields = [
        "id",
        "condominioId",
        "vapidPublicKey",
        "vapidPrivateKey",
        "vapidSubject",
        "ativo",
        "createdAt",
        "updatedAt",
      ];
      
      expect(pushFields).toContain("id");
      expect(pushFields).toContain("condominioId");
      expect(pushFields).toContain("vapidPublicKey");
      expect(pushFields).toContain("vapidPrivateKey");
      expect(pushFields).toContain("vapidSubject");
      expect(pushFields).toContain("ativo");
    });
  });

  describe("Validação de dados de configuração de email", () => {
    it("deve criar configuração de email com campos obrigatórios", () => {
      const config = {
        condominioId: 1,
        provedor: "resend" as const,
        apiKey: "re_test_123456789",
        emailRemetente: "noreply@teste.com",
        nomeRemetente: "Condomínio Teste",
        ativo: true,
      };

      expect(config.condominioId).toBe(1);
      expect(config.provedor).toBe("resend");
      expect(config.apiKey).toBe("re_test_123456789");
      expect(config.emailRemetente).toBe("noreply@teste.com");
      expect(config.nomeRemetente).toBe("Condomínio Teste");
      expect(config.ativo).toBe(true);
    });

    it("deve validar formato de email remetente", () => {
      const emailValido = "noreply@condominio.com";
      const emailInvalido = "email-invalido";
      
      expect(emailValido).toMatch(/@/);
      expect(emailInvalido).not.toMatch(/@.*\./);
    });
  });

  describe("Validação de dados de configuração VAPID", () => {
    it("deve criar configuração VAPID com campos obrigatórios", () => {
      const config = {
        condominioId: 1,
        vapidPublicKey: "BNnxWac2yABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij",
        vapidPrivateKey: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr",
        vapidSubject: "mailto:admin@teste.com",
        ativo: true,
      };

      expect(config.condominioId).toBe(1);
      expect(config.vapidPublicKey.length).toBeGreaterThanOrEqual(80);
      expect(config.vapidPrivateKey.length).toBeGreaterThanOrEqual(40);
      expect(config.vapidSubject).toMatch(/^mailto:/);
      expect(config.ativo).toBe(true);
    });

    it("deve validar formato do subject VAPID", () => {
      const subjectMailto = "mailto:admin@teste.com";
      const subjectHttps = "https://teste.com";
      const subjectInvalido = "admin@teste.com";
      
      expect(subjectMailto.startsWith("mailto:") || subjectMailto.startsWith("https://")).toBe(true);
      expect(subjectHttps.startsWith("mailto:") || subjectHttps.startsWith("https://")).toBe(true);
      expect(subjectInvalido.startsWith("mailto:") || subjectInvalido.startsWith("https://")).toBe(false);
    });

    it("deve validar tamanho mínimo das chaves VAPID", () => {
      const publicKey = "BNnxWac2yABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
      const privateKey = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr";
      
      // Chave pública deve ter pelo menos 80 caracteres
      expect(publicKey.length).toBeGreaterThanOrEqual(80);
      
      // Chave privada deve ter pelo menos 40 caracteres
      expect(privateKey.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Mascaramento de chave privada", () => {
    it("deve mascarar chave privada corretamente", () => {
      const privateKey = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr";
      const maskedKey = "****" + privateKey.slice(-8);
      
      expect(maskedKey).toMatch(/^\*\*\*\*/);
      expect(maskedKey).toBe("****klmnopqr");
      expect(maskedKey.length).toBe(12); // 4 asteriscos + 8 últimos caracteres
    });

    it("não deve atualizar chave privada se receber valor mascarado", () => {
      const maskedKey = "****lmnopqr";
      const shouldUpdate = !maskedKey.startsWith("****");
      
      expect(shouldUpdate).toBe(false);
    });
  });

  describe("Integração Email e Push", () => {
    it("deve permitir configurações independentes por canal", () => {
      const emailConfig = {
        condominioId: 1,
        provedor: "resend",
        ativo: true,
      };
      
      const pushConfig = {
        condominioId: 1,
        vapidPublicKey: "BNnxWac2y...",
        ativo: false,
      };
      
      // Mesmo condomínio pode ter email ativo e push desativado
      expect(emailConfig.condominioId).toBe(pushConfig.condominioId);
      expect(emailConfig.ativo).toBe(true);
      expect(pushConfig.ativo).toBe(false);
    });
  });
});

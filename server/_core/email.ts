/**
 * Amazon SES Email Service
 * Serviço para envio de emails via Amazon SES usando SMTP
 */

import nodemailer from 'nodemailer';

// Configuração do transportador SMTP para Amazon SES
const createTransporter = () => {
  const host = process.env.SES_SMTP_HOST || 'email-smtp.eu-north-1.amazonaws.com';
  const port = parseInt(process.env.SES_SMTP_PORT || '587');
  const user = process.env.SES_SMTP_USER;
  const pass = process.env.SES_SMTP_PASSWORD;

  if (!user || !pass) {
    console.warn('[Email] Credenciais SMTP não configuradas. Emails não serão enviados.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // TLS
    auth: {
      user,
      pass,
    },
  });
};

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia um email via Amazon SES
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('[Email] Transporter não disponível. Email não enviado:', options.subject);
    return { 
      success: false, 
      error: 'Credenciais SMTP não configuradas' 
    };
  }

  const defaultFrom = process.env.SES_FROM_EMAIL || 'noreply@appsindico.com.br';
  const defaultFromName = process.env.SES_FROM_NAME || 'App Síndico';

  try {
    const result = await transporter.sendMail({
      from: options.from || `"${defaultFromName}" <${defaultFrom}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('[Email] Enviado com sucesso:', result.messageId);
    return { 
      success: true, 
      messageId: result.messageId 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[Email] Erro ao enviar:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Envia email de notificação para múltiplos destinatários
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  content: { text?: string; html?: string },
  options?: { from?: string; replyTo?: string }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Enviar em lotes de 50 para evitar limites do SES
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    for (const recipient of batch) {
      const result = await sendEmail({
        to: recipient,
        subject,
        text: content.text,
        html: content.html,
        from: options?.from,
        replyTo: options?.replyTo,
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${recipient}: ${result.error}`);
      }
    }

    // Pequena pausa entre lotes para respeitar rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Verifica se o serviço de email está configurado
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SES_SMTP_USER && process.env.SES_SMTP_PASSWORD);
}

/**
 * Templates de email pré-definidos
 */
export const emailTemplates = {
  /**
   * Template para notificação de vencimento
   */
  vencimento: (data: {
    condominioNome: string;
    tipo: string;
    descricao: string;
    dataVencimento: string;
    valor?: string;
    status: string;
  }) => ({
    subject: `[${data.condominioNome}] Alerta de Vencimento: ${data.tipo}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏢 ${data.condominioNome}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestão de Condomínios</p>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚠️ Alerta de Vencimento</strong>
            </div>
            <div class="info-row">
              <span class="label">Tipo:</span>
              <span class="value">${data.tipo}</span>
            </div>
            <div class="info-row">
              <span class="label">Descrição:</span>
              <span class="value">${data.descricao}</span>
            </div>
            <div class="info-row">
              <span class="label">Data de Vencimento:</span>
              <span class="value">${data.dataVencimento}</span>
            </div>
            ${data.valor ? `
            <div class="info-row">
              <span class="label">Valor:</span>
              <span class="value">${data.valor}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${data.status}</span>
            </div>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo App Síndico.</p>
            <p>© ${new Date().getFullYear()} App Síndico - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${data.condominioNome} - Alerta de Vencimento

Tipo: ${data.tipo}
Descrição: ${data.descricao}
Data de Vencimento: ${data.dataVencimento}
${data.valor ? `Valor: ${data.valor}` : ''}
Status: ${data.status}

Este e-mail foi enviado automaticamente pelo App Síndico.
    `.trim(),
  }),

  /**
   * Template para notificação geral
   */
  notificacao: (data: {
    condominioNome: string;
    titulo: string;
    mensagem: string;
  }) => ({
    subject: `[${data.condominioNome}] ${data.titulo}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .message { background: white; padding: 20px; border-radius: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏢 ${data.condominioNome}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestão de Condomínios</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">${data.titulo}</h2>
            <div class="message">
              ${data.mensagem.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo App Síndico.</p>
            <p>© ${new Date().getFullYear()} App Síndico - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${data.condominioNome}

${data.titulo}

${data.mensagem}

Este e-mail foi enviado automaticamente pelo App Síndico.
    `.trim(),
  }),

  /**
   * Template para recuperação de senha
   */
  recuperacaoSenha: (data: {
    nome: string;
    link: string;
    expiracaoHoras?: number;
  }) => ({
    subject: 'App Síndico - Recuperação de Senha',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Recuperação de Senha</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no App Síndico.</p>
            <p style="text-align: center;">
              <a href="${data.link}" class="button">Redefinir Minha Senha</a>
            </p>
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este link expira em ${data.expiracaoHoras || 24} horas. Se você não solicitou esta recuperação, ignore este e-mail.
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
              <a href="${data.link}" style="color: #2563eb; word-break: break-all;">${data.link}</a>
            </p>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo App Síndico.</p>
            <p>© ${new Date().getFullYear()} App Síndico - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Recuperação de Senha - App Síndico

Olá ${data.nome},

Recebemos uma solicitação para redefinir a senha da sua conta no App Síndico.

Clique no link abaixo para redefinir sua senha:
${data.link}

Este link expira em ${data.expiracaoHoras || 24} horas.

Se você não solicitou esta recuperação, ignore este e-mail.

Este e-mail foi enviado automaticamente pelo App Síndico.
    `.trim(),
  }),

  /**
   * Template para link mágico de acesso
   */
  linkMagico: (data: {
    nome: string;
    link: string;
    condominioNome: string;
    expiracaoMinutos?: number;
  }) => ({
    subject: `[${data.condominioNome}] Seu link de acesso`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .info { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔑 Acesso ao Portal</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.condominioNome}</p>
          </div>
          <div class="content">
            <p>Olá <strong>${data.nome}</strong>,</p>
            <p>Você solicitou um link de acesso ao Portal do Morador.</p>
            <p style="text-align: center;">
              <a href="${data.link}" class="button">Acessar Portal</a>
            </p>
            <div class="info">
              <strong>ℹ️ Informação:</strong> Este link é válido por ${data.expiracaoMinutos || 30} minutos e pode ser usado apenas uma vez.
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
              <a href="${data.link}" style="color: #10b981; word-break: break-all;">${data.link}</a>
            </p>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo App Síndico.</p>
            <p>© ${new Date().getFullYear()} App Síndico - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Acesso ao Portal - ${data.condominioNome}

Olá ${data.nome},

Você solicitou um link de acesso ao Portal do Morador.

Clique no link abaixo para acessar:
${data.link}

Este link é válido por ${data.expiracaoMinutos || 30} minutos e pode ser usado apenas uma vez.

Este e-mail foi enviado automaticamente pelo App Síndico.
    `.trim(),
  }),
};

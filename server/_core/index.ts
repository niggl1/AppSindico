import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // API de PDF para Ordens de Serviço
  app.get("/api/ordens-servico/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const { getDb } = await import("../db");
      const db = await getDb();
      const { ordensServico } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      if (!db) {
        return res.status(500).json({ error: "Base de dados não disponível" });
      }
      
      // Buscar OS
      const [ordem] = await db.select().from(ordensServico).where(eq(ordensServico.id, parseInt(id))).limit(1);
      
      // Buscar relacionamentos separadamente
      const { osCategorias, osPrioridades, osStatus, osMateriais, osResponsaveis } = await import("../../drizzle/schema");
      
      let categoria = null;
      let prioridade = null;
      let status = null;
      let materiais: any[] = [];
      let responsaveis: any[] = [];
      
      if (ordem) {
        if (ordem.categoriaId) {
          const [cat] = await db.select().from(osCategorias).where(eq(osCategorias.id, ordem.categoriaId)).limit(1);
          categoria = cat;
        }
        if (ordem.prioridadeId) {
          const [pri] = await db.select().from(osPrioridades).where(eq(osPrioridades.id, ordem.prioridadeId)).limit(1);
          prioridade = pri;
        }
        if (ordem.statusId) {
          const [sta] = await db.select().from(osStatus).where(eq(osStatus.id, ordem.statusId)).limit(1);
          status = sta;
        }
        materiais = await db.select().from(osMateriais).where(eq(osMateriais.ordemServicoId, ordem.id));
        responsaveis = await db.select().from(osResponsaveis).where(eq(osResponsaveis.ordemServicoId, ordem.id));
      }
      
      if (!ordem) {
        return res.status(404).json({ error: "Ordem de serviço não encontrada" });
      }
      
      // Gerar HTML do PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>OS #${ordem.protocolo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #f59e0b, #fbbf24); padding: 20px; border-radius: 10px; color: white; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header .protocolo { font-family: monospace; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 5px; display: inline-block; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fbbf24; padding-bottom: 5px; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { background: #fffbeb; padding: 10px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #92400e; margin-bottom: 5px; }
            .info-value { font-size: 14px; color: #1f2937; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge-status { background: ${status?.cor || '#eab308'}; color: white; }
            .badge-prioridade { background: ${prioridade?.cor || '#3b82f6'}; color: white; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #fde68a; }
            .table th { background: #fef3c7; color: #92400e; font-size: 12px; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${ordem.titulo}</h1>
            <span class="protocolo">#${ordem.protocolo}</span>
          </div>
          
          <div class="section">
            <div class="section-title">Informações Gerais</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value"><span class="badge badge-status">${status?.nome || 'Sem status'}</span></div>
              </div>
              <div class="info-item">
                <div class="info-label">Prioridade</div>
                <div class="info-value"><span class="badge badge-prioridade">${prioridade?.nome || 'Normal'}</span></div>
              </div>
              <div class="info-item">
                <div class="info-label">Categoria</div>
                <div class="info-value">${categoria?.nome || 'Sem categoria'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data de Criação</div>
                <div class="info-value">${ordem.createdAt ? new Date(ordem.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
              </div>
              ${ordem.dataInicio ? `
              <div class="info-item">
                <div class="info-label">Início</div>
                <div class="info-value">${new Date(ordem.dataInicio).toLocaleString('pt-BR')}</div>
              </div>` : ''}
              ${ordem.dataFim ? `
              <div class="info-item">
                <div class="info-label">Fim</div>
                <div class="info-value">${new Date(ordem.dataFim).toLocaleString('pt-BR')}</div>
              </div>` : ''}
            </div>
          </div>
          
          ${ordem.descricao ? `
          <div class="section">
            <div class="section-title">Descrição</div>
            <p>${ordem.descricao}</p>
          </div>` : ''}
          
          ${materiais && materiais.length > 0 ? `
          <div class="section">
            <div class="section-title">Materiais</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${materiais.map((m: any) => `
                <tr>
                  <td>${m.nome}</td>
                  <td>${m.quantidade} ${m.unidade}</td>
                  <td>${m.emEstoque ? 'Em Estoque' : m.precisaPedir ? 'Precisa Pedir' : '-'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
          
          ${responsaveis && responsaveis.length > 0 ? `
          <div class="section">
            <div class="section-title">Responsáveis</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Telefone</th>
                </tr>
              </thead>
              <tbody>
                ${responsaveis.map((r: any) => `
                <tr>
                  <td>${r.nome}</td>
                  <td>${r.cargo || '-'}</td>
                  <td>${r.telefone || '-'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
          
          ${ordem.latitude && ordem.longitude ? `
          <div class="section">
            <div class="section-title">Localização</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Coordenadas</div>
                <div class="info-value">${ordem.latitude}, ${ordem.longitude}</div>
              </div>
              ${ordem.endereco ? `
              <div class="info-item">
                <div class="info-label">Endereço</div>
                <div class="info-value">${ordem.endereco}</div>
              </div>` : ''}
            </div>
          </div>` : ''}
          
          <div class="footer">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p>App Síndico - Plataforma Digital para Condomínios</p>
          </div>
        </body>
        </html>
      `;
      
      // Retornar HTML para impressão/PDF
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

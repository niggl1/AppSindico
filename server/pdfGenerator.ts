import puppeteer from "puppeteer";

interface RevistaData {
  titulo: string;
  subtitulo?: string;
  edicao: string;
  condominioNome: string;
  condominioLogo?: string;
  mensagemSindico?: {
    titulo: string;
    mensagem: string;
    nomeSindico: string;
    fotoSindico?: string;
    assinatura?: string;
  };
  avisos?: Array<{
    titulo: string;
    conteudo: string;
    tipo: string;
  }>;
  eventos?: Array<{
    titulo: string;
    descricao?: string;
    dataEvento: string;
    horario?: string;
    local?: string;
  }>;
  funcionarios?: Array<{
    nome: string;
    cargo: string;
    turno?: string;
    fotoUrl?: string;
  }>;
  telefones?: Array<{
    nome: string;
    numero: string;
  }>;
  anunciantes?: Array<{
    nome: string;
    descricao?: string;
    categoria: string;
    telefone?: string;
    whatsapp?: string;
    logoUrl?: string;
  }>;
}

function generateHTML(revista: RevistaData): string {
  const tipoColors: Record<string, string> = {
    informativo: "#3b82f6",
    importante: "#f59e0b",
    urgente: "#ef4444",
  };

  const categoriaColors: Record<string, string> = {
    comercio: "#3b82f6",
    servicos: "#22c55e",
    profissionais: "#a855f7",
    alimentacao: "#f97316",
    saude: "#ef4444",
    educacao: "#eab308",
    outros: "#6b7280",
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${revista.titulo} - ${revista.edicao}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      page-break-after: always;
      background: white;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0fdf4 100%);
    }
    
    .cover-logo {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    
    .cover-logo img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .cover-edition {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    
    .cover-subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
    }
    
    .cover-divider {
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, #0d9488, #0891b2);
      border-radius: 2px;
      margin-bottom: 40px;
    }
    
    .cover-footer {
      font-size: 14px;
      color: #888;
    }
    
    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .section-badge {
      display: inline-block;
      padding: 8px 20px;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      color: #0891b2;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    /* Mensagem do Síndico */
    .sindico-container {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }
    
    .sindico-photo {
      width: 120px;
      height: 120px;
      border-radius: 60px;
      background: #e5e7eb;
      overflow: hidden;
      flex-shrink: 0;
      border: 4px solid #0d9488;
    }
    
    .sindico-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .sindico-content {
      flex: 1;
    }
    
    .sindico-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1a1a1a;
    }
    
    .sindico-message {
      font-size: 14px;
      line-height: 1.8;
      color: #444;
      margin-bottom: 20px;
    }
    
    .sindico-signature {
      font-style: italic;
      color: #666;
    }
    
    .sindico-name {
      font-weight: 600;
      color: #0d9488;
    }
    
    /* Avisos */
    .avisos-grid {
      display: grid;
      gap: 15px;
    }
    
    .aviso-card {
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid;
      background: #f9fafb;
    }
    
    .aviso-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .aviso-content {
      font-size: 14px;
      color: #555;
    }
    
    /* Eventos */
    .eventos-list {
      display: grid;
      gap: 15px;
    }
    
    .evento-card {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .evento-date {
      width: 60px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .evento-day {
      font-size: 28px;
      font-weight: 700;
      color: #0d9488;
    }
    
    .evento-month {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    
    .evento-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .evento-info p {
      font-size: 13px;
      color: #666;
    }
    
    /* Funcionários */
    .funcionarios-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .funcionario-card {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .funcionario-photo {
      width: 80px;
      height: 80px;
      border-radius: 40px;
      background: #e5e7eb;
      margin: 0 auto 15px;
      overflow: hidden;
    }
    
    .funcionario-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .funcionario-name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }
    
    .funcionario-cargo {
      font-size: 13px;
      color: #0d9488;
      margin-bottom: 3px;
    }
    
    .funcionario-turno {
      font-size: 12px;
      color: #888;
    }
    
    /* Telefones */
    .telefones-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .telefone-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .telefone-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d9488, #0891b2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }
    
    .telefone-info h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 3px;
    }
    
    .telefone-info p {
      font-size: 13px;
      color: #0d9488;
      font-weight: 500;
    }
    
    /* Anunciantes */
    .anunciantes-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .anunciante-card {
      padding: 20px;
      border-radius: 12px;
      border: 2px solid;
    }
    
    .anunciante-header {
      display: flex;
      gap: 15px;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    
    .anunciante-logo {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      background: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .anunciante-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }
    
    .anunciante-name {
      font-weight: 600;
      font-size: 14px;
    }
    
    .anunciante-categoria {
      font-size: 11px;
      opacity: 0.8;
    }
    
    .anunciante-desc {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    
    .anunciante-contact {
      font-size: 11px;
      opacity: 0.8;
    }
    
    /* Back Cover */
    .back-cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0fdf4 100%);
    }
    
    .back-cover-icon {
      width: 60px;
      height: 60px;
      border-radius: 15px;
      background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      color: white;
      font-size: 24px;
    }
    
    .back-cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 15px;
    }
    
    .back-cover-message {
      font-size: 16px;
      color: #666;
      margin-bottom: 40px;
    }
    
    .back-cover-footer {
      font-size: 12px;
      color: #888;
    }
    
    @media print {
      .page {
        margin: 0;
        padding: 15mm;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    <div class="cover-logo">
      ${revista.condominioLogo ? `<img src="${revista.condominioLogo}" alt="Logo">` : revista.condominioNome.charAt(0)}
    </div>
    <div class="cover-edition">${revista.edicao}</div>
    <h1 class="cover-title">${revista.condominioNome}</h1>
    <p class="cover-subtitle">${revista.subtitulo || "Informativo Digital"}</p>
    <div class="cover-divider"></div>
    <p class="cover-footer">Revista Digital para Condomínios</p>
  </div>

  ${revista.mensagemSindico ? `
  <!-- Mensagem do Síndico -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">📋 Palavra do Síndico</div>
      <h2 class="section-title">${revista.mensagemSindico.titulo}</h2>
    </div>
    <div class="sindico-container">
      <div class="sindico-photo">
        ${revista.mensagemSindico.fotoSindico ? `<img src="${revista.mensagemSindico.fotoSindico}" alt="Síndico">` : ''}
      </div>
      <div class="sindico-content">
        <p class="sindico-message">${revista.mensagemSindico.mensagem}</p>
        <p class="sindico-signature">
          ${revista.mensagemSindico.assinatura || "Atenciosamente,"}<br>
          <span class="sindico-name">${revista.mensagemSindico.nomeSindico}</span><br>
          Síndico
        </p>
      </div>
    </div>
  </div>
  ` : ''}

  ${revista.avisos && revista.avisos.length > 0 ? `
  <!-- Avisos -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">📢 Comunicados</div>
      <h2 class="section-title">Avisos Importantes</h2>
    </div>
    <div class="avisos-grid">
      ${revista.avisos.map(aviso => `
        <div class="aviso-card" style="border-color: ${tipoColors[aviso.tipo] || tipoColors.informativo}">
          <h3 class="aviso-title">${aviso.titulo}</h3>
          <p class="aviso-content">${aviso.conteudo}</p>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${revista.eventos && revista.eventos.length > 0 ? `
  <!-- Eventos -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">📅 Agenda</div>
      <h2 class="section-title">Próximos Eventos</h2>
    </div>
    <div class="eventos-list">
      ${revista.eventos.map(evento => {
        const data = new Date(evento.dataEvento);
        const dia = data.getDate();
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        return `
          <div class="evento-card">
            <div class="evento-date">
              <div class="evento-day">${dia}</div>
              <div class="evento-month">${mes}</div>
            </div>
            <div class="evento-info">
              <h3>${evento.titulo}</h3>
              <p>${evento.horario ? `${evento.horario} • ` : ''}${evento.local || ''}</p>
              ${evento.descricao ? `<p>${evento.descricao}</p>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  ${revista.funcionarios && revista.funcionarios.length > 0 ? `
  <!-- Funcionários -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">👥 Equipe</div>
      <h2 class="section-title">Nossa Equipe</h2>
    </div>
    <div class="funcionarios-grid">
      ${revista.funcionarios.map(func => `
        <div class="funcionario-card">
          <div class="funcionario-photo">
            ${func.fotoUrl ? `<img src="${func.fotoUrl}" alt="${func.nome}">` : ''}
          </div>
          <div class="funcionario-name">${func.nome}</div>
          <div class="funcionario-cargo">${func.cargo}</div>
          ${func.turno ? `<div class="funcionario-turno">${func.turno}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${revista.telefones && revista.telefones.length > 0 ? `
  <!-- Telefones -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">📞 Contatos</div>
      <h2 class="section-title">Telefones Úteis</h2>
    </div>
    <div class="telefones-grid">
      ${revista.telefones.map(tel => `
        <div class="telefone-card">
          <div class="telefone-icon">📞</div>
          <div class="telefone-info">
            <h4>${tel.nome}</h4>
            <p>${tel.numero}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${revista.anunciantes && revista.anunciantes.length > 0 ? `
  <!-- Anunciantes -->
  <div class="page">
    <div class="section-header">
      <div class="section-badge">⭐ Parceiros</div>
      <h2 class="section-title">Parceiros do Condomínio</h2>
    </div>
    <div class="anunciantes-grid">
      ${revista.anunciantes.map(anunciante => `
        <div class="anunciante-card" style="border-color: ${categoriaColors[anunciante.categoria] || categoriaColors.outros}; background: ${categoriaColors[anunciante.categoria]}15">
          <div class="anunciante-header">
            <div class="anunciante-logo">
              ${anunciante.logoUrl ? `<img src="${anunciante.logoUrl}" alt="${anunciante.nome}">` : anunciante.nome.charAt(0)}
            </div>
            <div>
              <div class="anunciante-name">${anunciante.nome}</div>
              <div class="anunciante-categoria">${anunciante.categoria}</div>
            </div>
          </div>
          ${anunciante.descricao ? `<p class="anunciante-desc">${anunciante.descricao}</p>` : ''}
          <div class="anunciante-contact">
            ${anunciante.telefone ? `📞 ${anunciante.telefone}` : ''}
            ${anunciante.whatsapp ? ` • WhatsApp: ${anunciante.whatsapp}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Back Cover -->
  <div class="page back-cover">
    <div class="back-cover-icon">📖</div>
    <h2 class="back-cover-title">Obrigado pela leitura!</h2>
    <p class="back-cover-message">Acompanhe nossas próximas edições</p>
    <div class="cover-divider"></div>
    <p class="back-cover-footer">
      ${revista.condominioNome}<br>
      ${revista.edicao}
    </p>
  </div>
</body>
</html>
  `;
}

export async function generateRevistaPDF(revista: RevistaData): Promise<Buffer> {
  const html = generateHTML(revista);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export type { RevistaData };

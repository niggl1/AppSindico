import puppeteer from "puppeteer";

interface ItemFuncaoRapida {
  tipo: "checklist" | "manutencao" | "ocorrencia" | "vistoria";
  protocolo: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  status: string;
  prioridade?: string | null;
  responsavelNome?: string | null;
  localizacao?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  enderecoGeo?: string | null;
  createdAt: Date;
  // Campos específicos por tipo
  dataAgendada?: Date | null;
  dataRealizada?: Date | null;
  dataOcorrencia?: Date | null;
  categoria?: string | null;
  tipo_manutencao?: string | null;
  tempoEstimadoDias?: number | null;
  tempoEstimadoHoras?: number | null;
  tempoEstimadoMinutos?: number | null;
  fornecedor?: string | null;
  totalItens?: number | null;
  itensCompletos?: number | null;
  // Imagens
  imagens?: Array<{ url: string; legenda?: string | null }>;
  // Condomínio
  condominioNome: string;
  condominioLogo?: string | null;
  // Cabeçalho e Rodapé personalizados
  cabecalhoLogoUrl?: string | null;
  cabecalhoNomeCondominio?: string | null;
  cabecalhoNomeSindico?: string | null;
  rodapeTexto?: string | null;
  rodapeContato?: string | null;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    checklist: "Checklist",
    manutencao: "Manutenção",
    ocorrencia: "Ocorrência",
    vistoria: "Vistoria",
  };
  return labels[tipo] || tipo;
}

function getTipoColor(tipo: string): string {
  const colors: Record<string, string> = {
    checklist: "#3b82f6",
    manutencao: "#f97316",
    ocorrencia: "#ef4444",
    vistoria: "#22c55e",
  };
  return colors[tipo] || "#6b7280";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    realizada: "Realizada",
    acao_necessaria: "Ação Necessária",
    finalizada: "Finalizada",
    reaberta: "Reaberta",
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pendente: "#eab308",
    realizada: "#22c55e",
    acao_necessaria: "#ef4444",
    finalizada: "#22c55e",
    reaberta: "#f97316",
  };
  return colors[status] || "#6b7280";
}

function getPrioridadeLabel(prioridade: string | null | undefined): string {
  if (!prioridade) return "Média";
  const labels: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };
  return labels[prioridade] || prioridade;
}

function getPrioridadeColor(prioridade: string | null | undefined): string {
  if (!prioridade) return "#6b7280";
  const colors: Record<string, string> = {
    baixa: "#22c55e",
    media: "#3b82f6",
    alta: "#f97316",
    urgente: "#ef4444",
  };
  return colors[prioridade] || "#6b7280";
}

function generateHTML(item: ItemFuncaoRapida): string {
  const tipoColor = getTipoColor(item.tipo);
  const statusColor = getStatusColor(item.status);
  const prioridadeColor = getPrioridadeColor(item.prioridade);
  
  // Gerar URL do mapa estático se tiver coordenadas
  const mapUrl = item.latitude && item.longitude
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${item.latitude},${item.longitude}&zoom=16&size=600x300&markers=color:red%7C${item.latitude},${item.longitude}&key=AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik`
    : null;
  
  // Fallback para OpenStreetMap se não tiver API key do Google
  const osmMapUrl = item.latitude && item.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(item.longitude) - 0.005},${parseFloat(item.latitude) - 0.003},${parseFloat(item.longitude) + 0.005},${parseFloat(item.latitude) + 0.003}&layer=mapnik&marker=${item.latitude},${item.longitude}`
    : null;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getTipoLabel(item.tipo)} - ${item.protocolo}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
      background: #f9fafb;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${tipoColor}, ${tipoColor}dd);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    
    .logo img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      border-radius: 8px;
    }
    
    .header-info h1 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .header-info p {
      font-size: 12px;
      color: #6b7280;
    }
    
    .header-right {
      text-align: right;
    }
    
    .protocolo {
      font-size: 14px;
      font-weight: 600;
      color: ${tipoColor};
      margin-bottom: 5px;
    }
    
    .data-criacao {
      font-size: 11px;
      color: #6b7280;
    }
    
    /* Title Section */
    .title-section {
      margin-bottom: 25px;
    }
    
    .tipo-badge {
      display: inline-block;
      padding: 6px 16px;
      background: ${tipoColor}15;
      color: ${tipoColor};
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .titulo {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .subtitulo {
      font-size: 14px;
      color: #6b7280;
    }
    
    /* Status Row */
    .status-row {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #f9fafb;
      border-radius: 10px;
    }
    
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .status-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    .status-value {
      font-size: 13px;
      font-weight: 600;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .info-card {
      padding: 15px;
      background: #f9fafb;
      border-radius: 10px;
    }
    
    .info-card.full-width {
      grid-column: span 2;
    }
    
    .info-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    
    .info-value.empty {
      color: #9ca3af;
      font-style: italic;
    }
    
    /* Description */
    .description-section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .description-text {
      font-size: 13px;
      color: #374151;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    
    /* Location Section */
    .location-section {
      margin-bottom: 25px;
    }
    
    .location-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .location-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    }
    
    .location-info h3 {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .location-info p {
      font-size: 12px;
      color: #6b7280;
    }
    
    .location-address {
      font-size: 13px;
      color: #374151;
      margin-bottom: 15px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    
    .location-coords {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 15px;
    }
    
    .map-container {
      width: 100%;
      height: 200px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    .map-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .map-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    /* Images Section */
    .images-section {
      margin-bottom: 25px;
    }
    
    .images-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    
    .image-item {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    .image-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
    
    .image-legenda {
      font-size: 10px;
      color: #6b7280;
      padding: 5px;
      text-align: center;
      background: #f9fafb;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-text {
      font-size: 11px;
      color: #9ca3af;
    }
    
    .footer-qr {
      margin-top: 10px;
      font-size: 10px;
      color: #6b7280;
    }
    
    @media print {
      body {
        background: white;
      }
      .page {
        margin: 0;
        padding: 10mm;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header Personalizado -->
    <div class="header">
      <div class="header-left">
        ${(item.cabecalhoLogoUrl || item.condominioLogo) ? `
        <div class="logo">
          <img src="${item.cabecalhoLogoUrl || item.condominioLogo}" alt="Logo" />
        </div>
        ` : `
        <div class="logo">
          ${getTipoLabel(item.tipo).charAt(0)}
        </div>
        `}
        <div class="header-info">
          <h1>${item.cabecalhoNomeCondominio || item.condominioNome}</h1>
          ${item.cabecalhoNomeSindico ? `<p>Síndico: ${item.cabecalhoNomeSindico}</p>` : `<p>Relatório de ${getTipoLabel(item.tipo)}</p>`}
        </div>
      </div>
      <div class="header-right">
        <div class="protocolo">${item.protocolo}</div>
        <div class="data-criacao">Criado em ${formatDate(item.createdAt)}</div>
      </div>
    </div>
    
    <!-- Title Section -->
    <div class="title-section">
      <span class="tipo-badge">${getTipoLabel(item.tipo)}</span>
      <h2 class="titulo">${item.titulo}</h2>
      ${item.subtitulo ? `<p class="subtitulo">${item.subtitulo}</p>` : ''}
    </div>
    
    <!-- Status Row -->
    <div class="status-row">
      <div class="status-item">
        <div class="status-dot" style="background: ${statusColor}"></div>
        <div>
          <div class="status-label">Status</div>
          <div class="status-value" style="color: ${statusColor}">${getStatusLabel(item.status)}</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-dot" style="background: ${prioridadeColor}"></div>
        <div>
          <div class="status-label">Prioridade</div>
          <div class="status-value" style="color: ${prioridadeColor}">${getPrioridadeLabel(item.prioridade)}</div>
        </div>
      </div>
      ${item.categoria ? `
      <div class="status-item">
        <div class="status-dot" style="background: #6b7280"></div>
        <div>
          <div class="status-label">Categoria</div>
          <div class="status-value">${item.categoria}</div>
        </div>
      </div>
      ` : ''}
    </div>
    
    <!-- Info Grid -->
    <div class="info-grid">
      ${item.responsavelNome ? `
      <div class="info-card">
        <div class="info-label">Responsável</div>
        <div class="info-value">${item.responsavelNome}</div>
      </div>
      ` : ''}
      
      ${item.localizacao ? `
      <div class="info-card">
        <div class="info-label">Localização</div>
        <div class="info-value">${item.localizacao}</div>
      </div>
      ` : ''}
      
      ${(item.latitude && item.longitude) ? `
      <div class="info-card" style="grid-column: span 2;">
        <div class="info-label">📍 Localização GPS (Clique para abrir no mapa)</div>
        <div class="info-value">
          <a href="https://www.google.com/maps?q=${item.latitude},${item.longitude}" 
             target="_blank" 
             style="color: #2563eb; text-decoration: underline; font-weight: 500;">
            Ver no Google Maps →
          </a>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            Coordenadas: ${item.latitude}, ${item.longitude}
          </div>
          ${item.enderecoGeo ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">Endereço: ${item.enderecoGeo}</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${item.dataAgendada ? `
      <div class="info-card">
        <div class="info-label">Data Agendada</div>
        <div class="info-value">${formatDateShort(item.dataAgendada)}</div>
      </div>
      ` : ''}
      
      ${item.dataRealizada ? `
      <div class="info-card">
        <div class="info-label">Data Realizada</div>
        <div class="info-value">${formatDateShort(item.dataRealizada)}</div>
      </div>
      ` : ''}
      
      ${item.dataOcorrencia ? `
      <div class="info-card">
        <div class="info-label">Data da Ocorrência</div>
        <div class="info-value">${formatDate(item.dataOcorrencia)}</div>
      </div>
      ` : ''}
      
      ${item.tipo_manutencao ? `
      <div class="info-card">
        <div class="info-label">Tipo de Manutenção</div>
        <div class="info-value">${item.tipo_manutencao}</div>
      </div>
      ` : ''}
      
      ${item.fornecedor ? `
      <div class="info-card">
        <div class="info-label">Fornecedor</div>
        <div class="info-value">${item.fornecedor}</div>
      </div>
      ` : ''}
      
      ${(item.tempoEstimadoDias || item.tempoEstimadoHoras || item.tempoEstimadoMinutos) ? `
      <div class="info-card">
        <div class="info-label">Tempo Estimado</div>
        <div class="info-value">${item.tempoEstimadoDias ? `${item.tempoEstimadoDias}d ` : ''}${item.tempoEstimadoHoras ? `${item.tempoEstimadoHoras}h ` : ''}${item.tempoEstimadoMinutos ? `${item.tempoEstimadoMinutos}min` : ''}</div>
      </div>
      ` : ''}
      
      ${item.totalItens !== null && item.totalItens !== undefined ? `
      <div class="info-card">
        <div class="info-label">Progresso do Checklist</div>
        <div class="info-value">${item.itensCompletos || 0} de ${item.totalItens} itens</div>
      </div>
      ` : ''}
    </div>
    
    <!-- Description -->
    ${item.descricao ? `
    <div class="description-section">
      <h3 class="section-title">Descrição</h3>
      <p class="description-text">${item.descricao}</p>
    </div>
    ` : ''}
    
    <!-- Observations -->
    ${item.observacoes ? `
    <div class="description-section">
      <h3 class="section-title">Observações</h3>
      <p class="description-text">${item.observacoes}</p>
    </div>
    ` : ''}
    
    <!-- Location Section with Map -->
    ${item.latitude && item.longitude ? `
    <div class="location-section">
      <h3 class="section-title">Localização Geográfica</h3>
      <div class="location-header">
        <div class="location-icon">📍</div>
        <div class="location-info">
          <h3>Coordenadas GPS</h3>
          <p>Capturadas no momento do registo</p>
        </div>
      </div>
      ${item.enderecoGeo ? `
      <div class="location-address">
        <strong>Endereço:</strong> ${item.enderecoGeo}
      </div>
      ` : ''}
      <div class="location-coords">
        <strong>Latitude:</strong> ${item.latitude} | <strong>Longitude:</strong> ${item.longitude}
      </div>
      <div class="map-container">
        <iframe src="${osmMapUrl}" loading="lazy"></iframe>
      </div>
    </div>
    ` : ''}
    
    <!-- Images -->
    ${item.imagens && item.imagens.length > 0 ? `
    <div class="images-section">
      <h3 class="section-title">Imagens (${item.imagens.length})</h3>
      <div class="images-grid">
        ${item.imagens.map(img => `
          <div class="image-item">
            <img src="${img.url}" alt="${img.legenda || 'Imagem'}" />
            ${img.legenda ? `<div class="image-legenda">${img.legenda}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <!-- Footer Personalizado -->
    <div class="footer">
      <p class="footer-text">
        ${item.rodapeTexto || 'Documento gerado automaticamente pelo sistema'}<br>
        ${item.rodapeContato ? `${item.rodapeContato}<br>` : ''}
        ${item.cabecalhoNomeCondominio || item.condominioNome} • ${formatDate(new Date())}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function generateFuncaoRapidaPDF(item: ItemFuncaoRapida): Promise<Buffer> {
  const html = generateHTML(item);
  
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

export type { ItemFuncaoRapida };

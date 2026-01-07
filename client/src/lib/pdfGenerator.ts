// Utilitário para geração de PDF usando a API do navegador
// Usa window.print() com estilos específicos para impressão

interface PDFOptions {
  title: string;
  subtitle?: string;
  protocolo?: string;
  data?: string;
}

export function generatePrintableHTML(content: string, options: PDFOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
        }
        .header {
          border-bottom: 2px solid #0d9488;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0d9488;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header .subtitle {
          color: #666;
          font-size: 14px;
        }
        .header .meta {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          font-size: 12px;
          color: #888;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #0d9488;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .info-item {
          padding: 10px;
          background: #f9fafb;
          border-radius: 4px;
        }
        .info-item label {
          display: block;
          font-size: 11px;
          color: #888;
          margin-bottom: 3px;
          text-transform: uppercase;
        }
        .info-item span {
          font-size: 14px;
          color: #333;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-pendente { background: #fef3c7; color: #92400e; }
        .status-realizada { background: #dbeafe; color: #1e40af; }
        .status-acao_necessaria { background: #fee2e2; color: #991b1b; }
        .status-finalizada { background: #d1fae5; color: #065f46; }
        .status-reaberta { background: #ffedd5; color: #9a3412; }
        .timeline {
          margin-top: 20px;
        }
        .timeline-item {
          position: relative;
          padding-left: 25px;
          padding-bottom: 15px;
          border-left: 2px solid #e5e7eb;
        }
        .timeline-item:last-child {
          border-left: 2px solid transparent;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0d9488;
        }
        .timeline-date {
          font-size: 11px;
          color: #888;
        }
        .timeline-desc {
          font-size: 13px;
          margin-top: 3px;
        }
        .images-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        .images-grid img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
        }
        .checklist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
          margin-bottom: 5px;
        }
        .checklist-item.complete {
          text-decoration: line-through;
          color: #888;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 3px;
        }
        .checkbox.checked {
          background: #0d9488;
          border-color: #0d9488;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #888;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${options.title}</h1>
        ${options.subtitle ? `<p class="subtitle">${options.subtitle}</p>` : ''}
        <div class="meta">
          ${options.protocolo ? `<span>Protocolo: ${options.protocolo}</span>` : ''}
          <span>Data: ${options.data || new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
      ${content}
      <div class="footer">
        <p>Documento gerado automaticamente pelo sistema Revista Digital</p>
        <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
}

export function openPrintWindow(html: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

// Formatar status para exibição
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    realizada: 'Realizada',
    acao_necessaria: 'Ação Necessária',
    finalizada: 'Finalizada',
    reaberta: 'Reaberta',
  };
  return statusMap[status] || status;
}

// Formatar prioridade para exibição
export function formatPrioridade(prioridade: string): string {
  const prioridadeMap: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return prioridadeMap[prioridade] || prioridade;
}

// Formatar data
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Gerar conteúdo de informações básicas
export function generateInfoSection(data: Record<string, any>): string {
  const items = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `
      <div class="info-item">
        <label>${key}</label>
        <span>${value}</span>
      </div>
    `)
    .join('');
  
  return `<div class="info-grid">${items}</div>`;
}

// Gerar timeline HTML
export function generateTimelineHTML(events: any[]): string {
  if (events.length === 0) return '<p>Nenhum evento registrado</p>';
  
  return `
    <div class="timeline">
      ${events.map(event => `
        <div class="timeline-item">
          <div class="timeline-date">${formatDateTime(event.createdAt)}</div>
          <div class="timeline-desc">${event.descricao}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Gerar galeria de imagens HTML
export function generateImagesHTML(images: { url: string }[]): string {
  if (images.length === 0) return '<p>Nenhuma imagem</p>';
  
  return `
    <div class="images-grid">
      ${images.map(img => `<img src="${img.url}" alt="Imagem" />`).join('')}
    </div>
  `;
}

// Gerar URL do mapa estático OpenStreetMap
export function getStaticMapUrl(latitude: number, longitude: number, zoom: number = 16): string {
  // Usa OpenStreetMap Static Maps API (gratuito)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=400x200&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;
}

// Gerar seção de localização com mapa para PDF
export function generateLocationSection(data: {
  latitude?: number | null;
  longitude?: number | null;
  endereco?: string | null;
}): string {
  if (!data.latitude || !data.longitude) {
    return '';
  }
  
  const mapUrl = getStaticMapUrl(data.latitude, data.longitude);
  const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}`;
  
  return `
    <div class="section">
      <h2 class="section-title">📍 Localização GPS</h2>
      <div style="display: flex; gap: 20px; align-items: flex-start;">
        <div style="flex: 1;">
          <img src="${mapUrl}" alt="Mapa da localização" style="width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid #e5e7eb;" />
        </div>
        <div style="flex: 1;">
          <div class="info-item" style="margin-bottom: 10px;">
            <label>Coordenadas</label>
            <span>${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}</span>
          </div>
          ${data.endereco ? `
            <div class="info-item" style="margin-bottom: 10px;">
              <label>Endereço</label>
              <span>${data.endereco}</span>
            </div>
          ` : ''}
          <div style="margin-top: 15px; font-size: 12px;">
            <p style="margin-bottom: 5px;"><strong>Ver no mapa:</strong></p>
            <p><a href="${googleMapsUrl}" target="_blank" style="color: #0d9488; text-decoration: underline;">Abrir no Google Maps</a></p>
            <p><a href="${osmUrl}" target="_blank" style="color: #0d9488; text-decoration: underline;">Abrir no OpenStreetMap</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Gerar checklist HTML
export function generateChecklistHTML(items: { descricao: string; completo: boolean | null }[]): string {
  if (items.length === 0) return '<p>Nenhum item</p>';
  
  return items.map(item => `
    <div class="checklist-item ${item.completo ? 'complete' : ''}">
      <div class="checkbox ${item.completo ? 'checked' : ''}"></div>
      <span>${item.descricao}</span>
    </div>
  `).join('');
}

// Gerar relatório completo de vistoria
export function generateVistoriaReport(vistoria: any, timeline: any[], imagens: any[]): void {
  const content = `
    <div class="section">
      <h2 class="section-title">Informações Gerais</h2>
      ${generateInfoSection({
        'Status': `<span class="status-badge status-${vistoria.status}">${formatStatus(vistoria.status)}</span>`,
        'Prioridade': formatPrioridade(vistoria.prioridade || 'media'),
        'Responsável': vistoria.responsavelNome || '-',
        'Localização': vistoria.localizacao || '-',
        'Tipo': vistoria.tipo || '-',
        'Data Agendada': formatDateTime(vistoria.dataAgendada),
        'Data Realizada': formatDateTime(vistoria.dataRealizada),
        'Criado em': formatDateTime(vistoria.createdAt),
      })}
    </div>
    
    ${vistoria.descricao ? `
      <div class="section">
        <h2 class="section-title">Descrição</h2>
        <p>${vistoria.descricao}</p>
      </div>
    ` : ''}
    
    ${vistoria.observacoes ? `
      <div class="section">
        <h2 class="section-title">Observações</h2>
        <p>${vistoria.observacoes}</p>
      </div>
    ` : ''}
    
    ${generateLocationSection({
      latitude: vistoria.latitude,
      longitude: vistoria.longitude,
      endereco: vistoria.endereco,
    })}
    
    <div class="section">
      <h2 class="section-title">Galeria de Imagens</h2>
      ${generateImagesHTML(imagens)}
    </div>
    
    <div class="section">
      <h2 class="section-title">Timeline de Eventos</h2>
      ${generateTimelineHTML(timeline)}
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: vistoria.titulo,
    subtitle: vistoria.subtitulo,
    protocolo: vistoria.protocolo,
  });
  
  openPrintWindow(html);
}

// Gerar relatório completo de manutenção
export function generateManutencaoReport(manutencao: any, timeline: any[], imagens: any[]): void {
  const content = `
    <div class="section">
      <h2 class="section-title">Informações Gerais</h2>
      ${generateInfoSection({
        'Status': `<span class="status-badge status-${manutencao.status}">${formatStatus(manutencao.status)}</span>`,
        'Tipo': manutencao.tipo || '-',
        'Prioridade': formatPrioridade(manutencao.prioridade || 'media'),
        'Responsável': manutencao.responsavelNome || '-',
        'Localização': manutencao.localizacao || '-',
        'Fornecedor': manutencao.fornecedor || '-',
        'Custo Estimado': manutencao.custoEstimado ? `R$ ${manutencao.custoEstimado}` : '-',
        'Custo Real': manutencao.custoReal ? `R$ ${manutencao.custoReal}` : '-',
        'Data Agendada': formatDateTime(manutencao.dataAgendada),
        'Data Realizada': formatDateTime(manutencao.dataRealizada),
      })}
    </div>
    
    ${manutencao.descricao ? `
      <div class="section">
        <h2 class="section-title">Descrição</h2>
        <p>${manutencao.descricao}</p>
      </div>
    ` : ''}
    
    ${generateLocationSection({
      latitude: manutencao.latitude,
      longitude: manutencao.longitude,
      endereco: manutencao.endereco,
    })}
    
    <div class="section">
      <h2 class="section-title">Galeria de Imagens</h2>
      ${generateImagesHTML(imagens)}
    </div>
    
    <div class="section">
      <h2 class="section-title">Timeline de Eventos</h2>
      ${generateTimelineHTML(timeline)}
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: manutencao.titulo,
    subtitle: manutencao.subtitulo,
    protocolo: manutencao.protocolo,
  });
  
  openPrintWindow(html);
}

// Gerar relatório completo de ocorrência
export function generateOcorrenciaReport(ocorrencia: any, timeline: any[], imagens: any[]): void {
  const categoriaLabels: Record<string, string> = {
    seguranca: 'Segurança',
    barulho: 'Barulho',
    manutencao: 'Manutenção',
    convivencia: 'Convivência',
    animais: 'Animais',
    estacionamento: 'Estacionamento',
    limpeza: 'Limpeza',
    outros: 'Outros',
  };
  
  const content = `
    <div class="section">
      <h2 class="section-title">Informações Gerais</h2>
      ${generateInfoSection({
        'Status': `<span class="status-badge status-${ocorrencia.status}">${formatStatus(ocorrencia.status)}</span>`,
        'Categoria': categoriaLabels[ocorrencia.categoria] || ocorrencia.categoria || '-',
        'Prioridade': formatPrioridade(ocorrencia.prioridade || 'media'),
        'Reportado por': ocorrencia.reportadoPorNome || '-',
        'Responsável': ocorrencia.responsavelNome || '-',
        'Localização': ocorrencia.localizacao || '-',
        'Data da Ocorrência': formatDateTime(ocorrencia.dataOcorrencia),
        'Registrado em': formatDateTime(ocorrencia.createdAt),
      })}
    </div>
    
    ${ocorrencia.descricao ? `
      <div class="section">
        <h2 class="section-title">Descrição</h2>
        <p>${ocorrencia.descricao}</p>
      </div>
    ` : ''}
    
    ${generateLocationSection({
      latitude: ocorrencia.latitude,
      longitude: ocorrencia.longitude,
      endereco: ocorrencia.endereco,
    })}
    
    <div class="section">
      <h2 class="section-title">Evidências</h2>
      ${generateImagesHTML(imagens)}
    </div>
    
    <div class="section">
      <h2 class="section-title">Timeline de Eventos</h2>
      ${generateTimelineHTML(timeline)}
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: ocorrencia.titulo,
    subtitle: ocorrencia.subtitulo,
    protocolo: ocorrencia.protocolo,
  });
  
  openPrintWindow(html);
}

// Gerar relatório completo de checklist
export function generateChecklistReport(checklist: any, timeline: any[], imagens: any[], itens: any[]): void {
  const totalItens = itens.length;
  const itensCompletos = itens.filter(i => i.completo).length;
  const progresso = totalItens > 0 ? Math.round((itensCompletos / totalItens) * 100) : 0;
  
  const content = `
    <div class="section">
      <h2 class="section-title">Informações Gerais</h2>
      ${generateInfoSection({
        'Status': `<span class="status-badge status-${checklist.status}">${formatStatus(checklist.status)}</span>`,
        'Progresso': `${progresso}% (${itensCompletos}/${totalItens} itens)`,
        'Prioridade': formatPrioridade(checklist.prioridade || 'media'),
        'Responsável': checklist.responsavelNome || '-',
        'Localização': checklist.localizacao || '-',
        'Data Agendada': formatDateTime(checklist.dataAgendada),
        'Data Realizada': formatDateTime(checklist.dataRealizada),
      })}
    </div>
    
    ${checklist.descricao ? `
      <div class="section">
        <h2 class="section-title">Descrição</h2>
        <p>${checklist.descricao}</p>
      </div>
    ` : ''}
    
    ${generateLocationSection({
      latitude: checklist.latitude,
      longitude: checklist.longitude,
      endereco: checklist.endereco,
    })}
    
    <div class="section">
      <h2 class="section-title">Itens do Checklist</h2>
      ${generateChecklistHTML(itens)}
    </div>
    
    <div class="section">
      <h2 class="section-title">Imagens</h2>
      ${generateImagesHTML(imagens)}
    </div>
    
    <div class="section">
      <h2 class="section-title">Timeline de Eventos</h2>
      ${generateTimelineHTML(timeline)}
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: checklist.titulo,
    subtitle: checklist.subtitulo,
    protocolo: checklist.protocolo,
  });
  
  openPrintWindow(html);
}

// Gerar relatório resumido (lista)
export function generateListReport(
  title: string,
  items: any[],
  columns: { key: string; label: string; format?: (value: any) => string }[]
): void {
  const tableHeaders = columns.map(col => `<th>${col.label}</th>`).join('');
  const tableRows = items.map(item => {
    const cells = columns.map(col => {
      const value = item[col.key];
      const formatted = col.format ? col.format(value) : (value || '-');
      return `<td>${formatted}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  const content = `
    <div class="section">
      <h2 class="section-title">Resumo (${items.length} registros)</h2>
      <table>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title,
    data: new Date().toLocaleDateString('pt-BR'),
  });
  
  openPrintWindow(html);
}


// Gerar relatório de Antes e Depois
export function generateAntesDepoisReport(item: any): void {
  const content = `
    <div class="section">
      <h2 class="section-title">Informações</h2>
      ${generateInfoSection({
        'Título': item.titulo || '-',
        'Descrição': item.descricao || '-',
        'Data de Criação': formatDateTime(item.createdAt),
      })}
    </div>
    
    ${generateLocationSection({
      latitude: item.latitude,
      longitude: item.longitude,
      endereco: item.endereco,
    })}
    
    <div class="section">
      <h2 class="section-title">Comparativo Visual</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="text-align: center;">
          <h3 style="color: #dc2626; margin-bottom: 10px; font-size: 14px;">ANTES</h3>
          ${item.fotoAntesUrl 
            ? `<img src="${item.fotoAntesUrl}" alt="Antes" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #dc2626;" />`
            : '<div style="background: #f3f4f6; padding: 40px; border-radius: 8px; color: #9ca3af;">Sem imagem</div>'
          }
        </div>
        <div style="text-align: center;">
          <h3 style="color: #16a34a; margin-bottom: 10px; font-size: 14px;">DEPOIS</h3>
          ${item.fotoDepoisUrl 
            ? `<img src="${item.fotoDepoisUrl}" alt="Depois" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #16a34a;" />`
            : '<div style="background: #f3f4f6; padding: 40px; border-radius: 8px; color: #9ca3af;">Sem imagem</div>'
          }
        </div>
      </div>
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: item.titulo || 'Antes e Depois',
    subtitle: 'Registro de Transformação',
    data: new Date().toLocaleDateString('pt-BR'),
  });
  
  openPrintWindow(html);
}

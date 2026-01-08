import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface RevistaData {
  titulo: string;
  subtitulo?: string;
  edicao: string;
  condominioNome: string;
  condominioLogo?: string;
  capaUrl?: string;
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
  // Novas secções
  comunicados?: Array<{
    titulo: string;
    conteudo: string;
    tipo: string;
    dataPublicacao?: string;
  }>;
  regras?: Array<{
    titulo: string;
    descricao: string;
    categoria?: string;
  }>;
  dicasSeguranca?: Array<{
    titulo: string;
    descricao: string;
    categoria?: string;
  }>;
  realizacoes?: Array<{
    titulo: string;
    descricao: string;
    dataRealizacao?: string;
    imagemUrl?: string;
  }>;
  melhorias?: Array<{
    titulo: string;
    descricao: string;
    status?: string;
    previsao?: string;
  }>;
  aquisicoes?: Array<{
    titulo: string;
    descricao: string;
    valor?: number;
    dataAquisicao?: string;
  }>;
  publicidade?: Array<{
    titulo: string;
    descricao?: string;
    imagemUrl?: string;
    link?: string;
  }>;
  galeria?: Array<{
    titulo: string;
    fotos: Array<{ url: string; legenda?: string }>;
  }>;
  classificados?: Array<{
    titulo: string;
    descricao: string;
    preco?: number;
    contato?: string;
    categoria?: string;
  }>;
  caronas?: Array<{
    origem: string;
    destino: string;
    horario?: string;
    diasSemana?: string;
    contato?: string;
  }>;
  achadosPerdidos?: Array<{
    titulo: string;
    descricao?: string;
    local?: string;
    tipo: string;
  }>;
}

// Paleta de cores premium
const colors = {
  primary: [79, 70, 229] as [number, number, number],      // Indigo
  secondary: [16, 185, 129] as [number, number, number],   // Emerald
  accent: [245, 158, 11] as [number, number, number],      // Amber
  danger: [239, 68, 68] as [number, number, number],       // Red
  success: [34, 197, 94] as [number, number, number],      // Green
  info: [59, 130, 246] as [number, number, number],        // Blue
  purple: [168, 85, 247] as [number, number, number],      // Purple
  pink: [236, 72, 153] as [number, number, number],        // Pink
  orange: [249, 115, 22] as [number, number, number],      // Orange
  teal: [20, 184, 166] as [number, number, number],        // Teal
  gray: [107, 114, 128] as [number, number, number],       // Gray
  dark: [31, 41, 55] as [number, number, number],          // Dark
  light: [249, 250, 251] as [number, number, number],      // Light
};

// Cores por tipo de aviso
const tipoColors: Record<string, [number, number, number]> = {
  informativo: colors.info,
  importante: colors.accent,
  urgente: colors.danger,
};

// Cores por categoria de anunciante
const categoriaColors: Record<string, [number, number, number]> = {
  comercio: colors.info,
  servicos: colors.success,
  profissionais: colors.purple,
  alimentacao: colors.orange,
  saude: colors.danger,
  educacao: colors.accent,
  outros: colors.gray,
};

export async function generateRevistaPDF(revista: RevistaData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;
  let currentPage = 1;
  const tocEntries: Array<{ title: string; page: number }> = [];

  // Função para adicionar cabeçalho e rodapé
  const addHeaderFooter = (pageNum: number, isFirstPage: boolean = false) => {
    if (isFirstPage) return;
    
    // Cabeçalho
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(revista.condominioNome, margin, 5.5);
    doc.text(revista.edicao, pageWidth - margin, 5.5, { align: 'right' });
    
    // Rodapé
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
    doc.text('App Síndico', pageWidth - margin, pageHeight - 4, { align: 'right' });
  };

  // Função auxiliar para adicionar nova página com controle de quebra
  const checkNewPage = (neededSpace: number, forceNewPage: boolean = false): boolean => {
    const availableSpace = pageHeight - margin - 15 - yPos; // 15 para rodapé
    if (forceNewPage || availableSpace < neededSpace) {
      doc.addPage();
      currentPage++;
      addHeaderFooter(currentPage);
      yPos = margin + 12; // Espaço após cabeçalho
      return true;
    }
    return false;
  };

  // Função para desenhar cabeçalho de seção premium
  const drawSectionHeader = (title: string, color: [number, number, number], icon?: string) => {
    checkNewPage(25);
    
    // Fundo do cabeçalho com gradiente simulado
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F');
    
    // Sombra sutil
    doc.setFillColor(color[0] * 0.8, color[1] * 0.8, color[2] * 0.8);
    doc.roundedRect(margin + 1, yPos + 1, contentWidth - 2, 12, 3, 3, 'F');
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F');
    
    // Texto
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 8, yPos + 8);
    
    // Linha decorativa
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(margin + 8, yPos + 10, margin + 50, yPos + 10);
    
    doc.setTextColor(0, 0, 0);
    yPos += 18;
    
    // Adicionar ao índice
    tocEntries.push({ title, page: currentPage });
  };

  // Função para desenhar card premium
  const drawPremiumCard = (
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    color: [number, number, number],
    filled: boolean = true
  ) => {
    // Sombra
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');
    
    // Card
    if (filled) {
      doc.setFillColor(color[0], color[1], color[2], 0.1);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');
  };

  // ==================== CAPA PREMIUM ====================
  // Fundo gradiente simulado (topo)
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight * 0.4, 'F');
  
  // Fundo gradiente simulado (transição)
  for (let i = 0; i < 20; i++) {
    const alpha = i / 20;
    const r = Math.round(colors.primary[0] * (1 - alpha) + 255 * alpha);
    const g = Math.round(colors.primary[1] * (1 - alpha) + 255 * alpha);
    const b = Math.round(colors.primary[2] * (1 - alpha) + 255 * alpha);
    doc.setFillColor(r, g, b);
    doc.rect(0, pageHeight * 0.4 + i * 3, pageWidth, 3, 'F');
  }
  
  // Elementos decorativos
  doc.setFillColor(255, 255, 255, 0.1);
  doc.circle(pageWidth - 30, 40, 50, 'F');
  doc.circle(30, pageHeight * 0.35, 30, 'F');
  
  // Edição no topo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`EDIÇÃO ${revista.edicao.toUpperCase()}`, pageWidth / 2, 25, { align: 'center' });
  
  // Linha decorativa
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 30, pageWidth / 2 + 30, 30);
  
  // Título da revista
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  const tituloLines = doc.splitTextToSize(revista.titulo, contentWidth - 20);
  let tituloY = 55;
  for (const line of tituloLines) {
    doc.text(line, pageWidth / 2, tituloY, { align: 'center' });
    tituloY += 12;
  }
  
  // Subtítulo
  if (revista.subtitulo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(revista.subtitulo, pageWidth / 2, tituloY + 5, { align: 'center' });
  }
  
  // Nome do condomínio (centro)
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(revista.condominioNome, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  // Linha decorativa central
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 40, pageHeight / 2 + 30, pageWidth / 2 + 40, pageHeight / 2 + 30);
  
  // Badge "Revista Digital"
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.roundedRect(pageWidth / 2 - 30, pageHeight - 60, 60, 10, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REVISTA DIGITAL', pageWidth / 2, pageHeight - 53, { align: 'center' });
  
  // Rodapé da capa
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text('Informativo Mensal do Condomínio', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ==================== ÍNDICE ====================
  doc.addPage();
  currentPage++;
  addHeaderFooter(currentPage);
  yPos = margin + 15;
  
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(margin, yPos, contentWidth, 15, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE', pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 25;
  
  // O índice será preenchido no final
  const tocStartPage = currentPage;
  const tocStartY = yPos;

  // ==================== MENSAGEM DO SÍNDICO ====================
  if (revista.mensagemSindico) {
    doc.addPage();
    currentPage++;
    addHeaderFooter(currentPage);
    yPos = margin + 15;
    
    drawSectionHeader('Mensagem do Síndico', colors.primary);
    
    // Card da mensagem
    drawPremiumCard(margin, yPos, contentWidth, 80, colors.primary, false);
    
    // Título da mensagem
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const msgTituloLines = doc.splitTextToSize(revista.mensagemSindico.titulo, contentWidth - 20);
    doc.text(msgTituloLines, margin + 10, yPos + 12);
    
    // Linha decorativa
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 10, yPos + 18, margin + 60, yPos + 18);
    
    // Conteúdo da mensagem
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    const msgLines = doc.splitTextToSize(revista.mensagemSindico.mensagem, contentWidth - 20);
    
    let msgY = yPos + 25;
    for (const line of msgLines) {
      if (msgY > yPos + 65) {
        // Continuar na próxima página se necessário
        yPos += 85;
        checkNewPage(80);
        drawPremiumCard(margin, yPos, contentWidth, 80, colors.primary, false);
        msgY = yPos + 10;
      }
      doc.text(line, margin + 10, msgY);
      msgY += 5;
    }
    
    yPos += 85;
    
    // Assinatura
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, yPos, contentWidth / 2, 25, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(revista.mensagemSindico.nomeSindico, margin + 10, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.text('Síndico', margin + 10, yPos + 17);
    
    if (revista.mensagemSindico.assinatura) {
      doc.text(revista.mensagemSindico.assinatura, margin + 10, yPos + 22);
    }
  }

  // ==================== AVISOS ====================
  if (revista.avisos && revista.avisos.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Avisos e Comunicados', colors.accent);
    
    for (const aviso of revista.avisos) {
      const avisoLines = doc.splitTextToSize(aviso.conteudo, contentWidth - 20);
      const boxHeight = Math.max(30, 20 + avisoLines.length * 5);
      
      checkNewPage(boxHeight + 10);
      
      const color = tipoColors[aviso.tipo] || tipoColors.informativo;
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, color);
      
      // Badge do tipo
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin + 5, yPos + 4, 28, 6, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(aviso.tipo.toUpperCase(), margin + 7, yPos + 8);
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(aviso.titulo, margin + 38, yPos + 9);
      
      // Conteúdo
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(avisoLines, margin + 10, yPos + 18);
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== COMUNICADOS ====================
  if (revista.comunicados && revista.comunicados.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Comunicados Oficiais', colors.info);
    
    for (const comunicado of revista.comunicados) {
      const comLines = doc.splitTextToSize(comunicado.conteudo, contentWidth - 20);
      const boxHeight = Math.max(35, 25 + comLines.length * 5);
      
      checkNewPage(boxHeight + 10);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.info);
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.info[0], colors.info[1], colors.info[2]);
      doc.text(comunicado.titulo, margin + 10, yPos + 10);
      
      // Data
      if (comunicado.dataPublicacao) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        const dataFormatada = new Date(comunicado.dataPublicacao).toLocaleDateString('pt-BR');
        doc.text(dataFormatada, pageWidth - margin - 10, yPos + 10, { align: 'right' });
      }
      
      // Conteúdo
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(comLines, margin + 10, yPos + 18);
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== EVENTOS ====================
  if (revista.eventos && revista.eventos.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Próximos Eventos', colors.success);
    
    for (const evento of revista.eventos) {
      const descLines = evento.descricao ? doc.splitTextToSize(evento.descricao, contentWidth - 55) : [];
      const boxHeight = Math.max(28, 20 + descLines.length * 5);
      
      checkNewPage(boxHeight + 10);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.success);
      
      // Data badge
      doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
      doc.roundedRect(margin + 5, yPos + 5, 40, 18, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const dataEvento = new Date(evento.dataEvento);
      doc.text(dataEvento.getDate().toString().padStart(2, '0'), margin + 25, yPos + 13, { align: 'center' });
      doc.setFontSize(8);
      doc.text(dataEvento.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(), margin + 25, yPos + 19, { align: 'center' });
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
      doc.text(evento.titulo, margin + 50, yPos + 12);
      
      // Horário e local
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      let infoText = '';
      if (evento.horario) infoText += `⏰ ${evento.horario}  `;
      if (evento.local) infoText += `📍 ${evento.local}`;
      if (infoText) doc.text(infoText, margin + 50, yPos + 18);
      
      // Descrição
      if (descLines.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(descLines, margin + 50, yPos + 24);
      }
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== EQUIPE ====================
  if (revista.funcionarios && revista.funcionarios.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Nossa Equipe', colors.purple);
    
    const colWidth = (contentWidth - 10) / 2;
    let col = 0;
    let rowY = yPos;
    
    for (const func of revista.funcionarios) {
      if (col === 2) {
        col = 0;
        rowY += 28;
      }
      
      checkNewPage(28);
      if (yPos !== rowY) rowY = yPos;
      
      const xPos = margin + col * (colWidth + 10);
      
      drawPremiumCard(xPos, rowY, colWidth, 24, colors.purple);
      
      // Nome
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      doc.text(func.nome, xPos + 8, rowY + 10);
      
      // Cargo
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.text(func.cargo, xPos + 8, rowY + 17);
      
      col++;
    }
    
    yPos = rowY + 32;
  }

  // ==================== REGRAS E NORMAS ====================
  if (revista.regras && revista.regras.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Regras e Normas', colors.gray);
    
    for (let i = 0; i < revista.regras.length; i++) {
      const regra = revista.regras[i];
      const regraLines = doc.splitTextToSize(regra.descricao, contentWidth - 30);
      const boxHeight = Math.max(25, 18 + regraLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.gray);
      
      // Número
      doc.setFillColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.circle(margin + 10, yPos + boxHeight / 2, 6, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text((i + 1).toString(), margin + 10, yPos + boxHeight / 2 + 3, { align: 'center' });
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(regra.titulo, margin + 22, yPos + 10);
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.text(regraLines, margin + 22, yPos + 17);
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== DICAS DE SEGURANÇA ====================
  if (revista.dicasSeguranca && revista.dicasSeguranca.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Dicas de Segurança', colors.danger);
    
    for (const dica of revista.dicasSeguranca) {
      const dicaLines = doc.splitTextToSize(dica.descricao, contentWidth - 20);
      const boxHeight = Math.max(28, 20 + dicaLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.danger);
      
      // Ícone de alerta
      doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.triangle(margin + 12, yPos + 8, margin + 8, yPos + 16, margin + 16, yPos + 16, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('!', margin + 12, yPos + 14, { align: 'center' });
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.text(dica.titulo, margin + 22, yPos + 12);
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(dicaLines, margin + 10, yPos + 20);
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== REALIZAÇÕES ====================
  if (revista.realizacoes && revista.realizacoes.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Realizações da Gestão', colors.secondary);
    
    for (const realizacao of revista.realizacoes) {
      const realLines = doc.splitTextToSize(realizacao.descricao, contentWidth - 20);
      const boxHeight = Math.max(30, 22 + realLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.secondary);
      
      // Checkmark
      doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.circle(margin + 10, yPos + 12, 6, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('✓', margin + 10, yPos + 15, { align: 'center' });
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(realizacao.titulo, margin + 22, yPos + 12);
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(realLines, margin + 10, yPos + 20);
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== MELHORIAS ====================
  if (revista.melhorias && revista.melhorias.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Melhorias em Andamento', colors.teal);
    
    for (const melhoria of revista.melhorias) {
      const melLines = doc.splitTextToSize(melhoria.descricao, contentWidth - 20);
      const boxHeight = Math.max(32, 24 + melLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.teal);
      
      // Status badge
      const statusColor = melhoria.status === 'concluido' ? colors.success : 
                         melhoria.status === 'em_andamento' ? colors.accent : colors.info;
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 35, yPos + 5, 30, 6, 2, 2, 'F');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text((melhoria.status || 'planejado').toUpperCase(), pageWidth - margin - 20, yPos + 9, { align: 'center' });
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.text(melhoria.titulo, margin + 10, yPos + 12);
      
      // Previsão
      if (melhoria.previsao) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        doc.text(`Previsão: ${melhoria.previsao}`, margin + 10, yPos + 18);
      }
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(melLines, margin + 10, yPos + 24);
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== AQUISIÇÕES ====================
  if (revista.aquisicoes && revista.aquisicoes.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Novas Aquisições', colors.pink);
    
    for (const aquisicao of revista.aquisicoes) {
      const aqLines = doc.splitTextToSize(aquisicao.descricao, contentWidth - 20);
      const boxHeight = Math.max(30, 22 + aqLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.pink);
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.pink[0], colors.pink[1], colors.pink[2]);
      doc.text(aquisicao.titulo, margin + 10, yPos + 12);
      
      // Valor
      if (aquisicao.valor) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
        doc.text(`R$ ${aquisicao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - margin - 10, yPos + 12, { align: 'right' });
      }
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(aqLines, margin + 10, yPos + 20);
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== TELEFONES ÚTEIS ====================
  if (revista.telefones && revista.telefones.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Telefones Úteis', colors.danger);
    
    // Tabela de telefones
    const tableData = revista.telefones.map(tel => [tel.nome, tel.numero]);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['Serviço', 'Telefone']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [colors.danger[0], colors.danger[1], colors.danger[2]],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [colors.danger[0], colors.danger[1], colors.danger[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.6 },
        1: { cellWidth: contentWidth * 0.4, halign: 'center' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ==================== CLASSIFICADOS ====================
  if (revista.classificados && revista.classificados.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Classificados', colors.orange);
    
    for (const classificado of revista.classificados) {
      const classLines = doc.splitTextToSize(classificado.descricao, contentWidth - 20);
      const boxHeight = Math.max(35, 28 + classLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.orange);
      
      // Categoria badge
      if (classificado.categoria) {
        doc.setFillColor(colors.orange[0], colors.orange[1], colors.orange[2]);
        doc.roundedRect(margin + 5, yPos + 5, 25, 6, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(classificado.categoria.toUpperCase(), margin + 7, yPos + 9);
      }
      
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.orange[0], colors.orange[1], colors.orange[2]);
      doc.text(classificado.titulo, margin + 35, yPos + 10);
      
      // Preço
      if (classificado.preco) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
        doc.text(`R$ ${classificado.preco.toLocaleString('pt-BR')}`, pageWidth - margin - 10, yPos + 10, { align: 'right' });
      }
      
      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(classLines, margin + 10, yPos + 18);
      
      // Contato
      if (classificado.contato) {
        doc.setFontSize(8);
        doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        doc.text(`📞 ${classificado.contato}`, margin + 10, yPos + boxHeight - 6);
      }
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== PUBLICIDADE ====================
  if (revista.publicidade && revista.publicidade.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Parceiros e Anunciantes', colors.info);
    
    for (const pub of revista.publicidade) {
      const pubLines = pub.descricao ? doc.splitTextToSize(pub.descricao, contentWidth - 20) : [];
      const boxHeight = Math.max(30, 22 + pubLines.length * 5);
      
      checkNewPage(boxHeight + 8);
      
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, colors.info);
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.info[0], colors.info[1], colors.info[2]);
      doc.text(pub.titulo, margin + 10, yPos + 12);
      
      // Descrição
      if (pubLines.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(pubLines, margin + 10, yPos + 20);
      }
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== ANUNCIANTES ====================
  if (revista.anunciantes && revista.anunciantes.length > 0) {
    checkNewPage(50, true);
    drawSectionHeader('Guia Comercial', colors.info);
    
    for (const anunciante of revista.anunciantes) {
      const descLines = anunciante.descricao ? doc.splitTextToSize(anunciante.descricao, contentWidth - 20) : [];
      const boxHeight = Math.max(35, 28 + descLines.length * 4);
      
      checkNewPage(boxHeight + 8);
      
      const color = categoriaColors[anunciante.categoria] || categoriaColors.outros;
      drawPremiumCard(margin, yPos, contentWidth, boxHeight, color);
      
      // Categoria badge
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(pageWidth - margin - 35, yPos + 5, 30, 6, 2, 2, 'F');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(anunciante.categoria.toUpperCase(), pageWidth - margin - 20, yPos + 9, { align: 'center' });
      
      // Nome
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(anunciante.nome, margin + 10, yPos + 12);
      
      // Contatos
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      let contactY = yPos + 18;
      if (anunciante.telefone) {
        doc.text(`📞 ${anunciante.telefone}`, margin + 10, contactY);
        contactY += 5;
      }
      if (anunciante.whatsapp) {
        doc.text(`💬 ${anunciante.whatsapp}`, margin + 10, contactY);
      }
      
      // Descrição
      if (descLines.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(descLines, margin + 10, yPos + boxHeight - 8);
      }
      
      yPos += boxHeight + 6;
    }
  }

  // ==================== CONTRACAPA PREMIUM ====================
  doc.addPage();
  currentPage++;
  
  // Fundo gradiente
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Elemento decorativo superior
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Elemento decorativo inferior
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  // Logo/Nome do condomínio
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(revista.condominioNome, pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
  
  // Linha decorativa
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, pageHeight / 2 - 20, pageWidth / 2 + 40, pageHeight / 2 - 20);
  
  // Texto de agradecimento
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Obrigado por fazer parte', pageWidth / 2, pageHeight / 2, { align: 'center' });
  doc.text('da nossa comunidade!', pageWidth / 2, pageHeight / 2 + 8, { align: 'center' });
  
  // Edição
  doc.setFontSize(11);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text(revista.edicao, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
  
  // Créditos
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Gerado por App Síndico | appsindico.com.br', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // ==================== PREENCHER ÍNDICE ====================
  // Voltar à página do índice e preencher
  doc.setPage(tocStartPage);
  let tocY = tocStartY;
  doc.setFontSize(10);
  
  for (const entry of tocEntries) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(entry.title, margin + 5, tocY);
    
    // Linha pontilhada
    doc.setDrawColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setLineDashPattern([1, 1], 0);
    const titleWidth = doc.getTextWidth(entry.title);
    const pageNumWidth = doc.getTextWidth(entry.page.toString());
    doc.line(margin + 10 + titleWidth, tocY - 1, pageWidth - margin - 10 - pageNumWidth, tocY - 1);
    doc.setLineDashPattern([], 0);
    
    // Número da página
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(entry.page.toString(), pageWidth - margin - 5, tocY, { align: 'right' });
    
    tocY += 8;
  }

  // Retornar como Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export type { RevistaData };

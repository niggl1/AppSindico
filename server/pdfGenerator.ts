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

// Paleta de cores premium - tons sofisticados
const colors = {
  // Cores principais
  primary: [30, 58, 95] as [number, number, number],        // Azul escuro elegante
  primaryLight: [59, 130, 246] as [number, number, number], // Azul claro
  secondary: [16, 185, 129] as [number, number, number],    // Verde esmeralda
  accent: [212, 175, 55] as [number, number, number],       // Dourado elegante
  
  // Cores de destaque
  rose: [244, 63, 94] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  violet: [139, 92, 246] as [number, number, number],
  cyan: [6, 182, 212] as [number, number, number],
  
  // Neutros
  white: [255, 255, 255] as [number, number, number],
  cream: [254, 252, 243] as [number, number, number],
  lightGray: [248, 250, 252] as [number, number, number],
  gray: [148, 163, 184] as [number, number, number],
  darkGray: [71, 85, 105] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
};

// Cores por tipo de aviso
const tipoColors: Record<string, [number, number, number]> = {
  informativo: colors.primaryLight,
  importante: colors.amber,
  urgente: colors.rose,
};

export async function generateRevistaPDF(revista: RevistaData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;
  let currentPage = 1;
  const tocEntries: Array<{ title: string; page: number }> = [];

  // ==================== FUNÇÕES AUXILIARES ====================
  
  // Adicionar cabeçalho e rodapé elegante
  const addHeaderFooter = (pageNum: number, isFirstPage: boolean = false) => {
    if (isFirstPage) return;
    
    // Linha superior elegante
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);
    
    // Linha decorativa dourada
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 11.5, pageWidth - margin, 11.5);
    
    // Texto do cabeçalho
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.text(revista.condominioNome.toUpperCase(), margin, 8);
    doc.text(revista.edicao.toUpperCase(), pageWidth - margin, 8, { align: 'right' });
    
    // Rodapé elegante
    doc.setDrawColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    
    doc.setFontSize(8);
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    
    // Logo App Síndico no rodapé
    doc.setFontSize(7);
    doc.text('App Síndico', pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Verificar se precisa de nova página
  const checkNewPage = (neededSpace: number, forceNewPage: boolean = false): boolean => {
    const availableSpace = pageHeight - margin - 18 - yPos;
    if (forceNewPage || availableSpace < neededSpace) {
      doc.addPage();
      currentPage++;
      addHeaderFooter(currentPage);
      yPos = margin + 18;
      return true;
    }
    return false;
  };

  // Desenhar cabeçalho de secção premium
  const drawSectionHeader = (title: string, color: [number, number, number]) => {
    checkNewPage(30);
    
    // Linha decorativa à esquerda
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos, 4, 14, 'F');
    
    // Título da secção
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 10, yPos + 10);
    
    // Linha horizontal elegante
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.5);
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    doc.line(margin + 12 + titleWidth, yPos + 8, pageWidth - margin, yPos + 8);
    
    yPos += 22;
    tocEntries.push({ title, page: currentPage });
  };

  // Desenhar card premium com borda elegante
  const drawCard = (
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    accentColor: [number, number, number]
  ) => {
    // Sombra suave
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 1, y + 1, width, height, 2, 2, 'F');
    
    // Card branco
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');
    
    // Borda superior colorida
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(x, y, width, 2, 'F');
  };

  // ==================== CAPA PREMIUM ====================
  
  // Fundo branco limpo
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Borda elegante dourada
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
  
  // Borda interna azul escuro
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');
  
  // Padrão geométrico sutil no topo
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(12, 12, pageWidth - 24, 60, 'F');
  
  // Linhas decorativas no padrão
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.3);
  for (let i = 0; i < 5; i++) {
    doc.line(20 + i * 8, 20, 20 + i * 8, 65);
  }
  for (let i = 0; i < 5; i++) {
    doc.line(pageWidth - 60 + i * 8, 20, pageWidth - 60 + i * 8, 65);
  }
  
  // Edição no topo
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`EDIÇÃO ${revista.edicao.toUpperCase()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Linha decorativa dourada
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 35, 35, pageWidth / 2 + 35, 35);
  
  // Título "INFORMATIVO" elegante
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('INFORMATIVO DIGITAL', pageWidth / 2, 50, { align: 'center' });
  
  // Ornamento central
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(pageWidth / 2 - 20, 55, 40, 1, 'F');
  
  // Área central - Nome do condomínio em destaque
  const condominioY = 110;
  
  // Moldura elegante para o nome
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, condominioY - 15, pageWidth - margin - 20, condominioY - 15);
  doc.line(margin + 20, condominioY + 25, pageWidth - margin - 20, condominioY + 25);
  
  // Ornamentos nos cantos
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(margin + 20, condominioY - 17, 8, 4, 'F');
  doc.rect(pageWidth - margin - 28, condominioY - 17, 8, 4, 'F');
  doc.rect(margin + 20, condominioY + 23, 8, 4, 'F');
  doc.rect(pageWidth - margin - 28, condominioY + 23, 8, 4, 'F');
  
  // Nome do condomínio
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const condominioLines = doc.splitTextToSize(revista.condominioNome.toUpperCase(), contentWidth - 40);
  let condY = condominioY;
  for (const line of condominioLines) {
    doc.text(line, pageWidth / 2, condY, { align: 'center' });
    condY += 12;
  }
  
  // Título da revista
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  const tituloLines = doc.splitTextToSize(revista.titulo, contentWidth - 30);
  let tituloY = 160;
  for (const line of tituloLines) {
    doc.text(line, pageWidth / 2, tituloY, { align: 'center' });
    tituloY += 10;
  }
  
  // Subtítulo
  if (revista.subtitulo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.text(revista.subtitulo, pageWidth / 2, tituloY + 5, { align: 'center' });
  }
  
  // Área inferior - Badge elegante
  const badgeY = pageHeight - 55;
  
  // Linha decorativa
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, badgeY - 10, pageWidth / 2 + 50, badgeY - 10);
  
  // Badge "Revista Digital"
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(pageWidth / 2 - 35, badgeY, 70, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REVISTA DIGITAL', pageWidth / 2, badgeY + 8, { align: 'center' });
  
  // Rodapé da capa
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text('Produzido com App Síndico', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ==================== ÍNDICE ====================
  doc.addPage();
  currentPage++;
  addHeaderFooter(currentPage);
  yPos = margin + 20;
  
  // Título do índice
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, yPos, 4, 14, 'F');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE', margin + 10, yPos + 10);
  
  // Linha decorativa
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 20, pageWidth - margin, yPos + 20);
  
  yPos += 35;
  
  // Placeholder para índice (será preenchido depois)
  const tocStartY = yPos;
  const tocPageNum = currentPage;

  // ==================== MENSAGEM DO SÍNDICO ====================
  if (revista.mensagemSindico) {
    doc.addPage();
    currentPage++;
    addHeaderFooter(currentPage);
    yPos = margin + 20;
    
    drawSectionHeader('Mensagem do Síndico', colors.primary);
    
    // Card elegante
    drawCard(margin, yPos, contentWidth, 80, colors.primary);
    
    // Título da mensagem
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(revista.mensagemSindico.titulo, margin + 8, yPos + 15);
    
    // Linha decorativa
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 8, yPos + 20, margin + 60, yPos + 20);
    
    // Mensagem
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const msgLines = doc.splitTextToSize(revista.mensagemSindico.mensagem, contentWidth - 20);
    let msgY = yPos + 30;
    for (const line of msgLines.slice(0, 8)) {
      doc.text(line, margin + 8, msgY);
      msgY += 5;
    }
    
    // Assinatura
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(revista.mensagemSindico.nomeSindico, margin + 8, yPos + 70);
    
    if (revista.mensagemSindico.assinatura) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.text(revista.mensagemSindico.assinatura, margin + 8, yPos + 76);
    }
    
    yPos += 90;
  }

  // ==================== AVISOS ====================
  if (revista.avisos && revista.avisos.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Avisos Importantes', colors.amber);
    
    for (const aviso of revista.avisos) {
      checkNewPage(45);
      
      const avisoColor = tipoColors[aviso.tipo.toLowerCase()] || colors.primaryLight;
      drawCard(margin, yPos, contentWidth, 35, avisoColor);
      
      // Tipo do aviso
      doc.setFillColor(avisoColor[0], avisoColor[1], avisoColor[2]);
      doc.roundedRect(margin + 5, yPos + 5, 25, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(aviso.tipo.toUpperCase(), margin + 17.5, yPos + 9, { align: 'center' });
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(aviso.titulo, margin + 35, yPos + 10);
      
      // Conteúdo
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const avisoLines = doc.splitTextToSize(aviso.conteudo, contentWidth - 15);
      let avisoY = yPos + 18;
      for (const line of avisoLines.slice(0, 3)) {
        doc.text(line, margin + 8, avisoY);
        avisoY += 5;
      }
      
      yPos += 42;
    }
  }

  // ==================== EVENTOS ====================
  if (revista.eventos && revista.eventos.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Agenda de Eventos', colors.emerald);
    
    for (const evento of revista.eventos) {
      checkNewPage(40);
      
      drawCard(margin, yPos, contentWidth, 32, colors.emerald);
      
      // Data em destaque
      const dataEvento = new Date(evento.dataEvento);
      const dia = dataEvento.getDate().toString().padStart(2, '0');
      const mes = dataEvento.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      
      doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
      doc.roundedRect(margin + 5, yPos + 6, 20, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(dia, margin + 15, yPos + 16, { align: 'center' });
      doc.setFontSize(8);
      doc.text(mes, margin + 15, yPos + 22, { align: 'center' });
      
      // Título do evento
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(evento.titulo, margin + 30, yPos + 12);
      
      // Detalhes
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let detalhes = '';
      if (evento.horario) detalhes += `${evento.horario}`;
      if (evento.local) detalhes += ` • ${evento.local}`;
      doc.text(detalhes, margin + 30, yPos + 20);
      
      if (evento.descricao) {
        doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        const descLines = doc.splitTextToSize(evento.descricao, contentWidth - 40);
        doc.text(descLines[0] || '', margin + 30, yPos + 27);
      }
      
      yPos += 38;
    }
  }

  // ==================== FUNCIONÁRIOS ====================
  if (revista.funcionarios && revista.funcionarios.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Nossa Equipe', colors.violet);
    
    const cardWidth = (contentWidth - 10) / 2;
    let col = 0;
    
    for (const func of revista.funcionarios) {
      if (col === 0) checkNewPage(35);
      
      const x = margin + col * (cardWidth + 10);
      drawCard(x, yPos, cardWidth, 28, colors.violet);
      
      // Ícone de pessoa
      doc.setFillColor(colors.violet[0], colors.violet[1], colors.violet[2]);
      doc.circle(x + 12, yPos + 14, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(func.nome.charAt(0).toUpperCase(), x + 12, yPos + 17, { align: 'center' });
      
      // Nome e cargo
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(func.nome, x + 24, yPos + 12);
      
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(func.cargo, x + 24, yPos + 19);
      
      if (func.turno) {
        doc.setFontSize(8);
        doc.text(`Turno: ${func.turno}`, x + 24, yPos + 25);
      }
      
      col++;
      if (col >= 2) {
        col = 0;
        yPos += 34;
      }
    }
    if (col !== 0) yPos += 34;
  }

  // ==================== COMUNICADOS ====================
  if (revista.comunicados && revista.comunicados.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Comunicados Oficiais', colors.primaryLight);
    
    for (const comunicado of revista.comunicados) {
      checkNewPage(45);
      
      drawCard(margin, yPos, contentWidth, 38, colors.primaryLight);
      
      // Título
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(comunicado.titulo, margin + 8, yPos + 12);
      
      // Conteúdo
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const comLines = doc.splitTextToSize(comunicado.conteudo, contentWidth - 20);
      let comY = yPos + 20;
      for (const line of comLines.slice(0, 3)) {
        doc.text(line, margin + 8, comY);
        comY += 5;
      }
      
      yPos += 45;
    }
  }

  // ==================== REGRAS E NORMAS ====================
  if (revista.regras && revista.regras.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Regras e Normas', colors.darkGray);
    
    for (let i = 0; i < revista.regras.length; i++) {
      const regra = revista.regras[i];
      checkNewPage(35);
      
      // Número da regra
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.circle(margin + 8, yPos + 8, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text((i + 1).toString(), margin + 8, yPos + 10, { align: 'center' });
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(regra.titulo, margin + 18, yPos + 10);
      
      // Descrição
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const regraLines = doc.splitTextToSize(regra.descricao, contentWidth - 25);
      let regraY = yPos + 18;
      for (const line of regraLines.slice(0, 2)) {
        doc.text(line, margin + 18, regraY);
        regraY += 5;
      }
      
      // Linha separadora
      doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin + 18, yPos + 28, pageWidth - margin, yPos + 28);
      
      yPos += 32;
    }
  }

  // ==================== DICAS DE SEGURANÇA ====================
  if (revista.dicasSeguranca && revista.dicasSeguranca.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Dicas de Segurança', colors.rose);
    
    for (const dica of revista.dicasSeguranca) {
      checkNewPage(35);
      
      drawCard(margin, yPos, contentWidth, 28, colors.rose);
      
      // Ícone de alerta
      doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
      doc.circle(margin + 12, yPos + 14, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('!', margin + 12, yPos + 17, { align: 'center' });
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(dica.titulo, margin + 22, yPos + 12);
      
      // Descrição
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const dicaLines = doc.splitTextToSize(dica.descricao, contentWidth - 30);
      doc.text(dicaLines[0] || '', margin + 22, yPos + 20);
      
      yPos += 34;
    }
  }

  // ==================== REALIZAÇÕES ====================
  if (revista.realizacoes && revista.realizacoes.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Realizações da Gestão', colors.emerald);
    
    for (const realizacao of revista.realizacoes) {
      checkNewPage(35);
      
      drawCard(margin, yPos, contentWidth, 30, colors.emerald);
      
      // Ícone de check
      doc.setFillColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
      doc.circle(margin + 12, yPos + 15, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('✓', margin + 12, yPos + 18, { align: 'center' });
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(realizacao.titulo, margin + 22, yPos + 12);
      
      // Descrição
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const realLines = doc.splitTextToSize(realizacao.descricao, contentWidth - 30);
      doc.text(realLines[0] || '', margin + 22, yPos + 20);
      
      yPos += 36;
    }
  }

  // ==================== MELHORIAS ====================
  if (revista.melhorias && revista.melhorias.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Melhorias em Andamento', colors.cyan);
    
    for (const melhoria of revista.melhorias) {
      checkNewPage(35);
      
      drawCard(margin, yPos, contentWidth, 30, colors.cyan);
      
      // Status
      const statusColor = melhoria.status === 'concluido' ? colors.emerald : colors.amber;
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(margin + 5, yPos + 5, 22, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text((melhoria.status || 'EM ANDAMENTO').toUpperCase().slice(0, 12), margin + 16, yPos + 9, { align: 'center' });
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(melhoria.titulo, margin + 32, yPos + 10);
      
      // Descrição
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const melLines = doc.splitTextToSize(melhoria.descricao, contentWidth - 40);
      doc.text(melLines[0] || '', margin + 8, yPos + 20);
      
      yPos += 36;
    }
  }

  // ==================== AQUISIÇÕES ====================
  if (revista.aquisicoes && revista.aquisicoes.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Novas Aquisições', colors.violet);
    
    for (const aquisicao of revista.aquisicoes) {
      checkNewPage(35);
      
      drawCard(margin, yPos, contentWidth, 30, colors.violet);
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(aquisicao.titulo, margin + 8, yPos + 12);
      
      // Valor se existir
      if (aquisicao.valor) {
        doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
        doc.setFontSize(9);
        doc.text(`R$ ${aquisicao.valor.toLocaleString('pt-BR')}`, pageWidth - margin - 8, yPos + 12, { align: 'right' });
      }
      
      // Descrição
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const aqLines = doc.splitTextToSize(aquisicao.descricao, contentWidth - 20);
      doc.text(aqLines[0] || '', margin + 8, yPos + 20);
      
      yPos += 36;
    }
  }

  // ==================== CLASSIFICADOS ====================
  if (revista.classificados && revista.classificados.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Classificados', colors.amber);
    
    const cardWidth = (contentWidth - 10) / 2;
    let col = 0;
    
    for (const classificado of revista.classificados) {
      if (col === 0) checkNewPage(45);
      
      const x = margin + col * (cardWidth + 10);
      drawCard(x, yPos, cardWidth, 38, colors.amber);
      
      // Categoria
      if (classificado.categoria) {
        doc.setFillColor(colors.amber[0], colors.amber[1], colors.amber[2]);
        doc.roundedRect(x + 5, yPos + 5, 20, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text(classificado.categoria.toUpperCase().slice(0, 10), x + 15, yPos + 8.5, { align: 'center' });
      }
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(classificado.titulo.slice(0, 25), x + 5, yPos + 18);
      
      // Preço
      if (classificado.preco) {
        doc.setTextColor(colors.emerald[0], colors.emerald[1], colors.emerald[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`R$ ${classificado.preco.toLocaleString('pt-BR')}`, x + 5, yPos + 28);
      }
      
      // Contato
      if (classificado.contato) {
        doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(classificado.contato.slice(0, 20), x + 5, yPos + 35);
      }
      
      col++;
      if (col >= 2) {
        col = 0;
        yPos += 44;
      }
    }
    if (col !== 0) yPos += 44;
  }

  // ==================== TELEFONES ÚTEIS ====================
  if (revista.telefones && revista.telefones.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Telefones Úteis', colors.primaryLight);
    
    // Tabela elegante
    const tableData = revista.telefones.map(tel => [tel.nome, tel.numero]);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['Serviço', 'Telefone']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]],
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.6 },
        1: { cellWidth: contentWidth * 0.4, halign: 'center' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ==================== PUBLICIDADE ====================
  if (revista.publicidade && revista.publicidade.length > 0) {
    checkNewPage(60, true);
    drawSectionHeader('Parceiros e Anunciantes', colors.rose);
    
    for (const pub of revista.publicidade) {
      checkNewPage(40);
      
      drawCard(margin, yPos, contentWidth, 32, colors.rose);
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(pub.titulo, margin + 8, yPos + 14);
      
      // Descrição
      if (pub.descricao) {
        doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const pubLines = doc.splitTextToSize(pub.descricao, contentWidth - 20);
        doc.text(pubLines[0] || '', margin + 8, yPos + 23);
      }
      
      yPos += 38;
    }
  }

  // ==================== CONTRACAPA ====================
  doc.addPage();
  currentPage++;
  
  // Fundo elegante
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Padrão decorativo
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.3);
  for (let i = 0; i < 8; i++) {
    doc.line(20 + i * 6, pageHeight - 80, 20 + i * 6, pageHeight - 30);
  }
  for (let i = 0; i < 8; i++) {
    doc.line(pageWidth - 68 + i * 6, pageHeight - 80, pageWidth - 68 + i * 6, pageHeight - 30);
  }
  
  // Texto central
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(revista.condominioNome.toUpperCase(), pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  // Linha decorativa
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, pageHeight / 2 - 5, pageWidth / 2 + 40, pageHeight / 2 - 5);
  
  // Edição
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(revista.edicao, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('Produzido com', pageWidth / 2, pageHeight - 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('App Síndico', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ==================== PREENCHER ÍNDICE ====================
  doc.setPage(tocPageNum);
  let tocY = tocStartY;
  
  for (const entry of tocEntries) {
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(entry.title, margin + 5, tocY);
    
    // Linha pontilhada
    doc.setDrawColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setLineWidth(0.2);
    const titleWidth = doc.getTextWidth(entry.title);
    const pageNumWidth = doc.getTextWidth(entry.page.toString());
    
    // Pontos
    let dotX = margin + 8 + titleWidth;
    while (dotX < pageWidth - margin - pageNumWidth - 5) {
      doc.text('.', dotX, tocY);
      dotX += 2;
    }
    
    // Número da página
    doc.setFont('helvetica', 'bold');
    doc.text(entry.page.toString(), pageWidth - margin, tocY, { align: 'right' });
    
    tocY += 8;
  }

  // Retornar o PDF como buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

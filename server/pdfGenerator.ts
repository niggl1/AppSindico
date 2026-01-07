import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

// Cores por tipo de aviso
const tipoColors: Record<string, [number, number, number]> = {
  informativo: [59, 130, 246],
  importante: [245, 158, 11],
  urgente: [239, 68, 68],
};

// Cores por categoria de anunciante
const categoriaColors: Record<string, [number, number, number]> = {
  comercio: [59, 130, 246],
  servicos: [34, 197, 94],
  profissionais: [168, 85, 247],
  alimentacao: [249, 115, 22],
  saude: [239, 68, 68],
  educacao: [234, 179, 8],
  outros: [107, 114, 128],
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

  // Função auxiliar para adicionar nova página se necessário
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Função para desenhar cabeçalho de seção
  const drawSectionHeader = (title: string, color: [number, number, number] = [37, 99, 235]) => {
    checkNewPage(20);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 5, yPos + 7);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  };

  // ==================== CAPA ====================
  // Fundo gradiente simulado
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  // Título da revista
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const tituloLines = doc.splitTextToSize(revista.titulo, contentWidth);
  doc.text(tituloLines, pageWidth / 2, 50, { align: 'center' });
  
  // Subtítulo
  if (revista.subtitulo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(revista.subtitulo, pageWidth / 2, 70, { align: 'center' });
  }
  
  // Edição
  doc.setFontSize(12);
  doc.text(revista.edicao, pageWidth / 2, 85, { align: 'center' });
  
  // Nome do condomínio
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(revista.condominioNome, pageWidth / 2, pageHeight / 2, { align: 'center' });
  
  // Linha decorativa
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(margin + 40, pageHeight / 2 + 10, pageWidth - margin - 40, pageHeight / 2 + 10);
  
  // Rodapé da capa
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Revista Digital do Condomínio', pageWidth / 2, pageHeight - 30, { align: 'center' });

  // ==================== MENSAGEM DO SÍNDICO ====================
  if (revista.mensagemSindico) {
    doc.addPage();
    yPos = margin;
    
    drawSectionHeader('Mensagem do Síndico', [37, 99, 235]);
    
    // Título da mensagem
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    const msgTituloLines = doc.splitTextToSize(revista.mensagemSindico.titulo, contentWidth);
    doc.text(msgTituloLines, margin, yPos);
    yPos += msgTituloLines.length * 7 + 5;
    
    // Conteúdo da mensagem
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const msgLines = doc.splitTextToSize(revista.mensagemSindico.mensagem, contentWidth);
    
    for (const line of msgLines) {
      checkNewPage(7);
      doc.text(line, margin, yPos);
      yPos += 6;
    }
    
    yPos += 10;
    
    // Assinatura
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(revista.mensagemSindico.nomeSindico, margin, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Síndico', margin, yPos);
  }

  // ==================== AVISOS ====================
  if (revista.avisos && revista.avisos.length > 0) {
    doc.addPage();
    yPos = margin;
    
    drawSectionHeader('Avisos e Comunicados', [245, 158, 11]);
    
    for (const aviso of revista.avisos) {
      checkNewPage(40);
      
      const color = tipoColors[aviso.tipo] || tipoColors.informativo;
      
      // Box do aviso
      doc.setFillColor(color[0], color[1], color[2], 0.1);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      
      const avisoLines = doc.splitTextToSize(aviso.conteudo, contentWidth - 10);
      const boxHeight = 15 + avisoLines.length * 5;
      
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'FD');
      
      // Tipo badge
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin + 5, yPos + 3, 25, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(aviso.tipo.toUpperCase(), margin + 7, yPos + 6.5);
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(aviso.titulo, margin + 35, yPos + 7);
      
      // Conteúdo
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(avisoLines, margin + 5, yPos + 14);
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== EVENTOS ====================
  if (revista.eventos && revista.eventos.length > 0) {
    doc.addPage();
    yPos = margin;
    
    drawSectionHeader('Próximos Eventos', [34, 197, 94]);
    
    for (const evento of revista.eventos) {
      checkNewPage(35);
      
      // Box do evento
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      
      const descLines = evento.descricao ? doc.splitTextToSize(evento.descricao, contentWidth - 50) : [];
      const boxHeight = 20 + descLines.length * 5;
      
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'FD');
      
      // Data
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(margin + 3, yPos + 3, 35, 14, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const dataFormatada = new Date(evento.dataEvento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      doc.text(dataFormatada, margin + 5, yPos + 12);
      
      // Título
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(evento.titulo, margin + 43, yPos + 10);
      
      // Horário e local
      let infoY = yPos + 16;
      if (evento.horario) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`🕐 ${evento.horario}`, margin + 43, infoY);
        infoY += 5;
      }
      if (evento.local) {
        doc.setFontSize(9);
        doc.text(`📍 ${evento.local}`, margin + 43, infoY);
      }
      
      // Descrição
      if (descLines.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(descLines, margin + 5, yPos + boxHeight - 5 - descLines.length * 4);
      }
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== EQUIPE ====================
  if (revista.funcionarios && revista.funcionarios.length > 0) {
    doc.addPage();
    yPos = margin;
    
    drawSectionHeader('Nossa Equipe', [168, 85, 247]);
    
    const colWidth = (contentWidth - 10) / 2;
    let col = 0;
    let rowY = yPos;
    
    for (const func of revista.funcionarios) {
      if (col === 2) {
        col = 0;
        rowY += 25;
        if (rowY + 25 > pageHeight - margin) {
          doc.addPage();
          rowY = margin + 15;
          drawSectionHeader('Nossa Equipe (continuação)', [168, 85, 247]);
          rowY = yPos;
        }
      }
      
      const xPos = margin + col * (colWidth + 10);
      
      // Card do funcionário
      doc.setFillColor(250, 245, 255);
      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(0.3);
      doc.roundedRect(xPos, rowY, colWidth, 20, 2, 2, 'FD');
      
      // Nome
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135);
      doc.text(func.nome, xPos + 5, rowY + 8);
      
      // Cargo
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(func.cargo, xPos + 5, rowY + 14);
      
      // Turno
      if (func.turno) {
        doc.setFontSize(8);
        doc.text(func.turno, xPos + 5, rowY + 18);
      }
      
      col++;
    }
    
    yPos = rowY + 30;
  }

  // ==================== TELEFONES ÚTEIS ====================
  if (revista.telefones && revista.telefones.length > 0) {
    checkNewPage(50);
    if (yPos === margin) {
      // Nova página foi adicionada
    } else {
      yPos += 10;
    }
    
    drawSectionHeader('Telefones Úteis', [239, 68, 68]);
    
    // Tabela de telefones
    const tableData = revista.telefones.map(tel => [tel.nome, tel.numero]);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['Serviço', 'Telefone']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ==================== ANUNCIANTES ====================
  if (revista.anunciantes && revista.anunciantes.length > 0) {
    doc.addPage();
    yPos = margin;
    
    drawSectionHeader('Guia Comercial', [59, 130, 246]);
    
    for (const anunciante of revista.anunciantes) {
      checkNewPage(35);
      
      const color = categoriaColors[anunciante.categoria] || categoriaColors.outros;
      
      // Card do anunciante
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      
      const descLines = anunciante.descricao ? doc.splitTextToSize(anunciante.descricao, contentWidth - 10) : [];
      const boxHeight = 25 + descLines.length * 4;
      
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'FD');
      
      // Categoria badge
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin + contentWidth - 30, yPos + 3, 25, 5, 1, 1, 'F');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(anunciante.categoria.toUpperCase(), margin + contentWidth - 28, yPos + 6);
      
      // Nome
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(anunciante.nome, margin + 5, yPos + 10);
      
      // Contatos
      let contactY = yPos + 16;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      if (anunciante.telefone) {
        doc.text(`📞 ${anunciante.telefone}`, margin + 5, contactY);
        contactY += 5;
      }
      if (anunciante.whatsapp) {
        doc.text(`💬 WhatsApp: ${anunciante.whatsapp}`, margin + 5, contactY);
      }
      
      // Descrição
      if (descLines.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(descLines, margin + 5, yPos + boxHeight - 5);
      }
      
      yPos += boxHeight + 8;
    }
  }

  // ==================== CONTRACAPA ====================
  doc.addPage();
  
  // Fundo
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Logo/Nome do condomínio
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(revista.condominioNome, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  // Linha decorativa
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin + 50, pageHeight / 2, pageWidth - margin - 50, pageHeight / 2);
  
  // Texto de agradecimento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Obrigado por fazer parte da nossa comunidade!', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  // Edição
  doc.setFontSize(10);
  doc.text(revista.edicao, pageWidth / 2, pageHeight - 40, { align: 'center' });
  
  // Créditos
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Gerado por App Síndico', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Retornar como Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export type { RevistaData };

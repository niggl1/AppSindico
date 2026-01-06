// PDF Generator utilities for App Síndico
// This module provides functions to generate various PDF reports

// Utility functions
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('pt-BR');
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return 'N/A';
  const statusMap: Record<string, string> = {
    'pendente': 'Pendente',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado',
    'aberto': 'Aberto',
    'fechado': 'Fechado',
    'resolvido': 'Resolvido',
    'agendado': 'Agendado',
    'executado': 'Executado',
    'aprovado': 'Aprovado',
    'reprovado': 'Reprovado',
  };
  return statusMap[status.toLowerCase()] || status;
}

export async function generateAntesDepoisReport(item: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório Antes e Depois', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Título: ${item.titulo || 'N/A'}`, 20, 40);
  doc.text(`Descrição: ${item.descricao || 'N/A'}`, 20, 50);
  doc.text(`Data: ${formatDate(new Date())}`, 20, 60);
  
  if (item.imagemAntes) {
    doc.text('Imagem Antes:', 20, 80);
  }
  
  if (item.imagemDepois) {
    doc.text('Imagem Depois:', 20, 140);
  }
  
  doc.save(`antes-depois-${item.id || 'report'}.pdf`);
}

export async function generateVistoriaReport(vistoria: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório de Vistoria', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Local: ${vistoria.local || 'N/A'}`, 20, 40);
  doc.text(`Data: ${formatDate(vistoria.data)}`, 20, 50);
  doc.text(`Responsável: ${vistoria.responsavel || 'N/A'}`, 20, 60);
  doc.text(`Status: ${formatStatus(vistoria.status)}`, 20, 70);
  doc.text(`Observações: ${vistoria.observacoes || 'N/A'}`, 20, 80);
  
  doc.save(`vistoria-${vistoria.id || 'report'}.pdf`);
}

export async function generateOrdemServicoReport(ordem: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Ordem de Serviço', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Número: ${ordem.numero || ordem.id || 'N/A'}`, 20, 40);
  doc.text(`Título: ${ordem.titulo || 'N/A'}`, 20, 50);
  doc.text(`Descrição: ${ordem.descricao || 'N/A'}`, 20, 60);
  doc.text(`Status: ${formatStatus(ordem.status)}`, 20, 70);
  doc.text(`Prioridade: ${ordem.prioridade || 'N/A'}`, 20, 80);
  doc.text(`Data de Abertura: ${formatDate(ordem.dataAbertura || ordem.createdAt)}`, 20, 90);
  
  doc.save(`ordem-servico-${ordem.id || 'report'}.pdf`);
}

export async function generateManutencaoReport(manutencao: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório de Manutenção', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Tipo: ${manutencao.tipo || 'N/A'}`, 20, 40);
  doc.text(`Descrição: ${manutencao.descricao || 'N/A'}`, 20, 50);
  doc.text(`Data Prevista: ${formatDate(manutencao.dataPrevista)}`, 20, 60);
  doc.text(`Status: ${formatStatus(manutencao.status)}`, 20, 70);
  doc.text(`Custo Estimado: R$ ${manutencao.custoEstimado || '0,00'}`, 20, 80);
  
  doc.save(`manutencao-${manutencao.id || 'report'}.pdf`);
}

export async function generateOcorrenciaReport(ocorrencia: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório de Ocorrência', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Título: ${ocorrencia.titulo || 'N/A'}`, 20, 40);
  doc.text(`Tipo: ${ocorrencia.tipo || 'N/A'}`, 20, 50);
  doc.text(`Descrição: ${ocorrencia.descricao || 'N/A'}`, 20, 60);
  doc.text(`Local: ${ocorrencia.local || 'N/A'}`, 20, 70);
  doc.text(`Data: ${formatDate(ocorrencia.data || ocorrencia.createdAt)}`, 20, 80);
  doc.text(`Status: ${formatStatus(ocorrencia.status)}`, 20, 90);
  
  doc.save(`ocorrencia-${ocorrencia.id || 'report'}.pdf`);
}

export async function generateChecklistReport(checklist: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório de Checklist', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Nome: ${checklist.nome || 'N/A'}`, 20, 40);
  doc.text(`Descrição: ${checklist.descricao || 'N/A'}`, 20, 50);
  doc.text(`Data: ${formatDate(checklist.data || checklist.createdAt)}`, 20, 60);
  doc.text(`Status: ${formatStatus(checklist.status)}`, 20, 70);
  
  if (checklist.itens && Array.isArray(checklist.itens)) {
    doc.text('Itens:', 20, 90);
    let y = 100;
    checklist.itens.forEach((item: any, index: number) => {
      const status = item.concluido ? '✓' : '○';
      doc.text(`${status} ${item.nome || item.descricao || `Item ${index + 1}`}`, 25, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }
  
  doc.save(`checklist-${checklist.id || 'report'}.pdf`);
}

export async function generateListReport(
  title: string,
  items: any[],
  columns: { key: string; label: string }[]
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${formatDate(new Date())}`, 20, 30);
  doc.text(`Total de registros: ${items.length}`, 20, 38);
  
  // Table header
  let y = 50;
  const colWidth = (doc.internal.pageSize.getWidth() - 40) / columns.length;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  columns.forEach((col, index) => {
    doc.text(col.label, 20 + index * colWidth, y);
  });
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  y += 10;
  
  items.forEach((item) => {
    columns.forEach((col, index) => {
      let value = item[col.key];
      if (value instanceof Date) {
        value = formatDate(value);
      } else if (col.key.toLowerCase().includes('status')) {
        value = formatStatus(value);
      } else if (col.key.toLowerCase().includes('data') || col.key.toLowerCase().includes('date')) {
        value = formatDate(value);
      }
      const text = String(value || 'N/A').substring(0, 25);
      doc.text(text, 20 + index * colWidth, y);
    });
    y += 8;
    
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
}

export async function generateRevistaReport(revista: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório da Revista Digital', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Nome: ${revista.nome || 'N/A'}`, 20, 40);
  doc.text(`Edição: ${revista.edicao || 'N/A'}`, 20, 50);
  doc.text(`Data de Publicação: ${formatDate(revista.dataPublicacao)}`, 20, 60);
  doc.text(`Status: ${formatStatus(revista.status)}`, 20, 70);
  
  doc.save(`revista-${revista.id || 'report'}.pdf`);
}

export async function generateCondominioReport(condominio: any): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatório do Condomínio', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Nome: ${condominio.nome || 'N/A'}`, 20, 40);
  doc.text(`Endereço: ${condominio.endereco || 'N/A'}`, 20, 50);
  doc.text(`CNPJ: ${condominio.cnpj || 'N/A'}`, 20, 60);
  doc.text(`Total de Unidades: ${condominio.totalUnidades || 'N/A'}`, 20, 70);
  
  doc.save(`condominio-${condominio.id || 'report'}.pdf`);
}

export default {
  formatDate,
  formatStatus,
  generateAntesDepoisReport,
  generateVistoriaReport,
  generateOrdemServicoReport,
  generateManutencaoReport,
  generateOcorrenciaReport,
  generateChecklistReport,
  generateListReport,
  generateRevistaReport,
  generateCondominioReport
};

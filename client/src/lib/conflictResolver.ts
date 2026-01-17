// Sistema de Resolução de Conflitos Offline
// App Síndico - Plataforma Digital para Condomínios

export interface ConflictItem {
  id: string;
  store: string;
  localData: any;
  serverData: any;
  localTimestamp: number;
  serverTimestamp: number;
  conflictType: 'update' | 'delete' | 'create';
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge' | 'manual';
  resolvedAt?: number;
  resolvedData?: any;
}

export interface ConflictStats {
  total: number;
  pending: number;
  resolved: number;
  byStore: Record<string, number>;
  byType: Record<string, number>;
}

// Detectar conflitos entre dados locais e do servidor
export function detectConflict(localItem: any, serverItem: any): ConflictItem | null {
  if (!localItem || !serverItem) return null;
  
  const localTimestamp = localItem.updatedAt || localItem.createdAt || 0;
  const serverTimestamp = serverItem.updatedAt || serverItem.createdAt || 0;
  
  // Se timestamps são iguais, não há conflito
  if (localTimestamp === serverTimestamp) return null;
  
  // Verificar se os dados são diferentes
  const localJson = JSON.stringify(localItem);
  const serverJson = JSON.stringify(serverItem);
  
  if (localJson === serverJson) return null;
  
  return {
    id: localItem.id || serverItem.id,
    store: '',
    localData: localItem,
    serverData: serverItem,
    localTimestamp,
    serverTimestamp,
    conflictType: 'update',
    resolved: false,
  };
}

// Resolver conflito automaticamente baseado em estratégia
export function autoResolveConflict(
  conflict: ConflictItem,
  strategy: 'newest' | 'oldest' | 'local' | 'server' = 'newest'
): ConflictItem {
  let resolution: 'local' | 'server';
  let resolvedData: any;
  
  switch (strategy) {
    case 'newest':
      if (conflict.localTimestamp > conflict.serverTimestamp) {
        resolution = 'local';
        resolvedData = conflict.localData;
      } else {
        resolution = 'server';
        resolvedData = conflict.serverData;
      }
      break;
    case 'oldest':
      if (conflict.localTimestamp < conflict.serverTimestamp) {
        resolution = 'local';
        resolvedData = conflict.localData;
      } else {
        resolution = 'server';
        resolvedData = conflict.serverData;
      }
      break;
    case 'local':
      resolution = 'local';
      resolvedData = conflict.localData;
      break;
    case 'server':
      resolution = 'server';
      resolvedData = conflict.serverData;
      break;
  }
  
  return {
    ...conflict,
    resolved: true,
    resolution,
    resolvedAt: Date.now(),
    resolvedData,
  };
}

// Mesclar dados de conflito (merge inteligente)
export function mergeConflictData(localData: any, serverData: any): any {
  if (typeof localData !== 'object' || typeof serverData !== 'object') {
    // Para tipos primitivos, usar o mais recente
    return localData;
  }
  
  if (Array.isArray(localData) && Array.isArray(serverData)) {
    // Para arrays, combinar sem duplicatas
    const combined = [...localData];
    serverData.forEach((item: any) => {
      const exists = combined.some((local: any) => 
        JSON.stringify(local) === JSON.stringify(item) ||
        (local.id && item.id && local.id === item.id)
      );
      if (!exists) {
        combined.push(item);
      }
    });
    return combined;
  }
  
  // Para objetos, mesclar propriedades
  const merged: any = { ...serverData };
  
  Object.keys(localData).forEach(key => {
    if (key === 'id' || key === 'createdAt') {
      // Manter valores do servidor para campos de identificação
      return;
    }
    
    if (key === 'updatedAt') {
      // Usar timestamp mais recente
      merged[key] = Math.max(localData[key] || 0, serverData[key] || 0);
      return;
    }
    
    if (serverData[key] === undefined || serverData[key] === null) {
      // Se servidor não tem o valor, usar local
      merged[key] = localData[key];
    } else if (typeof localData[key] === 'object' && typeof serverData[key] === 'object') {
      // Recursivamente mesclar objetos aninhados
      merged[key] = mergeConflictData(localData[key], serverData[key]);
    } else if (localData[key] !== serverData[key]) {
      // Para valores diferentes, preferir o local (mais recente)
      merged[key] = localData[key];
    }
  });
  
  return merged;
}

// Comparar campos para exibição de diferenças
export function compareFields(localData: any, serverData: any): Array<{
  field: string;
  localValue: any;
  serverValue: any;
  isDifferent: boolean;
}> {
  const allFields = new Set([
    ...Object.keys(localData || {}),
    ...Object.keys(serverData || {}),
  ]);
  
  const comparisons: Array<{
    field: string;
    localValue: any;
    serverValue: any;
    isDifferent: boolean;
  }> = [];
  
  allFields.forEach(field => {
    const localValue = localData?.[field];
    const serverValue = serverData?.[field];
    const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);
    
    comparisons.push({
      field,
      localValue,
      serverValue,
      isDifferent,
    });
  });
  
  // Ordenar: diferentes primeiro
  return comparisons.sort((a, b) => {
    if (a.isDifferent && !b.isDifferent) return -1;
    if (!a.isDifferent && b.isDifferent) return 1;
    return a.field.localeCompare(b.field);
  });
}

// Formatar valor para exibição
export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return '(vazio)';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') {
    if (value > 1000000000000) {
      // Provavelmente um timestamp
      return new Date(value).toLocaleString('pt-BR');
    }
    return value.toLocaleString('pt-BR');
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `[${value.length} itens]`;
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// Obter nome amigável do campo
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    id: 'ID',
    nome: 'Nome',
    titulo: 'Título',
    descricao: 'Descrição',
    status: 'Status',
    tipo: 'Tipo',
    prioridade: 'Prioridade',
    valor: 'Valor',
    data: 'Data',
    dataInicio: 'Data de Início',
    dataFim: 'Data de Fim',
    dataCriacao: 'Data de Criação',
    dataAtualizacao: 'Data de Atualização',
    createdAt: 'Criado em',
    updatedAt: 'Atualizado em',
    criadoPor: 'Criado por',
    responsavel: 'Responsável',
    responsavelId: 'ID do Responsável',
    condominioId: 'ID do Condomínio',
    unidadeId: 'ID da Unidade',
    moradorId: 'ID do Morador',
    email: 'E-mail',
    telefone: 'Telefone',
    endereco: 'Endereço',
    observacoes: 'Observações',
    anexos: 'Anexos',
    imagens: 'Imagens',
    arquivos: 'Arquivos',
    ativo: 'Ativo',
    concluido: 'Concluído',
    aprovado: 'Aprovado',
    publicado: 'Publicado',
  };
  
  return labels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

// Calcular estatísticas de conflitos
export function calculateConflictStats(conflicts: ConflictItem[]): ConflictStats {
  const stats: ConflictStats = {
    total: conflicts.length,
    pending: 0,
    resolved: 0,
    byStore: {},
    byType: {},
  };
  
  conflicts.forEach(conflict => {
    if (conflict.resolved) {
      stats.resolved++;
    } else {
      stats.pending++;
    }
    
    stats.byStore[conflict.store] = (stats.byStore[conflict.store] || 0) + 1;
    stats.byType[conflict.conflictType] = (stats.byType[conflict.conflictType] || 0) + 1;
  });
  
  return stats;
}

// Exportar histórico de conflitos
export function exportConflictHistory(conflicts: ConflictItem[]): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalConflicts: conflicts.length,
    conflicts: conflicts.map(c => ({
      ...c,
      localData: c.localData,
      serverData: c.serverData,
      resolvedData: c.resolvedData,
    })),
  }, null, 2);
}

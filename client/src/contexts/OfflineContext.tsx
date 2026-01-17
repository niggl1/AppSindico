// Contexto de Sincronização Offline - Sistema Completo
// App Síndico - Plataforma Digital para Condomínios

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB, SyncQueueItem, STORES } from '@/lib/offlineDB';
import { toast } from 'sonner';

// Tipos de módulos
type ModuleName = 'operacional' | 'comunicacao' | 'financeiro' | 'cadastros' | 'documentos' | 'reservas' | 'ocorrencias';

// Estatísticas por módulo
interface ModuleStats {
  operacional: { timelines: number; ordensServico: number; manutencoes: number; comentarios: number };
  comunicacao: { avisos: number; enquetes: number; comunicados: number; mensagens: number };
  financeiro: { boletos: number; prestacaoContas: number; despesas: number; receitas: number };
  cadastros: { moradores: number; funcionarios: number; fornecedores: number; veiculos: number; unidades: number; condominios: number };
  documentos: { atas: number; regulamentos: number; contratos: number; arquivos: number };
  reservas: { areasComuns: number; reservas: number };
  ocorrencias: { ocorrencias: number };
  sistema: { syncQueue: number; metadata: number; cache: number };
}

// Interface do contexto
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueueCount: number;
  lastSyncTime: Date | null;
  syncError: string | null;
  
  // Ações gerais
  syncNow: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  clearModuleData: (module: ModuleName) => Promise<void>;
  
  // Estatísticas
  getOfflineStats: () => Promise<ModuleStats>;
  
  // Backup
  exportOfflineData: () => Promise<string>;
  importOfflineData: (jsonData: string) => Promise<void>;
  
  // ==================== OPERACIONAL ====================
  saveOfflineTimeline: (data: any) => Promise<void>;
  saveOfflineOrdemServico: (data: any) => Promise<void>;
  saveOfflineManutencao: (data: any) => Promise<void>;
  saveOfflineComentario: (data: any) => Promise<void>;
  getOfflineTimelines: (condominioId?: number) => Promise<any[]>;
  getOfflineOrdensServico: (condominioId?: number) => Promise<any[]>;
  getOfflineManutencoes: (condominioId?: number) => Promise<any[]>;
  
  // ==================== COMUNICAÇÃO ====================
  saveOfflineAviso: (data: any) => Promise<void>;
  saveOfflineEnquete: (data: any) => Promise<void>;
  saveOfflineComunicado: (data: any) => Promise<void>;
  saveOfflineMensagem: (data: any) => Promise<void>;
  getOfflineAvisos: (condominioId?: number) => Promise<any[]>;
  getOfflineEnquetes: (condominioId?: number) => Promise<any[]>;
  getOfflineComunicados: (condominioId?: number) => Promise<any[]>;
  getOfflineMensagens: (condominioId?: number) => Promise<any[]>;
  
  // ==================== FINANCEIRO ====================
  saveOfflineBoleto: (data: any) => Promise<void>;
  saveOfflinePrestacaoContas: (data: any) => Promise<void>;
  saveOfflineDespesa: (data: any) => Promise<void>;
  saveOfflineReceita: (data: any) => Promise<void>;
  getOfflineBoletos: (condominioId?: number) => Promise<any[]>;
  getOfflinePrestacaoContas: (condominioId?: number) => Promise<any[]>;
  getOfflineDespesas: (condominioId?: number) => Promise<any[]>;
  getOfflineReceitas: (condominioId?: number) => Promise<any[]>;
  
  // ==================== CADASTROS ====================
  saveOfflineMorador: (data: any) => Promise<void>;
  saveOfflineFuncionario: (data: any) => Promise<void>;
  saveOfflineFornecedor: (data: any) => Promise<void>;
  saveOfflineVeiculo: (data: any) => Promise<void>;
  saveOfflineUnidade: (data: any) => Promise<void>;
  saveOfflineCondominio: (data: any) => Promise<void>;
  getOfflineMoradores: (condominioId?: number) => Promise<any[]>;
  getOfflineFuncionarios: (condominioId?: number) => Promise<any[]>;
  getOfflineFornecedores: (condominioId?: number) => Promise<any[]>;
  getOfflineVeiculos: (condominioId?: number) => Promise<any[]>;
  getOfflineUnidades: (condominioId?: number) => Promise<any[]>;
  getOfflineCondominios: () => Promise<any[]>;
  
  // ==================== DOCUMENTOS ====================
  saveOfflineAta: (data: any) => Promise<void>;
  saveOfflineRegulamento: (data: any) => Promise<void>;
  saveOfflineContrato: (data: any) => Promise<void>;
  saveOfflineArquivo: (data: any) => Promise<void>;
  getOfflineAtas: (condominioId?: number) => Promise<any[]>;
  getOfflineRegulamentos: (condominioId?: number) => Promise<any[]>;
  getOfflineContratos: (condominioId?: number) => Promise<any[]>;
  getOfflineArquivos: (condominioId?: number) => Promise<any[]>;
  
  // ==================== RESERVAS ====================
  saveOfflineAreaComum: (data: any) => Promise<void>;
  saveOfflineReserva: (data: any) => Promise<void>;
  getOfflineAreasComuns: (condominioId?: number) => Promise<any[]>;
  getOfflineReservas: (condominioId?: number) => Promise<any[]>;
  
  // ==================== OCORRÊNCIAS ====================
  saveOfflineOcorrencia: (data: any) => Promise<void>;
  getOfflineOcorrencias: (condominioId?: number) => Promise<any[]>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

// Mapeamento de stores para endpoints
const STORE_ENDPOINTS: Record<string, string> = {
  timelines: '/api/trpc/timeline.criar',
  ordensServico: '/api/trpc/ordemServico.criar',
  manutencoes: '/api/trpc/manutencao.criar',
  comentarios: '/api/trpc/timeline.criarComentario',
  avisos: '/api/trpc/aviso.criar',
  enquetes: '/api/trpc/enquete.criar',
  comunicados: '/api/trpc/comunicado.criar',
  mensagens: '/api/trpc/mensagem.criar',
  boletos: '/api/trpc/boleto.criar',
  prestacaoContas: '/api/trpc/prestacaoContas.criar',
  despesas: '/api/trpc/despesa.criar',
  receitas: '/api/trpc/receita.criar',
  moradores: '/api/trpc/morador.criar',
  funcionarios: '/api/trpc/funcionario.criar',
  fornecedores: '/api/trpc/fornecedor.criar',
  veiculos: '/api/trpc/veiculo.criar',
  unidades: '/api/trpc/unidade.criar',
  condominios: '/api/trpc/condominio.criar',
  atas: '/api/trpc/ata.criar',
  regulamentos: '/api/trpc/regulamento.criar',
  contratos: '/api/trpc/contrato.criar',
  arquivos: '/api/trpc/arquivo.criar',
  areasComuns: '/api/trpc/areaComum.criar',
  reservas: '/api/trpc/reserva.criar',
  ocorrencias: '/api/trpc/ocorrencia.criar',
};

// Provider
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Inicializar banco offline
  useEffect(() => {
    const initOffline = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;
      
      try {
        await offlineDB.init();
        const count = await offlineDB.getSyncQueueCount();
        setSyncQueueCount(count);
        
        const lastSync = await offlineDB.getMetadata('lastSyncTime');
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
        
        // Limpar cache expirado
        await offlineDB.clearExpiredCache();
        
        console.log('[Offline] Banco inicializado com todas as funções');
      } catch (error) {
        console.error('[Offline] Erro ao inicializar:', error);
      }
    };
    
    initOffline();
  }, []);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!', {
        description: 'Sincronizando dados offline...',
        duration: 3000,
      });
      syncNow();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline', {
        description: 'Os dados serão salvos localmente e sincronizados quando a conexão retornar.',
        duration: 5000,
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[Offline] Service Worker registrado:', registration.scope);
          
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_STARTED') {
              setIsSyncing(true);
            }
            if (event.data.type === 'SYNC_COMPLETED') {
              setIsSyncing(false);
              updateSyncQueueCount();
            }
          });
        })
        .catch((error) => {
          console.error('[Offline] Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Sincronização periódica
  useEffect(() => {
    if (isOnline && syncQueueCount > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncNow();
      }, 30000);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, syncQueueCount]);

  // Atualizar contagem da fila
  const updateSyncQueueCount = useCallback(async () => {
    try {
      const count = await offlineDB.getSyncQueueCount();
      setSyncQueueCount(count);
    } catch (error) {
      console.error('[Offline] Erro ao atualizar contagem:', error);
    }
  }, []);

  // Processar item da fila
  const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
    const { store, operation, data } = item;
    const endpoint = STORE_ENDPOINTS[store] || '/api/trpc/sync';
    
    const response = await fetch(endpoint, {
      method: operation === 'delete' ? 'DELETE' : operation === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
  };

  // Sincronizar dados
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const queue = await offlineDB.getSyncQueue();
      
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      console.log(`[Offline] Sincronizando ${queue.length} itens...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of queue) {
        try {
          await processSyncItem(item);
          await offlineDB.removeSyncQueueItem(item.id);
          successCount++;
        } catch (error: any) {
          console.error('[Offline] Erro ao sincronizar item:', error);
          
          item.retries++;
          item.lastError = error.message;
          
          if (item.retries >= 3) {
            await offlineDB.removeSyncQueueItem(item.id);
            errorCount++;
          } else {
            await offlineDB.updateSyncQueueItem(item);
          }
        }
      }
      
      const now = new Date();
      setLastSyncTime(now);
      await offlineDB.setMetadata('lastSyncTime', now.getTime());
      await updateSyncQueueCount();
      
      if (successCount > 0) {
        toast.success(`${successCount} item(s) sincronizado(s)!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} item(s) falharam após 3 tentativas`);
      }
      
    } catch (error: any) {
      console.error('[Offline] Erro na sincronização:', error);
      setSyncError(error.message);
      toast.error('Erro na sincronização', { description: error.message });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updateSyncQueueCount]);

  // Limpar todos os dados offline
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineDB.clearAll();
      setSyncQueueCount(0);
      setLastSyncTime(null);
      toast.success('Dados offline limpos!');
    } catch (error: any) {
      console.error('[Offline] Erro ao limpar dados:', error);
      toast.error('Erro ao limpar dados offline');
    }
  }, []);

  // Limpar dados de um módulo específico
  const clearModuleData = useCallback(async (module: ModuleName) => {
    try {
      await offlineDB.clearModule(module);
      await updateSyncQueueCount();
      toast.success(`Dados de ${module} limpos!`);
    } catch (error: any) {
      console.error('[Offline] Erro ao limpar módulo:', error);
      toast.error(`Erro ao limpar dados de ${module}`);
    }
  }, [updateSyncQueueCount]);

  // Obter estatísticas
  const getOfflineStats = useCallback(async (): Promise<ModuleStats> => {
    try {
      return await offlineDB.getStatsByModule();
    } catch (error) {
      console.error('[Offline] Erro ao obter estatísticas:', error);
      return {
        operacional: { timelines: 0, ordensServico: 0, manutencoes: 0, comentarios: 0 },
        comunicacao: { avisos: 0, enquetes: 0, comunicados: 0, mensagens: 0 },
        financeiro: { boletos: 0, prestacaoContas: 0, despesas: 0, receitas: 0 },
        cadastros: { moradores: 0, funcionarios: 0, fornecedores: 0, veiculos: 0, unidades: 0, condominios: 0 },
        documentos: { atas: 0, regulamentos: 0, contratos: 0, arquivos: 0 },
        reservas: { areasComuns: 0, reservas: 0 },
        ocorrencias: { ocorrencias: 0 },
        sistema: { syncQueue: 0, metadata: 0, cache: 0 },
      };
    }
  }, []);

  // Exportar dados para backup
  const exportOfflineData = useCallback(async (): Promise<string> => {
    try {
      const data = await offlineDB.exportData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('[Offline] Erro ao exportar dados:', error);
      throw error;
    }
  }, []);

  // Importar dados de backup
  const importOfflineData = useCallback(async (jsonData: string): Promise<void> => {
    try {
      const data = JSON.parse(jsonData);
      await offlineDB.importData(data);
      await updateSyncQueueCount();
      toast.success('Dados importados com sucesso!');
    } catch (error) {
      console.error('[Offline] Erro ao importar dados:', error);
      toast.error('Erro ao importar dados');
      throw error;
    }
  }, [updateSyncQueueCount]);

  // Helper genérico para salvar dados offline
  const createSaveFunction = (saveFn: (data: any, isOffline: boolean) => Promise<void>, storeName: string) => {
    return async (data: any) => {
      try {
        await saveFn(data, !isOnline);
        if (!isOnline) {
          await offlineDB.addToSyncQueue(storeName, data.id ? 'update' : 'create', data);
          await updateSyncQueueCount();
        }
      } catch (error) {
        console.error(`[Offline] Erro ao salvar ${storeName}:`, error);
        throw error;
      }
    };
  };

  // Helper genérico para obter dados offline
  const createGetFunction = (getAllFn: () => Promise<any[]>, getByCondominioFn: (id: number) => Promise<any[]>) => {
    return async (condominioId?: number) => {
      try {
        if (condominioId) {
          return await getByCondominioFn(condominioId);
        }
        return await getAllFn();
      } catch (error) {
        console.error('[Offline] Erro ao obter dados:', error);
        return [];
      }
    };
  };

  // ==================== FUNÇÕES DE SALVAMENTO ====================
  
  // Operacional
  const saveOfflineTimeline = createSaveFunction(offlineDB.saveTimeline.bind(offlineDB), 'timelines');
  const saveOfflineOrdemServico = createSaveFunction(offlineDB.saveOrdemServico.bind(offlineDB), 'ordensServico');
  const saveOfflineManutencao = createSaveFunction(offlineDB.saveManutencao.bind(offlineDB), 'manutencoes');
  const saveOfflineComentario = createSaveFunction(offlineDB.saveComentario.bind(offlineDB), 'comentarios');
  
  // Comunicação
  const saveOfflineAviso = createSaveFunction(offlineDB.saveAviso.bind(offlineDB), 'avisos');
  const saveOfflineEnquete = createSaveFunction(offlineDB.saveEnquete.bind(offlineDB), 'enquetes');
  const saveOfflineComunicado = createSaveFunction(offlineDB.saveComunicado.bind(offlineDB), 'comunicados');
  const saveOfflineMensagem = createSaveFunction(offlineDB.saveMensagem.bind(offlineDB), 'mensagens');
  
  // Financeiro
  const saveOfflineBoleto = createSaveFunction(offlineDB.saveBoleto.bind(offlineDB), 'boletos');
  const saveOfflinePrestacaoContas = createSaveFunction(offlineDB.savePrestacaoContas.bind(offlineDB), 'prestacaoContas');
  const saveOfflineDespesa = createSaveFunction(offlineDB.saveDespesa.bind(offlineDB), 'despesas');
  const saveOfflineReceita = createSaveFunction(offlineDB.saveReceita.bind(offlineDB), 'receitas');
  
  // Cadastros
  const saveOfflineMorador = createSaveFunction(offlineDB.saveMorador.bind(offlineDB), 'moradores');
  const saveOfflineFuncionario = createSaveFunction(offlineDB.saveFuncionario.bind(offlineDB), 'funcionarios');
  const saveOfflineFornecedor = createSaveFunction(offlineDB.saveFornecedor.bind(offlineDB), 'fornecedores');
  const saveOfflineVeiculo = createSaveFunction(offlineDB.saveVeiculo.bind(offlineDB), 'veiculos');
  const saveOfflineUnidade = createSaveFunction(offlineDB.saveUnidade.bind(offlineDB), 'unidades');
  const saveOfflineCondominio = createSaveFunction(offlineDB.saveCondominio.bind(offlineDB), 'condominios');
  
  // Documentos
  const saveOfflineAta = createSaveFunction(offlineDB.saveAta.bind(offlineDB), 'atas');
  const saveOfflineRegulamento = createSaveFunction(offlineDB.saveRegulamento.bind(offlineDB), 'regulamentos');
  const saveOfflineContrato = createSaveFunction(offlineDB.saveContrato.bind(offlineDB), 'contratos');
  const saveOfflineArquivo = createSaveFunction(offlineDB.saveArquivo.bind(offlineDB), 'arquivos');
  
  // Reservas
  const saveOfflineAreaComum = createSaveFunction(offlineDB.saveAreaComum.bind(offlineDB), 'areasComuns');
  const saveOfflineReserva = createSaveFunction(offlineDB.saveReserva.bind(offlineDB), 'reservas');
  
  // Ocorrências
  const saveOfflineOcorrencia = createSaveFunction(offlineDB.saveOcorrencia.bind(offlineDB), 'ocorrencias');

  // ==================== FUNÇÕES DE LEITURA ====================
  
  // Operacional
  const getOfflineTimelines = createGetFunction(offlineDB.getAllTimelines.bind(offlineDB), offlineDB.getTimelinesByCondominio.bind(offlineDB));
  const getOfflineOrdensServico = createGetFunction(offlineDB.getAllOrdensServico.bind(offlineDB), offlineDB.getOrdensServicoByCondominio.bind(offlineDB));
  const getOfflineManutencoes = createGetFunction(offlineDB.getAllManutencoes.bind(offlineDB), offlineDB.getManutencoesByCondominio.bind(offlineDB));
  
  // Comunicação
  const getOfflineAvisos = createGetFunction(offlineDB.getAllAvisos.bind(offlineDB), offlineDB.getAvisosByCondominio.bind(offlineDB));
  const getOfflineEnquetes = createGetFunction(offlineDB.getAllEnquetes.bind(offlineDB), offlineDB.getEnquetesByCondominio.bind(offlineDB));
  const getOfflineComunicados = createGetFunction(offlineDB.getAllComunicados.bind(offlineDB), offlineDB.getComunicadosByCondominio.bind(offlineDB));
  const getOfflineMensagens = createGetFunction(offlineDB.getAllMensagens.bind(offlineDB), offlineDB.getMensagensByCondominio.bind(offlineDB));
  
  // Financeiro
  const getOfflineBoletos = createGetFunction(offlineDB.getAllBoletos.bind(offlineDB), offlineDB.getBoletosByCondominio.bind(offlineDB));
  const getOfflinePrestacaoContas = createGetFunction(offlineDB.getAllPrestacaoContas.bind(offlineDB), offlineDB.getPrestacaoContasByCondominio.bind(offlineDB));
  const getOfflineDespesas = createGetFunction(offlineDB.getAllDespesas.bind(offlineDB), offlineDB.getDespesasByCondominio.bind(offlineDB));
  const getOfflineReceitas = createGetFunction(offlineDB.getAllReceitas.bind(offlineDB), offlineDB.getReceitasByCondominio.bind(offlineDB));
  
  // Cadastros
  const getOfflineMoradores = createGetFunction(offlineDB.getAllMoradores.bind(offlineDB), offlineDB.getMoradoresByCondominio.bind(offlineDB));
  const getOfflineFuncionarios = createGetFunction(offlineDB.getAllFuncionarios.bind(offlineDB), offlineDB.getFuncionariosByCondominio.bind(offlineDB));
  const getOfflineFornecedores = createGetFunction(offlineDB.getAllFornecedores.bind(offlineDB), offlineDB.getFornecedoresByCondominio.bind(offlineDB));
  const getOfflineVeiculos = createGetFunction(offlineDB.getAllVeiculos.bind(offlineDB), offlineDB.getVeiculosByCondominio.bind(offlineDB));
  const getOfflineUnidades = createGetFunction(offlineDB.getAllUnidades.bind(offlineDB), offlineDB.getUnidadesByCondominio.bind(offlineDB));
  const getOfflineCondominios = useCallback(async () => {
    try {
      return await offlineDB.getAllCondominios();
    } catch (error) {
      console.error('[Offline] Erro ao obter condomínios:', error);
      return [];
    }
  }, []);
  
  // Documentos
  const getOfflineAtas = createGetFunction(offlineDB.getAllAtas.bind(offlineDB), offlineDB.getAtasByCondominio.bind(offlineDB));
  const getOfflineRegulamentos = createGetFunction(offlineDB.getAllRegulamentos.bind(offlineDB), offlineDB.getRegulamentosByCondominio.bind(offlineDB));
  const getOfflineContratos = createGetFunction(offlineDB.getAllContratos.bind(offlineDB), offlineDB.getContratosByCondominio.bind(offlineDB));
  const getOfflineArquivos = createGetFunction(offlineDB.getAllArquivos.bind(offlineDB), offlineDB.getArquivosByCondominio.bind(offlineDB));
  
  // Reservas
  const getOfflineAreasComuns = createGetFunction(offlineDB.getAllAreasComuns.bind(offlineDB), offlineDB.getAreasComunsByCondominio.bind(offlineDB));
  const getOfflineReservas = createGetFunction(offlineDB.getAllReservas.bind(offlineDB), offlineDB.getReservasByCondominio.bind(offlineDB));
  
  // Ocorrências
  const getOfflineOcorrencias = createGetFunction(offlineDB.getAllOcorrencias.bind(offlineDB), offlineDB.getOcorrenciasByCondominio.bind(offlineDB));

  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    syncQueueCount,
    lastSyncTime,
    syncError,
    syncNow,
    clearOfflineData,
    clearModuleData,
    getOfflineStats,
    exportOfflineData,
    importOfflineData,
    
    // Operacional
    saveOfflineTimeline,
    saveOfflineOrdemServico,
    saveOfflineManutencao,
    saveOfflineComentario,
    getOfflineTimelines,
    getOfflineOrdensServico,
    getOfflineManutencoes,
    
    // Comunicação
    saveOfflineAviso,
    saveOfflineEnquete,
    saveOfflineComunicado,
    saveOfflineMensagem,
    getOfflineAvisos,
    getOfflineEnquetes,
    getOfflineComunicados,
    getOfflineMensagens,
    
    // Financeiro
    saveOfflineBoleto,
    saveOfflinePrestacaoContas,
    saveOfflineDespesa,
    saveOfflineReceita,
    getOfflineBoletos,
    getOfflinePrestacaoContas,
    getOfflineDespesas,
    getOfflineReceitas,
    
    // Cadastros
    saveOfflineMorador,
    saveOfflineFuncionario,
    saveOfflineFornecedor,
    saveOfflineVeiculo,
    saveOfflineUnidade,
    saveOfflineCondominio,
    getOfflineMoradores,
    getOfflineFuncionarios,
    getOfflineFornecedores,
    getOfflineVeiculos,
    getOfflineUnidades,
    getOfflineCondominios,
    
    // Documentos
    saveOfflineAta,
    saveOfflineRegulamento,
    saveOfflineContrato,
    saveOfflineArquivo,
    getOfflineAtas,
    getOfflineRegulamentos,
    getOfflineContratos,
    getOfflineArquivos,
    
    // Reservas
    saveOfflineAreaComum,
    saveOfflineReserva,
    getOfflineAreasComuns,
    getOfflineReservas,
    
    // Ocorrências
    saveOfflineOcorrencia,
    getOfflineOcorrencias,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

// Hook principal
export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline deve ser usado dentro de um OfflineProvider');
  }
  return context;
}

// Hooks auxiliares
export function useIsOnline() {
  const { isOnline } = useOffline();
  return isOnline;
}

export function useSync() {
  const { isSyncing, syncQueueCount, lastSyncTime, syncNow, syncError } = useOffline();
  return { isSyncing, syncQueueCount, lastSyncTime, syncNow, syncError };
}

// Hook para módulo específico
export function useOfflineModule(module: ModuleName) {
  const offline = useOffline();
  
  const moduleMap = {
    operacional: {
      save: {
        timeline: offline.saveOfflineTimeline,
        ordemServico: offline.saveOfflineOrdemServico,
        manutencao: offline.saveOfflineManutencao,
        comentario: offline.saveOfflineComentario,
      },
      get: {
        timelines: offline.getOfflineTimelines,
        ordensServico: offline.getOfflineOrdensServico,
        manutencoes: offline.getOfflineManutencoes,
      },
    },
    comunicacao: {
      save: {
        aviso: offline.saveOfflineAviso,
        enquete: offline.saveOfflineEnquete,
        comunicado: offline.saveOfflineComunicado,
        mensagem: offline.saveOfflineMensagem,
      },
      get: {
        avisos: offline.getOfflineAvisos,
        enquetes: offline.getOfflineEnquetes,
        comunicados: offline.getOfflineComunicados,
        mensagens: offline.getOfflineMensagens,
      },
    },
    financeiro: {
      save: {
        boleto: offline.saveOfflineBoleto,
        prestacaoContas: offline.saveOfflinePrestacaoContas,
        despesa: offline.saveOfflineDespesa,
        receita: offline.saveOfflineReceita,
      },
      get: {
        boletos: offline.getOfflineBoletos,
        prestacaoContas: offline.getOfflinePrestacaoContas,
        despesas: offline.getOfflineDespesas,
        receitas: offline.getOfflineReceitas,
      },
    },
    cadastros: {
      save: {
        morador: offline.saveOfflineMorador,
        funcionario: offline.saveOfflineFuncionario,
        fornecedor: offline.saveOfflineFornecedor,
        veiculo: offline.saveOfflineVeiculo,
        unidade: offline.saveOfflineUnidade,
        condominio: offline.saveOfflineCondominio,
      },
      get: {
        moradores: offline.getOfflineMoradores,
        funcionarios: offline.getOfflineFuncionarios,
        fornecedores: offline.getOfflineFornecedores,
        veiculos: offline.getOfflineVeiculos,
        unidades: offline.getOfflineUnidades,
        condominios: offline.getOfflineCondominios,
      },
    },
    documentos: {
      save: {
        ata: offline.saveOfflineAta,
        regulamento: offline.saveOfflineRegulamento,
        contrato: offline.saveOfflineContrato,
        arquivo: offline.saveOfflineArquivo,
      },
      get: {
        atas: offline.getOfflineAtas,
        regulamentos: offline.getOfflineRegulamentos,
        contratos: offline.getOfflineContratos,
        arquivos: offline.getOfflineArquivos,
      },
    },
    reservas: {
      save: {
        areaComum: offline.saveOfflineAreaComum,
        reserva: offline.saveOfflineReserva,
      },
      get: {
        areasComuns: offline.getOfflineAreasComuns,
        reservas: offline.getOfflineReservas,
      },
    },
    ocorrencias: {
      save: {
        ocorrencia: offline.saveOfflineOcorrencia,
      },
      get: {
        ocorrencias: offline.getOfflineOcorrencias,
      },
    },
  };
  
  return {
    isOnline: offline.isOnline,
    isSyncing: offline.isSyncing,
    syncQueueCount: offline.syncQueueCount,
    clearData: () => offline.clearModuleData(module),
    ...moduleMap[module],
  };
}

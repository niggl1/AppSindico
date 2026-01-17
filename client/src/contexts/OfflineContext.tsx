// Contexto de Sincronização Offline
// App Síndico - Plataforma Digital para Condomínios

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB, SyncQueueItem } from '@/lib/offlineDB';
import { toast } from 'sonner';

// Tipos
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueueCount: number;
  lastSyncTime: Date | null;
  syncError: string | null;
  
  // Ações
  syncNow: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  
  // Funções de dados offline
  saveOfflineTimeline: (timeline: any) => Promise<void>;
  saveOfflineOrdemServico: (ordem: any) => Promise<void>;
  saveOfflineManutencao: (manutencao: any) => Promise<void>;
  saveOfflineComentario: (comentario: any) => Promise<void>;
  
  // Funções de leitura offline
  getOfflineTimelines: (condominioId?: number) => Promise<any[]>;
  getOfflineOrdensServico: (condominioId?: number) => Promise<any[]>;
  getOfflineManutencoes: (condominioId?: number) => Promise<any[]>;
  
  // Estatísticas
  getOfflineStats: () => Promise<{
    timelines: number;
    ordensServico: number;
    manutencoes: number;
    comentarios: number;
    syncQueue: number;
  }>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

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
        
        // Recuperar último sync
        const lastSync = await offlineDB.getMetadata('lastSyncTime');
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
        
        console.log('[Offline] Banco inicializado');
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
      
      // Sincronizar automaticamente quando voltar online
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
          
          // Escutar mensagens do Service Worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_STARTED') {
              setIsSyncing(true);
            }
            if (event.data.type === 'SYNC_COMPLETED') {
              setIsSyncing(false);
              updateSyncQueueCount();
            }
            if (event.data.type === 'SYNC_DATA_TYPE') {
              console.log('[Offline] Sincronizando:', event.data.dataType);
            }
          });
        })
        .catch((error) => {
          console.error('[Offline] Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Sincronização periódica quando online
  useEffect(() => {
    if (isOnline && syncQueueCount > 0) {
      // Sincronizar a cada 30 segundos se houver itens na fila
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

  // Atualizar contagem da fila de sync
  const updateSyncQueueCount = useCallback(async () => {
    try {
      const count = await offlineDB.getSyncQueueCount();
      setSyncQueueCount(count);
    } catch (error) {
      console.error('[Offline] Erro ao atualizar contagem:', error);
    }
  }, []);

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
          
          // Incrementar retries
          item.retries++;
          item.lastError = error.message;
          
          if (item.retries >= 3) {
            // Remover após 3 tentativas
            await offlineDB.removeSyncQueueItem(item.id);
            errorCount++;
          } else {
            await offlineDB.updateSyncQueueItem(item);
          }
        }
      }
      
      // Atualizar último sync
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
      toast.error('Erro na sincronização', {
        description: error.message,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updateSyncQueueCount]);

  // Processar item da fila de sync
  const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
    const { store, operation, data } = item;
    
    // Aqui você faria a chamada real para a API
    // Por enquanto, simulamos o sucesso
    const endpoint = getEndpointForStore(store);
    
    const response = await fetch(endpoint, {
      method: operation === 'delete' ? 'DELETE' : operation === 'create' ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
  };

  // Obter endpoint para cada store
  const getEndpointForStore = (store: string): string => {
    const endpoints: Record<string, string> = {
      timelines: '/api/trpc/timeline.criar',
      ordensServico: '/api/trpc/ordemServico.criar',
      manutencoes: '/api/trpc/manutencao.criar',
      comentarios: '/api/trpc/timeline.criarComentario',
    };
    return endpoints[store] || '/api/trpc/sync';
  };

  // Limpar dados offline
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

  // ==================== FUNÇÕES DE SALVAMENTO OFFLINE ====================

  const saveOfflineTimeline = useCallback(async (timeline: any) => {
    try {
      await offlineDB.saveTimeline(timeline, !isOnline);
      
      if (!isOnline) {
        await offlineDB.addToSyncQueue('timelines', timeline.id ? 'update' : 'create', timeline);
        await updateSyncQueueCount();
      }
    } catch (error) {
      console.error('[Offline] Erro ao salvar timeline:', error);
      throw error;
    }
  }, [isOnline, updateSyncQueueCount]);

  const saveOfflineOrdemServico = useCallback(async (ordem: any) => {
    try {
      await offlineDB.saveOrdemServico(ordem, !isOnline);
      
      if (!isOnline) {
        await offlineDB.addToSyncQueue('ordensServico', ordem.id ? 'update' : 'create', ordem);
        await updateSyncQueueCount();
      }
    } catch (error) {
      console.error('[Offline] Erro ao salvar ordem de serviço:', error);
      throw error;
    }
  }, [isOnline, updateSyncQueueCount]);

  const saveOfflineManutencao = useCallback(async (manutencao: any) => {
    try {
      await offlineDB.saveManutencao(manutencao, !isOnline);
      
      if (!isOnline) {
        await offlineDB.addToSyncQueue('manutencoes', manutencao.id ? 'update' : 'create', manutencao);
        await updateSyncQueueCount();
      }
    } catch (error) {
      console.error('[Offline] Erro ao salvar manutenção:', error);
      throw error;
    }
  }, [isOnline, updateSyncQueueCount]);

  const saveOfflineComentario = useCallback(async (comentario: any) => {
    try {
      await offlineDB.saveComentario(comentario, !isOnline);
      
      if (!isOnline) {
        await offlineDB.addToSyncQueue('comentarios', 'create', comentario);
        await updateSyncQueueCount();
      }
    } catch (error) {
      console.error('[Offline] Erro ao salvar comentário:', error);
      throw error;
    }
  }, [isOnline, updateSyncQueueCount]);

  // ==================== FUNÇÕES DE LEITURA OFFLINE ====================

  const getOfflineTimelines = useCallback(async (condominioId?: number) => {
    try {
      if (condominioId) {
        return await offlineDB.getTimelinesByCondominio(condominioId);
      }
      return await offlineDB.getAllTimelines();
    } catch (error) {
      console.error('[Offline] Erro ao obter timelines:', error);
      return [];
    }
  }, []);

  const getOfflineOrdensServico = useCallback(async (condominioId?: number) => {
    try {
      if (condominioId) {
        return await offlineDB.getOrdensServicoByCondominio(condominioId);
      }
      return await offlineDB.getAllOrdensServico();
    } catch (error) {
      console.error('[Offline] Erro ao obter ordens de serviço:', error);
      return [];
    }
  }, []);

  const getOfflineManutencoes = useCallback(async (condominioId?: number) => {
    try {
      if (condominioId) {
        return await offlineDB.getManutencoesByCondominio(condominioId);
      }
      return await offlineDB.getAllManutencoes();
    } catch (error) {
      console.error('[Offline] Erro ao obter manutenções:', error);
      return [];
    }
  }, []);

  // ==================== ESTATÍSTICAS ====================

  const getOfflineStats = useCallback(async () => {
    try {
      return await offlineDB.getStats();
    } catch (error) {
      console.error('[Offline] Erro ao obter estatísticas:', error);
      return {
        timelines: 0,
        ordensServico: 0,
        manutencoes: 0,
        comentarios: 0,
        syncQueue: 0,
      };
    }
  }, []);

  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    syncQueueCount,
    lastSyncTime,
    syncError,
    syncNow,
    clearOfflineData,
    saveOfflineTimeline,
    saveOfflineOrdemServico,
    saveOfflineManutencao,
    saveOfflineComentario,
    getOfflineTimelines,
    getOfflineOrdensServico,
    getOfflineManutencoes,
    getOfflineStats,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

// Hook para usar o contexto
export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline deve ser usado dentro de um OfflineProvider');
  }
  return context;
}

// Hook para verificar se está online
export function useIsOnline() {
  const { isOnline } = useOffline();
  return isOnline;
}

// Hook para sincronização
export function useSync() {
  const { isSyncing, syncQueueCount, lastSyncTime, syncNow, syncError } = useOffline();
  return { isSyncing, syncQueueCount, lastSyncTime, syncNow, syncError };
}

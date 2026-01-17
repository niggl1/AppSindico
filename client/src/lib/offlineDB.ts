// IndexedDB para armazenamento local de dados offline
// App Síndico - Plataforma Digital para Condomínios

const DB_NAME = 'app-sindico-offline';
const DB_VERSION = 1;

// Stores (tabelas) do IndexedDB
const STORES = {
  timelines: 'timelines',
  ordensServico: 'ordensServico',
  manutencoes: 'manutencoes',
  comentarios: 'comentarios',
  syncQueue: 'syncQueue', // Fila de sincronização
  metadata: 'metadata', // Metadados e configurações
};

// Tipos de operações na fila de sincronização
export type SyncOperation = 'create' | 'update' | 'delete';

// Item na fila de sincronização
export interface SyncQueueItem {
  id: string;
  store: string;
  operation: SyncOperation;
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

// Interface para dados offline
export interface OfflineData<T> {
  id: string | number;
  data: T;
  lastSync: number;
  isOffline: boolean;
  isDirty: boolean;
}

// Abrir conexão com o banco
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[OfflineDB] Erro ao abrir banco:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store de Timelines
      if (!db.objectStoreNames.contains(STORES.timelines)) {
        const store = db.createObjectStore(STORES.timelines, { keyPath: 'id' });
        store.createIndex('condominioId', 'data.condominioId', { unique: false });
        store.createIndex('status', 'data.status', { unique: false });
        store.createIndex('lastSync', 'lastSync', { unique: false });
      }

      // Store de Ordens de Serviço
      if (!db.objectStoreNames.contains(STORES.ordensServico)) {
        const store = db.createObjectStore(STORES.ordensServico, { keyPath: 'id' });
        store.createIndex('condominioId', 'data.condominioId', { unique: false });
        store.createIndex('status', 'data.status', { unique: false });
        store.createIndex('lastSync', 'lastSync', { unique: false });
      }

      // Store de Manutenções
      if (!db.objectStoreNames.contains(STORES.manutencoes)) {
        const store = db.createObjectStore(STORES.manutencoes, { keyPath: 'id' });
        store.createIndex('condominioId', 'data.condominioId', { unique: false });
        store.createIndex('status', 'data.status', { unique: false });
        store.createIndex('lastSync', 'lastSync', { unique: false });
      }

      // Store de Comentários
      if (!db.objectStoreNames.contains(STORES.comentarios)) {
        const store = db.createObjectStore(STORES.comentarios, { keyPath: 'id' });
        store.createIndex('timelineId', 'data.timelineId', { unique: false });
        store.createIndex('lastSync', 'lastSync', { unique: false });
      }

      // Store de Fila de Sincronização
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' });
        store.createIndex('store', 'store', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store de Metadados
      if (!db.objectStoreNames.contains(STORES.metadata)) {
        db.createObjectStore(STORES.metadata, { keyPath: 'key' });
      }
    };
  });
}

// Classe principal do OfflineDB
class OfflineDB {
  private db: IDBDatabase | null = null;

  // Inicializar conexão
  async init(): Promise<void> {
    if (!this.db) {
      this.db = await openDB();
    }
  }

  // Garantir que o banco está aberto
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== OPERAÇÕES GENÉRICAS ====================

  // Salvar item
  async save<T>(storeName: string, id: string | number, data: T, isOffline = false): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const item: OfflineData<T> = {
        id,
        data,
        lastSync: Date.now(),
        isOffline,
        isDirty: isOffline,
      };
      
      const request = store.put(item);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Obter item por ID
  async get<T>(storeName: string, id: string | number): Promise<OfflineData<T> | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter todos os itens
  async getAll<T>(storeName: string): Promise<OfflineData<T>[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter itens por índice
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<OfflineData<T>[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Deletar item
  async delete(storeName: string, id: string | number): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar store
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== TIMELINES ====================

  async saveTimeline(timeline: any, isOffline = false): Promise<void> {
    await this.save(STORES.timelines, timeline.id, timeline, isOffline);
  }

  async getTimeline(id: number): Promise<any | null> {
    const result = await this.get<any>(STORES.timelines, id);
    return result?.data || null;
  }

  async getAllTimelines(): Promise<any[]> {
    const results = await this.getAll<any>(STORES.timelines);
    return results.map(r => r.data);
  }

  async getTimelinesByCondominio(condominioId: number): Promise<any[]> {
    const results = await this.getByIndex<any>(STORES.timelines, 'condominioId', condominioId);
    return results.map(r => r.data);
  }

  async deleteTimeline(id: number): Promise<void> {
    await this.delete(STORES.timelines, id);
  }

  // ==================== ORDENS DE SERVIÇO ====================

  async saveOrdemServico(ordem: any, isOffline = false): Promise<void> {
    await this.save(STORES.ordensServico, ordem.id, ordem, isOffline);
  }

  async getOrdemServico(id: number): Promise<any | null> {
    const result = await this.get<any>(STORES.ordensServico, id);
    return result?.data || null;
  }

  async getAllOrdensServico(): Promise<any[]> {
    const results = await this.getAll<any>(STORES.ordensServico);
    return results.map(r => r.data);
  }

  async getOrdensServicoByCondominio(condominioId: number): Promise<any[]> {
    const results = await this.getByIndex<any>(STORES.ordensServico, 'condominioId', condominioId);
    return results.map(r => r.data);
  }

  async deleteOrdemServico(id: number): Promise<void> {
    await this.delete(STORES.ordensServico, id);
  }

  // ==================== MANUTENÇÕES ====================

  async saveManutencao(manutencao: any, isOffline = false): Promise<void> {
    await this.save(STORES.manutencoes, manutencao.id, manutencao, isOffline);
  }

  async getManutencao(id: number): Promise<any | null> {
    const result = await this.get<any>(STORES.manutencoes, id);
    return result?.data || null;
  }

  async getAllManutencoes(): Promise<any[]> {
    const results = await this.getAll<any>(STORES.manutencoes);
    return results.map(r => r.data);
  }

  async getManutencoesByCondominio(condominioId: number): Promise<any[]> {
    const results = await this.getByIndex<any>(STORES.manutencoes, 'condominioId', condominioId);
    return results.map(r => r.data);
  }

  async deleteManutencao(id: number): Promise<void> {
    await this.delete(STORES.manutencoes, id);
  }

  // ==================== COMENTÁRIOS ====================

  async saveComentario(comentario: any, isOffline = false): Promise<void> {
    await this.save(STORES.comentarios, comentario.id, comentario, isOffline);
  }

  async getComentariosByTimeline(timelineId: number): Promise<any[]> {
    const results = await this.getByIndex<any>(STORES.comentarios, 'timelineId', timelineId);
    return results.map(r => r.data);
  }

  // ==================== FILA DE SINCRONIZAÇÃO ====================

  async addToSyncQueue(store: string, operation: SyncOperation, data: any): Promise<void> {
    const db = await this.ensureDB();
    
    const item: SyncQueueItem = {
      id: `${store}-${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      store,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readwrite');
      const storeObj = transaction.objectStore(STORES.syncQueue);
      const request = storeObj.add(item);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const results = await this.getAll<SyncQueueItem>(STORES.syncQueue);
    return results.map(r => r.data).sort((a, b) => a.timestamp - b.timestamp);
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    await this.delete(STORES.syncQueue, id);
  }

  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readwrite');
      const store = transaction.objectStore(STORES.syncQueue);
      const request = store.put(item);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueueCount(): Promise<number> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readonly');
      const store = transaction.objectStore(STORES.syncQueue);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== METADADOS ====================

  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.metadata, 'readwrite');
      const store = transaction.objectStore(STORES.metadata);
      const request = store.put({ key, value, updatedAt: Date.now() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(key: string): Promise<any> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.metadata, 'readonly');
      const store = transaction.objectStore(STORES.metadata);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITÁRIOS ====================

  // Obter itens que precisam ser sincronizados
  async getDirtyItems(storeName: string): Promise<OfflineData<any>[]> {
    const all = await this.getAll<any>(storeName);
    return all.filter(item => item.isDirty);
  }

  // Marcar item como sincronizado
  async markAsSynced(storeName: string, id: string | number): Promise<void> {
    const item = await this.get<any>(storeName, id);
    if (item) {
      item.isDirty = false;
      item.isOffline = false;
      item.lastSync = Date.now();
      
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Obter estatísticas do banco
  async getStats(): Promise<{
    timelines: number;
    ordensServico: number;
    manutencoes: number;
    comentarios: number;
    syncQueue: number;
  }> {
    const db = await this.ensureDB();
    
    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };
    
    const [timelines, ordensServico, manutencoes, comentarios, syncQueue] = await Promise.all([
      getCount(STORES.timelines),
      getCount(STORES.ordensServico),
      getCount(STORES.manutencoes),
      getCount(STORES.comentarios),
      getCount(STORES.syncQueue),
    ]);
    
    return { timelines, ordensServico, manutencoes, comentarios, syncQueue };
  }

  // Limpar todos os dados
  async clearAll(): Promise<void> {
    await Promise.all([
      this.clear(STORES.timelines),
      this.clear(STORES.ordensServico),
      this.clear(STORES.manutencoes),
      this.clear(STORES.comentarios),
      this.clear(STORES.syncQueue),
      this.clear(STORES.metadata),
    ]);
  }
}

// Instância singleton
export const offlineDB = new OfflineDB();

// Exportar stores para uso externo
export { STORES };

// IndexedDB para armazenamento local de dados offline
// App Síndico - Plataforma Digital para Condomínios

const DB_NAME = 'app-sindico-offline';
const DB_VERSION = 2; // Incrementar versão para atualizar schema

// Stores (tabelas) do IndexedDB - Todas as funções do sistema
const STORES = {
  // Operacional
  timelines: 'timelines',
  ordensServico: 'ordensServico',
  manutencoes: 'manutencoes',
  comentarios: 'comentarios',
  
  // Comunicação
  avisos: 'avisos',
  enquetes: 'enquetes',
  comunicados: 'comunicados',
  mensagens: 'mensagens',
  
  // Financeiro
  boletos: 'boletos',
  prestacaoContas: 'prestacaoContas',
  despesas: 'despesas',
  receitas: 'receitas',
  
  // Cadastros
  moradores: 'moradores',
  funcionarios: 'funcionarios',
  fornecedores: 'fornecedores',
  veiculos: 'veiculos',
  unidades: 'unidades',
  condominios: 'condominios',
  
  // Documentos
  atas: 'atas',
  regulamentos: 'regulamentos',
  contratos: 'contratos',
  arquivos: 'arquivos',
  
  // Reservas
  areasComuns: 'areasComuns',
  reservas: 'reservas',
  
  // Ocorrências
  ocorrencias: 'ocorrencias',
  
  // Revistas
  revistas: 'revistas',
  revistasDados: 'revistasDados',
  
  // Sistema
  syncQueue: 'syncQueue',
  metadata: 'metadata',
  cache: 'cache',
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

// Criar store genérica com índices padrão
function createStoreWithIndexes(db: IDBDatabase, storeName: string, extraIndexes: string[] = []) {
  if (!db.objectStoreNames.contains(storeName)) {
    const store = db.createObjectStore(storeName, { keyPath: 'id' });
    store.createIndex('condominioId', 'data.condominioId', { unique: false });
    store.createIndex('lastSync', 'lastSync', { unique: false });
    store.createIndex('isDirty', 'isDirty', { unique: false });
    
    extraIndexes.forEach(indexName => {
      store.createIndex(indexName, `data.${indexName}`, { unique: false });
    });
  }
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

      // ==================== OPERACIONAL ====================
      createStoreWithIndexes(db, STORES.timelines, ['status', 'tipo']);
      createStoreWithIndexes(db, STORES.ordensServico, ['status', 'prioridade']);
      createStoreWithIndexes(db, STORES.manutencoes, ['status', 'tipo']);
      createStoreWithIndexes(db, STORES.comentarios, ['timelineId', 'ordemServicoId']);

      // ==================== COMUNICAÇÃO ====================
      createStoreWithIndexes(db, STORES.avisos, ['status', 'tipo', 'dataPublicacao']);
      createStoreWithIndexes(db, STORES.enquetes, ['status', 'dataInicio', 'dataFim']);
      createStoreWithIndexes(db, STORES.comunicados, ['tipo', 'dataEnvio']);
      createStoreWithIndexes(db, STORES.mensagens, ['remetenteId', 'destinatarioId', 'lida']);

      // ==================== FINANCEIRO ====================
      createStoreWithIndexes(db, STORES.boletos, ['status', 'vencimento', 'unidadeId']);
      createStoreWithIndexes(db, STORES.prestacaoContas, ['mes', 'ano', 'status']);
      createStoreWithIndexes(db, STORES.despesas, ['categoria', 'data', 'status']);
      createStoreWithIndexes(db, STORES.receitas, ['categoria', 'data', 'status']);

      // ==================== CADASTROS ====================
      createStoreWithIndexes(db, STORES.moradores, ['unidadeId', 'tipo', 'ativo']);
      createStoreWithIndexes(db, STORES.funcionarios, ['cargo', 'ativo']);
      createStoreWithIndexes(db, STORES.fornecedores, ['categoria', 'ativo']);
      createStoreWithIndexes(db, STORES.veiculos, ['tipo', 'unidadeId']);
      createStoreWithIndexes(db, STORES.unidades, ['bloco', 'tipo']);
      createStoreWithIndexes(db, STORES.condominios, ['ativo']);

      // ==================== DOCUMENTOS ====================
      createStoreWithIndexes(db, STORES.atas, ['tipo', 'dataReuniao']);
      createStoreWithIndexes(db, STORES.regulamentos, ['tipo', 'vigente']);
      createStoreWithIndexes(db, STORES.contratos, ['tipo', 'status', 'dataVencimento']);
      createStoreWithIndexes(db, STORES.arquivos, ['categoria', 'tipo']);

      // ==================== RESERVAS ====================
      createStoreWithIndexes(db, STORES.areasComuns, ['tipo', 'ativa']);
      createStoreWithIndexes(db, STORES.reservas, ['areaId', 'data', 'status', 'moradorId']);

      // ==================== OCORRÊNCIAS ====================
      createStoreWithIndexes(db, STORES.ocorrencias, ['tipo', 'status', 'prioridade', 'data']);

      // ==================== SISTEMA ====================
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' });
        store.createIndex('store', 'store', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('operation', 'operation', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.metadata)) {
        db.createObjectStore(STORES.metadata, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.cache)) {
        const store = db.createObjectStore(STORES.cache, { keyPath: 'key' });
        store.createIndex('expiry', 'expiry', { unique: false });
      }
    };
  });
}

// Classe principal do OfflineDB
class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await openDB();
    }
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== OPERAÇÕES GENÉRICAS ====================

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

  async count(storeName: string): Promise<number> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== HELPERS POR MÓDULO ====================

  // Helper genérico para salvar dados de um módulo
  private async saveModuleData(storeName: string, data: any, isOffline = false): Promise<void> {
    await this.save(storeName, data.id, data, isOffline);
  }

  // Helper genérico para obter dados de um módulo
  private async getModuleData<T>(storeName: string, id: number): Promise<T | null> {
    const result = await this.get<T>(storeName, id);
    return result?.data || null;
  }

  // Helper genérico para obter todos os dados de um módulo
  private async getAllModuleData<T>(storeName: string): Promise<T[]> {
    const results = await this.getAll<T>(storeName);
    return results.map(r => r.data);
  }

  // Helper genérico para obter dados por condomínio
  private async getModuleDataByCondominio<T>(storeName: string, condominioId: number): Promise<T[]> {
    const results = await this.getByIndex<T>(storeName, 'condominioId', condominioId);
    return results.map(r => r.data);
  }

  // ==================== TIMELINES ====================
  async saveTimeline(data: any, isOffline = false) { await this.saveModuleData(STORES.timelines, data, isOffline); }
  async getTimeline(id: number) { return this.getModuleData(STORES.timelines, id); }
  async getAllTimelines() { return this.getAllModuleData(STORES.timelines); }
  async getTimelinesByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.timelines, condominioId); }
  async deleteTimeline(id: number) { await this.delete(STORES.timelines, id); }

  // ==================== ORDENS DE SERVIÇO ====================
  async saveOrdemServico(data: any, isOffline = false) { await this.saveModuleData(STORES.ordensServico, data, isOffline); }
  async getOrdemServico(id: number) { return this.getModuleData(STORES.ordensServico, id); }
  async getAllOrdensServico() { return this.getAllModuleData(STORES.ordensServico); }
  async getOrdensServicoByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.ordensServico, condominioId); }
  async deleteOrdemServico(id: number) { await this.delete(STORES.ordensServico, id); }

  // ==================== MANUTENÇÕES ====================
  async saveManutencao(data: any, isOffline = false) { await this.saveModuleData(STORES.manutencoes, data, isOffline); }
  async getManutencao(id: number) { return this.getModuleData(STORES.manutencoes, id); }
  async getAllManutencoes() { return this.getAllModuleData(STORES.manutencoes); }
  async getManutencoesByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.manutencoes, condominioId); }
  async deleteManutencao(id: number) { await this.delete(STORES.manutencoes, id); }

  // ==================== COMENTÁRIOS ====================
  async saveComentario(data: any, isOffline = false) { await this.saveModuleData(STORES.comentarios, data, isOffline); }
  async getComentariosByTimeline(timelineId: number) {
    const results = await this.getByIndex<any>(STORES.comentarios, 'timelineId', timelineId);
    return results.map(r => r.data);
  }

  // ==================== AVISOS ====================
  async saveAviso(data: any, isOffline = false) { await this.saveModuleData(STORES.avisos, data, isOffline); }
  async getAviso(id: number) { return this.getModuleData(STORES.avisos, id); }
  async getAllAvisos() { return this.getAllModuleData(STORES.avisos); }
  async getAvisosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.avisos, condominioId); }
  async deleteAviso(id: number) { await this.delete(STORES.avisos, id); }

  // ==================== ENQUETES ====================
  async saveEnquete(data: any, isOffline = false) { await this.saveModuleData(STORES.enquetes, data, isOffline); }
  async getEnquete(id: number) { return this.getModuleData(STORES.enquetes, id); }
  async getAllEnquetes() { return this.getAllModuleData(STORES.enquetes); }
  async getEnquetesByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.enquetes, condominioId); }
  async deleteEnquete(id: number) { await this.delete(STORES.enquetes, id); }

  // ==================== COMUNICADOS ====================
  async saveComunicado(data: any, isOffline = false) { await this.saveModuleData(STORES.comunicados, data, isOffline); }
  async getComunicado(id: number) { return this.getModuleData(STORES.comunicados, id); }
  async getAllComunicados() { return this.getAllModuleData(STORES.comunicados); }
  async getComunicadosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.comunicados, condominioId); }
  async deleteComunicado(id: number) { await this.delete(STORES.comunicados, id); }

  // ==================== MENSAGENS ====================
  async saveMensagem(data: any, isOffline = false) { await this.saveModuleData(STORES.mensagens, data, isOffline); }
  async getMensagem(id: number) { return this.getModuleData(STORES.mensagens, id); }
  async getAllMensagens() { return this.getAllModuleData(STORES.mensagens); }
  async getMensagensByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.mensagens, condominioId); }
  async deleteMensagem(id: number) { await this.delete(STORES.mensagens, id); }

  // ==================== BOLETOS ====================
  async saveBoleto(data: any, isOffline = false) { await this.saveModuleData(STORES.boletos, data, isOffline); }
  async getBoleto(id: number) { return this.getModuleData(STORES.boletos, id); }
  async getAllBoletos() { return this.getAllModuleData(STORES.boletos); }
  async getBoletosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.boletos, condominioId); }
  async deleteBoleto(id: number) { await this.delete(STORES.boletos, id); }

  // ==================== PRESTAÇÃO DE CONTAS ====================
  async savePrestacaoContas(data: any, isOffline = false) { await this.saveModuleData(STORES.prestacaoContas, data, isOffline); }
  async getPrestacaoContas(id: number) { return this.getModuleData(STORES.prestacaoContas, id); }
  async getAllPrestacaoContas() { return this.getAllModuleData(STORES.prestacaoContas); }
  async getPrestacaoContasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.prestacaoContas, condominioId); }
  async deletePrestacaoContas(id: number) { await this.delete(STORES.prestacaoContas, id); }

  // ==================== DESPESAS ====================
  async saveDespesa(data: any, isOffline = false) { await this.saveModuleData(STORES.despesas, data, isOffline); }
  async getDespesa(id: number) { return this.getModuleData(STORES.despesas, id); }
  async getAllDespesas() { return this.getAllModuleData(STORES.despesas); }
  async getDespesasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.despesas, condominioId); }
  async deleteDespesa(id: number) { await this.delete(STORES.despesas, id); }

  // ==================== RECEITAS ====================
  async saveReceita(data: any, isOffline = false) { await this.saveModuleData(STORES.receitas, data, isOffline); }
  async getReceita(id: number) { return this.getModuleData(STORES.receitas, id); }
  async getAllReceitas() { return this.getAllModuleData(STORES.receitas); }
  async getReceitasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.receitas, condominioId); }
  async deleteReceita(id: number) { await this.delete(STORES.receitas, id); }

  // ==================== MORADORES ====================
  async saveMorador(data: any, isOffline = false) { await this.saveModuleData(STORES.moradores, data, isOffline); }
  async getMorador(id: number) { return this.getModuleData(STORES.moradores, id); }
  async getAllMoradores() { return this.getAllModuleData(STORES.moradores); }
  async getMoradoresByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.moradores, condominioId); }
  async deleteMorador(id: number) { await this.delete(STORES.moradores, id); }

  // ==================== FUNCIONÁRIOS ====================
  async saveFuncionario(data: any, isOffline = false) { await this.saveModuleData(STORES.funcionarios, data, isOffline); }
  async getFuncionario(id: number) { return this.getModuleData(STORES.funcionarios, id); }
  async getAllFuncionarios() { return this.getAllModuleData(STORES.funcionarios); }
  async getFuncionariosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.funcionarios, condominioId); }
  async deleteFuncionario(id: number) { await this.delete(STORES.funcionarios, id); }

  // ==================== FORNECEDORES ====================
  async saveFornecedor(data: any, isOffline = false) { await this.saveModuleData(STORES.fornecedores, data, isOffline); }
  async getFornecedor(id: number) { return this.getModuleData(STORES.fornecedores, id); }
  async getAllFornecedores() { return this.getAllModuleData(STORES.fornecedores); }
  async getFornecedoresByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.fornecedores, condominioId); }
  async deleteFornecedor(id: number) { await this.delete(STORES.fornecedores, id); }

  // ==================== VEÍCULOS ====================
  async saveVeiculo(data: any, isOffline = false) { await this.saveModuleData(STORES.veiculos, data, isOffline); }
  async getVeiculo(id: number) { return this.getModuleData(STORES.veiculos, id); }
  async getAllVeiculos() { return this.getAllModuleData(STORES.veiculos); }
  async getVeiculosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.veiculos, condominioId); }
  async deleteVeiculo(id: number) { await this.delete(STORES.veiculos, id); }

  // ==================== UNIDADES ====================
  async saveUnidade(data: any, isOffline = false) { await this.saveModuleData(STORES.unidades, data, isOffline); }
  async getUnidade(id: number) { return this.getModuleData(STORES.unidades, id); }
  async getAllUnidades() { return this.getAllModuleData(STORES.unidades); }
  async getUnidadesByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.unidades, condominioId); }
  async deleteUnidade(id: number) { await this.delete(STORES.unidades, id); }

  // ==================== CONDOMÍNIOS ====================
  async saveCondominio(data: any, isOffline = false) { await this.saveModuleData(STORES.condominios, data, isOffline); }
  async getCondominio(id: number) { return this.getModuleData(STORES.condominios, id); }
  async getAllCondominios() { return this.getAllModuleData(STORES.condominios); }
  async deleteCondominio(id: number) { await this.delete(STORES.condominios, id); }

  // ==================== ATAS ====================
  async saveAta(data: any, isOffline = false) { await this.saveModuleData(STORES.atas, data, isOffline); }
  async getAta(id: number) { return this.getModuleData(STORES.atas, id); }
  async getAllAtas() { return this.getAllModuleData(STORES.atas); }
  async getAtasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.atas, condominioId); }
  async deleteAta(id: number) { await this.delete(STORES.atas, id); }

  // ==================== REGULAMENTOS ====================
  async saveRegulamento(data: any, isOffline = false) { await this.saveModuleData(STORES.regulamentos, data, isOffline); }
  async getRegulamento(id: number) { return this.getModuleData(STORES.regulamentos, id); }
  async getAllRegulamentos() { return this.getAllModuleData(STORES.regulamentos); }
  async getRegulamentosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.regulamentos, condominioId); }
  async deleteRegulamento(id: number) { await this.delete(STORES.regulamentos, id); }

  // ==================== CONTRATOS ====================
  async saveContrato(data: any, isOffline = false) { await this.saveModuleData(STORES.contratos, data, isOffline); }
  async getContrato(id: number) { return this.getModuleData(STORES.contratos, id); }
  async getAllContratos() { return this.getAllModuleData(STORES.contratos); }
  async getContratosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.contratos, condominioId); }
  async deleteContrato(id: number) { await this.delete(STORES.contratos, id); }

  // ==================== ARQUIVOS ====================
  async saveArquivo(data: any, isOffline = false) { await this.saveModuleData(STORES.arquivos, data, isOffline); }
  async getArquivo(id: number) { return this.getModuleData(STORES.arquivos, id); }
  async getAllArquivos() { return this.getAllModuleData(STORES.arquivos); }
  async getArquivosByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.arquivos, condominioId); }
  async deleteArquivo(id: number) { await this.delete(STORES.arquivos, id); }

  // ==================== ÁREAS COMUNS ====================
  async saveAreaComum(data: any, isOffline = false) { await this.saveModuleData(STORES.areasComuns, data, isOffline); }
  async getAreaComum(id: number) { return this.getModuleData(STORES.areasComuns, id); }
  async getAllAreasComuns() { return this.getAllModuleData(STORES.areasComuns); }
  async getAreasComunsByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.areasComuns, condominioId); }
  async deleteAreaComum(id: number) { await this.delete(STORES.areasComuns, id); }

  // ==================== RESERVAS ====================
  async saveReserva(data: any, isOffline = false) { await this.saveModuleData(STORES.reservas, data, isOffline); }
  async getReserva(id: number) { return this.getModuleData(STORES.reservas, id); }
  async getAllReservas() { return this.getAllModuleData(STORES.reservas); }
  async getReservasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.reservas, condominioId); }
  async deleteReserva(id: number) { await this.delete(STORES.reservas, id); }

  // ==================== OCORRÊNCIAS ====================
  async saveOcorrencia(data: any, isOffline = false) { await this.saveModuleData(STORES.ocorrencias, data, isOffline); }
  async getOcorrencia(id: number) { return this.getModuleData(STORES.ocorrencias, id); }
  async getAllOcorrencias() { return this.getAllModuleData(STORES.ocorrencias); }
  async getOcorrenciasByCondominio(condominioId: number) { return this.getModuleDataByCondominio(STORES.ocorrencias, condominioId); }
  async deleteOcorrencia(id: number) { await this.delete(STORES.ocorrencias, id); }

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
    return this.count(STORES.syncQueue);
  }

  async getSyncQueueByStore(storeName: string): Promise<SyncQueueItem[]> {
    const results = await this.getByIndex<SyncQueueItem>(STORES.syncQueue, 'store', storeName);
    return results.map(r => r.data);
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

  // ==================== CACHE ====================

  async setCache(key: string, value: any, ttlMs: number = 3600000): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.cache, 'readwrite');
      const store = transaction.objectStore(STORES.cache);
      const request = store.put({
        key,
        value,
        expiry: Date.now() + ttlMs,
        createdAt: Date.now(),
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCache(key: string): Promise<any | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.cache, 'readonly');
      const store = transaction.objectStore(STORES.cache);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result || result.expiry < Date.now()) {
          resolve(null);
        } else {
          resolve(result.value);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    const db = await this.ensureDB();
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.cache, 'readwrite');
      const store = transaction.objectStore(STORES.cache);
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(now);
      
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITÁRIOS ====================

  async getDirtyItems(storeName: string): Promise<OfflineData<any>[]> {
    const all = await this.getAll<any>(storeName);
    return all.filter(item => item.isDirty);
  }

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

  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    for (const [key, storeName] of Object.entries(STORES)) {
      try {
        stats[key] = await this.count(storeName);
      } catch {
        stats[key] = 0;
      }
    }
    
    return stats;
  }

  async getStatsByModule(): Promise<{
    operacional: { timelines: number; ordensServico: number; manutencoes: number; comentarios: number };
    comunicacao: { avisos: number; enquetes: number; comunicados: number; mensagens: number };
    financeiro: { boletos: number; prestacaoContas: number; despesas: number; receitas: number };
    cadastros: { moradores: number; funcionarios: number; fornecedores: number; veiculos: number; unidades: number; condominios: number };
    documentos: { atas: number; regulamentos: number; contratos: number; arquivos: number };
    reservas: { areasComuns: number; reservas: number };
    ocorrencias: { ocorrencias: number };
    sistema: { syncQueue: number; metadata: number; cache: number };
  }> {
    const stats = await this.getStats();
    
    return {
      operacional: {
        timelines: stats.timelines || 0,
        ordensServico: stats.ordensServico || 0,
        manutencoes: stats.manutencoes || 0,
        comentarios: stats.comentarios || 0,
      },
      comunicacao: {
        avisos: stats.avisos || 0,
        enquetes: stats.enquetes || 0,
        comunicados: stats.comunicados || 0,
        mensagens: stats.mensagens || 0,
      },
      financeiro: {
        boletos: stats.boletos || 0,
        prestacaoContas: stats.prestacaoContas || 0,
        despesas: stats.despesas || 0,
        receitas: stats.receitas || 0,
      },
      cadastros: {
        moradores: stats.moradores || 0,
        funcionarios: stats.funcionarios || 0,
        fornecedores: stats.fornecedores || 0,
        veiculos: stats.veiculos || 0,
        unidades: stats.unidades || 0,
        condominios: stats.condominios || 0,
      },
      documentos: {
        atas: stats.atas || 0,
        regulamentos: stats.regulamentos || 0,
        contratos: stats.contratos || 0,
        arquivos: stats.arquivos || 0,
      },
      reservas: {
        areasComuns: stats.areasComuns || 0,
        reservas: stats.reservas || 0,
      },
      ocorrencias: {
        ocorrencias: stats.ocorrencias || 0,
      },
      sistema: {
        syncQueue: stats.syncQueue || 0,
        metadata: stats.metadata || 0,
        cache: stats.cache || 0,
      },
    };
  }

  async clearAll(): Promise<void> {
    for (const storeName of Object.values(STORES)) {
      try {
        await this.clear(storeName);
      } catch (error) {
        console.error(`[OfflineDB] Erro ao limpar ${storeName}:`, error);
      }
    }
  }

  async clearModule(module: 'operacional' | 'comunicacao' | 'financeiro' | 'cadastros' | 'documentos' | 'reservas' | 'ocorrencias'): Promise<void> {
    const moduleStores: Record<string, string[]> = {
      operacional: [STORES.timelines, STORES.ordensServico, STORES.manutencoes, STORES.comentarios],
      comunicacao: [STORES.avisos, STORES.enquetes, STORES.comunicados, STORES.mensagens],
      financeiro: [STORES.boletos, STORES.prestacaoContas, STORES.despesas, STORES.receitas],
      cadastros: [STORES.moradores, STORES.funcionarios, STORES.fornecedores, STORES.veiculos, STORES.unidades, STORES.condominios],
      documentos: [STORES.atas, STORES.regulamentos, STORES.contratos, STORES.arquivos],
      reservas: [STORES.areasComuns, STORES.reservas],
      ocorrencias: [STORES.ocorrencias],
    };
    
    const stores = moduleStores[module] || [];
    for (const storeName of stores) {
      try {
        await this.clear(storeName);
      } catch (error) {
        console.error(`[OfflineDB] Erro ao limpar ${storeName}:`, error);
      }
    }
  }

  // ==================== FUNÇÕES ESPECÍFICAS PARA REVISTAS ====================
  
  // Salvar revista para leitura offline
  async salvarRevistaOffline(revistaId: number, dadosCompletos: any): Promise<void> {
    // Salvar metadados da revista
    await this.save(STORES.revistas, revistaId, {
      id: revistaId,
      titulo: dadosCompletos.titulo,
      edicao: dadosCompletos.edicao,
      condominioId: dadosCompletos.condominioId,
      shareLink: dadosCompletos.shareLink,
      capaUrl: dadosCompletos.capaUrl,
      salvadoEm: Date.now(),
    }, false);
    
    // Salvar dados completos da revista (seções, conteúdo, etc.)
    await this.save(STORES.revistasDados, revistaId, dadosCompletos, false);
  }
  
  // Obter revista offline
  async obterRevistaOffline(revistaId: number): Promise<any | null> {
    return this.get(STORES.revistasDados, revistaId);
  }
  
  // Listar revistas salvas offline
  async listarRevistasOffline(): Promise<any[]> {
    return this.getAllModuleData(STORES.revistas);
  }
  
  // Verificar se revista está disponível offline
  async revistaDisponivelOffline(revistaId: number): Promise<boolean> {
    const revista = await this.get(STORES.revistas, revistaId);
    return revista !== null;
  }
  
  // Remover revista offline
  async removerRevistaOffline(revistaId: number): Promise<void> {
    await this.delete(STORES.revistas, revistaId);
    await this.delete(STORES.revistasDados, revistaId);
  }
  
  // Obter tamanho estimado das revistas offline
  async obterTamanhoRevistasOffline(): Promise<number> {
    const revistas = await this.getAllModuleData(STORES.revistasDados);
    return revistas.reduce((total, r) => total + JSON.stringify(r).length, 0);
  }

  // Exportar dados para backup
  async exportData(): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};
    
    for (const [key, storeName] of Object.entries(STORES)) {
      if (storeName !== STORES.syncQueue && storeName !== STORES.metadata && storeName !== STORES.cache) {
        try {
          data[key] = await this.getAllModuleData(storeName);
        } catch {
          data[key] = [];
        }
      }
    }
    
    return data;
  }

  // Importar dados de backup
  async importData(data: Record<string, any[]>): Promise<void> {
    for (const [key, items] of Object.entries(data)) {
      const storeName = STORES[key as keyof typeof STORES];
      if (storeName && items && Array.isArray(items)) {
        for (const item of items) {
          try {
            await this.save(storeName, item.id, item, false);
          } catch (error) {
            console.error(`[OfflineDB] Erro ao importar ${key}:`, error);
          }
        }
      }
    }
  }
}

// Instância singleton
export const offlineDB = new OfflineDB();

// Exportar stores para uso externo
export { STORES };

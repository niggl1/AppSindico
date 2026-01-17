// Indicador de Status Offline - Sistema Completo
// App Síndico - Plataforma Digital para Condomínios

import { useState, useEffect } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  CloudOff,
  Trash2,
  Download,
  Upload,
  HardDrive,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { SyncSettingsDialog } from './SyncSettings';
import { ConflictResolver } from './ConflictResolver';
import { ConflictItem } from '@/lib/conflictResolver';
import { formatSize, getByteSize, compressObject, decompressObject, getCompressionRatio } from '@/lib/compression';
import { toast } from 'sonner';

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

export function OfflineIndicator() {
  const {
    isOnline,
    isSyncing,
    syncQueueCount,
    lastSyncTime,
    syncNow,
    clearOfflineData,
    clearModuleData,
    getOfflineStats,
    exportOfflineData,
    importOfflineData,
  } = useOffline();

  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getOfflineStats();
      setStats(data);
    };
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [getOfflineStats]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTotalItems = () => {
    if (!stats) return 0;
    let total = 0;
    Object.entries(stats).forEach(([key, value]) => {
      if (key !== 'sistema') {
        Object.values(value).forEach((count) => {
          total += count as number;
        });
      }
    });
    return total;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportOfflineData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-sindico-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsImporting(true);
      try {
        const text = await file.text();
        await importOfflineData(text);
        const newStats = await getOfflineStats();
        setStats(newStats);
      } catch (error) {
        toast.error('Erro ao importar backup');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearModule = async (module: string) => {
    if (confirm(`Tem certeza que deseja limpar os dados offline de ${module}?`)) {
      await clearModuleData(module as any);
      const newStats = await getOfflineStats();
      setStats(newStats);
    }
  };

  // Handler para resolver conflito individual
  const handleResolveConflict = (conflict: ConflictItem, resolution: 'local' | 'server' | 'merge', data?: any) => {
    setConflicts(prev => prev.map(c => 
      c.id === conflict.id 
        ? { ...c, resolved: true, resolution, resolvedAt: Date.now(), resolvedData: data }
        : c
    ));
  };

  // Handler para resolver todos os conflitos
  const handleResolveAllConflicts = (strategy: 'newest' | 'oldest' | 'local' | 'server') => {
    setConflicts(prev => prev.map(c => {
      if (c.resolved) return c;
      let resolution: 'local' | 'server' = 'local';
      let resolvedData = c.localData;
      
      if (strategy === 'newest') {
        if (c.serverTimestamp > c.localTimestamp) {
          resolution = 'server';
          resolvedData = c.serverData;
        }
      } else if (strategy === 'oldest') {
        if (c.serverTimestamp < c.localTimestamp) {
          resolution = 'server';
          resolvedData = c.serverData;
        }
      } else if (strategy === 'server') {
        resolution = 'server';
        resolvedData = c.serverData;
      }
      
      return { ...c, resolved: true, resolution, resolvedAt: Date.now(), resolvedData };
    }));
    toast.success('Todos os conflitos foram resolvidos!');
  };

  // Calcular estatísticas de compressão
  const calculateCompressionStats = async () => {
    try {
      const data = await exportOfflineData();
      const original = getByteSize(data);
      const compressed = getByteSize(compressObject(JSON.parse(data)));
      setCompressionStats({ original, compressed });
    } catch (e) {
      console.error('Erro ao calcular compressão:', e);
    }
  };

  const modules = [
    { key: 'operacional', label: 'Operacional', icon: '📋' },
    { key: 'comunicacao', label: 'Comunicação', icon: '📢' },
    { key: 'financeiro', label: 'Financeiro', icon: '💰' },
    { key: 'cadastros', label: 'Cadastros', icon: '👥' },
    { key: 'documentos', label: 'Documentos', icon: '📄' },
    { key: 'reservas', label: 'Reservas', icon: '🏊' },
    { key: 'ocorrencias', label: 'Ocorrências', icon: '⚠️' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative gap-2 ${isOnline ? 'text-green-600' : 'text-red-500'}`}
        >
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
          {syncQueueCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {syncQueueCount > 99 ? '99+' : syncQueueCount}
            </Badge>
          )}
          <span className="hidden sm:inline text-xs">{isOnline ? 'Online' : 'Offline'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className={`p-4 ${isOnline ? 'bg-green-50' : 'bg-red-50'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? <Cloud className="h-5 w-5 text-green-600" /> : <CloudOff className="h-5 w-5 text-red-500" />}
              <div>
                <p className={`font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                  {isOnline ? 'Conectado' : 'Sem conexão'}
                </p>
                <p className="text-xs text-muted-foreground">{getTotalItems()} itens salvos offline</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={syncNow} disabled={!isOnline || isSyncing} className="gap-1">
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Última sync: {formatDate(lastSyncTime)}</span>
            </div>
            {syncQueueCount > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>{syncQueueCount} pendente(s)</span>
              </div>
            )}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {modules.map((module) => {
            const moduleStats = stats?.[module.key as keyof ModuleStats];
            const totalItems = moduleStats ? Object.values(moduleStats).reduce((a, b) => a + (b as number), 0) : 0;
            const isExpanded = expandedModule === module.key;
            return (
              <div key={module.key} className="border-b last:border-b-0">
                <button
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedModule(isExpanded ? null : module.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{module.icon}</span>
                    <span className="text-sm font-medium">{module.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{totalItems}</Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                {isExpanded && moduleStats && (
                  <div className="px-3 pb-3 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(moduleStats).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium">{value as number}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleClearModule(module.key)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Limpar {module.label}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={isExporting} className="text-xs">
              <Download className={`h-3 w-3 mr-1 ${isExporting ? 'animate-pulse' : ''}`} />
              Exportar
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport} disabled={isImporting} className="text-xs">
              <Upload className={`h-3 w-3 mr-1 ${isImporting ? 'animate-pulse' : ''}`} />
              Importar
            </Button>
          </div>
          
          {/* Botões de Configurações e Conflitos */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <SyncSettingsDialog
              trigger={
                <Button size="sm" variant="outline" className="text-xs w-full">
                  <Settings className="h-3 w-3 mr-1" />
                  Config Sync
                </Button>
              }
            />
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowConflicts(true)}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Conflitos {conflicts.filter(c => !c.resolved).length > 0 && `(${conflicts.filter(c => !c.resolved).length})`}
            </Button>
          </div>
          
          {/* Estatísticas de Compressão */}
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs"
            onClick={calculateCompressionStats}
          >
            <Zap className="h-3 w-3 mr-1" />
            {compressionStats 
              ? `Compressão: ${formatSize(compressionStats.original)} → ${formatSize(compressionStats.compressed)} (${getCompressionRatio(String(compressionStats.original), String(compressionStats.compressed)).toFixed(1)}% economia)`
              : 'Calcular Compressão'
            }
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar TODOS os dados offline?')) {
                clearOfflineData();
              }
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar todos os dados offline
          </Button>
        </div>
        
        {/* Modal de Resolução de Conflitos */}
        <ConflictResolver
          conflicts={conflicts}
          open={showConflicts}
          onOpenChange={setShowConflicts}
          onResolve={handleResolveConflict}
          onResolveAll={handleResolveAllConflicts}
        />
        <div className="p-2 bg-blue-50 border-t">
          <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-1">
            <HardDrive className="h-3 w-3" />
            Dados armazenados localmente no seu dispositivo
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function OfflineIndicatorCompact() {
  const { isOnline, syncQueueCount, isSyncing, syncNow } = useOffline();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={syncNow}
        disabled={!isOnline || isSyncing}
        className={`p-1 rounded transition-colors ${isOnline ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
        title={isOnline ? 'Online - Clique para sincronizar' : 'Offline'}
      >
        {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
      </button>
      {syncQueueCount > 0 && <Badge variant="destructive" className="text-xs px-1 py-0">{syncQueueCount}</Badge>}
    </div>
  );
}

export function OfflineBanner() {
  const { isOnline, syncQueueCount } = useOffline();
  if (isOnline) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-amber-800">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Você está offline</span>
          {syncQueueCount > 0 && <span className="text-xs text-amber-600">({syncQueueCount} alterações pendentes)</span>}
        </div>
        <p className="text-xs text-amber-600">Os dados serão sincronizados automaticamente quando a conexão retornar</p>
      </div>
    </div>
  );
}

export default OfflineIndicator;

// Indicador de Status de Conexão Offline
// App Síndico - Plataforma Digital para Condomínios

import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  CloudOff,
  Database,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const {
    isOnline,
    isSyncing,
    syncQueueCount,
    lastSyncTime,
    syncError,
    syncNow,
    clearOfflineData,
    getOfflineStats,
  } = useOffline();

  const [stats, setStats] = useState({
    timelines: 0,
    ordensServico: 0,
    manutencoes: 0,
    comentarios: 0,
    syncQueue: 0,
  });
  const [isOpen, setIsOpen] = useState(false);

  // Atualizar estatísticas quando abrir o popover
  useEffect(() => {
    if (isOpen) {
      getOfflineStats().then(setStats);
    }
  }, [isOpen, getOfflineStats]);

  // Formatar tempo desde último sync
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    
    const diff = Date.now() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora';
  };

  // Handler para limpar dados
  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados offline? Esta ação não pode ser desfeita.')) {
      await clearOfflineData();
      setStats({
        timelines: 0,
        ordensServico: 0,
        manutencoes: 0,
        comentarios: 0,
        syncQueue: 0,
      });
    }
  };

  // Calcular total de itens offline
  const totalOffline = stats.timelines + stats.ordensServico + stats.manutencoes + stats.comentarios;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative gap-2 ${
            isOnline 
              ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
              : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 animate-pulse" />
          )}
          
          {/* Badge de itens pendentes */}
          {syncQueueCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {syncQueueCount > 9 ? '9+' : syncQueueCount}
            </Badge>
          )}
          
          <span className="hidden sm:inline text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-5 h-5 text-green-600" />
              ) : (
                <CloudOff className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <h4 className="font-semibold text-sm">
                  {isOnline ? 'Conectado' : 'Modo Offline'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Último sync: {formatLastSync()}
                </p>
              </div>
            </div>
            
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncNow}
                disabled={isSyncing}
                className="h-8"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}
          </div>

          {/* Status de sincronização */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sincronizando dados...</span>
              </div>
              <Progress value={33} className="h-1" />
            </div>
          )}

          {/* Erro de sincronização */}
          {syncError && (
            <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {/* Fila de sincronização */}
          {syncQueueCount > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  {syncQueueCount} item(s) aguardando sincronização
                </p>
                <p className="text-xs text-amber-600">
                  {isOnline ? 'Será sincronizado automaticamente' : 'Será sincronizado quando conectar'}
                </p>
              </div>
            </div>
          )}

          {/* Estatísticas de dados offline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="w-4 h-4" />
              <span>Dados Salvos Localmente</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-muted-foreground">Timelines</span>
                <Badge variant="secondary">{stats.timelines}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-muted-foreground">Ordens de Serviço</span>
                <Badge variant="secondary">{stats.ordensServico}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-muted-foreground">Manutenções</span>
                <Badge variant="secondary">{stats.manutencoes}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-muted-foreground">Comentários</span>
                <Badge variant="secondary">{stats.comentarios}</Badge>
              </div>
            </div>
          </div>

          {/* Informações do modo offline */}
          {!isOnline && (
            <div className="p-3 bg-blue-50 rounded-lg space-y-2">
              <h5 className="text-sm font-medium text-blue-700">Disponível offline:</h5>
              <ul className="text-xs text-blue-600 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Visualizar timelines salvas
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ver ordens de serviço
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Consultar manutenções
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Criar rascunhos (sincroniza depois)
                </li>
              </ul>
            </div>
          )}

          {/* Ações */}
          {totalOffline > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearData}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar dados offline
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente de banner offline (para exibir no topo da página)
export function OfflineBanner() {
  const { isOnline, isSyncing, syncQueueCount, syncNow } = useOffline();
  
  if (isOnline && syncQueueCount === 0) return null;
  
  return (
    <div className={`px-4 py-2 text-sm flex items-center justify-between ${
      isOnline 
        ? 'bg-blue-50 text-blue-700 border-b border-blue-200' 
        : 'bg-amber-50 text-amber-700 border-b border-amber-200'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing 
                ? 'Sincronizando dados...' 
                : `${syncQueueCount} item(s) aguardando sincronização`
              }
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Você está offline. Os dados serão salvos localmente.</span>
          </>
        )}
      </div>
      
      {isOnline && !isSyncing && syncQueueCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncNow}
          className="h-7 text-blue-700 hover:text-blue-800 hover:bg-blue-100"
        >
          Sincronizar agora
        </Button>
      )}
    </div>
  );
}

// Badge simples de status offline
export function OfflineStatusBadge() {
  const { isOnline, syncQueueCount } = useOffline();
  
  if (isOnline && syncQueueCount === 0) return null;
  
  return (
    <Badge 
      variant={isOnline ? "default" : "secondary"}
      className={`${
        isOnline 
          ? 'bg-blue-100 text-blue-700' 
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isOnline ? (
        <>
          <RefreshCw className="w-3 h-3 mr-1" />
          {syncQueueCount} pendente(s)
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </>
      )}
    </Badge>
  );
}

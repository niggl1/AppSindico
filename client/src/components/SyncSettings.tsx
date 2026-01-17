// Configurações de Sincronização Seletiva
// App Síndico - Plataforma Digital para Condomínios

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Settings,
  RefreshCw,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Save,
  RotateCcw,
  Zap,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ModuleSyncConfig {
  enabled: boolean;
  autoSync: boolean;
  priority: 'high' | 'medium' | 'low';
  syncInterval: number; // em minutos
  lastSync?: number;
  itemCount?: number;
}

export interface SyncSettings {
  globalAutoSync: boolean;
  syncOnConnect: boolean;
  syncOnAppStart: boolean;
  compressionEnabled: boolean;
  conflictResolution: 'newest' | 'oldest' | 'local' | 'server' | 'manual';
  maxOfflineAge: number; // em dias
  modules: {
    operacional: ModuleSyncConfig;
    comunicacao: ModuleSyncConfig;
    financeiro: ModuleSyncConfig;
    cadastros: ModuleSyncConfig;
    documentos: ModuleSyncConfig;
    reservas: ModuleSyncConfig;
    ocorrencias: ModuleSyncConfig;
  };
}

const defaultSettings: SyncSettings = {
  globalAutoSync: true,
  syncOnConnect: true,
  syncOnAppStart: true,
  compressionEnabled: true,
  conflictResolution: 'newest',
  maxOfflineAge: 30,
  modules: {
    operacional: { enabled: true, autoSync: true, priority: 'high', syncInterval: 5 },
    comunicacao: { enabled: true, autoSync: true, priority: 'high', syncInterval: 5 },
    financeiro: { enabled: true, autoSync: true, priority: 'medium', syncInterval: 15 },
    cadastros: { enabled: true, autoSync: false, priority: 'low', syncInterval: 60 },
    documentos: { enabled: true, autoSync: false, priority: 'low', syncInterval: 60 },
    reservas: { enabled: true, autoSync: true, priority: 'medium', syncInterval: 15 },
    ocorrencias: { enabled: true, autoSync: true, priority: 'high', syncInterval: 5 },
  },
};

const moduleLabels: Record<string, { label: string; icon: string; description: string }> = {
  operacional: {
    label: 'Operacional',
    icon: '📋',
    description: 'Timelines, Ordens de Serviço, Manutenções',
  },
  comunicacao: {
    label: 'Comunicação',
    icon: '📢',
    description: 'Avisos, Enquetes, Comunicados, Mensagens',
  },
  financeiro: {
    label: 'Financeiro',
    icon: '💰',
    description: 'Boletos, Prestação de Contas, Despesas, Receitas',
  },
  cadastros: {
    label: 'Cadastros',
    icon: '👥',
    description: 'Moradores, Funcionários, Fornecedores, Veículos',
  },
  documentos: {
    label: 'Documentos',
    icon: '📄',
    description: 'Atas, Regulamentos, Contratos, Arquivos',
  },
  reservas: {
    label: 'Reservas',
    icon: '🏊',
    description: 'Áreas Comuns, Agendamentos',
  },
  ocorrencias: {
    label: 'Ocorrências',
    icon: '⚠️',
    description: 'Registros e Acompanhamentos',
  },
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

interface SyncSettingsDialogProps {
  trigger?: React.ReactNode;
  onSave?: (settings: SyncSettings) => void;
}

export function SyncSettingsDialog({ trigger, onSave }: SyncSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('app-sindico-sync-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Erro ao carregar configurações de sync:', e);
      }
    }
  }, []);

  // Salvar configurações
  const handleSave = () => {
    localStorage.setItem('app-sindico-sync-settings', JSON.stringify(settings));
    onSave?.(settings);
    setHasChanges(false);
    toast.success('Configurações de sincronização salvas!');
    setOpen(false);
  };

  // Resetar para padrão
  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info('Configurações restauradas para o padrão');
  };

  // Atualizar configuração de módulo
  const updateModuleConfig = (
    module: keyof SyncSettings['modules'],
    key: keyof ModuleSyncConfig,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: {
          ...prev.modules[module],
          [key]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  // Atualizar configuração global
  const updateGlobalConfig = (key: keyof SyncSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar Sync
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Configurações de Sincronização
          </DialogTitle>
          <DialogDescription>
            Configure como os dados são sincronizados entre o dispositivo e o servidor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Configurações Globais */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Configurações Globais
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sincronização Automática</Label>
                  <p className="text-xs text-muted-foreground">
                    Sincronizar dados automaticamente em segundo plano
                  </p>
                </div>
                <Switch
                  checked={settings.globalAutoSync}
                  onCheckedChange={(checked) => updateGlobalConfig('globalAutoSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sincronizar ao Conectar</Label>
                  <p className="text-xs text-muted-foreground">
                    Sincronizar quando a conexão for restabelecida
                  </p>
                </div>
                <Switch
                  checked={settings.syncOnConnect}
                  onCheckedChange={(checked) => updateGlobalConfig('syncOnConnect', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sincronizar ao Iniciar</Label>
                  <p className="text-xs text-muted-foreground">
                    Sincronizar quando o aplicativo for aberto
                  </p>
                </div>
                <Switch
                  checked={settings.syncOnAppStart}
                  onCheckedChange={(checked) => updateGlobalConfig('syncOnAppStart', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compressão de Dados</Label>
                  <p className="text-xs text-muted-foreground">
                    Comprimir dados para economizar espaço
                  </p>
                </div>
                <Switch
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => updateGlobalConfig('compressionEnabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Resolução de Conflitos */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Resolução de Conflitos
            </h3>
            
            <div className="space-y-2">
              <Label>Estratégia Padrão</Label>
              <Select
                value={settings.conflictResolution}
                onValueChange={(value: any) => updateGlobalConfig('conflictResolution', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Manter mais recente</SelectItem>
                  <SelectItem value="oldest">Manter mais antigo</SelectItem>
                  <SelectItem value="local">Sempre manter local</SelectItem>
                  <SelectItem value="server">Sempre manter servidor</SelectItem>
                  <SelectItem value="manual">Resolver manualmente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define como conflitos entre dados locais e do servidor são resolvidos
              </p>
            </div>

            <div className="space-y-2">
              <Label>Idade Máxima dos Dados Offline (dias)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.maxOfflineAge]}
                  onValueChange={([value]) => updateGlobalConfig('maxOfflineAge', value)}
                  min={7}
                  max={90}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{settings.maxOfflineAge}d</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dados mais antigos serão removidos automaticamente
              </p>
            </div>
          </div>

          {/* Configurações por Módulo */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Módulos
            </h3>
            
            <Accordion type="multiple" className="w-full">
              {Object.entries(settings.modules).map(([key, config]) => {
                const moduleKey = key as keyof SyncSettings['modules'];
                const info = moduleLabels[key];
                
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{info.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{info.label}</div>
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        </div>
                        <div className="ml-auto flex items-center gap-2 mr-2">
                          {config.enabled ? (
                            <Badge variant="outline" className="text-green-600">
                              <Wifi className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">
                              <WifiOff className="h-3 w-3 mr-1" />
                              Desativado
                            </Badge>
                          )}
                          <Badge className={priorityColors[config.priority]}>
                            {priorityLabels[config.priority]}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 pt-2 pl-10">
                        <div className="flex items-center justify-between">
                          <Label>Sincronização Habilitada</Label>
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => updateModuleConfig(moduleKey, 'enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Sincronização Automática</Label>
                          <Switch
                            checked={config.autoSync}
                            disabled={!config.enabled}
                            onCheckedChange={(checked) => updateModuleConfig(moduleKey, 'autoSync', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Prioridade</Label>
                          <Select
                            value={config.priority}
                            disabled={!config.enabled}
                            onValueChange={(value: any) => updateModuleConfig(moduleKey, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">Alta - Sincronizar primeiro</SelectItem>
                              <SelectItem value="medium">Média - Sincronizar após alta</SelectItem>
                              <SelectItem value="low">Baixa - Sincronizar por último</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Intervalo de Sincronização</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[config.syncInterval]}
                              disabled={!config.enabled || !config.autoSync}
                              onValueChange={([value]) => updateModuleConfig(moduleKey, 'syncInterval', value)}
                              min={1}
                              max={120}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-16">{config.syncInterval} min</span>
                          </div>
                        </div>

                        {config.lastSync && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Última sync: {new Date(config.lastSync).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar as configurações de sync
export function useSyncSettings(): SyncSettings {
  const [settings, setSettings] = useState<SyncSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('app-sindico-sync-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Erro ao carregar configurações de sync:', e);
      }
    }

    // Escutar mudanças
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'app-sindico-sync-settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (e) {
          console.error('Erro ao atualizar configurações de sync:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return settings;
}

export default SyncSettingsDialog;

/**
 * Componente de Widgets de Atalhos para PWA
 * Widgets personalizáveis para acesso rápido às funções mais usadas
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutGrid,
  Home,
  Clock,
  Wrench,
  Bell,
  FileText,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Settings,
  Plus,
  Minus,
  GripVertical,
  Check,
  X,
  Smartphone
} from 'lucide-react';

// Tipos
export interface Widget {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  enabled: boolean;
  order: number;
  badge?: number;
}

export interface WidgetConfig {
  widgets: Widget[];
  showOnDashboard: boolean;
  compactMode: boolean;
}

// Widgets disponíveis
const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Visão geral do condomínio',
    icon: 'home',
    route: '/dashboard',
    color: 'bg-blue-500',
    enabled: true,
    order: 1,
  },
  {
    id: 'timelines',
    title: 'Timelines',
    description: 'Acompanhe atividades',
    icon: 'clock',
    route: '/dashboard?section=timeline',
    color: 'bg-purple-500',
    enabled: true,
    order: 2,
  },
  {
    id: 'ordens-servico',
    title: 'Ordens de Serviço',
    description: 'Gerencie manutenções',
    icon: 'wrench',
    route: '/dashboard?section=ordem-servico',
    color: 'bg-orange-500',
    enabled: true,
    order: 3,
  },
  {
    id: 'notificacoes',
    title: 'Notificações',
    description: 'Alertas e avisos',
    icon: 'bell',
    route: '/dashboard?section=notificacoes',
    color: 'bg-red-500',
    enabled: true,
    order: 4,
  },
  {
    id: 'documentos',
    title: 'Documentos',
    description: 'Atas e regulamentos',
    icon: 'file-text',
    route: '/dashboard?section=documentos',
    color: 'bg-green-500',
    enabled: false,
    order: 5,
  },
  {
    id: 'moradores',
    title: 'Moradores',
    description: 'Cadastro de moradores',
    icon: 'users',
    route: '/dashboard?section=moradores',
    color: 'bg-cyan-500',
    enabled: false,
    order: 6,
  },
  {
    id: 'reservas',
    title: 'Reservas',
    description: 'Áreas comuns',
    icon: 'calendar',
    route: '/dashboard?section=reservas',
    color: 'bg-pink-500',
    enabled: false,
    order: 7,
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    description: 'Boletos e contas',
    icon: 'dollar-sign',
    route: '/dashboard?section=financeiro',
    color: 'bg-emerald-500',
    enabled: false,
    order: 8,
  },
  {
    id: 'comunicados',
    title: 'Comunicados',
    description: 'Avisos e mensagens',
    icon: 'message-square',
    route: '/dashboard?section=comunicados',
    color: 'bg-indigo-500',
    enabled: false,
    order: 9,
  },
  {
    id: 'ocorrencias',
    title: 'Ocorrências',
    description: 'Registros e problemas',
    icon: 'alert-triangle',
    route: '/dashboard?section=ocorrencias',
    color: 'bg-amber-500',
    enabled: false,
    order: 10,
  },
];

// Constantes
const STORAGE_KEY = 'app-sindico-widgets-config';

// Funções de armazenamento
export function getWidgetConfig(): WidgetConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Mesclar com widgets padrão para incluir novos
      const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
        const savedWidget = config.widgets?.find((w: Widget) => w.id === defaultWidget.id);
        return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
      });
      return { ...config, widgets: mergedWidgets };
    }
  } catch (e) {
    console.error('Erro ao ler configuração de widgets:', e);
  }
  
  return {
    widgets: DEFAULT_WIDGETS,
    showOnDashboard: true,
    compactMode: false,
  };
}

export function saveWidgetConfig(config: WidgetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar configuração de widgets:', e);
  }
}

// Componente de ícone
function WidgetIcon({ icon, className }: { icon: string; className?: string }) {
  const iconProps = { className: className || 'h-6 w-6' };
  
  switch (icon) {
    case 'home': return <Home {...iconProps} />;
    case 'clock': return <Clock {...iconProps} />;
    case 'wrench': return <Wrench {...iconProps} />;
    case 'bell': return <Bell {...iconProps} />;
    case 'file-text': return <FileText {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'calendar': return <Calendar {...iconProps} />;
    case 'dollar-sign': return <DollarSign {...iconProps} />;
    case 'message-square': return <MessageSquare {...iconProps} />;
    case 'alert-triangle': return <AlertTriangle {...iconProps} />;
    default: return <LayoutGrid {...iconProps} />;
  }
}

// Componente de Widget Individual
interface WidgetCardProps {
  widget: Widget;
  compact?: boolean;
  onClick?: () => void;
}

export function WidgetCard({ widget, compact = false, onClick }: WidgetCardProps) {
  if (compact) {
    return (
      <Link href={widget.route} onClick={onClick}>
        <div className={`relative flex flex-col items-center justify-center p-3 rounded-xl ${widget.color} text-white hover:opacity-90 transition-opacity cursor-pointer`}>
          <WidgetIcon icon={widget.icon} className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium truncate max-w-full">{widget.title}</span>
          {widget.badge && widget.badge > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-600 text-white text-xs">
              {widget.badge > 99 ? '99+' : widget.badge}
            </Badge>
          )}
        </div>
      </Link>
    );
  }
  
  return (
    <Link href={widget.route} onClick={onClick}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${widget.color} text-white`}>
              <WidgetIcon icon={widget.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{widget.title}</h3>
                {widget.badge && widget.badge > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {widget.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{widget.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Componente de Grade de Widgets
interface WidgetGridProps {
  compact?: boolean;
  maxWidgets?: number;
  onWidgetClick?: () => void;
}

export function WidgetGrid({ compact = false, maxWidgets, onWidgetClick }: WidgetGridProps) {
  const [config] = useState(getWidgetConfig());
  
  const enabledWidgets = config.widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order)
    .slice(0, maxWidgets);
  
  if (enabledWidgets.length === 0) {
    return null;
  }
  
  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {enabledWidgets.map(widget => (
          <WidgetCard 
            key={widget.id} 
            widget={widget} 
            compact 
            onClick={onWidgetClick}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {enabledWidgets.map(widget => (
        <WidgetCard 
          key={widget.id} 
          widget={widget}
          onClick={onWidgetClick}
        />
      ))}
    </div>
  );
}

// Componente de Configuração de Widgets
export function WidgetSettings() {
  const [config, setConfig] = useState(getWidgetConfig());
  const [showPreview, setShowPreview] = useState(false);
  
  const toggleWidget = (widgetId: string) => {
    const newWidgets = config.widgets.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    const newConfig = { ...config, widgets: newWidgets };
    setConfig(newConfig);
    saveWidgetConfig(newConfig);
  };
  
  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const widgets = [...config.widgets].sort((a, b) => a.order - b.order);
    const index = widgets.findIndex(w => w.id === widgetId);
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === widgets.length - 1)
    ) {
      return;
    }
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const tempOrder = widgets[index].order;
    widgets[index].order = widgets[swapIndex].order;
    widgets[swapIndex].order = tempOrder;
    
    const newConfig = { ...config, widgets };
    setConfig(newConfig);
    saveWidgetConfig(newConfig);
  };
  
  const toggleShowOnDashboard = () => {
    const newConfig = { ...config, showOnDashboard: !config.showOnDashboard };
    setConfig(newConfig);
    saveWidgetConfig(newConfig);
  };
  
  const toggleCompactMode = () => {
    const newConfig = { ...config, compactMode: !config.compactMode };
    setConfig(newConfig);
    saveWidgetConfig(newConfig);
  };
  
  const enabledCount = config.widgets.filter(w => w.enabled).length;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Widgets de Atalhos
          </CardTitle>
          <CardDescription>
            Configure os atalhos rápidos para suas funções mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações gerais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exibir no Dashboard</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar widgets na página inicial
                </p>
              </div>
              <Switch
                checked={config.showOnDashboard}
                onCheckedChange={toggleShowOnDashboard}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir widgets em formato reduzido
                </p>
              </div>
              <Switch
                checked={config.compactMode}
                onCheckedChange={toggleCompactMode}
              />
            </div>
          </div>
          
          {/* Lista de widgets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Widgets Disponíveis</Label>
              <Badge variant="secondary">
                {enabledCount} ativo{enabledCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {config.widgets
                .sort((a, b) => a.order - b.order)
                .map((widget, index) => (
                  <div 
                    key={widget.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                      widget.enabled ? 'bg-muted/50' : 'opacity-60'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={index === config.widgets.length - 1}
                      >
                        <GripVertical className="h-3 w-3 -rotate-90" />
                      </Button>
                    </div>
                    
                    <div className={`p-2 rounded-lg ${widget.color} text-white`}>
                      <WidgetIcon icon={widget.icon} className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{widget.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {widget.description}
                      </p>
                    </div>
                    
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                  </div>
                ))}
            </div>
          </div>
          
          {/* Botão de preview */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowPreview(true)}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Visualizar Preview
          </Button>
        </CardContent>
      </Card>
      
      {/* Modal de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview dos Widgets</DialogTitle>
            <DialogDescription>
              Assim ficarão seus widgets no Dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <WidgetGrid 
              compact={config.compactMode} 
              maxWidgets={8}
            />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Exportar componentes e funções
export { DEFAULT_WIDGETS };
export default WidgetSettings;

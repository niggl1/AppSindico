import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Megaphone,
  Calendar,
  Vote,
  ShoppingBag,
  Users,
  FileText,
  Image,
  MessageSquare,
  Bell,
  Car,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Search,
  BookOpen,
  Building2,
  Phone,
  MapPin,
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
  Smartphone,
  Palette,
  Settings,
  Layout,
  Check,
  X,
  Shield,
  Lightbulb,
  Package,
  Hammer,
  Camera,
  Clock,
  DollarSign,
  CalendarClock,
  Video,
  HelpCircle,
  Award,
  Sparkles,
  Newspaper,
  Briefcase,
  Home,
  Key,
  Truck,
  ParkingCircle,
  Wifi,
  Zap,
  HeartHandshake,
  ClipboardList,
  FileCheck,
  BadgeCheck,
  ClipboardPen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos
interface AppModule {
  id: string;
  key: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  enabled: boolean;
  order: number;
}

// Módulos disponíveis - Lista completa de todos os módulos do sistema
// Estilo funções rápidas: fundo colorido sólido com ícones brancos
// Ordenados alfabeticamente por título
const availableModules: Omit<AppModule, "enabled" | "order">[] = [
  { id: "personalizado", key: "personalizado", title: "100% Personalizado", icon: Zap, color: "text-white", bgColor: "bg-yellow-500" },
  { id: "achados_perdidos", key: "achados_perdidos", title: "Achados e Perdidos", icon: HelpCircle, color: "text-white", bgColor: "bg-orange-600" },
  { id: "vencimentos", key: "vencimentos", title: "Agenda Vencimentos", icon: CalendarClock, color: "text-white", bgColor: "bg-fuchsia-500" },
  { id: "albuns", key: "albuns", title: "Álbuns de Fotos", icon: Camera, color: "text-white", bgColor: "bg-purple-600" },
  { id: "antes_depois", key: "antes_depois", title: "Antes e Depois", icon: Camera, color: "text-white", bgColor: "bg-violet-500" },
  { id: "aquisicoes", key: "aquisicoes", title: "Aquisições", icon: Package, color: "text-white", bgColor: "bg-green-500" },
  { id: "assembleia", key: "assembleia", title: "Assembleia Online", icon: Video, color: "text-white", bgColor: "bg-rose-500" },
  { id: "avisos", key: "avisos", title: "Avisos", icon: Megaphone, color: "text-white", bgColor: "bg-orange-500" },
  { id: "caronas", key: "caronas", title: "Caronas", icon: Truck, color: "text-white", bgColor: "bg-blue-600" },
  { id: "checklists", key: "checklists", title: "Checklists", icon: ClipboardCheck, color: "text-white", bgColor: "bg-teal-500" },
  { id: "classificados", key: "classificados", title: "Classificados", icon: ShoppingBag, color: "text-white", bgColor: "bg-green-600" },
  { id: "comunicados", key: "comunicados", title: "Comunicados", icon: MessageSquare, color: "text-white", bgColor: "bg-cyan-500" },
  { id: "contatos", key: "contatos", title: "Contatos Úteis", icon: Phone, color: "text-white", bgColor: "bg-lime-600" },
  { id: "destaques", key: "destaques", title: "Destaques", icon: Lightbulb, color: "text-white", bgColor: "bg-amber-500" },
  { id: "dicas_seguranca", key: "dicas_seguranca", title: "Dicas de Segurança", icon: Shield, color: "text-white", bgColor: "bg-green-600" },
  { id: "documentos", key: "documentos", title: "Documentos", icon: FileText, color: "text-white", bgColor: "bg-gray-500" },
  { id: "enquetes", key: "enquetes", title: "Enquetes", icon: ClipboardList, color: "text-white", bgColor: "bg-indigo-500" },
  { id: "estacionamento", key: "estacionamento", title: "Estacionamento", icon: ParkingCircle, color: "text-white", bgColor: "bg-blue-600" },
  { id: "eventos", key: "eventos", title: "Eventos", icon: Calendar, color: "text-white", bgColor: "bg-blue-500" },
  { id: "funcionarios", key: "funcionarios", title: "Funcionários", icon: Briefcase, color: "text-white", bgColor: "bg-gray-600" },
  { id: "galeria", key: "galeria", title: "Galeria", icon: Image, color: "text-white", bgColor: "bg-pink-500" },
  { id: "localizacao", key: "localizacao", title: "Localização", icon: MapPin, color: "text-white", bgColor: "bg-sky-500" },
  { id: "manutencoes", key: "manutencoes", title: "Manutenções", icon: Wrench, color: "text-white", bgColor: "bg-slate-600" },
  { id: "melhorias", key: "melhorias", title: "Melhorias", icon: Hammer, color: "text-white", bgColor: "bg-amber-500" },
  { id: "mensagem_sindico", key: "mensagem_sindico", title: "Mensagem do Síndico", icon: MessageSquare, color: "text-white", bgColor: "bg-blue-700" },
  { id: "moradores", key: "moradores", title: "Moradores", icon: Users, color: "text-white", bgColor: "bg-indigo-600" },
  { id: "notificacoes", key: "notificacoes", title: "Notificações", icon: Bell, color: "text-white", bgColor: "bg-red-500" },
  { id: "notificar_morador", key: "notificar_morador", title: "Notificar Morador", icon: Bell, color: "text-white", bgColor: "bg-rose-600" },
  { id: "novidades", key: "novidades", title: "Novidades", icon: Newspaper, color: "text-white", bgColor: "bg-cyan-600" },
  { id: "ocorrencias", key: "ocorrencias", title: "Ocorrências", icon: AlertTriangle, color: "text-white", bgColor: "bg-yellow-500" },
  { id: "ordem_servico", key: "ordem_servico", title: "Ordem de Serviço", icon: ClipboardPen, color: "text-white", bgColor: "bg-teal-600" },
  { id: "parceiros", key: "parceiros", title: "Parceiros", icon: HeartHandshake, color: "text-white", bgColor: "bg-red-600" },
  { id: "portaria", key: "portaria", title: "Portaria", icon: BadgeCheck, color: "text-white", bgColor: "bg-green-500" },
  { id: "publicidade", key: "publicidade", title: "Publicidade", icon: Sparkles, color: "text-white", bgColor: "bg-pink-600" },
  { id: "realizacoes", key: "realizacoes", title: "Realizações", icon: Award, color: "text-white", bgColor: "bg-yellow-600" },
  { id: "regimento", key: "regimento", title: "Regimento", icon: BookOpen, color: "text-white", bgColor: "bg-rose-500" },
  { id: "regras_normas", key: "regras_normas", title: "Regras e Normas", icon: FileCheck, color: "text-white", bgColor: "bg-blue-500" },
  { id: "sobre", key: "sobre", title: "Sobre o Condomínio", icon: Building2, color: "text-white", bgColor: "bg-violet-600" },
  { id: "vagas", key: "vagas", title: "Vagas/Garagem", icon: Car, color: "text-white", bgColor: "bg-amber-600" },
  { id: "vistorias", key: "vistorias", title: "Vistorias", icon: Search, color: "text-white", bgColor: "bg-emerald-500" },
  { id: "votacoes", key: "votacoes", title: "Votações", icon: Vote, color: "text-white", bgColor: "bg-purple-500" },
  { id: "wifi", key: "wifi", title: "Wi-Fi", icon: Wifi, color: "text-white", bgColor: "bg-blue-500" },
];

// Componente de módulo arrastável
function SortableModule({ module, onToggle, onRemove }: { 
  module: AppModule; 
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = module.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-xl border-2 transition-all duration-200",
        isDragging ? "opacity-50 scale-105 z-50 shadow-2xl" : "opacity-100",
        module.enabled 
          ? "border-primary/30 bg-gradient-to-br from-white to-primary/5 shadow-md" 
          : "border-dashed border-gray-300 bg-gray-50/50"
      )}
    >
      {/* Grip handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(module.id)}
        className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-4 pt-8">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto transition-all",
          module.enabled ? module.bgColor : "bg-gray-200"
        )}>
          <Icon className={cn("w-6 h-6", module.enabled ? module.color : "text-gray-400")} />
        </div>
        
        <h4 className={cn(
          "text-sm font-medium text-center mb-3",
          module.enabled ? "text-foreground" : "text-gray-400"
        )}>
          {module.title}
        </h4>

        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={module.enabled}
            onCheckedChange={() => onToggle(module.id)}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-xs text-muted-foreground">
            {module.enabled ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente de módulo para adicionar
function AddModuleCard({ module, onAdd }: { 
  module: Omit<AppModule, "enabled" | "order">; 
  onAdd: (module: Omit<AppModule, "enabled" | "order">) => void;
}) {
  const Icon = module.icon;

  return (
    <button
      onClick={() => onAdd(module)}
      className="p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center gap-2 group"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", module.bgColor)}>
        <Icon className={cn("w-5 h-5", module.color)} />
      </div>
      <span className="text-xs font-medium text-gray-600 group-hover:text-primary">{module.title}</span>
      <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary" />
    </button>
  );
}

// Componente de preview do módulo - Estilo funções rápidas
function ModulePreview({ module }: { module: AppModule }) {
  const Icon = module.icon;
  
  return (
    <div className={cn(
      "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all shadow-sm",
      module.bgColor
    )}>
      <Icon className={cn("w-6 h-6 mb-1", module.color)} />
      <span className="text-[10px] font-semibold text-white text-center leading-tight drop-shadow-sm">{module.title}</span>
    </div>
  );
}

export default function AppBuilder() {
  const [, setLocation] = useLocation();
  const [appName, setAppName] = useState("Meu App");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Buscar condomínio do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  // Mutation para criar app
  const createApp = trpc.apps.create.useMutation({
    onSuccess: (data) => {
      toast.success("App salvo com sucesso!");
      // Redirecionar para a lista de apps
      setLocation(`/dashboard/apps`);
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
      setIsSaving(false);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((m, i) => ({ ...m, order: i }));
      });
      toast.success("Ordem atualizada!");
    }
  };

  const toggleModule = (id: string) => {
    setModules((items) =>
      items.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const removeModule = (id: string) => {
    setModules((items) => items.filter((m) => m.id !== id));
    toast.info("Módulo removido");
  };

  const addModule = (module: Omit<AppModule, "enabled" | "order">) => {
    if (modules.find((m) => m.id === module.id)) {
      toast.error("Este módulo já está no app");
      return;
    }
    setModules((items) => [...items, { ...module, enabled: true, order: items.length }]);
    toast.success(`${module.title} adicionado!`);
  };

  const enabledModules = modules.filter((m) => m.enabled);
  const unusedModules = availableModules.filter((m) => !modules.find((mod) => mod.id === m.id));
  const activeModule = activeId ? modules.find((m) => m.id === activeId) : null;

  const handleSave = async () => {
    if (!condominioId) {
      toast.error("Você precisa cadastrar um condomínio primeiro");
      setLocation("/dashboard/condominio");
      return;
    }
    
    if (!appName.trim()) {
      toast.error("Digite um nome para o app");
      return;
    }
    
    if (enabledModules.length === 0) {
      toast.error("Adicione pelo menos um módulo ao app");
      return;
    }
    
    setIsSaving(true);
    
    createApp.mutate({
      condominioId,
      nome: appName,
      modulos: enabledModules.map((m, index) => ({
        moduloKey: m.key,
        titulo: m.title,
        icone: m.id,
        cor: m.color,
        bgCor: m.bgColor,
        ordem: index,
        habilitado: true,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Construtor de App</h1>
                <p className="text-sm text-muted-foreground">Arraste e solte para personalizar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar App
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de configuração */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nome do App */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Configurações do App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appName">Nome do App</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Ex: App Residencial Jardins"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Módulos Selecionados</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {modules.length}
                      </Badge>
                      <span className="text-sm text-muted-foreground">de {availableModules.length} disponíveis</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de módulos */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Layout do App
                </CardTitle>
                <CardDescription>
                  Arraste os módulos para reorganizar. Ative ou desative conforme necessário.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <Layout className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum módulo selecionado</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione módulos da lista abaixo para começar</p>
                  </div>
                ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={modules.map((m) => m.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {modules.map((module) => (
                        <SortableModule
                          key={module.id}
                          module={module}
                          onToggle={toggleModule}
                          onRemove={removeModule}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeModule ? (
                      <div className="rounded-xl border-2 border-primary bg-white shadow-2xl p-4 opacity-90">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto", activeModule.bgColor)}>
                          <activeModule.icon className={cn("w-6 h-6", activeModule.color)} />
                        </div>
                        <h4 className="text-sm font-medium text-center">{activeModule.title}</h4>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
                )}
              </CardContent>
            </Card>

            {/* Módulos disponíveis para adicionar */}
            {unusedModules.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Adicionar Módulos
                  </CardTitle>
                  <CardDescription>
                    Clique para adicionar mais módulos ao seu app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {unusedModules.map((module) => (
                      <AddModuleCard key={module.id} module={module} onAdd={addModule} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview do App */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary/80 text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Preview do App
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mockup de celular */}
                  <div className="bg-gray-900 p-4 flex justify-center">
                    <div className="w-[240px] bg-white rounded-[2rem] p-2 shadow-2xl">
                      {/* Notch */}
                      <div className="bg-gray-900 rounded-t-[1.5rem] pt-6 pb-2 px-4">
                        <div className="w-20 h-5 bg-gray-800 rounded-full mx-auto mb-2" />
                        <div className="text-white text-center">
                          <p className="text-xs text-gray-400">EDIÇÃO JANEIRO 2026</p>
                          <h3 className="text-sm font-bold truncate">{appName}</h3>
                        </div>
                      </div>
                      
                      {/* Grid de módulos com scroll */}
                      <div className="bg-gray-50 p-3 min-h-[300px] max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {enabledModules.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {enabledModules.map((module) => (
                              <ModulePreview key={module.id} module={module} />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                            <Layout className="w-10 h-10 mb-2" />
                            <p className="text-xs text-center">Adicione módulos<br />para montar seu app</p>
                          </div>
                        )}
                      </div>

                      {/* Bottom bar */}
                      <div className="bg-white rounded-b-[1.5rem] py-3 px-4 border-t">
                        <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{enabledModules.length}</p>
                      <p className="text-xs text-muted-foreground">Módulos Ativos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{modules.length}</p>
                      <p className="text-xs text-muted-foreground">Total no App</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

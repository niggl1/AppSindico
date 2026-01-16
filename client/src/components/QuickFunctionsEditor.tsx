import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Settings,
  ListChecks,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Megaphone,
  Vote,
  Bell,
  CalendarDays,
  Users,
  Car,
  ShoppingBag,
  Search,
  Camera,
  FileText,
  Shield,
  BookOpen,
  TrendingUp,
  Package,
  Video,
  CalendarClock,
  BellRing,
  ClipboardList,
  Loader2,
  Zap,
  Blocks,
  BarChart3,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Cores para as funções rápidas (12 cores distintas)
export const CORES_FUNCOES_RAPIDAS = [
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#F59E0B", // Âmbar
  "#22C55E", // Verde
  "#10B981", // Esmeralda
  "#06B6D4", // Ciano
  "#3B82F6", // Azul
  "#6366F1", // Índigo
  "#8B5CF6", // Violeta
  "#A855F7", // Roxo
  "#EC4899", // Rosa
  "#64748B", // Slate
];

// Todas as funções disponíveis para escolha
export const allQuickFunctions = [
  { id: "checklists", label: "Checklists", icon: ListChecks, gradient: "from-amber-400 to-orange-500", path: "/dashboard/checklists" },
  { id: "manutencoes", label: "Manutenções", icon: Wrench, gradient: "from-blue-400 to-blue-600", path: "/dashboard/manutencoes" },
  { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle, gradient: "from-red-400 to-rose-600", path: "/dashboard/ocorrencias" },
  { id: "vistorias", label: "Vistorias", icon: ClipboardCheck, gradient: "from-green-400 to-emerald-600", path: "/dashboard/vistorias" },
  { id: "avisos", label: "Avisos", icon: Megaphone, gradient: "from-purple-400 to-purple-600", path: "/dashboard/avisos" },
  { id: "votacoes", label: "Votações", icon: Vote, gradient: "from-indigo-400 to-indigo-600", path: "/dashboard/votacoes" },
  { id: "gestao-notificacoes", label: "Notificações", icon: Bell, gradient: "from-cyan-400 to-cyan-600", path: "/dashboard/gestao-notificacoes" },
  { id: "eventos", label: "Eventos", icon: CalendarDays, gradient: "from-pink-400 to-pink-600", path: "/dashboard/eventos" },
  { id: "moradores", label: "Moradores", icon: Users, gradient: "from-teal-400 to-teal-600", path: "/dashboard/moradores" },
  { id: "funcionarios", label: "Funcionários", icon: Users, gradient: "from-slate-400 to-slate-600", path: "/dashboard/funcionarios" },
  { id: "vagas", label: "Vagas", icon: Car, gradient: "from-yellow-400 to-yellow-600", path: "/dashboard/vagas" },
  { id: "classificados", label: "Classificados", icon: ShoppingBag, gradient: "from-orange-400 to-orange-600", path: "/dashboard/classificados" },
  { id: "achados", label: "Achados", icon: Search, gradient: "from-lime-400 to-lime-600", path: "/dashboard/achados" },
  { id: "galeria", label: "Galeria", icon: Camera, gradient: "from-fuchsia-400 to-fuchsia-600", path: "/dashboard/galeria" },
  { id: "comunicados", label: "Comunicados", icon: FileText, gradient: "from-sky-400 to-sky-600", path: "/dashboard/comunicados" },
  { id: "seguranca", label: "Segurança", icon: Shield, gradient: "from-red-500 to-red-700", path: "/dashboard/seguranca" },
  { id: "regras", label: "Regras", icon: BookOpen, gradient: "from-amber-500 to-amber-700", path: "/dashboard/regras" },
  { id: "realizacoes", label: "Realizações", icon: TrendingUp, gradient: "from-emerald-400 to-emerald-600", path: "/dashboard/realizacoes" },
  { id: "aquisicoes", label: "Aquisições", icon: Package, gradient: "from-violet-400 to-violet-600", path: "/dashboard/aquisicoes" },
  { id: "vencimentos", label: "Vencimentos", icon: CalendarClock, gradient: "from-rose-400 to-rose-600", path: "/dashboard/vencimentos" },
  // { id: "assembleia", label: "Assembleia", icon: Video, gradient: "from-blue-500 to-blue-700", path: "/dashboard/assembleia" }, // OCULTO TEMPORARIAMENTE
  { id: "notificar-morador", label: "Notificar", icon: BellRing, gradient: "from-orange-500 to-red-500", path: "/dashboard/notificar-morador" },
  { id: "ordens-servico", label: "Ordens de Serviço", icon: ClipboardList, gradient: "from-yellow-500 to-amber-600", path: "/dashboard/ordens-servico" },
  { id: "antes-depois", label: "Antes e Depois", icon: Camera, gradient: "from-emerald-500 to-teal-600", path: "/dashboard/antes-depois" },
  { id: "tarefas-facil", label: "⚡ Registro Rápido", icon: Zap, gradient: "from-orange-500 to-amber-500", path: "/dashboard/tarefas-facil" },
  { id: "construtor-app", label: "Construtor de App", icon: Blocks, gradient: "from-purple-500 to-indigo-600", path: "/dashboard/construtor-app" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, gradient: "from-blue-500 to-cyan-600", path: "/dashboard/relatorios/novo" },
  { id: "livro-manutencao", label: "Livro de Manutenção", icon: BookMarked, gradient: "from-green-500 to-emerald-600", path: "/dashboard/timeline" },
];

// Mapa de ícones para uso externo
export const iconMap: Record<string, any> = {
  ListChecks, Wrench, AlertTriangle, ClipboardCheck, Megaphone, Vote, Bell,
  CalendarDays, Users, Car, ShoppingBag, Search, Camera, FileText, Shield,
  BookOpen, TrendingUp, Package, Video, CalendarClock, BellRing, ClipboardList, Zap,
  Blocks, BarChart3, BookMarked,
};

const QUICK_FUNCTIONS_KEY = "dashboard-quick-functions";
const DEFAULT_FUNCTIONS = ["checklists", "manutencoes", "ocorrencias", "vistorias", "avisos", "votacoes", "gestao-notificacoes", "eventos", "ordens-servico"];

// Funções para compatibilidade com localStorage (fallback)
export function getSelectedQuickFunctions(): string[] {
  const saved = localStorage.getItem(QUICK_FUNCTIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_FUNCTIONS;
    }
  }
  return DEFAULT_FUNCTIONS;
}

export function saveSelectedQuickFunctions(functions: string[]) {
  localStorage.setItem(QUICK_FUNCTIONS_KEY, JSON.stringify(functions));
}

interface QuickFunctionsEditorProps {
  onSave?: () => void;
  triggerClassName?: string;
  condominioId?: number;
}

export default function QuickFunctionsEditor({ onSave, triggerClassName, condominioId }: QuickFunctionsEditorProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(getSelectedQuickFunctions());
  
  // Query para buscar funções rápidas da base de dados
  const { data: funcoesRapidasDB, isLoading: isLoadingDB } = trpc.funcoesRapidas.listar.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId && open }
  );
  
  // Mutations
  const adicionarMutation = trpc.funcoesRapidas.adicionar.useMutation();
  const removerMutation = trpc.funcoesRapidas.remover.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (open) {
      if (condominioId && funcoesRapidasDB) {
        // Usar dados da base de dados
        setSelected(funcoesRapidasDB.map(f => f.funcaoId));
      } else {
        // Fallback para localStorage
        setSelected(getSelectedQuickFunctions());
      }
    }
  }, [open, funcoesRapidasDB, condominioId]);

  const toggleFunction = async (id: string) => {
    if (selected.includes(id)) {
      // Remover
      if (selected.length <= 4) {
        toast.error("Mínimo de 4 funções rápidas");
        return;
      }
      
      if (condominioId) {
        try {
          await removerMutation.mutateAsync({ condominioId, funcaoId: id });
          utils.funcoesRapidas.listar.invalidate({ condominioId });
        } catch {
          toast.error("Erro ao remover função");
          return;
        }
      }
      setSelected(prev => prev.filter(f => f !== id));
    } else {
      // Adicionar
      if (selected.length >= 12) {
        toast.error("Máximo de 12 funções rápidas");
        return;
      }
      
      const func = allQuickFunctions.find(f => f.id === id);
      if (condominioId && func) {
        const ordem = selected.length;
        const cor = CORES_FUNCOES_RAPIDAS[ordem % CORES_FUNCOES_RAPIDAS.length];
        try {
              await adicionarMutation.mutateAsync({
                condominioId,
                funcaoId: id,
                nome: func.label,
                icone: func.icon.displayName || "Zap",
                path: func.path,
                cor
              });
          utils.funcoesRapidas.listar.invalidate({ condominioId });
        } catch {
          toast.error("Erro ao adicionar função");
          return;
        }
      }
      setSelected(prev => [...prev, id]);
    }
  };

  const handleSave = () => {
    // Salvar também no localStorage para compatibilidade
    saveSelectedQuickFunctions(selected);
    toast.success("Funções rápidas atualizadas!");
    setOpen(false);
    onSave?.();
  };

  const handleReset = async () => {
    if (condominioId) {
      // Remover todas e adicionar as padrão
      for (const funcId of selected) {
        if (!DEFAULT_FUNCTIONS.includes(funcId)) {
          try {
            await removerMutation.mutateAsync({ condominioId, funcaoId: funcId });
          } catch {}
        }
      }
      for (let i = 0; i < DEFAULT_FUNCTIONS.length; i++) {
        const funcId = DEFAULT_FUNCTIONS[i];
        if (!selected.includes(funcId)) {
          const func = allQuickFunctions.find(f => f.id === funcId);
          if (func) {
            try {
              await adicionarMutation.mutateAsync({
                condominioId,
                funcaoId: funcId,
                nome: func.label,
                icone: func.icon.displayName || "Zap",
                path: func.path,
                cor: CORES_FUNCOES_RAPIDAS[i % CORES_FUNCOES_RAPIDAS.length]
              });
            } catch {}
          }
        }
      }
      utils.funcoesRapidas.listar.invalidate({ condominioId });
    }
    setSelected(DEFAULT_FUNCTIONS);
  };

  const isLoading = adicionarMutation.isPending || removerMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={cn("p-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors", triggerClassName)}>
          <Settings className="w-3.5 h-3.5 text-sidebar-foreground/50" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              Personalizar Funções Rápidas
            </DialogTitle>
            <DialogDescription className="text-violet-100">
              Selecione de 4 a 12 funções para aparecer nos atalhos rápidos.
              Selecionadas: {selected.length}/12
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh] p-6">
        {isLoadingDB ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 py-4">
            {allQuickFunctions.map((func, index) => {
              const isSelected = selected.includes(func.id);
              const Icon = func.icon;
              const cor = CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
              
              return (
                <div
                  key={func.id}
                  onClick={() => !isLoading && toggleFunction(func.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-transparent bg-muted/50 hover:bg-muted",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cor }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{func.label}</p>
                  </div>
                  <Checkbox checked={isSelected} disabled={isLoading} />
                </div>
              );
            })}
          </div>
        )}

        </div>
        <div className="flex justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <Button variant="outline" onClick={handleReset} disabled={isLoading} className="border-slate-300">
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="border-slate-300">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

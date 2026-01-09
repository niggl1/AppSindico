import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { useCondominioAtivo } from "@/hooks/useCondominioAtivo";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  User,
  Building2,
  Users,
  UserCog,
  Car,
  UsersRound,
  Megaphone,
  Bell,
  FileText,
  Clock,
  Send,
  Calendar,
  CalendarClock,
  CalendarCheck,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  ArrowLeftRight,
  Vote,
  ShoppingBag,
  Search,
  CarFront,
  BookOpen,
  Shield,
  Link,
  Phone,
  Image,
  Award,
  TrendingUp,
  Package,
  Newspaper,
  Building,
  BarChart3,
  PieChart,
  History,
  Download,
  Settings,
  BellRing,
  Sliders,
  ChevronDown,
  ChevronRight,
  BookMarked,
  Palette,
  Sparkles,
  FileDown,
  Plus,
  Smartphone,
  FileBarChart,
  ClipboardList,
  Zap,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// Mapeamento de ícones por nome
export const iconMap: Record<string, any> = {
  LayoutDashboard, Building2, Users, UserCog, Car, UsersRound, Megaphone, Bell,
  FileText, Clock, Send, Calendar, CalendarClock, CalendarCheck, Wrench,
  ClipboardCheck, AlertTriangle, CheckSquare, ArrowLeftRight, Vote, ShoppingBag,
  Search, CarFront, BookOpen, Shield, Link, Phone, Image, Award, TrendingUp,
  Package, Newspaper, Building, BarChart3, PieChart, History, Download, Settings,
  BellRing, Sliders, BookMarked, Palette, Sparkles, FileDown, Plus, Smartphone,
  FileBarChart, ClipboardList, User, LogOut, PanelLeft, ChevronDown, ChevronRight, Zap,
};

// 12 cores distintas para as funções rápidas
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

// Estrutura do menu com 12 seções (inclui Ordens de Serviço como seção separada)
const menuSections = [
  {
    id: "visao-geral",
    label: "VISÃO GERAL/CRIAR PROJETO",
    icon: LayoutDashboard,
    iconName: "LayoutDashboard",
    path: "/dashboard",
    items: []
  },
  {
    id: "gestao-condominio",
    label: "Gestão do Condomínio",
    icon: Building2,
    iconName: "Building2",
    items: [
      { icon: Building2, iconName: "Building2", label: "Cadastro do Condomínio", path: "/dashboard/condominio", funcaoId: "cadastro-condominio" },
      { icon: Users, iconName: "Users", label: "Moradores", path: "/dashboard/moradores", funcaoId: "moradores" },
      { icon: UserCog, iconName: "UserCog", label: "Funcionários", path: "/dashboard/funcionarios", funcaoId: "funcionarios" },
      { icon: Car, iconName: "Car", label: "Vagas de Estacionamento", path: "/dashboard/vagas", funcaoId: "vagas" },
      { icon: UsersRound, iconName: "UsersRound", label: "Equipe de Gestão", path: "/dashboard/equipe", funcaoId: "equipe" },
    ]
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    icon: Megaphone,
    iconName: "Megaphone",
    items: [
      { icon: Bell, iconName: "Bell", label: "Avisos", path: "/dashboard/avisos", funcaoId: "avisos" },
      { icon: FileText, iconName: "FileText", label: "Comunicados", path: "/dashboard/comunicados", funcaoId: "comunicados" },
      { icon: BellRing, iconName: "BellRing", label: "Notificações", path: "/dashboard/notificacoes", funcaoId: "notificacoes" },
      { icon: Clock, iconName: "Clock", label: "Lembretes Agendados", path: "/dashboard/notificacoes?tab=lembretes", funcaoId: "lembretes" },
      { icon: Send, iconName: "Send", label: "Notificar Morador", path: "/dashboard/notificacoes?tab=enviar", funcaoId: "notificar-morador" },
    ]
  },
  {
    id: "eventos-agenda",
    label: "Eventos e Agenda",
    icon: Calendar,
    iconName: "Calendar",
    items: [
      { icon: Calendar, iconName: "Calendar", label: "Eventos", path: "/dashboard/eventos", funcaoId: "eventos" },
      { icon: CalendarClock, iconName: "CalendarClock", label: "Agenda de Vencimentos", path: "/dashboard/agenda-vencimentos", funcaoId: "agenda-vencimentos" },
      { icon: CalendarCheck, iconName: "CalendarCheck", label: "Reservas", path: "/dashboard/reservas", funcaoId: "reservas" },
    ]
  },
  {
    id: "operacional",
    label: "Operacional / Manutenção",
    icon: Wrench,
    iconName: "Wrench",
    items: [
      { icon: Zap, iconName: "Zap", label: "⚡ Funções Fácil", path: "/dashboard/tarefas-facil", funcaoId: "tarefas-facil" }, // Registro rápido
      { icon: ClipboardCheck, iconName: "ClipboardCheck", label: "Vistorias", path: "/dashboard/vistorias", funcaoId: "vistorias" },
      { icon: Wrench, iconName: "Wrench", label: "Manutenções", path: "/dashboard/manutencoes", funcaoId: "manutencoes" },
      { icon: AlertTriangle, iconName: "AlertTriangle", label: "Ocorrências", path: "/dashboard/ocorrencias", funcaoId: "ocorrencias" },
      { icon: CheckSquare, iconName: "CheckSquare", label: "Checklists", path: "/dashboard/checklists", funcaoId: "checklists" },
      { icon: ArrowLeftRight, iconName: "ArrowLeftRight", label: "Antes e Depois", path: "/dashboard/antes-depois", funcaoId: "antes-depois" },
    ]
  },
  {
    id: "ordens-servico",
    label: "Ordens de Serviço",
    icon: ClipboardList,
    iconName: "ClipboardList",
    items: [
      { icon: ClipboardList, iconName: "ClipboardList", label: "Todas as OS", path: "/dashboard/ordens-servico", funcaoId: "ordens-servico" },
      { icon: Plus, iconName: "Plus", label: "Nova OS", path: "/dashboard/ordens-servico?nova=true", funcaoId: "nova-os" },
      { icon: Settings, iconName: "Settings", label: "Configurações", path: "/dashboard/ordens-servico/configuracoes", funcaoId: "config-os" },
    ]
  },
  {
    id: "comunidade",
    label: "Interativo / Comunidade",
    icon: Users,
    iconName: "Users",
    items: [
      { icon: Vote, iconName: "Vote", label: "Votações e Enquetes", path: "/dashboard/votacoes", funcaoId: "votacoes" },
      { icon: ShoppingBag, iconName: "ShoppingBag", label: "Classificados", path: "/dashboard/classificados", funcaoId: "classificados" },
      { icon: Search, iconName: "Search", label: "Achados e Perdidos", path: "/dashboard/achados-perdidos", funcaoId: "achados-perdidos" },
      { icon: CarFront, iconName: "CarFront", label: "Caronas", path: "/dashboard/caronas", funcaoId: "caronas" },
    ]
  },
  {
    id: "documentacao",
    label: "Documentação e Regras",
    icon: BookOpen,
    iconName: "BookOpen",
    items: [
      { icon: BookOpen, iconName: "BookOpen", label: "Regras e Normas", path: "/dashboard/regras", funcaoId: "regras" },
      { icon: Shield, iconName: "Shield", label: "Dicas de Segurança", path: "/dashboard/seguranca", funcaoId: "seguranca" },
      { icon: Link, iconName: "Link", label: "Links Úteis", path: "/dashboard/links", funcaoId: "links" },
      { icon: Phone, iconName: "Phone", label: "Telefones Úteis", path: "/dashboard/telefones", funcaoId: "telefones" },
    ]
  },
  {
    id: "galeria",
    label: "Galeria e Mídia",
    icon: Image,
    iconName: "Image",
    items: [
      { icon: Image, iconName: "Image", label: "Galeria de Fotos", path: "/dashboard/galeria", funcaoId: "galeria" },
      { icon: Award, iconName: "Award", label: "Realizações", path: "/dashboard/realizacoes", funcaoId: "realizacoes" },
      { icon: TrendingUp, iconName: "TrendingUp", label: "Melhorias", path: "/dashboard/melhorias", funcaoId: "melhorias" },
      { icon: Package, iconName: "Package", label: "Aquisições", path: "/dashboard/aquisicoes", funcaoId: "aquisicoes" },
    ]
  },
  {
    id: "publicidade",
    label: "Publicidade",
    icon: Newspaper,
    iconName: "Newspaper",
    items: [
      { icon: Building, iconName: "Building", label: "Anunciantes", path: "/dashboard/publicidade", funcaoId: "publicidade" },
      { icon: Newspaper, iconName: "Newspaper", label: "Campanhas", path: "/dashboard/campanhas", funcaoId: "campanhas" },
    ]
  },
  {
    id: "revista",
    label: "Revista Digital",
    icon: BookMarked,
    iconName: "BookMarked",
    items: [
      { icon: BookMarked, iconName: "BookMarked", label: "Minhas Revistas", path: "/dashboard/revistas", funcaoId: "revistas" },
      { icon: Palette, iconName: "Palette", label: "Templates Visuais", path: "/dashboard/templates", funcaoId: "templates" },
      { icon: Sparkles, iconName: "Sparkles", label: "Efeitos de Transição", path: "/dashboard/efeitos", funcaoId: "efeitos" },
      { icon: FileDown, iconName: "FileDown", label: "Exportar PDF", path: "/dashboard/exportar-pdf", funcaoId: "exportar-pdf" },
    ]
  },
  {
    id: "relatorios",
    label: "Relatórios e Painel",
    icon: BarChart3,
    iconName: "BarChart3",
    items: [
      { icon: BarChart3, iconName: "BarChart3", label: "Painel de Controlo", path: "/dashboard/painel-controlo", funcaoId: "painel-controlo" },
      { icon: PieChart, iconName: "PieChart", label: "Estatísticas Gerais", path: "/dashboard/estatisticas", funcaoId: "estatisticas" },
      { icon: History, iconName: "History", label: "Histórico de Atividades", path: "/dashboard/historico", funcaoId: "historico" },
      { icon: Download, iconName: "Download", label: "Exportar Relatórios", path: "/dashboard/exportar-relatorios", funcaoId: "exportar-relatorios" },
    ]
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    iconName: "Settings",
    items: [
      { icon: User, iconName: "User", label: "Perfil do Usuário", path: "/perfil", funcaoId: "perfil" },
      { icon: BellRing, iconName: "BellRing", label: "Config. Notificações", path: "/dashboard/config-notificacoes", funcaoId: "config-notificacoes" },
      { icon: Sliders, iconName: "Sliders", label: "Preferências", path: "/dashboard/preferencias", funcaoId: "preferencias" },
    ]
  },
];

// Exportar menuSections para uso em outros componentes
export { menuSections };

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const EXPANDED_SECTIONS_KEY = "sidebar-expanded-sections";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Entrar para continuar
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              O acesso a este painel requer autenticação. Clique abaixo para fazer login.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { condominioAtivo } = useCondominioAtivo();
  
  // Estado para controlar seções expandidas
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const saved = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    return saved ? JSON.parse(saved) : ["visao-geral"];
  });

  // Estado para o diálogo de confirmação de função rápida
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState<{
    funcaoId: string;
    nome: string;
    path: string;
    iconName: string;
    isRapida: boolean;
  } | null>(null);

  // Query para buscar funções rápidas
  const { data: funcoesRapidas, refetch: refetchFuncoesRapidas } = trpc.funcoesRapidas.listar.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Mutation para adicionar função rápida
  const adicionarFuncaoRapida = trpc.funcoesRapidas.adicionar.useMutation({
    onSuccess: () => {
      toast.success(`"${selectedFuncao?.nome}" adicionada às funções rápidas!`);
      refetchFuncoesRapidas();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation para remover função rápida
  const removerFuncaoRapida = trpc.funcoesRapidas.remover.useMutation({
    onSuccess: () => {
      toast.success(`"${selectedFuncao?.nome}" removida das funções rápidas!`);
      refetchFuncoesRapidas();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Verificar se uma função está nas rápidas
  const isFuncaoRapida = (funcaoId: string) => {
    return funcoesRapidas?.some(f => f.funcaoId === funcaoId) || false;
  };

  // Obter próxima cor disponível
  const getProximaCor = () => {
    const usadas = funcoesRapidas?.length || 0;
    return CORES_FUNCOES_RAPIDAS[usadas % CORES_FUNCOES_RAPIDAS.length];
  };

  // Handler para clicar no ícone de raio
  const handleZapClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!condominioAtivo?.id) {
      toast.error("Selecione um condomínio primeiro");
      return;
    }
    const isRapida = isFuncaoRapida(item.funcaoId);
    setSelectedFuncao({
      funcaoId: item.funcaoId,
      nome: item.label,
      path: item.path,
      iconName: item.iconName,
      isRapida,
    });
    setDialogOpen(true);
  };

  // Handler para confirmar adição/remoção
  const handleConfirm = () => {
    if (!selectedFuncao || !condominioAtivo?.id) return;

    if (selectedFuncao.isRapida) {
      removerFuncaoRapida.mutate({
        condominioId: condominioAtivo.id,
        funcaoId: selectedFuncao.funcaoId,
      });
    } else {
      adicionarFuncaoRapida.mutate({
        condominioId: condominioAtivo.id,
        funcaoId: selectedFuncao.funcaoId,
        nome: selectedFuncao.nome,
        path: selectedFuncao.path,
        icone: selectedFuncao.iconName,
        cor: getProximaCor(),
      });
    }
  };

  // Salvar seções expandidas no localStorage
  useEffect(() => {
    localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Encontrar a seção e item ativos baseado na localização atual
  const getActiveSection = () => {
    for (const section of menuSections) {
      if (section.path && location === section.path) {
        return { section, item: null };
      }
      for (const item of section.items) {
        if (location === item.path || location.startsWith(item.path + "/")) {
          return { section, item };
        }
      }
    }
    return { section: menuSections[0], item: null };
  };

  const { section: activeSection, item: activeItem } = getActiveSection();

  // Expandir automaticamente a seção ativa
  useEffect(() => {
    if (activeSection && !expandedSections.includes(activeSection.id)) {
      setExpandedSections(prev => [...prev, activeSection.id]);
    }
  }, [activeSection]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      {/* Diálogo de confirmação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Funções Rápidas
              </DialogTitle>
              <DialogDescription className="text-amber-100">
                Gerir atalhos de acesso rápido
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-slate-600">
              {selectedFuncao?.isRapida
                ? `Gostaria de remover a função "${selectedFuncao?.nome}" das funções rápidas?`
                : `Gostaria de adicionar a função "${selectedFuncao?.nome}" nas funções rápidas?`}
            </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-300">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={adicionarFuncaoRapida.isPending || removerFuncaoRapida.isPending}
              className={selectedFuncao?.isRapida 
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"}
            >
              {adicionarFuncaoRapida.isPending || removerFuncaoRapida.isPending
                ? "Processando..."
                : selectedFuncao?.isRapida
                  ? "Remover"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate text-primary">
                    App Síndico
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 overflow-y-auto">
            <SidebarMenu className="px-2 py-2">
              {menuSections.map((section) => {
                const isSectionActive = activeSection?.id === section.id;
                const isExpanded = expandedSections.includes(section.id);
                const hasItems = section.items.length > 0;

                // Renderização especial para Visão Geral com dropdown
                if (section.id === "visao-geral") {
                  return (
                    <div key={section.id} className="mb-1">
                      <SidebarMenuItem>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                              tooltip={section.label}
                              className="h-10 transition-all font-medium bg-primary text-white rounded-full shadow-md hover:shadow-lg hover:bg-primary/90 mx-1 animate-pulse-subtle"
                            >
                              <section.icon className="h-4 w-4 text-white" />
                              <span className="flex-1 text-white font-semibold text-xs">{section.label}</span>
                              <Plus className="h-4 w-4 text-white" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => setLocation("/dashboard")} className="cursor-pointer">
                              <LayoutDashboard className="h-4 w-4 mr-2" />
                              Visão Geral
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setLocation("/dashboard/apps/novo")} className="cursor-pointer">
                              <Smartphone className="h-4 w-4 mr-2" />
                              Criar App
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation("/dashboard/criar-projeto")} className="cursor-pointer">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Criar Revista
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation("/dashboard/relatorios/novo")} className="cursor-pointer">
                              <FileBarChart className="h-4 w-4 mr-2" />
                              Criar Relatório
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </div>
                  );
                }

                return (
                  <div key={section.id} className="mb-1">
                    {/* Cabeçalho da seção */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => {
                          if (section.path) {
                            setLocation(section.path);
                          } else if (hasItems) {
                            toggleSection(section.id);
                          }
                        }}
                        tooltip={section.label}
                        className={cn(
                          "h-10 transition-all font-medium",
                          isSectionActive && !activeItem && "bg-primary/10 text-primary"
                        )}
                      >
                        <section.icon
                          className={cn(
                            "h-4 w-4",
                            isSectionActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className="flex-1">{section.label}</span>
                        {hasItems && !isCollapsed && (
                          <span className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Subitens da seção */}
                    {hasItems && isExpanded && !isCollapsed && (
                      <div className="ml-4 border-l border-border/50 pl-2 mt-1 space-y-0.5">
                        {section.items.map((item) => {
                          const isItemActive = activeItem?.path === item.path;
                          const isRapida = isFuncaoRapida(item.funcaoId);
                          return (
                            <SidebarMenuItem key={item.path} className="group/item">
                              <div className="flex items-center w-full">
                                <SidebarMenuButton
                                  isActive={isItemActive}
                                  onClick={() => setLocation(item.path)}
                                  tooltip={item.label}
                                  className={cn(
                                    "h-9 transition-all text-sm flex-1",
                                    isItemActive && "bg-primary/10 text-primary font-medium"
                                  )}
                                >
                                  <item.icon
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      isItemActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                  />
                                  <span className="flex-1">{item.label}</span>
                                </SidebarMenuButton>
                                {/* Ícone de raio para adicionar às funções rápidas */}
                                <button
                                  onClick={(e) => handleZapClick(e, item)}
                                  className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                                    isRapida 
                                      ? "text-amber-500 bg-amber-100 hover:bg-amber-200" 
                                      : "text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
                                  )}
                                  title={isRapida ? "Remover das funções rápidas" : "Adicionar às funções rápidas"}
                                >
                                  <Zap className={cn("h-3.5 w-3.5", isRapida && "fill-amber-500")} />
                                </button>
                              </div>
                            </SidebarMenuItem>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setLocation('/perfil')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation('/dashboard/configuracoes')}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Terminar Sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground font-medium">
                    {activeItem?.label || activeSection?.label || "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  Calendar,
  Car,
  ChevronRight,
  ChevronDown,
  Download,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Settings,
  Shield,
  Star,
  Users,
  Vote,
  Link as LinkIcon,
  Image,
  Loader2,
  Sparkles,
  Save,
  Eye,
  Edit,
  Trash2,
  Share2,
  Copy,
  X,
  Check,
  Bell,
  CheckCircle,
  ClipboardCheck,
  BarChart3,
  Wrench,
  AlertTriangle,
  ListChecks,
  ExternalLink,
  FileDown,
  Play,
  QrCode,
  FileSpreadsheet,
  Upload,
  Video,
  Ban,
  UserCog,
  UsersRound,
  BellRing,
  Clock,
  Send,
  CalendarClock,
  CalendarCheck,
  CalendarDays,
  ArrowLeftRight,
  ShoppingBag,
  Search,
  CarFront,
  Award,
  TrendingUp,
  Newspaper,
  PieChart,
  History,
  Sliders,
  Menu,
  BookMarked,
  Palette,
  FolderOpen,
  Smartphone,
  Key,
  FileBarChart,
  MapPin,
  Navigation,
  ClipboardList,
  Zap,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { NotificationBell } from "@/components/NotificationBell";
import FavoriteButton from "@/components/FavoriteButton";
import MultiImageUpload from "@/components/MultiImageUpload";
import ImageEditSection from "@/components/ImageEditSection";
import ImageGallery, { ImageThumbnails } from "@/components/ImageGallery";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import VistoriasPage from "./VistoriasPage";
import ManutencoesPage from "./ManutencoesPage";
import OcorrenciasPage from "./OcorrenciasPage";
import ChecklistsPage from "./ChecklistsPage";
import { PainelControloPage } from "./PainelControloPage";
import { MembrosEquipePage } from "./MembrosEquipePage";
import DestaquesPage from "./Destaques";
import PaginasCustomSection from "./PaginasCustom";
import VotacoesPage from "./VotacoesPage";
import AssembleiaOnlineCard from "@/components/AssembleiaOnlineCard";
import NotificacoesPage from "./NotificacoesPage";
import NotificarMoradorPage from "./NotificarMoradorPage";
import RelatoriosPage from "./RelatoriosPage";
import NotificationAlert from "@/components/NotificationAlert";
import FuncoesRapidas from "@/components/FuncoesRapidas";
import FuncoesRapidasGrid from "@/components/FuncoesRapidasGrid";
import QuickFunctionsEditor, { getSelectedQuickFunctions, allQuickFunctions, CORES_FUNCOES_RAPIDAS } from "@/components/QuickFunctionsEditor";
import AssistenteCriacao from "@/components/AssistenteCriacao";

// Estrutura do menu com 11 seções
// Cada item tem um funcaoId que mapeia para as funções do admin
const menuSections = [
  {
    id: "visao-geral",
    label: "VISÃO GERAL / CRIAR",
    icon: LayoutDashboard,
    path: "overview",
    items: [],
    isSpecial: true // Marcação especial para renderização diferenciada
  },
  {
    id: "revista",
    label: "MEUS PROJETOS",
    icon: FolderOpen,
    path: "revistas",
    items: [],
    isSpecial: true // Marcação especial para renderização diferenciada
  },
  {
    id: "gestao-condominio",
    label: "Gestão do Condomínio",
    icon: Building2,
    items: [
      { id: "condominio", label: "Cadastro do Condomínio", icon: Building2 },
      { id: "moradores", label: "Moradores", icon: Users, funcaoId: "moradores" },
      { id: "funcionarios", label: "Funcionários", icon: UserCog, funcaoId: "funcionarios" },
      { id: "vagas", label: "Vagas de Estacionamento", icon: Car, funcaoId: "vagas" },
      { id: "equipe", label: "Equipe de Gestão", icon: UsersRound, funcaoId: "equipe" },
    ]
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    icon: Megaphone,
    items: [
      { id: "avisos", label: "Avisos", icon: Bell, funcaoId: "avisos" },
      { id: "comunicados", label: "Comunicados", icon: FileText, funcaoId: "comunicados" },
      { id: "gestao-notificacoes", label: "Notificações", icon: BellRing, funcaoId: "notificacoes" },
      { id: "notificar-morador", label: "Notificar Morador", icon: Send, funcaoId: "notificar-morador" },
    ]
  },
  {
    id: "eventos-agenda",
    label: "Eventos e Agenda",
    icon: Calendar,
    items: [
      { id: "eventos", label: "Eventos", icon: Calendar, funcaoId: "eventos" },
      { id: "vencimentos", label: "Agenda de Vencimentos", icon: CalendarClock, funcaoId: "agenda-vencimentos" },
      // { id: "assembleia", label: "Assembleia Online", icon: Video }, // OCULTO TEMPORARIAMENTE - Descomentar quando ativar
    ]
  },
  {
    id: "operacional",
    label: "Operacional / Manutenção",
    icon: Wrench,
    items: [
      { id: "vistorias", label: "Vistorias", icon: ClipboardCheck, funcaoId: "vistorias" },
      { id: "manutencoes", label: "Manutenções", icon: Wrench, funcaoId: "manutencoes" },
      { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle, funcaoId: "ocorrencias" },
      { id: "checklists", label: "Checklists", icon: ListChecks, funcaoId: "checklists" },
      { id: "antes-depois", label: "Antes e Depois", icon: ArrowLeftRight, funcaoId: "antes-depois" },
    ]
  },
  {
    id: "ordens-servico",
    label: "Ordens de Serviço",
    icon: ClipboardList,
    items: [
      { id: "ordens-servico", label: "Todas as OS", icon: ClipboardList, funcaoId: "ordens-servico" },
      { id: "ordens-servico/nova", label: "Nova OS", icon: Plus, funcaoId: "ordens-servico" },
      { id: "ordens-servico/configuracoes", label: "Configurações", icon: Settings, funcaoId: "ordens-servico" },
    ]
  },
  {
    id: "comunidade",
    label: "Interativo / Comunidade",
    icon: Users,
    items: [
      { id: "votacoes", label: "Votações e Enquetes", icon: Vote, funcaoId: "votacoes" },
      { id: "classificados", label: "Classificados", icon: ShoppingBag, funcaoId: "classificados" },
      { id: "achados", label: "Achados e Perdidos", icon: Search, funcaoId: "achados-perdidos" },
      { id: "caronas", label: "Caronas", icon: CarFront, funcaoId: "caronas" },
    ]
  },
  {
    id: "documentacao",
    label: "Documentação e Regras",
    icon: BookOpen,
    items: [
      { id: "regras", label: "Regras e Normas", icon: BookOpen, funcaoId: "regras" },
      { id: "seguranca", label: "Dicas de Segurança", icon: Shield, funcaoId: "dicas-seguranca" },
    ]
  },
  {
    id: "galeria-midia",
    label: "Galeria e Mídia",
    icon: Image,
    items: [
      { id: "galeria", label: "Galeria de Fotos", icon: Image, funcaoId: "galeria" },
      { id: "realizacoes", label: "Realizações", icon: Award, funcaoId: "realizacoes" },
      { id: "melhorias", label: "Melhorias", icon: TrendingUp, funcaoId: "melhorias" },
      { id: "aquisicoes", label: "Aquisições", icon: Package, funcaoId: "aquisicoes" },
    ]
  },
  {
    id: "publicidade",
    label: "Publicidade",
    icon: Newspaper,
    items: [
      { id: "publicidade", label: "Anunciantes", icon: Building2, funcaoId: "publicidade" },
    ]
  },
  {
    id: "relatorios",
    label: "Relatórios e Painel",
    icon: BarChart3,
    items: [
      { id: "painel-controlo", label: "Painel de Controlo", icon: BarChart3, funcaoId: "painel-controlo" },
      { id: "relatorios", label: "Relatórios", icon: PieChart, funcaoId: "relatorios" },
    ]
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    items: [
      { id: "configuracoes", label: "Preferências", icon: Sliders },
      { id: "moderacao", label: "Moderação", icon: Shield },
    ]
  },
];

// Item de admin para gestão de funções (só aparece para admin)
const adminMenuItem = { id: "admin-funcoes", label: "Gestão de Funções", icon: Shield, path: "/admin/funcoes" };

// Lista plana de todos os itens para manter compatibilidade
const menuItems = menuSections.flatMap(section => 
  section.path ? [{ id: section.path, label: section.label, icon: section.icon }] : section.items
);

const EXPANDED_SECTIONS_KEY = "dashboard-expanded-sections";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const params = useParams<{ section?: string }>();
  const [, setLocation] = useLocation();
  const currentSection = params.section || "overview";
  const { data: condominios } = trpc.condominio.list.useQuery();
  
  // Buscar funções habilitadas para o condomínio do usuário
  const condominioId = condominios?.[0]?.id;
  const { data: funcoesHabilitadas } = trpc.funcoesCondominio.listarHabilitadas.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  
  // Filtrar menu baseado nas funções habilitadas
  const menuSectionsFiltrado = useMemo(() => {
    // Se não há condomínio ou funções carregadas, mostrar tudo
    if (!condominioId || !funcoesHabilitadas) return menuSections;
    
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Se o item não tem funcaoId, sempre mostrar
        if (!item.funcaoId) return true;
        // Verificar se a função está habilitada
        return funcoesHabilitadas.includes(item.funcaoId);
      })
    })).filter(section => {
      // Manter seções que têm path (como Visão Geral) ou que ainda têm itens
      return section.path || section.items.length > 0;
    });
  }, [condominioId, funcoesHabilitadas]);
  
  // Estado para controlar seções expandidas
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const saved = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    return saved ? JSON.parse(saved) : ["visao-geral"];
  });

  // Estado do drawer mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado das funções rápidas personalizáveis (agora usa dados da base de dados)
  const refreshQuickFunctions = () => {
    refetchFuncoesRapidas();
  };

  // Estados para funções rápidas com ícone de raio
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState<{
    funcaoId: string;
    nome: string;
    path: string;
    icone: string;
    isRapida: boolean;
  } | null>(null);

  // Query para funções rápidas
  const { data: funcoesRapidas, refetch: refetchFuncoesRapidas } = trpc.funcoesRapidas.listar.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Mutations
  const adicionarFuncaoRapida = trpc.funcoesRapidas.adicionar.useMutation({
    onSuccess: () => {
      toast.success(`Função "${selectedFuncao?.nome}" adicionada às funções rápidas!`);
      refetchFuncoesRapidas();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removerFuncaoRapida = trpc.funcoesRapidas.remover.useMutation({
    onSuccess: () => {
      toast.success(`Função "${selectedFuncao?.nome}" removida das funções rápidas!`);
      refetchFuncoesRapidas();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Verificar se uma função é rápida
  const isFuncaoRapida = (funcaoId: string) => {
    return funcoesRapidas?.some(f => f.funcaoId === funcaoId) || false;
  };

  // Cores para funções rápidas
  const CORES_FUNCOES_RAPIDAS = [
    "#EF4444", "#F97316", "#F59E0B", "#22C55E",
    "#10B981", "#06B6D4", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#EC4899", "#64748B"
  ];

  const getProximaCor = () => {
    const usadas = funcoesRapidas?.length || 0;
    return CORES_FUNCOES_RAPIDAS[usadas % CORES_FUNCOES_RAPIDAS.length];
  };

  // Handler para clicar no ícone de raio
  const handleZapClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!condominioId) {
      toast.error("Selecione um condomínio primeiro");
      return;
    }
    const isRapida = isFuncaoRapida(item.funcaoId || item.id);
    setSelectedFuncao({
      funcaoId: item.funcaoId || item.id,
      nome: item.label,
      path: `/dashboard/${item.id}`,
      icone: item.icon?.name || "Zap",
      isRapida,
    });
    setDialogOpen(true);
  };

  // Confirmar ação
  const handleConfirm = () => {
    if (!selectedFuncao || !condominioId) return;
    
    if (selectedFuncao.isRapida) {
      removerFuncaoRapida.mutate({ condominioId, funcaoId: selectedFuncao.funcaoId });
    } else {
      if ((funcoesRapidas?.length || 0) >= 12) {
        toast.error("Limite de 12 funções rápidas atingido. Remova uma primeiro.");
        setDialogOpen(false);
        return;
      }
      adicionarFuncaoRapida.mutate({
        condominioId,
        funcaoId: selectedFuncao.funcaoId,
        nome: selectedFuncao.nome,
        path: selectedFuncao.path,
        icone: selectedFuncao.icone,
        cor: getProximaCor(),
      });
    }
  };

  // Salvar seções expandidas no localStorage
  useEffect(() => {
    localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Encontrar a seção ativa baseado na localização atual
  const getActiveSection = () => {
    for (const section of menuSectionsFiltrado) {
      if (section.path && currentSection === section.path) {
        return { section, item: null };
      }
      for (const item of section.items) {
        if (currentSection === item.id) {
          return { section, item };
        }
      }
    }
    return { section: menuSectionsFiltrado[0], item: null };
  };

  const { section: activeSection } = getActiveSection();

  // Expandir automaticamente a seção ativa
  useEffect(() => {
    if (activeSection && !expandedSections.includes(activeSection.id)) {
      setExpandedSections(prev => [...prev, activeSection.id]);
    }
  }, [activeSection, currentSection]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <>
      {/* Diálogo de confirmação para funções rápidas */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Funções Rápidas
            </DialogTitle>
            <DialogDescription>
              {selectedFuncao?.isRapida
                ? `Gostaria de remover a função "${selectedFuncao?.nome}" das funções rápidas?`
                : `Gostaria de adicionar a função "${selectedFuncao?.nome}" nas funções rápidas?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              className={selectedFuncao?.isRapida ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}
            >
              {selectedFuncao?.isRapida ? "Remover" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <div className="min-h-screen bg-background flex">
      {/* Sidebar Premium */}
      <aside className="w-72 hidden lg:flex flex-col sidebar-premium">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-appsindico.png" alt="App Síndico" className="w-10 h-10 object-contain" />
            <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-8 object-contain" />
          </Link>
        </div>

        {/* Navigation com Seções Colapsáveis */}
        <ScrollArea className="flex-1 py-4">
          {/* Funções Rápidas - Agora usa dados da base de dados */}
          <div className="px-3 mb-4">
            <div className="flex items-center justify-between mb-2 px-3">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Funções Rápidas</p>
              <QuickFunctionsEditor onSave={refreshQuickFunctions} condominioId={condominioId} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {funcoesRapidas && funcoesRapidas.length > 0 ? (
                funcoesRapidas.map((funcao, index) => {
                  const funcInfo = allQuickFunctions.find(f => f.id === funcao.funcaoId);
                  const Icon = funcInfo?.icon || Zap;
                  const cor = funcao.cor || CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                  return (
                    <Link key={funcao.id} href={funcao.path}>
                      <button 
                        className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        style={{ backgroundColor: cor }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-semibold text-white">{funcao.nome}</span>
                      </button>
                    </Link>
                  );
                })
              ) : (
                // Fallback para funções padrão se não houver na base de dados
                getSelectedQuickFunctions().map((funcId, index) => {
                  const func = allQuickFunctions.find(f => f.id === funcId);
                  if (!func) return null;
                  const Icon = func.icon;
                  const cor = CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                  return (
                    <Link key={func.id} href={`/dashboard/${func.id}`}>
                      <button 
                        className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        style={{ backgroundColor: cor }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-semibold text-white">{func.label}</span>
                      </button>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* SECÇÃO PORTAL DE MANUTENÇÕES */}
          <div className="px-3 mb-4">
            <div className="flex items-center justify-between mb-2 px-3">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">🔧 MANUTENÇÕES</p>
            </div>
            <Link href="/modulo/manutencoes">
              <button 
                className="w-full flex items-center gap-2 p-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-500 mb-3"
              >
                <Wrench className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Portal de Manutenções</span>
                <ChevronRight className="w-4 h-4 text-white ml-auto" />
              </button>
            </Link>
          </div>

          {/* SECÇÃO REGISTRO RÁPIDO */}
          <div className="px-3 mb-4">
            <div className="flex items-center justify-between mb-2 px-3">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">⚡ REGISTRO RÁPIDO</p>
            </div>
            <Link href="/dashboard/tarefas-facil">
              <button 
                className="w-full flex items-center gap-2 p-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-gradient-to-r from-orange-500 to-amber-500 mb-3"
              >
                <Zap className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">⚡ Registro Rápido</span>
              </button>
            </Link>
            
            {/* Botões de atalho - todos em laranja */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/tarefas-facil?tipo=vistoria">
                <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md hover:scale-[1.02] transition-all">
                  <ClipboardCheck className="w-4 h-4" />
                  Vistoria
                </button>
              </Link>
              <Link href="/dashboard/tarefas-facil?tipo=manutencao">
                <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md hover:scale-[1.02] transition-all">
                  <Wrench className="w-4 h-4" />
                  Manutenção
                </button>
              </Link>
              <Link href="/dashboard/tarefas-facil?tipo=ocorrencia">
                <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md hover:scale-[1.02] transition-all">
                  <AlertTriangle className="w-4 h-4" />
                  Ocorrência
                </button>
              </Link>
              <Link href="/dashboard/tarefas-facil?tipo=antes_depois">
                <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md hover:scale-[1.02] transition-all">
                  <ArrowLeftRight className="w-4 h-4" />
                  Antes/Depois
                </button>
              </Link>
              <Link href="/dashboard/checklists" className="col-span-2">
                <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md hover:scale-[1.02] transition-all">
                  <ListChecks className="w-4 h-4" />
                  Checklist
                </button>
              </Link>
            </div>
          </div>

          {/* Separador */}
          <div className="px-6 mb-3">
            <Separator className="bg-sidebar-border/50" />
          </div>

          {/* Seções do Menu */}
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-6">Menu</p>
          <nav className="px-3 space-y-1">
            {menuSectionsFiltrado.map((section) => {
              const isSectionActive = activeSection?.id === section.id;
              const isExpanded = expandedSections.includes(section.id);
              const hasItems = section.items.length > 0;

              // Renderização especial para Visão Geral com dropdown
              if (section.id === "visao-geral") {
                return (
                  <div key={section.id} className="mb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary/90 animate-pulse-subtle"
                        >
                          <section.icon className="w-5 h-5 text-white" />
                          <span className="flex-1 text-left text-white">{section.label}</span>
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/criar-projeto")} className="cursor-pointer font-medium">
                          <Plus className="h-4 w-4 mr-2" />
                          + Novo Projeto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/overview")} className="cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Visão Geral
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/apps/novo")} className="cursor-pointer">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Criar App
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/revistas")} className="cursor-pointer">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Criar Revista
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/dashboard/relatorios/novo")} className="cursor-pointer">
                          <FileBarChart className="h-4 w-4 mr-2" />
                          Criar Relatório
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }

              // Renderização especial para Meus Projetos em destaque
              if (section.id === "revista") {
                return (
                  <div key={section.id} className="mb-2">
                    <Link href="/dashboard/revistas">
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg",
                          currentSection === "revistas"
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                            : "bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600"
                        )}
                      >
                        <FolderOpen className="w-5 h-5 text-white" />
                        <span className="flex-1 text-left text-white">MEUS PROJETOS</span>
                      </button>
                    </Link>
                  </div>
                );
              }

              return (
                <div key={section.id} className="mb-1">
                  {/* Cabeçalho da seção */}
                  <button
                    onClick={() => {
                      if (section.path) {
                        setLocation(`/dashboard/${section.path}`);
                      } else if (hasItems) {
                        toggleSection(section.id);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isSectionActive && !hasItems
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <section.icon className={cn(
                      "w-5 h-5",
                      isSectionActive ? "text-primary" : "text-sidebar-foreground/60"
                    )} />
                    <span className="flex-1 text-left">{section.label}</span>
                    {hasItems && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
                      )
                    )}
                  </button>

                  {/* Subitens da seção */}
                  {hasItems && isExpanded && (
                    <div className="ml-4 mt-1 border-l-2 border-sidebar-border/50 pl-3 space-y-0.5">
                      {section.items.map((item) => {
                        const isItemActive = currentSection === item.id;
                        const isRapida = isFuncaoRapida(item.funcaoId || item.id);
                        return (
                          <div key={item.id} className="flex items-center group/item">
                            <Link href={`/dashboard/${item.id}`} className="flex-1">
                              <button
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                  isItemActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                              >
                                <item.icon className={cn(
                                  "w-4 h-4",
                                  isItemActive ? "text-primary" : "text-sidebar-foreground/50"
                                )} />
                                <span className="flex-1 text-left">{item.label}</span>
                              </button>
                            </Link>
                            {/* Ícone de raio para adicionar às funções rápidas */}
                            <button
                              onClick={(e) => handleZapClick(e, item)}
                              className={cn(
                                "h-7 w-7 flex items-center justify-center rounded-md transition-all mr-1",
                                isRapida 
                                  ? "text-amber-500 bg-amber-100 hover:bg-amber-200" 
                                  : "text-sidebar-foreground/40 hover:text-amber-500 hover:bg-amber-50"
                              )}
                              title={isRapida ? "Remover das funções rápidas" : "Adicionar às funções rápidas"}
                            >
                              <Zap className={cn("h-3.5 w-3.5", isRapida && "fill-amber-500")} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Link de Admin - só para admins */}
            {user?.role === 'admin' && (
              <div className="mt-4 pt-4 border-t border-sidebar-border">
                <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">Administração</p>
                <Link href="/admin/funcoes">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Gestão de Funções</span>
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.name || "Utilizador"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.tipoConta === "administradora" ? "Administradora" : "Síndico"}
              </p>
            </div>
            <NotificationBell />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-appsindico.png" alt="App Síndico" className="w-8 h-8 object-contain" />
              <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-5 object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <NotificationAlert condominioId={condominios?.[0]?.id || null} />
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Funções Rápidas Mobile */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funções Rápidas</p>
              <QuickFunctionsEditor onSave={refreshQuickFunctions} triggerClassName="text-muted-foreground" condominioId={condominioId} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {funcoesRapidas && funcoesRapidas.length > 0 ? (
                funcoesRapidas.slice(0, 8).map((funcao, index) => {
                  const funcInfo = allQuickFunctions.find(f => f.id === funcao.funcaoId);
                  const Icon = funcInfo?.icon || Zap;
                  const cor = funcao.cor || CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                  return (
                    <Link key={funcao.id} href={funcao.path}>
                      <button 
                        className="w-full flex flex-col items-center gap-1 p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        style={{ backgroundColor: cor }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-[9px] font-semibold text-white">{funcao.nome}</span>
                      </button>
                    </Link>
                  );
                })
              ) : (
                getSelectedQuickFunctions().slice(0, 8).map((funcId, index) => {
                  const func = allQuickFunctions.find(f => f.id === funcId);
                  if (!func) return null;
                  const Icon = func.icon;
                  const cor = CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                  return (
                    <Link key={func.id} href={`/dashboard/${func.id}`}>
                      <button 
                        className="w-full flex flex-col items-center gap-1 p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        style={{ backgroundColor: cor }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-[9px] font-semibold text-white">{func.label}</span>
                      </button>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 pb-24 lg:pb-6">
          {currentSection === "overview" && <OverviewSection user={user} />}
          {currentSection === "personalizado" && <PaginasCustomWrapper />}
          {currentSection === "destaques" && <DestaquesSection />}
          {currentSection === "painel-controlo" && condominios?.[0] && <PainelControloPage condominioId={condominios[0].id} />}
          {currentSection === "revistas" && <RevistasSection />}
          {currentSection === "condominio" && <CondominioSection />}
          {currentSection === "moradores" && <MoradoresSection />}
          {currentSection === "funcionarios" && <FuncionariosSection />}
          {currentSection === "avisos" && <AvisosSection />}
          {currentSection === "comunicados" && <ComunicadosSection />}
          {currentSection === "eventos" && <EventosSection />}
          {currentSection === "realizacoes" && <RealizacoesSection />}
          {currentSection === "antes-depois" && <AntesDepoisSection />}
          {currentSection === "melhorias" && <MelhoriasSection />}
          {currentSection === "aquisicoes" && <AquisicoesSection />}
          {currentSection === "votacoes" && <VotacoesPage />}
          {currentSection === "vagas" && <VagasEstacionamentoSection />}
          {currentSection === "classificados" && <ClassificadosSection />}
          {currentSection === "moderacao" && <ModeracaoSection />}
          {currentSection === "caronas" && <CaronasSection />}
          {currentSection === "achados" && <AchadosSection />}
          {currentSection === "galeria" && <GaleriaSection />}
          {currentSection === "publicidade" && <PublicidadeSection />}
          {currentSection === "seguranca" && <SegurancaSection />}
          {currentSection === "regras" && <RegrasSection />}
          {currentSection === "vistorias" && condominios?.[0] && <VistoriasPage condominioId={condominios[0].id} />}
          {currentSection === "manutencoes" && condominios?.[0] && <ManutencoesPage condominioId={condominios[0].id} />}
          {currentSection === "ocorrencias" && condominios?.[0] && <OcorrenciasPage condominioId={condominios[0].id} />}
          {currentSection === "notificar-morador" && <NotificarMoradorPage />}
          {currentSection === "checklists" && condominios?.[0] && <ChecklistsPage condominioId={condominios[0].id} />}
          {currentSection === "vencimentos" && condominios?.[0] && <VencimentosSection condominioId={condominios[0].id} />}
          {currentSection === "assembleia" && <AssembleiaOnlineSection />}
          {currentSection === "gestao-notificacoes" && condominios?.[0] && <NotificacoesPage condominioId={condominios[0].id} />}
          {currentSection === "relatorios" && condominios?.[0] && <RelatoriosPage condominioId={condominios[0].id} />}
          {currentSection === "equipe" && condominios?.[0] && <MembrosEquipePage condominioId={condominios[0].id} />}
          {currentSection === "configuracoes" && <ConfiguracoesSection />}
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="grid grid-cols-4 h-16">
          <Link href="/dashboard/overview">
            <button className={cn(
              "w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors",
              currentSection === "overview" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Início</span>
            </button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
          <Link href="/dashboard/revistas">
            <button className={cn(
              "w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors relative",
              currentSection === "revistas" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <div className="w-12 h-12 -mt-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium mt-1">Criar</span>
            </button>
          </Link>
          <Link href="/dashboard/configuracoes">
            <button className={cn(
              "w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors",
              currentSection === "configuracoes" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">Config.</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo-appsindico.png" alt="App Síndico" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Funções Rápidas */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funções Rápidas</p>
                <QuickFunctionsEditor onSave={refreshQuickFunctions} triggerClassName="text-muted-foreground" condominioId={condominioId} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {funcoesRapidas && funcoesRapidas.length > 0 ? (
                  funcoesRapidas.map((funcao, index) => {
                    const funcInfo = allQuickFunctions.find(f => f.id === funcao.funcaoId);
                    const Icon = funcInfo?.icon || Zap;
                    const cor = funcao.cor || CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                    return (
                      <Link key={funcao.id} href={funcao.path} onClick={() => setMobileMenuOpen(false)}>
                        <div 
                          className="flex items-center gap-2 p-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                          style={{ backgroundColor: cor }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                          <span className="text-xs font-semibold text-white">{funcao.nome}</span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  getSelectedQuickFunctions().map((funcId, index) => {
                    const func = allQuickFunctions.find(f => f.id === funcId);
                    if (!func) return null;
                    const Icon = func.icon;
                    const cor = CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
                    return (
                      <Link key={func.id} href={`/dashboard/${func.id}`} onClick={() => setMobileMenuOpen(false)}>
                        <div 
                          className="flex items-center gap-2 p-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                          style={{ backgroundColor: cor }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                          <span className="text-xs font-semibold text-white">{func.label}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Seções do Menu */}
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seções</p>
              <nav className="space-y-1">
                {menuSectionsFiltrado.map((section) => (
                  <div key={section.id}>
                    {section.path ? (
                      <Link href={`/dashboard/${section.path}`} onClick={() => setMobileMenuOpen(false)}>
                        <div className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                          currentSection === section.path
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        )}>
                          <section.icon className="w-5 h-5" />
                          <span className="font-medium">{section.label}</span>
                        </div>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setExpandedSections(prev =>
                              prev.includes(section.id)
                                ? prev.filter(id => id !== section.id)
                                : [...prev, section.id]
                            );
                          }}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <section.icon className="w-5 h-5" />
                            <span className="font-medium">{section.label}</span>
                          </div>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            expandedSections.includes(section.id) && "rotate-180"
                          )} />
                        </button>
                        {expandedSections.includes(section.id) && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                            {section.items.map((item) => (
                              <Link
                                key={item.id}
                                href={`/dashboard/${item.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                  currentSection === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}>
                                  <item.icon className="w-4 h-4" />
                                  <span>{item.label}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* User Info */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// Overview Section
function OverviewSection({ user }: { user: any }) {
  const [deleteAppConfirmId, setDeleteAppConfirmId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  
  const deleteAppMutation = trpc.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("App excluído com sucesso!");
      utils.apps.list.invalidate();
      setDeleteAppConfirmId(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir app: " + error.message);
    },
  });
  
  const { data: favoritosData } = trpc.favorito.list.useQuery({});
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  // Query para apps do condomínio
  const { data: appsData } = trpc.apps.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  const { data: avisos } = trpc.aviso.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const { data: eventos } = trpc.evento.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const { data: votacoes } = trpc.votacao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const { data: comunicados } = trpc.comunicado.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const { data: realizacoes } = trpc.realizacao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const { data: melhorias } = trpc.melhoria.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );

  // Filtrar favoritos por tipo
  const favoritosAvisos = favoritosData?.filter(f => f.tipoItem === 'aviso') || [];
  const favoritosEventos = favoritosData?.filter(f => f.tipoItem === 'evento') || [];
  const favoritosVotacoes = favoritosData?.filter(f => f.tipoItem === 'votacao') || [];
  const favoritosComunicados = favoritosData?.filter(f => f.tipoItem === 'comunicado') || [];
  const favoritosRealizacoes = favoritosData?.filter(f => f.tipoItem === 'realizacao') || [];
  const favoritosMelhorias = favoritosData?.filter(f => f.tipoItem === 'melhoria') || [];

  // Obter itens favoritos
  const avisosFavoritos = avisos?.filter(a => favoritosAvisos.some(f => f.itemId === a.id)) || [];
  const eventosFavoritos = eventos?.filter(e => favoritosEventos.some(f => f.itemId === e.id)) || [];
  const votacoesFavoritas = votacoes?.filter(v => favoritosVotacoes.some(f => f.itemId === v.id)) || [];
  const comunicadosFavoritos = comunicados?.filter(c => favoritosComunicados.some(f => f.itemId === c.id)) || [];
  const realizacoesFavoritas = realizacoes?.filter(r => favoritosRealizacoes.some(f => f.itemId === r.id)) || [];
  const melhoriasFavoritas = melhorias?.filter(m => favoritosMelhorias.some(f => f.itemId === m.id)) || [];

  const temFavoritos = avisosFavoritos.length > 0 || eventosFavoritos.length > 0 || 
    votacoesFavoritas.length > 0 || comunicadosFavoritos.length > 0 || 
    realizacoesFavoritas.length > 0 || melhoriasFavoritas.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Bem-vindo, {user?.name?.split(" ")[0] || (user?.tipoConta === "administradora" ? "Administrador" : "Síndico")}!
        </h1>
        <p className="text-muted-foreground">
          {user?.tipoConta === "administradora" 
            ? "Gerencie apps, projetos digitais e relatórios para seus condomínios."
            : "Crie apps, projetos digitais e relatórios para seu condomínio."
          }
        </p>
      </div>

      {/* Favoritos Section */}
      {temFavoritos && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Meus Favoritos
            </CardTitle>
            <CardDescription>Itens que você marcou como favoritos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {avisosFavoritos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Avisos
                  </h4>
                  <div className="grid gap-2">
                    {avisosFavoritos.slice(0, 3).map((aviso) => (
                      <Link key={aviso.id} href="/dashboard/avisos">
                        <div className="p-3 rounded-lg bg-background border hover:bg-accent transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{aviso.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{aviso.conteudo}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {eventosFavoritos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Eventos
                  </h4>
                  <div className="grid gap-2">
                    {eventosFavoritos.slice(0, 3).map((evento) => (
                      <Link key={evento.id} href="/dashboard/eventos">
                        <div className="p-3 rounded-lg bg-background border hover:bg-accent transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{evento.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {evento.dataEvento ? new Date(evento.dataEvento).toLocaleDateString('pt-BR') : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {votacoesFavoritas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Vote className="w-4 h-4" /> Votações
                  </h4>
                  <div className="grid gap-2">
                    {votacoesFavoritas.slice(0, 3).map((votacao) => (
                      <Link key={votacao.id} href="/dashboard/votacoes">
                        <div className="p-3 rounded-lg bg-background border hover:bg-accent transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{votacao.titulo}</p>
                          <p className="text-xs text-muted-foreground">{votacao.status}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {comunicadosFavoritos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Comunicados
                  </h4>
                  <div className="grid gap-2">
                    {comunicadosFavoritos.slice(0, 3).map((comunicado) => (
                      <Link key={comunicado.id} href="/dashboard/comunicados">
                        <div className="p-3 rounded-lg bg-background border hover:bg-accent transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{comunicado.titulo}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Quick stats - Cards com botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Apps */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{appsData?.length || 0}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Apps Criados</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie apps personalizados para seu condomínio</p>
            <button
              onClick={() => window.location.href = '/dashboard/apps/novo'}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar App
            </button>
          </CardContent>
        </Card>

        {/* Card Relatórios */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">0</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Relatórios Criados</h3>
            <p className="text-sm text-muted-foreground mb-4">Gere relatórios detalhados com sua marca</p>
            <button
              onClick={() => window.location.href = '/dashboard/relatorios/novo'}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Relatório
            </button>
          </CardContent>
        </Card>

        {/* Card Revistas */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">0</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Revistas Criadas</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie revistas digitais interativas</p>
            <button
              onClick={() => window.location.href = '/dashboard/revistas'}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Revista
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Apps Criados */}
      {appsData && appsData.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  Meus Apps
                </CardTitle>
                <CardDescription>Apps criados para seu condomínio</CardDescription>
              </div>
              <Link href="/dashboard/apps/novo">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo App
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appsData.map((app) => (
                <div
                  key={app.id}
                  className="group relative p-4 rounded-xl border-2 border-blue-100 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-blue-900"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{app.nome}</h4>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={app.ativo ? "default" : "secondary"} className="text-xs">
                      {app.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    {app.shareLink && (
                      <Link href={`/app/${app.shareLink}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                          <ExternalLink className="w-4 h-4" />
                          Visualizar
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                      title="Compartilhar via WhatsApp"
                      onClick={() => {
                        if (app.shareLink) {
                          const url = `${window.location.origin}/app/${app.shareLink}`;
                          const message = encodeURIComponent(`Olá! Confira o app "${app.nome}":\n\n${url}`);
                          window.open(`https://wa.me/?text=${message}`, '_blank');
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Copiar link"
                      onClick={() => {
                        if (app.shareLink) {
                          navigator.clipboard.writeText(`${window.location.origin}/app/${app.shareLink}`);
                          toast.success("Link copiado!");
                        }
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Excluir app"
                      onClick={() => setDeleteAppConfirmId(app.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmação de exclusão de app */}
      <AlertDialog open={deleteAppConfirmId !== null} onOpenChange={(open) => !open && setDeleteAppConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir App</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este app? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAppConfirmId && deleteAppMutation.mutate({ id: deleteAppConfirmId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAppMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Primeiros Passos</CardTitle>
          <CardDescription>Configure seu condomínio para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: "Cadastre seu Condomínio", description: "Adicione nome, endereço e logo", done: false, path: "/dashboard/condominio" },
              { step: 2, title: "Adicione Funcionários", description: "Cadastre a equipe do condomínio", done: false, path: "/dashboard/funcionarios" },
              { step: 3, title: "Crie seu Primeiro Projeto", description: "App, revista ou relatório", done: false, path: "/dashboard/criar-projeto" },
              { step: 4, title: "Compartilhe com Moradores", description: "Gere o link e divulgue", done: false, path: "/dashboard/moradores" },
            ].map((item) => (
              <Link key={item.step} href={item.path}>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    item.done ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Templates for revista
const templates = [
  { id: "modern", name: "Moderno", description: "Design contemporâneo e minimalista" },
  { id: "corporate", name: "Corporativo", description: "Profissional e formal" },
  { id: "colorful", name: "Colorido", description: "Vibrante e cheio de vida" },
];

function getCurrentEdition(): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Revistas Section
function RevistasSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mostrarAssistente, setMostrarAssistente] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "Informativo Mensal",
    edicao: getCurrentEdition(),
    templateId: "modern",
  });
  const [, setLocation] = useLocation();
  const [generatingPDFId, setGeneratingPDFId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const generatePDF = trpc.revista.generatePDF.useMutation({
    onSuccess: (data) => {
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF gerado com sucesso!');
      setGeneratingPDFId(null);
    },
    onError: (error) => {
      toast.error('Erro ao gerar PDF: ' + error.message);
      setGeneratingPDFId(null);
    },
  });

  const handleDownloadPDF = (revistaId: number) => {
    setGeneratingPDFId(revistaId);
    generatePDF.mutate({ id: revistaId });
  };

  // Get condominios
  const { data: condominios, isLoading: condominiosLoading } = trpc.condominio.list.useQuery();
  
  // Get revistas for first condominio (if exists)
  const condominioId = condominios?.[0]?.id || 0;
  const { data: revistas, isLoading: revistasLoading } = trpc.revista.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );
  
  // Get apps for first condominio (if exists)
  const { data: appsData, isLoading: appsLoading } = trpc.apps.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const [deleteAppConfirmId, setDeleteAppConfirmId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const deleteAppMutation = trpc.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("App excluído com sucesso!");
      utils.apps.list.invalidate();
      setDeleteAppConfirmId(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir app: " + error.message);
    },
  });

  const handleDeleteApp = (id: number) => {
    deleteAppMutation.mutate({ id });
  };

  const createRevistaMutation = trpc.revista.create.useMutation({
    onSuccess: (data) => {
      toast.success("Projeto criado com sucesso!");
      utils.revista.list.invalidate();
      setIsDialogOpen(false);
      setFormData({
        titulo: "",
        subtitulo: "Informativo Mensal",
        edicao: getCurrentEdition(),
        templateId: "modern",
      });
      // Navigate to editor
      setLocation(`/revista/editor/${data.id}`);
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const deleteRevistaMutation = trpc.revista.delete.useMutation({
    onSuccess: () => {
      toast.success("Projeto excluído com sucesso!");
      utils.revista.list.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir projeto: " + error.message);
    },
  });

  const handleDeleteRevista = (id: number) => {
    deleteRevistaMutation.mutate({ id });
  };

  const handleCreateRevista = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.error("O título do projeto é obrigatório");
      return;
    }
    if (!condominioId) {
      toast.error("Cadastre um condomínio primeiro");
      return;
    }
    createRevistaMutation.mutate({ condominioId, ...formData });
  };

  const isLoading = condominiosLoading || revistasLoading || appsLoading;
  const hasCondominios = condominios && condominios.length > 0;
  const hasRevistas = revistas && revistas.length > 0;
  const hasApps = appsData && appsData.length > 0;
  const hasProjetos = hasRevistas || hasApps;

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-purple-200 text-sm font-medium uppercase tracking-wider">Central de Projetos</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Meus Projetos</h1>
            <p className="text-purple-200 max-w-md">Crie e gerencie apps, revistas digitais e relatórios personalizados para seu condomínio</p>
          </div>
          <Button 
            className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg shadow-purple-900/30 font-semibold px-6 py-3 h-auto"
            onClick={() => setMostrarAssistente(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Projeto
          </Button>
        </div>
        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold">{appsData?.length || 0}</div>
            <div className="text-purple-200 text-sm">Apps Criados</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-3xl font-bold">{revistas?.length || 0}</div>
            <div className="text-purple-200 text-sm">Revistas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">0</div>
            <div className="text-purple-200 text-sm">Relatórios</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : hasProjetos ? (
        <div className="space-y-8">
          {/* Seção de Apps - Premium */}
          {hasApps && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Apps Criados</h2>
                    <p className="text-sm text-slate-500">{appsData?.length || 0} aplicativos</p>
                  </div>
                </div>
                <Link href="/dashboard/apps/novo">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/25">
                    <Plus className="w-4 h-4 mr-1" />
                    Novo App
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {appsData?.map((app) => (
                  <div key={app.id} className="group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-xl" />
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                        <Smartphone className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{app.nome}</h3>
                        <p className="text-xs text-slate-500 mt-1">Criado em {new Date(app.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                      {app.shareLink && (
                        <Link href={`/app/${app.shareLink}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          if (app.shareLink) {
                            const url = `${window.location.origin}/app/${app.shareLink}`;
                            const message = encodeURIComponent(`Confira o app "${app.nome}":\n\n${url}`);
                            window.open(`https://wa.me/?text=${message}`, '_blank');
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (app.shareLink) {
                            navigator.clipboard.writeText(`${window.location.origin}/app/${app.shareLink}`);
                            toast.success("Link copiado!");
                          }
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {deleteAppConfirmId === app.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteApp(app.id)}
                            disabled={deleteAppMutation.isPending}
                          >
                            {deleteAppMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteAppConfirmId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setDeleteAppConfirmId(app.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Revistas - Premium */}
          {hasRevistas && (
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Revistas Digitais</h2>
                    <p className="text-sm text-slate-500">{revistas?.length || 0} publicações</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/25"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nova Revista
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {revistas?.map((revista) => (
                  <div key={revista.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-1">
                    {/* Capa da Revista */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-100 to-fuchsia-100 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                          <span className="text-xs font-medium text-purple-500 uppercase tracking-wider">{revista.edicao}</span>
                        </div>
                      </div>
                      {/* Badge Premium */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          Digital
                        </span>
                      </div>
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Link href={`/revista/${revista.shareLink}`}>
                          <Button size="sm" className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg">
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {/* Info da Revista */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 truncate mb-1">{revista.titulo}</h3>
                      <p className="text-xs text-slate-500">{revista.subtitulo || 'Informativo Mensal'}</p>
                      {/* Ações */}
                      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
                        <Link href={`/revista/editor/${revista.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50">
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            const url = `${window.location.origin}/revista/${revista.shareLink}`;
                            const message = encodeURIComponent(`Confira a revista "${revista.titulo}":\n\n${url}`);
                            window.open(`https://wa.me/?text=${message}`, '_blank');
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/revista/${revista.shareLink}`);
                            toast.success("Link copiado!");
                          }}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(revista.id)}
                          disabled={generatingPDFId === revista.id}
                        >
                          {generatingPDFId === revista.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => setDeleteConfirmId(revista.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Estado Vazio - Cards Premium para Criar Projetos */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Apps - Premium */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl group-hover:bg-blue-300/40 transition-colors" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">0</span>
                  <p className="text-xs text-blue-400 font-medium">apps</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Apps Personalizados</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Crie aplicativos exclusivos com a identidade do seu condomínio</p>
              <Link href="/dashboard/apps/novo">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 font-semibold py-3 h-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Meu App
                </Button>
              </Link>
            </div>
          </div>

          {/* Card Relatórios - Premium */}
          <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl group-hover:bg-emerald-300/40 transition-colors" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30">
                  <FileBarChart className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-transparent">0</span>
                  <p className="text-xs text-emerald-400 font-medium">relatórios</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Relatórios Profissionais</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Gere relatórios detalhados com a sua marca e identidade visual</p>
              <Link href="/dashboard/relatorios/novo">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 font-semibold py-3 h-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Relatório
                </Button>
              </Link>
            </div>
          </div>

          {/* Card Revistas - Premium */}
          <div className="group relative bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-pink-500 to-fuchsia-500" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl group-hover:bg-purple-300/40 transition-colors" />
            {/* Badge Destaque */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                Popular
              </span>
            </div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent">0</span>
                  <p className="text-xs text-purple-400 font-medium">revistas</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Revistas Digitais</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Crie revistas interativas e modernas para comunicar com os moradores</p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 hover:from-purple-600 hover:via-pink-600 hover:to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 font-semibold py-3 h-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Revista
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de criação de revista */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Criar Nova Revista
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                Preencha os dados para criar sua revista digital
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleCreateRevista} className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Revista *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Informativo Mensal"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input
                id="subtitulo"
                placeholder="Ex: Edição Especial"
                value={formData.subtitulo}
                onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edicao">Edição</Label>
              <Input
                id="edicao"
                placeholder="Ex: Janeiro 2024"
                value={formData.edicao}
                onChange={(e) => setFormData({ ...formData, edicao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="colorful">Colorido</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                disabled={createRevistaMutation.isPending}
              >
                {createRevistaMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Revista
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                Excluir Projeto
              </DialogTitle>
              <DialogDescription className="text-red-100">
                Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={() => deleteConfirmId && handleDeleteRevista(deleteConfirmId)}
              disabled={deleteRevistaMutation.isPending}
            >
              {deleteRevistaMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do Assistente de Criação */}
      <Dialog open={mostrarAssistente} onOpenChange={setMostrarAssistente}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Assistente de Criação</DialogTitle>
            <DialogDescription>Crie seu projeto passo a passo</DialogDescription>
          </DialogHeader>
          <AssistenteCriacao 
            onClose={() => setMostrarAssistente(false)}
            onComplete={() => setMostrarAssistente(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Condominio Section
function CondominioSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    logoUrl: "",
    bannerUrl: "",
    capaUrl: "",
  });

  const { data: condominios, isLoading } = trpc.condominio.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.condominio.create.useMutation({
    onSuccess: () => {
      toast.success("Condomínio cadastrado com sucesso!");
      utils.condominio.list.invalidate();
      setIsDialogOpen(false);
      setFormData({ nome: "", endereco: "", cidade: "", estado: "", logoUrl: "", bannerUrl: "", capaUrl: "" });
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome do condomínio é obrigatório");
      return;
    }
    createMutation.mutate(formData);
  };

  const hasCondominios = condominios && condominios.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Meu Condomínio</h1>
          <p className="text-muted-foreground">Configure as informações do seu condomínio</p>
        </div>
        {hasCondominios && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-magazine">
                <Plus className="w-4 h-4 mr-2" />
                Novo Condomínio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              {/* Header Premium */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">Cadastrar Condomínio</DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1">
                      Adicione as informações do seu condomínio
                    </DialogDescription>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Dados do Condomínio</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium text-slate-700">Nome do Condomínio <span className="text-red-500">*</span></Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Residencial Jardins"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-sm font-medium text-slate-700">Endereço</Label>
                    <Input
                      id="endereco"
                      placeholder="Ex: Rua das Flores, 123"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-sm font-medium text-slate-700">Cidade</Label>
                      <Input
                        id="cidade"
                        placeholder="Ex: São Paulo"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium text-slate-700">Estado</Label>
                      <Input
                        id="estado"
                        placeholder="Ex: SP"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Imagens */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Image className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Imagens (Opcional)</h3>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 flex-shrink-0">
                        <ImageUpload
                          value={formData.logoUrl || undefined}
                          onChange={(url) => setFormData({ ...formData, logoUrl: url || "" })}
                          folder="condominios/logos"
                          aspectRatio="square"
                          placeholder="+"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="font-semibold text-slate-800">Logotipo</Label>
                        <p className="text-sm text-slate-500 mt-0.5">Aparece na capa do projeto</p>
                        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 flex-shrink-0">
                        <ImageUpload
                          value={formData.bannerUrl || undefined}
                          onChange={(url) => setFormData({ ...formData, bannerUrl: url || "" })}
                          folder="condominios/banners"
                          aspectRatio="square"
                          placeholder="+"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="font-semibold text-slate-800">Banner</Label>
                        <p className="text-sm text-slate-500 mt-0.5">Topo da revista</p>
                        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 flex-shrink-0">
                        <ImageUpload
                          value={formData.capaUrl || undefined}
                          onChange={(url) => setFormData({ ...formData, capaUrl: url || "" })}
                          folder="condominios/capas"
                          aspectRatio="square"
                          placeholder="+"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="font-semibold text-slate-800">Foto de Capa</Label>
                        <p className="text-sm text-slate-500 mt-0.5">Imagem de fundo do projeto</p>
                        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button type="button" variant="outline" className="flex-1 h-11 border-slate-300 hover:bg-slate-50" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Building2 className="w-4 h-4 mr-2" />Cadastrar Condomínio</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : hasCondominios ? (
        <div className="grid md:grid-cols-2 gap-6">
          {condominios.map((condo) => (
            <Card key={condo.id}>
              <CardHeader>
                <CardTitle className="font-serif">{condo.nome}</CardTitle>
                <CardDescription>
                  {condo.endereco && `${condo.endereco}, `}
                  {condo.cidade && `${condo.cidade}`}
                  {condo.estado && ` - ${condo.estado}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/condominio/${condo.id}`}>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Cadastre seu Condomínio
            </h3>
            <p className="text-muted-foreground mb-4">
              Adicione as informações do seu condomínio para começar
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-magazine">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Condomínio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {/* Header Premium */}
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-white">Cadastrar Condomínio</DialogTitle>
                      <DialogDescription className="text-blue-100 mt-1">
                        Adicione as informações do seu condomínio
                      </DialogDescription>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Dados Básicos */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Dados do Condomínio</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome2" className="text-sm font-medium text-slate-700">Nome do Condomínio <span className="text-red-500">*</span></Label>
                      <Input
                        id="nome2"
                        placeholder="Ex: Residencial Jardins"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco2" className="text-sm font-medium text-slate-700">Endereço</Label>
                      <Input
                        id="endereco2"
                        placeholder="Ex: Rua das Flores, 123"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidade2" className="text-sm font-medium text-slate-700">Cidade</Label>
                        <Input
                          id="cidade2"
                          placeholder="Ex: São Paulo"
                          value={formData.cidade}
                          onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                          className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado2" className="text-sm font-medium text-slate-700">Estado</Label>
                        <Input
                          id="estado2"
                          placeholder="Ex: SP"
                          value={formData.estado}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                          className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Imagens */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Image className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Imagens (Opcional)</h3>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 flex-shrink-0">
                          <ImageUpload
                            value={formData.logoUrl || undefined}
                            onChange={(url) => setFormData({ ...formData, logoUrl: url || "" })}
                            folder="condominios/logos"
                            aspectRatio="square"
                            placeholder="+"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label className="font-semibold text-slate-800">Logotipo</Label>
                          <p className="text-sm text-slate-500 mt-0.5">Aparece na capa do projeto</p>
                          <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 flex-shrink-0">
                          <ImageUpload
                            value={formData.bannerUrl || undefined}
                            onChange={(url) => setFormData({ ...formData, bannerUrl: url || "" })}
                            folder="condominios/banners"
                            aspectRatio="square"
                            placeholder="+"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label className="font-semibold text-slate-800">Banner</Label>
                          <p className="text-sm text-slate-500 mt-0.5">Topo da revista</p>
                          <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 flex-shrink-0">
                          <ImageUpload
                            value={formData.capaUrl || undefined}
                            onChange={(url) => setFormData({ ...formData, capaUrl: url || "" })}
                            folder="condominios/capas"
                            aspectRatio="square"
                            placeholder="+"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label className="font-semibold text-slate-800">Foto de Capa</Label>
                          <p className="text-sm text-slate-500 mt-0.5">Imagem de fundo do projeto</p>
                          <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button type="button" variant="outline" className="flex-1 h-11 border-slate-300 hover:bg-slate-50" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25" disabled={createMutation.isPending}>
                      {createMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Building2 className="w-4 h-4 mr-2" />Cadastrar Condomínio</>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MoradoresSection() {
  const [showMoradorDialog, setShowMoradorDialog] = useState(false);
  const [showExcelDialog, setShowExcelDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [editingMorador, setEditingMorador] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [selectedMoradores, setSelectedMoradores] = useState<number[]>([]);
  const [moradorForm, setMoradorForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    celular: "",
    apartamento: "",
    bloco: "",
    andar: "",
    tipo: "proprietario" as "proprietario" | "inquilino" | "familiar" | "funcionario",
    cpf: "",
    observacoes: "",
  });

  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  const { data: moradores, isLoading, refetch } = trpc.morador.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  const createMorador = trpc.morador.create.useMutation({
    onSuccess: () => {
      toast.success("Morador cadastrado com sucesso!");
      setShowMoradorDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar morador: " + error.message);
    },
  });

  const updateMorador = trpc.morador.update.useMutation({
    onSuccess: () => {
      toast.success("Morador atualizado com sucesso!");
      setShowMoradorDialog(false);
      setEditingMorador(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar morador: " + error.message);
    },
  });

  const deleteMorador = trpc.morador.delete.useMutation({
    onSuccess: () => {
      toast.success("Morador removido com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao remover morador: " + error.message);
    },
  });

  // Mutations para bloqueio de votação
  // @ts-ignore
  const bloquearVotacao = (trpc.morador as any).bloquearVotacao.useMutation({
    onSuccess: () => {
      toast.success("Morador bloqueado para votação");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao bloquear: " + error.message);
    },
  });

  // @ts-ignore
  const desbloquearVotacao = (trpc.morador as any).desbloquearVotacao.useMutation({
    onSuccess: () => {
      toast.success("Morador desbloqueado para votação");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao desbloquear: " + error.message);
    },
  });

  // @ts-ignore
  const bloquearEmMassa = (trpc.morador as any).bloquearVotacaoEmMassa.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.count} moradores bloqueados para votação`);
      setSelectedMoradores([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao bloquear: " + error.message);
    },
  });

  // @ts-ignore
  const desbloquearEmMassa = (trpc.morador as any).desbloquearVotacaoEmMassa.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.count} moradores desbloqueados para votação`);
      setSelectedMoradores([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao desbloquear: " + error.message);
    },
  });

  // @ts-ignore - Método existe no backend
  const createBatch = (trpc.morador as any).createBatch.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.count} moradores cadastrados com sucesso!`);
      setShowExcelDialog(false);
      setExcelData([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar moradores: " + error.message);
    },
  });

  // @ts-ignore - O método existe mas o TypeScript não reconhece ainda
  const generateToken = (trpc.condominio as any).generateCadastroToken.useMutation({
    onSuccess: () => {
      toast.success("Token de cadastro gerado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao gerar token: " + error.message);
    },
  });

  // Buscar condomínio completo para obter o token
  const { data: condominioData, refetch: refetchCondominio } = trpc.condominio.get.useQuery(
    { id: condominioId || 0 },
    { enabled: !!condominioId }
  );

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados");
        setIsProcessingExcel(false);
        return;
      }

      // Parse header
      const header = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
      
      // Map columns
      const nomeIdx = header.findIndex(h => h.includes('nome'));
      const emailIdx = header.findIndex(h => h.includes('email'));
      const telefoneIdx = header.findIndex(h => h.includes('telefone') || h.includes('fone'));
      const celularIdx = header.findIndex(h => h.includes('celular') || h.includes('whatsapp'));
      const apartamentoIdx = header.findIndex(h => h.includes('apartamento') || h.includes('apto') || h.includes('unidade'));
      const blocoIdx = header.findIndex(h => h.includes('bloco') || h.includes('torre'));
      const andarIdx = header.findIndex(h => h.includes('andar'));
      const tipoIdx = header.findIndex(h => h.includes('tipo'));
      const cpfIdx = header.findIndex(h => h.includes('cpf'));

      if (nomeIdx === -1 || apartamentoIdx === -1) {
        toast.error("O arquivo deve conter colunas 'Nome' e 'Apartamento'");
        setIsProcessingExcel(false);
        return;
      }

      // Parse data
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;\t]/).map(v => v.trim().replace(/^"|"$/g, ''));
        
        const nome = values[nomeIdx];
        const apartamento = values[apartamentoIdx];
        
        if (!nome || !apartamento) continue;

        let tipo: "proprietario" | "inquilino" | "familiar" | "funcionario" = "proprietario";
        if (tipoIdx !== -1) {
          const tipoValue = values[tipoIdx]?.toLowerCase();
          if (tipoValue?.includes('inquilino')) tipo = 'inquilino';
          else if (tipoValue?.includes('familiar')) tipo = 'familiar';
          else if (tipoValue?.includes('funcionário') || tipoValue?.includes('funcionario')) tipo = 'funcionario';
        }

        data.push({
          nome,
          email: emailIdx !== -1 ? values[emailIdx] : undefined,
          telefone: telefoneIdx !== -1 ? values[telefoneIdx] : undefined,
          celular: celularIdx !== -1 ? values[celularIdx] : undefined,
          apartamento,
          bloco: blocoIdx !== -1 ? values[blocoIdx] : undefined,
          andar: andarIdx !== -1 ? values[andarIdx] : undefined,
          tipo,
          cpf: cpfIdx !== -1 ? values[cpfIdx] : undefined,
        });
      }

      setExcelData(data);
      toast.success(`${data.length} moradores encontrados no arquivo`);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
    }
    setIsProcessingExcel(false);
  };

  const handleBatchSubmit = () => {
    if (!condominioId) {
      toast.error("Você precisa cadastrar um condomínio primeiro");
      return;
    }
    if (excelData.length === 0) {
      toast.error("Nenhum morador para cadastrar");
      return;
    }
    createBatch.mutate({
      condominioId,
      moradores: excelData,
    });
  };

  const handleGenerateQRCode = async () => {
    if (!condominioId) {
      toast.error("Você precisa cadastrar um condomínio primeiro");
      return;
    }
    await generateToken.mutateAsync({ id: condominioId });
    await refetchCondominio();
    setShowQRCodeDialog(true);
  };

  const cadastroUrl = (condominioData as any)?.cadastroToken 
    ? `${window.location.origin}/cadastro/${(condominioData as any).cadastroToken}`
    : null;

  const resetForm = () => {
    setMoradorForm({
      nome: "",
      email: "",
      telefone: "",
      celular: "",
      apartamento: "",
      bloco: "",
      andar: "",
      tipo: "proprietario",
      cpf: "",
      observacoes: "",
    });
  };

  const handleSubmit = () => {
    if (!moradorForm.nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    if (!moradorForm.apartamento.trim()) {
      toast.error("O apartamento é obrigatório");
      return;
    }
    if (!condominioId) {
      toast.error("Você precisa cadastrar um condomínio primeiro");
      return;
    }

    if (editingMorador) {
      updateMorador.mutate({
        id: editingMorador.id,
        nome: moradorForm.nome,
        email: moradorForm.email || undefined,
        telefone: moradorForm.telefone || undefined,
        celular: moradorForm.celular || undefined,
        apartamento: moradorForm.apartamento,
        bloco: moradorForm.bloco || undefined,
        andar: moradorForm.andar || undefined,
        tipo: moradorForm.tipo,
        cpf: moradorForm.cpf || undefined,
        observacoes: moradorForm.observacoes || undefined,
      });
    } else {
      createMorador.mutate({
        condominioId,
        nome: moradorForm.nome,
        email: moradorForm.email || undefined,
        telefone: moradorForm.telefone || undefined,
        celular: moradorForm.celular || undefined,
        apartamento: moradorForm.apartamento,
        bloco: moradorForm.bloco || undefined,
        andar: moradorForm.andar || undefined,
        tipo: moradorForm.tipo,
        cpf: moradorForm.cpf || undefined,
        observacoes: moradorForm.observacoes || undefined,
      });
    }
  };

  const handleEdit = (morador: any) => {
    setEditingMorador(morador);
    setMoradorForm({
      nome: morador.nome,
      email: morador.email || "",
      telefone: morador.telefone || "",
      celular: morador.celular || "",
      apartamento: morador.apartamento,
      bloco: morador.bloco || "",
      andar: morador.andar || "",
      tipo: morador.tipo || "proprietario",
      cpf: morador.cpf || "",
      observacoes: morador.observacoes || "",
    });
    setShowMoradorDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este morador?")) {
      deleteMorador.mutate({ id });
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "proprietario":
        return { label: "Proprietário", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "inquilino":
        return { label: "Inquilino", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "familiar":
        return { label: "Familiar", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "funcionario":
        return { label: "Funcionário", color: "bg-amber-100 text-amber-800 border-amber-200" };
      default:
        return { label: "Morador", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  // Filtrar moradores pela busca
  const filteredMoradores = moradores?.filter((morador) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      morador.nome.toLowerCase().includes(query) ||
      morador.apartamento.toLowerCase().includes(query) ||
      (morador.bloco && morador.bloco.toLowerCase().includes(query)) ||
      (morador.email && morador.email.toLowerCase().includes(query))
    );
  });

  // Agrupar moradores por bloco
  const moradoresPorBloco = filteredMoradores?.reduce((acc, morador) => {
    const bloco = morador.bloco || "Sem Bloco";
    if (!acc[bloco]) acc[bloco] = [];
    acc[bloco].push(morador);
    return acc;
  }, {} as Record<string, typeof filteredMoradores>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Moradores</h1>
          <p className="text-muted-foreground">Gerencie os moradores do condomínio</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botão QR Code em destaque */}
          <Button 
            onClick={handleGenerateQRCode}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
            disabled={!condominioId || generateToken.isPending}
          >
            {generateToken.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            Gerar QR Code
          </Button>
          
          {/* Botão Importar Excel */}
          <Button 
            variant="outline" 
            onClick={() => setShowExcelDialog(true)}
            disabled={!condominioId}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          
          <Dialog open={showMoradorDialog} onOpenChange={(open) => {
            setShowMoradorDialog(open);
            if (!open) {
              setEditingMorador(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-magazine">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Morador
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  {editingMorador ? "Editar Morador" : "Novo Morador"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100">
                  {editingMorador ? "Atualize as informações do morador" : "Cadastre um novo morador do condomínio"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-4 p-6 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={moradorForm.nome}
                    onChange={(e) => setMoradorForm({ ...moradorForm, nome: e.target.value })}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartamento">Apartamento *</Label>
                  <Input
                    id="apartamento"
                    value={moradorForm.apartamento}
                    onChange={(e) => setMoradorForm({ ...moradorForm, apartamento: e.target.value })}
                    placeholder="Ex: 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloco">Bloco/Torre</Label>
                  <Input
                    id="bloco"
                    value={moradorForm.bloco}
                    onChange={(e) => setMoradorForm({ ...moradorForm, bloco: e.target.value })}
                    placeholder="Ex: A, B, Torre 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="andar">Andar</Label>
                  <Input
                    id="andar"
                    value={moradorForm.andar}
                    onChange={(e) => setMoradorForm({ ...moradorForm, andar: e.target.value })}
                    placeholder="Ex: 1º, 2º, Térreo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={moradorForm.tipo}
                    onValueChange={(value: "proprietario" | "inquilino" | "familiar" | "funcionario") => 
                      setMoradorForm({ ...moradorForm, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                      <SelectItem value="familiar">Familiar</SelectItem>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={moradorForm.email}
                    onChange={(e) => setMoradorForm({ ...moradorForm, email: e.target.value })}
                    placeholder="Ex: joao@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Fixo</Label>
                  <Input
                    id="telefone"
                    value={moradorForm.telefone}
                    onChange={(e) => setMoradorForm({ ...moradorForm, telefone: e.target.value })}
                    placeholder="Ex: (11) 3333-4444"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={moradorForm.celular}
                    onChange={(e) => setMoradorForm({ ...moradorForm, celular: e.target.value })}
                    placeholder="Ex: (11) 99999-8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={moradorForm.cpf}
                    onChange={(e) => setMoradorForm({ ...moradorForm, cpf: e.target.value })}
                    placeholder="Ex: 123.456.789-00"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={moradorForm.observacoes}
                    onChange={(e) => setMoradorForm({ ...moradorForm, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre o morador..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t">
              <Button variant="outline" onClick={() => {
                setShowMoradorDialog(false);
                setEditingMorador(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" 
                onClick={handleSubmit}
                disabled={createMorador.isPending || updateMorador.isPending}
              >
                {(createMorador.isPending || updateMorador.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {editingMorador ? "Salvar Alterações" : "Cadastrar Morador"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Modal de Importação Excel */}
      <Dialog open={showExcelDialog} onOpenChange={setShowExcelDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                Importar Moradores via Excel
              </DialogTitle>
              <DialogDescription className="text-emerald-100">
                Faça upload de um arquivo CSV ou Excel com os dados dos moradores
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            {/* Instruções */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Formato do arquivo:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                O arquivo deve conter as seguintes colunas (separadas por vírgula, ponto-e-vírgula ou tab):
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 list-disc list-inside space-y-1">
                <li><strong>Nome</strong> (obrigatório)</li>
                <li><strong>Apartamento</strong> (obrigatório)</li>
                <li>Bloco/Torre (opcional)</li>
                <li>Andar (opcional)</li>
                <li>Email (opcional)</li>
                <li>Telefone (opcional)</li>
                <li>Celular/WhatsApp (opcional)</li>
                <li>Tipo: Proprietário, Inquilino, Familiar (opcional)</li>
                <li>CPF (opcional)</li>
              </ul>
            </div>

            {/* Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Clique para selecionar arquivo</p>
                <p className="text-xs text-muted-foreground mt-1">CSV, TXT ou Excel</p>
              </label>
            </div>

            {/* Preview dos dados */}
            {isProcessingExcel && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Processando arquivo...</p>
              </div>
            )}

            {excelData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{excelData.length} moradores encontrados</h4>
                  <Button variant="ghost" size="sm" onClick={() => setExcelData([])}>
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Nome</th>
                        <th className="p-2 text-left">Apto</th>
                        <th className="p-2 text-left">Bloco</th>
                        <th className="p-2 text-left">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 10).map((m, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{m.nome}</td>
                          <td className="p-2">{m.apartamento}</td>
                          <td className="p-2">{m.bloco || '-'}</td>
                          <td className="p-2 capitalize">{m.tipo}</td>
                        </tr>
                      ))}
                      {excelData.length > 10 && (
                        <tr className="border-t bg-muted">
                          <td colSpan={4} className="p-2 text-center text-muted-foreground">
                            ... e mais {excelData.length - 10} moradores
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowExcelDialog(false); setExcelData([]); }}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                onClick={handleBatchSubmit}
                disabled={excelData.length === 0 || createBatch.isPending}
              >
                {createBatch.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Cadastrar {excelData.length} Moradores
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                QR Code para Cadastro
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                Imprima este folder e distribua para os moradores se cadastrarem
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            {cadastroUrl ? (
              <>
                {/* Preview do QR Code */}
                <div className="bg-white p-6 rounded-lg border text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cadastroUrl)}`}
                      alt="QR Code"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{condominioData?.nome}</p>
                  <p className="text-xs text-muted-foreground">Cadastro de Moradores</p>
                </div>

                {/* Link */}
                <div className="flex gap-2">
                  <Input value={cadastroUrl} readOnly className="text-xs" />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(cadastroUrl);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Botão para gerar PDF */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  onClick={() => {
                    // Gerar PDF A4 com o folder
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Cadastro de Moradores - ${condominioData?.nome}</title>
                          <style>
                            @page { size: A4; margin: 0; }
                            body { 
                              font-family: Arial, sans-serif; 
                              margin: 0; 
                              padding: 40px;
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              min-height: 100vh;
                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                            }
                            .container {
                              background: white;
                              border-radius: 20px;
                              padding: 40px;
                              max-width: 500px;
                              text-align: center;
                              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                              color: #333;
                            }
                            .logo {
                              font-size: 28px;
                              font-weight: bold;
                              color: #667eea;
                              margin-bottom: 10px;
                            }
                            .subtitle {
                              color: #666;
                              font-size: 14px;
                              margin-bottom: 30px;
                            }
                            .qr-container {
                              background: #f8f9fa;
                              padding: 20px;
                              border-radius: 15px;
                              margin: 20px 0;
                            }
                            .qr-code {
                              width: 200px;
                              height: 200px;
                            }
                            .instructions {
                              background: #e8f4fd;
                              border-radius: 10px;
                              padding: 20px;
                              margin: 20px 0;
                              text-align: left;
                            }
                            .instructions h3 {
                              color: #1976d2;
                              margin: 0 0 15px 0;
                              font-size: 16px;
                            }
                            .instructions ol {
                              margin: 0;
                              padding-left: 20px;
                              color: #555;
                            }
                            .instructions li {
                              margin: 8px 0;
                              font-size: 14px;
                            }
                            .url {
                              background: #f0f0f0;
                              padding: 10px;
                              border-radius: 8px;
                              font-size: 11px;
                              word-break: break-all;
                              color: #666;
                              margin-top: 20px;
                            }
                            .footer {
                              margin-top: 30px;
                              font-size: 12px;
                              color: #999;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <div class="logo">${condominioData?.nome}</div>
                            <div class="subtitle">Cadastro de Moradores</div>
                            
                            <div class="qr-container">
                              <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cadastroUrl)}" alt="QR Code" />
                            </div>
                            
                            <div class="instructions">
                              <h3>📱 Como se cadastrar:</h3>
                              <ol>
                                <li>Abra a câmera do seu celular</li>
                                <li>Aponte para o QR Code acima</li>
                                <li>Clique no link que aparecer</li>
                                <li>Preencha seus dados no formulário</li>
                                <li>Clique em "Enviar Cadastro"</li>
                              </ol>
                            </div>
                            
                            <p style="font-size: 13px; color: #666;">
                              Ou acesse diretamente pelo link:
                            </p>
                            <div class="url">${cadastroUrl}</div>
                            
                            <div class="footer">
                              Powered by App Síndico
                            </div>
                          </div>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                      setTimeout(() => printWindow.print(), 500);
                    }
                  }}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Gerar PDF para Impressão
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-muted-foreground">Gerando link de cadastro...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Barra de busca e ações em massa */}
      {condominioId && moradores && moradores.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar por nome, apartamento ou bloco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredMoradores?.length || 0} morador(es) encontrado(s)
            </div>
          </div>
          
          {/* Barra de ações de bloqueio */}
          <div className="flex items-center gap-3 flex-wrap bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMoradores.length === filteredMoradores?.length && filteredMoradores.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMoradores(filteredMoradores?.map(m => m.id) || []);
                  } else {
                    setSelectedMoradores([]);
                  }
                }}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Selecionar Todos</span>
            </div>
            
            {selectedMoradores.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedMoradores.length} selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => bloquearEmMassa.mutate({ moradorIds: selectedMoradores })}
                    disabled={bloquearEmMassa.isPending}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Bloquear Votação
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => desbloquearEmMassa.mutate({ moradorIds: selectedMoradores })}
                    disabled={desbloquearEmMassa.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Liberar Votação
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!condominioId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Cadastre um condomínio primeiro
            </h3>
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar um condomínio antes de adicionar moradores
            </p>
            <Link href="/dashboard/condominio">
              <Button className="btn-magazine">
                <Building2 className="w-4 h-4 mr-2" />
                Ir para Condomínio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando moradores...</p>
          </CardContent>
        </Card>
      ) : filteredMoradores && filteredMoradores.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(moradoresPorBloco || {}).sort().map(([bloco, moradoresDoBloco]) => (
            <div key={bloco}>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {bloco}
                <span className="text-sm font-normal text-muted-foreground">({moradoresDoBloco?.length || 0} moradores)</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {moradoresDoBloco?.map((morador) => {
                  const tipoBadge = getTipoBadge(morador.tipo || "proprietario");
                  const isSelected = selectedMoradores.includes(morador.id);
                  const isBloqueado = (morador as any).bloqueadoVotacao;
                  return (
                    <Card key={morador.id} className={cn(
                      "overflow-hidden hover:shadow-md transition-shadow",
                      isBloqueado && "border-red-200 bg-red-50/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            {/* Checkbox de seleção */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMoradores([...selectedMoradores, morador.id]);
                                } else {
                                  setSelectedMoradores(selectedMoradores.filter(id => id !== morador.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {morador.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{morador.nome}</h3>
                              <p className="text-sm text-muted-foreground">
                                Apt. {morador.apartamento}{morador.andar ? ` - ${morador.andar}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {/* Botão de bloqueio/desbloqueio individual */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8",
                                isBloqueado ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                              )}
                              onClick={() => {
                                if (isBloqueado) {
                                  desbloquearVotacao.mutate({ moradorId: morador.id });
                                } else {
                                  bloquearVotacao.mutate({ moradorId: morador.id });
                                }
                              }}
                              title={isBloqueado ? "Liberar para votação" : "Bloquear para votação"}
                            >
                              {isBloqueado ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(morador)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(morador.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className={cn(
                            "inline-block px-2 py-0.5 text-xs font-medium rounded-full border",
                            tipoBadge.color
                          )}>
                            {tipoBadge.label}
                          </span>
                          {isBloqueado && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
                              🔒 Bloqueado
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          {morador.email && (
                            <p className="text-muted-foreground flex items-center gap-2">
                              <span className="w-4">@</span>
                              {morador.email}
                            </p>
                          )}
                          {morador.celular && (
                            <p className="text-muted-foreground flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {morador.celular}
                            </p>
                          )}
                          {morador.telefone && !morador.celular && (
                            <p className="text-muted-foreground flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {morador.telefone}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhum morador encontrado" : "Nenhum morador cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Tente uma busca diferente" : "Adicione os moradores do seu condomínio"}
            </p>
            {!searchQuery && (
              <Button className="btn-magazine" onClick={() => setShowMoradorDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Morador
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FuncionariosSection() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [selectedFuncionarioForAccess, setSelectedFuncionarioForAccess] = useState<any>(null);
  const [accessFormData, setAccessFormData] = useState({
    loginEmail: "",
    senha: "",
    loginAtivo: true,
  });
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "",
    departamento: "",
    telefone: "",
    email: "",
    fotoUrl: "",
    tipoFuncionario: "auxiliar" as "zelador" | "porteiro" | "supervisor" | "gerente" | "auxiliar" | "sindico_externo",
  });
  const [selectedCondominios, setSelectedCondominios] = useState<number[]>([]);
  const [selectedApps, setSelectedApps] = useState<number[]>([]);

  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominios?.[0]?.id || 0 },
    { enabled: !!condominios?.[0]?.id }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  // Buscar apps disponíveis para vincular ao funcionário
  const condominioIdAtual = condominios?.[0]?.id || 0;
  const { data: appsDisponiveis } = trpc.apps.list.useQuery(
    { condominioId: condominioIdAtual },
    { enabled: !!condominioIdAtual }
  );

  const { data: funcionarios, isLoading, refetch } = trpc.funcionario.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );

  const createFuncionario = trpc.funcionario.create.useMutation({
    onSuccess: () => {
      toast.success("Funcionário adicionado com sucesso!");
      setShowDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar funcionário: " + error.message);
    },
  });

  const updateFuncionario = trpc.funcionario.update.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      setShowDialog(false);
      setEditingFuncionario(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar funcionário: " + error.message);
    },
  });

  const deleteFuncionario = trpc.funcionario.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário removido com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover funcionário: " + error.message);
    },
  });

  const configurarLogin = trpc.funcionario.configurarLogin.useMutation({
    onSuccess: () => {
      toast.success("Acesso configurado com sucesso!");
      setShowAccessDialog(false);
      setSelectedFuncionarioForAccess(null);
      setAccessFormData({ loginEmail: "", senha: "", loginAtivo: true });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao configurar acesso: " + error.message);
    },
  });

  const { data: funcionarioFuncoes, refetch: refetchFuncoes } = trpc.funcionario.listFuncoes.useQuery(
    { funcionarioId: selectedFuncionarioForAccess?.id || 0 },
    { enabled: !!selectedFuncionarioForAccess?.id }
  );

  const updateFuncoes = trpc.funcionario.updateFuncoes.useMutation({
    onSuccess: () => {
      toast.success("Funções atualizadas com sucesso!");
      refetchFuncoes();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar funções: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cargo: "",
      departamento: "",
      telefone: "",
      email: "",
      fotoUrl: "",
      tipoFuncionario: "auxiliar",
    });
    setSelectedCondominios([]);
    setSelectedApps([]);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    if (!formData.cargo.trim()) {
      toast.error("O cargo é obrigatório");
      return;
    }
    if (!revistaId) {
      toast.error("Você precisa criar um projeto primeiro");
      return;
    }

    if (editingFuncionario) {
      updateFuncionario.mutate({
        id: editingFuncionario.id,
        nome: formData.nome,
        cargo: formData.cargo,
        departamento: formData.departamento || undefined,
        telefone: formData.telefone || undefined,
        email: formData.email || undefined,
        fotoUrl: formData.fotoUrl || undefined,
        tipoFuncionario: formData.tipoFuncionario,
        condominiosIds: selectedCondominios.length > 0 ? selectedCondominios : undefined,
        appsIds: selectedApps.length > 0 ? selectedApps : undefined,
      });
    } else {
      createFuncionario.mutate({
        revistaId,
        nome: formData.nome,
        cargo: formData.cargo,
        departamento: formData.departamento || undefined,
        telefone: formData.telefone || undefined,
        email: formData.email || undefined,
        fotoUrl: formData.fotoUrl || undefined,
        tipoFuncionario: formData.tipoFuncionario,
        condominiosIds: selectedCondominios.length > 0 ? selectedCondominios : undefined,
        appsIds: selectedApps.length > 0 ? selectedApps : undefined,
      });
    }
  };

  const handleEdit = (funcionario: any) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      departamento: funcionario.departamento || "",
      telefone: funcionario.telefone || "",
      email: funcionario.email || "",
      fotoUrl: funcionario.fotoUrl || "",
      tipoFuncionario: funcionario.tipoFuncionario || "auxiliar",
    });
    // TODO: Carregar condomínios e apps vinculados ao editar
    setSelectedCondominios([]);
    setSelectedApps([]);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este funcionário?")) {
      deleteFuncionario.mutate({ id });
    }
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie a equipe do condomínio</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Cadastre um condomínio primeiro
            </h3>
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar um condomínio antes de adicionar funcionários
            </p>
            <Link href="/dashboard/condominio">
              <Button className="btn-magazine">
                <Building2 className="w-4 h-4 mr-2" />
                Ir para Condomínio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie a equipe do condomínio</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingFuncionario(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  {editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100">
                  {editingFuncionario ? "Atualize os dados do funcionário" : "Adicione um novo membro à equipe"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="flex justify-center">
                <ImageUpload
                  value={formData.fotoUrl}
                  onChange={(url) => setFormData({ ...formData, fotoUrl: url || "" })}
                  placeholder="Carregar Imagem"
                  className="w-32 h-32"
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Porteiro, Zelador, Faxineira"
                />
              </div>
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  placeholder="Ex: Portaria, Limpeza, Manutenção"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              
              {/* Tipo de Funcionário */}
              <div>
                <Label htmlFor="tipoFuncionario">Tipo de Funcionário</Label>
                <select
                  id="tipoFuncionario"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.tipoFuncionario}
                  onChange={(e) => setFormData({ ...formData, tipoFuncionario: e.target.value as any })}
                >
                  <option value="auxiliar">Auxiliar</option>
                  <option value="porteiro">Porteiro</option>
                  <option value="zelador">Zelador</option>
                  <option value="supervisor">Supervisor de Rota</option>
                  <option value="gerente">Gerente de Condomínio</option>
                  <option value="sindico_externo">Síndico Externo</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.tipoFuncionario === "supervisor" && "Supervisor pode acessar múltiplos condomínios"}
                  {formData.tipoFuncionario === "gerente" && "Gerente tem acesso parcial definido pelo síndico"}
                  {formData.tipoFuncionario === "sindico_externo" && "Síndico externo com acesso total ao condomínio"}
                </p>
              </div>
              
              {/* Seleção de Condomínios (para supervisores) */}
              {formData.tipoFuncionario === "supervisor" && condominios && condominios.length > 1 && (
                <div>
                  <Label>Condomínios que pode acessar</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {condominios.map((cond) => (
                      <label key={cond.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCondominios.includes(cond.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCondominios([...selectedCondominios, cond.id]);
                            } else {
                              setSelectedCondominios(selectedCondominios.filter(id => id !== cond.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{cond.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Seleção de Apps */}
              {appsDisponiveis && appsDisponiveis.length > 0 && (
                <div>
                  <Label>Apps que pode acessar</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {appsDisponiveis.map((app) => (
                      <label key={app.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApps([...selectedApps, app.id]);
                            } else {
                              setSelectedApps(selectedApps.filter(id => id !== app.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{app.nome}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione os apps que este funcionário poderá acessar
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => {
                setShowDialog(false);
                setEditingFuncionario(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button
                className="btn-magazine"
                onClick={handleSubmit}
                disabled={createFuncionario.isPending || updateFuncionario.isPending}
              >
                {(createFuncionario.isPending || updateFuncionario.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {editingFuncionario ? "Salvar Alterações" : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Configurar Acesso */}
        <Dialog open={showAccessDialog} onOpenChange={(open) => {
          setShowAccessDialog(open);
          if (!open) {
            setSelectedFuncionarioForAccess(null);
            setAccessFormData({ loginEmail: "", senha: "", loginAtivo: true });
          }
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  Configurar Acesso - {selectedFuncionarioForAccess?.nome}
                </DialogTitle>
                <DialogDescription className="text-violet-100">
                  Configure o login e as funções que este funcionário terá acesso
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Configuração de Login */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Dados de Acesso
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loginEmail">Email de Login *</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={accessFormData.loginEmail || selectedFuncionarioForAccess?.loginEmail || ""}
                      onChange={(e) => setAccessFormData({ ...accessFormData, loginEmail: e.target.value })}
                      placeholder="email@login.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={accessFormData.senha}
                      onChange={(e) => setAccessFormData({ ...accessFormData, senha: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="loginAtivo"
                    checked={accessFormData.loginAtivo}
                    onChange={(e) => setAccessFormData({ ...accessFormData, loginAtivo: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="loginAtivo">Acesso ativo</Label>
                </div>
              </div>

              {/* Gestão de Funções */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Funções Habilitadas
                </h4>
                <p className="text-xs text-muted-foreground">
                  Selecione as funções que este funcionário poderá acessar
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {[
                    { key: "checklists", label: "Checklists" },
                    { key: "manutencoes", label: "Manutenções" },
                    { key: "ocorrencias", label: "Ocorrências" },
                    { key: "vistorias", label: "Vistorias" },
                    { key: "antes_depois", label: "Antes e Depois" },
                    { key: "funcionarios", label: "Funcionários" },
                    { key: "moradores", label: "Moradores" },
                    { key: "avisos", label: "Avisos" },
                    { key: "comunicados", label: "Comunicados" },
                    { key: "eventos", label: "Eventos" },
                  ].map((funcao) => {
                    const isEnabled = funcionarioFuncoes?.some(
                      (f) => f.funcaoKey === funcao.key && f.habilitada
                    );
                    return (
                      <div key={funcao.key} className="flex items-center gap-2 p-2 rounded border">
                        <input
                          type="checkbox"
                          id={`funcao-${funcao.key}`}
                          checked={isEnabled}
                          onChange={(e) => {
                            const currentFuncoes = funcionarioFuncoes || [];
                            const newFuncoes = currentFuncoes.filter(f => f.funcaoKey !== funcao.key);
                            newFuncoes.push({ funcaoKey: funcao.key, habilitada: e.target.checked } as any);
                            updateFuncoes.mutate({
                              funcionarioId: selectedFuncionarioForAccess?.id,
                              funcoes: newFuncoes.map(f => ({ funcaoKey: f.funcaoKey, habilitada: f.habilitada })),
                            });
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`funcao-${funcao.key}`} className="text-sm cursor-pointer">
                          {funcao.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => {
                setShowAccessDialog(false);
                setSelectedFuncionarioForAccess(null);
                setAccessFormData({ loginEmail: "", senha: "", loginAtivo: true });
              }}>
                Cancelar
              </Button>
              <Button
                className="btn-magazine"
                onClick={() => {
                  if (!accessFormData.loginEmail && !selectedFuncionarioForAccess?.loginEmail) {
                    toast.error("Email de login é obrigatório");
                    return;
                  }
                  if (!accessFormData.senha && !selectedFuncionarioForAccess?.senha) {
                    toast.error("Senha é obrigatória");
                    return;
                  }
                  configurarLogin.mutate({
                    funcionarioId: selectedFuncionarioForAccess?.id,
                    loginEmail: accessFormData.loginEmail || selectedFuncionarioForAccess?.loginEmail,
                    senha: accessFormData.senha,
                    loginAtivo: accessFormData.loginAtivo,
                  });
                }}
                disabled={configurarLogin.isPending}
              >
                {configurarLogin.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Salvar Acesso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando funcionários...</p>
          </CardContent>
        </Card>
      ) : funcionarios && funcionarios.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcionarios.map((funcionario) => (
            <Card key={funcionario.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted relative">
                  {funcionario.fotoUrl ? (
                    <img
                      src={funcionario.fotoUrl}
                      alt={funcionario.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <FavoriteButton
                      tipoItem="funcionario"
                      itemId={funcionario.id}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-white/80 hover:bg-white"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-semibold text-foreground">{funcionario.nome}</h3>
                  <p className="text-sm text-primary font-medium">{funcionario.cargo}</p>
                  {funcionario.departamento && (
                    <p className="text-xs text-muted-foreground mt-1">{funcionario.departamento}</p>
                  )}
                  {(funcionario.telefone || funcionario.email) && (
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {funcionario.telefone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {funcionario.telefone}
                        </p>
                      )}
                      {funcionario.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          {funcionario.email}
                        </p>
                      )}
                    </div>
                  )}
                  {funcionario.loginAtivo && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <Key className="w-3 h-3" />
                      <span>Acesso ativo</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(funcionario)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFuncionarioForAccess(funcionario);
                        setShowAccessDialog(true);
                      }}
                      title="Configurar acesso"
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(funcionario.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Adicione os funcionários do seu condomínio
            </p>
            <Button className="btn-magazine" onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Funcionário
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AvisosSection() {
  const [showAvisoDialog, setShowAvisoDialog] = useState(false);
  const [editingAviso, setEditingAviso] = useState<any>(null);
  const [avisoForm, setAvisoForm] = useState({
    titulo: "",
    conteudo: "",
    tipo: "informativo" as "informativo" | "importante" | "urgente",
  });

  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  // Buscar revistas do condomínio para associar avisos
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id;
  
  const { data: avisos, isLoading, refetch } = trpc.aviso.list.useQuery(
    { revistaId: revistaId || 0 },
    { enabled: !!revistaId }
  );

  const notifyAll = trpc.notificacao.notifyAll.useMutation();

  const createAviso = trpc.aviso.create.useMutation({
    onSuccess: (data) => {
      toast.success("Aviso criado com sucesso!");
      setShowAvisoDialog(false);
      resetForm();
      refetch();
      
      // Enviar notificação para todos os moradores
      if (condominioId) {
        notifyAll.mutate({
          condominioId,
          tipo: "aviso",
          titulo: `Novo aviso: ${avisoForm.titulo}`,
          mensagem: avisoForm.conteudo || undefined,
          link: `/dashboard/avisos`,
          referenciaId: data.id,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar aviso: " + error.message);
    },
  });

  const updateAviso = trpc.aviso.update.useMutation({
    onSuccess: () => {
      toast.success("Aviso atualizado com sucesso!");
      setShowAvisoDialog(false);
      setEditingAviso(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar aviso: " + error.message);
    },
  });

  const deleteAviso = trpc.aviso.delete.useMutation({
    onSuccess: () => {
      toast.success("Aviso excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir aviso: " + error.message);
    },
  });

  const resetForm = () => {
    setAvisoForm({
      titulo: "",
      conteudo: "",
      tipo: "informativo",
    });
  };

  const handleSubmit = () => {
    if (!avisoForm.titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    if (!revistaId) {
      toast.error("Você precisa criar um projeto primeiro");
      return;
    }

    if (editingAviso) {
      updateAviso.mutate({
        id: editingAviso.id,
        titulo: avisoForm.titulo,
        conteudo: avisoForm.conteudo || undefined,
        tipo: avisoForm.tipo,
      });
    } else {
      createAviso.mutate({
        revistaId,
        titulo: avisoForm.titulo,
        conteudo: avisoForm.conteudo || undefined,
        tipo: avisoForm.tipo,
      });
    }
  };

  const handleEdit = (aviso: any) => {
    setEditingAviso(aviso);
    setAvisoForm({
      titulo: aviso.titulo,
      conteudo: aviso.conteudo || "",
      tipo: aviso.tipo || "informativo",
    });
    setShowAvisoDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este aviso?")) {
      deleteAviso.mutate({ id });
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200";
      case "importante":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Avisos</h1>
          <p className="text-muted-foreground">Gerencie os avisos do condomínio</p>
        </div>
        <Dialog open={showAvisoDialog} onOpenChange={(open) => {
          setShowAvisoDialog(open);
          if (!open) {
            setEditingAviso(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Criar Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  {editingAviso ? "Editar Aviso" : "Novo Aviso"}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {editingAviso ? "Atualize as informações do aviso" : "Crie um novo aviso para os moradores"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={avisoForm.titulo}
                  onChange={(e) => setAvisoForm({ ...avisoForm, titulo: e.target.value })}
                  placeholder="Ex: Manutenção da Piscina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={avisoForm.conteudo}
                  onChange={(e) => setAvisoForm({ ...avisoForm, conteudo: e.target.value })}
                  placeholder="Descreva o aviso em detalhes..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={avisoForm.tipo}
                  onValueChange={(value: "informativo" | "importante" | "urgente") => 
                    setAvisoForm({ ...avisoForm, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="importante">Importante</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowAvisoDialog(false);
                  setEditingAviso(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button 
                  className="btn-magazine" 
                  onClick={handleSubmit}
                  disabled={createAviso.isPending || updateAviso.isPending}
                >
                  {(createAviso.isPending || updateAviso.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Save className="w-4 h-4 mr-2" />
                  {editingAviso ? "Salvar Alterações" : "Criar Aviso"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!condominioId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Cadastre um condomínio primeiro
            </h3>
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar um condomínio antes de criar avisos
            </p>
            <Link href="/dashboard/condominio">
              <Button className="btn-magazine">
                <Building2 className="w-4 h-4 mr-2" />
                Ir para Condomínio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando avisos...</p>
          </CardContent>
        </Card>
      ) : avisos && avisos.length > 0 ? (
        <div className="grid gap-4">
          {avisos.map((aviso) => (
            <Card key={aviso.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-4">
                  <div className={cn(
                    "w-1 self-stretch rounded-full",
                    aviso.tipo === "urgente" ? "bg-red-500" :
                    aviso.tipo === "importante" ? "bg-amber-500" : "bg-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-semibold text-foreground">
                          {aviso.titulo}
                        </h3>
                        <span className={cn(
                          "inline-block px-2 py-0.5 text-xs font-medium rounded-full border mt-1",
                          getTipoBadgeColor(aviso.tipo || "informativo")
                        )}>
                          {aviso.tipo === "urgente" ? "Urgente" :
                           aviso.tipo === "importante" ? "Importante" : "Informativo"}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <FavoriteButton
                          tipoItem="aviso"
                          itemId={aviso.id}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(aviso)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(aviso.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {aviso.conteudo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {aviso.conteudo}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Criado em: {new Date(aviso.createdAt).toLocaleDateString('pt-BR')}</span>
                      {aviso.dataExpiracao && (
                        <span>Expira em: {new Date(aviso.dataExpiracao).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Nenhum aviso criado
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie avisos para informar os moradores
            </p>
            <Button className="btn-magazine" onClick={() => setShowAvisoDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Aviso
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventosSection() {
  const [showEventoDialog, setShowEventoDialog] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);
  const [eventoForm, setEventoForm] = useState({
    titulo: "",
    descricao: "",
    local: "",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
    nomeResponsavel: "",
    whatsappResponsavel: "",
    lembreteAntecedencia: 1,
  });

  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id;
  
  const { data: eventos, isLoading, refetch } = trpc.evento.list.useQuery(
    { revistaId: revistaId || 0 },
    { enabled: !!revistaId }
  );

  const notifyAll = trpc.notificacao.notifyAll.useMutation();

  const createEvento = trpc.evento.create.useMutation({
    onSuccess: (data) => {
      toast.success("Evento criado com sucesso!");
      setShowEventoDialog(false);
      resetForm();
      refetch();
      
      // Enviar notificação para todos os moradores
      if (condominioId) {
        notifyAll.mutate({
          condominioId,
          tipo: "evento",
          titulo: `Novo evento: ${eventoForm.titulo}`,
          mensagem: eventoForm.descricao || `Local: ${eventoForm.local}`,
          link: `/dashboard/eventos`,
          referenciaId: data.id,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });



  const deleteEvento = trpc.evento.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento: " + error.message);
    },
  });

  const sendAllReminders = trpc.evento.sendAllPendingReminders.useMutation({
    onSuccess: (data) => {
      if (data.enviados > 0) {
        toast.success(`${data.enviados} lembrete(s) enviado(s) com sucesso!`);
      } else {
        toast.info("Não há lembretes pendentes para enviar.");
      }
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao enviar lembretes: " + error.message);
    },
  });

  const resetForm = () => {
    setEventoForm({
      titulo: "",
      descricao: "",
      local: "",
      dataInicio: "",
      horaInicio: "",
      dataFim: "",
      horaFim: "",
      nomeResponsavel: "",
      whatsappResponsavel: "",
      lembreteAntecedencia: 1,
    });
  };

  const handleSubmit = () => {
    if (!eventoForm.titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    if (!eventoForm.dataInicio) {
      toast.error("A data de início é obrigatória");
      return;
    }
    if (!revistaId) {
      toast.error("Você precisa criar um projeto primeiro");
      return;
    }

    const dataEvento = new Date(`${eventoForm.dataInicio}T${eventoForm.horaInicio || "00:00"}`);

    if (editingEvento) {
      // Não há update no router, então vamos deletar e criar novamente
      toast.info("Para editar, exclua e crie novamente");
      setShowEventoDialog(false);
    } else {
      createEvento.mutate({
        revistaId,
        titulo: eventoForm.titulo,
        descricao: eventoForm.descricao || undefined,
        local: eventoForm.local || undefined,
        dataEvento,
        horaInicio: eventoForm.horaInicio || undefined,
        horaFim: eventoForm.horaFim || undefined,
        nomeResponsavel: eventoForm.nomeResponsavel || undefined,
        whatsappResponsavel: eventoForm.whatsappResponsavel || undefined,
        lembreteAntecedencia: eventoForm.lembreteAntecedencia,
      });
    }
  };

  const handleEdit = (evento: any) => {
    setEditingEvento(evento);
    const dataEvento = evento.dataEvento ? new Date(evento.dataEvento) : new Date();
    setEventoForm({
      titulo: evento.titulo,
      descricao: evento.descricao || "",
      local: evento.local || "",
      dataInicio: dataEvento.toISOString().split("T")[0],
      horaInicio: evento.horaInicio || "",
      dataFim: "",
      horaFim: evento.horaFim || "",
      nomeResponsavel: evento.nomeResponsavel || "",
      whatsappResponsavel: evento.whatsappResponsavel || "",
      lembreteAntecedencia: evento.lembreteAntecedencia || 1,
    });
    setShowEventoDialog(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground">Gerencie a agenda de eventos</p>
        </div>
        <Dialog open={showEventoDialog} onOpenChange={(open) => {
          setShowEventoDialog(open);
          if (!open) {
            setEditingEvento(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          </DialogTrigger>
          <Button 
            variant="outline" 
            onClick={() => sendAllReminders.mutate()}
            disabled={sendAllReminders.isPending}
            className="ml-2"
          >
            <Bell className="w-4 h-4 mr-2" />
            {sendAllReminders.isPending ? "Enviando..." : "Enviar Lembretes"}
          </Button>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  {editingEvento ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
                <DialogDescription className="text-emerald-100">
                  {editingEvento ? "Atualize as informações do evento" : "Adicione um novo evento à agenda"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Assembleia Geral"
                  value={eventoForm.titulo}
                  onChange={(e) => setEventoForm({ ...eventoForm, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o evento..."
                  value={eventoForm.descricao}
                  onChange={(e) => setEventoForm({ ...eventoForm, descricao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  placeholder="Ex: Salão de Festas"
                  value={eventoForm.local}
                  onChange={(e) => setEventoForm({ ...eventoForm, local: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={eventoForm.dataInicio}
                    onChange={(e) => setEventoForm({ ...eventoForm, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="horaInicio">Hora Início</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={eventoForm.horaInicio}
                    onChange={(e) => setEventoForm({ ...eventoForm, horaInicio: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={eventoForm.dataFim}
                    onChange={(e) => setEventoForm({ ...eventoForm, dataFim: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="horaFim">Hora Fim</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={eventoForm.horaFim}
                    onChange={(e) => setEventoForm({ ...eventoForm, horaFim: e.target.value })}
                  />
                </div>
              </div>
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-foreground mb-3">Contacto do Responsável (opcional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeResponsavel">Nome</Label>
                    <Input
                      id="nomeResponsavel"
                      placeholder="Ex: João Silva"
                      value={eventoForm.nomeResponsavel}
                      onChange={(e) => setEventoForm({ ...eventoForm, nomeResponsavel: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsappResponsavel">WhatsApp</Label>
                    <Input
                      id="whatsappResponsavel"
                      placeholder="Ex: 5511999999999"
                      value={eventoForm.whatsappResponsavel}
                      onChange={(e) => setEventoForm({ ...eventoForm, whatsappResponsavel: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Formato: código do país + DDD + número (sem espaços)</p>
              </div>
              
              {/* Configuração de Lembrete */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <Label className="text-amber-800 dark:text-amber-200 font-medium">Lembrete Automático</Label>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Notificar moradores</span>
                  <select
                    value={eventoForm.lembreteAntecedencia}
                    onChange={(e) => setEventoForm({ ...eventoForm, lembreteAntecedencia: Number(e.target.value) })}
                    className="px-3 py-1.5 border rounded-md bg-background text-sm"
                  >
                    <option value={0}>Não enviar</option>
                    <option value={1}>1 dia antes</option>
                    <option value={2}>2 dias antes</option>
                    <option value={3}>3 dias antes</option>
                    <option value={5}>5 dias antes</option>
                    <option value={7}>1 semana antes</option>
                  </select>
                  <span className="text-sm text-muted-foreground">do evento</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Os moradores receberão uma notificação de lembrete sobre este evento.
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEventoDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="btn-magazine" 
                  onClick={handleSubmit}
                  disabled={createEvento.isPending}
                >
                  {createEvento.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Criar Evento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : eventos && eventos.length > 0 ? (
        <div className="grid gap-4">
          {eventos.map((evento) => (
            <Card key={evento.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 bg-primary/10 flex flex-col items-center justify-center p-4">
                    <span className="text-3xl font-bold text-primary">
                      {evento.dataEvento ? new Date(evento.dataEvento).getDate() : "--"}
                    </span>
                    <span className="text-sm text-primary uppercase">
                      {evento.dataEvento ? new Date(evento.dataEvento).toLocaleDateString("pt-BR", { month: "short" }) : ""}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{evento.titulo}</h3>
                        {evento.local && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📍 {evento.local}
                          </p>
                        )}
                        {evento.descricao && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {evento.descricao}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          🕒 {evento.dataEvento ? formatDate(evento.dataEvento) : "Data não definida"}
                          {evento.horaInicio && ` às ${evento.horaInicio}`}
                          {evento.horaFim && ` - ${evento.horaFim}`}
                        </p>
                        {evento.nomeResponsavel && (
                          <p className="text-xs text-muted-foreground mt-1">
                            👤 Responsável: {evento.nomeResponsavel}
                          </p>
                        )}
                        {evento.lembreteAntecedencia && evento.lembreteAntecedencia > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Bell className="w-3 h-3 text-amber-500" />
                            <span className={`text-xs ${evento.lembreteEnviado ? 'text-green-600' : 'text-amber-600'}`}>
                              {evento.lembreteEnviado 
                                ? '✓ Lembrete enviado' 
                                : `Lembrete: ${evento.lembreteAntecedencia} dia(s) antes`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 items-start">
                        {evento.whatsappResponsavel && (
                          <a
                            href={`https://wa.me/${evento.whatsappResponsavel.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(evento)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteEvento.mutate({ id: evento.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Nenhum evento agendado
            </h3>
            <p className="text-muted-foreground mb-4">
              Adicione eventos à agenda do condomínio
            </p>
            <Button className="btn-magazine" onClick={() => setShowEventoDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VotacoesSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id || 0;

  const { data: votacoes, refetch } = trpc.votacao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );

  const createVotacao = trpc.votacao.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Votação criada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar votação: " + error.message);
    },
  });

  const deleteVotacao = trpc.votacao.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Votação removida!");
    },
  });

  const encerrarVotacao = trpc.votacao.encerrar.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Votação encerrada!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"funcionario_mes" | "enquete" | "decisao">("enquete");
  const [dataFim, setDataFim] = useState("");
  const [opcoes, setOpcoes] = useState<{ titulo: string; descricao: string }[]>([
    { titulo: "", descricao: "" },
    { titulo: "", descricao: "" },
  ]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setTipo("enquete");
    setDataFim("");
    setOpcoes([{ titulo: "", descricao: "" }, { titulo: "", descricao: "" }]);
  };

  const addOpcao = () => {
    setOpcoes([...opcoes, { titulo: "", descricao: "" }]);
  };

  const removeOpcao = (index: number) => {
    if (opcoes.length > 2) {
      setOpcoes(opcoes.filter((_, i) => i !== index));
    } else {
      toast.error("Mínimo de 2 opções");
    }
  };

  const updateOpcao = (index: number, field: "titulo" | "descricao", value: string) => {
    const newOpcoes = [...opcoes];
    newOpcoes[index][field] = value;
    setOpcoes(newOpcoes);
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const opcoesValidas = opcoes.filter(o => o.titulo.trim());
    if (opcoesValidas.length < 2) {
      toast.error("Adicione pelo menos 2 opções");
      return;
    }
    createVotacao.mutate({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      tipo,
      dataFim: dataFim ? new Date(dataFim) : undefined,
      opcoes: opcoesValidas,
    });
  };

  const tipoLabels: Record<string, string> = {
    funcionario_mes: "Funcionário do Mês",
    enquete: "Enquete",
    decisao: "Decisão",
  };

  const tipoColors: Record<string, string> = {
    funcionario_mes: "bg-amber-100 text-amber-800",
    enquete: "bg-blue-100 text-blue-800",
    decisao: "bg-purple-100 text-purple-800",
  };

  const statusColors: Record<string, string> = {
    ativa: "bg-green-100 text-green-800",
    encerrada: "bg-gray-100 text-gray-800",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Votações</h1>
          <p className="text-muted-foreground">Gerencie votações e enquetes</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Votações</h1>
          <p className="text-muted-foreground">Crie enquetes e votações para os moradores</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Nova Votação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Votação</DialogTitle>
              <DialogDescription>Crie uma votação ou enquete para os moradores</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Funcionário do Mês - Dezembro"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a votação..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enquete">Enquete</SelectItem>
                      <SelectItem value="funcionario_mes">Funcionário do Mês</SelectItem>
                      <SelectItem value="decisao">Decisão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Encerramento</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>

              {/* Opções */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Opções de Voto *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOpcao}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Opção
                  </Button>
                </div>
                {opcoes.map((opcao, index) => (
                  <div key={index} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        value={opcao.titulo}
                        onChange={(e) => updateOpcao(index, "titulo", e.target.value)}
                        placeholder="Título da opção"
                        className="flex-1"
                      />
                      {opcoes.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOpcao(index)}
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={opcao.descricao}
                      onChange={(e) => updateOpcao(index, "descricao", e.target.value)}
                      placeholder="Descrição (opcional)"
                      className="ml-8"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  className="btn-magazine"
                  onClick={handleSubmit}
                  disabled={createVotacao.isPending}
                >
                  {createVotacao.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Criar Votação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {votacoes?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma votação criada</p>
            <Button onClick={() => setShowDialog(true)} className="btn-magazine">
              Criar Primeira Votação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {votacoes?.map((votacao) => {
            const totalVotos = 0; // Seria calculado com as opções
            return (
              <Card key={votacao.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", tipoColors[votacao.tipo])}>
                          {tipoLabels[votacao.tipo]}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[votacao.status || "ativa"])}>
                          {votacao.status === "encerrada" ? "Encerrada" : "Ativa"}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg mb-1">{votacao.titulo}</h3>
                      {votacao.descricao && (
                        <p className="text-muted-foreground text-sm mb-3">{votacao.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {votacao.dataFim && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Encerra: {new Date(votacao.dataFim).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Criada em {new Date(votacao.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/votar/${votacao.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copiado! Partilhe com os moradores.");
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Copiar Link
                      </Button>
                      {votacao.status !== "encerrada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja encerrar esta votação?")) {
                              encerrarVotacao.mutate({ id: votacao.id });
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Encerrar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta votação?")) {
                            deleteVotacao.mutate({ id: votacao.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClassificadosSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: classificados, refetch } = trpc.classificado.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const createClassificado = trpc.classificado.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Classificado publicado com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteClassificado = trpc.classificado.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Classificado removido!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState<"produto" | "servico">("produto");
  const [imagemUrl, setImagemUrl] = useState("");
  const [contato, setContato] = useState("");

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setPreco("");
    setCategoria("produto");
    setImagemUrl("");
    setContato("");
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    createClassificado.mutate({
      condominioId,
      titulo,
      descricao: descricao || undefined,
      preco: preco || undefined,
      tipo: categoria,
      fotoUrl: imagemUrl || undefined,
      contato: contato || undefined,
    });
  };

  const tipoLabels: Record<string, string> = {
    produto: "Produto",
    servico: "Serviço",
  };

  const tipoColors: Record<string, string> = {
    produto: "bg-blue-100 text-blue-800",
    servico: "bg-green-100 text-green-800",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Classificados</h1>
          <p className="text-muted-foreground">Classificados dos moradores</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Classificados</h1>
          <p className="text-muted-foreground">Produtos e serviços oferecidos pelos moradores</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Classificado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Classificado</DialogTitle>
              <DialogDescription>Publique um produto ou serviço</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Sofá 3 lugares" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o item..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço</Label>
                  <Input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="R$ 0,00" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={(v) => setCategoria(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Contato</Label>
                <Input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Telefone ou email" />
              </div>
              <div>
                <Label>Imagem</Label>
                <ImageUpload 
                  value={imagemUrl} 
                  onChange={(url) => setImagemUrl(url || "")} 
                  aspectRatio="video"
                  placeholder="Adicionar foto"
                  compact
                />
              </div>
              <Button onClick={handleSubmit} disabled={createClassificado.isPending} className="w-full">
                {createClassificado.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Publicar Classificado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classificados?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum classificado publicado</p>
            <Button onClick={() => setShowDialog(true)}>Publicar Primeiro Classificado</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classificados?.map((item) => (
            <Card key={item.id}>
              {item.fotoUrl && (
                <div className="aspect-video bg-muted">
                  <img src={item.fotoUrl} alt={item.titulo} className="w-full h-full object-cover rounded-t-lg" />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", tipoColors[item.tipo] || "bg-gray-100 text-gray-800")}>
                    {tipoLabels[item.tipo] || item.tipo}
                  </span>
                </div>
                {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  {item.preco && <p className="text-lg font-bold text-primary">{item.preco}</p>}
                  {item.contato && <p className="text-sm text-muted-foreground">Contato: {item.contato}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteClassificado.mutate({ id: item.id })}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CaronasSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: caronas, refetch } = trpc.carona.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const createCarona = trpc.carona.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Carona publicada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteCarona = trpc.carona.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Carona removida!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [tipo, setTipo] = useState<"oferece" | "procura">("oferece");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [horario, setHorario] = useState("");
  const [vagasDisponiveis, setVagasDisponiveis] = useState("1");
  const [observacoes, setObservacoes] = useState("");

  const resetForm = () => {
    setTipo("oferece");
    setOrigem("");
    setDestino("");
    setHorario("");
    setVagasDisponiveis("1");
    setObservacoes("");
  };

  const handleSubmit = () => {
    if (!origem.trim() || !destino.trim()) {
      toast.error("Origem e destino são obrigatórios");
      return;
    }
    createCarona.mutate({
      condominioId,
      tipo,
      origem,
      destino,
      horario: horario || undefined,
      vagasDisponiveis: parseInt(vagasDisponiveis) || 1,
      observacoes: observacoes || undefined,
    });
  };

  const tipoLabels: Record<string, string> = {
    oferece: "Oferece Carona",
    procura: "Procura Carona",
  };

  const tipoColors: Record<string, string> = {
    oferece: "bg-green-100 text-green-800",
    procura: "bg-blue-100 text-blue-800",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Caronas</h1>
          <p className="text-muted-foreground">Sistema de carona coletiva</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Caronas</h1>
          <p className="text-muted-foreground">Ofereça ou procure caronas entre moradores</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Carona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  Nova Carona
                </DialogTitle>
                <DialogDescription className="text-green-100">
                  Ofereça ou procure uma carona
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oferece">Ofereço Carona</SelectItem>
                    <SelectItem value="procura">Procuro Carona</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origem *</Label>
                  <Input value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Ex: Condomínio" />
                </div>
                <div>
                  <Label>Destino *</Label>
                  <Input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Ex: Centro" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horário</Label>
                  <Input value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ex: 08:00" />
                </div>
                <div>
                  <Label>Vagas Disponíveis</Label>
                  <Input type="number" min="1" value={vagasDisponiveis} onChange={(e) => setVagasDisponiveis(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais..." />
              </div>
              <Button onClick={handleSubmit} disabled={createCarona.isPending} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                {createCarona.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Publicar Carona
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {caronas?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma carona disponível</p>
            <Button onClick={() => setShowDialog(true)}>Publicar Primeira Carona</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caronas?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-lg">{item.origem} → {item.destino}</CardTitle>
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", tipoColors[item.tipo])}>
                    {tipoLabels[item.tipo]}
                  </span>
                </div>
                {item.observacoes && <CardDescription>{item.observacoes}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  {item.horario && <p className="text-sm text-muted-foreground">Horário: {item.horario}</p>}
                  {item.vagasDisponiveis && <p className="text-sm text-muted-foreground">Vagas: {item.vagasDisponiveis}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteCarona.mutate({ id: item.id })}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AchadosSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: achados, refetch } = trpc.achadoPerdido.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const createAchado = trpc.achadoPerdido.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item registrado com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteAchado = trpc.achadoPerdido.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item removido!");
    },
  });
  const resolverAchado = trpc.achadoPerdido.resolver.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item marcado como resolvido!");
    },
  });
  const addImagens = trpc.imagemAchadoPerdido.createMultiple.useMutation({
    onSuccess: () => refetch(),
  });

  const [showDialog, setShowDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedAchado, setSelectedAchado] = useState<any>(null);
  const [tipo, setTipo] = useState<"achado" | "perdido">("achado");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localEncontrado, setLocalEncontrado] = useState("");
  const [contato, setContato] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);

  const resetForm = () => {
    setTipo("achado");
    setTitulo("");
    setDescricao("");
    setLocalEncontrado("");
    setContato("");
    setImagens([]);
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const result = await createAchado.mutateAsync({
      condominioId,
      tipo,
      titulo,
      descricao: descricao || undefined,
      localEncontrado: localEncontrado || undefined,
      contato: contato || undefined,
      fotoUrl: imagens[0] || undefined,
    });
    if (imagens.length > 1 && result.id) {
      await addImagens.mutateAsync({
        achadoPerdidoId: result.id,
        imagens: imagens.slice(1).map((url) => ({ imagemUrl: url })),
      });
    }
  };

  const openGallery = (achado: any) => {
    setSelectedAchado(achado);
    setShowGalleryDialog(true);
  };

  const tipoLabels: Record<string, string> = {
    achado: "Encontrado",
    perdido: "Perdido",
  };

  const tipoColors: Record<string, string> = {
    achado: "bg-green-100 text-green-800",
    perdido: "bg-red-100 text-red-800",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Achados e Perdidos</h1>
          <p className="text-muted-foreground">Itens encontrados e perdidos</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Achados e Perdidos</h1>
          <p className="text-muted-foreground">Registre itens encontrados ou perdidos</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  Registrar Item
                </DialogTitle>
                <DialogDescription className="text-amber-100">
                  Informe os detalhes do item encontrado ou perdido
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achado">Encontrei um item</SelectItem>
                    <SelectItem value="perdido">Perdi um item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Chaves encontradas" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o item..." />
              </div>
              <div>
                <Label>Local</Label>
                <Input value={localEncontrado} onChange={(e) => setLocalEncontrado(e.target.value)} placeholder="Ex: Salão de festas" />
              </div>
              <div>
                <Label>Contato</Label>
                <Input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Telefone ou apartamento" />
              </div>
              <div>
                <Label>Fotos (pode adicionar várias)</Label>
                <MultiImageUpload value={imagens} onChange={setImagens} maxImages={10} />
              </div>
              <Button onClick={handleSubmit} disabled={createAchado.isPending} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                {createAchado.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {achados?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum item registrado</p>
            <Button onClick={() => setShowDialog(true)}>Registrar Primeiro Item</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achados?.map((item) => (
            <AchadoCard
              key={item.id}
              item={item}
              tipoColors={tipoColors}
              tipoLabels={tipoLabels}
              onResolver={() => resolverAchado.mutate({ id: item.id })}
              onDelete={() => deleteAchado.mutate({ id: item.id })}
              onViewGallery={() => openGallery(item)}
            />
          ))}
        </div>
      )}

      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                {selectedAchado?.titulo}
              </DialogTitle>
              {selectedAchado?.descricao && <DialogDescription className="text-amber-100">{selectedAchado.descricao}</DialogDescription>}
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {selectedAchado && <AchadoGallery achadoId={selectedAchado.id} imagemPrincipal={selectedAchado.fotoUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AchadoCard({ item, tipoColors, tipoLabels, onResolver, onDelete, onViewGallery }: any) {
  const { data: imagensAdicionais } = trpc.imagemAchadoPerdido.list.useQuery(
    { achadoPerdidoId: item.id },
    { enabled: !!item.id }
  );
  const todasImagens = [
    ...(item.fotoUrl ? [{ url: item.fotoUrl, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];

  return (
    <Card className={item.status === "resolvido" ? "opacity-60" : ""}>
      {todasImagens.length > 0 && (
        <div className="aspect-video bg-muted relative cursor-pointer" onClick={onViewGallery}>
          <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover rounded-t-lg" />
          {todasImagens.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">+{todasImagens.length - 1} fotos</div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", tipoColors[item.tipo])}>
            {tipoLabels[item.tipo]}
          </span>
        </div>
        {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-4">
          {item.localEncontrado && <p className="text-sm text-muted-foreground">Local: {item.localEncontrado}</p>}
          {item.contato && <p className="text-sm text-muted-foreground">Contato: {item.contato}</p>}
          {item.status === "resolvido" && <p className="text-sm text-green-600 font-medium">Resolvido</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {todasImagens.length > 0 && (
            <Button variant="outline" size="sm" onClick={onViewGallery}>
              <Image className="w-4 h-4 mr-2" />Ver Galeria
            </Button>
          )}
          {item.status !== "resolvido" && (
            <Button variant="outline" size="sm" onClick={onResolver}>
              <Check className="w-4 h-4 mr-2" />Resolvido
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AchadoGallery({ achadoId, imagemPrincipal }: { achadoId: number; imagemPrincipal?: string }) {
  const { data: imagensAdicionais } = trpc.imagemAchadoPerdido.list.useQuery({ achadoPerdidoId: achadoId }, { enabled: !!achadoId });
  const todasImagens = [
    ...(imagemPrincipal ? [{ url: imagemPrincipal, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];
  if (todasImagens.length === 0) return <p className="text-muted-foreground text-center py-8">Nenhuma imagem disponível</p>;
  return <ImageGallery images={todasImagens} columns={3} aspectRatio="square" />;
}

function PublicidadeSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: anunciantesData, refetch: refetchAnunciantes } = trpc.anunciante.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const createAnunciante = trpc.anunciante.create.useMutation({
    onSuccess: () => {
      refetchAnunciantes();
      toast.success("Anunciante cadastrado com sucesso!");
      setShowAnuncianteDialog(false);
      resetAnuncianteForm();
    },
  });
  
  const updateAnunciante = trpc.anunciante.update.useMutation({
    onSuccess: () => {
      refetchAnunciantes();
      toast.success("Anunciante atualizado!");
      setShowAnuncianteDialog(false);
      resetAnuncianteForm();
    },
  });
  
  const deleteAnunciante = trpc.anunciante.delete.useMutation({
    onSuccess: () => {
      refetchAnunciantes();
      toast.success("Anunciante removido!");
    },
  });

  const createAnuncio = trpc.anuncio.create.useMutation({
    onSuccess: () => {
      refetchAnunciantes();
      toast.success("Anúncio criado com sucesso!");
      setShowAnuncioDialog(false);
      resetAnuncioForm();
    },
  });

  const [showAnuncianteDialog, setShowAnuncianteDialog] = useState(false);
  const [showAnuncioDialog, setShowAnuncioDialog] = useState(false);
  const [editingAnunciante, setEditingAnunciante] = useState<any>(null);
  const [selectedAnuncianteId, setSelectedAnuncianteId] = useState<number | null>(null);
  
  // Anunciante form state
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<"comercio" | "servicos" | "profissionais" | "alimentacao" | "saude" | "educacao" | "outros">("outros");
  const [logoUrl, setLogoUrl] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [endereco, setEndereco] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [horarioFuncionamento, setHorarioFuncionamento] = useState("");
  const [imagensAnunciante, setImagensAnunciante] = useState<string[]>([]);

  // Anúncio form state
  const [anuncioTitulo, setAnuncioTitulo] = useState("");
  const [anuncioDescricao, setAnuncioDescricao] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [linkDestino, setLinkDestino] = useState("");
  const [posicao, setPosicao] = useState<"capa" | "contracapa" | "pagina_interna" | "rodape" | "lateral">("pagina_interna");
  const [tamanho, setTamanho] = useState<"pequeno" | "medio" | "grande" | "pagina_inteira">("medio");

  const resetAnuncianteForm = () => {
    setNome("");
    setDescricao("");
    setCategoria("outros");
    setLogoUrl("");
    setTelefone("");
    setWhatsapp("");
    setEmail("");
    setWebsite("");
    setEndereco("");
    setInstagram("");
    setFacebook("");
    setHorarioFuncionamento("");
    setImagensAnunciante([]);
    setEditingAnunciante(null);
  };

  const resetAnuncioForm = () => {
    setAnuncioTitulo("");
    setAnuncioDescricao("");
    setBannerUrl("");
    setLinkDestino("");
    setPosicao("pagina_interna");
    setTamanho("medio");
    setSelectedAnuncianteId(null);
  };

  const handleEditAnunciante = (anunciante: any) => {
    setEditingAnunciante(anunciante);
    setNome(anunciante.nome);
    setDescricao(anunciante.descricao || "");
    setCategoria(anunciante.categoria);
    setLogoUrl(anunciante.logoUrl || "");
    setTelefone(anunciante.telefone || "");
    setWhatsapp(anunciante.whatsapp || "");
    setEmail(anunciante.email || "");
    setWebsite(anunciante.website || "");
    setEndereco(anunciante.endereco || "");
    setInstagram(anunciante.instagram || "");
    setFacebook(anunciante.facebook || "");
    setHorarioFuncionamento(anunciante.horarioFuncionamento || "");
    setShowAnuncianteDialog(true);
  };

  const handleSubmitAnunciante = () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    
    if (editingAnunciante) {
      updateAnunciante.mutate({
        id: editingAnunciante.id,
        nome,
        descricao: descricao || undefined,
        categoria,
        logoUrl: logoUrl || undefined,
        telefone: telefone || undefined,
        whatsapp: whatsapp || undefined,
        email: email || undefined,
        website: website || undefined,
        endereco: endereco || undefined,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        horarioFuncionamento: horarioFuncionamento || undefined,
      });
    } else {
      createAnunciante.mutate({
        condominioId,
        nome,
        descricao: descricao || undefined,
        categoria,
        logoUrl: logoUrl || undefined,
        telefone: telefone || undefined,
        whatsapp: whatsapp || undefined,
        email: email || undefined,
        website: website || undefined,
        endereco: endereco || undefined,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        horarioFuncionamento: horarioFuncionamento || undefined,
      });
    }
  };

  const handleSubmitAnuncio = () => {
    if (!anuncioTitulo.trim() || !selectedAnuncianteId) {
      toast.error("Título e anunciante são obrigatórios");
      return;
    }
    createAnuncio.mutate({
      anuncianteId: selectedAnuncianteId,
      titulo: anuncioTitulo,
      descricao: anuncioDescricao || undefined,
      bannerUrl: bannerUrl || undefined,
      linkDestino: linkDestino || undefined,
      posicao,
      tamanho,
    });
  };

  const categoriaLabels: Record<string, string> = {
    comercio: "Comércio",
    servicos: "Serviços",
    profissionais: "Profissionais",
    alimentacao: "Alimentação",
    saude: "Saúde",
    educacao: "Educação",
    outros: "Outros",
  };

  const categoriaColors: Record<string, string> = {
    comercio: "bg-blue-100 text-blue-800",
    servicos: "bg-green-100 text-green-800",
    profissionais: "bg-purple-100 text-purple-800",
    alimentacao: "bg-orange-100 text-orange-800",
    saude: "bg-red-100 text-red-800",
    educacao: "bg-yellow-100 text-yellow-800",
    outros: "bg-gray-100 text-gray-800",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Publicidade</h1>
          <p className="text-muted-foreground">Gerencie anunciantes e parceiros</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Publicidade</h1>
          <p className="text-muted-foreground">Gerencie anunciantes e parceiros comerciais</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAnuncioDialog} onOpenChange={setShowAnuncioDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={!anunciantesData?.length}>
                <Plus className="w-4 h-4" />
                Novo Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="flex items-center gap-2 text-white text-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    Criar Anúncio
                  </DialogTitle>
                  <DialogDescription className="text-pink-100">
                    Configure um novo anúncio para exibir na plataforma
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <div>
                  <Label>Anunciante *</Label>
                  <Select value={selectedAnuncianteId?.toString() || ""} onValueChange={(v) => setSelectedAnuncianteId(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o anunciante" />
                    </SelectTrigger>
                    <SelectContent>
                      {anunciantesData?.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título do Anúncio *</Label>
                  <Input value={anuncioTitulo} onChange={(e) => setAnuncioTitulo(e.target.value)} placeholder="Ex: Promoção de Natal" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={anuncioDescricao} onChange={(e) => setAnuncioDescricao(e.target.value)} placeholder="Detalhes do anúncio..." />
                </div>
                <div>
                  <Label>Banner do Anúncio</Label>
                  <ImageUpload value={bannerUrl} onChange={(url) => setBannerUrl(url || "")} />
                </div>
                <div>
                  <Label>Link de Destino</Label>
                  <Input value={linkDestino} onChange={(e) => setLinkDestino(e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Posição</Label>
                    <Select value={posicao} onValueChange={(v) => setPosicao(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capa">Capa</SelectItem>
                        <SelectItem value="contracapa">Contracapa</SelectItem>
                        <SelectItem value="pagina_interna">Página Interna</SelectItem>
                        <SelectItem value="rodape">Rodapé</SelectItem>
                        <SelectItem value="lateral">Lateral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tamanho</Label>
                    <Select value={tamanho} onValueChange={(v) => setTamanho(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequeno">Pequeno</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                        <SelectItem value="pagina_inteira">Página Inteira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSubmitAnuncio} disabled={createAnuncio.isPending} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  {createAnuncio.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Anúncio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAnuncianteDialog} onOpenChange={(open) => { setShowAnuncianteDialog(open); if (!open) resetAnuncianteForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Anunciante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="flex items-center gap-2 text-white text-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    {editingAnunciante ? "Editar Anunciante" : "Novo Anunciante"}
                  </DialogTitle>
                  <DialogDescription className="text-indigo-100">
                    Cadastre um parceiro comercial para anunciar na plataforma
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do anunciante" />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={categoria} onValueChange={(v) => setCategoria(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comercio">Comércio</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="profissionais">Profissionais</SelectItem>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o anunciante..." />
                </div>
                <div>
                  <Label>Logo</Label>
                  <ImageUpload value={logoUrl} onChange={(url) => setLogoUrl(url || "")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 1234-5678" />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 91234-5678" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Instagram</Label>
                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                  </div>
                  <div>
                    <Label>Facebook</Label>
                    <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="/pagina" />
                  </div>
                </div>
                <div>
                  <Label>Horário de Funcionamento</Label>
                  <Input value={horarioFuncionamento} onChange={(e) => setHorarioFuncionamento(e.target.value)} placeholder="Seg-Sex: 9h-18h" />
                </div>
                <div>
                  <Label>Imagens Adicionais (produtos, serviços, etc.)</Label>
                  <MultiImageUpload 
                    value={imagensAnunciante} 
                    onChange={setImagensAnunciante} 
                    maxImages={10}
                  />
                </div>
                <Button onClick={handleSubmitAnunciante} disabled={createAnunciante.isPending || updateAnunciante.isPending} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
                  {(createAnunciante.isPending || updateAnunciante.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingAnunciante ? "Salvar Alterações" : "Cadastrar Anunciante"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {anunciantesData?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Nenhum anunciante cadastrado</h3>
            <p className="text-muted-foreground mb-4">Adicione anunciantes para monetizar sua plataforma</p>
            <Button onClick={() => setShowAnuncianteDialog(true)}>Cadastrar Primeiro Anunciante</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anunciantesData?.map((anunciante) => (
            <Card key={anunciante.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                {anunciante.logoUrl ? (
                  <img src={anunciante.logoUrl} alt={anunciante.nome} className="h-20 w-20 object-contain rounded-lg" />
                ) : (
                  <div className="h-20 w-20 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{anunciante.nome.charAt(0)}</span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-lg">{anunciante.nome}</CardTitle>
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", categoriaColors[anunciante.categoria])}>
                    {categoriaLabels[anunciante.categoria]}
                  </span>
                </div>
                {anunciante.descricao && <CardDescription className="line-clamp-2">{anunciante.descricao}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  {anunciante.telefone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {anunciante.telefone}</p>}
                  {anunciante.email && <p className="flex items-center gap-2"><MessageSquare className="w-3 h-3" /> {anunciante.email}</p>}
                  {anunciante.endereco && <p className="flex items-center gap-2"><Building2 className="w-3 h-3" /> {anunciante.endereco}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditAnunciante(anunciante)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAnuncianteId(anunciante.id); setShowAnuncioDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Anúncio
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteAnunciante.mutate({ id: anunciante.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Relatórios Section
function RelatoriosSection() {
  const [selectedCondominio, setSelectedCondominio] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("bloqueados");
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Buscar relatório de bloqueados
  const { data: relatorioBloqueados, isLoading: loadingBloqueados } = trpc.morador.relatorioBloqueados.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );

  // Buscar relatório geral
  const { data: relatorioGeral, isLoading: loadingGeral } = trpc.morador.relatorioGeral.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios de Moradores</h1>
          <p className="text-gray-500">Gere relatórios detalhados dos moradores do condomínio</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedCondominio?.toString() || ""}
            onValueChange={(value) => setSelectedCondominio(Number(value))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um condomínio" />
            </SelectTrigger>
            <SelectContent>
              {condominios?.map((cond) => (
                <SelectItem key={cond.id} value={cond.id.toString()}>
                  {cond.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCondominio && (
            <Button onClick={handlePrint} variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          )}
        </div>
      </div>

      {!selectedCondominio ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              Selecione um condomínio para visualizar os relatórios
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="print:p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 print:hidden">
            <Button
              variant={activeTab === "bloqueados" ? "default" : "outline"}
              onClick={() => setActiveTab("bloqueados")}
              className="flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Moradores Bloqueados
            </Button>
            <Button
              variant={activeTab === "geral" ? "default" : "outline"}
              onClick={() => setActiveTab("geral")}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Relatório Geral
            </Button>
          </div>

          {/* Relatório de Bloqueados */}
          {activeTab === "bloqueados" && (
            <>
              {loadingBloqueados ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Carregando relatório...</p>
                  </CardContent>
                </Card>
              ) : relatorioBloqueados ? (
                <div className="space-y-6">
                  {/* Cabeçalho do Relatório */}
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-red-700">
                            <Ban className="w-5 h-5" />
                            Relatório de Moradores Bloqueados para Votação
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {relatorioBloqueados.condominio?.nome}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(relatorioBloqueados.dataGeracao)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Total de Bloqueados</p>
                          <p className="text-3xl font-bold text-red-600">{relatorioBloqueados.totalBloqueados}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Condomínio</p>
                          <p className="text-lg font-semibold">{relatorioBloqueados.condominio?.nome}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Endereço</p>
                          <p className="text-sm">{relatorioBloqueados.condominio?.endereco || "Não informado"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de Bloqueados */}
                  {relatorioBloqueados.moradores.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Nenhum morador bloqueado</p>
                        <p className="text-gray-400 text-sm">Todos os moradores estão liberados para votação</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lista de Moradores Bloqueados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 font-semibold">#</th>
                                <th className="text-left p-3 font-semibold">Nome</th>
                                <th className="text-left p-3 font-semibold">Unidade</th>
                                <th className="text-left p-3 font-semibold">Tipo</th>
                                <th className="text-left p-3 font-semibold">Telefone</th>
                                <th className="text-left p-3 font-semibold">Email</th>
                                <th className="text-left p-3 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {relatorioBloqueados.moradores.map((morador: any, index: number) => (
                                <tr key={morador.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 text-gray-500">{index + 1}</td>
                                  <td className="p-3 font-medium">{morador.nome}</td>
                                  <td className="p-3">
                                    {morador.bloco && `Bloco ${morador.bloco} - `}
                                    Apt {morador.apartamento}
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                      {morador.tipo || "Morador"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {morador.telefone ? (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {morador.telefone}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {morador.email || <span className="text-gray-400">-</span>}
                                  </td>
                                  <td className="p-3">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs w-fit">
                                      <Ban className="w-3 h-3" />
                                      Bloqueado
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Relatório Geral */}
          {activeTab === "geral" && (
            <>
              {loadingGeral ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Carregando relatório...</p>
                  </CardContent>
                </Card>
              ) : relatorioGeral ? (
                <div className="space-y-6">
                  {/* Cabeçalho do Relatório */}
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Users className="w-5 h-5" />
                            Relatório Geral de Moradores
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {relatorioGeral.condominio?.nome}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(relatorioGeral.dataGeracao)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Total de Moradores</p>
                          <p className="text-3xl font-bold text-blue-600">{relatorioGeral.totalMoradores}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Liberados</p>
                          <p className="text-3xl font-bold text-green-600">{relatorioGeral.totalLiberados}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">Bloqueados</p>
                          <p className="text-3xl font-bold text-red-600">{relatorioGeral.totalBloqueados}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-sm text-gray-500">% Bloqueados</p>
                          <p className="text-3xl font-bold text-orange-600">
                            {relatorioGeral.totalMoradores > 0 
                              ? Math.round((relatorioGeral.totalBloqueados / relatorioGeral.totalMoradores) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista Geral */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lista Completa de Moradores</CardTitle>
                      <CardDescription>
                        Moradores bloqueados estão destacados em vermelho
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {relatorioGeral.moradores.length === 0 ? (
                        <div className="py-12 text-center">
                          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhum morador cadastrado</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 font-semibold">#</th>
                                <th className="text-left p-3 font-semibold">Nome</th>
                                <th className="text-left p-3 font-semibold">Bloco</th>
                                <th className="text-left p-3 font-semibold">Apartamento</th>
                                <th className="text-left p-3 font-semibold">Tipo</th>
                                <th className="text-left p-3 font-semibold">Telefone</th>
                                <th className="text-left p-3 font-semibold">Email</th>
                                <th className="text-left p-3 font-semibold">Status Votação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {relatorioGeral.moradores.map((morador: any, index: number) => (
                                <tr 
                                  key={morador.id} 
                                  className={`border-b ${morador.bloqueadoVotacao ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                                >
                                  <td className="p-3 text-gray-500">{index + 1}</td>
                                  <td className="p-3 font-medium">{morador.nome}</td>
                                  <td className="p-3">{morador.bloco || "-"}</td>
                                  <td className="p-3">{morador.apartamento}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                      {morador.tipo || "Morador"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {morador.telefone ? (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {morador.telefone}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {morador.email || <span className="text-gray-400">-</span>}
                                  </td>
                                  <td className="p-3">
                                    {morador.bloqueadoVotacao ? (
                                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs w-fit">
                                        <Ban className="w-3 h-3" />
                                        Bloqueado
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs w-fit">
                                        <CheckCircle className="w-3 h-3" />
                                        Liberado
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-4, .print\\:p-4 * {
            visibility: visible;
          }
          .print\\:p-4 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function ConfiguracoesSection() {
  const { data: preferencias, refetch: refetchPreferencias } = trpc.preferenciaNotificacao.get.useQuery();
  const updatePreferencias = trpc.preferenciaNotificacao.upsert.useMutation({
    onSuccess: () => {
      refetchPreferencias();
      toast.success("Preferências atualizadas!");
    },
  });

  const [efeitoTransicao, setEfeitoTransicao] = useState(preferencias?.efeitoTransicao || "slide");
  const [notifAvisos, setNotifAvisos] = useState(preferencias?.avisos ?? true);
  const [notifEventos, setNotifEventos] = useState(preferencias?.eventos ?? true);
  const [notifVotacoes, setNotifVotacoes] = useState(preferencias?.votacoes ?? true);
  const [notifClassificados, setNotifClassificados] = useState(preferencias?.classificados ?? true);
  const [notifCaronas, setNotifCaronas] = useState(preferencias?.caronas ?? true);

  // Atualizar estados quando preferencias carregarem
  useEffect(() => {
    if (preferencias) {
      setEfeitoTransicao(preferencias.efeitoTransicao || "slide");
      setNotifAvisos(preferencias.avisos ?? true);
      setNotifEventos(preferencias.eventos ?? true);
      setNotifVotacoes(preferencias.votacoes ?? true);
      setNotifClassificados(preferencias.classificados ?? true);
      setNotifCaronas(preferencias.caronas ?? true);
    }
  }, [preferencias]);

  const handleSaveTransition = () => {
    updatePreferencias.mutate({ efeitoTransicao });
  };

  const handleSaveNotifications = () => {
    updatePreferencias.mutate({
      avisos: notifAvisos,
      eventos: notifEventos,
      votacoes: notifVotacoes,
      classificados: notifClassificados,
      caronas: notifCaronas,
    });
  };

  const transitionOptions = [
    { id: "slide", name: "Deslizar", icon: "📄" },
    { id: "flip", name: "Virar Página", icon: "📖" },
    { id: "fade", name: "Desvanecer", icon: "✨" },
    { id: "zoom", name: "Zoom", icon: "🔍" },
    { id: "rotate", name: "Rotacionar", icon: "🔄" },
    { id: "cube", name: "Cubo 3D", icon: "📦" },
    { id: "cards", name: "Cartas", icon: "🃏" },
    { id: "magazine", name: "Revista", icon: "📰" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure as preferências do sistema</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Efeito de Transição */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Efeito de Transição Padrão
            </CardTitle>
            <CardDescription>Escolha como as páginas mudam. Esta preferência será aplicada a todos os seus projetos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {transitionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setEfeitoTransicao(option.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    efeitoTransicao === option.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <span className="text-2xl block mb-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                  {efeitoTransicao === option.id && (
                    <Check className="w-4 h-4 mx-auto mt-2 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveTransition} disabled={updatePreferencias.isPending}>
                {updatePreferencias.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Preferência
              </Button>
              <Link href="/transicoes">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Notificações</CardTitle>
            <CardDescription>Escolha quais notificações deseja receber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Avisos</span>
                <input
                  type="checkbox"
                  checked={notifAvisos}
                  onChange={(e) => setNotifAvisos(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Eventos</span>
                <input
                  type="checkbox"
                  checked={notifEventos}
                  onChange={(e) => setNotifEventos(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Votações</span>
                <input
                  type="checkbox"
                  checked={notifVotacoes}
                  onChange={(e) => setNotifVotacoes(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Classificados</span>
                <input
                  type="checkbox"
                  checked={notifClassificados}
                  onChange={(e) => setNotifClassificados(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Caronas</span>
                <input
                  type="checkbox"
                  checked={notifCaronas}
                  onChange={(e) => setNotifCaronas(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
            </div>
            <Button onClick={handleSaveNotifications} disabled={updatePreferencias.isPending} className="w-full">
              {updatePreferencias.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Notificações
            </Button>
          </CardContent>
        </Card>

        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Perfil</CardTitle>
            <CardDescription>Gerencie suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Templates</CardTitle>
            <CardDescription>Explore os templates disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/templates">
              <Button variant="outline" className="w-full">
                Ver Templates
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cabeçalho e Rodapé Personalizados */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Cabeçalho e Rodapé dos Relatórios
            </CardTitle>
            <CardDescription>Personalize o cabeçalho e rodapé dos PDFs gerados. Campos não preenchidos não aparecerão.</CardDescription>
          </CardHeader>
          <CardContent>
            <CabecalhoRodapeConfig />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Realizações Section
function RealizacoesSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominios?.[0]?.id || 0 },
    { enabled: !!condominios?.[0]?.id }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  const { data: realizacoes, refetch } = trpc.realizacao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const createRealizacao = trpc.realizacao.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Realização adicionada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteRealizacao = trpc.realizacao.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Realização removida!");
    },
  });
  const addImagens = trpc.imagemRealizacao.createMultiple.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Imagens adicionadas!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedRealizacao, setSelectedRealizacao] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setImagens([]);
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const result = await createRealizacao.mutateAsync({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      imagemUrl: imagens[0] || undefined,
    });
    // Adicionar imagens adicionais
    if (imagens.length > 1 && result.id) {
      await addImagens.mutateAsync({
        realizacaoId: result.id,
        imagens: imagens.slice(1).map((url) => ({ imagemUrl: url })),
      });
    }
  };

  const openGallery = (realizacao: any) => {
    setSelectedRealizacao(realizacao);
    setShowGalleryDialog(true);
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Realizações</h1>
          <p className="text-muted-foreground">Registre as conquistas do condomínio</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Realizações</h1>
          <p className="text-muted-foreground">Registre as conquistas e feitos do condomínio</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Realização
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  Nova Realização
                </DialogTitle>
                <DialogDescription className="text-yellow-100">
                  Adicione uma conquista ou feito do condomínio
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Certificação ISO 9001" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a realização..." />
              </div>
              <div>
                <Label>Imagens (pode adicionar várias)</Label>
                <MultiImageUpload
                  value={imagens}
                  onChange={setImagens}
                  maxImages={10}
                />
              </div>
              <Button onClick={handleSubmit} disabled={createRealizacao.isPending} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600">
                {createRealizacao.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Adicionar Realização
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {realizacoes?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma realização registrada</p>
            <Button onClick={() => setShowDialog(true)}>Adicionar Primeira Realização</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realizacoes?.map((item) => (
            <RealizacaoCard
              key={item.id}
              item={item}
              onDelete={() => deleteRealizacao.mutate({ id: item.id })}
              onViewGallery={() => openGallery(item)}
            />
          ))}
        </div>
      )}

      {/* Diálogo de Galeria */}
      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                {selectedRealizacao?.titulo}
              </DialogTitle>
              {selectedRealizacao?.descricao && (
                <DialogDescription className="text-yellow-100">{selectedRealizacao.descricao}</DialogDescription>
              )}
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {selectedRealizacao && (
              <RealizacaoGallery realizacaoId={selectedRealizacao.id} imagemPrincipal={selectedRealizacao.imagemUrl} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Card de Realização com galeria
function RealizacaoCard({ item, onDelete, onViewGallery }: { item: any; onDelete: () => void; onViewGallery: () => void }) {
  const { data: imagensAdicionais } = trpc.imagemRealizacao.list.useQuery(
    { realizacaoId: item.id },
    { enabled: !!item.id }
  );

  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(imagensAdicionais?.map(img => ({ url: img.imagemUrl, id: img.id })) || []),
  ];

  return (
    <Card>
      {todasImagens.length > 0 && (
        <div className="aspect-video bg-muted relative cursor-pointer" onClick={onViewGallery}>
          <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover rounded-t-lg" />
          {todasImagens.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{todasImagens.length - 1} fotos
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
        {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
      </CardHeader>
      <CardContent className="flex gap-2">
        {todasImagens.length > 0 && (
          <Button variant="outline" size="sm" onClick={onViewGallery}>
            <Image className="w-4 h-4 mr-2" />
            Ver Galeria
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Remover
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente de Galeria de Realização
function RealizacaoGallery({ realizacaoId, imagemPrincipal }: { realizacaoId: number; imagemPrincipal?: string }) {
  const { data: imagensAdicionais } = trpc.imagemRealizacao.list.useQuery(
    { realizacaoId },
    { enabled: !!realizacaoId }
  );

  const todasImagens = [
    ...(imagemPrincipal ? [{ url: imagemPrincipal, id: 0 }] : []),
    ...(imagensAdicionais?.map(img => ({ url: img.imagemUrl, id: img.id })) || []),
  ];

  if (todasImagens.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhuma imagem disponível</p>;
  }

  return <ImageGallery images={todasImagens} columns={3} aspectRatio="square" />;
}

// Antes e Depois Section
function AntesDepoisSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominios?.[0]?.id || 0 },
    { enabled: !!condominios?.[0]?.id }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  const { data: obras, refetch } = trpc.antesDepois.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const createRegistro = trpc.antesDepois.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Registro adicionado com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteRegistro = trpc.antesDepois.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Registro removido!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoAntesUrl, setFotoAntesUrl] = useState("");
  const [fotoDepoisUrl, setFotoDepoisUrl] = useState("");
  const [geoLatitude, setGeoLatitude] = useState("");
  const [geoLongitude, setGeoLongitude] = useState("");
  const [geoEndereco, setGeoEndereco] = useState("");
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  // Captura automática de localização ao abrir o dialog
  useEffect(() => {
    if (showDialog && !geoLatitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
              if (response.ok) {
                const data = await response.json();
                if (data.display_name) endereco = data.display_name;
              }
            } catch (e) { console.log("Erro ao obter endereço"); }
            setGeoLatitude(latitude.toString());
            setGeoLongitude(longitude.toString());
            setGeoEndereco(endereco);
            toast.success("Localização capturada automaticamente!");
          },
          () => { console.log("Captura automática falhou"); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [showDialog, geoLatitude]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setFotoAntesUrl("");
    setFotoDepoisUrl("");
    setGeoLatitude("");
    setGeoLongitude("");
    setGeoEndereco("");
  };

  const capturarLocalizacao = async () => {
    setCapturandoGeo(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            if (response.ok) {
              const data = await response.json();
              if (data.display_name) endereco = data.display_name;
            }
          } catch (e) { console.log("Erro ao obter endereço"); }
          setGeoLatitude(latitude.toString());
          setGeoLongitude(longitude.toString());
          setGeoEndereco(endereco);
          setCapturandoGeo(false);
          toast.success("Localização capturada!");
        },
        () => {
          setCapturandoGeo(false);
          toast.error("Não foi possível capturar a localização");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setCapturandoGeo(false);
      toast.error("Geolocalização não suportada");
    }
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    createRegistro.mutate({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      fotoAntesUrl: fotoAntesUrl || undefined,
      fotoDepoisUrl: fotoDepoisUrl || undefined,
    });
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Antes e Depois</h1>
          <p className="text-muted-foreground">Mostre a transformação de melhorias realizadas</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Antes e Depois</h1>
          <p className="text-muted-foreground">Mostre a transformação de melhorias realizadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/tarefas-facil?tipo=antes_depois">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 font-semibold gap-2"
            >
              <Zap className="h-4 w-4" />
              Registro Rápido
            </Button>
          </Link>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                  </div>
                  Antes e Depois
                </DialogTitle>
                <DialogDescription className="text-teal-100">
                  Adicione fotos mostrando a transformação (jardinagem, manutenção, limpeza, etc.)
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Limpeza do Jardim" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a transformação..." />
              </div>
              
              {/* Seção de Localização */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Localização
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={capturarLocalizacao}
                    disabled={capturandoGeo}
                    className="h-8"
                  >
                    {capturandoGeo ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Capturando...</>
                    ) : (
                      <><Navigation className="h-3 w-3 mr-1" /> Capturar Localização</>
                    )}
                  </Button>
                </div>
                {geoLatitude && geoLongitude && (
                  <LocationMiniMap
                    latitude={geoLatitude}
                    longitude={geoLongitude}
                    endereco={geoEndereco}
                    height={150}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foto ANTES</Label>
                  <ImageUpload value={fotoAntesUrl} onChange={(url) => setFotoAntesUrl(url || "")} />
                </div>
                <div>
                  <Label>Foto DEPOIS</Label>
                  <ImageUpload value={fotoDepoisUrl} onChange={(url) => setFotoDepoisUrl(url || "")} />
                </div>
              </div>
              
              {/* Seção dedicada para edição de imagens */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ImageEditSection
                  label="Editar Imagem com Anotações"
                  logoUrl={condominios?.[0]?.logoUrl || undefined}
                  onSaveEditedImage={(editedImage) => {
                    // Se não tem foto ANTES, coloca lá. Se não, coloca em DEPOIS
                    if (!fotoAntesUrl) {
                      setFotoAntesUrl(editedImage);
                      toast.success("Imagem editada adicionada como ANTES!");
                    } else {
                      setFotoDepoisUrl(editedImage);
                      toast.success("Imagem editada adicionada como DEPOIS!");
                    }
                  }}
                />
              </div>
              <Button onClick={handleSubmit} disabled={createRegistro.isPending} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                {createRegistro.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Adicionar Registro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {obras?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum registro</p>
            <Button onClick={() => setShowDialog(true)}>Adicionar Primeiro Registro</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {obras?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
                {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">ANTES</p>
                    {item.fotoAntesUrl ? (
                      <img src={item.fotoAntesUrl} alt="Antes" className="w-full aspect-video object-cover rounded-lg" />
                    ) : (
                      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">DEPOIS</p>
                    {item.fotoDepoisUrl ? (
                      <img src={item.fotoDepoisUrl} alt="Depois" className="w-full aspect-video object-cover rounded-lg" />
                    ) : (
                      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Gerar PDF do item Antes e Depois
                      import("@/lib/pdfGenerator").then(({ generateAntesDepoisReport }) => {
                        if (generateAntesDepoisReport) {
                          generateAntesDepoisReport(item);
                        } else {
                          toast.info("Funcionalidade de PDF em desenvolvimento");
                        }
                      });
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteRegistro.mutate({ id: item.id })}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Melhorias Section
function MelhoriasSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominios?.[0]?.id || 0 },
    { enabled: !!condominios?.[0]?.id }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  const { data: melhorias, refetch } = trpc.melhoria.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const createMelhoria = trpc.melhoria.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Melhoria adicionada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteMelhoria = trpc.melhoria.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Melhoria removida!");
    },
  });
  const addImagens = trpc.imagemMelhoria.createMultiple.useMutation({
    onSuccess: () => refetch(),
  });

  const [showDialog, setShowDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedMelhoria, setSelectedMelhoria] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [custo, setCusto] = useState("");
  const [status, setStatus] = useState<"planejada" | "em_andamento" | "concluida">("planejada");

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setImagens([]);
    setCusto("");
    setStatus("planejada");
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const result = await createMelhoria.mutateAsync({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      imagemUrl: imagens[0] || undefined,
      custo: custo || undefined,
      status,
    });
    if (imagens.length > 1 && result.id) {
      await addImagens.mutateAsync({
        melhoriaId: result.id,
        imagens: imagens.slice(1).map((url) => ({ imagemUrl: url })),
      });
    }
  };

  const openGallery = (melhoria: any) => {
    setSelectedMelhoria(melhoria);
    setShowGalleryDialog(true);
  };

  const statusColors = {
    planejada: "bg-yellow-100 text-yellow-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluida: "bg-green-100 text-green-800",
  };

  const statusLabels = {
    planejada: "Planejada",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Melhorias</h1>
          <p className="text-muted-foreground">Gerencie as melhorias do condomínio</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Melhorias</h1>
          <p className="text-muted-foreground">Gerencie as melhorias planejadas e realizadas</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Melhoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Nova Melhoria
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Adicione uma melhoria ao condomínio
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Instalação de câmeras" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a melhoria..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Custo Estimado</Label>
                  <Input value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="R$ 0,00" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Imagens (pode adicionar várias)</Label>
                <MultiImageUpload value={imagens} onChange={setImagens} maxImages={10} />
              </div>
              <Button onClick={handleSubmit} disabled={createMelhoria.isPending} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                {createMelhoria.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Adicionar Melhoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {melhorias?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma melhoria registrada</p>
            <Button onClick={() => setShowDialog(true)}>Adicionar Primeira Melhoria</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {melhorias?.map((item) => (
            <MelhoriaCard
              key={item.id}
              item={item}
              statusColors={statusColors}
              statusLabels={statusLabels}
              onDelete={() => deleteMelhoria.mutate({ id: item.id })}
              onViewGallery={() => openGallery(item)}
            />
          ))}
        </div>
      )}

      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                {selectedMelhoria?.titulo}
              </DialogTitle>
              {selectedMelhoria?.descricao && <DialogDescription className="text-blue-100">{selectedMelhoria.descricao}</DialogDescription>}
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {selectedMelhoria && <MelhoriaGallery melhoriaId={selectedMelhoria.id} imagemPrincipal={selectedMelhoria.imagemUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MelhoriaCard({ item, statusColors, statusLabels, onDelete, onViewGallery }: any) {
  const { data: imagensAdicionais } = trpc.imagemMelhoria.list.useQuery(
    { melhoriaId: item.id },
    { enabled: !!item.id }
  );
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];

  return (
    <Card>
      {todasImagens.length > 0 && (
        <div className="aspect-video bg-muted relative cursor-pointer" onClick={onViewGallery}>
          <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover rounded-t-lg" />
          {todasImagens.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">+{todasImagens.length - 1} fotos</div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[item.status || "planejada"])}>
            {statusLabels[item.status || "planejada"]}
          </span>
        </div>
        {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        {item.custo && <p className="text-sm text-muted-foreground mb-4">Custo: {item.custo}</p>}
        <div className="flex gap-2">
          {todasImagens.length > 0 && (
            <Button variant="outline" size="sm" onClick={onViewGallery}>
              <Image className="w-4 h-4 mr-2" />Ver Galeria
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MelhoriaGallery({ melhoriaId, imagemPrincipal }: { melhoriaId: number; imagemPrincipal?: string }) {
  const { data: imagensAdicionais } = trpc.imagemMelhoria.list.useQuery({ melhoriaId }, { enabled: !!melhoriaId });
  const todasImagens = [
    ...(imagemPrincipal ? [{ url: imagemPrincipal, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];
  if (todasImagens.length === 0) return <p className="text-muted-foreground text-center py-8">Nenhuma imagem disponível</p>;
  return <ImageGallery images={todasImagens} columns={3} aspectRatio="square" />;
}

// Aquisições Section
function AquisicoesSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominios?.[0]?.id || 0 },
    { enabled: !!condominios?.[0]?.id }
  );
  const revistaId = revistas?.[0]?.id || 0;
  
  const { data: aquisicoes, refetch } = trpc.aquisicao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );
  const createAquisicao = trpc.aquisicao.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Aquisição adicionada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteAquisicao = trpc.aquisicao.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Aquisição removida!");
    },
  });
  const addImagens = trpc.imagemAquisicao.createMultiple.useMutation({
    onSuccess: () => refetch(),
  });

  const [showDialog, setShowDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedAquisicao, setSelectedAquisicao] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setImagens([]);
    setValor("");
    setFornecedor("");
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    const result = await createAquisicao.mutateAsync({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      imagemUrl: imagens[0] || undefined,
      valor: valor || undefined,
      fornecedor: fornecedor || undefined,
    });
    if (imagens.length > 1 && result.id) {
      await addImagens.mutateAsync({
        aquisicaoId: result.id,
        imagens: imagens.slice(1).map((url) => ({ imagemUrl: url })),
      });
    }
  };

  const openGallery = (aquisicao: any) => {
    setSelectedAquisicao(aquisicao);
    setShowGalleryDialog(true);
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Aquisições</h1>
          <p className="text-muted-foreground">Registre as aquisições do condomínio</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Aquisições</h1>
          <p className="text-muted-foreground">Registre os equipamentos e materiais adquiridos</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Aquisição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  Nova Aquisição
                </DialogTitle>
                <DialogDescription className="text-emerald-100">
                  Adicione um item adquirido pelo condomínio
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Novo gerador de energia" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a aquisição..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor</Label>
                  <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="R$ 0,00" />
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <Input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="Nome do fornecedor" />
                </div>
              </div>
              <div>
                <Label>Imagens (pode adicionar várias)</Label>
                <MultiImageUpload value={imagens} onChange={setImagens} maxImages={10} />
              </div>
              <Button onClick={handleSubmit} disabled={createAquisicao.isPending} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                {createAquisicao.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Adicionar Aquisição
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {aquisicoes?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma aquisição registrada</p>
            <Button onClick={() => setShowDialog(true)}>Adicionar Primeira Aquisição</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aquisicoes?.map((item) => (
            <AquisicaoCard
              key={item.id}
              item={item}
              onDelete={() => deleteAquisicao.mutate({ id: item.id })}
              onViewGallery={() => openGallery(item)}
            />
          ))}
        </div>
      )}

      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                {selectedAquisicao?.titulo}
              </DialogTitle>
              {selectedAquisicao?.descricao && <DialogDescription className="text-emerald-100">{selectedAquisicao.descricao}</DialogDescription>}
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {selectedAquisicao && <AquisicaoGallery aquisicaoId={selectedAquisicao.id} imagemPrincipal={selectedAquisicao.imagemUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AquisicaoCard({ item, onDelete, onViewGallery }: any) {
  const { data: imagensAdicionais } = trpc.imagemAquisicao.list.useQuery(
    { aquisicaoId: item.id },
    { enabled: !!item.id }
  );
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];

  return (
    <Card>
      {todasImagens.length > 0 && (
        <div className="aspect-video bg-muted relative cursor-pointer" onClick={onViewGallery}>
          <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover rounded-t-lg" />
          {todasImagens.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">+{todasImagens.length - 1} fotos</div>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-serif text-lg">{item.titulo}</CardTitle>
        {item.descricao && <CardDescription>{item.descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-4">
          {item.valor && <p className="text-sm text-muted-foreground">Valor: {item.valor}</p>}
          {item.fornecedor && <p className="text-sm text-muted-foreground">Fornecedor: {item.fornecedor}</p>}
        </div>
        <div className="flex gap-2">
          {todasImagens.length > 0 && (
            <Button variant="outline" size="sm" onClick={onViewGallery}>
              <Image className="w-4 h-4 mr-2" />Ver Galeria
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AquisicaoGallery({ aquisicaoId, imagemPrincipal }: { aquisicaoId: number; imagemPrincipal?: string }) {
  const { data: imagensAdicionais } = trpc.imagemAquisicao.list.useQuery({ aquisicaoId }, { enabled: !!aquisicaoId });
  const todasImagens = [
    ...(imagemPrincipal ? [{ url: imagemPrincipal, id: 0 }] : []),
    ...(imagensAdicionais?.map((img: any) => ({ url: img.imagemUrl, id: img.id })) || []),
  ];
  if (todasImagens.length === 0) return <p className="text-muted-foreground text-center py-8">Nenhuma imagem disponível</p>;
  return <ImageGallery images={todasImagens} columns={3} aspectRatio="square" />;
}


// Vagas de Estacionamento Section
function VagasEstacionamentoSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: vagas, refetch } = trpc.vagaEstacionamento.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const createVaga = trpc.vagaEstacionamento.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Vaga adicionada com sucesso!");
      setShowDialog(false);
      resetForm();
    },
  });
  const deleteVaga = trpc.vagaEstacionamento.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Vaga removida!");
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [numero, setNumero] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [bloco, setBloco] = useState("");
  const [tipo, setTipo] = useState<"coberta" | "descoberta" | "moto">("coberta");
  const [observacoes, setObservacoes] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [anexoUrl, setAnexoUrl] = useState("");

  const resetForm = () => {
    setNumero("");
    setApartamento("");
    setBloco("");
    setTipo("coberta");
    setObservacoes("");
    setImagemUrl("");
    setAnexoUrl("");
  };

  const handleSubmit = () => {
    if (!numero.trim()) {
      toast.error("Número da vaga é obrigatório");
      return;
    }
    createVaga.mutate({
      condominioId,
      numero,
      apartamento: apartamento || undefined,
      bloco: bloco || undefined,
      tipo,
      observacoes: observacoes || undefined,
    });
  };

  const tipoColors = {
    coberta: "bg-blue-100 text-blue-800",
    descoberta: "bg-yellow-100 text-yellow-800",
    moto: "bg-purple-100 text-purple-800",
  };

  const tipoLabels = {
    coberta: "Coberta",
    descoberta: "Descoberta",
    moto: "Moto",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Vagas de Estacionamento</h2>
          <p className="text-muted-foreground">Gerencie as vagas de estacionamento do condomínio</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Vaga de Estacionamento
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Cadastre uma nova vaga de estacionamento
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número da Vaga *</Label>
                  <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 101" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={(v: "coberta" | "descoberta" | "moto") => setTipo(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coberta">Coberta</SelectItem>
                      <SelectItem value="descoberta">Descoberta</SelectItem>
                      <SelectItem value="moto">Moto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apartamento</Label>
                  <Input value={apartamento} onChange={(e) => setApartamento(e.target.value)} placeholder="Ex: 101" />
                </div>
                <div className="space-y-2">
                  <Label>Bloco/Torre</Label>
                  <Input value={bloco} onChange={(e) => setBloco(e.target.value)} placeholder="Ex: A" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações sobre a vaga..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imagem da Vaga</Label>
                  <ImageUpload 
                    value={imagemUrl} 
                    onChange={(url) => setImagemUrl(url || "")} 
                    aspectRatio="video"
                    placeholder="Foto da vaga"
                    compact
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anexo (Documento)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 100 * 1024 * 1024) {
                            toast.error("Arquivo muito grande. Máximo 100MB.");
                            return;
                          }
                          // Simular URL do arquivo para demonstração
                          setAnexoUrl(file.name);
                          toast.success(`Arquivo ${file.name} selecionado`);
                        }
                      }}
                      className="hidden"
                      id="vaga-anexo"
                    />
                    <label htmlFor="vaga-anexo" className="cursor-pointer">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {anexoUrl || "Clique para anexar"}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC (máx. 100MB)</p>
                    </label>
                  </div>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800" disabled={createVaga.isPending}>
                {createVaga.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Cadastrar Vaga
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vagas?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma vaga cadastrada</p>
            <Button onClick={() => setShowDialog(true)}>Cadastrar Primeira Vaga</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vagas?.map((vaga) => (
            <Card key={vaga.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl">Vaga {vaga.numero}</CardTitle>
                  <span className={cn("text-xs px-2 py-1 rounded-full", tipoColors[vaga.tipo || "coberta"])}>
                    {tipoLabels[vaga.tipo || "coberta"]}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {vaga.apartamento && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Apartamento:</span> {vaga.apartamento}
                    </p>
                  )}
                  {vaga.bloco && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Bloco:</span> {vaga.bloco}
                    </p>
                  )}
                  {vaga.observacoes && (
                    <p className="text-sm text-muted-foreground">{vaga.observacoes}</p>
                  )}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteVaga.mutate({ id: vaga.id })}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Moderação de Classificados Section
function ModeracaoSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: pendentes, refetch } = trpc.moderacao.listPendentes.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const { data: stats } = trpc.moderacao.stats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  const aprovar = trpc.moderacao.aprovar.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Classificado aprovado!");
    },
  });
  const rejeitar = trpc.moderacao.rejeitar.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Classificado rejeitado!");
    },
  });

  const tipoLabels = {
    produto: "Produto",
    servico: "Serviço",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Moderação de Classificados</h2>
        <p className="text-muted-foreground">Aprove ou rejeite os classificados enviados pelos moradores</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats?.pendentes || 0}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.aprovados || 0}</p>
              <p className="text-sm text-muted-foreground">Aprovados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats?.rejeitados || 0}</p>
              <p className="text-sm text-muted-foreground">Rejeitados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pendentes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Classificados Pendentes de Aprovação</h3>
        {pendentes?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">Nenhum classificado pendente de aprovação</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendentes?.map((item) => (
              <Card key={item.classificado.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {item.classificado.fotoUrl && (
                      <img
                        src={item.classificado.fotoUrl}
                        alt={item.classificado.titulo}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.classificado.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            Por: {item.usuario?.name || "Usuário"} 
                            {item.usuario?.apartment && ` - Apto ${item.usuario.apartment}`}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                          {tipoLabels[item.classificado.tipo as keyof typeof tipoLabels]}
                        </span>
                      </div>
                      {item.classificado.descricao && (
                        <p className="text-sm text-muted-foreground mt-2">{item.classificado.descricao}</p>
                      )}
                      {item.classificado.preco && (
                        <p className="text-sm font-semibold mt-2">{item.classificado.preco}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => aprovar.mutate({ id: item.classificado.id })}
                          disabled={aprovar.isPending}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejeitar.mutate({ id: item.classificado.id })}
                          disabled={rejeitar.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ==================== COMUNICADOS SECTION ====================
function ComunicadosSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id || 0;

  const { data: comunicados, refetch } = trpc.comunicado.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );

  const createComunicado = trpc.comunicado.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comunicado criado com sucesso!");
      setShowDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar comunicado: " + error.message);
    },
  });

  const deleteComunicado = trpc.comunicado.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comunicado removido!");
    },
  });

  const uploadAnexo = trpc.comunicado.uploadAnexo.useMutation();

  const [showDialog, setShowDialog] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anexoUrl, setAnexoUrl] = useState("");
  const [anexoNome, setAnexoNome] = useState("");
  const [anexoTipo, setAnexoTipo] = useState("");
  const [anexoTamanho, setAnexoTamanho] = useState(0);
  const [destaque, setDestaque] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setAnexoUrl("");
    setAnexoNome("");
    setAnexoTipo("");
    setAnexoTamanho(0);
    setDestaque(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    // Tipos permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use PDF, DOC, DOCX, XLS, XLSX ou imagens.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await uploadAnexo.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });
        setAnexoUrl(result.url);
        setAnexoNome(result.fileName);
        setAnexoTipo(result.fileType);
        setAnexoTamanho(result.fileSize);
        toast.success("Arquivo enviado com sucesso!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    createComunicado.mutate({
      revistaId,
      titulo,
      descricao: descricao || undefined,
      anexoUrl: anexoUrl || undefined,
      anexoNome: anexoNome || undefined,
      anexoTipo: anexoTipo || undefined,
      anexoTamanho: anexoTamanho || undefined,
      destaque,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (tipo: string) => {
    if (tipo?.includes('pdf')) return '📄';
    if (tipo?.includes('word') || tipo?.includes('document')) return '📝';
    if (tipo?.includes('excel') || tipo?.includes('spreadsheet')) return '📊';
    if (tipo?.includes('image')) return '🖼️';
    return '📎';
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Comunicados</h1>
          <p className="text-muted-foreground">Publique comunicados com anexos</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre um condomínio primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Comunicados</h1>
          <p className="text-muted-foreground">Publique comunicados oficiais com anexos</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Novo Comunicado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Novo Comunicado
                </DialogTitle>
                <DialogDescription className="text-violet-100">
                  Crie um comunicado oficial para os moradores
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Comunicado sobre manutenção"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o comunicado..."
                  rows={4}
                />
              </div>
              
              {/* Upload de Anexo */}
              <div className="p-4 bg-secondary/30 rounded-lg border border-dashed">
                <Label className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  Anexo (opcional)
                </Label>
                {!anexoUrl ? (
                  <div className="text-center">
                    <input
                      type="file"
                      id="anexo"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="anexo"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Selecionar Arquivo
                        </>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, DOC, DOCX, XLS, XLSX ou imagens (máx. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-background rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(anexoTipo)}</span>
                      <div>
                        <p className="font-medium text-sm">{anexoNome}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(anexoTamanho)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAnexoUrl("");
                        setAnexoNome("");
                        setAnexoTipo("");
                        setAnexoTamanho(0);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={destaque}
                  onChange={(e) => setDestaque(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="destaque" className="text-sm cursor-pointer">
                  Marcar como destaque
                </Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  onClick={handleSubmit}
                  disabled={createComunicado.isPending || uploading}
                >
                  {createComunicado.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Publicar Comunicado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {comunicados?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum comunicado publicado</p>
            <Button onClick={() => setShowDialog(true)} className="btn-magazine">
              Criar Primeiro Comunicado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comunicados?.map((comunicado) => (
            <Card key={comunicado.id} className={cn(comunicado.destaque && "border-primary border-2")}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {comunicado.destaque && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          ⭐ Destaque
                        </span>
                      )}
                      <h3 className="font-serif font-bold text-lg">{comunicado.titulo}</h3>
                    </div>
                    {comunicado.descricao && (
                      <p className="text-muted-foreground text-sm mb-3 whitespace-pre-wrap">
                        {comunicado.descricao}
                      </p>
                    )}
                    {comunicado.anexoUrl && (
                      <a
                        href={comunicado.anexoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        <span className="text-lg">{getFileIcon(comunicado.anexoTipo || '')}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium">{comunicado.anexoNome || 'Anexo'}</p>
                          {comunicado.anexoTamanho && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(comunicado.anexoTamanho)}
                            </p>
                          )}
                        </div>
                        <Download className="w-4 h-4 ml-2" />
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Publicado em {comunicado.createdAt ? new Date(comunicado.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja excluir este comunicado?")) {
                        deleteComunicado.mutate({ id: comunicado.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// ==================== GALERIA DE FOTOS ====================
function GaleriaSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;
  
  const { data: albuns, refetch: refetchAlbuns } = trpc.album.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );
  
  const createAlbum = trpc.album.create.useMutation({
    onSuccess: () => {
      refetchAlbuns();
      setIsDialogOpen(false);
      resetForm();
      toast.success("Álbum criado com sucesso!");
    },
  });
  
  const updateAlbum = trpc.album.update.useMutation({
    onSuccess: () => {
      refetchAlbuns();
      setIsDialogOpen(false);
      resetForm();
      toast.success("Álbum atualizado com sucesso!");
    },
  });
  
  const deleteAlbum = trpc.album.delete.useMutation({
    onSuccess: () => {
      refetchAlbuns();
      toast.success("Álbum excluído com sucesso!");
    },
  });
  
  const createFoto = trpc.foto.create.useMutation({
    onSuccess: () => {
      refetchFotos();
      toast.success("Foto adicionada com sucesso!");
    },
  });
  
  const deleteFoto = trpc.foto.delete.useMutation({
    onSuccess: () => {
      refetchFotos();
      toast.success("Foto excluída com sucesso!");
    },
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [lightboxPhoto, setLightboxPhoto] = useState<any>(null);
  
  const { data: fotosAlbum, refetch: refetchFotos } = trpc.foto.list.useQuery(
    { albumId: selectedAlbum?.id || 0 },
    { enabled: !!selectedAlbum }
  );
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "outros" as "eventos" | "obras" | "areas_comuns" | "melhorias" | "outros",
    capaUrl: "",
    dataEvento: "",
    destaque: false,
    estiloGaleria: "grid" as "grid" | "carrossel" | "mosaico" | "lista",
  });
  const [imagensIniciais, setImagensIniciais] = useState<string[]>([]);
  
  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      categoria: "outros",
      capaUrl: "",
      dataEvento: "",
      destaque: false,
      estiloGaleria: "grid",
    });
    setImagensIniciais([]);
    setEditingAlbum(null);
  };
  
  const handleSubmit = () => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    
    const data = {
      condominioId,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      categoria: formData.categoria,
      capaUrl: formData.capaUrl || undefined,
      dataEvento: formData.dataEvento ? new Date(formData.dataEvento) : undefined,
      destaque: formData.destaque,
    };
    
    if (editingAlbum) {
      updateAlbum.mutate({ id: editingAlbum.id, ...data });
    } else {
      createAlbum.mutate(data);
    }
  };
  
  const handleEdit = (album: any) => {
    setEditingAlbum(album);
    setFormData({
      titulo: album.titulo,
      descricao: album.descricao || "",
      categoria: album.categoria,
      capaUrl: album.capaUrl || "",
      dataEvento: album.dataEvento ? new Date(album.dataEvento).toISOString().split('T')[0] : "",
      destaque: album.destaque || false,
      estiloGaleria: album.estiloGaleria || "grid",
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este álbum e todas as suas fotos?")) {
      deleteAlbum.mutate({ id });
    }
  };
  
  const handleAddPhoto = async (url: string | undefined) => {
    if (selectedAlbum && url) {
      createFoto.mutate({
        albumId: selectedAlbum.id,
        url,
      });
    }
  };
  
  const handleDeletePhoto = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      deleteFoto.mutate({ id });
    }
  };
  
  const categorias = [
    { value: "todas", label: "Todas" },
    { value: "eventos", label: "Eventos" },
    { value: "obras", label: "Obras" },
    { value: "areas_comuns", label: "Áreas Comuns" },
    { value: "melhorias", label: "Melhorias" },
    { value: "outros", label: "Outros" },
  ];
  
  const getCategoriaLabel = (cat: string) => {
    const found = categorias.find(c => c.value === cat);
    return found?.label || cat;
  };
  
  const getCategoriaColor = (cat: string) => {
    switch (cat) {
      case "eventos": return "bg-blue-100 text-blue-800";
      case "obras": return "bg-orange-100 text-orange-800";
      case "areas_comuns": return "bg-green-100 text-green-800";
      case "melhorias": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredAlbuns = albuns?.filter(album => 
    filterCategoria === "todas" || album.categoria === filterCategoria
  ) || [];
  
  if (!condominioId) {
    return (
      <div className="text-center py-12">
        <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum condomínio cadastrado</h3>
        <p className="text-muted-foreground mb-4">
          Cadastre um condomínio primeiro para criar álbuns de fotos.
        </p>
      </div>
    );
  }
  
  // Visualização de álbum selecionado
  if (selectedAlbum) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedAlbum(null)}>
              ← Voltar
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedAlbum.titulo}</h2>
              <p className="text-muted-foreground">{selectedAlbum.descricao}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoriaColor(selectedAlbum.categoria))}>
              {getCategoriaLabel(selectedAlbum.categoria)}
            </span>
          </div>
        </div>
        
        {/* Upload de fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Fotos</CardTitle>
            <CardDescription>Faça upload de novas fotos para este álbum</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value=""
              onChange={handleAddPhoto}
              folder="galeria"
              aspectRatio="landscape"
            />
          </CardContent>
        </Card>
        
        {/* Grid de fotos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotosAlbum?.map((foto) => (
            <div 
              key={foto.id} 
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => setLightboxPhoto(foto)}
            >
              <img 
                src={foto.url} 
                alt={foto.legenda || "Foto"} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(foto.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {foto.legenda && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-sm truncate">{foto.legenda}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {(!fotosAlbum || fotosAlbum.length === 0) && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma foto neste álbum ainda</p>
          </div>
        )}
        
        {/* Lightbox */}
        {lightboxPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setLightboxPhoto(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img 
              src={lightboxPhoto.url} 
              alt={lightboxPhoto.legenda || "Foto"} 
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {lightboxPhoto.legenda && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg">
                <p className="text-white">{lightboxPhoto.legenda}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Galeria de Fotos</h2>
          <p className="text-muted-foreground">Gerencie os álbuns de fotos do condomínio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Álbum
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  {editingAlbum ? "Editar Álbum" : "Criar Novo Álbum"}
                </DialogTitle>
                <DialogDescription className="text-fuchsia-100">
                  {editingAlbum ? "Atualize as informações do álbum" : "Preencha as informações do novo álbum de fotos"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Festa Junina 2024"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do álbum..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eventos">Eventos</SelectItem>
                    <SelectItem value="obras">Obras</SelectItem>
                    <SelectItem value="areas_comuns">Áreas Comuns</SelectItem>
                    <SelectItem value="melhorias">Melhorias</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data do Evento</Label>
                <Input
                  type="date"
                  value={formData.dataEvento}
                  onChange={(e) => setFormData({ ...formData, dataEvento: e.target.value })}
                />
              </div>
              <div>
                <Label>Imagem de Capa</Label>
                <ImageUpload
                  value={formData.capaUrl}
                  onChange={(url) => setFormData({ ...formData, capaUrl: url || "" })}
                  folder="galeria/capas"
                  aspectRatio="landscape"
                />
              </div>
              <div>
                <Label>Fotos Iniciais (pode adicionar várias)</Label>
                <MultiImageUpload 
                  value={imagensIniciais} 
                  onChange={setImagensIniciais} 
                  maxImages={20}
                />
              </div>
              <div>
                <Label>Estilo da Galeria</Label>
                <Select
                  value={formData.estiloGaleria}
                  onValueChange={(value: any) => setFormData({ ...formData, estiloGaleria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grade (Grid)</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="mosaico">Mosaico</SelectItem>
                    <SelectItem value="lista">Lista</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Escolha como as fotos serão exibidas</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={formData.destaque}
                  onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="destaque" className="cursor-pointer">Destacar este álbum</Label>
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
                disabled={createAlbum.isPending || updateAlbum.isPending}
              >
                {(createAlbum.isPending || updateAlbum.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingAlbum ? "Salvar Alterações" : "Criar Álbum"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filtro por categoria */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtrar por:</span>
        <div className="flex gap-2 flex-wrap">
          {categorias.map((cat) => (
            <Button
              key={cat.value}
              variant={filterCategoria === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategoria(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Grid de álbuns */}
      {filteredAlbuns.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum álbum encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {filterCategoria !== "todas" 
              ? "Não há álbuns nesta categoria" 
              : "Crie seu primeiro álbum de fotos"}
          </p>
          {filterCategoria === "todas" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Álbum
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbuns.map((album) => (
            <Card 
              key={album.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="aspect-video bg-muted relative">
                {album.capaUrl ? (
                  <img 
                    src={album.capaUrl} 
                    alt={album.titulo} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {album.destaque && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoriaColor(album.categoria))}>
                    {getCategoriaLabel(album.categoria)}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{album.titulo}</h3>
                {album.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{album.descricao}</p>
                )}
                {album.dataEvento && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(album.dataEvento).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(album);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(album.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// Segurança Section
function SegurancaSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "geral",
    icone: "shield",
    linkVideo: "",
    anexoUrl: "",
  });
  const [imagensDica, setImagensDica] = useState<string[]>([]);

  const { data: dicas = [], isLoading, refetch } = trpc.seguranca.list.useQuery();
  const createMutation = trpc.seguranca.create.useMutation({
    onSuccess: () => {
      toast.success("Dica de segurança criada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar dica: " + error.message);
    },
  });
  const updateMutation = trpc.seguranca.update.useMutation({
    onSuccess: () => {
      toast.success("Dica atualizada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
  const deleteMutation = trpc.seguranca.delete.useMutation({
    onSuccess: () => {
      toast.success("Dica excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({ titulo: "", conteudo: "", categoria: "geral", icone: "shield", linkVideo: "", anexoUrl: "" });
    setImagensDica([]);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      conteudo: item.conteudo,
      categoria: item.categoria || "geral",
      icone: item.icone || "shield",
      linkVideo: item.linkVideo || "",
      anexoUrl: item.anexoUrl || "",
    });
    setImagensDica([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta dica?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getCategoriaLabel = (cat: string) => {
    const labels: Record<string, string> = {
      geral: "Geral",
      incendio: "Incêndio",
      roubo: "Roubo/Furto",
      criancas: "Crianças",
      idosos: "Idosos",
      digital: "Segurança Digital",
      veiculos: "Veículos",
    };
    return labels[cat] || cat;
  };

  const getCategoriaColor = (cat: string) => {
    const colors: Record<string, string> = {
      geral: "bg-gray-100 text-gray-800",
      incendio: "bg-red-100 text-red-800",
      roubo: "bg-amber-100 text-amber-800",
      criancas: "bg-blue-100 text-blue-800",
      idosos: "bg-purple-100 text-purple-800",
      digital: "bg-cyan-100 text-cyan-800",
      veiculos: "bg-green-100 text-green-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Dicas de Segurança</h1>
          <p className="text-muted-foreground">Compartilhe dicas de segurança com os moradores</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Nova Dica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  {editingItem ? "Editar Dica" : "Nova Dica de Segurança"}
                </DialogTitle>
                <DialogDescription className="text-red-100">
                  Adicione informações importantes sobre segurança
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Cuidados ao sair de casa"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="incendio">Incêndio</SelectItem>
                    <SelectItem value="roubo">Roubo/Furto</SelectItem>
                    <SelectItem value="criancas">Crianças</SelectItem>
                    <SelectItem value="idosos">Idosos</SelectItem>
                    <SelectItem value="digital">Segurança Digital</SelectItem>
                    <SelectItem value="veiculos">Veículos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  placeholder="Descreva a dica de segurança..."
                  rows={4}
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                />
              </div>
              <div>
                <Label>Imagens (pode adicionar várias)</Label>
                <MultiImageUpload 
                  value={imagensDica} 
                  onChange={setImagensDica} 
                  maxImages={10}
                />
              </div>
              <div>
                <Label htmlFor="linkVideo">Link de Vídeo (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="linkVideo"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.linkVideo}
                  onChange={(e) => setFormData({ ...formData, linkVideo: e.target.value })}
                />
              </div>
              <div>
                <Label>Anexo (Documento)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 100 * 1024 * 1024) {
                          toast.error("Arquivo muito grande. Máximo 100MB.");
                          return;
                        }
                        setFormData({ ...formData, anexoUrl: file.name });
                        toast.success(`Arquivo ${file.name} selecionado`);
                      }
                    }}
                    className="hidden"
                    id="dica-anexo"
                  />
                  <label htmlFor="dica-anexo" className="cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {formData.anexoUrl || "Clique para anexar"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC (máx. 100MB)</p>
                  </label>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingItem ? "Atualizar" : "Criar Dica"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : dicas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma dica de segurança cadastrada</p>
            <Button onClick={() => setIsDialogOpen(true)}>Criar Primeira Dica</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dicas.map((dica: any) => (
            <Card key={dica.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoriaColor(dica.categoria))}>
                    {getCategoriaLabel(dica.categoria)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(dica)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dica.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{dica.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dica.conteudo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Regras e Normas Section
function RegrasSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "geral",
    ordem: 0,
    anexoUrl: "",
  });
  const [imagensRegra, setImagensRegra] = useState<string[]>([]);

  const { data: regras = [], isLoading, refetch } = trpc.regras.list.useQuery();
  const createMutation = trpc.regras.create.useMutation({
    onSuccess: () => {
      toast.success("Regra criada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar regra: " + error.message);
    },
  });
  const updateMutation = trpc.regras.update.useMutation({
    onSuccess: () => {
      toast.success("Regra atualizada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
  const deleteMutation = trpc.regras.delete.useMutation({
    onSuccess: () => {
      toast.success("Regra excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({ titulo: "", conteudo: "", categoria: "geral", ordem: 0, anexoUrl: "" });
    setImagensRegra([]);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      conteudo: item.conteudo,
      categoria: item.categoria || "geral",
      ordem: item.ordem || 0,
      anexoUrl: item.anexoUrl || "",
    });
    setImagensRegra([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta regra?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getCategoriaLabel = (cat: string) => {
    const labels: Record<string, string> = {
      geral: "Geral",
      convivencia: "Convivência",
      areas_comuns: "Áreas Comuns",
      animais: "Animais",
      barulho: "Barulho",
      estacionamento: "Estacionamento",
      mudancas: "Mudanças",
      obras: "Obras",
      piscina: "Piscina",
      salao_festas: "Salão de Festas",
    };
    return labels[cat] || cat;
  };

  const getCategoriaColor = (cat: string) => {
    const colors: Record<string, string> = {
      geral: "bg-gray-100 text-gray-800",
      convivencia: "bg-blue-100 text-blue-800",
      areas_comuns: "bg-green-100 text-green-800",
      animais: "bg-amber-100 text-amber-800",
      barulho: "bg-red-100 text-red-800",
      estacionamento: "bg-purple-100 text-purple-800",
      mudancas: "bg-cyan-100 text-cyan-800",
      obras: "bg-orange-100 text-orange-800",
      piscina: "bg-sky-100 text-sky-800",
      salao_festas: "bg-pink-100 text-pink-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Regras e Normas</h1>
          <p className="text-muted-foreground">Gerencie as regras do condomínio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-magazine">
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  {editingItem ? "Editar Regra" : "Nova Regra"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100">
                  Adicione ou edite regras do condomínio
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Horário de silêncio"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="convivencia">Convivência</SelectItem>
                    <SelectItem value="areas_comuns">Áreas Comuns</SelectItem>
                    <SelectItem value="animais">Animais</SelectItem>
                    <SelectItem value="barulho">Barulho</SelectItem>
                    <SelectItem value="estacionamento">Estacionamento</SelectItem>
                    <SelectItem value="mudancas">Mudanças</SelectItem>
                    <SelectItem value="obras">Obras</SelectItem>
                    <SelectItem value="piscina">Piscina</SelectItem>
                    <SelectItem value="salao_festas">Salão de Festas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  placeholder="Descreva a regra..."
                  rows={4}
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                />
              </div>
              <div>
                <Label>Documento Anexo (Regulamento, Convenção, etc.)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 100 * 1024 * 1024) {
                          toast.error("Arquivo muito grande. Máximo 100MB.");
                          return;
                        }
                        setFormData({ ...formData, anexoUrl: file.name });
                        toast.success(`Arquivo ${file.name} selecionado`);
                      }
                    }}
                    className="hidden"
                    id="regra-anexo"
                  />
                  <label htmlFor="regra-anexo" className="cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {formData.anexoUrl || "Clique para anexar documento"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC (máx. 100MB)</p>
                  </label>
                </div>
              </div>
              <div>
                <Label>Imagens Ilustrativas (pode adicionar várias)</Label>
                <MultiImageUpload 
                  value={imagensRegra} 
                  onChange={setImagensRegra} 
                  maxImages={10}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingItem ? "Atualizar" : "Criar Regra"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : regras.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma regra cadastrada</p>
            <Button onClick={() => setIsDialogOpen(true)}>Criar Primeira Regra</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {regras.map((regra: any, index: number) => (
            <Card key={regra.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{regra.titulo}</CardTitle>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block", getCategoriaColor(regra.categoria))}>
                        {getCategoriaLabel(regra.categoria)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(regra)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(regra.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-11">{regra.conteudo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// Destaques Section - Wrapper para a página de Destaques
function DestaquesSection() {
  return <DestaquesPage />;
}

// Destaques Preview Section para a Visão Geral
function DestaquesPreviewSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  const { data: destaques, isLoading } = trpc.destaque.listAtivos.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Destaques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-serif flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Destaques
          </CardTitle>
          <CardDescription>Conteúdo em destaque para os moradores</CardDescription>
        </div>
        <Link href="/dashboard/destaques">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Gerir Destaques
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {!destaques || destaques.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum destaque ativo</p>
            <Link href="/dashboard/destaques">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Destaque
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {destaques.slice(0, 4).map((destaque) => {
              // Imagens podem vir como array de objetos ou como string JSON
              let imagens: Array<{url: string}> = [];
              if (Array.isArray(destaque.imagens)) {
                imagens = destaque.imagens as Array<{url: string}>;
              } else if (typeof destaque.imagens === 'string') {
                try {
                  imagens = JSON.parse(destaque.imagens);
                } catch (e) {
                  imagens = [];
                }
              }
              const primeiraImagem = imagens[0]?.url;
              
              return (
                <Card key={destaque.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Galeria de Imagens */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    {primeiraImagem ? (
                      <img 
                        src={primeiraImagem} 
                        alt={destaque.titulo}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    {imagens.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        +{imagens.length - 1} fotos
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    {/* Título */}
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">{destaque.titulo}</h4>
                    
                    {/* Subtítulo */}
                    {destaque.subtitulo && (
                      <p className="text-xs text-primary font-medium line-clamp-1 mb-1">{destaque.subtitulo}</p>
                    )}
                    
                    {/* Descrição */}
                    {destaque.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{destaque.descricao}</p>
                    )}
                    
                    {/* Links, Arquivos e Vídeos */}
                    {(destaque.link || destaque.arquivoUrl || destaque.videoUrl) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
                        {destaque.link && (
                          <a 
                            href={destaque.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-full"
                          >
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        )}
                        {destaque.arquivoUrl && (
                          <a 
                            href={destaque.arquivoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full"
                          >
                            <FileDown className="w-3 h-3" /> {destaque.arquivoNome || 'Arquivo'}
                          </a>
                        )}
                        {destaque.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                            <Play className="w-3 h-3" /> Vídeo
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// Páginas 100% Personalizadas Section - Wrapper
function PaginasCustomWrapper() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  return <PaginasCustomSection condominioId={condominioId} />;
}

// Páginas 100% Personalizadas Preview Section para a Visão Geral
function PaginasCustomPreviewSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const [, navigate] = useLocation();
  
  const { data: paginas, isLoading } = trpc.paginaCustom.listAtivos.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            100% Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            100% Personalizado
          </CardTitle>
          <CardDescription>Páginas totalmente personalizadas</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/personalizado")}>
          Gerir Páginas
        </Button>
      </CardHeader>
      <CardContent>
        {!paginas || paginas.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma página personalizada ativa</p>
            <Button variant="link" size="sm" onClick={() => navigate("/dashboard/personalizado")}>
              Criar primeira página
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginas.slice(0, 4).map((pagina) => {
              const paginaImagens = (pagina.imagens as Array<{url: string, legenda?: string}>) || [];
              const primeiraImagem = paginaImagens[0]?.url;
              
              return (
                <Card key={pagina.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    {primeiraImagem ? (
                      <img
                        src={primeiraImagem}
                        alt={pagina.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                    {paginaImagens.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        +{paginaImagens.length - 1}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1">{pagina.titulo}</h4>
                    {pagina.subtitulo && (
                      <p className="text-xs text-primary line-clamp-1">{pagina.subtitulo}</p>
                    )}
                    {pagina.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{pagina.descricao}</p>
                    )}
                    {(pagina.link || pagina.arquivoUrl || pagina.videoUrl) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pagina.link && (
                          <a
                            href={pagina.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded-full"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Link
                          </a>
                        )}
                        {pagina.arquivoUrl && (
                          <a
                            href={pagina.arquivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full"
                          >
                            <FileDown className="w-2.5 h-2.5" /> Arquivo
                          </a>
                        )}
                        {pagina.videoUrl && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-full">
                            <Play className="w-2.5 h-2.5" /> Vídeo
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// Vencimentos Preview Card para a Visão Geral
function VencimentosPreviewCard() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = trpc.vencimentos.stats.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );
  const { data: proximos, isLoading: proximosLoading } = trpc.vencimentos.proximos.useQuery(
    { condominioId: condominioId || 0, dias: 7, limite: 5 },
    { enabled: !!condominioId }
  );

  const isLoading = statsLoading || proximosLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agenda de Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const temAlertas = stats && (stats.vencidos > 0 || stats.proximos > 0);

  return (
    <Card className={temAlertas ? 'border-orange-300 dark:border-orange-700' : ''}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-serif flex items-center gap-2">
            <Calendar className={`w-5 h-5 ${temAlertas ? 'text-orange-500' : 'text-primary'}`} />
            Agenda de Vencimentos
            {temAlertas && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                {stats.vencidos > 0 ? `${stats.vencidos} vencido(s)` : `${stats.proximos} próximo(s)`}
              </span>
            )}
          </CardTitle>
          <CardDescription>Contratos, serviços e manutenções</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/vencimentos")}>
          Ver Agenda
        </Button>
      </CardHeader>
      <CardContent>
        {!stats || stats.total === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum vencimento cadastrado</p>
            <Button variant="link" size="sm" onClick={() => navigate("/dashboard/vencimentos")}>
              Adicionar primeiro vencimento
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <FileText className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{stats.contratos}</div>
                <p className="text-xs text-muted-foreground">Contratos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Settings className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">{stats.servicos}</div>
                <p className="text-xs text-muted-foreground">Serviços</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <Wrench className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold text-green-600">{stats.manutencoes}</div>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </div>
            </div>

            {/* Próximos vencimentos */}
            {proximos && proximos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Próximos 7 dias
                </h4>
                <div className="space-y-2">
                  {proximos.slice(0, 3).map((item: any) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border text-sm ${
                        item.vencido 
                          ? 'border-red-300 bg-red-50 dark:bg-red-950/20' 
                          : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.tipo === 'contrato' ? <FileText className="w-4 h-4 text-blue-600" /> :
                         item.tipo === 'servico' ? <Settings className="w-4 h-4 text-purple-600" /> :
                         <Wrench className="w-4 h-4 text-green-600" />}
                        <span className="font-medium truncate max-w-[150px]">{item.titulo}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.vencido 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                      }`}>
                        {item.vencido ? `Vencido` : `${item.diasRestantes}d`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Vencimentos Section
function VencimentosSection({ condominioId }: { condominioId: number }) {
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.vencimentos.stats.useQuery({ condominioId });
  const { data: proximos } = trpc.vencimentos.proximos.useQuery({ condominioId, dias: 30, limite: 10 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Agenda de Vencimentos</h2>
          <p className="text-muted-foreground">Acompanhe contratos, serviços e manutenções</p>
        </div>
        <Button onClick={() => setLocation("/dashboard/vencimentos")}>
          <Calendar className="w-4 h-4 mr-2" />
          Ver Agenda Completa
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className={stats.vencidos > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${stats.vencidos > 0 ? 'text-red-600' : ''}`}>
                {stats.vencidos}
              </div>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </CardContent>
          </Card>
          <Card className={stats.proximos > 0 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${stats.proximos > 0 ? 'text-orange-600' : ''}`}>
                {stats.proximos}
              </div>
              <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.contratos}</div>
              <p className="text-xs text-muted-foreground">Contratos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.servicos}</div>
              <p className="text-xs text-muted-foreground">Serviços</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.manutencoes}</div>
              <p className="text-xs text-muted-foreground">Manutenções</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Próximos Vencimentos
          </CardTitle>
          <CardDescription>
            Itens que vencem nos próximos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!proximos || proximos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum vencimento nos próximos 30 dias.
            </p>
          ) : (
            <div className="space-y-3">
              {proximos.map((item: any) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.vencido 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                      : item.diasRestantes <= 7 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.tipo === 'contrato' ? 'bg-blue-100 text-blue-600' :
                      item.tipo === 'servico' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {item.tipo === 'contrato' ? <FileText className="w-4 h-4" /> :
                       item.tipo === 'servico' ? <Settings className="w-4 h-4" /> :
                       <Wrench className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.fornecedor && `${item.fornecedor} • `}
                        {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    item.vencido 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : item.diasRestantes <= 7
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        : item.diasRestantes <= 15
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {item.vencido 
                      ? `Vencido há ${Math.abs(item.diasRestantes)} dias`
                      : item.diasRestantes === 0
                        ? 'Vence hoje!'
                        : `${item.diasRestantes} dias`
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// Assembleia Online Section
function AssembleiaOnlineSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominio = condominios?.[0];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Assembleia Online</h1>
        <p className="text-muted-foreground">Realize assembleias virtuais com gravação e até 500 participantes</p>
      </div>
      
      <div className="max-w-2xl">
        <AssembleiaOnlineCard 
          condominioId={condominio?.id}
          linkAssembleia={(condominio as any)?.assembleiaLink || ""}
          dataAssembleia={(condominio as any)?.assembleiaData}
        />
      </div>
    </div>
  );
}


// Componente de Configuração de Cabeçalho e Rodapé
function CabecalhoRodapeConfig() {
  const { data: condominios, refetch: refetchCondominios } = trpc.condominio.list.useQuery();
  const condominio = condominios?.[0];
  
  const updateCondominio = trpc.condominio.update.useMutation({
    onSuccess: () => {
      refetchCondominios();
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    },
  });

  const [cabecalhoLogoUrl, setCabecalhoLogoUrl] = useState("");
  const [cabecalhoNomeCondominio, setCabecalhoNomeCondominio] = useState("");
  const [cabecalhoNomeSindico, setCabecalhoNomeSindico] = useState("");
  const [rodapeTexto, setRodapeTexto] = useState("");
  const [rodapeContato, setRodapeContato] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Carregar dados existentes
  useEffect(() => {
    if (condominio) {
      setCabecalhoLogoUrl((condominio as any).cabecalhoLogoUrl || "");
      setCabecalhoNomeCondominio((condominio as any).cabecalhoNomeCondominio || "");
      setCabecalhoNomeSindico((condominio as any).cabecalhoNomeSindico || "");
      setRodapeTexto((condominio as any).rodapeTexto || "");
      setRodapeContato((condominio as any).rodapeContato || "");
    }
  }, [condominio]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCabecalhoLogoUrl(data.url);
        toast.success("Logo carregado com sucesso!");
      } else {
        toast.error("Erro ao carregar logo");
      }
    } catch (error) {
      toast.error("Erro ao carregar logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!condominio) {
      toast.error("Nenhum condomínio encontrado");
      return;
    }
    
    updateCondominio.mutate({
      id: condominio.id,
      cabecalhoLogoUrl: cabecalhoLogoUrl || null,
      cabecalhoNomeCondominio: cabecalhoNomeCondominio || null,
      cabecalhoNomeSindico: cabecalhoNomeSindico || null,
      rodapeTexto: rodapeTexto || null,
      rodapeContato: rodapeContato || null,
    });
  };

  const handleClear = () => {
    setCabecalhoLogoUrl("");
    setCabecalhoNomeCondominio("");
    setCabecalhoNomeSindico("");
    setRodapeTexto("");
    setRodapeContato("");
  };

  if (!condominio) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Crie um condomínio primeiro para configurar o cabeçalho e rodapé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview do Cabeçalho */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Pré-visualização do Cabeçalho</p>
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded border">
          {cabecalhoLogoUrl && (
            <img src={cabecalhoLogoUrl} alt="Logo" className="w-12 h-12 object-contain" />
          )}
          <div className="flex-1">
            {cabecalhoNomeCondominio && (
              <h3 className="font-bold text-lg">{cabecalhoNomeCondominio}</h3>
            )}
            {cabecalhoNomeSindico && (
              <p className="text-sm text-muted-foreground">Síndico: {cabecalhoNomeSindico}</p>
            )}
          </div>
          {!cabecalhoLogoUrl && !cabecalhoNomeCondominio && !cabecalhoNomeSindico && (
            <p className="text-muted-foreground text-sm italic">Preencha os campos abaixo para ver a pré-visualização</p>
          )}
        </div>
      </div>

      {/* Campos do Cabeçalho */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Logo do Condomínio</Label>
          <div className="flex gap-2">
            <Input
              value={cabecalhoLogoUrl}
              onChange={(e) => setCabecalhoLogoUrl(e.target.value)}
              placeholder="URL do logo ou faça upload"
              className="flex-1"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button variant="outline" asChild disabled={isUploading}>
                <span>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Recomendado: 200x200px, formato PNG ou JPG</p>
        </div>

        <div className="space-y-2">
          <Label>Nome do Condomínio</Label>
          <Input
            value={cabecalhoNomeCondominio}
            onChange={(e) => setCabecalhoNomeCondominio(e.target.value)}
            placeholder="Ex: Condomínio Residencial Jardins"
          />
          <p className="text-xs text-muted-foreground">Aparece no cabeçalho dos relatórios</p>
        </div>

        <div className="space-y-2">
          <Label>Nome do Síndico</Label>
          <Input
            value={cabecalhoNomeSindico}
            onChange={(e) => setCabecalhoNomeSindico(e.target.value)}
            placeholder="Ex: João da Silva"
          />
          <p className="text-xs text-muted-foreground">Aparece abaixo do nome do condomínio</p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t pt-6">
        <p className="text-sm font-medium mb-4">Rodapé dos Relatórios</p>
      </div>

      {/* Preview do Rodapé */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Pré-visualização do Rodapé</p>
        <div className="p-4 bg-white dark:bg-slate-900 rounded border text-center text-sm">
          {rodapeTexto && <p className="text-muted-foreground">{rodapeTexto}</p>}
          {rodapeContato && <p className="text-muted-foreground">{rodapeContato}</p>}
          {!rodapeTexto && !rodapeContato && (
            <p className="text-muted-foreground italic">Preencha os campos abaixo para ver a pré-visualização</p>
          )}
        </div>
      </div>

      {/* Campos do Rodapé */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Texto do Rodapé</Label>
          <Input
            value={rodapeTexto}
            onChange={(e) => setRodapeTexto(e.target.value)}
            placeholder="Ex: Documento gerado automaticamente"
          />
          <p className="text-xs text-muted-foreground">Texto informativo no rodapé</p>
        </div>

        <div className="space-y-2">
          <Label>Contato</Label>
          <Input
            value={rodapeContato}
            onChange={(e) => setRodapeContato(e.target.value)}
            placeholder="Ex: contato@condominio.com | (11) 99999-9999"
          />
          <p className="text-xs text-muted-foreground">Informações de contato</p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={updateCondominio.isPending}>
          {updateCondominio.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Configurações
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <X className="w-4 h-4 mr-2" />
          Limpar Campos
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCondominioAtivo } from "@/hooks/useCondominioAtivo";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  Settings,
  BarChart3,
  Clock,
  MapPin,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Image,
  Play,
  Square,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Zap,
  Droplets,
  Building2,
  TreePine,
  Sparkles,
  Paintbrush,
  Shield,
  MoreHorizontal,
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
  FolderOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Wrench,
  Tag,
  Flag,
  Circle,
  Calendar,
  FileText,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  Zap, Droplets, Building2, TreePine, Sparkles, Paintbrush, Shield, MoreHorizontal,
  ArrowDown, Minus, ArrowUp, AlertTriangle, FolderOpen, CheckCircle, CheckCircle2,
  XCircle, Wrench, Tag, Flag, Circle, Search, Package,
};

export default function OrdensServico() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { condominioAtivo } = useCondominioAtivo();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("all");
  const [showNovaOS, setShowNovaOS] = useState(false);

  // Abrir modal automaticamente se query parameter nova=true
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (params.get("nova") === "true") {
      setShowNovaOS(true);
      // Limpar o query parameter da URL
      navigate("/dashboard/ordens-servico", { replace: true });
    }
  }, [searchParams, navigate]);
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [activeTab, setActiveTab] = useState("lista");

  // Queries
  const { data: ordens, refetch: refetchOrdens } = trpc.ordensServico.list.useQuery(
    { 
      condominioId: condominioAtivo?.id || 0,
      search: search || undefined,
      statusId: statusFilter !== "all" ? parseInt(statusFilter) : undefined,
      categoriaId: categoriaFilter !== "all" ? parseInt(categoriaFilter) : undefined,
      prioridadeId: prioridadeFilter !== "all" ? parseInt(prioridadeFilter) : undefined,
    },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: categorias, refetch: refetchCategorias } = trpc.ordensServico.getCategorias.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: prioridades, refetch: refetchPrioridades } = trpc.ordensServico.getPrioridades.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: statusList, refetch: refetchStatus } = trpc.ordensServico.getStatus.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: configuracoes, refetch: refetchConfiguracoes } = trpc.ordensServico.getConfiguracoes.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: estatisticas } = trpc.ordensServico.getEstatisticas.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: setores, refetch: refetchSetores } = trpc.ordensServico.getSetores.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Mutations
  const createOS = trpc.ordensServico.create.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço criada com sucesso!");
      setShowNovaOS(false);
      refetchOrdens();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteOS = trpc.ordensServico.delete.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço excluída!");
      refetchOrdens();
    },
  });

  const updateConfiguracoes = trpc.ordensServico.updateConfiguracoes.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas!");
      refetchConfiguracoes();
    },
  });

  // Form state para nova OS
  const [novaOS, setNovaOS] = useState({
    titulo: "",
    descricao: "",
    categoriaId: "",
    prioridadeId: "",
    setorId: "",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    valorEstimado: "",
    solicitanteNome: "",
  });

  const handleCreateOS = () => {
    if (!condominioAtivo?.id) return;
    if (!novaOS.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    createOS.mutate({
      condominioId: condominioAtivo.id,
      titulo: novaOS.titulo,
      descricao: novaOS.descricao || undefined,
      categoriaId: novaOS.categoriaId ? parseInt(novaOS.categoriaId) : undefined,
      prioridadeId: novaOS.prioridadeId ? parseInt(novaOS.prioridadeId) : undefined,
      setorId: novaOS.setorId ? parseInt(novaOS.setorId) : undefined,
      tempoEstimadoDias: novaOS.tempoEstimadoDias,
      tempoEstimadoHoras: novaOS.tempoEstimadoHoras,
      tempoEstimadoMinutos: novaOS.tempoEstimadoMinutos,
      valorEstimado: novaOS.valorEstimado || undefined,
      solicitanteNome: novaOS.solicitanteNome || undefined,
    });
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || Circle;
    return Icon;
  };

  const formatTempo = (dias: number, horas: number, minutos: number) => {
    const parts = [];
    if (dias > 0) parts.push(`${dias}d`);
    if (horas > 0) parts.push(`${horas}h`);
    if (minutos > 0) parts.push(`${minutos}min`);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  if (!condominioAtivo) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Selecione um condomínio para continuar</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                  Ordens de Serviço
                </h1>
                <p className="text-white/80 text-sm">
                  Gerencie todas as ordens de serviço do condomínio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => setShowConfiguracoes(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                className="bg-white text-amber-600 hover:bg-white/90 shadow-lg"
                onClick={() => setShowNovaOS(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm">Total</div>
              <div className="text-2xl font-bold text-white">{estatisticas?.total || 0}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm">Abertas</div>
              <div className="text-2xl font-bold text-white">{estatisticas?.abertas || 0}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm">Concluídas</div>
              <div className="text-2xl font-bold text-white">{estatisticas?.concluidas || 0}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm">Tempo Médio</div>
              <div className="text-2xl font-bold text-white">
                {estatisticas?.tempoMedioMinutos 
                  ? `${Math.floor(estatisticas.tempoMedioMinutos / 60)}h`
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white shadow-md rounded-xl p-1 mb-6">
              <TabsTrigger 
                value="lista" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Lista de OS
              </TabsTrigger>
              <TabsTrigger 
                value="kanban"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger 
                value="estatisticas"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            {/* Lista de OS */}
            <TabsContent value="lista">
              {/* Filtros */}
              <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por protocolo ou título..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] border-amber-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      {statusList?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                    <SelectTrigger className="w-[180px] border-amber-200">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categorias?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                    <SelectTrigger className="w-[180px] border-amber-200">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Prioridades</SelectItem>
                      {prioridades?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-4">
                {ordens?.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <ClipboardList className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhuma ordem de serviço
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crie sua primeira ordem de serviço para começar
                    </p>
                    <Button
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowNovaOS(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Ordem de Serviço
                    </Button>
                  </div>
                ) : (
                  ordens?.map((os) => {
                    const StatusIcon = os.status?.icone ? getIconComponent(os.status.icone) : Circle;
                    const CategoriaIcon = os.categoria?.icone ? getIconComponent(os.categoria.icone) : Tag;
                    const PrioridadeIcon = os.prioridade?.icone ? getIconComponent(os.prioridade.icone) : Flag;

                    return (
                      <div
                        key={os.id}
                        className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-all cursor-pointer border-l-4"
                        style={{ borderLeftColor: os.status?.cor || "#EAB308" }}
                        onClick={() => navigate(`/dashboard/ordens-servico/${os.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-mono bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                #{os.protocolo}
                              </span>
                              <Badge
                                style={{ backgroundColor: os.status?.cor || "#EAB308" }}
                                className="text-white"
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {os.status?.nome || "Sem status"}
                              </Badge>
                              <Badge
                                variant="outline"
                                style={{ borderColor: os.prioridade?.cor || undefined, color: os.prioridade?.cor || undefined }}
                              >
                                <PrioridadeIcon className="w-3 h-3 mr-1" />
                                {os.prioridade?.nome || "Normal"}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {os.titulo}
                            </h3>
                            {os.descricao && (
                              <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                {os.descricao}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {os.categoria && (
                                <span className="flex items-center gap-1">
                                  <CategoriaIcon className="w-4 h-4" style={{ color: os.categoria.cor || undefined }} />
                                  {os.categoria.nome}
                                </span>
                              )}
                              {(os.tempoEstimadoDias || os.tempoEstimadoHoras || os.tempoEstimadoMinutos) && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTempo(os.tempoEstimadoDias || 0, os.tempoEstimadoHoras || 0, os.tempoEstimadoMinutos || 0)}
                                </span>
                              )}
                              {os.valorEstimado && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  R$ {parseFloat(os.valorEstimado).toFixed(2)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(os.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-amber-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/ordens-servico/${os.id}`);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Tem certeza que deseja excluir esta OS?")) {
                                  deleteOS.mutate({ id: os.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Kanban */}
            <TabsContent value="kanban">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {statusList?.map((status) => {
                  const StatusIcon = status.icone ? getIconComponent(status.icone) : Circle;
                  const osDoStatus = ordens?.filter((os) => os.statusId === status.id) || [];

                  return (
                    <div
                      key={status.id}
                      className="bg-white rounded-2xl shadow-md min-w-[280px]"
                    >
                      <div
                        className="p-4 rounded-t-2xl flex items-center gap-2"
                        style={{ backgroundColor: status.cor || "#EAB308" }}
                      >
                        <StatusIcon className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">{status.nome}</span>
                        <Badge className="bg-white/20 text-white ml-auto">
                          {osDoStatus.length}
                        </Badge>
                      </div>
                      <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
                        {osDoStatus.map((os) => (
                          <div
                            key={os.id}
                            className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-amber-50 transition-colors"
                            onClick={() => navigate(`/dashboard/ordens-servico/${os.id}`)}
                          >
                            <div className="text-xs font-mono text-amber-600 mb-1">
                              #{os.protocolo}
                            </div>
                            <div className="font-medium text-gray-800 text-sm line-clamp-2">
                              {os.titulo}
                            </div>
                            {os.prioridade && (
                              <Badge
                                variant="outline"
                                className="mt-2 text-xs"
                                style={{ borderColor: os.prioridade.cor || undefined, color: os.prioridade.cor || undefined }}
                              >
                                {os.prioridade.nome}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {osDoStatus.length === 0 && (
                          <div className="text-center text-gray-400 text-sm py-4">
                            Nenhuma OS
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Estatísticas */}
            <TabsContent value="estatisticas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Por Status */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    Por Status
                  </h3>
                  <div className="space-y-3">
                    {estatisticas?.porStatus?.map((s) => (
                      <div key={s.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: s.cor || "#EAB308" }}
                          />
                          <span className="text-sm text-gray-600">{s.nome}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{s.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Categoria */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" />
                    Por Categoria
                  </h3>
                  <div className="space-y-3">
                    {estatisticas?.porCategoria?.map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: c.cor || "#EAB308" }}
                          />
                          <span className="text-sm text-gray-600">{c.nome}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{c.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financeiro */}
                {configuracoes?.habilitarGestaoFinanceira && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                      Financeiro
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Valor Estimado Total</div>
                        <div className="text-2xl font-bold text-amber-600">
                          R$ {(estatisticas?.valorEstimadoTotal || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Valor Real Total</div>
                        <div className="text-2xl font-bold text-green-600">
                          R$ {(estatisticas?.valorRealTotal || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Nova OS */}
        <Dialog open={showNovaOS} onOpenChange={setShowNovaOS}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Nova Ordem de Serviço
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Título */}
              <div>
                <Label className="text-gray-700">Título *</Label>
                <Input
                  placeholder="Ex: Reparo na bomba d'água"
                  value={novaOS.titulo}
                  onChange={(e) => setNovaOS({ ...novaOS, titulo: e.target.value })}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-gray-700">Descrição</Label>
                <Textarea
                  placeholder="Descreva detalhadamente o serviço a ser realizado..."
                  value={novaOS.descricao}
                  onChange={(e) => setNovaOS({ ...novaOS, descricao: e.target.value })}
                  className="mt-1 border-amber-200 focus:border-amber-400 min-h-[100px]"
                />
              </div>

              {/* Categoria, Prioridade, Setor */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-700">Categoria</Label>
                  <Select
                    value={novaOS.categoriaId}
                    onValueChange={(v) => setNovaOS({ ...novaOS, categoriaId: v })}
                  >
                    <SelectTrigger className="mt-1 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Prioridade</Label>
                  <Select
                    value={novaOS.prioridadeId}
                    onValueChange={(v) => setNovaOS({ ...novaOS, prioridadeId: v })}
                  >
                    <SelectTrigger className="mt-1 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Setor</Label>
                  <Select
                    value={novaOS.setorId}
                    onValueChange={(v) => setNovaOS({ ...novaOS, setorId: v })}
                  >
                    <SelectTrigger className="mt-1 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {setores?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tempo Estimado */}
              <div>
                <Label className="text-gray-700">Tempo Estimado</Label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div>
                    <Label className="text-xs text-gray-500">Dias</Label>
                    <Input
                      type="number"
                      min="0"
                      value={novaOS.tempoEstimadoDias}
                      onChange={(e) => setNovaOS({ ...novaOS, tempoEstimadoDias: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Horas</Label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={novaOS.tempoEstimadoHoras}
                      onChange={(e) => setNovaOS({ ...novaOS, tempoEstimadoHoras: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Minutos</Label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={novaOS.tempoEstimadoMinutos}
                      onChange={(e) => setNovaOS({ ...novaOS, tempoEstimadoMinutos: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                </div>
              </div>

              {/* Valor Estimado */}
              {configuracoes?.habilitarGestaoFinanceira && (
                <div>
                  <Label className="text-gray-700">Valor Estimado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={novaOS.valorEstimado}
                    onChange={(e) => setNovaOS({ ...novaOS, valorEstimado: e.target.value })}
                    className="mt-1 border-amber-200"
                  />
                </div>
              )}

              {/* Solicitante */}
              <div>
                <Label className="text-gray-700">Nome do Solicitante</Label>
                <Input
                  placeholder="Nome de quem solicitou o serviço"
                  value={novaOS.solicitanteNome}
                  onChange={(e) => setNovaOS({ ...novaOS, solicitanteNome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNovaOS(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  onClick={handleCreateOS}
                  disabled={createOS.isPending}
                >
                  {createOS.isPending ? "Criando..." : "Criar Ordem de Serviço"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Configurações */}
        <Dialog open={showConfiguracoes} onOpenChange={setShowConfiguracoes}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Configurações de OS
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Orçamentos</Label>
                  <p className="text-sm text-gray-500">Habilitar gestão de orçamentos</p>
                </div>
                <Switch
                  checked={configuracoes?.habilitarOrcamentos || false}
                  onCheckedChange={(checked) => {
                    if (condominioAtivo?.id) {
                      updateConfiguracoes.mutate({
                        condominioId: condominioAtivo.id,
                        habilitarOrcamentos: checked,
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Aprovação de Orçamento</Label>
                  <p className="text-sm text-gray-500">Exigir aprovação do síndico</p>
                </div>
                <Switch
                  checked={configuracoes?.habilitarAprovacaoOrcamento || false}
                  onCheckedChange={(checked) => {
                    if (condominioAtivo?.id) {
                      updateConfiguracoes.mutate({
                        condominioId: condominioAtivo.id,
                        habilitarAprovacaoOrcamento: checked,
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Gestão Financeira</Label>
                  <p className="text-sm text-gray-500">Controle de valores e custos</p>
                </div>
                <Switch
                  checked={configuracoes?.habilitarGestaoFinanceira || false}
                  onCheckedChange={(checked) => {
                    if (condominioAtivo?.id) {
                      updateConfiguracoes.mutate({
                        condominioId: condominioAtivo.id,
                        habilitarGestaoFinanceira: checked,
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Relatórios de Gastos</Label>
                  <p className="text-sm text-gray-500">Relatórios mensais de gastos</p>
                </div>
                <Switch
                  checked={configuracoes?.habilitarRelatoriosGastos || false}
                  onCheckedChange={(checked) => {
                    if (condominioAtivo?.id) {
                      updateConfiguracoes.mutate({
                        condominioId: condominioAtivo.id,
                        habilitarRelatoriosGastos: checked,
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Vínculo com Manutenção</Label>
                  <p className="text-sm text-gray-500">Vincular OS a manutenções</p>
                </div>
                <Switch
                  checked={configuracoes?.habilitarVinculoManutencao || false}
                  onCheckedChange={(checked) => {
                    if (condominioAtivo?.id) {
                      updateConfiguracoes.mutate({
                        condominioId: condominioAtivo.id,
                        habilitarVinculoManutencao: checked,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

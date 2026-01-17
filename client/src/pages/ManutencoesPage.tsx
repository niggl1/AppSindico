import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShareModal } from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Wrench, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  DollarSign,
  Printer,
  MapPin,
  Play,
  Square,
  Clock,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Building,
  Navigation,
  Zap
} from "lucide-react";
import { generateManutencaoReport, generateListReport, formatStatus, formatDate } from "@/lib/pdfGenerator";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { ProtocolCard, StatsCards } from "@/components/ProtocolCard";
import { Timeline, StatusBadge } from "@/components/Timeline";
import MultiImageUpload from "@/components/MultiImageUpload";
import InputWithSave from "@/components/InputWithSave";
import ImageEditSection from "@/components/ImageEditSection";
import AutoLocationCapture from "@/components/AutoLocationCapture";
import {
  FormModalHeader,
  FormSection,
  FormFieldGroup,
  StyledLabel,
  FormActions,
  GradientButton,
} from "@/components/ui/form-modal";

interface ManutencoesPageProps {
  condominioId: number;
}

export default function ManutencoesPage({ condominioId }: ManutencoesPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [newComment, setNewComment] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    observacoes: "",
    responsavelNome: "",
    localizacao: "",
    dataAgendada: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    tipo: "corretiva" as "preventiva" | "corretiva" | "emergencial" | "programada",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    fornecedor: "",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [manutencaoIniciada, setManutencaoIniciada] = useState(false);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [duracaoManutencao, setDuracaoManutencao] = useState("");
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  const utils = trpc.useUtils();
  
  // Buscar dados do condomínio para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: manutencoes = [], isLoading } = trpc.manutencao.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.manutencao.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.manutencao.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.manutencao.getTimeline.useQuery(
    { manutencaoId: selectedManutencao?.id },
    { enabled: !!selectedManutencao?.id }
  );
  
  const { data: manutencaoImagens = [] } = trpc.manutencao.getImagens.useQuery(
    { manutencaoId: selectedManutencao?.id },
    { enabled: !!selectedManutencao?.id }
  );

  const createMutation = trpc.manutencao.create.useMutation({
    onSuccess: async (result) => {
      for (const url of imagens) {
        await addImagemMutation.mutateAsync({ manutencaoId: result.id, url });
      }
      toast.success(`Manutenção criada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao criar manutenção"),
  });

  const updateMutation = trpc.manutencao.update.useMutation({
    onSuccess: () => {
      toast.success("Manutenção atualizada!");
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
      utils.manutencao.getTimeline.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar manutenção"),
  });

  const deleteMutation = trpc.manutencao.delete.useMutation({
    onSuccess: () => {
      toast.success("Manutenção excluída!");
      setShowDetailDialog(false);
      setSelectedManutencao(null);
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir manutenção"),
  });

  const addImagemMutation = trpc.manutencao.addImagem.useMutation({
    onSuccess: () => {
      utils.manutencao.getImagens.invalidate();
      utils.manutencao.getTimeline.invalidate();
    },
  });

  const addTimelineEventMutation = trpc.manutencao.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.manutencao.getTimeline.invalidate();
      toast.success("Comentário adicionado!");
    },
  });

  // Captura automática de localização ao abrir o dialog
  useEffect(() => {
    if (showDialog && !formData.geoLatitude) {
      // Capturar localização automaticamente ao abrir o formulário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'pt-BR' } }
              );
              if (response.ok) {
                const data = await response.json();
                if (data.display_name) {
                  endereco = data.display_name;
                }
              }
            } catch (e) {
              console.log("Erro ao obter endereço");
            }
            
            setFormData(prev => ({
              ...prev,
              geoLatitude: latitude.toString(),
              geoLongitude: longitude.toString(),
              geoEndereco: endereco,
            }));
            toast.success("Localização capturada automaticamente!");
          },
          (error) => {
            console.log("Captura automática falhou, usuário pode capturar manualmente");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [showDialog]);

  const resetForm = () => {
    setFormData({
      titulo: "",
      subtitulo: "",
      descricao: "",
      observacoes: "",
      responsavelNome: "",
      localizacao: "",
      dataAgendada: "",
      prioridade: "media",
      tipo: "corretiva",
      tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
      fornecedor: "",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
    });
    setImagens([]);
    setManutencaoIniciada(false);
    setHoraInicio(null);
    setHoraFim(null);
    setDuracaoManutencao("");
  };

  const capturarGeolocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }
    setCapturandoGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          geoLatitude: latitude.toString(),
          geoLongitude: longitude.toString(),
        }));
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, geoEndereco: data.display_name }));
          }
        } catch (e) {
          console.log("Erro ao obter endereço:", e);
        }
        setCapturandoGeo(false);
        toast.success("Localização capturada!");
      },
      (error) => {
        setCapturandoGeo(false);
        toast.error("Erro ao capturar localização: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const iniciarManutencao = () => {
    const agora = new Date();
    setHoraInicio(agora);
    setManutencaoIniciada(true);
    capturarGeolocalizacao();
    toast.success(`Manutenção iniciada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const terminarManutencao = () => {
    const agora = new Date();
    setHoraFim(agora);
    if (horaInicio) {
      const diff = agora.getTime() - horaInicio.getTime();
      const minutos = Math.floor(diff / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      setDuracaoManutencao(`${minutos}min ${segundos}s`);
    }
    toast.success(`Manutenção finalizada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const abrirMapa = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleSubmit = () => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    createMutation.mutate({ ...formData, condominioId });
  };

  const handleStatusChange = (manutencaoId: number, newStatus: string) => {
    updateMutation.mutate({ id: manutencaoId, status: newStatus as any });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedManutencao) return;
    addTimelineEventMutation.mutate({
      manutencaoId: selectedManutencao.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedManutencao) return;
    await addImagemMutation.mutateAsync({
      manutencaoId: selectedManutencao.id,
      url,
    });
  };

  const filteredManutencoes = searchProtocolo.length >= 3 
    ? searchResults 
    : manutencoes.filter(m => filterStatus === "todos" || m.status === filterStatus);

  const handleGeneratePDF = () => {
    if (selectedManutencao) {
      generateManutencaoReport(selectedManutencao, timeline, manutencaoImagens);
    } else {
      toast.info("Selecione uma manutenção para gerar o PDF");
    }
  };

  const handleGenerateReport = () => {
    generateListReport(
      "Relatório de Manutenções",
      filteredManutencoes,
      [
        { key: "protocolo", label: "Protocolo" },
        { key: "titulo", label: "Título" },
        { key: "status", label: "Status", format: formatStatus },
        { key: "tipo", label: "Tipo" },
        { key: "responsavelNome", label: "Responsável" },
        { key: "fornecedor", label: "Fornecedor" },
        { key: "dataAgendada", label: "Data Agendada", format: formatDate },
      ]
    );
  };

  const tipoLabels: Record<string, string> = {
    preventiva: "Preventiva",
    corretiva: "Corretiva",
    emergencial: "Emergencial",
    programada: "Programada",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Manutenções
          </h2>
          <p className="text-muted-foreground">
            Gerencie as manutenções do condomínio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/tarefas-facil?tipo=manutencao">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 font-semibold"
            >
              <Zap className="h-4 w-4 mr-1" />
              Registro Rápido
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleGeneratePDF}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Relatório
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Manutenção
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && <StatsCards stats={stats} />}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por protocolo..."
                  value={searchProtocolo}
                  onChange={(e) => setSearchProtocolo(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="acao_necessaria">Ação Necessária</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="reaberta">Reaberta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : filteredManutencoes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma manutenção cadastrada</p>
            <Button className="mt-4" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Criar primeira manutenção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredManutencoes.map((manutencao) => (
            <ProtocolCard
              key={manutencao.id}
              protocolo={manutencao.protocolo}
              titulo={manutencao.titulo}
              subtitulo={manutencao.subtitulo}
              descricao={manutencao.descricao}
              observacoes={manutencao.observacoes}
              status={manutencao.status}
              prioridade={manutencao.prioridade}
              responsavelNome={manutencao.responsavelNome}
              localizacao={manutencao.localizacao}
              dataAgendada={manutencao.dataAgendada}
              dataRealizada={manutencao.dataRealizada}
              createdAt={manutencao.createdAt}
              tipo={manutencao.tipo ? tipoLabels[manutencao.tipo] : undefined}
              onView={() => {
                setSelectedManutencao(manutencao);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedManutencao(manutencao);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta manutenção?")) {
                  deleteMutation.mutate({ id: manutencao.id });
                }
              }}
              onShare={() => {
                setSelectedManutencao(manutencao);
                setShowShareModal(true);
              }}
              onPdf={async () => {
                // Buscar imagens da manutenção
                const imagens = await utils.manutencao.getImagens.fetch({ manutencaoId: manutencao.id });
                generateManutencaoReport(manutencao, [], imagens || []);
              }}
              extra={
                <div className="mt-2 pt-2 border-t space-y-2">
                  {(manutencao.tempoEstimadoDias || manutencao.tempoEstimadoHoras || manutencao.tempoEstimadoMinutos) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-muted-foreground">
                        Tempo Estimado: 
                        {manutencao.tempoEstimadoDias ? ` ${manutencao.tempoEstimadoDias}d` : ''}
                        {manutencao.tempoEstimadoHoras ? ` ${manutencao.tempoEstimadoHoras}h` : ''}
                        {manutencao.tempoEstimadoMinutos ? ` ${manutencao.tempoEstimadoMinutos}min` : ''}
                      </span>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(manutencao.id, s)}
                          disabled={updateMutation.isPending}
                          className="cursor-pointer disabled:opacity-50"
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Dialog Nova Manutenção */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Manutenção</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
            <FormModalHeader
              icon={Wrench}
              iconColor="text-orange-600"
              iconBgColor="bg-gradient-to-br from-orange-100 to-amber-100"
              title="Nova Manutenção"
              subtitle="Registre uma nova manutenção no condomínio"
            />
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Seção: Informações Básicas */}
            <FormSection title="Informações Básicas" icon={FileText} iconColor="text-blue-500">
              <FormFieldGroup columns={1}>
                <div>
                  <StyledLabel required icon={Wrench}>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Reparo no Portão Principal"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <StyledLabel>Subtítulo</StyledLabel>
                  <Input
                    value={formData.subtitulo}
                    onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    placeholder="Descrição breve da manutenção"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            <FormSection title="Classificação" icon={Flag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={Wrench}>Tipo de Manutenção</StyledLabel>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Preventiva
                        </div>
                      </SelectItem>
                      <SelectItem value="corretiva">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Corretiva
                        </div>
                      </SelectItem>
                      <SelectItem value="emergencial">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Emergencial
                        </div>
                      </SelectItem>
                      <SelectItem value="programada">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Programada
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <StyledLabel icon={Flag}>Prioridade</StyledLabel>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(v) => setFormData({ ...formData, prioridade: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Baixa
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Média
                        </div>
                      </SelectItem>
                      <SelectItem value="alta">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="urgente">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Atribuição */}
            <FormSection title="Atribuição" icon={User} iconColor="text-violet-500">
              <FormFieldGroup columns={2}>
                <InputWithSave
                  label="Responsável"
                  value={formData.responsavelNome}
                  onChange={(v) => setFormData({ ...formData, responsavelNome: v })}
                  condominioId={condominioId}
                  tipo="responsavel"
                  placeholder="Nome do responsável"
                />
                <InputWithSave
                  label="Localização"
                  value={formData.localizacao}
                  onChange={(v) => setFormData({ ...formData, localizacao: v })}
                  condominioId={condominioId}
                  tipo="localizacao"
                  placeholder="Local da manutenção"
                />
              </FormFieldGroup>
              <div className="mt-4">
                <InputWithSave
                  label="Fornecedor"
                  value={formData.fornecedor}
                  onChange={(v) => setFormData({ ...formData, fornecedor: v })}
                  condominioId={condominioId}
                  tipo="fornecedor"
                  placeholder="Nome do fornecedor ou empresa"
                />
              </div>
            </FormSection>

            {/* Seção: Agendamento e Custo */}
            <FormSection title="Agendamento e Custo" icon={Calendar} iconColor="text-rose-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={Calendar}>Data Agendada</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataAgendada}
                    onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <StyledLabel icon={Clock}>Tempo Estimado de Reparação</StyledLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Dias</label>
                      <Select 
                        value={String(formData.tempoEstimadoDias)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoDias: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Horas</label>
                      <Select 
                        value={String(formData.tempoEstimadoHoras)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoHoras: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Minutos</label>
                      <Select 
                        value={String(formData.tempoEstimadoMinutos)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoMinutos: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Detalhes */}
            <FormSection title="Detalhes" icon={AlignLeft} iconColor="text-gray-500">
              <div className="space-y-4">
                <div>
                  <StyledLabel icon={AlignLeft}>Descrição</StyledLabel>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os detalhes da manutenção..."
                    rows={3}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <StyledLabel>Observações</StyledLabel>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={2}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>
            </FormSection>

            {/* Seção: Imagens */}
            <FormSection title="Imagens" icon={Image} iconColor="text-pink-500">
              <MultiImageUpload
                value={imagens}
                onChange={setImagens}
                maxImages={10}
              />
              
              {/* Seção dedicada para edição de imagens */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <ImageEditSection
                  label="Editar Imagem com Anotações"
                  logoUrl={condominio?.logoUrl || undefined}
                  onSaveEditedImage={(editedImage) => {
                    setImagens(prev => [...prev, editedImage]);
                    toast.success("Imagem editada adicionada à galeria!");
                  }}
                />
              </div>
            </FormSection>

            {/* Seção: Controle de Manutenção */}
            <FormSection title="Controle de Manutenção" icon={Clock} iconColor="text-orange-500" variant="highlight">
              {/* Botões Iniciar/Terminar */}
              <div className="flex gap-3 mb-4">
                {!manutencaoIniciada ? (
                  <GradientButton type="button" onClick={iniciarManutencao} variant="success" icon={Play}>
                    Iniciar Manutenção
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton type="button" onClick={terminarManutencao} variant="danger" icon={Square}>
                      Terminar Manutenção
                    </GradientButton>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Iniciada às {horaInicio?.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Informações de tempo */}
              {duracaoManutencao && (
                <div className="bg-white p-4 rounded-lg border border-orange-100 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Duração</p>
                      <p className="font-semibold text-orange-600">{duracaoManutencao}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Início</p>
                      <p className="font-medium">{horaInicio?.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fim</p>
                      <p className="font-medium">{horaFim?.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Geolocalização */}
              <div className="flex gap-3 items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={capturarGeolocalizacao}
                  disabled={capturandoGeo}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {capturandoGeo ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  {capturandoGeo ? "Capturando..." : "Capturar Localização"}
                </Button>
                
                {formData.geoLatitude && formData.geoLongitude && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => abrirMapa(formData.geoLatitude, formData.geoLongitude)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                    Ver no Mapa
                  </Button>
                )}
              </div>

              {/* Exibir coordenadas e endereço */}
              {formData.geoLatitude && formData.geoLongitude && (
                <LocationMiniMap
                  latitude={formData.geoLatitude}
                  longitude={formData.geoLongitude}
                  endereco={formData.geoEndereco}
                  height={180}
                />
              )}
            </FormSection>
          </div>

          {/* Footer Premium */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <FormActions>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="px-5 h-11 border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <GradientButton 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                variant="warning"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Manutenção"}
              </GradientButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Detalhes da Manutenção
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedManutencao && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedManutencao.protocolo}
                      </p>
                      <CardTitle>{selectedManutencao.titulo}</CardTitle>
                    </div>
                    <StatusBadge status={selectedManutencao.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">{selectedManutencao.tipo || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Responsável</p>
                      <p className="font-medium">{selectedManutencao.responsavelNome || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Localização</p>
                      <p className="font-medium">{selectedManutencao.localizacao || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fornecedor</p>
                      <p className="font-medium">{selectedManutencao.fornecedor || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedManutencao.id, s);
                            setSelectedManutencao({ ...selectedManutencao, status: s });
                          }}
                          className="cursor-pointer"
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galeria de Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencaoImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {manutencaoImagens.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma imagem</p>
                  )}
                  <div className="mt-4">
                    <MultiImageUpload
                      value={[]}
                      onChange={(urls) => urls.forEach(url => handleAddImage(url))}
                      maxImages={10}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={timeline} />
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Adicionar Comentário
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Enviar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="manutencao"
        itemId={selectedManutencao?.id || 0}
        itemTitulo={selectedManutencao?.titulo || ""}
        itemProtocolo={selectedManutencao?.protocolo || ""}
        condominioId={condominioId}
      />
    </div>
  );
}

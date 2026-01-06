import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LocationMiniMap } from "@/components/LocationMiniMap";
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
  AlertTriangle, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  Printer,
  MapPin,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Navigation,
  Tag
} from "lucide-react";
import { generateOcorrenciaReport, generateListReport, formatStatus, formatDate } from "@/lib/pdfGenerator";
import { ProtocolCard, StatsCards } from "@/components/ProtocolCard";
import { Timeline, StatusBadge } from "@/components/Timeline";
import MultiImageUpload from "@/components/MultiImageUpload";
import InputWithSave from "@/components/InputWithSave";
import ImageEditSection from "@/components/ImageEditSection";
import {
  FormModalHeader,
  FormSection,
  FormFieldGroup,
  StyledLabel,
  FormActions,
  GradientButton,
} from "@/components/ui/form-modal";

interface OcorrenciasPageProps {
  condominioId: number;
}

const categoriaLabels: Record<string, string> = {
  seguranca: "Segurança",
  barulho: "Barulho",
  manutencao: "Manutenção",
  convivencia: "Convivência",
  animais: "Animais",
  estacionamento: "Estacionamento",
  limpeza: "Limpeza",
  outros: "Outros",
};

export default function OcorrenciasPage({ condominioId }: OcorrenciasPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [newComment, setNewComment] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    observacoes: "",
    reportadoPorNome: "",
    responsavelNome: "",
    localizacao: "",
    dataOcorrencia: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    categoria: "outros" as "seguranca" | "barulho" | "manutencao" | "convivencia" | "animais" | "estacionamento" | "limpeza" | "outros",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  const utils = trpc.useUtils();
  
  // Buscar dados do condomínio para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: ocorrencias = [], isLoading } = trpc.ocorrencia.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.ocorrencia.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.ocorrencia.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.ocorrencia.getTimeline.useQuery(
    { ocorrenciaId: selectedOcorrencia?.id },
    { enabled: !!selectedOcorrencia?.id }
  );
  
  const { data: ocorrenciaImagens = [] } = trpc.ocorrencia.getImagens.useQuery(
    { ocorrenciaId: selectedOcorrencia?.id },
    { enabled: !!selectedOcorrencia?.id }
  );

  const createMutation = trpc.ocorrencia.create.useMutation({
    onSuccess: async (result) => {
      for (const url of imagens) {
        await addImagemMutation.mutateAsync({ ocorrenciaId: result.id, url });
      }
      toast.success(`Ocorrência registrada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao registrar ocorrência"),
  });

  const updateMutation = trpc.ocorrencia.update.useMutation({
    onSuccess: () => {
      toast.success("Ocorrência atualizada!");
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
      utils.ocorrencia.getTimeline.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar ocorrência"),
  });

  const deleteMutation = trpc.ocorrencia.delete.useMutation({
    onSuccess: () => {
      toast.success("Ocorrência excluída!");
      setShowDetailDialog(false);
      setSelectedOcorrencia(null);
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir ocorrência"),
  });

  const addImagemMutation = trpc.ocorrencia.addImagem.useMutation({
    onSuccess: () => {
      utils.ocorrencia.getImagens.invalidate();
      utils.ocorrencia.getTimeline.invalidate();
    },
  });

  const addTimelineEventMutation = trpc.ocorrencia.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.ocorrencia.getTimeline.invalidate();
      toast.success("Comentário adicionado!");
    },
  });

  // Captura automática de localização ao abrir o dialog
  useEffect(() => {
    if (showDialog && !formData.geoLatitude) {
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
                if (data.display_name) endereco = data.display_name;
              }
            } catch (e) { console.log("Erro ao obter endereço"); }
            setFormData(prev => ({ ...prev, geoLatitude: latitude.toString(), geoLongitude: longitude.toString(), geoEndereco: endereco }));
            toast.success("Localização capturada automaticamente!");
          },
          () => { console.log("Captura automática falhou"); },
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
      reportadoPorNome: "",
      responsavelNome: "",
      localizacao: "",
      dataOcorrencia: "",
      prioridade: "media",
      categoria: "outros",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
    });
    setImagens([]);
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

  const handleStatusChange = (ocorrenciaId: number, newStatus: string) => {
    updateMutation.mutate({ id: ocorrenciaId, status: newStatus as any });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedOcorrencia) return;
    addTimelineEventMutation.mutate({
      ocorrenciaId: selectedOcorrencia.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedOcorrencia) return;
    await addImagemMutation.mutateAsync({
      ocorrenciaId: selectedOcorrencia.id,
      url,
    });
  };

  const filteredOcorrencias = searchProtocolo.length >= 3 
    ? searchResults 
    : ocorrencias.filter(o => filterStatus === "todos" || o.status === filterStatus);

  const handleGeneratePDF = () => {
    if (selectedOcorrencia) {
      generateOcorrenciaReport(selectedOcorrencia, timeline, ocorrenciaImagens);
    } else {
      toast.info("Selecione uma ocorrência para gerar o PDF");
    }
  };

  const handleGenerateReport = () => {
    generateListReport(
      "Relatório de Ocorrências",
      filteredOcorrencias,
      [
        { key: "protocolo", label: "Protocolo" },
        { key: "titulo", label: "Título" },
        { key: "status", label: "Status", format: formatStatus },
        { key: "categoria", label: "Categoria", format: (v: string) => categoriaLabels[v] || v },
        { key: "reportadoPorNome", label: "Reportado por" },
        { key: "localizacao", label: "Localização" },
        { key: "dataOcorrencia", label: "Data", format: formatDate },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Ocorrências
          </h2>
          <p className="text-muted-foreground">
            Registre e acompanhe ocorrências do condomínio
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Nova Ocorrência
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
      ) : filteredOcorrencias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma ocorrência registrada</p>
            <Button className="mt-4" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Registrar primeira ocorrência
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOcorrencias.map((ocorrencia) => (
            <ProtocolCard
              key={ocorrencia.id}
              protocolo={ocorrencia.protocolo}
              titulo={ocorrencia.titulo}
              subtitulo={ocorrencia.subtitulo}
              descricao={ocorrencia.descricao}
              observacoes={ocorrencia.observacoes}
              status={ocorrencia.status}
              prioridade={ocorrencia.prioridade}
              responsavelNome={ocorrencia.responsavelNome}
              localizacao={ocorrencia.localizacao}
              createdAt={ocorrencia.createdAt}
              categoria={ocorrencia.categoria ? categoriaLabels[ocorrencia.categoria] : undefined}
              onView={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta ocorrência?")) {
                  deleteMutation.mutate({ id: ocorrencia.id });
                }
              }}
              onShare={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowShareModal(true);
              }}
              onPdf={async () => {
                const imagens = await utils.ocorrencia.getImagens.fetch({ ocorrenciaId: ocorrencia.id });
                generateOcorrenciaReport(ocorrencia, [], imagens || []);
              }}
              extra={
                <div className="mt-2 pt-2 border-t">
                  <Label className="text-xs text-muted-foreground">Alterar Status:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(ocorrencia.id, s)}
                        disabled={updateMutation.isPending}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        <StatusBadge status={s} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Dialog Nova Ocorrência */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Ocorrência</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
            <FormModalHeader
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-gradient-to-br from-red-100 to-rose-100"
              title="Nova Ocorrência"
              subtitle="Registre uma nova ocorrência no condomínio"
            />
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Seção: Informações Básicas */}
            <FormSection title="Informações Básicas" icon={FileText} iconColor="text-blue-500">
              <FormFieldGroup columns={1}>
                <div>
                  <StyledLabel required icon={AlertTriangle}>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Barulho excessivo no Bloco B"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <StyledLabel>Subtítulo</StyledLabel>
                  <Input
                    value={formData.subtitulo}
                    onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    placeholder="Descrição breve da ocorrência"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            <FormSection title="Classificação" icon={Tag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={Tag}>Categoria</StyledLabel>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) => setFormData({ ...formData, categoria: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguranca">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Segurança
                        </div>
                      </SelectItem>
                      <SelectItem value="barulho">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Barulho
                        </div>
                      </SelectItem>
                      <SelectItem value="manutencao">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Manutenção
                        </div>
                      </SelectItem>
                      <SelectItem value="convivencia">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Convivência
                        </div>
                      </SelectItem>
                      <SelectItem value="animais">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Animais
                        </div>
                      </SelectItem>
                      <SelectItem value="estacionamento">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          Estacionamento
                        </div>
                      </SelectItem>
                      <SelectItem value="limpeza">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                          Limpeza
                        </div>
                      </SelectItem>
                      <SelectItem value="outros">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          Outros
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

            {/* Seção: Envolvidos */}
            <FormSection title="Envolvidos" icon={User} iconColor="text-violet-500">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={User}>Reportado por</StyledLabel>
                  <Input
                    value={formData.reportadoPorNome}
                    onChange={(e) => setFormData({ ...formData, reportadoPorNome: e.target.value })}
                    placeholder="Nome de quem reportou"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <InputWithSave
                  label="Responsável pelo atendimento"
                  value={formData.responsavelNome}
                  onChange={(v) => setFormData({ ...formData, responsavelNome: v })}
                  condominioId={condominioId}
                  tipo="responsavel"
                  placeholder="Nome do responsável"
                />
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Local e Data */}
            <FormSection title="Local e Data" icon={Calendar} iconColor="text-rose-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <InputWithSave
                  label="Localização"
                  value={formData.localizacao}
                  onChange={(v) => setFormData({ ...formData, localizacao: v })}
                  condominioId={condominioId}
                  tipo="localizacao"
                  placeholder="Ex: Bloco B - Apto 302"
                />
                <div>
                  <StyledLabel icon={Calendar}>Data da Ocorrência</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataOcorrencia}
                    onChange={(e) => setFormData({ ...formData, dataOcorrencia: e.target.value })}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
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
                    placeholder="Descreva a ocorrência em detalhes..."
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
            <FormSection title="Imagens/Evidências" icon={Image} iconColor="text-pink-500">
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

            {/* Seção: Geolocalização */}
            <FormSection title="Localização GPS" icon={MapPin} iconColor="text-emerald-500" variant="highlight">
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
                    <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
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
                variant="danger"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Registrando..." : "Registrar Ocorrência"}
              </GradientButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes da Ocorrência
            </DialogTitle>
          </DialogHeader>
          
          {selectedOcorrencia && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedOcorrencia.protocolo}
                      </p>
                      <CardTitle>{selectedOcorrencia.titulo}</CardTitle>
                    </div>
                    <StatusBadge status={selectedOcorrencia.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-medium">{selectedOcorrencia.categoria ? categoriaLabels[selectedOcorrencia.categoria] : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reportado por</p>
                      <p className="font-medium">{selectedOcorrencia.reportadoPorNome || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Localização</p>
                      <p className="font-medium">{selectedOcorrencia.localizacao || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Responsável</p>
                      <p className="font-medium">{selectedOcorrencia.responsavelNome || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedOcorrencia.id, s);
                            setSelectedOcorrencia({ ...selectedOcorrencia, status: s });
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
                  <CardTitle className="text-lg">Imagens/Evidências</CardTitle>
                </CardHeader>
                <CardContent>
                  {ocorrenciaImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {ocorrenciaImagens.map((img) => (
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
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="ocorrencia"
        itemId={selectedOcorrencia?.id || 0}
        itemTitulo={selectedOcorrencia?.titulo || ""}
        itemProtocolo={selectedOcorrencia?.protocolo || ""}
        condominioId={condominioId}
      />
    </div>
  );
}

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
  ClipboardCheck, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  Printer,
  Share2,
  MapPin,
  Play,
  Square,
  Clock,
  Navigation,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Clipboard
} from "lucide-react";
import { generateVistoriaReport, generateListReport, formatStatus, formatDate } from "@/lib/pdfGenerator";
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

interface VistoriasPageProps {
  condominioId: number;
}

export default function VistoriasPage({ condominioId }: VistoriasPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<any>(null);
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
    tipo: "",
    categoria: "",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [vistoriaIniciada, setVistoriaIniciada] = useState(false);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [duracaoVistoria, setDuracaoVistoria] = useState("");
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  const utils = trpc.useUtils();
  
  // Buscar dados do condomínio para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: vistorias = [], isLoading } = trpc.vistoria.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.vistoria.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.vistoria.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.vistoria.getTimeline.useQuery(
    { vistoriaId: selectedVistoria?.id },
    { enabled: !!selectedVistoria?.id }
  );
  
  const { data: vistoriaImagens = [] } = trpc.vistoria.getImagens.useQuery(
    { vistoriaId: selectedVistoria?.id },
    { enabled: !!selectedVistoria?.id }
  );

  const createMutation = trpc.vistoria.create.useMutation({
    onSuccess: async (result) => {
      // Adicionar imagens
      for (const url of imagens) {
        await addImagemMutation.mutateAsync({ vistoriaId: result.id, url });
      }
      toast.success(`Vistoria criada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao criar vistoria"),
  });

  const updateMutation = trpc.vistoria.update.useMutation({
    onSuccess: () => {
      toast.success("Vistoria atualizada!");
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
      utils.vistoria.getTimeline.invalidate();
      if (selectedVistoria) {
        utils.vistoria.getById.invalidate({ id: selectedVistoria.id });
      }
    },
    onError: () => toast.error("Erro ao atualizar vistoria"),
  });

  const deleteMutation = trpc.vistoria.delete.useMutation({
    onSuccess: () => {
      toast.success("Vistoria excluída!");
      setShowDetailDialog(false);
      setSelectedVistoria(null);
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir vistoria"),
  });

  const addImagemMutation = trpc.vistoria.addImagem.useMutation({
    onSuccess: () => {
      utils.vistoria.getImagens.invalidate();
      utils.vistoria.getTimeline.invalidate();
    },
  });

  const addTimelineEventMutation = trpc.vistoria.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.vistoria.getTimeline.invalidate();
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
      responsavelNome: "",
      localizacao: "",
      dataAgendada: "",
      prioridade: "media",
      tipo: "",
      categoria: "",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
    });
    setImagens([]);
    setVistoriaIniciada(false);
    setHoraInicio(null);
    setHoraFim(null);
    setDuracaoVistoria("");
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
        // Tentar obter endereço via API reversa
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

  const iniciarVistoria = () => {
    const agora = new Date();
    setHoraInicio(agora);
    setVistoriaIniciada(true);
    capturarGeolocalizacao();
    toast.success(`Vistoria iniciada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const terminarVistoria = () => {
    const agora = new Date();
    setHoraFim(agora);
    if (horaInicio) {
      const diff = agora.getTime() - horaInicio.getTime();
      const minutos = Math.floor(diff / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      setDuracaoVistoria(`${minutos}min ${segundos}s`);
    }
    toast.success(`Vistoria finalizada às ${agora.toLocaleTimeString("pt-BR")}`);
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

  const handleStatusChange = (vistoriaId: number, newStatus: string) => {
    updateMutation.mutate({ 
      id: vistoriaId, 
      status: newStatus as any 
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedVistoria) return;
    addTimelineEventMutation.mutate({
      vistoriaId: selectedVistoria.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedVistoria) return;
    await addImagemMutation.mutateAsync({
      vistoriaId: selectedVistoria.id,
      url,
    });
  };

  const filteredVistorias = searchProtocolo.length >= 3 
    ? searchResults 
    : vistorias.filter(v => filterStatus === "todos" || v.status === filterStatus);

  const generatePDF = () => {
    if (selectedVistoria) {
      generateVistoriaReport(selectedVistoria, timeline, vistoriaImagens);
    } else {
      toast.info("Selecione uma vistoria para gerar o PDF");
    }
  };

  const generateReport = () => {
    generateListReport(
      "Relatório de Vistorias",
      filteredVistorias,
      [
        { key: "protocolo", label: "Protocolo" },
        { key: "titulo", label: "Título" },
        { key: "status", label: "Status", format: formatStatus },
        { key: "responsavelNome", label: "Responsável" },
        { key: "localizacao", label: "Localização" },
        { key: "dataAgendada", label: "Data Agendada", format: formatDate },
        { key: "createdAt", label: "Criado em", format: formatDate },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Vistorias
          </h2>
          <p className="text-muted-foreground">
            Gerencie as vistorias do condomínio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={generateReport}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Relatório
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Vistoria
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

      {/* Lista de Vistorias */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Carregando vistorias...</p>
        </div>
      ) : filteredVistorias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchProtocolo ? "Nenhuma vistoria encontrada" : "Nenhuma vistoria cadastrada"}
            </p>
            <Button className="mt-4" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Criar primeira vistoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVistorias.map((vistoria) => (
            <ProtocolCard
              key={vistoria.id}
              protocolo={vistoria.protocolo}
              titulo={vistoria.titulo}
              subtitulo={vistoria.subtitulo}
              descricao={vistoria.descricao}
              observacoes={vistoria.observacoes}
              status={vistoria.status}
              prioridade={vistoria.prioridade}
              responsavelNome={vistoria.responsavelNome}
              localizacao={vistoria.localizacao}
              dataAgendada={vistoria.dataAgendada}
              dataRealizada={vistoria.dataRealizada}
              createdAt={vistoria.createdAt}
              tipo={vistoria.tipo}
              onView={() => {
                setSelectedVistoria(vistoria);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedVistoria(vistoria);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta vistoria?")) {
                  deleteMutation.mutate({ id: vistoria.id });
                }
              }}
              onShare={() => {
                setSelectedVistoria(vistoria);
                setShowShareModal(true);
              }}
              onPdf={async () => {
                const imagens = await utils.vistoria.getImagens.fetch({ vistoriaId: vistoria.id });
                generateVistoriaReport(vistoria, [], imagens || []);
              }}
              extra={
                <div className="mt-2 pt-2 border-t">
                  <Label className="text-xs text-muted-foreground">Alterar Status:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(vistoria.id, s)}
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

      {/* Dialog Nova Vistoria */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Vistoria</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
            <FormModalHeader
              icon={ClipboardCheck}
              iconColor="text-blue-600"
              iconBgColor="bg-gradient-to-br from-blue-100 to-indigo-100"
              title="Nova Vistoria"
              subtitle="Registre uma nova vistoria no condomínio"
            />
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Seção: Informações Básicas */}
            <FormSection title="Informações Básicas" icon={FileText} iconColor="text-blue-500">
              <FormFieldGroup columns={1}>
                <div>
                  <StyledLabel required icon={Clipboard}>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Vistoria de Elevadores"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <StyledLabel>Subtítulo</StyledLabel>
                  <Input
                    value={formData.subtitulo}
                    onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    placeholder="Ex: Manutenção preventiva mensal"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            <FormSection title="Classificação" icon={Flag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <InputWithSave
                  label="Tipo de Vistoria"
                  value={formData.tipo}
                  onChange={(v) => setFormData({ ...formData, tipo: v })}
                  condominioId={condominioId}
                  tipo="tipo_vistoria"
                  placeholder="Ex: Elétrica, Hidráulica"
                />
                <InputWithSave
                  label="Categoria"
                  value={formData.categoria || ""}
                  onChange={(v) => setFormData({ ...formData, categoria: v })}
                  condominioId={condominioId}
                  tipo="categoria_vistoria"
                  placeholder="Ex: Preventiva, Corretiva"
                />
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
                  placeholder="Ex: Bloco A - Térreo"
                />
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Agendamento */}
            <FormSection title="Agendamento" icon={Calendar} iconColor="text-rose-500" variant="subtle">
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

            {/* Seção: Detalhes */}
            <FormSection title="Detalhes" icon={AlignLeft} iconColor="text-gray-500">
              <div className="space-y-4">
                <div>
                  <StyledLabel icon={AlignLeft}>Descrição</StyledLabel>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os detalhes da vistoria..."
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

            {/* Seção: Controle de Vistoria */}
            <FormSection title="Controle de Vistoria" icon={Clock} iconColor="text-emerald-500" variant="highlight">
              {/* Botões Iniciar/Terminar */}
              <div className="flex gap-3 mb-4">
                {!vistoriaIniciada ? (
                  <GradientButton type="button" onClick={iniciarVistoria} variant="success" icon={Play}>
                    Iniciar Vistoria
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton type="button" onClick={terminarVistoria} variant="danger" icon={Square}>
                      Terminar Vistoria
                    </GradientButton>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span>Iniciada às {horaInicio?.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Informações de tempo */}
              {duracaoVistoria && (
                <div className="bg-white p-4 rounded-lg border border-emerald-100 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Duração</p>
                      <p className="font-semibold text-emerald-600">{duracaoVistoria}</p>
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
                variant="primary"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Vistoria"}
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
              Detalhes da Vistoria
            </DialogTitle>
          </DialogHeader>
          
          {selectedVistoria && (
            <div className="space-y-6">
              {/* Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedVistoria.protocolo}
                      </p>
                      <CardTitle>{selectedVistoria.titulo}</CardTitle>
                      {selectedVistoria.subtitulo && (
                        <p className="text-muted-foreground">{selectedVistoria.subtitulo}</p>
                      )}
                    </div>
                    <StatusBadge status={selectedVistoria.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Responsável</p>
                      <p className="font-medium">{selectedVistoria.responsavelNome || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Localização</p>
                      <p className="font-medium">{selectedVistoria.localizacao || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data Agendada</p>
                      <p className="font-medium">
                        {selectedVistoria.dataAgendada 
                          ? new Date(selectedVistoria.dataAgendada).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prioridade</p>
                      <p className="font-medium capitalize">{selectedVistoria.prioridade || "Média"}</p>
                    </div>
                  </div>
                  
                  {selectedVistoria.descricao && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm">Descrição</p>
                      <p className="whitespace-pre-wrap">{selectedVistoria.descricao}</p>
                    </div>
                  )}
                  
                  {selectedVistoria.observacoes && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm">Observações</p>
                      <p className="whitespace-pre-wrap">{selectedVistoria.observacoes}</p>
                    </div>
                  )}

                  {/* Alterar Status */}
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedVistoria.id, s);
                            setSelectedVistoria({ ...selectedVistoria, status: s });
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

              {/* Imagens */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galeria de Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  {vistoriaImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {vistoriaImagens.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.legenda || "Imagem"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma imagem adicionada
                    </p>
                  )}
                  <div className="mt-4">
                    <MultiImageUpload
                      value={[]}
                      onChange={(urls) => {
                        urls.forEach(url => handleAddImage(url));
                      }}
                      maxImages={10}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Timeline de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={timeline} />
                  
                  {/* Adicionar comentário */}
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Adicionar Comentário
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Digite um comentário..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addTimelineEventMutation.isPending}
                      >
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
            <Button variant="outline" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-1" />
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="vistoria"
        itemId={selectedVistoria?.id || 0}
        itemTitulo={selectedVistoria?.titulo || ""}
        itemProtocolo={selectedVistoria?.protocolo || ""}
        condominioId={condominioId}
      />
    </div>
  );
}

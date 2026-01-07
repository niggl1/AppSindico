import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useLocation, useParams } from "wouter";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  Clock,
  MapPin,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Image,
  Play,
  Square,
  Settings,
  Tag,
  Flag,
  Circle,
  Calendar,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  Send,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
  FolderOpen,
  CheckCircle2,
  Wrench,
  Navigation,
  Map,
  Link2,
  Download,
  File,
  ImageIcon,
  X,
  Loader2,
} from "lucide-react";

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  Zap, Droplets, Building2, TreePine, Sparkles, Paintbrush, Shield, MoreHorizontal,
  ArrowDown, Minus, ArrowUp, AlertTriangle, FolderOpen, CheckCircle, CheckCircle2,
  XCircle, Wrench, Tag, Flag, Circle, Package,
};

const iconOptions = [
  { value: "Zap", label: "Elétrica", icon: Zap },
  { value: "Droplets", label: "Hidráulica", icon: Droplets },
  { value: "Building2", label: "Estrutural", icon: Building2 },
  { value: "TreePine", label: "Jardinagem", icon: TreePine },
  { value: "Sparkles", label: "Limpeza", icon: Sparkles },
  { value: "Paintbrush", label: "Pintura", icon: Paintbrush },
  { value: "Shield", label: "Segurança", icon: Shield },
  { value: "MoreHorizontal", label: "Outros", icon: MoreHorizontal },
  { value: "Wrench", label: "Manutenção", icon: Wrench },
  { value: "Package", label: "Material", icon: Package },
];

const prioridadeIconOptions = [
  { value: "ArrowDown", label: "Baixa", icon: ArrowDown },
  { value: "Minus", label: "Normal", icon: Minus },
  { value: "ArrowUp", label: "Alta", icon: ArrowUp },
  { value: "AlertTriangle", label: "Urgente", icon: AlertTriangle },
];

const statusIconOptions = [
  { value: "FolderOpen", label: "Aberta", icon: FolderOpen },
  { value: "Circle", label: "Em Análise", icon: Circle },
  { value: "CheckCircle", label: "Aprovada", icon: CheckCircle },
  { value: "Wrench", label: "Em Execução", icon: Wrench },
  { value: "Package", label: "Aguardando Material", icon: Package },
  { value: "CheckCircle2", label: "Concluída", icon: CheckCircle2 },
  { value: "XCircle", label: "Cancelada", icon: XCircle },
];

export default function OrdemServicoDetalhe() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { condominioAtivo } = useCondominioAtivo();
  const [activeTab, setActiveTab] = useState("detalhes");
  const [isEditing, setIsEditing] = useState(false);
  const [showGerenciarCategorias, setShowGerenciarCategorias] = useState(false);
  const [showGerenciarPrioridades, setShowGerenciarPrioridades] = useState(false);
  const [showGerenciarStatus, setShowGerenciarStatus] = useState(false);
  const [showGerenciarSetores, setShowGerenciarSetores] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddOrcamento, setShowAddOrcamento] = useState(false);
  const [showAddResponsavel, setShowAddResponsavel] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [chatAnexo, setChatAnexo] = useState<{
    file: File | null;
    preview: string | null;
    uploading: boolean;
  }>({ file: null, preview: null, uploading: false });

  const osId = params.id ? parseInt(params.id) : 0;

  // Queries
  const { data: ordem, refetch: refetchOrdem, isLoading: isLoadingOrdem, error: errorOrdem } = trpc.ordensServico.getById.useQuery(
    { id: osId },
    { enabled: !!osId, retry: 1 }
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

  const { data: setores, refetch: refetchSetores } = trpc.ordensServico.getSetores.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Materiais, orcamentos, responsaveis e timeline já vêm no getById
  const materiais = ordem?.materiais || [];
  const orcamentos = ordem?.orcamentos || [];
  const responsaveis = ordem?.responsaveis || [];
  const timeline = ordem?.timeline || [];
  
  const refetchMateriais = refetchOrdem;
  const refetchOrcamentos = refetchOrdem;
  const refetchResponsaveis = refetchOrdem;
  const refetchTimeline = refetchOrdem;

  const { data: chat, refetch: refetchChat } = trpc.ordensServico.getChat.useQuery(
    { ordemServicoId: osId },
    { enabled: !!osId }
  );

  const { data: configuracoes } = trpc.ordensServico.getConfiguracoes.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Mutations
  const updateOS = trpc.ordensServico.update.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço atualizada!");
      refetchOrdem();
      setIsEditing(false);
    },
  });

  const iniciarOS = trpc.ordensServico.iniciarServico.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço iniciada!");
      refetchOrdem();
      refetchTimeline();
    },
  });

  const finalizarOS = trpc.ordensServico.finalizarServico.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço finalizada!");
      refetchOrdem();
      refetchTimeline();
    },
  });

  // Categoria mutations
  const createCategoria = trpc.ordensServico.createCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada!");
      refetchCategorias();
    },
  });

  const deleteCategoria = trpc.ordensServico.deleteCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída!");
      refetchCategorias();
    },
  });

  // Prioridade mutations
  const createPrioridade = trpc.ordensServico.createPrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade criada!");
      refetchPrioridades();
    },
  });

  const deletePrioridade = trpc.ordensServico.deletePrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade excluída!");
      refetchPrioridades();
    },
  });

  // Status mutations
  const createStatus = trpc.ordensServico.createStatus.useMutation({
    onSuccess: () => {
      toast.success("Status criado!");
      refetchStatus();
    },
  });

  const deleteStatus = trpc.ordensServico.deleteStatus.useMutation({
    onSuccess: () => {
      toast.success("Status excluído!");
      refetchStatus();
    },
  });

  // Setor mutations
  const createSetor = trpc.ordensServico.createSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor criado!");
      refetchSetores();
    },
  });

  const deleteSetor = trpc.ordensServico.deleteSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor excluído!");
      refetchSetores();
    },
  });

  // Material mutations
  const addMaterial = trpc.ordensServico.addMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material adicionado!");
      refetchMateriais();
      setShowAddMaterial(false);
    },
  });

  const deleteMaterial = trpc.ordensServico.removeMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material removido!");
      refetchMateriais();
    },
  });

  // Orçamento mutations
  const addOrcamento = trpc.ordensServico.addOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento adicionado!");
      refetchOrcamentos();
      setShowAddOrcamento(false);
    },
  });

  const aprovarOrcamento = trpc.ordensServico.aprovarOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento aprovado!");
      refetchOrcamentos();
    },
  });

  const deleteOrcamento = trpc.ordensServico.removeOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento removido!");
      refetchOrcamentos();
    },
  });

  // Responsável mutations
  const addResponsavel = trpc.ordensServico.addResponsavel.useMutation({
    onSuccess: () => {
      toast.success("Responsável adicionado!");
      refetchResponsaveis();
      setShowAddResponsavel(false);
    },
  });

  const deleteResponsavel = trpc.ordensServico.removeResponsavel.useMutation({
    onSuccess: () => {
      toast.success("Responsável removido!");
      refetchResponsaveis();
    },
  });

  // Chat mutation
  const sendChatMessage = trpc.ordensServico.sendMessage.useMutation({
    onSuccess: () => {
      setChatMessage("");
      refetchChat();
    },
  });

  // Localização mutation
  const updateLocalizacao = trpc.ordensServico.updateLocalizacao.useMutation({
    onSuccess: () => {
      toast.success("Localização atualizada!");
      refetchOrdem();
    },
  });

  // Form states
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    categoriaId: "",
    prioridadeId: "",
    statusId: "",
    setorId: "",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    valorEstimado: "",
    valorReal: "",
  });

  const [novaCategoria, setNovaCategoria] = useState({ nome: "", cor: "#EAB308", icone: "Tag" });
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", cor: "#EAB308", icone: "Minus", ordem: 1 });
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#EAB308", icone: "Circle", ordem: 1 });
  const [novoSetor, setNovoSetor] = useState({ nome: "" });
  const [novoMaterial, setNovoMaterial] = useState({ nome: "", quantidade: 1, unidade: "un", emEstoque: true, precisaPedir: false, observacao: "" });
  const [novoOrcamento, setNovoOrcamento] = useState({ descricao: "", valor: "", fornecedor: "" });
  const [novoResponsavel, setNovoResponsavel] = useState({ nome: "", cargo: "", telefone: "", setorId: "" });

  useEffect(() => {
    if (ordem) {
      setEditForm({
        titulo: ordem.titulo,
        descricao: ordem.descricao || "",
        categoriaId: ordem.categoriaId ? String(ordem.categoriaId) : "",
        prioridadeId: ordem.prioridadeId ? String(ordem.prioridadeId) : "",
        statusId: ordem.statusId ? String(ordem.statusId) : "",
        setorId: ordem.setorId ? String(ordem.setorId) : "",
        tempoEstimadoDias: ordem.tempoEstimadoDias || 0,
        tempoEstimadoHoras: ordem.tempoEstimadoHoras || 0,
        tempoEstimadoMinutos: ordem.tempoEstimadoMinutos || 0,
        valorEstimado: ordem.valorEstimado || "",
        valorReal: ordem.valorReal || "",
      });
    }
  }, [ordem]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSaveEdit = () => {
    if (!ordem) return;
    updateOS.mutate({
      id: ordem.id,
      titulo: editForm.titulo,
      descricao: editForm.descricao || undefined,
      categoriaId: editForm.categoriaId ? parseInt(editForm.categoriaId) : undefined,
      prioridadeId: editForm.prioridadeId ? parseInt(editForm.prioridadeId) : undefined,
      statusId: editForm.statusId ? parseInt(editForm.statusId) : undefined,
      setorId: editForm.setorId ? parseInt(editForm.setorId) : undefined,
      tempoEstimadoDias: editForm.tempoEstimadoDias,
      tempoEstimadoHoras: editForm.tempoEstimadoHoras,
      tempoEstimadoMinutos: editForm.tempoEstimadoMinutos,
      valorEstimado: editForm.valorEstimado || undefined,
      valorReal: editForm.valorReal || undefined,
    });
  };

  const handleGetLocation = () => {
    if (!ordem) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Tentar obter endereço via API de geocoding reverso
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const endereco = data.display_name || "";
            
            updateLocalizacao.mutate({
              ordemServicoId: ordem.id,
              latitude: latitude,
              longitude: longitude,
              endereco,
            });
          } catch (error) {
            updateLocalizacao.mutate({
              ordemServicoId: ordem.id,
              latitude: latitude,
              longitude: longitude,
              endereco: null,
            });
          }
        },
        (error) => {
          toast.error("Erro ao obter localização: " + error.message);
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo navegador");
    }
  };

  // Upload de ficheiros para o chat
  const uploadFileMutation = trpc.upload.file.useMutation();
  const uploadImageMutation = trpc.upload.image.useMutation();

  const handleChatFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ficheiro muito grande. Máximo 10MB.");
      return;
    }

    // Criar preview para imagens
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setChatAnexo({ file, preview: event.target?.result as string, uploading: false });
      };
      reader.readAsDataURL(file);
    } else {
      setChatAnexo({ file, preview: null, uploading: false });
    }
  };

  const removeChatAnexo = () => {
    setChatAnexo({ file: null, preview: null, uploading: false });
    if (chatFileInputRef.current) chatFileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSendChat = async () => {
    if ((!chatMessage.trim() && !chatAnexo.file) || !ordem) return;

    try {
      let anexoUrl: string | undefined;
      let anexoNome: string | undefined;
      let anexoTipo: string | undefined;
      let anexoTamanho: number | undefined;

      // Se tem anexo, fazer upload primeiro
      if (chatAnexo.file) {
        setChatAnexo(prev => ({ ...prev, uploading: true }));
        const fileData = await fileToBase64(chatAnexo.file);
        const isImage = chatAnexo.file.type.startsWith('image/');

        if (isImage) {
          const result = await uploadImageMutation.mutateAsync({
            fileName: chatAnexo.file.name,
            fileType: chatAnexo.file.type,
            fileData,
            folder: 'os-chat',
          });
          anexoUrl = result.url;
        } else {
          const result = await uploadFileMutation.mutateAsync({
            fileName: chatAnexo.file.name,
            fileType: chatAnexo.file.type,
            fileData,
            folder: 'os-chat',
          });
          anexoUrl = result.url;
        }

        anexoNome = chatAnexo.file.name;
        anexoTipo = chatAnexo.file.type;
        anexoTamanho = chatAnexo.file.size;
      }

      // Enviar mensagem
      await sendChatMessage.mutateAsync({
        ordemServicoId: ordem.id,
        mensagem: chatMessage || undefined,
        anexoUrl,
        anexoNome,
        anexoTipo,
        anexoTamanho,
      });

      // Limpar campos
      setChatMessage("");
      removeChatAnexo();
      toast.success("Mensagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setChatAnexo(prev => ({ ...prev, uploading: false }));
    }
  };

  const formatTempo = (dias: number, horas: number, minutos: number) => {
    const parts = [];
    if (dias > 0) parts.push(`${dias}d`);
    if (horas > 0) parts.push(`${horas}h`);
    if (minutos > 0) parts.push(`${minutos}min`);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  const calcularTempoDecorrido = () => {
    if (!ordem?.dataInicio) return "-";
    const inicio = new Date(ordem.dataInicio);
    const fim = ordem.dataFim ? new Date(ordem.dataFim) : new Date();
    const diff = fim.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return formatTempo(dias, horas, minutos);
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Circle;
  };

  const copyShareLink = () => {
    if (!ordem) return;
    const link = `${window.location.origin}/compartilhado/os/${ordem.protocolo}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  if (isLoadingOrdem) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (errorOrdem) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-red-500">Erro ao carregar ordem de serviço</p>
          <p className="text-gray-400 text-sm">{errorOrdem.message}</p>
          <Button onClick={() => navigate("/dashboard/ordens-servico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!ordem) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-gray-500">Ordem de serviço não encontrada</p>
          <Button onClick={() => navigate("/dashboard/ordens-servico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = ordem.status?.icone ? getIconComponent(ordem.status.icone) : Circle;
  const CategoriaIcon = ordem.categoria?.icone ? getIconComponent(ordem.categoria.icone) : Tag;
  const PrioridadeIcon = ordem.prioridade?.icone ? getIconComponent(ordem.prioridade.icone) : Flag;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/dashboard/ordens-servico")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={copyShareLink}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => {
                  const texto = `*Ordem de Serviço #${ordem.protocolo}*%0A%0A` +
                    `*Título:* ${ordem.titulo}%0A` +
                    `*Status:* ${ordem.status?.nome || 'Sem status'}%0A` +
                    `*Prioridade:* ${ordem.prioridade?.nome || 'Normal'}%0A` +
                    `*Categoria:* ${ordem.categoria?.nome || 'Sem categoria'}%0A` +
                    (ordem.descricao ? `*Descrição:* ${ordem.descricao}%0A` : '') +
                    `%0A*Link:* ${window.location.origin}/os/${ordem.shareToken}`;
                  window.open(`https://wa.me/?text=${texto}`, '_blank');
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => {
                  window.open(`/api/ordens-servico/${ordem.id}/pdf`, '_blank');
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              {!ordem.dataInicio && (
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => iniciarOS.mutate({ id: ordem.id })}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              )}
              {ordem.dataInicio && !ordem.dataFim && (
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={() => finalizarOS.mutate({ id: ordem.id })}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <CategoriaIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono bg-white/20 text-white px-3 py-1 rounded-full">
                  #{ordem.protocolo}
                </span>
                <Badge
                  style={{ backgroundColor: ordem.status?.cor || "#EAB308" }}
                  className="text-white"
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {ordem.status?.nome || "Sem status"}
                </Badge>
                <Badge
                  className="bg-white/20 text-white"
                  style={{ borderColor: ordem.prioridade?.cor || undefined }}
                >
                  <PrioridadeIcon className="w-3 h-3 mr-1" />
                  {ordem.prioridade?.nome || "Normal"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                {ordem.titulo}
              </h1>
              {ordem.descricao && (
                <p className="text-white/80 mt-1">{ordem.descricao}</p>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Estimado
              </div>
              <div className="text-lg font-bold text-white">
                {formatTempo(ordem.tempoEstimadoDias || 0, ordem.tempoEstimadoHoras || 0, ordem.tempoEstimadoMinutos || 0)}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/70 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Decorrido
              </div>
              <div className="text-lg font-bold text-white">
                {calcularTempoDecorrido()}
              </div>
            </div>
            {configuracoes?.habilitarGestaoFinanceira && (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Valor Estimado
                  </div>
                  <div className="text-lg font-bold text-white">
                    {ordem.valorEstimado ? `R$ ${parseFloat(ordem.valorEstimado).toFixed(2)}` : "-"}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Valor Real
                  </div>
                  <div className="text-lg font-bold text-white">
                    {ordem.valorReal ? `R$ ${parseFloat(ordem.valorReal).toFixed(2)}` : "-"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white shadow-md rounded-xl p-1 mb-6 flex-wrap">
              <TabsTrigger 
                value="detalhes" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="materiais"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <Package className="w-4 h-4 mr-2" />
                Materiais
              </TabsTrigger>
              {configuracoes?.habilitarOrcamentos && (
                <TabsTrigger 
                  value="orcamentos"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Orçamentos
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="responsaveis"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Responsáveis
              </TabsTrigger>
              <TabsTrigger 
                value="localizacao"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Localização
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="configurar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </TabsTrigger>
            </TabsList>

            {/* Tab Detalhes */}
            <TabsContent value="detalhes">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Informações da OS</h2>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                    className={isEditing ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-white" : ""}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700">Título</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.titulo}
                        onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                        className="mt-1 border-amber-200"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{ordem.titulo}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.statusId}
                        onValueChange={(v) => setEditForm({ ...editForm, statusId: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList?.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge style={{ backgroundColor: ordem.status?.cor || "#EAB308" }} className="text-white">
                          {ordem.status?.nome || "Sem status"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label className="text-gray-700">Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.descricao}
                        onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                        className="mt-1 border-amber-200 min-h-[100px]"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{ordem.descricao || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Categoria</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.categoriaId}
                        onValueChange={(v) => setEditForm({ ...editForm, categoriaId: v })}
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
                    ) : (
                      <p className="mt-1 text-gray-800">{ordem.categoria?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Prioridade</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.prioridadeId}
                        onValueChange={(v) => setEditForm({ ...editForm, prioridadeId: v })}
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
                    ) : (
                      <p className="mt-1 text-gray-800">{ordem.prioridade?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Setor</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.setorId}
                        onValueChange={(v) => setEditForm({ ...editForm, setorId: v })}
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
                    ) : (
                      <p className="mt-1 text-gray-800">{ordem.setor?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Tempo Estimado</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div>
                          <Label className="text-xs text-gray-500">Dias</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.tempoEstimadoDias}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoDias: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Horas</Label>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={editForm.tempoEstimadoHoras}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoHoras: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Minutos</Label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={editForm.tempoEstimadoMinutos}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoMinutos: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-800">
                        {formatTempo(ordem.tempoEstimadoDias || 0, ordem.tempoEstimadoHoras || 0, ordem.tempoEstimadoMinutos || 0)}
                      </p>
                    )}
                  </div>

                  {configuracoes?.habilitarGestaoFinanceira && (
                    <>
                      <div>
                        <Label className="text-gray-700">Valor Estimado (R$)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.valorEstimado}
                            onChange={(e) => setEditForm({ ...editForm, valorEstimado: e.target.value })}
                            className="mt-1 border-amber-200"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {ordem.valorEstimado ? `R$ ${parseFloat(ordem.valorEstimado).toFixed(2)}` : "-"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700">Valor Real (R$)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.valorReal}
                            onChange={(e) => setEditForm({ ...editForm, valorReal: e.target.value })}
                            className="mt-1 border-amber-200"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {ordem.valorReal ? `R$ ${parseFloat(ordem.valorReal).toFixed(2)}` : "-"}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-gray-700">Data de Criação</Label>
                    <p className="mt-1 text-gray-800">
                      {new Date(ordem.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-700">Solicitante</Label>
                    <p className="mt-1 text-gray-800">{ordem.solicitanteNome || "-"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Materiais */}
            <TabsContent value="materiais">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Materiais Necessários</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddMaterial(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>

                {materiais?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum material cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materiais?.map((material: any) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-gray-800">{material.nome}</p>
                            <p className="text-sm text-gray-500">
                              Quantidade: {material.quantidade} {material.unidade}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {material.emEstoque ? (
                            <Badge className="bg-green-100 text-green-700">Em Estoque</Badge>
                          ) : material.precisaPedir ? (
                            <Badge className="bg-red-100 text-red-700">Precisa Pedir</Badge>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMaterial.mutate({ id: material.id, ordemServicoId: ordem?.id || 0 })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Orçamentos */}
            {configuracoes?.habilitarOrcamentos && (
              <TabsContent value="orcamentos">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Orçamentos</h2>
                    <Button
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowAddOrcamento(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Orçamento
                    </Button>
                  </div>

                  {orcamentos?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                      <p>Nenhum orçamento cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orcamentos?.map((orcamento: any) => (
                        <div
                          key={orcamento.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{orcamento.descricao}</p>
                            <p className="text-sm text-gray-500">
                              Fornecedor: {orcamento.fornecedor || "-"}
                            </p>
                            <p className="text-lg font-bold text-amber-600">
                              R$ {parseFloat(orcamento.valor).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {orcamento.aprovado ? (
                              <Badge className="bg-green-100 text-green-700">Aprovado</Badge>
                            ) : configuracoes?.habilitarAprovacaoOrcamento ? (
                              <Button
                                size="sm"
                                className="bg-green-500 text-white hover:bg-green-600"
                                onClick={() => aprovarOrcamento.mutate({ id: orcamento.id, ordemServicoId: ordem?.id || 0 })}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteOrcamento.mutate({ id: orcamento.id, ordemServicoId: ordem?.id || 0 })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Tab Responsáveis */}
            <TabsContent value="responsaveis">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Responsáveis</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddResponsavel(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Responsável
                  </Button>
                </div>

                {responsaveis?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum responsável cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {responsaveis?.map((resp: any) => (
                      <div
                        key={resp.id}
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{resp.nome}</p>
                            <p className="text-sm text-gray-500">
                              {resp.cargo || "-"} {resp.setor ? `• ${resp.setor.nome}` : ""}
                            </p>
                            {resp.telefone && (
                              <p className="text-sm text-amber-600">{resp.telefone}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteResponsavel.mutate({ id: resp.id, ordemServicoId: ordem?.id || 0 })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Localização */}
            <TabsContent value="localizacao">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Localização</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={handleGetLocation}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Obter Localização
                  </Button>
                </div>

                {ordem.latitude && ordem.longitude ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-gray-800">Coordenadas</span>
                      </div>
                      <p className="text-gray-600">
                        Latitude: {ordem.latitude}
                        <br />
                        Longitude: {ordem.longitude}
                      </p>
                      {ordem.endereco && (
                        <p className="mt-2 text-gray-800">{ordem.endereco}</p>
                      )}
                    </div>

                    {/* Mapa OpenStreetMap */}
                    <div className="rounded-xl overflow-hidden h-[400px]">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(ordem.longitude) - 0.01},${parseFloat(ordem.latitude) - 0.01},${parseFloat(ordem.longitude) + 0.01},${parseFloat(ordem.latitude) + 0.01}&layer=mapnik&marker=${ordem.latitude},${ordem.longitude}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://www.google.com/maps?q=${ordem.latitude},${ordem.longitude}`, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir no Google Maps
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://waze.com/ul?ll=${ordem.latitude},${ordem.longitude}&navigate=yes`, "_blank")}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Abrir no Waze
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhuma localização definida</p>
                    <p className="text-sm mt-1">Clique em "Obter Localização" para capturar automaticamente</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Chat */}
            <TabsContent value="chat">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat</h2>

                <div
                  ref={chatContainerRef}
                  className="h-[400px] overflow-y-auto bg-gray-50 rounded-xl p-4 mb-4 space-y-3"
                >
                  {chat?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                      <p>Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    chat?.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-white rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{msg.remetenteNome}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {msg.mensagem && <p className="text-gray-600">{msg.mensagem}</p>}
                        
                        {/* Mostrar anexo se existir */}
                        {msg.anexoUrl && (
                          <div className="mt-2">
                            {msg.anexoTipo?.startsWith('image/') ? (
                              <div className="relative group">
                                <img
                                  src={msg.anexoUrl}
                                  alt={msg.anexoNome || 'Imagem'}
                                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(msg.anexoUrl!, '_blank')}
                                />
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white"
                                    onClick={() => window.open(msg.anexoUrl!, '_blank')}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Abrir
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <a
                                href={msg.anexoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-xs"
                              >
                                <File className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {msg.anexoNome || 'Ficheiro'}
                                  </p>
                                  {msg.anexoTamanho && (
                                    <p className="text-xs text-gray-500">
                                      {(msg.anexoTamanho / 1024).toFixed(1)} KB
                                    </p>
                                  )}
                                </div>
                                <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Preview do anexo selecionado */}
                {chatAnexo.file && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      {chatAnexo.preview ? (
                        <img
                          src={chatAnexo.preview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                          <File className="w-8 h-8 text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{chatAnexo.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(chatAnexo.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeChatAnexo}
                        disabled={chatAnexo.uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {/* Input de ficheiro oculto */}
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleChatFileSelect}
                  />
                  
                  {/* Botão de anexar */}
                  <Button
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-50"
                    onClick={() => chatFileInputRef.current?.click()}
                    disabled={chatAnexo.uploading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    className="flex-1 border-amber-200"
                    disabled={chatAnexo.uploading}
                  />
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={handleSendChat}
                    disabled={(!chatMessage.trim() && !chatAnexo.file) || chatAnexo.uploading}
                  >
                    {chatAnexo.uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  Formatos aceites: Imagens, PDF, Word, Excel, TXT (máx. 10MB)
                </p>
              </div>
            </TabsContent>

            {/* Tab Timeline */}
            <TabsContent value="timeline">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Histórico</h2>

                {timeline?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum evento registrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />
                    <div className="space-y-6">
                      {timeline?.map((evento: any) => (
                        <div key={evento.id} className="relative pl-10">
                          <div className="absolute left-2 w-5 h-5 bg-amber-400 rounded-full border-4 border-white" />
                          <div className="bg-amber-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800">{evento.tipo}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(evento.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-gray-600">{evento.descricao}</p>
                            {evento.autorNome && (
                              <p className="text-sm text-amber-600 mt-1">Por: {evento.autorNome}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Configurar */}
            <TabsContent value="configurar">
              <div className="grid grid-cols-2 gap-6">
                {/* Categorias */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-amber-500" />
                      Categorias
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarCategorias(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {categorias?.map((cat) => {
                      const Icon = cat.icone ? getIconComponent(cat.icone) : Tag;
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: cat.cor || undefined }} />
                            <span>{cat.nome}</span>
                          </div>
                          {!cat.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deleteCategoria.mutate({ id: cat.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prioridades */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-amber-500" />
                      Prioridades
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarPrioridades(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {prioridades?.map((pri) => {
                      const Icon = pri.icone ? getIconComponent(pri.icone) : Flag;
                      return (
                        <div
                          key={pri.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: pri.cor || undefined }} />
                            <span>{pri.nome}</span>
                          </div>
                          {!pri.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deletePrioridade.mutate({ id: pri.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Circle className="w-5 h-5 text-amber-500" />
                      Status
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarStatus(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {statusList?.map((st) => {
                      const Icon = st.icone ? getIconComponent(st.icone) : Circle;
                      return (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: st.cor || undefined }} />
                            <span>{st.nome}</span>
                          </div>
                          {!st.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deleteStatus.mutate({ id: st.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Setores */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-500" />
                      Setores
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarSetores(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {setores?.map((setor) => (
                      <div
                        key={setor.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span>{setor.nome}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => deleteSetor.mutate({ id: setor.id })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Adicionar Categoria */}
        <Dialog open={showGerenciarCategorias} onOpenChange={setShowGerenciarCategorias}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  Nova Categoria
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novaCategoria.cor}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaCategoria.icone}
                  onValueChange={(v) => setNovaCategoria({ ...novaCategoria, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novaCategoria.nome) return;
                  createCategoria.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novaCategoria.nome,
                    cor: novaCategoria.cor,
                    icone: novaCategoria.icone,
                  });
                  setNovaCategoria({ nome: "", cor: "#EAB308", icone: "Tag" });
                  setShowGerenciarCategorias(false);
                }}
              >
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Prioridade */}
        <Dialog open={showGerenciarPrioridades} onOpenChange={setShowGerenciarPrioridades}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  Nova Prioridade
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novaPrioridade.nome}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaPrioridade.icone}
                  onValueChange={(v) => setNovaPrioridade({ ...novaPrioridade, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadeIconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min="1"
                  value={novaPrioridade.ordem}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, ordem: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novaPrioridade.nome) return;
                  createPrioridade.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novaPrioridade.nome,
                    cor: novaPrioridade.cor,
                    icone: novaPrioridade.icone,
                    
                  });
                  setNovaPrioridade({ nome: "", cor: "#EAB308", icone: "Minus", ordem: 1 });
                  setShowGerenciarPrioridades(false);
                }}
              >
                Criar Prioridade
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Status */}
        <Dialog open={showGerenciarStatus} onOpenChange={setShowGerenciarStatus}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-white" />
                  </div>
                  Novo Status
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoStatus.nome}
                  onChange={(e) => setNovoStatus({ ...novoStatus, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novoStatus.icone}
                  onValueChange={(v) => setNovoStatus({ ...novoStatus, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusIconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min="1"
                  value={novoStatus.ordem}
                  onChange={(e) => setNovoStatus({ ...novoStatus, ordem: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novoStatus.nome) return;
                  createStatus.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novoStatus.nome,
                    cor: novoStatus.cor,
                    icone: novoStatus.icone,
                    
                  });
                  setNovoStatus({ nome: "", cor: "#EAB308", icone: "Circle", ordem: 1 });
                  setShowGerenciarStatus(false);
                }}
              >
                Criar Status
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Setor */}
        <Dialog open={showGerenciarSetores} onOpenChange={setShowGerenciarSetores}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  Novo Setor
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoSetor.nome}
                  onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novoSetor.nome) return;
                  createSetor.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novoSetor.nome,
                  });
                  setNovoSetor({ nome: "" });
                  setShowGerenciarSetores(false);
                }}
              >
                Criar Setor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Material */}
        <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Material
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome do Material</Label>
                <Input
                  value={novoMaterial.nome}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={novoMaterial.quantidade}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, quantidade: parseInt(e.target.value) || 1 })}
                    className="mt-1 border-amber-200"
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select
                    value={novoMaterial.unidade}
                    onValueChange={(v) => setNovoMaterial({ ...novoMaterial, unidade: v })}
                  >
                    <SelectTrigger className="mt-1 border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="m">Metro</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                      <SelectItem value="l">Litro</SelectItem>
                      <SelectItem value="cx">Caixa</SelectItem>
                      <SelectItem value="pc">Peça</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={novoMaterial.emEstoque}
                    onCheckedChange={(checked) => setNovoMaterial({ ...novoMaterial, emEstoque: checked, precisaPedir: checked ? false : novoMaterial.precisaPedir })}
                  />
                  <Label>Em Estoque</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={novoMaterial.precisaPedir}
                    onCheckedChange={(checked) => setNovoMaterial({ ...novoMaterial, precisaPedir: checked, emEstoque: checked ? false : novoMaterial.emEstoque })}
                  />
                  <Label>Precisa Pedir</Label>
                </div>
              </div>
              <div>
                <Label>Observação</Label>
                <Textarea
                  value={novoMaterial.observacao}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, observacao: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoMaterial.nome) return;
                  addMaterial.mutate({
                    ordemServicoId: ordem.id,
                    nome: novoMaterial.nome,
                    quantidade: novoMaterial.quantidade,
                    unidade: novoMaterial.unidade,
                    emEstoque: novoMaterial.emEstoque,
                    precisaPedir: novoMaterial.precisaPedir,
                    pedidoDescricao: novoMaterial.observacao || undefined,
                  });
                  setNovoMaterial({ nome: "", quantidade: 1, unidade: "un", emEstoque: true, precisaPedir: false, observacao: "" });
                }}
              >
                Adicionar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Orçamento */}
        <Dialog open={showAddOrcamento} onOpenChange={setShowAddOrcamento}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Orçamento
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Descrição</Label>
                <Input
                  value={novoOrcamento.descricao}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, descricao: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novoOrcamento.valor}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, valor: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input
                  value={novoOrcamento.fornecedor}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, fornecedor: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoOrcamento.descricao || !novoOrcamento.valor) return;
                  addOrcamento.mutate({
                    ordemServicoId: ordem.id,
                    descricao: novoOrcamento.descricao,
                    valor: novoOrcamento.valor,
                    fornecedor: novoOrcamento.fornecedor || undefined,
                  });
                  setNovoOrcamento({ descricao: "", valor: "", fornecedor: "" });
                }}
              >
                Adicionar Orçamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Responsável */}
        <Dialog open={showAddResponsavel} onOpenChange={setShowAddResponsavel}>
          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Responsável
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoResponsavel.nome}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={novoResponsavel.cargo}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, cargo: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={novoResponsavel.telefone}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, telefone: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Setor</Label>
                <Select
                  value={novoResponsavel.setorId}
                  onValueChange={(v) => setNovoResponsavel({ ...novoResponsavel, setorId: v })}
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
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoResponsavel.nome) return;
                  addResponsavel.mutate({
                    ordemServicoId: ordem.id,
                    nome: novoResponsavel.nome,
                    cargo: novoResponsavel.cargo || undefined,
                    telefone: novoResponsavel.telefone || undefined,
                  });
                  setNovoResponsavel({ nome: "", cargo: "", telefone: "", setorId: "" });
                }}
              >
                Adicionar Responsável
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

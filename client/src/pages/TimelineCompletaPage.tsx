import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Send,
  Share2,
  Upload,
  X,
  Clock,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Trash2,
  MessageCircle,
  ThumbsUp,
  Heart,
  Check,
  HelpCircle,
  AlertCircleIcon,
  Reply,
  Edit2,
  MoreVertical,
  History,
  Eye,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

interface TimelineCompletaPageProps {
  condominioId: number;
}

// Componente de Comentário Individual
function ComentarioItem({
  comentario,
  onReply,
  onEdit,
  onDelete,
  onReact,
  currentUserId,
}: {
  comentario: any;
  onReply: (id: number) => void;
  onEdit: (comentario: any) => void;
  onDelete: (id: number) => void;
  onReact: (comentarioId: number, tipo: string) => void;
  currentUserId?: number;
}) {
  const isOwner = comentario.usuarioId === currentUserId;
  const reacaoTipos = [
    { tipo: "like", icon: ThumbsUp, label: "Curtir" },
    { tipo: "love", icon: Heart, label: "Amei" },
    { tipo: "check", icon: Check, label: "Confirmado" },
    { tipo: "question", icon: HelpCircle, label: "Dúvida" },
    { tipo: "alert", icon: AlertCircleIcon, label: "Atenção" },
  ];

  // Contar reações por tipo
  const reacoesPorTipo = reacaoTipos.map((r) => ({
    ...r,
    count: comentario.reacoes?.filter((re: any) => re.tipo === r.tipo).length || 0,
  }));

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      {/* Header do comentário */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comentario.autorAvatar} />
            <AvatarFallback className="bg-orange-100 text-orange-600">
              {comentario.autorNome?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{comentario.autorNome}</p>
            <p className="text-xs text-gray-500">
              {new Date(comentario.createdAt).toLocaleString("pt-BR")}
              {comentario.editado && (
                <span className="ml-2 text-gray-400">(editado)</span>
              )}
            </p>
          </div>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(comentario)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(comentario.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Conteúdo do comentário */}
      <p className="text-gray-700 whitespace-pre-wrap">{comentario.texto}</p>

      {/* Imagens do comentário */}
      {comentario.imagensUrls && comentario.imagensUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {comentario.imagensUrls.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={`Imagem ${idx + 1}`}
              className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
              onClick={() => window.open(url, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Reações e ações */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1">
          {reacoesPorTipo.map((r) => (
            <Button
              key={r.tipo}
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${r.count > 0 ? "text-orange-600" : "text-gray-500"}`}
              onClick={() => onReact(comentario.id, r.tipo)}
            >
              <r.icon className="h-4 w-4 mr-1" />
              {r.count > 0 && <span className="text-xs">{r.count}</span>}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500"
          onClick={() => onReply(comentario.id)}
        >
          <Reply className="h-4 w-4 mr-1" />
          Responder
        </Button>
      </div>
    </div>
  );
}

export default function TimelineCompletaPage({ condominioId }: TimelineCompletaPageProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const comentarioInputRef = useRef<HTMLTextAreaElement>(null);

  // Estados do formulário
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [localId, setLocalId] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("");
  const [prioridadeId, setPrioridadeId] = useState<string>("");
  const [tituloPredefId, setTituloPredefId] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<Array<{ url: string; legenda: string; file?: File }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Estados dos modais de adicionar
  const [showAddResponsavel, setShowAddResponsavel] = useState(false);
  const [showAddLocal, setShowAddLocal] = useState(false);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [showAddPrioridade, setShowAddPrioridade] = useState(false);
  const [showAddTitulo, setShowAddTitulo] = useState(false);
  const [showCompartilhar, setShowCompartilhar] = useState(false);

  // Estados dos formulários de adicionar
  const [novoResponsavel, setNovoResponsavel] = useState({ nome: "", cargo: "", email: "", telefone: "" });
  const [novoLocal, setNovoLocal] = useState({ nome: "", descricao: "" });
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#f97316", icone: "" });
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", cor: "#f97316", nivel: 1 });
  const [novoTitulo, setNovoTitulo] = useState({ titulo: "", descricaoPadrao: "" });

  // Timeline criada para compartilhar
  const [timelineCriada, setTimelineCriada] = useState<{ id: number; protocolo: string; tokenPublico: string } | null>(null);

  // Estados de comentários
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarioImagens, setComentarioImagens] = useState<string[]>([]);
  const [comentarioPaiId, setComentarioPaiId] = useState<number | null>(null);
  const [editandoComentario, setEditandoComentario] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("formulario");

  // Queries para listas
  const { data: responsaveis = [] } = trpc.timeline.listarResponsaveis.useQuery({ condominioId });
  const { data: locais = [] } = trpc.timeline.listarLocais.useQuery({ condominioId });
  const { data: statusList = [] } = trpc.timeline.listarStatus.useQuery({ condominioId });
  const { data: prioridades = [] } = trpc.timeline.listarPrioridades.useQuery({ condominioId });
  const { data: titulos = [] } = trpc.timeline.listarTitulos.useQuery({ condominioId });
  const { data: membrosEquipe = [] } = trpc.membroEquipe.list.useQuery({ condominioId });

  // Query de comentários (só quando timeline criada)
  const { data: comentariosData, refetch: refetchComentarios } = trpc.timeline.listarComentarios.useQuery(
    { timelineId: timelineCriada?.id || 0 },
    { enabled: !!timelineCriada?.id }
  );

  // Mutations para criar configurações
  const criarResponsavelMutation = trpc.timeline.criarResponsavel.useMutation({
    onSuccess: () => {
      utils.timeline.listarResponsaveis.invalidate();
      setShowAddResponsavel(false);
      setNovoResponsavel({ nome: "", cargo: "", email: "", telefone: "" });
      toast.success("Responsável adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarLocalMutation = trpc.timeline.criarLocal.useMutation({
    onSuccess: () => {
      utils.timeline.listarLocais.invalidate();
      setShowAddLocal(false);
      setNovoLocal({ nome: "", descricao: "" });
      toast.success("Local adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarStatusMutation = trpc.timeline.criarStatus.useMutation({
    onSuccess: () => {
      utils.timeline.listarStatus.invalidate();
      setShowAddStatus(false);
      setNovoStatus({ nome: "", cor: "#f97316", icone: "" });
      toast.success("Status adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarPrioridadeMutation = trpc.timeline.criarPrioridade.useMutation({
    onSuccess: () => {
      utils.timeline.listarPrioridades.invalidate();
      setShowAddPrioridade(false);
      setNovaPrioridade({ nome: "", cor: "#f97316", nivel: 1 });
      toast.success("Prioridade adicionada com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarTituloMutation = trpc.timeline.criarTitulo.useMutation({
    onSuccess: () => {
      utils.timeline.listarTitulos.invalidate();
      setShowAddTitulo(false);
      setNovoTitulo({ titulo: "", descricaoPadrao: "" });
      toast.success("Título adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para criar timeline
  const criarTimelineMutation = trpc.timeline.criar.useMutation({
    onSuccess: (data) => {
      setTimelineCriada(data);
      setActiveTab("comentarios");
      toast.success(`Timeline criada! Protocolo: ${data.protocolo}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para compartilhar
  const compartilharMutation = trpc.timeline.compartilhar.useMutation({
    onSuccess: () => {
      toast.success("Timeline compartilhada com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutations de comentários
  const criarComentarioMutation = trpc.timeline.criarComentario.useMutation({
    onSuccess: () => {
      setNovoComentario("");
      setComentarioImagens([]);
      setComentarioPaiId(null);
      refetchComentarios();
      toast.success("Comentário adicionado!");
    },
    onError: (error) => toast.error(error.message),
  });

  const editarComentarioMutation = trpc.timeline.editarComentario.useMutation({
    onSuccess: () => {
      setEditandoComentario(null);
      setNovoComentario("");
      refetchComentarios();
      toast.success("Comentário editado!");
    },
    onError: (error) => toast.error(error.message),
  });

  const excluirComentarioMutation = trpc.timeline.excluirComentario.useMutation({
    onSuccess: () => {
      refetchComentarios();
      toast.success("Comentário excluído!");
    },
    onError: (error) => toast.error(error.message),
  });

  const adicionarReacaoMutation = trpc.timeline.adicionarReacao.useMutation({
    onSuccess: () => {
      refetchComentarios();
    },
    onError: (error) => toast.error(error.message),
  });

  // Atualizar título quando selecionar título predefinido
  useEffect(() => {
    if (tituloPredefId) {
      const tituloSelecionado = titulos.find(t => t.id === Number(tituloPredefId));
      if (tituloSelecionado) {
        setTitulo(tituloSelecionado.titulo);
        if (tituloSelecionado.descricaoPadrao) {
          setDescricao(tituloSelecionado.descricaoPadrao);
        }
      }
    }
  }, [tituloPredefId, titulos]);

  // Upload de imagens
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const newImages: Array<{ url: string; legenda: string }> = [];
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 10MB`);
          continue;
        }

        let fileToUpload: Blob = file;
        if (file.size > 2 * 1024 * 1024) {
          fileToUpload = await compressImage(file);
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });
        
        newImages.push({ url: base64, legenda: "" });
      }

      setImagens([...imagens, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) carregada(s)`);
    } catch (error) {
      toast.error("Erro ao carregar imagens");
    } finally {
      setUploadingImages(false);
    }
  };

  // Comprimir imagem
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 1920;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index));
  };

  // Salvar rascunho
  const handleSalvarRascunho = async () => {
    if (!responsavelId || !titulo.trim()) {
      toast.error("Responsável e Título são obrigatórios");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: Number(responsavelId),
      titulo: titulo.trim(),
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      descricao: descricao.trim() || undefined,
      estado: "rascunho",
      imagens: imagens.map(img => ({ url: img.url, legenda: img.legenda })),
    });
  };

  // Enviar timeline
  const handleEnviar = async () => {
    if (!responsavelId || !titulo.trim()) {
      toast.error("Responsável e Título são obrigatórios");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: Number(responsavelId),
      titulo: titulo.trim(),
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      descricao: descricao.trim() || undefined,
      estado: "enviado",
      imagens: imagens.map(img => ({ url: img.url, legenda: img.legenda })),
    });
  };

  // Compartilhar com equipe
  const handleCompartilhar = () => {
    if (!timelineCriada) {
      handleEnviar();
    }
    setShowCompartilhar(true);
  };

  // Enviar compartilhamento
  const handleEnviarCompartilhamento = async (membro: any, canal: "email" | "whatsapp" | "ambos") => {
    if (!timelineCriada) return;

    if (canal === "whatsapp" || canal === "ambos") {
      const linkVisualizacao = `${window.location.origin}/timeline/${timelineCriada.tokenPublico}`;
      const mensagem = encodeURIComponent(
        `*Timeline Compartilhada*\n\n` +
        `Protocolo: ${timelineCriada.protocolo}\n` +
        `Título: ${titulo}\n\n` +
        `Visualize em: ${linkVisualizacao}`
      );
      const telefone = membro.telefone?.replace(/\D/g, "") || "";
      window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
    }

    if (canal === "email" || canal === "ambos") {
      compartilharMutation.mutate({
        timelineId: timelineCriada.id,
        membroEquipeId: membro.id,
        membroNome: membro.nome,
        membroEmail: membro.email,
        membroTelefone: membro.telefone,
        canalEnvio: canal,
      });
    }
  };

  // Handlers de comentários
  const handleEnviarComentario = () => {
    if (!timelineCriada?.id || !novoComentario.trim()) {
      toast.error("Digite um comentário");
      return;
    }

    if (editandoComentario) {
      editarComentarioMutation.mutate({
        id: editandoComentario.id,
        texto: novoComentario.trim(),
        imagensUrls: comentarioImagens,
      });
    } else {
      criarComentarioMutation.mutate({
        timelineId: timelineCriada.id,
        texto: novoComentario.trim(),
        imagensUrls: comentarioImagens.length > 0 ? comentarioImagens : undefined,
        comentarioPaiId: comentarioPaiId || undefined,
      });
    }
  };

  const handleResponderComentario = (comentarioId: number) => {
    setComentarioPaiId(comentarioId);
    comentarioInputRef.current?.focus();
  };

  const handleEditarComentario = (comentario: any) => {
    setEditandoComentario(comentario);
    setNovoComentario(comentario.texto);
    setComentarioImagens(comentario.imagensUrls || []);
    comentarioInputRef.current?.focus();
  };

  const handleExcluirComentario = (comentarioId: number) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      excluirComentarioMutation.mutate({ id: comentarioId });
    }
  };

  const handleReagirComentario = (comentarioId: number, tipo: string) => {
    adicionarReacaoMutation.mutate({
      comentarioId,
      tipo: tipo as any,
    });
  };

  // Limpar formulário
  const handleLimpar = () => {
    setResponsavelId("");
    setLocalId("");
    setStatusId("");
    setPrioridadeId("");
    setTituloPredefId("");
    setTitulo("");
    setDescricao("");
    setImagens([]);
    setTimelineCriada(null);
    setActiveTab("formulario");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timeline Completa</h1>
            <p className="text-gray-500 mt-1">Registre atividades com comentários da equipe</p>
          </div>
        </div>
        {timelineCriada && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Protocolo: {timelineCriada.protocolo}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="formulario" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="comentarios" className="flex items-center gap-2" disabled={!timelineCriada}>
            <MessageCircle className="w-4 h-4" />
            Comentários
            {comentariosData?.total ? (
              <Badge variant="secondary" className="ml-1">{comentariosData.total}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2" disabled={!timelineCriada}>
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab Formulário */}
        <TabsContent value="formulario">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dados da Timeline Completa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Responsável (obrigatório) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Responsável <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select value={responsavelId} onValueChange={setResponsavelId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.nome} {r.cargo && `(${r.cargo})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddResponsavel(true)}
                    className="border-blue-200 text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Local/Item */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Local/Item
                </Label>
                <div className="flex gap-2">
                  <Select value={localId} onValueChange={setLocalId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {locais.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddLocal(true)}
                    className="border-blue-200 text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Status
                </Label>
                <div className="flex gap-2">
                  <Select value={statusId} onValueChange={setStatusId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: s.cor || "#3b82f6" }}
                            />
                            {s.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddStatus(true)}
                    className="border-blue-200 text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-500" />
                  Prioridade
                </Label>
                <div className="flex gap-2">
                  <Select value={prioridadeId} onValueChange={setPrioridadeId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: p.cor || "#3b82f6" }}
                            />
                            {p.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddPrioridade(true)}
                    className="border-blue-200 text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Título (obrigatório) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Título <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select value={tituloPredefId} onValueChange={setTituloPredefId}>
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder="Título predefinido" />
                    </SelectTrigger>
                    <SelectContent>
                      {titulos.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Digite o título"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddTitulo(true)}
                    className="border-blue-200 text-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Imagens */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  Imagens
                </Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-completa"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload-completa"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    {uploadingImages ? (
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Clique para adicionar imagens
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Máximo 100MB por arquivo
                        </span>
                      </>
                    )}
                  </label>
                  
                  {imagens.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {imagens.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva os detalhes da atividade..."
                  rows={4}
                />
              </div>

              {/* Informações automáticas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Informações registadas automaticamente:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Data:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Hora:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleTimeString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Criado por:</span>
                    <span className="ml-2 font-medium">{user?.name || "Sistema"}</span>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleSalvarRascunho}
                  disabled={criarTimelineMutation.isPending}
                  className="flex-1 min-w-[150px]"
                >
                  {criarTimelineMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar e Continuar Depois
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCompartilhar}
                  disabled={criarTimelineMutation.isPending}
                  className="flex-1 min-w-[150px] border-green-200 text-green-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar com Equipe
                </Button>
                
                <Button
                  onClick={handleEnviar}
                  disabled={criarTimelineMutation.isPending}
                  className="flex-1 min-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  {criarTimelineMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar
                </Button>
              </div>

              {/* Link da Timeline criada */}
              {timelineCriada && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-green-800 mb-2">Timeline Criada com Sucesso!</h4>
                  <p className="text-sm text-green-600 mb-3">
                    Protocolo: <strong>{timelineCriada.protocolo}</strong>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/timeline/${timelineCriada.tokenPublico}`, "_blank")}
                      className="border-green-300 text-green-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar Timeline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("comentarios")}
                      className="border-blue-300 text-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Adicionar Comentários
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLimpar}
                      className="border-gray-300"
                    >
                      Nova Timeline
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comentários */}
        <TabsContent value="comentarios">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comentários da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Área de novo comentário */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                {comentarioPaiId && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-blue-600">
                    <Reply className="w-4 h-4" />
                    Respondendo a um comentário
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setComentarioPaiId(null)}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {editandoComentario && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-amber-600">
                    <Edit2 className="w-4 h-4" />
                    Editando comentário
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditandoComentario(null);
                        setNovoComentario("");
                      }}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      ref={comentarioInputRef}
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      placeholder="Adicione um comentário..."
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Anexar imagem
                      </Button>
                      <Button
                        onClick={handleEnviarComentario}
                        disabled={!novoComentario.trim() || criarComentarioMutation.isPending}
                        className="bg-blue-600"
                      >
                        {criarComentarioMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            {editandoComentario ? "Salvar" : "Comentar"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de comentários */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {comentariosData?.comentarios && comentariosData.comentarios.length > 0 ? (
                    comentariosData.comentarios.map((comentario: any) => (
                      <ComentarioItem
                        key={comentario.id}
                        comentario={comentario}
                        onReply={handleResponderComentario}
                        onEdit={handleEditarComentario}
                        onDelete={handleExcluirComentario}
                        onReact={handleReagirComentario}
                        currentUserId={user?.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum comentário ainda</p>
                      <p className="text-sm">Seja o primeiro a comentar!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Histórico */}
        <TabsContent value="historico">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de atividades</p>
                <p className="text-sm">Todas as alterações serão registradas aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Adicionar Responsável */}
      <Dialog open={showAddResponsavel} onOpenChange={setShowAddResponsavel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>
              Cadastre um novo responsável para as timelines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoResponsavel.nome}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input
                value={novoResponsavel.cargo}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, cargo: e.target.value })}
                placeholder="Ex: Zelador, Síndico"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={novoResponsavel.email}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={novoResponsavel.telefone}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddResponsavel(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarResponsavelMutation.mutate({ condominioId, ...novoResponsavel })}
              disabled={!novoResponsavel.nome || criarResponsavelMutation.isPending}
              className="bg-blue-600"
            >
              {criarResponsavelMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Local */}
      <Dialog open={showAddLocal} onOpenChange={setShowAddLocal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Local/Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoLocal.nome}
                onChange={(e) => setNovoLocal({ ...novoLocal, nome: e.target.value })}
                placeholder="Ex: Hall de Entrada, Piscina"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novoLocal.descricao}
                onChange={(e) => setNovoLocal({ ...novoLocal, descricao: e.target.value })}
                placeholder="Descrição do local"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLocal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarLocalMutation.mutate({ condominioId, ...novoLocal })}
              disabled={!novoLocal.nome || criarLocalMutation.isPending}
              className="bg-blue-600"
            >
              {criarLocalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Status */}
      <Dialog open={showAddStatus} onOpenChange={setShowAddStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoStatus.nome}
                onChange={(e) => setNovoStatus({ ...novoStatus, nome: e.target.value })}
                placeholder="Ex: Em Andamento, Concluído"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStatus(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarStatusMutation.mutate({ condominioId, ...novoStatus })}
              disabled={!novoStatus.nome || criarStatusMutation.isPending}
              className="bg-blue-600"
            >
              {criarStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Prioridade */}
      <Dialog open={showAddPrioridade} onOpenChange={setShowAddPrioridade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Prioridade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novaPrioridade.nome}
                onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nome: e.target.value })}
                placeholder="Ex: Urgente, Normal, Baixa"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div>
              <Label>Nível (1 = mais urgente)</Label>
              <Input
                type="number"
                min={1}
                value={novaPrioridade.nivel}
                onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nivel: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPrioridade(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarPrioridadeMutation.mutate({ condominioId, ...novaPrioridade })}
              disabled={!novaPrioridade.nome || criarPrioridadeMutation.isPending}
              className="bg-blue-600"
            >
              {criarPrioridadeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Título */}
      <Dialog open={showAddTitulo} onOpenChange={setShowAddTitulo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Título Predefinido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={novoTitulo.titulo}
                onChange={(e) => setNovoTitulo({ ...novoTitulo, titulo: e.target.value })}
                placeholder="Ex: Manutenção Preventiva, Limpeza"
              />
            </div>
            <div>
              <Label>Descrição Padrão</Label>
              <Textarea
                value={novoTitulo.descricaoPadrao}
                onChange={(e) => setNovoTitulo({ ...novoTitulo, descricaoPadrao: e.target.value })}
                placeholder="Descrição que será preenchida automaticamente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTitulo(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarTituloMutation.mutate({ condominioId, ...novoTitulo })}
              disabled={!novoTitulo.titulo || criarTituloMutation.isPending}
              className="bg-blue-600"
            >
              {criarTituloMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Compartilhar com Equipe */}
      <Dialog open={showCompartilhar} onOpenChange={setShowCompartilhar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compartilhar com Equipe</DialogTitle>
            <DialogDescription>
              Selecione os membros da equipe para compartilhar esta timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {membrosEquipe.filter((m: any) => m.email || m.telefone).map((membro: any) => (
              <div
                key={membro.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{membro.nome}</p>
                  <p className="text-sm text-gray-500">
                    {membro.email && <span>{membro.email}</span>}
                    {membro.email && membro.telefone && <span> • </span>}
                    {membro.telefone && <span>{membro.telefone}</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  {membro.telefone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnviarCompartilhamento(membro, "whatsapp")}
                      className="border-green-200 text-green-600"
                    >
                      WhatsApp
                    </Button>
                  )}
                  {membro.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnviarCompartilhamento(membro, "email")}
                      className="border-blue-200 text-blue-600"
                    >
                      Email
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {membrosEquipe.filter((m: any) => m.email || m.telefone).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum membro da equipe com email ou telefone cadastrado
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompartilhar(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

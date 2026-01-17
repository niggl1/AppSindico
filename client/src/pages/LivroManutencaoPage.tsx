import { useState, useEffect } from "react";
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
} from "lucide-react";


interface LivroManutencaoPageProps {
  condominioId: number;
}

export default function LivroManutencaoPage({ condominioId }: LivroManutencaoPageProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

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

  // Queries para listas
  const { data: responsaveis = [] } = trpc.timelineLivro.listarResponsaveis.useQuery({ condominioId });
  const { data: locais = [] } = trpc.timelineLivro.listarLocais.useQuery({ condominioId });
  const { data: statusList = [] } = trpc.timelineLivro.listarStatus.useQuery({ condominioId });
  const { data: prioridades = [] } = trpc.timelineLivro.listarPrioridades.useQuery({ condominioId });
  const { data: titulos = [] } = trpc.timelineLivro.listarTitulos.useQuery({ condominioId });
  const { data: membrosEquipe = [] } = trpc.membroEquipe.list.useQuery({ condominioId });

  // Mutations para criar configurações
  const criarResponsavelMutation = trpc.timelineLivro.criarResponsavel.useMutation({
    onSuccess: () => {
      utils.timelineLivro.listarResponsaveis.invalidate();
      setShowAddResponsavel(false);
      setNovoResponsavel({ nome: "", cargo: "", email: "", telefone: "" });
      toast.success("Responsável adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarLocalMutation = trpc.timelineLivro.criarLocal.useMutation({
    onSuccess: () => {
      utils.timelineLivro.listarLocais.invalidate();
      setShowAddLocal(false);
      setNovoLocal({ nome: "", descricao: "" });
      toast.success("Local adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarStatusMutation = trpc.timelineLivro.criarStatus.useMutation({
    onSuccess: () => {
      utils.timelineLivro.listarStatus.invalidate();
      setShowAddStatus(false);
      setNovoStatus({ nome: "", cor: "#f97316", icone: "" });
      toast.success("Status adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarPrioridadeMutation = trpc.timelineLivro.criarPrioridade.useMutation({
    onSuccess: () => {
      utils.timelineLivro.listarPrioridades.invalidate();
      setShowAddPrioridade(false);
      setNovaPrioridade({ nome: "", cor: "#f97316", nivel: 1 });
      toast.success("Prioridade adicionada com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarTituloMutation = trpc.timelineLivro.criarTitulo.useMutation({
    onSuccess: () => {
      utils.timelineLivro.listarTitulos.invalidate();
      setShowAddTitulo(false);
      setNovoTitulo({ titulo: "", descricaoPadrao: "" });
      toast.success("Título adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para criar timeline
  const criarTimelineMutation = trpc.timelineLivro.criar.useMutation({
    onSuccess: (data) => {
      setTimelineCriada(data);
      toast.success(`Timeline criada! Protocolo: ${data.protocolo}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para compartilhar
  const compartilharMutation = trpc.timelineLivro.compartilhar.useMutation({
    onSuccess: () => {
      toast.success("Timeline compartilhada com sucesso!");
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
        // Verificar se é imagem
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Verificar tamanho (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 10MB`);
          continue;
        }

        // Comprimir se necessário
        let fileToUpload: Blob = file;
        if (file.size > 2 * 1024 * 1024) {
          fileToUpload = await compressImage(file);
        }

        // Converter para base64
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
      // Primeiro criar a timeline
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Timeline</h1>
          <p className="text-gray-500 mt-1">Registre atividades e eventos de manutenção</p>
        </div>
        {timelineCriada && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Protocolo: {timelineCriada.protocolo}
          </Badge>
        )}
      </div>

      {/* Formulário */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dados da Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Responsável (obrigatório) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
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
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Local/Item */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
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
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
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
                          style={{ backgroundColor: s.cor || "#f97316" }}
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
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
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
                          style={{ backgroundColor: p.cor || "#f97316" }}
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
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Título (obrigatório) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
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
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              Imagens
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-4"
              >
                {uploadingImages ? (
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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
              className="flex-1 min-w-[150px] border-blue-200 text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar com Equipe
            </Button>
            
            <Button
              onClick={handleEnviar}
              disabled={criarTimelineMutation.isPending}
              className="flex-1 min-w-[150px] bg-gradient-to-r from-orange-500 to-orange-600 text-white"
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
                  Visualizar Timeline
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
              className="bg-orange-500"
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
              className="bg-orange-500"
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
                  placeholder="#f97316"
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
              className="bg-orange-500"
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
                  placeholder="#f97316"
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
              className="bg-orange-500"
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
              className="bg-orange-500"
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

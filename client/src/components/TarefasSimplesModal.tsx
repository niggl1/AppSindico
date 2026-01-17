import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Send, 
  Camera, 
  MapPin, 
  FileText, 
  X, 
  Loader2,
  CheckCircle2,
  ClipboardList,
  Wrench,
  AlertTriangle,
  ArrowLeftRight,
  Image as ImageIcon,
  Tag,
  Star,
  History,
  Trash2,
  ListChecks,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { MapView } from "@/components/Map";

type TipoTarefa = "vistoria" | "manutencao" | "ocorrencia" | "antes_depois" | "checklist";

interface ItemChecklist {
  id: string;
  titulo: string;
  concluido: boolean;
  temProblema: boolean;
  problema?: {
    titulo: string;
    descricao: string;
    imagens: string[];
  };
}
type TipoCampo = "titulo" | "descricao" | "local" | "observacao";

interface TarefasSimplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominioId: number;
  tipoInicial?: TipoTarefa;
  onSuccess?: () => void;
}

const tipoConfig = {
  vistoria: {
    label: "Vistoria Rápida",
    icon: ClipboardList,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  manutencao: {
    label: "Manutenção Rápida",
    icon: Wrench,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  ocorrencia: {
    label: "Ocorrência Rápida",
    icon: AlertTriangle,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  antes_depois: {
    label: "Antes e Depois Rápido",
    icon: ArrowLeftRight,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  checklist: {
    label: "Checklist Rápido",
    icon: ListChecks,
    cor: "#8B5CF6",
    corClara: "#F5F3FF",
  },
};

// Componente para botão de salvar/selecionar template
interface TemplateSelectorProps {
  condominioId: number;
  tipoCampo: TipoCampo;
  tipoTarefa: TipoTarefa;
  valorAtual: string;
  onSelect: (valor: string) => void;
}

function TemplateSelector({ condominioId, tipoCampo, tipoTarefa, valorAtual, onSelect }: TemplateSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const utils = trpc.useUtils();

  // Buscar templates salvos - ignorar checklist pois não usa templates
  const tipoTarefaParaTemplate = tipoTarefa === "checklist" ? undefined : tipoTarefa;
  const { data: templates, isLoading } = trpc.camposRapidosTemplates.listar.useQuery(
    { condominioId, tipoCampo, tipoTarefa: tipoTarefaParaTemplate },
    { enabled: popoverOpen && condominioId > 0 }
  );

  // Mutations
  const criarTemplateMutation = trpc.camposRapidosTemplates.criar.useMutation({
    onSuccess: () => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
      toast.success("Valor salvo para reutilização!");
    },
    onError: () => {
      toast.error("Erro ao salvar valor");
    }
  });

  const usarTemplateMutation = trpc.camposRapidosTemplates.usar.useMutation();
  
  const toggleFavoritoMutation = trpc.camposRapidosTemplates.toggleFavorito.useMutation({
    onSuccess: () => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
    }
  });

  const deletarTemplateMutation = trpc.camposRapidosTemplates.deletar.useMutation({
    onSuccess: () => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
      toast.success("Template removido");
    }
  });

  const handleSalvarAtual = () => {
    if (!valorAtual.trim()) {
      toast.error("Digite um valor antes de salvar");
      return;
    }
    criarTemplateMutation.mutate({
      condominioId,
      tipoCampo,
      tipoTarefa: tipoTarefaParaTemplate,
      valor: valorAtual.trim(),
    });
  };

  const handleSelectTemplate = (template: { id: number; valor: string }) => {
    onSelect(template.valor);
    usarTemplateMutation.mutate({ id: template.id });
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
          title="Salvar ou selecionar valor frequente"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b bg-orange-50">
          <h4 className="font-semibold text-sm text-orange-800 flex items-center gap-2">
            <History className="h-4 w-4" />
            Valores Salvos
          </h4>
          <p className="text-xs text-orange-600 mt-1">
            Selecione um valor salvo ou salve o atual
          </p>
        </div>

        {/* Botão para salvar valor atual */}
        {valorAtual.trim() && (
          <div className="p-2 border-b">
            <Button
              onClick={handleSalvarAtual}
              disabled={criarTemplateMutation.isPending}
              className="w-full h-8 text-xs bg-orange-500 hover:bg-orange-600"
            >
              {criarTemplateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Salvar "{valorAtual.substring(0, 30)}{valorAtual.length > 30 ? '...' : ''}"
            </Button>
          </div>
        )}

        {/* Lista de templates */}
        <div className="max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="p-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded group"
                >
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="flex-1 text-left text-sm text-gray-700 truncate hover:text-orange-600"
                  >
                    {template.valor}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavoritoMutation.mutate({ id: template.id })}
                      className={`p-1 rounded ${template.favorito ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      title={template.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
                    >
                      <Star className="h-3 w-3" fill={template.favorito ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => deletarTemplateMutation.mutate({ id: template.id })}
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                      title="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {template.vezesUsado && template.vezesUsado > 1 && (
                    <span className="text-xs text-gray-400 ml-1">
                      {template.vezesUsado}x
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhum valor salvo ainda.
              <br />
              <span className="text-xs">Digite um valor e clique em "Salvar"</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TarefasSimplesModal({
  open,
  onOpenChange,
  condominioId,
  tipoInicial = "vistoria",
  onSuccess,
}: TarefasSimplesModalProps) {
  const [tipo, setTipo] = useState<TipoTarefa>(tipoInicial);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [statusPersonalizado, setStatusPersonalizado] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [localizacao, setLocalizacao] = useState<{ lat: string; lng: string; endereco: string } | null>(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para checklist
  const [itensChecklist, setItensChecklist] = useState<ItemChecklist[]>([]);
  const [novoItemChecklist, setNovoItemChecklist] = useState("");

  const utils = trpc.useUtils();

  // Buscar status personalizados
  const { data: statusList } = trpc.statusPersonalizados.listar.useQuery(
    { condominioId },
    { enabled: open && condominioId > 0 }
  );

  // Contar rascunhos pendentes
  const { data: rascunhosCount } = trpc.tarefasSimples.contarRascunhos.useQuery(
    { condominioId, tipo: tipo as any },
    { enabled: open && condominioId > 0 }
  );

  // Mutations
  const gerarProtocoloMutation = trpc.tarefasSimples.gerarProtocolo.useMutation();
  const criarTarefaMutation = trpc.tarefasSimples.criar.useMutation();
  const criarStatusMutation = trpc.statusPersonalizados.criar.useMutation();
  const enviarTodasMutation = trpc.tarefasSimples.enviarTodas.useMutation();

  // Gerar protocolo ao abrir modal ou mudar tipo
  useEffect(() => {
    if (open) {
      gerarNovoProtocolo();
      capturarLocalizacao();
    }
  }, [open, tipo]);

  const gerarNovoProtocolo = async () => {
    try {
      const result = await gerarProtocoloMutation.mutateAsync({ tipo: tipo as any });
      setProtocolo(result.protocolo);
    } catch (error) {
      console.error("Erro ao gerar protocolo:", error);
      // Gerar protocolo localmente como fallback
      const prefixos: Record<TipoTarefa, string> = {
        vistoria: "VIS",
        manutencao: "MAN",
        ocorrencia: "OCO",
        antes_depois: "A/D",
        checklist: "CHK",
      };
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T]/g, '').substring(2, 14);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      setProtocolo(`${prefixos[tipo]}-${timestamp}-${random}`);
    }
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocalização não suportada");
      return;
    }

    setCarregandoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        // Tentar obter endereço via API de geocoding reverso
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          setLocalizacao({
            lat,
            lng,
            endereco: data.display_name || `${lat}, ${lng}`,
          });
        } catch {
          setLocalizacao({ lat, lng, endereco: `${lat}, ${lng}` });
        }
        setCarregandoLocalizacao(false);
      },
      (error) => {
        console.warn("Erro ao obter localização:", error);
        setCarregandoLocalizacao(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagens((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removerImagem = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const criarNovoStatus = async () => {
    if (!novoStatus.trim()) return;
    
    try {
      await criarStatusMutation.mutateAsync({
        condominioId,
        nome: novoStatus.trim(),
      });
      setStatusPersonalizado(novoStatus.trim());
      setNovoStatus("");
      utils.statusPersonalizados.listar.invalidate({ condominioId });
      toast.success("Status criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar status");
    }
  };

  const salvarEReiniciar = async () => {
    setSalvando(true);
    try {
      await criarTarefaMutation.mutateAsync({
        condominioId,
        tipo: tipo as any,
        protocolo,
        titulo: titulo || undefined,
        descricao: descricao || undefined,
        local: local || undefined,
        imagens: imagens.length > 0 ? imagens : undefined,
        latitude: localizacao?.lat,
        longitude: localizacao?.lng,
        endereco: localizacao?.endereco,
        statusPersonalizado: statusPersonalizado || undefined,
        itensChecklist: tipo === "checklist" && itensChecklist.length > 0 ? itensChecklist : undefined,
      });

      toast.success("Registro salvo! Adicione outro.", {
        description: `Protocolo: ${protocolo}`,
      });

      // Limpar campos para novo registro
      setTitulo("");
      setDescricao("");
      setLocal("");
      setImagens([]);
      setStatusPersonalizado("");
      setItensChecklist([]);
      setNovoItemChecklist("");
      await gerarNovoProtocolo();
      
      utils.tarefasSimples.contarRascunhos.invalidate({ condominioId });
    } catch (error) {
      toast.error("Erro ao salvar registro");
    } finally {
      setSalvando(false);
    }
  };

  const enviarTodos = async () => {
    // Primeiro salvar o atual se tiver dados
    if (titulo || descricao || imagens.length > 0) {
      await salvarEReiniciar();
    }

    setEnviando(true);
    try {
      await enviarTodasMutation.mutateAsync({
        condominioId,
        tipo: tipo as any,
      });

      toast.success("Todos os registros foram enviados!", {
        description: "Os rascunhos foram enviados com sucesso.",
      });

      utils.tarefasSimples.listar.invalidate({ condominioId });
      utils.tarefasSimples.contarRascunhos.invalidate({ condominioId });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao enviar registros");
    } finally {
      setEnviando(false);
    }
  };

  const config = tipoConfig[tipo];
  const IconeTipo = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md max-h-[92vh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl">
        {/* Header Premium Laranja */}
        <div 
          className="p-4 rounded-t-lg"
          style={{ 
            background: `linear-gradient(135deg, ${config.cor} 0%, #EA580C 100%)`,
          }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <IconeTipo className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    {config.label}
                  </DialogTitle>
                  <p className="text-white/80 text-sm mt-1">
                    Registro rápido e simples
                  </p>
                </div>
              </div>
              {(rascunhosCount?.count ?? 0) > 0 && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  {rascunhosCount?.count} pendente{(rascunhosCount?.count ?? 0) > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Seletor de Tipo */}
          <div className="flex gap-2 mt-4">
            {(Object.keys(tipoConfig) as TipoTarefa[]).map((t) => {
              const Icon = tipoConfig[t].icon;
              const isActive = t === tipo;
              return (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-orange-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-4 space-y-4 bg-white">
          {/* Protocolo */}
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700 font-medium">
              Protocolo: {protocolo || "Gerando..."}
            </span>
          </div>

          {/* Título com botão + */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-500" />
                Título (opcional)
              </Label>
              <TemplateSelector
                condominioId={condominioId}
                tipoCampo="titulo"
                tipoTarefa={tipo}
                valorAtual={titulo}
                onSelect={setTitulo}
              />
            </div>
            <Input
              placeholder="Digite um título ou deixe em branco..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* Local com botão + */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Local (opcional)
              </Label>
              <TemplateSelector
                condominioId={condominioId}
                tipoCampo="local"
                tipoTarefa={tipo}
                valorAtual={local}
                onSelect={setLocal}
              />
            </div>
            <Input
              placeholder="Ex: Bloco A, Apartamento 101, Garagem..."
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* Imagens */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-orange-500" />
              Imagens (opcional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {imagens.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Imagem ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200"
                  />
                  <button
                    onClick={() => removerImagem(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center text-orange-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs mt-1">Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              Localização (automática)
            </Label>
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {carregandoLocalizacao ? (
                <div className="flex items-center gap-2 text-gray-500 p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Obtendo localização...</span>
                </div>
              ) : localizacao ? (
                <div className="space-y-2">
                  {/* Mapa Miniatura */}
                  <div className="w-full h-24 rounded-lg overflow-hidden">
                    <MapView
                      className="w-full h-full"
                      initialCenter={{ 
                        lat: parseFloat(localizacao.lat), 
                        lng: parseFloat(localizacao.lng) 
                      }}
                      initialZoom={16}
                      onMapReady={(map) => {
                        // Adicionar marcador na localização
                        new google.maps.marker.AdvancedMarkerElement({
                          map,
                          position: { 
                            lat: parseFloat(localizacao.lat), 
                            lng: parseFloat(localizacao.lng) 
                          },
                          title: "Localização atual",
                        });
                      }}
                    />
                  </div>
                  {/* Info da localização */}
                  <div className="text-sm text-gray-600 min-w-0 px-1">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium text-xs">Localização capturada</span>
                    </div>
                    <p className="text-xs text-gray-500 break-words line-clamp-2">{localizacao.endereco}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={capturarLocalizacao}
                  className="text-sm text-orange-600 hover:text-orange-700 p-2"
                >
                  Clique para capturar localização
                </button>
              )}
            </div>
          </div>

          {/* Status Personalizado */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Status (opcional)</Label>
            <Select value={statusPersonalizado} onValueChange={setStatusPersonalizado}>
              <SelectTrigger className="border-gray-200 focus:border-orange-400 focus:ring-orange-400">
                <SelectValue placeholder="Selecione ou crie um status..." />
              </SelectTrigger>
              <SelectContent>
                {statusList?.map((status) => (
                  <SelectItem key={status.id} value={status.nome}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.cor || "#F97316" }}
                      />
                      {status.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Criar novo status..."
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
                className="flex-1 text-sm border-gray-200"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={criarNovoStatus}
                disabled={!novoStatus.trim()}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Interface de Checklist - Só aparece quando tipo é checklist */}
          {tipo === "checklist" && (
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-purple-500" />
                Itens do Checklist
              </Label>
              
              {/* Lista de itens */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {itensChecklist.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.concluido
                        ? "bg-green-50 border-green-200"
                        : item.temProblema
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setItensChecklist(prev =>
                          prev.map((i, idx) =>
                            idx === index ? { ...i, concluido: !i.concluido, temProblema: false } : i
                          )
                        );
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.concluido
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                    >
                      {item.concluido && <Check className="h-4 w-4" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.concluido ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {item.titulo}
                    </span>
                    <button
                      onClick={() => {
                        setItensChecklist(prev =>
                          prev.map((i, idx) =>
                            idx === index ? { ...i, temProblema: !i.temProblema, concluido: false } : i
                          )
                        );
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        item.temProblema
                          ? "bg-red-500 text-white"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                      title="Reportar problema"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setItensChecklist(prev => prev.filter((_, idx) => idx !== index));
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Remover item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Adicionar novo item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar item ao checklist..."
                  value={novoItemChecklist}
                  onChange={(e) => setNovoItemChecklist(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && novoItemChecklist.trim()) {
                      setItensChecklist(prev => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          titulo: novoItemChecklist.trim(),
                          concluido: false,
                          temProblema: false,
                        },
                      ]);
                      setNovoItemChecklist("");
                    }
                  }}
                  className="flex-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  onClick={() => {
                    if (novoItemChecklist.trim()) {
                      setItensChecklist(prev => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          titulo: novoItemChecklist.trim(),
                          concluido: false,
                          temProblema: false,
                        },
                      ]);
                      setNovoItemChecklist("");
                    }
                  }}
                  disabled={!novoItemChecklist.trim()}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {itensChecklist.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>
                    {itensChecklist.filter(i => i.concluido).length} de {itensChecklist.length} concluídos
                  </span>
                  {itensChecklist.filter(i => i.temProblema).length > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-500">
                        {itensChecklist.filter(i => i.temProblema).length} com problema
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Descrição com botão + */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Descrição (opcional)</Label>
              <TemplateSelector
                condominioId={condominioId}
                tipoCampo="descricao"
                tipoTarefa={tipo}
                valorAtual={descricao}
                onSelect={setDescricao}
              />
            </div>
            <Textarea
              placeholder="Adicione observações ou detalhes..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
          <Button
            onClick={salvarEReiniciar}
            disabled={salvando}
            className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200"
          >
            {salvando ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            Registrar e Adicionar Outra
          </Button>
          
          <Button
            onClick={enviarTodos}
            disabled={enviando || ((rascunhosCount?.count ?? 0) === 0 && !titulo && !descricao && imagens.length === 0)}
            variant="outline"
            className="w-full h-10 text-sm font-semibold border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            {enviando ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Enviar {(rascunhosCount?.count ?? 0) > 0 ? `(${rascunhosCount?.count} registro${(rascunhosCount?.count ?? 0) > 1 ? "s" : ""})` : "Tudo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TarefasSimplesModal;

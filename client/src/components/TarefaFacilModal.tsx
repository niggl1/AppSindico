import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Zap, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Loader2, 
  Plus, 
  Send, 
  X, 
  ImageIcon,
  ArrowLeftRight
} from "lucide-react";
import InputWithSave from "@/components/InputWithSave";

interface TarefaFacilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominioId: number;
  tipoInicial?: "vistoria" | "manutencao" | "ocorrencia" | "antes_depois";
}

type TipoTarefa = "vistoria" | "manutencao" | "ocorrencia" | "antes_depois";
type StatusTarefa = "rascunho" | "pendente" | "em_andamento" | "concluido" | "cancelado";
type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";

interface FormData {
  titulo: string;
  descricao: string;
  imagens: string[];
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  imagemAntes: string;
  imagemDepois: string;
  responsavel: string;
  localizacaoNome: string;
}

const TIPOS_CONFIG = {
  vistoria: {
    label: "Vistoria Fácil",
    icon: ClipboardCheck,
    cor: "#F97316", // Laranja
    bgCor: "bg-orange-500",
    textCor: "text-orange-500",
    borderCor: "border-orange-500",
    hoverCor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
  },
  manutencao: {
    label: "Manutenção Fácil",
    icon: Wrench,
    cor: "#F97316",
    bgCor: "bg-orange-500",
    textCor: "text-orange-500",
    borderCor: "border-orange-500",
    hoverCor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
  },
  ocorrencia: {
    label: "Ocorrência Fácil",
    icon: AlertTriangle,
    cor: "#F97316",
    bgCor: "bg-orange-500",
    textCor: "text-orange-500",
    borderCor: "border-orange-500",
    hoverCor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
  },
  antes_depois: {
    label: "Antes/Depois Fácil",
    icon: ArrowLeftRight,
    cor: "#F97316",
    bgCor: "bg-orange-500",
    textCor: "text-orange-500",
    borderCor: "border-orange-500",
    hoverCor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
  },
};

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
];

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa", cor: "bg-green-100 text-green-700" },
  { value: "media", label: "Média", cor: "bg-yellow-100 text-yellow-700" },
  { value: "alta", label: "Alta", cor: "bg-orange-100 text-orange-700" },
  { value: "urgente", label: "Urgente", cor: "bg-red-100 text-red-700" },
];

export function TarefaFacilModal({ 
  open, 
  onOpenChange, 
  condominioId, 
  tipoInicial = "vistoria" 
}: TarefaFacilModalProps) {
  const [tipoAtivo, setTipoAtivo] = useState<TipoTarefa>(tipoInicial);
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    imagens: [],
    status: "pendente",
    prioridade: "media",
    imagemAntes: "",
    imagemDepois: "",
    responsavel: "",
    localizacaoNome: "",
  });
  const [localizacao, setLocalizacao] = useState<{ lat: string; lng: string; endereco: string } | null>(null);
  const [carregandoGPS, setCarregandoGPS] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const utils = trpc.useUtils();
  
  const criarTarefa = trpc.tarefaFacil.criar.useMutation({
    onSuccess: (data) => {
      toast.success(`Tarefa criada com sucesso! Protocolo: ${data.protocolo}`);
      utils.tarefaFacil.listar.invalidate();
      utils.tarefaFacil.listarRascunhos.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const listarRascunhos = trpc.tarefaFacil.listarRascunhos.useQuery(
    { condominioId },
    { enabled: open }
  );

  const enviarRascunhos = trpc.tarefaFacil.enviarRascunhos.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.enviados} rascunho(s) enviado(s) com sucesso!`);
      utils.tarefaFacil.listar.invalidate();
      utils.tarefaFacil.listarRascunhos.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar rascunhos: ${error.message}`);
    },
  });

  // Capturar localização GPS
  const capturarGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }

    setCarregandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        // Tentar obter endereço via reverse geocoding
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
          setLocalizacao({
            lat,
            lng,
            endereco: `${lat}, ${lng}`,
          });
        }
        setCarregandoGPS(false);
        toast.success("Localização capturada!");
      },
      (error) => {
        setCarregandoGPS(false);
        toast.error(`Erro ao capturar localização: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, campo?: "antes" | "depois") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) throw new Error("Erro no upload");
        
        const data = await response.json();
        
        if (campo === "antes") {
          setFormData(prev => ({ ...prev, imagemAntes: data.url }));
        } else if (campo === "depois") {
          setFormData(prev => ({ ...prev, imagemDepois: data.url }));
        } else {
          setFormData(prev => ({ ...prev, imagens: [...prev.imagens, data.url] }));
        }
      }
      toast.success("Imagem(ns) enviada(s)!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  // Remover imagem
  const removerImagem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }));
  };

  // Limpar formulário
  const limparFormulario = () => {
    setFormData({
      titulo: "",
      descricao: "",
      imagens: [],
      status: "pendente",
      prioridade: "media",
      imagemAntes: "",
      imagemDepois: "",
      responsavel: "",
      localizacaoNome: "",
    });
    setLocalizacao(null);
  };

  // Registrar e adicionar outra
  const handleRegistrarEAdicionar = async () => {
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    await criarTarefa.mutateAsync({
      condominioId,
      tipo: tipoAtivo,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      imagens: formData.imagens.length > 0 ? formData.imagens : undefined,
      latitude: localizacao?.lat,
      longitude: localizacao?.lng,
      endereco: localizacao?.endereco,
      status: "rascunho",
      prioridade: formData.prioridade,
      imagemAntes: tipoAtivo === "antes_depois" ? formData.imagemAntes : undefined,
      imagemDepois: tipoAtivo === "antes_depois" ? formData.imagemDepois : undefined,
    });

    limparFormulario();
  };

  // Enviar tarefa diretamente
  const handleEnviar = async () => {
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    await criarTarefa.mutateAsync({
      condominioId,
      tipo: tipoAtivo,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      imagens: formData.imagens.length > 0 ? formData.imagens : undefined,
      latitude: localizacao?.lat,
      longitude: localizacao?.lng,
      endereco: localizacao?.endereco,
      status: formData.status,
      prioridade: formData.prioridade,
      imagemAntes: tipoAtivo === "antes_depois" ? formData.imagemAntes : undefined,
      imagemDepois: tipoAtivo === "antes_depois" ? formData.imagemDepois : undefined,
    });

    limparFormulario();
    onOpenChange(false);
  };

  // Enviar todos os rascunhos
  const handleEnviarTodosRascunhos = async () => {
    const rascunhos = listarRascunhos.data || [];
    if (rascunhos.length === 0) {
      toast.info("Não há rascunhos para enviar");
      return;
    }

    await enviarRascunhos.mutateAsync({
      ids: rascunhos.map(r => r.id),
      status: "pendente",
    });
  };

  const config = TIPOS_CONFIG[tipoAtivo];
  const IconeTipo = config.icon;
  const rascunhosCount = listarRascunhos.data?.length || 0;

  // Capturar GPS automaticamente ao abrir o modal
  useEffect(() => {
    if (open && !localizacao && navigator.geolocation) {
      setCarregandoGPS(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          
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
            setLocalizacao({
              lat,
              lng,
              endereco: `${lat}, ${lng}`,
            });
          }
          setCarregandoGPS(false);
        },
        () => {
          setCarregandoGPS(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500">
            <Zap className="w-6 h-6" />
            Registro Rápido
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tipoAtivo} onValueChange={(v) => setTipoAtivo(v as TipoTarefa)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-orange-50">
            {(Object.keys(TIPOS_CONFIG) as TipoTarefa[]).map((tipo) => {
              const cfg = TIPOS_CONFIG[tipo];
              const Icon = cfg.icon;
              return (
                <TabsTrigger 
                  key={tipo} 
                  value={tipo}
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{tipo === "antes_depois" ? "Antes/Depois" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(TIPOS_CONFIG) as TipoTarefa[]).map((tipo) => (
            <TabsContent key={tipo} value={tipo} className="space-y-4 mt-4">
              {/* Cabeçalho do tipo */}
              <div className={`p-3 rounded-lg ${TIPOS_CONFIG[tipo].lightBg} border ${TIPOS_CONFIG[tipo].borderCor}`}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = TIPOS_CONFIG[tipo].icon;
                    return <Icon className={`w-5 h-5 ${TIPOS_CONFIG[tipo].textCor}`} />;
                  })()}
                  <span className={`font-semibold ${TIPOS_CONFIG[tipo].textCor}`}>
                    {TIPOS_CONFIG[tipo].label}
                  </span>
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                {/* Responsável e Localização */}
                <div className="grid grid-cols-2 gap-4">
                  <InputWithSave
                    label="Responsável"
                    value={formData.responsavel}
                    onChange={(v) => setFormData(prev => ({ ...prev, responsavel: v }))}
                    condominioId={condominioId}
                    tipo="responsavel"
                    placeholder="Nome do responsável"
                  />
                  <InputWithSave
                    label="Localização"
                    value={formData.localizacaoNome}
                    onChange={(v) => setFormData(prev => ({ ...prev, localizacaoNome: v }))}
                    condominioId={condominioId}
                    tipo="localizacao"
                    placeholder="Ex: Bloco A - Térreo"
                  />
                </div>

                {/* Título */}
                <div>
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Digite um título breve..."
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="descricao"
                    placeholder="Adicione detalhes..."
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Status e Prioridade com botão + */}
                <div className="grid grid-cols-2 gap-4">
                  <InputWithSave
                    label="Status"
                    value={formData.status === 'pendente' ? 'Pendente' : formData.status === 'em_andamento' ? 'Em Andamento' : formData.status === 'concluido' ? 'Concluído' : formData.status === 'cancelado' ? 'Cancelado' : 'Rascunho'}
                    onChange={(v) => {
                      const statusMap: Record<string, StatusTarefa> = {
                        'Pendente': 'pendente',
                        'Em Andamento': 'em_andamento',
                        'Concluído': 'concluido',
                        'Cancelado': 'cancelado',
                        'Rascunho': 'rascunho'
                      };
                      const status = statusMap[v] || 'pendente';
                      setFormData(prev => ({ ...prev, status }));
                    }}
                    condominioId={condominioId}
                    tipo="tipo_vistoria"
                    placeholder="Ex: Pendente"
                  />
                  <InputWithSave
                    label="Prioridade"
                    value={formData.prioridade === 'baixa' ? 'Baixa' : formData.prioridade === 'media' ? 'Média' : formData.prioridade === 'alta' ? 'Alta' : 'Urgente'}
                    onChange={(v) => {
                      const prioridadeMap: Record<string, PrioridadeTarefa> = {
                        'Baixa': 'baixa',
                        'Média': 'media',
                        'Alta': 'alta',
                        'Urgente': 'urgente'
                      };
                      const prioridade = prioridadeMap[v] || 'media';
                      setFormData(prev => ({ ...prev, prioridade }));
                    }}
                    condominioId={condominioId}
                    tipo="categoria_vistoria"
                    placeholder="Ex: Média"
                  />
                </div>

                {/* Imagens Antes/Depois (apenas para tipo antes_depois) */}
                {tipo === "antes_depois" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Imagem Antes</Label>
                      <div className="mt-1 border-2 border-dashed border-orange-200 rounded-lg p-4 text-center">
                        {formData.imagemAntes ? (
                          <div className="relative">
                            <img src={formData.imagemAntes} alt="Antes" className="w-full h-32 object-cover rounded" />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => setFormData(prev => ({ ...prev, imagemAntes: "" }))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Camera className="w-8 h-8 mx-auto text-orange-400" />
                            <span className="text-sm text-muted-foreground">Clique para adicionar</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, "antes")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Imagem Depois</Label>
                      <div className="mt-1 border-2 border-dashed border-orange-200 rounded-lg p-4 text-center">
                        {formData.imagemDepois ? (
                          <div className="relative">
                            <img src={formData.imagemDepois} alt="Depois" className="w-full h-32 object-cover rounded" />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => setFormData(prev => ({ ...prev, imagemDepois: "" }))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Camera className="w-8 h-8 mx-auto text-orange-400" />
                            <span className="text-sm text-muted-foreground">Clique para adicionar</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, "depois")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload de Imagens (para outros tipos) */}
                {tipo !== "antes_depois" && (
                  <div>
                    <Label className="text-sm font-medium">Imagens (opcional)</Label>
                    <div className="mt-1 border-2 border-dashed border-orange-200 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.imagens.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img src={img} alt={`Imagem ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5"
                              onClick={() => removerImagem(idx)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center gap-2 text-orange-500 hover:text-orange-600">
                        {uploadingImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-sm">Adicionar imagens</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(e)}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Localização GPS */}
                <div>
                  <Label className="text-sm font-medium">Localização GPS (opcional)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={capturarGPS}
                      disabled={carregandoGPS}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      {carregandoGPS ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      Capturar Localização
                    </Button>
                    {localizacao && (
                      <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                        {localizacao.endereco}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Rascunhos pendentes */}
        {rascunhosCount > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700">
                <strong>{rascunhosCount}</strong> rascunho(s) pendente(s)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnviarTodosRascunhos}
                disabled={enviarRascunhos.isPending}
                className="border-orange-300 text-orange-600 hover:bg-orange-100"
              >
                {enviarRascunhos.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                Enviar Todos
              </Button>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleRegistrarEAdicionar}
            disabled={criarTarefa.isPending || !formData.titulo.trim()}
            className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            {criarTarefa.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Registrar e Adicionar Outra
          </Button>
          <Button
            onClick={handleEnviar}
            disabled={criarTarefa.isPending || !formData.titulo.trim()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {criarTarefa.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

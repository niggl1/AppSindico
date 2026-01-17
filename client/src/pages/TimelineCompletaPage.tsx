import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Paperclip,
  File,
  FileImage,
  Download,
  AtSign,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Search,
  FileDown,
  Bell,
  BellOff,
  Printer,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock3,
  Zap,
  BookTemplate,
  AlarmClock,
  CalendarClock,
  Repeat,
  Mail,
  FileSpreadsheet,
  Video,
  Play,
  ExternalLink,
  CalendarPlus,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLocation } from "wouter";

interface TimelineCompletaPageProps {
  condominioId: number;
}

// Tipo para arquivos anexados
interface ArquivoAnexo {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
}

// Tipo para menções
interface Mencao {
  usuarioId?: number;
  membroEquipeId?: number;
  nome: string;
}

// Tipo para histórico de edição
interface HistoricoEdicao {
  id: number;
  comentarioId: number;
  textoAnterior: string;
  imagensUrlsAnterior?: string[];
  arquivosUrlsAnterior?: ArquivoAnexo[];
  mencoesAnterior?: Mencao[];
  editadoPorId?: number;
  editadoPorNome?: string;
  versao: number;
  createdAt: Date;
}

// Componente de Comentário Individual com Thread
function ComentarioItem({
  comentario,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onViewHistory,
  currentUserId,
  nivel = 0,
}: {
  comentario: any;
  onReply: (id: number) => void;
  onEdit: (comentario: any) => void;
  onDelete: (id: number) => void;
  onReact: (comentarioId: number, tipo: string) => void;
  onViewHistory: (comentarioId: number) => void;
  currentUserId?: number;
  nivel?: number;
}) {
  const [expandirRespostas, setExpandirRespostas] = useState(true);
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

  // Função para renderizar texto com menções destacadas
  const renderTextoComMencoes = (texto: string, mencoes?: Mencao[]) => {
    if (!mencoes || mencoes.length === 0) return texto;
    
    let textoFormatado = texto;
    mencoes.forEach((mencao) => {
      const regex = new RegExp(`@${mencao.nome}`, 'g');
      textoFormatado = textoFormatado.replace(
        regex,
        `<span class="text-blue-600 font-medium bg-blue-50 px-1 rounded">@${mencao.nome}</span>`
      );
    });
    
    return <span dangerouslySetInnerHTML={{ __html: textoFormatado }} />;
  };

  // Função para obter ícone do arquivo
  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith("image/")) return FileImage;
    return File;
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasRespostas = comentario.respostas && comentario.respostas.length > 0;

  return (
    <div className={`${nivel > 0 ? 'ml-8 border-l-2 border-blue-200 pl-4' : ''}`}>
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
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{new Date(comentario.createdAt).toLocaleString("pt-BR")}</span>
                {comentario.editado && (
                  <button
                    onClick={() => onViewHistory(comentario.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <History className="h-3 w-3" />
                    (editado - ver histórico)
                  </button>
                )}
              </div>
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

        {/* Conteúdo do comentário com menções */}
        <p className="text-gray-700 whitespace-pre-wrap">
          {renderTextoComMencoes(comentario.texto, comentario.mencoes)}
        </p>

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

        {/* Arquivos anexados */}
        {comentario.arquivosUrls && comentario.arquivosUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {comentario.arquivosUrls.map((arquivo: ArquivoAnexo, idx: number) => {
              const FileIcon = getFileIcon(arquivo.tipo);
              return (
                <a
                  key={idx}
                  href={arquivo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <FileIcon className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-gray-700 truncate max-w-[150px]">{arquivo.nome}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(arquivo.tamanho)}</span>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </a>
              );
            })}
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

      {/* Respostas (Thread) */}
      {hasRespostas && (
        <Collapsible open={expandirRespostas} onOpenChange={setExpandirRespostas}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2 text-blue-600">
              {expandirRespostas ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              {comentario.respostas.length} resposta{comentario.respostas.length > 1 ? 's' : ''}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {comentario.respostas.map((resposta: any) => (
              <ComentarioItem
                key={resposta.id}
                comentario={resposta}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
                onViewHistory={onViewHistory}
                currentUserId={currentUserId}
                nivel={nivel + 1}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// Componente de Filtros de Comentários
function FiltrosComentarios({
  filtros,
  setFiltros,
  autores,
  onLimpar,
}: {
  filtros: {
    autor: string;
    dataInicio: string;
    dataFim: string;
    tipoAnexo: string;
    apenasComMencoes: boolean;
    apenasRespostas: boolean;
  };
  setFiltros: (filtros: any) => void;
  autores: string[];
  onLimpar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  
  const temFiltrosAtivos = filtros.autor || filtros.dataInicio || filtros.dataFim || 
    filtros.tipoAnexo !== "todos" || filtros.apenasComMencoes || filtros.apenasRespostas;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <Collapsible open={expandido} onOpenChange={setExpandido}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {temFiltrosAtivos && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                  Ativos
                </Badge>
              )}
              {expandido ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          {temFiltrosAtivos && (
            <Button variant="ghost" size="sm" onClick={onLimpar} className="text-gray-500">
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
        
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por autor */}
            <div>
              <Label className="text-sm text-gray-600">Autor</Label>
              <Select
                value={filtros.autor}
                onValueChange={(value) => setFiltros({ ...filtros, autor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os autores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os autores</SelectItem>
                  {autores.map((autor) => (
                    <SelectItem key={autor} value={autor}>
                      {autor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por data início */}
            <div>
              <Label className="text-sm text-gray-600">Data início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            {/* Filtro por data fim */}
            <div>
              <Label className="text-sm text-gray-600">Data fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>

            {/* Filtro por tipo de anexo */}
            <div>
              <Label className="text-sm text-gray-600">Tipo de anexo</Label>
              <Select
                value={filtros.tipoAnexo}
                onValueChange={(value) => setFiltros({ ...filtros, tipoAnexo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="imagem">Com imagens</SelectItem>
                  <SelectItem value="arquivo">Com arquivos</SelectItem>
                  <SelectItem value="nenhum">Sem anexos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros booleanos */}
            <div className="flex items-center gap-4 col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.apenasComMencoes}
                  onChange={(e) => setFiltros({ ...filtros, apenasComMencoes: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Apenas com menções</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.apenasRespostas}
                  onChange={(e) => setFiltros({ ...filtros, apenasRespostas: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Apenas respostas</span>
              </label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Modal de Histórico de Edições
function HistoricoModal({
  open,
  onClose,
  comentarioId,
}: {
  open: boolean;
  onClose: () => void;
  comentarioId: number | null;
}) {
  const { data: historico, isLoading } = trpc.timeline.listarHistoricoComentario.useQuery(
    { comentarioId: comentarioId || 0 },
    { enabled: !!comentarioId && open }
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Histórico de Edições
          </DialogTitle>
          <DialogDescription>
            Veja todas as versões anteriores deste comentário
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : historico && historico.length > 0 ? (
          <div className="space-y-4">
            {historico.map((versao: HistoricoEdicao, index: number) => (
              <div
                key={versao.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Versão {versao.versao}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Editado por {versao.editadoPorNome} em{" "}
                    {new Date(versao.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                  {versao.textoAnterior}
                </p>
                {versao.imagensUrlsAnterior && versao.imagensUrlsAnterior.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {versao.imagensUrlsAnterior.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Imagem ${idx + 1}`}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum histórico de edição encontrado</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TimelineCompletaPage({ condominioId }: TimelineCompletaPageProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const comentarioInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoComentarioId, setHistoricoComentarioId] = useState<number | null>(null);

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
  const [comentarioArquivos, setComentarioArquivos] = useState<ArquivoAnexo[]>([]);
  const [comentarioPaiId, setComentarioPaiId] = useState<number | null>(null);
  const [editandoComentario, setEditandoComentario] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("formulario");
  
  // Estados para menções
  const [showMencoes, setShowMencoes] = useState(false);
  const [mencoesSelecionadas, setMencoesSelecionadas] = useState<Mencao[]>([]);
  const [filtroMencao, setFiltroMencao] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    autor: "",
    dataInicio: "",
    dataFim: "",
    tipoAnexo: "todos",
    apenasComMencoes: false,
    apenasRespostas: false,
  });

  // Estados de busca global
  const [termoBusca, setTermoBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState(false);

  // Estados de notificações
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  // Estados de estatísticas
  const [showEstatisticas, setShowEstatisticas] = useState(false);

  // Estados de templates
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [novoTemplate, setNovoTemplate] = useState({ titulo: "", texto: "", categoria: "", publico: false });
  const [editandoTemplate, setEditandoTemplate] = useState<any>(null);

  // Estados de lembretes
  const [showLembretes, setShowLembretes] = useState(false);
  const [showAddLembrete, setShowAddLembrete] = useState(false);
  const [novoLembrete, setNovoLembrete] = useState({
    titulo: "",
    descricao: "",
    dataLembrete: "",
    notificarEmail: true,
    notificarPush: true,
    recorrente: false,
    intervaloRecorrencia: "" as "" | "diario" | "semanal" | "mensal",
  });
  const [editandoLembrete, setEditandoLembrete] = useState<any>(null);

  // Estados de relatório
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [relatorioMes, setRelatorioMes] = useState(new Date().getMonth() + 1);
  const [relatorioAno, setRelatorioAno] = useState(new Date().getFullYear());

  // Estados de vídeos
  const [comentarioVideos, setComentarioVideos] = useState<Array<{ url: string; nome: string; tipo: string; tamanho: number }>>([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Queries para listas
  const { data: responsaveis = [] } = trpc.timeline.listarResponsaveis.useQuery({ condominioId });
  const { data: locais = [] } = trpc.timeline.listarLocais.useQuery({ condominioId });
  const { data: statusList = [] } = trpc.timeline.listarStatus.useQuery({ condominioId });
  const { data: prioridades = [] } = trpc.timeline.listarPrioridades.useQuery({ condominioId });
  const { data: titulos = [] } = trpc.timeline.listarTitulos.useQuery({ condominioId });
  const { data: membrosEquipe = [] } = trpc.membroEquipe.list.useQuery({ condominioId });
  const { data: usuarios = [] } = trpc.user.list.useQuery({});

  // Query de comentários com filtros
  const temFiltrosAtivos = filtros.autor || filtros.dataInicio || filtros.dataFim || 
    filtros.tipoAnexo !== "todos" || filtros.apenasComMencoes || filtros.apenasRespostas;

  const { data: comentariosData, refetch: refetchComentarios } = trpc.timeline.listarComentariosFiltrados.useQuery(
    { 
      timelineId: timelineCriada?.id || 0,
      filtroAutor: filtros.autor && filtros.autor !== "todos" ? filtros.autor : undefined,
      filtroDataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      filtroDataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
      filtroTipoAnexo: filtros.tipoAnexo as any,
      apenasComMencoes: filtros.apenasComMencoes || undefined,
      apenasRespostas: filtros.apenasRespostas || undefined,
    },
    { enabled: !!timelineCriada?.id }
  );

  // Query de busca global
  const { data: resultadosBusca, isLoading: buscando } = trpc.timeline.buscarComentarios.useQuery(
    { timelineId: timelineCriada?.id || 0, termo: termoBusca },
    { enabled: !!timelineCriada?.id && buscaAtiva && termoBusca.length >= 2 }
  );

  // Query de dados para PDF
  const { data: dadosPdf, refetch: refetchDadosPdf } = trpc.timeline.gerarDadosPdf.useQuery(
    { timelineId: timelineCriada?.id || 0 },
    { enabled: false }
  );

  // Query de notificações
  const { data: notificacoes } = trpc.notificacoes.listar.useQuery(
    { limite: 10, apenasNaoLidas: true },
    { refetchInterval: 30000 } // Atualizar a cada 30 segundos
  );

  // Query de estatísticas
  const { data: estatisticas, refetch: refetchEstatisticas } = trpc.timeline.obterEstatisticas.useQuery(
    { timelineId: timelineCriada?.id || 0 },
    { enabled: !!timelineCriada?.id && showEstatisticas }
  );

  // Query de templates
  const { data: templates = [], refetch: refetchTemplates } = trpc.timeline.listarTemplates.useQuery(
    { condominioId },
    { enabled: showTemplates }
  );

  // Query de lembretes
  const { data: lembretes = [], refetch: refetchLembretes } = trpc.timeline.listarLembretes.useQuery(
    { timelineId: timelineCriada?.id || 0 },
    { enabled: !!timelineCriada?.id && showLembretes }
  );

  // Query de relatório de atividades
  const { data: relatorio, isLoading: carregandoRelatorio } = trpc.timeline.gerarRelatorioAtividades.useQuery(
    { condominioId, mes: relatorioMes, ano: relatorioAno },
    { enabled: showRelatorio }
  );

  // Query de exportar calendário
  const { data: calendarioData, refetch: refetchCalendario } = trpc.timeline.exportarCalendario.useQuery(
    { timelineId: timelineCriada?.id || 0 },
    { enabled: false }
  );

  // Lista de autores únicos para o filtro
  const autoresUnicos = Array.from(
    new Set(comentariosData?.comentarios?.map((c: any) => c.autorNome) || [])
  );

  // Lista de pessoas para menções (membros da equipe + usuários)
  const pessoasParaMencao = [
    ...membrosEquipe.map((m: any) => ({
      id: m.id,
      nome: m.nome,
      tipo: "membro" as const,
      membroEquipeId: m.id,
    })),
    ...usuarios.map((u: any) => ({
      id: u.id,
      nome: u.name || u.email || "Usuário",
      tipo: "usuario" as const,
      usuarioId: u.id,
    })),
  ].filter((p, index, self) => 
    index === self.findIndex((t) => t.nome === p.nome)
  );

  // Filtrar pessoas para menção
  const pessoasFiltradas = pessoasParaMencao.filter((p) =>
    p.nome.toLowerCase().includes(filtroMencao.toLowerCase())
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
      setComentarioArquivos([]);
      setMencoesSelecionadas([]);
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
      setComentarioArquivos([]);
      setMencoesSelecionadas([]);
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

  // Mutations de templates
  const criarTemplateMutation = trpc.timeline.criarTemplate.useMutation({
    onSuccess: () => {
      setNovoTemplate({ titulo: "", texto: "", categoria: "", publico: false });
      setShowAddTemplate(false);
      refetchTemplates();
      toast.success("Template criado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const editarTemplateMutation = trpc.timeline.editarTemplate.useMutation({
    onSuccess: () => {
      setEditandoTemplate(null);
      refetchTemplates();
      toast.success("Template atualizado!");
    },
    onError: (error) => toast.error(error.message),
  });

  const excluirTemplateMutation = trpc.timeline.excluirTemplate.useMutation({
    onSuccess: () => {
      refetchTemplates();
      toast.success("Template excluído!");
    },
    onError: (error) => toast.error(error.message),
  });

  const usarTemplateMutation = trpc.timeline.usarTemplate.useMutation({
    onSuccess: () => {
      refetchTemplates();
    },
  });

  // Mutations de lembretes
  const criarLembreteMutation = trpc.timeline.criarLembrete.useMutation({
    onSuccess: () => {
      setNovoLembrete({
        titulo: "",
        descricao: "",
        dataLembrete: "",
        notificarEmail: true,
        notificarPush: true,
        recorrente: false,
        intervaloRecorrencia: "",
      });
      setShowAddLembrete(false);
      refetchLembretes();
      toast.success("Lembrete agendado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const editarLembreteMutation = trpc.timeline.editarLembrete.useMutation({
    onSuccess: () => {
      setEditandoLembrete(null);
      refetchLembretes();
      toast.success("Lembrete atualizado!");
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelarLembreteMutation = trpc.timeline.cancelarLembrete.useMutation({
    onSuccess: () => {
      refetchLembretes();
      toast.success("Lembrete cancelado!");
    },
    onError: (error) => toast.error(error.message),
  });

  const excluirLembreteMutation = trpc.timeline.excluirLembrete.useMutation({
    onSuccess: () => {
      refetchLembretes();
      toast.success("Lembrete excluído!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Atualizar título quando selecionar título predefinido
  useEffect(() => {
    if (tituloPredefId) {
      const tituloSelecionado = titulos.find((t: any) => t.id === Number(tituloPredefId));
      if (tituloSelecionado) {
        setTitulo(tituloSelecionado.titulo);
        if (tituloSelecionado.descricaoPadrao) {
          setDescricao(tituloSelecionado.descricaoPadrao);
        }
      }
    }
  }, [tituloPredefId, titulos]);

  // Detectar @ para menções
  const handleComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setNovoComentario(value);
    setCursorPosition(position);

    // Verificar se o usuário digitou @
    const textBeforeCursor = value.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Se não tem espaço depois do @, mostrar sugestões
      if (!textAfterAt.includes(" ")) {
        setFiltroMencao(textAfterAt);
        setShowMencoes(true);
      } else {
        setShowMencoes(false);
      }
    } else {
      setShowMencoes(false);
    }
  };

  // Selecionar pessoa para menção
  const handleSelecionarMencao = (pessoa: typeof pessoasParaMencao[0]) => {
    const textBeforeCursor = novoComentario.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textAfterCursor = novoComentario.substring(cursorPosition);
    
    const novoTexto = textBeforeCursor.substring(0, lastAtIndex) + `@${pessoa.nome} ` + textAfterCursor;
    setNovoComentario(novoTexto);
    
    // Adicionar à lista de menções
    const novaMencao: Mencao = {
      nome: pessoa.nome,
      ...(pessoa.tipo === "usuario" ? { usuarioId: pessoa.id } : { membroEquipeId: pessoa.id }),
    };
    
    if (!mencoesSelecionadas.find(m => m.nome === pessoa.nome)) {
      setMencoesSelecionadas([...mencoesSelecionadas, novaMencao]);
    }
    
    setShowMencoes(false);
    setFiltroMencao("");
    comentarioInputRef.current?.focus();
  };

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

        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 100MB`);
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

  // Upload de arquivos para comentários
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const novosArquivos: ArquivoAnexo[] = [];
      
      for (const file of Array.from(files)) {
        // Limite de 100MB
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 100MB`);
          continue;
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        novosArquivos.push({
          url: base64,
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
        });
      }

      setComentarioArquivos([...comentarioArquivos, ...novosArquivos]);
      toast.success(`${novosArquivos.length} arquivo(s) anexado(s)`);
    } catch (error) {
      toast.error("Erro ao carregar arquivos");
    } finally {
      setUploadingFiles(false);
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

  // Remover arquivo
  const handleRemoveArquivo = (index: number) => {
    setComentarioArquivos(comentarioArquivos.filter((_, i) => i !== index));
  };

  // Salvar e continuar depois (rascunho)
  const handleSalvarRascunho = () => {
    if (!titulo.trim()) {
      toast.error("Preencha pelo menos o título");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: responsavelId ? Number(responsavelId) : undefined,
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      titulo,
      descricao: descricao || undefined,
      imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
      rascunho: true,
    });
    toast.success("Rascunho salvo! Você pode continuar depois.");
  };

  // Enviar timeline
  const handleEnviar = () => {
    if (!titulo.trim()) {
      toast.error("Preencha pelo menos o título");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: responsavelId ? Number(responsavelId) : undefined,
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      titulo,
      descricao: descricao || undefined,
      imagens: imagens.map((img) => ({ url: img.url, legenda: img.legenda })),
    });
  };

  // Compartilhar
  const handleCompartilhar = (canal: "whatsapp" | "email") => {
    if (!timelineCriada) return;

    const membro = membrosEquipe[0];
    if (membro) {
      compartilharMutation.mutate({
        timelineId: timelineCriada.id,
        destinatarioNome: membro.nome,
        destinatarioEmail: membro.email || undefined,
        destinatarioTelefone: membro.telefone || undefined,
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
        arquivosUrls: comentarioArquivos.length > 0 ? comentarioArquivos : undefined,
        mencoes: mencoesSelecionadas.length > 0 ? mencoesSelecionadas : undefined,
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
    setComentarioArquivos(comentario.arquivosUrls || []);
    setMencoesSelecionadas(comentario.mencoes || []);
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

  const handleViewHistory = (comentarioId: number) => {
    setHistoricoComentarioId(comentarioId);
    setShowHistorico(true);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    setFiltros({
      autor: "",
      dataInicio: "",
      dataFim: "",
      tipoAnexo: "todos",
      apenasComMencoes: false,
      apenasRespostas: false,
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

  // Handler de busca global
  const handleBusca = (termo: string) => {
    setTermoBusca(termo);
    if (termo.length >= 2) {
      setBuscaAtiva(true);
    } else {
      setBuscaAtiva(false);
    }
  };

  // Handler para gerar PDF
  const handleGerarPdf = async () => {
    if (!timelineCriada?.id) {
      toast.error("Crie uma timeline primeiro");
      return;
    }

    setGerandoPdf(true);
    try {
      const { data } = await refetchDadosPdf();
      if (!data) {
        toast.error("Erro ao carregar dados da timeline");
        return;
      }

      // Criar conteúdo HTML para o PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Timeline - ${data.timeline.titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .info-row { display: flex; margin: 8px 0; }
            .info-label { font-weight: bold; width: 150px; color: #4b5563; }
            .comentario { border-left: 3px solid #3b82f6; padding-left: 15px; margin: 15px 0; }
            .comentario-autor { font-weight: bold; color: #1e40af; }
            .comentario-data { color: #6b7280; font-size: 12px; }
            .imagem { max-width: 200px; margin: 10px 5px; border-radius: 8px; }
            .secao { margin-top: 30px; }
            .secao-titulo { color: #374151; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>📋 ${data.timeline.titulo}</h1>
          
          <div class="info-box">
            <div class="info-row"><span class="info-label">Protocolo:</span> ${data.timeline.protocolo}</div>
            <div class="info-row"><span class="info-label">Status:</span> ${data.status?.nome || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Prioridade:</span> ${data.prioridade?.nome || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Responsável:</span> ${data.responsavel?.nome || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Local:</span> ${data.local?.nome || 'N/A'}</div>
            <div class="info-row"><span class="info-label">Data de Criação:</span> ${new Date(data.timeline.createdAt).toLocaleString('pt-BR')}</div>
          </div>
          
          ${data.timeline.descricao ? `
          <div class="secao">
            <h3 class="secao-titulo">Descrição</h3>
            <p>${data.timeline.descricao}</p>
          </div>
          ` : ''}
          
          ${data.imagens.length > 0 ? `
          <div class="secao">
            <h3 class="secao-titulo">Imagens (${data.imagens.length})</h3>
            <div>
              ${data.imagens.map((img: any) => `<img src="${img.url}" class="imagem" alt="${img.legenda || 'Imagem'}" />`).join('')}
            </div>
          </div>
          ` : ''}
          
          ${data.comentarios.length > 0 ? `
          <div class="secao">
            <h3 class="secao-titulo">Comentários (${data.comentarios.length})</h3>
            ${data.comentarios.map((c: any) => `
              <div class="comentario">
                <div class="comentario-autor">${c.autorNome}</div>
                <div class="comentario-data">${new Date(c.createdAt).toLocaleString('pt-BR')}</div>
                <p>${c.texto}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div style="margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px;">
            Gerado em ${new Date().toLocaleString('pt-BR')} | App Síndico
          </div>
        </body>
        </html>
      `;

      // Criar blob e download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-${data.timeline.protocolo}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDF gerado com sucesso! Abra o arquivo HTML no navegador e imprima como PDF.");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setGerandoPdf(false);
    }
  };

  // Handler para imprimir diretamente
  const handleImprimir = async () => {
    if (!timelineCriada?.id) {
      toast.error("Crie uma timeline primeiro");
      return;
    }

    setGerandoPdf(true);
    try {
      const { data } = await refetchDadosPdf();
      if (!data) {
        toast.error("Erro ao carregar dados da timeline");
        return;
      }

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Timeline - ${data.timeline.titulo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
              .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
              .info-row { display: flex; margin: 8px 0; }
              .info-label { font-weight: bold; width: 150px; color: #4b5563; }
              .comentario { border-left: 3px solid #3b82f6; padding-left: 15px; margin: 15px 0; }
              .comentario-autor { font-weight: bold; color: #1e40af; }
              .comentario-data { color: #6b7280; font-size: 12px; }
              .imagem { max-width: 200px; margin: 10px 5px; border-radius: 8px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>📋 ${data.timeline.titulo}</h1>
            <div class="info-box">
              <div class="info-row"><span class="info-label">Protocolo:</span> ${data.timeline.protocolo}</div>
              <div class="info-row"><span class="info-label">Status:</span> ${data.status?.nome || 'N/A'}</div>
              <div class="info-row"><span class="info-label">Prioridade:</span> ${data.prioridade?.nome || 'N/A'}</div>
              <div class="info-row"><span class="info-label">Responsável:</span> ${data.responsavel?.nome || 'N/A'}</div>
              <div class="info-row"><span class="info-label">Local:</span> ${data.local?.nome || 'N/A'}</div>
              <div class="info-row"><span class="info-label">Data:</span> ${new Date(data.timeline.createdAt).toLocaleString('pt-BR')}</div>
            </div>
            ${data.timeline.descricao ? `<div><h3>Descrição</h3><p>${data.timeline.descricao}</p></div>` : ''}
            ${data.comentarios.length > 0 ? `
              <div><h3>Comentários (${data.comentarios.length})</h3>
              ${data.comentarios.map((c: any) => `
                <div class="comentario">
                  <div class="comentario-autor">${c.autorNome}</div>
                  <div class="comentario-data">${new Date(c.createdAt).toLocaleString('pt-BR')}</div>
                  <p>${c.texto}</p>
                </div>
              `).join('')}</div>
            ` : ''}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast.error("Erro ao imprimir");
    } finally {
      setGerandoPdf(false);
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handler para usar template
  const handleUsarTemplate = (template: any) => {
    setNovoComentario(template.texto);
    usarTemplateMutation.mutate({ id: template.id });
    setShowTemplates(false);
    toast.success(`Template "${template.titulo}" aplicado!`);
  };

  // Handler para criar template
  const handleCriarTemplate = () => {
    if (!novoTemplate.titulo.trim() || !novoTemplate.texto.trim()) {
      toast.error("Preencha título e texto do template");
      return;
    }
    criarTemplateMutation.mutate({
      condominioId,
      ...novoTemplate,
    });
  };

  // Handler para criar lembrete
  const handleCriarLembrete = () => {
    if (!novoLembrete.titulo.trim() || !novoLembrete.dataLembrete) {
      toast.error("Preencha título e data do lembrete");
      return;
    }
    if (!timelineCriada?.id) {
      toast.error("Crie uma timeline primeiro");
      return;
    }
    criarLembreteMutation.mutate({
      timelineId: timelineCriada.id,
      condominioId,
      titulo: novoLembrete.titulo,
      descricao: novoLembrete.descricao || undefined,
      dataLembrete: novoLembrete.dataLembrete,
      notificarEmail: novoLembrete.notificarEmail,
      notificarPush: novoLembrete.notificarPush,
      recorrente: novoLembrete.recorrente,
      intervaloRecorrencia: novoLembrete.intervaloRecorrencia || undefined,
    });
  };

  // Formatar tempo médio de resposta
  const formatarTempoMedio = (ms: number) => {
    if (ms < 60000) return "< 1 min";
    if (ms < 3600000) return `${Math.round(ms / 60000)} min`;
    if (ms < 86400000) return `${Math.round(ms / 3600000)} h`;
    return `${Math.round(ms / 86400000)} dias`;
  };

  // Handler para exportar calendário
  const handleExportarCalendario = async () => {
    try {
      const { data } = await refetchCalendario();
      if (!data) {
        toast.error("Erro ao gerar arquivo de calendário");
        return;
      }

      // Criar e baixar arquivo .ics
      const blob = new Blob([data.content], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${data.totalLembretes} lembrete(s) exportado(s) para calendário!`);
    } catch (error) {
      toast.error("Erro ao exportar calendário");
    }
  };

  // Handler para upload de vídeo
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    const TIPOS_PERMITIDOS = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];

    if (file.size > MAX_SIZE) {
      toast.error(`Vídeo muito grande. Máximo: ${MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast.error("Tipo de vídeo não suportado. Use MP4, WebM, MOV ou AVI");
      return;
    }

    setUploadingVideo(true);
    try {
      // Simular upload (em produção, usar storagePut)
      const fakeUrl = URL.createObjectURL(file);
      setComentarioVideos(prev => [...prev, {
        url: fakeUrl,
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
      }]);
      toast.success("Vídeo adicionado!");
    } catch (error) {
      toast.error("Erro ao fazer upload do vídeo");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  // Handler para remover vídeo
  const handleRemoverVideo = (index: number) => {
    setComentarioVideos(prev => prev.filter((_, i) => i !== index));
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRelatorio(true)}
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Relatório
          </Button>
          {timelineCriada && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEstatisticas(true)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Estatísticas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLembretes(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <AlarmClock className="w-4 h-4 mr-1" />
                Lembretes
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Zap className="w-4 h-4 mr-1" />
            Templates
          </Button>
          {timelineCriada && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Protocolo: {timelineCriada.protocolo}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="formulario" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Dados
          </TabsTrigger>
          <TabsTrigger 
            value="comentarios" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            disabled={!timelineCriada}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comentários
          </TabsTrigger>
          <TabsTrigger 
            value="historico" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            disabled={!timelineCriada}
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab Formulário */}
        <TabsContent value="formulario">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dados da Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Responsável */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Responsável
                </Label>
                <div className="flex gap-2">
                  <Select value={responsavelId} onValueChange={setResponsavelId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((r: any) => (
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
                      <SelectValue placeholder="Selecione o local ou item" />
                    </SelectTrigger>
                    <SelectContent>
                      {locais.map((l: any) => (
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
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Status
                </Label>
                <div className="flex gap-2">
                  <Select value={statusId} onValueChange={setStatusId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((s: any) => (
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
                      {prioridades.map((p: any) => (
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
                      {titulos.map((t: any) => (
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
                    <span className="text-gray-400">Data/Hora:</span>
                    <p className="font-medium">{new Date().toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Registrado por:</span>
                    <p className="font-medium">{user?.name || "Usuário"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Protocolo:</span>
                    <p className="font-medium">{timelineCriada?.protocolo || "Será gerado"}</p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSalvarRascunho}
                    disabled={criarTimelineMutation.isPending}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar e Continuar Depois
                  </Button>
                </div>
                <div className="flex gap-2">
                  {timelineCriada && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCompartilhar(true)}
                      className="border-green-300 text-green-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar com Equipe
                    </Button>
                  )}
                  <Button
                    onClick={handleEnviar}
                    disabled={criarTimelineMutation.isPending || !titulo.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {criarTimelineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Criar Timeline
                  </Button>
                </div>
              </div>

              {/* Mensagem de sucesso */}
              {timelineCriada && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Timeline criada com sucesso!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Protocolo: {timelineCriada.protocolo}
                  </p>
                  <div className="flex gap-2 mt-3">
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comentários da Equipe
                  {comentariosData?.total && comentariosData.total > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                      {comentariosData.total}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Botão de Notificações */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificacoesAtivas(!notificacoesAtivas)}
                    className="text-white hover:bg-white/20"
                    title={notificacoesAtivas ? "Desativar notificações" : "Ativar notificações"}
                  >
                    {notificacoesAtivas ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    {notificacoes?.naoLidas && notificacoes.naoLidas > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notificacoes.naoLidas}
                      </span>
                    )}
                  </Button>
                  {/* Botão de Imprimir */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleImprimir}
                    disabled={gerandoPdf || !timelineCriada}
                    className="text-white hover:bg-white/20"
                    title="Imprimir timeline"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                  {/* Botão de Exportar PDF */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGerarPdf}
                    disabled={gerandoPdf || !timelineCriada}
                    className="text-white hover:bg-white/20"
                    title="Exportar para PDF"
                  >
                    {gerandoPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Barra de busca global */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar nos comentários..."
                    value={termoBusca}
                    onChange={(e) => handleBusca(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {termoBusca && (
                    <button
                      onClick={() => {
                        setTermoBusca("");
                        setBuscaAtiva(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {buscaAtiva && termoBusca.length >= 2 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {buscando ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Buscando...
                      </span>
                    ) : (
                      <span>
                        {resultadosBusca?.total || 0} resultado(s) encontrado(s) para "{termoBusca}"
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Resultados da busca */}
              {buscaAtiva && resultadosBusca?.comentarios && resultadosBusca.comentarios.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Resultados da Busca
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {resultadosBusca.comentarios.map((comentario: any) => (
                      <div key={comentario.id} className="bg-white rounded-lg p-3 border border-yellow-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xs">
                              {comentario.autorNome?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comentario.autorNome}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comentario.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {comentario.texto.split(new RegExp(`(${termoBusca})`, 'gi')).map((part: string, i: number) => (
                            part.toLowerCase() === termoBusca.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-300 px-0.5 rounded">{part}</mark>
                            ) : part
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros de comentários */}
              <FiltrosComentarios
                filtros={filtros}
                setFiltros={setFiltros}
                autores={autoresUnicos}
                onLimpar={handleLimparFiltros}
              />

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
                        setComentarioArquivos([]);
                        setMencoesSelecionadas([]);
                      }}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {/* Menções selecionadas */}
                {mencoesSelecionadas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mencoesSelecionadas.map((mencao, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                        <AtSign className="w-3 h-3 mr-1" />
                        {mencao.nome}
                        <button
                          onClick={() => setMencoesSelecionadas(mencoesSelecionadas.filter((_, i) => i !== idx))}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
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
                    <div className="relative">
                      <Textarea
                        ref={comentarioInputRef}
                        value={novoComentario}
                        onChange={handleComentarioChange}
                        placeholder="Adicione um comentário... Use @ para mencionar alguém"
                        rows={3}
                        className="resize-none"
                      />
                      
                      {/* Popover de menções */}
                      {showMencoes && pessoasFiltradas.length > 0 && (
                        <div className="absolute bottom-full left-0 w-64 bg-white border rounded-lg shadow-lg mb-1 max-h-48 overflow-y-auto z-50">
                          <div className="p-2 border-b text-xs text-gray-500 font-medium">
                            Mencionar pessoa
                          </div>
                          {pessoasFiltradas.slice(0, 5).map((pessoa) => (
                            <button
                              key={`${pessoa.tipo}-${pessoa.id}`}
                              onClick={() => handleSelecionarMencao(pessoa)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {pessoa.nome.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{pessoa.nome}</p>
                                <p className="text-xs text-gray-500">
                                  {pessoa.tipo === "membro" ? "Membro da equipe" : "Usuário"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Arquivos anexados */}
                    {comentarioArquivos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {comentarioArquivos.map((arquivo, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                          >
                            <File className="h-4 w-4 text-blue-600" />
                            <span className="truncate max-w-[150px]">{arquivo.nome}</span>
                            <span className="text-xs text-gray-500">{formatFileSize(arquivo.tamanho)}</span>
                            <button
                              onClick={() => handleRemoveArquivo(idx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vídeos anexados */}
                    {comentarioVideos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {comentarioVideos.map((video, idx) => (
                          <div
                            key={idx}
                            className="relative bg-gray-900 rounded-lg overflow-hidden"
                            style={{ width: "200px", height: "120px" }}
                          >
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                              <p className="text-xs text-white truncate">{video.nome}</p>
                              <p className="text-xs text-gray-300">{formatFileSize(video.tamanho)}</p>
                            </div>
                            <button
                              onClick={() => handleRemoverVideo(idx)}
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFiles}
                        >
                          {uploadingFiles ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Paperclip className="w-4 h-4 mr-1" />
                          )}
                          Anexar arquivo
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500"
                          onClick={() => {
                            setShowMencoes(true);
                            setFiltroMencao("");
                          }}
                        >
                          <AtSign className="w-4 h-4 mr-1" />
                          Mencionar
                        </Button>
                        <input
                          type="file"
                          ref={videoInputRef}
                          onChange={handleVideoUpload}
                          className="hidden"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploadingVideo}
                        >
                          {uploadingVideo ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Video className="w-4 h-4 mr-1" />
                          )}
                          Vídeo
                        </Button>
                      </div>
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

              {/* Lista de comentários com threads */}
              <ScrollArea className="h-[500px]">
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
                        onViewHistory={handleViewHistory}
                        currentUserId={user?.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum comentário encontrado</p>
                      {temFiltrosAtivos ? (
                        <p className="text-sm">Tente ajustar os filtros</p>
                      ) : (
                        <p className="text-sm">Seja o primeiro a comentar!</p>
                      )}
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

      {/* Modal de Histórico de Edições */}
      <HistoricoModal
        open={showHistorico}
        onClose={() => {
          setShowHistorico(false);
          setHistoricoComentarioId(null);
        }}
        comentarioId={historicoComentarioId}
      />

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
                placeholder="Ex: Piscina, Elevador 1"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novoLocal.descricao}
                onChange={(e) => setNovoLocal({ ...novoLocal, descricao: e.target.value })}
                placeholder="Descrição opcional"
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
              {criarLocalMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
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
                placeholder="Ex: Em andamento, Concluído"
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
                  className="flex-1"
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
              {criarStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
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
                placeholder="Ex: Alta, Média, Baixa"
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
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Nível (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
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
              {criarPrioridadeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
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
                placeholder="Ex: Manutenção preventiva"
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
              {criarTituloMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Compartilhar */}
      <Dialog open={showCompartilhar} onOpenChange={setShowCompartilhar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Timeline</DialogTitle>
            <DialogDescription>
              Escolha como deseja compartilhar esta timeline com a equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-green-200 hover:bg-green-50"
              onClick={() => {
                handleCompartilhar("whatsapp");
                setShowCompartilhar(false);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-gray-500">Enviar link via WhatsApp</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-blue-200 hover:bg-blue-50"
              onClick={() => {
                handleCompartilhar("email");
                setShowCompartilhar(false);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-gray-500">Enviar por e-mail</p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompartilhar(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Estatísticas */}
      <Dialog open={showEstatisticas} onOpenChange={setShowEstatisticas}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Estatísticas da Timeline
            </DialogTitle>
          </DialogHeader>
          {estatisticas ? (
            <div className="space-y-6">
              {/* Cards de métricas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{estatisticas.totalComentarios}</p>
                  <p className="text-sm text-blue-600">Comentários</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <Heart className="w-8 h-8 mx-auto text-pink-600 mb-2" />
                  <p className="text-2xl font-bold text-pink-700">{estatisticas.totalReacoes}</p>
                  <p className="text-sm text-pink-600">Reações</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Clock3 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{formatarTempoMedio(estatisticas.tempoMedioResposta)}</p>
                  <p className="text-sm text-green-600">Tempo Médio</p>
                </div>
              </div>

              {/* Participação por membro */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participação por Membro
                </h4>
                <div className="space-y-2">
                  {Object.entries(estatisticas.participacaoPorMembro).map(([nome, count]) => (
                    <div key={nome} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{nome}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((count as number) / estatisticas.totalComentarios) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reações por tipo */}
              {Object.keys(estatisticas.reacoesPorTipo).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Reações por Tipo
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(estatisticas.reacoesPorTipo).map(([tipo, count]) => (
                      <Badge key={tipo} variant="secondary" className="px-3 py-1">
                        {tipo === "like" && <ThumbsUp className="w-3 h-3 mr-1" />}
                        {tipo === "love" && <Heart className="w-3 h-3 mr-1" />}
                        {tipo === "check" && <Check className="w-3 h-3 mr-1" />}
                        {tipo === "question" && <HelpCircle className="w-3 h-3 mr-1" />}
                        {tipo === "alert" && <AlertCircleIcon className="w-3 h-3 mr-1" />}
                        {count as number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Último comentário */}
              {estatisticas.ultimoComentario && (
                <div className="text-sm text-gray-500 text-center">
                  Último comentário: {new Date(estatisticas.ultimoComentario).toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Carregando estatísticas...</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstatisticas(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Templates */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Templates de Comentários
            </DialogTitle>
            <DialogDescription>
              Use templates para agilizar seus comentários frequentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Botão adicionar template */}
            <Button
              variant="outline"
              onClick={() => setShowAddTemplate(true)}
              className="w-full border-dashed border-2 border-green-300 text-green-700 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Template
            </Button>

            {/* Lista de templates */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum template criado ainda</p>
                  <p className="text-sm">Crie templates para agilizar seus comentários</p>
                </div>
              ) : (
                templates.map((template: any) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleUsarTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{template.titulo}</h4>
                          {template.categoria && (
                            <Badge variant="secondary" className="text-xs">
                              {template.categoria}
                            </Badge>
                          )}
                          {template.publico && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                              Público
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.texto}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Usado {template.vezesUsado || 0} vez(es)
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditandoTemplate(template);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            excluirTemplateMutation.mutate({ id: template.id });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Template */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={novoTemplate.titulo}
                onChange={(e) => setNovoTemplate({ ...novoTemplate, titulo: e.target.value })}
                placeholder="Ex: Confirmação de recebimento"
              />
            </div>
            <div>
              <Label>Texto do Template *</Label>
              <Textarea
                value={novoTemplate.texto}
                onChange={(e) => setNovoTemplate({ ...novoTemplate, texto: e.target.value })}
                placeholder="Texto que será inserido no comentário..."
                rows={4}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={novoTemplate.categoria}
                onChange={(e) => setNovoTemplate({ ...novoTemplate, categoria: e.target.value })}
                placeholder="Ex: Manutenção, Financeiro, Geral"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="template-publico"
                checked={novoTemplate.publico}
                onChange={(e) => setNovoTemplate({ ...novoTemplate, publico: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="template-publico" className="text-sm">
                Compartilhar com toda a equipe
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTemplate(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarTemplate}
              disabled={criarTemplateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {criarTemplateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Criar Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Lembretes */}
      <Dialog open={showLembretes} onOpenChange={setShowLembretes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlarmClock className="w-5 h-5 text-amber-600" />
              Lembretes da Timeline
            </DialogTitle>
            <DialogDescription>
              Agende lembretes para acompanhamento desta timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddLembrete(true)}
                className="flex-1 border-dashed border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar Novo Lembrete
              </Button>
              <Button
                variant="outline"
                onClick={handleExportarCalendario}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                title="Exportar para arquivo .ics"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar .ics
              </Button>
            </div>

            {/* Lista de lembretes */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lembretes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlarmClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum lembrete agendado</p>
                  <p className="text-sm">Agende lembretes para não esquecer de acompanhar</p>
                </div>
              ) : (
                lembretes.map((lembrete: any) => (
                  <div
                    key={lembrete.id}
                    className={`border rounded-lg p-4 ${
                      lembrete.status === "cancelado" ? "bg-gray-100 opacity-60" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{lembrete.titulo}</h4>
                          <Badge
                            variant={lembrete.status === "pendente" ? "default" : "secondary"}
                            className={`text-xs ${
                              lembrete.status === "pendente"
                                ? "bg-amber-100 text-amber-700"
                                : lembrete.status === "enviado"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {lembrete.status === "pendente" && "Pendente"}
                            {lembrete.status === "enviado" && "Enviado"}
                            {lembrete.status === "cancelado" && "Cancelado"}
                          </Badge>
                          {lembrete.recorrente && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                              <Repeat className="w-3 h-3 mr-1" />
                              {lembrete.intervaloRecorrencia}
                            </Badge>
                          )}
                        </div>
                        {lembrete.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{lembrete.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {new Date(lembrete.dataLembrete).toLocaleString("pt-BR")}
                          </span>
                          {lembrete.notificarEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Email
                            </span>
                          )}
                          {lembrete.notificarPush && (
                            <span className="flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              Push
                            </span>
                          )}
                        </div>
                      </div>
                      {lembrete.status === "pendente" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/trpc/timeline.gerarLinkGoogleCalendar?input=${encodeURIComponent(JSON.stringify({ lembreteId: lembrete.id }))}`);
                                const data = await res.json();
                                if (data.result?.data?.url) {
                                  window.open(data.result.data.url, "_blank");
                                }
                              } catch (e) {
                                toast.error("Erro ao gerar link do Google Calendar");
                              }
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Adicionar ao Google Calendar"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditandoLembrete(lembrete)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelarLembreteMutation.mutate({ id: lembrete.id })}
                            className="text-amber-600 hover:text-amber-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirLembreteMutation.mutate({ id: lembrete.id })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLembretes(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Relatório de Atividades */}
      <Dialog open={showRelatorio} onOpenChange={setShowRelatorio}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Relatório de Atividades
            </DialogTitle>
            <DialogDescription>
              Visualize as atividades da timeline por período
            </DialogDescription>
          </DialogHeader>
          
          {/* Seletor de período */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label>Mês:</Label>
              <Select value={String(relatorioMes)} onValueChange={(v) => setRelatorioMes(Number(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(2024, i).toLocaleString("pt-BR", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Ano:</Label>
              <Select value={String(relatorioAno)} onValueChange={(v) => setRelatorioAno(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => (
                    <SelectItem key={i} value={String(new Date().getFullYear() - 2 + i)}>
                      {new Date().getFullYear() - 2 + i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {carregandoRelatorio ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
              <p className="text-gray-500 mt-2">Gerando relatório...</p>
            </div>
          ) : relatorio ? (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-3">
                  Resumo de {relatorio.periodo.mesNome} de {relatorio.periodo.ano}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{relatorio.resumo.totalTimelines}</p>
                    <p className="text-sm text-gray-600">Timelines Criadas</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{relatorio.resumo.totalComentarios}</p>
                    <p className="text-sm text-gray-600">Comentários</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{relatorio.resumo.mediaComentariosPorTimeline}</p>
                    <p className="text-sm text-gray-600">Média por Timeline</p>
                  </div>
                </div>
              </div>

              {/* Por Status */}
              {Object.keys(relatorio.timelinesPorStatus).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Timelines por Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(relatorio.timelinesPorStatus).map(([status, count]) => (
                      <Badge key={status} variant="secondary" className="px-3 py-1">
                        {status}: {count as number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Por Prioridade */}
              {Object.keys(relatorio.timelinesPorPrioridade).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Timelines por Prioridade</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(relatorio.timelinesPorPrioridade).map(([prioridade, count]) => (
                      <Badge key={prioridade} variant="secondary" className="px-3 py-1">
                        {prioridade}: {count as number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Participantes */}
              {relatorio.topParticipantes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Top 5 Participantes
                  </h4>
                  <div className="space-y-2">
                    {relatorio.topParticipantes.map((p: any, idx: number) => (
                      <div key={p.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-700">{p.nome}</span>
                        </div>
                        <span className="text-sm font-medium text-indigo-600">{p.comentarios} comentários</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Timelines */}
              {relatorio.topTimelines.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Timelines Mais Ativas
                  </h4>
                  <div className="space-y-2">
                    {relatorio.topTimelines.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.titulo}</p>
                          <p className="text-xs text-gray-500">Protocolo: {t.protocolo}</p>
                        </div>
                        <Badge variant="secondary">{t.comentarios} comentários</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um período para gerar o relatório</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelatorio(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Lembrete */}
      <Dialog open={showAddLembrete} onOpenChange={setShowAddLembrete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Novo Lembrete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={novoLembrete.titulo}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, titulo: e.target.value })}
                placeholder="Ex: Verificar andamento da manutenção"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novoLembrete.descricao}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, descricao: e.target.value })}
                placeholder="Detalhes adicionais do lembrete..."
                rows={2}
              />
            </div>
            <div>
              <Label>Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={novoLembrete.dataLembrete}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, dataLembrete: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lembrete-email"
                  checked={novoLembrete.notificarEmail}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, notificarEmail: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="lembrete-email" className="text-sm flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lembrete-push"
                  checked={novoLembrete.notificarPush}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, notificarPush: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="lembrete-push" className="text-sm flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  Push
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lembrete-recorrente"
                checked={novoLembrete.recorrente}
                onChange={(e) => setNovoLembrete({ ...novoLembrete, recorrente: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="lembrete-recorrente" className="text-sm">
                Lembrete recorrente
              </Label>
            </div>
            {novoLembrete.recorrente && (
              <div>
                <Label>Intervalo de Recorrência</Label>
                <Select
                  value={novoLembrete.intervaloRecorrencia}
                  onValueChange={(value) => setNovoLembrete({ ...novoLembrete, intervaloRecorrencia: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLembrete(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarLembrete}
              disabled={criarLembreteMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {criarLembreteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Agendar Lembrete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

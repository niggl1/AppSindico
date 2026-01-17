import { useState } from "react";
// DashboardLayout removido - usando layout do Dashboard principal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { TarefaFacilModal } from "@/components/TarefaFacilModal";
import { toast } from "sonner";
import { 
  Zap, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ImageIcon
} from "lucide-react";

type TipoTarefa = "vistoria" | "manutencao" | "ocorrencia" | "antes_depois";
type StatusTarefa = "rascunho" | "pendente" | "em_andamento" | "concluido" | "cancelado";

const TIPOS_CONFIG = {
  vistoria: {
    label: "Vistoria",
    icon: ClipboardCheck,
    cor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  manutencao: {
    label: "Manutenção",
    icon: Wrench,
    cor: "bg-purple-100 text-purple-700 border-purple-200",
  },
  ocorrencia: {
    label: "Ocorrência",
    icon: AlertTriangle,
    cor: "bg-red-100 text-red-700 border-red-200",
  },
  antes_depois: {
    label: "Antes/Depois",
    icon: ArrowLeftRight,
    cor: "bg-green-100 text-green-700 border-green-200",
  },
};

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", cor: "bg-gray-100 text-gray-700", icon: Clock },
  pendente: { label: "Pendente", cor: "bg-yellow-100 text-yellow-700", icon: Clock },
  em_andamento: { label: "Em Andamento", cor: "bg-blue-100 text-blue-700", icon: Loader2 },
  concluido: { label: "Concluído", cor: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelado: { label: "Cancelado", cor: "bg-red-100 text-red-700", icon: XCircle },
};

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", cor: "bg-green-100 text-green-700" },
  media: { label: "Média", cor: "bg-yellow-100 text-yellow-700" },
  alta: { label: "Alta", cor: "bg-orange-100 text-orange-700" },
  urgente: { label: "Urgente", cor: "bg-red-100 text-red-700" },
};

export default function TarefasFacilPage() {
  const { user } = useAuth();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoTarefa | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<StatusTarefa | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const utils = trpc.useUtils();

  // Buscar condomínios do usuário
  const condominiosQuery = trpc.condominio.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Selecionar primeiro condomínio automaticamente
  if (!condominioId && condominiosQuery.data && condominiosQuery.data.length > 0) {
    setCondominioId(condominiosQuery.data[0].id);
  }

  // Buscar tarefas
  const tarefasQuery = trpc.tarefaFacil.listar.useQuery(
    {
      condominioId: condominioId!,
      tipo: filtroTipo !== "todos" ? filtroTipo : undefined,
      status: filtroStatus !== "todos" ? filtroStatus : undefined,
      limite: 100,
    },
    { enabled: !!condominioId }
  );

  // Buscar estatísticas
  const estatisticasQuery = trpc.tarefaFacil.estatisticas.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Atualizar status
  const atualizarTarefa = trpc.tarefaFacil.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Tarefa atualizada!");
      utils.tarefaFacil.listar.invalidate();
      utils.tarefaFacil.estatisticas.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Excluir tarefa
  const excluirTarefa = trpc.tarefaFacil.excluir.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída!");
      utils.tarefaFacil.listar.invalidate();
      utils.tarefaFacil.estatisticas.invalidate();
      setModalDetalhes(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Filtrar tarefas por busca
  const tarefasFiltradas = tarefasQuery.data?.tarefas.filter(tarefa => {
    if (!busca) return true;
    const termoBusca = busca.toLowerCase();
    return (
      tarefa.titulo.toLowerCase().includes(termoBusca) ||
      tarefa.protocolo.toLowerCase().includes(termoBusca) ||
      tarefa.descricao?.toLowerCase().includes(termoBusca)
    );
  }) || [];

  // Calcular totais
  const stats = estatisticasQuery.data;
  const totalGeral = stats ? 
    stats.vistoria.total + stats.manutencao.total + stats.ocorrencia.total + stats.antes_depois.total : 0;

  const formatarData = (data: Date | string | null) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!condominioId) {
    return (
      <div className="flex items-center justify-center h-64 min-h-screen">
        <p className="text-muted-foreground">Selecione um condomínio para continuar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 min-h-screen">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-orange-500">
              <Zap className="w-7 h-7" />
              Registro Rápido
            </h1>
            <p className="text-muted-foreground">Registros rápidos de vistorias, manutenções, ocorrências e antes/depois</p>
          </div>
          <Button 
            onClick={() => setModalAberto(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro Rápido
          </Button>
        </div>

        {/* Seletor de Condomínio */}
        {condominiosQuery.data && condominiosQuery.data.length > 1 && (
          <Select 
            value={condominioId?.toString()} 
            onValueChange={(v) => setCondominioId(parseInt(v))}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Selecione o condomínio" />
            </SelectTrigger>
            <SelectContent>
              {condominiosQuery.data.map((cond: { id: number; nome: string }) => (
                <SelectItem key={cond.id} value={cond.id.toString()}>
                  {cond.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(TIPOS_CONFIG) as TipoTarefa[]).map((tipo) => {
            const config = TIPOS_CONFIG[tipo];
            const Icon = config.icon;
            const total = stats?.[tipo]?.total || 0;
            const pendentes = (stats?.[tipo]?.pendente || 0) + (stats?.[tipo]?.em_andamento || 0);
            
            return (
              <Card 
                key={tipo} 
                className={`cursor-pointer transition-all hover:shadow-md ${filtroTipo === tipo ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setFiltroTipo(filtroTipo === tipo ? "todos" : tipo)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${config.cor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    {pendentes > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {pendentes} pendente(s)
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, protocolo ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusTarefa | "todos")}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <Badge className={config.cor}>{config.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Histórico de Registros
              <Badge variant="secondary">{tarefasFiltradas.length} registro(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tarefasQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : tarefasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 text-orange-200" />
                <p>Nenhum registro encontrado</p>
                <Button 
                  variant="link" 
                  onClick={() => setModalAberto(true)}
                  className="text-orange-500"
                >
                  Criar primeiro registro
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tarefasFiltradas.map((tarefa) => {
                  const tipoConfig = TIPOS_CONFIG[tarefa.tipo as TipoTarefa];
                  const statusConfig = STATUS_CONFIG[tarefa.status as StatusTarefa];
                  const prioridadeConfig = PRIORIDADE_CONFIG[tarefa.prioridade as keyof typeof PRIORIDADE_CONFIG];
                  const TipoIcon = tipoConfig?.icon || ClipboardCheck;
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
                    <div 
                      key={tarefa.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setTarefaSelecionada(tarefa);
                        setModalDetalhes(true);
                      }}
                    >
                      <div className={`p-2 rounded-lg ${tipoConfig?.cor || 'bg-gray-100'}`}>
                        <TipoIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{tarefa.titulo}</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {tarefa.protocolo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatarData(tarefa.createdAt)}
                          {tarefa.endereco && (
                            <>
                              <MapPin className="w-3 h-3 ml-2" />
                              <span className="truncate max-w-[150px]">{tarefa.endereco}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tarefa.imagens && (tarefa.imagens as string[]).length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {(tarefa.imagens as string[]).length}
                          </Badge>
                        )}
                        <Badge className={prioridadeConfig?.cor || 'bg-gray-100'}>
                          {prioridadeConfig?.label || tarefa.prioridade}
                        </Badge>
                        <Badge className={statusConfig?.cor || 'bg-gray-100'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig?.label || tarefa.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Novo Registro */}
      <TarefaFacilModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        condominioId={condominioId}
      />

      {/* Modal de Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Detalhes do Registro
            </DialogTitle>
          </DialogHeader>

          {tarefaSelecionada && (
            <div className="space-y-4">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{tarefaSelecionada.titulo}</h3>
                  <Badge variant="outline" className="font-mono mt-1">
                    {tarefaSelecionada.protocolo}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge className={TIPOS_CONFIG[tarefaSelecionada.tipo as TipoTarefa]?.cor}>
                    {TIPOS_CONFIG[tarefaSelecionada.tipo as TipoTarefa]?.label}
                  </Badge>
                  <Badge className={STATUS_CONFIG[tarefaSelecionada.status as StatusTarefa]?.cor}>
                    {STATUS_CONFIG[tarefaSelecionada.status as StatusTarefa]?.label}
                  </Badge>
                </div>
              </div>

              {/* Descrição */}
              {tarefaSelecionada.descricao && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="mt-1">{tarefaSelecionada.descricao}</p>
                </div>
              )}

              {/* Imagens */}
              {tarefaSelecionada.tipo === "antes_depois" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Antes</p>
                    {tarefaSelecionada.imagemAntes ? (
                      <img 
                        src={tarefaSelecionada.imagemAntes} 
                        alt="Antes" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Depois</p>
                    {tarefaSelecionada.imagemDepois ? (
                      <img 
                        src={tarefaSelecionada.imagemDepois} 
                        alt="Depois" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ) : tarefaSelecionada.imagens && (tarefaSelecionada.imagens as string[]).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Imagens</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(tarefaSelecionada.imagens as string[]).map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Imagem ${idx + 1}`} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Localização */}
              {tarefaSelecionada.endereco && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localização</p>
                    <p className="text-sm">{tarefaSelecionada.endereco}</p>
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Criado em</p>
                  <p>{formatarData(tarefaSelecionada.createdAt)}</p>
                </div>
                {tarefaSelecionada.enviadoEm && (
                  <div>
                    <p className="font-medium text-muted-foreground">Enviado em</p>
                    <p>{formatarData(tarefaSelecionada.enviadoEm)}</p>
                  </div>
                )}
                {tarefaSelecionada.concluidoEm && (
                  <div>
                    <p className="font-medium text-muted-foreground">Concluído em</p>
                    <p>{formatarData(tarefaSelecionada.concluidoEm)}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <Select 
                  value={tarefaSelecionada.status}
                  onValueChange={(v) => {
                    atualizarTarefa.mutate({ id: tarefaSelecionada.id, status: v as StatusTarefa });
                    setTarefaSelecionada({ ...tarefaSelecionada, status: v });
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <Badge className={config.cor}>{config.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                      excluirTarefa.mutate({ id: tarefaSelecionada.id });
                    }
                  }}
                  disabled={excluirTarefa.isPending}
                >
                  {excluirTarefa.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

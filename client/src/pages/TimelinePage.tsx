import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Wrench, 
  Eye, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText, 
  Zap,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
  MapPin
} from "lucide-react";
import { useLocation } from "wouter";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineEvent {
  id: number;
  tipo: "vistoria" | "manutencao" | "ocorrencia" | "checklist" | "ordem_servico" | "registro_rapido";
  titulo: string;
  descricao?: string | null;
  status: string;
  prioridade?: string | null;
  responsavel?: string | null;
  localizacao?: string | null;
  dataEvento: Date;
  dataCriacao: Date;
}

const tipoConfig = {
  vistoria: {
    icone: Eye,
    cor: "from-orange-500 to-orange-600",
    bgCor: "bg-orange-500/20",
    textCor: "text-orange-400",
    borderCor: "border-orange-500/30",
    label: "Vistoria"
  },
  manutencao: {
    icone: Wrench,
    cor: "from-green-500 to-green-600",
    bgCor: "bg-green-500/20",
    textCor: "text-green-400",
    borderCor: "border-green-500/30",
    label: "Manutenção"
  },
  ocorrencia: {
    icone: AlertTriangle,
    cor: "from-red-500 to-red-600",
    bgCor: "bg-red-500/20",
    textCor: "text-red-400",
    borderCor: "border-red-500/30",
    label: "Ocorrência"
  },
  checklist: {
    icone: ClipboardCheck,
    cor: "from-purple-500 to-purple-600",
    bgCor: "bg-purple-500/20",
    textCor: "text-purple-400",
    borderCor: "border-purple-500/30",
    label: "Checklist"
  },
  ordem_servico: {
    icone: FileText,
    cor: "from-blue-500 to-blue-600",
    bgCor: "bg-blue-500/20",
    textCor: "text-blue-400",
    borderCor: "border-blue-500/30",
    label: "Ordem de Serviço"
  },
  registro_rapido: {
    icone: Zap,
    cor: "from-amber-500 to-amber-600",
    bgCor: "bg-amber-500/20",
    textCor: "text-amber-400",
    borderCor: "border-amber-500/30",
    label: "Registro Rápido"
  }
};

const statusConfig: Record<string, { cor: string; bgCor: string }> = {
  pendente: { cor: "text-yellow-400", bgCor: "bg-yellow-500/20" },
  em_andamento: { cor: "text-blue-400", bgCor: "bg-blue-500/20" },
  concluido: { cor: "text-green-400", bgCor: "bg-green-500/20" },
  cancelado: { cor: "text-gray-400", bgCor: "bg-gray-500/20" },
  aberto: { cor: "text-yellow-400", bgCor: "bg-yellow-500/20" },
  fechado: { cor: "text-green-400", bgCor: "bg-green-500/20" }
};

export function TimelinePage() {
  const [, setLocation] = useLocation();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Buscar dados de todas as fontes
  const { data: manutencoes } = trpc.manutencao.list.useQuery({ condominioId: 1 });
  const { data: vistorias } = trpc.vistoria.list.useQuery({ condominioId: 1 });
  const { data: ocorrencias } = trpc.ocorrencia.list.useQuery({ condominioId: 1 });
  const { data: checklists } = trpc.checklist.list.useQuery({ condominioId: 1 });
  const { data: tarefasFacilData } = trpc.tarefaFacil.listar.useQuery({ condominioId: 1 });

  // Combinar todos os eventos numa timeline unificada
  const eventos: TimelineEvent[] = [
    ...(manutencoes?.map((m: any) => ({
      id: m.id,
      tipo: "manutencao" as const,
      titulo: m.titulo,
      descricao: m.descricao,
      status: m.status,
      prioridade: m.prioridade,
      responsavel: m.responsavel,
      localizacao: m.localizacao,
      dataEvento: new Date(m.dataManutencao || m.createdAt),
      dataCriacao: new Date(m.createdAt)
    })) || []),
    ...(vistorias?.map((v: any) => ({
      id: v.id + 10000,
      tipo: "vistoria" as const,
      titulo: v.titulo,
      descricao: v.descricao,
      status: v.status,
      prioridade: v.prioridade,
      responsavel: v.responsavel,
      localizacao: v.localizacao,
      dataEvento: new Date(v.dataVistoria || v.createdAt),
      dataCriacao: new Date(v.createdAt)
    })) || []),
    ...(ocorrencias?.map((o: any) => ({
      id: o.id + 20000,
      tipo: "ocorrencia" as const,
      titulo: o.titulo,
      descricao: o.descricao,
      status: o.status,
      prioridade: o.prioridade,
      responsavel: o.responsavel,
      localizacao: o.localizacao,
      dataEvento: new Date(o.dataOcorrencia || o.createdAt),
      dataCriacao: new Date(o.createdAt)
    })) || []),
    ...(checklists?.map((c: any) => ({
      id: c.id + 30000,
      tipo: "checklist" as const,
      titulo: c.titulo,
      descricao: c.descricao,
      status: c.status,
      prioridade: null,
      responsavel: c.responsavel,
      localizacao: null,
      dataEvento: new Date(c.dataChecklist || c.createdAt),
      dataCriacao: new Date(c.createdAt)
    })) || []),
    ...(tarefasFacilData?.tarefas?.map((t: any) => ({
      id: t.id + 40000,
      tipo: "registro_rapido" as const,
      titulo: t.titulo,
      descricao: t.descricao,
      status: t.status,
      prioridade: t.prioridade,
      responsavel: t.responsavel,
      localizacao: t.localizacao,
      dataEvento: new Date(t.createdAt),
      dataCriacao: new Date(t.createdAt)
    })) || [])
  ];

  // Ordenar por data (mais recente primeiro)
  const eventosOrdenados = eventos.sort((a, b) => 
    b.dataEvento.getTime() - a.dataEvento.getTime()
  );

  // Aplicar filtros
  const eventosFiltrados = eventosOrdenados.filter(evento => {
    if (filtroTipo !== "todos" && evento.tipo !== filtroTipo) return false;
    if (filtroStatus !== "todos" && evento.status !== filtroStatus) return false;
    if (busca && !evento.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  // Agrupar por período
  const grupos: { [key: string]: TimelineEvent[] } = {};
  eventosFiltrados.forEach(evento => {
    let grupo: string;
    if (isToday(evento.dataEvento)) {
      grupo = "Hoje";
    } else if (isYesterday(evento.dataEvento)) {
      grupo = "Ontem";
    } else if (isThisWeek(evento.dataEvento)) {
      grupo = "Esta Semana";
    } else if (isThisMonth(evento.dataEvento)) {
      grupo = "Este Mês";
    } else {
      grupo = format(evento.dataEvento, "MMMM yyyy", { locale: ptBR });
    }
    
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(evento);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setLocation("/modulo/manutencoes")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="h-7 w-7" />
                  Timeline de Atividades
                </h1>
                <p className="text-indigo-100 text-sm">
                  Visualização cronológica de todas as operações
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 px-3 py-1">
              {eventosFiltrados.length} eventos
            </Badge>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-white/5 backdrop-blur border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Buscar por título..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="vistoria">Vistorias</SelectItem>
                  <SelectItem value="manutencao">Manutenções</SelectItem>
                  <SelectItem value="ocorrencia">Ocorrências</SelectItem>
                  <SelectItem value="checklist">Checklists</SelectItem>
                  <SelectItem value="registro_rapido">Registro Rápido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="container mx-auto px-4 pb-8">
        {Object.entries(grupos).length === 0 ? (
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento encontrado</h3>
              <p className="text-white/60">
                Não há eventos que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grupos).map(([grupo, eventosGrupo]) => (
            <div key={grupo} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">{grupo}</h2>
                <Badge variant="secondary" className="bg-white/10 text-white/70 border-0">
                  {eventosGrupo.length}
                </Badge>
              </div>
              
              <div className="relative pl-8 border-l-2 border-white/20 space-y-4">
                {eventosGrupo.map((evento) => {
                  const config = tipoConfig[evento.tipo];
                  const Icon = config.icone;
                  const statusStyle = statusConfig[evento.status] || statusConfig.pendente;
                  const isExpanded = expandedId === evento.id;

                  return (
                    <div key={evento.id} className="relative">
                      {/* Marcador na linha */}
                      <div className={`absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br ${config.cor}`} />
                      
                      <Card 
                        className={`bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all cursor-pointer ${config.borderCor}`}
                        onClick={() => setExpandedId(isExpanded ? null : evento.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${config.cor} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${config.bgCor} ${config.textCor} border-0`}>
                                    {config.label}
                                  </Badge>
                                  <Badge className={`${statusStyle.bgCor} ${statusStyle.cor} border-0`}>
                                    {evento.status.replace("_", " ")}
                                  </Badge>
                                  {evento.prioridade && (
                                    <Badge variant="outline" className="border-white/20 text-white/70">
                                      {evento.prioridade}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                  <span>{format(evento.dataEvento, "HH:mm", { locale: ptBR })}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                              <h3 className="font-semibold text-white mt-2">{evento.titulo}</h3>
                              <p className="text-sm text-white/50 mt-1">
                                {formatDistanceToNow(evento.dataEvento, { addSuffix: true, locale: ptBR })}
                              </p>
                              
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                  {evento.descricao && (
                                    <p className="text-white/70">{evento.descricao}</p>
                                  )}
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {evento.responsavel && (
                                      <div className="flex items-center gap-2 text-white/60">
                                        <User className="h-4 w-4" />
                                        <span>{evento.responsavel}</span>
                                      </div>
                                    )}
                                    {evento.localizacao && (
                                      <div className="flex items-center gap-2 text-white/60">
                                        <MapPin className="h-4 w-4" />
                                        <span>{evento.localizacao}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-white/60">
                                      <Calendar className="h-4 w-4" />
                                      <span>{format(evento.dataCriacao, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TimelinePage;

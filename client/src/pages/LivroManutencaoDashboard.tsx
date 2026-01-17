import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Calendar,
  User,
  Activity,
  Zap,
  ArrowLeft,
  BookOpen,
  FileText,
  Send
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Cores para os gráficos
const CORES_STATUS = [
  "#22c55e", // Verde
  "#3b82f6", // Azul
  "#f59e0b", // Amarelo
  "#ef4444", // Vermelho
  "#8b5cf6", // Roxo
  "#06b6d4", // Ciano
];

interface LivroManutencaoDashboardProps {
  condominioId?: number;
}

export default function LivroManutencaoDashboard({ condominioId: propCondominioId }: LivroManutencaoDashboardProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Buscar condomínio ativo do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioAtivo = condominios?.[0];
  const condominioId = propCondominioId || condominioAtivo?.id || 0;

  // Buscar estatísticas básicas
  const { data: estatisticas, isLoading: loadingEstatisticas, refetch: refetchEstatisticas } = 
    trpc.timelineLivro.estatisticas.useQuery({ condominioId }, { enabled: condominioId > 0 });

  // Buscar timelines para calcular estatísticas adicionais
  const { data: timelinesData, isLoading: loadingTimelines, refetch: refetchTimelines } = 
    trpc.timelineLivro.listar.useQuery({ condominioId }, { enabled: condominioId > 0 });

  // Buscar configurações para os gráficos
  const { data: statusList = [] } = trpc.timelineLivro.listarStatus.useQuery({ condominioId }, { enabled: condominioId > 0 });
  const { data: prioridades = [] } = trpc.timelineLivro.listarPrioridades.useQuery({ condominioId }, { enabled: condominioId > 0 });
  const { data: responsaveis = [] } = trpc.timelineLivro.listarResponsaveis.useQuery({ condominioId }, { enabled: condominioId > 0 });

  const handleRefresh = () => {
    refetchEstatisticas();
    refetchTimelines();
  };

  // Calcular estatísticas a partir dos dados
  const stats = useMemo(() => {
    const timelines = timelinesData?.timelines || [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return {
      total: estatisticas?.total || 0,
      rascunhos: estatisticas?.rascunhos || 0,
      enviados: estatisticas?.enviados || 0,
      registados: estatisticas?.registados || 0,
      criadasHoje: timelines.filter(t => {
        const data = new Date(t.createdAt);
        data.setHours(0, 0, 0, 0);
        return data.getTime() === hoje.getTime();
      }).length,
      urgentes: timelines.filter(t => {
        const prioridade = prioridades.find(p => p.id === t.prioridadeId);
        return prioridade?.nivel && prioridade.nivel >= 4;
      }).length,
    };
  }, [estatisticas, timelinesData, prioridades]);

  // Calcular distribuição por status
  const porStatus = useMemo(() => {
    const timelines = timelinesData?.timelines || [];
    const contagem: Record<number, number> = {};
    
    timelines.forEach(t => {
      if (t.statusId) {
        contagem[t.statusId] = (contagem[t.statusId] || 0) + 1;
      }
    });

    return statusList.map(s => ({
      nome: s.nome,
      quantidade: contagem[s.id] || 0,
      cor: s.cor || "#6b7280"
    })).filter(s => s.quantidade > 0);
  }, [timelinesData, statusList]);

  // Calcular distribuição por prioridade
  const porPrioridade = useMemo(() => {
    const timelines = timelinesData?.timelines || [];
    const contagem: Record<number, number> = {};
    
    timelines.forEach(t => {
      if (t.prioridadeId) {
        contagem[t.prioridadeId] = (contagem[t.prioridadeId] || 0) + 1;
      }
    });

    return prioridades.map(p => ({
      nome: p.nome,
      quantidade: contagem[p.id] || 0,
      cor: p.cor || "#6b7280"
    })).filter(p => p.quantidade > 0);
  }, [timelinesData, prioridades]);

  // Calcular distribuição por responsável
  const porResponsavel = useMemo(() => {
    const timelines = timelinesData?.timelines || [];
    const contagem: Record<number, number> = {};
    
    timelines.forEach(t => {
      if (t.responsavelId) {
        contagem[t.responsavelId] = (contagem[t.responsavelId] || 0) + 1;
      }
    });

    return responsaveis.map(r => ({
      nome: r.nome,
      quantidade: contagem[r.id] || 0,
    })).filter(r => r.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);
  }, [timelinesData, responsaveis]);

  // Renderizar gráfico de pizza simples com CSS
  const renderGraficoPizza = (dados: { nome: string; quantidade: number; cor?: string }[]) => {
    const total = dados.reduce((acc, d) => acc + d.quantidade, 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Sem dados para exibir</p>
        </div>
      );
    }

    let acumulado = 0;
    const segmentos = dados.map((d, i) => {
      const percentual = (d.quantidade / total) * 100;
      const inicio = acumulado;
      acumulado += percentual;
      return { ...d, percentual, inicio, fim: acumulado, cor: d.cor || CORES_STATUS[i % CORES_STATUS.length] };
    });

    const gradiente = segmentos
      .map(s => `${s.cor} ${s.inicio}% ${s.fim}%`)
      .join(", ");

    return (
      <div className="flex items-center gap-6">
        <div 
          className="w-40 h-40 rounded-full shadow-lg flex-shrink-0"
          style={{ background: `conic-gradient(${gradiente})` }}
        />
        <div className="flex flex-col gap-2">
          {segmentos.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
              <span className="text-gray-700 dark:text-gray-300 truncate">{s.nome}</span>
              <span className="font-semibold">{s.quantidade}</span>
              <span className="text-gray-500">({s.percentual.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar gráfico de barras simples com CSS
  const renderGraficoBarras = (dados: { nome: string; quantidade: number; cor?: string }[], corBase: string = "#f97316") => {
    const maxValor = Math.max(...dados.map(d => d.quantidade), 1);
    
    if (dados.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Sem dados para exibir</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {dados.map((d, i) => {
          const largura = (d.quantidade / maxValor) * 100;
          const cor = d.cor || corBase;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.nome}</span>
                <span className="font-semibold">{d.quantidade}</span>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${largura}%`, backgroundColor: cor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!condominioId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Selecione um condomínio para visualizar o dashboard.</p>
      </div>
    );
  }

  const isLoading = loadingEstatisticas || loadingTimelines;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-500" />
            Dashboard - Livro de Manutenção
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral e estatísticas do livro de manutenção
          </p>
        </div>
        
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                )}
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Rascunhos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.rascunhos}</p>
                )}
              </div>
              <FileText className="w-8 h-8 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Enviados</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.enviados}</p>
                )}
              </div>
              <Send className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Registados</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.registados}</p>
                )}
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Criadas Hoje</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.criadasHoje}</p>
                )}
              </div>
              <Zap className="w-8 h-8 text-cyan-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Urgentes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.urgentes}</p>
                )}
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-orange-500" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Skeleton className="w-40 h-40 rounded-full" />
              </div>
            ) : (
              renderGraficoPizza(porStatus)
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              renderGraficoBarras(porPrioridade)
            )}
          </CardContent>
        </Card>

        {/* Top Responsáveis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-orange-500" />
              Top 5 Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              renderGraficoBarras(porResponsavel, "#8b5cf6")
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/livro-manutencao">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Zap className="w-4 h-4 mr-2" />
            Novo Registro
          </Button>
        </Link>
        <Link href="/dashboard/livro-manutencao-historico">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Ver Histórico
          </Button>
        </Link>
      </div>
    </div>
  );
}

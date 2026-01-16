import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wrench, 
  ClipboardCheck, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Users, 
  Clock, 
  Zap,
  ArrowLeft,
  LayoutDashboard,
  Settings,
  ChevronRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Puzzle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

// Módulos do Portal de Manutenções
const modulosOperacionais = [
  {
    id: "dashboard",
    nome: "Dashboard",
    descricao: "Visão geral de todas as operações",
    icone: LayoutDashboard,
    cor: "from-slate-500 to-slate-600",
    path: "/modulo/manutencoes",
    badge: null
  },
  {
    id: "manutencoes",
    nome: "Manutenções",
    descricao: "Gestão de manutenções preventivas e corretivas",
    icone: Wrench,
    cor: "from-green-500 to-green-600",
    path: "/dashboard/manutencoes",
    badge: "pendentes"
  },
  {
    id: "vistorias",
    nome: "Vistorias",
    descricao: "Inspeções programadas de áreas comuns",
    icone: Eye,
    cor: "from-orange-500 to-orange-600",
    path: "/dashboard/vistorias",
    badge: "pendentes"
  },
  {
    id: "ocorrencias",
    nome: "Ocorrências",
    descricao: "Registro de problemas e incidentes",
    icone: AlertTriangle,
    cor: "from-red-500 to-red-600",
    path: "/dashboard/ocorrencias",
    badge: "pendentes"
  },
  {
    id: "checklists",
    nome: "Checklists",
    descricao: "Listas de verificação para rondas e tarefas",
    icone: ClipboardCheck,
    cor: "from-purple-500 to-purple-600",
    path: "/dashboard/checklists",
    badge: "pendentes"
  },
  {
    id: "ordens-servico",
    nome: "Ordens de Serviço",
    descricao: "Controle de serviços e fornecedores",
    icone: FileText,
    cor: "from-blue-500 to-blue-600",
    path: "/dashboard/ordens-servico",
    badge: "abertas"
  },
  {
    id: "registro-rapido",
    nome: "Registro Rápido",
    descricao: "Registro simplificado com foto e GPS",
    icone: Zap,
    cor: "from-amber-500 to-amber-600",
    path: "/dashboard/tarefas-facil",
    badge: null
  },
  {
    id: "equipe",
    nome: "Gestão de Equipes",
    descricao: "Membros e funcionários do condomínio",
    icone: Users,
    cor: "from-cyan-500 to-cyan-600",
    path: "/dashboard/membros-equipe",
    badge: null
  },
  {
    id: "timeline",
    nome: "Timeline",
    descricao: "Visualização cronológica de atividades",
    icone: Clock,
    cor: "from-indigo-500 to-indigo-600",
    path: "/dashboard/timeline",
    badge: null
  },
  {
    id: "construtor-app",
    nome: "Construtor de App",
    descricao: "Personalize as funções do seu condomínio",
    icone: Puzzle,
    cor: "from-violet-500 to-violet-600",
    path: "/dashboard/construtor-app",
    badge: null
  },
  {
    id: "relatorios",
    nome: "Relatórios",
    descricao: "Gere relatórios profissionais personalizados",
    icone: BarChart3,
    cor: "from-emerald-500 to-emerald-600",
    path: "/dashboard/relatorios/novo",
    badge: null
  },
  {
    id: "livro-manutencao",
    nome: "Livro de Manutenção",
    descricao: "Histórico completo de todas as atividades",
    icone: BookOpen,
    cor: "from-teal-500 to-teal-600",
    path: "/dashboard/timeline",
    badge: null
  }
];

export default function PortalManutencoes() {
  const [, setLocation] = useLocation();
  
  // Buscar estatísticas
  const { data: statsManutencoes } = trpc.manutencao.list.useQuery({ condominioId: 1 });
  const { data: statsVistorias } = trpc.vistoria.list.useQuery({ condominioId: 1 });
  const { data: statsOcorrencias } = trpc.ocorrencia.list.useQuery({ condominioId: 1 });
  const { data: statsChecklists } = trpc.checklist.list.useQuery({ condominioId: 1 });

  // Calcular totais
  const totalPendentes = {
    manutencoes: statsManutencoes?.filter((m: any) => m.status === "pendente").length || 0,
    vistorias: statsVistorias?.filter((v: any) => v.status === "pendente").length || 0,
    ocorrencias: statsOcorrencias?.filter((o: any) => o.status === "pendente").length || 0,
    checklists: statsChecklists?.filter((c: any) => c.status === "pendente").length || 0,
  };

  const totalGeral = totalPendentes.manutencoes + totalPendentes.vistorias + totalPendentes.ocorrencias + totalPendentes.checklists;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header do Portal */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Wrench className="h-7 w-7" />
                  Portal de Manutenções
                </h1>
                <p className="text-orange-100 text-sm">
                  Sistema completo de gestão operacional do condomínio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 px-3 py-1">
                {totalGeral} pendentes
              </Badge>
              <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-orange-50">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Manutenções</p>
                  <p className="text-2xl font-bold">{totalPendentes.manutencoes}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Vistorias</p>
                  <p className="text-2xl font-bold">{totalPendentes.vistorias}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Ocorrências</p>
                  <p className="text-2xl font-bold">{totalPendentes.ocorrencias}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Checklists</p>
                  <p className="text-2xl font-bold">{totalPendentes.checklists}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-400" />
          Módulos Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulosOperacionais.map((modulo) => {
            const Icon = modulo.icone;
            const pendentes = modulo.badge === "pendentes" 
              ? totalPendentes[modulo.id as keyof typeof totalPendentes] || 0
              : 0;
            
            return (
              <Link key={modulo.id} href={modulo.path}>
                <Card className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${modulo.cor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                            {modulo.nome}
                          </h3>
                          {pendentes > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {pendentes}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/60 mt-1 line-clamp-2">
                          {modulo.descricao}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="container mx-auto px-4 pb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300 flex flex-col gap-2"
            onClick={() => setLocation("/dashboard/manutencoes?novo=true")}
          >
            <Wrench className="h-6 w-6" />
            <span className="text-xs">Nova Manutenção</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300 flex flex-col gap-2"
            onClick={() => setLocation("/dashboard/vistorias?novo=true")}
          >
            <Eye className="h-6 w-6" />
            <span className="text-xs">Nova Vistoria</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 flex flex-col gap-2"
            onClick={() => setLocation("/dashboard/ocorrencias?novo=true")}
          >
            <AlertTriangle className="h-6 w-6" />
            <span className="text-xs">Nova Ocorrência</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 flex flex-col gap-2"
            onClick={() => setLocation("/dashboard/tarefas-facil")}
          >
            <Zap className="h-6 w-6" />
            <span className="text-xs">Registro Rápido</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

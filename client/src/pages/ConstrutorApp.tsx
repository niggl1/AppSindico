import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Settings, 
  Save, 
  Search,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Calendar,
  Wrench,
  Users,
  BookOpen,
  Image,
  FolderOpen,
  BarChart3,
  MessageSquare,
  Bell,
  FileText,
  UserCheck,
  CalendarClock,
  CalendarCheck,
  Eye,
  AlertTriangle,
  ClipboardCheck,
  ArrowLeftRight,
  Zap,
  Clock,
  Vote,
  ShoppingBag,
  Car,
  Shield,
  Link,
  Phone,
  Trophy,
  TrendingUp,
  Package,
  UserCog,
  ParkingCircle,
  UserPlus,
  FileBarChart,
  CheckCircle2,
  XCircle,
  Sparkles,
  LayoutGrid
} from "lucide-react";

// Mapeamento de ícones
const iconMap: Record<string, React.ElementType> = {
  Megaphone,
  Calendar,
  Wrench,
  Users,
  BookOpen,
  Image,
  FolderOpen,
  BarChart3,
  MessageSquare,
  Bell,
  FileText,
  UserCheck,
  CalendarClock,
  CalendarCheck,
  Eye,
  Tool: Wrench,
  AlertTriangle,
  ClipboardCheck,
  ArrowLeftRight,
  Zap,
  Clock,
  Vote,
  ShoppingBag,
  Search,
  Car,
  Shield,
  Link,
  Phone,
  Trophy,
  TrendingUp,
  Package,
  UserCog,
  ParkingCircle,
  UserPlus,
  FileBarChart,
  Settings
};

interface Funcao {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  icone: string;
  rota: string;
}

interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

export default function ConstrutorApp() {
  const [busca, setBusca] = useState("");
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<string[]>([]);
  const [funcoesHabilitadas, setFuncoesHabilitadas] = useState<Set<string>>(new Set());
  const [alteracoesPendentes, setAlteracoesPendentes] = useState(false);
  const condominioId = 1; // TODO: Obter do contexto

  // Buscar dados
  const { data: funcoesDisponiveis } = trpc.funcoesCondominio.listarDisponiveis.useQuery();
  const { data: categorias } = trpc.funcoesCondominio.listarCategorias.useQuery();
  const { data: funcoesAtuais, refetch: refetchFuncoes } = trpc.funcoesCondominio.listarHabilitadas.useQuery({ condominioId });

  // Mutation para atualizar
  const atualizarMutation = trpc.funcoesCondominio.atualizarMultiplas.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      setAlteracoesPendentes(false);
      refetchFuncoes();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  // Inicializar funções habilitadas
  useEffect(() => {
    if (funcoesAtuais) {
      setFuncoesHabilitadas(new Set(funcoesAtuais));
    }
  }, [funcoesAtuais]);

  // Toggle categoria expandida
  const toggleCategoria = (categoriaId: string) => {
    setCategoriasExpandidas(prev => 
      prev.includes(categoriaId) 
        ? prev.filter(c => c !== categoriaId)
        : [...prev, categoriaId]
    );
  };

  // Toggle função habilitada
  const toggleFuncao = (funcaoId: string) => {
    setFuncoesHabilitadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(funcaoId)) {
        newSet.delete(funcaoId);
      } else {
        newSet.add(funcaoId);
      }
      return newSet;
    });
    setAlteracoesPendentes(true);
  };

  // Salvar alterações
  const salvarAlteracoes = () => {
    if (!funcoesDisponiveis) return;
    
    const funcoes = funcoesDisponiveis.map((f: Funcao) => ({
      funcaoId: f.id,
      habilitada: funcoesHabilitadas.has(f.id)
    }));

    atualizarMutation.mutate({ condominioId, funcoes });
  };

  // Filtrar funções por busca
  const filtrarFuncoes = (funcoes: Funcao[]) => {
    if (!busca) return funcoes;
    const termoBusca = busca.toLowerCase();
    return funcoes.filter(f => 
      f.nome.toLowerCase().includes(termoBusca) ||
      f.descricao.toLowerCase().includes(termoBusca)
    );
  };

  // Agrupar funções por categoria
  const funcoesPorCategoria = (funcoesDisponiveis || []).reduce((acc: Record<string, Funcao[]>, funcao: Funcao) => {
    if (!acc[funcao.categoria]) {
      acc[funcao.categoria] = [];
    }
    acc[funcao.categoria].push(funcao);
    return acc;
  }, {});

  // Contar funções habilitadas por categoria
  const contarHabilitadas = (categoriaId: string) => {
    const funcoesCategoria = funcoesPorCategoria[categoriaId] || [];
    return funcoesCategoria.filter((f: Funcao) => funcoesHabilitadas.has(f.id)).length;
  };

  // Expandir todas as categorias
  const expandirTodas = () => {
    if (categorias) {
      setCategoriasExpandidas(categorias.map((c: Categoria) => c.id));
    }
  };

  // Recolher todas as categorias
  const recolherTodas = () => {
    setCategoriasExpandidas([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Construtor de App
                </h1>
                <p className="text-indigo-100 text-sm">
                  Personalize as funções disponíveis no seu condomínio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {alteracoesPendentes && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Alterações não salvas
                </Badge>
              )}
              <Button 
                onClick={salvarAlteracoes}
                disabled={!alteracoesPendentes || atualizarMutation.isPending}
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {atualizarMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Total de Funções</p>
                  <p className="text-2xl font-bold">{funcoesDisponiveis?.length || 0}</p>
                </div>
                <LayoutGrid className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Habilitadas</p>
                  <p className="text-2xl font-bold text-green-400">{funcoesHabilitadas.size}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Desabilitadas</p>
                  <p className="text-2xl font-bold text-red-400">
                    {(funcoesDisponiveis?.length || 0) - funcoesHabilitadas.size}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Categorias</p>
                  <p className="text-2xl font-bold">{categorias?.length || 0}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-white/5 backdrop-blur border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Buscar funções..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={expandirTodas}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expandir Todas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={recolherTodas}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Recolher Todas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Categorias e Funções */}
      <div className="container mx-auto px-4 pb-8 space-y-4">
        {(categorias || []).map((categoria: Categoria) => {
          const funcoes = filtrarFuncoes(funcoesPorCategoria[categoria.id] || []);
          const isExpanded = categoriasExpandidas.includes(categoria.id);
          const habilitadas = contarHabilitadas(categoria.id);
          const total = (funcoesPorCategoria[categoria.id] || []).length;
          const Icon = iconMap[categoria.icone] || Settings;

          if (funcoes.length === 0 && busca) return null;

          return (
            <Card key={categoria.id} className="bg-white/5 backdrop-blur border-white/10 overflow-hidden">
              <CardHeader 
                className={`cursor-pointer hover:bg-white/5 transition-colors bg-gradient-to-r ${categoria.cor} bg-opacity-20`}
                onClick={() => toggleCategoria(categoria.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${categoria.cor} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{categoria.nome}</CardTitle>
                      <CardDescription className="text-white/60">
                        {habilitadas} de {total} funções habilitadas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className={`${habilitadas === total ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'} border-0`}
                    >
                      {habilitadas}/{total}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-white/50" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/50" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="p-4 space-y-2">
                  {funcoes.map((funcao: Funcao) => {
                    const FuncaoIcon = iconMap[funcao.icone] || Settings;
                    const isHabilitada = funcoesHabilitadas.has(funcao.id);

                    return (
                      <div 
                        key={funcao.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isHabilitada ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            isHabilitada ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            <FuncaoIcon className={`h-4 w-4 ${isHabilitada ? 'text-green-400' : 'text-white/50'}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${isHabilitada ? 'text-white' : 'text-white/70'}`}>
                              {funcao.nome}
                            </p>
                            <p className="text-xs text-white/50">{funcao.descricao}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isHabilitada}
                          onCheckedChange={() => toggleFuncao(funcao.id)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Smartphone,
  BookOpen,
  FileBarChart,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Building2,
  Calendar,
  Palette,
  Eye,
  Loader2,
  X,
  Megaphone,
  Bell,
  CalendarDays,
  Vote,
  Wrench,
  AlertTriangle,
  Users,
  Car,
  Image,
  Phone,
  Link,
  Shield,
  FileText,
  MessageSquare,
  Star,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  BarChart3,
  PieChart,
  ListChecks,
  ClipboardCheck,
  Award,
  Heart,
  Home,
  Newspaper,
  Video,
  Music,
  Gift,
  Coffee,
  Utensils,
  Dumbbell,
  Waves,
  TreePine,
  Dog,
  Baby,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Hammer,
  Paintbrush,
  Scissors,
  Camera,
  Wifi,
  Zap,
  Droplets,
  Flame,
  Wind,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Thermometer
} from "lucide-react";

// Tipos de projeto
const tiposProjeto = [
  {
    id: "app",
    nome: "App",
    descricao: "Crie um aplicativo personalizado para seu condomínio",
    icon: Smartphone,
    cor: "from-blue-500 to-blue-600",
    corBorda: "border-blue-500",
    corFundo: "bg-blue-50"
  },
  {
    id: "revista",
    nome: "Revista Digital",
    descricao: "Crie uma revista digital interativa com efeito de virar páginas",
    icon: BookOpen,
    cor: "from-purple-500 to-purple-600",
    corBorda: "border-purple-500",
    corFundo: "bg-purple-50"
  },
  {
    id: "relatorio",
    nome: "Relatório",
    descricao: "Gere relatórios detalhados com gráficos e estatísticas",
    icon: FileBarChart,
    cor: "from-emerald-500 to-emerald-600",
    corBorda: "border-emerald-500",
    corFundo: "bg-emerald-50"
  }
];

// Módulos disponíveis por categoria
const modulosDisponiveis = {
  comunicacao: {
    nome: "Comunicação",
    icon: Megaphone,
    modulos: [
      { id: "avisos", nome: "Avisos", icon: Megaphone, descricao: "Avisos importantes do condomínio" },
      { id: "comunicados", nome: "Comunicados", icon: FileText, descricao: "Comunicados oficiais" },
      { id: "notificacoes", nome: "Notificações", icon: Bell, descricao: "Sistema de notificações" },
      { id: "mensagem-sindico", nome: "Mensagem do Síndico", icon: MessageSquare, descricao: "Mensagem personalizada do síndico" },
    ]
  },
  eventos: {
    nome: "Eventos e Agenda",
    icon: CalendarDays,
    modulos: [
      { id: "eventos", nome: "Eventos", icon: CalendarDays, descricao: "Calendário de eventos" },
      { id: "agenda-vencimentos", nome: "Agenda de Vencimentos", icon: Calendar, descricao: "Controle de vencimentos" },
      { id: "assembleia", nome: "Assembleia Online", icon: Users, descricao: "Assembleias virtuais" },
    ]
  },
  votacoes: {
    nome: "Votações e Decisões",
    icon: Vote,
    modulos: [
      { id: "votacoes", nome: "Votações", icon: Vote, descricao: "Sistema de votação" },
      { id: "enquetes", nome: "Enquetes", icon: BarChart3, descricao: "Enquetes rápidas" },
      { id: "funcionario-mes", nome: "Funcionário do Mês", icon: Award, descricao: "Votação de destaque" },
    ]
  },
  operacional: {
    nome: "Operacional",
    icon: Wrench,
    modulos: [
      { id: "manutencoes", nome: "Manutenções", icon: Wrench, descricao: "Controle de manutenções" },
      { id: "vistorias", nome: "Vistorias", icon: ClipboardCheck, descricao: "Registro de vistorias" },
      { id: "ocorrencias", nome: "Ocorrências", icon: AlertTriangle, descricao: "Registro de ocorrências" },
      { id: "checklists", nome: "Checklists", icon: ListChecks, descricao: "Listas de verificação" },
      { id: "melhorias", nome: "Melhorias", icon: TrendingUp, descricao: "Melhorias realizadas" },
      { id: "aquisicoes", nome: "Aquisições", icon: Package, descricao: "Compras do condomínio" },
    ]
  },
  comunidade: {
    nome: "Comunidade",
    icon: Users,
    modulos: [
      { id: "classificados", nome: "Classificados", icon: ShoppingBag, descricao: "Anúncios dos moradores" },
      { id: "achados-perdidos", nome: "Achados e Perdidos", icon: MapPin, descricao: "Itens encontrados" },
      { id: "caronas", nome: "Caronas", icon: Car, descricao: "Compartilhamento de caronas" },
      { id: "pets", nome: "Pets", icon: Dog, descricao: "Animais do condomínio" },
    ]
  },
  moradores: {
    nome: "Moradores e Funcionários",
    icon: Users,
    modulos: [
      { id: "moradores", nome: "Moradores", icon: Users, descricao: "Cadastro de moradores" },
      { id: "funcionarios", nome: "Funcionários", icon: Briefcase, descricao: "Equipe do condomínio" },
      { id: "equipe-gestao", nome: "Equipe de Gestão", icon: Star, descricao: "Síndico e conselho" },
    ]
  },
  areas: {
    nome: "Áreas e Espaços",
    icon: Home,
    modulos: [
      { id: "vagas", nome: "Vagas de Estacionamento", icon: Car, descricao: "Gestão de vagas" },
      { id: "reservas", nome: "Reservas de Espaços", icon: Calendar, descricao: "Agendamento de áreas" },
      { id: "piscina", nome: "Piscina", icon: Waves, descricao: "Informações da piscina" },
      { id: "academia", nome: "Academia", icon: Dumbbell, descricao: "Horários e regras" },
      { id: "salao-festas", nome: "Salão de Festas", icon: Gift, descricao: "Reservas e regras" },
      { id: "churrasqueira", nome: "Churrasqueira", icon: Flame, descricao: "Área de churrasqueira" },
      { id: "playground", nome: "Playground", icon: Baby, descricao: "Área infantil" },
      { id: "quadra", nome: "Quadra Esportiva", icon: Award, descricao: "Quadras e esportes" },
    ]
  },
  documentacao: {
    nome: "Documentação",
    icon: FileText,
    modulos: [
      { id: "regras-normas", nome: "Regras e Normas", icon: FileText, descricao: "Regulamento interno" },
      { id: "dicas-seguranca", nome: "Dicas de Segurança", icon: Shield, descricao: "Orientações de segurança" },
      { id: "documentos", nome: "Documentos", icon: FileText, descricao: "Documentos oficiais" },
      { id: "atas", nome: "Atas de Assembleia", icon: FileText, descricao: "Histórico de atas" },
    ]
  },
  galeria: {
    nome: "Galeria e Mídia",
    icon: Image,
    modulos: [
      { id: "galeria", nome: "Galeria de Fotos", icon: Image, descricao: "Álbuns de fotos" },
      { id: "antes-depois", nome: "Antes e Depois", icon: Camera, descricao: "Comparativos visuais" },
      { id: "videos", nome: "Vídeos", icon: Video, descricao: "Vídeos do condomínio" },
    ]
  },
  informacoes: {
    nome: "Informações",
    icon: Phone,
    modulos: [
      { id: "telefones-uteis", nome: "Telefones Úteis", icon: Phone, descricao: "Contatos importantes" },
      { id: "links-uteis", nome: "Links Úteis", icon: Link, descricao: "Links relevantes" },
      { id: "sobre-condominio", nome: "Sobre o Condomínio", icon: Building2, descricao: "Informações gerais" },
    ]
  },
  publicidade: {
    nome: "Publicidade e Parceiros",
    icon: Newspaper,
    modulos: [
      { id: "anuncios", nome: "Anúncios", icon: Newspaper, descricao: "Espaço publicitário" },
      { id: "parceiros", nome: "Parceiros", icon: Heart, descricao: "Empresas parceiras" },
      { id: "promocoes", nome: "Promoções", icon: Gift, descricao: "Ofertas especiais" },
    ]
  },
  estatisticas: {
    nome: "Estatísticas",
    icon: PieChart,
    modulos: [
      { id: "painel-controlo", nome: "Painel de Controlo", icon: BarChart3, descricao: "Dashboard geral" },
      { id: "relatorios-graficos", nome: "Relatórios Gráficos", icon: PieChart, descricao: "Visualizações" },
      { id: "metricas", nome: "Métricas", icon: TrendingUp, descricao: "Indicadores" },
    ]
  }
};

// Templates visuais
const templatesVisuais = [
  { id: "moderno", nome: "Moderno", descricao: "Design minimalista e contemporâneo", cor: "#3B82F6" },
  { id: "corporativo", nome: "Corporativo", descricao: "Profissional e formal", cor: "#1E40AF" },
  { id: "colorido", nome: "Colorido", descricao: "Vibrante e alegre", cor: "#8B5CF6" },
  { id: "elegante", nome: "Elegante", descricao: "Sofisticado e premium", cor: "#0F172A" },
];

// Paletas de cores
const paletasCores = [
  { id: "azul", nome: "Azul Profissional", primaria: "#3B82F6", secundaria: "#1E40AF" },
  { id: "verde", nome: "Verde Natural", primaria: "#10B981", secundaria: "#059669" },
  { id: "roxo", nome: "Roxo Elegante", primaria: "#8B5CF6", secundaria: "#7C3AED" },
  { id: "laranja", nome: "Laranja Vibrante", primaria: "#F97316", secundaria: "#EA580C" },
  { id: "rosa", nome: "Rosa Moderno", primaria: "#EC4899", secundaria: "#DB2777" },
  { id: "cinza", nome: "Cinza Neutro", primaria: "#6B7280", secundaria: "#4B5563" },
];

interface AssistenteCriacaoProps {
  onClose?: () => void;
  onComplete?: (dados: any) => void;
}

export default function AssistenteCriacao({ onClose, onComplete }: AssistenteCriacaoProps) {
  const [, setLocation] = useLocation();
  const [passoAtual, setPassoAtual] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do formulário
  const [tipoProjeto, setTipoProjeto] = useState<string>("");
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);
  const [templateVisual, setTemplateVisual] = useState("moderno");
  const [paletaCor, setPaletaCor] = useState("azul");
  
  // Buscar condomínios
  const { data: condominios } = trpc.condominio.list.useQuery();
  
  // Mutations
  const criarRevista = trpc.revista.create.useMutation();
  const criarApp = trpc.apps.create.useMutation();
  
  // Gerar período atual
  useEffect(() => {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const agora = new Date();
    setPeriodo(`${meses[agora.getMonth()]} ${agora.getFullYear()}`);
  }, []);
  
  // Selecionar primeiro condomínio automaticamente
  useEffect(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);
  
  const totalPassos = 5;
  
  const toggleModulo = (moduloId: string) => {
    setModulosSelecionados(prev => 
      prev.includes(moduloId) 
        ? prev.filter(id => id !== moduloId)
        : [...prev, moduloId]
    );
  };
  
  const selecionarTodosCategoria = (categoriaId: string) => {
    const categoria = modulosDisponiveis[categoriaId as keyof typeof modulosDisponiveis];
    if (!categoria) return;
    
    const idsCategoria = categoria.modulos.map(m => m.id);
    const todosSelecionados = idsCategoria.every(id => modulosSelecionados.includes(id));
    
    if (todosSelecionados) {
      setModulosSelecionados(prev => prev.filter(id => !idsCategoria.includes(id)));
    } else {
      setModulosSelecionados(prev => Array.from(new Set([...prev, ...idsCategoria])));
    }
  };
  
  const podeAvancar = () => {
    switch (passoAtual) {
      case 1: return tipoProjeto !== "";
      case 2: return nomeProjeto.trim() !== "" && condominioId !== null;
      case 3: return modulosSelecionados.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };
  
  const avancar = () => {
    if (passoAtual < totalPassos && podeAvancar()) {
      setPassoAtual(passoAtual + 1);
    }
  };
  
  const voltar = () => {
    if (passoAtual > 1) {
      setPassoAtual(passoAtual - 1);
    }
  };
  
  const criarProjeto = async () => {
    if (!condominioId) {
      toast.error("Selecione um condomínio");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (tipoProjeto === "revista") {
        const resultado = await criarRevista.mutateAsync({
          condominioId,
          titulo: nomeProjeto,
          edicao: periodo,
          templateId: templateVisual
        });
        
        toast.success("Revista criada com sucesso!");
        setLocation(`/revista/editor/${resultado.id}`);
      } else if (tipoProjeto === "app") {
        const resultado = await criarApp.mutateAsync({
          condominioId,
          nome: nomeProjeto,
          modulos: modulosSelecionados.map((moduloId, index) => ({
            moduloKey: moduloId,
            titulo: moduloId.charAt(0).toUpperCase() + moduloId.slice(1).replace(/-/g, ' '),
            ordem: index,
            habilitado: true
          })),
          corPrimaria: paletasCores.find(p => p.id === paletaCor)?.primaria || "#3B82F6"
        });
        
        toast.success("App criado com sucesso!");
        setLocation(`/dashboard/apps`);
      } else if (tipoProjeto === "relatorio") {
        toast.success("Relatório configurado com sucesso!");
        setLocation(`/dashboard/relatorios/novo`);
      }
      
      if (onComplete) {
        onComplete({
          tipo: tipoProjeto,
          nome: nomeProjeto,
          periodo,
          condominioId,
          modulos: modulosSelecionados,
          template: templateVisual,
          paleta: paletaCor
        });
      }
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderização de cada passo
  const renderPasso1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o tipo de projeto</h2>
        <p className="text-muted-foreground">Selecione o que você deseja criar para seu condomínio</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposProjeto.map((tipo) => {
          const Icon = tipo.icon;
          const selecionado = tipoProjeto === tipo.id;
          
          return (
            <Card
              key={tipo.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                selecionado ? `${tipo.corBorda} border-2 shadow-lg` : "border hover:border-primary/50"
              )}
              onClick={() => setTipoProjeto(tipo.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                  tipo.cor
                )}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{tipo.nome}</h3>
                <p className="text-sm text-muted-foreground">{tipo.descricao}</p>
                {selecionado && (
                  <div className="mt-4">
                    <Check className="w-6 h-6 text-primary mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
  
  const renderPasso2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Informações básicas</h2>
        <p className="text-muted-foreground">Configure os dados principais do seu projeto</p>
      </div>
      
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Projeto</Label>
          <Input
            id="nome"
            placeholder={`Ex: ${tipoProjeto === "revista" ? "Revista Mensal" : tipoProjeto === "app" ? "App do Condomínio" : "Relatório Anual"}`}
            value={nomeProjeto}
            onChange={(e) => setNomeProjeto(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="periodo">Período/Edição</Label>
          <Input
            id="periodo"
            placeholder="Ex: Janeiro 2026"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condominio">Condomínio</Label>
          <Select
            value={condominioId?.toString() || ""}
            onValueChange={(value) => setCondominioId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o condomínio" />
            </SelectTrigger>
            <SelectContent>
              {condominios?.map((cond) => (
                <SelectItem key={cond.id} value={cond.id.toString()}>
                  {cond.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
  
  const renderPasso3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Selecione os módulos</h2>
        <p className="text-muted-foreground">Escolha as funcionalidades que deseja incluir ({modulosSelecionados.length} selecionados)</p>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {Object.entries(modulosDisponiveis).map(([categoriaId, categoria]) => {
            const CategoriaIcon = categoria.icon;
            const idsCategoria = categoria.modulos.map(m => m.id);
            const selecionadosCategoria = idsCategoria.filter(id => modulosSelecionados.includes(id)).length;
            const todosSelecionados = selecionadosCategoria === idsCategoria.length;
            
            return (
              <div key={categoriaId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoriaIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{categoria.nome}</h3>
                    <span className="text-xs text-muted-foreground">
                      ({selecionadosCategoria}/{idsCategoria.length})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selecionarTodosCategoria(categoriaId)}
                  >
                    {todosSelecionados ? "Desmarcar todos" : "Selecionar todos"}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categoria.modulos.map((modulo) => {
                    const ModuloIcon = modulo.icon;
                    const selecionado = modulosSelecionados.includes(modulo.id);
                    
                    return (
                      <div
                        key={modulo.id}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                          selecionado 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted/50 border-border"
                        )}
                        onClick={() => toggleModulo(modulo.id)}
                      >
                        <Checkbox checked={selecionado} />
                        <ModuloIcon className={cn("w-4 h-4", selecionado ? "text-primary" : "text-muted-foreground")} />
                        <span className={cn("text-sm", selecionado ? "font-medium" : "")}>{modulo.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
  
  const renderPasso4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Personalização visual</h2>
        <p className="text-muted-foreground">Escolha o estilo e as cores do seu projeto</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Templates */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Template Visual</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templatesVisuais.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all text-center",
                  templateVisual === template.id 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "hover:border-primary/50"
                )}
                onClick={() => setTemplateVisual(template.id)}
              >
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: template.cor }}
                />
                <p className="font-medium text-sm">{template.nome}</p>
                <p className="text-xs text-muted-foreground">{template.descricao}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Paleta de cores */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Paleta de Cores</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paletasCores.map((paleta) => (
              <div
                key={paleta.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all",
                  paletaCor === paleta.id 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "hover:border-primary/50"
                )}
                onClick={() => setPaletaCor(paleta.id)}
              >
                <div className="flex gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: paleta.primaria }}
                  />
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: paleta.secundaria }}
                  />
                </div>
                <p className="font-medium text-sm">{paleta.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPasso5 = () => {
    const tipoSelecionado = tiposProjeto.find(t => t.id === tipoProjeto);
    const TipoIcon = tipoSelecionado?.icon || Sparkles;
    const paletaSelecionada = paletasCores.find(p => p.id === paletaCor);
    const templateSelecionado = templatesVisuais.find(t => t.id === templateVisual);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Revisão e criação</h2>
          <p className="text-muted-foreground">Confira os dados antes de criar seu projeto</p>
        </div>
        
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  tipoSelecionado?.cor
                )}>
                  <TipoIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle>{nomeProjeto || "Sem nome"}</CardTitle>
                  <CardDescription>{tipoSelecionado?.nome} • {periodo}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Condomínio</span>
                <span className="font-medium">{condominios?.find(c => c.id === condominioId)?.nome || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Módulos</span>
                <span className="font-medium">{modulosSelecionados.length} selecionados</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Template</span>
                <span className="font-medium">{templateSelecionado?.nome}</span>
              </div>
              <div className="flex justify-between py-2 items-center">
                <span className="text-muted-foreground">Cores</span>
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: paletaSelecionada?.primaria }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: paletaSelecionada?.secundaria }}
                  />
                </div>
              </div>
              
              {/* Lista de módulos */}
              {modulosSelecionados.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm font-medium mb-2">Módulos incluídos:</p>
                  <div className="flex flex-wrap gap-1">
                    {modulosSelecionados.slice(0, 8).map(moduloId => {
                      let moduloNome = moduloId;
                      Object.values(modulosDisponiveis).forEach(cat => {
                        const modulo = cat.modulos.find(m => m.id === moduloId);
                        if (modulo) moduloNome = modulo.nome;
                      });
                      return (
                        <span key={moduloId} className="text-xs bg-muted px-2 py-1 rounded">
                          {moduloNome}
                        </span>
                      );
                    })}
                    {modulosSelecionados.length > 8 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        +{modulosSelecionados.length - 8} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header com progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Assistente de Criação</h1>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {/* Barra de progresso */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((passo) => (
            <div key={passo} className="flex-1 flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  passo < passoAtual 
                    ? "bg-primary text-primary-foreground" 
                    : passo === passoAtual 
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                      : "bg-muted text-muted-foreground"
                )}
              >
                {passo < passoAtual ? <Check className="w-4 h-4" /> : passo}
              </div>
              {passo < 5 && (
                <div className={cn(
                  "flex-1 h-1 mx-2 rounded",
                  passo < passoAtual ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        
        {/* Labels dos passos */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Tipo</span>
          <span>Dados</span>
          <span>Módulos</span>
          <span>Visual</span>
          <span>Criar</span>
        </div>
      </div>
      
      {/* Conteúdo do passo atual */}
      <div className="flex-1">
        {passoAtual === 1 && renderPasso1()}
        {passoAtual === 2 && renderPasso2()}
        {passoAtual === 3 && renderPasso3()}
        {passoAtual === 4 && renderPasso4()}
        {passoAtual === 5 && renderPasso5()}
      </div>
      
      {/* Footer com navegação */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <Button
          variant="outline"
          onClick={voltar}
          disabled={passoAtual === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-2">
          {passoAtual < totalPassos ? (
            <Button
              onClick={avancar}
              disabled={!podeAvancar()}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={criarProjeto}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar Projeto
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

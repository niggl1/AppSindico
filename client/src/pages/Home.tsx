import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Car,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Heart,
  ImageIcon,
  Megaphone,
  MessageSquare,
  Package,
  ParkingCircle,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  AlertTriangle,
  Trophy,
  Users,
  Vote,
  Wrench,
  Search,
  CalendarClock,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import FavoriteButton from "@/components/FavoriteButton";
import DestaqueCard from "@/components/DestaqueCard";
import FuncoesRapidas from "@/components/FuncoesRapidas";
import { ExternalLink, FileDown, Play, Check, Building, Crown, Gift, ShieldCheck, Video, Bell, LayoutGrid, BookOpen as BookOpenIcon, ScrollText, Code, DollarSign, FilePen, Languages, Timer, Smartphone, Monitor, MessageCircle, MapPin } from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Apps Personalizados",
    description: "Criamos aplicativos de acordo com a realidade do seu condomínio.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: BookOpen,
    title: "Revistas Digitais",
    description: "Mostre tudo que você faz no seu condomínio, mantenha os moradores 'amarrados' a sua gestão.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: ScrollText,
    title: "Relatórios Detalhados",
    description: "Documentos completos com sua logo, imagem e referências a sua gestão.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Controle Total da Gestão",
    description: "Delegue a gestão a sua equipe e só acompanhe.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Vote,
    title: "Votações e Enquetes",
    description: "Link para os moradores votarem, com bloqueio de inadimplentes, resultado em tempo real e muito mais.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Wrench,
    title: "Gestão Completa",
    description: "Controle total de manutenções, vistorias, ocorrências, checklist, antes e depois de manutenções, serviços e obras.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: MapPin,
    title: "Localização em Tempo Real",
    description: "Localização em tempo real de cada visita dos seus funcionários.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Timer,
    title: "Controle Total do Tempo",
    description: "Controle do tempo de cada visita, checklist, manutenção, etc...",
    color: "from-indigo-500 to-violet-600",
  },
  {
    icon: Trophy,
    title: "Diferencial",
    description: "O que te diferencia dos seus concorrentes? O app e sistema de gestão é o mesmo, o preço é similar, qual o seu diferencial?",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: DollarSign,
    title: "Rentabilidade",
    description: "Coloque seus parceiros para oferecerem serviços e publicidade aos moradores e cobre por isso. Cubra o custo e ainda rentabilize com folga em cima das parcerias.",
    color: "from-teal-500 to-cyan-600",
  },
];

// Cards ordenados alfabeticamente
const sections = [
  { icon: Sparkles, label: "100% Personalizado", description: "Páginas personalizáveis", link: "/dashboard/personalizado" },
  { icon: Heart, label: "Achados e Perdidos", description: "Objetos encontrados", link: "/dashboard/achados" },
  { icon: Video, label: "Assembleia Online", description: "Assembleias virtuais", link: "/dashboard/assembleia" },
  { icon: CalendarClock, label: "Agenda de Vencimentos", description: "Contratos e manutenções", link: "/dashboard/vencimentos" },
  { icon: ImageIcon, label: "Antes e Depois", description: "Transformações realizadas", link: "/dashboard/antes-depois" },
  { icon: ShoppingBag, label: "Aquisições", description: "Compras do condomínio", link: "/dashboard/aquisicoes" },
  { icon: Megaphone, label: "Avisos", description: "Comunicados importantes", link: "/dashboard/avisos" },
  { icon: Car, label: "Caronas", description: "Compartilhe viagens", link: "/dashboard/caronas" },
  { icon: CheckSquare, label: "Checklists", description: "Listas de verificação", link: "/dashboard/checklists" },
  { icon: Package, label: "Classificados", description: "Anúncios dos moradores", link: "/dashboard/classificados" },
  { icon: FileText, label: "Comunicados", description: "Documentos oficiais", link: "/dashboard/comunicados" },
  { icon: Calendar, label: "Eventos", description: "Agenda do condomínio", link: "/dashboard/eventos" },
  { icon: Users, label: "Funcionários", description: "Equipe do condomínio", link: "/dashboard/funcionarios" },
  { icon: Wrench, label: "Manutenções", description: "Reparos e serviços", link: "/dashboard/manutencoes" },
  { icon: MessageSquare, label: "Mensagem do Síndico", description: "Comunicação direta", link: "/dashboard/revista" },
  { icon: Bell, label: "Notificar Morador", description: "Notificações de infrações", link: "/dashboard/notificar-morador" },
  { icon: AlertTriangle, label: "Ocorrências", description: "Registos de incidentes", link: "/dashboard/ocorrencias" },
  { icon: Award, label: "Publicidade", description: "Espaço para anúncios", link: "/dashboard/publicidade" },
  { icon: Trophy, label: "Realizações", description: "Conquistas da gestão", link: "/dashboard/realizacoes" },
  { icon: FileText, label: "Regras", description: "Normas do condomínio", link: "/dashboard/regras" },
  { icon: Shield, label: "Segurança", description: "Dicas de proteção", link: "/dashboard/seguranca" },
  { icon: ParkingCircle, label: "Vagas", description: "Gestão de estacionamento", link: "/dashboard/vagas" },
  { icon: Search, label: "Vistorias", description: "Inspeções e verificações", link: "/dashboard/vistorias" },
  { icon: Vote, label: "Votações", description: "Enquetes e decisões coletivas", link: "/dashboard/votacoes" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: favoritosCards } = trpc.favorito.listCards.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Buscar contagem de notificações pendentes
  const { data: condominios } = trpc.condominio.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const condominioId = condominios?.[0]?.id;
  const { data: notificacoesCount } = trpc.notificacoesInfracao.countByStatus.useQuery(
    { condominioId: condominioId! },
    { enabled: isAuthenticated && !!condominioId }
  );
  const notificacoesPendentes = notificacoesCount?.pendente || 0;

  // Ordenar secções com favoritos primeiro
  const sortedSections = [...sections].sort((a, b) => {
    const aIsFav = favoritosCards?.some(f => f.cardSecaoId === a.label) || false;
    const bIsFav = favoritosCards?.some(f => f.cardSecaoId === b.label) || false;
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-appsindico.png" alt="App Síndico" className="w-10 h-10 object-contain" />
            <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-8 object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#secoes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Secções
            </a>
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </Link>
            <a href="#precos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="btn-magazine">
                  Meu Painel
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="btn-magazine">
                  Entrar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Nova forma de comunicar no condomínio
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
                Plataforma Digital
                <span className="text-gradient block">para Condomínios</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Aplicativos, revistas digitais interativas e relatórios personalizados
              </p>

              <TooltipProvider>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Botão Criar Meu App - Azul */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/app">
                          <Button size="lg" className="text-base w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                            <LayoutGrid className="w-5 h-5 mr-2" />
                            Criar Meu App
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">Layout em Grade</p>
                        <p className="text-xs text-muted-foreground">Ideal para dashboards, painéis e aplicativos com cards organizados</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Botão Criar Minha Revista - Verde */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/revista">
                          <Button size="lg" className="text-base w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                            <BookOpenIcon className="w-5 h-5 mr-2" />
                            Criar Minha Revista
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">Formato de Páginas</p>
                        <p className="text-xs text-muted-foreground">Navegação como uma revista real, com efeito de virar páginas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Botão Criar Relatórios - Roxo */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/relatorio">
                          <Button size="lg" className="text-base w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                            <ScrollText className="w-5 h-5 mr-2" />
                            Criar Relatórios Detalhados
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">Documento Contínuo</p>
                        <p className="text-xs text-muted-foreground">Rolagem vertical para relatórios longos e documentos detalhados</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Botão Ver Demonstração - Laranja */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/demo-layouts">
                          <Button size="lg" className="text-base w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                            <Play className="w-5 h-5 mr-2" />
                            Ver Demonstração
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">Veja na Prática</p>
                        <p className="text-xs text-muted-foreground">Explore um exemplo completo da plataforma em ação</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>


            </motion.div>

            {/* Magazine Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-md">
                {/* Magazine mockup */}
                <div className="magazine-page aspect-[3/4] p-6 bg-gradient-to-br from-white to-gray-50">
                  <div className="h-full flex flex-col">
                    {/* Magazine header */}
                    <div className="text-center mb-4">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Edição Dezembro 2024
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-foreground">
                        Residencial Jardins
                      </h2>
                      <div className="section-divider mt-3" />
                    </div>

                    {/* Magazine content preview */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="col-span-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/30" />
                          <div>
                            <div className="text-sm font-semibold">Mensagem do Síndico</div>
                            <div className="text-xs text-muted-foreground">João Silva</div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-3">
                        <Megaphone className="w-5 h-5 text-amber-600 mb-2" />
                        <div className="text-xs font-medium">Avisos</div>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
                        <div className="text-xs font-medium">Eventos</div>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <Vote className="w-5 h-5 text-blue-600 mb-2" />
                        <div className="text-xs font-medium">Votações</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <Package className="w-5 h-5 text-purple-600 mb-2" />
                        <div className="text-xs font-medium">Classificados</div>
                      </div>
                    </div>

                    {/* Page number */}
                    <div className="text-center mt-4 text-xs text-muted-foreground">
                      — 1 —
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Sistema com foco total para gestores de condomínios
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Faça tudo do seu jeito, precisa de ajustes, criar algo específico é só solicitar e fazemos sem nenhum custo adicional.
            </p>
            <div className="section-divider mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-hover h-full border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Desenvolvimento Personalizado */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Desenvolvimento Personalizado
            </h2>
            <p className="text-primary font-semibold text-lg">
              Sem Custo Adicional
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Quadro Premium - Solicite Ajustes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-8 shadow-2xl overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/2 right-4 w-16 h-16 bg-white/5 rounded-full" />
                
                {/* Premium badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-semibold text-sm">Exclusivo para Clientes</span>
                </div>
                
                {/* Main content */}
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-4 relative z-10">
                  Solicite ajustes, melhorias, parâmetros ou mesmo novas funções
                </h3>
                <p className="text-white/90 text-lg mb-6 relative z-10">
                  Se fizer sentido para a gente, <span className="font-bold text-yellow-300">desenvolvemos sem nenhum custo adicional</span>.
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-3 relative z-10">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">✓ Ajustes</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">✓ Melhorias</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">✓ Parâmetros</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">✓ Novas Funções</span>
                </div>
              </div>
            </motion.div>

            {/* Como Funciona */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl font-bold text-foreground">Como Funciona</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Contrate um dos planos",
                  "Precisou de melhorias? Envie pelo WhatsApp",
                  "Iniciamos o desenvolvimento",
                  "Sistema pronto para PC, Android e iOS"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{index + 1}.</span>
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              {/* Botão WhatsApp */}
              <a
                href="https://wa.me/5581999618516?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20melhorias%20no%20App%20S%C3%ADndico."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Solicitar Melhoria via WhatsApp
              </a>
            </motion.div>
          </div>

          {/* Banner Sem Taxas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-2xl p-8 mb-8"
          >
            <h3 className="text-white text-xl md:text-2xl font-bold text-center mb-8">
              Sem Taxas. Sem Blá-blá-blá.
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: DollarSign, label: "Zero custo extra" },
                { icon: FilePen, label: "Zero contratos gigantes" },
                { icon: Languages, label: "Zero linguagens técnicas" },
                { icon: Timer, label: "Zero projetos intermináveis" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Banner Plataformas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-100 rounded-2xl p-6 text-center"
          >
            <p className="text-foreground font-semibold text-lg mb-4">
              O morador nem precisa baixar o app se não quiser! Acessa tudo pelo <span className="text-green-600">WhatsApp</span>!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: MessageCircle, label: "WhatsApp", color: "text-green-600" },
                { icon: Monitor, label: "Computador", color: "text-slate-600" },
                { icon: Smartphone, label: "Android", color: "text-green-500" },
                { icon: Smartphone, label: "iOS", color: "text-slate-800" },
                { icon: Sparkles, label: "Sinal de fumaça?", color: "text-amber-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-foreground font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-3 italic">
              Sinal de fumaça ainda não... Por enquanto! 😅
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Em apenas 3 passos simples, você cria e compartilha seu projeto.
            </p>
            <div className="section-divider mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Cadastre seu Condomínio",
                description: "Adicione as informações básicas do seu condomínio e personalize as cores e logo.",
              },
              {
                step: "02",
                title: "Crie seu Projeto",
                description: "Escolha um template ou comece do zero. Adicione conteúdo às secções disponíveis.",
              },
              {
                step: "03",
                title: "Compartilhe com Moradores",
                description: "Gere um link e compartilhe. Moradores acessam pelo navegador ou app.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-7xl font-serif font-bold text-primary/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Preview */}
      <section id="secoes" className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Secções Disponíveis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seu projeto pode incluir diversas secções para atender todas as necessidades do condomínio.
            </p>
            <div className="section-divider mt-6" />
          </motion.div>



          {/* Funções Rápidas */}
          {isAuthenticated && condominioId && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-serif text-lg font-semibold text-foreground">Funções Rápidas</h3>
              </div>
              <FuncoesRapidas condominioId={condominioId} />
              <div className="border-b border-border mt-6 mb-6" />
            </div>
          )}

          {/* Favoritos em destaque */}
          {isAuthenticated && favoritosCards && favoritosCards.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Meus Favoritos</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sortedSections
                  .filter(section => favoritosCards.some(f => f.cardSecaoId === section.label))
                  .map((section, index) => (
                    <Link key={`fav-${section.label}`} href={section.link}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <Card className="h-28 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800 hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-2">
                              <section.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-sm font-medium text-foreground text-center">
                              {section.label}
                            </div>
                          </CardContent>
                        </Card>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FavoriteButton
                            tipoItem="card_secao"
                            cardSecaoId={section.label}
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 bg-white/80 hover:bg-white"
                          />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-yellow-500"></span>
                Ao adicionar um item aos favoritos, atualize a página para que ele apareça nesta secção.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {sortedSections.map((section, index) => (
              <div key={section.label} className="relative group">
                <Link href={section.link}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flip-card h-32 cursor-pointer"
                  >
                    <div className="flip-card-inner">
                      {/* Front */}
                      <div className="flip-card-front p-4 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-sm font-medium text-foreground text-center">
                          {section.label}
                        </div>
                        {favoritosCards?.some(f => f.cardSecaoId === section.label) && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 absolute top-2 right-2" />
                        )}
                        {/* Badge de notificações pendentes para Notificar Morador */}
                        {section.label === "Notificar Morador" && notificacoesPendentes && notificacoesPendentes > 0 && (
                          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {notificacoesPendentes > 99 ? "99+" : notificacoesPendentes}
                          </div>
                        )}
                      </div>
                      {/* Back */}
                      <div className="flip-card-back p-4 flex flex-col items-center justify-center">
                        <section.icon className="w-8 h-8 mb-2 opacity-80" />
                        <div className="text-xs text-center font-medium">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                {isAuthenticated && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <FavoriteButton
                      tipoItem="card_secao"
                      cardSecaoId={section.label}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Dores e Soluções Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Problemas exclusivos requerem soluções exclusivas
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Não só faça, mas mostre tudo o que você faz!
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Já escutou aquela expressão <span className="font-semibold text-foreground">"esse síndico/administradora não faz nada!"</span><br />
              Como você mostra hoje tudo o que faz?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              {/* Header da Tabela */}
              <div className="grid grid-cols-3 bg-muted/50 border-b">
                <div className="p-4 font-semibold text-center border-r">
                  <span className="text-red-500">❌</span> Sua Dor
                </div>
                <div className="p-4 font-semibold text-center border-r">
                  <span className="text-amber-500">⚠️</span> Como é feito hoje
                </div>
                <div className="p-4 font-semibold text-center">
                  <span className="text-green-500">✅</span> Com o App Síndico
                </div>
              </div>
              
              {/* Linhas da Tabela */}
              {[
                {
                  dor: "Comunicação com moradores",
                  hoje: "Papel no elevador, WhatsApp pessoal",
                  solucao: "Avisos digitais com confirmação de leitura"
                },
                {
                  dor: "Gestão de tempo e tarefas",
                  hoje: "Anotações em papel, esquecimentos",
                  solucao: "Agenda de vencimentos e lembretes automáticos"
                },
                {
                  dor: "Conflitos e reclamações",
                  hoje: "Palavra contra palavra, sem registro",
                  solucao: "Histórico documentado de ocorrências"
                },
                {
                  dor: "Imagem profissional",
                  hoje: "Avisos amadores em Word",
                  solucao: "Revistas e apps com design profissional, com sua foto e logo personalizada"
                },
                {
                  dor: "Tomada de decisões",
                  hoje: "Assembleias vazias, contar votos no chat sem controle de quem votou, verificar adimplência manualmente",
                  solucao: "Votações online com bloqueio de inadimplentes, enquetes com foto/links/arquivos, registro de quem votou e percentual em tempo real"
                },
                {
                  dor: "Organização",
                  hoje: "Documentos espalhados, difícil encontrar",
                  solucao: "Tudo centralizado e organizado por categoria"
                },
                {
                  dor: "Engajamento dos moradores",
                  hoje: "Moradores desinteressados",
                  solucao: "Conteúdo interativo que engaja e informa"
                },
              ].map((item, index) => (
                <div key={index} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${index < 6 ? 'border-b' : ''}`}>
                  <div className="p-4 border-r flex items-center">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{item.dor}</span>
                  </div>
                  <div className="p-4 border-r flex items-center">
                    <span className="text-sm text-muted-foreground">{item.hoje}</span>
                  </div>
                  <div className="p-4 flex items-center">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{item.solucao}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Crown className="h-4 w-4" />
              Preços e Planos
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Soluções flexíveis para síndicos, condomínios e administradoras de todos os tamanhos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Síndicos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative h-full border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Síndicos</h3>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">R$99</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ideal para síndicos que gerem o próprio condomínio
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Projetos digitais interativos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Gestão de avisos e comunicados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Agenda de vencimentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Gestão de manutenções</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Relatórios básicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Integração com funcionários</span>
                    </li>
                  </ul>
                  <a href="https://wa.me/5581999618516?text=Olá! Tenho interesse no plano Síndicos." target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">
                      Escolher Plano
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Condomínios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative h-full border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Condomínios</h3>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">R$199</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Completo para moradores, equipe de gestão e manutenção
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Tudo do plano Síndicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Portal do morador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Gestão de funcionários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Votações e enquetes online</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Classificados e caronas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Integração com moradores</span>
                    </li>
                  </ul>
                  <a href="https://wa.me/5581999618516?text=Olá! Tenho interesse no plano Condomínios." target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">
                      Escolher Plano
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Administradoras - Destaque */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative h-full border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Administradoras</h3>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">R$299</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Solução completa para administradoras de condomínios
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Tudo do plano Condomínios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Painel multi-condomínios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Gestão centralizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Relatórios consolidados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Condomínios ilimitados</span>
                    </li>
                  </ul>
                  <a href="https://wa.me/5581999618516?text=Olá! Tenho interesse no plano Administradoras." target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">
                      Escolher Plano
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
              <Gift className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">7 DIAS GRÁTIS</p>
                <p className="text-sm text-muted-foreground">Teste todos os recursos sem compromisso</p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Transparência Total Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-primary/10"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  Segurança Jurídica
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                  Transparência Total
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  Acreditamos na clareza e na confiança. Acesse nosso contrato de prestação de serviços, leia todas as cláusulas e preencha seus dados com total transparência. Sem letras miúdas, sem fidelidade.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/contrato">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                    <FileText className="h-5 w-5 mr-2" />
                    Acessar Contrato
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Apresentação Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <FileDown className="h-4 w-4" />
                  Material Informativo
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                  Conheça Nossa Solução
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  Baixe nossa apresentação completa e descubra todas as funcionalidades do App Síndico. Ideal para compartilhar com sua administradora ou conselho.
                </p>
              </div>
              <div className="shrink-0">
                <a href="/Apresentacao_AppSindico.pdf" download>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                    <FileDown className="h-5 w-5 mr-2" />
                    Baixar Apresentação
                  </Button>
                </a>
                <p className="text-sm text-gray-500 mt-2 text-center">PDF • 2.2 MB</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="gradient-magazine absolute inset-0" />
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-blue-700">
                Pronto para Transformar a Comunicação do seu Condomínio?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Junte-se a centenas de síndicos e administradoras que já utilizam nossa plataforma.
              </p>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-base font-semibold">
                    Acessar Meu Painel
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/registar">
                  <Button size="lg" variant="secondary" className="text-base font-semibold">
                    Criar Conta Gratuita
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-appsindico.png" alt="App Síndico" className="w-10 h-10 object-contain" />
            <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-8 object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 App Síndico. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente para exibir os Destaques na página inicial
function DestaquesSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  const { data: destaques, isLoading } = trpc.destaque.listAtivos.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  if (isLoading || !destaques || destaques.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Linha separadora com título */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
          <Star className="w-5 h-5 text-primary fill-primary/20" />
          <h3 className="font-serif text-lg font-semibold text-primary">Destaques</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Cards de Destaques em linha exclusiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destaques.map((destaque, index) => (
          <motion.div
            key={destaque.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <DestaqueCard
              id={destaque.id}
              titulo={destaque.titulo}
              subtitulo={destaque.subtitulo}
              descricao={destaque.descricao}
              link={destaque.link}
              arquivoUrl={destaque.arquivoUrl}
              arquivoNome={destaque.arquivoNome}
              videoUrl={destaque.videoUrl}
              imagens={destaque.imagens}
            />
          </motion.div>
        ))}
      </div>

      {/* Linha separadora inferior */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}


// Componente para a 4ª linha de Cards Personalizáveis
function CardsPersonalizaveisSection() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  
  const { data: destaques, isLoading } = trpc.destaque.listAtivos.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  if (isLoading || !destaques || destaques.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {/* Linha separadora fina */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
      
      {/* Título da secção */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-base font-medium text-primary">Conteúdo Personalizado</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Cards Personalizáveis em linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destaques.map((destaque, index) => {
          // Parse das imagens
          let imagens: Array<{url: string, legenda?: string}> = [];
          if (Array.isArray(destaque.imagens)) {
            imagens = destaque.imagens as Array<{url: string, legenda?: string}>;
          } else if (typeof destaque.imagens === 'string') {
            try {
              imagens = JSON.parse(destaque.imagens);
            } catch (e) {
              imagens = [];
            }
          }
          const primeiraImagem = imagens[0]?.url;

          return (
            <motion.div
              key={destaque.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                {/* Galeria de Imagens */}
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  {primeiraImagem ? (
                    <img 
                      src={primeiraImagem} 
                      alt={destaque.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  {imagens.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      +{imagens.length - 1} fotos
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Título */}
                  <h4 className="font-serif font-semibold text-foreground line-clamp-1 mb-1">
                    {destaque.titulo}
                  </h4>
                  
                  {/* Subtítulo */}
                  {destaque.subtitulo && (
                    <p className="text-sm text-primary font-medium line-clamp-1 mb-2">
                      {destaque.subtitulo}
                    </p>
                  )}
                  
                  {/* Descrição */}
                  {destaque.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {destaque.descricao}
                    </p>
                  )}

                  {/* Links, Arquivos e Vídeos */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    {destaque.link && (
                      <a 
                        href={destaque.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-full"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Link
                      </a>
                    )}
                    {destaque.arquivoUrl && (
                      <a 
                        href={destaque.arquivoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full"
                      >
                        <FileDown className="w-3 h-3" />
                        {destaque.arquivoNome || 'Arquivo'}
                      </a>
                    )}
                    {destaque.videoUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
                        <Play className="w-3 h-3" />
                        Vídeo
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
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
    title: "Criar Apps Personalizados",
    description: "Desenvolva aplicações móveis e web exclusivas para o seu condomínio com nossa plataforma intuitiva.",
  },
  {
    icon: BookOpenIcon,
    title: "Revistas Digitais",
    description: "Publique conteúdo em formato de revista interativa com imagens, vídeos e links.",
  },
  {
    icon: ScrollText,
    title: "Criar Relatórios",
    description: "Gere relatórios detalhados com dados e análises do seu condomínio.",
  },
  {
    icon: Code,
    title: "Integração de APIs",
    description: "Conecte sistemas externos e automatize processos com nossas APIs robustas.",
  },
];

const sections = [
  { label: "Revistas Digitais", link: "/revistas", icon: BookOpen, description: "Publique conteúdo em revista interativa" },
  { label: "Votações", link: "/votacoes", icon: Vote, description: "Realize votações entre moradores" },
  { label: "Notificar Morador", link: "/notificacoes", icon: Bell, description: "Envie notificações importantes" },
  { label: "Ordens de Serviço", link: "/ordens-servico", icon: Wrench, description: "Gerencie ordens de trabalho" },
  { label: "Portal do Morador", link: "/portal-morador", icon: Users, description: "Acesso para moradores" },
  { label: "Portal do Funcionário", link: "/portal-funcionario", icon: Building2, description: "Acesso para funcionários" },
  { label: "Enquetes", link: "/enquetes", icon: MessageSquare, description: "Crie enquetes e pesquisas" },
  { label: "Documentos", link: "/documentos", icon: FileText, description: "Gerencie documentos" },
];

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fetch data from backend
  const { data: favoritosCards } = trpc.favoritos.listarFavoritos.useQuery(
    { tipoItem: "card_secao" },
    { enabled: isAuthenticated }
  );

  const { data: notificacoesPendentes } = trpc.notificacoes.contarPendentes.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: destaques } = trpc.destaques.listar.useQuery();
  const { data: funcoes } = trpc.funcoes.listar.useQuery();

  // Sort sections with favorites first
  const sortedSections = [...sections].sort((a, b) => {
    const aIsFav = favoritosCards?.some(f => f.cardSecaoId === a.label);
    const bIsFav = favoritosCards?.some(f => f.cardSecaoId === b.label);
    return aIsFav === bIsFav ? 0 : aIsFav ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', alignItems: 'center' }}>
            {/* Left side - Buttons in 2x2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {features.map((feature) => (
                <Button
                  key={feature.title}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-4 px-3 flex flex-col items-center justify-center text-center"
                >
                  <feature.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">{feature.title}</span>
                </Button>
              ))}
            </div>

            {/* Right side - Magazine preview */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white opacity-50" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">Revista Digital</h3>
                  <p className="text-sm text-gray-600 mt-2">Conteúdo interativo para seu condomínio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Funcionalidades Principais</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {features.map((feature) => (
              <div key={feature.title} className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
                <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desenvolvimento Personalizado Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Desenvolvimento Personalizado</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem', alignItems: 'start' }}>
            {/* Left - Como Funciona */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-gray-900">Como Funciona</h3>
              <div className="space-y-6">
                {[
                  { num: "01", title: "Consulta", desc: "Entendemos suas necessidades" },
                  { num: "02", title: "Desenvolvimento", desc: "Criamos sua solução personalizada" },
                  { num: "03", title: "Implementação", desc: "Colocamos em produção" },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Prazos e Fidelidade */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-gray-900">Prazos e Fidelidade</h3>
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Prazos Ágeis</h4>
                  <p className="text-gray-600 text-sm">Entrega rápida e eficiente</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Suporte Contínuo</h4>
                  <p className="text-gray-600 text-sm">Acompanhamento após implementação</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Relacionamento Duradouro</h4>
                  <p className="text-gray-600 text-sm">Parceria a longo prazo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sem Taxas Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Sem Taxas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: Shield, title: "Segurança" },
              { icon: Sparkles, title: "Qualidade" },
              { icon: Heart, title: "Confiança" },
              { icon: Trophy, title: "Excelência" },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-gray-50 rounded-lg text-center hover:shadow-lg transition-shadow">
                <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Como Funciona</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { num: "01", title: "Cadastro", desc: "Crie sua conta em minutos" },
              { num: "02", title: "Configuração", desc: "Personalize conforme necessário" },
              { num: "03", title: "Uso", desc: "Comece a usar imediatamente" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-xl mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secções Disponíveis Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Secções Disponíveis</h2>

          {/* Destaques */}
          {destaques && destaques.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Destaques</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {destaques.map((destaque) => (
                  <DestaqueCard key={destaque.id} destaque={destaque} />
                ))}
              </div>
            </div>
          )}

          {/* Funções Rápidas */}
          {funcoes && funcoes.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Funções Rápidas</h3>
              <FuncoesRapidas funcoes={funcoes} />
            </div>
          )}

          {/* Secções Grid */}
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Todas as Secções</h3>
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                Faça login para acessar todas as secções e funcionalidades.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem' }}>
            {sortedSections.map((section, index) => (
              <div key={section.label} className="relative">
                <Link href={section.link}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      backgroundColor: hoveredCard === section.label ? '#2563eb' : '#ffffff',
                      borderRadius: '0.75rem',
                      boxShadow: hoveredCard === section.label ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '7rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={() => setHoveredCard(section.label)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {hoveredCard === section.label ? (
                      /* Estado hover - fundo azul com descrição */
                      <div className="flex flex-col items-center justify-center text-white">
                        <section.icon className="w-8 h-8 text-white mb-2" />
                        <div className="text-xs font-medium text-center leading-tight">
                          {section.description || section.label}
                        </div>
                      </div>
                    ) : (
                      /* Estado normal */
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                          <section.icon className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="text-xs font-medium text-gray-700 text-center leading-tight">
                          {section.label}
                        </div>
                      </div>
                    )}

                    {favoritosCards?.some(f => f.cardSecaoId === section.label) && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 absolute top-2 right-2" />
                    )}
                    {/* Badge de notificações pendentes para Notificar Morador */}
                    {section.label === "Notificar Morador" && notificacoesPendentes && notificacoesPendentes > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {notificacoesPendentes > 99 ? "99+" : notificacoesPendentes}
                      </div>
                    )}
                    {isAuthenticated && (
                      <div className="absolute top-1 right-1" style={{ opacity: hoveredCard === section.label ? 1 : 0, transition: 'opacity 0.3s' }}>
                        <FavoriteButton
                          tipoItem="card_secao"
                          cardSecaoId={section.label}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        />
                      </div>
                    )}
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>


        </div>
      </section>
    </div>
  );
}

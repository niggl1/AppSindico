import { cn } from "@/lib/utils";
import { TemplateConfig, getTemplateById } from "@/lib/templates";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link as LinkIcon,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  Star,
  Users,
  Vote,
} from "lucide-react";
import { useState } from "react";

interface MagazineWithTemplateProps {
  templateId: string;
  revista: {
    titulo: string;
    edicao?: string;
    condominioNome?: string;
  };
  conteudo?: {
    mensagemSindico?: { nome: string; mensagem: string };
    avisos?: Array<{ titulo: string; tipo: string }>;
    eventos?: Array<{ titulo: string; data: string }>;
    funcionarios?: Array<{ nome: string; cargo: string }>;
    votacoes?: Array<{ titulo: string }>;
    telefones?: Array<{ nome: string; telefone: string }>;
    links?: Array<{ titulo: string; url: string }>;
  };
  className?: string;
}

export default function MagazineWithTemplate({
  templateId,
  revista,
  conteudo = {},
  className,
}: MagazineWithTemplateProps) {
  const template = getTemplateById(templateId);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  const pages = [
    { id: "capa", title: "Capa" },
    { id: "sindico", title: "Mensagem do Síndico" },
    { id: "avisos", title: "Avisos" },
    { id: "eventos", title: "Eventos" },
    { id: "funcionarios", title: "Funcionários" },
    { id: "votacoes", title: "Votações" },
    { id: "contatos", title: "Contatos" },
  ];

  const goToPage = (direction: "next" | "prev") => {
    if (isFlipping) return;
    
    const newPage = direction === "next" 
      ? Math.min(currentPage + 1, pages.length - 1)
      : Math.max(currentPage - 1, 0);
    
    if (newPage !== currentPage) {
      setFlipDirection(direction);
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsFlipping(false);
      }, 300);
    }
  };

  return (
    <div
      className={cn("relative", className)}
      style={{
        fontFamily: template.typography.fontFamily,
        ["--template-heading-font" as string]: template.typography.headingFont,
      }}
    >
      {/* Container da revista */}
      <div
        className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative"
        style={{ background: template.effects.pageBackground }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ 
              rotateY: flipDirection === "next" ? -90 : 90,
              opacity: 0 
            }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ 
              rotateY: flipDirection === "next" ? 90 : -90,
              opacity: 0 
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Renderizar página atual */}
            {currentPage === 0 && (
              <CoverPage template={template} revista={revista} />
            )}
            {currentPage === 1 && (
              <SindicoPage template={template} conteudo={conteudo.mensagemSindico} />
            )}
            {currentPage === 2 && (
              <AvisosPage template={template} avisos={conteudo.avisos} />
            )}
            {currentPage === 3 && (
              <EventosPage template={template} eventos={conteudo.eventos} />
            )}
            {currentPage === 4 && (
              <FuncionariosPage template={template} funcionarios={conteudo.funcionarios} />
            )}
            {currentPage === 5 && (
              <VotacoesPage template={template} votacoes={conteudo.votacoes} />
            )}
            {currentPage === 6 && (
              <ContatosPage 
                template={template} 
                telefones={conteudo.telefones}
                links={conteudo.links}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navegação */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
          <button
            onClick={() => goToPage("prev")}
            disabled={currentPage === 0}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              currentPage === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
            )}
            style={{ 
              background: template.colors.primary,
              color: template.colors.primaryForeground,
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span
            className="text-sm font-medium px-4"
            style={{ color: template.colors.mutedForeground }}
          >
            {currentPage + 1} / {pages.length}
          </span>
          
          <button
            onClick={() => goToPage("next")}
            disabled={currentPage === pages.length - 1}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              currentPage === pages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
            )}
            style={{ 
              background: template.colors.primary,
              color: template.colors.primaryForeground,
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Página de Capa
function CoverPage({ template, revista }: { template: TemplateConfig; revista: any }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header com gradiente */}
      <div
        className="h-2/5 relative"
        style={{ background: template.colors.gradient }}
      >
        <div
          className="absolute inset-0"
          style={{ background: template.effects.coverOverlay }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span
            className="text-xs uppercase tracking-[0.2em] opacity-90"
            style={{ color: template.colors.primaryForeground }}
          >
            {revista.edicao || "Edição Atual"}
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold mt-3"
            style={{
              color: template.colors.primaryForeground,
              fontFamily: template.typography.headingFont,
            }}
          >
            {revista.condominioNome || revista.titulo}
          </h1>
          <div
            className="w-20 h-1 mt-4 rounded-full"
            style={{ background: template.colors.accent }}
          />
        </div>
      </div>
      
      {/* Conteúdo da capa */}
      <div
        className="flex-1 p-6 space-y-4"
        style={{ background: template.colors.card }}
      >
        {/* Grid de seções */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MessageSquare, name: "Mensagem", color: template.colors.primary },
            { icon: Megaphone, name: "Avisos", color: template.colors.accent },
            { icon: Calendar, name: "Eventos", color: template.colors.primary },
            { icon: Vote, name: "Votações", color: template.colors.accent },
          ].map((section, i) => (
            <div
              key={i}
              className="p-4 flex flex-col items-start"
              style={{
                background: i % 2 === 0 ? template.colors.secondary : template.colors.muted,
                borderRadius: template.components.borderRadius,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                style={{ background: section.color, opacity: 0.9 }}
              >
                <section.icon className="w-5 h-5" style={{ color: template.colors.primaryForeground }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: template.colors.foreground }}
              >
                {section.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Rodapé */}
        <div className="flex items-center justify-center pt-4">
          <BookOpen className="w-5 h-5 mr-2" style={{ color: template.colors.mutedForeground }} />
          <span
            className="text-sm"
            style={{ color: template.colors.mutedForeground }}
          >
            App Síndico
          </span>
        </div>
      </div>
    </div>
  );
}

// Página do Síndico
function SindicoPage({ template, conteudo }: { template: TemplateConfig; conteudo?: any }) {
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <MessageSquare
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.primary }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Mensagem do Síndico
        </h2>
      </div>
      
      <div
        className="flex-1 p-5 rounded-xl"
        style={{
          background: template.colors.secondary,
          borderRadius: template.components.borderRadius,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{
              background: template.colors.gradient,
              color: template.colors.primaryForeground,
            }}
          >
            {conteudo?.nome?.charAt(0) || "S"}
          </div>
          <div>
            <p
              className="font-semibold"
              style={{ color: template.colors.foreground }}
            >
              {conteudo?.nome || "Síndico"}
            </p>
            <p
              className="text-sm"
              style={{ color: template.colors.mutedForeground }}
            >
              Síndico do Condomínio
            </p>
          </div>
        </div>
        
        <p
          className="text-sm leading-relaxed"
          style={{ color: template.colors.foreground }}
        >
          {conteudo?.mensagem || "Prezados moradores, é com grande satisfação que apresentamos mais uma edição da nossa revista digital. Nesta edição, trazemos informações importantes sobre as melhorias realizadas e os próximos eventos do nosso condomínio."}
        </p>
      </div>
    </div>
  );
}

// Página de Avisos
function AvisosPage({ template, avisos }: { template: TemplateConfig; avisos?: any[] }) {
  const defaultAvisos = [
    { titulo: "Manutenção do elevador", tipo: "importante" },
    { titulo: "Limpeza da caixa d'água", tipo: "informativo" },
    { titulo: "Reunião de condomínio", tipo: "urgente" },
  ];
  
  const items = avisos?.length ? avisos : defaultAvisos;
  
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Megaphone
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.accent }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Avisos
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.map((aviso, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border-l-4"
            style={{
              background: template.colors.card,
              borderLeftColor: aviso.tipo === "urgente" 
                ? "#EF4444" 
                : aviso.tipo === "importante" 
                ? template.colors.accent 
                : template.colors.primary,
              boxShadow: template.components.cardShadow,
              borderRadius: template.components.borderRadius,
            }}
          >
            <p
              className="font-medium"
              style={{ color: template.colors.foreground }}
            >
              {aviso.titulo}
            </p>
            <span
              className="text-xs uppercase mt-1 inline-block"
              style={{ color: template.colors.mutedForeground }}
            >
              {aviso.tipo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Eventos
function EventosPage({ template, eventos }: { template: TemplateConfig; eventos?: any[] }) {
  const defaultEventos = [
    { titulo: "Festa de Natal", data: "25/12/2024" },
    { titulo: "Assembleia Geral", data: "15/01/2025" },
  ];
  
  const items = eventos?.length ? eventos : defaultEventos;
  
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Calendar
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.primary }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Eventos
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.map((evento, i) => (
          <div
            key={i}
            className="p-4 rounded-lg flex items-center gap-4"
            style={{
              background: template.colors.secondary,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center"
              style={{ background: template.colors.primary }}
            >
              <span
                className="text-xs"
                style={{ color: template.colors.primaryForeground }}
              >
                {evento.data?.split("/")[1] || "DEZ"}
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: template.colors.primaryForeground }}
              >
                {evento.data?.split("/")[0] || "25"}
              </span>
            </div>
            <div>
              <p
                className="font-medium"
                style={{ color: template.colors.foreground }}
              >
                {evento.titulo}
              </p>
              <p
                className="text-sm"
                style={{ color: template.colors.mutedForeground }}
              >
                {evento.data}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Funcionários
function FuncionariosPage({ template, funcionarios }: { template: TemplateConfig; funcionarios?: any[] }) {
  const defaultFuncionarios = [
    { nome: "Carlos Silva", cargo: "Porteiro" },
    { nome: "Maria Santos", cargo: "Zeladora" },
    { nome: "João Oliveira", cargo: "Segurança" },
  ];
  
  const items = funcionarios?.length ? funcionarios : defaultFuncionarios;
  
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Users
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.accent }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Nossa Equipe
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-3 overflow-auto">
        {items.map((func, i) => (
          <div
            key={i}
            className="p-4 rounded-lg text-center"
            style={{
              background: template.colors.muted,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold"
              style={{
                background: template.colors.gradient,
                color: template.colors.primaryForeground,
              }}
            >
              {func.nome?.charAt(0) || "F"}
            </div>
            <p
              className="font-medium text-sm"
              style={{ color: template.colors.foreground }}
            >
              {func.nome}
            </p>
            <p
              className="text-xs"
              style={{ color: template.colors.mutedForeground }}
            >
              {func.cargo}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Votações
function VotacoesPage({ template, votacoes }: { template: TemplateConfig; votacoes?: any[] }) {
  const defaultVotacoes = [
    { titulo: "Funcionário do Mês" },
    { titulo: "Nova cor do hall" },
  ];
  
  const items = votacoes?.length ? votacoes : defaultVotacoes;
  
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Vote
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.primary }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Votações
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.map((votacao, i) => (
          <div
            key={i}
            className="p-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.accent}15)`,
              border: `1px solid ${template.colors.border}`,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-medium"
                  style={{ color: template.colors.foreground }}
                >
                  {votacao.titulo}
                </p>
                <p
                  className="text-sm"
                  style={{ color: template.colors.mutedForeground }}
                >
                  Votação em andamento
                </p>
              </div>
              <Star className="w-5 h-5" style={{ color: template.colors.accent }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Contatos
function ContatosPage({ 
  template, 
  telefones, 
  links 
}: { 
  template: TemplateConfig; 
  telefones?: any[];
  links?: any[];
}) {
  const defaultTelefones = [
    { nome: "Portaria", telefone: "(11) 1234-5678" },
    { nome: "Síndico", telefone: "(11) 9876-5432" },
  ];
  
  const defaultLinks = [
    { titulo: "Site do Condomínio", url: "#" },
    { titulo: "Regulamento", url: "#" },
  ];
  
  const telItems = telefones?.length ? telefones : defaultTelefones;
  const linkItems = links?.length ? links : defaultLinks;
  
  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Phone
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.accent }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Contatos
        </h2>
      </div>
      
      <div className="flex-1 space-y-4 overflow-auto">
        {/* Telefones */}
        <div>
          <h3
            className="text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: template.colors.foreground }}
          >
            <Phone className="w-4 h-4" />
            Telefones Úteis
          </h3>
          <div className="space-y-2">
            {telItems.map((tel, i) => (
              <div
                key={i}
                className="flex justify-between p-3 rounded-lg"
                style={{
                  background: template.colors.secondary,
                  borderRadius: template.components.borderRadius,
                }}
              >
                <span style={{ color: template.colors.foreground }}>{tel.nome}</span>
                <span style={{ color: template.colors.primary }}>{tel.telefone}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Links */}
        <div>
          <h3
            className="text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: template.colors.foreground }}
          >
            <LinkIcon className="w-4 h-4" />
            Links Úteis
          </h3>
          <div className="space-y-2">
            {linkItems.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="flex items-center gap-2 p-3 rounded-lg transition-colors"
                style={{
                  background: template.colors.muted,
                  borderRadius: template.components.borderRadius,
                  color: template.colors.primary,
                }}
              >
                <LinkIcon className="w-4 h-4" />
                {link.titulo}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

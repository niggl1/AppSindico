import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Home,
  Loader2,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  Share2,
  Shield,
  Star,
  Users,
  Vote,
  X,
  ZoomIn,
  ZoomOut,
  Link as LinkIcon,
  Building2,
  Image,
  FileText,
  Trophy,
  ArrowLeftRight,
  Wrench,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Play,
  FileDown,
  Maximize,
  Minimize,
  Grid3X3,
  Hand,
  Layers,
  ScrollText,
  Printer,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageGallery from "@/components/ImageGallery";

// Demo magazine data
const demoMagazine = {
  titulo: "Residencial Jardins",
  subtitulo: "Informativo Mensal",
  edicao: "Dezembro 2024",
  pages: [
    {
      id: 1,
      type: "cover",
      content: {
        titulo: "Residencial Jardins",
        subtitulo: "Informativo Mensal",
        edicao: "Dezembro 2024",
        imagem: null,
        logoUrl: null, // URL do logo do condomínio
        capaUrl: null, // URL da imagem de capa/fundo
      },
    },
    {
      id: 2,
      type: "mensagem_sindico",
      content: {
        nome: "João Silva",
        cargo: "Síndico",
        foto: null,
        titulo: "Mensagem do Síndico",
        mensagem:
          "Prezados moradores, é com grande satisfação que apresentamos mais uma edição da nossa revista digital. Neste mês, temos muitas novidades e melhorias para compartilhar com vocês. Agradeço a todos pela colaboração e desejo um excelente final de ano!",
      },
    },
    {
      id: 3,
      type: "avisos",
      content: {
        titulo: "Avisos Importantes",
        avisos: [
          {
            titulo: "Manutenção da Piscina",
            descricao: "A piscina estará fechada para manutenção nos dias 26 e 27 de dezembro.",
            tipo: "importante",
          },
          {
            titulo: "Horário de Funcionamento",
            descricao: "Durante o feriado, a portaria funcionará em horário reduzido.",
            tipo: "informativo",
          },
          {
            titulo: "Coleta de Lixo",
            descricao: "Não haverá coleta de lixo no dia 25 de dezembro.",
            tipo: "urgente",
          },
        ],
      },
    },
    {
      id: 4,
      type: "eventos",
      content: {
        titulo: "Agenda de Eventos",
        eventos: [
          {
            titulo: "Festa de Natal",
            data: "24/12/2024",
            horario: "20:00",
            local: "Salão de Festas",
          },
          {
            titulo: "Réveillon",
            data: "31/12/2024",
            horario: "22:00",
            local: "Área de Lazer",
          },
          {
            titulo: "Assembleia Geral",
            data: "15/01/2025",
            horario: "19:00",
            local: "Salão de Festas",
          },
        ],
      },
    },
    {
      id: 5,
      type: "funcionarios",
      content: {
        titulo: "Nossa Equipe",
        funcionarios: [
          { nome: "Carlos Santos", cargo: "Porteiro", turno: "Diurno" },
          { nome: "Maria Oliveira", cargo: "Zeladora", turno: "Integral" },
          { nome: "Pedro Lima", cargo: "Porteiro", turno: "Noturno" },
        ],
      },
    },
    {
      id: 6,
      type: "votacao",
      content: {
        titulo: "Funcionário do Mês",
        descricao: "Vote no funcionário que mais se destacou este mês!",
        opcoes: [
          { nome: "Carlos Santos", votos: 45 },
          { nome: "Maria Oliveira", votos: 38 },
          { nome: "Pedro Lima", votos: 22 },
        ],
      },
    },
    {
      id: 7,
      type: "telefones",
      content: {
        titulo: "Telefones Úteis",
        telefones: [
          { nome: "Portaria", numero: "(11) 1234-5678" },
          { nome: "Síndico", numero: "(11) 98765-4321" },
          { nome: "Administradora", numero: "(11) 2345-6789" },
          { nome: "Emergência", numero: "190" },
          { nome: "Bombeiros", numero: "193" },
        ],
      },
    },
    {
      id: 8,
      type: "realizacoes",
      content: {
        titulo: "Realizações da Gestão",
        realizacoes: [
          {
            titulo: "Reforma da Portaria",
            descricao: "Modernização completa da portaria com novo sistema de segurança.",
            data: "Novembro 2024",
            status: "concluido",
          },
          {
            titulo: "Instalação de Energia Solar",
            descricao: "Paineis solares instalados para redução de custos nas áreas comuns.",
            data: "Outubro 2024",
            status: "concluido",
          },
          {
            titulo: "Paisagismo do Jardim",
            descricao: "Novo projeto paisagístico com plantas nativas e sistema de irrigação.",
            data: "Setembro 2024",
            status: "concluido",
          },
        ],
      },
    },
    {
      id: 9,
      type: "antes_depois",
      content: {
        titulo: "Antes e Depois",
        itens: [
          {
            titulo: "Fachada do Prédio",
            descricao: "Pintura e revitalização completa da fachada.",
            fotoAntesUrl: null,
            fotoDepoisUrl: null,
          },
          {
            titulo: "Salão de Festas",
            descricao: "Reforma completa com novo mobiliário e iluminação.",
            fotoAntesUrl: null,
            fotoDepoisUrl: null,
          },
        ],
      },
    },
    {
      id: 10,
      type: "melhorias",
      content: {
        titulo: "Melhorias e Manutenções",
        melhorias: [
          {
            titulo: "Troca dos Elevadores",
            descricao: "Substituição dos elevadores por modelos mais modernos e eficientes.",
            status: "em_andamento",
            previsao: "Janeiro 2025",
          },
          {
            titulo: "Impermeabilização da Laje",
            descricao: "Serviço preventivo de impermeabilização da cobertura.",
            status: "planejado",
            previsao: "Fevereiro 2025",
          },
          {
            titulo: "Manutenção da Bomba d'Água",
            descricao: "Revisão e manutenção preventiva do sistema de bombeamento.",
            status: "concluido",
            previsao: null,
          },
        ],
      },
    },
    {
      id: 11,
      type: "aquisicoes",
      content: {
        titulo: "Aquisições do Condomínio",
        aquisicoes: [
          {
            titulo: "Equipamentos de Academia",
            descricao: "Novos equipamentos para a academia do condomínio.",
            valor: "R$ 15.000,00",
            data: "Dezembro 2024",
          },
          {
            titulo: "Mobiliário do Salão",
            descricao: "Mesas e cadeiras novas para o salão de festas.",
            valor: "R$ 8.500,00",
            data: "Novembro 2024",
          },
          {
            titulo: "Sistema de Câmeras",
            descricao: "Ampliação do sistema de monitoramento com 8 novas câmeras.",
            valor: "R$ 12.000,00",
            data: "Outubro 2024",
          },
        ],
      },
    },
    {
      id: 12,
      type: "galeria",
      content: {
        titulo: "Galeria de Fotos",
        albuns: [
          {
            titulo: "Festa Junina 2024",
            categoria: "eventos",
            fotos: [
              { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400", legenda: "Decoração do salão" },
              { url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", legenda: "Apresentação de quadrilha" },
              { url: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=400", legenda: "Barraca de comidas" },
            ],
          },
          {
            titulo: "Reforma da Piscina",
            categoria: "obras",
            fotos: [
              { url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400", legenda: "Antes da reforma" },
              { url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400", legenda: "Depois da reforma" },
            ],
          },
        ],
      },
    },
    {
      id: 13,
      type: "publicidade",
      content: {
        titulo: "Parceiros do Condomínio",
        anunciantes: [
          {
            nome: "Pizzaria Bella Napoli",
            descricao: "A melhor pizza da região! Delivery para moradores com 10% de desconto.",
            categoria: "alimentacao",
            telefone: "(11) 3456-7890",
            whatsapp: "(11) 99876-5432",
            logoUrl: null,
          },
          {
            nome: "Dr. Carlos Mendes",
            descricao: "Clínico Geral - Atendimento domiciliar para moradores.",
            categoria: "saude",
            telefone: "(11) 2345-6789",
            logoUrl: null,
          },
          {
            nome: "Pet Shop Amigo Fiel",
            descricao: "Banho, tosa e rações. Buscamos e entregamos seu pet!",
            categoria: "servicos",
            telefone: "(11) 3456-1234",
            whatsapp: "(11) 98765-1234",
            logoUrl: null,
          },
          {
            nome: "Eletricista João",
            descricao: "Serviços elétricos em geral. Morador do bloco B.",
            categoria: "profissionais",
            telefone: "(11) 99999-8888",
            logoUrl: null,
          },
        ],
      },
    },
    {
      id: 14,
      type: "personalizado",
      content: {
        titulo: "100% Personalizado",
        subtitulo: "Conteúdo exclusivo do seu condomínio",
        descricao: "Esta página pode ser totalmente personalizada pelo síndico com título, subtítulo, descrição, galeria de imagens, links externos, vídeos do YouTube e arquivos para download.",
        imagens: [],
        link: null,
        videoUrl: null,
        arquivoUrl: null,
      },
    },
    {
      id: 15,
      type: "back_cover",
      content: {
        titulo: "Obrigado pela leitura!",
        mensagem: "Acompanhe nossas próximas edições",
      },
    },
  ],
};

export default function MagazineViewer() {
  const params = useParams<{ shareLink: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showToc, setShowToc] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Swipe/drag state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  
  // New navigation features
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(100);
  const pageRef = useRef<HTMLDivElement>(null);
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 200;
  const ZOOM_STEP = 25;
  
  // Reading mode state (page or continuous)
  const [readingMode, setReadingMode] = useState<'page' | 'continuous'>('page');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generatePDF = trpc.revista.generatePDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF gerado com sucesso!');
      setIsGeneratingPDF(false);
    },
    onError: (error) => {
      toast.error('Erro ao gerar PDF: ' + error.message);
      setIsGeneratingPDF(false);
    },
  });

  const handleDownloadPDF = () => {
    // Usar o shareLink da URL para gerar o PDF da revista correta
    const shareLink = params.shareLink;
    if (!shareLink) {
      toast.error('Link da revista não encontrado');
      return;
    }
    setIsGeneratingPDF(true);
    generatePDF.mutate({ shareLink });
  };

  const magazine = demoMagazine;
  const totalPages = magazine.pages.length;

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages && !isFlipping) {
      setDirection(pageIndex > currentPage ? "next" : "prev");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setIsFlipping(false);
      }, 400);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && zoomLevel === 100) nextPage();
      if (e.key === "ArrowLeft" && zoomLevel === 100) prevPage();
      if (e.key === "Escape") {
        if (zoomLevel !== 100) resetZoom();
        else if (isFullscreen) toggleFullscreen();
        else if (showThumbnails) setShowThumbnails(false);
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "t" || e.key === "T") setShowThumbnails(prev => !prev);
      if (e.key === "c" || e.key === "C") setReadingMode(prev => prev === 'page' ? 'continuous' : 'page');
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isFlipping, isFullscreen, showThumbnails, zoomLevel, readingMode]);

  // Show swipe hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('revista-swipe-hint-seen');
    if (!hasSeenHint) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('revista-swipe-hint-seen', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      toast.error('Não foi possível ativar o modo ecrã inteiro');
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  // Pinch-to-zoom handlers
  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Swipe handlers for mobile
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    // Check for pinch gesture
    if (e.touches.length === 2) {
      setIsPinching(true);
      setInitialPinchDistance(getDistance(e.touches));
      setInitialZoom(zoomLevel);
      return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Handle pinch-to-zoom
    if (isPinching && e.touches.length === 2 && initialPinchDistance) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, MIN_ZOOM), MAX_ZOOM);
      setZoomLevel(Math.round(newZoom));
      return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false);
      setInitialPinchDistance(null);
      return;
    }
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && zoomLevel === 100) nextPage();
    if (isRightSwipe && zoomLevel === 100) prevPage();
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null) return;
    const distance = dragStart - e.clientX;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;
    if (isLeftDrag) nextPage();
    if (isRightDrag) prevPage();
    setIsDragging(false);
    setDragStart(null);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const currentPageData = magazine.pages[currentPage];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col"
    >
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 py-3 px-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-appsindico.png" alt="App Síndico" className="w-8 h-8 object-contain" />
            <img src="/logo-appsindico-texto.png" alt="App Síndico" className="h-5 object-contain hidden sm:inline" />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowToc(!showToc)}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Índice</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Partilhar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">{isGeneratingPDF ? 'A gerar...' : 'PDF'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                onClick={zoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
                title="Diminuir zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <button
                onClick={resetZoom}
                className="text-white/70 hover:text-white text-xs font-medium min-w-[48px] py-1 px-2 rounded hover:bg-white/10 transition-colors"
                title="Repor zoom (0)"
              >
                {zoomLevel}%
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                onClick={zoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            {/* Reading mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                readingMode === 'continuous' && "bg-white/20 text-white"
              )}
              onClick={() => setReadingMode(readingMode === 'page' ? 'continuous' : 'page')}
              title={readingMode === 'page' ? "Modo contínuo (C)" : "Modo página (C)"}
            >
              {readingMode === 'page' ? <ScrollText className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowThumbnails(!showThumbnails)}
              title="Miniaturas (T)"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={toggleFullscreen}
              title="Ecrã inteiro (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Magazine viewer */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Table of contents sidebar */}
        <AnimatePresence>
          {showToc && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute left-4 top-4 bottom-4 w-64 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-20 overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-white">Índice</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={() => setShowToc(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {magazine.pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      goToPage(index);
                      setShowToc(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      currentPage === index
                        ? "bg-primary text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="text-xs text-white/50 mr-2">{index + 1}.</span>
                    {getPageTitle(page)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnails panel */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-4 top-4 bottom-4 w-72 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-20 overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-white">Miniaturas</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={() => setShowThumbnails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {magazine.pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      goToPage(index);
                      setShowThumbnails(false);
                    }}
                    className={cn(
                      "relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200",
                      "border-2",
                      currentPage === index
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-white/20 hover:border-white/40 hover:scale-102"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <span className="text-white/60 text-xs font-medium text-center px-2">
                        {getPageTitle(page)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page mode - single page with flip animation */}
        {readingMode === 'page' && (
          <>
            {/* Magazine container with navigation */}
            <div className="w-full max-w-2xl mx-auto relative">
              {/* Navigation buttons - positioned at magazine margins with glow animation */}
              <button
                className="magazine-nav-arrow magazine-nav-arrow-left -left-20 md:-left-24"
                onClick={prevPage}
                disabled={currentPage === 0 || isFlipping}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                className="magazine-nav-arrow magazine-nav-arrow-right -right-20 md:-right-24"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1 || isFlipping}
                aria-label="Próxima página"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Magazine page with swipe/drag support and zoom */}
              <div 
                ref={pageRef}
                className={cn(
                  "perspective-1000 select-none transition-all duration-200",
                  zoomLevel > 100 ? "overflow-auto cursor-move" : "cursor-grab active:cursor-grabbing",
                  zoomLevel > 100 && "max-h-[70vh] rounded-lg"
                )}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{
                  touchAction: zoomLevel > 100 ? 'pan-x pan-y' : 'none',
                }}
              >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{
                    rotateY: direction === "next" ? 90 : -90,
                    opacity: 0,
                  }}
                  animate={{
                    rotateY: 0,
                    opacity: 1,
                  }}
                  exit={{
                    rotateY: direction === "next" ? -90 : 90,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden origin-center"
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: zoomLevel > 100 ? 'top left' : 'center',
                  }}
                >
                  <PageContent page={currentPageData} />
                </motion.div>
              </AnimatePresence>
              </div>
            </div>

            {/* Swipe hint for new users */}
            <AnimatePresence>
              {showSwipeHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/70 backdrop-blur-sm border border-white/20">
                    <Hand className="w-5 h-5 text-white animate-bounce" />
                    <span className="text-white text-sm font-medium">
                      Arraste para navegar entre páginas
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Continuous mode - vertical scroll */}
        {readingMode === 'continuous' && (
          <div 
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-auto scroll-smooth px-4"
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollTop = container.scrollTop;
              const pageHeight = container.scrollHeight / totalPages;
              const newPage = Math.round(scrollTop / pageHeight);
              if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
                setCurrentPage(newPage);
              }
            }}
          >
            <div className="max-w-2xl mx-auto py-8 space-y-8">
              {magazine.pages.map((page, index) => (
                <motion.div
                  key={index}
                  ref={(el) => { pageRefs.current[index] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden scroll-mt-8",
                    currentPage === index && "ring-4 ring-primary/50"
                  )}
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                  onClick={() => setCurrentPage(index)}
                >
                  <PageContent page={page} />
                </motion.div>
              ))}
            </div>
            
            {/* Floating page indicator */}
            <div className="fixed bottom-24 right-8 z-30">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-white text-sm font-medium">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>
            
            {/* Quick navigation buttons */}
            <div className="fixed bottom-24 left-8 z-30 flex flex-col gap-2">
              <button
                onClick={() => {
                  pageRefs.current[0]?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentPage(0);
                }}
                className="bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/20 text-white/70 hover:text-white hover:bg-black/90 transition-colors"
                title="Ir para o início"
              >
                <ChevronLeft className="w-5 h-5 rotate-90" />
              </button>
              <button
                onClick={() => {
                  pageRefs.current[totalPages - 1]?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentPage(totalPages - 1);
                }}
                className="bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/20 text-white/70 hover:text-white hover:bg-black/90 transition-colors"
                title="Ir para o fim"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with page indicator */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-3 px-4">
        <div className="container flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {magazine.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (readingMode === 'continuous') {
                    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
                  }
                  goToPage(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === index
                    ? "bg-primary w-6"
                    : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <span className="text-white/50 text-sm">
            Página {currentPage + 1} de {totalPages}
          </span>
          {readingMode === 'continuous' && (
            <span className="text-white/30 text-xs ml-2">
              (Modo contínuo)
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

function getPageTitle(page: any): string {
  switch (page.type) {
    case "cover":
      return "Capa";
    case "mensagem_sindico":
      return "Mensagem do Síndico";
    case "avisos":
      return "Avisos";
    case "eventos":
      return "Eventos";
    case "funcionarios":
      return "Funcionários";
    case "votacao":
      return "Votação";
    case "telefones":
      return "Telefones Úteis";
    case "realizacoes":
      return "Realizações";
    case "antes_depois":
      return "Antes e Depois";
    case "melhorias":
      return "Melhorias";
    case "aquisicoes":
      return "Aquisições";
    case "galeria":
      return "Galeria de Fotos";
    case "publicidade":
      return "Parceiros";
    case "personalizado":
      return "100% Personalizado";
    case "back_cover":
      return "Contracapa";
    default:
      return "Página";
  }
}

function PageContent({ page }: { page: any }) {
  switch (page.type) {
    case "cover":
      return <CoverPage content={page.content} />;
    case "mensagem_sindico":
      return <MensagemSindicoPage content={page.content} />;
    case "avisos":
      return <AvisosPage content={page.content} />;
    case "eventos":
      return <EventosPage content={page.content} />;
    case "funcionarios":
      return <FuncionariosPage content={page.content} />;
    case "votacao":
      return <VotacaoPage content={page.content} />;
    case "telefones":
      return <TelefonesPage content={page.content} />;
    case "realizacoes":
      return <RealizacoesPage content={page.content} />;
    case "antes_depois":
      return <AntesDepoisPage content={page.content} />;
    case "melhorias":
      return <MelhoriasPage content={page.content} />;
    case "aquisicoes":
      return <AquisicoesPage content={page.content} />;
    case "galeria":
      return <GaleriaPage content={page.content} />;
    case "publicidade":
      return <PublicidadePage content={page.content} />;
    case "personalizado":
      return <PersonalizadoPage content={page.content} />;
    case "back_cover":
      return <BackCoverPage content={page.content} />;
    default:
      return <div className="p-8">Conteúdo não disponível</div>;
  }
}

function CoverPage({ content }: { content: any }) {
  const hasBackgroundImage = content.capaUrl || content.imagem;
  
  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
      style={{
        backgroundImage: hasBackgroundImage 
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${content.capaUrl || content.imagem})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient fallback quando não há imagem */}
      {!hasBackgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white to-accent/20" />
      )}
      
      <div className="relative z-10">
        {/* Logo do condomínio ou ícone padrão */}
        {content.logoUrl ? (
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto shadow-lg border-2 border-white/20">
            <img 
              src={content.logoUrl} 
              alt="Logo do Condomínio" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl gradient-magazine flex items-center justify-center mb-6 mx-auto">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        )}
        
        <div className={cn(
          "text-xs uppercase tracking-[0.3em] mb-2",
          hasBackgroundImage ? "text-white/80" : "text-muted-foreground"
        )}>
          {content.edicao}
        </div>
        
        <h1 className={cn(
          "font-serif text-4xl font-bold mb-2",
          hasBackgroundImage ? "text-white drop-shadow-lg" : "text-foreground"
        )}>
          {content.titulo}
        </h1>
        
        <p className={cn(
          "text-lg mb-8",
          hasBackgroundImage ? "text-white/90" : "text-muted-foreground"
        )}>
          {content.subtitulo}
        </p>
        
        <div className={cn(
          "section-divider",
          hasBackgroundImage && "bg-white/50"
        )} />
        
        <p className={cn(
          "text-sm mt-8",
          hasBackgroundImage ? "text-white/70" : "text-muted-foreground"
        )}>
          App Síndico
        </p>
      </div>
    </div>
  );
}

function MensagemSindicoPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo || "Mensagem do Síndico"}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Foto do Síndico */}
        {content.foto ? (
          <div className="w-28 h-28 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20 shadow-lg">
            <img
              src={content.foto}
              alt={content.nome || "Síndico"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mb-4 ring-4 ring-primary/10">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
        )}
        
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {content.nome || "Síndico"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{content.cargo || "Síndico"}</p>

        <blockquote className="text-center italic text-muted-foreground leading-relaxed max-w-md px-4">
          "{content.mensagem}"
        </blockquote>
        
        {content.assinatura && (
          <p className="mt-4 text-sm font-medium text-primary">
            — {content.assinatura}
          </p>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 2 —</div>
    </div>
  );
}

function AvisosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.avisos.map((aviso: any, index: number) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-xl border-l-4",
              aviso.tipo === "urgente"
                ? "bg-red-50 border-red-500"
                : aviso.tipo === "importante"
                ? "bg-amber-50 border-amber-500"
                : "bg-blue-50 border-blue-500"
            )}
          >
            <div className="flex items-start gap-3">
              <Megaphone
                className={cn(
                  "w-5 h-5 mt-0.5",
                  aviso.tipo === "urgente"
                    ? "text-red-500"
                    : aviso.tipo === "importante"
                    ? "text-amber-500"
                    : "text-blue-500"
                )}
              />
              <div>
                <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
                <p className="text-sm text-muted-foreground">{aviso.descricao}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 3 —</div>
    </div>
  );
}

function EventosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.eventos.map((evento: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{evento.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {evento.data} às {evento.horario}
                </p>
                <p className="text-sm text-primary">{evento.local}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 4 —</div>
    </div>
  );
}

function FuncionariosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4">
        {content.funcionarios.map((func: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{func.nome}</h3>
              <p className="text-sm text-muted-foreground">{func.cargo}</p>
              <p className="text-xs text-primary">{func.turno}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 5 —</div>
    </div>
  );
}

function VotacaoPage({ content }: { content: any }) {
  const totalVotos = content.opcoes.reduce((acc: number, opt: any) => acc + opt.votos, 0);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">{content.descricao}</p>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.opcoes.map((opcao: any, index: number) => {
          const percentage = Math.round((opcao.votos / totalVotos) * 100);
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{opcao.nome}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {opcao.votos} votos ({percentage}%)
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-magazine rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Total de votos: {totalVotos}
        </p>
        <div className="text-xs text-muted-foreground">— 6 —</div>
      </div>
    </div>
  );
}

function TelefonesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3">
        {content.telefones.map((tel: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{tel.nome}</span>
            </div>
            <span className="text-primary font-semibold">{tel.numero}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 7 —</div>
    </div>
  );
}

function PublicidadePage({ content }: { content: any }) {
  const categoriaColors: Record<string, string> = {
    comercio: "bg-blue-100 text-blue-800 border-blue-200",
    servicos: "bg-green-100 text-green-800 border-green-200",
    profissionais: "bg-purple-100 text-purple-800 border-purple-200",
    alimentacao: "bg-orange-100 text-orange-800 border-orange-200",
    saude: "bg-red-100 text-red-800 border-red-200",
    educacao: "bg-yellow-100 text-yellow-800 border-yellow-200",
    outros: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const categoriaLabels: Record<string, string> = {
    comercio: "Comércio",
    servicos: "Serviços",
    profissionais: "Profissionais",
    alimentacao: "Alimentação",
    saude: "Saúde",
    educacao: "Educação",
    outros: "Outros",
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-3">
          <Star className="w-4 h-4" />
          Parceiros Recomendados
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apoie os comércios e profissionais da nossa comunidade
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {content.anunciantes?.map((anunciante: any, index: number) => (
          <div
            key={index}
            className={cn(
              "rounded-xl border-2 p-4 transition-all hover:shadow-lg hover:scale-[1.02]",
              categoriaColors[anunciante.categoria] || categoriaColors.outros
            )}
          >
            <div className="flex items-start gap-3">
              {anunciante.logoUrl ? (
                <img
                  src={anunciante.logoUrl}
                  alt={anunciante.nome}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {anunciante.nome.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {anunciante.nome}
                </h3>
                <span className="text-xs opacity-75">
                  {categoriaLabels[anunciante.categoria] || "Outros"}
                </span>
              </div>
            </div>
            <p className="text-xs mt-2 line-clamp-2 opacity-90">
              {anunciante.descricao}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {anunciante.telefone && (
                <a
                  href={`tel:${anunciante.telefone}`}
                  className="inline-flex items-center gap-1 text-xs bg-white/50 px-2 py-1 rounded-full hover:bg-white/80 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {anunciante.telefone}
                </a>
              )}
              {anunciante.whatsapp && (
                <a
                  href={`https://wa.me/${anunciante.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-800 px-2 py-1 rounded-full hover:bg-green-500/30 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-dashed">
        <p className="text-xs text-muted-foreground">
          Quer anunciar aqui? Entre em contato com a administração
        </p>
      </div>
    </div>
  );
}

function RealizacaoItem({ item, statusColors, statusLabels }: { item: any; statusColors: Record<string, string>; statusLabels: Record<string, string> }) {
  const [showGallery, setShowGallery] = useState(false);
  
  // Combinar imagem principal com imagens adicionais
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border flex-shrink-0",
              statusColors[item.status] || statusColors.concluido
            )}>
              {statusLabels[item.status] || "Concluído"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.data && <p className="text-xs text-emerald-600 mt-1">{item.data}</p>}
          {todasImagens.length > 1 && (
            <button 
              onClick={() => setShowGallery(true)}
              className="text-xs text-emerald-600 hover:underline mt-1"
            >
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function RealizacoesPage({ content }: { content: any }) {
  const statusColors: Record<string, string> = {
    concluido: "bg-emerald-100 text-emerald-800 border-emerald-200",
    em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
    planejado: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const statusLabels: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    planejado: "Planejado",
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-medium mb-3">
          <Trophy className="w-4 h-4" />
          Conquistas da Gestão
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.realizacoes?.map((item: any, index: number) => (
          <RealizacaoItem key={index} item={item} statusColors={statusColors} statusLabels={statusLabels} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 8 —</div>
    </div>
  );
}

function AntesDepoisPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3">
          <ArrowLeftRight className="w-4 h-4" />
          Transformações
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-6">
        {content.itens?.map((item: any, index: number) => (
          <div key={index} className="space-y-3">
            <h3 className="font-semibold text-foreground text-center">{item.titulo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-center text-muted-foreground uppercase tracking-wider">Antes</div>
                {item.fotoAntesUrl ? (
                  <img
                    src={item.fotoAntesUrl}
                    alt={`${item.titulo} - Antes`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-red-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
                    <Image className="w-8 h-8 text-red-300" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-center text-muted-foreground uppercase tracking-wider">Depois</div>
                {item.fotoDepoisUrl ? (
                  <img
                    src={item.fotoDepoisUrl}
                    alt={`${item.titulo} - Depois`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-emerald-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-300" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">{item.descricao}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 9 —</div>
    </div>
  );
}

function MelhoriaItem({ item, statusColors, statusLabels, statusIcons }: { item: any; statusColors: Record<string, string>; statusLabels: Record<string, string>; statusIcons: Record<string, any> }) {
  const [showGallery, setShowGallery] = useState(false);
  const StatusIcon = statusIcons[item.status] || Wrench;
  
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", statusColors[item.status] || "bg-gray-100")}>
            <StatusIcon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className={cn("text-xs px-2 py-1 rounded-full flex-shrink-0", statusColors[item.status] || "bg-gray-100 text-gray-800")}>
              {statusLabels[item.status] || item.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.previsao && <p className="text-xs text-primary mt-1">Previsão: {item.previsao}</p>}
          {todasImagens.length > 1 && (
            <button onClick={() => setShowGallery(true)} className="text-xs text-blue-600 hover:underline mt-1">
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function MelhoriasPage({ content }: { content: any }) {
  const statusColors: Record<string, string> = {
    concluido: "bg-emerald-100 text-emerald-800",
    em_andamento: "bg-blue-100 text-blue-800",
    planejado: "bg-amber-100 text-amber-800",
  };

  const statusLabels: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    planejado: "Planejado",
  };

  const statusIcons: Record<string, any> = {
    concluido: CheckCircle,
    em_andamento: Wrench,
    planejado: Calendar,
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm font-medium mb-3">
          <Wrench className="w-4 h-4" />
          Obras e Manutenções
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.melhorias?.map((item: any, index: number) => (
          <MelhoriaItem key={index} item={item} statusColors={statusColors} statusLabels={statusLabels} statusIcons={statusIcons} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 10 —</div>
    </div>
  );
}

function AquisicaoItem({ item }: { item: any }) {
  const [showGallery, setShowGallery] = useState(false);
  
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className="text-sm font-bold text-amber-700 flex-shrink-0">{item.valor}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.data && <p className="text-xs text-amber-600 mt-1">{item.data}</p>}
          {todasImagens.length > 1 && (
            <button onClick={() => setShowGallery(true)} className="text-xs text-amber-600 hover:underline mt-1">
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function AquisicoesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-sm font-medium mb-3">
          <ShoppingBag className="w-4 h-4" />
          Novos Equipamentos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.aquisicoes?.map((item: any, index: number) => (
          <AquisicaoItem key={index} item={item} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 11 —</div>
    </div>
  );
}

function BackCoverPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-white to-accent/20 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-magazine flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
        {content.titulo}
      </h2>
      <p className="text-muted-foreground mb-8">{content.mensagem}</p>
      <div className="section-divider" />
      <p className="text-sm text-muted-foreground mt-8">
        Criado com App Síndico
      </p>
    </div>
  );
}


function GaleriaPage({ content }: { content: any }) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; legenda: string } | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<number>(0);
  
  const categoriaColors: Record<string, string> = {
    eventos: "bg-purple-100 text-purple-800",
    obras: "bg-orange-100 text-orange-800",
    areas_comuns: "bg-blue-100 text-blue-800",
    melhorias: "bg-emerald-100 text-emerald-800",
    outros: "bg-gray-100 text-gray-800",
  };
  
  const categoriaLabels: Record<string, string> = {
    eventos: "Eventos",
    obras: "Obras",
    areas_comuns: "Áreas Comuns",
    melhorias: "Melhorias",
    outros: "Outros",
  };

  const currentAlbum = content.albuns?.[selectedAlbum];

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 text-sm font-medium mb-2">
          <Image className="w-4 h-4" />
          Memórias do Condomínio
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {content.titulo}
        </h2>
      </div>

      {/* Album selector */}
      {content.albuns && content.albuns.length > 1 && (
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {content.albuns.map((album: any, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedAlbum(index)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedAlbum === index
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {album.titulo}
            </button>
          ))}
        </div>
      )}

      {/* Current album */}
      {currentAlbum && (
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{currentAlbum.titulo}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              categoriaColors[currentAlbum.categoria] || categoriaColors.outros
            )}>
              {categoriaLabels[currentAlbum.categoria] || "Outros"}
            </span>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[calc(100%-80px)]">
            {currentAlbum.fotos?.map((foto: any, index: number) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(foto)}
              >
                <img
                  src={foto.url}
                  alt={foto.legenda || `Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {foto.legenda && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{foto.legenda}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-white/80"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.legenda}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {selectedPhoto.legenda && (
                <p className="text-white text-center mt-4 text-lg">
                  {selectedPhoto.legenda}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {(!content.albuns || content.albuns.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Image className="w-12 h-12 mb-4 opacity-50" />
          <p>Nenhum álbum disponível</p>
        </div>
      )}
    </div>
  );
}


function PersonalizadoPage({ content }: { content: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    if (content.imagens && content.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % content.imagens.length);
    }
  };
  
  const prevImage = () => {
    if (content.imagens && content.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + content.imagens.length) % content.imagens.length);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          100% Personalizado
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo || "Página Personalizada"}
        </h2>
        {content.subtitulo && (
          <p className="text-muted-foreground mt-1">{content.subtitulo}</p>
        )}
      </div>

      {/* Galeria de Imagens */}
      {content.imagens && content.imagens.length > 0 && (
        <div className="relative mb-6 rounded-xl overflow-hidden bg-muted/30">
          <div className="aspect-video relative">
            <img
              src={content.imagens[currentImageIndex]?.url}
              alt={content.imagens[currentImageIndex]?.legenda || "Imagem"}
              className="w-full h-full object-cover"
            />
            {content.imagens.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {content.imagens.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        currentImageIndex === index ? "bg-white w-4" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {content.imagens[currentImageIndex]?.legenda && (
            <p className="text-center text-sm text-muted-foreground py-2">
              {content.imagens[currentImageIndex].legenda}
            </p>
          )}
        </div>
      )}

      {/* Descrição */}
      {content.descricao && (
        <div className="mb-6">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {content.descricao}
          </p>
        </div>
      )}

      {/* Links e Ações */}
      <div className="flex flex-wrap gap-3 mt-auto">
        {content.link && (
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Link
          </a>
        )}
        {content.videoUrl && (
          <a
            href={content.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <Play className="w-4 h-4" />
            Ver Vídeo
          </a>
        )}
        {content.arquivoUrl && (
          <a
            href={content.arquivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Baixar Arquivo
          </a>
        )}
      </div>

      {/* Empty state */}
      {!content.descricao && (!content.imagens || content.imagens.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Sparkles className="w-12 h-12 mb-4 opacity-50" />
          <p>Esta página pode ser personalizada pelo síndico</p>
          <p className="text-sm">Adicione título, descrição, imagens, links e muito mais!</p>
        </div>
      )}
    </div>
  );
}

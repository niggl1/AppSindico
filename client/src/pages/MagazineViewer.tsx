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
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Tipos para os dados da revista
interface MagazinePage {
  id: number;
  type: string;
  content: any;
}

interface Magazine {
  nome: string;
  edicao: string;
  pages: MagazinePage[];
}

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

  // Buscar dados reais da revista via tRPC
  const { data: magazineData, isLoading, error } = trpc.revista.getPublicFull.useQuery(
    { shareLink: params.shareLink || '' },
    { enabled: !!params.shareLink }
  );

  // Construir o objeto magazine a partir dos dados reais
  const magazine = useMemo<Magazine | null>(() => {
    if (!magazineData?.revista || !magazineData?.condominio) return null;

    const { revista, condominio, mensagemSindico, avisos, eventos, funcionarios, telefones, anunciantes, realizacoes, melhorias, aquisicoes, albuns, fotos, votacoes, classificados, achadosPerdidos, caronas, dicasSeguranca, regras, paginasCustom, seccoesOcultas } = magazineData;

    const pages: MagazinePage[] = [];
    let pageId = 1;

    // Capa
    pages.push({
      id: pageId++,
      type: "cover",
      content: {
        titulo: condominio.nome,
        subtitulo: `Edição ${revista.edicao}`,
        edicao: `Edição ${revista.edicao}`,
        logoUrl: condominio.logoUrl,
        capaUrl: revista.capaUrl,
      },
    });

    // Mensagem do Síndico
    if (mensagemSindico && !seccoesOcultas.includes('mensagem_sindico')) {
      pages.push({
        id: pageId++,
        type: "mensagem_sindico",
        content: {
          titulo: mensagemSindico.titulo || "Mensagem do Síndico",
          nome: mensagemSindico.nomeSindico || "Síndico",
          cargo: mensagemSindico.assinatura || "Síndico",
          foto: mensagemSindico.fotoSindicoUrl,
          mensagem: mensagemSindico.mensagem,
        },
      });
    }

    // Avisos
    if (avisos && avisos.length > 0 && !seccoesOcultas.includes('avisos')) {
      pages.push({
        id: pageId++,
        type: "avisos",
        content: {
          titulo: "Avisos Importantes",
          avisos: avisos.map((a: any) => ({
            titulo: a.titulo,
            descricao: a.descricao,
            data: a.data,
            prioridade: a.prioridade,
          })),
        },
      });
    }

    // Eventos
    if (eventos && eventos.length > 0 && !seccoesOcultas.includes('eventos')) {
      pages.push({
        id: pageId++,
        type: "eventos",
        content: {
          titulo: "Eventos",
          eventos: eventos.map((e: any) => ({
            titulo: e.titulo,
            descricao: e.descricao,
            data: e.data,
            horario: e.horario,
            local: e.local,
          })),
        },
      });
    }

    // Funcionários
    if (funcionarios && funcionarios.length > 0 && !seccoesOcultas.includes('funcionarios')) {
      pages.push({
        id: pageId++,
        type: "funcionarios",
        content: {
          titulo: "Nossa Equipe",
          funcionarios: funcionarios.map((f: any) => ({
            nome: f.nome,
            cargo: f.cargo,
            foto: f.fotoUrl,
            telefone: f.telefone,
            horario: f.horario,
          })),
        },
      });
    }

    // Votações
    if (votacoes && votacoes.length > 0 && !seccoesOcultas.includes('votacao')) {
      pages.push({
        id: pageId++,
        type: "votacao",
        content: {
          titulo: "Votações Ativas",
          votacoes: votacoes.map((v: any) => ({
            titulo: v.titulo,
            descricao: v.descricao,
            dataFim: v.dataFim,
            opcoes: v.opcoes,
          })),
        },
      });
    }

    // Telefones Úteis
    if (telefones && telefones.length > 0 && !seccoesOcultas.includes('telefones')) {
      pages.push({
        id: pageId++,
        type: "telefones",
        content: {
          titulo: "Telefones Úteis",
          telefones: telefones.map((t: any) => ({
            nome: t.nome,
            telefone: t.telefone,
            categoria: t.categoria,
          })),
        },
      });
    }

    // Realizações
    if (realizacoes && realizacoes.length > 0 && !seccoesOcultas.includes('realizacoes')) {
      pages.push({
        id: pageId++,
        type: "realizacoes",
        content: {
          titulo: "Realizações",
          realizacoes: realizacoes.map((r: any) => ({
            titulo: r.titulo,
            descricao: r.descricao,
            data: r.data,
            status: r.status,
            imagemUrl: r.imagemUrl,
          })),
        },
      });
    }

    // Melhorias
    if (melhorias && melhorias.length > 0 && !seccoesOcultas.includes('melhorias')) {
      pages.push({
        id: pageId++,
        type: "melhorias",
        content: {
          titulo: "Melhorias e Manutenções",
          melhorias: melhorias.map((m: any) => ({
            titulo: m.titulo,
            descricao: m.descricao,
            status: m.status,
            previsao: m.previsao,
            imagemUrl: m.imagemUrl,
          })),
        },
      });
    }

    // Aquisições
    if (aquisicoes && aquisicoes.length > 0 && !seccoesOcultas.includes('aquisicoes')) {
      pages.push({
        id: pageId++,
        type: "aquisicoes",
        content: {
          titulo: "Aquisições do Condomínio",
          aquisicoes: aquisicoes.map((a: any) => ({
            titulo: a.titulo,
            descricao: a.descricao,
            valor: a.valor,
            data: a.data,
            imagemUrl: a.imagemUrl,
          })),
        },
      });
    }

    // Galeria de Fotos
    if (albuns && albuns.length > 0 && !seccoesOcultas.includes('galeria')) {
      pages.push({
        id: pageId++,
        type: "galeria",
        content: {
          titulo: "Galeria de Fotos",
          albuns: albuns.map((album: any) => ({
            titulo: album.titulo,
            categoria: album.categoria,
            fotos: fotos
              .filter((f: any) => f.albumId === album.id)
              .map((f: any) => ({
                url: f.url,
                legenda: f.legenda,
              })),
          })),
        },
      });
    }

    // Publicidade / Anunciantes
    if (anunciantes && anunciantes.length > 0 && !seccoesOcultas.includes('publicidade')) {
      pages.push({
        id: pageId++,
        type: "publicidade",
        content: {
          titulo: "Parceiros do Condomínio",
          anunciantes: anunciantes.map((a: any) => ({
            nome: a.nome,
            descricao: a.descricao,
            categoria: a.categoria,
            telefone: a.telefone,
            whatsapp: a.whatsapp,
            logoUrl: a.logoUrl,
          })),
        },
      });
    }

    // Classificados
    if (classificados && classificados.length > 0 && !seccoesOcultas.includes('classificados')) {
      pages.push({
        id: pageId++,
        type: "classificados",
        content: {
          titulo: "Classificados",
          classificados: classificados.map((c: any) => ({
            titulo: c.titulo,
            descricao: c.descricao,
            preco: c.preco,
            contato: c.contato,
            categoria: c.categoria,
            imagemUrl: c.imagemUrl,
          })),
        },
      });
    }

    // Achados e Perdidos
    if (achadosPerdidos && achadosPerdidos.length > 0 && !seccoesOcultas.includes('achados_perdidos')) {
      pages.push({
        id: pageId++,
        type: "achados_perdidos",
        content: {
          titulo: "Achados e Perdidos",
          itens: achadosPerdidos.map((item: any) => ({
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: item.tipo,
            data: item.data,
            local: item.local,
            imagemUrl: item.imagemUrl,
          })),
        },
      });
    }

    // Caronas
    if (caronas && caronas.length > 0 && !seccoesOcultas.includes('caronas')) {
      pages.push({
        id: pageId++,
        type: "caronas",
        content: {
          titulo: "Caronas",
          caronas: caronas.map((c: any) => ({
            origem: c.origem,
            destino: c.destino,
            data: c.data,
            horario: c.horario,
            vagas: c.vagas,
            contato: c.contato,
          })),
        },
      });
    }

    // Dicas de Segurança
    if (dicasSeguranca && dicasSeguranca.length > 0 && !seccoesOcultas.includes('dicas_seguranca')) {
      pages.push({
        id: pageId++,
        type: "dicas_seguranca",
        content: {
          titulo: "Dicas de Segurança",
          dicas: dicasSeguranca.map((d: any) => ({
            titulo: d.titulo,
            descricao: d.descricao,
            icone: d.icone,
          })),
        },
      });
    }

    // Regras do Condomínio
    if (regras && regras.length > 0 && !seccoesOcultas.includes('regras')) {
      pages.push({
        id: pageId++,
        type: "regras",
        content: {
          titulo: "Regras do Condomínio",
          regras: regras.map((r: any) => ({
            titulo: r.titulo,
            descricao: r.descricao,
            categoria: r.categoria,
          })),
        },
      });
    }

    // Páginas Personalizadas
    if (paginasCustom && paginasCustom.length > 0) {
      paginasCustom.forEach((p: any) => {
        pages.push({
          id: pageId++,
          type: "personalizado",
          content: {
            titulo: p.titulo,
            subtitulo: p.subtitulo,
            descricao: p.descricao,
            imagens: p.imagens ? JSON.parse(p.imagens) : [],
            link: p.link,
            videoUrl: p.videoUrl,
            arquivoUrl: p.arquivoUrl,
          },
        });
      });
    }

    // Contracapa
    pages.push({
      id: pageId++,
      type: "back_cover",
      content: {
        titulo: "Obrigado pela leitura!",
        mensagem: "Acompanhe nossas próximas edições",
      },
    });

    return {
      nome: condominio.nome,
      edicao: `Edição ${revista.edicao}`,
      pages,
    };
  }, [magazineData]);

  const totalPages = magazine?.pages.length || 0;

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

  // Zoom functions
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const resetZoom = () => setZoomLevel(100);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

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
  }, [currentPage, isFlipping, isFullscreen, showThumbnails, zoomLevel, readingMode, totalPages]);

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

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 100) return;
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(distance);
      setInitialZoom(zoomLevel);
      setIsPinching(true);
      return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching && initialPinchDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / initialPinchDistance;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom * scale));
      setZoomLevel(Math.round(newZoom / 5) * 5);
      return;
    }
    if (zoomLevel > 100) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false);
      setInitialPinchDistance(null);
      return;
    }
    if (zoomLevel > 100) return;
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextPage();
    if (isRightSwipe) prevPage();
  };

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 100) return;
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel > 100) return;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null || zoomLevel > 100) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    const distance = dragStart - e.clientX;
    if (distance > minSwipeDistance) nextPage();
    if (distance < -minSwipeDistance) prevPage();
    setIsDragging(false);
    setDragStart(null);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white/70">A carregar revista...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Revista não encontrada</h2>
          <p className="text-white/70 mb-6">
            {error?.message || "O link da revista pode estar incorreto ou a revista pode ter sido removida."}
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm flex items-center gap-2"
                >
                  <Hand className="w-4 h-4" />
                  Arraste para navegar entre páginas
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Continuous mode - scrollable pages */}
        {readingMode === 'continuous' && (
          <div 
            ref={scrollContainerRef}
            className="w-full max-w-2xl mx-auto h-[calc(100vh-180px)] overflow-y-auto space-y-8 pr-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          >
            {magazine.pages.map((page, index) => (
              <div
                key={page.id}
                ref={(el) => { pageRefs.current[index] = el; }}
                className="magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{ 
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <PageContent page={page} />
              </div>
            ))}
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
                onClick={() => goToPage(index)}
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
      return page.content?.titulo || "100% Personalizado";
    case "classificados":
      return "Classificados";
    case "achados_perdidos":
      return "Achados e Perdidos";
    case "caronas":
      return "Caronas";
    case "dicas_seguranca":
      return "Dicas de Segurança";
    case "regras":
      return "Regras";
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
    case "classificados":
      return <ClassificadosPage content={page.content} />;
    case "achados_perdidos":
      return <AchadosPerdidosPage content={page.content} />;
    case "caronas":
      return <CaronasPage content={page.content} />;
    case "dicas_seguranca":
      return <DicasSegurancaPage content={page.content} />;
    case "regras":
      return <RegrasPage content={page.content} />;
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

        <div className="relative max-w-md">
          <div className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">"</div>
          <p className="text-foreground leading-relaxed text-center italic px-6">
            {content.mensagem || "Bem-vindos à nossa revista digital!"}
          </p>
          <div className="absolute -bottom-4 -right-4 text-6xl text-primary/20 font-serif rotate-180">"</div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">— 2 —</div>
    </div>
  );
}

function AvisosPage({ content }: { content: any }) {
  const prioridadeColors: Record<string, string> = {
    alta: "bg-red-100 text-red-800 border-red-200",
    media: "bg-amber-100 text-amber-800 border-amber-200",
    baixa: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-3">
          <Megaphone className="w-4 h-4" />
          Fique por dentro
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.avisos?.map((aviso: any, index: number) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-xl border-l-4",
              prioridadeColors[aviso.prioridade] || "bg-secondary border-border"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
              {aviso.data && (
                <span className="text-xs text-muted-foreground">{aviso.data}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{aviso.descricao}</p>
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3">
          <Calendar className="w-4 h-4" />
          Agenda
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.eventos?.map((evento: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 border border-border flex gap-4"
          >
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center text-white flex-shrink-0">
              <span className="text-xs uppercase">{evento.data?.split(' ')[0] || 'TBD'}</span>
              <span className="text-xl font-bold">{evento.data?.split(' ')[1] || '--'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">{evento.titulo}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{evento.descricao}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {evento.horario && <span>🕐 {evento.horario}</span>}
                {evento.local && <span>📍 {evento.local}</span>}
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm font-medium mb-3">
          <Users className="w-4 h-4" />
          Equipe
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-auto">
        {content.funcionarios?.map((func: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 border border-border text-center"
          >
            {func.foto ? (
              <img
                src={func.foto}
                alt={func.nome}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
            )}
            <h3 className="font-semibold text-foreground text-sm">{func.nome}</h3>
            <p className="text-xs text-muted-foreground">{func.cargo}</p>
            {func.horario && (
              <p className="text-xs text-primary mt-1">{func.horario}</p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 5 —</div>
    </div>
  );
}

function VotacaoPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 text-sm font-medium mb-3">
          <Vote className="w-4 h-4" />
          Participe
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.votacoes?.map((votacao: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100"
          >
            <h3 className="font-semibold text-foreground mb-2">{votacao.titulo}</h3>
            <p className="text-sm text-muted-foreground mb-3">{votacao.descricao}</p>
            {votacao.dataFim && (
              <p className="text-xs text-indigo-600">Votação até: {votacao.dataFim}</p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 6 —</div>
    </div>
  );
}

function TelefonesPage({ content }: { content: any }) {
  const categoriaIcons: Record<string, any> = {
    emergencia: Shield,
    servicos: Wrench,
    administracao: Building2,
    outros: Phone,
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium mb-3">
          <Phone className="w-4 h-4" />
          Contatos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.telefones?.map((tel: any, index: number) => {
          const Icon = categoriaIcons[tel.categoria] || Phone;
          return (
            <div
              key={index}
              className="p-3 rounded-lg bg-secondary/50 border border-border flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm">{tel.nome}</h3>
                <p className="text-sm text-primary font-mono">{tel.telefone}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 7 —</div>
    </div>
  );
}

function RealizacoesPage({ content }: { content: any }) {
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
          <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-start gap-4">
              {item.imagemUrl ? (
                <img src={item.imagemUrl} alt={item.titulo} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", statusColors[item.status] || "bg-gray-100")}>
                  <Trophy className="w-5 h-5" />
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
                {item.data && <p className="text-xs text-primary mt-1">{item.data}</p>}
              </div>
            </div>
          </div>
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
          <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-start gap-4">
              {item.imagemUrl ? (
                <img src={item.imagemUrl} alt={item.titulo} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", statusColors[item.status] || "bg-gray-100")}>
                  <Wrench className="w-5 h-5" />
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 10 —</div>
    </div>
  );
}

function AquisicoesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-sm font-medium mb-3">
          <ShoppingBag className="w-4 h-4" />
          Investimentos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.aquisicoes?.map((item: any, index: number) => (
          <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-start gap-4">
              {item.imagemUrl ? (
                <img src={item.imagemUrl} alt={item.titulo} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-amber-700" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {item.valor && <span className="text-emerald-600 font-medium">{item.valor}</span>}
                  {item.data && <span className="text-muted-foreground">{item.data}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 11 —</div>
    </div>
  );
}

function GaleriaPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 text-sm font-medium mb-3">
          <Image className="w-4 h-4" />
          Momentos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-6 overflow-auto">
        {content.albuns?.map((album: any, index: number) => (
          <div key={index}>
            <h3 className="font-semibold text-foreground mb-3">{album.titulo}</h3>
            <div className="grid grid-cols-3 gap-2">
              {album.fotos?.slice(0, 6).map((foto: any, fotoIndex: number) => (
                <div key={fotoIndex} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={foto.url}
                    alt={foto.legenda || `Foto ${fotoIndex + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 12 —</div>
    </div>
  );
}

function PublicidadePage({ content }: { content: any }) {
  const categoriaColors: Record<string, string> = {
    alimentacao: "bg-orange-100 text-orange-800",
    saude: "bg-red-100 text-red-800",
    servicos: "bg-blue-100 text-blue-800",
    profissionais: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 text-sm font-medium mb-3">
          <Star className="w-4 h-4" />
          Parceiros
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 overflow-auto">
        {content.anunciantes?.map((anunciante: any, index: number) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-secondary/50 border border-border"
          >
            {anunciante.logoUrl ? (
              <img
                src={anunciante.logoUrl}
                alt={anunciante.nome}
                className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg mx-auto mb-2 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-violet-600" />
              </div>
            )}
            <h3 className="font-semibold text-foreground text-sm text-center">{anunciante.nome}</h3>
            <p className="text-xs text-muted-foreground text-center line-clamp-2 mt-1">{anunciante.descricao}</p>
            {anunciante.telefone && (
              <p className="text-xs text-primary text-center mt-2">{anunciante.telefone}</p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 13 —</div>
    </div>
  );
}

function ClassificadosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 text-sm font-medium mb-3">
          <ShoppingBag className="w-4 h-4" />
          Compra e Venda
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.classificados?.map((item: any, index: number) => (
          <div key={index} className="p-3 rounded-xl bg-secondary/50 border border-border flex gap-3">
            {item.imagemUrl ? (
              <img src={item.imagemUrl} alt={item.titulo} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-teal-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">{item.titulo}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.descricao}</p>
              {item.preco && <p className="text-sm text-emerald-600 font-medium mt-1">{item.preco}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 14 —</div>
    </div>
  );
}

function AchadosPerdidosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-3">
          <Package className="w-4 h-4" />
          Achados e Perdidos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.itens?.map((item: any, index: number) => (
          <div key={index} className="p-3 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                item.tipo === 'achado' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              )}>
                {item.tipo === 'achado' ? 'Achado' : 'Perdido'}
              </span>
              {item.data && <span className="text-xs text-muted-foreground">{item.data}</span>}
            </div>
            <h3 className="font-semibold text-foreground text-sm">{item.titulo}</h3>
            <p className="text-xs text-muted-foreground">{item.descricao}</p>
            {item.local && <p className="text-xs text-primary mt-1">📍 {item.local}</p>}
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 15 —</div>
    </div>
  );
}

function CaronasPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 text-sm font-medium mb-3">
          <Car className="w-4 h-4" />
          Caronas
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.caronas?.map((carona: any, index: number) => (
          <div key={index} className="p-3 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="text-muted-foreground">{carona.origem}</span>
              <span className="text-primary">→</span>
              <span className="text-foreground font-medium">{carona.destino}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {carona.data && <span>📅 {carona.data}</span>}
              {carona.horario && <span>🕐 {carona.horario}</span>}
              {carona.vagas && <span>👥 {carona.vagas} vagas</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 16 —</div>
    </div>
  );
}

function DicasSegurancaPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-800 text-sm font-medium mb-3">
          <Shield className="w-4 h-4" />
          Segurança
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.dicas?.map((dica: any, index: number) => (
          <div key={index} className="p-4 rounded-xl bg-red-50 border border-red-100">
            <h3 className="font-semibold text-foreground text-sm mb-1">{dica.titulo}</h3>
            <p className="text-xs text-muted-foreground">{dica.descricao}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 17 —</div>
    </div>
  );
}

function RegrasPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 text-sm font-medium mb-3">
          <FileText className="w-4 h-4" />
          Regulamento
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {content.regras?.map((regra: any, index: number) => (
          <div key={index} className="p-3 rounded-xl bg-secondary/50 border border-border">
            <h3 className="font-semibold text-foreground text-sm">{regra.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1">{regra.descricao}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 18 —</div>
    </div>
  );
}

function PersonalizadoPage({ content }: { content: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-800 text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          Exclusivo
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        {content.subtitulo && (
          <p className="text-muted-foreground mt-1">{content.subtitulo}</p>
        )}
        <div className="section-divider mt-3" />
      </div>

      {/* Galeria de Imagens */}
      {content.imagens && content.imagens.length > 0 && (
        <div className="mb-6">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
            <img
              src={content.imagens[currentImageIndex]?.url || content.imagens[currentImageIndex]}
              alt={content.imagens[currentImageIndex]?.legenda || `Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {content.imagens.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? content.imagens.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === content.imagens.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
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

function BackCoverPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary/10 via-white to-accent/10">
      <div className="w-16 h-16 rounded-2xl gradient-magazine flex items-center justify-center mb-6">
        <Heart className="w-8 h-8 text-white" />
      </div>
      
      <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
        {content.titulo}
      </h2>
      
      <p className="text-muted-foreground mb-8">
        {content.mensagem}
      </p>
      
      <div className="section-divider" />
      
      <p className="text-sm text-muted-foreground mt-8">
        Desenvolvido com ❤️ pelo App Síndico
      </p>
    </div>
  );
}

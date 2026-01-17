import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Download,
  Share2,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Printer,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

interface TimelineVisualizarPageProps {
  token: string;
}

export default function TimelineVisualizarPage({ token }: TimelineVisualizarPageProps) {
  const [copied, setCopied] = useState(false);

  // Buscar timeline pelo token
  const { data: timeline, isLoading, error } = trpc.timeline.obterPorToken.useQuery(
    { token },
    { enabled: !!token }
  );

  // Mutation para registar visualização
  const registarVisualizacaoMutation = trpc.timeline.registarVisualizacao.useMutation();

  // Mutation para gerar PDF
  const gerarPdfMutation = trpc.timeline.gerarPdf.useMutation({
    onSuccess: (data) => {
      // Criar blob e fazer download
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-${timeline?.protocolo || token}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar PDF");
    },
  });

  // Registar visualização ao carregar
  useEffect(() => {
    if (timeline && token) {
      registarVisualizacaoMutation.mutate({
        token,
      });
    }
  }, [timeline?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (timeline) {
      gerarPdfMutation.mutate({ id: timeline.id });
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade?.toLowerCase()) {
      case "alta":
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200";
      case "média":
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baixa":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "concluído":
      case "concluido":
      case "finalizado":
        return "bg-green-100 text-green-800 border-green-200";
      case "em andamento":
      case "em_andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">A carregar timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Timeline não encontrada</h2>
            <p className="text-gray-600 mb-6">
              O link pode ter expirado ou a timeline foi removida.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 print:bg-white">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white print:bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 print:hidden">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleCopyLink}
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleDownloadPdf}
                disabled={gerarPdfMutation.isPending}
              >
                {gerarPdfMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{timeline.titulo}</h1>
            <p className="text-white/90 text-lg">
              Protocolo: <span className="font-mono font-semibold">{timeline.protocolo}</span>
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative h-16 -mb-1">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z"
              fill="white"
              className="print:fill-white"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-4">
        {/* Status e Prioridade */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {timeline.status?.nome && (
            <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor(timeline.status?.nome)}`}>
              {timeline.status?.nome}
            </Badge>
          )}
          {timeline.prioridade?.nome && (
            <Badge className={`px-4 py-2 text-sm font-medium ${getPrioridadeColor(timeline.prioridade?.nome)}`}>
              Prioridade: {timeline.prioridade?.nome}
            </Badge>
          )}
          <Badge className="px-4 py-2 text-sm font-medium bg-orange-100 text-orange-800 border-orange-200">
            {timeline.estado === "rascunho" ? "Rascunho" : timeline.estado === "enviado" ? "Enviado" : "Registado"}
          </Badge>
        </div>

        {/* Informações Principais */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Informações
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="font-medium text-gray-900">{timeline.responsavel?.nome || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Local / Item</p>
                    <p className="font-medium text-gray-900">{timeline.local?.nome || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data e Hora</p>
                    <p className="font-medium text-gray-900">
                      {new Date(timeline.dataRegistro).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {timeline.horaRegistro && ` às ${timeline.horaRegistro}`}
                    </p>
                  </div>
                </div>

                {timeline.localizacaoGps && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Localização GPS</p>
                      <p className="font-medium text-gray-900 text-sm">{timeline.localizacaoGps}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descrição */}
        {timeline.descricao && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Descrição
              </h2>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {timeline.descricao}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Imagens */}
        {timeline.imagens && timeline.imagens.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Imagens ({timeline.imagens.length})
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {timeline.imagens.map((img: any, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={img.legenda || `Imagem ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                    />
                    {img.legenda && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                        <p className="text-white text-sm">{img.legenda}</p>
                      </div>
                    )}
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-700" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8 print:hidden">
          <Separator className="mb-8" />
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleDownloadPdf}
              disabled={gerarPdfMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
            >
              {gerarPdfMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Baixar PDF
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar Link"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Gerado por <span className="font-semibold text-orange-600">App Manutenção</span>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:bg-orange-500 {
            background: #f97316 !important;
          }
        }
      `}</style>
    </div>
  );
}

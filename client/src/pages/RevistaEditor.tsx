import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Car,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Link as LinkIcon,
  Loader2,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Save,
  Settings,
  Share2,
  Star,
  Trash2,
  Users,
  Vote,
  Image,
  Building2,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import AvisoForm from "@/components/forms/AvisoForm";
import FuncionarioForm from "@/components/forms/FuncionarioForm";
import VotacaoForm from "@/components/forms/VotacaoForm";
import ImageUpload from "@/components/ImageUpload";

const sectionTypes = [
  { id: "mensagem_sindico", name: "Mensagem do Síndico", icon: MessageSquare, color: "text-blue-500" },
  { id: "avisos", name: "Avisos", icon: Megaphone, color: "text-amber-500" },
  { id: "eventos", name: "Eventos", icon: Calendar, color: "text-emerald-500" },
  { id: "funcionarios", name: "Funcionários", icon: Users, color: "text-purple-500" },
  { id: "votacao", name: "Votações", icon: Vote, color: "text-pink-500" },
  { id: "telefones", name: "Telefones Úteis", icon: Phone, color: "text-cyan-500" },
  { id: "links", name: "Links Úteis", icon: LinkIcon, color: "text-indigo-500" },
  { id: "classificados", name: "Classificados", icon: Package, color: "text-orange-500" },
  { id: "caronas", name: "Caronas", icon: Car, color: "text-teal-500" },
  { id: "achados", name: "Achados e Perdidos", icon: Heart, color: "text-red-500" },
];

export default function RevistaEditor() {
  const params = useParams<{ id: string }>();
  const revistaId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("conteudo");
  const [showAvisoForm, setShowAvisoForm] = useState(false);
  const [showFuncionarioForm, setShowFuncionarioForm] = useState(false);
  const [showVotacaoForm, setShowVotacaoForm] = useState(false);
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [showClassificadoForm, setShowClassificadoForm] = useState(false);
  const [showCaronaForm, setShowCaronaForm] = useState(false);
  const [showAchadoForm, setShowAchadoForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Estado para secções ocultas
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  
  // Função para alternar visibilidade de uma secção
  const toggleSectionVisibility = (sectionId: string) => {
    setHiddenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        toast.success("Secção reativada");
      } else {
        newSet.add(sectionId);
        toast.info("Secção ocultada da revista");
      }
      return newSet;
    });
  };
  
  // Mensagem do síndico state
  const [mensagemSindico, setMensagemSindico] = useState({
    titulo: "Mensagem do Síndico",
    nomeSindico: "",
    fotoSindicoUrl: "",
    mensagem: "",
    assinatura: "",
  });

  const { data: revista, isLoading: revistaLoading } = trpc.revista.get.useQuery(
    { id: revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: avisos, isLoading: avisosLoading } = trpc.aviso.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: votacoes } = trpc.votacao.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: telefones } = trpc.telefone.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: links } = trpc.link.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: eventosData, isLoading: eventosLoading } = trpc.evento.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: funcionariosData, isLoading: funcionariosLoading } = trpc.funcionario.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const utils = trpc.useUtils();

  const publishMutation = trpc.revista.update.useMutation({
    onSuccess: () => {
      toast.success("Revista publicada com sucesso!");
      utils.revista.get.invalidate({ id: revistaId });
    },
    onError: (error) => {
      toast.error("Erro ao publicar: " + error.message);
    },
  });

  const updateCapaMutation = trpc.revista.update.useMutation({
    onSuccess: () => {
      toast.success("Capa atualizada com sucesso!");
      utils.revista.get.invalidate({ id: revistaId });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar capa: " + error.message);
    },
  });

  const deleteAvisoMutation = trpc.aviso.delete.useMutation({
    onSuccess: () => {
      toast.success("Aviso removido!");
      utils.aviso.list.invalidate({ revistaId });
    },
  });

  const createTelefoneMutation = trpc.telefone.create.useMutation({
    onSuccess: () => {
      toast.success("Telefone adicionado!");
      utils.telefone.list.invalidate({ revistaId });
    },
  });

  const createLinkMutation = trpc.link.create.useMutation({
    onSuccess: () => {
      toast.success("Link adicionado!");
      utils.link.list.invalidate({ revistaId });
    },
  });

  const createEventoMutation = trpc.evento.create.useMutation({
    onSuccess: () => {
      toast.success("Evento adicionado!");
      utils.evento.list.invalidate({ revistaId });
      setShowEventoForm(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });

  const deleteEventoMutation = trpc.evento.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento removido!");
      utils.evento.list.invalidate({ revistaId });
    },
  });

  const deleteFuncionarioMutation = trpc.funcionario.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário removido!");
      utils.funcionario.list.invalidate({ revistaId });
    },
  });

  if (authLoading || revistaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar editor...</p>
        </div>
      </div>
    );
  }

  if (!revista) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Revista não encontrada</h2>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePublish = () => {
    publishMutation.mutate({ id: revistaId, status: "publicada" });
  };

  const shareUrl = `${window.location.origin}/revista/${revista.shareLink}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-lg font-bold">{revista.titulo}</h1>
                <p className="text-sm text-muted-foreground">{revista.edicao}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/revista/${revista.shareLink}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Pré-visualizar
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Partilhar
              </Button>
              <Button
                size="sm"
                className="btn-magazine"
                onClick={handlePublish}
                disabled={publishMutation.isPending || revista.status === "publicada"}
              >
                {publishMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {revista.status === "publicada" ? "Publicada" : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="conteudo">
              <FileText className="w-4 h-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="secoes">
              <BookOpen className="w-4 h-4 mr-2" />
              Secções
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo Tab */}
          <TabsContent value="conteudo" className="space-y-6">
            {/* Secções Ocultas - Painel para reativar */}
            {hiddenSections.size > 0 && (
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Secções Ocultas ({hiddenSections.size})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(hiddenSections).map((sectionId) => {
                    const sectionNames: Record<string, string> = {
                      mensagem_sindico: "Mensagem do Síndico",
                      avisos: "Avisos",
                      votacoes: "Votações",
                    };
                    return (
                      <Button
                        key={sectionId}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSectionVisibility(sectionId)}
                        className="bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Mostrar {sectionNames[sectionId] || sectionId}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Mensagem do Síndico - Premium */}
            {!hiddenSections.has("mensagem_sindico") && (
            <div id="mensagem-sindico-section" className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />
              
              {/* Elemento decorativo */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Mensagem do Síndico</h3>
                      <p className="text-sm text-slate-500">Escreva uma mensagem personalizada para os moradores</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionVisibility("mensagem_sindico")}
                    className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                    title="Ocultar esta secção da revista"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Ocultar
                  </Button>
                </div>
                
                <div className="space-y-5">
                  {/* Foto e Nome do Síndico */}
                  <div className="flex gap-6 items-start">
                    <div className="space-y-3 min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-medium">Foto do Síndico</Label>
                        {mensagemSindico.fotoSindicoUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMensagemSindico({ ...mensagemSindico, fotoSindicoUrl: "" })}
                            className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="relative group">
                        <ImageUpload
                          value={mensagemSindico.fotoSindicoUrl || undefined}
                          onChange={(url) => setMensagemSindico({ ...mensagemSindico, fotoSindicoUrl: url || "" })}
                          folder="revistas/sindicos"
                          aspectRatio="square"
                          placeholder="Carregar foto"
                          className="w-40 h-40 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors bg-white/50"
                          compact={true}
                        />
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs text-slate-500">JPEG, PNG, GIF ou WebP</p>
                        <p className="text-xs text-slate-400">(máx. 10MB)</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Nome do Síndico</Label>
                        <Input
                          value={mensagemSindico.nomeSindico}
                          onChange={(e) => setMensagemSindico({ ...mensagemSindico, nomeSindico: e.target.value })}
                          placeholder="Ex: João Silva"
                          className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Título da Mensagem</Label>
                        <Input
                          value={mensagemSindico.titulo}
                          onChange={(e) => setMensagemSindico({ ...mensagemSindico, titulo: e.target.value })}
                          placeholder="Mensagem do Síndico"
                          className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mensagem */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Mensagem</Label>
                    <Textarea
                      value={mensagemSindico.mensagem}
                      onChange={(e) => setMensagemSindico({ ...mensagemSindico, mensagem: e.target.value })}
                      placeholder="Prezados moradores, é com grande satisfação que apresento mais uma edição da nossa revista digital..."
                      rows={6}
                      className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl resize-none"
                    />
                  </div>
                  
                  {/* Assinatura */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Assinatura</Label>
                    <Input
                      value={mensagemSindico.assinatura}
                      onChange={(e) => setMensagemSindico({ ...mensagemSindico, assinatura: e.target.value })}
                      placeholder="Ex: Síndico do Residencial Jardins"
                      className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Avisos - Premium */}
            {!hiddenSections.has("avisos") && (
            <div id="avisos-section" className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Avisos</h3>
                      <p className="text-sm text-slate-500">Gerencie os avisos desta edição</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("avisos")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showAvisoForm} onOpenChange={setShowAvisoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Aviso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Novo Aviso</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <AvisoForm
                            revistaId={revistaId}
                            onSuccess={() => setShowAvisoForm(false)}
                            onCancel={() => setShowAvisoForm(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                {avisosLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Carregando avisos...</p>
                    </div>
                  </div>
                ) : avisos && avisos.length > 0 ? (
                  <div className="space-y-3">
                    {avisos.map((aviso) => (
                      <div
                        key={aviso.id}
                        className={cn(
                          "group relative p-4 rounded-xl border-l-4 flex items-start justify-between bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200",
                          aviso.tipo === "urgente"
                            ? "border-red-500 hover:shadow-red-100"
                            : aviso.tipo === "importante"
                            ? "border-amber-500 hover:shadow-amber-100"
                            : "border-blue-500 hover:shadow-blue-100"
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800">{aviso.titulo}</h4>
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              aviso.tipo === "urgente"
                                ? "bg-red-100 text-red-700"
                                : aviso.tipo === "importante"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            )}>
                              {aviso.tipo}
                            </span>
                          </div>
                          {aviso.conteudo && (
                            <p className="text-sm text-slate-600 line-clamp-2">{aviso.conteudo}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteAvisoMutation.mutate({ id: aviso.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-amber-200">
                    <div className="p-3 bg-amber-100 rounded-full w-fit mx-auto mb-3">
                      <Megaphone className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="font-medium text-slate-700">Nenhum aviso adicionado</p>
                    <p className="text-sm text-slate-500 mt-1">Clique em "Novo Aviso" para começar</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Votações - Premium */}
            {!hiddenSections.has("votacoes") && (
            <div id="votacoes-section" className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 rounded-2xl border border-pink-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-500/30">
                      <Vote className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Votações</h3>
                      <p className="text-sm text-slate-500">Crie enquetes e votações interativas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("votacoes")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showVotacaoForm} onOpenChange={setShowVotacaoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Votação
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Vote className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Nova Votação</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <VotacaoForm
                            revistaId={revistaId}
                            onSuccess={() => setShowVotacaoForm(false)}
                            onCancel={() => setShowVotacaoForm(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                {votacoes && votacoes.length > 0 ? (
                  <div className="space-y-3">
                    {votacoes.map((votacao) => (
                      <div
                        key={votacao.id}
                        className="group relative p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-pink-100 hover:bg-white/80 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{votacao.titulo}</h4>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                                {votacao.tipo?.replace("_", " ")}
                              </span>
                            </div>
                            {votacao.descricao && (
                              <p className="text-sm text-slate-600 line-clamp-2">{votacao.descricao}</p>
                            )}
                          </div>
                          <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
                            <Star className="w-4 h-4 text-amber-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-pink-200">
                    <div className="p-3 bg-pink-100 rounded-full w-fit mx-auto mb-3">
                      <Vote className="w-6 h-6 text-pink-500" />
                    </div>
                    <p className="font-medium text-slate-700">Nenhuma votação criada</p>
                    <p className="text-sm text-slate-500 mt-1">Crie enquetes para engajar os moradores</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Eventos - Premium */}
            {!hiddenSections.has("eventos") && (
            <div id="eventos-section" className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-green-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg shadow-emerald-500/30">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Eventos</h3>
                      <p className="text-sm text-slate-500">Agende eventos e atividades do condomínio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("eventos")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showEventoForm} onOpenChange={setShowEventoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md shadow-emerald-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Evento
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Novo Evento</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                          <div className="space-y-2">
                            <Label>Título do Evento *</Label>
                            <Input id="evento-titulo" placeholder="Ex: Assembleia Geral" />
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea id="evento-descricao" placeholder="Descreva o evento..." rows={3} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data</Label>
                              <Input id="evento-data" type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label>Horário</Label>
                              <Input id="evento-hora" type="time" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Local</Label>
                            <Input id="evento-local" placeholder="Ex: Salão de Festas" />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setShowEventoForm(false)}>Cancelar</Button>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500"
                              onClick={() => {
                                const titulo = (document.getElementById("evento-titulo") as HTMLInputElement).value;
                                const descricao = (document.getElementById("evento-descricao") as HTMLTextAreaElement).value;
                                const data = (document.getElementById("evento-data") as HTMLInputElement).value;
                                const hora = (document.getElementById("evento-hora") as HTMLInputElement).value;
                                const local = (document.getElementById("evento-local") as HTMLInputElement).value;
                                if (titulo) {
                                  createEventoMutation.mutate({
                                    revistaId,
                                    titulo,
                                    descricao: descricao || undefined,
                                    dataEvento: data ? new Date(data) : undefined,
                                    horaInicio: hora || undefined,
                                    local: local || undefined,
                                  });
                                } else {
                                  toast.error("Preencha o título do evento");
                                }
                              }}
                              disabled={createEventoMutation.isPending}
                            >
                              {createEventoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Evento"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                {eventosLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Carregando eventos...</p>
                    </div>
                  </div>
                ) : eventosData && eventosData.length > 0 ? (
                  <div className="space-y-3">
                    {eventosData.map((evento) => (
                      <div
                        key={evento.id}
                        className="group relative p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100 hover:bg-white/80 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{evento.titulo}</h4>
                              {evento.dataEvento && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                  {new Date(evento.dataEvento).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            {evento.descricao && (
                              <p className="text-sm text-slate-600 line-clamp-2">{evento.descricao}</p>
                            )}
                            {evento.local && (
                              <p className="text-xs text-slate-500 mt-1">Local: {evento.local}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteEventoMutation.mutate({ id: evento.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-emerald-200">
                    <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="font-medium text-slate-700">Nenhum evento agendado</p>
                    <p className="text-sm text-slate-500 mt-1">Clique em "Novo Evento" para começar</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Funcionários - Premium */}
            {!hiddenSections.has("funcionarios") && (
            <div id="funcionarios-section" className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-violet-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg shadow-purple-500/30">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Funcionários</h3>
                      <p className="text-sm text-slate-500">Apresente a equipe do condomínio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("funcionarios")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showFuncionarioForm} onOpenChange={setShowFuncionarioForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-md shadow-purple-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Funcionário
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Novo Funcionário</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <FuncionarioForm
                            revistaId={revistaId}
                            onSuccess={() => {
                              setShowFuncionarioForm(false);
                              utils.funcionario.list.invalidate({ revistaId });
                            }}
                            onCancel={() => setShowFuncionarioForm(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                {funcionariosLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Carregando funcionários...</p>
                    </div>
                  </div>
                ) : funcionariosData && funcionariosData.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {funcionariosData.map((funcionario) => (
                      <div
                        key={funcionario.id}
                        className="group relative p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-purple-100 hover:bg-white/80 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {funcionario.fotoUrl ? (
                            <img src={funcionario.fotoUrl} alt={funcionario.nome} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users className="w-6 h-6 text-purple-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{funcionario.nome}</h4>
                            {funcionario.cargo && (
                              <p className="text-sm text-slate-600">{funcionario.cargo}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteFuncionarioMutation.mutate({ id: funcionario.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-purple-200">
                    <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="font-medium text-slate-700">Nenhum funcionário cadastrado</p>
                    <p className="text-sm text-slate-500 mt-1">Apresente a equipe do condomínio</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Classificados - Premium */}
            {!hiddenSections.has("classificados") && (
            <div id="classificados-section" className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/30">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Classificados</h3>
                      <p className="text-sm text-slate-500">Produtos e serviços dos moradores</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("classificados")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showClassificadoForm} onOpenChange={setShowClassificadoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Classificado
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Novo Classificado</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <p className="text-center text-muted-foreground py-8">
                            Os classificados são geridos pelos moradores através do app.
                            <br />
                            Você pode visualizar e moderar os classificados existentes.
                          </p>
                          <Button variant="outline" className="w-full" onClick={() => setShowClassificadoForm(false)}>Fechar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-orange-200">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <Package className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="font-medium text-slate-700">Secção de Classificados</p>
                  <p className="text-sm text-slate-500 mt-1">Os moradores podem anunciar produtos e serviços</p>
                </div>
              </div>
            </div>
            )}

            {/* Caronas - Premium */}
            {!hiddenSections.has("caronas") && (
            <div id="caronas-section" className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 rounded-2xl border border-teal-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/30">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Caronas</h3>
                      <p className="text-sm text-slate-500">Compartilhe viagens com vizinhos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("caronas")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showCaronaForm} onOpenChange={setShowCaronaForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md shadow-teal-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Carona
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Car className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Nova Carona</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <p className="text-center text-muted-foreground py-8">
                            As caronas são geridas pelos moradores através do app.
                            <br />
                            Você pode visualizar as caronas disponíveis.
                          </p>
                          <Button variant="outline" className="w-full" onClick={() => setShowCaronaForm(false)}>Fechar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-teal-200">
                  <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-3">
                    <Car className="w-6 h-6 text-teal-500" />
                  </div>
                  <p className="font-medium text-slate-700">Secção de Caronas</p>
                  <p className="text-sm text-slate-500 mt-1">Os moradores podem oferecer e procurar caronas</p>
                </div>
              </div>
            </div>
            )}

            {/* Achados e Perdidos - Premium */}
            {!hiddenSections.has("achados") && (
            <div id="achados-section" className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl border border-red-100 shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Barra decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500" />
              
              {/* Elementos decorativos */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-red-200/20 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                {/* Header da secção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg shadow-red-500/30">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Achados e Perdidos</h3>
                      <p className="text-sm text-slate-500">Encontre ou reporte objetos perdidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility("achados")}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                      title="Ocultar esta secção da revista"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                    <Dialog open={showAchadoForm} onOpenChange={setShowAchadoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md shadow-red-500/25">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Achados e Perdidos</h3>
                          </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                          <p className="text-center text-muted-foreground py-8">
                            Os achados e perdidos são geridos pelos moradores através do app.
                            <br />
                            Você pode visualizar os itens reportados.
                          </p>
                          <Button variant="outline" className="w-full" onClick={() => setShowAchadoForm(false)}>Fechar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-red-200">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="font-medium text-slate-700">Secção de Achados e Perdidos</p>
                  <p className="text-sm text-slate-500 mt-1">Os moradores podem reportar itens achados ou perdidos</p>
                </div>
              </div>
            </div>
            )}
          </TabsContent>

          {/* Secções Tab */}
          <TabsContent value="secoes" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {sectionTypes.map((section) => {
                const Icon = section.icon;
                const isSelected = selectedSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section.id);
                      // Navegar para a aba Conteúdo e abrir o formulário correspondente
                      setActiveTab("conteudo");
                      // Abrir formulários específicos
                      if (section.id === "avisos") {
                        setShowAvisoForm(true);
                      } else if (section.id === "funcionarios") {
                        setShowFuncionarioForm(true);
                      } else if (section.id === "votacao") {
                        setShowVotacaoForm(true);
                      } else if (section.id === "eventos") {
                        setShowEventoForm(true);
                      } else if (section.id === "classificados") {
                        setShowClassificadoForm(true);
                      } else if (section.id === "caronas") {
                        setShowCaronaForm(true);
                      } else if (section.id === "achados") {
                        setShowAchadoForm(true);
                      }
                      // Scroll para a secção correspondente
                      setTimeout(() => {
                        const sectionMap: Record<string, string> = {
                          mensagem_sindico: "mensagem-sindico-section",
                          avisos: "avisos-section",
                          eventos: "eventos-section",
                          funcionarios: "funcionarios-section",
                          votacao: "votacoes-section",
                          telefones: "telefones-section",
                          links: "links-section",
                          classificados: "classificados-section",
                          caronas: "caronas-section",
                          achados: "achados-section",
                        };
                        const elementId = sectionMap[section.id];
                        if (elementId) {
                          const element = document.getElementById(elementId);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }
                      }, 100);
                      toast.success(`Secção "${section.name}" selecionada`);
                    }}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-center group",
                      isSelected 
                        ? "border-primary bg-primary/10 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center bg-secondary", section.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Add Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Adicionar Conteúdo Rápido</CardTitle>
                <CardDescription>
                  Selecione uma secção acima para adicionar conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Telefones */}
                  <div id="telefones-section" className="p-4 rounded-xl border border-border">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Phone className="w-4 h-4 text-cyan-500" />
                      Telefones Úteis
                    </h4>
                    <div className="space-y-2">
                      <Input placeholder="Nome (ex: Portaria)" id="tel-nome" />
                      <Input placeholder="Telefone" id="tel-numero" />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const nome = (document.getElementById("tel-nome") as HTMLInputElement).value;
                          const telefone = (document.getElementById("tel-numero") as HTMLInputElement).value;
                          if (nome && telefone) {
                            createTelefoneMutation.mutate({ revistaId, nome, telefone });
                            (document.getElementById("tel-nome") as HTMLInputElement).value = "";
                            (document.getElementById("tel-numero") as HTMLInputElement).value = "";
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    {telefones && telefones.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {telefones.map((tel) => (
                          <div key={tel.id} className="text-sm flex justify-between">
                            <span>{tel.nome}</span>
                            <span className="text-muted-foreground">{tel.telefone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div id="links-section" className="p-4 rounded-xl border border-border">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <LinkIcon className="w-4 h-4 text-indigo-500" />
                      Links Úteis
                    </h4>
                    <div className="space-y-2">
                      <Input placeholder="Título" id="link-titulo" />
                      <Input placeholder="URL (https://...)" id="link-url" />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const titulo = (document.getElementById("link-titulo") as HTMLInputElement).value;
                          const url = (document.getElementById("link-url") as HTMLInputElement).value;
                          if (titulo && url) {
                            createLinkMutation.mutate({ revistaId, titulo, url });
                            (document.getElementById("link-titulo") as HTMLInputElement).value = "";
                            (document.getElementById("link-url") as HTMLInputElement).value = "";
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    {links && links.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {links.map((link) => (
                          <div key={link.id} className="text-sm">
                            <a href={link.url || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {link.titulo}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="config" className="space-y-6">
            {/* Card de Imagem de Capa */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="font-serif flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  Imagem de Capa
                </CardTitle>
                <CardDescription>
                  Personalize a capa da sua revista com uma imagem de fundo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Upload de Imagem */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Imagem de Fundo da Capa</Label>
                    <ImageUpload
                      value={revista.capaUrl || undefined}
                      onChange={(url) => {
                        updateCapaMutation.mutate({ id: revistaId, capaUrl: url || "" });
                      }}
                      folder="revistas/capas"
                      aspectRatio="portrait"
                      placeholder="Clique para adicionar imagem de capa"
                      className="w-full"
                      compressionPreset="cover"
                      enableEditor={true}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: imagem vertical (3:4) com pelo menos 800x1066 pixels
                    </p>
                  </div>
                  
                  {/* Preview da Capa */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Pré-visualização</Label>
                    <div 
                      className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-gradient-to-br from-purple-100 via-white to-pink-100"
                      style={{
                        backgroundImage: revista.capaUrl 
                          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${revista.capaUrl})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        {!revista.capaUrl && (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <p className={cn(
                          "text-xs uppercase tracking-widest mb-1",
                          revista.capaUrl ? "text-white/80" : "text-slate-500"
                        )}>
                          Edição {revista.edicao}
                        </p>
                        <h3 className={cn(
                          "font-serif text-lg font-bold mb-1",
                          revista.capaUrl ? "text-white drop-shadow-lg" : "text-slate-800"
                        )}>
                          {revista.titulo}
                        </h3>
                        <p className={cn(
                          "text-sm",
                          revista.capaUrl ? "text-white/90" : "text-slate-600"
                        )}>
                          {revista.subtitulo || "Informativo Mensal"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Informações */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Informações da Revista</CardTitle>
                <CardDescription>
                  Configure os detalhes desta edição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={revista.titulo} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Edição</Label>
                    <Input value={revista.edicao || ""} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Link de Partilha</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly />
                    <Button variant="outline" onClick={copyShareLink}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    revista.status === "publicada" ? "bg-emerald-100 text-emerald-700" :
                    revista.status === "rascunho" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {revista.status === "publicada" ? "Publicada" :
                     revista.status === "rascunho" ? "Rascunho" : "Arquivada"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

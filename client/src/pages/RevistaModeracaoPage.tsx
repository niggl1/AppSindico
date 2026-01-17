import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  Filter,
  RefreshCw,
  CheckCheck,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  Shield,
  Bell,
  Ban,
  Type,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RevistaModeracaoPageProps {
  condominioId: number;
  onVoltar?: () => void;
}

export default function RevistaModeracaoPage({ condominioId, onVoltar }: RevistaModeracaoPageProps) {
  const { user } = useAuth();
  // toast importado de sonner
  const utils = trpc.useUtils();

  // Estados
  const [tabAtiva, setTabAtiva] = useState("pendentes");
  const [filtroStatus, setFiltroStatus] = useState<string>("pendente");
  const [filtroSecao, setFiltroSecao] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comentarioSelecionado, setComentarioSelecionado] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Configurações de moderação
  const [configModeracao, setConfigModeracao] = useState({
    modoAutomatico: false,
    notificarNovoComentario: true,
    permitirComentariosAnonimos: false,
    filtrarPalavrasOfensivas: true,
    palavrasBloqueadas: "",
    maxComentariosPorUsuario: 10,
    maxCaracteres: 1000,
  });

  // Queries
  const { data: configAtual, isLoading: loadingConfig } = trpc.revista.obterConfigModeracao.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  const { data: comentariosData, isLoading: loadingComentarios, refetch } = trpc.revista.listarComentariosPendentes.useQuery(
    { 
      condominioId, 
      status: filtroStatus as any,
      secao: filtroSecao || undefined,
      pagina: paginaAtual,
      limite: 10,
    },
    { enabled: !!condominioId }
  );

  // Mutations
  const salvarConfigMutation = trpc.revista.salvarConfigModeracao.useMutation({
    onSuccess: () => {
      toast({ title: "Configurações salvas com sucesso!" });
      setShowConfigDialog(false);
      utils.revista.obterConfigModeracao.invalidate();
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar configurações", description: error.message, variant: "destructive" });
    },
  });

  const aprovarMutation = trpc.revista.aprovarComentario.useMutation({
    onSuccess: () => {
      toast({ title: "Comentário aprovado!" });
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao aprovar", description: error.message, variant: "destructive" });
    },
  });

  const rejeitarMutation = trpc.revista.rejeitarComentario.useMutation({
    onSuccess: () => {
      toast({ title: "Comentário rejeitado!" });
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao rejeitar", description: error.message, variant: "destructive" });
    },
  });

  const excluirMutation = trpc.revista.excluirComentario.useMutation({
    onSuccess: () => {
      toast({ title: "Comentário excluído!" });
      setShowDeleteDialog(false);
      setComentarioSelecionado(null);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const aprovarTodosMutation = trpc.revista.aprovarTodosPendentes.useMutation({
    onSuccess: (data) => {
      toast({ title: `${data.aprovados} comentários aprovados!` });
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao aprovar todos", description: error.message, variant: "destructive" });
    },
  });

  // Carregar configurações
  useEffect(() => {
    if (configAtual) {
      setConfigModeracao({
        modoAutomatico: configAtual.modoAutomatico || false,
        notificarNovoComentario: configAtual.notificarNovoComentario ?? true,
        permitirComentariosAnonimos: configAtual.permitirComentariosAnonimos || false,
        filtrarPalavrasOfensivas: configAtual.filtrarPalavrasOfensivas ?? true,
        palavrasBloqueadas: configAtual.palavrasBloqueadas || "",
        maxComentariosPorUsuario: configAtual.maxComentariosPorUsuario || 10,
        maxCaracteres: configAtual.maxCaracteres || 1000,
      });
    }
  }, [configAtual]);

  const handleSalvarConfig = () => {
    salvarConfigMutation.mutate({
      condominioId,
      ...configModeracao,
    });
  };

  const handleAprovar = (id: number) => {
    aprovarMutation.mutate({ id });
  };

  const handleRejeitar = (id: number) => {
    rejeitarMutation.mutate({ id });
  };

  const handleExcluir = () => {
    if (comentarioSelecionado) {
      excluirMutation.mutate({ id: comentarioSelecionado.comentario.id });
    }
  };

  const handleAprovarTodos = () => {
    aprovarTodosMutation.mutate({ condominioId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case "aprovado":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPaginas = Math.ceil((comentariosData?.total || 0) / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onVoltar && (
            <Button variant="ghost" size="icon" onClick={onVoltar}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Moderação de Comentários
            </h1>
            <p className="text-muted-foreground">Gerencie os comentários da revista do condomínio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {filtroStatus === "pendente" ? comentariosData?.total || 0 : "-"}
              </p>
              <p className="text-sm text-yellow-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {filtroStatus === "aprovado" ? comentariosData?.total || 0 : "-"}
              </p>
              <p className="text-sm text-green-600">Aprovados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <X className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">
                {filtroStatus === "rejeitado" ? comentariosData?.total || 0 : "-"}
              </p>
              <p className="text-sm text-red-600">Rejeitados</p>
            </div>
          </CardContent>
        </Card>
        <Card className={configModeracao.modoAutomatico ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCheck className={`h-8 w-8 ${configModeracao.modoAutomatico ? "text-blue-600" : "text-gray-400"}`} />
            <div>
              <p className={`text-lg font-bold ${configModeracao.modoAutomatico ? "text-blue-700" : "text-gray-500"}`}>
                {configModeracao.modoAutomatico ? "Ativo" : "Inativo"}
              </p>
              <p className={`text-sm ${configModeracao.modoAutomatico ? "text-blue-600" : "text-gray-400"}`}>
                Modo Automático
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select value={filtroStatus} onValueChange={(v) => { setFiltroStatus(v); setPaginaAtual(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="rejeitado">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filtrar por seção..."
              value={filtroSecao}
              onChange={(e) => { setFiltroSecao(e.target.value); setPaginaAtual(1); }}
              className="w-48"
            />
            <div className="flex-1" />
            {filtroStatus === "pendente" && (comentariosData?.total || 0) > 0 && (
              <Button 
                variant="default" 
                onClick={handleAprovarTodos}
                disabled={aprovarTodosMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Aprovar Todos ({comentariosData?.total})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários ({comentariosData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingComentarios ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comentariosData?.comentarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum comentário encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentariosData?.comentarios.map((item) => (
                <div 
                  key={item.comentario.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(item.comentario.status || "pendente")}
                        <Badge variant="secondary">
                          <FileText className="w-3 h-3 mr-1" />
                          {item.comentario.secaoId}
                        </Badge>
                        {item.revista && (
                          <Badge variant="outline">
                            {item.revista.titulo}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{item.comentario.texto}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.usuario?.name || "Anônimo"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.comentario.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.comentario.status === "pendente" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleAprovar(item.comentario.id)}
                            disabled={aprovarMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleRejeitar(item.comentario.id)}
                            disabled={rejeitarMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setComentarioSelecionado(item);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Configurações */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Moderação
            </DialogTitle>
            <DialogDescription>
              Configure como os comentários serão moderados na revista
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Modo Automático */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
              <div className="flex items-center gap-3">
                <CheckCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <Label className="font-medium">Modo Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Aprovar todos os comentários automaticamente
                  </p>
                </div>
              </div>
              <Switch
                checked={configModeracao.modoAutomatico}
                onCheckedChange={(checked) => setConfigModeracao(c => ({ ...c, modoAutomatico: checked }))}
              />
            </div>

            {/* Notificações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Notificar novos comentários</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alerta quando houver novos comentários
                  </p>
                </div>
              </div>
              <Switch
                checked={configModeracao.notificarNovoComentario}
                onCheckedChange={(checked) => setConfigModeracao(c => ({ ...c, notificarNovoComentario: checked }))}
              />
            </div>

            {/* Comentários anônimos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Permitir comentários anônimos</Label>
                  <p className="text-sm text-muted-foreground">
                    Usuários podem comentar sem identificação
                  </p>
                </div>
              </div>
              <Switch
                checked={configModeracao.permitirComentariosAnonimos}
                onCheckedChange={(checked) => setConfigModeracao(c => ({ ...c, permitirComentariosAnonimos: checked }))}
              />
            </div>

            {/* Filtro de palavras */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ban className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Filtrar palavras ofensivas</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloquear automaticamente palavras impróprias
                  </p>
                </div>
              </div>
              <Switch
                checked={configModeracao.filtrarPalavrasOfensivas}
                onCheckedChange={(checked) => setConfigModeracao(c => ({ ...c, filtrarPalavrasOfensivas: checked }))}
              />
            </div>

            {/* Palavras bloqueadas */}
            {configModeracao.filtrarPalavrasOfensivas && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Palavras bloqueadas (separadas por vírgula)
                </Label>
                <Textarea
                  value={configModeracao.palavrasBloqueadas}
                  onChange={(e) => setConfigModeracao(c => ({ ...c, palavrasBloqueadas: e.target.value }))}
                  placeholder="palavra1, palavra2, palavra3..."
                  rows={3}
                />
              </div>
            )}

            {/* Limites */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Máx. comentários/usuário
                </Label>
                <Input
                  type="number"
                  value={configModeracao.maxComentariosPorUsuario}
                  onChange={(e) => setConfigModeracao(c => ({ ...c, maxComentariosPorUsuario: parseInt(e.target.value) || 10 }))}
                  min={1}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Máx. caracteres
                </Label>
                <Input
                  type="number"
                  value={configModeracao.maxCaracteres}
                  onChange={(e) => setConfigModeracao(c => ({ ...c, maxCaracteres: parseInt(e.target.value) || 1000 }))}
                  min={100}
                  max={5000}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarConfig} disabled={salvarConfigMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Excluir Comentário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {comentarioSelecionado && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">{comentarioSelecionado.usuario?.name || "Anônimo"}</p>
              <p className="text-muted-foreground">{comentarioSelecionado.comentario.texto}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

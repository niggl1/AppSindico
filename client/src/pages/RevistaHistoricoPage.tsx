import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, History, Eye, RotateCcw, Trash2, GitCompare, Calendar, User, FileText, CheckCircle, AlertCircle, Plus, Minus, Edit } from "lucide-react";

export default function RevistaHistoricoPage() {
  const [, params] = useRoute("/revista/:id/historico");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const revistaId = params?.id ? parseInt(params.id) : 0;

  const [versaoSelecionada, setVersaoSelecionada] = useState<number | null>(null);
  const [versaoComparar1, setVersaoComparar1] = useState<number | null>(null);
  const [versaoComparar2, setVersaoComparar2] = useState<number | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalCompararAberto, setModalCompararAberto] = useState(false);
  const [modalRestaurarAberto, setModalRestaurarAberto] = useState(false);

  const { data: versoes, isLoading, refetch } = trpc.revista.listarVersoes.useQuery({ revistaId }, { enabled: revistaId > 0 });
  const { data: versaoDetalhes } = trpc.revista.obterVersao.useQuery({ versaoId: versaoSelecionada! }, { enabled: !!versaoSelecionada && modalVisualizarAberto });
  const { data: comparacao } = trpc.revista.compararVersoes.useQuery({ versaoId1: versaoComparar1!, versaoId2: versaoComparar2! }, { enabled: !!versaoComparar1 && !!versaoComparar2 && modalCompararAberto });

  const restaurarMutation = trpc.revista.restaurarVersao.useMutation({
    onSuccess: () => { toast.success("Versão restaurada!"); setModalRestaurarAberto(false); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const excluirMutation = trpc.revista.excluirVersao.useMutation({
    onSuccess: () => { toast.success("Versão excluída!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const getTipoBadge = (tipo: string) => {
    const cores: Record<string, string> = { criacao: "bg-green-500", edicao: "bg-blue-500", publicacao: "bg-purple-500", restauracao: "bg-orange-500" };
    return <Badge className={cores[tipo] || ""}>{tipo}</Badge>;
  };

  const formatDate = (d: Date | string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/revista/${revistaId}/editor`)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><History className="h-6 w-6" />Histórico de Versões</h1>
            <p className="text-muted-foreground">{versoes?.length || 0} versões salvas</p>
          </div>
        </div>
        {versaoComparar1 && versaoComparar2 && <Button onClick={() => setModalCompararAberto(true)}><GitCompare className="h-4 w-4 mr-2" />Comparar</Button>}
      </div>

      <div className="grid gap-4">
        {versoes?.map((v, i) => (
          <Card key={v.id} className={versaoComparar1 === v.id || versaoComparar2 === v.id ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">v{v.versao}</div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">{v.titulo}{i === 0 && <Badge variant="outline" className="text-green-600 border-green-600">Atual</Badge>}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(v.createdAt)}</span>
                      {v.criadoPorNome && <span className="flex items-center gap-1"><User className="h-3 w-3" />{v.criadoPorNome}</span>}
                    </CardDescription>
                  </div>
                </div>
                {getTipoBadge(v.tipoAlteracao || "edicao")}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{v.descricaoAlteracao || `Versão ${v.versao}`}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { if (versaoComparar1 === v.id) setVersaoComparar1(null); else if (versaoComparar2 === v.id) setVersaoComparar2(null); else if (!versaoComparar1) setVersaoComparar1(v.id); else if (!versaoComparar2) setVersaoComparar2(v.id); else { setVersaoComparar1(v.id); setVersaoComparar2(null); } }} className={versaoComparar1 === v.id || versaoComparar2 === v.id ? "bg-primary text-primary-foreground" : ""}><GitCompare className="h-4 w-4 mr-1" />{versaoComparar1 === v.id ? "1ª" : versaoComparar2 === v.id ? "2ª" : "Comparar"}</Button>
                  <Button variant="outline" size="sm" onClick={() => { setVersaoSelecionada(v.id); setModalVisualizarAberto(true); }}><Eye className="h-4 w-4 mr-1" />Ver</Button>
                  {i > 0 && <Button variant="outline" size="sm" onClick={() => { setVersaoSelecionada(v.id); setModalRestaurarAberto(true); }}><RotateCcw className="h-4 w-4 mr-1" />Restaurar</Button>}
                  {i > 0 && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm("Excluir versão?")) excluirMutation.mutate({ versaoId: v.id }); }}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!versoes || versoes.length === 0) && <Card><CardContent className="py-12 text-center"><History className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium mb-2">Nenhuma versão salva</h3><p className="text-muted-foreground">Versões são salvas ao publicar ou editar.</p></CardContent></Card>}
      </div>

      <Dialog open={modalVisualizarAberto} onOpenChange={setModalVisualizarAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Versão {versaoDetalhes?.versao}</DialogTitle><DialogDescription>{versaoDetalhes && formatDate(versaoDetalhes.createdAt)}</DialogDescription></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-muted-foreground">Título</label><p className="font-medium">{versaoDetalhes?.titulo}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Subtítulo</label><p>{versaoDetalhes?.subtitulo || "-"}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Edição</label><p>{versaoDetalhes?.edicao || "-"}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Mês/Ano</label><p>{versaoDetalhes?.mesAno || "-"}</p></div>
              </div>
              <Separator />
              <div><h4 className="font-medium mb-3">Seções ({(versaoDetalhes?.secoes as any[])?.length || 0})</h4>
                <div className="space-y-2">{(versaoDetalhes?.secoes as any[])?.map((s: any, i: number) => <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-lg"><span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span><Badge variant="outline">{s.tipo}</Badge><span className="flex-1">{s.titulo}</span>{s.ativo ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}</div>)}</div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setModalVisualizarAberto(false)}>Fechar</Button>{versaoDetalhes && versoes && versoes[0]?.id !== versaoDetalhes.id && <Button onClick={() => { setModalVisualizarAberto(false); setModalRestaurarAberto(true); }}><RotateCcw className="h-4 w-4 mr-2" />Restaurar</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalCompararAberto} onOpenChange={setModalCompararAberto}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><GitCompare className="h-5 w-5" />Comparação</DialogTitle><DialogDescription>v{comparacao?.versao1.versao} vs v{comparacao?.versao2.versao}</DialogDescription></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-4">
              {comparacao?.diferencas && comparacao.diferencas.length > 0 && <div><h4 className="font-medium mb-3 flex items-center gap-2"><Edit className="h-4 w-4" />Campos Alterados</h4><div className="space-y-2">{comparacao.diferencas.map((d, i) => <div key={i} className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg"><div className="font-medium capitalize">{d.campo}</div><div className="text-red-600 line-through">{d.versao1 || "(vazio)"}</div><div className="text-green-600">{d.versao2 || "(vazio)"}</div></div>)}</div></div>}
              {comparacao?.secoes.adicionadas && comparacao.secoes.adicionadas.length > 0 && <div><h4 className="font-medium mb-3 flex items-center gap-2 text-green-600"><Plus className="h-4 w-4" />Adicionadas</h4><div className="space-y-2">{comparacao.secoes.adicionadas.map((s: any, i: number) => <div key={i} className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"><Badge variant="outline" className="border-green-500 text-green-600">{s.tipo}</Badge><span>{s.titulo}</span></div>)}</div></div>}
              {comparacao?.secoes.removidas && comparacao.secoes.removidas.length > 0 && <div><h4 className="font-medium mb-3 flex items-center gap-2 text-red-600"><Minus className="h-4 w-4" />Removidas</h4><div className="space-y-2">{comparacao.secoes.removidas.map((s: any, i: number) => <div key={i} className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"><Badge variant="outline" className="border-red-500 text-red-600">{s.tipo}</Badge><span className="line-through">{s.titulo}</span></div>)}</div></div>}
              {comparacao?.secoes.modificadas && comparacao.secoes.modificadas.length > 0 && <div><h4 className="font-medium mb-3 flex items-center gap-2 text-blue-600"><Edit className="h-4 w-4" />Modificadas</h4><div className="space-y-2">{comparacao.secoes.modificadas.map((s: any, i: number) => <div key={i} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"><Badge variant="outline" className="border-blue-500 text-blue-600">{s.tipo}</Badge><span>{s.titulo}</span></div>)}</div></div>}
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setModalCompararAberto(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalRestaurarAberto} onOpenChange={setModalRestaurarAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" />Restaurar Versão</DialogTitle><DialogDescription>A versão atual será salva antes da restauração.</DialogDescription></DialogHeader>
          <div className="py-4"><div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800"><p className="text-sm text-amber-800 dark:text-amber-200"><strong>Atenção:</strong> O conteúdo atual será substituído.</p></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setModalRestaurarAberto(false)}>Cancelar</Button><Button onClick={() => versaoSelecionada && restaurarMutation.mutate({ versaoId: versaoSelecionada })} disabled={restaurarMutation.isPending}>{restaurarMutation.isPending ? "Restaurando..." : <><RotateCcw className="h-4 w-4 mr-2" />Confirmar</>}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

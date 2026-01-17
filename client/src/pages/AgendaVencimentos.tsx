import { useState } from "react";
import { trpc } from "@/lib/trpc";
// DashboardLayout removido - agora usa o menu do Dashboard.tsx
import CalendarioVencimentos from "@/components/CalendarioVencimentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Calendar, 
  FileText, 
  FileSpreadsheet,
  Wrench, 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Bell,
  Mail,
  Send,
  Upload,
  Download,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";
import { exportVencimentosExcel } from "@/lib/excelExport";

type TipoVencimento = 'contrato' | 'servico' | 'manutencao';
type TipoAlerta = 'na_data' | 'um_dia_antes' | 'uma_semana_antes' | 'quinze_dias_antes' | 'um_mes_antes';

const tipoLabels: Record<TipoVencimento, string> = {
  contrato: 'Contrato',
  servico: 'Serviço',
  manutencao: 'Manutenção',
};

const tipoIcons: Record<TipoVencimento, typeof FileText> = {
  contrato: FileText,
  servico: Settings,
  manutencao: Wrench,
};

const alertaLabels: Record<TipoAlerta, string> = {
  na_data: 'Na data',
  um_dia_antes: '1 dia antes',
  uma_semana_antes: '1 semana antes',
  quinze_dias_antes: '15 dias antes',
  um_mes_antes: '1 mês antes',
};

const periodicidadeLabels: Record<string, string> = {
  unico: 'Único',
  mensal: 'Mensal',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

function getStatusBadge(diasRestantes: number, vencido: boolean) {
  if (vencido) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Vencido há {Math.abs(diasRestantes)} dias
      </Badge>
    );
  }
  if (diasRestantes === 0) {
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        Vence hoje!
      </Badge>
    );
  }
  if (diasRestantes <= 7) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  if (diasRestantes <= 15) {
    return (
      <Badge className="gap-1 bg-orange-500 hover:bg-orange-600 text-white">
        <Clock className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  if (diasRestantes <= 30) {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
        <Clock className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
      <CheckCircle2 className="h-3 w-3" />
      {diasRestantes} dias
    </Badge>
  );
}

function VencimentoForm({ 
  tipo, 
  condominioId, 
  vencimento, 
  onSuccess, 
  onCancel 
}: { 
  tipo: TipoVencimento;
  condominioId: number;
  vencimento?: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [titulo, setTitulo] = useState(vencimento?.titulo || '');
  const [descricao, setDescricao] = useState(vencimento?.descricao || '');
  const [fornecedor, setFornecedor] = useState(vencimento?.fornecedor || '');
  const [valor, setValor] = useState(vencimento?.valor || '');
  const [dataInicio, setDataInicio] = useState(vencimento?.dataInicio ? new Date(vencimento.dataInicio).toISOString().split('T')[0] : '');
  const [dataVencimento, setDataVencimento] = useState(vencimento?.dataVencimento ? new Date(vencimento.dataVencimento).toISOString().split('T')[0] : '');
  const [ultimaRealizacao, setUltimaRealizacao] = useState(vencimento?.ultimaRealizacao ? new Date(vencimento.ultimaRealizacao).toISOString().split('T')[0] : '');
  const [proximaRealizacao, setProximaRealizacao] = useState(vencimento?.proximaRealizacao ? new Date(vencimento.proximaRealizacao).toISOString().split('T')[0] : '');
  const [periodicidade, setPeriodicidade] = useState(vencimento?.periodicidade || 'unico');
  const [observacoes, setObservacoes] = useState(vencimento?.observacoes || '');
  const [alertas, setAlertas] = useState<TipoAlerta[]>(
    vencimento?.alertas?.map((a: any) => a.tipoAlerta) || ['uma_semana_antes']
  );
  const [arquivoUrl, setArquivoUrl] = useState(vencimento?.arquivoUrl || '');
  const [arquivoNome, setArquivoNome] = useState(vencimento?.arquivoNome || '');
  const [uploading, setUploading] = useState(false);

  // Função para fazer upload do arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Validar tipo (PDF, DOC, DOCX, XLS, XLSX, imagens)
    const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, DOC, XLS ou imagens.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Erro ao fazer upload');
      
      const data = await response.json();
      setArquivoUrl(data.url);
      setArquivoNome(file.name);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const removerArquivo = () => {
    setArquivoUrl('');
    setArquivoNome('');
  };

  const utils = trpc.useUtils();
  const createMutation = trpc.vencimentos.create.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} criado com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = trpc.vencimentos.update.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} atualizado com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !dataVencimento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const data = {
      titulo,
      descricao: descricao || undefined,
      fornecedor: fornecedor || undefined,
      valor: valor || undefined,
      dataInicio: dataInicio || undefined,
      dataVencimento,
      ultimaRealizacao: ultimaRealizacao || undefined,
      proximaRealizacao: proximaRealizacao || undefined,
      periodicidade: periodicidade as any,
      observacoes: observacoes || undefined,
      arquivoUrl: arquivoUrl || undefined,
      arquivoNome: arquivoNome || undefined,
      alertas,
    };

    if (vencimento) {
      updateMutation.mutate({ id: vencimento.id, ...data });
    } else {
      createMutation.mutate({ condominioId, tipo, ...data });
    }
  };

  const toggleAlerta = (alerta: TipoAlerta) => {
    setAlertas(prev => 
      prev.includes(alerta) 
        ? prev.filter(a => a !== alerta)
        : [...prev, alerta]
    );
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={`Nome do ${tipoLabels[tipo].toLowerCase()}`}
            required
          />
        </div>

        <div>
          <Label htmlFor="fornecedor">Fornecedor/Empresa</Label>
          <Input
            id="fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="dataInicio">Data de Início</Label>
          <Input
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
          <Input
            id="dataVencimento"
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </div>

        {tipo === 'manutencao' && (
          <>
            <div>
              <Label htmlFor="ultimaRealizacao">Última Realização</Label>
              <Input
                id="ultimaRealizacao"
                type="date"
                value={ultimaRealizacao}
                onChange={(e) => setUltimaRealizacao(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="proximaRealizacao">Próxima Realização</Label>
              <Input
                id="proximaRealizacao"
                type="date"
                value={proximaRealizacao}
                onChange={(e) => setProximaRealizacao(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="periodicidade">Periodicidade</Label>
          <Select value={periodicidade} onValueChange={setPeriodicidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodicidadeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição detalhada..."
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações adicionais..."
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label className="mb-2 block">Anexar Arquivo (Contrato, Documento)</Label>
          <div className="flex items-center gap-2">
            {arquivoUrl ? (
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg flex-1">
                <FileText className="h-5 w-5 text-blue-600" />
                <a 
                  href={arquivoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate flex-1"
                >
                  {arquivoNome || 'Arquivo anexado'}
                </a>
                <Button type="button" variant="ghost" size="sm" onClick={removerArquivo}>
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Enviando arquivo...</p>}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS ou imagens. Máximo 10MB.</p>
        </div>

        <div className="col-span-2">
          <Label className="mb-2 block">Alertas por E-mail</Label>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(alertaLabels) as [TipoAlerta, string][]).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`alerta-${value}`}
                  checked={alertas.includes(value)}
                  onCheckedChange={() => toggleAlerta(value)}
                />
                <label
                  htmlFor={`alerta-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'A guardar...' : vencimento ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function VencimentosList({ tipo, condominioId }: { tipo: TipoVencimento; condominioId: number }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data: vencimentos, isLoading } = trpc.vencimentos.list.useQuery({ condominioId, tipo });
  const { data: vencimentoDetalhes } = trpc.vencimentos.get.useQuery(
    { id: viewingId! },
    { enabled: !!viewingId }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.vencimentos.delete.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} excluído com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const enviarNotificacaoMutation = trpc.vencimentoNotificacoes.enviar.useMutation({
    onSuccess: (data) => {
      toast.success(`Notificação enviada para ${data.enviados} e-mail(s)!`);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm(`Tem certeza que deseja excluir este ${tipoLabels[tipo].toLowerCase()}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEnviarNotificacao = (vencimentoId: number) => {
    enviarNotificacaoMutation.mutate({ vencimentoId, condominioId });
  };

  const Icon = tipoIcons[tipo];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {tipoLabels[tipo]}s
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar {tipoLabels[tipo]}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Novo {tipoLabels[tipo]}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Preencha os dados do {tipoLabels[tipo].toLowerCase()} a ser acompanhado.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
            <VencimentoForm
              tipo={tipo}
              condominioId={condominioId}
              onSuccess={() => setIsCreating(false)}
              onCancel={() => setIsCreating(false)}
            />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!vencimentos || vencimentos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum {tipoLabels[tipo].toLowerCase()} cadastrado.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar o primeiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vencimentos.map((item) => (
            <Card key={item.id} className={`transition-all ${item.vencido ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : item.diasRestantes <= 7 ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{item.titulo}</h4>
                      {getStatusBadge(item.diasRestantes, item.vencido)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.fornecedor && (
                        <p>Fornecedor: {item.fornecedor}</p>
                      )}
                      <p>
                        Vencimento: {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                        {item.periodicidade && item.periodicidade !== 'unico' && (
                          <span className="ml-2">
                            <Badge variant="outline" className="text-xs">
                              {periodicidadeLabels[item.periodicidade]}
                            </Badge>
                          </span>
                        )}
                      </p>
                      {tipo === 'manutencao' && (
                        <>
                          {item.ultimaRealizacao && (
                            <p>Última realização: {new Date(item.ultimaRealizacao).toLocaleDateString('pt-BR')}</p>
                          )}
                          {item.proximaRealizacao && (
                            <p>Próxima realização: {new Date(item.proximaRealizacao).toLocaleDateString('pt-BR')}</p>
                          )}
                        </>
                      )}
                      {item.valor && (
                        <p>Valor: R$ {item.valor}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingId(item.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEnviarNotificacao(item.id)}
                      disabled={enviarNotificacaoMutation.isPending}
                      title="Enviar notificação"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Dialog open={editingId === item.id} onOpenChange={(open) => !open && setEditingId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(item.id)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                          <DialogHeader className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-white text-lg">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Pencil className="w-5 h-5 text-white" />
                              </div>
                              Editar {tipoLabels[tipo]}
                            </DialogTitle>
                          </DialogHeader>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                        <VencimentoForm
                          tipo={tipo}
                          condominioId={condominioId}
                          vencimento={item}
                          onSuccess={() => setEditingId(null)}
                          onCancel={() => setEditingId(null)}
                        />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Detalhes do {tipoLabels[tipo]}
              </DialogTitle>
            </DialogHeader>
          </div>
          {vencimentoDetalhes && (
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{vencimentoDetalhes.titulo}</h3>
                {getStatusBadge(vencimentoDetalhes.diasRestantes, vencimentoDetalhes.vencido)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {vencimentoDetalhes.fornecedor && (
                  <div>
                    <span className="text-muted-foreground">Fornecedor:</span>
                    <p className="font-medium">{vencimentoDetalhes.fornecedor}</p>
                  </div>
                )}
                {vencimentoDetalhes.valor && (
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium">R$ {vencimentoDetalhes.valor}</p>
                  </div>
                )}
                {vencimentoDetalhes.dataInicio && (
                  <div>
                    <span className="text-muted-foreground">Data de Início:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.dataInicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Data de Vencimento:</span>
                  <p className="font-medium">{new Date(vencimentoDetalhes.dataVencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                {tipo === 'manutencao' && vencimentoDetalhes.ultimaRealizacao && (
                  <div>
                    <span className="text-muted-foreground">Última Realização:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.ultimaRealizacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {tipo === 'manutencao' && vencimentoDetalhes.proximaRealizacao && (
                  <div>
                    <span className="text-muted-foreground">Próxima Realização:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.proximaRealizacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Periodicidade:</span>
                  <p className="font-medium">{periodicidadeLabels[vencimentoDetalhes.periodicidade || 'unico']}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{vencimentoDetalhes.status}</p>
                </div>
              </div>

              {vencimentoDetalhes.descricao && (
                <div>
                  <span className="text-muted-foreground text-sm">Descrição:</span>
                  <p className="mt-1">{vencimentoDetalhes.descricao}</p>
                </div>
              )}

              {vencimentoDetalhes.observacoes && (
                <div>
                  <span className="text-muted-foreground text-sm">Observações:</span>
                  <p className="mt-1">{vencimentoDetalhes.observacoes}</p>
                </div>
              )}

              {vencimentoDetalhes.alertas && vencimentoDetalhes.alertas.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Bell className="h-4 w-4" />
                    Alertas configurados:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vencimentoDetalhes.alertas.map((alerta: any) => (
                      <Badge key={alerta.id} variant="outline">
                        {alertaLabels[alerta.tipoAlerta as TipoAlerta]}
                        {alerta.enviado && <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Dashboard com gráficos
function VencimentosDashboard({ condominioId }: { condominioId: number }) {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [periodoEvolucao, setPeriodoEvolucao] = useState(12);

  const { data: estatisticas } = trpc.vencimentosDashboard.estatisticasGerais.useQuery({ condominioId });
  const { data: porMes } = trpc.vencimentosDashboard.porMes.useQuery({ condominioId, ano: anoSelecionado });
  const { data: porCategoria } = trpc.vencimentosDashboard.porCategoria.useQuery({ condominioId });
  const { data: porStatus } = trpc.vencimentosDashboard.porStatus.useQuery({ condominioId });
  const { data: proximos } = trpc.vencimentosDashboard.proximos.useQuery({ condominioId, dias: 30 });
  const { data: vencidos } = trpc.vencimentosDashboard.vencidos.useQuery({ condominioId });
  const { data: evolucao } = trpc.vencimentosDashboard.evolucao.useQuery({ condominioId, meses: periodoEvolucao });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular máximo para escala do gráfico de barras
  const maxPorMes = porMes ? Math.max(...porMes.map(m => m.total), 1) : 1;
  const maxEvolucao = evolucao ? Math.max(...evolucao.map(e => e.total), 1) : 1;

  // Estados para os modais de cadastro rápido
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showManutencaoModal, setShowManutencaoModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Seção de Cadastro Rápido - Quando não há vencimentos */}
      {(estatisticas?.total || 0) === 0 && (
        <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Comece a Controlar seus Vencimentos</h3>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                  Cadastre seus contratos, serviços e manutenções para receber alertas automáticos antes do vencimento.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md min-w-[200px] h-14"
                  onClick={() => setShowContratoModal(true)}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Cadastrar Contrato
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md min-w-[200px] h-14"
                  onClick={() => setShowServicoModal(true)}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Cadastrar Serviço
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md min-w-[200px] h-14"
                  onClick={() => setShowManutencaoModal(true)}
                >
                  <Wrench className="h-5 w-5 mr-2" />
                  Cadastrar Manutenção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais de Cadastro Rápido */}
      <Dialog open={showContratoModal} onOpenChange={setShowContratoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Novo Contrato
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do contrato a ser acompanhado.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="contrato"
            condominioId={condominioId}
            onSuccess={() => setShowContratoModal(false)}
            onCancel={() => setShowContratoModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showServicoModal} onOpenChange={setShowServicoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Novo Serviço
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do serviço a ser acompanhado.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="servico"
            condominioId={condominioId}
            onSuccess={() => setShowServicoModal(false)}
            onCancel={() => setShowServicoModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showManutencaoModal} onOpenChange={setShowManutencaoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-600" />
              Nova Manutenção
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da manutenção a ser acompanhada.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="manutencao"
            condominioId={condominioId}
            onSuccess={() => setShowManutencaoModal(false)}
            onCancel={() => setShowManutencaoModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{estatisticas?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{estatisticas?.vencidos || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Próx. 30 dias</p>
                <p className="text-3xl font-bold text-yellow-600">{estatisticas?.proximos30dias || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Valor Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(estatisticas?.valorTotalAtivo || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Vencimentos por Mês */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Vencimentos por Mês</CardTitle>
              </div>
              <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {porMes?.map((mes) => (
                <div key={mes.mes} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground">{mes.nome}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(mes.total / maxPorMes) * 100}%` }}
                    />
                    {mes.vencidos > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                        style={{ width: `${(mes.vencidos / maxPorMes) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="w-8 text-xs font-medium text-right">{mes.total}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Total</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Vencidos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Por Categoria */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Por Categoria</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {porCategoria && porCategoria.length > 0 && (() => {
                    const total = porCategoria.reduce((sum, cat) => sum + cat.total, 0);
                    if (total === 0) return <circle cx="50" cy="50" r="40" fill="#e5e7eb" />;
                    
                    let offset = 0;
                    return porCategoria.map((cat, index) => {
                      const percentage = (cat.total / total) * 100;
                      const circumference = 2 * Math.PI * 40;
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -offset * (circumference / 100);
                      offset += percentage;
                      
                      return (
                        <circle
                          key={cat.tipo}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={cat.cor}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{estatisticas?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {porCategoria?.map((cat) => (
                <div key={cat.tipo} className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }} />
                    <span className="text-xs font-medium">{cat.nome}</span>
                  </div>
                  <p className="text-lg font-bold">{cat.total}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(cat.valorTotal)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Evolução */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Evolução Temporal</CardTitle>
              </div>
              <Select value={periodoEvolucao.toString()} onValueChange={(v) => setPeriodoEvolucao(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {evolucao && evolucao.length > 0 && (
                <svg viewBox={`0 0 ${evolucao.length * 50} 100`} className="w-full h-full" preserveAspectRatio="none">
                  {/* Linhas de grade */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={100 - y} x2={evolucao.length * 50} y2={100 - y} stroke="#e5e7eb" strokeWidth="0.5" />
                  ))}
                  {/* Linha de total */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points={evolucao.map((e, i) => `${i * 50 + 25},${100 - (e.total / maxEvolucao) * 80}`).join(' ')}
                  />
                  {/* Pontos */}
                  {evolucao.map((e, i) => (
                    <circle
                      key={i}
                      cx={i * 50 + 25}
                      cy={100 - (e.total / maxEvolucao) * 80}
                      r="3"
                      fill="#3B82F6"
                    />
                  ))}
                </svg>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-x-auto">
              {evolucao?.map((e, i) => (
                <span key={i} className="min-w-[40px] text-center">{e.nome}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Status */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Por Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {porStatus?.map((s) => {
                const total = porStatus.reduce((sum, st) => sum + st.total, 0);
                const percentage = total > 0 ? (s.total / total) * 100 : 0;
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
                        <span>{s.nome}</span>
                      </div>
                      <span className="font-medium">{s.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: s.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas de Próximos e Vencidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Próximos 30 Dias</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {proximos && proximos.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {proximos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <p className="font-medium text-sm">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        {item.diasRestantes} dias
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum vencimento nos próximos 30 dias</p>
            )}
          </CardContent>
        </Card>

        {/* Vencimentos Atrasados */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Vencimentos Atrasados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {vencidos && vencidos.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vencidos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                    <div>
                      <p className="font-medium text-sm">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {item.diasAtrasados} dias atrasado
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum vencimento atrasado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmailsConfig({ condominioId }: { condominioId: number }) {
  const [novoEmail, setNovoEmail] = useState('');
  const [novoNome, setNovoNome] = useState('');

  const { data: emails, isLoading } = trpc.vencimentoEmails.list.useQuery({ condominioId });
  const utils = trpc.useUtils();

  const createMutation = trpc.vencimentoEmails.create.useMutation({
    onSuccess: () => {
      toast.success('E-mail adicionado com sucesso!');
      utils.vencimentoEmails.list.invalidate();
      setNovoEmail('');
      setNovoNome('');
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vencimentoEmails.delete.useMutation({
    onSuccess: () => {
      toast.success('E-mail removido com sucesso!');
      utils.vencimentoEmails.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const toggleMutation = trpc.vencimentoEmails.update.useMutation({
    onSuccess: () => {
      utils.vencimentoEmails.list.invalidate();
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail) return;
    createMutation.mutate({ condominioId, email: novoEmail, nome: novoNome || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-mails para Notificações
        </CardTitle>
        <CardDescription>
          Configure os e-mails que receberão alertas de vencimentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddEmail} className="flex gap-2">
          <Input
            type="text"
            placeholder="Nome (opcional)"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="w-40"
          />
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </form>

        {isLoading ? (
          <div className="text-center py-4">A carregar...</div>
        ) : emails && emails.length > 0 ? (
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={email.ativo === true}
                    onCheckedChange={(checked) => 
                      toggleMutation.mutate({ id: email.id, ativo: checked === true })
                    }
                  />
                  <div>
                    {email.nome && <p className="font-medium">{email.nome}</p>}
                    <p className={`text-sm ${!email.ativo ? 'text-muted-foreground line-through' : ''}`}>
                      {email.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate({ id: email.id })}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum e-mail configurado. Adicione e-mails para receber alertas de vencimentos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Calendário que busca todos os vencimentos
function CalendarioVencimentosTab({ condominioId }: { condominioId: number }) {
  const { data: contratos } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'contrato' });
  const { data: servicos } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'servico' });
  const { data: manutencoes } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'manutencao' });

  const todosVencimentos = [
    ...(contratos || []),
    ...(servicos || []),
    ...(manutencoes || []),
  ];

  const handleVencimentoClick = (vencimento: any) => {
    toast.info(`Vencimento: ${vencimento.titulo}`);
  };

  return (
    <CalendarioVencimentos 
      vencimentos={todosVencimentos} 
      onVencimentoClick={handleVencimentoClick}
    />
  );
}

export default function AgendaVencimentos() {
  const [activeTab, setActiveTab] = useState<TipoVencimento | 'dashboard' | 'calendario'>('dashboard');
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showRelatorioDialog, setShowRelatorioDialog] = useState(false);
  const [relatorioTipo, setRelatorioTipo] = useState<'todos' | 'contrato' | 'servico' | 'manutencao'>('todos');
  const [relatorioStatus, setRelatorioStatus] = useState<'todos' | 'ativo' | 'vencido' | 'renovado' | 'cancelado'>('todos');
  const [relatorioDataInicio, setRelatorioDataInicio] = useState('');
  const [relatorioDataFim, setRelatorioDataFim] = useState('');
  
  // Obter condominioId do primeira organização do usuário
  const { data: condominios, isLoading: condominiosLoading } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;

  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const { data: stats } = trpc.vencimentos.stats.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  // Query para buscar todos os vencimentos para exportação
  const { data: todosVencimentosExport } = trpc.vencimentos.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  // Verificar alertas pendentes
  const { data: alertasPendentes, refetch: refetchAlertas } = trpc.alertasAutomaticos.verificarPendentes.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  // Mutation para processar alertas automáticos
  const processarAlertasMutation = trpc.alertasAutomaticos.processarAlertas.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem);
      refetchAlertas();
    },
    onError: (error) => {
      toast.error(`Erro ao processar alertas: ${error.message}`);
    },
  });

  // Mutation para gerar relatório PDF
  const gerarPDFMutation = trpc.vencimentosRelatorio.gerarPDF.useMutation({
    onSuccess: (data) => {
      toast.success('Relatório gerado com sucesso!');
      // Abrir o PDF em nova aba
      window.open(data.url, '_blank');
      setShowRelatorioDialog(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    },
  });

  const handleGerarRelatorio = () => {
    gerarPDFMutation.mutate({
      condominioId,
      tipo: relatorioTipo,
      status: relatorioStatus,
      dataInicio: relatorioDataInicio || undefined,
      dataFim: relatorioDataFim || undefined,
    });
  };

  if (condominiosLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!condominioId) {
    return (
      <div className="text-center py-20">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Nenhuma organização encontrado</h2>
        <p className="text-muted-foreground">Crie uma organização primeiro para usar a Agenda de Vencimentos.</p>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {/* Botão de Processar Alertas */}
            <Button
              variant="outline"
              onClick={() => processarAlertasMutation.mutate({ condominioId })}
              disabled={processarAlertasMutation.isPending}
              className={alertasPendentes && alertasPendentes.pendentes > 0 ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : ''}
            >
              <Bell className="h-4 w-4 mr-2" />
              {processarAlertasMutation.isPending ? 'Processando...' : `Processar Alertas${alertasPendentes && alertasPendentes.pendentes > 0 ? ` (${alertasPendentes.pendentes})` : ''}`}
            </Button>

            {/* Botão de Gerar Relatório */}
            <Dialog open={showRelatorioDialog} onOpenChange={setShowRelatorioDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório PDF
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Relatório de Vencimentos</DialogTitle>
                  <DialogDescription>
                    Configure os filtros para gerar o relatório em PDF.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={relatorioTipo} onValueChange={(v: any) => setRelatorioTipo(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="contrato">Contratos</SelectItem>
                          <SelectItem value="servico">Serviços</SelectItem>
                          <SelectItem value="manutencao">Manutenções</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={relatorioStatus} onValueChange={(v: any) => setRelatorioStatus(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="ativo">Ativos</SelectItem>
                          <SelectItem value="vencido">Vencidos</SelectItem>
                          <SelectItem value="renovado">Renovados</SelectItem>
                          <SelectItem value="cancelado">Cancelados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={relatorioDataInicio}
                        onChange={(e) => setRelatorioDataInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={relatorioDataFim}
                        onChange={(e) => setRelatorioDataFim(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRelatorioDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGerarRelatorio} disabled={gerarPDFMutation.isPending}>
                    {gerarPDFMutation.isPending ? 'Gerando...' : 'Gerar PDF'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Botão de Exportar Excel */}
            <Button 
              variant="outline" 
              onClick={() => {
                if (todosVencimentosExport && todosVencimentosExport.length > 0) {
                  exportVencimentosExcel(todosVencimentosExport as any, 'Vencimentos');
                  toast.success('Excel exportado com sucesso!');
                } else {
                  toast.error('Nenhum vencimento para exportar');
                }
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>

            {/* Botão de Configurar E-mails */}
            <Button variant="outline" onClick={() => setShowEmailConfig(!showEmailConfig)}>
              <Mail className="h-4 w-4 mr-2" />
              Configurar E-mails
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className={stats.vencidos > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}>
              <CardContent className="pt-4">
                <div className={`text-2xl font-bold ${stats.vencidos > 0 ? 'text-red-600' : ''}`}>
                  {stats.vencidos}
                </div>
                <p className="text-xs text-muted-foreground">Vencidos</p>
              </CardContent>
            </Card>
            <Card className={stats.proximos > 0 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}>
              <CardContent className="pt-4">
                <div className={`text-2xl font-bold ${stats.proximos > 0 ? 'text-orange-600' : ''}`}>
                  {stats.proximos}
                </div>
                <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.contratos}</div>
                <p className="text-xs text-muted-foreground">Contratos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.servicos}</div>
                <p className="text-xs text-muted-foreground">Serviços</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.manutencoes}</div>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Config */}
        {showEmailConfig && (
          <EmailsConfig condominioId={condominioId} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoVencimento | 'dashboard' | 'calendario')}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 bg-gray-500 text-white hover:bg-gray-600 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contrato" className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              Contratos
              {stats && stats.contratos > 0 && (
                <Badge variant="secondary" className="ml-1 bg-blue-700 text-white">{stats.contratos}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="servico" className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600 data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              Serviços
              {stats && stats.servicos > 0 && (
                <Badge variant="secondary" className="ml-1 bg-orange-700 text-white">{stats.servicos}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 data-[state=active]:bg-green-700 data-[state=active]:text-white">
              <Wrench className="h-4 w-4" />
              Manutenções
              {stats && stats.manutencoes > 0 && (
                <Badge variant="secondary" className="ml-1 bg-green-700 text-white">{stats.manutencoes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600 data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <VencimentosDashboard condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="contrato" className="mt-6">
            <VencimentosList tipo="contrato" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="servico" className="mt-6">
            <VencimentosList tipo="servico" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="manutencao" className="mt-6">
            <VencimentosList tipo="manutencao" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="calendario" className="mt-6">
            <CalendarioVencimentosTab condominioId={condominioId} />
          </TabsContent>
        </Tabs>
      </div>
  );
}

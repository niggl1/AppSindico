import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  Check,
  ChevronLeft,
  Save,
  FileText,
  Calendar,
  Star,
  Sparkles,
  Gift,
  Palette,
  Type,
  Image,
  RefreshCw
} from "lucide-react";

interface RevistaTemplatesPageProps {
  condominioId: number;
  onVoltar?: () => void;
  onSelecionarTemplate?: (templateId: number) => void;
}

// Seções disponíveis para a revista
const SECOES_DISPONIVEIS = [
  { id: "mensagem_sindico", nome: "Mensagem do Síndico", icone: "📝" },
  { id: "avisos", nome: "Avisos", icone: "📢" },
  { id: "eventos", nome: "Eventos", icone: "📅" },
  { id: "funcionarios", nome: "Funcionários", icone: "👥" },
  { id: "votacoes", nome: "Votações", icone: "🗳️" },
  { id: "telefones", nome: "Telefones Úteis", icone: "📞" },
  { id: "links", nome: "Links Úteis", icone: "🔗" },
  { id: "classificados", nome: "Classificados", icone: "🏷️" },
  { id: "caronas", nome: "Caronas", icone: "🚗" },
  { id: "achados_perdidos", nome: "Achados e Perdidos", icone: "🔍" },
  { id: "galeria", nome: "Galeria de Fotos", icone: "📸" },
  { id: "comunicados", nome: "Comunicados", icone: "📋" },
  { id: "regras", nome: "Regras e Normas", icone: "📜" },
  { id: "dicas_seguranca", nome: "Dicas de Segurança", icone: "🛡️" },
  { id: "realizacoes", nome: "Realizações", icone: "🏆" },
  { id: "melhorias", nome: "Melhorias", icone: "🔧" },
  { id: "aquisicoes", nome: "Aquisições", icone: "🛒" },
  { id: "publicidade", nome: "Publicidade", icone: "📰" },
  { id: "cadastro", nome: "Cadastro", icone: "📝" },
  { id: "timeline_manutencao", nome: "Timeline de Manutenções", icone: "🔨" },
];

// Templates pré-definidos
const TEMPLATES_PADRAO = [
  {
    tipo: "mensal",
    nome: "Revista Mensal",
    descricao: "Template padrão para edições mensais com todas as seções principais",
    icone: Calendar,
    cor: "blue",
    secoes: ["mensagem_sindico", "avisos", "eventos", "comunicados", "galeria", "classificados"],
  },
  {
    tipo: "trimestral",
    nome: "Revista Trimestral",
    descricao: "Template completo para edições trimestrais com relatórios e realizações",
    icone: FileText,
    cor: "purple",
    secoes: ["mensagem_sindico", "avisos", "eventos", "realizacoes", "melhorias", "aquisicoes", "galeria", "comunicados"],
  },
  {
    tipo: "especial",
    nome: "Edição Especial",
    descricao: "Template para edições temáticas ou comemorativas",
    icone: Star,
    cor: "amber",
    secoes: ["mensagem_sindico", "eventos", "galeria", "realizacoes"],
  },
  {
    tipo: "boas_vindas",
    nome: "Boas-vindas",
    descricao: "Template para novos moradores com informações essenciais",
    icone: Gift,
    cor: "green",
    secoes: ["mensagem_sindico", "funcionarios", "telefones", "links", "regras", "dicas_seguranca"],
  },
];

export default function RevistaTemplatesPage({ condominioId, onVoltar, onSelecionarTemplate }: RevistaTemplatesPageProps) {
  const { user } = useAuth();
  // toast importado de sonner
  const utils = trpc.useUtils();

  // Estados
  const [showCriarDialog, setShowCriarDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "personalizado" as const,
    secoesIncluidas: [] as string[],
    configCapa: {
      titulo: "",
      subtitulo: "",
      corFundo: "#1e40af",
    },
    configEstilo: {
      estiloPdf: "moderno",
      corPrimaria: "#1e40af",
      corSecundaria: "#3b82f6",
    },
  });

  // Queries
  const { data: templates, isLoading, refetch } = trpc.revista.listarTemplates.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  // Mutations
  const criarMutation = trpc.revista.criarTemplate.useMutation({
    onSuccess: () => {
      toast({ title: "Template criado com sucesso!" });
      setShowCriarDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar template", description: error.message, variant: "destructive" });
    },
  });

  const atualizarMutation = trpc.revista.atualizarTemplate.useMutation({
    onSuccess: () => {
      toast({ title: "Template atualizado com sucesso!" });
      setShowEditarDialog(false);
      setTemplateSelecionado(null);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar template", description: error.message, variant: "destructive" });
    },
  });

  const excluirMutation = trpc.revista.excluirTemplate.useMutation({
    onSuccess: () => {
      toast({ title: "Template excluído com sucesso!" });
      setShowDeleteDialog(false);
      setTemplateSelecionado(null);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir template", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      tipo: "personalizado",
      secoesIncluidas: [],
      configCapa: {
        titulo: "",
        subtitulo: "",
        corFundo: "#1e40af",
      },
      configEstilo: {
        estiloPdf: "moderno",
        corPrimaria: "#1e40af",
        corSecundaria: "#3b82f6",
      },
    });
  };

  const handleCriar = () => {
    criarMutation.mutate({
      condominioId,
      nome: formData.nome,
      descricao: formData.descricao,
      tipo: formData.tipo,
      secoesIncluidas: formData.secoesIncluidas,
      ordemSecoes: formData.secoesIncluidas,
      configCapa: formData.configCapa,
      configEstilo: formData.configEstilo,
    });
  };

  const handleEditar = () => {
    if (!templateSelecionado) return;
    atualizarMutation.mutate({
      id: templateSelecionado.id,
      nome: formData.nome,
      descricao: formData.descricao,
      tipo: formData.tipo,
      secoesIncluidas: formData.secoesIncluidas,
      ordemSecoes: formData.secoesIncluidas,
      configCapa: formData.configCapa,
      configEstilo: formData.configEstilo,
    });
  };

  const handleExcluir = () => {
    if (!templateSelecionado) return;
    excluirMutation.mutate({ id: templateSelecionado.id });
  };

  const handleAbrirEditar = (template: any) => {
    setTemplateSelecionado(template);
    setFormData({
      nome: template.nome,
      descricao: template.descricao || "",
      tipo: template.tipo || "personalizado",
      secoesIncluidas: template.secoesIncluidas || [],
      configCapa: template.configCapa || { titulo: "", subtitulo: "", corFundo: "#1e40af" },
      configEstilo: template.configEstilo || { estiloPdf: "moderno", corPrimaria: "#1e40af", corSecundaria: "#3b82f6" },
    });
    setShowEditarDialog(true);
  };

  const handleUsarTemplatePadrao = (templatePadrao: typeof TEMPLATES_PADRAO[0]) => {
    setFormData({
      nome: templatePadrao.nome,
      descricao: templatePadrao.descricao,
      tipo: templatePadrao.tipo as any,
      secoesIncluidas: templatePadrao.secoes,
      configCapa: { titulo: "", subtitulo: "", corFundo: "#1e40af" },
      configEstilo: { estiloPdf: "moderno", corPrimaria: "#1e40af", corSecundaria: "#3b82f6" },
    });
    setShowCriarDialog(true);
  };

  const toggleSecao = (secaoId: string) => {
    setFormData(prev => ({
      ...prev,
      secoesIncluidas: prev.secoesIncluidas.includes(secaoId)
        ? prev.secoesIncluidas.filter(s => s !== secaoId)
        : [...prev.secoesIncluidas, secaoId],
    }));
  };

  const getIconeTemplate = (tipo: string) => {
    const template = TEMPLATES_PADRAO.find(t => t.tipo === tipo);
    if (template) {
      const Icon = template.icone;
      return <Icon className="h-5 w-5" />;
    }
    return <Layout className="h-5 w-5" />;
  };

  const getCorTemplate = (tipo: string) => {
    const template = TEMPLATES_PADRAO.find(t => t.tipo === tipo);
    return template?.cor || "gray";
  };

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
              <Layout className="h-6 w-6 text-purple-600" />
              Templates de Revista
            </h1>
            <p className="text-muted-foreground">Crie e gerencie modelos para suas revistas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => { resetForm(); setShowCriarDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Templates Pré-definidos */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Templates Pré-definidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES_PADRAO.map((template) => {
            const Icon = template.icone;
            return (
              <Card 
                key={template.tipo} 
                className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-${template.cor}-300`}
                onClick={() => handleUsarTemplatePadrao(template)}
              >
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg bg-${template.cor}-100 flex items-center justify-center mb-2`}>
                    <Icon className={`h-5 w-5 text-${template.cor}-600`} />
                  </div>
                  <CardTitle className="text-base">{template.nome}</CardTitle>
                  <CardDescription className="text-xs">{template.descricao}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Badge variant="outline" className="text-xs">
                    {template.secoes.length} seções
                  </Badge>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Meus Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Meus Templates
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Layout className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-2">Nenhum template personalizado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crie um novo template ou use um dos modelos pré-definidos
              </p>
              <Button variant="outline" onClick={() => { resetForm(); setShowCriarDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg bg-${getCorTemplate(template.tipo || "personalizado")}-100 flex items-center justify-center`}>
                      {getIconeTemplate(template.tipo || "personalizado")}
                    </div>
                    <div className="flex gap-1">
                      {template.padrao && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{template.nome}</CardTitle>
                  {template.descricao && (
                    <CardDescription className="text-xs line-clamp-2">
                      {template.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1">
                    {(template.secoesIncluidas as string[] || []).slice(0, 4).map((secaoId) => {
                      const secao = SECOES_DISPONIVEIS.find(s => s.id === secaoId);
                      return secao ? (
                        <Badge key={secaoId} variant="outline" className="text-xs">
                          {secao.icone} {secao.nome}
                        </Badge>
                      ) : null;
                    })}
                    {(template.secoesIncluidas as string[] || []).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{(template.secoesIncluidas as string[]).length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-2">
                  {onSelecionarTemplate && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onSelecionarTemplate(template.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!template.padrao && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAbrirEditar(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setTemplateSelecionado(template);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Criar/Editar Template */}
      <Dialog open={showCriarDialog || showEditarDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCriarDialog(false);
          setShowEditarDialog(false);
          setTemplateSelecionado(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showEditarDialog ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showEditarDialog ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              {showEditarDialog ? "Atualize as configurações do template" : "Configure um novo modelo para suas revistas"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Template *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Revista Mensal"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, tipo: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                    <SelectItem value="boas_vindas">Boas-vindas</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o propósito deste template..."
                rows={2}
              />
            </div>

            {/* Seções */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Seções Incluídas ({formData.secoesIncluidas.length})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {SECOES_DISPONIVEIS.map((secao) => (
                  <div
                    key={secao.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      formData.secoesIncluidas.includes(secao.id)
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleSecao(secao.id)}
                  >
                    <Checkbox
                      checked={formData.secoesIncluidas.includes(secao.id)}
                      onCheckedChange={() => toggleSecao(secao.id)}
                    />
                    <span className="text-sm">
                      {secao.icone} {secao.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Configurações de estilo */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Configurações de Estilo
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.configEstilo.corPrimaria}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configEstilo: { ...prev.configEstilo, corPrimaria: e.target.value }
                      }))}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={formData.configEstilo.corPrimaria}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configEstilo: { ...prev.configEstilo, corPrimaria: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.configEstilo.corSecundaria}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configEstilo: { ...prev.configEstilo, corSecundaria: e.target.value }
                      }))}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={formData.configEstilo.corSecundaria}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configEstilo: { ...prev.configEstilo, corSecundaria: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Estilo PDF</Label>
                  <Select 
                    value={formData.configEstilo.estiloPdf} 
                    onValueChange={(v) => setFormData(prev => ({
                      ...prev,
                      configEstilo: { ...prev.configEstilo, estiloPdf: v }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderno">Moderno</SelectItem>
                      <SelectItem value="classico">Clássico</SelectItem>
                      <SelectItem value="minimalista">Minimalista</SelectItem>
                      <SelectItem value="colorido">Colorido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configurações de capa */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Configurações de Capa (Opcional)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Título Padrão</Label>
                  <Input
                    value={formData.configCapa.titulo}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      configCapa: { ...prev.configCapa, titulo: e.target.value }
                    }))}
                    placeholder="Ex: Revista do Condomínio"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Subtítulo Padrão</Label>
                  <Input
                    value={formData.configCapa.subtitulo}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      configCapa: { ...prev.configCapa, subtitulo: e.target.value }
                    }))}
                    placeholder="Ex: Edição Mensal"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCriarDialog(false);
              setShowEditarDialog(false);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={showEditarDialog ? handleEditar : handleCriar}
              disabled={!formData.nome || formData.secoesIncluidas.length === 0 || criarMutation.isPending || atualizarMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {showEditarDialog ? "Salvar Alterações" : "Criar Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Preview */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewTemplate?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {previewTemplate?.descricao && (
              <p className="text-sm text-muted-foreground">{previewTemplate.descricao}</p>
            )}
            <div>
              <Label className="text-sm font-medium">Seções Incluídas:</Label>
              <div className="mt-2 space-y-1">
                {(previewTemplate?.secoesIncluidas as string[] || []).map((secaoId: string, index: number) => {
                  const secao = SECOES_DISPONIVEIS.find(s => s.id === secaoId);
                  return secao ? (
                    <div key={secaoId} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>{secao.icone}</span>
                      <span>{secao.nome}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            {previewTemplate?.configEstilo && (
              <div>
                <Label className="text-sm font-medium">Estilo:</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: (previewTemplate.configEstilo as any).corPrimaria }}
                    />
                    <span className="text-xs">Primária</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: (previewTemplate.configEstilo as any).corSecundaria }}
                    />
                    <span className="text-xs">Secundária</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Fechar
            </Button>
            {onSelecionarTemplate && (
              <Button onClick={() => {
                onSelecionarTemplate(previewTemplate.id);
                setPreviewTemplate(null);
              }}>
                <Check className="h-4 w-4 mr-2" />
                Usar Este Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "{templateSelecionado?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
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

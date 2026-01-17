import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Phone, User, Briefcase, MessageCircle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface MembrosEquipePageProps {
  condominioId: number;
}

export function MembrosEquipePage({ condominioId }: MembrosEquipePageProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    descricao: "",
    cargo: "",
    fotoUrl: "",
  });

  const { data: membros, refetch } = trpc.membroEquipe.list.useQuery({ condominioId });
  const createMutation = trpc.membroEquipe.create.useMutation({
    onSuccess: () => {
      toast.success("Membro adicionado com sucesso!");
      refetch();
      resetForm();
    },
    onError: () => toast.error("Erro ao adicionar membro"),
  });
  const updateMutation = trpc.membroEquipe.update.useMutation({
    onSuccess: () => {
      toast.success("Membro atualizado com sucesso!");
      refetch();
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar membro"),
  });
  const deleteMutation = trpc.membroEquipe.delete.useMutation({
    onSuccess: () => {
      toast.success("Membro removido com sucesso!");
      refetch();
    },
    onError: () => toast.error("Erro ao remover membro"),
  });

  const resetForm = () => {
    setFormData({ nome: "", whatsapp: "", descricao: "", cargo: "", fotoUrl: "" });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ condominioId, ...formData });
    }
  };

  const handleEdit = (membro: NonNullable<typeof membros>[0]) => {
    setFormData({
      nome: membro.nome,
      whatsapp: membro.whatsapp,
      descricao: membro.descricao || "",
      cargo: membro.cargo || "",
      fotoUrl: membro.fotoUrl || "",
    });
    setEditingId(membro.id);
    setIsOpen(true);
  };

  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Equipe
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros da equipe para compartilhamento de vistorias, manutenções e ocorrências
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  {editingId ? "Editar Membro" : "Novo Membro da Equipe"}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="flex justify-center">
                <ImageUpload
                  value={formData.fotoUrl}
                  onChange={(url: string | undefined) => setFormData({ ...formData, fotoUrl: url || "" })}
                  className="w-28 h-28 rounded-full"
                  placeholder="Foto"
                  compact
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Zelador, Porteiro, Técnico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Responsabilidades e observações"
                  rows={3}
                />
              </div>
            </form>
            <div className="flex gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Membros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {membros?.map((membro) => (
          <Card key={membro.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {membro.fotoUrl ? (
                    <img
                      src={membro.fotoUrl}
                      alt={membro.nome}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-semibold">{membro.nome}</CardTitle>
                    {membro.cargo && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {membro.cargo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(membro)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate({ id: membro.id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {membro.descricao && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {membro.descricao}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {membro.whatsapp}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => {
                    const phone = formatWhatsApp(membro.whatsapp);
                    window.open(`https://wa.me/${phone}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!membros || membros.length === 0) && (
          <Card className="col-span-full py-12 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum membro cadastrado</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Adicione membros da equipe para facilitar o compartilhamento de vistorias, manutenções e ocorrências via WhatsApp.
              </p>
              <Button 
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Membro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

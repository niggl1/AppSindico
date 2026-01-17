import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "./Timeline";
import ImageGallery from "./ImageGallery";
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  Eye, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash,
  Share2,
  FileDown,
  Users
} from "lucide-react";
import { useState } from "react";

interface ProtocolCardProps {
  protocolo: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  status: string;
  prioridade?: string | null;
  responsavelNome?: string | null;
  localizacao?: string | null;
  dataAgendada?: Date | string | null;
  dataRealizada?: Date | string | null;
  createdAt: Date | string;
  imagens?: { id: number; url: string; legenda?: string | null }[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onShareEquipe?: () => void;
  onPdf?: () => void;
  tipo?: string | null;
  categoria?: string | null;
  extra?: React.ReactNode;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ProtocolCard({
  protocolo,
  titulo,
  subtitulo,
  descricao,
  observacoes,
  status,
  prioridade,
  responsavelNome,
  localizacao,
  dataAgendada,
  dataRealizada,
  createdAt,
  imagens = [],
  onView,
  onEdit,
  onDelete,
  onShare,
  onShareEquipe,
  onPdf,
  tipo,
  categoria,
  extra,
}: ProtocolCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-0.5 rounded">
                <Hash className="h-3 w-3" />
                {protocolo}
              </span>
              <StatusBadge status={status} />
              {prioridade && <PriorityBadge priority={prioridade} />}
            </div>
            <CardTitle className="text-lg line-clamp-1">{titulo}</CardTitle>
            {subtitulo && (
              <p className="text-sm text-muted-foreground line-clamp-1">{subtitulo}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onView && (
              <Button variant="ghost" size="icon" onClick={onView} title="Ver detalhes">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} title="Editar">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete} title="Excluir" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="ghost" size="icon" onClick={onShare} title="Compartilhar via WhatsApp" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {onShareEquipe && (
              <Button variant="ghost" size="icon" onClick={onShareEquipe} title="Compartilhar com Equipe" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <Users className="h-4 w-4" />
              </Button>
            )}
            {onPdf && (
              <Button variant="ghost" size="sm" onClick={onPdf} title="Gerar PDF" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1">
                <FileDown className="h-4 w-4" />
                <span className="text-xs font-semibold">PDF</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Informações principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
          {responsavelNome && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{responsavelNome}</span>
            </div>
          )}
          {localizacao && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{localizacao}</span>
            </div>
          )}
          {dataAgendada && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(dataAgendada)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Tags de tipo/categoria */}
        {(tipo || categoria) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {tipo && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {tipo}
              </span>
            )}
            {categoria && (
              <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded">
                {categoria}
              </span>
            )}
          </div>
        )}

        {/* Galeria de imagens */}
        {imagens.length > 0 && (
          <div className="mb-3">
            <ImageGallery
              images={imagens.map((img) => ({ id: img.id, url: img.url, legenda: img.legenda || undefined }))}
              columns={4}
            />
          </div>
        )}

        {/* Descrição expandível */}
        {(descricao || observacoes) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {expanded ? "Ocultar detalhes" : "Ver detalhes"}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expanded && (
              <div className="mt-2 space-y-2 text-sm border-t pt-2">
                {descricao && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Descrição
                    </p>
                    <p className="whitespace-pre-wrap">{descricao}</p>
                  </div>
                )}
                {observacoes && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Observações
                    </p>
                    <p className="whitespace-pre-wrap">{observacoes}</p>
                  </div>
                )}
                {dataRealizada && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Data Realizada
                    </p>
                    <p>{formatDateTime(dataRealizada)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo extra */}
        {extra}
      </CardContent>
    </Card>
  );
}

// Componente de estatísticas
interface StatsCardsProps {
  stats: {
    total: number;
    pendentes: number;
    realizadas: number;
    finalizadas: number;
    requerAcao: number;
    reabertas?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pendentes}</p>
          <p className="text-xs text-yellow-600">Pendentes</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.realizadas}</p>
          <p className="text-xs text-blue-600">Realizadas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.finalizadas}</p>
          <p className="text-xs text-green-600">Finalizadas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.requerAcao}</p>
          <p className="text-xs text-red-600">Ação Necessária</p>
        </CardContent>
      </Card>
      {stats.reabertas !== undefined && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{stats.reabertas}</p>
            <p className="text-xs text-orange-600">Reabertas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

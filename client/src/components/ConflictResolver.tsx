// Interface de Resolução de Conflitos
// App Síndico - Plataforma Digital para Condomínios

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Check,
  X,
  GitMerge,
  Monitor,
  Cloud,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ConflictItem,
  autoResolveConflict,
  mergeConflictData,
  compareFields,
  formatFieldValue,
  getFieldLabel,
} from '@/lib/conflictResolver';
import { toast } from 'sonner';

interface ConflictResolverProps {
  conflicts: ConflictItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (conflict: ConflictItem, resolution: 'local' | 'server' | 'merge', data?: any) => void;
  onResolveAll: (strategy: 'newest' | 'oldest' | 'local' | 'server') => void;
}

export function ConflictResolver({
  conflicts,
  open,
  onOpenChange,
  onResolve,
  onResolveAll,
}: ConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const pendingConflicts = conflicts.filter(c => !c.resolved);
  const resolvedConflicts = conflicts.filter(c => c.resolved);

  const handleResolve = (conflict: ConflictItem, resolution: 'local' | 'server' | 'merge') => {
    let resolvedData: any;
    
    if (resolution === 'local') {
      resolvedData = conflict.localData;
    } else if (resolution === 'server') {
      resolvedData = conflict.serverData;
    } else {
      resolvedData = mergeConflictData(conflict.localData, conflict.serverData);
    }
    
    onResolve(conflict, resolution, resolvedData);
    setSelectedConflict(null);
    toast.success(`Conflito resolvido: ${resolution === 'local' ? 'versão local' : resolution === 'server' ? 'versão do servidor' : 'mesclado'}`);
  };

  const toggleFieldExpanded = (field: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedFields(newExpanded);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolver Conflitos de Sincronização
          </DialogTitle>
          <DialogDescription>
            {pendingConflicts.length} conflito(s) pendente(s) de resolução
          </DialogDescription>
        </DialogHeader>

        {/* Ações em lote */}
        {pendingConflicts.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Resolver todos:</span>
            <Button size="sm" variant="outline" onClick={() => onResolveAll('newest')}>
              Mais recente
            </Button>
            <Button size="sm" variant="outline" onClick={() => onResolveAll('local')}>
              Versão local
            </Button>
            <Button size="sm" variant="outline" onClick={() => onResolveAll('server')}>
              Versão servidor
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1">
          {/* Lista de conflitos pendentes */}
          {pendingConflicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Pendentes</h3>
              {pendingConflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedConflict?.id === conflict.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">
                          {conflict.localData?.titulo || conflict.localData?.nome || `Item #${conflict.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conflict.store} • {conflict.conflictType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {formatDate(conflict.localTimestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        {formatDate(conflict.serverTimestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detalhes do conflito selecionado */}
          {selectedConflict && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                Comparação de Dados
                <Badge variant="outline">
                  {compareFields(selectedConflict.localData, selectedConflict.serverData).filter(f => f.isDifferent).length} diferenças
                </Badge>
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Versão Local</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDate(selectedConflict.localTimestamp)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">Versão Servidor</span>
                  </div>
                  <p className="text-xs text-green-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDate(selectedConflict.serverTimestamp)}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Campo</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Servidor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compareFields(selectedConflict.localData, selectedConflict.serverData).map((field) => {
                    const isExpanded = expandedFields.has(field.field);
                    const isLongValue = 
                      (typeof field.localValue === 'object' || typeof field.serverValue === 'object') ||
                      (String(field.localValue).length > 50 || String(field.serverValue).length > 50);

                    return (
                      <TableRow
                        key={field.field}
                        className={field.isDifferent ? 'bg-amber-50' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {field.isDifferent && (
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            )}
                            {getFieldLabel(field.field)}
                            {isLongValue && (
                              <button
                                onClick={() => toggleFieldExpanded(field.field)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={field.isDifferent ? 'bg-blue-50' : ''}>
                          <div className={`${isLongValue && !isExpanded ? 'truncate max-w-[200px]' : ''}`}>
                            {formatFieldValue(field.localValue)}
                          </div>
                        </TableCell>
                        <TableCell className={field.isDifferent ? 'bg-green-50' : ''}>
                          <div className={`${isLongValue && !isExpanded ? 'truncate max-w-[200px]' : ''}`}>
                            {formatFieldValue(field.serverValue)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Ações de resolução */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleResolve(selectedConflict, 'local')}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Manter Local
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(selectedConflict, 'server')}
                  className="gap-2"
                >
                  <Cloud className="h-4 w-4" />
                  Manter Servidor
                </Button>
                <Button
                  onClick={() => handleResolve(selectedConflict, 'merge')}
                  className="gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  Mesclar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de conflitos resolvidos */}
          {resolvedConflicts.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">
                Resolvidos ({resolvedConflicts.length})
              </h3>
              {resolvedConflicts.slice(0, 5).map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3 border rounded-lg bg-green-50/50 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm">
                          {conflict.localData?.titulo || conflict.localData?.nome || `Item #${conflict.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Resolvido: {conflict.resolution === 'local' ? 'versão local' : conflict.resolution === 'server' ? 'versão servidor' : 'mesclado'}
                        </p>
                      </div>
                    </div>
                    {conflict.resolvedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(conflict.resolvedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {resolvedConflicts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{resolvedConflicts.length - 5} conflitos resolvidos
                </p>
              )}
            </div>
          )}

          {/* Estado vazio */}
          {pendingConflicts.length === 0 && resolvedConflicts.length === 0 && (
            <div className="text-center py-12">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum conflito encontrado</p>
              <p className="text-sm text-muted-foreground">
                Todos os dados estão sincronizados corretamente
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Rodapé */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConflictResolver;

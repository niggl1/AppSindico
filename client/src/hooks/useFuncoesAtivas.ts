import { trpc } from "@/lib/trpc";
import { useCondominioAtivo } from "./useCondominioAtivo";
import { useMemo } from "react";

/**
 * Hook para verificar quais funções estão ativas para o condomínio atual.
 * Usado para filtrar dinamicamente o menu lateral baseado nas configurações do Construtor de App.
 */
export function useFuncoesAtivas() {
  const { condominioAtivo } = useCondominioAtivo();
  
  // Buscar funções ativas do condomínio
  const { data: funcoesData, isLoading } = trpc.funcoesCondominio.listarAtivas.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { 
      enabled: !!condominioAtivo?.id,
      staleTime: 5 * 60 * 1000, // Cache por 5 minutos
      refetchOnWindowFocus: false,
    }
  );

  // Criar um Set para verificação rápida O(1)
  const funcoesAtivasSet = useMemo(() => {
    if (!funcoesData?.funcoes) return new Set<string>();
    return new Set(funcoesData.funcoes.map(f => f.funcaoId));
  }, [funcoesData]);

  // Função para verificar se uma função está ativa
  const isFuncaoAtiva = (funcaoId: string): boolean => {
    // Se não há condomínio selecionado ou dados ainda carregando, mostrar tudo
    if (!condominioAtivo?.id || isLoading) return true;
    
    // Se não há funções configuradas, mostrar tudo (comportamento padrão)
    if (funcoesAtivasSet.size === 0) return true;
    
    // Verificar se a função está na lista de ativas
    return funcoesAtivasSet.has(funcaoId);
  };

  // Função para verificar múltiplas funções de uma vez
  const filterFuncoesAtivas = <T extends { funcaoId?: string }>(items: T[]): T[] => {
    if (!condominioAtivo?.id || isLoading || funcoesAtivasSet.size === 0) {
      return items;
    }
    return items.filter(item => !item.funcaoId || funcoesAtivasSet.has(item.funcaoId));
  };

  return {
    isFuncaoAtiva,
    filterFuncoesAtivas,
    isLoading,
    funcoesAtivas: funcoesData?.funcoes || [],
    totalFuncoesAtivas: funcoesAtivasSet.size,
  };
}

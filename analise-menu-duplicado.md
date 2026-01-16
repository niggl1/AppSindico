# Análise de Funções Repetidas no Menu

## Problema Identificado
O menu lateral tem funções que aparecem em múltiplos lugares:

### Funções Rápidas (topo do menu)
- Checklists
- Manutenções
- Ocorrências
- Vistorias
- Avisos
- Votações
- Notificações
- Eventos
- Ordens de Serviço

### Registro Rápido (seção separada)
- Vistoria
- Manutenção
- Ocorrência
- Antes/Depois
- Checklist

### Menu Principal (seções expandíveis)
- Comunicação: Avisos, Comunicados, Notificações, Notificar Morador
- Operacional: Vistorias, Manutenções, Ocorrências, Checklists, Antes e Depois
- Interativo: Votações, etc.

## Duplicações Claras
1. **Avisos** - aparece em Funções Rápidas E em Comunicação
2. **Notificações** - aparece em Funções Rápidas E em Comunicação
3. **Votações** - aparece em Funções Rápidas E em Interativo
4. **Vistorias** - aparece em Funções Rápidas E em Operacional E em Registro Rápido
5. **Manutenções** - aparece em Funções Rápidas E em Operacional E em Registro Rápido
6. **Ocorrências** - aparece em Funções Rápidas E em Operacional E em Registro Rápido
7. **Checklists** - aparece em Funções Rápidas E em Operacional E em Registro Rápido
8. **Eventos** - aparece em Funções Rápidas E em Eventos e Agenda

## Solução Proposta
As "Funções Rápidas" são intencionais - são atalhos configuráveis pelo usuário.
O "Registro Rápido" também é intencional - são atalhos para criar registros rapidamente.

O problema pode ser que o menu principal está mostrando itens que já estão nas funções rápidas.
Ou o usuário quer remover completamente as duplicações.

Preciso confirmar com o usuário qual é a expectativa.

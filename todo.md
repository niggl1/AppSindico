# Project TODO

## Concluído
- [x] Botão para excluir secções inteiras da revista digital (votações, palavra do síndico, etc.) - Já existe como "Ocultar"
- [x] Bug: Botão de ocultar secções não está a aparecer no editor de revistas - Corrigido
- [x] Sistema de login local com email/senha funcionando
- [x] Dashboard principal com estatísticas
- [x] Central de Projetos (Apps, Revistas, Relatórios)
- [x] Editor de Revistas Digitais funcionando
- [x] Funcionalidade Ocultar/Mostrar Secções testada e funcionando

## Em Progresso
- [ ] Testar criação de revista via interface (modal de criação)
- [ ] Testar outras funcionalidades do dashboard (Checklists, Manutenções, etc.)
- [ ] Verificar geração de PDF das revistas

## Pendente
- [ ] Configurar domínio www.appsindico.com.br
- [ ] Fazer deploy/publicação

## Bugs Reportados
- [x] Layout da página inicial está diferente do anterior - CORRIGIDO (grid 3x3 nos features, menu de navegação visível, botões em grid 2x2)

## Ajustes Recentes (06/01/2026)
- [x] Alterar "Criar Relatórios Detalhados" para "Criar Relatórios"
- [x] Secção "Sem Taxas" em 4 colunas numa única linha
- [x] Cards de "Secções Disponíveis" em grid de 8 colunas
- [x] Hover effect nos cards com fundo azul e descrição
- [x] Secção "Como Funciona" com números 01, 02, 03 à direita do texto
- [x] Secção "Desenvolvimento Personalizado" - Como Funciona à esquerda, Prazos e Fidelidade à direita
- [x] Substituir logo atual pelo LogoAppSindico.png no header
- [x] Colocar preview da revista ao lado dos botões no Hero Section (layout lado a lado)
- [ ] Colocar todos os cards de Secções Disponíveis numa única linha horizontal
- [x] Colocar as secções Como Funciona e Prazos e Fidelidade lado a lado numa única linha
- [x] Mover números 01, 02, 03 para a frente dos tópicos na secção Como Funciona
- [x] Colocar os planos de preços lado a lado (horizontalmente)
- [x] Ajustar Hero Section: aumentar revista, trazer para esquerda, aumentar textos e botões
- [x] Ajustar LandingApp.tsx: tablet ao lado do texto, cards maiores, ícones coloridos, badge Online
- [x] Remover secção Prazos e Fidelidade e itens relacionados, substituir por quadro premium
- [x] Ajustar planos: Síndicos remover suporte por e-mail, Condomínios remover suporte prioritário e reservas de áreas comuns, Administradoras remover gerente dedicado e API de integração, adicionar condomínios ilimitados
- [x] Adicionar "Integração com moradores" ao plano Condomínios
- [x] Adicionar "Integração com funcionários" ao plano Síndicos
- [x] Adicionar opção "Ordem de Serviço" ao Construtor de App
- [x] Ao clicar em "+ Novo Projeto" abrir Assistente de Criação em modal diretamente
- [x] Corrigir erro de acessibilidade: DialogContent sem DialogTitle no modal do Assistente
- [x] Melhorar design do modal Cadastrar Condomínio
- [x] Ajustar campos de upload de imagem no modal Cadastrar Condomínio
- [x] Centralizar ícone de upload no ImageUpload
- [x] Corrigir centralização do ícone de upload dentro do quadrado tracejado
- [x] Aplicar estilo premium aos modais: DashboardLayout, EnvioMulticanalModal, FuncoesRapidas, QuickFunctionsEditor, ShareModal, AgendaVencimentos, AppViewer
- [x] Aplicar estilo premium ao modal de Novo Morador
- [x] Aplicar estilo premium ao modal de Novo Membro da Equipe
- [x] Ajustar tamanho do local de upload para textos aparecerem integralmente
- [x] Corrigir campo de upload no modal Novo Membro da Equipe para usar estilo atualizado
- [x] Aplicar estilo premium ao modal de Enviar Notificação e configurações de notificações
- [x] Configurar Amazon SES SMTP para envio de emails
- [x] Criar serviço de email com nodemailer e Amazon SES
- [x] Integrar envio de emails no sistema de notificações
- [x] Criar templates de email (notificação, vencimento, recuperação de senha, link mágico)
- [x] Testar envio de email com sucesso

## Design Premium - Modais (07/01/2026)
- [x] Aplicar design premium aos modais do Dashboard.tsx (15 modais)
- [x] Aplicar design premium aos modais de ChecklistsPage (3 modais)
- [x] Aplicar design premium aos modais de CondominioManager (2 modais)
- [x] Aplicar design premium aos modais de CriarProjeto (1 modal)
- [x] Aplicar design premium aos modais de Destaques (1 modal)
- [x] Aplicar design premium aos modais de HistoricoInfracoesPage (2 modais)
- [x] Aplicar design premium aos modais de ManutencoesPage (1 modal detalhes)
- [x] Aplicar design premium aos modais de MoradorDashboard (2 modais)
- [x] Aplicar design premium aos modais de OcorrenciasPage (1 modal detalhes)
- [x] Aplicar design premium aos modais de OrdensServico (2 modais)
- [x] Aplicar design premium aos modais de OrdensServicoConfig (5 modais)
- [x] Aplicar design premium aos modais de OrdemServicoDetalhe (7 modais)
- [x] Aplicar design premium aos modais de PaginasCustom (1 modal)
- [x] Aplicar design premium aos modais de RevistaEditor (2 modais)
- [x] Aplicar design premium aos modais de VistoriasPage (1 modal detalhes)

## Correção MagazineViewer (07/01/2026)

- [x] Carregar dados reais da revista do banco de dados em vez de dados de demonstração
- [x] Corrigir procedimento getPublicFull para buscar dados corretos das tabelas
- [x] Corrigir queries que usavam colunas inexistentes (revistaId vs condominioId)
- [x] Corrigir status de filtros (ativo vs aprovado vs aberto)
## Bug: Capa da revista mostra nome do condomínio em vez do título (07/01/2026)

- [x] Corrigir MagazineViewer para mostrar revista.titulo na capa em vez de condominio.nome
- [x] Manter nome do condomínio como informação secundária na capa

## Nova Funcionalidade: Upload de Imagem de Capa (07/01/2026)

- [x] Adicionar campo de upload de imagem de capa no editor de revistas
- [x] Permitir preview da imagem antes de salvar
- [x] Integrar com o sistema de storage existente

## Formulários de Secções em Falta (07/01/2026)

- [x] Adicionar formulário para secção Classificados
- [x] Adicionar formulário para secção Eventos
- [x] Adicionar formulário para secção Funcionários
- [x] Adicionar formulário para secção Caronas
- [x] Adicionar formulário para secção Achados e Perdidos
- [x] Telefones e Links já têm formulários na aba Secções

## Novas Secções Premium da Revista (07/01/2026)

- [x] Galeria de Fotos - Álbuns de fotos de eventos e momentos do condomínio
- [x] Comunicados - Comunicados oficiais da administração
- [x] Regras e Normas - Regulamento interno do condomínio
- [x] Dicas de Segurança - Orientações de segurança para moradores
- [x] Realizações - Conquistas e melhorias realizadas no condomínio
- [x] Melhorias - Projetos de melhoria em andamento ou planeados
- [x] Aquisições - Novos equipamentos e bens adquiridos
- [x] Publicidade - Espaço para anúncios de parceiros e patrocinadores

## Secção Cadastre-se para Receber (07/01/2026)

- [x] Formulário com campos: Nome, Email, Unidade/Apartamento, WhatsApp, E-mail
- [x] Mensagem: "Seu cadastro só será efetuado após a ativação por parte da administração do condomínio"
- [x] Design premium com validação de campos

## Correção Achados e Perdidos (07/01/2026)

- [x] Formulário para gestores registarem itens achados
- [x] Campos: Título, Imagens (upload múltiplo), Local onde foi achado, Descrição
- [x] Design premium consistente

## Layout Premium PDF (07/01/2026)

- [x] Design profissional para exportação em PDF
- [x] Controle de quebra de página (page-break-inside: avoid)
- [x] Capa elegante com logo e título
- [x] Índice automático das secções
- [x] Cabeçalho e rodapé em todas as páginas
- [x] Tipografia e espaçamento profissional


## Redesign Premium do PDF (08/01/2026)

- [x] Redesenhar capa com visual sofisticado (gradientes elegantes, tipografia refinada)
- [x] Remover elementos visuais básicos (círculos escuros)
- [x] Adicionar padrões geométricos elegantes ou imagem de fundo
- [x] Melhorar tipografia com fontes premium
- [x] Adicionar bordas e sombras sutis para profundidade
- [x] Redesenhar páginas internas com layout limpo e profissional
- [x] Testar e validar o novo design


## Sistema de Estilos para PDF (08/01/2026)

- [x] Criar múltiplos estilos/temas para o PDF (Clássico, Moderno, Minimalista, Elegante, Corporativo)
- [x] Adicionar interface de seleção de estilo no editor da revista
- [x] Integrar seleção de estilo com a geração do PDF
- [x] Testar os diferentes estilos


## Modo de Impressão (08/01/2026)

- [x] Mudar automaticamente para modo contínuo ao imprimir
- [x] Voltar ao modo página após fechar a janela de impressão

- [x] BUG: Impressão em modo scroll não está funcionando - corrigido


## Reordenação de Secções com Drag and Drop (08/01/2026)

- [x] Instalar biblioteca de drag and drop (@dnd-kit)
- [x] Implementar drag and drop na lista de páginas do editor
- [x] Adicionar persistência da nova ordem no backend (ordem local apenas por agora)
- [x] Testar a funcionalidade

- [ ] BUG: Secções não ficam na posição correta após arrastar - corrigir


## Novos Cards na Landing Page (08/01/2026)

- [x] Adicionar card Ordens de Serviço
- [x] Adicionar card Galeria de Fotos
- [x] Adicionar card Telefones Úteis
- [x] Adicionar card Links Úteis
- [x] Adicionar card Melhorias
- [x] Adicionar card Moradores/Unidades
- [x] Adicionar card Reserva de Áreas Comuns

- [x] Remover card Reserva de Áreas da landing page
- [x] Ordenar todos os cards da landing page em ordem alfabética


## Melhorias na Secção de Relatórios (08/01/2026)

- [x] Adicionar filtro por condomínio
- [x] Adicionar exportação Excel/CSV
- [x] Adicionar relatório de Ordens de Serviço
- [x] Implementar melhorias visuais (tooltips, indicadores, cores)
- [x] Ajustar PDF para não quebrar páginas


## Módulo de Funções Fácil (09/01/2026)

- [x] Criar schema da base de dados para tarefas fácil
- [x] Criar rotas tRPC para CRUD de tarefas fácil
- [x] Criar modal de registro rápido com 4 abas (Vistoria, Manutenção, Ocorrência, Antes/Depois)
- [x] Criar página de histórico com filtros por tipo e status
- [x] Integrar ao menu lateral e funções rápidas
- [x] Design premium laranja (#F97316) com ícone Zap
- [x] Protocolo automático (VS-2026-0001, MS-2026-0001, etc.)
- [x] Captura GPS automática
- [x] Botão "Registrar e Adicionar Outra" + "Enviar"
- [x] BUG: Item Funções Fácil não aparece no menu lateral - item existe no código, verificar cache

## Botão Registro Rápido nas Páginas (09/01/2026)

- [x] Adicionar botão "⚡ Registro Rápido" na página de Vistorias (teste)
- [x] Replicar para Manutenções, Ocorrências e Antes e Depois


## Ajustes no Modal de Registro Rápido (09/01/2026)

- [x] Captura automática de localização GPS ao abrir o modal
- [x] Botão "Registrar e Adicionar Outra" já existe para salvar rascunho
- [x] Campos de título, descrição, status e prioridade já estão personalizáveis
- [x] Adicionar botão "+" para salvar valores personalizados (responsável, localização) no Registro Rápido
- [x] Reorganizar campos: Responsável e Localização acima de Título
- [x] Adicionar botão "+" em Status e Prioridade
- [x] Colocar campos Responsável, Localização, Status e Prioridade um embaixo do outro (não lado a lado)
- [x] Adicionar cores diferentes para cada aba no modal de Registro Rápido (Vistoria=laranja, Manutenção=verde, Ocorrência=vermelho, Antes/Depois=azul)
- [x] Adicionar tom degradê (gradiente) estilo premium para cada aba no modal de Registro Rápido

## Melhorias nos Itens do Checklist (09/01/2026)

- [x] Adicionar contorno na marcação do checklist com ícone de check dentro
- [x] Adicionar ícone de câmera para adicionar fotos ao item
- [x] Adicionar ícone de triângulo com exclamação que abre modal com título, imagens, descrição e status (cada um com botão +)

## Bug: Funções Fácil não aparece no menu (09/01/2026)

- [x] Verificar e corrigir item "⚡ Funções Fácil" no menu lateral - RESOLVIDO: problema de cache do build, rebuild completo corrigiu


## Bug: Alterações não aparecem na versão publicada (09/01/2026)

- [x] Diagnosticar problema de publicação
- [x] Verificar se o checkpoint contém todas as alterações
- [x] Fazer rebuild completo e criar novo checkpoint (38972704)
- [x] Adicionar link "Funções Fácil" na secção "Funções Rápidas" do Dashboard


## Integração Modular - App Síndico (16/01/2026)

### Fase 1 - Análise
- [x] Clonar repositório Manutenção Universal (sem alterar)
- [x] Analisar estrutura de componentes e páginas
- [x] Identificar schemas de base de dados
- [x] Documentar rotas e procedures

### Fase 2 - Estrutura Modular
- [x] Criar estrutura de pastas para módulos
- [x] Criar sistema de navegação entre módulos
- [ ] Criar tabela condominio_modulos no banco (opcional para futuro)

### Fase 3 - Módulo Operacional (Portal de Manutenções)
- [x] Criar Portal de Manutenções em /modulo/manutencoes
- [x] Integrar portal no menu lateral do Dashboard
- [x] Criar página de Gestão de Equipes (/dashboard/membros-equipe)
- [x] Criar página de Timeline (/dashboard/timeline)
- [x] Todos os links do portal redirecionam para páginas existentes
- [x] Testar navegação entre portal e páginas

### Fase 4 - Construtor de App
- [x] Criar tela de configuração por categorias
- [x] Implementar ativação/desativação de funções
- [x] Adicionar link no menu de configurações
- [ ] Menu dinâmico baseado nas configurações (próxima fase)


## Construtor de App - Personalização por Condomínio (16/01/2026)

### Fase 1 - Arquitetura
- [x] Definir categorias de módulos (Comunicação, Operacional, Financeiro, etc.)
- [x] Listar todas as funções disponíveis no sistema
- [x] Definir estrutura da tabela de configuração

### Fase 2 - Banco de Dados
- [x] Tabela condominio_funcoes já existia
- [x] FUNCOES_DISPONIVEIS expandido com ícones e rotas
- [x] CATEGORIAS_FUNCOES adicionado

### Fase 3 - Backend
- [x] Router funcoesCondominio já existia
- [x] Adicionado listarCategorias endpoint
- [x] Permissões atualizadas para síndicos

### Fase 4 - Interface
- [x] Criar página de Construtor de App
- [x] Organizar módulos por categorias
- [x] Implementar toggle de ativação/desativação
- [x] Design premium com estatísticas

### Fase 5 - Menu Dinâmico
- [x] Criar hook useFuncoesAtivas
- [x] Adicionar endpoint listarAtivas no router
- [x] Modificar DashboardLayout para filtrar itens
- [x] Ocultar seções vazias automaticamente
- [x] Testar navegação dinâmica


## Menu Dinâmico - Filtragem por Funções Ativas (16/01/2026)

### Fase 1 - Análise
- [x] Verificar mapeamento funcaoId nos menuSections
- [x] Identificar funções que precisam de mapeamento
- [x] Verificar endpoint de funções ativas

### Fase 2 - Hook de Funções Ativas
- [x] Criar hook useFuncoesAtivas
- [x] Integrar com tRPC funcoesCondominio.listarAtivas
- [x] Cache e otimização de performance (5 min staleTime)

### Fase 3 - Filtrar Menu
- [x] Modificar DashboardLayout para usar hook
- [x] Filtrar itens baseado em funções ativas
- [x] Ocultar seções vazias automaticamente

### Fase 4 - Testes
- [x] Testar com funções ativas/inativas
- [x] Verificar navegação e UX
- [x] Escrever testes unitários (menuDinamico.test.ts)


## Correções de Bugs (16/01/2026)

### Bug: Funções Repetidas no Menu
- [ ] Identificar onde as funções estão duplicadas
- [ ] Remover duplicações no DashboardLayout
- [ ] Testar menu após correção


## Adicionar Itens ao Menu (16/01/2026)

- [x] Adicionar Construtor de App ao menu
- [x] Adicionar Relatórios ao menu
- [x] Adicionar Livro de Manutenção ao menu


## Portal de Manutenções - Novos Módulos (16/01/2026)

- [x] Adicionar Construtor de App ao Portal de Manutenções
- [x] Adicionar Relatórios ao Portal de Manutenções
- [x] Adicionar Livro de Manutenção ao Portal de Manutenções


## Notificações Automáticas (16/01/2026)

### Fase 1 - Análise
- [ ] Verificar estrutura existente de notificações
- [ ] Identificar eventos que devem gerar notificações

### Fase 2 - Banco de Dados
- [ ] Criar tabela de configuração de notificações
- [ ] Definir tipos de notificação por evento

### Fase 3 - Backend
- [ ] Implementar triggers nos routers de manutenção
- [ ] Implementar triggers nos routers de ocorrências
- [ ] Implementar triggers nos routers de vistorias
- [ ] Usar notifyOwner para enviar alertas

### Fase 4 - Interface
- [ ] Criar página de configuração de notificações
- [ ] Permitir ativar/desativar notificações por tipo


## Remover Atalhos do Menu (17/01/2026)
- [x] Remover seção de ATALHOS do menu lateral (menu já está grande)

## Migração: Dashboard de Manutenção Universal → App Síndico (17/01/2026)

### Fase 1 - Schema do Banco
- [x] Adicionar tabelas de timeline ao schema
- [x] Criar tabelas no banco de dados

### Fase 2 - Router Backend
- [x] Criar router timelineLivro
- [x] Registar no appRouter

### Fase 3 - Páginas Frontend
- [x] Criar LivroManutencaoPage (nova timeline)
- [x] Criar LivroManutencaoDashboard (estatísticas)
- [x] Criar LivroManutencaoHistorico (lista)
- [x] Criar LivroManutencaoVisualizar (visualização pública)

### Fase 4 - Integração
- [x] Adicionar rotas no App.tsx
- [x] Atualizar links no Portal de Manutenções
- [x] Atualizar links nas Funções Rápidas

---

## Histórico Anterior:

### Fase 1 - Análise
- [ ] Criar checkpoint de segurança
- [ ] Analisar estrutura do manutencao-universal
- [ ] Mapear páginas e componentes a migrar

### Fase 2 - Backend
- [ ] Migrar schema do banco de dados
- [ ] Migrar routers/endpoints
- [ ] Adaptar para sistema de condomínios

### Fase 3 - Frontend
- [ ] Migrar páginas de manutenção
- [ ] Migrar componentes específicos
- [ ] Preservar rotas e navegação existentes

### Fase 4 - Limpeza
- [ ] Remover código antigo duplicado
- [ ] Testar todas as funcionalidades
- [ ] Checkpoint final

## Menu - Notificar o Morador (17/01/2026)

- [ ] Adicionar "Notificar o Morador" no menu lateral do Dashboard
- [x] Remover menu lateral interno (DashboardLayout) das páginas internas - usar apenas conteúdo principal

## Correção de Erro (17/01/2026)
- [x] Corrigir erro: No procedure found on path "membroEquipe.me"

## Trocar Logo (17/01/2026)
- [x] Trocar logo do App Manutenção pela logo do App Síndico no menu lateral
- [x] Usar a logo enviada pelo usuário (LogoAppSindico.png) no menu lateral

## Correção Timeline (17/01/2026)
- [x] Corrigir botão voltar na Timeline para ir para /dashboard ao invés de /modulo/manutencoes

## Modificar Botão VISÃO GERAL (17/01/2026)
- [x] Remover link, palavra "CRIAR" e ícone de + do botão "VISÃO GERAL / CRIAR"

## Remover Reservas do Menu (17/01/2026)
- [x] Remover item "Reservas" do menu lateral (não tem funcionalidade)

## Simplificar Menu VISÃO GERAL (17/01/2026)
- [x] Remover ícone de + do menu
- [x] Remover botão "MEUS PROJETOS" do menu
- [x] Remover opção "+ Novo Projeto" que aparece ao clicar em VISÃO GERAL

## Corrigir Agenda de Vencimentos (17/01/2026)
- [ ] Substituir a página de Agenda de Vencimentos atual pela versão funcional do App Manutenção
- [ ] Testar botões de cadastro (Contrato, Serviço, Manutenção)

## Correção de Erros TypeScript (17/01/2026)
- [x] Corrigir erro no TimelineVisualizarPage.tsx - Property 'timeline' does not exist
- [x] Testar sistema em busca de mais erros


## Timeline Completa com Comentários (17/01/2026)

- [x] Criar tabela de comentários de timeline no banco de dados
- [x] Criar tabela de reações de comentários
- [x] Implementar procedures de comentários no router (listar, criar, editar, excluir)
- [x] Implementar procedures de reações (adicionar, remover)
- [x] Criar página TimelineCompletaPage com sistema de comentários
- [x] Adicionar abas: Dados, Comentários, Histórico
- [x] Sistema de comentários com avatar, nome, data/hora
- [x] Reações nos comentários (like, love, check, question, alert)
- [x] Botão "Salvar e Continuar Depois" funcional
- [x] Botão "Compartilhar com Equipe" funcional
- [x] Adicionar rota /dashboard/timeline-completa
- [x] Adicionar item "Timeline Completa" no menu do Dashboard


## Melhorias Timeline Completa (17/01/2026)

- [x] Notificações em tempo real quando alguém comenta na timeline
- [x] Sistema de menções de usuários com @ nos comentários
- [x] Permitir anexar arquivos (PDFs, documentos) além de imagens nos comentários
- [x] Atualizar interface com as novas funcionalidades


## Melhorias Avançadas Timeline Completa (17/01/2026)

- [x] Filtros de comentários por autor, data ou tipo de anexo
- [x] Respostas em thread com visualização aninhada
- [x] Histórico de edições dos comentários (versões anteriores)


## Funcionalidades Extras Timeline Completa (17/01/2026)

- [x] Exportar timeline para PDF com todos os comentários
- [x] Notificações push no navegador para novos comentários
- [x] Busca global por texto nos comentários da timeline


## Funcionalidades Avançadas Timeline Completa (17/01/2026)

- [x] Estatísticas da timeline (dashboard com métricas)
- [x] Templates de comentários (respostas pré-definidas)
- [x] Agendamento de lembretes para follow-up


## Funcionalidades Premium Timeline Completa (17/01/2026)

- [x] Relatório de atividades mensal automático
- [x] Integração com Google Calendar para lembretes
- [x] Suporte a upload de vídeos curtos nos comentários


## Modo Offline - Parte Operacional (17/01/2026)

- [x] Service Worker para cache de recursos e páginas
- [x] IndexedDB para armazenamento local de dados
- [x] Hooks e contexto de sincronização offline
- [x] Suporte offline para Timelines
- [x] Suporte offline para Ordens de Serviço
- [x] Suporte offline para Manutenções
- [x] Indicador de status de conexão na interface
- [x] Sincronização automática quando conexão retornar


## Modo Offline Completo - Todas as Funções (17/01/2026)

### Comunicação
- [x] Avisos offline
- [x] Enquetes offline
- [x] Comunicados offline
- [x] Mensagens offline

### Financeiro
- [x] Boletos offline
- [x] Prestação de contas offline
- [x] Despesas offline
- [x] Receitas offline

### Cadastros
- [x] Moradores offline
- [x] Funcionários offline
- [x] Fornecedores offline
- [x] Veículos offline
- [x] Unidades offline

### Documentos
- [x] Atas offline
- [x] Regulamentos offline
- [x] Contratos offline
- [x] Arquivos gerais offline

### Reservas
- [x] Áreas comuns offline
- [x] Agendamentos offline
- [x] Calendário offline

### Ocorrências
- [x] Registros offline
- [x] Acompanhamentos offline

### Infraestrutura
- [x] Expandir IndexedDB com stores para todas as funções
- [x] Atualizar contexto offline com funções de todas as áreas
- [x] Atualizar Service Worker com padrões de cache expandidos
- [x] Criar componentes de status offline por módulo


## Melhorias Avançadas Modo Offline (17/01/2026)

### Resolução de Conflitos
- [x] Sistema de detecção de conflitos entre dados offline e online
- [x] Interface visual para comparar versões conflitantes
- [x] Opções de resolução: manter local, manter servidor, mesclar
- [x] Histórico de conflitos resolvidos

### Compressão de Dados
- [x] Implementar compressão LZ-String para dados do IndexedDB
- [x] Compressão automática ao salvar dados offline
- [x] Descompressão transparente ao ler dados
- [x] Indicador de economia de espaço

### Sincronização Seletiva
- [x] Interface para configurar módulos a sincronizar
- [x] Opção de sincronização automática por módulo
- [x] Prioridade de sincronização configurável
- [x] Agendamento de sincronização por horário


## Modo Escuro e PWA (17/01/2026)

### Modo Escuro Automático
- [x] Detectar preferência do sistema (prefers-color-scheme)
- [x] Alternar tema automaticamente baseado na preferência
- [x] Persistir escolha manual do usuário
- [x] Transição suave entre temas

### PWA Completo
- [x] Criar manifest.json com metadados do app
- [x] Gerar ícones em múltiplos tamanhos (72, 96, 128, 144, 152, 192, 384, 512)
- [x] Configurar splash screens
- [x] Atualizar Service Worker para instalação
- [x] Adicionar meta tags para iOS
- [x] Configurar tema de cor da barra de status


## Biometria e Widgets PWA (17/01/2026)

### Autenticação Biométrica
- [ ] Implementar Web Authentication API (WebAuthn)
- [ ] Suporte a Face ID e Touch ID
- [ ] Configuração de biometria nas preferências do usuário
- [ ] Fallback para PIN/senha quando biometria não disponível
- [ ] Armazenamento seguro de credenciais

### Widgets de Atalhos
- [ ] Criar componente de widgets personalizáveis
- [ ] Widget de acesso rápido ao Dashboard
- [ ] Widget de Timelines recentes
- [ ] Widget de Ordens de Serviço pendentes
- [ ] Widget de Notificações
- [ ] Configuração de widgets na tela inicial
- [ ] Integrar widgets no manifest.json


## Biometria e Widgets PWA (17/01/2026)

### Biometria/Face ID
- [x] Implementar Web Authentication API (WebAuthn)
- [x] Criar componente de configuração de biometria
- [x] Tela de bloqueio biométrico
- [x] Suporte a PIN como alternativa
- [x] Persistência de credenciais

### Widgets de Atalhos
- [x] Criar componente de widgets personalizáveis
- [x] Adicionar widgets no manifest.json
- [x] Configurar atalhos no Service Worker
- [x] Interface de configuração de widgets
- [x] Suporte a arrastar e reordenar

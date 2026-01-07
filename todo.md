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

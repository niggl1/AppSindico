# App Síndico - Documentação de Uso

## Introdução

O **App Síndico** é uma plataforma digital completa para gestão de condomínios, permitindo a criação de aplicativos personalizados, revistas digitais interativas e relatórios detalhados. Este documento apresenta as principais funcionalidades e instruções de uso do sistema.

---

## Acesso ao Sistema

O acesso ao sistema é feito através do botão **"Meu Painel"** na página inicial. O utilizador pode autenticar-se utilizando a conta Manus OAuth ou através de credenciais locais (email e senha).

Após o login, o utilizador é direcionado para o **Dashboard**, onde tem acesso a todas as funcionalidades organizadas em categorias.

---

## Dashboard Principal

O Dashboard apresenta uma visão geral do sistema com três áreas principais:

| Área | Descrição |
|------|-----------|
| **Estatísticas** | Mostra o número de Apps, Relatórios e Revistas criados |
| **Funções Rápidas** | Atalhos personalizáveis para as funcionalidades mais utilizadas |
| **Primeiros Passos** | Guia passo-a-passo para novos utilizadores |

O menu lateral esquerdo organiza todas as funcionalidades em categorias expansíveis, facilitando a navegação mesmo com muitas opções disponíveis.

---

## Gestão de Condomínios

### Cadastrar Condomínio

Para cadastrar um novo condomínio, aceda a **Gestão do Condomínio** no menu lateral e clique em **Cadastrar Condomínio**. Preencha os seguintes campos:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Nome | Sim | Nome completo do condomínio |
| Endereço | Sim | Endereço completo |
| Logo | Não | Imagem do logotipo (JPEG, PNG, GIF ou WebP) |
| Descrição | Não | Descrição adicional |

### Gestão de Funcionários

Na secção de funcionários, é possível cadastrar toda a equipa do condomínio, incluindo porteiros, zeladores, administradores e outros colaboradores. Cada funcionário pode ter diferentes níveis de acesso ao sistema.

---

## Revistas Digitais

### Criar Nova Revista

Para criar uma revista digital, clique em **"Criar Revista"** no Dashboard ou aceda através do menu **Meus Projetos**. O processo de criação envolve:

1. **Selecionar o condomínio** associado à revista
2. **Definir título e edição** (ex: "Edição Janeiro 2026")
3. **Escolher imagem de capa** (opcional)
4. **Configurar as secções** desejadas

### Secções Disponíveis

A revista digital suporta 19 tipos de secções diferentes, organizadas por categoria:

| Categoria | Secções |
|-----------|---------|
| **Comunicação** | Mensagem do Síndico, Avisos, Comunicados |
| **Eventos** | Eventos, Galeria de Fotos |
| **Comunidade** | Classificados, Caronas, Achados e Perdidos |
| **Operacional** | Funcionários, Votações, Regras e Normas |
| **Informativo** | Telefones Úteis, Links Úteis, Dicas de Segurança |
| **Institucional** | Realizações, Melhorias, Aquisições |
| **Comercial** | Publicidade, Cadastre-se para Receber |

### Editor de Revista

O editor permite personalizar cada secção individualmente. As funcionalidades incluem:

- **Ocultar/Mostrar secções** através do botão com ícone de olho
- **Adicionar conteúdo** específico para cada tipo de secção
- **Pré-visualizar** a revista em tempo real
- **Exportar para PDF** com diferentes estilos visuais

### Estilos de PDF

Ao exportar a revista para PDF, pode escolher entre 5 estilos visuais:

| Estilo | Cores Principais | Indicado Para |
|--------|------------------|---------------|
| **Clássico** | Azul escuro e dourado | Condomínios tradicionais |
| **Moderno** | Azul vibrante e laranja | Condomínios jovens |
| **Minimalista** | Preto e branco | Visual limpo e profissional |
| **Elegante** | Bordeaux e ouro rosé | Condomínios de alto padrão |
| **Corporativo** | Verde escuro e prata | Prédios comerciais |

### Visualizador de Revista

O visualizador permite ler a revista de duas formas:

- **Modo Página**: Navegação com setas, simulando uma revista física
- **Modo Contínuo**: Rolagem vertical, ideal para leitura rápida

A impressão é automaticamente feita em modo contínuo para garantir que todas as páginas sejam incluídas.

---

## Notificações

O sistema de notificações permite enviar comunicados aos moradores através de email. Os templates disponíveis incluem:

| Template | Uso |
|----------|-----|
| **Notificação Geral** | Avisos e comunicados diversos |
| **Vencimento** | Lembretes de pagamentos e prazos |
| **Recuperação de Senha** | Redefinição de credenciais |
| **Link Mágico** | Acesso sem senha |

As notificações são enviadas através do Amazon SES, garantindo alta taxa de entrega.

---

## Funções Rápidas

As Funções Rápidas são atalhos personalizáveis que aparecem no topo do Dashboard. Para adicionar uma função rápida:

1. Navegue até a funcionalidade desejada no menu lateral
2. Clique no ícone **"+"** ao lado do nome
3. A função aparecerá na barra de Funções Rápidas

Para remover, clique no **"x"** que aparece ao passar o rato sobre o atalho.

---

## Ordens de Serviço

O módulo de Ordens de Serviço permite gerir manutenções e reparações no condomínio. Cada ordem contém:

- Descrição do problema
- Prioridade (baixa, média, alta, urgente)
- Responsável pela execução
- Status (aberta, em andamento, concluída)
- Histórico de atualizações

---

## Publicação

Para publicar o site e torná-lo acessível publicamente:

1. Certifique-se de que todas as alterações estão guardadas
2. Clique no botão **"Publish"** no cabeçalho do painel de gestão
3. Aguarde a conclusão do processo de publicação
4. O sistema fornecerá um link público para acesso

Para configurar um domínio personalizado (ex: www.appsindico.com.br), aceda a **Settings > Domains** no painel de gestão.

---

## Suporte

Para questões ou suporte técnico, utilize o botão de **WhatsApp** disponível no canto inferior direito de todas as páginas do sistema.

---

*Documentação gerada em 08/01/2026*

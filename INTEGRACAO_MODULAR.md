# Plano de Integração Modular - App Síndico

## Objetivo
Transformar o App Síndico em uma arquitetura modular onde cada categoria funciona como um "app dentro de app", permitindo que síndicos personalizem seu sistema escolhendo os módulos e funções desejadas.

---

## Estrutura de Módulos por Categoria

### 🔧 MÓDULO OPERACIONAL
**Fonte:** Manutenção Universal (GitHub)
| Função | Componente | Status |
|--------|------------|--------|
| Manutenções | ManutencoesPage.tsx | [ ] Integrar |
| Vistorias | VistoriasPage.tsx | [ ] Integrar |
| Ocorrências | OcorrenciasPage.tsx | [ ] Integrar |
| Checklists | ChecklistsPage.tsx | [ ] Integrar |
| Antes/Depois | AntesDepoisPage.tsx | [ ] Integrar |
| Ordens de Serviço | OrdensServico.tsx | [ ] Integrar |
| Registro Rápido | TarefasSimplesModal.tsx | [ ] Integrar |
| Checklist Rápido | ChecklistRapidoModal.tsx | [ ] Integrar |
| Gestão de Equipes | MembrosEquipePage.tsx | [ ] Integrar |
| Timeline | TimelinePage.tsx | [ ] Integrar |

### 📢 MÓDULO COMUNICAÇÃO
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Avisos | AvisosPage.tsx | [x] Existente |
| Comunicados | ComunicadosPage.tsx | [x] Existente |
| Notificações | NotificacoesPage.tsx | [x] Existente |
| Notificar Morador | NotificarMoradorPage.tsx | [x] Existente |

### 📅 MÓDULO EVENTOS E AGENDA
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Eventos | EventosPage.tsx | [x] Existente |
| Agenda | AgendaPage.tsx | [x] Existente |
| Reservas | ReservasPage.tsx | [x] Existente |
| Assembleia Online | AssembleiaPage.tsx | [x] Oculto |

### 👥 MÓDULO COMUNIDADE
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Votações e Enquetes | VotacoesPage.tsx | [x] Existente |
| Classificados | ClassificadosPage.tsx | [x] Existente |
| Achados e Perdidos | AchadosPerdidosPage.tsx | [x] Existente |
| Caronas | CaronasPage.tsx | [x] Existente |

### 🏢 MÓDULO GESTÃO DO CONDOMÍNIO
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Moradores | MoradoresPage.tsx | [x] Existente |
| Unidades | UnidadesPage.tsx | [x] Existente |
| Documentos | DocumentosPage.tsx | [x] Existente |
| Regras | RegrasPage.tsx | [x] Existente |
| Fornecedores | FornecedoresPage.tsx | [x] Existente |

### 📸 MÓDULO GALERIA E MÍDIA
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Galeria de Fotos | GaleriaPage.tsx | [x] Existente |
| Realizações | RealizacoesPage.tsx | [x] Existente |
| Melhorias | MelhoriasPage.tsx | [x] Existente |
| Aquisições | AquisicoesPage.tsx | [x] Existente |

### 📊 MÓDULO RELATÓRIOS E PAINEL
**Fonte:** Manutenção Universal + App Síndico
| Função | Componente | Status |
|--------|------------|--------|
| Dashboard | Dashboard.tsx | [x] Existente |
| Relatórios | RelatorioBuilder.tsx | [ ] Integrar |
| Estatísticas | EstatisticasPage.tsx | [ ] Criar |

### ⚙️ MÓDULO CONFIGURAÇÕES
**Fonte:** App Síndico (existente)
| Função | Componente | Status |
|--------|------------|--------|
| Perfil do Condomínio | PerfilCondominioPage.tsx | [x] Existente |
| Usuários | UsuariosPage.tsx | [x] Existente |
| Personalização | PersonalizacaoPage.tsx | [x] Existente |

---

## Estrutura de Pastas Proposta

```
client/src/
  modules/
    operacional/
      pages/
      components/
      hooks/
      index.ts
    comunicacao/
      pages/
      components/
      index.ts
    eventos/
      ...
    comunidade/
      ...
    gestao/
      ...
    galeria/
      ...
    relatorios/
      ...
    configuracoes/
      ...
  
server/
  modules/
    operacional/
      routers/
      db/
    ...
```

---

## Banco de Dados - Tabelas a Adicionar

Do Manutenção Universal:
- [ ] tarefas_simples (registro rápido)
- [ ] checklists_rapidos
- [ ] membros_equipe
- [ ] funcionarios
- [ ] ordens_servico
- [ ] timeline_eventos
- [ ] compartilhamentos

---

## Construtor de App

Tabela: `condominio_modulos`
```sql
CREATE TABLE condominio_modulos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  condominio_id INT NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  funcao VARCHAR(50) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Ordem de Execução

1. [x] Criar checkpoint de segurança
2. [ ] Criar estrutura de pastas para módulos
3. [ ] Copiar componentes do Módulo Operacional
4. [ ] Adaptar imports e rotas
5. [ ] Adicionar tabelas ao schema
6. [ ] Criar routers tRPC
7. [ ] Criar página do Construtor de App
8. [ ] Criar menu dinâmico baseado em configurações
9. [ ] Testar integração
10. [ ] Remover funções duplicadas do App Síndico original

---

## Notas

- Manter design premium do App Síndico
- Adaptar cores do Manutenção Universal para o padrão do App Síndico
- Preservar funcionalidades existentes que não serão substituídas
- Checkpoint de rollback: 0d92057d

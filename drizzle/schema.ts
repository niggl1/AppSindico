import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "sindico", "morador"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  apartment: varchar("apartment", { length: 20 }),
  // Campos para login local
  senha: varchar("senha", { length: 255 }),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  // Tipo de conta: sindico, administradora ou admin
  tipoConta: mysqlEnum("tipoConta", ["sindico", "administradora", "admin"]).default("sindico"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CONDOMINIOS ====================
export const condominios = mysqlTable("condominios", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 50 }),
  cnpj: varchar("cnpj", { length: 20 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 50 }),
  cep: varchar("cep", { length: 10 }),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  capaUrl: text("capaUrl"),
  corPrimaria: varchar("corPrimaria", { length: 20 }).default("#4F46E5"),
  corSecundaria: varchar("corSecundaria", { length: 20 }).default("#10B981"),
  cadastroToken: varchar("cadastroToken", { length: 32 }).unique(),
  assembleiaLink: text("assembleiaLink"),
  assembleiaData: timestamp("assembleiaData"),
  sindicoId: int("sindicoId").references(() => users.id),
  // Campos de cabeçalho/rodapé personalizados
  cabecalhoLogoUrl: text("cabecalhoLogoUrl"),
  cabecalhoNomeCondominio: varchar("cabecalhoNomeCondominio", { length: 255 }),
  cabecalhoNomeSindico: varchar("cabecalhoNomeSindico", { length: 255 }),
  rodapeTexto: text("rodapeTexto"),
  rodapeContato: varchar("rodapeContato", { length: 255 }),
  // Telefone de contato para mensagem de bloqueio
  telefoneContato: varchar("telefoneContato", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Condominio = typeof condominios.$inferSelect;
export type InsertCondominio = typeof condominios.$inferInsert;

// ==================== REVISTAS ====================
export const revistas = mysqlTable("revistas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: text("subtitulo"),
  edicao: varchar("edicao", { length: 50 }),
  capaUrl: text("capaUrl"),
  templateId: varchar("templateId", { length: 50 }).default("default"),
  status: mysqlEnum("status", ["rascunho", "publicada", "arquivada"]).default("rascunho").notNull(),
  publicadaEm: timestamp("publicadaEm"),
  visualizacoes: int("visualizacoes").default(0),
  shareLink: varchar("shareLink", { length: 100 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Revista = typeof revistas.$inferSelect;
export type InsertRevista = typeof revistas.$inferInsert;

// ==================== SECÇÕES DA REVISTA ====================
export const secoes = mysqlTable("secoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "mensagem_sindico",
    "avisos",
    "comunicados",
    "dicas_seguranca",
    "regras",
    "links_uteis",
    "telefones_uteis",
    "realizacoes",
    "antes_depois",
    "melhorias",
    "aquisicoes",
    "funcionarios",
    "agenda_eventos",
    "eventos",
    "achados_perdidos",
    "caronas",
    "vagas_estacionamento",
    "classificados",
    "votacoes",
    "publicidade"
  ]).notNull(),
  titulo: varchar("titulo", { length: 255 }),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Secao = typeof secoes.$inferSelect;
export type InsertSecao = typeof secoes.$inferInsert;

// ==================== MENSAGEM DO SÍNDICO ====================
export const mensagensSindico = mysqlTable("mensagens_sindico", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  fotoSindicoUrl: text("fotoSindicoUrl"),
  nomeSindico: varchar("nomeSindico", { length: 255 }),
  titulo: varchar("titulo", { length: 255 }),
  mensagem: text("mensagem"),
  assinatura: varchar("assinatura", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MensagemSindico = typeof mensagensSindico.$inferSelect;
export type InsertMensagemSindico = typeof mensagensSindico.$inferInsert;

// ==================== AVISOS ====================
export const avisos = mysqlTable("avisos", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo"),
  tipo: mysqlEnum("tipo", ["urgente", "importante", "informativo"]).default("informativo"),
  imagemUrl: text("imagemUrl"),
  destaque: boolean("destaque").default(false),
  dataExpiracao: timestamp("dataExpiracao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aviso = typeof avisos.$inferSelect;
export type InsertAviso = typeof avisos.$inferInsert;

// ==================== FUNCIONÁRIOS ====================
export const funcionarios = mysqlTable("funcionarios", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  fotoUrl: text("fotoUrl"),
  descricao: text("descricao"),
  dataAdmissao: timestamp("dataAdmissao"),
  ativo: boolean("ativo").default(true),
  // Tipo de funcionário para controle de acesso
  tipoFuncionario: mysqlEnum("tipoFuncionario", ["zelador", "porteiro", "supervisor", "gerente", "auxiliar", "sindico_externo"]).default("auxiliar"),
  // Campos de login
  loginEmail: varchar("loginEmail", { length: 255 }),
  senha: varchar("senha", { length: 255 }),
  loginAtivo: boolean("loginAtivo").default(false),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campos de recuperação de senha
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== HISTÓRICO DE ACESSOS DE FUNCIONÁRIOS ====================
export const funcionarioAcessos = mysqlTable("funcionario_acessos", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  dispositivo: varchar("dispositivo", { length: 100 }),
  navegador: varchar("navegador", { length: 100 }),
  sistemaOperacional: varchar("sistemaOperacional", { length: 100 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  cidade: varchar("cidade", { length: 100 }),
  regiao: varchar("regiao", { length: 100 }),
  pais: varchar("pais", { length: 100 }),
  tipoAcesso: mysqlEnum("tipoAcesso", ["login", "logout", "recuperacao_senha", "alteracao_senha"]).default("login"),
  sucesso: boolean("sucesso").default(true),
  motivoFalha: text("motivoFalha"),
});

export type FuncionarioAcesso = typeof funcionarioAcessos.$inferSelect;
export type InsertFuncionarioAcesso = typeof funcionarioAcessos.$inferInsert;

// ==================== FUNÇÕES DE FUNCIONÁRIOS ====================
export const funcionarioFuncoes = mysqlTable("funcionario_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  funcaoKey: varchar("funcaoKey", { length: 100 }).notNull(),
  habilitada: boolean("habilitada").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioFuncao = typeof funcionarioFuncoes.$inferSelect;
export type InsertFuncionarioFuncao = typeof funcionarioFuncoes.$inferInsert;

export type Funcionario = typeof funcionarios.$inferSelect;
export type InsertFuncionario = typeof funcionarios.$inferInsert;

// ==================== VÍNCULO FUNCIONÁRIO <-> CONDOMÍNIOS (MULTI-CONDOMÍNIO) ====================
export const funcionarioCondominios = mysqlTable("funcionario_condominios", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioCondominio = typeof funcionarioCondominios.$inferSelect;
export type InsertFuncionarioCondominio = typeof funcionarioCondominios.$inferInsert;

// ==================== VÍNCULO FUNCIONÁRIO <-> APPS ====================
export const funcionarioApps = mysqlTable("funcionario_apps", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  appId: int("appId").references(() => apps.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioApp = typeof funcionarioApps.$inferSelect;
export type InsertFuncionarioApp = typeof funcionarioApps.$inferInsert;

// ==================== EVENTOS ====================
export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataEvento: timestamp("dataEvento"),
  horaInicio: varchar("horaInicio", { length: 10 }),
  horaFim: varchar("horaFim", { length: 10 }),
  local: varchar("local", { length: 255 }),
  imagemUrl: text("imagemUrl"),
  tipo: mysqlEnum("tipo", ["agendado", "realizado"]).default("agendado"),
  nomeResponsavel: varchar("nomeResponsavel", { length: 255 }),
  whatsappResponsavel: varchar("whatsappResponsavel", { length: 20 }),
  lembreteAntecedencia: int("lembreteAntecedencia").default(1), // dias de antecedência para lembrete
  lembreteEnviado: boolean("lembreteEnviado").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

// ==================== ANTES E DEPOIS (OBRAS) ====================
export const antesDepois = mysqlTable("antes_depois", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fotoAntesUrl: text("fotoAntesUrl"),
  fotoDepoisUrl: text("fotoDepoisUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AntesDepois = typeof antesDepois.$inferSelect;
export type InsertAntesDepois = typeof antesDepois.$inferInsert;

// ==================== ACHADOS E PERDIDOS ====================
export const achadosPerdidos = mysqlTable("achados_perdidos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  tipo: mysqlEnum("tipo", ["achado", "perdido"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fotoUrl: text("fotoUrl"),
  localEncontrado: varchar("localEncontrado", { length: 255 }),
  dataOcorrencia: timestamp("dataOcorrencia"),
  status: mysqlEnum("status", ["aberto", "resolvido"]).default("aberto"),
  contato: varchar("contato", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AchadoPerdido = typeof achadosPerdidos.$inferSelect;
export type InsertAchadoPerdido = typeof achadosPerdidos.$inferInsert;

// ==================== CARONAS ====================
export const caronas = mysqlTable("caronas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  moradorId: int("moradorId").references(() => moradores.id),
  contato: varchar("contato", { length: 255 }),
  tipo: mysqlEnum("tipo", ["oferece", "procura"]).notNull(),
  origem: varchar("origem", { length: 255 }).notNull(),
  destino: varchar("destino", { length: 255 }).notNull(),
  dataCarona: timestamp("dataCarona"),
  horario: varchar("horario", { length: 10 }),
  vagasDisponiveis: int("vagasDisponiveis").default(1),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["ativa", "concluida", "cancelada"]).default("ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Carona = typeof caronas.$inferSelect;
export type InsertCarona = typeof caronas.$inferInsert;

// ==================== CLASSIFICADOS ====================
export const classificados = mysqlTable("classificados", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  moradorId: int("moradorId").references(() => moradores.id),
  tipo: mysqlEnum("tipo", ["produto", "servico"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  preco: varchar("preco", { length: 50 }),
  fotoUrl: text("fotoUrl"),
  contato: varchar("contato", { length: 255 }),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado", "vendido"]).default("pendente"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Classificado = typeof classificados.$inferSelect;
export type InsertClassificado = typeof classificados.$inferInsert;

// ==================== VOTAÇÕES ====================
export const votacoes = mysqlTable("votacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["funcionario_mes", "enquete", "decisao"]).notNull(),
  imagemUrl: text("imagemUrl"),
  arquivoUrl: text("arquivoUrl"),
  videoUrl: text("videoUrl"),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  status: mysqlEnum("status", ["ativa", "encerrada"]).default("ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Votacao = typeof votacoes.$inferSelect;
export type InsertVotacao = typeof votacoes.$inferInsert;

// ==================== OPÇÕES DE VOTAÇÃO ====================
export const opcoesVotacao = mysqlTable("opcoes_votacao", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  votos: int("votos").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OpcaoVotacao = typeof opcoesVotacao.$inferSelect;
export type InsertOpcaoVotacao = typeof opcoesVotacao.$inferInsert;

// ==================== VOTOS ====================
export const votos = mysqlTable("votos", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  opcaoId: int("opcaoId").references(() => opcoesVotacao.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Voto = typeof votos.$inferSelect;
export type InsertVoto = typeof votos.$inferInsert;

// ==================== VAGAS DE ESTACIONAMENTO ====================
export const vagasEstacionamento = mysqlTable("vagas_estacionamento", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  apartamento: varchar("apartamento", { length: 20 }),
  bloco: varchar("bloco", { length: 20 }),
  tipo: mysqlEnum("tipo", ["coberta", "descoberta", "moto"]).default("coberta"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VagaEstacionamento = typeof vagasEstacionamento.$inferSelect;
export type InsertVagaEstacionamento = typeof vagasEstacionamento.$inferInsert;

// ==================== LINKS ÚTEIS ====================
export const linksUteis = mysqlTable("links_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  url: text("url").notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LinkUtil = typeof linksUteis.$inferSelect;
export type InsertLinkUtil = typeof linksUteis.$inferInsert;

// ==================== TELEFONES ÚTEIS ====================
export const telefonesUteis = mysqlTable("telefones_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TelefoneUtil = typeof telefonesUteis.$inferSelect;
export type InsertTelefoneUtil = typeof telefonesUteis.$inferInsert;

// ==================== PUBLICIDADE ====================
export const publicidades = mysqlTable("publicidades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  anunciante: varchar("anunciante", { length: 255 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  linkUrl: text("linkUrl"),
  telefone: varchar("telefone", { length: 20 }),
  tipo: mysqlEnum("tipo", ["banner", "destaque", "lateral"]).default("banner"),
  ativo: boolean("ativo").default(true),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Publicidade = typeof publicidades.$inferSelect;
export type InsertPublicidade = typeof publicidades.$inferInsert;

// ==================== MORADORES DO CONDOMÍNIO ====================
export const moradores = mysqlTable("moradores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  bloco: varchar("bloco", { length: 20 }),
  andar: varchar("andar", { length: 10 }),
  tipo: mysqlEnum("tipo", ["proprietario", "inquilino", "familiar", "funcionario"]).default("proprietario"),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: timestamp("dataNascimento"),
  fotoUrl: text("fotoUrl"),
  observacoes: text("observacoes"),
  dataEntrada: timestamp("dataEntrada"),
  dataSaida: timestamp("dataSaida"),
  ativo: boolean("ativo").default(true),
  // Campos de autenticação do portal do morador
  senha: varchar("senha", { length: 255 }),
  loginToken: varchar("loginToken", { length: 64 }),
  loginTokenExpira: timestamp("loginTokenExpira"),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campo para bloqueio de votação
  bloqueadoVotacao: boolean("bloqueadoVotacao").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Morador = typeof moradores.$inferSelect;
export type InsertMorador = typeof moradores.$inferInsert;


// ==================== NOTIFICAÇÕES ====================
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id),
  tipo: mysqlEnum("tipo", ["aviso", "evento", "votacao", "classificado", "carona", "geral"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  link: varchar("link", { length: 500 }),
  referenciaId: int("referenciaId"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

// ==================== REALIZAÇÕES ====================
export const realizacoes = mysqlTable("realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Realizacao = typeof realizacoes.$inferSelect;
export type InsertRealizacao = typeof realizacoes.$inferInsert;

// ==================== MELHORIAS ====================
export const melhorias = mysqlTable("melhorias", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  custo: varchar("custo", { length: 50 }),
  dataImplementacao: timestamp("dataImplementacao"),
  status: mysqlEnum("status", ["planejada", "em_andamento", "concluida"]).default("planejada"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Melhoria = typeof melhorias.$inferSelect;
export type InsertMelhoria = typeof melhorias.$inferInsert;

// ==================== AQUISIÇÕES ====================
export const aquisicoes = mysqlTable("aquisicoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  valor: varchar("valor", { length: 50 }),
  fornecedor: varchar("fornecedor", { length: 255 }),
  dataAquisicao: timestamp("dataAquisicao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aquisicao = typeof aquisicoes.$inferSelect;
export type InsertAquisicao = typeof aquisicoes.$inferInsert;

// ==================== PREFERÊNCIAS DE NOTIFICAÇÃO ====================
export const preferenciasNotificacao = mysqlTable("preferencias_notificacao", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  avisos: boolean("avisos").default(true),
  eventos: boolean("eventos").default(true),
  votacoes: boolean("votacoes").default(true),
  classificados: boolean("classificados").default(true),
  caronas: boolean("caronas").default(true),
  emailNotificacoes: boolean("emailNotificacoes").default(false),
  efeitoTransicao: varchar("efeitoTransicao", { length: 50 }).default("slide"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreferenciaNotificacao = typeof preferenciasNotificacao.$inferSelect;
export type InsertPreferenciaNotificacao = typeof preferenciasNotificacao.$inferInsert;

// ==================== ANUNCIANTES ====================
export const anunciantes = mysqlTable("anunciantes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["comercio", "servicos", "profissionais", "alimentacao", "saude", "educacao", "outros"]).default("outros").notNull(),
  logoUrl: text("logoUrl"),
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  endereco: text("endereco"),
  instagram: varchar("instagram", { length: 100 }),
  facebook: varchar("facebook", { length: 100 }),
  horarioFuncionamento: text("horarioFuncionamento"),
  status: mysqlEnum("statusAnunciante", ["ativo", "inativo"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Anunciante = typeof anunciantes.$inferSelect;
export type InsertAnunciante = typeof anunciantes.$inferInsert;

// ==================== ANÚNCIOS ====================
export const anuncios = mysqlTable("anuncios", {
  id: int("id").autoincrement().primaryKey(),
  anuncianteId: int("anuncianteId").references(() => anunciantes.id).notNull(),
  revistaId: int("revistaId").references(() => revistas.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  bannerUrl: text("bannerUrl"),
  linkDestino: text("linkDestino"),
  posicao: mysqlEnum("posicao", ["capa", "contracapa", "pagina_interna", "rodape", "lateral"]).default("pagina_interna").notNull(),
  tamanho: mysqlEnum("tamanho", ["pequeno", "medio", "grande", "pagina_inteira"]).default("medio").notNull(),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  status: mysqlEnum("statusAnuncio", ["ativo", "pausado", "expirado", "pendente"]).default("pendente").notNull(),
  visualizacoes: int("visualizacoes").default(0),
  cliques: int("cliques").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Anuncio = typeof anuncios.$inferSelect;
export type InsertAnuncio = typeof anuncios.$inferInsert;


// ==================== COMUNICADOS ====================
export const comunicados = mysqlTable("comunicados", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  anexoUrl: text("anexoUrl"),
  anexoNome: varchar("anexoNome", { length: 255 }),
  anexoTipo: varchar("anexoTipo", { length: 100 }),
  anexoTamanho: int("anexoTamanho"),
  dataPublicacao: timestamp("dataPublicacao").defaultNow(),
  destaque: boolean("destaque").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comunicado = typeof comunicados.$inferSelect;
export type InsertComunicado = typeof comunicados.$inferInsert;


// ==================== ÁLBUNS DE FOTOS ====================
export const albuns = mysqlTable("albuns", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["eventos", "obras", "areas_comuns", "melhorias", "outros"]).default("outros").notNull(),
  capaUrl: text("capaUrl"),
  dataEvento: timestamp("dataEvento"),
  destaque: boolean("destaque").default(false),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Album = typeof albuns.$inferSelect;
export type InsertAlbum = typeof albuns.$inferInsert;

// ==================== FOTOS DOS ÁLBUNS ====================
export const fotos = mysqlTable("fotos", {
  id: int("id").autoincrement().primaryKey(),
  albumId: int("albumId").references(() => albuns.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 500 }),
  ordem: int("ordem").default(0),
  largura: int("largura"),
  altura: int("altura"),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Foto = typeof fotos.$inferSelect;
export type InsertFoto = typeof fotos.$inferInsert;


// ==================== DICAS DE SEGURANÇA ====================
export const dicasSeguranca = mysqlTable("dicas_seguranca", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", [
    "geral",
    "incendio",
    "roubo",
    "criancas",
    "idosos",
    "digital",
    "veiculos"
  ]).default("geral"),
  icone: varchar("icone", { length: 50 }).default("shield"),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DicaSeguranca = typeof dicasSeguranca.$inferSelect;
export type InsertDicaSeguranca = typeof dicasSeguranca.$inferInsert;

// ==================== REGRAS E NORMAS ====================
export const regrasNormas = mysqlTable("regras_normas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", [
    "geral",
    "convivencia",
    "areas_comuns",
    "animais",
    "barulho",
    "estacionamento",
    "mudancas",
    "obras",
    "piscina",
    "salao_festas"
  ]).default("geral"),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegraNorma = typeof regrasNormas.$inferSelect;
export type InsertRegraNorma = typeof regrasNormas.$inferInsert;

// ==================== IMAGENS DE REALIZAÇÕES ====================
export const imagensRealizacoes = mysqlTable("imagens_realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  realizacaoId: int("realizacaoId").references(() => realizacoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemRealizacao = typeof imagensRealizacoes.$inferSelect;
export type InsertImagemRealizacao = typeof imagensRealizacoes.$inferInsert;

// ==================== IMAGENS DE MELHORIAS ====================
export const imagensMelhorias = mysqlTable("imagens_melhorias", {
  id: int("id").autoincrement().primaryKey(),
  melhoriaId: int("melhoriaId").references(() => melhorias.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemMelhoria = typeof imagensMelhorias.$inferSelect;
export type InsertImagemMelhoria = typeof imagensMelhorias.$inferInsert;

// ==================== IMAGENS DE AQUISIÇÕES ====================
export const imagensAquisicoes = mysqlTable("imagens_aquisicoes", {
  id: int("id").autoincrement().primaryKey(),
  aquisicaoId: int("aquisicaoId").references(() => aquisicoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemAquisicao = typeof imagensAquisicoes.$inferSelect;
export type InsertImagemAquisicao = typeof imagensAquisicoes.$inferInsert;

// ==================== IMAGENS DE ACHADOS E PERDIDOS ====================
export const imagensAchadosPerdidos = mysqlTable("imagens_achados_perdidos", {
  id: int("id").autoincrement().primaryKey(),
  achadoPerdidoId: int("achadoPerdidoId").references(() => achadosPerdidos.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemAchadoPerdido = typeof imagensAchadosPerdidos.$inferSelect;
export type InsertImagemAchadoPerdido = typeof imagensAchadosPerdidos.$inferInsert;

// ==================== IMAGENS E ANEXOS DE VAGAS ====================
export const imagensVagas = mysqlTable("imagens_vagas", {
  id: int("id").autoincrement().primaryKey(),
  vagaId: int("vagaId").references(() => vagasEstacionamento.id).notNull(),
  tipo: mysqlEnum("tipo", ["imagem", "anexo"]).default("imagem"),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemVaga = typeof imagensVagas.$inferSelect;
export type InsertImagemVaga = typeof imagensVagas.$inferInsert;

// ==================== FAVORITOS ====================
export const favoritos = mysqlTable("favoritos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id),
  tipoItem: mysqlEnum("tipoItem", [
    "aviso",
    "comunicado",
    "evento",
    "realizacao",
    "melhoria",
    "aquisicao",
    "votacao",
    "classificado",
    "carona",
    "achado_perdido",
    "funcionario",
    "galeria",
    "card_secao"
  ]).notNull(),
  itemId: int("itemId"),
  cardSecaoId: varchar("cardSecaoId", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorito = typeof favoritos.$inferSelect;
export type InsertFavorito = typeof favoritos.$inferInsert;


// ==================== VISTORIAS ====================
export const vistorias = mysqlTable("vistorias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  tipo: varchar("tipo", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vistoria = typeof vistorias.$inferSelect;
export type InsertVistoria = typeof vistorias.$inferInsert;

// ==================== IMAGENS DE VISTORIAS ====================
export const vistoriaImagens = mysqlTable("vistoria_imagens", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VistoriaImagem = typeof vistoriaImagens.$inferSelect;
export type InsertVistoriaImagem = typeof vistoriaImagens.$inferInsert;

// ==================== TIMELINE DE VISTORIAS ====================
export const vistoriaTimeline = mysqlTable("vistoria_timeline", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VistoriaTimelineEvento = typeof vistoriaTimeline.$inferSelect;
export type InsertVistoriaTimelineEvento = typeof vistoriaTimeline.$inferInsert;

// ==================== MANUTENÇÕES ====================
export const manutencoes = mysqlTable("manutencoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  tipo: mysqlEnum("tipo", ["preventiva", "corretiva", "emergencial", "programada"]).default("corretiva"),
  tempoEstimadoDias: int("tempoEstimadoDias").default(0),
  tempoEstimadoHoras: int("tempoEstimadoHoras").default(0),
  tempoEstimadoMinutos: int("tempoEstimadoMinutos").default(0),
  fornecedor: varchar("fornecedor", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manutencao = typeof manutencoes.$inferSelect;
export type InsertManutencao = typeof manutencoes.$inferInsert;

// ==================== IMAGENS DE MANUTENÇÕES ====================
export const manutencaoImagens = mysqlTable("manutencao_imagens", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManutencaoImagem = typeof manutencaoImagens.$inferSelect;
export type InsertManutencaoImagem = typeof manutencaoImagens.$inferInsert;

// ==================== TIMELINE DE MANUTENÇÕES ====================
export const manutencaoTimeline = mysqlTable("manutencao_timeline", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManutencaoTimelineEvento = typeof manutencaoTimeline.$inferSelect;
export type InsertManutencaoTimelineEvento = typeof manutencaoTimeline.$inferInsert;

// ==================== OCORRÊNCIAS ====================
export const ocorrencias = mysqlTable("ocorrencias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  reportadoPorId: int("reportadoPorId").references(() => users.id),
  reportadoPorNome: varchar("reportadoPorNome", { length: 255 }),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataOcorrencia: timestamp("dataOcorrencia"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  categoria: mysqlEnum("categoria", ["seguranca", "barulho", "manutencao", "convivencia", "animais", "estacionamento", "limpeza", "outros"]).default("outros"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ocorrencia = typeof ocorrencias.$inferSelect;
export type InsertOcorrencia = typeof ocorrencias.$inferInsert;

// ==================== IMAGENS DE OCORRÊNCIAS ====================
export const ocorrenciaImagens = mysqlTable("ocorrencia_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OcorrenciaImagem = typeof ocorrenciaImagens.$inferSelect;
export type InsertOcorrenciaImagem = typeof ocorrenciaImagens.$inferInsert;

// ==================== TIMELINE DE OCORRÊNCIAS ====================
export const ocorrenciaTimeline = mysqlTable("ocorrencia_timeline", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OcorrenciaTimelineEvento = typeof ocorrenciaTimeline.$inferSelect;
export type InsertOcorrenciaTimelineEvento = typeof ocorrenciaTimeline.$inferInsert;

// ==================== CHECKLISTS ====================
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  categoria: varchar("categoria", { length: 100 }),
  totalItens: int("totalItens").default(0),
  itensCompletos: int("itensCompletos").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

// ==================== ITENS DO CHECKLIST ====================
export const checklistItens = mysqlTable("checklist_itens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  completo: boolean("completo").default(false),
  observacao: text("observacao"),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItens.$inferSelect;
export type InsertChecklistItem = typeof checklistItens.$inferInsert;

// ==================== IMAGENS DE CHECKLISTS ====================
export const checklistImagens = mysqlTable("checklist_imagens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistImagem = typeof checklistImagens.$inferSelect;
export type InsertChecklistImagem = typeof checklistImagens.$inferInsert;

// ==================== TIMELINE DE CHECKLISTS ====================
export const checklistTimeline = mysqlTable("checklist_timeline", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "item_completo", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTimelineEvento = typeof checklistTimeline.$inferSelect;
export type InsertChecklistTimelineEvento = typeof checklistTimeline.$inferInsert;


// ==================== MEMBROS DA EQUIPE ====================
export const membrosEquipe = mysqlTable("membros_equipe", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  descricao: text("descricao"),
  cargo: varchar("cargo", { length: 100 }),
  fotoUrl: text("fotoUrl"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembroEquipe = typeof membrosEquipe.$inferSelect;
export type InsertMembroEquipe = typeof membrosEquipe.$inferInsert;

// ==================== LINKS COMPARTILHÁVEIS ====================
export const linksCompartilhaveis = mysqlTable("links_compartilhaveis", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["vistoria", "manutencao", "ocorrencia", "checklist"]).notNull(),
  itemId: int("itemId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  editavel: boolean("editavel").default(false).notNull(),
  expiracaoHoras: int("expiracaoHoras").default(168), // 7 dias por padrão
  acessos: int("acessos").default(0).notNull(),
  criadoPorId: int("criadoPorId").references(() => users.id),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkCompartilhavel = typeof linksCompartilhaveis.$inferSelect;
export type InsertLinkCompartilhavel = typeof linksCompartilhaveis.$inferInsert;

// ==================== HISTÓRICO DE COMPARTILHAMENTOS ====================
export const historicoCompartilhamentos = mysqlTable("historico_compartilhamentos", {
  id: int("id").autoincrement().primaryKey(),
  linkId: int("linkId").references(() => linksCompartilhaveis.id).notNull(),
  membroId: int("membroId").references(() => membrosEquipe.id),
  membroNome: varchar("membroNome", { length: 255 }),
  membroWhatsapp: varchar("membroWhatsapp", { length: 20 }),
  compartilhadoPorId: int("compartilhadoPorId").references(() => users.id),
  compartilhadoPorNome: varchar("compartilhadoPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoCompartilhamento = typeof historicoCompartilhamentos.$inferSelect;
export type InsertHistoricoCompartilhamento = typeof historicoCompartilhamentos.$inferInsert;


// ==================== COMENTÁRIOS EM ITENS PARTILHADOS ====================
export const comentariosItem = mysqlTable("comentarios_item", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  itemTipo: mysqlEnum("itemTipo", ["vistoria", "manutencao", "ocorrencia", "checklist"]).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  autorId: int("autorId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorWhatsapp: varchar("autorWhatsapp", { length: 20 }),
  autorEmail: varchar("autorEmail", { length: 320 }),
  autorFoto: text("autorFoto"),
  texto: text("texto").notNull(),
  isInterno: boolean("isInterno").default(false).notNull(),
  lido: boolean("lido").default(false).notNull(),
  lidoPorId: int("lidoPorId").references(() => users.id),
  lidoEm: timestamp("lidoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComentarioItem = typeof comentariosItem.$inferSelect;
export type InsertComentarioItem = typeof comentariosItem.$inferInsert;

// ==================== ANEXOS DE COMENTÁRIOS ====================
export const anexosComentario = mysqlTable("anexos_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnexoComentario = typeof anexosComentario.$inferSelect;
export type InsertAnexoComentario = typeof anexosComentario.$inferInsert;

// ==================== RESPOSTAS A COMENTÁRIOS ====================
export const respostasComentario = mysqlTable("respostas_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  autorId: int("autorId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorFoto: text("autorFoto"),
  texto: text("texto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RespostaComentario = typeof respostasComentario.$inferSelect;
export type InsertRespostaComentario = typeof respostasComentario.$inferInsert;


// ==================== DESTAQUES ====================
export const destaques = mysqlTable("destaques", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  link: text("link"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  videoUrl: text("videoUrl"),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destaque = typeof destaques.$inferSelect;
export type InsertDestaque = typeof destaques.$inferInsert;

// ==================== IMAGENS DE DESTAQUES ====================
export const imagensDestaques = mysqlTable("imagens_destaques", {
  id: int("id").autoincrement().primaryKey(),
  destaqueId: int("destaqueId").references(() => destaques.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemDestaque = typeof imagensDestaques.$inferSelect;
export type InsertImagemDestaque = typeof imagensDestaques.$inferInsert;


// ==================== PÁGINA 100% PERSONALIZADA ====================
export const paginasCustom = mysqlTable("paginas_custom", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  link: text("link"),
  videoUrl: text("videoUrl"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  imagens: json("imagens").$type<Array<{url: string, legenda?: string}>>(),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaginaCustom = typeof paginasCustom.$inferSelect;
export type InsertPaginaCustom = typeof paginasCustom.$inferInsert;

// ==================== IMAGENS DE PÁGINAS PERSONALIZADAS ====================
export const imagensCustom = mysqlTable("imagens_custom", {
  id: int("id").autoincrement().primaryKey(),
  paginaId: int("paginaId").references(() => paginasCustom.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemCustom = typeof imagensCustom.$inferSelect;
export type InsertImagemCustom = typeof imagensCustom.$inferInsert;


// ==================== AGENDA DE VENCIMENTOS ====================
export const vencimentos = mysqlTable("vencimentos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["contrato", "servico", "manutencao"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fornecedor: varchar("fornecedor", { length: 255 }),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  dataInicio: timestamp("dataInicio"),
  dataVencimento: timestamp("dataVencimento").notNull(),
  ultimaRealizacao: timestamp("ultimaRealizacao"),
  proximaRealizacao: timestamp("proximaRealizacao"),
  periodicidade: mysqlEnum("periodicidade", ["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"]).default("unico"),
  status: mysqlEnum("status", ["ativo", "vencido", "renovado", "cancelado"]).default("ativo").notNull(),
  observacoes: text("observacoes"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vencimento = typeof vencimentos.$inferSelect;
export type InsertVencimento = typeof vencimentos.$inferInsert;

// ==================== CONFIGURAÇÃO DE ALERTAS DE VENCIMENTOS ====================
export const vencimentoAlertas = mysqlTable("vencimento_alertas", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  tipoAlerta: mysqlEnum("tipoAlerta", ["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"]).notNull(),
  ativo: boolean("ativo").default(true),
  enviado: boolean("enviado").default(false),
  dataEnvio: timestamp("dataEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoAlerta = typeof vencimentoAlertas.$inferSelect;
export type InsertVencimentoAlerta = typeof vencimentoAlertas.$inferInsert;

// ==================== E-MAILS PARA NOTIFICAÇÃO DE VENCIMENTOS ====================
export const vencimentoEmails = mysqlTable("vencimento_emails", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  nome: varchar("nome", { length: 255 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoEmail = typeof vencimentoEmails.$inferSelect;
export type InsertVencimentoEmail = typeof vencimentoEmails.$inferInsert;

// ==================== HISTÓRICO DE NOTIFICAÇÕES ENVIADAS ====================
export const vencimentoNotificacoes = mysqlTable("vencimento_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  alertaId: int("alertaId").references(() => vencimentoAlertas.id),
  emailDestinatario: varchar("emailDestinatario", { length: 320 }).notNull(),
  assunto: varchar("assunto", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  status: mysqlEnum("status", ["enviado", "erro", "pendente"]).default("pendente").notNull(),
  erroMensagem: text("erroMensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoNotificacao = typeof vencimentoNotificacoes.$inferSelect;
export type InsertVencimentoNotificacao = typeof vencimentoNotificacoes.$inferInsert;


// ==================== PUSH SUBSCRIPTIONS (Web Push Notifications) ====================
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  moradorId: int("moradorId").references(() => moradores.id),
  userId: int("userId").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ==================== LEMBRETES AGENDADOS ====================
export const lembretes = mysqlTable("lembretes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["assembleia", "vencimento", "evento", "manutencao", "custom"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  dataAgendada: timestamp("dataAgendada").notNull(),
  antecedenciaHoras: int("antecedenciaHoras").default(24),
  enviado: boolean("enviado").default(false),
  enviadoEm: timestamp("enviadoEm"),
  referenciaId: int("referenciaId"),
  referenciaTipo: varchar("referenciaTipo", { length: 50 }),
  canais: json("canais").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lembrete = typeof lembretes.$inferSelect;
export type InsertLembrete = typeof lembretes.$inferInsert;

// ==================== HISTÓRICO DE NOTIFICAÇÕES ENVIADAS ====================
export const historicoNotificacoes = mysqlTable("historico_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["push", "email", "whatsapp", "sistema"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  destinatarios: int("destinatarios").default(0),
  sucessos: int("sucessos").default(0),
  falhas: int("falhas").default(0),
  lembreteId: int("lembreteId").references(() => lembretes.id),
  enviadoPor: int("enviadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoNotificacao = typeof historicoNotificacoes.$inferSelect;
export type InsertHistoricoNotificacao = typeof historicoNotificacoes.$inferInsert;

// ==================== CONFIGURAÇÕES DE EMAIL ====================
export const configuracoesEmail = mysqlTable("configuracoes_email", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  provedor: mysqlEnum("provedor", ["resend", "sendgrid", "mailgun", "smtp"]).default("resend"),
  apiKey: text("apiKey"),
  emailRemetente: varchar("emailRemetente", { length: 255 }),
  nomeRemetente: varchar("nomeRemetente", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoEmail = typeof configuracoesEmail.$inferSelect;
export type InsertConfiguracaoEmail = typeof configuracoesEmail.$inferInsert;

// ==================== CONFIGURAÇÕES PUSH (VAPID) ====================
export const configuracoesPush = mysqlTable("configuracoes_push", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  vapidPublicKey: text("vapidPublicKey"),
  vapidPrivateKey: text("vapidPrivateKey"),
  vapidSubject: varchar("vapidSubject", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoPush = typeof configuracoesPush.$inferSelect;
export type InsertConfiguracaoPush = typeof configuracoesPush.$inferInsert;

// ==================== TEMPLATES DE NOTIFICAÇÃO ====================
export const templatesNotificacao = mysqlTable("templates_notificacao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  mensagem: text("mensagem").notNull(),
  categoria: mysqlEnum("categoria", ['assembleia', 'manutencao', 'vencimento', 'aviso', 'evento', 'custom']).default('custom'),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  urlDestino: varchar("urlDestino", { length: 255 }),
  ativo: boolean("ativo").default(true),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateNotificacao = typeof templatesNotificacao.$inferSelect;
export type InsertTemplateNotificacao = typeof templatesNotificacao.$inferInsert;


// ==================== TIPOS DE INFRAÇÃO ====================
export const tiposInfracao = mysqlTable("tipos_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricaoPadrao: text("descricaoPadrao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TipoInfracao = typeof tiposInfracao.$inferSelect;
export type InsertTipoInfracao = typeof tiposInfracao.$inferInsert;

// ==================== NOTIFICAÇÕES DE INFRAÇÃO ====================
export const notificacoesInfracao = mysqlTable("notificacoes_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  moradorId: int("moradorId").references(() => moradores.id).notNull(),
  tipoInfracaoId: int("tipoInfracaoId").references(() => tiposInfracao.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  imagens: json("imagens").$type<string[]>(),
  status: mysqlEnum("status", ['pendente', 'respondida', 'resolvida', 'arquivada']).default('pendente'),
  dataOcorrencia: timestamp("dataOcorrencia"),
  pdfUrl: text("pdfUrl"),
  linkPublico: varchar("linkPublico", { length: 64 }).notNull(),
  enviadoWhatsapp: boolean("enviadoWhatsapp").default(false),
  enviadoEmail: boolean("enviadoEmail").default(false),
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificacaoInfracao = typeof notificacoesInfracao.$inferSelect;
export type InsertNotificacaoInfracao = typeof notificacoesInfracao.$inferInsert;

// ==================== RESPOSTAS DE INFRAÇÃO (TIMELINE/CHAT) ====================
export const respostasInfracao = mysqlTable("respostas_infracao", {
  id: int("id").autoincrement().primaryKey(),
  notificacaoId: int("notificacaoId").references(() => notificacoesInfracao.id).notNull(),
  autorTipo: mysqlEnum("autorTipo", ['sindico', 'morador']).notNull(),
  autorId: int("autorId"),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  imagens: json("imagens").$type<string[]>(),
  lidaPeloSindico: boolean("lidaPeloSindico").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RespostaInfracao = typeof respostasInfracao.$inferSelect;
export type InsertRespostaInfracao = typeof respostasInfracao.$inferInsert;


// ==================== FUNÇÕES HABILITADAS POR CONDOMÍNIO ====================
export const condominioFuncoes = mysqlTable("condominio_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 50 }).notNull(),
  habilitada: boolean("habilitada").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CondominioFuncao = typeof condominioFuncoes.$inferSelect;
export type InsertCondominioFuncao = typeof condominioFuncoes.$inferInsert;

// Lista de todas as funções disponíveis no sistema
export const FUNCOES_DISPONIVEIS = [
  // Comunicação
  { id: "avisos", nome: "Avisos", categoria: "comunicacao", descricao: "Publicar avisos e comunicados", icone: "Megaphone", rota: "/dashboard/avisos" },
  { id: "comunicados", nome: "Comunicados", categoria: "comunicacao", descricao: "Enviar comunicados oficiais", icone: "FileText", rota: "/dashboard/comunicados" },
  { id: "notificacoes", nome: "Notificações", categoria: "comunicacao", descricao: "Sistema de notificações", icone: "Bell", rota: "/dashboard/notificacoes" },
  { id: "notificar-morador", nome: "Notificar Morador", categoria: "comunicacao", descricao: "Notificar moradores individualmente", icone: "UserCheck", rota: "/dashboard/notificar-morador" },
  
  // Agenda
  { id: "eventos", nome: "Eventos", categoria: "agenda", descricao: "Gestão de eventos do condomínio", icone: "Calendar", rota: "/dashboard/eventos" },
  { id: "agenda-vencimentos", nome: "Agenda de Vencimentos", categoria: "agenda", descricao: "Controle de vencimentos", icone: "CalendarClock", rota: "/dashboard/agenda-vencimentos" },
  { id: "reservas", nome: "Reservas", categoria: "agenda", descricao: "Reserva de áreas comuns", icone: "CalendarCheck", rota: "/dashboard/reservas" },
  
  // Operacional (Portal de Manutenções)
  { id: "portal-manutencoes", nome: "Portal de Manutenções", categoria: "operacional", descricao: "Hub central de operações", icone: "Wrench", rota: "/modulo/manutencoes" },
  { id: "vistorias", nome: "Vistorias", categoria: "operacional", descricao: "Registro de vistorias", icone: "Eye", rota: "/dashboard/vistorias" },
  { id: "manutencoes", nome: "Manutenções", categoria: "operacional", descricao: "Controle de manutenções", icone: "Tool", rota: "/dashboard/manutencoes" },
  { id: "ocorrencias", nome: "Ocorrências", categoria: "operacional", descricao: "Registro de ocorrências", icone: "AlertTriangle", rota: "/dashboard/ocorrencias" },
  { id: "checklists", nome: "Checklists", categoria: "operacional", descricao: "Listas de verificação", icone: "ClipboardCheck", rota: "/dashboard/checklists" },
  { id: "antes-depois", nome: "Antes e Depois", categoria: "operacional", descricao: "Registro de melhorias", icone: "ArrowLeftRight", rota: "/dashboard/antes-depois" },
  { id: "ordens-servico", nome: "Ordens de Serviço", categoria: "operacional", descricao: "Gestão de ordens de serviço", icone: "FileText", rota: "/dashboard/ordens-servico" },
  { id: "registro-rapido", nome: "Registro Rápido", categoria: "operacional", descricao: "Registro simplificado com foto e GPS", icone: "Zap", rota: "/dashboard/tarefas-facil" },
  { id: "timeline", nome: "Timeline", categoria: "operacional", descricao: "Visualização cronológica", icone: "Clock", rota: "/dashboard/timeline" },
  { id: "equipe-operacional", nome: "Gestão de Equipes", categoria: "operacional", descricao: "Membros e funcionários", icone: "Users", rota: "/dashboard/membros-equipe" },
  
  // Interativo
  { id: "votacoes", nome: "Votações", categoria: "interativo", descricao: "Sistema de votações", icone: "Vote", rota: "/dashboard/votacoes" },
  { id: "classificados", nome: "Classificados", categoria: "interativo", descricao: "Classificados dos moradores", icone: "ShoppingBag", rota: "/dashboard/classificados" },
  { id: "achados-perdidos", nome: "Achados e Perdidos", categoria: "interativo", descricao: "Itens perdidos e encontrados", icone: "Search", rota: "/dashboard/achados-perdidos" },
  { id: "caronas", nome: "Caronas", categoria: "interativo", descricao: "Sistema de caronas", icone: "Car", rota: "/dashboard/caronas" },
  
  // Documentação
  { id: "regras", nome: "Regras e Normas", categoria: "documentacao", descricao: "Regras do condomínio", icone: "BookOpen", rota: "/dashboard/regras" },
  { id: "dicas-seguranca", nome: "Dicas de Segurança", categoria: "documentacao", descricao: "Dicas de segurança", icone: "Shield", rota: "/dashboard/dicas-seguranca" },
  { id: "links-uteis", nome: "Links Úteis", categoria: "documentacao", descricao: "Links importantes", icone: "Link", rota: "/dashboard/links-uteis" },
  { id: "telefones-uteis", nome: "Telefones Úteis", categoria: "documentacao", descricao: "Telefones de emergência", icone: "Phone", rota: "/dashboard/telefones-uteis" },
  
  // Mídia
  { id: "galeria", nome: "Galeria de Fotos", categoria: "midia", descricao: "Fotos do condomínio", icone: "Image", rota: "/dashboard/galeria" },
  { id: "realizacoes", nome: "Realizações", categoria: "midia", descricao: "Realizações da gestão", icone: "Trophy", rota: "/dashboard/realizacoes" },
  { id: "melhorias", nome: "Melhorias", categoria: "midia", descricao: "Melhorias realizadas", icone: "TrendingUp", rota: "/dashboard/melhorias" },
  { id: "aquisicoes", nome: "Aquisições", categoria: "midia", descricao: "Novas aquisições", icone: "Package", rota: "/dashboard/aquisicoes" },
  
  // Publicidade
  { id: "publicidade", nome: "Publicidade", categoria: "publicidade", descricao: "Gestão de anunciantes", icone: "Megaphone", rota: "/dashboard/publicidade" },
  
  // Projetos
  { id: "revistas", nome: "Meus Projetos", categoria: "projetos", descricao: "Apps, revistas e relatórios", icone: "FolderOpen", rota: "/dashboard/revistas" },
  
  // Gestão
  { id: "moradores", nome: "Moradores", categoria: "gestao", descricao: "Gestão de moradores", icone: "Users", rota: "/dashboard/moradores" },
  { id: "funcionarios", nome: "Funcionários", categoria: "gestao", descricao: "Gestão de funcionários", icone: "UserCog", rota: "/dashboard/funcionarios" },
  { id: "vagas", nome: "Vagas de Estacionamento", categoria: "gestao", descricao: "Gestão de vagas", icone: "ParkingCircle", rota: "/dashboard/vagas" },
  { id: "equipe", nome: "Equipe de Gestão", categoria: "gestao", descricao: "Membros da equipe", icone: "UserPlus", rota: "/dashboard/equipe" },
  
  // Relatórios
  { id: "painel-controlo", nome: "Painel de Controlo", categoria: "relatorios", descricao: "Estatísticas e gráficos", icone: "BarChart3", rota: "/dashboard" },
  { id: "relatorios", nome: "Relatórios", categoria: "relatorios", descricao: "Relatórios detalhados", icone: "FileBarChart", rota: "/dashboard/relatorios" },
] as const;

// Categorias de funções
export const CATEGORIAS_FUNCOES = [
  { id: "comunicacao", nome: "Comunicação", icone: "MessageSquare", cor: "from-blue-500 to-blue-600" },
  { id: "agenda", nome: "Agenda", icone: "Calendar", cor: "from-purple-500 to-purple-600" },
  { id: "operacional", nome: "Operacional", icone: "Wrench", cor: "from-orange-500 to-orange-600" },
  { id: "interativo", nome: "Interativo", icone: "Users", cor: "from-green-500 to-green-600" },
  { id: "documentacao", nome: "Documentação", icone: "BookOpen", cor: "from-amber-500 to-amber-600" },
  { id: "midia", nome: "Mídia", icone: "Image", cor: "from-pink-500 to-pink-600" },
  { id: "publicidade", nome: "Publicidade", icone: "Megaphone", cor: "from-red-500 to-red-600" },
  { id: "projetos", nome: "Projetos", icone: "FolderOpen", cor: "from-indigo-500 to-indigo-600" },
  { id: "gestao", nome: "Gestão", icone: "Settings", cor: "from-slate-500 to-slate-600" },
  { id: "relatorios", nome: "Relatórios", icone: "BarChart3", cor: "from-cyan-500 to-cyan-600" },
] as const;

export type FuncaoId = typeof FUNCOES_DISPONIVEIS[number]["id"];


// ==================== APPS PERSONALIZADOS ====================
export const apps = mysqlTable("apps", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  logoUrl: text("logoUrl"),
  corPrimaria: varchar("corPrimaria", { length: 20 }).default("#4F46E5"),
  corSecundaria: varchar("corSecundaria", { length: 20 }).default("#10B981"),
  shareLink: varchar("shareLink", { length: 50 }).unique(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type App = typeof apps.$inferSelect;
export type InsertApp = typeof apps.$inferInsert;

// ==================== MÓDULOS DO APP ====================
export const appModulos = mysqlTable("app_modulos", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  moduloKey: varchar("moduloKey", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  bgCor: varchar("bgCor", { length: 20 }),
  ordem: int("ordem").default(0),
  habilitado: boolean("habilitado").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppModulo = typeof appModulos.$inferSelect;
export type InsertAppModulo = typeof appModulos.$inferInsert;


// ==================== TEMPLATES DE CHECKLIST ====================
export const checklistTemplates = mysqlTable("checklist_templates", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type InsertChecklistTemplate = typeof checklistTemplates.$inferInsert;

// ==================== ITENS DE TEMPLATES DE CHECKLIST ====================
export const checklistTemplateItens = mysqlTable("checklist_template_itens", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").references(() => checklistTemplates.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTemplateItem = typeof checklistTemplateItens.$inferSelect;
export type InsertChecklistTemplateItem = typeof checklistTemplateItens.$inferInsert;


// ==================== VALORES SALVOS (Responsáveis, Categorias, Tipos, Fornecedores) ====================
export const valoresSalvos = mysqlTable("valores_salvos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "responsavel",
    "categoria_vistoria",
    "categoria_manutencao", 
    "categoria_checklist",
    "categoria_ocorrencia",
    "tipo_vistoria",
    "tipo_manutencao",
    "tipo_checklist",
    "tipo_ocorrencia",
    "fornecedor",
    "localizacao"
  ]).notNull(),
  valor: varchar("valor", { length: 255 }).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ValorSalvo = typeof valoresSalvos.$inferSelect;
export type InsertValorSalvo = typeof valoresSalvos.$inferInsert;


// ==================== ORDENS DE SERVIÇO ====================

// Categorias de OS (personalizáveis)
export const osCategorias = mysqlTable("os_categorias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsCategoria = typeof osCategorias.$inferSelect;
export type InsertOsCategoria = typeof osCategorias.$inferInsert;

// Prioridades de OS (personalizáveis)
export const osPrioridades = mysqlTable("os_prioridades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  nivel: int("nivel").default(1), // 1=baixa, 2=normal, 3=alta, 4=urgente
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsPrioridade = typeof osPrioridades.$inferSelect;
export type InsertOsPrioridade = typeof osPrioridades.$inferInsert;

// Status de OS (personalizáveis)
export const osStatus = mysqlTable("os_status", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  isFinal: boolean("isFinal").default(false), // Se é status final (concluída/cancelada)
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsStatus = typeof osStatus.$inferSelect;
export type InsertOsStatus = typeof osStatus.$inferInsert;

// Setores de OS (personalizáveis)
export const osSetores = mysqlTable("os_setores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsSetor = typeof osSetores.$inferSelect;
export type InsertOsSetor = typeof osSetores.$inferInsert;

// Configurações de OS por condomínio
export const osConfiguracoes = mysqlTable("os_configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  habilitarOrcamentos: boolean("habilitarOrcamentos").default(true),
  habilitarAprovacaoOrcamento: boolean("habilitarAprovacaoOrcamento").default(true),
  habilitarGestaoFinanceira: boolean("habilitarGestaoFinanceira").default(true),
  habilitarRelatoriosGastos: boolean("habilitarRelatoriosGastos").default(true),
  habilitarVinculoManutencao: boolean("habilitarVinculoManutencao").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsConfiguracao = typeof osConfiguracoes.$inferSelect;
export type InsertOsConfiguracao = typeof osConfiguracoes.$inferInsert;

// Tabela principal de Ordens de Serviço
export const ordensServico = mysqlTable("ordens_servico", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 10 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Relacionamentos com tabelas personalizáveis
  categoriaId: int("categoriaId").references(() => osCategorias.id),
  prioridadeId: int("prioridadeId").references(() => osPrioridades.id),
  statusId: int("statusId").references(() => osStatus.id),
  setorId: int("setorId").references(() => osSetores.id),
  
  // Localização
  endereco: text("endereco"),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  localizacaoDescricao: varchar("localizacaoDescricao", { length: 255 }),
  
  // Tempo estimado (em minutos totais)
  tempoEstimadoDias: int("tempoEstimadoDias").default(0),
  tempoEstimadoHoras: int("tempoEstimadoHoras").default(0),
  tempoEstimadoMinutos: int("tempoEstimadoMinutos").default(0),
  
  // Controle de tempo real
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  tempoDecorridoMinutos: int("tempoDecorridoMinutos"),
  
  // Financeiro
  valorEstimado: decimal("valorEstimado", { precision: 10, scale: 2 }),
  valorReal: decimal("valorReal", { precision: 10, scale: 2 }),
  
  // Vínculo com manutenção
  manutencaoId: int("manutencaoId").references(() => manutencoes.id),
  
  // Chat
  chatToken: varchar("chatToken", { length: 64 }).unique(),
  chatAtivo: boolean("chatAtivo").default(true),
  
  // Solicitante
  solicitanteId: int("solicitanteId").references(() => users.id),
  solicitanteNome: varchar("solicitanteNome", { length: 255 }),
  solicitanteTipo: mysqlEnum("solicitanteTipo", ["sindico", "morador", "funcionario", "administradora"]).default("sindico"),
  
  // Compartilhamento
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = typeof ordensServico.$inferInsert;

// Responsáveis da OS
export const osResponsaveis = mysqlTable("os_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id),
  principal: boolean("principal").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsResponsavel = typeof osResponsaveis.$inferSelect;
export type InsertOsResponsavel = typeof osResponsaveis.$inferInsert;

// Materiais da OS
export const osMateriais = mysqlTable("os_materiais", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  quantidade: int("quantidade").default(1),
  unidade: varchar("unidade", { length: 20 }),
  emEstoque: boolean("emEstoque").default(false),
  precisaPedir: boolean("precisaPedir").default(false),
  pedidoDescricao: text("pedidoDescricao"),
  valorUnitario: decimal("valorUnitario", { precision: 10, scale: 2 }),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsMaterial = typeof osMateriais.$inferSelect;
export type InsertOsMaterial = typeof osMateriais.$inferInsert;

// Orçamentos da OS
export const osOrcamentos = mysqlTable("os_orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  fornecedor: varchar("fornecedor", { length: 255 }),
  descricao: text("descricao"),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataOrcamento: timestamp("dataOrcamento").defaultNow(),
  dataValidade: timestamp("dataValidade"),
  aprovado: boolean("aprovado").default(false),
  aprovadoPor: int("aprovadoPor").references(() => users.id),
  dataAprovacao: timestamp("dataAprovacao"),
  motivoRejeicao: text("motivoRejeicao"),
  anexoUrl: text("anexoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsOrcamento = typeof osOrcamentos.$inferSelect;
export type InsertOsOrcamento = typeof osOrcamentos.$inferInsert;

// Timeline/Histórico da OS
export const osTimeline = mysqlTable("os_timeline", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "criacao",
    "status_alterado",
    "responsavel_adicionado",
    "responsavel_removido",
    "material_adicionado",
    "material_removido",
    "orcamento_adicionado",
    "orcamento_aprovado",
    "orcamento_rejeitado",
    "orcamento_removido",
    "inicio_servico",
    "fim_servico",
    "comentario",
    "foto_adicionada",
    "localizacao_atualizada",
    "vinculo_manutencao"
  ]).notNull(),
  descricao: text("descricao"),
  usuarioId: int("usuarioId").references(() => users.id),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  dadosAnteriores: json("dadosAnteriores"),
  dadosNovos: json("dadosNovos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsTimeline = typeof osTimeline.$inferSelect;
export type InsertOsTimeline = typeof osTimeline.$inferInsert;

// Chat da OS
export const osChat = mysqlTable("os_chat", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  remetenteId: int("remetenteId").references(() => users.id),
  remetenteNome: varchar("remetenteNome", { length: 255 }).notNull(),
  remetenteTipo: mysqlEnum("remetenteTipo", ["sindico", "morador", "funcionario", "visitante"]).default("visitante"),
  mensagem: text("mensagem"),
  anexoUrl: text("anexoUrl"),
  anexoNome: varchar("anexoNome", { length: 255 }),
  anexoTipo: varchar("anexoTipo", { length: 100 }),
  anexoTamanho: int("anexoTamanho"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsChat = typeof osChat.$inferSelect;
export type InsertOsChat = typeof osChat.$inferInsert;

// Imagens da OS
export const osImagens = mysqlTable("os_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  url: text("url").notNull(),
  tipo: mysqlEnum("tipo", ["antes", "durante", "depois", "orcamento", "outro"]).default("outro"),
  descricao: varchar("descricao", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsImagem = typeof osImagens.$inferSelect;
export type InsertOsImagem = typeof osImagens.$inferInsert;


// ==================== FUNÇÕES RÁPIDAS ====================
export const funcoesRapidas = mysqlTable("funcoes_rapidas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 100 }).notNull(), // ID da função (ex: "avisos", "eventos", etc.)
  nome: varchar("nome", { length: 255 }).notNull(), // Nome da função
  path: varchar("path", { length: 255 }).notNull(), // Caminho/rota da função
  icone: varchar("icone", { length: 100 }).notNull(), // Nome do ícone Lucide
  cor: varchar("cor", { length: 20 }).notNull(), // Cor em hex (ex: "#EF4444")
  ordem: int("ordem").default(0).notNull(), // Ordem de exibição (0-11)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FuncaoRapida = typeof funcoesRapidas.$inferSelect;
export type InsertFuncaoRapida = typeof funcoesRapidas.$inferInsert;


// ==================== INSCRIÇÕES PARA RECEBER REVISTA ====================
export const inscricoesRevista = mysqlTable("inscricoes_revista", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  revistaId: int("revistaId").references(() => revistas.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  unidade: varchar("unidade", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  status: mysqlEnum("status", ["pendente", "ativo", "inativo"]).default("pendente").notNull(),
  ativadoPor: int("ativadoPor").references(() => users.id),
  dataAtivacao: timestamp("dataAtivacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoRevista = typeof inscricoesRevista.$inferSelect;
export type InsertInscricaoRevista = typeof inscricoesRevista.$inferInsert;


// ==================== TAREFAS FÁCIL (Registro Rápido) ====================
export const tarefasFacil = mysqlTable("tarefas_facil", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id).notNull(),
  tipo: mysqlEnum("tipo", ["vistoria", "manutencao", "ocorrencia", "antes_depois"]).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(), // VS-2026-0001, MS-2026-0001, OS-2026-0001, AD-2026-0001
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagens: json("imagens").$type<string[]>(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  endereco: text("endereco"), // Endereço formatado a partir do GPS
  status: mysqlEnum("status", ["rascunho", "pendente", "em_andamento", "concluido", "cancelado"]).default("rascunho").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  observacoes: text("observacoes"),
  // Para Antes/Depois
  imagemAntes: text("imagemAntes"),
  imagemDepois: text("imagemDepois"),
  // Metadados
  enviadoEm: timestamp("enviadoEm"),
  concluidoEm: timestamp("concluidoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TarefaFacil = typeof tarefasFacil.$inferSelect;
export type InsertTarefaFacil = typeof tarefasFacil.$inferInsert;


// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - CONFIGURAÇÕES ====================

// Responsáveis da Timeline
export const timelineResponsaveis = mysqlTable("timeline_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineResponsavel = typeof timelineResponsaveis.$inferSelect;
export type InsertTimelineResponsavel = typeof timelineResponsaveis.$inferInsert;

// Locais/Itens da Timeline
export const timelineLocais = mysqlTable("timeline_locais", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineLocal = typeof timelineLocais.$inferSelect;
export type InsertTimelineLocal = typeof timelineLocais.$inferInsert;

// Status da Timeline
export const timelineStatus = mysqlTable("timeline_status", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }).default("#6B7280"),
  icone: varchar("icone", { length: 50 }).default("Circle"),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineStatusConfig = typeof timelineStatus.$inferSelect;
export type InsertTimelineStatusConfig = typeof timelineStatus.$inferInsert;

// Prioridades da Timeline
export const timelinePrioridades = mysqlTable("timeline_prioridades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }).default("#6B7280"),
  icone: varchar("icone", { length: 50 }).default("Minus"),
  nivel: int("nivel").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelinePrioridade = typeof timelinePrioridades.$inferSelect;
export type InsertTimelinePrioridade = typeof timelinePrioridades.$inferInsert;

// Títulos predefinidos da Timeline
export const timelineTitulos = mysqlTable("timeline_titulos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricaoPadrao: text("descricaoPadrao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineTitulo = typeof timelineTitulos.$inferSelect;
export type InsertTimelineTitulo = typeof timelineTitulos.$inferInsert;

// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - REGISTOS PRINCIPAIS ====================

export const timelines = mysqlTable("timelines", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  protocolo: varchar("protocolo", { length: 50 }).notNull(),
  
  // Campos obrigatórios
  responsavelId: int("responsavelId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  
  // Campos opcionais
  localId: int("localId"),
  statusId: int("statusId"),
  prioridadeId: int("prioridadeId"),
  tituloPredefId: int("tituloPredefId"),
  descricao: text("descricao"),
  
  // Registo automático
  dataRegistro: timestamp("dataRegistro").defaultNow().notNull(),
  horaRegistro: varchar("horaRegistro", { length: 10 }),
  localizacaoGps: varchar("localizacaoGps", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  // Estado do registo
  estado: mysqlEnum("estado", ["rascunho", "enviado", "registado"]).default("rascunho"),
  
  // Token para link público
  tokenPublico: varchar("tokenPublico", { length: 64 }).unique(),
  
  // Metadados
  criadoPor: int("criadoPor"),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = typeof timelines.$inferInsert;

// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - IMAGENS ====================

export const timelineImagens = mysqlTable("timeline_imagens", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineImagem = typeof timelineImagens.$inferSelect;
export type InsertTimelineImagem = typeof timelineImagens.$inferInsert;

// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - EVENTOS/HISTÓRICO ====================

export const timelineEventos = mysqlTable("timeline_eventos", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  tipo: mysqlEnum("tipo", ["criacao", "edicao", "status", "comentario", "imagem", "compartilhamento", "visualizacao", "pdf", "registro"]).default("comentario"),
  descricao: text("descricao"),
  usuarioId: int("usuarioId"),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  dadosAnteriores: text("dadosAnteriores"),
  dadosNovos: text("dadosNovos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineEvento = typeof timelineEventos.$inferSelect;
export type InsertTimelineEvento = typeof timelineEventos.$inferInsert;

// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - COMPARTILHAMENTOS ====================

export const timelineCompartilhamentos = mysqlTable("timeline_compartilhamentos", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  membroEquipeId: int("membroEquipeId"),
  membroNome: varchar("membroNome", { length: 255 }),
  membroEmail: varchar("membroEmail", { length: 320 }),
  membroTelefone: varchar("membroTelefone", { length: 20 }),
  canalEnvio: mysqlEnum("canalEnvio", ["email", "whatsapp", "ambos"]).default("email"),
  visualizado: boolean("visualizado").default(false),
  dataVisualizacao: timestamp("dataVisualizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineCompartilhamento = typeof timelineCompartilhamentos.$inferSelect;
export type InsertTimelineCompartilhamento = typeof timelineCompartilhamentos.$inferInsert;


// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - COMENTÁRIOS ====================

// Tipo para arquivos anexados
export type ArquivoAnexo = {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
};

// Tipo para menções
export type Mencao = {
  usuarioId?: number;
  membroEquipeId?: number;
  nome: string;
};

export const timelineComentarios = mysqlTable("timeline_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  // Quem comentou (pode ser membro da equipe ou usuário do sistema)
  membroEquipeId: int("membroEquipeId"),
  usuarioId: int("usuarioId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorEmail: varchar("autorEmail", { length: 320 }),
  autorAvatar: text("autorAvatar"),
  // Conteúdo do comentário
  texto: text("texto").notNull(),
  // Imagens anexadas ao comentário
  imagensUrls: json("imagensUrls").$type<string[]>(),
  // Arquivos anexados ao comentário (PDFs, documentos, etc.)
  arquivosUrls: json("arquivosUrls").$type<ArquivoAnexo[]>(),
  // Menções de usuários (@)
  mencoes: json("mencoes").$type<Mencao[]>(),
  // Comentário pai (para respostas/threads)
  comentarioPaiId: int("comentarioPaiId"),
  // Status do comentário
  editado: boolean("editado").default(false),
  dataEdicao: timestamp("dataEdicao"),
  excluido: boolean("excluido").default(false),
  dataExclusao: timestamp("dataExclusao"),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineComentario = typeof timelineComentarios.$inferSelect;
export type InsertTimelineComentario = typeof timelineComentarios.$inferInsert;

// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - REAÇÕES A COMENTÁRIOS ====================

export const timelineComentarioReacoes = mysqlTable("timeline_comentario_reacoes", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  membroEquipeId: int("membroEquipeId"),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["like", "love", "check", "question", "alert"]).default("like"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineComentarioReacao = typeof timelineComentarioReacoes.$inferSelect;
export type InsertTimelineComentarioReacao = typeof timelineComentarioReacoes.$inferInsert;


// ==================== TIMELINE/LIVRO DE MANUTENÇÃO - HISTÓRICO DE EDIÇÕES ====================

export const timelineComentarioHistorico = mysqlTable("timeline_comentario_historico", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").notNull(),
  // Conteúdo anterior
  textoAnterior: text("textoAnterior").notNull(),
  imagensUrlsAnterior: json("imagensUrlsAnterior").$type<string[]>(),
  arquivosUrlsAnterior: json("arquivosUrlsAnterior").$type<ArquivoAnexo[]>(),
  mencoesAnterior: json("mencoesAnterior").$type<Mencao[]>(),
  // Quem editou
  editadoPorId: int("editadoPorId").references(() => users.id),
  editadoPorNome: varchar("editadoPorNome", { length: 255 }),
  // Metadados
  versao: int("versao").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineComentarioHistorico = typeof timelineComentarioHistorico.$inferSelect;
export type InsertTimelineComentarioHistorico = typeof timelineComentarioHistorico.$inferInsert;


// ==================== NOTIFICAÇÕES PUSH ====================
export const notificacoesPush = mysqlTable("notificacoes_push", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").references(() => users.id),
  condominioId: int("condominioId").references(() => condominios.id),
  // Dados da notificação
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: mysqlEnum("tipo", ["comentario", "mencao", "timeline", "sistema"]).default("sistema"),
  // Referências opcionais
  timelineId: int("timelineId"),
  comentarioId: int("comentarioId"),
  // Status
  lida: boolean("lida").default(false),
  dataLeitura: timestamp("dataLeitura"),
  // Metadados
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  linkAcao: text("linkAcao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificacaoPush = typeof notificacoesPush.$inferSelect;
export type InsertNotificacaoPush = typeof notificacoesPush.$inferInsert;

// ==================== CONFIGURAÇÕES DE NOTIFICAÇÕES DO USUÁRIO ====================
export const configuracoesNotificacoes = mysqlTable("configuracoes_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  // Preferências
  receberNotificacoesPush: boolean("receberNotificacoesPush").default(true),
  receberNotificacoesEmail: boolean("receberNotificacoesEmail").default(true),
  notificarComentarios: boolean("notificarComentarios").default(true),
  notificarMencoes: boolean("notificarMencoes").default(true),
  notificarTimelines: boolean("notificarTimelines").default(true),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoNotificacao = typeof configuracoesNotificacoes.$inferSelect;
export type InsertConfiguracaoNotificacao = typeof configuracoesNotificacoes.$inferInsert;


// ==================== TEMPLATES DE COMENTÁRIOS ====================
export const timelineComentarioTemplates = mysqlTable("timeline_comentario_templates", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  usuarioId: int("usuarioId").references(() => users.id),
  // Dados do template
  titulo: varchar("titulo", { length: 100 }).notNull(),
  texto: text("texto").notNull(),
  categoria: varchar("categoria", { length: 50 }),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  // Configurações
  publico: boolean("publico").default(false), // Se pode ser usado por todos
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  // Estatísticas de uso
  vezesUsado: int("vezesUsado").default(0),
  ultimoUso: timestamp("ultimoUso"),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineComentarioTemplate = typeof timelineComentarioTemplates.$inferSelect;
export type InsertTimelineComentarioTemplate = typeof timelineComentarioTemplates.$inferInsert;

// ==================== LEMBRETES DE TIMELINE ====================
export const timelineLembretes = mysqlTable("timeline_lembretes", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  condominioId: int("condominioId").references(() => condominios.id),
  // Dados do lembrete
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataLembrete: timestamp("dataLembrete").notNull(),
  // Configurações de notificação
  notificarEmail: boolean("notificarEmail").default(true),
  notificarPush: boolean("notificarPush").default(true),
  antecedencia: int("antecedencia").default(0), // Minutos antes para notificar
  // Status
  status: mysqlEnum("status", ["pendente", "enviado", "cancelado"]).default("pendente"),
  dataEnvio: timestamp("dataEnvio"),
  // Recorrência
  recorrente: boolean("recorrente").default(false),
  intervaloRecorrencia: mysqlEnum("intervaloRecorrencia", ["diario", "semanal", "mensal"]),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineLembrete = typeof timelineLembretes.$inferSelect;
export type InsertTimelineLembrete = typeof timelineLembretes.$inferInsert;


// ==================== ESTATÍSTICAS DE VISUALIZAÇÃO DA REVISTA ====================
export const revistaVisualizacoes = mysqlTable("revista_visualizacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  // Dados da visualização
  secaoId: varchar("secaoId", { length: 50 }),
  paginaNumero: int("paginaNumero"),
  tempoLeitura: int("tempoLeitura"), // em segundos
  // Informações do dispositivo
  dispositivo: varchar("dispositivo", { length: 50 }),
  navegador: varchar("navegador", { length: 100 }),
  ipHash: varchar("ipHash", { length: 64 }), // Hash do IP para privacidade
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevistaVisualizacao = typeof revistaVisualizacoes.$inferSelect;
export type InsertRevistaVisualizacao = typeof revistaVisualizacoes.$inferInsert;

// ==================== COMENTÁRIOS DA REVISTA ====================
export const revistaComentarios = mysqlTable("revista_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  moradorId: int("moradorId").references(() => moradores.id),
  // Dados do comentário
  secaoId: varchar("secaoId", { length: 50 }).notNull(),
  secaoTipo: varchar("secaoTipo", { length: 50 }),
  texto: text("texto").notNull(),
  // Moderação
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente"),
  moderadoPor: int("moderadoPor").references(() => users.id),
  dataModeracao: timestamp("dataModeracao"),
  motivoRejeicao: text("motivoRejeicao"),
  // Respostas
  parentId: int("parentId"),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevistaComentario = typeof revistaComentarios.$inferSelect;
export type InsertRevistaComentario = typeof revistaComentarios.$inferInsert;

// ==================== AGENDAMENTO DE PUBLICAÇÃO DA REVISTA ====================
export const revistaAgendamentos = mysqlTable("revista_agendamentos", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  // Dados do agendamento
  dataPublicacao: timestamp("dataPublicacao").notNull(),
  status: mysqlEnum("status", ["agendado", "publicado", "cancelado", "erro"]).default("agendado"),
  // Notificações
  notificarMoradores: boolean("notificarMoradores").default(true),
  notificarEmail: boolean("notificarEmail").default(true),
  notificarPush: boolean("notificarPush").default(true),
  mensagemNotificacao: text("mensagemNotificacao"),
  // Execução
  dataExecucao: timestamp("dataExecucao"),
  erroMensagem: text("erroMensagem"),
  // Metadados
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevistaAgendamento = typeof revistaAgendamentos.$inferSelect;
export type InsertRevistaAgendamento = typeof revistaAgendamentos.$inferInsert;

// ==================== ASSINANTES DA REVISTA (para notificações) ====================
export const revistaAssinantes = mysqlTable("revista_assinantes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  // Dados do assinante
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  unidade: varchar("unidade", { length: 50 }),
  // Preferências
  receberEmail: boolean("receberEmail").default(true),
  receberWhatsapp: boolean("receberWhatsapp").default(false),
  receberPush: boolean("receberPush").default(true),
  // Status
  ativo: boolean("ativo").default(false), // Precisa ser ativado pela administração
  dataAtivacao: timestamp("dataAtivacao"),
  ativadoPor: int("ativadoPor").references(() => users.id),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevistaAssinante = typeof revistaAssinantes.$inferSelect;
export type InsertRevistaAssinante = typeof revistaAssinantes.$inferInsert;


// ==================== CONFIGURAÇÃO DE MODERAÇÃO DE COMENTÁRIOS ====================
export const revistaConfigModeracaoComentarios = mysqlTable("revista_config_moderacao_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  // Configurações de moderação
  modoAutomatico: boolean("modoAutomatico").default(false), // Se true, aprova todos automaticamente
  notificarNovoComentario: boolean("notificarNovoComentario").default(true),
  permitirComentariosAnonimos: boolean("permitirComentariosAnonimos").default(false),
  // Filtros automáticos
  filtrarPalavrasOfensivas: boolean("filtrarPalavrasOfensivas").default(true),
  palavrasBloqueadas: text("palavrasBloqueadas"), // JSON array de palavras
  // Limites
  maxComentariosPorUsuario: int("maxComentariosPorUsuario").default(10),
  maxCaracteres: int("maxCaracteres").default(1000),
  // Metadados
  atualizadoPor: int("atualizadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevistaConfigModeracao = typeof revistaConfigModeracaoComentarios.$inferSelect;
export type InsertRevistaConfigModeracao = typeof revistaConfigModeracaoComentarios.$inferInsert;

// ==================== TEMPLATES DE REVISTA ====================
export const revistaTemplates = mysqlTable("revista_templates", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id), // null = template global
  // Dados do template
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["mensal", "trimestral", "especial", "boas_vindas", "personalizado"]).default("personalizado"),
  // Configurações do template
  secoesIncluidas: json("secoesIncluidas").$type<string[]>(), // Array de IDs das seções
  ordemSecoes: json("ordemSecoes").$type<string[]>(), // Ordem das seções
  configCapa: json("configCapa").$type<{
    titulo?: string;
    subtitulo?: string;
    corFundo?: string;
    imagemCapaUrl?: string;
  }>(),
  configEstilo: json("configEstilo").$type<{
    estiloPdf?: string;
    corPrimaria?: string;
    corSecundaria?: string;
    fonte?: string;
  }>(),
  // Preview
  previewImageUrl: varchar("previewImageUrl", { length: 500 }),
  // Status
  ativo: boolean("ativo").default(true),
  padrao: boolean("padrao").default(false), // Template padrão do sistema
  // Metadados
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevistaTemplate = typeof revistaTemplates.$inferSelect;
export type InsertRevistaTemplate = typeof revistaTemplates.$inferInsert;

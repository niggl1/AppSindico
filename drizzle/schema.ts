import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
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
  // Campos de cabeÃ§alho/rodapÃ© personalizados
  cabecalhoLogoUrl: text("cabecalhoLogoUrl"),
  cabecalhoNomeCondominio: varchar("cabecalhoNomeCondominio", { length: 255 }),
  cabecalhoNomeSindico: varchar("cabecalhoNomeSindico", { length: 255 }),
  rodapeTexto: text("rodapeTexto"),
  rodapeContato: varchar("rodapeContato", { length: 255 }),
  // Telefone de contato para mensagem de bloqueio
  telefoneContato: varchar("telefoneContato", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const mensagensSindico = mysqlTable("mensagens_sindico", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  fotoSindicoUrl: text("fotoSindicoUrl"),
  nomeSindico: varchar("nomeSindico", { length: 255 }),
  titulo: varchar("titulo", { length: 255 }),
  mensagem: text("mensagem"),
  assinatura: varchar("assinatura", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  // Tipo de funcionÃ¡rio para controle de acesso
  tipoFuncionario: mysqlEnum("tipoFuncionario", ["zelador", "porteiro", "supervisor", "gerente", "auxiliar", "sindico_externo"]).default("auxiliar"),
  // Campos de login
  loginEmail: varchar("loginEmail", { length: 255 }),
  senha: varchar("senha", { length: 255 }),
  loginAtivo: boolean("loginAtivo").default(false),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campos de recuperaÃ§Ã£o de senha
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  motivoFalha: text("motivoFalha")
});
export const funcionarioFuncoes = mysqlTable("funcionario_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  funcaoKey: varchar("funcaoKey", { length: 100 }).notNull(),
  habilitada: boolean("habilitada").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const funcionarioCondominios = mysqlTable("funcionario_condominios", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const funcionarioApps = mysqlTable("funcionario_apps", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  appId: int("appId").references(() => apps.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  lembreteAntecedencia: int("lembreteAntecedencia").default(1),
  // dias de antecedÃªncia para lembrete
  lembreteEnviado: boolean("lembreteEnviado").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const antesDepois = mysqlTable("antes_depois", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fotoAntesUrl: text("fotoAntesUrl"),
  fotoDepoisUrl: text("fotoDepoisUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const opcoesVotacao = mysqlTable("opcoes_votacao", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  votos: int("votos").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const votos = mysqlTable("votos", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  opcaoId: int("opcaoId").references(() => opcoesVotacao.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const vagasEstacionamento = mysqlTable("vagas_estacionamento", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  apartamento: varchar("apartamento", { length: 20 }),
  bloco: varchar("bloco", { length: 20 }),
  tipo: mysqlEnum("tipo", ["coberta", "descoberta", "moto"]).default("coberta"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const linksUteis = mysqlTable("links_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  url: text("url").notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const telefonesUteis = mysqlTable("telefones_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  // Campos de autenticaÃ§Ã£o do portal do morador
  senha: varchar("senha", { length: 255 }),
  loginToken: varchar("loginToken", { length: 64 }),
  loginTokenExpira: timestamp("loginTokenExpira"),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campo para bloqueio de votaÃ§Ã£o
  bloqueadoVotacao: boolean("bloqueadoVotacao").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const realizacoes = mysqlTable("realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const fotos = mysqlTable("fotos", {
  id: int("id").autoincrement().primaryKey(),
  albumId: int("albumId").references(() => albuns.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 500 }),
  ordem: int("ordem").default(0),
  largura: int("largura"),
  altura: int("altura"),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const imagensRealizacoes = mysqlTable("imagens_realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  realizacaoId: int("realizacaoId").references(() => realizacoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const imagensMelhorias = mysqlTable("imagens_melhorias", {
  id: int("id").autoincrement().primaryKey(),
  melhoriaId: int("melhoriaId").references(() => melhorias.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const imagensAquisicoes = mysqlTable("imagens_aquisicoes", {
  id: int("id").autoincrement().primaryKey(),
  aquisicaoId: int("aquisicaoId").references(() => aquisicoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const imagensAchadosPerdidos = mysqlTable("imagens_achados_perdidos", {
  id: int("id").autoincrement().primaryKey(),
  achadoPerdidoId: int("achadoPerdidoId").references(() => achadosPerdidos.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const imagensVagas = mysqlTable("imagens_vagas", {
  id: int("id").autoincrement().primaryKey(),
  vagaId: int("vagaId").references(() => vagasEstacionamento.id).notNull(),
  tipo: mysqlEnum("tipo", ["imagem", "anexo"]).default("imagem"),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const vistoriaImagens = mysqlTable("vistoria_imagens", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const vistoriaTimeline = mysqlTable("vistoria_timeline", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const manutencaoImagens = mysqlTable("manutencao_imagens", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const manutencaoTimeline = mysqlTable("manutencao_timeline", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const ocorrenciaImagens = mysqlTable("ocorrencia_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const ocorrenciaTimeline = mysqlTable("ocorrencia_timeline", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const checklistItens = mysqlTable("checklist_itens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  completo: boolean("completo").default(false),
  observacao: text("observacao"),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const checklistImagens = mysqlTable("checklist_imagens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const checklistTimeline = mysqlTable("checklist_timeline", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "item_completo", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const linksCompartilhaveis = mysqlTable("links_compartilhaveis", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["vistoria", "manutencao", "ocorrencia", "checklist"]).notNull(),
  itemId: int("itemId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  editavel: boolean("editavel").default(false).notNull(),
  expiracaoHoras: int("expiracaoHoras").default(168),
  // 7 dias por padrÃ£o
  acessos: int("acessos").default(0).notNull(),
  criadoPorId: int("criadoPorId").references(() => users.id),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const historicoCompartilhamentos = mysqlTable("historico_compartilhamentos", {
  id: int("id").autoincrement().primaryKey(),
  linkId: int("linkId").references(() => linksCompartilhaveis.id).notNull(),
  membroId: int("membroId").references(() => membrosEquipe.id),
  membroNome: varchar("membroNome", { length: 255 }),
  membroWhatsapp: varchar("membroWhatsapp", { length: 20 }),
  compartilhadoPorId: int("compartilhadoPorId").references(() => users.id),
  compartilhadoPorNome: varchar("compartilhadoPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const anexosComentario = mysqlTable("anexos_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const respostasComentario = mysqlTable("respostas_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  autorId: int("autorId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorFoto: text("autorFoto"),
  texto: text("texto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const imagensDestaques = mysqlTable("imagens_destaques", {
  id: int("id").autoincrement().primaryKey(),
  destaqueId: int("destaqueId").references(() => destaques.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  imagens: json("imagens").$type(),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const imagensCustom = mysqlTable("imagens_custom", {
  id: int("id").autoincrement().primaryKey(),
  paginaId: int("paginaId").references(() => paginasCustom.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const vencimentoAlertas = mysqlTable("vencimento_alertas", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  tipoAlerta: mysqlEnum("tipoAlerta", ["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"]).notNull(),
  ativo: boolean("ativo").default(true),
  enviado: boolean("enviado").default(false),
  dataEnvio: timestamp("dataEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const vencimentoEmails = mysqlTable("vencimento_emails", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  nome: varchar("nome", { length: 255 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const vencimentoNotificacoes = mysqlTable("vencimento_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  alertaId: int("alertaId").references(() => vencimentoAlertas.id),
  emailDestinatario: varchar("emailDestinatario", { length: 320 }).notNull(),
  assunto: varchar("assunto", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  status: mysqlEnum("status", ["enviado", "erro", "pendente"]).default("pendente").notNull(),
  erroMensagem: text("erroMensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  canais: json("canais").$type(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const configuracoesEmail = mysqlTable("configuracoes_email", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  provedor: mysqlEnum("provedor", ["resend", "sendgrid", "mailgun", "smtp"]).default("resend"),
  apiKey: text("apiKey"),
  emailRemetente: varchar("emailRemetente", { length: 255 }),
  nomeRemetente: varchar("nomeRemetente", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const configuracoesPush = mysqlTable("configuracoes_push", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  vapidPublicKey: text("vapidPublicKey"),
  vapidPrivateKey: text("vapidPrivateKey"),
  vapidSubject: varchar("vapidSubject", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const templatesNotificacao = mysqlTable("templates_notificacao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  mensagem: text("mensagem").notNull(),
  categoria: mysqlEnum("categoria", ["assembleia", "manutencao", "vencimento", "aviso", "evento", "custom"]).default("custom"),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  urlDestino: varchar("urlDestino", { length: 255 }),
  ativo: boolean("ativo").default(true),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const tiposInfracao = mysqlTable("tipos_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricaoPadrao: text("descricaoPadrao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const notificacoesInfracao = mysqlTable("notificacoes_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  moradorId: int("moradorId").references(() => moradores.id).notNull(),
  tipoInfracaoId: int("tipoInfracaoId").references(() => tiposInfracao.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  imagens: json("imagens").$type(),
  status: mysqlEnum("status", ["pendente", "respondida", "resolvida", "arquivada"]).default("pendente"),
  dataOcorrencia: timestamp("dataOcorrencia"),
  pdfUrl: text("pdfUrl"),
  linkPublico: varchar("linkPublico", { length: 64 }).notNull(),
  enviadoWhatsapp: boolean("enviadoWhatsapp").default(false),
  enviadoEmail: boolean("enviadoEmail").default(false),
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const respostasInfracao = mysqlTable("respostas_infracao", {
  id: int("id").autoincrement().primaryKey(),
  notificacaoId: int("notificacaoId").references(() => notificacoesInfracao.id).notNull(),
  autorTipo: mysqlEnum("autorTipo", ["sindico", "morador"]).notNull(),
  autorId: int("autorId"),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  imagens: json("imagens").$type(),
  lidaPeloSindico: boolean("lidaPeloSindico").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const condominioFuncoes = mysqlTable("condominio_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 50 }).notNull(),
  habilitada: boolean("habilitada").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const FUNCOES_DISPONIVEIS = [
  { id: "avisos", nome: "Avisos", categoria: "comunicacao", descricao: "Publicar avisos e comunicados" },
  { id: "comunicados", nome: "Comunicados", categoria: "comunicacao", descricao: "Enviar comunicados oficiais" },
  { id: "notificacoes", nome: "NotificaÃ§Ãµes", categoria: "comunicacao", descricao: "Sistema de notificaÃ§Ãµes" },
  { id: "notificar-morador", nome: "Notificar Morador", categoria: "comunicacao", descricao: "Notificar moradores individualmente" },
  { id: "eventos", nome: "Eventos", categoria: "agenda", descricao: "GestÃ£o de eventos do condomÃ­nio" },
  { id: "agenda-vencimentos", nome: "Agenda de Vencimentos", categoria: "agenda", descricao: "Controle de vencimentos" },
  { id: "reservas", nome: "Reservas", categoria: "agenda", descricao: "Reserva de Ã¡reas comuns" },
  { id: "vistorias", nome: "Vistorias", categoria: "operacional", descricao: "Registro de vistorias" },
  { id: "manutencoes", nome: "ManutenÃ§Ãµes", categoria: "operacional", descricao: "Controle de manutenÃ§Ãµes" },
  { id: "ocorrencias", nome: "OcorrÃªncias", categoria: "operacional", descricao: "Registro de ocorrÃªncias" },
  { id: "checklists", nome: "Checklists", categoria: "operacional", descricao: "Listas de verificaÃ§Ã£o" },
  { id: "antes-depois", nome: "Antes e Depois", categoria: "operacional", descricao: "Registro de melhorias" },
  { id: "ordens-servico", nome: "Ordens de ServiÃ§o", categoria: "operacional", descricao: "GestÃ£o de ordens de serviÃ§o" },
  { id: "votacoes", nome: "VotaÃ§Ãµes", categoria: "interativo", descricao: "Sistema de votaÃ§Ãµes" },
  { id: "classificados", nome: "Classificados", categoria: "interativo", descricao: "Classificados dos moradores" },
  { id: "achados-perdidos", nome: "Achados e Perdidos", categoria: "interativo", descricao: "Itens perdidos e encontrados" },
  { id: "caronas", nome: "Caronas", categoria: "interativo", descricao: "Sistema de caronas" },
  { id: "regras", nome: "Regras e Normas", categoria: "documentacao", descricao: "Regras do condomÃ­nio" },
  { id: "dicas-seguranca", nome: "Dicas de SeguranÃ§a", categoria: "documentacao", descricao: "Dicas de seguranÃ§a" },
  { id: "links-uteis", nome: "Links Ãteis", categoria: "documentacao", descricao: "Links importantes" },
  { id: "telefones-uteis", nome: "Telefones Ãteis", categoria: "documentacao", descricao: "Telefones de emergÃªncia" },
  { id: "galeria", nome: "Galeria de Fotos", categoria: "midia", descricao: "Fotos do condomÃ­nio" },
  { id: "realizacoes", nome: "RealizaÃ§Ãµes", categoria: "midia", descricao: "RealizaÃ§Ãµes da gestÃ£o" },
  { id: "melhorias", nome: "Melhorias", categoria: "midia", descricao: "Melhorias realizadas" },
  { id: "aquisicoes", nome: "AquisiÃ§Ãµes", categoria: "midia", descricao: "Novas aquisiÃ§Ãµes" },
  { id: "publicidade", nome: "Publicidade", categoria: "publicidade", descricao: "GestÃ£o de anunciantes" },
  { id: "revistas", nome: "Meus Projetos", categoria: "projetos", descricao: "Apps, revistas e relatÃ³rios" },
  { id: "moradores", nome: "Moradores", categoria: "gestao", descricao: "GestÃ£o de moradores" },
  { id: "funcionarios", nome: "FuncionÃ¡rios", categoria: "gestao", descricao: "GestÃ£o de funcionÃ¡rios" },
  { id: "vagas", nome: "Vagas de Estacionamento", categoria: "gestao", descricao: "GestÃ£o de vagas" },
  { id: "equipe", nome: "Equipe de GestÃ£o", categoria: "gestao", descricao: "Membros da equipe" },
  { id: "painel-controlo", nome: "Painel de Controlo", categoria: "relatorios", descricao: "EstatÃ­sticas e grÃ¡ficos" },
  { id: "relatorios", nome: "RelatÃ³rios", categoria: "relatorios", descricao: "RelatÃ³rios detalhados" }
];
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const checklistTemplateItens = mysqlTable("checklist_template_itens", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").references(() => checklistTemplates.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const osPrioridades = mysqlTable("os_prioridades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  nivel: int("nivel").default(1),
  // 1=baixa, 2=normal, 3=alta, 4=urgente
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const osStatus = mysqlTable("os_status", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  isFinal: boolean("isFinal").default(false),
  // Se Ã© status final (concluÃ­da/cancelada)
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const osSetores = mysqlTable("os_setores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const osConfiguracoes = mysqlTable("os_configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  habilitarOrcamentos: boolean("habilitarOrcamentos").default(true),
  habilitarAprovacaoOrcamento: boolean("habilitarAprovacaoOrcamento").default(true),
  habilitarGestaoFinanceira: boolean("habilitarGestaoFinanceira").default(true),
  habilitarRelatoriosGastos: boolean("habilitarRelatoriosGastos").default(true),
  habilitarVinculoManutencao: boolean("habilitarVinculoManutencao").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const ordensServico = mysqlTable("ordens_servico", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 10 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  // Relacionamentos com tabelas personalizÃ¡veis
  categoriaId: int("categoriaId").references(() => osCategorias.id),
  prioridadeId: int("prioridadeId").references(() => osPrioridades.id),
  statusId: int("statusId").references(() => osStatus.id),
  setorId: int("setorId").references(() => osSetores.id),
  // LocalizaÃ§Ã£o
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
  // VÃ­nculo com manutenÃ§Ã£o
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
export const osResponsaveis = mysqlTable("os_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id),
  principal: boolean("principal").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const osImagens = mysqlTable("os_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  url: text("url").notNull(),
  tipo: mysqlEnum("tipo", ["antes", "durante", "depois", "orcamento", "outro"]).default("outro"),
  descricao: varchar("descricao", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
export const funcoesRapidas = mysqlTable("funcoes_rapidas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 100 }).notNull(),
  // ID da funÃ§Ã£o (ex: "avisos", "eventos", etc.)
  nome: varchar("nome", { length: 255 }).notNull(),
  // Nome da funÃ§Ã£o
  path: varchar("path", { length: 255 }).notNull(),
  // Caminho/rota da funÃ§Ã£o
  icone: varchar("icone", { length: 100 }).notNull(),
  // Nome do Ã­cone Lucide
  cor: varchar("cor", { length: 20 }).notNull(),
  // Cor em hex (ex: "#EF4444")
  ordem: int("ordem").default(0).notNull(),
  // Ordem de exibiÃ§Ã£o (0-11)
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVtYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbnQsIG15c3FsRW51bSwgbXlzcWxUYWJsZSwgdGV4dCwgdGltZXN0YW1wLCB2YXJjaGFyLCBib29sZWFuLCBqc29uLCBkZWNpbWFsIH0gZnJvbSBcImRyaXp6bGUtb3JtL215c3FsLWNvcmVcIjtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVVNFUlMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB1c2VycyA9IG15c3FsVGFibGUoXCJ1c2Vyc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBvcGVuSWQ6IHZhcmNoYXIoXCJvcGVuSWRcIiwgeyBsZW5ndGg6IDY0IH0pLm5vdE51bGwoKS51bmlxdWUoKSxcbiAgbmFtZTogdGV4dChcIm5hbWVcIiksXG4gIGVtYWlsOiB2YXJjaGFyKFwiZW1haWxcIiwgeyBsZW5ndGg6IDMyMCB9KSxcbiAgbG9naW5NZXRob2Q6IHZhcmNoYXIoXCJsb2dpbk1ldGhvZFwiLCB7IGxlbmd0aDogNjQgfSksXG4gIHJvbGU6IG15c3FsRW51bShcInJvbGVcIiwgW1widXNlclwiLCBcImFkbWluXCIsIFwic2luZGljb1wiLCBcIm1vcmFkb3JcIl0pLmRlZmF1bHQoXCJ1c2VyXCIpLm5vdE51bGwoKSxcbiAgYXZhdGFyVXJsOiB0ZXh0KFwiYXZhdGFyVXJsXCIpLFxuICBwaG9uZTogdmFyY2hhcihcInBob25lXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgYXBhcnRtZW50OiB2YXJjaGFyKFwiYXBhcnRtZW50XCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgLy8gQ2FtcG9zIHBhcmEgbG9naW4gbG9jYWxcbiAgc2VuaGE6IHZhcmNoYXIoXCJzZW5oYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICByZXNldFRva2VuOiB2YXJjaGFyKFwicmVzZXRUb2tlblwiLCB7IGxlbmd0aDogNjQgfSksXG4gIHJlc2V0VG9rZW5FeHBpcmE6IHRpbWVzdGFtcChcInJlc2V0VG9rZW5FeHBpcmFcIiksXG4gIC8vIFRpcG8gZGUgY29udGE6IHNpbmRpY28sIGFkbWluaXN0cmFkb3JhIG91IGFkbWluXG4gIHRpcG9Db250YTogbXlzcWxFbnVtKFwidGlwb0NvbnRhXCIsIFtcInNpbmRpY29cIiwgXCJhZG1pbmlzdHJhZG9yYVwiLCBcImFkbWluXCJdKS5kZWZhdWx0KFwic2luZGljb1wiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxuICBsYXN0U2lnbmVkSW46IHRpbWVzdGFtcChcImxhc3RTaWduZWRJblwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFVzZXIgPSB0eXBlb2YgdXNlcnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VXNlciA9IHR5cGVvZiB1c2Vycy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENPTkRPTUlOSU9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgY29uZG9taW5pb3MgPSBteXNxbFRhYmxlKFwiY29uZG9taW5pb3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29kaWdvOiB2YXJjaGFyKFwiY29kaWdvXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgY25wajogdmFyY2hhcihcImNucGpcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZW5kZXJlY286IHRleHQoXCJlbmRlcmVjb1wiKSxcbiAgY2lkYWRlOiB2YXJjaGFyKFwiY2lkYWRlXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIGVzdGFkbzogdmFyY2hhcihcImVzdGFkb1wiLCB7IGxlbmd0aDogNTAgfSksXG4gIGNlcDogdmFyY2hhcihcImNlcFwiLCB7IGxlbmd0aDogMTAgfSksXG4gIGxvZ29Vcmw6IHRleHQoXCJsb2dvVXJsXCIpLFxuICBiYW5uZXJVcmw6IHRleHQoXCJiYW5uZXJVcmxcIiksXG4gIGNhcGFVcmw6IHRleHQoXCJjYXBhVXJsXCIpLFxuICBjb3JQcmltYXJpYTogdmFyY2hhcihcImNvclByaW1hcmlhXCIsIHsgbGVuZ3RoOiAyMCB9KS5kZWZhdWx0KFwiIzRGNDZFNVwiKSxcbiAgY29yU2VjdW5kYXJpYTogdmFyY2hhcihcImNvclNlY3VuZGFyaWFcIiwgeyBsZW5ndGg6IDIwIH0pLmRlZmF1bHQoXCIjMTBCOTgxXCIpLFxuICBjYWRhc3Ryb1Rva2VuOiB2YXJjaGFyKFwiY2FkYXN0cm9Ub2tlblwiLCB7IGxlbmd0aDogMzIgfSkudW5pcXVlKCksXG4gIGFzc2VtYmxlaWFMaW5rOiB0ZXh0KFwiYXNzZW1ibGVpYUxpbmtcIiksXG4gIGFzc2VtYmxlaWFEYXRhOiB0aW1lc3RhbXAoXCJhc3NlbWJsZWlhRGF0YVwiKSxcbiAgc2luZGljb0lkOiBpbnQoXCJzaW5kaWNvSWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIC8vIENhbXBvcyBkZSBjYWJlw6dhbGhvL3JvZGFww6kgcGVyc29uYWxpemFkb3NcbiAgY2FiZWNhbGhvTG9nb1VybDogdGV4dChcImNhYmVjYWxob0xvZ29VcmxcIiksXG4gIGNhYmVjYWxob05vbWVDb25kb21pbmlvOiB2YXJjaGFyKFwiY2FiZWNhbGhvTm9tZUNvbmRvbWluaW9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgY2FiZWNhbGhvTm9tZVNpbmRpY286IHZhcmNoYXIoXCJjYWJlY2FsaG9Ob21lU2luZGljb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICByb2RhcGVUZXh0bzogdGV4dChcInJvZGFwZVRleHRvXCIpLFxuICByb2RhcGVDb250YXRvOiB2YXJjaGFyKFwicm9kYXBlQ29udGF0b1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICAvLyBUZWxlZm9uZSBkZSBjb250YXRvIHBhcmEgbWVuc2FnZW0gZGUgYmxvcXVlaW9cbiAgdGVsZWZvbmVDb250YXRvOiB2YXJjaGFyKFwidGVsZWZvbmVDb250YXRvXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENvbmRvbWluaW8gPSB0eXBlb2YgY29uZG9taW5pb3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Q29uZG9taW5pbyA9IHR5cGVvZiBjb25kb21pbmlvcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFJFVklTVEFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgcmV2aXN0YXMgPSBteXNxbFRhYmxlKFwicmV2aXN0YXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIHN1YnRpdHVsbzogdGV4dChcInN1YnRpdHVsb1wiKSxcbiAgZWRpY2FvOiB2YXJjaGFyKFwiZWRpY2FvXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgY2FwYVVybDogdGV4dChcImNhcGFVcmxcIiksXG4gIHRlbXBsYXRlSWQ6IHZhcmNoYXIoXCJ0ZW1wbGF0ZUlkXCIsIHsgbGVuZ3RoOiA1MCB9KS5kZWZhdWx0KFwiZGVmYXVsdFwiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wicmFzY3VuaG9cIiwgXCJwdWJsaWNhZGFcIiwgXCJhcnF1aXZhZGFcIl0pLmRlZmF1bHQoXCJyYXNjdW5ob1wiKS5ub3ROdWxsKCksXG4gIHB1YmxpY2FkYUVtOiB0aW1lc3RhbXAoXCJwdWJsaWNhZGFFbVwiKSxcbiAgdmlzdWFsaXphY29lczogaW50KFwidmlzdWFsaXphY29lc1wiKS5kZWZhdWx0KDApLFxuICBzaGFyZUxpbms6IHZhcmNoYXIoXCJzaGFyZUxpbmtcIiwgeyBsZW5ndGg6IDEwMCB9KS51bmlxdWUoKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFJldmlzdGEgPSB0eXBlb2YgcmV2aXN0YXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0UmV2aXN0YSA9IHR5cGVvZiByZXZpc3Rhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFNFQ8OHw5VFUyBEQSBSRVZJU1RBID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3Qgc2Vjb2VzID0gbXlzcWxUYWJsZShcInNlY29lc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICByZXZpc3RhSWQ6IGludChcInJldmlzdGFJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHJldmlzdGFzLmlkKS5ub3ROdWxsKCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1xuICAgIFwibWVuc2FnZW1fc2luZGljb1wiLFxuICAgIFwiYXZpc29zXCIsXG4gICAgXCJjb211bmljYWRvc1wiLFxuICAgIFwiZGljYXNfc2VndXJhbmNhXCIsXG4gICAgXCJyZWdyYXNcIixcbiAgICBcImxpbmtzX3V0ZWlzXCIsXG4gICAgXCJ0ZWxlZm9uZXNfdXRlaXNcIixcbiAgICBcInJlYWxpemFjb2VzXCIsXG4gICAgXCJhbnRlc19kZXBvaXNcIixcbiAgICBcIm1lbGhvcmlhc1wiLFxuICAgIFwiYXF1aXNpY29lc1wiLFxuICAgIFwiZnVuY2lvbmFyaW9zXCIsXG4gICAgXCJhZ2VuZGFfZXZlbnRvc1wiLFxuICAgIFwiZXZlbnRvc1wiLFxuICAgIFwiYWNoYWRvc19wZXJkaWRvc1wiLFxuICAgIFwiY2Fyb25hc1wiLFxuICAgIFwidmFnYXNfZXN0YWNpb25hbWVudG9cIixcbiAgICBcImNsYXNzaWZpY2Fkb3NcIixcbiAgICBcInZvdGFjb2VzXCIsXG4gICAgXCJwdWJsaWNpZGFkZVwiXG4gIF0pLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGNvbmZpZzoganNvbihcImNvbmZpZ1wiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFNlY2FvID0gdHlwZW9mIHNlY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRTZWNhbyA9IHR5cGVvZiBzZWNvZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBNRU5TQUdFTSBETyBTw41ORElDTyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG1lbnNhZ2Vuc1NpbmRpY28gPSBteXNxbFRhYmxlKFwibWVuc2FnZW5zX3NpbmRpY29cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmV2aXN0YUlkOiBpbnQoXCJyZXZpc3RhSWRcIikucmVmZXJlbmNlcygoKSA9PiByZXZpc3Rhcy5pZCkubm90TnVsbCgpLFxuICBmb3RvU2luZGljb1VybDogdGV4dChcImZvdG9TaW5kaWNvVXJsXCIpLFxuICBub21lU2luZGljbzogdmFyY2hhcihcIm5vbWVTaW5kaWNvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBtZW5zYWdlbTogdGV4dChcIm1lbnNhZ2VtXCIpLFxuICBhc3NpbmF0dXJhOiB2YXJjaGFyKFwiYXNzaW5hdHVyYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgTWVuc2FnZW1TaW5kaWNvID0gdHlwZW9mIG1lbnNhZ2Vuc1NpbmRpY28uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0TWVuc2FnZW1TaW5kaWNvID0gdHlwZW9mIG1lbnNhZ2Vuc1NpbmRpY28uJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBVklTT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhdmlzb3MgPSBteXNxbFRhYmxlKFwiYXZpc29zXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBjb250ZXVkbzogdGV4dChcImNvbnRldWRvXCIpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcInVyZ2VudGVcIiwgXCJpbXBvcnRhbnRlXCIsIFwiaW5mb3JtYXRpdm9cIl0pLmRlZmF1bHQoXCJpbmZvcm1hdGl2b1wiKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICBkZXN0YXF1ZTogYm9vbGVhbihcImRlc3RhcXVlXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBkYXRhRXhwaXJhY2FvOiB0aW1lc3RhbXAoXCJkYXRhRXhwaXJhY2FvXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQXZpc28gPSB0eXBlb2YgYXZpc29zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEF2aXNvID0gdHlwZW9mIGF2aXNvcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZVTkNJT07DgVJJT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBmdW5jaW9uYXJpb3MgPSBteXNxbFRhYmxlKFwiZnVuY2lvbmFyaW9zXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgbm9tZTogdmFyY2hhcihcIm5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGNhcmdvOiB2YXJjaGFyKFwiY2FyZ29cIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgZGVwYXJ0YW1lbnRvOiB2YXJjaGFyKFwiZGVwYXJ0YW1lbnRvXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIHRlbGVmb25lOiB2YXJjaGFyKFwidGVsZWZvbmVcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBlbWFpbDogdmFyY2hhcihcImVtYWlsXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGZvdG9Vcmw6IHRleHQoXCJmb3RvVXJsXCIpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIGRhdGFBZG1pc3NhbzogdGltZXN0YW1wKFwiZGF0YUFkbWlzc2FvXCIpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIFRpcG8gZGUgZnVuY2lvbsOhcmlvIHBhcmEgY29udHJvbGUgZGUgYWNlc3NvXG4gIHRpcG9GdW5jaW9uYXJpbzogbXlzcWxFbnVtKFwidGlwb0Z1bmNpb25hcmlvXCIsIFtcInplbGFkb3JcIiwgXCJwb3J0ZWlyb1wiLCBcInN1cGVydmlzb3JcIiwgXCJnZXJlbnRlXCIsIFwiYXV4aWxpYXJcIiwgXCJzaW5kaWNvX2V4dGVybm9cIl0pLmRlZmF1bHQoXCJhdXhpbGlhclwiKSxcbiAgLy8gQ2FtcG9zIGRlIGxvZ2luXG4gIGxvZ2luRW1haWw6IHZhcmNoYXIoXCJsb2dpbkVtYWlsXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIHNlbmhhOiB2YXJjaGFyKFwic2VuaGFcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbG9naW5BdGl2bzogYm9vbGVhbihcImxvZ2luQXRpdm9cIikuZGVmYXVsdChmYWxzZSksXG4gIHVsdGltb0xvZ2luOiB0aW1lc3RhbXAoXCJ1bHRpbW9Mb2dpblwiKSxcbiAgLy8gQ2FtcG9zIGRlIHJlY3VwZXJhw6fDo28gZGUgc2VuaGFcbiAgcmVzZXRUb2tlbjogdmFyY2hhcihcInJlc2V0VG9rZW5cIiwgeyBsZW5ndGg6IDY0IH0pLFxuICByZXNldFRva2VuRXhwaXJhOiB0aW1lc3RhbXAoXCJyZXNldFRva2VuRXhwaXJhXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSElTVMOTUklDTyBERSBBQ0VTU09TIERFIEZVTkNJT07DgVJJT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBmdW5jaW9uYXJpb0FjZXNzb3MgPSBteXNxbFRhYmxlKFwiZnVuY2lvbmFyaW9fYWNlc3Nvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBmdW5jaW9uYXJpb0lkOiBpbnQoXCJmdW5jaW9uYXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gZnVuY2lvbmFyaW9zLmlkKS5ub3ROdWxsKCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgZGF0YUhvcmE6IHRpbWVzdGFtcChcImRhdGFIb3JhXCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIGlwOiB2YXJjaGFyKFwiaXBcIiwgeyBsZW5ndGg6IDQ1IH0pLFxuICB1c2VyQWdlbnQ6IHRleHQoXCJ1c2VyQWdlbnRcIiksXG4gIGRpc3Bvc2l0aXZvOiB2YXJjaGFyKFwiZGlzcG9zaXRpdm9cIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgbmF2ZWdhZG9yOiB2YXJjaGFyKFwibmF2ZWdhZG9yXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIHNpc3RlbWFPcGVyYWNpb25hbDogdmFyY2hhcihcInNpc3RlbWFPcGVyYWNpb25hbFwiLCB7IGxlbmd0aDogMTAwIH0pLFxuICBsb2NhbGl6YWNhbzogdmFyY2hhcihcImxvY2FsaXphY2FvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGxhdGl0dWRlOiB2YXJjaGFyKFwibGF0aXR1ZGVcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBsb25naXR1ZGU6IHZhcmNoYXIoXCJsb25naXR1ZGVcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBjaWRhZGU6IHZhcmNoYXIoXCJjaWRhZGVcIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgcmVnaWFvOiB2YXJjaGFyKFwicmVnaWFvXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIHBhaXM6IHZhcmNoYXIoXCJwYWlzXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIHRpcG9BY2Vzc286IG15c3FsRW51bShcInRpcG9BY2Vzc29cIiwgW1wibG9naW5cIiwgXCJsb2dvdXRcIiwgXCJyZWN1cGVyYWNhb19zZW5oYVwiLCBcImFsdGVyYWNhb19zZW5oYVwiXSkuZGVmYXVsdChcImxvZ2luXCIpLFxuICBzdWNlc3NvOiBib29sZWFuKFwic3VjZXNzb1wiKS5kZWZhdWx0KHRydWUpLFxuICBtb3Rpdm9GYWxoYTogdGV4dChcIm1vdGl2b0ZhbGhhXCIpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEZ1bmNpb25hcmlvQWNlc3NvID0gdHlwZW9mIGZ1bmNpb25hcmlvQWNlc3Nvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRGdW5jaW9uYXJpb0FjZXNzbyA9IHR5cGVvZiBmdW5jaW9uYXJpb0FjZXNzb3MuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGVU7Dh8OVRVMgREUgRlVOQ0lPTsOBUklPUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGZ1bmNpb25hcmlvRnVuY29lcyA9IG15c3FsVGFibGUoXCJmdW5jaW9uYXJpb19mdW5jb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGZ1bmNpb25hcmlvSWQ6IGludChcImZ1bmNpb25hcmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBmdW5jaW9uYXJpb3MuaWQpLm5vdE51bGwoKSxcbiAgZnVuY2FvS2V5OiB2YXJjaGFyKFwiZnVuY2FvS2V5XCIsIHsgbGVuZ3RoOiAxMDAgfSkubm90TnVsbCgpLFxuICBoYWJpbGl0YWRhOiBib29sZWFuKFwiaGFiaWxpdGFkYVwiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgRnVuY2lvbmFyaW9GdW5jYW8gPSB0eXBlb2YgZnVuY2lvbmFyaW9GdW5jb2VzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEZ1bmNpb25hcmlvRnVuY2FvID0gdHlwZW9mIGZ1bmNpb25hcmlvRnVuY29lcy4kaW5mZXJJbnNlcnQ7XG5cbmV4cG9ydCB0eXBlIEZ1bmNpb25hcmlvID0gdHlwZW9mIGZ1bmNpb25hcmlvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRGdW5jaW9uYXJpbyA9IHR5cGVvZiBmdW5jaW9uYXJpb3MuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWw41OQ1VMTyBGVU5DSU9Ow4FSSU8gPC0+IENPTkRPTcONTklPUyAoTVVMVEktQ09ORE9Nw41OSU8pID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgZnVuY2lvbmFyaW9Db25kb21pbmlvcyA9IG15c3FsVGFibGUoXCJmdW5jaW9uYXJpb19jb25kb21pbmlvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBmdW5jaW9uYXJpb0lkOiBpbnQoXCJmdW5jaW9uYXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gZnVuY2lvbmFyaW9zLmlkKS5ub3ROdWxsKCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgRnVuY2lvbmFyaW9Db25kb21pbmlvID0gdHlwZW9mIGZ1bmNpb25hcmlvQ29uZG9taW5pb3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0RnVuY2lvbmFyaW9Db25kb21pbmlvID0gdHlwZW9mIGZ1bmNpb25hcmlvQ29uZG9taW5pb3MuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWw41OQ1VMTyBGVU5DSU9Ow4FSSU8gPC0+IEFQUFMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBmdW5jaW9uYXJpb0FwcHMgPSBteXNxbFRhYmxlKFwiZnVuY2lvbmFyaW9fYXBwc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBmdW5jaW9uYXJpb0lkOiBpbnQoXCJmdW5jaW9uYXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gZnVuY2lvbmFyaW9zLmlkKS5ub3ROdWxsKCksXG4gIGFwcElkOiBpbnQoXCJhcHBJZFwiKS5yZWZlcmVuY2VzKCgpID0+IGFwcHMuaWQpLm5vdE51bGwoKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgRnVuY2lvbmFyaW9BcHAgPSB0eXBlb2YgZnVuY2lvbmFyaW9BcHBzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEZ1bmNpb25hcmlvQXBwID0gdHlwZW9mIGZ1bmNpb25hcmlvQXBwcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEVWRU5UT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBldmVudG9zID0gbXlzcWxUYWJsZShcImV2ZW50b3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmV2aXN0YUlkOiBpbnQoXCJyZXZpc3RhSWRcIikucmVmZXJlbmNlcygoKSA9PiByZXZpc3Rhcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgZGF0YUV2ZW50bzogdGltZXN0YW1wKFwiZGF0YUV2ZW50b1wiKSxcbiAgaG9yYUluaWNpbzogdmFyY2hhcihcImhvcmFJbmljaW9cIiwgeyBsZW5ndGg6IDEwIH0pLFxuICBob3JhRmltOiB2YXJjaGFyKFwiaG9yYUZpbVwiLCB7IGxlbmd0aDogMTAgfSksXG4gIGxvY2FsOiB2YXJjaGFyKFwibG9jYWxcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcImFnZW5kYWRvXCIsIFwicmVhbGl6YWRvXCJdKS5kZWZhdWx0KFwiYWdlbmRhZG9cIiksXG4gIG5vbWVSZXNwb25zYXZlbDogdmFyY2hhcihcIm5vbWVSZXNwb25zYXZlbFwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICB3aGF0c2FwcFJlc3BvbnNhdmVsOiB2YXJjaGFyKFwid2hhdHNhcHBSZXNwb25zYXZlbFwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGxlbWJyZXRlQW50ZWNlZGVuY2lhOiBpbnQoXCJsZW1icmV0ZUFudGVjZWRlbmNpYVwiKS5kZWZhdWx0KDEpLCAvLyBkaWFzIGRlIGFudGVjZWTDqm5jaWEgcGFyYSBsZW1icmV0ZVxuICBsZW1icmV0ZUVudmlhZG86IGJvb2xlYW4oXCJsZW1icmV0ZUVudmlhZG9cIikuZGVmYXVsdChmYWxzZSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBFdmVudG8gPSB0eXBlb2YgZXZlbnRvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRFdmVudG8gPSB0eXBlb2YgZXZlbnRvcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFOVEVTIEUgREVQT0lTIChPQlJBUykgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhbnRlc0RlcG9pcyA9IG15c3FsVGFibGUoXCJhbnRlc19kZXBvaXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmV2aXN0YUlkOiBpbnQoXCJyZXZpc3RhSWRcIikucmVmZXJlbmNlcygoKSA9PiByZXZpc3Rhcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgZm90b0FudGVzVXJsOiB0ZXh0KFwiZm90b0FudGVzVXJsXCIpLFxuICBmb3RvRGVwb2lzVXJsOiB0ZXh0KFwiZm90b0RlcG9pc1VybFwiKSxcbiAgZGF0YVJlYWxpemFjYW86IHRpbWVzdGFtcChcImRhdGFSZWFsaXphY2FvXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQW50ZXNEZXBvaXMgPSB0eXBlb2YgYW50ZXNEZXBvaXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0QW50ZXNEZXBvaXMgPSB0eXBlb2YgYW50ZXNEZXBvaXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBQ0hBRE9TIEUgUEVSRElET1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhY2hhZG9zUGVyZGlkb3MgPSBteXNxbFRhYmxlKFwiYWNoYWRvc19wZXJkaWRvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHVzdWFyaW9JZDogaW50KFwidXN1YXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLm5vdE51bGwoKSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJhY2hhZG9cIiwgXCJwZXJkaWRvXCJdKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBmb3RvVXJsOiB0ZXh0KFwiZm90b1VybFwiKSxcbiAgbG9jYWxFbmNvbnRyYWRvOiB2YXJjaGFyKFwibG9jYWxFbmNvbnRyYWRvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGRhdGFPY29ycmVuY2lhOiB0aW1lc3RhbXAoXCJkYXRhT2NvcnJlbmNpYVwiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wiYWJlcnRvXCIsIFwicmVzb2x2aWRvXCJdKS5kZWZhdWx0KFwiYWJlcnRvXCIpLFxuICBjb250YXRvOiB2YXJjaGFyKFwiY29udGF0b1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQWNoYWRvUGVyZGlkbyA9IHR5cGVvZiBhY2hhZG9zUGVyZGlkb3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0QWNoYWRvUGVyZGlkbyA9IHR5cGVvZiBhY2hhZG9zUGVyZGlkb3MuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDQVJPTkFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgY2Fyb25hcyA9IG15c3FsVGFibGUoXCJjYXJvbmFzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgdXN1YXJpb0lkOiBpbnQoXCJ1c3VhcmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIG1vcmFkb3JJZDogaW50KFwibW9yYWRvcklkXCIpLnJlZmVyZW5jZXMoKCkgPT4gbW9yYWRvcmVzLmlkKSxcbiAgY29udGF0bzogdmFyY2hhcihcImNvbnRhdG9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJvZmVyZWNlXCIsIFwicHJvY3VyYVwiXSkubm90TnVsbCgpLFxuICBvcmlnZW06IHZhcmNoYXIoXCJvcmlnZW1cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc3Rpbm86IHZhcmNoYXIoXCJkZXN0aW5vXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkYXRhQ2Fyb25hOiB0aW1lc3RhbXAoXCJkYXRhQ2Fyb25hXCIpLFxuICBob3JhcmlvOiB2YXJjaGFyKFwiaG9yYXJpb1wiLCB7IGxlbmd0aDogMTAgfSksXG4gIHZhZ2FzRGlzcG9uaXZlaXM6IGludChcInZhZ2FzRGlzcG9uaXZlaXNcIikuZGVmYXVsdCgxKSxcbiAgb2JzZXJ2YWNvZXM6IHRleHQoXCJvYnNlcnZhY29lc1wiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wiYXRpdmFcIiwgXCJjb25jbHVpZGFcIiwgXCJjYW5jZWxhZGFcIl0pLmRlZmF1bHQoXCJhdGl2YVwiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENhcm9uYSA9IHR5cGVvZiBjYXJvbmFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENhcm9uYSA9IHR5cGVvZiBjYXJvbmFzLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ0xBU1NJRklDQURPUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGNsYXNzaWZpY2Fkb3MgPSBteXNxbFRhYmxlKFwiY2xhc3NpZmljYWRvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHVzdWFyaW9JZDogaW50KFwidXN1YXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICBtb3JhZG9ySWQ6IGludChcIm1vcmFkb3JJZFwiKS5yZWZlcmVuY2VzKCgpID0+IG1vcmFkb3Jlcy5pZCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wicHJvZHV0b1wiLCBcInNlcnZpY29cIl0pLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIHByZWNvOiB2YXJjaGFyKFwicHJlY29cIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBmb3RvVXJsOiB0ZXh0KFwiZm90b1VybFwiKSxcbiAgY29udGF0bzogdmFyY2hhcihcImNvbnRhdG9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wicGVuZGVudGVcIiwgXCJhcHJvdmFkb1wiLCBcInJlamVpdGFkb1wiLCBcInZlbmRpZG9cIl0pLmRlZmF1bHQoXCJwZW5kZW50ZVwiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENsYXNzaWZpY2FkbyA9IHR5cGVvZiBjbGFzc2lmaWNhZG9zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENsYXNzaWZpY2FkbyA9IHR5cGVvZiBjbGFzc2lmaWNhZG9zLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVk9UQcOHw5VFUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHZvdGFjb2VzID0gbXlzcWxUYWJsZShcInZvdGFjb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiZnVuY2lvbmFyaW9fbWVzXCIsIFwiZW5xdWV0ZVwiLCBcImRlY2lzYW9cIl0pLm5vdE51bGwoKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICBhcnF1aXZvVXJsOiB0ZXh0KFwiYXJxdWl2b1VybFwiKSxcbiAgdmlkZW9Vcmw6IHRleHQoXCJ2aWRlb1VybFwiKSxcbiAgZGF0YUluaWNpbzogdGltZXN0YW1wKFwiZGF0YUluaWNpb1wiKSxcbiAgZGF0YUZpbTogdGltZXN0YW1wKFwiZGF0YUZpbVwiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wiYXRpdmFcIiwgXCJlbmNlcnJhZGFcIl0pLmRlZmF1bHQoXCJhdGl2YVwiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFZvdGFjYW8gPSB0eXBlb2Ygdm90YWNvZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Vm90YWNhbyA9IHR5cGVvZiB2b3RhY29lcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IE9Qw4fDlUVTIERFIFZPVEHDh8ODTyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG9wY29lc1ZvdGFjYW8gPSBteXNxbFRhYmxlKFwib3Bjb2VzX3ZvdGFjYW9cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdm90YWNhb0lkOiBpbnQoXCJ2b3RhY2FvSWRcIikucmVmZXJlbmNlcygoKSA9PiB2b3RhY29lcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICB2b3RvczogaW50KFwidm90b3NcIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPcGNhb1ZvdGFjYW8gPSB0eXBlb2Ygb3Bjb2VzVm90YWNhby4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRPcGNhb1ZvdGFjYW8gPSB0eXBlb2Ygb3Bjb2VzVm90YWNhby4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFZPVE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3Qgdm90b3MgPSBteXNxbFRhYmxlKFwidm90b3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdm90YWNhb0lkOiBpbnQoXCJ2b3RhY2FvSWRcIikucmVmZXJlbmNlcygoKSA9PiB2b3RhY29lcy5pZCkubm90TnVsbCgpLFxuICBvcGNhb0lkOiBpbnQoXCJvcGNhb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gb3Bjb2VzVm90YWNhby5pZCkubm90TnVsbCgpLFxuICB1c3VhcmlvSWQ6IGludChcInVzdWFyaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKS5ub3ROdWxsKCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVm90byA9IHR5cGVvZiB2b3Rvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRWb3RvID0gdHlwZW9mIHZvdG9zLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVkFHQVMgREUgRVNUQUNJT05BTUVOVE8gPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB2YWdhc0VzdGFjaW9uYW1lbnRvID0gbXlzcWxUYWJsZShcInZhZ2FzX2VzdGFjaW9uYW1lbnRvXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgbnVtZXJvOiB2YXJjaGFyKFwibnVtZXJvXCIsIHsgbGVuZ3RoOiAyMCB9KS5ub3ROdWxsKCksXG4gIGFwYXJ0YW1lbnRvOiB2YXJjaGFyKFwiYXBhcnRhbWVudG9cIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBibG9jbzogdmFyY2hhcihcImJsb2NvXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJjb2JlcnRhXCIsIFwiZGVzY29iZXJ0YVwiLCBcIm1vdG9cIl0pLmRlZmF1bHQoXCJjb2JlcnRhXCIpLFxuICBvYnNlcnZhY29lczogdGV4dChcIm9ic2VydmFjb2VzXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVmFnYUVzdGFjaW9uYW1lbnRvID0gdHlwZW9mIHZhZ2FzRXN0YWNpb25hbWVudG8uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VmFnYUVzdGFjaW9uYW1lbnRvID0gdHlwZW9mIHZhZ2FzRXN0YWNpb25hbWVudG8uJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMSU5LUyDDmlRFSVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBsaW5rc1V0ZWlzID0gbXlzcWxUYWJsZShcImxpbmtzX3V0ZWlzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICB1cmw6IHRleHQoXCJ1cmxcIikubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIGljb25lOiB2YXJjaGFyKFwiaWNvbmVcIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBMaW5rVXRpbCA9IHR5cGVvZiBsaW5rc1V0ZWlzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydExpbmtVdGlsID0gdHlwZW9mIGxpbmtzVXRlaXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBURUxFRk9ORVMgw5pURUlTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgdGVsZWZvbmVzVXRlaXMgPSBteXNxbFRhYmxlKFwidGVsZWZvbmVzX3V0ZWlzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLm5vdE51bGwoKSxcbiAgbm9tZTogdmFyY2hhcihcIm5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIHRlbGVmb25lOiB2YXJjaGFyKFwidGVsZWZvbmVcIiwgeyBsZW5ndGg6IDIwIH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBjYXRlZ29yaWE6IHZhcmNoYXIoXCJjYXRlZ29yaWFcIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVGVsZWZvbmVVdGlsID0gdHlwZW9mIHRlbGVmb25lc1V0ZWlzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFRlbGVmb25lVXRpbCA9IHR5cGVvZiB0ZWxlZm9uZXNVdGVpcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFBVQkxJQ0lEQURFID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgcHVibGljaWRhZGVzID0gbXlzcWxUYWJsZShcInB1YmxpY2lkYWRlc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIGFudW5jaWFudGU6IHZhcmNoYXIoXCJhbnVuY2lhbnRlXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICBsaW5rVXJsOiB0ZXh0KFwibGlua1VybFwiKSxcbiAgdGVsZWZvbmU6IHZhcmNoYXIoXCJ0ZWxlZm9uZVwiLCB7IGxlbmd0aDogMjAgfSksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiYmFubmVyXCIsIFwiZGVzdGFxdWVcIiwgXCJsYXRlcmFsXCJdKS5kZWZhdWx0KFwiYmFubmVyXCIpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGRhdGFJbmljaW86IHRpbWVzdGFtcChcImRhdGFJbmljaW9cIiksXG4gIGRhdGFGaW06IHRpbWVzdGFtcChcImRhdGFGaW1cIiksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBQdWJsaWNpZGFkZSA9IHR5cGVvZiBwdWJsaWNpZGFkZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0UHVibGljaWRhZGUgPSB0eXBlb2YgcHVibGljaWRhZGVzLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTU9SQURPUkVTIERPIENPTkRPTcONTklPID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgbW9yYWRvcmVzID0gbXlzcWxUYWJsZShcIm1vcmFkb3Jlc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHVzdWFyaW9JZDogaW50KFwidXN1YXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZW1haWw6IHZhcmNoYXIoXCJlbWFpbFwiLCB7IGxlbmd0aDogMzIwIH0pLFxuICB0ZWxlZm9uZTogdmFyY2hhcihcInRlbGVmb25lXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgY2VsdWxhcjogdmFyY2hhcihcImNlbHVsYXJcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBhcGFydGFtZW50bzogdmFyY2hhcihcImFwYXJ0YW1lbnRvXCIsIHsgbGVuZ3RoOiAyMCB9KS5ub3ROdWxsKCksXG4gIGJsb2NvOiB2YXJjaGFyKFwiYmxvY29cIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBhbmRhcjogdmFyY2hhcihcImFuZGFyXCIsIHsgbGVuZ3RoOiAxMCB9KSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJwcm9wcmlldGFyaW9cIiwgXCJpbnF1aWxpbm9cIiwgXCJmYW1pbGlhclwiLCBcImZ1bmNpb25hcmlvXCJdKS5kZWZhdWx0KFwicHJvcHJpZXRhcmlvXCIpLFxuICBjcGY6IHZhcmNoYXIoXCJjcGZcIiwgeyBsZW5ndGg6IDE0IH0pLFxuICBkYXRhTmFzY2ltZW50bzogdGltZXN0YW1wKFwiZGF0YU5hc2NpbWVudG9cIiksXG4gIGZvdG9Vcmw6IHRleHQoXCJmb3RvVXJsXCIpLFxuICBvYnNlcnZhY29lczogdGV4dChcIm9ic2VydmFjb2VzXCIpLFxuICBkYXRhRW50cmFkYTogdGltZXN0YW1wKFwiZGF0YUVudHJhZGFcIiksXG4gIGRhdGFTYWlkYTogdGltZXN0YW1wKFwiZGF0YVNhaWRhXCIpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIENhbXBvcyBkZSBhdXRlbnRpY2HDp8OjbyBkbyBwb3J0YWwgZG8gbW9yYWRvclxuICBzZW5oYTogdmFyY2hhcihcInNlbmhhXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGxvZ2luVG9rZW46IHZhcmNoYXIoXCJsb2dpblRva2VuXCIsIHsgbGVuZ3RoOiA2NCB9KSxcbiAgbG9naW5Ub2tlbkV4cGlyYTogdGltZXN0YW1wKFwibG9naW5Ub2tlbkV4cGlyYVwiKSxcbiAgcmVzZXRUb2tlbjogdmFyY2hhcihcInJlc2V0VG9rZW5cIiwgeyBsZW5ndGg6IDY0IH0pLFxuICByZXNldFRva2VuRXhwaXJhOiB0aW1lc3RhbXAoXCJyZXNldFRva2VuRXhwaXJhXCIpLFxuICB1bHRpbW9Mb2dpbjogdGltZXN0YW1wKFwidWx0aW1vTG9naW5cIiksXG4gIC8vIENhbXBvIHBhcmEgYmxvcXVlaW8gZGUgdm90YcOnw6NvXG4gIGJsb3F1ZWFkb1ZvdGFjYW86IGJvb2xlYW4oXCJibG9xdWVhZG9Wb3RhY2FvXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgTW9yYWRvciA9IHR5cGVvZiBtb3JhZG9yZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0TW9yYWRvciA9IHR5cGVvZiBtb3JhZG9yZXMuJGluZmVySW5zZXJ0O1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IE5PVElGSUNBw4fDlUVTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3Qgbm90aWZpY2Fjb2VzID0gbXlzcWxUYWJsZShcIm5vdGlmaWNhY29lc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICB1c2VySWQ6IGludChcInVzZXJJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKS5ub3ROdWxsKCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcImF2aXNvXCIsIFwiZXZlbnRvXCIsIFwidm90YWNhb1wiLCBcImNsYXNzaWZpY2Fkb1wiLCBcImNhcm9uYVwiLCBcImdlcmFsXCJdKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgbWVuc2FnZW06IHRleHQoXCJtZW5zYWdlbVwiKSxcbiAgbGluazogdmFyY2hhcihcImxpbmtcIiwgeyBsZW5ndGg6IDUwMCB9KSxcbiAgcmVmZXJlbmNpYUlkOiBpbnQoXCJyZWZlcmVuY2lhSWRcIiksXG4gIGxpZGE6IGJvb2xlYW4oXCJsaWRhXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE5vdGlmaWNhY2FvID0gdHlwZW9mIG5vdGlmaWNhY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnROb3RpZmljYWNhbyA9IHR5cGVvZiBub3RpZmljYWNvZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSRUFMSVpBw4fDlUVTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgcmVhbGl6YWNvZXMgPSBteXNxbFRhYmxlKFwicmVhbGl6YWNvZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmV2aXN0YUlkOiBpbnQoXCJyZXZpc3RhSWRcIikucmVmZXJlbmNlcygoKSA9PiByZXZpc3Rhcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLFxuICBkYXRhUmVhbGl6YWNhbzogdGltZXN0YW1wKFwiZGF0YVJlYWxpemFjYW9cIiksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBSZWFsaXphY2FvID0gdHlwZW9mIHJlYWxpemFjb2VzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFJlYWxpemFjYW8gPSB0eXBlb2YgcmVhbGl6YWNvZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBNRUxIT1JJQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBtZWxob3JpYXMgPSBteXNxbFRhYmxlKFwibWVsaG9yaWFzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIGltYWdlbVVybDogdGV4dChcImltYWdlbVVybFwiKSxcbiAgY3VzdG86IHZhcmNoYXIoXCJjdXN0b1wiLCB7IGxlbmd0aDogNTAgfSksXG4gIGRhdGFJbXBsZW1lbnRhY2FvOiB0aW1lc3RhbXAoXCJkYXRhSW1wbGVtZW50YWNhb1wiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wicGxhbmVqYWRhXCIsIFwiZW1fYW5kYW1lbnRvXCIsIFwiY29uY2x1aWRhXCJdKS5kZWZhdWx0KFwicGxhbmVqYWRhXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgTWVsaG9yaWEgPSB0eXBlb2YgbWVsaG9yaWFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE1lbGhvcmlhID0gdHlwZW9mIG1lbGhvcmlhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFRVUlTScOHw5VFUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGFxdWlzaWNvZXMgPSBteXNxbFRhYmxlKFwiYXF1aXNpY29lc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICByZXZpc3RhSWQ6IGludChcInJldmlzdGFJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHJldmlzdGFzLmlkKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBpbWFnZW1Vcmw6IHRleHQoXCJpbWFnZW1VcmxcIiksXG4gIHZhbG9yOiB2YXJjaGFyKFwidmFsb3JcIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBmb3JuZWNlZG9yOiB2YXJjaGFyKFwiZm9ybmVjZWRvclwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBkYXRhQXF1aXNpY2FvOiB0aW1lc3RhbXAoXCJkYXRhQXF1aXNpY2FvXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQXF1aXNpY2FvID0gdHlwZW9mIGFxdWlzaWNvZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0QXF1aXNpY2FvID0gdHlwZW9mIGFxdWlzaWNvZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBQUkVGRVLDik5DSUFTIERFIE5PVElGSUNBw4fDg08gPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBwcmVmZXJlbmNpYXNOb3RpZmljYWNhbyA9IG15c3FsVGFibGUoXCJwcmVmZXJlbmNpYXNfbm90aWZpY2FjYW9cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdXNlcklkOiBpbnQoXCJ1c2VySWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCkubm90TnVsbCgpLnVuaXF1ZSgpLFxuICBhdmlzb3M6IGJvb2xlYW4oXCJhdmlzb3NcIikuZGVmYXVsdCh0cnVlKSxcbiAgZXZlbnRvczogYm9vbGVhbihcImV2ZW50b3NcIikuZGVmYXVsdCh0cnVlKSxcbiAgdm90YWNvZXM6IGJvb2xlYW4oXCJ2b3RhY29lc1wiKS5kZWZhdWx0KHRydWUpLFxuICBjbGFzc2lmaWNhZG9zOiBib29sZWFuKFwiY2xhc3NpZmljYWRvc1wiKS5kZWZhdWx0KHRydWUpLFxuICBjYXJvbmFzOiBib29sZWFuKFwiY2Fyb25hc1wiKS5kZWZhdWx0KHRydWUpLFxuICBlbWFpbE5vdGlmaWNhY29lczogYm9vbGVhbihcImVtYWlsTm90aWZpY2Fjb2VzXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBlZmVpdG9UcmFuc2ljYW86IHZhcmNoYXIoXCJlZmVpdG9UcmFuc2ljYW9cIiwgeyBsZW5ndGg6IDUwIH0pLmRlZmF1bHQoXCJzbGlkZVwiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFByZWZlcmVuY2lhTm90aWZpY2FjYW8gPSB0eXBlb2YgcHJlZmVyZW5jaWFzTm90aWZpY2FjYW8uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0UHJlZmVyZW5jaWFOb3RpZmljYWNhbyA9IHR5cGVvZiBwcmVmZXJlbmNpYXNOb3RpZmljYWNhby4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFOVU5DSUFOVEVTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgYW51bmNpYW50ZXMgPSBteXNxbFRhYmxlKFwiYW51bmNpYW50ZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBjYXRlZ29yaWE6IG15c3FsRW51bShcImNhdGVnb3JpYVwiLCBbXCJjb21lcmNpb1wiLCBcInNlcnZpY29zXCIsIFwicHJvZmlzc2lvbmFpc1wiLCBcImFsaW1lbnRhY2FvXCIsIFwic2F1ZGVcIiwgXCJlZHVjYWNhb1wiLCBcIm91dHJvc1wiXSkuZGVmYXVsdChcIm91dHJvc1wiKS5ub3ROdWxsKCksXG4gIGxvZ29Vcmw6IHRleHQoXCJsb2dvVXJsXCIpLFxuICB0ZWxlZm9uZTogdmFyY2hhcihcInRlbGVmb25lXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgd2hhdHNhcHA6IHZhcmNoYXIoXCJ3aGF0c2FwcFwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGVtYWlsOiB2YXJjaGFyKFwiZW1haWxcIiwgeyBsZW5ndGg6IDMyMCB9KSxcbiAgd2Vic2l0ZTogdGV4dChcIndlYnNpdGVcIiksXG4gIGVuZGVyZWNvOiB0ZXh0KFwiZW5kZXJlY29cIiksXG4gIGluc3RhZ3JhbTogdmFyY2hhcihcImluc3RhZ3JhbVwiLCB7IGxlbmd0aDogMTAwIH0pLFxuICBmYWNlYm9vazogdmFyY2hhcihcImZhY2Vib29rXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIGhvcmFyaW9GdW5jaW9uYW1lbnRvOiB0ZXh0KFwiaG9yYXJpb0Z1bmNpb25hbWVudG9cIiksXG4gIHN0YXR1czogbXlzcWxFbnVtKFwic3RhdHVzQW51bmNpYW50ZVwiLCBbXCJhdGl2b1wiLCBcImluYXRpdm9cIl0pLmRlZmF1bHQoXCJhdGl2b1wiKS5ub3ROdWxsKCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBBbnVuY2lhbnRlID0gdHlwZW9mIGFudW5jaWFudGVzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEFudW5jaWFudGUgPSB0eXBlb2YgYW51bmNpYW50ZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBTsOaTkNJT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhbnVuY2lvcyA9IG15c3FsVGFibGUoXCJhbnVuY2lvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBhbnVuY2lhbnRlSWQ6IGludChcImFudW5jaWFudGVJZFwiKS5yZWZlcmVuY2VzKCgpID0+IGFudW5jaWFudGVzLmlkKS5ub3ROdWxsKCksXG4gIHJldmlzdGFJZDogaW50KFwicmV2aXN0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gcmV2aXN0YXMuaWQpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgYmFubmVyVXJsOiB0ZXh0KFwiYmFubmVyVXJsXCIpLFxuICBsaW5rRGVzdGlubzogdGV4dChcImxpbmtEZXN0aW5vXCIpLFxuICBwb3NpY2FvOiBteXNxbEVudW0oXCJwb3NpY2FvXCIsIFtcImNhcGFcIiwgXCJjb250cmFjYXBhXCIsIFwicGFnaW5hX2ludGVybmFcIiwgXCJyb2RhcGVcIiwgXCJsYXRlcmFsXCJdKS5kZWZhdWx0KFwicGFnaW5hX2ludGVybmFcIikubm90TnVsbCgpLFxuICB0YW1hbmhvOiBteXNxbEVudW0oXCJ0YW1hbmhvXCIsIFtcInBlcXVlbm9cIiwgXCJtZWRpb1wiLCBcImdyYW5kZVwiLCBcInBhZ2luYV9pbnRlaXJhXCJdKS5kZWZhdWx0KFwibWVkaW9cIikubm90TnVsbCgpLFxuICBkYXRhSW5pY2lvOiB0aW1lc3RhbXAoXCJkYXRhSW5pY2lvXCIpLFxuICBkYXRhRmltOiB0aW1lc3RhbXAoXCJkYXRhRmltXCIpLFxuICBzdGF0dXM6IG15c3FsRW51bShcInN0YXR1c0FudW5jaW9cIiwgW1wiYXRpdm9cIiwgXCJwYXVzYWRvXCIsIFwiZXhwaXJhZG9cIiwgXCJwZW5kZW50ZVwiXSkuZGVmYXVsdChcInBlbmRlbnRlXCIpLm5vdE51bGwoKSxcbiAgdmlzdWFsaXphY29lczogaW50KFwidmlzdWFsaXphY29lc1wiKS5kZWZhdWx0KDApLFxuICBjbGlxdWVzOiBpbnQoXCJjbGlxdWVzXCIpLmRlZmF1bHQoMCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBBbnVuY2lvID0gdHlwZW9mIGFudW5jaW9zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEFudW5jaW8gPSB0eXBlb2YgYW51bmNpb3MuJGluZmVySW5zZXJ0O1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IENPTVVOSUNBRE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgY29tdW5pY2Fkb3MgPSBteXNxbFRhYmxlKFwiY29tdW5pY2Fkb3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmV2aXN0YUlkOiBpbnQoXCJyZXZpc3RhSWRcIikucmVmZXJlbmNlcygoKSA9PiByZXZpc3Rhcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgYW5leG9Vcmw6IHRleHQoXCJhbmV4b1VybFwiKSxcbiAgYW5leG9Ob21lOiB2YXJjaGFyKFwiYW5leG9Ob21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGFuZXhvVGlwbzogdmFyY2hhcihcImFuZXhvVGlwb1wiLCB7IGxlbmd0aDogMTAwIH0pLFxuICBhbmV4b1RhbWFuaG86IGludChcImFuZXhvVGFtYW5ob1wiKSxcbiAgZGF0YVB1YmxpY2FjYW86IHRpbWVzdGFtcChcImRhdGFQdWJsaWNhY2FvXCIpLmRlZmF1bHROb3coKSxcbiAgZGVzdGFxdWU6IGJvb2xlYW4oXCJkZXN0YXF1ZVwiKS5kZWZhdWx0KGZhbHNlKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQ29tdW5pY2FkbyA9IHR5cGVvZiBjb211bmljYWRvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRDb211bmljYWRvID0gdHlwZW9mIGNvbXVuaWNhZG9zLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSDDgUxCVU5TIERFIEZPVE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgYWxidW5zID0gbXlzcWxUYWJsZShcImFsYnVuc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBjYXRlZ29yaWE6IG15c3FsRW51bShcImNhdGVnb3JpYVwiLCBbXCJldmVudG9zXCIsIFwib2JyYXNcIiwgXCJhcmVhc19jb211bnNcIiwgXCJtZWxob3JpYXNcIiwgXCJvdXRyb3NcIl0pLmRlZmF1bHQoXCJvdXRyb3NcIikubm90TnVsbCgpLFxuICBjYXBhVXJsOiB0ZXh0KFwiY2FwYVVybFwiKSxcbiAgZGF0YUV2ZW50bzogdGltZXN0YW1wKFwiZGF0YUV2ZW50b1wiKSxcbiAgZGVzdGFxdWU6IGJvb2xlYW4oXCJkZXN0YXF1ZVwiKS5kZWZhdWx0KGZhbHNlKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEFsYnVtID0gdHlwZW9mIGFsYnVucy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRBbGJ1bSA9IHR5cGVvZiBhbGJ1bnMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGT1RPUyBET1Mgw4FMQlVOUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGZvdG9zID0gbXlzcWxUYWJsZShcImZvdG9zXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGFsYnVtSWQ6IGludChcImFsYnVtSWRcIikucmVmZXJlbmNlcygoKSA9PiBhbGJ1bnMuaWQpLm5vdE51bGwoKSxcbiAgdXJsOiB0ZXh0KFwidXJsXCIpLm5vdE51bGwoKSxcbiAgbGVnZW5kYTogdmFyY2hhcihcImxlZ2VuZGFcIiwgeyBsZW5ndGg6IDUwMCB9KSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGxhcmd1cmE6IGludChcImxhcmd1cmFcIiksXG4gIGFsdHVyYTogaW50KFwiYWx0dXJhXCIpLFxuICB0YW1hbmhvOiBpbnQoXCJ0YW1hbmhvXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEZvdG8gPSB0eXBlb2YgZm90b3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Rm90byA9IHR5cGVvZiBmb3Rvcy4kaW5mZXJJbnNlcnQ7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRElDQVMgREUgU0VHVVJBTsOHQSA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGRpY2FzU2VndXJhbmNhID0gbXlzcWxUYWJsZShcImRpY2FzX3NlZ3VyYW5jYVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBjb250ZXVkbzogdGV4dChcImNvbnRldWRvXCIpLm5vdE51bGwoKSxcbiAgY2F0ZWdvcmlhOiBteXNxbEVudW0oXCJjYXRlZ29yaWFcIiwgW1xuICAgIFwiZ2VyYWxcIixcbiAgICBcImluY2VuZGlvXCIsXG4gICAgXCJyb3Vib1wiLFxuICAgIFwiY3JpYW5jYXNcIixcbiAgICBcImlkb3Nvc1wiLFxuICAgIFwiZGlnaXRhbFwiLFxuICAgIFwidmVpY3Vsb3NcIlxuICBdKS5kZWZhdWx0KFwiZ2VyYWxcIiksXG4gIGljb25lOiB2YXJjaGFyKFwiaWNvbmVcIiwgeyBsZW5ndGg6IDUwIH0pLmRlZmF1bHQoXCJzaGllbGRcIiksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBEaWNhU2VndXJhbmNhID0gdHlwZW9mIGRpY2FzU2VndXJhbmNhLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydERpY2FTZWd1cmFuY2EgPSB0eXBlb2YgZGljYXNTZWd1cmFuY2EuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBSRUdSQVMgRSBOT1JNQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCByZWdyYXNOb3JtYXMgPSBteXNxbFRhYmxlKFwicmVncmFzX25vcm1hc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBjb250ZXVkbzogdGV4dChcImNvbnRldWRvXCIpLm5vdE51bGwoKSxcbiAgY2F0ZWdvcmlhOiBteXNxbEVudW0oXCJjYXRlZ29yaWFcIiwgW1xuICAgIFwiZ2VyYWxcIixcbiAgICBcImNvbnZpdmVuY2lhXCIsXG4gICAgXCJhcmVhc19jb211bnNcIixcbiAgICBcImFuaW1haXNcIixcbiAgICBcImJhcnVsaG9cIixcbiAgICBcImVzdGFjaW9uYW1lbnRvXCIsXG4gICAgXCJtdWRhbmNhc1wiLFxuICAgIFwib2JyYXNcIixcbiAgICBcInBpc2NpbmFcIixcbiAgICBcInNhbGFvX2Zlc3Rhc1wiXG4gIF0pLmRlZmF1bHQoXCJnZXJhbFwiKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFJlZ3JhTm9ybWEgPSB0eXBlb2YgcmVncmFzTm9ybWFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFJlZ3JhTm9ybWEgPSB0eXBlb2YgcmVncmFzTm9ybWFzLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSU1BR0VOUyBERSBSRUFMSVpBw4fDlUVTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgaW1hZ2Vuc1JlYWxpemFjb2VzID0gbXlzcWxUYWJsZShcImltYWdlbnNfcmVhbGl6YWNvZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgcmVhbGl6YWNhb0lkOiBpbnQoXCJyZWFsaXphY2FvSWRcIikucmVmZXJlbmNlcygoKSA9PiByZWFsaXphY29lcy5pZCkubm90TnVsbCgpLFxuICBpbWFnZW1Vcmw6IHRleHQoXCJpbWFnZW1VcmxcIikubm90TnVsbCgpLFxuICBsZWdlbmRhOiB2YXJjaGFyKFwibGVnZW5kYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBJbWFnZW1SZWFsaXphY2FvID0gdHlwZW9mIGltYWdlbnNSZWFsaXphY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRJbWFnZW1SZWFsaXphY2FvID0gdHlwZW9mIGltYWdlbnNSZWFsaXphY29lcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgTUVMSE9SSUFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgaW1hZ2Vuc01lbGhvcmlhcyA9IG15c3FsVGFibGUoXCJpbWFnZW5zX21lbGhvcmlhc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBtZWxob3JpYUlkOiBpbnQoXCJtZWxob3JpYUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gbWVsaG9yaWFzLmlkKS5ub3ROdWxsKCksXG4gIGltYWdlbVVybDogdGV4dChcImltYWdlbVVybFwiKS5ub3ROdWxsKCksXG4gIGxlZ2VuZGE6IHZhcmNoYXIoXCJsZWdlbmRhXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEltYWdlbU1lbGhvcmlhID0gdHlwZW9mIGltYWdlbnNNZWxob3JpYXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0SW1hZ2VtTWVsaG9yaWEgPSB0eXBlb2YgaW1hZ2Vuc01lbGhvcmlhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgQVFVSVNJw4fDlUVTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgaW1hZ2Vuc0FxdWlzaWNvZXMgPSBteXNxbFRhYmxlKFwiaW1hZ2Vuc19hcXVpc2ljb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGFxdWlzaWNhb0lkOiBpbnQoXCJhcXVpc2ljYW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGFxdWlzaWNvZXMuaWQpLm5vdE51bGwoKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLm5vdE51bGwoKSxcbiAgbGVnZW5kYTogdmFyY2hhcihcImxlZ2VuZGFcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgSW1hZ2VtQXF1aXNpY2FvID0gdHlwZW9mIGltYWdlbnNBcXVpc2ljb2VzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEltYWdlbUFxdWlzaWNhbyA9IHR5cGVvZiBpbWFnZW5zQXF1aXNpY29lcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgQUNIQURPUyBFIFBFUkRJRE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgaW1hZ2Vuc0FjaGFkb3NQZXJkaWRvcyA9IG15c3FsVGFibGUoXCJpbWFnZW5zX2FjaGFkb3NfcGVyZGlkb3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgYWNoYWRvUGVyZGlkb0lkOiBpbnQoXCJhY2hhZG9QZXJkaWRvSWRcIikucmVmZXJlbmNlcygoKSA9PiBhY2hhZG9zUGVyZGlkb3MuaWQpLm5vdE51bGwoKSxcbiAgaW1hZ2VtVXJsOiB0ZXh0KFwiaW1hZ2VtVXJsXCIpLm5vdE51bGwoKSxcbiAgbGVnZW5kYTogdmFyY2hhcihcImxlZ2VuZGFcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgSW1hZ2VtQWNoYWRvUGVyZGlkbyA9IHR5cGVvZiBpbWFnZW5zQWNoYWRvc1BlcmRpZG9zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEltYWdlbUFjaGFkb1BlcmRpZG8gPSB0eXBlb2YgaW1hZ2Vuc0FjaGFkb3NQZXJkaWRvcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgRSBBTkVYT1MgREUgVkFHQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBpbWFnZW5zVmFnYXMgPSBteXNxbFRhYmxlKFwiaW1hZ2Vuc192YWdhc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICB2YWdhSWQ6IGludChcInZhZ2FJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHZhZ2FzRXN0YWNpb25hbWVudG8uaWQpLm5vdE51bGwoKSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJpbWFnZW1cIiwgXCJhbmV4b1wiXSkuZGVmYXVsdChcImltYWdlbVwiKSxcbiAgdXJsOiB0ZXh0KFwidXJsXCIpLm5vdE51bGwoKSxcbiAgbm9tZTogdmFyY2hhcihcIm5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbWltZVR5cGU6IHZhcmNoYXIoXCJtaW1lVHlwZVwiLCB7IGxlbmd0aDogMTAwIH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBJbWFnZW1WYWdhID0gdHlwZW9mIGltYWdlbnNWYWdhcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRJbWFnZW1WYWdhID0gdHlwZW9mIGltYWdlbnNWYWdhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZBVk9SSVRPUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGZhdm9yaXRvcyA9IG15c3FsVGFibGUoXCJmYXZvcml0b3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdXNlcklkOiBpbnQoXCJ1c2VySWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCkubm90TnVsbCgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKSxcbiAgdGlwb0l0ZW06IG15c3FsRW51bShcInRpcG9JdGVtXCIsIFtcbiAgICBcImF2aXNvXCIsXG4gICAgXCJjb211bmljYWRvXCIsXG4gICAgXCJldmVudG9cIixcbiAgICBcInJlYWxpemFjYW9cIixcbiAgICBcIm1lbGhvcmlhXCIsXG4gICAgXCJhcXVpc2ljYW9cIixcbiAgICBcInZvdGFjYW9cIixcbiAgICBcImNsYXNzaWZpY2Fkb1wiLFxuICAgIFwiY2Fyb25hXCIsXG4gICAgXCJhY2hhZG9fcGVyZGlkb1wiLFxuICAgIFwiZnVuY2lvbmFyaW9cIixcbiAgICBcImdhbGVyaWFcIixcbiAgICBcImNhcmRfc2VjYW9cIlxuICBdKS5ub3ROdWxsKCksXG4gIGl0ZW1JZDogaW50KFwiaXRlbUlkXCIpLFxuICBjYXJkU2VjYW9JZDogdmFyY2hhcihcImNhcmRTZWNhb0lkXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBGYXZvcml0byA9IHR5cGVvZiBmYXZvcml0b3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0RmF2b3JpdG8gPSB0eXBlb2YgZmF2b3JpdG9zLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWSVNUT1JJQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB2aXN0b3JpYXMgPSBteXNxbFRhYmxlKFwidmlzdG9yaWFzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgcHJvdG9jb2xvOiB2YXJjaGFyKFwicHJvdG9jb2xvXCIsIHsgbGVuZ3RoOiAyMCB9KS5ub3ROdWxsKCkudW5pcXVlKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgc3VidGl0dWxvOiB2YXJjaGFyKFwic3VidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgb2JzZXJ2YWNvZXM6IHRleHQoXCJvYnNlcnZhY29lc1wiKSxcbiAgcmVzcG9uc2F2ZWxJZDogaW50KFwicmVzcG9uc2F2ZWxJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgcmVzcG9uc2F2ZWxOb21lOiB2YXJjaGFyKFwicmVzcG9uc2F2ZWxOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGxvY2FsaXphY2FvOiB2YXJjaGFyKFwibG9jYWxpemFjYW9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbGF0aXR1ZGU6IGRlY2ltYWwoXCJsYXRpdHVkZVwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiA4IH0pLFxuICBsb25naXR1ZGU6IGRlY2ltYWwoXCJsb25naXR1ZGVcIiwgeyBwcmVjaXNpb246IDExLCBzY2FsZTogOCB9KSxcbiAgZW5kZXJlY29HZW86IHRleHQoXCJlbmRlcmVjb0dlb1wiKSxcbiAgZGF0YUFnZW5kYWRhOiB0aW1lc3RhbXAoXCJkYXRhQWdlbmRhZGFcIiksXG4gIGRhdGFSZWFsaXphZGE6IHRpbWVzdGFtcChcImRhdGFSZWFsaXphZGFcIiksXG4gIHN0YXR1czogbXlzcWxFbnVtKFwic3RhdHVzXCIsIFtcInBlbmRlbnRlXCIsIFwicmVhbGl6YWRhXCIsIFwiYWNhb19uZWNlc3NhcmlhXCIsIFwiZmluYWxpemFkYVwiLCBcInJlYWJlcnRhXCJdKS5kZWZhdWx0KFwicGVuZGVudGVcIikubm90TnVsbCgpLFxuICBwcmlvcmlkYWRlOiBteXNxbEVudW0oXCJwcmlvcmlkYWRlXCIsIFtcImJhaXhhXCIsIFwibWVkaWFcIiwgXCJhbHRhXCIsIFwidXJnZW50ZVwiXSkuZGVmYXVsdChcIm1lZGlhXCIpLFxuICB0aXBvOiB2YXJjaGFyKFwidGlwb1wiLCB7IGxlbmd0aDogMTAwIH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVmlzdG9yaWEgPSB0eXBlb2YgdmlzdG9yaWFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFZpc3RvcmlhID0gdHlwZW9mIHZpc3Rvcmlhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgVklTVE9SSUFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgdmlzdG9yaWFJbWFnZW5zID0gbXlzcWxUYWJsZShcInZpc3RvcmlhX2ltYWdlbnNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdmlzdG9yaWFJZDogaW50KFwidmlzdG9yaWFJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHZpc3Rvcmlhcy5pZCkubm90TnVsbCgpLFxuICB1cmw6IHRleHQoXCJ1cmxcIikubm90TnVsbCgpLFxuICBsZWdlbmRhOiB2YXJjaGFyKFwibGVnZW5kYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBWaXN0b3JpYUltYWdlbSA9IHR5cGVvZiB2aXN0b3JpYUltYWdlbnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VmlzdG9yaWFJbWFnZW0gPSB0eXBlb2YgdmlzdG9yaWFJbWFnZW5zLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVElNRUxJTkUgREUgVklTVE9SSUFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgdmlzdG9yaWFUaW1lbGluZSA9IG15c3FsVGFibGUoXCJ2aXN0b3JpYV90aW1lbGluZVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICB2aXN0b3JpYUlkOiBpbnQoXCJ2aXN0b3JpYUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdmlzdG9yaWFzLmlkKS5ub3ROdWxsKCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiYWJlcnR1cmFcIiwgXCJhdHVhbGl6YWNhb1wiLCBcInN0YXR1c19hbHRlcmFkb1wiLCBcImNvbWVudGFyaW9cIiwgXCJpbWFnZW1fYWRpY2lvbmFkYVwiLCBcInJlc3BvbnNhdmVsX2FsdGVyYWRvXCIsIFwiZmVjaGFtZW50b1wiLCBcInJlYWJlcnR1cmFcIl0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLm5vdE51bGwoKSxcbiAgc3RhdHVzQW50ZXJpb3I6IHZhcmNoYXIoXCJzdGF0dXNBbnRlcmlvclwiLCB7IGxlbmd0aDogNTAgfSksXG4gIHN0YXR1c05vdm86IHZhcmNoYXIoXCJzdGF0dXNOb3ZvXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgdXNlcklkOiBpbnQoXCJ1c2VySWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIHVzZXJOb21lOiB2YXJjaGFyKFwidXNlck5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBWaXN0b3JpYVRpbWVsaW5lRXZlbnRvID0gdHlwZW9mIHZpc3RvcmlhVGltZWxpbmUuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VmlzdG9yaWFUaW1lbGluZUV2ZW50byA9IHR5cGVvZiB2aXN0b3JpYVRpbWVsaW5lLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gTUFOVVRFTsOHw5VFUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG1hbnV0ZW5jb2VzID0gbXlzcWxUYWJsZShcIm1hbnV0ZW5jb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgcHJvdG9jb2xvOiB2YXJjaGFyKFwicHJvdG9jb2xvXCIsIHsgbGVuZ3RoOiAyMCB9KS5ub3ROdWxsKCkudW5pcXVlKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgc3VidGl0dWxvOiB2YXJjaGFyKFwic3VidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgb2JzZXJ2YWNvZXM6IHRleHQoXCJvYnNlcnZhY29lc1wiKSxcbiAgcmVzcG9uc2F2ZWxJZDogaW50KFwicmVzcG9uc2F2ZWxJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgcmVzcG9uc2F2ZWxOb21lOiB2YXJjaGFyKFwicmVzcG9uc2F2ZWxOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGxvY2FsaXphY2FvOiB2YXJjaGFyKFwibG9jYWxpemFjYW9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbGF0aXR1ZGU6IGRlY2ltYWwoXCJsYXRpdHVkZVwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiA4IH0pLFxuICBsb25naXR1ZGU6IGRlY2ltYWwoXCJsb25naXR1ZGVcIiwgeyBwcmVjaXNpb246IDExLCBzY2FsZTogOCB9KSxcbiAgZW5kZXJlY29HZW86IHRleHQoXCJlbmRlcmVjb0dlb1wiKSxcbiAgZGF0YUFnZW5kYWRhOiB0aW1lc3RhbXAoXCJkYXRhQWdlbmRhZGFcIiksXG4gIGRhdGFSZWFsaXphZGE6IHRpbWVzdGFtcChcImRhdGFSZWFsaXphZGFcIiksXG4gIHN0YXR1czogbXlzcWxFbnVtKFwic3RhdHVzXCIsIFtcInBlbmRlbnRlXCIsIFwicmVhbGl6YWRhXCIsIFwiYWNhb19uZWNlc3NhcmlhXCIsIFwiZmluYWxpemFkYVwiLCBcInJlYWJlcnRhXCJdKS5kZWZhdWx0KFwicGVuZGVudGVcIikubm90TnVsbCgpLFxuICBwcmlvcmlkYWRlOiBteXNxbEVudW0oXCJwcmlvcmlkYWRlXCIsIFtcImJhaXhhXCIsIFwibWVkaWFcIiwgXCJhbHRhXCIsIFwidXJnZW50ZVwiXSkuZGVmYXVsdChcIm1lZGlhXCIpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcInByZXZlbnRpdmFcIiwgXCJjb3JyZXRpdmFcIiwgXCJlbWVyZ2VuY2lhbFwiLCBcInByb2dyYW1hZGFcIl0pLmRlZmF1bHQoXCJjb3JyZXRpdmFcIiksXG4gIHRlbXBvRXN0aW1hZG9EaWFzOiBpbnQoXCJ0ZW1wb0VzdGltYWRvRGlhc1wiKS5kZWZhdWx0KDApLFxuICB0ZW1wb0VzdGltYWRvSG9yYXM6IGludChcInRlbXBvRXN0aW1hZG9Ib3Jhc1wiKS5kZWZhdWx0KDApLFxuICB0ZW1wb0VzdGltYWRvTWludXRvczogaW50KFwidGVtcG9Fc3RpbWFkb01pbnV0b3NcIikuZGVmYXVsdCgwKSxcbiAgZm9ybmVjZWRvcjogdmFyY2hhcihcImZvcm5lY2Vkb3JcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE1hbnV0ZW5jYW8gPSB0eXBlb2YgbWFudXRlbmNvZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0TWFudXRlbmNhbyA9IHR5cGVvZiBtYW51dGVuY29lcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgTUFOVVRFTsOHw5VFUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG1hbnV0ZW5jYW9JbWFnZW5zID0gbXlzcWxUYWJsZShcIm1hbnV0ZW5jYW9faW1hZ2Vuc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBtYW51dGVuY2FvSWQ6IGludChcIm1hbnV0ZW5jYW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IG1hbnV0ZW5jb2VzLmlkKS5ub3ROdWxsKCksXG4gIHVybDogdGV4dChcInVybFwiKS5ub3ROdWxsKCksXG4gIGxlZ2VuZGE6IHZhcmNoYXIoXCJsZWdlbmRhXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE1hbnV0ZW5jYW9JbWFnZW0gPSB0eXBlb2YgbWFudXRlbmNhb0ltYWdlbnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0TWFudXRlbmNhb0ltYWdlbSA9IHR5cGVvZiBtYW51dGVuY2FvSW1hZ2Vucy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRJTUVMSU5FIERFIE1BTlVURU7Dh8OVRVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBtYW51dGVuY2FvVGltZWxpbmUgPSBteXNxbFRhYmxlKFwibWFudXRlbmNhb190aW1lbGluZVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBtYW51dGVuY2FvSWQ6IGludChcIm1hbnV0ZW5jYW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IG1hbnV0ZW5jb2VzLmlkKS5ub3ROdWxsKCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiYWJlcnR1cmFcIiwgXCJhdHVhbGl6YWNhb1wiLCBcInN0YXR1c19hbHRlcmFkb1wiLCBcImNvbWVudGFyaW9cIiwgXCJpbWFnZW1fYWRpY2lvbmFkYVwiLCBcInJlc3BvbnNhdmVsX2FsdGVyYWRvXCIsIFwiZmVjaGFtZW50b1wiLCBcInJlYWJlcnR1cmFcIl0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLm5vdE51bGwoKSxcbiAgc3RhdHVzQW50ZXJpb3I6IHZhcmNoYXIoXCJzdGF0dXNBbnRlcmlvclwiLCB7IGxlbmd0aDogNTAgfSksXG4gIHN0YXR1c05vdm86IHZhcmNoYXIoXCJzdGF0dXNOb3ZvXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgdXNlcklkOiBpbnQoXCJ1c2VySWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIHVzZXJOb21lOiB2YXJjaGFyKFwidXNlck5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBNYW51dGVuY2FvVGltZWxpbmVFdmVudG8gPSB0eXBlb2YgbWFudXRlbmNhb1RpbWVsaW5lLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE1hbnV0ZW5jYW9UaW1lbGluZUV2ZW50byA9IHR5cGVvZiBtYW51dGVuY2FvVGltZWxpbmUuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBPQ09SUsOKTkNJQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBvY29ycmVuY2lhcyA9IG15c3FsVGFibGUoXCJvY29ycmVuY2lhc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHByb3RvY29sbzogdmFyY2hhcihcInByb3RvY29sb1wiLCB7IGxlbmd0aDogMjAgfSkubm90TnVsbCgpLnVuaXF1ZSgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIHN1YnRpdHVsbzogdmFyY2hhcihcInN1YnRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIG9ic2VydmFjb2VzOiB0ZXh0KFwib2JzZXJ2YWNvZXNcIiksXG4gIHJlcG9ydGFkb1BvcklkOiBpbnQoXCJyZXBvcnRhZG9Qb3JJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgcmVwb3J0YWRvUG9yTm9tZTogdmFyY2hhcihcInJlcG9ydGFkb1Bvck5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgcmVzcG9uc2F2ZWxJZDogaW50KFwicmVzcG9uc2F2ZWxJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgcmVzcG9uc2F2ZWxOb21lOiB2YXJjaGFyKFwicmVzcG9uc2F2ZWxOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGxvY2FsaXphY2FvOiB2YXJjaGFyKFwibG9jYWxpemFjYW9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbGF0aXR1ZGU6IGRlY2ltYWwoXCJsYXRpdHVkZVwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiA4IH0pLFxuICBsb25naXR1ZGU6IGRlY2ltYWwoXCJsb25naXR1ZGVcIiwgeyBwcmVjaXNpb246IDExLCBzY2FsZTogOCB9KSxcbiAgZW5kZXJlY29HZW86IHRleHQoXCJlbmRlcmVjb0dlb1wiKSxcbiAgZGF0YU9jb3JyZW5jaWE6IHRpbWVzdGFtcChcImRhdGFPY29ycmVuY2lhXCIpLFxuICBzdGF0dXM6IG15c3FsRW51bShcInN0YXR1c1wiLCBbXCJwZW5kZW50ZVwiLCBcInJlYWxpemFkYVwiLCBcImFjYW9fbmVjZXNzYXJpYVwiLCBcImZpbmFsaXphZGFcIiwgXCJyZWFiZXJ0YVwiXSkuZGVmYXVsdChcInBlbmRlbnRlXCIpLm5vdE51bGwoKSxcbiAgcHJpb3JpZGFkZTogbXlzcWxFbnVtKFwicHJpb3JpZGFkZVwiLCBbXCJiYWl4YVwiLCBcIm1lZGlhXCIsIFwiYWx0YVwiLCBcInVyZ2VudGVcIl0pLmRlZmF1bHQoXCJtZWRpYVwiKSxcbiAgY2F0ZWdvcmlhOiBteXNxbEVudW0oXCJjYXRlZ29yaWFcIiwgW1wic2VndXJhbmNhXCIsIFwiYmFydWxob1wiLCBcIm1hbnV0ZW5jYW9cIiwgXCJjb252aXZlbmNpYVwiLCBcImFuaW1haXNcIiwgXCJlc3RhY2lvbmFtZW50b1wiLCBcImxpbXBlemFcIiwgXCJvdXRyb3NcIl0pLmRlZmF1bHQoXCJvdXRyb3NcIiksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPY29ycmVuY2lhID0gdHlwZW9mIG9jb3JyZW5jaWFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE9jb3JyZW5jaWEgPSB0eXBlb2Ygb2NvcnJlbmNpYXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBJTUFHRU5TIERFIE9DT1JSw4pOQ0lBUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG9jb3JyZW5jaWFJbWFnZW5zID0gbXlzcWxUYWJsZShcIm9jb3JyZW5jaWFfaW1hZ2Vuc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBvY29ycmVuY2lhSWQ6IGludChcIm9jb3JyZW5jaWFJZFwiKS5yZWZlcmVuY2VzKCgpID0+IG9jb3JyZW5jaWFzLmlkKS5ub3ROdWxsKCksXG4gIHVybDogdGV4dChcInVybFwiKS5ub3ROdWxsKCksXG4gIGxlZ2VuZGE6IHZhcmNoYXIoXCJsZWdlbmRhXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9jb3JyZW5jaWFJbWFnZW0gPSB0eXBlb2Ygb2NvcnJlbmNpYUltYWdlbnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T2NvcnJlbmNpYUltYWdlbSA9IHR5cGVvZiBvY29ycmVuY2lhSW1hZ2Vucy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRJTUVMSU5FIERFIE9DT1JSw4pOQ0lBUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG9jb3JyZW5jaWFUaW1lbGluZSA9IG15c3FsVGFibGUoXCJvY29ycmVuY2lhX3RpbWVsaW5lXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIG9jb3JyZW5jaWFJZDogaW50KFwib2NvcnJlbmNpYUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gb2NvcnJlbmNpYXMuaWQpLm5vdE51bGwoKSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJhYmVydHVyYVwiLCBcImF0dWFsaXphY2FvXCIsIFwic3RhdHVzX2FsdGVyYWRvXCIsIFwiY29tZW50YXJpb1wiLCBcImltYWdlbV9hZGljaW9uYWRhXCIsIFwicmVzcG9uc2F2ZWxfYWx0ZXJhZG9cIiwgXCJmZWNoYW1lbnRvXCIsIFwicmVhYmVydHVyYVwiXSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIikubm90TnVsbCgpLFxuICBzdGF0dXNBbnRlcmlvcjogdmFyY2hhcihcInN0YXR1c0FudGVyaW9yXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgc3RhdHVzTm92bzogdmFyY2hhcihcInN0YXR1c05vdm9cIiwgeyBsZW5ndGg6IDUwIH0pLFxuICB1c2VySWQ6IGludChcInVzZXJJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgdXNlck5vbWU6IHZhcmNoYXIoXCJ1c2VyTm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9jb3JyZW5jaWFUaW1lbGluZUV2ZW50byA9IHR5cGVvZiBvY29ycmVuY2lhVGltZWxpbmUuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T2NvcnJlbmNpYVRpbWVsaW5lRXZlbnRvID0gdHlwZW9mIG9jb3JyZW5jaWFUaW1lbGluZS4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IENIRUNLTElTVFMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBjaGVja2xpc3RzID0gbXlzcWxUYWJsZShcImNoZWNrbGlzdHNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBwcm90b2NvbG86IHZhcmNoYXIoXCJwcm90b2NvbG9cIiwgeyBsZW5ndGg6IDIwIH0pLm5vdE51bGwoKS51bmlxdWUoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBzdWJ0aXR1bG86IHZhcmNoYXIoXCJzdWJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBvYnNlcnZhY29lczogdGV4dChcIm9ic2VydmFjb2VzXCIpLFxuICByZXNwb25zYXZlbElkOiBpbnQoXCJyZXNwb25zYXZlbElkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICByZXNwb25zYXZlbE5vbWU6IHZhcmNoYXIoXCJyZXNwb25zYXZlbE5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbG9jYWxpemFjYW86IHZhcmNoYXIoXCJsb2NhbGl6YWNhb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBsYXRpdHVkZTogZGVjaW1hbChcImxhdGl0dWRlXCIsIHsgcHJlY2lzaW9uOiAxMCwgc2NhbGU6IDggfSksXG4gIGxvbmdpdHVkZTogZGVjaW1hbChcImxvbmdpdHVkZVwiLCB7IHByZWNpc2lvbjogMTEsIHNjYWxlOiA4IH0pLFxuICBlbmRlcmVjb0dlbzogdGV4dChcImVuZGVyZWNvR2VvXCIpLFxuICBkYXRhQWdlbmRhZGE6IHRpbWVzdGFtcChcImRhdGFBZ2VuZGFkYVwiKSxcbiAgZGF0YVJlYWxpemFkYTogdGltZXN0YW1wKFwiZGF0YVJlYWxpemFkYVwiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wicGVuZGVudGVcIiwgXCJyZWFsaXphZGFcIiwgXCJhY2FvX25lY2Vzc2FyaWFcIiwgXCJmaW5hbGl6YWRhXCIsIFwicmVhYmVydGFcIl0pLmRlZmF1bHQoXCJwZW5kZW50ZVwiKS5ub3ROdWxsKCksXG4gIHByaW9yaWRhZGU6IG15c3FsRW51bShcInByaW9yaWRhZGVcIiwgW1wiYmFpeGFcIiwgXCJtZWRpYVwiLCBcImFsdGFcIiwgXCJ1cmdlbnRlXCJdKS5kZWZhdWx0KFwibWVkaWFcIiksXG4gIGNhdGVnb3JpYTogdmFyY2hhcihcImNhdGVnb3JpYVwiLCB7IGxlbmd0aDogMTAwIH0pLFxuICB0b3RhbEl0ZW5zOiBpbnQoXCJ0b3RhbEl0ZW5zXCIpLmRlZmF1bHQoMCksXG4gIGl0ZW5zQ29tcGxldG9zOiBpbnQoXCJpdGVuc0NvbXBsZXRvc1wiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQ2hlY2tsaXN0ID0gdHlwZW9mIGNoZWNrbGlzdHMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Q2hlY2tsaXN0ID0gdHlwZW9mIGNoZWNrbGlzdHMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBJVEVOUyBETyBDSEVDS0xJU1QgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBjaGVja2xpc3RJdGVucyA9IG15c3FsVGFibGUoXCJjaGVja2xpc3RfaXRlbnNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY2hlY2tsaXN0SWQ6IGludChcImNoZWNrbGlzdElkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY2hlY2tsaXN0cy5pZCkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHZhcmNoYXIoXCJkZXNjcmljYW9cIiwgeyBsZW5ndGg6IDUwMCB9KS5ub3ROdWxsKCksXG4gIGNvbXBsZXRvOiBib29sZWFuKFwiY29tcGxldG9cIikuZGVmYXVsdChmYWxzZSksXG4gIG9ic2VydmFjYW86IHRleHQoXCJvYnNlcnZhY2FvXCIpLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENoZWNrbGlzdEl0ZW0gPSB0eXBlb2YgY2hlY2tsaXN0SXRlbnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Q2hlY2tsaXN0SXRlbSA9IHR5cGVvZiBjaGVja2xpc3RJdGVucy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IElNQUdFTlMgREUgQ0hFQ0tMSVNUUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGNoZWNrbGlzdEltYWdlbnMgPSBteXNxbFRhYmxlKFwiY2hlY2tsaXN0X2ltYWdlbnNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY2hlY2tsaXN0SWQ6IGludChcImNoZWNrbGlzdElkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY2hlY2tsaXN0cy5pZCkubm90TnVsbCgpLFxuICB1cmw6IHRleHQoXCJ1cmxcIikubm90TnVsbCgpLFxuICBsZWdlbmRhOiB2YXJjaGFyKFwibGVnZW5kYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBDaGVja2xpc3RJbWFnZW0gPSB0eXBlb2YgY2hlY2tsaXN0SW1hZ2Vucy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRDaGVja2xpc3RJbWFnZW0gPSB0eXBlb2YgY2hlY2tsaXN0SW1hZ2Vucy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFRJTUVMSU5FIERFIENIRUNLTElTVFMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBjaGVja2xpc3RUaW1lbGluZSA9IG15c3FsVGFibGUoXCJjaGVja2xpc3RfdGltZWxpbmVcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY2hlY2tsaXN0SWQ6IGludChcImNoZWNrbGlzdElkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY2hlY2tsaXN0cy5pZCkubm90TnVsbCgpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcImFiZXJ0dXJhXCIsIFwiYXR1YWxpemFjYW9cIiwgXCJzdGF0dXNfYWx0ZXJhZG9cIiwgXCJjb21lbnRhcmlvXCIsIFwiaW1hZ2VtX2FkaWNpb25hZGFcIiwgXCJyZXNwb25zYXZlbF9hbHRlcmFkb1wiLCBcIml0ZW1fY29tcGxldG9cIiwgXCJmZWNoYW1lbnRvXCIsIFwicmVhYmVydHVyYVwiXSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIikubm90TnVsbCgpLFxuICBzdGF0dXNBbnRlcmlvcjogdmFyY2hhcihcInN0YXR1c0FudGVyaW9yXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgc3RhdHVzTm92bzogdmFyY2hhcihcInN0YXR1c05vdm9cIiwgeyBsZW5ndGg6IDUwIH0pLFxuICB1c2VySWQ6IGludChcInVzZXJJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgdXNlck5vbWU6IHZhcmNoYXIoXCJ1c2VyTm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENoZWNrbGlzdFRpbWVsaW5lRXZlbnRvID0gdHlwZW9mIGNoZWNrbGlzdFRpbWVsaW5lLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENoZWNrbGlzdFRpbWVsaW5lRXZlbnRvID0gdHlwZW9mIGNoZWNrbGlzdFRpbWVsaW5lLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBNRU1CUk9TIERBIEVRVUlQRSA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IG1lbWJyb3NFcXVpcGUgPSBteXNxbFRhYmxlKFwibWVtYnJvc19lcXVpcGVcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgd2hhdHNhcHA6IHZhcmNoYXIoXCJ3aGF0c2FwcFwiLCB7IGxlbmd0aDogMjAgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIGNhcmdvOiB2YXJjaGFyKFwiY2FyZ29cIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgZm90b1VybDogdGV4dChcImZvdG9VcmxcIiksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKS5ub3ROdWxsKCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBNZW1icm9FcXVpcGUgPSB0eXBlb2YgbWVtYnJvc0VxdWlwZS4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRNZW1icm9FcXVpcGUgPSB0eXBlb2YgbWVtYnJvc0VxdWlwZS4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IExJTktTIENPTVBBUlRJTEjDgVZFSVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBsaW5rc0NvbXBhcnRpbGhhdmVpcyA9IG15c3FsVGFibGUoXCJsaW5rc19jb21wYXJ0aWxoYXZlaXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcInZpc3RvcmlhXCIsIFwibWFudXRlbmNhb1wiLCBcIm9jb3JyZW5jaWFcIiwgXCJjaGVja2xpc3RcIl0pLm5vdE51bGwoKSxcbiAgaXRlbUlkOiBpbnQoXCJpdGVtSWRcIikubm90TnVsbCgpLFxuICB0b2tlbjogdmFyY2hhcihcInRva2VuXCIsIHsgbGVuZ3RoOiA2NCB9KS5ub3ROdWxsKCkudW5pcXVlKCksXG4gIGVkaXRhdmVsOiBib29sZWFuKFwiZWRpdGF2ZWxcIikuZGVmYXVsdChmYWxzZSkubm90TnVsbCgpLFxuICBleHBpcmFjYW9Ib3JhczogaW50KFwiZXhwaXJhY2FvSG9yYXNcIikuZGVmYXVsdCgxNjgpLCAvLyA3IGRpYXMgcG9yIHBhZHLDo29cbiAgYWNlc3NvczogaW50KFwiYWNlc3Nvc1wiKS5kZWZhdWx0KDApLm5vdE51bGwoKSxcbiAgY3JpYWRvUG9ySWQ6IGludChcImNyaWFkb1BvcklkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICBjcmlhZG9Qb3JOb21lOiB2YXJjaGFyKFwiY3JpYWRvUG9yTm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSkubm90TnVsbCgpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgTGlua0NvbXBhcnRpbGhhdmVsID0gdHlwZW9mIGxpbmtzQ29tcGFydGlsaGF2ZWlzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydExpbmtDb21wYXJ0aWxoYXZlbCA9IHR5cGVvZiBsaW5rc0NvbXBhcnRpbGhhdmVpcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhJU1TDk1JJQ08gREUgQ09NUEFSVElMSEFNRU5UT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBoaXN0b3JpY29Db21wYXJ0aWxoYW1lbnRvcyA9IG15c3FsVGFibGUoXCJoaXN0b3JpY29fY29tcGFydGlsaGFtZW50b3NcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgbGlua0lkOiBpbnQoXCJsaW5rSWRcIikucmVmZXJlbmNlcygoKSA9PiBsaW5rc0NvbXBhcnRpbGhhdmVpcy5pZCkubm90TnVsbCgpLFxuICBtZW1icm9JZDogaW50KFwibWVtYnJvSWRcIikucmVmZXJlbmNlcygoKSA9PiBtZW1icm9zRXF1aXBlLmlkKSxcbiAgbWVtYnJvTm9tZTogdmFyY2hhcihcIm1lbWJyb05vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgbWVtYnJvV2hhdHNhcHA6IHZhcmNoYXIoXCJtZW1icm9XaGF0c2FwcFwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGNvbXBhcnRpbGhhZG9Qb3JJZDogaW50KFwiY29tcGFydGlsaGFkb1BvcklkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICBjb21wYXJ0aWxoYWRvUG9yTm9tZTogdmFyY2hhcihcImNvbXBhcnRpbGhhZG9Qb3JOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgSGlzdG9yaWNvQ29tcGFydGlsaGFtZW50byA9IHR5cGVvZiBoaXN0b3JpY29Db21wYXJ0aWxoYW1lbnRvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRIaXN0b3JpY29Db21wYXJ0aWxoYW1lbnRvID0gdHlwZW9mIGhpc3Rvcmljb0NvbXBhcnRpbGhhbWVudG9zLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDT01FTlTDgVJJT1MgRU0gSVRFTlMgUEFSVElMSEFET1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBjb21lbnRhcmlvc0l0ZW0gPSBteXNxbFRhYmxlKFwiY29tZW50YXJpb3NfaXRlbVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBpdGVtSWQ6IGludChcIml0ZW1JZFwiKS5ub3ROdWxsKCksXG4gIGl0ZW1UaXBvOiBteXNxbEVudW0oXCJpdGVtVGlwb1wiLCBbXCJ2aXN0b3JpYVwiLCBcIm1hbnV0ZW5jYW9cIiwgXCJvY29ycmVuY2lhXCIsIFwiY2hlY2tsaXN0XCJdKS5ub3ROdWxsKCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgYXV0b3JJZDogaW50KFwiYXV0b3JJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgYXV0b3JOb21lOiB2YXJjaGFyKFwiYXV0b3JOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBhdXRvcldoYXRzYXBwOiB2YXJjaGFyKFwiYXV0b3JXaGF0c2FwcFwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGF1dG9yRW1haWw6IHZhcmNoYXIoXCJhdXRvckVtYWlsXCIsIHsgbGVuZ3RoOiAzMjAgfSksXG4gIGF1dG9yRm90bzogdGV4dChcImF1dG9yRm90b1wiKSxcbiAgdGV4dG86IHRleHQoXCJ0ZXh0b1wiKS5ub3ROdWxsKCksXG4gIGlzSW50ZXJubzogYm9vbGVhbihcImlzSW50ZXJub1wiKS5kZWZhdWx0KGZhbHNlKS5ub3ROdWxsKCksXG4gIGxpZG86IGJvb2xlYW4oXCJsaWRvXCIpLmRlZmF1bHQoZmFsc2UpLm5vdE51bGwoKSxcbiAgbGlkb1BvcklkOiBpbnQoXCJsaWRvUG9ySWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIGxpZG9FbTogdGltZXN0YW1wKFwibGlkb0VtXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQ29tZW50YXJpb0l0ZW0gPSB0eXBlb2YgY29tZW50YXJpb3NJdGVtLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENvbWVudGFyaW9JdGVtID0gdHlwZW9mIGNvbWVudGFyaW9zSXRlbS4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFORVhPUyBERSBDT01FTlTDgVJJT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhbmV4b3NDb21lbnRhcmlvID0gbXlzcWxUYWJsZShcImFuZXhvc19jb21lbnRhcmlvXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbWVudGFyaW9JZDogaW50KFwiY29tZW50YXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29tZW50YXJpb3NJdGVtLmlkKS5ub3ROdWxsKCksXG4gIHVybDogdGV4dChcInVybFwiKS5ub3ROdWxsKCksXG4gIG5vbWU6IHZhcmNoYXIoXCJub21lXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICB0aXBvOiB2YXJjaGFyKFwidGlwb1wiLCB7IGxlbmd0aDogMTAwIH0pLm5vdE51bGwoKSxcbiAgdGFtYW5obzogaW50KFwidGFtYW5ob1wiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBBbmV4b0NvbWVudGFyaW8gPSB0eXBlb2YgYW5leG9zQ29tZW50YXJpby4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRBbmV4b0NvbWVudGFyaW8gPSB0eXBlb2YgYW5leG9zQ29tZW50YXJpby4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFJFU1BPU1RBUyBBIENPTUVOVMOBUklPUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHJlc3Bvc3Rhc0NvbWVudGFyaW8gPSBteXNxbFRhYmxlKFwicmVzcG9zdGFzX2NvbWVudGFyaW9cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29tZW50YXJpb0lkOiBpbnQoXCJjb21lbnRhcmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb21lbnRhcmlvc0l0ZW0uaWQpLm5vdE51bGwoKSxcbiAgYXV0b3JJZDogaW50KFwiYXV0b3JJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgYXV0b3JOb21lOiB2YXJjaGFyKFwiYXV0b3JOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBhdXRvckZvdG86IHRleHQoXCJhdXRvckZvdG9cIiksXG4gIHRleHRvOiB0ZXh0KFwidGV4dG9cIikubm90TnVsbCgpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFJlc3Bvc3RhQ29tZW50YXJpbyA9IHR5cGVvZiByZXNwb3N0YXNDb21lbnRhcmlvLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFJlc3Bvc3RhQ29tZW50YXJpbyA9IHR5cGVvZiByZXNwb3N0YXNDb21lbnRhcmlvLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBERVNUQVFVRVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBkZXN0YXF1ZXMgPSBteXNxbFRhYmxlKFwiZGVzdGFxdWVzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBzdWJ0aXR1bG86IHZhcmNoYXIoXCJzdWJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBsaW5rOiB0ZXh0KFwibGlua1wiKSxcbiAgYXJxdWl2b1VybDogdGV4dChcImFycXVpdm9VcmxcIiksXG4gIGFycXVpdm9Ob21lOiB2YXJjaGFyKFwiYXJxdWl2b05vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgdmlkZW9Vcmw6IHRleHQoXCJ2aWRlb1VybFwiKSxcbiAgb3JkZW06IGludChcIm9yZGVtXCIpLmRlZmF1bHQoMCksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIERlc3RhcXVlID0gdHlwZW9mIGRlc3RhcXVlcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnREZXN0YXF1ZSA9IHR5cGVvZiBkZXN0YXF1ZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBJTUFHRU5TIERFIERFU1RBUVVFUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGltYWdlbnNEZXN0YXF1ZXMgPSBteXNxbFRhYmxlKFwiaW1hZ2Vuc19kZXN0YXF1ZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgZGVzdGFxdWVJZDogaW50KFwiZGVzdGFxdWVJZFwiKS5yZWZlcmVuY2VzKCgpID0+IGRlc3RhcXVlcy5pZCkubm90TnVsbCgpLFxuICB1cmw6IHRleHQoXCJ1cmxcIikubm90TnVsbCgpLFxuICBsZWdlbmRhOiB2YXJjaGFyKFwibGVnZW5kYVwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBJbWFnZW1EZXN0YXF1ZSA9IHR5cGVvZiBpbWFnZW5zRGVzdGFxdWVzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEltYWdlbURlc3RhcXVlID0gdHlwZW9mIGltYWdlbnNEZXN0YXF1ZXMuJGluZmVySW5zZXJ0O1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IFDDgUdJTkEgMTAwJSBQRVJTT05BTElaQURBID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgcGFnaW5hc0N1c3RvbSA9IG15c3FsVGFibGUoXCJwYWdpbmFzX2N1c3RvbVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgc3VidGl0dWxvOiB2YXJjaGFyKFwic3VidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgbGluazogdGV4dChcImxpbmtcIiksXG4gIHZpZGVvVXJsOiB0ZXh0KFwidmlkZW9VcmxcIiksXG4gIGFycXVpdm9Vcmw6IHRleHQoXCJhcnF1aXZvVXJsXCIpLFxuICBhcnF1aXZvTm9tZTogdmFyY2hhcihcImFycXVpdm9Ob21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGltYWdlbnM6IGpzb24oXCJpbWFnZW5zXCIpLiR0eXBlPEFycmF5PHt1cmw6IHN0cmluZywgbGVnZW5kYT86IHN0cmluZ30+PigpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgUGFnaW5hQ3VzdG9tID0gdHlwZW9mIHBhZ2luYXNDdXN0b20uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0UGFnaW5hQ3VzdG9tID0gdHlwZW9mIHBhZ2luYXNDdXN0b20uJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBJTUFHRU5TIERFIFDDgUdJTkFTIFBFUlNPTkFMSVpBREFTID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgaW1hZ2Vuc0N1c3RvbSA9IG15c3FsVGFibGUoXCJpbWFnZW5zX2N1c3RvbVwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBwYWdpbmFJZDogaW50KFwicGFnaW5hSWRcIikucmVmZXJlbmNlcygoKSA9PiBwYWdpbmFzQ3VzdG9tLmlkKS5ub3ROdWxsKCksXG4gIHVybDogdGV4dChcInVybFwiKS5ub3ROdWxsKCksXG4gIGxlZ2VuZGE6IHZhcmNoYXIoXCJsZWdlbmRhXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEltYWdlbUN1c3RvbSA9IHR5cGVvZiBpbWFnZW5zQ3VzdG9tLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEltYWdlbUN1c3RvbSA9IHR5cGVvZiBpbWFnZW5zQ3VzdG9tLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBR0VOREEgREUgVkVOQ0lNRU5UT1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB2ZW5jaW1lbnRvcyA9IG15c3FsVGFibGUoXCJ2ZW5jaW1lbnRvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiY29udHJhdG9cIiwgXCJzZXJ2aWNvXCIsIFwibWFudXRlbmNhb1wiXSkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgZm9ybmVjZWRvcjogdmFyY2hhcihcImZvcm5lY2Vkb3JcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgdmFsb3I6IGRlY2ltYWwoXCJ2YWxvclwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiAyIH0pLFxuICBkYXRhSW5pY2lvOiB0aW1lc3RhbXAoXCJkYXRhSW5pY2lvXCIpLFxuICBkYXRhVmVuY2ltZW50bzogdGltZXN0YW1wKFwiZGF0YVZlbmNpbWVudG9cIikubm90TnVsbCgpLFxuICB1bHRpbWFSZWFsaXphY2FvOiB0aW1lc3RhbXAoXCJ1bHRpbWFSZWFsaXphY2FvXCIpLFxuICBwcm94aW1hUmVhbGl6YWNhbzogdGltZXN0YW1wKFwicHJveGltYVJlYWxpemFjYW9cIiksXG4gIHBlcmlvZGljaWRhZGU6IG15c3FsRW51bShcInBlcmlvZGljaWRhZGVcIiwgW1widW5pY29cIiwgXCJtZW5zYWxcIiwgXCJiaW1lc3RyYWxcIiwgXCJ0cmltZXN0cmFsXCIsIFwic2VtZXN0cmFsXCIsIFwiYW51YWxcIl0pLmRlZmF1bHQoXCJ1bmljb1wiKSxcbiAgc3RhdHVzOiBteXNxbEVudW0oXCJzdGF0dXNcIiwgW1wiYXRpdm9cIiwgXCJ2ZW5jaWRvXCIsIFwicmVub3ZhZG9cIiwgXCJjYW5jZWxhZG9cIl0pLmRlZmF1bHQoXCJhdGl2b1wiKS5ub3ROdWxsKCksXG4gIG9ic2VydmFjb2VzOiB0ZXh0KFwib2JzZXJ2YWNvZXNcIiksXG4gIGFycXVpdm9Vcmw6IHRleHQoXCJhcnF1aXZvVXJsXCIpLFxuICBhcnF1aXZvTm9tZTogdmFyY2hhcihcImFycXVpdm9Ob21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBWZW5jaW1lbnRvID0gdHlwZW9mIHZlbmNpbWVudG9zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFZlbmNpbWVudG8gPSB0eXBlb2YgdmVuY2ltZW50b3MuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBDT05GSUdVUkHDh8ODTyBERSBBTEVSVEFTIERFIFZFTkNJTUVOVE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgdmVuY2ltZW50b0FsZXJ0YXMgPSBteXNxbFRhYmxlKFwidmVuY2ltZW50b19hbGVydGFzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHZlbmNpbWVudG9JZDogaW50KFwidmVuY2ltZW50b0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdmVuY2ltZW50b3MuaWQpLm5vdE51bGwoKSxcbiAgdGlwb0FsZXJ0YTogbXlzcWxFbnVtKFwidGlwb0FsZXJ0YVwiLCBbXCJuYV9kYXRhXCIsIFwidW1fZGlhX2FudGVzXCIsIFwidW1hX3NlbWFuYV9hbnRlc1wiLCBcInF1aW56ZV9kaWFzX2FudGVzXCIsIFwidW1fbWVzX2FudGVzXCJdKS5ub3ROdWxsKCksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgZW52aWFkbzogYm9vbGVhbihcImVudmlhZG9cIikuZGVmYXVsdChmYWxzZSksXG4gIGRhdGFFbnZpbzogdGltZXN0YW1wKFwiZGF0YUVudmlvXCIpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFZlbmNpbWVudG9BbGVydGEgPSB0eXBlb2YgdmVuY2ltZW50b0FsZXJ0YXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VmVuY2ltZW50b0FsZXJ0YSA9IHR5cGVvZiB2ZW5jaW1lbnRvQWxlcnRhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEUtTUFJTFMgUEFSQSBOT1RJRklDQcOHw4NPIERFIFZFTkNJTUVOVE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgdmVuY2ltZW50b0VtYWlscyA9IG15c3FsVGFibGUoXCJ2ZW5jaW1lbnRvX2VtYWlsc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIGVtYWlsOiB2YXJjaGFyKFwiZW1haWxcIiwgeyBsZW5ndGg6IDMyMCB9KS5ub3ROdWxsKCksXG4gIG5vbWU6IHZhcmNoYXIoXCJub21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBWZW5jaW1lbnRvRW1haWwgPSB0eXBlb2YgdmVuY2ltZW50b0VtYWlscy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRWZW5jaW1lbnRvRW1haWwgPSB0eXBlb2YgdmVuY2ltZW50b0VtYWlscy4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IEhJU1TDk1JJQ08gREUgTk9USUZJQ0HDh8OVRVMgRU5WSUFEQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB2ZW5jaW1lbnRvTm90aWZpY2Fjb2VzID0gbXlzcWxUYWJsZShcInZlbmNpbWVudG9fbm90aWZpY2Fjb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIHZlbmNpbWVudG9JZDogaW50KFwidmVuY2ltZW50b0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdmVuY2ltZW50b3MuaWQpLm5vdE51bGwoKSxcbiAgYWxlcnRhSWQ6IGludChcImFsZXJ0YUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdmVuY2ltZW50b0FsZXJ0YXMuaWQpLFxuICBlbWFpbERlc3RpbmF0YXJpbzogdmFyY2hhcihcImVtYWlsRGVzdGluYXRhcmlvXCIsIHsgbGVuZ3RoOiAzMjAgfSkubm90TnVsbCgpLFxuICBhc3N1bnRvOiB2YXJjaGFyKFwiYXNzdW50b1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgY29udGV1ZG86IHRleHQoXCJjb250ZXVkb1wiKS5ub3ROdWxsKCksXG4gIHN0YXR1czogbXlzcWxFbnVtKFwic3RhdHVzXCIsIFtcImVudmlhZG9cIiwgXCJlcnJvXCIsIFwicGVuZGVudGVcIl0pLmRlZmF1bHQoXCJwZW5kZW50ZVwiKS5ub3ROdWxsKCksXG4gIGVycm9NZW5zYWdlbTogdGV4dChcImVycm9NZW5zYWdlbVwiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBWZW5jaW1lbnRvTm90aWZpY2FjYW8gPSB0eXBlb2YgdmVuY2ltZW50b05vdGlmaWNhY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRWZW5jaW1lbnRvTm90aWZpY2FjYW8gPSB0eXBlb2YgdmVuY2ltZW50b05vdGlmaWNhY29lcy4kaW5mZXJJbnNlcnQ7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gUFVTSCBTVUJTQ1JJUFRJT05TIChXZWIgUHVzaCBOb3RpZmljYXRpb25zKSA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHB1c2hTdWJzY3JpcHRpb25zID0gbXlzcWxUYWJsZShcInB1c2hfc3Vic2NyaXB0aW9uc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKSxcbiAgbW9yYWRvcklkOiBpbnQoXCJtb3JhZG9ySWRcIikucmVmZXJlbmNlcygoKSA9PiBtb3JhZG9yZXMuaWQpLFxuICB1c2VySWQ6IGludChcInVzZXJJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgZW5kcG9pbnQ6IHRleHQoXCJlbmRwb2ludFwiKS5ub3ROdWxsKCksXG4gIHAyNTZkaDogdGV4dChcInAyNTZkaFwiKS5ub3ROdWxsKCksXG4gIGF1dGg6IHRleHQoXCJhdXRoXCIpLm5vdE51bGwoKSxcbiAgdXNlckFnZW50OiB0ZXh0KFwidXNlckFnZW50XCIpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBQdXNoU3Vic2NyaXB0aW9uID0gdHlwZW9mIHB1c2hTdWJzY3JpcHRpb25zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFB1c2hTdWJzY3JpcHRpb24gPSB0eXBlb2YgcHVzaFN1YnNjcmlwdGlvbnMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBMRU1CUkVURVMgQUdFTkRBRE9TID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgbGVtYnJldGVzID0gbXlzcWxUYWJsZShcImxlbWJyZXRlc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHRpcG86IG15c3FsRW51bShcInRpcG9cIiwgW1wiYXNzZW1ibGVpYVwiLCBcInZlbmNpbWVudG9cIiwgXCJldmVudG9cIiwgXCJtYW51dGVuY2FvXCIsIFwiY3VzdG9tXCJdKS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgbWVuc2FnZW06IHRleHQoXCJtZW5zYWdlbVwiKSxcbiAgZGF0YUFnZW5kYWRhOiB0aW1lc3RhbXAoXCJkYXRhQWdlbmRhZGFcIikubm90TnVsbCgpLFxuICBhbnRlY2VkZW5jaWFIb3JhczogaW50KFwiYW50ZWNlZGVuY2lhSG9yYXNcIikuZGVmYXVsdCgyNCksXG4gIGVudmlhZG86IGJvb2xlYW4oXCJlbnZpYWRvXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBlbnZpYWRvRW06IHRpbWVzdGFtcChcImVudmlhZG9FbVwiKSxcbiAgcmVmZXJlbmNpYUlkOiBpbnQoXCJyZWZlcmVuY2lhSWRcIiksXG4gIHJlZmVyZW5jaWFUaXBvOiB2YXJjaGFyKFwicmVmZXJlbmNpYVRpcG9cIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBjYW5haXM6IGpzb24oXCJjYW5haXNcIikuJHR5cGU8c3RyaW5nW10+KCksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBMZW1icmV0ZSA9IHR5cGVvZiBsZW1icmV0ZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0TGVtYnJldGUgPSB0eXBlb2YgbGVtYnJldGVzLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gSElTVMOTUklDTyBERSBOT1RJRklDQcOHw5VFUyBFTlZJQURBUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGhpc3Rvcmljb05vdGlmaWNhY29lcyA9IG15c3FsVGFibGUoXCJoaXN0b3JpY29fbm90aWZpY2Fjb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXCJwdXNoXCIsIFwiZW1haWxcIiwgXCJ3aGF0c2FwcFwiLCBcInNpc3RlbWFcIl0pLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBtZW5zYWdlbTogdGV4dChcIm1lbnNhZ2VtXCIpLFxuICBkZXN0aW5hdGFyaW9zOiBpbnQoXCJkZXN0aW5hdGFyaW9zXCIpLmRlZmF1bHQoMCksXG4gIHN1Y2Vzc29zOiBpbnQoXCJzdWNlc3Nvc1wiKS5kZWZhdWx0KDApLFxuICBmYWxoYXM6IGludChcImZhbGhhc1wiKS5kZWZhdWx0KDApLFxuICBsZW1icmV0ZUlkOiBpbnQoXCJsZW1icmV0ZUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gbGVtYnJldGVzLmlkKSxcbiAgZW52aWFkb1BvcjogaW50KFwiZW52aWFkb1BvclwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBIaXN0b3JpY29Ob3RpZmljYWNhbyA9IHR5cGVvZiBoaXN0b3JpY29Ob3RpZmljYWNvZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0SGlzdG9yaWNvTm90aWZpY2FjYW8gPSB0eXBlb2YgaGlzdG9yaWNvTm90aWZpY2Fjb2VzLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ09ORklHVVJBw4fDlUVTIERFIEVNQUlMID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgY29uZmlndXJhY29lc0VtYWlsID0gbXlzcWxUYWJsZShcImNvbmZpZ3VyYWNvZXNfZW1haWxcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLnVuaXF1ZSgpLFxuICBwcm92ZWRvcjogbXlzcWxFbnVtKFwicHJvdmVkb3JcIiwgW1wicmVzZW5kXCIsIFwic2VuZGdyaWRcIiwgXCJtYWlsZ3VuXCIsIFwic210cFwiXSkuZGVmYXVsdChcInJlc2VuZFwiKSxcbiAgYXBpS2V5OiB0ZXh0KFwiYXBpS2V5XCIpLFxuICBlbWFpbFJlbWV0ZW50ZTogdmFyY2hhcihcImVtYWlsUmVtZXRlbnRlXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIG5vbWVSZW1ldGVudGU6IHZhcmNoYXIoXCJub21lUmVtZXRlbnRlXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdChmYWxzZSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBDb25maWd1cmFjYW9FbWFpbCA9IHR5cGVvZiBjb25maWd1cmFjb2VzRW1haWwuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Q29uZmlndXJhY2FvRW1haWwgPSB0eXBlb2YgY29uZmlndXJhY29lc0VtYWlsLiRpbmZlckluc2VydDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ09ORklHVVJBw4fDlUVTIFBVU0ggKFZBUElEKSA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGNvbmZpZ3VyYWNvZXNQdXNoID0gbXlzcWxUYWJsZShcImNvbmZpZ3VyYWNvZXNfcHVzaFwiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIHZhcGlkUHVibGljS2V5OiB0ZXh0KFwidmFwaWRQdWJsaWNLZXlcIiksXG4gIHZhcGlkUHJpdmF0ZUtleTogdGV4dChcInZhcGlkUHJpdmF0ZUtleVwiKSxcbiAgdmFwaWRTdWJqZWN0OiB2YXJjaGFyKFwidmFwaWRTdWJqZWN0XCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdChmYWxzZSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBDb25maWd1cmFjYW9QdXNoID0gdHlwZW9mIGNvbmZpZ3VyYWNvZXNQdXNoLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENvbmZpZ3VyYWNhb1B1c2ggPSB0eXBlb2YgY29uZmlndXJhY29lc1B1c2guJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBURU1QTEFURVMgREUgTk9USUZJQ0HDh8ODTyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlc05vdGlmaWNhY2FvID0gbXlzcWxUYWJsZShcInRlbXBsYXRlc19ub3RpZmljYWNhb1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIG5vbWU6IHZhcmNoYXIoXCJub21lXCIsIHsgbGVuZ3RoOiAxMDAgfSkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDEwMCB9KS5ub3ROdWxsKCksXG4gIG1lbnNhZ2VtOiB0ZXh0KFwibWVuc2FnZW1cIikubm90TnVsbCgpLFxuICBjYXRlZ29yaWE6IG15c3FsRW51bShcImNhdGVnb3JpYVwiLCBbJ2Fzc2VtYmxlaWEnLCAnbWFudXRlbmNhbycsICd2ZW5jaW1lbnRvJywgJ2F2aXNvJywgJ2V2ZW50bycsICdjdXN0b20nXSkuZGVmYXVsdCgnY3VzdG9tJyksXG4gIGljb25lOiB2YXJjaGFyKFwiaWNvbmVcIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBjb3I6IHZhcmNoYXIoXCJjb3JcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICB1cmxEZXN0aW5vOiB2YXJjaGFyKFwidXJsRGVzdGlub1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIHVzYWdlQ291bnQ6IGludChcInVzYWdlQ291bnRcIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIFRlbXBsYXRlTm90aWZpY2FjYW8gPSB0eXBlb2YgdGVtcGxhdGVzTm90aWZpY2FjYW8uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VGVtcGxhdGVOb3RpZmljYWNhbyA9IHR5cGVvZiB0ZW1wbGF0ZXNOb3RpZmljYWNhby4kaW5mZXJJbnNlcnQ7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVElQT1MgREUgSU5GUkHDh8ODTyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHRpcG9zSW5mcmFjYW8gPSBteXNxbFRhYmxlKFwidGlwb3NfaW5mcmFjYW9cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICB0aXR1bG86IHZhcmNoYXIoXCJ0aXR1bG9cIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhb1BhZHJhbzogdGV4dChcImRlc2NyaWNhb1BhZHJhb1wiKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVGlwb0luZnJhY2FvID0gdHlwZW9mIHRpcG9zSW5mcmFjYW8uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0VGlwb0luZnJhY2FvID0gdHlwZW9mIHRpcG9zSW5mcmFjYW8uJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBOT1RJRklDQcOHw5VFUyBERSBJTkZSQcOHw4NPID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3Qgbm90aWZpY2Fjb2VzSW5mcmFjYW8gPSBteXNxbFRhYmxlKFwibm90aWZpY2Fjb2VzX2luZnJhY2FvXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgbW9yYWRvcklkOiBpbnQoXCJtb3JhZG9ySWRcIikucmVmZXJlbmNlcygoKSA9PiBtb3JhZG9yZXMuaWQpLm5vdE51bGwoKSxcbiAgdGlwb0luZnJhY2FvSWQ6IGludChcInRpcG9JbmZyYWNhb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdGlwb3NJbmZyYWNhby5pZCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLm5vdE51bGwoKSxcbiAgaW1hZ2VuczoganNvbihcImltYWdlbnNcIikuJHR5cGU8c3RyaW5nW10+KCksXG4gIHN0YXR1czogbXlzcWxFbnVtKFwic3RhdHVzXCIsIFsncGVuZGVudGUnLCAncmVzcG9uZGlkYScsICdyZXNvbHZpZGEnLCAnYXJxdWl2YWRhJ10pLmRlZmF1bHQoJ3BlbmRlbnRlJyksXG4gIGRhdGFPY29ycmVuY2lhOiB0aW1lc3RhbXAoXCJkYXRhT2NvcnJlbmNpYVwiKSxcbiAgcGRmVXJsOiB0ZXh0KFwicGRmVXJsXCIpLFxuICBsaW5rUHVibGljbzogdmFyY2hhcihcImxpbmtQdWJsaWNvXCIsIHsgbGVuZ3RoOiA2NCB9KS5ub3ROdWxsKCksXG4gIGVudmlhZG9XaGF0c2FwcDogYm9vbGVhbihcImVudmlhZG9XaGF0c2FwcFwiKS5kZWZhdWx0KGZhbHNlKSxcbiAgZW52aWFkb0VtYWlsOiBib29sZWFuKFwiZW52aWFkb0VtYWlsXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBjcmlhZG9Qb3I6IGludChcImNyaWFkb1BvclwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE5vdGlmaWNhY2FvSW5mcmFjYW8gPSB0eXBlb2Ygbm90aWZpY2Fjb2VzSW5mcmFjYW8uJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0Tm90aWZpY2FjYW9JbmZyYWNhbyA9IHR5cGVvZiBub3RpZmljYWNvZXNJbmZyYWNhby4kaW5mZXJJbnNlcnQ7XG5cbi8vID09PT09PT09PT09PT09PT09PT09IFJFU1BPU1RBUyBERSBJTkZSQcOHw4NPIChUSU1FTElORS9DSEFUKSA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IHJlc3Bvc3Rhc0luZnJhY2FvID0gbXlzcWxUYWJsZShcInJlc3Bvc3Rhc19pbmZyYWNhb1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBub3RpZmljYWNhb0lkOiBpbnQoXCJub3RpZmljYWNhb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gbm90aWZpY2Fjb2VzSW5mcmFjYW8uaWQpLm5vdE51bGwoKSxcbiAgYXV0b3JUaXBvOiBteXNxbEVudW0oXCJhdXRvclRpcG9cIiwgWydzaW5kaWNvJywgJ21vcmFkb3InXSkubm90TnVsbCgpLFxuICBhdXRvcklkOiBpbnQoXCJhdXRvcklkXCIpLFxuICBhdXRvck5vbWU6IHZhcmNoYXIoXCJhdXRvck5vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KS5ub3ROdWxsKCksXG4gIG1lbnNhZ2VtOiB0ZXh0KFwibWVuc2FnZW1cIikubm90TnVsbCgpLFxuICBpbWFnZW5zOiBqc29uKFwiaW1hZ2Vuc1wiKS4kdHlwZTxzdHJpbmdbXT4oKSxcbiAgbGlkYVBlbG9TaW5kaWNvOiBib29sZWFuKFwibGlkYVBlbG9TaW5kaWNvXCIpLmRlZmF1bHQoZmFsc2UpLm5vdE51bGwoKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBSZXNwb3N0YUluZnJhY2FvID0gdHlwZW9mIHJlc3Bvc3Rhc0luZnJhY2FvLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFJlc3Bvc3RhSW5mcmFjYW8gPSB0eXBlb2YgcmVzcG9zdGFzSW5mcmFjYW8uJGluZmVySW5zZXJ0O1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IEZVTsOHw5VFUyBIQUJJTElUQURBUyBQT1IgQ09ORE9Nw41OSU8gPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBjb25kb21pbmlvRnVuY29lcyA9IG15c3FsVGFibGUoXCJjb25kb21pbmlvX2Z1bmNvZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBmdW5jYW9JZDogdmFyY2hhcihcImZ1bmNhb0lkXCIsIHsgbGVuZ3RoOiA1MCB9KS5ub3ROdWxsKCksXG4gIGhhYmlsaXRhZGE6IGJvb2xlYW4oXCJoYWJpbGl0YWRhXCIpLmRlZmF1bHQodHJ1ZSkubm90TnVsbCgpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQ29uZG9taW5pb0Z1bmNhbyA9IHR5cGVvZiBjb25kb21pbmlvRnVuY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRDb25kb21pbmlvRnVuY2FvID0gdHlwZW9mIGNvbmRvbWluaW9GdW5jb2VzLiRpbmZlckluc2VydDtcblxuLy8gTGlzdGEgZGUgdG9kYXMgYXMgZnVuw6fDtWVzIGRpc3BvbsOtdmVpcyBubyBzaXN0ZW1hXG5leHBvcnQgY29uc3QgRlVOQ09FU19ESVNQT05JVkVJUyA9IFtcbiAgeyBpZDogXCJhdmlzb3NcIiwgbm9tZTogXCJBdmlzb3NcIiwgY2F0ZWdvcmlhOiBcImNvbXVuaWNhY2FvXCIsIGRlc2NyaWNhbzogXCJQdWJsaWNhciBhdmlzb3MgZSBjb211bmljYWRvc1wiIH0sXG4gIHsgaWQ6IFwiY29tdW5pY2Fkb3NcIiwgbm9tZTogXCJDb211bmljYWRvc1wiLCBjYXRlZ29yaWE6IFwiY29tdW5pY2FjYW9cIiwgZGVzY3JpY2FvOiBcIkVudmlhciBjb211bmljYWRvcyBvZmljaWFpc1wiIH0sXG4gIHsgaWQ6IFwibm90aWZpY2Fjb2VzXCIsIG5vbWU6IFwiTm90aWZpY2HDp8O1ZXNcIiwgY2F0ZWdvcmlhOiBcImNvbXVuaWNhY2FvXCIsIGRlc2NyaWNhbzogXCJTaXN0ZW1hIGRlIG5vdGlmaWNhw6fDtWVzXCIgfSxcbiAgeyBpZDogXCJub3RpZmljYXItbW9yYWRvclwiLCBub21lOiBcIk5vdGlmaWNhciBNb3JhZG9yXCIsIGNhdGVnb3JpYTogXCJjb211bmljYWNhb1wiLCBkZXNjcmljYW86IFwiTm90aWZpY2FyIG1vcmFkb3JlcyBpbmRpdmlkdWFsbWVudGVcIiB9LFxuICB7IGlkOiBcImV2ZW50b3NcIiwgbm9tZTogXCJFdmVudG9zXCIsIGNhdGVnb3JpYTogXCJhZ2VuZGFcIiwgZGVzY3JpY2FvOiBcIkdlc3TDo28gZGUgZXZlbnRvcyBkbyBjb25kb23DrW5pb1wiIH0sXG4gIHsgaWQ6IFwiYWdlbmRhLXZlbmNpbWVudG9zXCIsIG5vbWU6IFwiQWdlbmRhIGRlIFZlbmNpbWVudG9zXCIsIGNhdGVnb3JpYTogXCJhZ2VuZGFcIiwgZGVzY3JpY2FvOiBcIkNvbnRyb2xlIGRlIHZlbmNpbWVudG9zXCIgfSxcbiAgeyBpZDogXCJyZXNlcnZhc1wiLCBub21lOiBcIlJlc2VydmFzXCIsIGNhdGVnb3JpYTogXCJhZ2VuZGFcIiwgZGVzY3JpY2FvOiBcIlJlc2VydmEgZGUgw6FyZWFzIGNvbXVuc1wiIH0sXG4gIHsgaWQ6IFwidmlzdG9yaWFzXCIsIG5vbWU6IFwiVmlzdG9yaWFzXCIsIGNhdGVnb3JpYTogXCJvcGVyYWNpb25hbFwiLCBkZXNjcmljYW86IFwiUmVnaXN0cm8gZGUgdmlzdG9yaWFzXCIgfSxcbiAgeyBpZDogXCJtYW51dGVuY29lc1wiLCBub21lOiBcIk1hbnV0ZW7Dp8O1ZXNcIiwgY2F0ZWdvcmlhOiBcIm9wZXJhY2lvbmFsXCIsIGRlc2NyaWNhbzogXCJDb250cm9sZSBkZSBtYW51dGVuw6fDtWVzXCIgfSxcbiAgeyBpZDogXCJvY29ycmVuY2lhc1wiLCBub21lOiBcIk9jb3Jyw6puY2lhc1wiLCBjYXRlZ29yaWE6IFwib3BlcmFjaW9uYWxcIiwgZGVzY3JpY2FvOiBcIlJlZ2lzdHJvIGRlIG9jb3Jyw6puY2lhc1wiIH0sXG4gIHsgaWQ6IFwiY2hlY2tsaXN0c1wiLCBub21lOiBcIkNoZWNrbGlzdHNcIiwgY2F0ZWdvcmlhOiBcIm9wZXJhY2lvbmFsXCIsIGRlc2NyaWNhbzogXCJMaXN0YXMgZGUgdmVyaWZpY2HDp8Ojb1wiIH0sXG4gIHsgaWQ6IFwiYW50ZXMtZGVwb2lzXCIsIG5vbWU6IFwiQW50ZXMgZSBEZXBvaXNcIiwgY2F0ZWdvcmlhOiBcIm9wZXJhY2lvbmFsXCIsIGRlc2NyaWNhbzogXCJSZWdpc3RybyBkZSBtZWxob3JpYXNcIiB9LFxuICB7IGlkOiBcIm9yZGVucy1zZXJ2aWNvXCIsIG5vbWU6IFwiT3JkZW5zIGRlIFNlcnZpw6dvXCIsIGNhdGVnb3JpYTogXCJvcGVyYWNpb25hbFwiLCBkZXNjcmljYW86IFwiR2VzdMOjbyBkZSBvcmRlbnMgZGUgc2VydmnDp29cIiB9LFxuICB7IGlkOiBcInZvdGFjb2VzXCIsIG5vbWU6IFwiVm90YcOnw7Vlc1wiLCBjYXRlZ29yaWE6IFwiaW50ZXJhdGl2b1wiLCBkZXNjcmljYW86IFwiU2lzdGVtYSBkZSB2b3Rhw6fDtWVzXCIgfSxcbiAgeyBpZDogXCJjbGFzc2lmaWNhZG9zXCIsIG5vbWU6IFwiQ2xhc3NpZmljYWRvc1wiLCBjYXRlZ29yaWE6IFwiaW50ZXJhdGl2b1wiLCBkZXNjcmljYW86IFwiQ2xhc3NpZmljYWRvcyBkb3MgbW9yYWRvcmVzXCIgfSxcbiAgeyBpZDogXCJhY2hhZG9zLXBlcmRpZG9zXCIsIG5vbWU6IFwiQWNoYWRvcyBlIFBlcmRpZG9zXCIsIGNhdGVnb3JpYTogXCJpbnRlcmF0aXZvXCIsIGRlc2NyaWNhbzogXCJJdGVucyBwZXJkaWRvcyBlIGVuY29udHJhZG9zXCIgfSxcbiAgeyBpZDogXCJjYXJvbmFzXCIsIG5vbWU6IFwiQ2Fyb25hc1wiLCBjYXRlZ29yaWE6IFwiaW50ZXJhdGl2b1wiLCBkZXNjcmljYW86IFwiU2lzdGVtYSBkZSBjYXJvbmFzXCIgfSxcbiAgeyBpZDogXCJyZWdyYXNcIiwgbm9tZTogXCJSZWdyYXMgZSBOb3JtYXNcIiwgY2F0ZWdvcmlhOiBcImRvY3VtZW50YWNhb1wiLCBkZXNjcmljYW86IFwiUmVncmFzIGRvIGNvbmRvbcOtbmlvXCIgfSxcbiAgeyBpZDogXCJkaWNhcy1zZWd1cmFuY2FcIiwgbm9tZTogXCJEaWNhcyBkZSBTZWd1cmFuw6dhXCIsIGNhdGVnb3JpYTogXCJkb2N1bWVudGFjYW9cIiwgZGVzY3JpY2FvOiBcIkRpY2FzIGRlIHNlZ3VyYW7Dp2FcIiB9LFxuICB7IGlkOiBcImxpbmtzLXV0ZWlzXCIsIG5vbWU6IFwiTGlua3Mgw5p0ZWlzXCIsIGNhdGVnb3JpYTogXCJkb2N1bWVudGFjYW9cIiwgZGVzY3JpY2FvOiBcIkxpbmtzIGltcG9ydGFudGVzXCIgfSxcbiAgeyBpZDogXCJ0ZWxlZm9uZXMtdXRlaXNcIiwgbm9tZTogXCJUZWxlZm9uZXMgw5p0ZWlzXCIsIGNhdGVnb3JpYTogXCJkb2N1bWVudGFjYW9cIiwgZGVzY3JpY2FvOiBcIlRlbGVmb25lcyBkZSBlbWVyZ8OqbmNpYVwiIH0sXG4gIHsgaWQ6IFwiZ2FsZXJpYVwiLCBub21lOiBcIkdhbGVyaWEgZGUgRm90b3NcIiwgY2F0ZWdvcmlhOiBcIm1pZGlhXCIsIGRlc2NyaWNhbzogXCJGb3RvcyBkbyBjb25kb23DrW5pb1wiIH0sXG4gIHsgaWQ6IFwicmVhbGl6YWNvZXNcIiwgbm9tZTogXCJSZWFsaXphw6fDtWVzXCIsIGNhdGVnb3JpYTogXCJtaWRpYVwiLCBkZXNjcmljYW86IFwiUmVhbGl6YcOnw7VlcyBkYSBnZXN0w6NvXCIgfSxcbiAgeyBpZDogXCJtZWxob3JpYXNcIiwgbm9tZTogXCJNZWxob3JpYXNcIiwgY2F0ZWdvcmlhOiBcIm1pZGlhXCIsIGRlc2NyaWNhbzogXCJNZWxob3JpYXMgcmVhbGl6YWRhc1wiIH0sXG4gIHsgaWQ6IFwiYXF1aXNpY29lc1wiLCBub21lOiBcIkFxdWlzacOnw7Vlc1wiLCBjYXRlZ29yaWE6IFwibWlkaWFcIiwgZGVzY3JpY2FvOiBcIk5vdmFzIGFxdWlzacOnw7Vlc1wiIH0sXG4gIHsgaWQ6IFwicHVibGljaWRhZGVcIiwgbm9tZTogXCJQdWJsaWNpZGFkZVwiLCBjYXRlZ29yaWE6IFwicHVibGljaWRhZGVcIiwgZGVzY3JpY2FvOiBcIkdlc3TDo28gZGUgYW51bmNpYW50ZXNcIiB9LFxuICB7IGlkOiBcInJldmlzdGFzXCIsIG5vbWU6IFwiTWV1cyBQcm9qZXRvc1wiLCBjYXRlZ29yaWE6IFwicHJvamV0b3NcIiwgZGVzY3JpY2FvOiBcIkFwcHMsIHJldmlzdGFzIGUgcmVsYXTDs3Jpb3NcIiB9LFxuICB7IGlkOiBcIm1vcmFkb3Jlc1wiLCBub21lOiBcIk1vcmFkb3Jlc1wiLCBjYXRlZ29yaWE6IFwiZ2VzdGFvXCIsIGRlc2NyaWNhbzogXCJHZXN0w6NvIGRlIG1vcmFkb3Jlc1wiIH0sXG4gIHsgaWQ6IFwiZnVuY2lvbmFyaW9zXCIsIG5vbWU6IFwiRnVuY2lvbsOhcmlvc1wiLCBjYXRlZ29yaWE6IFwiZ2VzdGFvXCIsIGRlc2NyaWNhbzogXCJHZXN0w6NvIGRlIGZ1bmNpb27DoXJpb3NcIiB9LFxuICB7IGlkOiBcInZhZ2FzXCIsIG5vbWU6IFwiVmFnYXMgZGUgRXN0YWNpb25hbWVudG9cIiwgY2F0ZWdvcmlhOiBcImdlc3Rhb1wiLCBkZXNjcmljYW86IFwiR2VzdMOjbyBkZSB2YWdhc1wiIH0sXG4gIHsgaWQ6IFwiZXF1aXBlXCIsIG5vbWU6IFwiRXF1aXBlIGRlIEdlc3TDo29cIiwgY2F0ZWdvcmlhOiBcImdlc3Rhb1wiLCBkZXNjcmljYW86IFwiTWVtYnJvcyBkYSBlcXVpcGVcIiB9LFxuICB7IGlkOiBcInBhaW5lbC1jb250cm9sb1wiLCBub21lOiBcIlBhaW5lbCBkZSBDb250cm9sb1wiLCBjYXRlZ29yaWE6IFwicmVsYXRvcmlvc1wiLCBkZXNjcmljYW86IFwiRXN0YXTDrXN0aWNhcyBlIGdyw6FmaWNvc1wiIH0sXG4gIHsgaWQ6IFwicmVsYXRvcmlvc1wiLCBub21lOiBcIlJlbGF0w7NyaW9zXCIsIGNhdGVnb3JpYTogXCJyZWxhdG9yaW9zXCIsIGRlc2NyaWNhbzogXCJSZWxhdMOzcmlvcyBkZXRhbGhhZG9zXCIgfSxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIEZ1bmNhb0lkID0gdHlwZW9mIEZVTkNPRVNfRElTUE9OSVZFSVNbbnVtYmVyXVtcImlkXCJdO1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09IEFQUFMgUEVSU09OQUxJWkFET1MgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhcHBzID0gbXlzcWxUYWJsZShcImFwcHNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBsb2dvVXJsOiB0ZXh0KFwibG9nb1VybFwiKSxcbiAgY29yUHJpbWFyaWE6IHZhcmNoYXIoXCJjb3JQcmltYXJpYVwiLCB7IGxlbmd0aDogMjAgfSkuZGVmYXVsdChcIiM0RjQ2RTVcIiksXG4gIGNvclNlY3VuZGFyaWE6IHZhcmNoYXIoXCJjb3JTZWN1bmRhcmlhXCIsIHsgbGVuZ3RoOiAyMCB9KS5kZWZhdWx0KFwiIzEwQjk4MVwiKSxcbiAgc2hhcmVMaW5rOiB2YXJjaGFyKFwic2hhcmVMaW5rXCIsIHsgbGVuZ3RoOiA1MCB9KS51bmlxdWUoKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQXBwID0gdHlwZW9mIGFwcHMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0QXBwID0gdHlwZW9mIGFwcHMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBNw5NEVUxPUyBETyBBUFAgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBhcHBNb2R1bG9zID0gbXlzcWxUYWJsZShcImFwcF9tb2R1bG9zXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGFwcElkOiBpbnQoXCJhcHBJZFwiKS5yZWZlcmVuY2VzKCgpID0+IGFwcHMuaWQpLm5vdE51bGwoKSxcbiAgbW9kdWxvS2V5OiB2YXJjaGFyKFwibW9kdWxvS2V5XCIsIHsgbGVuZ3RoOiA1MCB9KS5ub3ROdWxsKCksXG4gIHRpdHVsbzogdmFyY2hhcihcInRpdHVsb1wiLCB7IGxlbmd0aDogMTAwIH0pLm5vdE51bGwoKSxcbiAgaWNvbmU6IHZhcmNoYXIoXCJpY29uZVwiLCB7IGxlbmd0aDogNTAgfSksXG4gIGNvcjogdmFyY2hhcihcImNvclwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGJnQ29yOiB2YXJjaGFyKFwiYmdDb3JcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgaGFiaWxpdGFkbzogYm9vbGVhbihcImhhYmlsaXRhZG9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBBcHBNb2R1bG8gPSB0eXBlb2YgYXBwTW9kdWxvcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRBcHBNb2R1bG8gPSB0eXBlb2YgYXBwTW9kdWxvcy4kaW5mZXJJbnNlcnQ7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gVEVNUExBVEVTIERFIENIRUNLTElTVCA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGNoZWNrbGlzdFRlbXBsYXRlcyA9IG15c3FsVGFibGUoXCJjaGVja2xpc3RfdGVtcGxhdGVzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBjYXRlZ29yaWE6IHZhcmNoYXIoXCJjYXRlZ29yaWFcIiwgeyBsZW5ndGg6IDEwMCB9KSxcbiAgaWNvbmU6IHZhcmNoYXIoXCJpY29uZVwiLCB7IGxlbmd0aDogNTAgfSksXG4gIGNvcjogdmFyY2hhcihcImNvclwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGlzUGFkcmFvOiBib29sZWFuKFwiaXNQYWRyYW9cIikuZGVmYXVsdChmYWxzZSksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENoZWNrbGlzdFRlbXBsYXRlID0gdHlwZW9mIGNoZWNrbGlzdFRlbXBsYXRlcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRDaGVja2xpc3RUZW1wbGF0ZSA9IHR5cGVvZiBjaGVja2xpc3RUZW1wbGF0ZXMuJGluZmVySW5zZXJ0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBJVEVOUyBERSBURU1QTEFURVMgREUgQ0hFQ0tMSVNUID09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgY2hlY2tsaXN0VGVtcGxhdGVJdGVucyA9IG15c3FsVGFibGUoXCJjaGVja2xpc3RfdGVtcGxhdGVfaXRlbnNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgdGVtcGxhdGVJZDogaW50KFwidGVtcGxhdGVJZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNoZWNrbGlzdFRlbXBsYXRlcy5pZCkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHZhcmNoYXIoXCJkZXNjcmljYW9cIiwgeyBsZW5ndGg6IDUwMCB9KS5ub3ROdWxsKCksXG4gIG9yZGVtOiBpbnQoXCJvcmRlbVwiKS5kZWZhdWx0KDApLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIENoZWNrbGlzdFRlbXBsYXRlSXRlbSA9IHR5cGVvZiBjaGVja2xpc3RUZW1wbGF0ZUl0ZW5zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydENoZWNrbGlzdFRlbXBsYXRlSXRlbSA9IHR5cGVvZiBjaGVja2xpc3RUZW1wbGF0ZUl0ZW5zLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBWQUxPUkVTIFNBTFZPUyAoUmVzcG9uc8OhdmVpcywgQ2F0ZWdvcmlhcywgVGlwb3MsIEZvcm5lY2Vkb3JlcykgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCB2YWxvcmVzU2Fsdm9zID0gbXlzcWxUYWJsZShcInZhbG9yZXNfc2Fsdm9zXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgdGlwbzogbXlzcWxFbnVtKFwidGlwb1wiLCBbXG4gICAgXCJyZXNwb25zYXZlbFwiLFxuICAgIFwiY2F0ZWdvcmlhX3Zpc3RvcmlhXCIsXG4gICAgXCJjYXRlZ29yaWFfbWFudXRlbmNhb1wiLCBcbiAgICBcImNhdGVnb3JpYV9jaGVja2xpc3RcIixcbiAgICBcImNhdGVnb3JpYV9vY29ycmVuY2lhXCIsXG4gICAgXCJ0aXBvX3Zpc3RvcmlhXCIsXG4gICAgXCJ0aXBvX21hbnV0ZW5jYW9cIixcbiAgICBcInRpcG9fY2hlY2tsaXN0XCIsXG4gICAgXCJ0aXBvX29jb3JyZW5jaWFcIixcbiAgICBcImZvcm5lY2Vkb3JcIixcbiAgICBcImxvY2FsaXphY2FvXCJcbiAgXSkubm90TnVsbCgpLFxuICB2YWxvcjogdmFyY2hhcihcInZhbG9yXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBhdGl2bzogYm9vbGVhbihcImF0aXZvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVmFsb3JTYWx2byA9IHR5cGVvZiB2YWxvcmVzU2Fsdm9zLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydFZhbG9yU2Fsdm8gPSB0eXBlb2YgdmFsb3Jlc1NhbHZvcy4kaW5mZXJJbnNlcnQ7XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gT1JERU5TIERFIFNFUlZJw4dPID09PT09PT09PT09PT09PT09PT09XG5cbi8vIENhdGVnb3JpYXMgZGUgT1MgKHBlcnNvbmFsaXrDoXZlaXMpXG5leHBvcnQgY29uc3Qgb3NDYXRlZ29yaWFzID0gbXlzcWxUYWJsZShcIm9zX2NhdGVnb3JpYXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMTAwIH0pLm5vdE51bGwoKSxcbiAgZGVzY3JpY2FvOiB0ZXh0KFwiZGVzY3JpY2FvXCIpLFxuICBpY29uZTogdmFyY2hhcihcImljb25lXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgY29yOiB2YXJjaGFyKFwiY29yXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgaXNQYWRyYW86IGJvb2xlYW4oXCJpc1BhZHJhb1wiKS5kZWZhdWx0KGZhbHNlKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgT3NDYXRlZ29yaWEgPSB0eXBlb2Ygb3NDYXRlZ29yaWFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE9zQ2F0ZWdvcmlhID0gdHlwZW9mIG9zQ2F0ZWdvcmlhcy4kaW5mZXJJbnNlcnQ7XG5cbi8vIFByaW9yaWRhZGVzIGRlIE9TIChwZXJzb25hbGl6w6F2ZWlzKVxuZXhwb3J0IGNvbnN0IG9zUHJpb3JpZGFkZXMgPSBteXNxbFRhYmxlKFwib3NfcHJpb3JpZGFkZXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMTAwIH0pLm5vdE51bGwoKSxcbiAgbml2ZWw6IGludChcIm5pdmVsXCIpLmRlZmF1bHQoMSksIC8vIDE9YmFpeGEsIDI9bm9ybWFsLCAzPWFsdGEsIDQ9dXJnZW50ZVxuICBjb3I6IHZhcmNoYXIoXCJjb3JcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBpY29uZTogdmFyY2hhcihcImljb25lXCIsIHsgbGVuZ3RoOiA1MCB9KSxcbiAgaXNQYWRyYW86IGJvb2xlYW4oXCJpc1BhZHJhb1wiKS5kZWZhdWx0KGZhbHNlKSxcbiAgYXRpdm86IGJvb2xlYW4oXCJhdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgT3NQcmlvcmlkYWRlID0gdHlwZW9mIG9zUHJpb3JpZGFkZXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T3NQcmlvcmlkYWRlID0gdHlwZW9mIG9zUHJpb3JpZGFkZXMuJGluZmVySW5zZXJ0O1xuXG4vLyBTdGF0dXMgZGUgT1MgKHBlcnNvbmFsaXrDoXZlaXMpXG5leHBvcnQgY29uc3Qgb3NTdGF0dXMgPSBteXNxbFRhYmxlKFwib3Nfc3RhdHVzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKSxcbiAgbm9tZTogdmFyY2hhcihcIm5vbWVcIiwgeyBsZW5ndGg6IDEwMCB9KS5ub3ROdWxsKCksXG4gIGNvcjogdmFyY2hhcihcImNvclwiLCB7IGxlbmd0aDogMjAgfSksXG4gIGljb25lOiB2YXJjaGFyKFwiaWNvbmVcIiwgeyBsZW5ndGg6IDUwIH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgaXNGaW5hbDogYm9vbGVhbihcImlzRmluYWxcIikuZGVmYXVsdChmYWxzZSksIC8vIFNlIMOpIHN0YXR1cyBmaW5hbCAoY29uY2x1w61kYS9jYW5jZWxhZGEpXG4gIGlzUGFkcmFvOiBib29sZWFuKFwiaXNQYWRyYW9cIikuZGVmYXVsdChmYWxzZSksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9zU3RhdHVzID0gdHlwZW9mIG9zU3RhdHVzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE9zU3RhdHVzID0gdHlwZW9mIG9zU3RhdHVzLiRpbmZlckluc2VydDtcblxuLy8gU2V0b3JlcyBkZSBPUyAocGVyc29uYWxpesOhdmVpcylcbmV4cG9ydCBjb25zdCBvc1NldG9yZXMgPSBteXNxbFRhYmxlKFwib3Nfc2V0b3Jlc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBjb25kb21pbmlvSWQ6IGludChcImNvbmRvbWluaW9JZFwiKS5yZWZlcmVuY2VzKCgpID0+IGNvbmRvbWluaW9zLmlkKS5ub3ROdWxsKCksXG4gIG5vbWU6IHZhcmNoYXIoXCJub21lXCIsIHsgbGVuZ3RoOiAxMDAgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIGF0aXZvOiBib29sZWFuKFwiYXRpdm9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9zU2V0b3IgPSB0eXBlb2Ygb3NTZXRvcmVzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE9zU2V0b3IgPSB0eXBlb2Ygb3NTZXRvcmVzLiRpbmZlckluc2VydDtcblxuLy8gQ29uZmlndXJhw6fDtWVzIGRlIE9TIHBvciBjb25kb23DrW5pb1xuZXhwb3J0IGNvbnN0IG9zQ29uZmlndXJhY29lcyA9IG15c3FsVGFibGUoXCJvc19jb25maWd1cmFjb2VzXCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIGNvbmRvbWluaW9JZDogaW50KFwiY29uZG9taW5pb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gY29uZG9taW5pb3MuaWQpLm5vdE51bGwoKS51bmlxdWUoKSxcbiAgaGFiaWxpdGFyT3JjYW1lbnRvczogYm9vbGVhbihcImhhYmlsaXRhck9yY2FtZW50b3NcIikuZGVmYXVsdCh0cnVlKSxcbiAgaGFiaWxpdGFyQXByb3ZhY2FvT3JjYW1lbnRvOiBib29sZWFuKFwiaGFiaWxpdGFyQXByb3ZhY2FvT3JjYW1lbnRvXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGhhYmlsaXRhckdlc3Rhb0ZpbmFuY2VpcmE6IGJvb2xlYW4oXCJoYWJpbGl0YXJHZXN0YW9GaW5hbmNlaXJhXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGhhYmlsaXRhclJlbGF0b3Jpb3NHYXN0b3M6IGJvb2xlYW4oXCJoYWJpbGl0YXJSZWxhdG9yaW9zR2FzdG9zXCIpLmRlZmF1bHQodHJ1ZSksXG4gIGhhYmlsaXRhclZpbmN1bG9NYW51dGVuY2FvOiBib29sZWFuKFwiaGFiaWxpdGFyVmluY3Vsb01hbnV0ZW5jYW9cIikuZGVmYXVsdCh0cnVlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiB0aW1lc3RhbXAoXCJ1cGRhdGVkQXRcIikuZGVmYXVsdE5vdygpLm9uVXBkYXRlTm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9zQ29uZmlndXJhY2FvID0gdHlwZW9mIG9zQ29uZmlndXJhY29lcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRPc0NvbmZpZ3VyYWNhbyA9IHR5cGVvZiBvc0NvbmZpZ3VyYWNvZXMuJGluZmVySW5zZXJ0O1xuXG4vLyBUYWJlbGEgcHJpbmNpcGFsIGRlIE9yZGVucyBkZSBTZXJ2acOnb1xuZXhwb3J0IGNvbnN0IG9yZGVuc1NlcnZpY28gPSBteXNxbFRhYmxlKFwib3JkZW5zX3NlcnZpY29cIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBwcm90b2NvbG86IHZhcmNoYXIoXCJwcm90b2NvbG9cIiwgeyBsZW5ndGg6IDEwIH0pLm5vdE51bGwoKSxcbiAgdGl0dWxvOiB2YXJjaGFyKFwidGl0dWxvXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIFxuICAvLyBSZWxhY2lvbmFtZW50b3MgY29tIHRhYmVsYXMgcGVyc29uYWxpesOhdmVpc1xuICBjYXRlZ29yaWFJZDogaW50KFwiY2F0ZWdvcmlhSWRcIikucmVmZXJlbmNlcygoKSA9PiBvc0NhdGVnb3JpYXMuaWQpLFxuICBwcmlvcmlkYWRlSWQ6IGludChcInByaW9yaWRhZGVJZFwiKS5yZWZlcmVuY2VzKCgpID0+IG9zUHJpb3JpZGFkZXMuaWQpLFxuICBzdGF0dXNJZDogaW50KFwic3RhdHVzSWRcIikucmVmZXJlbmNlcygoKSA9PiBvc1N0YXR1cy5pZCksXG4gIHNldG9ySWQ6IGludChcInNldG9ySWRcIikucmVmZXJlbmNlcygoKSA9PiBvc1NldG9yZXMuaWQpLFxuICBcbiAgLy8gTG9jYWxpemHDp8Ojb1xuICBlbmRlcmVjbzogdGV4dChcImVuZGVyZWNvXCIpLFxuICBsYXRpdHVkZTogdmFyY2hhcihcImxhdGl0dWRlXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgbG9uZ2l0dWRlOiB2YXJjaGFyKFwibG9uZ2l0dWRlXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgbG9jYWxpemFjYW9EZXNjcmljYW86IHZhcmNoYXIoXCJsb2NhbGl6YWNhb0Rlc2NyaWNhb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBcbiAgLy8gVGVtcG8gZXN0aW1hZG8gKGVtIG1pbnV0b3MgdG90YWlzKVxuICB0ZW1wb0VzdGltYWRvRGlhczogaW50KFwidGVtcG9Fc3RpbWFkb0RpYXNcIikuZGVmYXVsdCgwKSxcbiAgdGVtcG9Fc3RpbWFkb0hvcmFzOiBpbnQoXCJ0ZW1wb0VzdGltYWRvSG9yYXNcIikuZGVmYXVsdCgwKSxcbiAgdGVtcG9Fc3RpbWFkb01pbnV0b3M6IGludChcInRlbXBvRXN0aW1hZG9NaW51dG9zXCIpLmRlZmF1bHQoMCksXG4gIFxuICAvLyBDb250cm9sZSBkZSB0ZW1wbyByZWFsXG4gIGRhdGFJbmljaW86IHRpbWVzdGFtcChcImRhdGFJbmljaW9cIiksXG4gIGRhdGFGaW06IHRpbWVzdGFtcChcImRhdGFGaW1cIiksXG4gIHRlbXBvRGVjb3JyaWRvTWludXRvczogaW50KFwidGVtcG9EZWNvcnJpZG9NaW51dG9zXCIpLFxuICBcbiAgLy8gRmluYW5jZWlyb1xuICB2YWxvckVzdGltYWRvOiBkZWNpbWFsKFwidmFsb3JFc3RpbWFkb1wiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiAyIH0pLFxuICB2YWxvclJlYWw6IGRlY2ltYWwoXCJ2YWxvclJlYWxcIiwgeyBwcmVjaXNpb246IDEwLCBzY2FsZTogMiB9KSxcbiAgXG4gIC8vIFbDrW5jdWxvIGNvbSBtYW51dGVuw6fDo29cbiAgbWFudXRlbmNhb0lkOiBpbnQoXCJtYW51dGVuY2FvSWRcIikucmVmZXJlbmNlcygoKSA9PiBtYW51dGVuY29lcy5pZCksXG4gIFxuICAvLyBDaGF0XG4gIGNoYXRUb2tlbjogdmFyY2hhcihcImNoYXRUb2tlblwiLCB7IGxlbmd0aDogNjQgfSkudW5pcXVlKCksXG4gIGNoYXRBdGl2bzogYm9vbGVhbihcImNoYXRBdGl2b1wiKS5kZWZhdWx0KHRydWUpLFxuICBcbiAgLy8gU29saWNpdGFudGVcbiAgc29saWNpdGFudGVJZDogaW50KFwic29saWNpdGFudGVJZFwiKS5yZWZlcmVuY2VzKCgpID0+IHVzZXJzLmlkKSxcbiAgc29saWNpdGFudGVOb21lOiB2YXJjaGFyKFwic29saWNpdGFudGVOb21lXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIHNvbGljaXRhbnRlVGlwbzogbXlzcWxFbnVtKFwic29saWNpdGFudGVUaXBvXCIsIFtcInNpbmRpY29cIiwgXCJtb3JhZG9yXCIsIFwiZnVuY2lvbmFyaW9cIiwgXCJhZG1pbmlzdHJhZG9yYVwiXSkuZGVmYXVsdChcInNpbmRpY29cIiksXG4gIFxuICAvLyBDb21wYXJ0aWxoYW1lbnRvXG4gIHNoYXJlVG9rZW46IHZhcmNoYXIoXCJzaGFyZVRva2VuXCIsIHsgbGVuZ3RoOiA2NCB9KS51bmlxdWUoKSxcbiAgXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPcmRlbVNlcnZpY28gPSB0eXBlb2Ygb3JkZW5zU2Vydmljby4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRPcmRlbVNlcnZpY28gPSB0eXBlb2Ygb3JkZW5zU2Vydmljby4kaW5mZXJJbnNlcnQ7XG5cbi8vIFJlc3BvbnPDoXZlaXMgZGEgT1NcbmV4cG9ydCBjb25zdCBvc1Jlc3BvbnNhdmVpcyA9IG15c3FsVGFibGUoXCJvc19yZXNwb25zYXZlaXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgb3JkZW1TZXJ2aWNvSWQ6IGludChcIm9yZGVtU2Vydmljb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gb3JkZW5zU2Vydmljby5pZCkubm90TnVsbCgpLFxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgY2FyZ286IHZhcmNoYXIoXCJjYXJnb1wiLCB7IGxlbmd0aDogMTAwIH0pLFxuICB0ZWxlZm9uZTogdmFyY2hhcihcInRlbGVmb25lXCIsIHsgbGVuZ3RoOiAyMCB9KSxcbiAgZW1haWw6IHZhcmNoYXIoXCJlbWFpbFwiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBmdW5jaW9uYXJpb0lkOiBpbnQoXCJmdW5jaW9uYXJpb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gZnVuY2lvbmFyaW9zLmlkKSxcbiAgcHJpbmNpcGFsOiBib29sZWFuKFwicHJpbmNpcGFsXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCB0eXBlIE9zUmVzcG9uc2F2ZWwgPSB0eXBlb2Ygb3NSZXNwb25zYXZlaXMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T3NSZXNwb25zYXZlbCA9IHR5cGVvZiBvc1Jlc3BvbnNhdmVpcy4kaW5mZXJJbnNlcnQ7XG5cbi8vIE1hdGVyaWFpcyBkYSBPU1xuZXhwb3J0IGNvbnN0IG9zTWF0ZXJpYWlzID0gbXlzcWxUYWJsZShcIm9zX21hdGVyaWFpc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBvcmRlbVNlcnZpY29JZDogaW50KFwib3JkZW1TZXJ2aWNvSWRcIikucmVmZXJlbmNlcygoKSA9PiBvcmRlbnNTZXJ2aWNvLmlkKS5ub3ROdWxsKCksXG4gIG5vbWU6IHZhcmNoYXIoXCJub21lXCIsIHsgbGVuZ3RoOiAyNTUgfSkubm90TnVsbCgpLFxuICBkZXNjcmljYW86IHRleHQoXCJkZXNjcmljYW9cIiksXG4gIHF1YW50aWRhZGU6IGludChcInF1YW50aWRhZGVcIikuZGVmYXVsdCgxKSxcbiAgdW5pZGFkZTogdmFyY2hhcihcInVuaWRhZGVcIiwgeyBsZW5ndGg6IDIwIH0pLFxuICBlbUVzdG9xdWU6IGJvb2xlYW4oXCJlbUVzdG9xdWVcIikuZGVmYXVsdChmYWxzZSksXG4gIHByZWNpc2FQZWRpcjogYm9vbGVhbihcInByZWNpc2FQZWRpclwiKS5kZWZhdWx0KGZhbHNlKSxcbiAgcGVkaWRvRGVzY3JpY2FvOiB0ZXh0KFwicGVkaWRvRGVzY3JpY2FvXCIpLFxuICB2YWxvclVuaXRhcmlvOiBkZWNpbWFsKFwidmFsb3JVbml0YXJpb1wiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiAyIH0pLFxuICB2YWxvclRvdGFsOiBkZWNpbWFsKFwidmFsb3JUb3RhbFwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiAyIH0pLFxuICBjcmVhdGVkQXQ6IHRpbWVzdGFtcChcImNyZWF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IHRpbWVzdGFtcChcInVwZGF0ZWRBdFwiKS5kZWZhdWx0Tm93KCkub25VcGRhdGVOb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgT3NNYXRlcmlhbCA9IHR5cGVvZiBvc01hdGVyaWFpcy4kaW5mZXJTZWxlY3Q7XG5leHBvcnQgdHlwZSBJbnNlcnRPc01hdGVyaWFsID0gdHlwZW9mIG9zTWF0ZXJpYWlzLiRpbmZlckluc2VydDtcblxuLy8gT3LDp2FtZW50b3MgZGEgT1NcbmV4cG9ydCBjb25zdCBvc09yY2FtZW50b3MgPSBteXNxbFRhYmxlKFwib3Nfb3JjYW1lbnRvc1wiLCB7XG4gIGlkOiBpbnQoXCJpZFwiKS5hdXRvaW5jcmVtZW50KCkucHJpbWFyeUtleSgpLFxuICBvcmRlbVNlcnZpY29JZDogaW50KFwib3JkZW1TZXJ2aWNvSWRcIikucmVmZXJlbmNlcygoKSA9PiBvcmRlbnNTZXJ2aWNvLmlkKS5ub3ROdWxsKCksXG4gIGZvcm5lY2Vkb3I6IHZhcmNoYXIoXCJmb3JuZWNlZG9yXCIsIHsgbGVuZ3RoOiAyNTUgfSksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgdmFsb3I6IGRlY2ltYWwoXCJ2YWxvclwiLCB7IHByZWNpc2lvbjogMTAsIHNjYWxlOiAyIH0pLm5vdE51bGwoKSxcbiAgZGF0YU9yY2FtZW50bzogdGltZXN0YW1wKFwiZGF0YU9yY2FtZW50b1wiKS5kZWZhdWx0Tm93KCksXG4gIGRhdGFWYWxpZGFkZTogdGltZXN0YW1wKFwiZGF0YVZhbGlkYWRlXCIpLFxuICBhcHJvdmFkbzogYm9vbGVhbihcImFwcm92YWRvXCIpLmRlZmF1bHQoZmFsc2UpLFxuICBhcHJvdmFkb1BvcjogaW50KFwiYXByb3ZhZG9Qb3JcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIGRhdGFBcHJvdmFjYW86IHRpbWVzdGFtcChcImRhdGFBcHJvdmFjYW9cIiksXG4gIG1vdGl2b1JlamVpY2FvOiB0ZXh0KFwibW90aXZvUmVqZWljYW9cIiksXG4gIGFuZXhvVXJsOiB0ZXh0KFwiYW5leG9VcmxcIiksXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogdGltZXN0YW1wKFwidXBkYXRlZEF0XCIpLmRlZmF1bHROb3coKS5vblVwZGF0ZU5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPc09yY2FtZW50byA9IHR5cGVvZiBvc09yY2FtZW50b3MuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T3NPcmNhbWVudG8gPSB0eXBlb2Ygb3NPcmNhbWVudG9zLiRpbmZlckluc2VydDtcblxuLy8gVGltZWxpbmUvSGlzdMOzcmljbyBkYSBPU1xuZXhwb3J0IGNvbnN0IG9zVGltZWxpbmUgPSBteXNxbFRhYmxlKFwib3NfdGltZWxpbmVcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgb3JkZW1TZXJ2aWNvSWQ6IGludChcIm9yZGVtU2Vydmljb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gb3JkZW5zU2Vydmljby5pZCkubm90TnVsbCgpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcbiAgICBcImNyaWFjYW9cIixcbiAgICBcInN0YXR1c19hbHRlcmFkb1wiLFxuICAgIFwicmVzcG9uc2F2ZWxfYWRpY2lvbmFkb1wiLFxuICAgIFwicmVzcG9uc2F2ZWxfcmVtb3ZpZG9cIixcbiAgICBcIm1hdGVyaWFsX2FkaWNpb25hZG9cIixcbiAgICBcIm1hdGVyaWFsX3JlbW92aWRvXCIsXG4gICAgXCJvcmNhbWVudG9fYWRpY2lvbmFkb1wiLFxuICAgIFwib3JjYW1lbnRvX2Fwcm92YWRvXCIsXG4gICAgXCJvcmNhbWVudG9fcmVqZWl0YWRvXCIsXG4gICAgXCJvcmNhbWVudG9fcmVtb3ZpZG9cIixcbiAgICBcImluaWNpb19zZXJ2aWNvXCIsXG4gICAgXCJmaW1fc2Vydmljb1wiLFxuICAgIFwiY29tZW50YXJpb1wiLFxuICAgIFwiZm90b19hZGljaW9uYWRhXCIsXG4gICAgXCJsb2NhbGl6YWNhb19hdHVhbGl6YWRhXCIsXG4gICAgXCJ2aW5jdWxvX21hbnV0ZW5jYW9cIlxuICBdKS5ub3ROdWxsKCksXG4gIGRlc2NyaWNhbzogdGV4dChcImRlc2NyaWNhb1wiKSxcbiAgdXN1YXJpb0lkOiBpbnQoXCJ1c3VhcmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiB1c2Vycy5pZCksXG4gIHVzdWFyaW9Ob21lOiB2YXJjaGFyKFwidXN1YXJpb05vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgZGFkb3NBbnRlcmlvcmVzOiBqc29uKFwiZGFkb3NBbnRlcmlvcmVzXCIpLFxuICBkYWRvc05vdm9zOiBqc29uKFwiZGFkb3NOb3Zvc1wiKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPc1RpbWVsaW5lID0gdHlwZW9mIG9zVGltZWxpbmUuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T3NUaW1lbGluZSA9IHR5cGVvZiBvc1RpbWVsaW5lLiRpbmZlckluc2VydDtcblxuLy8gQ2hhdCBkYSBPU1xuZXhwb3J0IGNvbnN0IG9zQ2hhdCA9IG15c3FsVGFibGUoXCJvc19jaGF0XCIsIHtcbiAgaWQ6IGludChcImlkXCIpLmF1dG9pbmNyZW1lbnQoKS5wcmltYXJ5S2V5KCksXG4gIG9yZGVtU2Vydmljb0lkOiBpbnQoXCJvcmRlbVNlcnZpY29JZFwiKS5yZWZlcmVuY2VzKCgpID0+IG9yZGVuc1NlcnZpY28uaWQpLm5vdE51bGwoKSxcbiAgcmVtZXRlbnRlSWQ6IGludChcInJlbWV0ZW50ZUlkXCIpLnJlZmVyZW5jZXMoKCkgPT4gdXNlcnMuaWQpLFxuICByZW1ldGVudGVOb21lOiB2YXJjaGFyKFwicmVtZXRlbnRlTm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSxcbiAgcmVtZXRlbnRlVGlwbzogbXlzcWxFbnVtKFwicmVtZXRlbnRlVGlwb1wiLCBbXCJzaW5kaWNvXCIsIFwibW9yYWRvclwiLCBcImZ1bmNpb25hcmlvXCIsIFwidmlzaXRhbnRlXCJdKS5kZWZhdWx0KFwidmlzaXRhbnRlXCIpLFxuICBtZW5zYWdlbTogdGV4dChcIm1lbnNhZ2VtXCIpLFxuICBhbmV4b1VybDogdGV4dChcImFuZXhvVXJsXCIpLFxuICBhbmV4b05vbWU6IHZhcmNoYXIoXCJhbmV4b05vbWVcIiwgeyBsZW5ndGg6IDI1NSB9KSxcbiAgYW5leG9UaXBvOiB2YXJjaGFyKFwiYW5leG9UaXBvXCIsIHsgbGVuZ3RoOiAxMDAgfSksXG4gIGFuZXhvVGFtYW5obzogaW50KFwiYW5leG9UYW1hbmhvXCIpLFxuICBsaWRhOiBib29sZWFuKFwibGlkYVwiKS5kZWZhdWx0KGZhbHNlKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPc0NoYXQgPSB0eXBlb2Ygb3NDaGF0LiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydE9zQ2hhdCA9IHR5cGVvZiBvc0NoYXQuJGluZmVySW5zZXJ0O1xuXG4vLyBJbWFnZW5zIGRhIE9TXG5leHBvcnQgY29uc3Qgb3NJbWFnZW5zID0gbXlzcWxUYWJsZShcIm9zX2ltYWdlbnNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgb3JkZW1TZXJ2aWNvSWQ6IGludChcIm9yZGVtU2Vydmljb0lkXCIpLnJlZmVyZW5jZXMoKCkgPT4gb3JkZW5zU2Vydmljby5pZCkubm90TnVsbCgpLFxuICB1cmw6IHRleHQoXCJ1cmxcIikubm90TnVsbCgpLFxuICB0aXBvOiBteXNxbEVudW0oXCJ0aXBvXCIsIFtcImFudGVzXCIsIFwiZHVyYW50ZVwiLCBcImRlcG9pc1wiLCBcIm9yY2FtZW50b1wiLCBcIm91dHJvXCJdKS5kZWZhdWx0KFwib3V0cm9cIiksXG4gIGRlc2NyaWNhbzogdmFyY2hhcihcImRlc2NyaWNhb1wiLCB7IGxlbmd0aDogMjU1IH0pLFxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKSxcbiAgY3JlYXRlZEF0OiB0aW1lc3RhbXAoXCJjcmVhdGVkQXRcIikuZGVmYXVsdE5vdygpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgdHlwZSBPc0ltYWdlbSA9IHR5cGVvZiBvc0ltYWdlbnMuJGluZmVyU2VsZWN0O1xuZXhwb3J0IHR5cGUgSW5zZXJ0T3NJbWFnZW0gPSB0eXBlb2Ygb3NJbWFnZW5zLiRpbmZlckluc2VydDtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBGVU7Dh8OVRVMgUsOBUElEQVMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBmdW5jb2VzUmFwaWRhcyA9IG15c3FsVGFibGUoXCJmdW5jb2VzX3JhcGlkYXNcIiwge1xuICBpZDogaW50KFwiaWRcIikuYXV0b2luY3JlbWVudCgpLnByaW1hcnlLZXkoKSxcbiAgY29uZG9taW5pb0lkOiBpbnQoXCJjb25kb21pbmlvSWRcIikucmVmZXJlbmNlcygoKSA9PiBjb25kb21pbmlvcy5pZCkubm90TnVsbCgpLFxuICBmdW5jYW9JZDogdmFyY2hhcihcImZ1bmNhb0lkXCIsIHsgbGVuZ3RoOiAxMDAgfSkubm90TnVsbCgpLCAvLyBJRCBkYSBmdW7Dp8OjbyAoZXg6IFwiYXZpc29zXCIsIFwiZXZlbnRvc1wiLCBldGMuKVxuICBub21lOiB2YXJjaGFyKFwibm9tZVwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSwgLy8gTm9tZSBkYSBmdW7Dp8Ojb1xuICBwYXRoOiB2YXJjaGFyKFwicGF0aFwiLCB7IGxlbmd0aDogMjU1IH0pLm5vdE51bGwoKSwgLy8gQ2FtaW5oby9yb3RhIGRhIGZ1bsOnw6NvXG4gIGljb25lOiB2YXJjaGFyKFwiaWNvbmVcIiwgeyBsZW5ndGg6IDEwMCB9KS5ub3ROdWxsKCksIC8vIE5vbWUgZG8gw61jb25lIEx1Y2lkZVxuICBjb3I6IHZhcmNoYXIoXCJjb3JcIiwgeyBsZW5ndGg6IDIwIH0pLm5vdE51bGwoKSwgLy8gQ29yIGVtIGhleCAoZXg6IFwiI0VGNDQ0NFwiKVxuICBvcmRlbTogaW50KFwib3JkZW1cIikuZGVmYXVsdCgwKS5ub3ROdWxsKCksIC8vIE9yZGVtIGRlIGV4aWJpw6fDo28gKDAtMTEpXG4gIGNyZWF0ZWRBdDogdGltZXN0YW1wKFwiY3JlYXRlZEF0XCIpLmRlZmF1bHROb3coKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgRnVuY2FvUmFwaWRhID0gdHlwZW9mIGZ1bmNvZXNSYXBpZGFzLiRpbmZlclNlbGVjdDtcbmV4cG9ydCB0eXBlIEluc2VydEZ1bmNhb1JhcGlkYSA9IHR5cGVvZiBmdW5jb2VzUmFwaWRhcy4kaW5mZXJJbnNlcnQ7XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxXQUFXLFlBQVksTUFBTSxXQUFXLFNBQVMsU0FBUyxNQUFNLGVBQWU7QUFHdEYsYUFBTSxRQUFRLFdBQVcsU0FBUztBQUFBLEVBQ3ZDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU87QUFBQSxFQUMzRCxNQUFNLEtBQUssTUFBTTtBQUFBLEVBQ2pCLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN2QyxhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDbEQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxRQUFRLFNBQVMsV0FBVyxTQUFTLENBQUMsRUFBRSxRQUFRLE1BQU0sRUFBRSxRQUFRO0FBQUEsRUFDekYsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBO0FBQUEsRUFFOUMsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3ZDLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNoRCxrQkFBa0IsVUFBVSxrQkFBa0I7QUFBQTtBQUFBLEVBRTlDLFdBQVcsVUFBVSxhQUFhLENBQUMsV0FBVyxrQkFBa0IsT0FBTyxDQUFDLEVBQUUsUUFBUSxTQUFTO0FBQUEsRUFDM0YsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQUEsRUFDckUsY0FBYyxVQUFVLGNBQWMsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUMvRCxDQUFDO0FBTU0sYUFBTSxjQUFjLFdBQVcsZUFBZTtBQUFBLEVBQ25ELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDeEMsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3BDLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsVUFBVSxLQUFLLFVBQVU7QUFBQSxFQUN6QixRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDekMsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3hDLEtBQUssUUFBUSxPQUFPLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNsQyxTQUFTLEtBQUssU0FBUztBQUFBLEVBQ3ZCLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsU0FBUyxLQUFLLFNBQVM7QUFBQSxFQUN2QixhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxTQUFTO0FBQUEsRUFDckUsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekUsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsT0FBTztBQUFBLEVBQy9ELGdCQUFnQixLQUFLLGdCQUFnQjtBQUFBLEVBQ3JDLGdCQUFnQixVQUFVLGdCQUFnQjtBQUFBLEVBQzFDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBO0FBQUEsRUFFckQsa0JBQWtCLEtBQUssa0JBQWtCO0FBQUEsRUFDekMseUJBQXlCLFFBQVEsMkJBQTJCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMzRSxzQkFBc0IsUUFBUSx3QkFBd0IsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3JFLGFBQWEsS0FBSyxhQUFhO0FBQUEsRUFDL0IsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUE7QUFBQSxFQUV2RCxpQkFBaUIsUUFBUSxtQkFBbUIsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQzFELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxXQUFXLFdBQVcsWUFBWTtBQUFBLEVBQzdDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN4QyxTQUFTLEtBQUssU0FBUztBQUFBLEVBQ3ZCLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLFNBQVM7QUFBQSxFQUNuRSxRQUFRLFVBQVUsVUFBVSxDQUFDLFlBQVksYUFBYSxXQUFXLENBQUMsRUFBRSxRQUFRLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDaEcsYUFBYSxVQUFVLGFBQWE7QUFBQSxFQUNwQyxlQUFlLElBQUksZUFBZSxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdDLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxPQUFPO0FBQUEsRUFDeEQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLFNBQVMsV0FBVyxVQUFVO0FBQUEsRUFDekMsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNsRSxNQUFNLFVBQVUsUUFBUTtBQUFBLElBQ3RCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNYLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN6QyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsUUFBUSxLQUFLLFFBQVE7QUFBQSxFQUNyQixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sbUJBQW1CLFdBQVcscUJBQXFCO0FBQUEsRUFDOUQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNsRSxnQkFBZ0IsS0FBSyxnQkFBZ0I7QUFBQSxFQUNyQyxhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDbkQsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3pDLFVBQVUsS0FBSyxVQUFVO0FBQUEsRUFDekIsWUFBWSxRQUFRLGNBQWMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ2pELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxTQUFTLFdBQVcsVUFBVTtBQUFBLEVBQ3pDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDbEUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLE1BQU0sVUFBVSxRQUFRLENBQUMsV0FBVyxjQUFjLGFBQWEsQ0FBQyxFQUFFLFFBQVEsYUFBYTtBQUFBLEVBQ3ZGLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsVUFBVSxRQUFRLFVBQVUsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUMzQyxlQUFlLFVBQVUsZUFBZTtBQUFBLEVBQ3hDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxlQUFlLFdBQVcsZ0JBQWdCO0FBQUEsRUFDckQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQy9DLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN2QyxjQUFjLFFBQVEsZ0JBQWdCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNyRCxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDNUMsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3ZDLFNBQVMsS0FBSyxTQUFTO0FBQUEsRUFDdkIsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixjQUFjLFVBQVUsY0FBYztBQUFBLEVBQ3RDLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUE7QUFBQSxFQUVwQyxpQkFBaUIsVUFBVSxtQkFBbUIsQ0FBQyxXQUFXLFlBQVksY0FBYyxXQUFXLFlBQVksaUJBQWlCLENBQUMsRUFBRSxRQUFRLFVBQVU7QUFBQTtBQUFBLEVBRWpKLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNqRCxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDdkMsWUFBWSxRQUFRLFlBQVksRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUMvQyxhQUFhLFVBQVUsYUFBYTtBQUFBO0FBQUEsRUFFcEMsWUFBWSxRQUFRLGNBQWMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2hELGtCQUFrQixVQUFVLGtCQUFrQjtBQUFBLEVBQzlDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBR00sYUFBTSxxQkFBcUIsV0FBVyx1QkFBdUI7QUFBQSxFQUNsRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsZUFBZSxJQUFJLGVBQWUsRUFBRSxXQUFXLE1BQU0sYUFBYSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzlFLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxVQUFVLFVBQVUsVUFBVSxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDckQsSUFBSSxRQUFRLE1BQU0sRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2hDLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsYUFBYSxRQUFRLGVBQWUsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ25ELFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxvQkFBb0IsUUFBUSxzQkFBc0IsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ2pFLGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNuRCxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDNUMsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQzlDLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN6QyxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDekMsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3JDLFlBQVksVUFBVSxjQUFjLENBQUMsU0FBUyxVQUFVLHFCQUFxQixpQkFBaUIsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUFBLEVBQ2hILFNBQVMsUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDeEMsYUFBYSxLQUFLLGFBQWE7QUFDakMsQ0FBQztBQU1NLGFBQU0scUJBQXFCLFdBQVcsdUJBQXVCO0FBQUEsRUFDbEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGVBQWUsSUFBSSxlQUFlLEVBQUUsV0FBVyxNQUFNLGFBQWEsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUM5RSxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3pELFlBQVksUUFBUSxZQUFZLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDOUMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFTTSxhQUFNLHlCQUF5QixXQUFXLDJCQUEyQjtBQUFBLEVBQzFFLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxlQUFlLElBQUksZUFBZSxFQUFFLFdBQVcsTUFBTSxhQUFhLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDOUUsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGtCQUFrQixXQUFXLG9CQUFvQjtBQUFBLEVBQzVELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxlQUFlLElBQUksZUFBZSxFQUFFLFdBQVcsTUFBTSxhQUFhLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDOUUsT0FBTyxJQUFJLE9BQU8sRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3RELE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLFVBQVUsV0FBVyxXQUFXO0FBQUEsRUFDM0MsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNsRSxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsWUFBWSxVQUFVLFlBQVk7QUFBQSxFQUNsQyxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDaEQsU0FBUyxRQUFRLFdBQVcsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQzFDLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN2QyxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE1BQU0sVUFBVSxRQUFRLENBQUMsWUFBWSxXQUFXLENBQUMsRUFBRSxRQUFRLFVBQVU7QUFBQSxFQUNyRSxpQkFBaUIsUUFBUSxtQkFBbUIsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNELHFCQUFxQixRQUFRLHVCQUF1QixFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDbEUsc0JBQXNCLElBQUksc0JBQXNCLEVBQUUsUUFBUSxDQUFDO0FBQUE7QUFBQSxFQUMzRCxpQkFBaUIsUUFBUSxpQkFBaUIsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUN6RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sY0FBYyxXQUFXLGdCQUFnQjtBQUFBLEVBQ3BELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDbEUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLGNBQWMsS0FBSyxjQUFjO0FBQUEsRUFDakMsZUFBZSxLQUFLLGVBQWU7QUFBQSxFQUNuQyxnQkFBZ0IsVUFBVSxnQkFBZ0I7QUFBQSxFQUMxQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sa0JBQWtCLFdBQVcsb0JBQW9CO0FBQUEsRUFDNUQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDL0QsTUFBTSxVQUFVLFFBQVEsQ0FBQyxVQUFVLFNBQVMsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsU0FBUyxLQUFLLFNBQVM7QUFBQSxFQUN2QixpQkFBaUIsUUFBUSxtQkFBbUIsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNELGdCQUFnQixVQUFVLGdCQUFnQjtBQUFBLEVBQzFDLFFBQVEsVUFBVSxVQUFVLENBQUMsVUFBVSxXQUFXLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUNyRSxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLFVBQVUsV0FBVyxXQUFXO0FBQUEsRUFDM0MsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNyRCxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxVQUFVLEVBQUU7QUFBQSxFQUN6RCxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsTUFBTSxVQUFVLFFBQVEsQ0FBQyxXQUFXLFNBQVMsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN4RCxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFNBQVMsUUFBUSxXQUFXLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDckQsWUFBWSxVQUFVLFlBQVk7QUFBQSxFQUNsQyxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDMUMsa0JBQWtCLElBQUksa0JBQWtCLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDbkQsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixRQUFRLFVBQVUsVUFBVSxDQUFDLFNBQVMsYUFBYSxXQUFXLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUNoRixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sZ0JBQWdCLFdBQVcsaUJBQWlCO0FBQUEsRUFDdkQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNyRCxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxVQUFVLEVBQUU7QUFBQSxFQUN6RCxNQUFNLFVBQVUsUUFBUSxDQUFDLFdBQVcsU0FBUyxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3hELFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsU0FBUyxLQUFLLFNBQVM7QUFBQSxFQUN2QixTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsUUFBUSxVQUFVLFVBQVUsQ0FBQyxZQUFZLFlBQVksYUFBYSxTQUFTLENBQUMsRUFBRSxRQUFRLFVBQVU7QUFBQSxFQUNoRyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sV0FBVyxXQUFXLFlBQVk7QUFBQSxFQUM3QyxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2xFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixNQUFNLFVBQVUsUUFBUSxDQUFDLG1CQUFtQixXQUFXLFNBQVMsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMzRSxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFlBQVksS0FBSyxZQUFZO0FBQUEsRUFDN0IsVUFBVSxLQUFLLFVBQVU7QUFBQSxFQUN6QixZQUFZLFVBQVUsWUFBWTtBQUFBLEVBQ2xDLFNBQVMsVUFBVSxTQUFTO0FBQUEsRUFDNUIsUUFBUSxVQUFVLFVBQVUsQ0FBQyxTQUFTLFdBQVcsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUFBLEVBQ25FLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxnQkFBZ0IsV0FBVyxrQkFBa0I7QUFBQSxFQUN4RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2xFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxRQUFRLFdBQVcsU0FBUztBQUFBLEVBQ3ZDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDbEUsU0FBUyxJQUFJLFNBQVMsRUFBRSxXQUFXLE1BQU0sY0FBYyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ25FLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMvRCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLHNCQUFzQixXQUFXLHdCQUF3QjtBQUFBLEVBQ3BFLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNsRCxhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDbEQsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3RDLE1BQU0sVUFBVSxRQUFRLENBQUMsV0FBVyxjQUFjLE1BQU0sQ0FBQyxFQUFFLFFBQVEsU0FBUztBQUFBLEVBQzVFLGFBQWEsS0FBSyxhQUFhO0FBQUEsRUFDL0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGFBQWEsV0FBVyxlQUFlO0FBQUEsRUFDbEQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNsRSxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELEtBQUssS0FBSyxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQ3pCLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3RDLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxpQkFBaUIsV0FBVyxtQkFBbUI7QUFBQSxFQUMxRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2xFLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN0RCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0sZUFBZSxXQUFXLGdCQUFnQjtBQUFBLEVBQ3JELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsWUFBWSxRQUFRLGNBQWMsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMzRCxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixTQUFTLEtBQUssU0FBUztBQUFBLEVBQ3ZCLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUM1QyxNQUFNLFVBQVUsUUFBUSxDQUFDLFVBQVUsWUFBWSxTQUFTLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUMzRSxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFlBQVksVUFBVSxZQUFZO0FBQUEsRUFDbEMsU0FBUyxVQUFVLFNBQVM7QUFBQSxFQUM1QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sWUFBWSxXQUFXLGFBQWE7QUFBQSxFQUMvQyxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQ3JELE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3ZDLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUM1QyxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDMUMsYUFBYSxRQUFRLGVBQWUsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUM1RCxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3RDLE1BQU0sVUFBVSxRQUFRLENBQUMsZ0JBQWdCLGFBQWEsWUFBWSxhQUFhLENBQUMsRUFBRSxRQUFRLGNBQWM7QUFBQSxFQUN4RyxLQUFLLFFBQVEsT0FBTyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDbEMsZ0JBQWdCLFVBQVUsZ0JBQWdCO0FBQUEsRUFDMUMsU0FBUyxLQUFLLFNBQVM7QUFBQSxFQUN2QixhQUFhLEtBQUssYUFBYTtBQUFBLEVBQy9CLGFBQWEsVUFBVSxhQUFhO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVc7QUFBQSxFQUNoQyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBO0FBQUEsRUFFcEMsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3ZDLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNoRCxrQkFBa0IsVUFBVSxrQkFBa0I7QUFBQSxFQUM5QyxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDaEQsa0JBQWtCLFVBQVUsa0JBQWtCO0FBQUEsRUFDOUMsYUFBYSxVQUFVLGFBQWE7QUFBQTtBQUFBLEVBRXBDLGtCQUFrQixRQUFRLGtCQUFrQixFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzNELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBT00sYUFBTSxlQUFlLFdBQVcsZ0JBQWdCO0FBQUEsRUFDckQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFFBQVEsSUFBSSxRQUFRLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUN6RCxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUU7QUFBQSxFQUNqRSxNQUFNLFVBQVUsUUFBUSxDQUFDLFNBQVMsVUFBVSxXQUFXLGdCQUFnQixVQUFVLE9BQU8sQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRyxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFVBQVUsS0FBSyxVQUFVO0FBQUEsRUFDekIsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3JDLGNBQWMsSUFBSSxjQUFjO0FBQUEsRUFDaEMsTUFBTSxRQUFRLE1BQU0sRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUNuQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLGNBQWMsV0FBVyxlQUFlO0FBQUEsRUFDbkQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNsRSxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixnQkFBZ0IsVUFBVSxnQkFBZ0I7QUFBQSxFQUMxQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sWUFBWSxXQUFXLGFBQWE7QUFBQSxFQUMvQyxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2xFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN0QyxtQkFBbUIsVUFBVSxtQkFBbUI7QUFBQSxFQUNoRCxRQUFRLFVBQVUsVUFBVSxDQUFDLGFBQWEsZ0JBQWdCLFdBQVcsQ0FBQyxFQUFFLFFBQVEsV0FBVztBQUFBLEVBQzNGLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxhQUFhLFdBQVcsY0FBYztBQUFBLEVBQ2pELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDbEUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3RDLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNqRCxlQUFlLFVBQVUsZUFBZTtBQUFBLEVBQ3hDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSwwQkFBMEIsV0FBVyw0QkFBNEI7QUFBQSxFQUM1RSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsUUFBUSxJQUFJLFFBQVEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU87QUFBQSxFQUNsRSxRQUFRLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3RDLFNBQVMsUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDeEMsVUFBVSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUMxQyxlQUFlLFFBQVEsZUFBZSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BELFNBQVMsUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDeEMsbUJBQW1CLFFBQVEsbUJBQW1CLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDN0QsaUJBQWlCLFFBQVEsbUJBQW1CLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUMzRSxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sY0FBYyxXQUFXLGVBQWU7QUFBQSxFQUNuRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixXQUFXLFVBQVUsYUFBYSxDQUFDLFlBQVksWUFBWSxpQkFBaUIsZUFBZSxTQUFTLFlBQVksUUFBUSxDQUFDLEVBQUUsUUFBUSxRQUFRLEVBQUUsUUFBUTtBQUFBLEVBQ3JKLFNBQVMsS0FBSyxTQUFTO0FBQUEsRUFDdkIsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQzVDLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUM1QyxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDdkMsU0FBUyxLQUFLLFNBQVM7QUFBQSxFQUN2QixVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDN0Msc0JBQXNCLEtBQUssc0JBQXNCO0FBQUEsRUFDakQsUUFBUSxVQUFVLG9CQUFvQixDQUFDLFNBQVMsU0FBUyxDQUFDLEVBQUUsUUFBUSxPQUFPLEVBQUUsUUFBUTtBQUFBLEVBQ3JGLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxXQUFXLFdBQVcsWUFBWTtBQUFBLEVBQzdDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFO0FBQUEsRUFDeEQsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixTQUFTLFVBQVUsV0FBVyxDQUFDLFFBQVEsY0FBYyxrQkFBa0IsVUFBVSxTQUFTLENBQUMsRUFBRSxRQUFRLGdCQUFnQixFQUFFLFFBQVE7QUFBQSxFQUMvSCxTQUFTLFVBQVUsV0FBVyxDQUFDLFdBQVcsU0FBUyxVQUFVLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxPQUFPLEVBQUUsUUFBUTtBQUFBLEVBQ3pHLFlBQVksVUFBVSxZQUFZO0FBQUEsRUFDbEMsU0FBUyxVQUFVLFNBQVM7QUFBQSxFQUM1QixRQUFRLFVBQVUsaUJBQWlCLENBQUMsU0FBUyxXQUFXLFlBQVksVUFBVSxDQUFDLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUTtBQUFBLEVBQzdHLGVBQWUsSUFBSSxlQUFlLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0MsU0FBUyxJQUFJLFNBQVMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUNqQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU9NLGFBQU0sY0FBYyxXQUFXLGVBQWU7QUFBQSxFQUNuRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2xFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsY0FBYyxJQUFJLGNBQWM7QUFBQSxFQUNoQyxnQkFBZ0IsVUFBVSxnQkFBZ0IsRUFBRSxXQUFXO0FBQUEsRUFDdkQsVUFBVSxRQUFRLFVBQVUsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUMzQyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBT00sYUFBTSxTQUFTLFdBQVcsVUFBVTtBQUFBLEVBQ3pDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFdBQVcsVUFBVSxhQUFhLENBQUMsV0FBVyxTQUFTLGdCQUFnQixhQUFhLFFBQVEsQ0FBQyxFQUFFLFFBQVEsUUFBUSxFQUFFLFFBQVE7QUFBQSxFQUN6SCxTQUFTLEtBQUssU0FBUztBQUFBLEVBQ3ZCLFlBQVksVUFBVSxZQUFZO0FBQUEsRUFDbEMsVUFBVSxRQUFRLFVBQVUsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUMzQyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLFFBQVEsV0FBVyxTQUFTO0FBQUEsRUFDdkMsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFNBQVMsSUFBSSxTQUFTLEVBQUUsV0FBVyxNQUFNLE9BQU8sRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUM1RCxLQUFLLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUN6QixTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixTQUFTLElBQUksU0FBUztBQUFBLEVBQ3RCLFFBQVEsSUFBSSxRQUFRO0FBQUEsRUFDcEIsU0FBUyxJQUFJLFNBQVM7QUFBQSxFQUN0QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGlCQUFpQixXQUFXLG1CQUFtQjtBQUFBLEVBQzFELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUU7QUFBQSxFQUNqRSxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFVBQVUsS0FBSyxVQUFVLEVBQUUsUUFBUTtBQUFBLEVBQ25DLFdBQVcsVUFBVSxhQUFhO0FBQUEsSUFDaEM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUNsQixPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxRQUFRO0FBQUEsRUFDeEQsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNwQyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxlQUFlLFdBQVcsaUJBQWlCO0FBQUEsRUFDdEQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRTtBQUFBLEVBQ2pFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsVUFBVSxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDbkMsV0FBVyxVQUFVLGFBQWE7QUFBQSxJQUNoQztBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUFBLEVBQ2xCLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0scUJBQXFCLFdBQVcsdUJBQXVCO0FBQUEsRUFDbEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxXQUFXLEtBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUNyQyxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLG1CQUFtQixXQUFXLHFCQUFxQjtBQUFBLEVBQzlELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxZQUFZLElBQUksWUFBWSxFQUFFLFdBQVcsTUFBTSxVQUFVLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDckUsV0FBVyxLQUFLLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDckMsU0FBUyxRQUFRLFdBQVcsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNDLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxvQkFBb0IsV0FBVyxzQkFBc0I7QUFBQSxFQUNoRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsYUFBYSxJQUFJLGFBQWEsRUFBRSxXQUFXLE1BQU0sV0FBVyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3hFLFdBQVcsS0FBSyxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3JDLFNBQVMsUUFBUSxXQUFXLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMzQyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0seUJBQXlCLFdBQVcsNEJBQTRCO0FBQUEsRUFDM0UsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGlCQUFpQixJQUFJLGlCQUFpQixFQUFFLFdBQVcsTUFBTSxnQkFBZ0IsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNyRixXQUFXLEtBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUNyQyxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLGVBQWUsV0FBVyxpQkFBaUI7QUFBQSxFQUN0RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsUUFBUSxJQUFJLFFBQVEsRUFBRSxXQUFXLE1BQU0sb0JBQW9CLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDdkUsTUFBTSxVQUFVLFFBQVEsQ0FBQyxVQUFVLE9BQU8sQ0FBQyxFQUFFLFFBQVEsUUFBUTtBQUFBLEVBQzdELEtBQUssS0FBSyxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQ3pCLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNyQyxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDN0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLFlBQVksV0FBVyxhQUFhO0FBQUEsRUFDL0MsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFFBQVEsSUFBSSxRQUFRLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUN6RCxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUU7QUFBQSxFQUNqRSxVQUFVLFVBQVUsWUFBWTtBQUFBLElBQzlCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ1gsUUFBUSxJQUFJLFFBQVE7QUFBQSxFQUNwQixhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDbEQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBT00sYUFBTSxZQUFZLFdBQVcsYUFBYTtBQUFBLEVBQy9DLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPO0FBQUEsRUFDakUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixhQUFhLEtBQUssYUFBYTtBQUFBLEVBQy9CLGVBQWUsSUFBSSxlQUFlLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQzdELGlCQUFpQixRQUFRLG1CQUFtQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0QsYUFBYSxRQUFRLGVBQWUsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ25ELFVBQVUsUUFBUSxZQUFZLEVBQUUsV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFDekQsV0FBVyxRQUFRLGFBQWEsRUFBRSxXQUFXLElBQUksT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMzRCxhQUFhLEtBQUssYUFBYTtBQUFBLEVBQy9CLGNBQWMsVUFBVSxjQUFjO0FBQUEsRUFDdEMsZUFBZSxVQUFVLGVBQWU7QUFBQSxFQUN4QyxRQUFRLFVBQVUsVUFBVSxDQUFDLFlBQVksYUFBYSxtQkFBbUIsY0FBYyxVQUFVLENBQUMsRUFBRSxRQUFRLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDaEksWUFBWSxVQUFVLGNBQWMsQ0FBQyxTQUFTLFNBQVMsUUFBUSxTQUFTLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUMxRixNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDckMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGtCQUFrQixXQUFXLG9CQUFvQjtBQUFBLEVBQzVELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxZQUFZLElBQUksWUFBWSxFQUFFLFdBQVcsTUFBTSxVQUFVLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDckUsS0FBSyxLQUFLLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDekIsU0FBUyxRQUFRLFdBQVcsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNDLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxtQkFBbUIsV0FBVyxxQkFBcUI7QUFBQSxFQUM5RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsWUFBWSxJQUFJLFlBQVksRUFBRSxXQUFXLE1BQU0sVUFBVSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3JFLE1BQU0sVUFBVSxRQUFRLENBQUMsWUFBWSxlQUFlLG1CQUFtQixjQUFjLHFCQUFxQix3QkFBd0IsY0FBYyxZQUFZLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDdkssV0FBVyxLQUFLLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDckMsZ0JBQWdCLFFBQVEsa0JBQWtCLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN4RCxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDaEQsUUFBUSxJQUFJLFFBQVEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDL0MsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzdDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0sY0FBYyxXQUFXLGVBQWU7QUFBQSxFQUNuRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTztBQUFBLEVBQ2pFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQy9DLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixlQUFlLElBQUksZUFBZSxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUM3RCxpQkFBaUIsUUFBUSxtQkFBbUIsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNELGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNuRCxVQUFVLFFBQVEsWUFBWSxFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3pELFdBQVcsUUFBUSxhQUFhLEVBQUUsV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFDM0QsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixjQUFjLFVBQVUsY0FBYztBQUFBLEVBQ3RDLGVBQWUsVUFBVSxlQUFlO0FBQUEsRUFDeEMsUUFBUSxVQUFVLFVBQVUsQ0FBQyxZQUFZLGFBQWEsbUJBQW1CLGNBQWMsVUFBVSxDQUFDLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUTtBQUFBLEVBQ2hJLFlBQVksVUFBVSxjQUFjLENBQUMsU0FBUyxTQUFTLFFBQVEsU0FBUyxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsRUFDMUYsTUFBTSxVQUFVLFFBQVEsQ0FBQyxjQUFjLGFBQWEsZUFBZSxZQUFZLENBQUMsRUFBRSxRQUFRLFdBQVc7QUFBQSxFQUNyRyxtQkFBbUIsSUFBSSxtQkFBbUIsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUNyRCxvQkFBb0IsSUFBSSxvQkFBb0IsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUN2RCxzQkFBc0IsSUFBSSxzQkFBc0IsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMzRCxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDakQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLG9CQUFvQixXQUFXLHNCQUFzQjtBQUFBLEVBQ2hFLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsS0FBSyxLQUFLLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDekIsU0FBUyxRQUFRLFdBQVcsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNDLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxxQkFBcUIsV0FBVyx1QkFBdUI7QUFBQSxFQUNsRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE1BQU0sVUFBVSxRQUFRLENBQUMsWUFBWSxlQUFlLG1CQUFtQixjQUFjLHFCQUFxQix3QkFBd0IsY0FBYyxZQUFZLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDdkssV0FBVyxLQUFLLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDckMsZ0JBQWdCLFFBQVEsa0JBQWtCLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN4RCxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDaEQsUUFBUSxJQUFJLFFBQVEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDL0MsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzdDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0sY0FBYyxXQUFXLGVBQWU7QUFBQSxFQUNuRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTztBQUFBLEVBQ2pFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQy9DLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDL0Qsa0JBQWtCLFFBQVEsb0JBQW9CLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUM3RCxlQUFlLElBQUksZUFBZSxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUM3RCxpQkFBaUIsUUFBUSxtQkFBbUIsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzNELGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNuRCxVQUFVLFFBQVEsWUFBWSxFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3pELFdBQVcsUUFBUSxhQUFhLEVBQUUsV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFDM0QsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixnQkFBZ0IsVUFBVSxnQkFBZ0I7QUFBQSxFQUMxQyxRQUFRLFVBQVUsVUFBVSxDQUFDLFlBQVksYUFBYSxtQkFBbUIsY0FBYyxVQUFVLENBQUMsRUFBRSxRQUFRLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDaEksWUFBWSxVQUFVLGNBQWMsQ0FBQyxTQUFTLFNBQVMsUUFBUSxTQUFTLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUMxRixXQUFXLFVBQVUsYUFBYSxDQUFDLGFBQWEsV0FBVyxjQUFjLGVBQWUsV0FBVyxrQkFBa0IsV0FBVyxRQUFRLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUMzSixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sb0JBQW9CLFdBQVcsc0JBQXNCO0FBQUEsRUFDaEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxLQUFLLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUN6QixTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLHFCQUFxQixXQUFXLHVCQUF1QjtBQUFBLEVBQ2xFLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxVQUFVLFFBQVEsQ0FBQyxZQUFZLGVBQWUsbUJBQW1CLGNBQWMscUJBQXFCLHdCQUF3QixjQUFjLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN2SyxXQUFXLEtBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUNyQyxnQkFBZ0IsUUFBUSxrQkFBa0IsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3hELFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNoRCxRQUFRLElBQUksUUFBUSxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUMvQyxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDN0MsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxhQUFhLFdBQVcsY0FBYztBQUFBLEVBQ2pELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPO0FBQUEsRUFDakUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixhQUFhLEtBQUssYUFBYTtBQUFBLEVBQy9CLGVBQWUsSUFBSSxlQUFlLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQzdELGlCQUFpQixRQUFRLG1CQUFtQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0QsYUFBYSxRQUFRLGVBQWUsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ25ELFVBQVUsUUFBUSxZQUFZLEVBQUUsV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFDekQsV0FBVyxRQUFRLGFBQWEsRUFBRSxXQUFXLElBQUksT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMzRCxhQUFhLEtBQUssYUFBYTtBQUFBLEVBQy9CLGNBQWMsVUFBVSxjQUFjO0FBQUEsRUFDdEMsZUFBZSxVQUFVLGVBQWU7QUFBQSxFQUN4QyxRQUFRLFVBQVUsVUFBVSxDQUFDLFlBQVksYUFBYSxtQkFBbUIsY0FBYyxVQUFVLENBQUMsRUFBRSxRQUFRLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDaEksWUFBWSxVQUFVLGNBQWMsQ0FBQyxTQUFTLFNBQVMsUUFBUSxTQUFTLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUMxRixXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsWUFBWSxJQUFJLFlBQVksRUFBRSxRQUFRLENBQUM7QUFBQSxFQUN2QyxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMvQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0saUJBQWlCLFdBQVcsbUJBQW1CO0FBQUEsRUFDMUQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGFBQWEsSUFBSSxhQUFhLEVBQUUsV0FBVyxNQUFNLFdBQVcsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUN4RSxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3pELFVBQVUsUUFBUSxVQUFVLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDM0MsWUFBWSxLQUFLLFlBQVk7QUFBQSxFQUM3QixPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxtQkFBbUIsV0FBVyxxQkFBcUI7QUFBQSxFQUM5RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsYUFBYSxJQUFJLGFBQWEsRUFBRSxXQUFXLE1BQU0sV0FBVyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3hFLEtBQUssS0FBSyxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQ3pCLFNBQVMsUUFBUSxXQUFXLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMzQyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0sb0JBQW9CLFdBQVcsc0JBQXNCO0FBQUEsRUFDaEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGFBQWEsSUFBSSxhQUFhLEVBQUUsV0FBVyxNQUFNLFdBQVcsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUN4RSxNQUFNLFVBQVUsUUFBUSxDQUFDLFlBQVksZUFBZSxtQkFBbUIsY0FBYyxxQkFBcUIsd0JBQXdCLGlCQUFpQixjQUFjLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN4TCxXQUFXLEtBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUNyQyxnQkFBZ0IsUUFBUSxrQkFBa0IsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3hELFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNoRCxRQUFRLElBQUksUUFBUSxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUMvQyxVQUFVLFFBQVEsWUFBWSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDN0MsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBT00sYUFBTSxnQkFBZ0IsV0FBVyxrQkFBa0I7QUFBQSxFQUN4RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN0RCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUN2QyxTQUFTLEtBQUssU0FBUztBQUFBLEVBQ3ZCLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJLEVBQUUsUUFBUTtBQUFBLEVBQzlDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSx1QkFBdUIsV0FBVyx5QkFBeUI7QUFBQSxFQUN0RSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE1BQU0sVUFBVSxRQUFRLENBQUMsWUFBWSxjQUFjLGNBQWMsV0FBVyxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3ZGLFFBQVEsSUFBSSxRQUFRLEVBQUUsUUFBUTtBQUFBLEVBQzlCLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTztBQUFBLEVBQ3pELFVBQVUsUUFBUSxVQUFVLEVBQUUsUUFBUSxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQ3JELGdCQUFnQixJQUFJLGdCQUFnQixFQUFFLFFBQVEsR0FBRztBQUFBO0FBQUEsRUFDakQsU0FBUyxJQUFJLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDM0MsYUFBYSxJQUFJLGFBQWEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDekQsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDdkQsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRSxRQUFRO0FBQUEsRUFDOUMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLDZCQUE2QixXQUFXLCtCQUErQjtBQUFBLEVBQ2xGLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxRQUFRLElBQUksUUFBUSxFQUFFLFdBQVcsTUFBTSxxQkFBcUIsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUN4RSxVQUFVLElBQUksVUFBVSxFQUFFLFdBQVcsTUFBTSxjQUFjLEVBQUU7QUFBQSxFQUMzRCxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDakQsZ0JBQWdCLFFBQVEsa0JBQWtCLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN4RCxvQkFBb0IsSUFBSSxvQkFBb0IsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDdkUsc0JBQXNCLFFBQVEsd0JBQXdCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNyRSxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGtCQUFrQixXQUFXLG9CQUFvQjtBQUFBLEVBQzVELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxRQUFRLElBQUksUUFBUSxFQUFFLFFBQVE7QUFBQSxFQUM5QixVQUFVLFVBQVUsWUFBWSxDQUFDLFlBQVksY0FBYyxjQUFjLFdBQVcsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvRixjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsU0FBUyxJQUFJLFNBQVMsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDakQsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN6RCxlQUFlLFFBQVEsaUJBQWlCLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN0RCxZQUFZLFFBQVEsY0FBYyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDakQsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVE7QUFBQSxFQUM3QixXQUFXLFFBQVEsV0FBVyxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxNQUFNLFFBQVEsTUFBTSxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUM3QyxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNyRCxRQUFRLFVBQVUsUUFBUTtBQUFBLEVBQzFCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxtQkFBbUIsV0FBVyxxQkFBcUI7QUFBQSxFQUM5RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sZ0JBQWdCLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDL0UsS0FBSyxLQUFLLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDekIsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvQyxNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQy9DLFNBQVMsSUFBSSxTQUFTO0FBQUEsRUFDdEIsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxzQkFBc0IsV0FBVyx3QkFBd0I7QUFBQSxFQUNwRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sZ0JBQWdCLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDL0UsU0FBUyxJQUFJLFNBQVMsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDakQsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUN6RCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUTtBQUFBLEVBQzdCLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU9NLGFBQU0sWUFBWSxXQUFXLGFBQWE7QUFBQSxFQUMvQyxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFFBQVEsUUFBUSxVQUFVLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbkQsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQy9DLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsTUFBTSxLQUFLLE1BQU07QUFBQSxFQUNqQixZQUFZLEtBQUssWUFBWTtBQUFBLEVBQzdCLGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNuRCxVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLE9BQU8sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0IsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNwQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sbUJBQW1CLFdBQVcscUJBQXFCO0FBQUEsRUFDOUQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFlBQVksSUFBSSxZQUFZLEVBQUUsV0FBVyxNQUFNLFVBQVUsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNyRSxLQUFLLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUN6QixTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGdCQUFnQixXQUFXLGtCQUFrQjtBQUFBLEVBQ3hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixNQUFNLEtBQUssTUFBTTtBQUFBLEVBQ2pCLFVBQVUsS0FBSyxVQUFVO0FBQUEsRUFDekIsWUFBWSxLQUFLLFlBQVk7QUFBQSxFQUM3QixhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDbkQsU0FBUyxLQUFLLFNBQVMsRUFBRSxNQUE4QztBQUFBLEVBQ3ZFLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sZ0JBQWdCLFdBQVcsa0JBQWtCO0FBQUEsRUFDeEQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFVBQVUsSUFBSSxVQUFVLEVBQUUsV0FBVyxNQUFNLGNBQWMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNyRSxLQUFLLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFBQSxFQUN6QixTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGNBQWMsV0FBVyxlQUFlO0FBQUEsRUFDbkQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxNQUFNLFVBQVUsUUFBUSxDQUFDLFlBQVksV0FBVyxZQUFZLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDdkUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNqRCxPQUFPLFFBQVEsU0FBUyxFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ25ELFlBQVksVUFBVSxZQUFZO0FBQUEsRUFDbEMsZ0JBQWdCLFVBQVUsZ0JBQWdCLEVBQUUsUUFBUTtBQUFBLEVBQ3BELGtCQUFrQixVQUFVLGtCQUFrQjtBQUFBLEVBQzlDLG1CQUFtQixVQUFVLG1CQUFtQjtBQUFBLEVBQ2hELGVBQWUsVUFBVSxpQkFBaUIsQ0FBQyxTQUFTLFVBQVUsYUFBYSxjQUFjLGFBQWEsT0FBTyxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsRUFDL0gsUUFBUSxVQUFVLFVBQVUsQ0FBQyxTQUFTLFdBQVcsWUFBWSxXQUFXLENBQUMsRUFBRSxRQUFRLE9BQU8sRUFBRSxRQUFRO0FBQUEsRUFDcEcsYUFBYSxLQUFLLGFBQWE7QUFBQSxFQUMvQixZQUFZLEtBQUssWUFBWTtBQUFBLEVBQzdCLGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNuRCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sb0JBQW9CLFdBQVcsc0JBQXNCO0FBQUEsRUFDaEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxZQUFZLFVBQVUsY0FBYyxDQUFDLFdBQVcsZ0JBQWdCLG9CQUFvQixxQkFBcUIsY0FBYyxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ2xJLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsU0FBUyxRQUFRLFNBQVMsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUN6QyxXQUFXLFVBQVUsV0FBVztBQUFBLEVBQ2hDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0sbUJBQW1CLFdBQVcscUJBQXFCO0FBQUEsRUFDOUQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ2pELE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNyQyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0seUJBQXlCLFdBQVcsMkJBQTJCO0FBQUEsRUFDMUUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxVQUFVLElBQUksVUFBVSxFQUFFLFdBQVcsTUFBTSxrQkFBa0IsRUFBRTtBQUFBLEVBQy9ELG1CQUFtQixRQUFRLHFCQUFxQixFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3pFLFNBQVMsUUFBUSxXQUFXLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDckQsVUFBVSxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDbkMsUUFBUSxVQUFVLFVBQVUsQ0FBQyxXQUFXLFFBQVEsVUFBVSxDQUFDLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUTtBQUFBLEVBQ3pGLGNBQWMsS0FBSyxjQUFjO0FBQUEsRUFDakMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBT00sYUFBTSxvQkFBb0IsV0FBVyxzQkFBc0I7QUFBQSxFQUNoRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFO0FBQUEsRUFDakUsV0FBVyxJQUFJLFdBQVcsRUFBRSxXQUFXLE1BQU0sVUFBVSxFQUFFO0FBQUEsRUFDekQsUUFBUSxJQUFJLFFBQVEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDL0MsVUFBVSxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQUEsRUFDbkMsUUFBUSxLQUFLLFFBQVEsRUFBRSxRQUFRO0FBQUEsRUFDL0IsTUFBTSxLQUFLLE1BQU0sRUFBRSxRQUFRO0FBQUEsRUFDM0IsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxZQUFZLFdBQVcsYUFBYTtBQUFBLEVBQy9DLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxVQUFVLFFBQVEsQ0FBQyxjQUFjLGNBQWMsVUFBVSxjQUFjLFFBQVEsQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNoRyxRQUFRLFFBQVEsVUFBVSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ25ELFVBQVUsS0FBSyxVQUFVO0FBQUEsRUFDekIsY0FBYyxVQUFVLGNBQWMsRUFBRSxRQUFRO0FBQUEsRUFDaEQsbUJBQW1CLElBQUksbUJBQW1CLEVBQUUsUUFBUSxFQUFFO0FBQUEsRUFDdEQsU0FBUyxRQUFRLFNBQVMsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUN6QyxXQUFXLFVBQVUsV0FBVztBQUFBLEVBQ2hDLGNBQWMsSUFBSSxjQUFjO0FBQUEsRUFDaEMsZ0JBQWdCLFFBQVEsa0JBQWtCLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN4RCxRQUFRLEtBQUssUUFBUSxFQUFFLE1BQWdCO0FBQUEsRUFDdkMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLHdCQUF3QixXQUFXLDBCQUEwQjtBQUFBLEVBQ3hFLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxVQUFVLFFBQVEsQ0FBQyxRQUFRLFNBQVMsWUFBWSxTQUFTLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDMUUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLGVBQWUsSUFBSSxlQUFlLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDN0MsVUFBVSxJQUFJLFVBQVUsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUNuQyxRQUFRLElBQUksUUFBUSxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQy9CLFlBQVksSUFBSSxZQUFZLEVBQUUsV0FBVyxNQUFNLFVBQVUsRUFBRTtBQUFBLEVBQzNELFlBQVksSUFBSSxZQUFZLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQztBQU1NLGFBQU0scUJBQXFCLFdBQVcsdUJBQXVCO0FBQUEsRUFDbEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPO0FBQUEsRUFDcEYsVUFBVSxVQUFVLFlBQVksQ0FBQyxVQUFVLFlBQVksV0FBVyxNQUFNLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUMzRixRQUFRLEtBQUssUUFBUTtBQUFBLEVBQ3JCLGdCQUFnQixRQUFRLGtCQUFrQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDekQsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDdkQsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUNyQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sb0JBQW9CLFdBQVcsc0JBQXNCO0FBQUEsRUFDaEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxnQkFBZ0IsS0FBSyxnQkFBZ0I7QUFBQSxFQUNyQyxpQkFBaUIsS0FBSyxpQkFBaUI7QUFBQSxFQUN2QyxjQUFjLFFBQVEsZ0JBQWdCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNyRCxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ3JDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSx1QkFBdUIsV0FBVyx5QkFBeUI7QUFBQSxFQUN0RSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxVQUFVLEtBQUssVUFBVSxFQUFFLFFBQVE7QUFBQSxFQUNuQyxXQUFXLFVBQVUsYUFBYSxDQUFDLGNBQWMsY0FBYyxjQUFjLFNBQVMsVUFBVSxRQUFRLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUMzSCxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsS0FBSyxRQUFRLE9BQU8sRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2xDLFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUNqRCxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFlBQVksSUFBSSxZQUFZLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDdkMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFPTSxhQUFNLGdCQUFnQixXQUFXLGtCQUFrQjtBQUFBLEVBQ3hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxpQkFBaUIsS0FBSyxpQkFBaUI7QUFBQSxFQUN2QyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSx1QkFBdUIsV0FBVyx5QkFBeUI7QUFBQSxFQUN0RSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFdBQVcsSUFBSSxXQUFXLEVBQUUsV0FBVyxNQUFNLFVBQVUsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNuRSxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxXQUFXLE1BQU0sY0FBYyxFQUFFO0FBQUEsRUFDdkUsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUNyQyxTQUFTLEtBQUssU0FBUyxFQUFFLE1BQWdCO0FBQUEsRUFDekMsUUFBUSxVQUFVLFVBQVUsQ0FBQyxZQUFZLGNBQWMsYUFBYSxXQUFXLENBQUMsRUFBRSxRQUFRLFVBQVU7QUFBQSxFQUNwRyxnQkFBZ0IsVUFBVSxnQkFBZ0I7QUFBQSxFQUMxQyxRQUFRLEtBQUssUUFBUTtBQUFBLEVBQ3JCLGFBQWEsUUFBUSxlQUFlLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDNUQsaUJBQWlCLFFBQVEsaUJBQWlCLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDekQsY0FBYyxRQUFRLGNBQWMsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUNuRCxXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNyRCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sb0JBQW9CLFdBQVcsc0JBQXNCO0FBQUEsRUFDaEUsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGVBQWUsSUFBSSxlQUFlLEVBQUUsV0FBVyxNQUFNLHFCQUFxQixFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3RGLFdBQVcsVUFBVSxhQUFhLENBQUMsV0FBVyxTQUFTLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDbEUsU0FBUyxJQUFJLFNBQVM7QUFBQSxFQUN0QixXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ3pELFVBQVUsS0FBSyxVQUFVLEVBQUUsUUFBUTtBQUFBLEVBQ25DLFNBQVMsS0FBSyxTQUFTLEVBQUUsTUFBZ0I7QUFBQSxFQUN6QyxpQkFBaUIsUUFBUSxpQkFBaUIsRUFBRSxRQUFRLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDbkUsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBT00sYUFBTSxvQkFBb0IsV0FBVyxzQkFBc0I7QUFBQSxFQUNoRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDdEQsWUFBWSxRQUFRLFlBQVksRUFBRSxRQUFRLElBQUksRUFBRSxRQUFRO0FBQUEsRUFDeEQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLHNCQUFzQjtBQUFBLEVBQ2pDLEVBQUUsSUFBSSxVQUFVLE1BQU0sVUFBVSxXQUFXLGVBQWUsV0FBVyxnQ0FBZ0M7QUFBQSxFQUNyRyxFQUFFLElBQUksZUFBZSxNQUFNLGVBQWUsV0FBVyxlQUFlLFdBQVcsOEJBQThCO0FBQUEsRUFDN0csRUFBRSxJQUFJLGdCQUFnQixNQUFNLGdCQUFnQixXQUFXLGVBQWUsV0FBVywwQkFBMEI7QUFBQSxFQUMzRyxFQUFFLElBQUkscUJBQXFCLE1BQU0scUJBQXFCLFdBQVcsZUFBZSxXQUFXLHNDQUFzQztBQUFBLEVBQ2pJLEVBQUUsSUFBSSxXQUFXLE1BQU0sV0FBVyxXQUFXLFVBQVUsV0FBVyxrQ0FBa0M7QUFBQSxFQUNwRyxFQUFFLElBQUksc0JBQXNCLE1BQU0seUJBQXlCLFdBQVcsVUFBVSxXQUFXLDBCQUEwQjtBQUFBLEVBQ3JILEVBQUUsSUFBSSxZQUFZLE1BQU0sWUFBWSxXQUFXLFVBQVUsV0FBVywwQkFBMEI7QUFBQSxFQUM5RixFQUFFLElBQUksYUFBYSxNQUFNLGFBQWEsV0FBVyxlQUFlLFdBQVcsd0JBQXdCO0FBQUEsRUFDbkcsRUFBRSxJQUFJLGVBQWUsTUFBTSxlQUFlLFdBQVcsZUFBZSxXQUFXLDBCQUEwQjtBQUFBLEVBQ3pHLEVBQUUsSUFBSSxlQUFlLE1BQU0sZUFBZSxXQUFXLGVBQWUsV0FBVywwQkFBMEI7QUFBQSxFQUN6RyxFQUFFLElBQUksY0FBYyxNQUFNLGNBQWMsV0FBVyxlQUFlLFdBQVcsd0JBQXdCO0FBQUEsRUFDckcsRUFBRSxJQUFJLGdCQUFnQixNQUFNLGtCQUFrQixXQUFXLGVBQWUsV0FBVyx3QkFBd0I7QUFBQSxFQUMzRyxFQUFFLElBQUksa0JBQWtCLE1BQU0scUJBQXFCLFdBQVcsZUFBZSxXQUFXLDhCQUE4QjtBQUFBLEVBQ3RILEVBQUUsSUFBSSxZQUFZLE1BQU0sWUFBWSxXQUFXLGNBQWMsV0FBVyxzQkFBc0I7QUFBQSxFQUM5RixFQUFFLElBQUksaUJBQWlCLE1BQU0saUJBQWlCLFdBQVcsY0FBYyxXQUFXLDhCQUE4QjtBQUFBLEVBQ2hILEVBQUUsSUFBSSxvQkFBb0IsTUFBTSxzQkFBc0IsV0FBVyxjQUFjLFdBQVcsK0JBQStCO0FBQUEsRUFDekgsRUFBRSxJQUFJLFdBQVcsTUFBTSxXQUFXLFdBQVcsY0FBYyxXQUFXLHFCQUFxQjtBQUFBLEVBQzNGLEVBQUUsSUFBSSxVQUFVLE1BQU0sbUJBQW1CLFdBQVcsZ0JBQWdCLFdBQVcsdUJBQXVCO0FBQUEsRUFDdEcsRUFBRSxJQUFJLG1CQUFtQixNQUFNLHNCQUFzQixXQUFXLGdCQUFnQixXQUFXLHFCQUFxQjtBQUFBLEVBQ2hILEVBQUUsSUFBSSxlQUFlLE1BQU0sZUFBZSxXQUFXLGdCQUFnQixXQUFXLG9CQUFvQjtBQUFBLEVBQ3BHLEVBQUUsSUFBSSxtQkFBbUIsTUFBTSxtQkFBbUIsV0FBVyxnQkFBZ0IsV0FBVywwQkFBMEI7QUFBQSxFQUNsSCxFQUFFLElBQUksV0FBVyxNQUFNLG9CQUFvQixXQUFXLFNBQVMsV0FBVyxzQkFBc0I7QUFBQSxFQUNoRyxFQUFFLElBQUksZUFBZSxNQUFNLGVBQWUsV0FBVyxTQUFTLFdBQVcsd0JBQXdCO0FBQUEsRUFDakcsRUFBRSxJQUFJLGFBQWEsTUFBTSxhQUFhLFdBQVcsU0FBUyxXQUFXLHVCQUF1QjtBQUFBLEVBQzVGLEVBQUUsSUFBSSxjQUFjLE1BQU0sY0FBYyxXQUFXLFNBQVMsV0FBVyxtQkFBbUI7QUFBQSxFQUMxRixFQUFFLElBQUksZUFBZSxNQUFNLGVBQWUsV0FBVyxlQUFlLFdBQVcsd0JBQXdCO0FBQUEsRUFDdkcsRUFBRSxJQUFJLFlBQVksTUFBTSxpQkFBaUIsV0FBVyxZQUFZLFdBQVcsOEJBQThCO0FBQUEsRUFDekcsRUFBRSxJQUFJLGFBQWEsTUFBTSxhQUFhLFdBQVcsVUFBVSxXQUFXLHNCQUFzQjtBQUFBLEVBQzVGLEVBQUUsSUFBSSxnQkFBZ0IsTUFBTSxnQkFBZ0IsV0FBVyxVQUFVLFdBQVcseUJBQXlCO0FBQUEsRUFDckcsRUFBRSxJQUFJLFNBQVMsTUFBTSwyQkFBMkIsV0FBVyxVQUFVLFdBQVcsa0JBQWtCO0FBQUEsRUFDbEcsRUFBRSxJQUFJLFVBQVUsTUFBTSxvQkFBb0IsV0FBVyxVQUFVLFdBQVcsb0JBQW9CO0FBQUEsRUFDOUYsRUFBRSxJQUFJLG1CQUFtQixNQUFNLHNCQUFzQixXQUFXLGNBQWMsV0FBVywwQkFBMEI7QUFBQSxFQUNuSCxFQUFFLElBQUksY0FBYyxNQUFNLGNBQWMsV0FBVyxjQUFjLFdBQVcsd0JBQXdCO0FBQ3RHO0FBTU8sYUFBTSxPQUFPLFdBQVcsUUFBUTtBQUFBLEVBQ3JDLElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvQyxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFNBQVMsS0FBSyxTQUFTO0FBQUEsRUFDdkIsYUFBYSxRQUFRLGVBQWUsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3JFLGVBQWUsUUFBUSxpQkFBaUIsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxPQUFPO0FBQUEsRUFDdkQsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNwQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sYUFBYSxXQUFXLGVBQWU7QUFBQSxFQUNsRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsT0FBTyxJQUFJLE9BQU8sRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ3RELFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDeEQsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsS0FBSyxRQUFRLE9BQU8sRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2xDLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN0QyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzdCLFlBQVksUUFBUSxZQUFZLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDOUMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBT00sYUFBTSxxQkFBcUIsV0FBVyx1QkFBdUI7QUFBQSxFQUNsRSxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFO0FBQUEsRUFDakUsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvQyxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsS0FBSyxRQUFRLE9BQU8sRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2xDLFVBQVUsUUFBUSxVQUFVLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDM0MsT0FBTyxRQUFRLE9BQU8sRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNwQyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0seUJBQXlCLFdBQVcsNEJBQTRCO0FBQUEsRUFDM0UsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLFlBQVksSUFBSSxZQUFZLEVBQUUsV0FBVyxNQUFNLG1CQUFtQixFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzlFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDekQsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGdCQUFnQixXQUFXLGtCQUFrQjtBQUFBLEVBQ3hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxVQUFVLFFBQVE7QUFBQSxJQUN0QjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDWCxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ2pELE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBU00sYUFBTSxlQUFlLFdBQVcsaUJBQWlCO0FBQUEsRUFDdEQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQy9DLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ3RDLEtBQUssUUFBUSxPQUFPLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNsQyxVQUFVLFFBQVEsVUFBVSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzNDLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGdCQUFnQixXQUFXLGtCQUFrQjtBQUFBLEVBQ3hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvQyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUFBO0FBQUEsRUFDN0IsS0FBSyxRQUFRLE9BQU8sRUFBRSxRQUFRLEdBQUcsQ0FBQztBQUFBLEVBQ2xDLE9BQU8sUUFBUSxTQUFTLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUN0QyxVQUFVLFFBQVEsVUFBVSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzNDLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLFdBQVcsV0FBVyxhQUFhO0FBQUEsRUFDOUMsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGNBQWMsSUFBSSxjQUFjLEVBQUUsV0FBVyxNQUFNLFlBQVksRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUMzRSxNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQy9DLEtBQUssUUFBUSxPQUFPLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUNsQyxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDdEMsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixTQUFTLFFBQVEsU0FBUyxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUEsRUFDekMsVUFBVSxRQUFRLFVBQVUsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUMzQyxPQUFPLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ3BDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxZQUFZLFdBQVcsY0FBYztBQUFBLEVBQ2hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsTUFBTSxRQUFRLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUMvQyxXQUFXLEtBQUssV0FBVztBQUFBLEVBQzNCLE9BQU8sUUFBUSxPQUFPLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDcEMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGtCQUFrQixXQUFXLG9CQUFvQjtBQUFBLEVBQzVELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTztBQUFBLEVBQ3BGLHFCQUFxQixRQUFRLHFCQUFxQixFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ2hFLDZCQUE2QixRQUFRLDZCQUE2QixFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ2hGLDJCQUEyQixRQUFRLDJCQUEyQixFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzVFLDJCQUEyQixRQUFRLDJCQUEyQixFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzVFLDRCQUE0QixRQUFRLDRCQUE0QixFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzlFLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxnQkFBZ0IsV0FBVyxrQkFBa0I7QUFBQSxFQUN4RCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sWUFBWSxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQzNFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDeEQsUUFBUSxRQUFRLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQSxFQUNuRCxXQUFXLEtBQUssV0FBVztBQUFBO0FBQUEsRUFHM0IsYUFBYSxJQUFJLGFBQWEsRUFBRSxXQUFXLE1BQU0sYUFBYSxFQUFFO0FBQUEsRUFDaEUsY0FBYyxJQUFJLGNBQWMsRUFBRSxXQUFXLE1BQU0sY0FBYyxFQUFFO0FBQUEsRUFDbkUsVUFBVSxJQUFJLFVBQVUsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFO0FBQUEsRUFDdEQsU0FBUyxJQUFJLFNBQVMsRUFBRSxXQUFXLE1BQU0sVUFBVSxFQUFFO0FBQUE7QUFBQSxFQUdyRCxVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUM1QyxXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDOUMsc0JBQXNCLFFBQVEsd0JBQXdCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBR3JFLG1CQUFtQixJQUFJLG1CQUFtQixFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQ3JELG9CQUFvQixJQUFJLG9CQUFvQixFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQ3ZELHNCQUFzQixJQUFJLHNCQUFzQixFQUFFLFFBQVEsQ0FBQztBQUFBO0FBQUEsRUFHM0QsWUFBWSxVQUFVLFlBQVk7QUFBQSxFQUNsQyxTQUFTLFVBQVUsU0FBUztBQUFBLEVBQzVCLHVCQUF1QixJQUFJLHVCQUF1QjtBQUFBO0FBQUEsRUFHbEQsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ25FLFdBQVcsUUFBUSxhQUFhLEVBQUUsV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQUE7QUFBQSxFQUczRCxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUU7QUFBQTtBQUFBLEVBR2pFLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxPQUFPO0FBQUEsRUFDdkQsV0FBVyxRQUFRLFdBQVcsRUFBRSxRQUFRLElBQUk7QUFBQTtBQUFBLEVBRzVDLGVBQWUsSUFBSSxlQUFlLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQzdELGlCQUFpQixRQUFRLG1CQUFtQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0QsaUJBQWlCLFVBQVUsbUJBQW1CLENBQUMsV0FBVyxXQUFXLGVBQWUsZ0JBQWdCLENBQUMsRUFBRSxRQUFRLFNBQVM7QUFBQTtBQUFBLEVBR3hILFlBQVksUUFBUSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxPQUFPO0FBQUEsRUFFekQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUFBLEVBQ3ZELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3ZFLENBQUM7QUFNTSxhQUFNLGlCQUFpQixXQUFXLG1CQUFtQjtBQUFBLEVBQzFELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxXQUFXLE1BQU0sY0FBYyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2pGLE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDL0MsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ3ZDLFVBQVUsUUFBUSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUM1QyxPQUFPLFFBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDdkMsZUFBZSxJQUFJLGVBQWUsRUFBRSxXQUFXLE1BQU0sYUFBYSxFQUFFO0FBQUEsRUFDcEUsV0FBVyxRQUFRLFdBQVcsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM3QyxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLGNBQWMsV0FBVyxnQkFBZ0I7QUFBQSxFQUNwRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsZ0JBQWdCLElBQUksZ0JBQWdCLEVBQUUsV0FBVyxNQUFNLGNBQWMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNqRixNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQy9DLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsWUFBWSxJQUFJLFlBQVksRUFBRSxRQUFRLENBQUM7QUFBQSxFQUN2QyxTQUFTLFFBQVEsV0FBVyxFQUFFLFFBQVEsR0FBRyxDQUFDO0FBQUEsRUFDMUMsV0FBVyxRQUFRLFdBQVcsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM3QyxjQUFjLFFBQVEsY0FBYyxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ25ELGlCQUFpQixLQUFLLGlCQUFpQjtBQUFBLEVBQ3ZDLGVBQWUsUUFBUSxpQkFBaUIsRUFBRSxXQUFXLElBQUksT0FBTyxFQUFFLENBQUM7QUFBQSxFQUNuRSxZQUFZLFFBQVEsY0FBYyxFQUFFLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzdELFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFBQSxFQUN2RCxXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUTtBQUN2RSxDQUFDO0FBTU0sYUFBTSxlQUFlLFdBQVcsaUJBQWlCO0FBQUEsRUFDdEQsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGdCQUFnQixJQUFJLGdCQUFnQixFQUFFLFdBQVcsTUFBTSxjQUFjLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDakYsWUFBWSxRQUFRLGNBQWMsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQ2pELFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDM0IsT0FBTyxRQUFRLFNBQVMsRUFBRSxXQUFXLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRO0FBQUEsRUFDN0QsZUFBZSxVQUFVLGVBQWUsRUFBRSxXQUFXO0FBQUEsRUFDckQsY0FBYyxVQUFVLGNBQWM7QUFBQSxFQUN0QyxVQUFVLFFBQVEsVUFBVSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzNDLGFBQWEsSUFBSSxhQUFhLEVBQUUsV0FBVyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQ3pELGVBQWUsVUFBVSxlQUFlO0FBQUEsRUFDeEMsZ0JBQWdCLEtBQUssZ0JBQWdCO0FBQUEsRUFDckMsVUFBVSxLQUFLLFVBQVU7QUFBQSxFQUN6QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsRUFDdkQsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVE7QUFDdkUsQ0FBQztBQU1NLGFBQU0sYUFBYSxXQUFXLGVBQWU7QUFBQSxFQUNsRCxJQUFJLElBQUksSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXO0FBQUEsRUFDekMsZ0JBQWdCLElBQUksZ0JBQWdCLEVBQUUsV0FBVyxNQUFNLGNBQWMsRUFBRSxFQUFFLFFBQVE7QUFBQSxFQUNqRixNQUFNLFVBQVUsUUFBUTtBQUFBLElBQ3RCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ1gsV0FBVyxLQUFLLFdBQVc7QUFBQSxFQUMzQixXQUFXLElBQUksV0FBVyxFQUFFLFdBQVcsTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNyRCxhQUFhLFFBQVEsZUFBZSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDbkQsaUJBQWlCLEtBQUssaUJBQWlCO0FBQUEsRUFDdkMsWUFBWSxLQUFLLFlBQVk7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFNTSxhQUFNLFNBQVMsV0FBVyxXQUFXO0FBQUEsRUFDMUMsSUFBSSxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsV0FBVztBQUFBLEVBQ3pDLGdCQUFnQixJQUFJLGdCQUFnQixFQUFFLFdBQVcsTUFBTSxjQUFjLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDakYsYUFBYSxJQUFJLGFBQWEsRUFBRSxXQUFXLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDekQsZUFBZSxRQUFRLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBLEVBQ2pFLGVBQWUsVUFBVSxpQkFBaUIsQ0FBQyxXQUFXLFdBQVcsZUFBZSxXQUFXLENBQUMsRUFBRSxRQUFRLFdBQVc7QUFBQSxFQUNqSCxVQUFVLEtBQUssVUFBVTtBQUFBLEVBQ3pCLFVBQVUsS0FBSyxVQUFVO0FBQUEsRUFDekIsV0FBVyxRQUFRLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQy9DLFdBQVcsUUFBUSxhQUFhLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUMvQyxjQUFjLElBQUksY0FBYztBQUFBLEVBQ2hDLE1BQU0sUUFBUSxNQUFNLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDbkMsV0FBVyxVQUFVLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN6RCxDQUFDO0FBTU0sYUFBTSxZQUFZLFdBQVcsY0FBYztBQUFBLEVBQ2hELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxXQUFXLE1BQU0sY0FBYyxFQUFFLEVBQUUsUUFBUTtBQUFBLEVBQ2pGLEtBQUssS0FBSyxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQ3pCLE1BQU0sVUFBVSxRQUFRLENBQUMsU0FBUyxXQUFXLFVBQVUsYUFBYSxPQUFPLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUM3RixXQUFXLFFBQVEsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0MsT0FBTyxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUM7QUFBQSxFQUM3QixXQUFXLFVBQVUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3pELENBQUM7QUFPTSxhQUFNLGlCQUFpQixXQUFXLG1CQUFtQjtBQUFBLEVBQzFELElBQUksSUFBSSxJQUFJLEVBQUUsY0FBYyxFQUFFLFdBQVc7QUFBQSxFQUN6QyxjQUFjLElBQUksY0FBYyxFQUFFLFdBQVcsTUFBTSxZQUFZLEVBQUUsRUFBRSxRQUFRO0FBQUEsRUFDM0UsVUFBVSxRQUFRLFlBQVksRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQTtBQUFBLEVBQ3ZELE1BQU0sUUFBUSxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRSxRQUFRO0FBQUE7QUFBQSxFQUMvQyxNQUFNLFFBQVEsUUFBUSxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUTtBQUFBO0FBQUEsRUFDL0MsT0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVE7QUFBQTtBQUFBLEVBQ2pELEtBQUssUUFBUSxPQUFPLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRO0FBQUE7QUFBQSxFQUM1QyxPQUFPLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLFFBQVE7QUFBQTtBQUFBLEVBQ3ZDLFdBQVcsVUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDekQsQ0FBQzsiLCJuYW1lcyI6W119
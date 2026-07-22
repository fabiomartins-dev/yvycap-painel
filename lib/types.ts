// Tipos de domínio da operação YVYCAP

export type Permissao = 'investidor' | 'parceiro' | 'admin';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  /** Somente no mock — nunca expor para o cliente */
  senha: string;
  permissoes: Permissao[];
  ativo: boolean;
  /** ISO date — aceite dos Termos de Uso e Privacidade (LGPD) */
  termosAceitosEm: string | null;
  criadoEm: string;
}

export type UsuarioPublico = Omit<Usuario, 'senha'>;

export interface Fase {
  numero: 1 | 2 | 3;
  meta: number; // R$
  taxaMensal: number; // ex.: 0.03
  status: 'aberta' | 'prevista' | 'encerrada';
  abertura: string | null; // ISO date
}

export type StatusContrato = 'carencia' | 'ativo' | 'encerrado';

export interface Amortizacao {
  data: string;
  valor: number;
  tipo: 'amortizacao' | 'quitacao';
}

export interface Contrato {
  id: string;
  numero: string; // CTR-0001
  investidorId: string;
  parceiroId: string | null;
  fase: 1 | 2 | 3;
  valorAporte: number;
  taxaMensal: number;
  dataInicio: string; // data de entrada do recurso
  conciliado: boolean;
  dataConciliacao: string | null;
  estornado: boolean;
  encerradoEm: string | null;
  amortizacoes: Amortizacao[];
}

export interface Investidor {
  id: string;
  usuarioId: string | null;
  nome: string;
  email: string;
  cpf: string; // armazenado completo; mascarar nas listagens
  telefone: string;
  parceiroId: string | null;
  cadastroAprovado: boolean;
  criadoEm: string;
}

export interface Parceiro {
  id: string;
  usuarioId: string;
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
  telefone: string;
  banco: string;
  agencia: string;
  conta: string;
  chavePix: string;
  ativo: boolean;
  criadoEm: string;
}

export type EstagioPipeline =
  | 'identificado'
  | 'qualificado'
  | 'apresentado'
  | 'documentacao'
  | 'aprovado'
  | 'contrato_assinado'
  | 'aporte_conciliado';

export const ESTAGIOS_PIPELINE: { valor: EstagioPipeline; rotulo: string }[] = [
  { valor: 'identificado', rotulo: 'Identificado' },
  { valor: 'qualificado', rotulo: 'Qualificado' },
  { valor: 'apresentado', rotulo: 'Apresentado' },
  { valor: 'documentacao', rotulo: 'Documentação' },
  { valor: 'aprovado', rotulo: 'Aprovado' },
  { valor: 'contrato_assinado', rotulo: 'Contrato assinado' },
  { valor: 'aporte_conciliado', rotulo: 'Aporte conciliado' },
];

export interface Interacao {
  data: string;
  descricao: string;
}

export interface Cliente {
  id: string;
  parceiroId: string;
  investidorId: string | null;
  nome: string;
  email: string;
  telefone: string;
  estagio: EstagioPipeline;
  interacoes: Interacao[];
  criadoEm: string;
}

export type StatusResgate = 'pendente' | 'aprovado' | 'pago' | 'cancelado';

export interface SolicitacaoResgate {
  id: string;
  contratoId: string;
  investidorId: string;
  dataSolicitacao: string;
  /** dataSolicitacao + 90 dias (aviso prévio) */
  dataLiberacao: string;
  status: StatusResgate;
  pagoEm: string | null;
}

export type StatusResgateComissao = 'pendente' | 'pago' | 'cancelado';

export interface SolicitacaoResgateComissao {
  id: string;
  parceiroId: string;
  valor: number;
  dataSolicitacao: string;
  status: StatusResgateComissao;
  pagoEm: string | null;
}

export interface Documento {
  id: string;
  contratoId: string;
  nome: string;
  tipo: 'contrato_mutuo' | 'comprovante';
  data: string;
}

export interface SolicitacaoAlteracaoCadastro {
  id: string;
  usuarioId: string;
  mensagem: string;
  data: string;
}

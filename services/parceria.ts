// Serviços da seção Parceria (permissão parceiro).
// O parceiro só enxerga a própria carteira — nunca credenciais ou conta de investidor.

import {
  APORTE_MINIMO,
  comissoesDoContrato,
  dataVencimento,
  fasePorNumero,
  hoje,
  juroMensal,
  ROTULO_STATUS,
  saldoAtivo,
  somarMeses,
  statusContrato,
  COMISSAO_MENSAL,
  type LancamentoComissao,
} from '@/lib/calc';
import { db } from '@/lib/store';
import type {
  Cliente,
  Contrato,
  EstagioPipeline,
  Investidor,
  SolicitacaoResgate,
  SolicitacaoResgateComissao,
  StatusContrato,
} from '@/lib/types';

export interface ContratoCarteira {
  id: string;
  numero: string;
  clienteNome: string;
  fase: 1 | 2 | 3;
  valorAporte: number;
  taxaMensal: number;
  dataInicio: string;
  dataVencimento: string;
  status: StatusContrato;
  statusRotulo: string;
  conciliado: boolean;
  estornado: boolean;
  /** Comissão só é reconhecida após aporte conciliado. */
  comissaoReconhecida: boolean;
  comissaoMensalAtual: number;
  saldoAtivo: number;
}

export interface PontoEvolucao {
  mes: string; // rótulo ex.: "jan/26"
  competencia: string; // YYYY-MM
  saldoAtivo: number;
  comissaoMensal: number;
}

export interface ResumoParceiro {
  saldoAtivoCarteira: number;
  contratosAtivos: number;
  comissaoDoMes: number;
  proximoPagamentoComissao: { data: string; valor: number } | null;
  comissaoAcumulada: number;
  evolucao: PontoEvolucao[];
  contratos: ContratoCarteira[];
}

export interface ComissoesMes {
  competencia: string; // YYYY-MM
  entrada: number;
  recorrente: number;
  estornos: number;
  total: number;
  lancamentos: LancamentoComissao[];
}

export interface ExtratoComissoes {
  meses: ComissoesMes[];
  proximosPagamentos: LancamentoComissao[];
  totalPago: number;
  totalPrevisto: number;
  /** Saldo já reconhecido (pago) ainda não resgatado pelo parceiro. */
  saldoDisponivel: number;
  resgatesComissao: SolicitacaoResgateComissao[];
}

export interface ResgateCarteira {
  id: string;
  contratoNumero: string;
  clienteNome: string;
  valorAporte: number;
  dataSolicitacao: string;
  dataLiberacao: string;
  status: SolicitacaoResgate['status'];
}

function parceiroDoUsuario(userId: string) {
  return db().parceiros.find((p) => p.usuarioId === userId) ?? null;
}

function nomeInvestidor(investidorId: string): string {
  return db().investidores.find((i) => i.id === investidorId)?.nome ?? '—';
}

function contratosDoParceiro(parceiroId: string): Contrato[] {
  return db().contratos.filter((c) => c.parceiroId === parceiroId);
}

function toCarteiraDto(c: Contrato): ContratoCarteira {
  const st = statusContrato(c);
  const saldo = saldoAtivo(c);
  return {
    id: c.id,
    numero: c.numero,
    clienteNome: nomeInvestidor(c.investidorId),
    fase: c.fase,
    valorAporte: c.valorAporte,
    taxaMensal: c.taxaMensal,
    dataInicio: c.dataInicio,
    dataVencimento: dataVencimento(c),
    status: st,
    statusRotulo: c.estornado ? 'Estornado' : c.conciliado ? ROTULO_STATUS[st] : 'Aguardando conciliação',
    conciliado: c.conciliado,
    estornado: c.estornado,
    comissaoReconhecida: c.conciliado && !c.estornado,
    comissaoMensalAtual: saldo * COMISSAO_MENSAL,
    saldoAtivo: saldo,
  };
}

function lancamentosDoParceiro(parceiroId: string): LancamentoComissao[] {
  return contratosDoParceiro(parceiroId)
    .flatMap((c) => comissoesDoContrato(c, c.numero))
    .sort((a, b) => a.dataPagamento.localeCompare(b.dataPagamento));
}

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloMes(competencia: string): string {
  const [y, m] = competencia.split('-').map(Number);
  return `${MESES_PT[m - 1]}/${String(y).slice(2)}`;
}

export async function getResumoParceiro(userId: string): Promise<ResumoParceiro | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const contratos = contratosDoParceiro(p.id);
  const dtos = contratos.map(toCarteiraDto);
  const lanc = lancamentosDoParceiro(p.id);
  const ref = hoje();
  const compAtual = ref.slice(0, 7);

  // Evolução: dos últimos 8 meses até +4 meses de previsão
  const evolucao: PontoEvolucao[] = [];
  for (let off = -7; off <= 4; off++) {
    const dataRef = somarMeses(`${compAtual}-15`, off);
    const comp = dataRef.slice(0, 7);
    const saldo = contratos.reduce((s, c) => s + saldoAtivo(c, dataRef), 0);
    const comissao = lanc
      .filter((l) => l.competencia === comp && l.tipo !== 'entrada')
      .reduce((s, l) => s + l.valor, 0);
    evolucao.push({ mes: rotuloMes(comp), competencia: comp, saldoAtivo: saldo, comissaoMensal: comissao });
  }

  const proximos = lanc.filter((l) => l.status !== 'pago' && l.dataPagamento >= ref);
  const saldoCarteira = contratos.reduce((s, c) => s + saldoAtivo(c), 0);
  return {
    saldoAtivoCarteira: saldoCarteira,
    contratosAtivos: dtos.filter((d) => d.conciliado && !d.estornado && d.status !== 'encerrado').length,
    comissaoDoMes: saldoCarteira * COMISSAO_MENSAL,
    proximoPagamentoComissao: proximos[0]
      ? { data: proximos[0].dataPagamento, valor: proximos[0].valor }
      : null,
    comissaoAcumulada: lanc.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0),
    evolucao,
    contratos: dtos,
  };
}

export async function getClientes(userId: string): Promise<Cliente[]> {
  const p = parceiroDoUsuario(userId);
  return p ? db().clientes.filter((c) => c.parceiroId === p.id) : [];
}

export interface DetalheCliente {
  cliente: Cliente;
  contratos: ContratoCarteira[];
}

export async function getDetalheCliente(userId: string, clienteId: string): Promise<DetalheCliente | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const cliente = db().clientes.find((c) => c.id === clienteId && c.parceiroId === p.id);
  if (!cliente) return null;
  const contratos = cliente.investidorId
    ? db()
        .contratos.filter((c) => c.investidorId === cliente.investidorId && c.parceiroId === p.id)
        .map(toCarteiraDto)
    : [];
  return { cliente, contratos };
}

export async function getContratosCarteira(userId: string): Promise<ContratoCarteira[]> {
  const p = parceiroDoUsuario(userId);
  return p ? contratosDoParceiro(p.id).map(toCarteiraDto) : [];
}

export async function getContratoCarteira(userId: string, contratoId: string): Promise<ContratoCarteira | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const c = db().contratos.find((x) => x.id === contratoId && x.parceiroId === p.id);
  return c ? toCarteiraDto(c) : null;
}

export async function getExtratoComissoes(userId: string): Promise<ExtratoComissoes | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const lanc = lancamentosDoParceiro(p.id);
  const ref = hoje();
  const porComp = new Map<string, LancamentoComissao[]>();
  lanc.forEach((l) => {
    const arr = porComp.get(l.competencia) ?? [];
    arr.push(l);
    porComp.set(l.competencia, arr);
  });
  const meses: ComissoesMes[] = [...porComp.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([competencia, ls]) => ({
      competencia,
      entrada: ls.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0),
      recorrente: ls.filter((l) => l.tipo === 'recorrente').reduce((s, l) => s + l.valor, 0),
      estornos: ls.filter((l) => l.tipo === 'estorno').reduce((s, l) => s + l.valor, 0),
      total: ls.reduce((s, l) => s + l.valor, 0),
      lancamentos: ls,
    }));
  const totalPago = lanc.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0);
  const resgatesComissao = db()
    .resgatesComissao.filter((r) => r.parceiroId === p.id)
    .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
  const jaResgatado = resgatesComissao
    .filter((r) => r.status !== 'cancelado')
    .reduce((s, r) => s + r.valor, 0);
  return {
    meses,
    proximosPagamentos: lanc.filter((l) => l.status !== 'pago' && l.dataPagamento >= ref).slice(0, 12),
    totalPago,
    totalPrevisto: lanc.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0),
    saldoDisponivel: Math.max(0, totalPago - jaResgatado),
    resgatesComissao,
  };
}

export async function getResgatesCarteira(userId: string): Promise<ResgateCarteira[]> {
  const p = parceiroDoUsuario(userId);
  if (!p) return [];
  const ids = new Set(contratosDoParceiro(p.id).map((c) => c.id));
  return db()
    .resgates.filter((r) => ids.has(r.contratoId))
    .map((r) => {
      const c = db().contratos.find((x) => x.id === r.contratoId)!;
      return {
        id: r.id,
        contratoNumero: c.numero,
        clienteNome: nomeInvestidor(c.investidorId),
        valorAporte: c.valorAporte,
        dataSolicitacao: r.dataSolicitacao,
        dataLiberacao: r.dataLiberacao,
        status: r.status,
      };
    })
    .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
}

// ————— Mutações do parceiro —————

export interface NovoClienteInput {
  nome: string;
  email: string;
  telefone: string;
  estagio: EstagioPipeline;
}

/** Cria um cliente na carteira do parceiro. */
export async function criarCliente(userId: string, input: NovoClienteInput): Promise<Cliente | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const d = db();
  const cliente: Cliente = {
    id: `cl-${d.seq.cliente++}`,
    parceiroId: p.id,
    investidorId: null,
    nome: input.nome.trim(),
    email: input.email.trim(),
    telefone: input.telefone.trim(),
    estagio: input.estagio,
    interacoes: [{ data: hoje(), descricao: 'Cliente cadastrado na carteira do parceiro.' }],
    criadoEm: hoje(),
  };
  d.clientes.push(cliente);
  return cliente;
}

export interface AtualizarClienteInput {
  nome: string;
  email: string;
  telefone: string;
  estagio: EstagioPipeline;
}

/** Atualiza os dados comerciais de um cliente da carteira do parceiro. */
export async function atualizarCliente(
  userId: string,
  clienteId: string,
  input: AtualizarClienteInput
): Promise<Cliente | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const cliente = db().clientes.find((c) => c.id === clienteId && c.parceiroId === p.id);
  if (!cliente) return null;
  cliente.nome = input.nome.trim();
  cliente.email = input.email.trim();
  cliente.telefone = input.telefone.trim();
  cliente.estagio = input.estagio;
  return cliente;
}

export interface NovoContratoInput {
  clienteId: string;
  valorAporte: number;
  fase: 1 | 2 | 3;
}

/**
 * Origina um contrato para um cliente da carteira. O contrato entra como
 * "Aguardando conciliação" — a comissão só é reconhecida após a conciliação
 * do aporte pela YVYCAP. Se o cliente ainda não tem investidor vinculado,
 * um cadastro de investidor é criado e associado.
 */
export async function criarContrato(userId: string, input: NovoContratoInput): Promise<Contrato | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const d = db();
  const cliente = d.clientes.find((c) => c.id === input.clienteId && c.parceiroId === p.id);
  if (!cliente) return null;
  if (!Number.isFinite(input.valorAporte) || input.valorAporte < APORTE_MINIMO) return null;

  let investidorId = cliente.investidorId;
  if (!investidorId) {
    const investidor: Investidor = {
      id: `inv-${d.seq.investidor++}`,
      usuarioId: null,
      nome: cliente.nome,
      email: cliente.email,
      cpf: '',
      telefone: cliente.telefone,
      parceiroId: p.id,
      cadastroAprovado: false,
      criadoEm: hoje(),
    };
    d.investidores.push(investidor);
    cliente.investidorId = investidor.id;
    investidorId = investidor.id;
  }

  const fase = fasePorNumero(input.fase);
  const contrato: Contrato = {
    id: `c-${d.seq.contrato}`,
    numero: `CTR-${String(d.seq.contrato++).padStart(4, '0')}`,
    investidorId,
    parceiroId: p.id,
    fase: input.fase,
    valorAporte: input.valorAporte,
    taxaMensal: fase.taxaMensal,
    dataInicio: hoje(),
    conciliado: false,
    dataConciliacao: null,
    estornado: false,
    encerradoEm: null,
    amortizacoes: [],
  };
  d.contratos.push(contrato);

  const ordem = ['identificado', 'qualificado', 'apresentado', 'documentacao', 'aprovado', 'contrato_assinado', 'aporte_conciliado'];
  if (ordem.indexOf(cliente.estagio) < ordem.indexOf('contrato_assinado')) {
    cliente.estagio = 'contrato_assinado';
  }
  cliente.interacoes.push({ data: hoje(), descricao: `Contrato ${contrato.numero} originado; aguardando conciliação do aporte.` });

  return contrato;
}

const TOKEN_VALIDADE_MS = 10 * 60 * 1000; // 10 minutos

function validarValorResgate(valor: number, disponivel: number): string | null {
  if (disponivel <= 0) return 'Sem saldo disponível para resgate.';
  if (!Number.isFinite(valor) || valor <= 0) return 'Valor inválido.';
  if (valor > disponivel + 0.001) return 'Valor acima do saldo disponível.';
  return null;
}

/**
 * Passo 1 do resgate de comissão: valida o valor e gera um token de verificação
 * enviado por SMS ao telefone cadastrado. No mock, o código é devolvido em
 * `codigoDemo` para viabilizar a demonstração (não há envio real de SMS).
 */
export async function iniciarResgateComissao(
  userId: string,
  valor: number
): Promise<{ ok: boolean; motivo?: string; telefoneMascarado?: string; codigoDemo?: string }> {
  const p = parceiroDoUsuario(userId);
  if (!p) return { ok: false, motivo: 'Parceiro não encontrado.' };
  const extrato = await getExtratoComissoes(userId);
  const disponivel = extrato?.saldoDisponivel ?? 0;
  const erro = validarValorResgate(valor, disponivel);
  if (erro) return { ok: false, motivo: erro };

  const d = db();
  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  d.resgateComissaoTokens[userId] = { codigo, expiraEm: Date.now() + TOKEN_VALIDADE_MS };

  const tel = p.telefone.replace(/\s+/g, '');
  const telefoneMascarado = tel.length >= 4 ? `••••${tel.slice(-4)}` : '••••';
  return { ok: true, telefoneMascarado, codigoDemo: codigo };
}

/**
 * Passo 2 do resgate de comissão: confirma a solicitação após validar a senha
 * do usuário e o token (SMS) gerado no passo anterior.
 */
export async function confirmarResgateComissao(
  userId: string,
  valor: number,
  senha: string,
  token: string
): Promise<{ ok: boolean; motivo?: string }> {
  const p = parceiroDoUsuario(userId);
  if (!p) return { ok: false, motivo: 'Parceiro não encontrado.' };

  const d = db();
  const usuario = d.usuarios.find((u) => u.id === userId);
  if (!usuario || usuario.senha !== senha) return { ok: false, motivo: 'Senha incorreta.' };

  const registro = d.resgateComissaoTokens[userId];
  if (!registro) return { ok: false, motivo: 'Solicite um novo código de verificação.' };
  if (Date.now() > registro.expiraEm) {
    delete d.resgateComissaoTokens[userId];
    return { ok: false, motivo: 'Código expirado. Solicite um novo código.' };
  }
  if (registro.codigo !== token.trim()) return { ok: false, motivo: 'Código de verificação inválido.' };

  const extrato = await getExtratoComissoes(userId);
  const disponivel = extrato?.saldoDisponivel ?? 0;
  const erro = validarValorResgate(valor, disponivel);
  if (erro) return { ok: false, motivo: erro };

  d.resgatesComissao.push({
    id: `rc-${d.seq.resgateComissao++}`,
    parceiroId: p.id,
    valor: Math.round(valor * 100) / 100,
    dataSolicitacao: hoje(),
    status: 'pendente',
    pagoEm: null,
  });
  delete d.resgateComissaoTokens[userId];
  return { ok: true };
}

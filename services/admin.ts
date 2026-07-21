// Serviços da seção Administração (permissão admin) — visão de toda a operação.

import {
  comissoesDoContrato,
  dataVencimento,
  fasePorNumero,
  hoje,
  ROTULO_STATUS,
  saldoAtivo,
  somarDias,
  somarMeses,
  statusContrato,
  AVISO_QUITACAO_DIAS,
  type LancamentoComissao,
} from '@/lib/calc';
import { db } from '@/lib/store';
import type {
  Amortizacao,
  Contrato,
  Investidor,
  Parceiro,
  Permissao,
  SolicitacaoResgate,
  StatusContrato,
  UsuarioPublico,
} from '@/lib/types';

// ————— Dashboard da operação —————

export interface ResumoOperacao {
  faseAtual: 1 | 2 | 3;
  metaFase: number;
  taxaFase: number;
  totalCaptado: number;
  numeroInvestidores: number;
  contratosAtivos: number;
  comissoesAPagarMes: number;
  resgatesPendentes: number;
  proximosVencimentos: { numero: string; investidor: string; data: string; valor: number }[];
  evolucaoCaptacao: { mes: string; captado: number }[];
}

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloMes(comp: string): string {
  const [y, m] = comp.split('-').map(Number);
  return `${MESES_PT[m - 1]}/${String(y).slice(2)}`;
}

function nomeInvestidor(id: string): string {
  return db().investidores.find((i) => i.id === id)?.nome ?? '—';
}

function nomeParceiro(id: string | null): string {
  if (!id) return 'Direto YVYCAP';
  return db().parceiros.find((p) => p.id === id)?.nome ?? '—';
}

export async function getResumoOperacao(): Promise<ResumoOperacao> {
  const d = db();
  const ref = hoje();
  const fase = fasePorNumero(1);
  const conciliados = d.contratos.filter((c) => c.conciliado && !c.estornado);
  const totalCaptado = conciliados.reduce((s, c) => s + c.valorAporte, 0);

  const compAtual = ref.slice(0, 7);
  const comissoesMes = d.contratos
    .flatMap((c) => comissoesDoContrato(c, c.numero))
    .filter((l) => l.competencia === compAtual || (l.dataPagamento.slice(0, 7) === compAtual && l.tipo === 'entrada'))
    .reduce((s, l) => s + Math.max(0, l.valor), 0);

  const evolucao: { mes: string; captado: number }[] = [];
  for (let off = -7; off <= 0; off++) {
    const dataRef = somarMeses(`${compAtual}-28`, off);
    const captado = conciliados
      .filter((c) => (c.dataConciliacao ?? c.dataInicio) <= dataRef)
      .reduce((s, c) => s + c.valorAporte, 0);
    evolucao.push({ mes: rotuloMes(dataRef.slice(0, 7)), captado });
  }

  return {
    faseAtual: 1,
    metaFase: fase.meta,
    taxaFase: fase.taxaMensal,
    totalCaptado,
    numeroInvestidores: new Set(conciliados.map((c) => c.investidorId)).size,
    contratosAtivos: conciliados.filter((c) => statusContrato(c) !== 'encerrado').length,
    comissoesAPagarMes: comissoesMes,
    resgatesPendentes: d.resgates.filter((r) => r.status === 'pendente').length,
    proximosVencimentos: conciliados
      .filter((c) => statusContrato(c) !== 'encerrado')
      .map((c) => ({
        numero: c.numero,
        investidor: nomeInvestidor(c.investidorId),
        data: dataVencimento(c),
        valor: c.valorAporte,
      }))
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 5),
    evolucaoCaptacao: evolucao,
  };
}

// ————— Parceiros —————

export interface ParceiroResumo extends Parceiro {
  contratos: number;
  saldoAtivoCarteira: number;
}

export async function listarParceiros(): Promise<ParceiroResumo[]> {
  const d = db();
  return d.parceiros.map((p) => {
    const cs = d.contratos.filter((c) => c.parceiroId === p.id);
    return {
      ...p,
      contratos: cs.length,
      saldoAtivoCarteira: cs.reduce((s, c) => s + saldoAtivo(c), 0),
    };
  });
}

export interface NovoParceiroInput {
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
  telefone: string;
  banco: string;
  agencia: string;
  conta: string;
  chavePix: string;
}

export async function cadastrarParceiro(input: NovoParceiroInput): Promise<{ parceiro: Parceiro; usuario: UsuarioPublico }> {
  const d = db();
  const usuario = {
    id: `u-${d.seq.usuario++}`,
    nome: input.nome,
    email: input.email,
    senha: 'yvycap2026',
    permissoes: ['parceiro'] as Permissao[],
    ativo: true,
    termosAceitosEm: null,
    criadoEm: hoje(),
  };
  d.usuarios.push(usuario);
  const parceiro: Parceiro = {
    id: `p-${d.seq.parceiro++}`,
    usuarioId: usuario.id,
    ...input,
    ativo: true,
    criadoEm: hoje(),
  };
  d.parceiros.push(parceiro);
  const { senha: _s, ...pub } = usuario;
  return { parceiro, usuario: pub };
}

export async function alternarParceiroAtivo(parceiroId: string): Promise<void> {
  const d = db();
  const p = d.parceiros.find((x) => x.id === parceiroId);
  if (!p) return;
  p.ativo = !p.ativo;
  const u = d.usuarios.find((x) => x.id === p.usuarioId);
  if (u) u.ativo = p.ativo;
}

export interface DetalheParceiroAdmin {
  parceiro: Parceiro;
  contratos: ContratoAdmin[];
  comissoes: LancamentoComissao[];
  totalComissaoPaga: number;
  totalComissaoPrevista: number;
}

export async function getDetalheParceiro(parceiroId: string): Promise<DetalheParceiroAdmin | null> {
  const d = db();
  const parceiro = d.parceiros.find((p) => p.id === parceiroId);
  if (!parceiro) return null;
  const contratos = d.contratos.filter((c) => c.parceiroId === parceiroId).map(toContratoAdmin);
  const comissoes = d.contratos
    .filter((c) => c.parceiroId === parceiroId)
    .flatMap((c) => comissoesDoContrato(c, c.numero))
    .sort((a, b) => b.dataPagamento.localeCompare(a.dataPagamento));
  return {
    parceiro,
    contratos,
    comissoes,
    totalComissaoPaga: comissoes.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0),
    totalComissaoPrevista: comissoes.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0),
  };
}

// ————— Investidores —————

export interface InvestidorAdmin extends Investidor {
  parceiroNome: string;
  contratos: number;
  totalAportado: number;
  pendenteConciliacao: number;
}

export async function listarInvestidores(): Promise<InvestidorAdmin[]> {
  const d = db();
  return d.investidores.map((i) => {
    const cs = d.contratos.filter((c) => c.investidorId === i.id);
    return {
      ...i,
      parceiroNome: nomeParceiro(i.parceiroId),
      contratos: cs.length,
      totalAportado: cs.filter((c) => c.conciliado && !c.estornado).reduce((s, c) => s + c.valorAporte, 0),
      pendenteConciliacao: cs.filter((c) => !c.conciliado).length,
    };
  });
}

export interface DetalheInvestidorAdmin {
  investidor: InvestidorAdmin;
  contratos: ContratoAdmin[];
}

export async function getDetalheInvestidor(id: string): Promise<DetalheInvestidorAdmin | null> {
  const inv = (await listarInvestidores()).find((i) => i.id === id);
  if (!inv) return null;
  return {
    investidor: inv,
    contratos: db().contratos.filter((c) => c.investidorId === id).map(toContratoAdmin),
  };
}

export async function aprovarCadastroInvestidor(id: string): Promise<void> {
  const i = db().investidores.find((x) => x.id === id);
  if (i) i.cadastroAprovado = true;
}

export async function confirmarConciliacao(contratoId: string): Promise<void> {
  const c = db().contratos.find((x) => x.id === contratoId);
  if (c && !c.conciliado) {
    c.conciliado = true;
    c.dataConciliacao = hoje();
  }
  const cliente = db().clientes.find((cl) => cl.investidorId === c?.investidorId);
  if (cliente) cliente.estagio = 'aporte_conciliado';
}

// ————— Contratos —————

export interface ContratoAdmin {
  id: string;
  numero: string;
  investidorNome: string;
  parceiroNome: string;
  fase: 1 | 2 | 3;
  valorAporte: number;
  taxaMensal: number;
  dataInicio: string;
  dataVencimento: string;
  status: StatusContrato;
  statusRotulo: string;
  conciliado: boolean;
  estornado: boolean;
  saldoAtivo: number;
  amortizacoes: Amortizacao[];
  avisoQuitacaoDias: number;
}

function toContratoAdmin(c: Contrato): ContratoAdmin {
  const st = statusContrato(c);
  return {
    id: c.id,
    numero: c.numero,
    investidorNome: nomeInvestidor(c.investidorId),
    parceiroNome: nomeParceiro(c.parceiroId),
    fase: c.fase,
    valorAporte: c.valorAporte,
    taxaMensal: c.taxaMensal,
    dataInicio: c.dataInicio,
    dataVencimento: dataVencimento(c),
    status: st,
    statusRotulo: c.estornado ? 'Estornado' : c.conciliado ? ROTULO_STATUS[st] : 'Aguardando conciliação',
    conciliado: c.conciliado,
    estornado: c.estornado,
    saldoAtivo: saldoAtivo(c),
    amortizacoes: c.amortizacoes,
    avisoQuitacaoDias: AVISO_QUITACAO_DIAS,
  };
}

export async function listarContratos(): Promise<ContratoAdmin[]> {
  return db().contratos.map(toContratoAdmin);
}

export async function getContratoAdmin(id: string): Promise<ContratoAdmin | null> {
  const c = db().contratos.find((x) => x.id === id);
  return c ? toContratoAdmin(c) : null;
}

/** Registra amortização/quitação antecipada pela YVYCAP (aviso de 60 dias — data efetiva). */
export async function registrarAmortizacao(
  contratoId: string,
  valor: number,
  tipo: 'amortizacao' | 'quitacao'
): Promise<void> {
  const c = db().contratos.find((x) => x.id === contratoId);
  if (!c || !c.conciliado || c.estornado) return;
  const dataEfetiva = somarDias(hoje(), AVISO_QUITACAO_DIAS);
  if (tipo === 'quitacao') {
    c.amortizacoes.push({ data: dataEfetiva, valor: saldoAtivo(c), tipo });
    c.encerradoEm = dataEfetiva;
  } else {
    c.amortizacoes.push({ data: dataEfetiva, valor: Math.min(valor, saldoAtivo(c)), tipo });
  }
}

export async function encerrarNoVencimento(contratoId: string): Promise<void> {
  const c = db().contratos.find((x) => x.id === contratoId);
  if (c && dataVencimento(c) <= hoje()) c.encerradoEm = dataVencimento(c);
}

// ————— Comissões consolidadas —————

export interface ComissaoConsolidada {
  parceiroId: string;
  parceiroNome: string;
  competencia: string;
  entrada: number;
  recorrente: number;
  estornos: number;
  retido: number;
  total: number;
  status: 'pago' | 'parcial' | 'previsto';
}

export async function comissoesConsolidadas(): Promise<ComissaoConsolidada[]> {
  const d = db();
  const todos = d.contratos.flatMap((c) => comissoesDoContrato(c, c.numero));
  const chaves = new Map<string, LancamentoComissao[]>();
  todos.forEach((l) => {
    const k = `${l.parceiroId}|${l.competencia}`;
    const arr = chaves.get(k) ?? [];
    arr.push(l);
    chaves.set(k, arr);
  });
  return [...chaves.entries()]
    .map(([k, ls]) => {
      const [parceiroId, competencia] = k.split('|');
      const pagos = ls.filter((l) => l.status === 'pago').length;
      return {
        parceiroId,
        parceiroNome: nomeParceiro(parceiroId),
        competencia,
        entrada: ls.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0),
        recorrente: ls.filter((l) => l.tipo === 'recorrente').reduce((s, l) => s + l.valor, 0),
        estornos: ls.filter((l) => l.tipo === 'estorno').reduce((s, l) => s + l.valor, 0),
        retido: ls.filter((l) => l.status === 'retido').reduce((s, l) => s + l.valor, 0),
        total: ls.reduce((s, l) => s + l.valor, 0),
        status: pagos === ls.length ? 'pago' : pagos > 0 ? 'parcial' : 'previsto',
      } as ComissaoConsolidada;
    })
    .sort((a, b) => b.competencia.localeCompare(a.competencia) || a.parceiroNome.localeCompare(b.parceiroNome));
}

// ————— Resgates —————

export interface ResgateAdmin {
  id: string;
  contratoNumero: string;
  investidorNome: string;
  parceiroNome: string;
  valorAporte: number;
  dataSolicitacao: string;
  dataLiberacao: string;
  status: SolicitacaoResgate['status'];
  pagoEm: string | null;
}

export async function listarResgates(): Promise<ResgateAdmin[]> {
  const d = db();
  return d.resgates
    .map((r) => {
      const c = d.contratos.find((x) => x.id === r.contratoId)!;
      return {
        id: r.id,
        contratoNumero: c.numero,
        investidorNome: nomeInvestidor(c.investidorId),
        parceiroNome: nomeParceiro(c.parceiroId),
        valorAporte: c.valorAporte,
        dataSolicitacao: r.dataSolicitacao,
        dataLiberacao: r.dataLiberacao,
        status: r.status,
        pagoEm: r.pagoEm,
      };
    })
    .sort((a, b) => a.dataLiberacao.localeCompare(b.dataLiberacao));
}

export async function aprovarResgate(id: string): Promise<void> {
  const r = db().resgates.find((x) => x.id === id);
  if (r && r.status === 'pendente') r.status = 'aprovado';
}

export async function registrarPagamentoResgate(id: string): Promise<void> {
  const d = db();
  const r = d.resgates.find((x) => x.id === id);
  if (!r || r.status !== 'aprovado') return;
  r.status = 'pago';
  r.pagoEm = hoje();
  const c = d.contratos.find((x) => x.id === r.contratoId);
  if (c) {
    c.amortizacoes.push({ data: hoje(), valor: saldoAtivo(c), tipo: 'quitacao' });
    c.encerradoEm = hoje();
  }
}

// ————— Usuários e permissões —————

export async function listarUsuarios(): Promise<UsuarioPublico[]> {
  return db().usuarios.map(({ senha: _s, ...u }) => u);
}

export interface NovoUsuarioInput {
  nome: string;
  email: string;
  permissoes: Permissao[];
}

export async function criarUsuario(input: NovoUsuarioInput): Promise<UsuarioPublico> {
  const d = db();
  const u = {
    id: `u-${d.seq.usuario++}`,
    nome: input.nome,
    email: input.email,
    senha: 'yvycap2026',
    permissoes: input.permissoes,
    ativo: true,
    termosAceitosEm: null,
    criadoEm: hoje(),
  };
  d.usuarios.push(u);
  const { senha: _s, ...pub } = u;
  return pub;
}

export async function atualizarPermissoes(userId: string, permissoes: Permissao[]): Promise<void> {
  const u = db().usuarios.find((x) => x.id === userId);
  if (u) u.permissoes = permissoes;
}

export async function alternarUsuarioAtivo(userId: string): Promise<void> {
  const u = db().usuarios.find((x) => x.id === userId);
  if (u) u.ativo = !u.ativo;
}

/** Reset de acesso (mock): credencial nova é enviada pelos canais oficiais. */
export async function resetarAcesso(userId: string): Promise<void> {
  const u = db().usuarios.find((x) => x.id === userId);
  if (u) u.senha = 'yvycap2026';
}

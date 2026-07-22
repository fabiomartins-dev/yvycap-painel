'use client';

import { useMemo, useState } from 'react';
import { Group, Select, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { data, moeda } from '@/lib/format';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { LancamentoComissao } from '@/lib/calc';

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloCompetencia(comp: string): string {
  const [y, m] = comp.split('-').map(Number);
  return `${MESES_PT[m - 1]}/${String(y).slice(2)}`;
}

const ROTULO_TIPO: Record<string, string> = {
  entrada: 'Entrada (1%)',
  recorrente: 'Recorrente (1% a.m.)',
  estorno: 'Estorno',
};

function IconOrdenar({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'desc' ? <path d="M6 9l6 6 6-6" /> : <path d="M6 15l6-6 6 6" />}
    </svg>
  );
}

export function ExtratoTransacoes({ lancamentos }: { lancamentos: LancamentoComissao[] }) {
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<string | null>('todos');
  const [status, setStatus] = useState<string | null>('todos');
  const [competencia, setCompetencia] = useState<string | null>('todas');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('desc');

  const competencias = useMemo(() => {
    const set = new Set(lancamentos.map((l) => l.competencia));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [lancamentos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const arr = lancamentos.filter((l) => {
      if (tipo !== 'todos' && l.tipo !== tipo) return false;
      if (status !== 'todos' && l.status !== status) return false;
      if (competencia !== 'todas' && l.competencia !== competencia) return false;
      if (termo && !l.contratoNumero.toLowerCase().includes(termo) && !l.observacao.toLowerCase().includes(termo)) {
        return false;
      }
      return true;
    });
    arr.sort((a, b) => {
      const cmp = a.dataPagamento.localeCompare(b.dataPagamento);
      return ordem === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [lancamentos, busca, tipo, status, competencia, ordem]);

  const totalFiltrado = useMemo(() => filtrados.reduce((s, l) => s + l.valor, 0), [filtrados]);

  return (
    <>
      <Group gap="sm" mb="md" align="flex-end" wrap="wrap">
        <TextInput
          label="Buscar"
          placeholder="Contrato ou descrição…"
          value={busca}
          onChange={(e) => setBusca(e.currentTarget.value)}
          w={220}
          aria-label="Buscar transação"
        />
        <Select
          label="Tipo"
          value={tipo}
          onChange={setTipo}
          w={190}
          allowDeselect={false}
          data={[
            { value: 'todos', label: 'Todos os tipos' },
            { value: 'entrada', label: 'Entrada (1%)' },
            { value: 'recorrente', label: 'Recorrente (1% a.m.)' },
            { value: 'estorno', label: 'Estorno' },
          ]}
        />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          w={170}
          allowDeselect={false}
          data={[
            { value: 'todos', label: 'Todos os status' },
            { value: 'pago', label: 'Pago' },
            { value: 'previsto', label: 'Previsto' },
            { value: 'retido', label: 'Retido (30 dias)' },
          ]}
        />
        <Select
          label="Competência"
          value={competencia}
          onChange={setCompetencia}
          w={170}
          allowDeselect={false}
          data={[
            { value: 'todas', label: 'Todas' },
            ...competencias.map((c) => ({ value: c, label: rotuloCompetencia(c) })),
          ]}
        />
      </Group>

      {filtrados.length === 0 ? (
        <Text c="#66756e" py="lg" ta="center">
          Nenhuma transação encontrada para os filtros selecionados.
        </Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={720}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Competência</Table.Th>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>
                    <UnstyledButton
                      onClick={() => setOrdem((o) => (o === 'asc' ? 'desc' : 'asc'))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 'inherit', fontSize: 'inherit' }}
                      aria-label={`Ordenar por data (${ordem === 'asc' ? 'crescente' : 'decrescente'})`}
                    >
                      Pagamento
                      <IconOrdenar dir={ordem} />
                    </UnstyledButton>
                  </Table.Th>
                  <Table.Th ta="right">Valor</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtrados.map((l, i) => (
                  <Table.Tr key={`${l.contratoId}-${l.dataPagamento}-${i}`}>
                    <Table.Td tt="capitalize">{rotuloCompetencia(l.competencia)}</Table.Td>
                    <Table.Td fw={600}>{l.contratoNumero}</Table.Td>
                    <Table.Td>
                      <Text fz="sm" c={l.tipo === 'estorno' ? 'red' : undefined}>
                        {ROTULO_TIPO[l.tipo] ?? l.tipo}
                      </Text>
                      <Text fz="xs" c="#66756e">
                        {l.observacao}
                      </Text>
                    </Table.Td>
                    <Table.Td>{data(l.dataPagamento)}</Table.Td>
                    <Table.Td ta="right" fw={600} c={l.valor < 0 ? 'red' : undefined}>
                      {moeda(l.valor)}
                    </Table.Td>
                    <Table.Td>
                      <BadgeStatus status={l.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group justify="space-between" mt="md">
            <Text fz="sm" c="#66756e">
              {filtrados.length} {filtrados.length === 1 ? 'transação' : 'transações'}
            </Text>
            <Text fz="sm" fw={700} c={totalFiltrado < 0 ? 'red' : '#124534'}>
              Total: {moeda(totalFiltrado)}
            </Text>
          </Group>
        </>
      )}
    </>
  );
}

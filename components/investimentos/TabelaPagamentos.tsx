'use client';

import { useMemo, useState } from 'react';
import { Card, Group, SegmentedControl, Select, Table, Text } from '@mantine/core';
import { BadgeStatus } from '@/components/BadgeStatus';
import { data, moeda } from '@/lib/format';
import type { PagamentoInvestidor } from '@/services/investimentos';

export function TabelaPagamentos({ pagamentos }: { pagamentos: PagamentoInvestidor[] }) {
  const [contrato, setContrato] = useState<string | null>(null);
  const [status, setStatus] = useState('todos');
  const [periodo, setPeriodo] = useState<string | null>('todos');

  const contratos = useMemo(
    () => [...new Set(pagamentos.map((p) => p.contratoNumero))].map((n) => ({ value: n, label: n })),
    [pagamentos]
  );

  const hoje = new Date().toISOString().slice(0, 10);

  const filtrados = pagamentos.filter((p) => {
    if (contrato && p.contratoNumero !== contrato) return false;
    if (status !== 'todos' && p.status !== status) return false;
    if (periodo === '12m') {
      const limInf = new Date();
      limInf.setFullYear(limInf.getFullYear() - 1);
      const limSup = new Date();
      limSup.setFullYear(limSup.getFullYear() + 1);
      return p.data >= limInf.toISOString().slice(0, 10) && p.data <= limSup.toISOString().slice(0, 10);
    }
    if (periodo === 'passado') return p.data <= hoje;
    if (periodo === 'futuro') return p.data > hoje;
    return true;
  });

  return (
    <Card>
      <Group gap="sm" mb="md" wrap="wrap">
        <Select
          placeholder="Todos os contratos"
          data={contratos}
          value={contrato}
          onChange={setContrato}
          clearable
          w={200}
          aria-label="Filtrar por contrato"
        />
        <Select
          data={[
            { value: 'todos', label: 'Todo o período' },
            { value: '12m', label: '±12 meses' },
            { value: 'passado', label: 'Até hoje' },
            { value: 'futuro', label: 'A partir de hoje' },
          ]}
          value={periodo}
          onChange={setPeriodo}
          w={180}
          aria-label="Filtrar por período"
        />
        <SegmentedControl
          value={status}
          onChange={setStatus}
          data={[
            { value: 'todos', label: 'Todos' },
            { value: 'pago', label: 'Pagos' },
            { value: 'previsto', label: 'Previstos' },
          ]}
        />
      </Group>

      {filtrados.length === 0 ? (
        <Text c="#66756e" py="lg" ta="center">
          Nenhum pagamento encontrado com os filtros selecionados.
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={640}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Data</Table.Th>
                <Table.Th>Contrato</Table.Th>
                <Table.Th>Mês</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Valor</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtrados.map((p) => (
                <Table.Tr key={`${p.contratoId}-${p.mes}`}>
                  <Table.Td>{data(p.data)}</Table.Td>
                  <Table.Td fw={600}>{p.contratoNumero}</Table.Td>
                  <Table.Td>{p.mes}º</Table.Td>
                  <Table.Td>{p.tipo === 'vencimento' ? 'Vencimento' : 'Juros mensais'}</Table.Td>
                  <Table.Td fw={p.tipo === 'vencimento' ? 700 : undefined}>{moeda(p.valor)}</Table.Td>
                  <Table.Td>
                    <BadgeStatus status={p.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Card, Divider, Group, Modal, SegmentedControl, Select, Stack, Table, Text } from '@mantine/core';
import { BadgeStatus } from '@/components/BadgeStatus';
import { BotaoDownload } from '@/components/investimentos/BotaoDownload';
import { data, moeda } from '@/lib/format';
import type { PagamentoInvestidor } from '@/services/investimentos';

const tipoRotulo = (p: PagamentoInvestidor) => (p.tipo === 'vencimento' ? 'Vencimento' : 'Juros mensais');

export function TabelaPagamentos({ pagamentos }: { pagamentos: PagamentoInvestidor[] }) {
  const [contrato, setContrato] = useState<string | null>(null);
  const [status, setStatus] = useState('todos');
  const [periodo, setPeriodo] = useState<string | null>('todos');
  const [detalhe, setDetalhe] = useState<PagamentoInvestidor | null>(null);

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
                <Table.Tr
                  key={`${p.contratoId}-${p.mes}`}
                  onClick={() => setDetalhe(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>{data(p.data)}</Table.Td>
                  <Table.Td fw={600}>{p.contratoNumero}</Table.Td>
                  <Table.Td>{p.mes}º</Table.Td>
                  <Table.Td>{tipoRotulo(p)}</Table.Td>
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

      <Modal
        opened={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `Pagamento ${detalhe.contratoNumero} — ${detalhe.mes}º mês` : ''}
        centered
      >
        {detalhe && (
          <Stack gap="md">
            <Stack gap={6} fz="sm">
              <Group justify="space-between">
                <Text c="#66756e">Contrato</Text>
                <Text fw={600}>{detalhe.contratoNumero}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="#66756e">Parcela</Text>
                <Text>{detalhe.mes}º mês</Text>
              </Group>
              <Group justify="space-between">
                <Text c="#66756e">Tipo</Text>
                <Text>{tipoRotulo(detalhe)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="#66756e">Data prevista</Text>
                <Text>{data(detalhe.data)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="#66756e">Valor</Text>
                <Text fw={700}>{moeda(detalhe.valor)}</Text>
              </Group>
              <Group justify="space-between">
                <Text c="#66756e">Status</Text>
                <BadgeStatus status={detalhe.status} />
              </Group>
            </Stack>

            <Divider label="Comprovante de transferência" labelPosition="left" />

            {detalhe.comprovante ? (
              <Stack gap={6} fz="sm">
                <Group justify="space-between">
                  <Text c="#66756e">Identificador</Text>
                  <Text>{detalhe.comprovante.identificador}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="#66756e">Meio</Text>
                  <Text>{detalhe.comprovante.meio}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="#66756e">Efetivado em</Text>
                  <Text>{data(detalhe.comprovante.efetivadoEm)}</Text>
                </Group>
                <Group justify="space-between" wrap="nowrap" mt={4}>
                  <Text style={{ flex: 1 }}>{detalhe.comprovante.arquivo}</Text>
                  <BotaoDownload nome={detalhe.comprovante.arquivo} />
                </Group>
              </Stack>
            ) : (
              <Text fz="sm" c="#66756e">
                Pagamento ainda previsto. O comprovante de transferência ficará disponível aqui após
                a efetivação pela YVYCAP.
              </Text>
            )}
          </Stack>
        )}
      </Modal>
    </Card>
  );
}

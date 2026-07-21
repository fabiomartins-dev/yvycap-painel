'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Anchor, Box, Card, Group, Table, Text, Title } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { BadgeStatus } from '@/components/BadgeStatus';
import { data, moeda, percentualMes } from '@/lib/format';
import type { ContratoInvestidor } from '@/services/investimentos';
import type { Parcela } from '@/lib/calc';

export interface CronogramaPorContrato {
  [contratoId: string]: Parcela[];
}

export function DashboardInvestidor({
  contratos,
  cronogramas,
}: {
  contratos: ContratoInvestidor[];
  cronogramas: CronogramaPorContrato;
}) {
  const [selecionado, setSelecionado] = useState(contratos[0]?.id ?? null);
  const atual = contratos.find((c) => c.id === selecionado) ?? null;
  const cronograma = selecionado ? (cronogramas[selecionado] ?? []) : [];

  const dadosGrafico = cronograma.map((p) => ({
    mes: `M${p.mes}`,
    Carência: p.tipo === 'carencia' ? p.jurosDoMes : 0,
    'Juros mensais': p.tipo === 'juros' ? p.valor : 0,
    Vencimento: p.tipo === 'vencimento' ? p.valor : 0,
  }));

  return (
    <>
      <Card mt="md">
        <Title order={3} fz="h4" mb="sm">
          Contratos
        </Title>
        <Table.ScrollContainer minWidth={720}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Contrato</Table.Th>
                <Table.Th>Fase</Table.Th>
                <Table.Th>Valor aportado</Table.Th>
                <Table.Th>Taxa</Table.Th>
                <Table.Th>Início</Table.Th>
                <Table.Th>Vencimento</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {contratos.map((c) => (
                <Table.Tr
                  key={c.id}
                  onClick={() => setSelecionado(c.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: c.id === selecionado ? 'rgba(200,164,94,0.12)' : undefined,
                  }}
                  aria-selected={c.id === selecionado}
                >
                  <Table.Td>
                    <Anchor component={Link} href={`/investimentos/contratos/${c.id}`} fw={600} c="#124534">
                      {c.numero}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>Fase {c.fase}</Table.Td>
                  <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                  <Table.Td>{percentualMes(c.taxaMensal)}</Table.Td>
                  <Table.Td>{data(c.dataInicio)}</Table.Td>
                  <Table.Td>{data(c.dataVencimento)}</Table.Td>
                  <Table.Td>
                    <BadgeStatus status={c.statusRotulo} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Text fz="xs" c="#66756e" mt={4}>
          Selecione uma linha para ver o fluxo de pagamentos do contrato. Clique no número para
          abrir o detalhe.
        </Text>
      </Card>

      {atual && (
        <Card mt="md">
          <Group justify="space-between" mb="xs">
            <Title order={3} fz="h4">
              Fluxo de pagamentos — {atual.numero}
            </Title>
            <Text fz="sm" c="#66756e">
              {moeda(atual.jurosMensal)}/mês a partir do 7º mês
            </Text>
          </Group>
          <Text fz="xs" c="#66756e" mb="md">
            Meses 1–6 (carência): os juros acumulam e são pagos no vencimento junto com o
            principal. Meses 7–36: pagamento mensal dos juros. Mês 36: principal + juros da
            carência + último juro.
          </Text>
          <Box>
            <BarChart
              h={280}
              data={dadosGrafico}
              dataKey="mes"
              type="stacked"
              series={[
                { name: 'Carência', color: '#dbba76' },
                { name: 'Juros mensais', color: '#1b5c46' },
                { name: 'Vencimento', color: '#c8a45e' },
              ]}
              valueFormatter={(v) => moeda(v)}
              withLegend
              tickLine="none"
            />
          </Box>
        </Card>
      )}
    </>
  );
}

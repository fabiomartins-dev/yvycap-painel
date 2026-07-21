'use client';

import { Card, Grid, Group, Progress, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { data, moeda, moedaCompacta, percentualMes } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import type { ResumoOperacao } from '@/services/admin';

export function AdminScreen({ resumo: r }: { resumo: ResumoOperacao }) {
  const pct = Math.min(100, (r.totalCaptado / r.metaFase) * 100);

  return (
    <>
      <PageHeader
        titulo="Dashboard da operação"
        descricao="Visão consolidada da captação privada por contratos de mútuo."
        migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Administração' }]}
      />

      <Card mb="md">
        <Group justify="space-between" mb="xs">
          <Title order={3} fz="h4">
            Fase {r.faseAtual} · {percentualMes(r.taxaFase)}
          </Title>
          <Text fz="sm" c="#66756e">
            {moeda(r.totalCaptado)} de {moeda(r.metaFase)} ({pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)
          </Text>
        </Group>
        <Progress value={pct} color="gold.5" size="lg" radius="md" aria-label="Progresso da captação" />
      </Card>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <StatCard rotulo="Total captado" valor={moeda(r.totalCaptado)} destaque />
        <StatCard
          rotulo="Investidores / contratos ativos"
          valor={`${r.numeroInvestidores} / ${r.contratosAtivos}`}
        />
        <StatCard rotulo="Comissões a pagar no mês" valor={moeda(r.comissoesAPagarMes)} />
        <StatCard rotulo="Resgates pendentes" valor={String(r.resgatesPendentes)} detalhe="Fila com aviso de 90 dias" />
      </SimpleGrid>

      <Grid gap="md" mt="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card>
            <Title order={3} fz="h4" mb="md">
              Evolução da captação
            </Title>
            <AreaChart
              h={260}
              data={r.evolucaoCaptacao}
              dataKey="mes"
              series={[{ name: 'captado', label: 'Total captado', color: '#1b5c46' }]}
              valueFormatter={(v) => moedaCompacta(v)}
              tickLine="none"
              curveType="monotone"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card h="100%">
            <Title order={3} fz="h4" mb="sm">
              Próximos vencimentos
            </Title>
            {r.proximosVencimentos.length === 0 ? (
              <Text c="#66756e">Nenhum vencimento previsto.</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Contrato</Table.Th>
                    <Table.Th>Investidor</Table.Th>
                    <Table.Th>Data</Table.Th>
                    <Table.Th>Principal</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {r.proximosVencimentos.map((v) => (
                    <Table.Tr key={v.numero}>
                      <Table.Td fw={600}>{v.numero}</Table.Td>
                      <Table.Td>{v.investidor}</Table.Td>
                      <Table.Td>{data(v.data)}</Table.Td>
                      <Table.Td>{moeda(v.valor)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}

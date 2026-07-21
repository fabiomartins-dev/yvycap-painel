'use client';

import { Card, Grid, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { AreaChart, LineChart } from '@mantine/charts';
import { data, moeda, moedaCompacta, percentualMes } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ResumoParceiro } from '@/services/parceria';

export function ParceriaScreen({ resumo }: { resumo: ResumoParceiro | null }) {
  if (!resumo) {
    return (
      <>
        <PageHeader titulo="Painel do Parceiro" migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro' }]} />
        <Card padding="xl">
          <Text c="#66756e" ta="center" py="lg">
            Seu credenciamento como parceiro ainda não foi concluído. Fale com a equipe YVYCAP
            pelos canais oficiais.
          </Text>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Painel do Parceiro"
        descricao="Sua carteira de clientes, contratos originados e comissões."
        migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro' }]}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
        <StatCard rotulo="Saldo ativo da carteira" valor={moeda(resumo.saldoAtivoCarteira)} destaque />
        <StatCard rotulo="Contratos ativos" valor={String(resumo.contratosAtivos)} />
        <StatCard
          rotulo="Próx. pagamento de comissão"
          valor={resumo.proximoPagamentoComissao ? moeda(resumo.proximoPagamentoComissao.valor) : '—'}
          detalhe={resumo.proximoPagamentoComissao ? `em ${data(resumo.proximoPagamentoComissao.data)}` : undefined}
        />
      </SimpleGrid>

      <Grid gap="md" mt="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card>
            <Title order={3} fz="h4" mb="md">
              Evolução do saldo ativo
            </Title>
            <AreaChart
              h={240}
              data={resumo.evolucao}
              dataKey="mes"
              series={[{ name: 'saldoAtivo', label: 'Saldo ativo', color: '#1b5c46' }]}
              valueFormatter={(v) => moeda(v)}
              yAxisProps={{ width: 68, tickFormatter: (v) => moedaCompacta(v) }}
              tickLine="none"
              curveType="monotone"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card>
            <Title order={3} fz="h4" mb="md">
              Comissão mensal
            </Title>
            <LineChart
              h={240}
              data={resumo.evolucao}
              dataKey="mes"
              series={[{ name: 'comissaoMensal', label: 'Comissão do mês', color: '#c8a45e' }]}
              valueFormatter={(v) => moeda(v)}
              yAxisProps={{ width: 68, tickFormatter: (v) => moedaCompacta(v) }}
              tickLine="none"
              curveType="monotone"
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Card mt="md">
        <Title order={3} fz="h4" mb="sm">
          Contratos da carteira
        </Title>
        {resumo.contratos.length === 0 ? (
          <Stack align="center" py="lg" gap={4}>
            <Text fw={600}>Sua carteira ainda não tem contratos</Text>
            <Text c="#66756e" fz="sm" ta="center" maw={480}>
              Quando um cliente da sua carteira assinar o contrato de mútuo e o aporte for
              conciliado, ele aparecerá aqui com a comissão correspondente.
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={760}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Fase</Table.Th>
                  <Table.Th>Aporte</Table.Th>
                  <Table.Th>Taxa</Table.Th>
                  <Table.Th>Comissão/mês</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {resumo.contratos.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>{c.clienteNome}</Table.Td>
                    <Table.Td>
                      <AnchorLink href={`/parceria/contratos/${c.id}`} fw={600} c="#124534">
                        {c.numero}
                      </AnchorLink>
                    </Table.Td>
                    <Table.Td>Fase {c.fase}</Table.Td>
                    <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                    <Table.Td>{percentualMes(c.taxaMensal)}</Table.Td>
                    <Table.Td>{c.comissaoReconhecida ? moeda(c.comissaoMensalAtual) : '—'}</Table.Td>
                    <Table.Td>
                      <BadgeStatus status={c.statusRotulo} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </>
  );
}

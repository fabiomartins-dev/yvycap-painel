'use client';

import { Accordion, Badge, Card, Group, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ExtratoComissoes } from '@/services/parceria';

const MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function nomeCompetencia(comp: string): string {
  const [y, m] = comp.split('-').map(Number);
  return `${MESES_PT[m - 1]} de ${y}`;
}

export function ComissoesScreen({ extrato }: { extrato: ExtratoComissoes | null }) {
  if (!extrato || extrato.meses.length === 0) {
    return (
      <>
        <PageHeader
          titulo="Comissões"
          migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro', href: '/parceria' }, { rotulo: 'Comissões' }]}
        />
        <Card padding="xl">
          <Text c="#66756e" ta="center" py="lg">
            Ainda não há comissões reconhecidas. Elas aparecem aqui após o primeiro aporte
            conciliado da sua carteira.
          </Text>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Comissões"
        descricao="Extrato mês a mês: entrada (1%, retenção de 30 dias), recorrentes (1% a.m.) e estornos."
        migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro', href: '/parceria' }, { rotulo: 'Comissões' }]}
      />

      <SimpleGrid cols={{ base: 1, xs: 2 }} mb="md">
        <StatCard rotulo="Total já pago" valor={moeda(extrato.totalPago)} destaque />
        <StatCard rotulo="Previsto (a pagar)" valor={moeda(extrato.totalPrevisto)} />
      </SimpleGrid>

      <Card mb="md">
        <Title order={3} fz="h4" mb="sm">
          Extrato mês a mês
        </Title>
        <Accordion variant="separated" radius="md">
          {[...extrato.meses].reverse().map((m) => (
            <Accordion.Item key={m.competencia} value={m.competencia} style={{ backgroundColor: '#fffdf8', borderColor: '#e5decf' }}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" pr="sm">
                  <Text fw={600} tt="capitalize">
                    {nomeCompetencia(m.competencia)}
                  </Text>
                  <Group gap="xs" wrap="nowrap">
                    {m.estornos < 0 && (
                      <Badge color="red" variant="light" size="sm">
                        Estorno
                      </Badge>
                    )}
                    <Text fw={700} c={m.total < 0 ? 'red' : '#124534'}>
                      {moeda(m.total)}
                    </Text>
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Table.ScrollContainer minWidth={640}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Contrato</Table.Th>
                        <Table.Th>Tipo</Table.Th>
                        <Table.Th>Pagamento</Table.Th>
                        <Table.Th>Valor</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {m.lancamentos.map((l, i) => (
                        <Table.Tr key={i}>
                          <Table.Td fw={600}>{l.contratoNumero}</Table.Td>
                          <Table.Td>
                            <Text fz="sm" c={l.tipo === 'estorno' ? 'red' : undefined}>
                              {l.tipo === 'entrada' ? 'Entrada (1%)' : l.tipo === 'recorrente' ? 'Recorrente (1% a.m.)' : 'Estorno'}
                            </Text>
                            <Text fz="xs" c="#66756e">
                              {l.observacao}
                            </Text>
                          </Table.Td>
                          <Table.Td>{data(l.dataPagamento)}</Table.Td>
                          <Table.Td fw={600} c={l.valor < 0 ? 'red' : undefined}>
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
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card>

      <Card>
        <Title order={3} fz="h4" mb="sm">
          Previsão dos próximos pagamentos
        </Title>
        {extrato.proximosPagamentos.length === 0 ? (
          <Text c="#66756e">Sem pagamentos previstos.</Text>
        ) : (
          <Table.ScrollContainer minWidth={560}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data prevista</Table.Th>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Valor</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {extrato.proximosPagamentos.map((l, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{data(l.dataPagamento)}</Table.Td>
                    <Table.Td fw={600}>{l.contratoNumero}</Table.Td>
                    <Table.Td>{l.tipo === 'entrada' ? 'Entrada (1%)' : 'Recorrente (1% a.m.)'}</Table.Td>
                    <Table.Td fw={600}>{moeda(l.valor)}</Table.Td>
                    <Table.Td>
                      <BadgeStatus status={l.status} />
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
